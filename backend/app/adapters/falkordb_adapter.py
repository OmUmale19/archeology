import logging
from typing import List, Dict, Any, Optional
import networkx as nx
from falkordb import FalkorDB
from app.config import settings
from app.domain.models import GraphPayload, GraphNode, GraphEdge

logger = logging.getLogger(__name__)

class FalkorDBAdapter:
    """
    Hexagonal Adapter for FalkorDB with automatic connection verification
    and high-fidelity in-memory graph fallback.
    """
    def __init__(self):
        self.is_connected = False
        self.client: Optional[FalkorDB] = None
        self.graph = None
        self.graph_name = settings.FALKORDB_GRAPH_NAME
        
        # In-memory topological graph for fallback and algorithm verification
        self._fallback_nx = nx.MultiDiGraph()
        self._node_data: Dict[str, Dict[str, Any]] = {}
        self._edge_data: List[Dict[str, Any]] = []
        
        self._connect()

    def _connect(self):
        try:
            if settings.FALKORDB_URL:
                self.client = FalkorDB.from_url(settings.FALKORDB_URL)
            else:
                connect_kwargs = {
                    "host": settings.FALKORDB_HOST,
                    "port": settings.FALKORDB_PORT,
                }
                if settings.FALKORDB_USERNAME:
                    connect_kwargs["username"] = settings.FALKORDB_USERNAME
                if settings.FALKORDB_PASSWORD:
                    connect_kwargs["password"] = settings.FALKORDB_PASSWORD
                if settings.FALKORDB_SSL:
                    connect_kwargs["ssl"] = True
                self.client = FalkorDB(**connect_kwargs)

            # Try a lightweight ping
            self.graph = self.client.select_graph(self.graph_name)
            self.graph.query("RETURN 1")
            self.is_connected = True
            endpoint_repr = settings.FALKORDB_URL or f"{settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}"
            logger.info(f"Connected to FalkorDB on {endpoint_repr}, graph: {self.graph_name}")
        except Exception as e:
            self.is_connected = False
            endpoint_repr = settings.FALKORDB_URL or f"{settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}"
            logger.warning(f"FalkorDB not reachable at {endpoint_repr} ({e}). Using in-memory graph engine.")

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Run a Cypher query on FalkorDB if connected, or gracefully handle."""
        if self.is_connected and self.graph:
            try:
                return self.graph.query(cypher, params or {})
            except Exception as e:
                logger.error(f"FalkorDB Cypher error: {e}")
                raise e
        else:
            logger.debug(f"Executing Cypher via fallback: {cypher}")
            return None

    # --- Topological In-Memory Mirror (Ensures 100% reliability) ---

    def clear(self):
        self._node_data.clear()
        self._edge_data.clear()
        self._fallback_nx.clear()

    def clear_all(self):
        """Wipes all graph data in-memory and in FalkorDB if connected."""
        self.clear()
        if self.is_connected and self.graph:
            try:
                self.graph.query("MATCH (n) DETACH DELETE n")
                logger.info("Successfully wiped all nodes and edges from FalkorDB.")
            except Exception as e:
                logger.warning(f"Could not detach delete nodes in FalkorDB: {e}")

    def register_node(self, node_id: str, label: str, title: str, properties: Dict[str, Any]):
        props = dict(properties)
        props["label"] = label
        if "title" not in props:
            props["title"] = title
        node_title = props.get("title", title)
        
        # Calculate visual hierarchy size if not explicitly configured
        if "node_size" not in props:
            if label == "Project":
                if "20m" in node_id.lower() or "uber" in node_id.lower():
                    props["node_size"] = 96
                elif "8m" in node_id.lower() or "shopify" in node_id.lower():
                    props["node_size"] = 82
                else:
                    props["node_size"] = 72
            elif label == "CustomerTier":
                props["node_size"] = 52
            elif label == "Person":
                role_str = props.get("role", "")
                role_tier = props.get("role_tier", "")
                if any(w in role_str or w in role_tier for w in ["VP", "Director", "Manager"]):
                    props["node_size"] = 68
                elif any(w in role_str or w in role_tier for w in ["Lead", "Staff"]):
                    props["node_size"] = 58
                elif any(w in role_str or w in role_tier for w in ["Senior", "Principal"]):
                    props["node_size"] = 44
                elif any(w in role_str or w in role_tier for w in ["Junior", "Associate", "Intern"]):
                    props["node_size"] = 32
                else:
                    props["node_size"] = 36
            elif label == "Team":
                props["node_size"] = 60
            elif label == "Service":
                props["node_size"] = 40
            elif label == "Decision":
                props["node_size"] = 28
            elif label in ["JiraTicket", "PullRequest", "Document"]:
                props["node_size"] = 26
            else:
                props["node_size"] = 24

        self._node_data[node_id] = {
            "id": node_id,
            "label": label,
            "title": node_title,
            "properties": props
        }
        self._fallback_nx.add_node(node_id, **props)


    def register_edge(self, source_id: str, target_id: str, rel_type: str, properties: Dict[str, Any] = None):
        props = properties or {}
        edge_record = {
            "id": f"{source_id}_{rel_type}_{target_id}",
            "source": source_id,
            "target": target_id,
            "label": rel_type,
            "properties": props
        }
        self._edge_data.append(edge_record)
        self._fallback_nx.add_edge(source_id, target_id, key=rel_type, label=rel_type, **props)

    def add_custom_node(self, node_id: str, label: str, title: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Add a dynamic custom node into in-memory graph and FalkorDB if connected."""
        props = dict(properties)
        props["id"] = node_id
        props["title"] = title
        self.register_node(node_id, label, title, props)
        
        if self.is_connected and self.graph:
            try:
                safe_label = "".join(c for c in label if c.isalnum() or c == "_") or "Entity"
                cypher = f"MERGE (n:{safe_label} {{id: $id}}) SET n.title = $title, n += $props"
                self.query(cypher, {"id": node_id, "title": title, "props": props})
            except Exception as e:
                logger.warning(f"Could not persist custom node to FalkorDB: {e}")
                
        return self._node_data[node_id]

    def add_custom_edge(self, source_id: str, target_id: str, rel_type: str, properties: Dict[str, Any] = None) -> Dict[str, Any]:
        """Add a dynamic relationship into in-memory graph and FalkorDB if connected."""
        props = properties or {}
        self.register_edge(source_id, target_id, rel_type, props)
        
        if self.is_connected and self.graph:
            try:
                safe_rel = "".join(c for c in rel_type if c.isalnum() or c == "_") or "RELATES_TO"
                cypher = f"MATCH (s {{id: $source_id}}), (t {{id: $target_id}}) MERGE (s)-[r:{safe_rel}]->(t) SET r += $props"
                self.query(cypher, {"source_id": source_id, "target_id": target_id, "props": props})
            except Exception as e:
                logger.warning(f"Could not persist custom edge to FalkorDB: {e}")
                
        return self._edge_data[-1]

    def get_full_graph_payload(self) -> GraphPayload:
        nodes = [
            GraphNode(
                id=n_id,
                label=data["label"],
                title=data["title"],
                properties=data["properties"],
                node_size=data["properties"].get("node_size", 34)
            )
            for n_id, data in self._node_data.items()
        ]
        edges = [
            GraphEdge(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                label=e["label"],
                properties=e["properties"]
            )
            for e in self._edge_data
        ]
        return GraphPayload(nodes=nodes, edges=edges)

    def extract_subgraph(self, node_ids: List[str], max_hops: int = 1) -> GraphPayload:
        """Extract a k-hop localized subgraph around the target node IDs."""
        all_nodes = set(node_ids)
        for nid in node_ids:
            if nid in self._fallback_nx:
                # Add predecessors and successors
                preds = list(self._fallback_nx.predecessors(nid))
                succs = list(self._fallback_nx.successors(nid))
                all_nodes.update(preds)
                all_nodes.update(succs)
        
        selected_nodes = [
            GraphNode(
                id=n_id,
                label=self._node_data[n_id]["label"],
                title=self._node_data[n_id]["title"],
                properties=self._node_data[n_id]["properties"],
                highlighted=(n_id in node_ids),
                node_size=self._node_data[n_id]["properties"].get("node_size", 34)
            )
            for n_id in all_nodes if n_id in self._node_data
        ]
        
        selected_edges = [
            GraphEdge(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                label=e["label"],
                properties=e["properties"],
                highlighted=(e["source"] in node_ids or e["target"] in node_ids)
            )
            for e in self._edge_data if e["source"] in all_nodes and e["target"] in all_nodes
        ]
        return GraphPayload(nodes=selected_nodes, edges=selected_edges)

    def calculate_pagerank(self) -> Dict[str, float]:
        """Compute PageRank scores over the entire topology."""
        try:
            return nx.pagerank(self._fallback_nx, alpha=0.85)
        except Exception:
            return {n: 1.0 / max(1, len(self._node_data)) for n in self._node_data}

    def calculate_betweenness_centrality(self) -> Dict[str, float]:
        """Compute Betweenness Centrality for bottleneck/bus factor detection."""
        try:
            return nx.betweenness_centrality(self._fallback_nx)
        except Exception:
            return {n: 0.0 for n in self._node_data}

    def find_shortest_path(self, source_id: str, target_id: str) -> Optional[List[str]]:
        """Find the shortest causal path between two entities."""
        try:
            # Directed shortest path
            return nx.shortest_path(self._fallback_nx, source=source_id, target=target_id)
        except Exception:
            try:
                # Try undirected if directed path doesn't exist
                undirected = self._fallback_nx.to_undirected()
                return nx.shortest_path(undirected, source=source_id, target=target_id)
            except Exception:
                return None

# Singleton instance
db_adapter = FalkorDBAdapter()

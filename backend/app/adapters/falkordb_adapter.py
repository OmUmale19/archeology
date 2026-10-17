import logging
from typing import List, Dict, Any, Optional
import networkx as nx
from falkordb import FalkorDB
from app.config import settings
from app.domain.models import GraphPayload, GraphNode, GraphEdge

logger = logging.getLogger(__name__)

class FalkorDBAdapter:
    """
    Hexagonal Adapter for FalkorDB with multi-tenant graph support,
    automatic connection verification, and high-fidelity in-memory graph fallback.
    Each company or user can maintain their own isolated graph database.
    """
    def __init__(self):
        self.is_connected = False
        self.client: Optional[FalkorDB] = None
        self.graph = None
        self.graph_name = settings.FALKORDB_GRAPH_NAME
        
        # Per-tenant stores: { "tenant_id": { "node_data": {}, "edge_data": [], "nx": nx.MultiDiGraph() } }
        self._tenants: Dict[str, Dict[str, Any]] = {}
        
        self._connect()

    def _sanitize_tenant(self, tenant_id: Optional[str]) -> str:
        if not tenant_id:
            return "default"
        clean = "".join(c if c.isalnum() else "_" for c in str(tenant_id).lower()).strip("_")
        return clean or "default"

    def _get_tenant_store(self, tenant_id: Optional[str] = "default") -> Dict[str, Any]:
        tid = self._sanitize_tenant(tenant_id)
        if tid not in self._tenants:
            self._tenants[tid] = {
                "node_data": {},
                "edge_data": [],
                "nx": nx.MultiDiGraph()
            }
        return self._tenants[tid]

    # Backward-compatibility properties for default workspace
    @property
    def _node_data(self) -> Dict[str, Dict[str, Any]]:
        return self._get_tenant_store("default")["node_data"]

    @property
    def _edge_data(self) -> List[Dict[str, Any]]:
        return self._get_tenant_store("default")["edge_data"]

    @property
    def _fallback_nx(self) -> nx.MultiDiGraph:
        return self._get_tenant_store("default")["nx"]

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

            # Select default graph and verify connection
            self.graph = self.client.select_graph(self.graph_name)
            self.graph.query("RETURN 1")
            self.is_connected = True
            endpoint_repr = settings.FALKORDB_URL or f"{settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}"
            logger.info(f"Connected to FalkorDB on {endpoint_repr}, graph: {self.graph_name}")
        except Exception as e:
            self.is_connected = False
            endpoint_repr = settings.FALKORDB_URL or f"{settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}"
            logger.warning(f"FalkorDB not reachable at {endpoint_repr} ({e}). Using in-memory graph engine.")

    def get_graph(self, tenant_id: Optional[str] = "default"):
        """Returns FalkorDB Graph object scoped to the specific tenant / company."""
        if self.is_connected and self.client:
            tid = self._sanitize_tenant(tenant_id)
            if tid in ("default", "archaeologist"):
                graph_name = self.graph_name
            else:
                graph_name = f"{self.graph_name}_{tid}"
            return self.client.select_graph(graph_name)
        return None

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None, tenant_id: Optional[str] = "default") -> Any:
        """Run a Cypher query on the tenant's FalkorDB graph if connected, or gracefully handle."""
        target_graph = self.get_graph(tenant_id) or self.graph
        if self.is_connected and target_graph:
            try:
                return target_graph.query(cypher, params or {})
            except Exception as e:
                logger.error(f"FalkorDB Cypher error on tenant '{tenant_id}': {e}")
                raise e
        else:
            logger.debug(f"Executing Cypher via fallback for tenant '{tenant_id}': {cypher}")
            return None

    # --- Topological In-Memory Mirror (Ensures 100% reliability) ---

    def clear(self, tenant_id: Optional[str] = "default"):
        store = self._get_tenant_store(tenant_id)
        store["node_data"].clear()
        store["edge_data"].clear()
        store["nx"].clear()

    def clear_all(self, tenant_id: Optional[str] = "default"):
        """Wipes all graph data for the specific tenant in-memory and in FalkorDB if connected."""
        self.clear(tenant_id)
        target_graph = self.get_graph(tenant_id)
        if self.is_connected and target_graph:
            try:
                target_graph.query("MATCH (n) DETACH DELETE n")
                logger.info(f"Successfully wiped all nodes and edges from FalkorDB for tenant '{tenant_id}'.")
            except Exception as e:
                logger.warning(f"Could not detach delete nodes in FalkorDB for tenant '{tenant_id}': {e}")

    def register_node(self, node_id: str, label: str, title: str, properties: Dict[str, Any], tenant_id: Optional[str] = "default"):
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

        store = self._get_tenant_store(tenant_id)
        store["node_data"][node_id] = {
            "id": node_id,
            "label": label,
            "title": node_title,
            "properties": props
        }
        store["nx"].add_node(node_id, **props)

    def register_edge(self, source_id: str, target_id: str, rel_type: str, properties: Dict[str, Any] = None, tenant_id: Optional[str] = "default"):
        props = properties or {}
        edge_record = {
            "id": f"{source_id}_{rel_type}_{target_id}",
            "source": source_id,
            "target": target_id,
            "label": rel_type,
            "properties": props
        }
        store = self._get_tenant_store(tenant_id)
        store["edge_data"].append(edge_record)
        store["nx"].add_edge(source_id, target_id, key=rel_type, label=rel_type, **props)

    def add_custom_node(self, node_id: str, label: str, title: str, properties: Dict[str, Any], tenant_id: Optional[str] = "default") -> Dict[str, Any]:
        """Add a dynamic custom node into in-memory graph and FalkorDB for the specific tenant."""
        props = dict(properties)
        props["id"] = node_id
        props["title"] = title
        self.register_node(node_id, label, title, props, tenant_id=tenant_id)
        
        target_graph = self.get_graph(tenant_id)
        if self.is_connected and target_graph:
            try:
                safe_label = "".join(c for c in label if c.isalnum() or c == "_") or "Entity"
                cypher = f"MERGE (n:{safe_label} {{id: $id}}) SET n.title = $title, n += $props"
                self.query(cypher, {"id": node_id, "title": title, "props": props}, tenant_id=tenant_id)
            except Exception as e:
                logger.warning(f"Could not persist custom node to FalkorDB for tenant '{tenant_id}': {e}")
                
        return self._get_tenant_store(tenant_id)["node_data"][node_id]

    def add_custom_edge(self, source_id: str, target_id: str, rel_type: str, properties: Dict[str, Any] = None, tenant_id: Optional[str] = "default") -> Dict[str, Any]:
        """Add a dynamic relationship into in-memory graph and FalkorDB for the specific tenant."""
        props = properties or {}
        self.register_edge(source_id, target_id, rel_type, props, tenant_id=tenant_id)
        
        target_graph = self.get_graph(tenant_id)
        if self.is_connected and target_graph:
            try:
                safe_rel = "".join(c for c in rel_type if c.isalnum() or c == "_") or "RELATES_TO"
                cypher = f"MATCH (s {{id: $source_id}}), (t {{id: $target_id}}) MERGE (s)-[r:{safe_rel}]->(t) SET r += $props"
                self.query(cypher, {"source_id": source_id, "target_id": target_id, "props": props}, tenant_id=tenant_id)
            except Exception as e:
                logger.warning(f"Could not persist custom edge to FalkorDB for tenant '{tenant_id}': {e}")
                
        return self._get_tenant_store(tenant_id)["edge_data"][-1]

    def get_full_graph_payload(self, tenant_id: Optional[str] = "default") -> GraphPayload:
        store = self._get_tenant_store(tenant_id)
        nodes = [
            GraphNode(
                id=n_id,
                label=data["label"],
                title=data["title"],
                properties=data["properties"],
                node_size=data["properties"].get("node_size", 34)
            )
            for n_id, data in store["node_data"].items()
        ]
        edges = [
            GraphEdge(
                id=e["id"],
                source=e["source"],
                target=e["target"],
                label=e["label"],
                properties=e["properties"]
            )
            for e in store["edge_data"]
        ]
        return GraphPayload(nodes=nodes, edges=edges)

    def extract_subgraph(self, node_ids: List[str], max_hops: int = 1, tenant_id: Optional[str] = "default") -> GraphPayload:
        """Extract a k-hop localized subgraph around the target node IDs for the given tenant."""
        store = self._get_tenant_store(tenant_id)
        all_nodes = set(node_ids)
        for nid in node_ids:
            if nid in store["nx"]:
                preds = list(store["nx"].predecessors(nid))
                succs = list(store["nx"].successors(nid))
                all_nodes.update(preds)
                all_nodes.update(succs)
        
        selected_nodes = [
            GraphNode(
                id=n_id,
                label=store["node_data"][n_id]["label"],
                title=store["node_data"][n_id]["title"],
                properties=store["node_data"][n_id]["properties"],
                highlighted=(n_id in node_ids),
                node_size=store["node_data"][n_id]["properties"].get("node_size", 34)
            )
            for n_id in all_nodes if n_id in store["node_data"]
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
            for e in store["edge_data"] if e["source"] in all_nodes and e["target"] in all_nodes
        ]
        return GraphPayload(nodes=selected_nodes, edges=selected_edges)

    def calculate_pagerank(self, tenant_id: Optional[str] = "default") -> Dict[str, float]:
        """Compute PageRank scores over the tenant's topology."""
        store = self._get_tenant_store(tenant_id)
        try:
            return nx.pagerank(store["nx"], alpha=0.85)
        except Exception:
            return {n: 1.0 / max(1, len(store["node_data"])) for n in store["node_data"]}

    def calculate_betweenness_centrality(self, tenant_id: Optional[str] = "default") -> Dict[str, float]:
        """Compute Betweenness Centrality for bottleneck/bus factor detection."""
        store = self._get_tenant_store(tenant_id)
        try:
            return nx.betweenness_centrality(store["nx"])
        except Exception:
            return {n: 0.0 for n in store["node_data"]}

    def find_shortest_path(self, source_id: str, target_id: str, tenant_id: Optional[str] = "default") -> Optional[List[str]]:
        """Find the shortest causal path between two entities within a tenant."""
        store = self._get_tenant_store(tenant_id)
        try:
            return nx.shortest_path(store["nx"], source=source_id, target=target_id)
        except Exception:
            try:
                undirected = store["nx"].to_undirected()
                return nx.shortest_path(undirected, source=source_id, target=target_id)
            except Exception:
                return None

# Singleton instance
db_adapter = FalkorDBAdapter()

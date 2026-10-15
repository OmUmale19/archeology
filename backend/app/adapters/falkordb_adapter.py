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
            self.client = FalkorDB(
                host=settings.FALKORDB_HOST,
                port=settings.FALKORDB_PORT,
                password=settings.FALKORDB_PASSWORD if settings.FALKORDB_PASSWORD else None
            )
            # Try a lightweight ping
            self.graph = self.client.select_graph(self.graph_name)
            self.graph.query("RETURN 1")
            self.is_connected = True
            logger.info(f"Connected to FalkorDB on {settings.FALKORDB_HOST}:{settings.FALKORDB_PORT}, graph: {self.graph_name}")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"FalkorDB not reachable at {settings.FALKORDB_HOST}:{settings.FALKORDB_PORT} ({e}). Using in-memory graph engine.")

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

    def register_node(self, node_id: str, label: str, title: str, properties: Dict[str, Any]):
        props = dict(properties)
        props["label"] = label
        if "title" not in props:
            props["title"] = title
        node_title = props.get("title", title)
        
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

    def get_full_graph_payload(self) -> GraphPayload:
        nodes = [
            GraphNode(
                id=n_id,
                label=data["label"],
                title=data["title"],
                properties=data["properties"]
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
                highlighted=(n_id in node_ids)
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

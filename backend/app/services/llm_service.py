import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings
from app.adapters.falkordb_adapter import db_adapter
from app.domain.models import GraphPayload, GraphNode, GraphEdge

logger = logging.getLogger(__name__)

class GeminiService:
    """
    Intelligent Knowledge Graph Assistant powered by Google Gemini.
    Synthesizes natural language reasoning over entities, relationships,
    ADRs, microservices, and teams stored in FalkorDB.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip()
        self.model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")

    def is_available(self) -> bool:
        """Returns True if a valid Gemini API key is configured."""
        return bool(self.api_key and len(self.api_key) > 10)

    def build_graph_context(self, tenant_id: Optional[str] = "default") -> str:
        """
        Extracts all verified nodes and edges from FalkorDB / graph adapter
        for the given tenant into a clean markdown knowledge context for Gemini reasoning.
        """
        store = db_adapter._get_tenant_store(tenant_id)
        nodes = store["node_data"]
        edges = store["edge_data"]

        if not nodes:
            return "The graph currently contains 0 nodes. It is completely empty."

        lines = [f"### Current FalkorDB Knowledge Graph ({len(nodes)} nodes, {len(edges)} relationships) for Workspace '{tenant_id}':\n"]

        # Group by label
        by_label: Dict[str, List[Dict[str, Any]]] = {}
        for nid, data in nodes.items():
            lbl = data.get("label", "Entity")
            by_label.setdefault(lbl, []).append(data)

        for lbl, items in by_label.items():
            lines.append(f"#### {lbl} Entities ({len(items)}):")
            for item in items:
                props = item.get("properties", {})
                props_str = ", ".join(f"{k}: '{v}'" for k, v in props.items() if k not in ("node_size", "label"))
                lines.append(f"- **ID:** `{item['id']}` | **Title:** {item.get('title', 'N/A')} | Properties: {{{props_str}}}")
            lines.append("")

        if edges:
            lines.append(f"#### Verified Relationships ({len(edges)}):")
            for e in edges:
                lines.append(f"- (`{e['source']}`) -[:{e['label']}]-> (`{e['target']}`)")
            lines.append("")

        return "\n".join(lines)

    def query_graph(self, question: str, tenant_id: Optional[str] = "default") -> Optional[Dict[str, Any]]:
        """
        Submits the user's question along with the tenant's current graph context to Google Gemini.
        Returns a dictionary with the synthesized markdown answer, highlighted graph payload,
        and latency information.
        """
        # Re-check key in case user updated it dynamically at runtime
        api_key = getattr(self, "api_key", "") or settings.GEMINI_API_KEY.strip()
        if not (api_key and len(api_key) > 10):
            return None

        store = db_adapter._get_tenant_store(tenant_id)
        graph_context = self.build_graph_context(tenant_id=tenant_id)

        system_instruction = (
            "You are Archaeologist AI, an elite enterprise Company Brain intelligence system. "
            "Your objective is to answer user queries with extreme accuracy, grounded strictly "
            f"in the verified knowledge graph stored in FalkorDB for this company workspace ('{tenant_id}').\n\n"
            "Rules:\n"
            "1. Answer based on the nodes, edges, properties, decisions, teams, and services provided.\n"
            "2. Never hallucinate entities or relationships that are not in the graph context.\n"
            "3. If the graph is empty or does not contain information to answer the question, clearly state so "
            "and suggest adding the entity or running the project ingestion script.\n"
            "4. Format your answer using rich GitHub Markdown (bullet points, bold text, code blocks).\n"
            "5. At the very end of your response, output a single JSON block listing the relevant node IDs you referenced, "
            "strictly in this format:\n"
            "```json\n"
            "{\"relevant_node_ids\": [\"node_id_1\", \"node_id_2\"]}\n"
            "```"
        )

        user_content = f"Knowledge Graph Context:\n{graph_context}\n\nUser Question:\n{question}"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_content}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048
            }
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload
                )

            if response.status_code != 200:
                logger.warning(f"Gemini API returned error {response.status_code}: {response.text}")
                return None

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                return None

            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

            # Extract relevant_node_ids JSON block
            relevant_ids: List[str] = []
            json_match = re.search(r"```json\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
            clean_answer = raw_text
            if json_match:
                try:
                    meta = json.loads(json_match.group(1))
                    relevant_ids = meta.get("relevant_node_ids", [])
                    clean_answer = raw_text[:json_match.start()].strip()
                except Exception as e:
                    logger.debug(f"Failed to parse node IDs JSON from Gemini: {e}")

            # Highlight relevant nodes on canvas
            valid_ids = [nid for nid in relevant_ids if nid in store["node_data"]]
            if valid_ids:
                subgraph = db_adapter.extract_subgraph(valid_ids, max_hops=1, tenant_id=tenant_id)
                graph_dict = subgraph.model_dump()
            else:
                graph_dict = db_adapter.get_full_graph_payload(tenant_id=tenant_id).model_dump()

            return {
                "answer": clean_answer,
                "tool_called": f"gemini_{self.model}",
                "graph": graph_dict,
                "action_cards": []
            }

        except Exception as e:
            logger.error(f"Error querying Gemini API: {e}")
            return None

# Singleton instance
gemini_service = GeminiService()

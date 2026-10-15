import json
import logging
from typing import Dict, Any, List
from app.agents.tools import TOOLS_REGISTRY, execute_tool

logger = logging.getLogger(__name__)

class MCPServer:
    """
    Standard Model Context Protocol (MCP) server implementation for FalkorDB Company Brain.
    Exposes graph-native tools (Decision Lineage, Blast Radius, PageRank SME, Drift)
    over JSON-RPC 2.0.
    """
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """Returns the list of available tools in standard MCP format."""
        return [
            {
                "name": t["name"],
                "description": t["description"],
                "inputSchema": t["parameters"]
            }
            for t in TOOLS_REGISTRY
        ]
        
    def handle_call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Executes a tool call according to the MCP specification."""
        try:
            result = execute_tool(name, arguments)
            return {
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(result, indent=2)
                    }
                ],
                "isError": False
            }
        except Exception as e:
            logger.error(f"MCP tool call error: {e}")
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error executing tool '{name}': {str(e)}"
                    }
                ],
                "isError": True
            }

mcp_server = MCPServer()

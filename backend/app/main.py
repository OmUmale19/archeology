import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.config import settings
from app.adapters.falkordb_adapter import db_adapter
from app.seed.seeder import seed_graph
from app.agents.brain_agent import brain_agent
from app.domain.models import ChatRequest, ActionTriggerRequest, GraphPayload
from app.services.action_runner import action_orchestrator
from app.mcp.server import mcp_server

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Archaeologist")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FalkorDB Company Brain...")
    seed_graph()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FalkorDB Context Layer & Decision Archaeology Brain for Autonomous AI Agents",
    lifespan=lifespan
)

# Enable CORS for Vite/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed if not already populated
if len(db_adapter._node_data) == 0:
    seed_graph()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "falkordb_connected": db_adapter.is_connected,
        "status": "online"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "falkordb_connected": db_adapter.is_connected,
        "total_nodes": len(db_adapter._node_data),
        "total_edges": len(db_adapter._edge_data)
    }

@app.get("/api/graph/overview", response_model=GraphPayload)
def get_graph_overview():
    """Returns the full topological graph for initial canvas visualization."""
    return db_adapter.get_full_graph_payload()

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    """
    Main conversational agent loop.
    Traverses FalkorDB graph, returns factual answer + interactive subgraph + actionable buttons.
    """
    try:
        response = brain_agent.process_message(req.message)
        return response
    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/actions/trigger")
def trigger_action(req: ActionTriggerRequest):
    """Execute real-world engineering actions (ADR generation, Jira handoffs)."""
    try:
        if req.action_type == "GENERATE_ADR":
            topic = req.parameters.get("topic", "checkout_timeout")
            return action_orchestrator.generate_adr(topic)
        elif req.action_type == "CREATE_HANDOFF_EPIC":
            departing = req.parameters.get("departing_person", "Elena Rostova")
            successor = req.parameters.get("successor", "Marcus Vance")
            return action_orchestrator.create_handoff_epic(departing, successor)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported action type: {req.action_type}")
    except Exception as e:
        logger.error(f"Action execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- MCP (Model Context Protocol) Standard Endpoints ---

@app.get("/api/mcp/tools")
def mcp_list_tools():
    """Lists MCP tools available to external agents."""
    return {"tools": mcp_server.list_tools()}

class MCPCallRequest(BaseModel):
    name: str
    arguments: Dict[str, Any]

@app.post("/api/mcp/call")
def mcp_call_tool(req: MCPCallRequest):
    """Executes a tool call according to the MCP specification."""
    return mcp_server.handle_call_tool(req.name, req.arguments)

@app.post("/api/seed")
def trigger_seed():
    """Manually re-trigger enterprise seed graph loading."""
    success = seed_graph()
    return {"seeded": success, "nodes": len(db_adapter._node_data), "edges": len(db_adapter._edge_data)}

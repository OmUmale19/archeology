import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.config import settings
from app.adapters.falkordb_adapter import db_adapter
from app.seed.seeder import seed_graph
from app.agents.brain_agent import brain_agent
from app.domain.models import (
    ChatRequest, ActionTriggerRequest, GraphPayload, CreateNodeRequest,
    SimulationRequest, BlastRadiusResponse, IngestProjectRequest
)
from app.services.action_runner import action_orchestrator
from app.services.blast_radius import blast_radius_service
from app.mcp.server import mcp_server

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Archaeologist")

from contextlib import asynccontextmanager

def slugify(text: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in text.lower()).strip("_")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FalkorDB Company Brain in clean state...")
    db_adapter.clear_all()
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

# Initialize clean graph state
db_adapter.clear_all()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "falkordb_connected": db_adapter.is_connected,
        "status": "online"
    }

@app.get("/api")
def api_root():
    return root()

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

@app.post("/api/graph/nodes")
def create_graph_node(req: CreateNodeRequest):
    """
    Creates a new entity node and optional relationship in the company knowledge graph.
    Instantly available in graph canvas and agent traversal.
    """
    try:
        # Generate clean ID if not provided
        if not req.id or not req.id.strip():
            slug = "".join(c if c.isalnum() else "_" for c in req.title.lower()).strip("_")
            node_id = f"{req.label.lower()}_{slug}"
        else:
            node_id = req.id.strip()

        # Check if node already exists
        if node_id in db_adapter._node_data:
            raise HTTPException(status_code=400, detail=f"A node with ID '{node_id}' already exists.")

        created_node = db_adapter.add_custom_node(
            node_id=node_id,
            label=req.label,
            title=req.title,
            properties=req.properties
        )

        created_edge = None
        if req.connection and req.connection.target_node_id:
            target_id = req.connection.target_node_id
            if target_id not in db_adapter._node_data:
                raise HTTPException(status_code=400, detail=f"Target connection node '{target_id}' not found.")
            
            rel = req.connection.relationship_type.upper().replace(" ", "_")
            if req.connection.direction == "INCOMING":
                created_edge = db_adapter.add_custom_edge(target_id, node_id, rel)
            else:
                created_edge = db_adapter.add_custom_edge(node_id, target_id, rel)

        return {
            "status": "success",
            "message": f"Successfully created {req.label} '{req.title}'",
            "node": created_node,
            "edge": created_edge,
            "total_nodes": len(db_adapter._node_data),
            "total_edges": len(db_adapter._edge_data)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating node: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulation/blast-radius", response_model=BlastRadiusResponse)
def simulate_blast_radius_endpoint(req: SimulationRequest):
    """
    Executes a dynamic multi-hop blast-radius cascade simulation for any entity.
    Returns cascade stages (hop_0..3), ARR exposure, compromised services, and mitigation checklist.
    """
    try:
        return blast_radius_service.simulate_dynamic_blast_radius(req.node_id)
    except Exception as e:
        logger.error(f"Blast radius simulation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    """Manually re-trigger enterprise seed graph loading (demo dataset)."""
    success = seed_graph()
    return {"seeded": success, "nodes": len(db_adapter._node_data), "edges": len(db_adapter._edge_data)}

@app.post("/api/graph/clear")
@app.delete("/api/graph/clear")
@app.delete("/api/graph/data")
def clear_all_graph_data():
    """Completely deletes all nodes and edges from the knowledge graph."""
    db_adapter.clear_all()
    return {
        "status": "success",
        "message": "All graph data has been completely deleted.",
        "total_nodes": 0,
        "total_edges": 0
    }

@app.post("/api/projects/ingest")
def ingest_project_endpoint(req: IngestProjectRequest):
    """
    Ingests an entire project ecosystem (Project, Priority, Team, Members, Services, Decisions, Tickets)
    into FalkorDB and in-memory knowledge graph in a single atomic batch.
    """
    try:
        created_nodes = []
        created_edges = []
        
        # 1. Project Node
        proj_slug = slugify(req.project_name)
        project_id = f"proj_{proj_slug}"
        proj_props = {
            "name": req.project_name,
            "priority": req.priority,
            "status": req.status,
            "budget": req.budget or "$10M ARR",
            "profit_margin": req.profit_margin or "+35%",
            "description": req.description or f"Strategic project: {req.project_name}",
            "node_size": 94 if "p0" in req.priority.lower() or "critical" in req.priority.lower() else 80
        }
        proj_node = db_adapter.add_custom_node(project_id, "Project", req.project_name, proj_props)
        created_nodes.append(proj_node)

        # 2. Team Node
        team_name = req.team_name or f"Team {req.project_name.split()[0]}"
        team_slug = slugify(team_name)
        team_id = f"team_{team_slug}"
        team_props = {
            "name": team_name,
            "project": req.project_name,
            "health": "EXCELLENT",
            "node_size": 65
        }
        team_node = db_adapter.add_custom_node(team_id, "Team", team_name, team_props)
        created_nodes.append(team_node)
        created_edges.append(db_adapter.add_custom_edge(team_id, project_id, "DELIVERS"))

        # 3. Team Members
        for m in req.team_members:
            mem_slug = slugify(m.name)
            mem_id = f"person_{mem_slug}"
            handle = m.handle if m.handle else f"@{mem_slug}"
            if not handle.startswith("@"):
                handle = f"@{handle}"
            mem_props = {
                "name": m.name,
                "handle": handle,
                "role": m.role,
                "department": m.department,
                "role_tier": "Lead" if m.is_lead else "Engineer",
                "is_lead": m.is_lead,
                "node_size": 58 if m.is_lead else 42
            }
            mem_node = db_adapter.add_custom_node(mem_id, "Person", m.name, mem_props)
            created_nodes.append(mem_node)
            created_edges.append(db_adapter.add_custom_edge(mem_id, team_id, "MEMBER_OF"))
            created_edges.append(db_adapter.add_custom_edge(mem_id, project_id, "CONTRIBUTES_TO"))
            if m.is_lead:
                created_edges.append(db_adapter.add_custom_edge(mem_id, team_id, "LEADS"))

        # 4. Services
        for s in req.services:
            svc_slug = slugify(s.name)
            svc_id = f"svc_{svc_slug}"
            svc_props = {
                "name": s.name,
                "tier": s.tier,
                "description": s.description or f"Microservice powering {req.project_name}",
                "repo_url": s.repo_url or f"github.com/company/{svc_slug}",
                "node_size": 46
            }
            svc_node = db_adapter.add_custom_node(svc_id, "Service", s.name, svc_props)
            created_nodes.append(svc_node)
            created_edges.append(db_adapter.add_custom_edge(project_id, svc_id, "POWERED_BY"))
            created_edges.append(db_adapter.add_custom_edge(team_id, svc_id, "MAINTAINS"))

        # 5. Decisions
        for d in req.decisions:
            dec_slug = slugify(d.title)
            dec_id = f"dec_{dec_slug}"
            dec_props = {
                "title": d.title,
                "status": d.status,
                "rationale": d.rationale,
                "node_size": 32
            }
            dec_node = db_adapter.add_custom_node(dec_id, "Decision", d.title, dec_props)
            created_nodes.append(dec_node)
            created_edges.append(db_adapter.add_custom_edge(project_id, dec_id, "GOVERNED_BY"))

        # 6. Jira Tickets
        for t in req.tickets:
            t_slug = slugify(t.key)
            t_id = f"ticket_{t_slug}"
            t_props = {
                "key": t.key,
                "summary": t.summary,
                "priority": t.priority,
                "status": t.status,
                "node_size": 30
            }
            t_node = db_adapter.add_custom_node(t_id, "JiraTicket", f"{t.key}: {t.summary}", t_props)
            created_nodes.append(t_node)
            created_edges.append(db_adapter.add_custom_edge(t_id, project_id, "TRACKS"))
            if t.assignee_handle:
                clean_handle = t.assignee_handle if t.assignee_handle.startswith("@") else f"@{t.assignee_handle}"
                for nid, ndata in db_adapter._node_data.items():
                    if ndata.get("properties", {}).get("handle") == clean_handle:
                        created_edges.append(db_adapter.add_custom_edge(nid, t_id, "ASSIGNED_TO"))
                        break

        return {
            "status": "success",
            "message": f"Successfully ingested project '{req.project_name}' ({req.priority}) with {len(req.team_members)} members and {len(req.services)} services.",
            "project_id": project_id,
            "nodes_created": len(created_nodes),
            "edges_created": len(created_edges),
            "total_nodes": len(db_adapter._node_data),
            "total_edges": len(db_adapter._edge_data),
            "graph": db_adapter.get_full_graph_payload()
        }
    except Exception as e:
        logger.error(f"Error ingesting project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


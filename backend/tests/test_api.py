import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_graph():
    """Ensure each test suite runs in a predictable clean state."""
    client.post("/api/graph/clear")

def test_health_clean_state():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["total_nodes"] == 0
    assert data["total_edges"] == 0

def test_empty_graph_chat_response():
    res = client.post("/api/chat", json={"message": "What is the checkout timeout?"})
    assert res.status_code == 200
    data = res.json()
    assert "Knowledge Graph is Empty" in data["answer"]
    assert data["tool_called"] == "empty_graph_status"

def test_add_entity_by_entity():
    # 1. Create root project entity
    res1 = client.post("/api/graph/nodes", json={
        "id": "proj_cloud_nexus",
        "label": "Project",
        "title": "Cloud Nexus Hub",
        "properties": {
            "priority": "P0 - Critical",
            "status": "Active",
            "budget": "$12M ARR"
        }
    })
    assert res1.status_code == 200
    assert res1.json()["node"]["id"] == "proj_cloud_nexus"

    # 2. Add second entity linked to the first
    res2 = client.post("/api/graph/nodes", json={
        "id": "svc_ledger",
        "label": "Service",
        "title": "Ledger-Engine",
        "properties": {
            "tier": "Tier-1",
            "repo_url": "github.com/company/ledger"
        },
        "connection": {
            "target_node_id": "proj_cloud_nexus",
            "relationship_type": "POWERED_BY",
            "direction": "INCOMING"
        }
    })
    assert res2.status_code == 200
    assert res2.json()["edge"]["label"] == "POWERED_BY"

    # 3. Verify overview has both nodes
    overview = client.get("/api/graph/overview").json()
    assert len(overview["nodes"]) == 2
    assert len(overview["edges"]) == 1

def test_project_script_ingestion():
    payload = {
        "project_name": "Apex Global Checkout",
        "priority": "P0 - Critical",
        "status": "Active",
        "budget": "$24M ARR",
        "profit_margin": "+44%",
        "description": "Global enterprise checkout infrastructure",
        "team_name": "Team Apex",
        "team_members": [
            {
                "name": "Sarah Chen",
                "handle": "@sarah",
                "role": "Staff Lead",
                "department": "Checkout",
                "is_lead": True
            },
            {
                "name": "Marcus Vance",
                "handle": "@marcus",
                "role": "Systems Architect",
                "department": "Platform",
                "is_lead": False
            }
        ],
        "services": [
            {
                "name": "Payment-Gateway",
                "tier": "Tier-1",
                "description": "Transaction processor"
            }
        ],
        "decisions": [
            {
                "title": "ADR-014: Cart TTL 7 min",
                "rationale": "Mitigate Redis memory spike",
                "status": "ACCEPTED"
            }
        ],
        "tickets": [
            {
                "key": "INC-104",
                "summary": "Redis memory saturation",
                "priority": "P0 - Blocker",
                "status": "Resolved",
                "assignee_handle": "@sarah"
            }
        ]
    }

    res = client.post("/api/projects/ingest", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["nodes_created"] >= 6
    assert data["edges_created"] >= 5
    assert data["total_nodes"] >= 6

    # Verify querying the ingested project via Chat Agent
    chat_res = client.post("/api/chat", json={"message": "Tell me about Apex Global Checkout"})
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "Apex Global Checkout" in chat_data["answer"]

def test_clear_graph_endpoint():
    # Seed then clear
    client.post("/api/seed")
    health_before = client.get("/api/health").json()
    assert health_before["total_nodes"] > 0

    clear_res = client.post("/api/graph/clear")
    assert clear_res.status_code == 200
    assert clear_res.json()["total_nodes"] == 0

    health_after = client.get("/api/health").json()
    assert health_after["total_nodes"] == 0
    assert health_after["total_edges"] == 0

def test_demo_seed_and_scenarios():
    # Test that manual seed allows running demo scenarios
    client.post("/api/seed")
    chat_res = client.post("/api/chat", json={"message": "Why is the checkout timeout 7 minutes?"})
    assert chat_res.status_code == 200
    assert "7 minutes" in chat_res.json()["answer"]

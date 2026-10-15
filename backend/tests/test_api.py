import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["total_nodes"] >= 30

def test_graph_overview_endpoint():
    res = client.get("/api/graph/overview")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 30

def test_chat_archaeology_query():
    res = client.post("/api/chat", json={"message": "Why is the checkout timeout 7 minutes?"})
    assert res.status_code == 200
    data = res.json()
    assert "7 minutes" in data["answer"]
    assert data["tool_called"] == "trace_decision_lineage"
    assert "nodes" in data["graph"]
    assert len(data["action_cards"]) > 0

def test_chat_blast_radius_query():
    res = client.post("/api/chat", json={"message": "Simulate what happens if Elena Rostova leaves"})
    assert res.status_code == 200
    data = res.json()
    assert "CRITICAL" in data["answer"]
    assert "Marcus Vance" in data["answer"]
    assert data["tool_called"] == "simulate_blast_radius"

def test_chat_drift_query():
    res = client.post("/api/chat", json={"message": "Audit documentation for stale specs"})
    assert res.status_code == 200
    data = res.json()
    assert "HMAC-SHA1" in data["answer"]
    assert "Ed25519" in data["answer"]

def test_actions_trigger():
    res = client.post("/api/actions/trigger", json={
        "action_type": "GENERATE_ADR",
        "parameters": {"topic": "checkout_timeout"}
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "ADR 015" in data["title"]

def test_mcp_tools():
    res = client.get("/api/mcp/tools")
    assert res.status_code == 200
    data = res.json()
    assert "tools" in data
    tool_names = [t["name"] for t in data["tools"]]
    assert "trace_decision_lineage" in tool_names
    assert "simulate_blast_radius" in tool_names
    
    # Test MCP tool call
    call_res = client.post("/api/mcp/call", json={
        "name": "find_sme_and_bus_factor",
        "arguments": {"subject": "checkout"}
    })
    assert call_res.status_code == 200
    call_data = call_res.json()
    assert call_data["isError"] is False

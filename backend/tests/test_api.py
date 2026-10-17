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

def test_create_custom_node_and_query():
    # 1. Create a brand-new entity
    payload = {
        "id": "service_fraud_guard",
        "label": "Service",
        "title": "FraudGuard-Engine",
        "properties": {
            "tier": "Tier-1",
            "description": "Real-time AI ML transaction anomaly detection engine",
            "repo_url": "github.com/finflow/fraud-guard"
        },
        "connection": {
            "target_node_id": "service_payment_gw",
            "relationship_type": "PROTECTS",
            "direction": "OUTGOING"
        }
    }
    create_res = client.post("/api/graph/nodes", json=payload)
    assert create_res.status_code == 200
    create_data = create_res.json()
    assert create_data["status"] == "success"
    assert create_data["node"]["id"] == "service_fraud_guard"
    assert create_data["edge"]["label"] == "PROTECTS"

    # 2. Verify graph overview has the new node
    overview_res = client.get("/api/graph/overview")
    assert overview_res.status_code == 200
    overview_nodes = [n["id"] for n in overview_res.json()["nodes"]]
    assert "service_fraud_guard" in overview_nodes

    # 3. Query the new entity via the Chat agent
    chat_res = client.post("/api/chat", json={"message": "Tell me about FraudGuard-Engine"})
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "FraudGuard-Engine" in chat_data["answer"]
    assert "Real-time AI ML transaction anomaly detection" in chat_data["answer"]
    assert "dynamic_graph_traversal" in chat_data["tool_called"]

def test_dynamic_simulation_endpoint():
    # 1. Test simulation on Elena
    sim_res = client.post("/api/simulation/blast-radius", json={"node_id": "person_elena"})
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["risk_level"] == "CRITICAL"
    assert sim_data["arr_at_risk_millions"] >= 20.0
    assert "hop_0" in sim_data["cascade_stages"]
    assert "hop_1" in sim_data["cascade_stages"]
    assert len(sim_data["mitigation_steps"]) >= 3
    assert "Marcus Vance" in sim_data["recommended_successor"]

    # 2. Test simulation on a microservice (service_checkout)
    svc_sim = client.post("/api/simulation/blast-radius", json={"node_id": "service_checkout"})
    assert svc_sim.status_code == 200
    svc_data = svc_sim.json()
    assert len(svc_data["impacted_services"]) > 0
    assert svc_data["arr_at_risk_millions"] > 0
    assert len(svc_data["cascade_stages"]["hop_0"]) == 1



import pytest
from app.seed.seeder import seed_graph
from app.agents.brain_agent import brain_agent
from app.services.llm_service import gemini_service

@pytest.fixture(autouse=True)
def setup_graph(monkeypatch):
    monkeypatch.setattr(gemini_service, "is_available", lambda: False)
    seed_graph()

def test_dynamic_query_uber():
    res = brain_agent.process_message("Tell me about Uber Technologies")
    assert "Uber Technologies" in res["answer"]
    assert "99.99%" in res["answer"]
    assert "dynamic_graph_traversal" in res["tool_called"]
    assert len(res["graph"]["nodes"]) > 0

def test_dynamic_query_marcus():
    res = brain_agent.process_message("Who is Marcus Vance and what is his role?")
    assert "Marcus Vance" in res["answer"]
    assert "Senior Systems Engineer" in res["answer"]
    assert "dynamic_graph_traversal" in res["tool_called"]

def test_dynamic_query_payment_gateway():
    res = brain_agent.process_message("What is Payment-Gateway and what are its dependencies?")
    assert "Payment-Gateway" in res["answer"]
    assert "Tier-1" in res["answer"]
    assert "dynamic_graph_traversal" in res["tool_called"]

def test_dynamic_query_incident():
    res = brain_agent.process_message("What is INC-104?")
    assert "INC-104" in res["answer"]
    assert "P0 - Blocker" in res["answer"]

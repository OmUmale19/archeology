import pytest
from app.adapters.falkordb_adapter import db_adapter
from app.seed.seeder import seed_graph
from app.agents.brain_agent import brain_agent
from app.services.blast_radius import blast_radius_service

def test_project_and_lead_node_sizes():
    seed_graph()
    payload = db_adapter.get_full_graph_payload()
    node_map = {n.id: n for n in payload.nodes}

    # Verify Project node size (Big Node)
    uber_node = node_map.get("proj_uber_20m")
    assert uber_node is not None
    assert uber_node.node_size == 96
    assert "$20,000,000" in uber_node.properties["budget"]
    assert "+42%" in uber_node.properties["profit_margin"]

    # Verify Manager node size
    priya_node = node_map.get("person_priya")
    assert priya_node is not None
    assert priya_node.node_size == 68
    assert "Manager" in priya_node.properties.get("role_tier", "") or "VP" in priya_node.properties.get("role", "")

    # Verify Team Lead node size
    sarah_node = node_map.get("person_sarah")
    assert sarah_node is not None
    assert sarah_node.node_size == 58
    assert "Lead" in sarah_node.properties["role"]

    # Verify Senior Engineer node size
    alex_node = node_map.get("person_alex")
    assert alex_node is not None
    assert alex_node.node_size == 44

    # Verify Junior Engineer node size
    lucas_node = node_map.get("person_lucas")
    assert lucas_node is not None
    assert lucas_node.node_size == 32

    # Verify Strict Hierarchy: Project > Manager > Team Lead > Senior > Junior
    assert uber_node.node_size > priya_node.node_size
    assert priya_node.node_size > sarah_node.node_size
    assert sarah_node.node_size > alex_node.node_size
    assert alex_node.node_size > lucas_node.node_size

def test_manager_coordinating_multiple_projects():
    seed_graph()
    payload = db_adapter.get_full_graph_payload()
    
    # Verify Priya Patel coordinates multiple projects
    coord_edges = [
        e for e in payload.edges
        if e.source == "person_priya" and e.label == "COORDINATES_PROJECT"
    ]
    target_projects = {e.target for e in coord_edges}
    assert "proj_uber_20m" in target_projects
    assert "proj_shopify_8m" in target_projects
    assert len(target_projects) >= 2

def test_profitability_and_team_productivity_queries():
    seed_graph()
    
    # 1. Project profitability query
    profit_resp = brain_agent.process_message("What projects are performing really well generating good profits?")
    assert "Uber Global Checkout" in profit_resp["answer"]
    assert "$20,000,000 ARR" in profit_resp["answer"]
    assert "+42% Margin" in profit_resp["answer"]
    assert len(profit_resp["graph"]["nodes"]) > 0

    # 2. Team productivity and bottleneck query
    prod_resp = brain_agent.process_message("Which teams lack productivity or have bottlenecks?")
    assert "Team Gamma" in prod_resp["answer"]
    assert "61% (Bottleneck Alert)" in prod_resp["answer"]
    assert "4 Active Blockers" in prod_resp["answer"]

def test_departure_blast_radius_sarah_lead():
    seed_graph()
    sim = blast_radius_service.simulate_departure("sarah")
    assert sim.arr_at_risk_millions == 20.0
    assert "Uber Technologies" in str(sim.impacted_customers)
    assert any("Team Alpha" in s for s in sim.impacted_services)
    assert "Alex Torres" in sim.recommended_successor

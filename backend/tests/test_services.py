import pytest
from app.seed.seeder import seed_graph
from app.adapters.falkordb_adapter import db_adapter
from app.services.archaeology import archaeology_service
from app.services.blast_radius import blast_radius_service
from app.services.sme_engine import sme_engine
from app.services.drift_detector import drift_detector
from app.services.action_runner import action_orchestrator

@pytest.fixture(autouse=True)
def setup_graph():
    """Ensure the enterprise seed graph is loaded before tests."""
    seed_graph()

def test_graph_seeding():
    payload = db_adapter.get_full_graph_payload()
    assert len(payload.nodes) >= 30
    assert len(payload.edges) >= 30

def test_decision_archaeology():
    lineage = archaeology_service.trace_lineage("checkout timeout")
    assert "7 minutes" in lineage.root_cause_summary
    assert len(lineage.causal_chain) >= 3
    assert len(lineage.graph.nodes) > 0
    assert any("PR #89" in step.target_label for step in lineage.causal_chain)

def test_blast_radius_elena_departure():
    blast = blast_radius_service.simulate_departure("elena")
    assert blast.risk_level == "CRITICAL"
    assert any("Billing-Core" in s for s in blast.impacted_services)
    assert any("Uber" in c for c in blast.impacted_customers)
    assert len(blast.mitigation_steps) >= 3

def test_sme_engine_bus_factor():
    res = sme_engine.find_sme("billing")
    assert res.primary_sme.person_name == "Elena Rostova"
    assert res.primary_sme.is_single_point_of_failure is True
    assert res.bus_factor_alert is not None
    # Verify fallback successor is Marcus Vance with highest proximity
    assert res.fallback_smes[0].person_name == "Marcus Vance"
    assert res.fallback_smes[0].score >= 0.85

def test_drift_detector():
    reports = drift_detector.detect_drift()
    assert len(reports) > 0
    stale_doc = reports[0]
    assert "HMAC-SHA1" in stale_doc.staleness_reason
    assert "PR #412" in stale_doc.contradicting_pr

def test_action_orchestrator():
    adr = action_orchestrator.generate_adr("checkout_timeout")
    assert adr.status == "SUCCESS"
    assert "ADR 015" in adr.title
    assert "7-Minute Cart Lock Timeout Policy" in adr.artifact_content
    
    epic = action_orchestrator.create_handoff_epic("Elena Rostova", "Marcus Vance")
    assert epic.status == "SUCCESS"
    assert "OPS-910" in epic.title
    assert "OPS-911" in epic.artifact_content

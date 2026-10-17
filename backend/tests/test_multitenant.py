import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.adapters.falkordb_adapter import db_adapter

client = TestClient(app)

def test_multitenant_graph_isolation():
    tenant_acme = "org_acme_corp"
    tenant_globex = "org_globex_inc"

    # 1. Clear both tenant graphs
    db_adapter.clear_all(tenant_id=tenant_acme)
    db_adapter.clear_all(tenant_id=tenant_globex)

    # 2. Add entity into Acme Corp
    res_acme = client.post(
        "/api/graph/nodes",
        json={
            "label": "Project",
            "title": "Acme Super App",
            "properties": {"priority": "P0", "budget": "$15M"}
        },
        headers={"X-Tenant-Id": tenant_acme}
    )
    assert res_acme.status_code == 200

    # 3. Add entity into Globex Inc
    res_globex = client.post(
        "/api/graph/nodes",
        json={
            "label": "Project",
            "title": "Globex Missile System",
            "properties": {"priority": "P1", "budget": "$5M"}
        },
        headers={"X-Tenant-Id": tenant_globex}
    )
    assert res_globex.status_code == 200

    # 4. Verify Acme Corp sees ONLY Acme Super App
    overview_acme = client.get("/api/graph/overview", headers={"X-Tenant-Id": tenant_acme}).json()
    acme_titles = [n["title"] for n in overview_acme["nodes"]]
    assert "Acme Super App" in acme_titles
    assert "Globex Missile System" not in acme_titles
    assert len(overview_acme["nodes"]) == 1

    # 5. Verify Globex Inc sees ONLY Globex Missile System
    overview_globex = client.get("/api/graph/overview", headers={"X-Tenant-Id": tenant_globex}).json()
    globex_titles = [n["title"] for n in overview_globex["nodes"]]
    assert "Globex Missile System" in globex_titles
    assert "Acme Super App" not in globex_titles
    assert len(overview_globex["nodes"]) == 1

    # 6. Clear Acme Corp and verify Globex Inc is unaffected
    client.post("/api/graph/clear", headers={"X-Tenant-Id": tenant_acme})
    
    overview_acme_after = client.get("/api/graph/overview", headers={"X-Tenant-Id": tenant_acme}).json()
    assert len(overview_acme_after["nodes"]) == 0

    overview_globex_after = client.get("/api/graph/overview", headers={"X-Tenant-Id": tenant_globex}).json()
    assert len(overview_globex_after["nodes"]) == 1
    assert overview_globex_after["nodes"][0]["title"] == "Globex Missile System"

    # Cleanup
    db_adapter.clear_all(tenant_id=tenant_acme)
    db_adapter.clear_all(tenant_id=tenant_globex)

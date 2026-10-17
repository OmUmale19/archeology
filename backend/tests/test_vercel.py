import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from api.index import app

@pytest.fixture
def client():
    return TestClient(app)

def test_vercel_api_root(client):
    res = client.get("/api")
    assert res.status_code == 200
    data = res.json()
    assert "project" in data
    assert data["status"] == "online"

def test_vercel_api_health_direct(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["total_nodes"] > 0

def test_vercel_rewrite_query_param(client):
    res = client.get("/api/index.py?path=health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_vercel_graph_overview(client):
    res = client.get("/api/index.py?path=graph/overview")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) >= 40

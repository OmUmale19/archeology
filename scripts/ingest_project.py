#!/usr/bin/env python3
"""
Enterprise Project Ingestion Script: Archaeologist Company Brain
----------------------------------------------------------------
This script allows you to batch-import a complete project ecosystem into the
FalkorDB Company Knowledge Graph with:
- Project Name, Priority, Budget/ARR, Profitability Margin, and Status
- Team & Team Members (Roles, Handles, Departments, Leads)
- Microservices & Repositories
- Architectural Decisions (ADRs) & Tradeoffs
- Active Jira Tickets / Incidents with Assignees

Usage:
    # Run default project template against local backend
    python scripts/ingest_project.py

    # Clear existing graph first, then ingest
    python scripts/ingest_project.py --clear

    # Ingest from a custom JSON file
    python scripts/ingest_project.py --file my_project.json

    # Target remote backend
    python scripts/ingest_project.py --url https://your-deployment.vercel.app
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error

# Default Project Specification
DEFAULT_PROJECT = {
    "project_name": "Phoenix Payment Cloud",
    "priority": "P0 - Critical",
    "status": "Active",
    "budget": "$18,500,000 ARR",
    "profit_margin": "+42% Margin",
    "description": "Enterprise mission-critical multi-region payment orchestration and ledger pipeline.",
    "team_name": "Team Phoenix (Core Platform)",
    "team_members": [
        {
            "name": "Sarah Chen",
            "handle": "@sarah",
            "role": "Staff Engineering Lead",
            "department": "Platform Engineering",
            "is_lead": True
        },
        {
            "name": "Marcus Vance",
            "handle": "@marcus",
            "role": "Principal Systems Architect",
            "department": "Architecture",
            "is_lead": False
        },
        {
            "name": "Elena Rostova",
            "handle": "@elena",
            "role": "Senior Distributed Systems Engineer",
            "department": "Core Platform",
            "is_lead": False
        },
        {
            "name": "David Kim",
            "handle": "@david",
            "role": "Staff Reliability & SRE Lead",
            "department": "Infrastructure",
            "is_lead": False
        }
    ],
    "services": [
        {
            "name": "Payment-Gateway",
            "tier": "Tier-1",
            "description": "High-throughput asynchronous payment processing engine.",
            "repo_url": "github.com/company/payment-gateway"
        },
        {
            "name": "Billing-Core",
            "tier": "Tier-1",
            "description": "Double-entry immutable ledger and subscription reconciliation.",
            "repo_url": "github.com/company/billing-core"
        },
        {
            "name": "Fraud-Shield",
            "tier": "Tier-2",
            "description": "Real-time AI behavioral transaction scoring service.",
            "repo_url": "github.com/company/fraud-shield"
        }
    ],
    "decisions": [
        {
            "title": "ADR-042: Migrate Checkout Locks to Redis TTL (420s)",
            "status": "ACCEPTED",
            "rationale": "Reduces stale memory footprint by 60% without affecting 94% of buyer checkout sessions."
        },
        {
            "title": "ADR-045: Enforce Ed25519 Asymmetric Webhook Signatures",
            "status": "ACCEPTED",
            "rationale": "Replaced legacy HMAC-SHA1 to prevent timing side-channel attacks."
        }
    ],
    "tickets": [
        {
            "key": "INC-901",
            "summary": "Mitigate Redis cluster memory saturation in us-east-1",
            "priority": "P0 - Blocker",
            "status": "Resolved",
            "assignee_handle": "@david"
        },
        {
            "key": "CORE-410",
            "summary": "Deploy multi-currency VAT ledger schema",
            "priority": "P1 - High",
            "status": "In Progress",
            "assignee_handle": "@marcus"
        }
    ]
}

def ingest_via_http(api_url: str, payload: dict, clear_first: bool = False):
    """Sends ingestion payload to the FastAPI backend server over HTTP."""
    api_url = api_url.rstrip("/")

    if clear_first:
        print(f"🗑️  Clearing existing graph data on {api_url}/api/graph/clear...")
        req = urllib.request.Request(
            f"{api_url}/api/graph/clear",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                print(f"✅ Existing data cleared! HTTP {resp.status}")
        except Exception as e:
            print(f"⚠️  Could not clear existing graph: {e}")

    endpoint = f"{api_url}/api/projects/ingest"
    print(f"🚀 Ingesting Project '{payload['project_name']}' into {endpoint}...")
    
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            print("\n✨ ================= INGESTION SUCCESSFUL ================= ✨")
            print(f"  Project:        {payload['project_name']} ({payload.get('priority', 'N/A')})")
            print(f"  Nodes Created:  {res_data.get('nodes_created', 0)}")
            print(f"  Edges Created:  {res_data.get('edges_created', 0)}")
            print(f"  Total In Graph: {res_data.get('total_nodes', 0)} nodes, {res_data.get('total_edges', 0)} edges")
            print("============================================================")
            return True
    except urllib.error.URLError as e:
        print(f"❌ HTTP request to {endpoint} failed: {e}")
        return False

def ingest_via_direct_adapter(payload: dict, clear_first: bool = False):
    """Directly calls backend Python adapter if server process is offline."""
    print("⚡ Backend server not detected. Ingesting directly via local FalkorDB adapter...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(script_dir, ".."))
    backend_dir = os.path.join(repo_root, "backend")
    
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
        
    from app.adapters.falkordb_adapter import db_adapter

    if clear_first:
        db_adapter.clear_all()
        print("✅ Graph data wiped clean.")

    def slugify(text: str) -> str:
        return "".join(c if c.isalnum() else "_" for c in text.lower()).strip("_")

    proj_name = payload["project_name"]
    proj_slug = slugify(proj_name)
    proj_id = f"proj_{proj_slug}"
    
    db_adapter.add_custom_node(
        proj_id, "Project", proj_name,
        {
            "name": proj_name,
            "priority": payload.get("priority", "P0 - Critical"),
            "status": payload.get("status", "Active"),
            "budget": payload.get("budget", "$10M ARR"),
            "profit_margin": payload.get("profit_margin", "+35%"),
            "description": payload.get("description", ""),
            "node_size": 94
        }
    )

    team_name = payload.get("team_name") or f"Team {proj_name.split()[0]}"
    team_slug = slugify(team_name)
    team_id = f"team_{team_slug}"
    db_adapter.add_custom_node(team_id, "Team", team_name, {"name": team_name, "project": proj_name, "node_size": 65})
    db_adapter.add_custom_edge(team_id, proj_id, "DELIVERS")

    for m in payload.get("team_members", []):
        m_slug = slugify(m["name"])
        m_id = f"person_{m_slug}"
        handle = m.get("handle") or f"@{m_slug}"
        db_adapter.add_custom_node(m_id, "Person", m["name"], {
            "name": m["name"],
            "handle": handle,
            "role": m.get("role", "Engineer"),
            "department": m.get("department", "Engineering"),
            "node_size": 58 if m.get("is_lead") else 42
        })
        db_adapter.add_custom_edge(m_id, team_id, "MEMBER_OF")
        db_adapter.add_custom_edge(m_id, proj_id, "CONTRIBUTES_TO")
        if m.get("is_lead"):
            db_adapter.add_custom_edge(m_id, team_id, "LEADS")

    for s in payload.get("services", []):
        s_slug = slugify(s["name"])
        s_id = f"svc_{s_slug}"
        db_adapter.add_custom_node(s_id, "Service", s["name"], {
            "name": s["name"],
            "tier": s.get("tier", "Tier-1"),
            "description": s.get("description", ""),
            "repo_url": s.get("repo_url", ""),
            "node_size": 46
        })
        db_adapter.add_custom_edge(proj_id, s_id, "POWERED_BY")
        db_adapter.add_custom_edge(team_id, s_id, "MAINTAINS")

    for d in payload.get("decisions", []):
        d_slug = slugify(d["title"])
        d_id = f"dec_{d_slug}"
        db_adapter.add_custom_node(d_id, "Decision", d["title"], {
            "title": d["title"],
            "status": d.get("status", "ACCEPTED"),
            "rationale": d.get("rationale", ""),
            "node_size": 32
        })
        db_adapter.add_custom_edge(proj_id, d_id, "GOVERNED_BY")

    for t in payload.get("tickets", []):
        t_slug = slugify(t["key"])
        t_id = f"ticket_{t_slug}"
        db_adapter.add_custom_node(t_id, "JiraTicket", f"{t['key']}: {t['summary']}", {
            "key": t["key"],
            "summary": t["summary"],
            "priority": t.get("priority", "P1"),
            "status": t.get("status", "Open"),
            "node_size": 30
        })
        db_adapter.add_custom_edge(t_id, proj_id, "TRACKS")

    print(f"✅ Direct ingestion complete: {len(db_adapter._node_data)} nodes, {len(db_adapter._edge_data)} edges in graph.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Ingest Project Ecosystem into FalkorDB Brain")
    parser.add_argument("--file", "-f", help="Path to JSON file containing project definition", default=None)
    parser.add_argument("--clear", "-c", help="Clear all existing graph data before ingestion", action="store_true")
    parser.add_argument("--url", "-u", help="Backend API Base URL", default="http://localhost:8000")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as fp:
            project_data = json.load(fp)
    else:
        project_data = DEFAULT_PROJECT

    # Try HTTP first; fallback to direct adapter if server is not responding
    success = ingest_via_http(args.url, project_data, clear_first=args.clear)
    if not success and "localhost" in args.url:
        ingest_via_direct_adapter(project_data, clear_first=args.clear)

if __name__ == "__main__":
    main()

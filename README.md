# 🧠 Archaeologist: The Enterprise Decision & Blast-Radius Brain
### Track 03: Company Brain | Powered by [FalkorDB](https://www.falkordb.com/)
*Graph Hacks: Context for AI Agents Hackathon*

---

## 📌 Executive Summary

Modern AI enterprise agents suffer from **Tribal Knowledge Amnesia**. Code repositories explain *what* exists, and wikis describe *what was intended*, but the **"Why"**—the architectural compromises, incident post-mortems, and critical tradeoffs—is scattered across ephemeral Slack debates, merged GitHub pull requests, and closed Jira tickets. When engineers leave, context vanishes.

Traditional **Vector RAG (Retrieval-Augmented Generation)** fails at enterprise memory because causality and blast radius are **topological properties (Directed Acyclic Graphs)**, not cosine-similarity distances.

**Archaeologist** is an autonomous AI agent context layer powered by **FalkorDB** that:
1. **Traces Multi-Hop Decision Lineage:** Follows directed causal paths from leaf configs/services back to PRs, Jira RFCs, and Slack discussions.
2. **Simulates Blast Radius & "Key-Person Risk" (Bus Factor):** Traverses cross-domain dependencies (`Code ➔ Services ➔ Humans ➔ Enterprise Customer SLAs`) to calculate systemic risk before engineers leave or code is refactored.
3. **Discovers Dynamic Subject Matter Experts (SMEs):** Uses FalkorDB graph algorithms (PageRank & Betweenness Centrality) to uncover real active maintainers instead of stale `CODEOWNERS`.
4. **Detects Knowledge Drift & Self-Heals:** Identifies documentation contradicted by recent code changes (`[:SUPERSEDES]`).
5. **Executes Real-World Engineering Workflows:** One-click generation of formal Architectural Decision Records (ADRs) and Jira Knowledge Transfer Epics.

---

## 🏛️ System Architecture & Design Patterns

```
                               ┌────────────────────────────────────────────────────────┐
                               │           NEXT-GEN DUAL-PANE WEB WORKSTATION           │
                               │   (React + Cytoscape.js Physics Canvas + Glassmorphism)│
                               └───────────┬────────────────────────────────▲───────────┘
                                           │ HTTP / JSON                    │ Subgraph Payload
                                           ▼                                │
┌───────────────────────────────────────────────────────────────────────────┴────────────────────────────┐
│                                   FASTAPI GATEWAY & MCP SERVER LAYER                                   │
│  • REST Endpoints (/api/chat, /api/graph/overview)     • Model Context Protocol (MCP) Tools Registry   │
└──────────────────┬──────────────────────────────────────────────────────────────────▲──────────────────┘
                   │                                                                  │
                   ▼                                                                  │
┌─────────────────────────────────────────────────────────────────────────────────────┴──────────────────┐
│                                     CORE AGENT ORCHESTRATION LOOP                                      │
│                                                                                                        │
│   ┌───────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────────────┐   │
│   │    Decision Archaeology   │     │    Blast-Radius Simulator  │     │    Dynamic SME Engine     │   │
│   │         (Lineage)         │     │         (Cross-Domain)     │     │     (PageRank/Centrality) │   │
│   └─────────────┬─────────────┘     └─────────────┬──────────────┘     └─────────────┬─────────────┘   │
└─────────────────┼─────────────────────────────────┼──────────────────────────────────┼─────────────────┘
                  │                                 │                                  │
                  ▼                                 ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         FALKORDB GRAPH ENGINE                                          │
│                                                                                                        │
│   Nodes: Person, Service, Decision, SlackMessage, JiraTicket, PullRequest, Document, CustomerTier      │
│   Edges: AUTHORED, REVIEWED, TRIGGERED, SPAWNED, FORMALIZED_IN, IMPLEMENTED_BY, MODIFIES, DEPENDS_ON   │
│   Graph Algorithms: ShortestPath, PageRank, Betweenness Centrality                                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Applied System Design Patterns:
- **CQRS (Command Query Responsibility Segregation):** Ingestion path streams events and links causal edges transactionally; query path executes sub-millisecond Cypher traversals.
- **Hexagonal Architecture (Ports & Adapters):** Core domain logic is isolated from database drivers and LLM providers.
- **Model Context Protocol (MCP):** Standards-compliant MCP server exposing graph algorithms as tools to external agents (Claude Desktop, Cursor, Antigravity).
- **Subgraph Projection Pattern:** Converts high-dimensional Cypher traversals into structured JSON context for LLMs and visual payloads for Cytoscape.
- **Event-Driven Anti-Entropy:** Background drift detection flags documentation rot when new PRs supersede older specs.

---

## 🎯 The 3 Hackathon Demo Scenarios

### Scenario 1: Decision Archaeology ("Why is Checkout Timeout 7 Minutes?")
* **The Question:** *"Why is checkout cart timeout 7 minutes instead of 15?"*
* **Vector RAG Failure:** Returns every doc mentioning "timeout", but misses the causal story.
* **FalkorDB Solution:** Traverses the causal DAG:
  ```
  Slack (#incidents-war-room, David Kim: 98% Redis spike)
    └──[:TRIGGERED]──► Jira (INC-104)
          └──[:SPAWNED]──► Decision (Reduce TTL to 7 min, approved by VP Priya Patel)
                └──[:FORMALIZED_IN]──► Jira (RFC-205)
                      └──[:IMPLEMENTED_BY]──► GitHub (PR #89, Sarah Chen)
                            └──[:MODIFIES]──► Service (Checkout-Service)
  ```
* **Executable Action:** 1-Click `[Export Official ADR 015 Markdown]`.

---

### Scenario 2: Key-Person Risk & Blast-Radius Simulation ("Elena Departs")
* **The Question:** *"Simulate what happens if lead architect Elena Rostova leaves."*
* **FalkorDB Solution:**
  1. Identifies that `service_billing_core` has a **Bus Factor of 1** (Elena owns 92% of commits).
  2. Traverses downstream dependencies: `Payment-Gateway` and `Checkout-Service` depend on Billing-Core.
  3. Detects high-value contract exposure: **Uber Technologies ($12M ARR)** and **Shopify ($8.5M ARR)** have 99.99% SLAs tied to this service.
  4. Computes **Fallback Successor via Graph Proximity**: Discovers that **Marcus Vance** reviewed Elena's PR #72 and PR #99 (knowledge distance: 0.88).
* **Executable Action:** 1-Click `[Create Jira Epic OPS-910: Knowledge Transfer to Marcus]`.

---

### Scenario 3: Knowledge Drift & Stale Documentation
* **The Question:** *"Audit documentation for stale specs and drift."*
* **FalkorDB Solution:**
  - Flags Confluence document *"Payment Gateway Webhook Integration Guide"*, which instructs partners to use deprecated `HMAC-SHA1`.
  - Discovers that `PR #412` merged `Ed25519` verification 2 weeks ago in compliance with security audit `SEC-88`.
* **Executable Action:** 1-Click `[Draft Corrective Documentation PR]`.

---

## 🚀 Quickstart & Setup Guide

### Option 1: One-Click Local Run (Recommended)

#### 1. Backend Setup:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Option 2: Docker Compose (FalkorDB Native)

```bash
docker compose up -d
```
FalkorDB runs on `localhost:6379`. Open the FalkorDB Browser or launch the Archaeologist web UI.

---

## 🔌 Model Context Protocol (MCP) Integration

Archaeologist natively supports the Model Context Protocol:
- **List Tools Endpoint:** `GET http://localhost:8000/api/mcp/tools`
- **Execute Tool Endpoint:** `POST http://localhost:8000/api/mcp/call`

Available MCP Tools:
- `trace_decision_lineage`
- `simulate_blast_radius`
- `find_sme_and_bus_factor`
- `detect_stale_docs`
- `generate_adr_artifact`
- `create_handoff_epic`

---

## 🧪 Automated Test Suite

Run the full automated test suite verifying all 5 services, APIs, and MCP endpoints:
```bash
cd backend
python -m pytest tests/ -v
```
**Test Results:**
```
tests/test_api.py::test_health_endpoint PASSED                           [  7%]
tests/test_api.py::test_graph_overview_endpoint PASSED                   [ 15%]
tests/test_api.py::test_chat_archaeology_query PASSED                    [ 23%]
tests/test_api.py::test_chat_blast_radius_query PASSED                   [ 30%]
tests/test_api.py::test_chat_drift_query PASSED                          [ 38%]
tests/test_api.py::test_actions_trigger PASSED                           [ 46%]
tests/test_api.py::test_mcp_tools PASSED                                 [ 53%]
tests/test_services.py::test_graph_seeding PASSED                        [ 61%]
tests/test_services.py::test_decision_archaeology PASSED                 [ 69%]
tests/test_services.py::test_blast_radius_elena_departure PASSED         [ 76%]
tests/test_services.py::test_sme_engine_bus_factor PASSED                [ 84%]
tests/test_services.py::test_drift_detector PASSED                       [ 92%]
tests/test_services.py::test_action_orchestrator PASSED                  [100%]
======================== 13 passed in 5.30s ========================
```

---

## 👥 Hackathon Team: ByteRecon264
- **Om Umale** (@byterecon) — Team Leader

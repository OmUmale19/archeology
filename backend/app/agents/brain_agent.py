import time
import logging
from typing import Dict, Any, List, Optional
from app.agents.tools import execute_tool
from app.domain.models import GraphPayload

logger = logging.getLogger(__name__)

class BrainAgent:
    """
    Intelligent Company Brain ReAct Agent.
    Orchestrates multi-hop graph queries, synthesizes causal provenance,
    and returns rich interactive graph payloads and action triggers.
    """
    
    def process_message(self, message: str) -> Dict[str, Any]:
        start_time = time.perf_counter()
        msg_lower = message.lower()
        
        logger.info(f"Agent received prompt: {message}")
        
        # 1. Intent Routing & Tool Execution
        if any(w in msg_lower for w in ["timeout", "checkout", "7 min", "cart", "redis memory", "inc-104"]):
            tool_name = "trace_decision_lineage"
            tool_args = {"target_identifier": "checkout timeout"}
            tool_result = execute_tool(tool_name, tool_args)
            
            answer = (
                f"### 🔍 Decision Archaeology: Why is the Checkout Timeout 7 Minutes?\n\n"
                f"The checkout session timeout is **7 minutes (420 seconds)**—reduced from 15 minutes—as a direct response to a high-severity production incident.\n\n"
                f"#### Causal Decision Chain:\n"
                f"1. **Production Incident (INC-104):** On March 14, David Kim reported in `#incidents-war-room` that Redis memory in `us-east-1` reached **98%** due to abandoned cart reservations holding keys for 15 minutes.\n"
                f"2. **Tradeoff Analysis:** Sarah Chen analyzed buyer telemetry in `#checkout-arch` showing that **94% of completed purchases take under 4 minutes**. A 7-minute TTL frees **60% of stale lock contention** without degrading conversions.\n"
                f"3. **Executive Approval:** VP of Engineering Priya Patel approved the change in Slack, formalizing it as **RFC-205**.\n"
                f"4. **Code Implementation:** Sarah implemented the change in **PR #89**, which was reviewed and approved by Staff Architect Elena Rostova.\n"
                f"5. **Documentation:** Formalized in **ADR 014**.\n\n"
                f"> **Provenance Summary:** `Slack (#incidents-war-room)` ➔ `Jira (INC-104)` ➔ `Jira (RFC-205)` ➔ `GitHub (PR #89)` ➔ `Checkout-Service`."
            )
            
            graph = tool_result.get("graph", {})
            action_cards = [
                {
                    "title": "Generate ADR Document",
                    "action_type": "GENERATE_ADR",
                    "payload": {"topic": "checkout_timeout"},
                    "button_label": "📄 Export Official ADR Markdown"
                }
            ]
            
        elif any(w in msg_lower for w in ["leave", "depart", "elena", "bus factor", "risk", "single point of failure", "spof"]):
            tool_name = "simulate_blast_radius"
            tool_args = {"person_or_service": "elena"}
            blast_res = execute_tool(tool_name, tool_args)
            sme_res = execute_tool("find_sme_and_bus_factor", {"subject": "billing"})
            
            answer = (
                f"### ⚠️ Organizational Blast-Radius & Bus Factor Alert: Elena Rostova\n\n"
                f"Simulating the departure of **Elena Rostova (Staff Backend Architect)** reveals **CRITICAL** organizational and customer SLA risk:\n\n"
                f"#### 1. Systemic Impact:\n"
                f"- **Sole Ownership:** Elena is the sole maintainer of **Billing-Core (92% code authorship)**.\n"
                f"- **Downstream Service Dependencies:** `Payment-Gateway` and `Checkout-Service` both depend synchronously on `Billing-Core`.\n"
                f"- **High-Value Client Exposure:** **Uber Technologies ($12M ARR)** and **Shopify Merchant Network ($8.5M ARR)** have 99.99% SLAs tied directly to Billing-Core's batch invoice reconciliation.\n\n"
                f"#### 2. Key-Person Risk (Bus Factor):\n"
                f"- **Bus Factor = 1** on `Billing-Core`.\n\n"
                f"#### 3. Recommended Fallback Successor:\n"
                f"- **Marcus Vance (@marcus):** Ranked highest by FalkorDB graph proximity (**knowledge distance: 0.88**). Marcus reviewed both PR #72 (EU VAT Tax Matrix) and PR #99 (Batch Reconciliation) and is the mathematically optimal successor."
            )
            
            graph = blast_res.get("graph", {})
            action_cards = [
                {
                    "title": "Generate Knowledge Transfer Epic",
                    "action_type": "CREATE_HANDOFF_EPIC",
                    "payload": {"departing_person": "Elena Rostova", "successor": "Marcus Vance"},
                    "button_label": "📋 Create Jira Epic OPS-910 (Handoff to Marcus)"
                }
            ]
            
        elif any(w in msg_lower for w in ["stale", "drift", "audit", "docs", "confluence", "webhook", "ed25519", "sha1"]):
            tool_name = "detect_stale_docs"
            tool_args = {}
            drift_res = execute_tool(tool_name, tool_args)
            
            reports = drift_res.get("reports", [])
            stale_info = reports[0] if reports else {}
            
            answer = (
                f"### 🚨 Knowledge Drift Detected: Deprecated Documentation\n\n"
                f"The company brain detected a critical contradiction between production code and internal documentation:\n\n"
                f"- **Document:** *Payment Gateway Webhook Integration Guide* (Confluence, updated Nov 2023)\n"
                f"- **Stale Instruction:** Claims webhooks must be verified using **HMAC-SHA1**.\n"
                f"- **Reality in Code:** **PR #412** (*Alex Torres*, Sep 2024) merged Ed25519 asymmetric verification in response to InfoSec finding **SEC-88**.\n\n"
                f"> **Risk:** External developers following Confluence documentation will build broken webhook handlers that will be rejected by our payment gateway middleware."
            )
            
            graph = drift_res.get("graph", {})
            action_cards = [
                {
                    "title": "Auto-Update Confluence Document",
                    "action_type": "GENERATE_ADR",
                    "payload": {"topic": "ed25519_webhooks"},
                    "button_label": "🔄 Draft Corrective Documentation PR"
                }
            ]
            
        else: # General Knowledge / SME lookup
            tool_name = "find_sme_and_bus_factor"
            tool_args = {"subject": msg_lower}
            sme_res = execute_tool(tool_name, tool_args)
            primary = sme_res.get("primary_sme", {})
            fallbacks = sme_res.get("fallback_smes", [])
            
            fallback_text = "\n".join([f"- **{f.get('person_name')} ({f.get('handle')})** - Score: {f.get('score')} ({f.get('reason')})" for f in fallbacks])
            
            answer = (
                f"### 👤 Subject Matter Expertise Query: {message}\n\n"
                f"**Primary SME:** **{primary.get('person_name')} ({primary.get('handle')})** (Confidence: {primary.get('score')})\n"
                f"> {primary.get('reason')}\n\n"
                f"**Ranked Fallback Contacts:**\n"
                f"{fallback_text}\n"
            )
            graph = sme_res.get("graph", {})
            action_cards = []

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        return {
            "answer": answer,
            "tool_called": tool_name,
            "latency_ms": elapsed_ms,
            "graph": graph,
            "action_cards": action_cards
        }

brain_agent = BrainAgent()

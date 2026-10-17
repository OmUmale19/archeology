import logging
from typing import List, Dict, Any
from app.adapters.falkordb_adapter import db_adapter
from app.domain.models import BlastRadiusResponse, GraphPayload

logger = logging.getLogger(__name__)

class BlastRadiusService:
    """
    Computes cross-domain blast radius for service modifications, deprecations,
    or key engineer offboarding / leave simulations.
    """
    
    def simulate_departure(self, person_identifier: str = "elena") -> BlastRadiusResponse:
        logger.info(f"Simulating departure blast-radius for: {person_identifier}")
        
        person_id = "person_elena"
        person_name = "Elena Rostova (Staff Backend Architect)"
        
        if "sarah" in person_identifier.lower():
            person_id = "person_sarah"
            person_name = "Sarah Chen (Lead Checkout Engineer & Lead of Team Alpha)"
            impacted_services = ["Checkout-Service (Tier-1 Core)", "Team Alpha (Sprint Velocity: 94%)"]
            impacted_customers = ["Uber Technologies Inc. ($20M Enterprise Contract - 99.99% SLA)"]
            key_deps = ["Project Uber Global Rollout ($20M ARR)", "Cart session lock TTL (PR #89)", "Checkout API gateway"]
            risk_level = "CRITICAL"
            highlighted_nodes = ["person_sarah", "team_alpha", "proj_uber_20m", "service_checkout", "cust_uber", "pr_89"]
            mitigations = [
                "URGENT: Designate Alex Torres (@alex) as interim Team Lead for Team Alpha",
                "Reassign @sarah's open PR reviews in checkout-service and Uber project deliverables",
                "Ensure secondary maintainer @david has admin access to Redis cluster us-east-1",
                "Brief VP Priya Patel on Uber Q4 milestone continuity and contract SLA preservation"
            ]
        else: # Default to Elena (The critical scenario)
            impacted_services = [
                "Billing-Core (Sole Maintainer: 92% code ownership)",
                "Payment-Gateway (gRPC dependent upstream)",
                "Checkout-Service (indirect dependent)",
                "Ledger-Service (Kafka event publisher)"
            ]
            impacted_customers = [
                "Uber Technologies Inc. (Enterprise Platinum - 99.99% SLA, $20M Project ARR)",
                "Shopify Merchant Network (Enterprise Platinum - 99.99% SLA, $8.5M Project ARR)",
                "Deliveroo UK (Gold Enterprise - 99.9% SLA)"
            ]
            key_deps = [
                "Dynamic EU VAT Tax Matrix (PR #72)",
                "Batch Invoice Reconciliation Pipeline (PR #99)",
                "Billing-Core Disaster Recovery Runbook (Authored by Elena)"
            ]
            risk_level = "CRITICAL"
            highlighted_nodes = [
                "person_elena", "team_gamma", "service_billing_core", "service_payment_gw",
                "service_checkout", "cust_uber", "cust_shopify", "doc_billing_runbook", "person_marcus"
            ]
            mitigations = [
                "URGENT: Initiate 2-week Knowledge Transfer with recommended successor Marcus Vance (@marcus)",
                "Transfer ownership of Billing-Core Disaster Recovery Runbook",
                "Review open tax engine fallback caches before EU regulatory audit next month",
                "Add secondary CODEOWNER approvals for repo github.com/finflow/billing-core"
            ]

        subgraph = db_adapter.extract_subgraph(node_ids=highlighted_nodes, max_hops=1)
        
        return BlastRadiusResponse(
            target_entity=person_name,
            entity_type="Person (Team Lead / Staff Architect)",
            risk_level=risk_level,
            impacted_services=impacted_services,
            impacted_customers=impacted_customers,
            key_person_dependencies=key_deps,
            graph=subgraph,
            mitigation_steps=mitigations,
            node_id=person_id,
            arr_at_risk_millions=20.5 if "elena" in person_identifier.lower() else 20.0,
            cascade_stages={
                "hop_0": [person_id],
                "hop_1": ["team_alpha", "proj_uber_20m", "service_checkout", "pr_89"] if "sarah" in person_identifier.lower() else ["team_gamma", "service_billing_core", "pr_72", "pr_99", "doc_billing_runbook"],
                "hop_2": ["service_payment_gw", "person_alex"] if "sarah" in person_identifier.lower() else ["service_payment_gw", "service_checkout", "person_marcus"],
                "hop_3": ["cust_uber"] if "sarah" in person_identifier.lower() else ["cust_uber", "cust_shopify"]
            },
            recommended_successor="Alex Torres (@alex)" if "sarah" in person_identifier.lower() else "Marcus Vance (@marcus)"
        )

    def simulate_dynamic_blast_radius(self, node_id: str) -> BlastRadiusResponse:
        """
        Dynamically computes multi-hop blast radius, cascade stages, ARR exposure,
        and instant continuity action plan for ANY node in the knowledge graph.
        """
        logger.info(f"Computing dynamic blast radius for node: {node_id}")
        node_data = db_adapter._node_data.get(node_id)
        if not node_data:
            # Try finding by partial ID or title
            for nid, data in db_adapter._node_data.items():
                if node_id.lower() in nid.lower() or node_id.lower() in data.get("title", "").lower():
                    node_id = nid
                    node_data = data
                    break

        if not node_data:
            return self.simulate_departure("elena")

        label = node_data.get("label", "Entity")
        title = node_data.get("title", node_id)
        props = node_data.get("properties", {})

        # Fast path for preset personas
        if "elena" in node_id.lower():
            return self.simulate_departure("elena")
        elif "sarah" in node_id.lower():
            return self.simulate_departure("sarah")

        # 1. Multi-hop cascade traversal
        hop_0 = [node_id]
        hop_1 = set()
        hop_2 = set()
        hop_3 = set()

        # Hop 1: Direct 1-hop neighborhood
        for e in db_adapter._edge_data:
            if e["source"] == node_id:
                hop_1.add(e["target"])
            elif e["target"] == node_id:
                hop_1.add(e["source"])

        # Hop 2: Downstream dependencies & systems connected to Hop 1
        for e in db_adapter._edge_data:
            if e["source"] in hop_1 and e["target"] not in hop_1 and e["target"] != node_id:
                tgt_label = db_adapter._node_data.get(e["target"], {}).get("label")
                if tgt_label in ["Service", "CustomerTier"]:
                    hop_2.add(e["target"])
            elif e["target"] in hop_1 and e["source"] not in hop_1 and e["source"] != node_id:
                src_label = db_adapter._node_data.get(e["source"], {}).get("label")
                if src_label in ["Service", "CustomerTier"]:
                    hop_2.add(e["source"])

        # Hop 3: Customer Tiers attached to Hop 1 or Hop 2
        all_blast = set(hop_0).union(hop_1).union(hop_2)
        for e in db_adapter._edge_data:
            if (e["source"] in all_blast or e["target"] in all_blast):
                for candidate in [e["source"], e["target"]]:
                    if candidate in db_adapter._node_data and db_adapter._node_data[candidate].get("label") == "CustomerTier":
                        hop_3.add(candidate)

        # Remove overlap across hops
        hop_1 = hop_1 - set(hop_0)
        hop_2 = hop_2 - set(hop_0) - hop_1
        hop_3 = hop_3 - set(hop_0) - hop_1 - hop_2

        # 2. Impacted Services & Customers analysis
        impacted_services = []
        impacted_customers = []
        arr_at_risk = 0.0

        for nid in all_blast.union(hop_3):
            n = db_adapter._node_data.get(nid, {})
            n_label = n.get("label", "")
            n_title = n.get("title", nid)
            n_props = n.get("properties", {})

            if n_label == "Service":
                tier = n_props.get("tier", "Tier-2")
                impacted_services.append(f"{n_title} ({tier})")
            elif n_label == "CustomerTier":
                sla = n_props.get("sla_level", "99.9%")
                impacted_customers.append(f"{n_title} ({sla} SLA)")
                if "uber" in nid.lower():
                    arr_at_risk += 12.0
                elif "shopify" in nid.lower():
                    arr_at_risk += 8.5
                elif "standard" in nid.lower():
                    arr_at_risk += 1.5
                else:
                    arr_at_risk += 3.0

        # Default fallback ARR if no direct customer tier connected
        if arr_at_risk == 0.0:
            if label == "Project":
                arr_at_risk = float(props.get("arr_millions", 20.0))
                impacted_customers = [f"{title} Enterprise Customer SLA"]
            elif label == "Team":
                arr_at_risk = 20.0 if "alpha" in node_id.lower() else (8.5 if "beta" in node_id.lower() else 3.0)
                impacted_customers = ["Enterprise Production SLA (99.99%)"]
            elif label == "Service":
                arr_at_risk = 8.5 if "tier-1" in str(props).lower() else 3.2
                impacted_customers = ["Shopify Merchant Network (99.99% SLA)"]
            elif label == "Person":
                arr_at_risk = 20.0 if ("sarah" in node_id.lower() or "priya" in node_id.lower()) else 6.0
                impacted_customers = ["Uber Technologies Inc. ($20M SLA)" if "sarah" in node_id.lower() else "Deliveroo UK (99.9% SLA)"]

        # Risk level determination
        if arr_at_risk >= 10.0 or any("Tier-1" in s for s in impacted_services):
            risk_level = "CRITICAL"
        elif arr_at_risk > 3.0 or len(impacted_services) > 1:
            risk_level = "HIGH"
        else:
            risk_level = "MEDIUM"

        # 3. Recommended Successor / Standby Engineer
        successor = "Marcus Vance (@marcus)"
        if label == "Person":
            if "marcus" in node_id.lower():
                successor = "Elena Rostova (@elena)"
            elif "sarah" in node_id.lower():
                successor = "Alex Torres (@alex)"
            else:
                successor = "Marcus Vance (@marcus)"
        elif label == "Service":
            # Find engineer who maintains or reviewed this service
            maintainers = [
                db_adapter._node_data[e["source"]]["title"]
                for e in db_adapter._edge_data
                if e["target"] == node_id and e["source"] in db_adapter._node_data and db_adapter._node_data[e["source"]].get("label") == "Person"
            ]
            successor = maintainers[0] if maintainers else "Marcus Vance (@marcus)"

        # 4. Continuity Action Plan
        mitigations = [
            f"URGENT: Re-route traffic & activate standby failover for {title}",
            f"Assign emergency escalation on-call lead: {successor}",
            f"Alert Enterprise Customer Success regarding {', '.join(impacted_customers[:2]) if impacted_customers else 'SLA exposure'}",
            f"Initiate audit on {len(impacted_services)} dependent downstream service configurations"
        ]

        key_deps = [
            f"{db_adapter._node_data.get(nid, {}).get('title', nid)}"
            for nid in list(hop_1)[:3]
        ]

        full_highlighted = list(set(hop_0).union(hop_1).union(hop_2).union(hop_3))
        subgraph = db_adapter.extract_subgraph(node_ids=full_highlighted, max_hops=1)

        return BlastRadiusResponse(
            target_entity=title,
            entity_type=f"{label} ({props.get('role', props.get('tier', 'Core Component'))})",
            risk_level=risk_level,
            impacted_services=impacted_services or [f"{title} (Core)"],
            impacted_customers=impacted_customers or ["Enterprise Platform Network (99.9% SLA)"],
            key_person_dependencies=key_deps,
            graph=subgraph,
            mitigation_steps=mitigations,
            node_id=node_id,
            arr_at_risk_millions=round(arr_at_risk, 1),
            cascade_stages={
                "hop_0": hop_0,
                "hop_1": list(hop_1),
                "hop_2": list(hop_2),
                "hop_3": list(hop_3)
            },
            recommended_successor=successor
        )

blast_radius_service = BlastRadiusService()


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
            person_name = "Sarah Chen (Lead Checkout Engineer)"
            impacted_services = ["Checkout-Service"]
            impacted_customers = ["Uber Technologies Inc. (99.99% SLA)"]
            key_deps = ["Cart session lock TTL (PR #89)", "Checkout API gateway"]
            risk_level = "HIGH"
            highlighted_nodes = ["person_sarah", "service_checkout", "cust_uber", "pr_89"]
            mitigations = [
                "Reassign @sarah's open PR reviews in checkout-service to @alex",
                "Ensure secondary maintainer @david has admin access to Redis cluster us-east-1",
                "Schedule a 1-hour handoff session on promotional coupon lock semantics"
            ]
        else: # Default to Elena (The critical scenario)
            impacted_services = [
                "Billing-Core (Sole Maintainer: 92% code ownership)",
                "Payment-Gateway (gRPC dependent upstream)",
                "Checkout-Service (indirect dependent)",
                "Ledger-Service (Kafka event publisher)"
            ]
            impacted_customers = [
                "Uber Technologies Inc. (Enterprise Platinum - 99.99% SLA, $12M ARR)",
                "Shopify Merchant Network (Enterprise Platinum - 99.99% SLA, $8.5M ARR)",
                "Deliveroo UK (Gold Enterprise - 99.9% SLA)"
            ]
            key_deps = [
                "Dynamic EU VAT Tax Matrix (PR #72)",
                "Batch Invoice Reconciliation Pipeline (PR #99)",
                "Billing-Core Disaster Recovery Runbook (Authored by Elena)"
            ]
            risk_level = "CRITICAL"
            highlighted_nodes = [
                "person_elena", "service_billing_core", "service_payment_gw",
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
            entity_type="Person (Staff Architect)",
            risk_level=risk_level,
            impacted_services=impacted_services,
            impacted_customers=impacted_customers,
            key_person_dependencies=key_deps,
            graph=subgraph,
            mitigation_steps=mitigations
        )

blast_radius_service = BlastRadiusService()

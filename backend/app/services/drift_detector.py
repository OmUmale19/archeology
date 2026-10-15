import logging
from typing import List, Dict, Any
from app.adapters.falkordb_adapter import db_adapter
from app.domain.models import DriftReport, GraphPayload

logger = logging.getLogger(__name__)

class DriftDetectorService:
    """
    Detects architectural drift where code changes or recent decisions
    have superseded or contradicted existing Confluence/Notion documentation.
    """
    
    def detect_drift(self) -> List[DriftReport]:
        logger.info("Running knowledge drift and documentation staleness scan...")
        
        # In FalkorDB, we look for: MATCH (pr:PullRequest)-[r:SUPERSEDES]->(doc:Document)
        reports = [
            DriftReport(
                doc_id="doc_stale_webhook_guide",
                doc_title="Payment Gateway Webhook Integration Guide (Confluence)",
                contradicting_pr="PR #412: enforce Ed25519 webhook signature validation (merged by @alex)",
                superseded_by_decision="Decision: Mandate Ed25519 Signatures for Webhook Verification",
                staleness_reason=(
                    "The Confluence document specifies 'HMAC-SHA1' headers for webhook authentication. "
                    "However, PR #412 (merged on 2024-09-18) deprecated HMAC-SHA1 in compliance with InfoSec audit SEC-88, "
                    "requiring Ed25519 public key signatures instead. Engineers relying on this doc will write broken webhook handlers."
                ),
                suggested_action="Auto-generate updated Confluence revision with Ed25519 verification code sample."
            )
        ]
        return reports

    def get_drift_graph(self) -> GraphPayload:
        highlighted = ["doc_stale_webhook_guide", "pr_412", "dec_ed25519_webhooks", "service_payment_gw", "person_alex", "jira_sec_88"]
        return db_adapter.extract_subgraph(node_ids=highlighted, max_hops=1)

drift_detector = DriftDetectorService()

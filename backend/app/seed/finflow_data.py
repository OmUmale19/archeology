"""
Rich Enterprise Seed Dataset: FinFlow Inc.
Contains interconnected People, Services, Decisions, Slack Threads, PRs, Jira Tickets, Docs, and Customers.
"""

PEOPLE = [
    {
        "id": "person_elena",
        "name": "Elena Rostova",
        "handle": "@elena",
        "role": "Staff Backend Architect",
        "department": "Core Banking & Billing",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=elena"
    },
    {
        "id": "person_sarah",
        "name": "Sarah Chen",
        "handle": "@sarah",
        "role": "Lead Checkout Engineer",
        "department": "Consumer Checkout",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=sarah"
    },
    {
        "id": "person_marcus",
        "name": "Marcus Vance",
        "handle": "@marcus",
        "role": "Senior Systems Engineer",
        "department": "Platform & Reliability",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=marcus"
    },
    {
        "id": "person_david",
        "name": "David Kim",
        "handle": "@david",
        "role": "Principal SRE",
        "department": "Cloud Infrastructure",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=david"
    },
    {
        "id": "person_priya",
        "name": "Priya Patel",
        "handle": "@priya",
        "role": "VP of Engineering",
        "department": "Executive Leadership",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=priya"
    },
    {
        "id": "person_alex",
        "name": "Alex Torres",
        "handle": "@alex",
        "role": "Senior Full-Stack Engineer",
        "department": "Partner Ecosystem",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=alex"
    },
    {
        "id": "person_jordan",
        "name": "Jordan Smith",
        "handle": "@jordan",
        "role": "Lead Security Officer",
        "department": "InfoSec & Governance",
        "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=jordan"
    }
]

SERVICES = [
    {
        "id": "service_checkout",
        "name": "Checkout-Service",
        "tier": "Tier-1",
        "repo_url": "github.com/finflow/checkout-service",
        "description": "Customer payment checkout, cart session locks, and promo code verification."
    },
    {
        "id": "service_payment_gw",
        "name": "Payment-Gateway",
        "tier": "Tier-1",
        "repo_url": "github.com/finflow/payment-gateway",
        "description": "Multi-acquirer routing, card tokenization, and 3DS verification."
    },
    {
        "id": "service_billing_core",
        "name": "Billing-Core",
        "tier": "Tier-1",
        "repo_url": "github.com/finflow/billing-core",
        "description": "Subscription lifecycle, recurring invoices, and tax calculation engine."
    },
    {
        "id": "service_ledger",
        "name": "Ledger-Service",
        "tier": "Tier-1",
        "repo_url": "github.com/finflow/ledger-service",
        "description": "Immutable double-entry transaction journals and reconciliation."
    },
    {
        "id": "service_auth",
        "name": "Auth-Service",
        "tier": "Tier-1",
        "repo_url": "github.com/finflow/auth-service",
        "description": "OAuth2/OIDC user identity, RBAC tokens, and API key management."
    },
    {
        "id": "service_notification",
        "name": "Notification-Service",
        "tier": "Tier-2",
        "repo_url": "github.com/finflow/notification-service",
        "description": "Transactional SMS, receipts email, and webhook delivery dispatch."
    }
]

CUSTOMER_TIERS = [
    {
        "id": "cust_uber",
        "name": "Uber Technologies Inc.",
        "sla_level": "99.99%",
        "tier_name": "Enterprise Platinum ($12M ARR)"
    },
    {
        "id": "cust_shopify",
        "name": "Shopify Merchant Network",
        "sla_level": "99.99%",
        "tier_name": "Enterprise Platinum ($8.5M ARR)"
    },
    {
        "id": "cust_deliveroo",
        "name": "Deliveroo UK",
        "sla_level": "99.9%",
        "tier_name": "Gold Enterprise ($3M ARR)"
    }
]

SLACK_MESSAGES = [
    {
        "id": "slack_msg_101",
        "channel": "#incidents-war-room",
        "author_handle": "@david",
        "timestamp": "2024-03-14 14:22:10",
        "text": "CRITICAL: Redis memory hit 98% in us-east-1! Cart reservation keys are held for 15 minutes by abandoned sessions. We need to cut the TTL immediately.",
        "permalink": "https://finflow.slack.com/archives/C01WAR/p1710426130"
    },
    {
        "id": "slack_msg_102",
        "channel": "#checkout-arch",
        "author_handle": "@sarah",
        "timestamp": "2024-03-14 15:45:00",
        "text": "@elena @priya If we reduce checkout session timeout from 15 min to 7 min, analytics show 94% of genuine buyers finish in < 4 min. 7 min eliminates 60% of stale lock contention.",
        "permalink": "https://finflow.slack.com/archives/C02CHK/p1710431100"
    },
    {
        "id": "slack_msg_103",
        "channel": "#checkout-arch",
        "author_handle": "@priya",
        "timestamp": "2024-03-14 16:10:22",
        "text": "Approved. Let's formalize RFC-205 and ship PR #89 before the weekend flash sale.",
        "permalink": "https://finflow.slack.com/archives/C02CHK/p1710432622"
    },
    {
        "id": "slack_msg_201",
        "channel": "#sec-audit",
        "author_handle": "@jordan",
        "timestamp": "2024-09-02 10:05:00",
        "text": "Security Finding SEC-88: HMAC-SHA1 webhook signatures are deprecated. All merchant webhooks must migrate to Ed25519 asymmetric signatures.",
        "permalink": "https://finflow.slack.com/archives/C03SEC/p1725271500"
    },
    {
        "id": "slack_msg_301",
        "channel": "#billing-arch",
        "author_handle": "@elena",
        "timestamp": "2024-08-10 11:30:00",
        "text": "Refactored the multi-currency tax matrix in Billing-Core to support dynamic EU VAT overrides. @marcus can you review PR #72?",
        "permalink": "https://finflow.slack.com/archives/C04BIL/p1723289400"
    }
]

DECISIONS = [
    {
        "id": "dec_checkout_timeout_7m",
        "title": "Reduce Checkout Cart Lock Timeout to 7 Minutes",
        "status": "ACCEPTED",
        "timestamp": "2024-03-14 16:15:00",
        "rationale": "Mitigates Redis memory exhaustion during flash sales by releasing abandoned cart inventory in 420 seconds."
    },
    {
        "id": "dec_ed25519_webhooks",
        "title": "Mandate Ed25519 Signatures for Webhook Verification",
        "status": "ACCEPTED",
        "timestamp": "2024-09-05 09:00:00",
        "rationale": "Deprecates HMAC-SHA1 in compliance with InfoSec audit SEC-88 for tamper-proof webhook integrity."
    },
    {
        "id": "dec_billing_tax_matrix",
        "title": "Dynamic EU VAT Calculation Engine in Billing-Core",
        "status": "ACCEPTED",
        "timestamp": "2024-08-11 14:00:00",
        "rationale": "Automated regional tax calculation with fallback caching to avoid latency spikes during payment authorization."
    }
]

JIRA_TICKETS = [
    {
        "id": "jira_inc_104",
        "key": "INC-104",
        "summary": "High Redis Memory Spillover in us-east-1 Checkout Cluster",
        "status": "RESOLVED",
        "priority": "P0 - Blocker",
        "issue_type": "Incident"
    },
    {
        "id": "jira_rfc_205",
        "key": "RFC-205",
        "summary": "Hardening Cart Expiry & 7-Minute Session Timeout Policy",
        "status": "COMPLETED",
        "priority": "P1 - High",
        "issue_type": "RFC"
    },
    {
        "id": "jira_sec_88",
        "key": "SEC-88",
        "summary": "Deprecate HMAC-SHA1 Webhook Signatures in Favor of Ed25519",
        "status": "IN PROGRESS",
        "priority": "P1 - High",
        "issue_type": "Security Finding"
    },
    {
        "id": "jira_bill_440",
        "key": "BILL-440",
        "summary": "Dynamic EU VAT override matrix implementation",
        "status": "CLOSED",
        "priority": "P2 - Medium",
        "issue_type": "Feature"
    }
]

PULL_REQUESTS = [
    {
        "id": "pr_89",
        "number": 89,
        "title": "feat(checkout): enforce 7-minute TTL on cart reservation cache keys",
        "author_handle": "@sarah",
        "merged_at": "2024-03-15 11:20:00",
        "diff_summary": "Changed CART_SESSION_TTL_SECONDS from 900 to 420; updated redis eviction policy to volatile-lru."
    },
    {
        "id": "pr_412",
        "number": 412,
        "title": "feat(security): enforce Ed25519 webhook signature validation; deprecate SHA1",
        "author_handle": "@alex",
        "merged_at": "2024-09-18 16:45:00",
        "diff_summary": "Added ed25519 verification middleware; flagged legacy HMAC-SHA1 headers as obsolete."
    },
    {
        "id": "pr_72",
        "number": 72,
        "title": "refactor(billing): dynamic EU VAT override matrix & currency cache",
        "author_handle": "@elena",
        "merged_at": "2024-08-12 10:15:00",
        "diff_summary": "Implemented VAT lookup pipeline with distributed in-memory cache and local fallback."
    },
    {
        "id": "pr_99",
        "number": 99,
        "title": "perf(billing): batch invoice reconciliation pipeline",
        "author_handle": "@elena",
        "merged_at": "2024-09-25 14:00:00",
        "diff_summary": "Optimized batch transaction lock contention using skip-locked row semantics."
    }
]

DOCUMENTS = [
    {
        "id": "doc_adr_014",
        "title": "ADR 014: Cart Reservation TTL Policy",
        "url": "https://notion.so/finflow/ADR-014-Cart-Reservation-TTL",
        "doc_type": "ADR",
        "last_updated": "2024-03-16",
        "content_summary": "Specifies 420 seconds (7 min) cart lock timeout to protect Redis memory during peak traffic.",
        "is_stale": False
    },
    {
        "id": "doc_stale_webhook_guide",
        "title": "Payment Gateway Webhook Integration Guide",
        "url": "https://confluence.finflow.internal/display/PAY/Webhook+Signatures",
        "doc_type": "Architecture Spec",
        "last_updated": "2023-11-10",
        "content_summary": "Outdated instruction claiming webhook signatures use HMAC-SHA1. CONFLICTS with PR #412 (Ed25519).",
        "is_stale": True
    },
    {
        "id": "doc_billing_runbook",
        "title": "Billing-Core Failure Recovery Runbook",
        "url": "https://notion.so/finflow/Billing-Core-Recovery-Runbook",
        "doc_type": "Runbook",
        "last_updated": "2024-08-15",
        "content_summary": "Emergency restart and tax engine cache warm-up procedures maintained by Elena Rostova.",
        "is_stale": False
    }
]

# Explicit Graph Relationships
RELATIONSHIPS = [
    # People -> Authorship & Reviews
    ("person_sarah", "pr_89", "AUTHORED", {}),
    ("person_elena", "pr_89", "REVIEWED", {"sentiment": "APPROVED"}),
    ("person_alex", "pr_412", "AUTHORED", {}),
    ("person_jordan", "pr_412", "REVIEWED", {"sentiment": "APPROVED"}),
    ("person_elena", "pr_72", "AUTHORED", {}),
    ("person_marcus", "pr_72", "REVIEWED", {"sentiment": "APPROVED"}),
    ("person_elena", "pr_99", "AUTHORED", {}),
    ("person_marcus", "pr_99", "REVIEWED", {"sentiment": "APPROVED"}),
    
    # Slack -> Incidents & Decisions
    ("slack_msg_101", "jira_inc_104", "TRIGGERED", {}),
    ("jira_inc_104", "jira_rfc_205", "SPAWNED", {}),
    ("slack_msg_102", "dec_checkout_timeout_7m", "PROPOSED", {}),
    ("slack_msg_103", "dec_checkout_timeout_7m", "ACCEPTED_BY", {}),
    ("dec_checkout_timeout_7m", "jira_rfc_205", "FORMALIZED_IN", {}),
    ("jira_rfc_205", "pr_89", "IMPLEMENTED_BY", {}),
    ("pr_89", "doc_adr_014", "DOCUMENTED_IN", {}),
    ("pr_89", "service_checkout", "MODIFIED", {}),
    
    # Security Decision & Stale Doc conflict
    ("slack_msg_201", "jira_sec_88", "FLAGGED", {}),
    ("jira_sec_88", "dec_ed25519_webhooks", "RESULTED_IN", {}),
    ("dec_ed25519_webhooks", "pr_412", "IMPLEMENTED_BY", {}),
    ("pr_412", "service_payment_gw", "MODIFIED", {}),
    ("pr_412", "doc_stale_webhook_guide", "SUPERSEDES", {"reason": "Replaces HMAC-SHA1 with Ed25519"}),
    
    # Billing Architecture & Elena ownership
    ("slack_msg_301", "dec_billing_tax_matrix", "DISCUSSED", {}),
    ("dec_billing_tax_matrix", "jira_bill_440", "FORMALIZED_IN", {}),
    ("jira_bill_440", "pr_72", "IMPLEMENTED_BY", {}),
    ("pr_72", "service_billing_core", "MODIFIED", {}),
    ("pr_99", "service_billing_core", "MODIFIED", {}),
    ("person_elena", "service_billing_core", "SOLE_MAINTAINER", {"ownership_pct": 0.92}),
    ("person_elena", "doc_billing_runbook", "AUTHORED", {}),
    
    # Service Dependency Topology
    ("service_checkout", "service_payment_gw", "DEPENDS_ON", {"critical": True, "protocol": "gRPC"}),
    ("service_checkout", "service_auth", "DEPENDS_ON", {"critical": True, "protocol": "REST"}),
    ("service_payment_gw", "service_billing_core", "DEPENDS_ON", {"critical": True, "protocol": "gRPC"}),
    ("service_billing_core", "service_ledger", "DEPENDS_ON", {"critical": True, "protocol": "Kafka"}),
    ("service_checkout", "service_notification", "DEPENDS_ON", {"critical": False, "protocol": "Async-Event"}),
    
    # Enterprise Customer SLA Attachments
    ("service_checkout", "cust_uber", "SERVES", {"sla": "99.99%", "contract_tier": "Platinum"}),
    ("service_billing_core", "cust_uber", "SERVES", {"sla": "99.99%", "contract_tier": "Platinum"}),
    ("service_payment_gw", "cust_shopify", "SERVES", {"sla": "99.99%", "contract_tier": "Platinum"}),
    ("service_payment_gw", "cust_deliveroo", "SERVES", {"sla": "99.9%", "contract_tier": "Gold"})
]

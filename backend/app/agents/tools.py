import logging
from typing import Dict, Any, List
from app.services.archaeology import archaeology_service
from app.services.blast_radius import blast_radius_service
from app.services.sme_engine import sme_engine
from app.services.drift_detector import drift_detector
from app.services.action_runner import action_orchestrator

logger = logging.getLogger(__name__)

# Standard Tool Definitions for Agent & MCP

TOOLS_REGISTRY = [
    {
        "name": "trace_decision_lineage",
        "description": "Trace the multi-hop causal lineage of an architectural decision, timeout, or config from code back to PRs, Jira tickets, and Slack discussions.",
        "parameters": {
            "type": "object",
            "properties": {
                "target_identifier": {
                    "type": "string",
                    "description": "The service, config, or decision to trace (e.g., 'checkout timeout', 'webhooks', 'tax matrix')."
                }
            },
            "required": ["target_identifier"]
        }
    },
    {
        "name": "simulate_blast_radius",
        "description": "Simulate the cross-domain blast radius of an engineer departure, service outage, or breaking change across code, customer SLAs, and teams.",
        "parameters": {
            "type": "object",
            "properties": {
                "person_or_service": {
                    "type": "string",
                    "description": "The person or service to simulate (e.g., 'elena', 'sarah', 'billing-core')."
                }
            },
            "required": ["person_or_service"]
        }
    },
    {
        "name": "find_sme_and_bus_factor",
        "description": "Calculate the true Subject Matter Expert (SME), identify Key-Person Risk (Bus Factor of 1), and compute the mathematically closest fallback successor.",
        "parameters": {
            "type": "object",
            "properties": {
                "subject": {
                    "type": "string",
                    "description": "The subject or subsystem (e.g., 'billing', 'checkout', 'webhooks')."
                }
            },
            "required": ["subject"]
        }
    },
    {
        "name": "detect_stale_docs",
        "description": "Detect documentation drift where merged PRs or recent architecture decisions contradict Confluence/Notion pages.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "generate_adr_artifact",
        "description": "Generate a formal Markdown Architecture Decision Record (ADR) ready to commit into the documentation repository.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": "The decision topic (e.g., 'checkout_timeout', 'ed25519_webhooks')."
                }
            },
            "required": ["topic"]
        }
    },
    {
        "name": "create_handoff_epic",
        "description": "Generate a 4-step Jira Knowledge Transfer Epic and task checklist for departing engineers and their designated successor.",
        "parameters": {
            "type": "object",
            "properties": {
                "departing_person": {"type": "string"},
                "successor": {"type": "string"}
            },
            "required": ["departing_person", "successor"]
        }
    }
]

def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a registered tool and return structured results."""
    logger.info(f"Executing tool: {tool_name} with args: {arguments}")
    
    if tool_name == "trace_decision_lineage":
        res = archaeology_service.trace_lineage(arguments.get("target_identifier", "checkout"))
        return res.model_dump()
        
    elif tool_name == "simulate_blast_radius":
        res = blast_radius_service.simulate_departure(arguments.get("person_or_service", "elena"))
        return res.model_dump()
        
    elif tool_name == "find_sme_and_bus_factor":
        res = sme_engine.find_sme(arguments.get("subject", "billing"))
        return res.model_dump()
        
    elif tool_name == "detect_stale_docs":
        reports = drift_detector.detect_drift()
        graph = drift_detector.get_drift_graph()
        return {
            "reports": [r.model_dump() for r in reports],
            "graph": graph.model_dump()
        }
        
    elif tool_name == "generate_adr_artifact":
        res = action_orchestrator.generate_adr(arguments.get("topic", "checkout_timeout"))
        return res.model_dump()
        
    elif tool_name == "create_handoff_epic":
        res = action_orchestrator.create_handoff_epic(
            arguments.get("departing_person", "Elena Rostova"),
            arguments.get("successor", "Marcus Vance")
        )
        return res.model_dump()
        
    else:
        raise ValueError(f"Unknown tool: {tool_name}")

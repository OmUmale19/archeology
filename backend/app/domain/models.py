from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# --- Graph Entities ---

class Person(BaseModel):
    id: str
    name: str
    handle: str
    role: str
    department: str
    avatar: Optional[str] = None

class Service(BaseModel):
    id: str
    name: str
    tier: str  # "Tier-1", "Tier-2", "Tier-3"
    repo_url: str
    description: str

class SlackMessage(BaseModel):
    id: str
    channel: str
    author_handle: str
    timestamp: str
    text: str
    permalink: str

class JiraTicket(BaseModel):
    id: str
    key: str
    summary: str
    status: str
    priority: str
    issue_type: str

class PullRequest(BaseModel):
    id: str
    number: int
    title: str
    author_handle: str
    merged_at: str
    diff_summary: str

class Document(BaseModel):
    id: str
    title: str
    url: str
    doc_type: str  # "ADR", "Architecture Spec", "Runbook"
    last_updated: str
    content_summary: str
    is_stale: bool = False

class Decision(BaseModel):
    id: str
    title: str
    status: str  # "PROPOSED", "ACCEPTED", "SUPERSEDED", "DEPRECATED"
    timestamp: str
    rationale: str

class CustomerTier(BaseModel):
    id: str
    name: str
    sla_level: str  # "99.99%", "99.9%"
    tier_name: str  # "Enterprise Platinum", "Gold", "Standard"

# --- Graph Visualization Payload (Cytoscape / Canvas) ---

class GraphNode(BaseModel):
    id: str
    label: str  # "Person", "Service", "Decision", etc.
    title: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    highlighted: bool = False
    node_size: Optional[int] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str  # "AUTHORED", "IMPLEMENTED_BY", "DEPENDS_ON", etc.
    properties: Dict[str, Any] = Field(default_factory=dict)
    highlighted: bool = False

class GraphPayload(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# --- Query & Agent Outputs ---

class CausalStep(BaseModel):
    source_type: str
    source_label: str
    relationship: str
    target_type: str
    target_label: str
    evidence_text: Optional[str] = None

class LineageResponse(BaseModel):
    query_target: str
    root_cause_summary: str
    causal_chain: List[CausalStep]
    graph: GraphPayload
    sources: List[Dict[str, str]]

class BlastRadiusResponse(BaseModel):
    target_entity: str
    entity_type: str
    risk_level: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    impacted_services: List[str]
    impacted_customers: List[str]
    key_person_dependencies: List[str]
    graph: GraphPayload
    mitigation_steps: List[str]
    node_id: Optional[str] = None
    arr_at_risk_millions: Optional[float] = 0.0
    cascade_stages: Optional[Dict[str, List[str]]] = None
    recommended_successor: Optional[str] = None

class SimulationRequest(BaseModel):
    node_id: str


class SMERecord(BaseModel):
    person_name: str
    handle: str
    score: float
    reason: str
    is_single_point_of_failure: bool = False

class SMEResponse(BaseModel):
    subject: str
    primary_sme: SMERecord
    fallback_smes: List[SMERecord]
    bus_factor_alert: Optional[str] = None
    graph: GraphPayload

class DriftReport(BaseModel):
    doc_id: str
    doc_title: str
    contradicting_pr: str
    superseded_by_decision: str
    staleness_reason: str
    suggested_action: str

# --- Chat & Actions ---

class ChatRequest(BaseModel):
    message: str
    context_filters: Optional[Dict[str, Any]] = None

class ActionTriggerRequest(BaseModel):
    action_type: str  # "GENERATE_ADR", "CREATE_HANDOFF_EPIC", "PING_FALLBACK_SME"
    parameters: Dict[str, Any]

class ActionResponse(BaseModel):
    action_type: str
    status: str
    title: str
    artifact_content: str
    ticket_id: Optional[str] = None
    link: Optional[str] = None

# --- Custom Entity Ingestion ---

class CreateNodeConnection(BaseModel):
    target_node_id: str
    relationship_type: str = "DEPENDS_ON"
    direction: str = "OUTGOING"  # "OUTGOING" (new -> target) or "INCOMING" (target -> new)

class CreateNodeRequest(BaseModel):
    id: Optional[str] = None
    label: str  # "Service", "Person", "JiraTicket", "Decision", "Document"
    title: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    connection: Optional[CreateNodeConnection] = None


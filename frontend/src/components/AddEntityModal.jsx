import React, { useState } from "react";
import { X, Plus, Server, User, AlertCircle, FileText, Layers, Link2, Sparkles, ArrowRight, Briefcase, Users, Loader2 } from "lucide-react";

const ENTITY_TYPES = [
  { label: "Project", icon: Briefcase, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", desc: "Product / Strategic Initiative" },
  { label: "Team", icon: Users, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", desc: "Delivery Squad / Engineering Group" },
  { label: "Person", icon: User, color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", desc: "Engineer / Architect / Lead" },
  { label: "Service", icon: Server, color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", desc: "Microservice / API / Worker" },
  { label: "Decision", icon: FileText, color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", desc: "ADR / Architecture Decision" },
  { label: "JiraTicket", icon: AlertCircle, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", desc: "Incident / RFC / Issue" },
  { label: "Document", icon: Layers, color: "#14b8a6", bg: "rgba(20, 184, 166, 0.15)", desc: "Spec / Runbook / Doc" },
];

const COMMON_RELATIONSHIPS = [
  "DELIVERS",
  "MEMBER_OF",
  "LEADS",
  "CONTRIBUTES_TO",
  "POWERED_BY",
  "MAINTAINS",
  "DEPENDS_ON",
  "AUTHORED_BY",
  "MAINTAINED_BY",
  "RESOLVES",
  "DOCUMENTED_IN",
  "GOVERNED_BY",
  "TRACKS",
  "RELATES_TO"
];

export default function AddEntityModal({ isOpen, onClose, existingNodes, onSubmit }) {
  if (!isOpen) return null;

  const hasExistingNodes = existingNodes && existingNodes.length > 0;
  const [selectedType, setSelectedType] = useState("Project");
  const [title, setTitle] = useState("");
  const [properties, setProperties] = useState({
    tier: "Tier-1",
    description: "",
    repo_url: "",
    role: "Senior Software Engineer",
    department: "Core Platform",
    handle: "",
    project_priority: "P0 - Critical",
    budget: "$15,000,000 ARR",
    profit_margin: "+42% Margin",
    lead: "",
    issue_type: "Incident",
    priority: "P1 - High",
    status: "Active",
    summary: "",
    rationale: "",
    doc_type: "ADR",
    content_summary: "",
  });

  const [linkToExisting, setLinkToExisting] = useState(hasExistingNodes);
  const [targetNodeId, setTargetNodeId] = useState(hasExistingNodes ? existingNodes[0].id : "");
  const [relationshipType, setRelationshipType] = useState(hasExistingNodes ? "DEPENDS_ON" : "RELATES_TO");
  const [direction, setDirection] = useState("OUTGOING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePropChange = (field, val) => {
    setProperties((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please enter a name or title for the entity.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // Build properties payload based on selected type
      let payloadProps = {};
      if (selectedType === "Project") {
        payloadProps = {
          name: title,
          priority: properties.project_priority,
          status: properties.status,
          budget: properties.budget,
          profit_margin: properties.profit_margin,
          description: properties.description || `Strategic initiative: ${title}`,
          node_size: 92,
        };
      } else if (selectedType === "Team") {
        payloadProps = {
          name: title,
          lead: properties.lead || "@lead",
          department: properties.department,
          health: "EXCELLENT",
          node_size: 65,
        };
      } else if (selectedType === "Service") {
        payloadProps = {
          name: title,
          tier: properties.tier,
          description: properties.description || `Autonomous service component: ${title}`,
          repo_url: properties.repo_url || `github.com/finflow/${title.toLowerCase().replace(/\s+/g, "-")}`,
        };
      } else if (selectedType === "Person") {
        payloadProps = {
          name: title,
          role: properties.role,
          department: properties.department,
          handle: properties.handle ? (properties.handle.startsWith("@") ? properties.handle : `@${properties.handle}`) : `@${title.toLowerCase().replace(/\s+/g, "")}`,
        };
      } else if (selectedType === "JiraTicket") {
        payloadProps = {
          key: title.toUpperCase().includes("-") ? title.toUpperCase() : `INC-${Math.floor(100 + Math.random() * 900)}`,
          summary: properties.summary || title,
          issue_type: properties.issue_type,
          priority: properties.priority,
          status: properties.status,
        };
      } else if (selectedType === "Decision") {
        payloadProps = {
          title: title,
          status: properties.status || "ACCEPTED",
          rationale: properties.rationale || `Formalized architectural decision for ${title}.`,
          timestamp: new Date().toISOString().split("T")[0],
        };
      } else if (selectedType === "Document") {
        payloadProps = {
          title: title,
          doc_type: properties.doc_type,
          content_summary: properties.content_summary || title,
          last_updated: new Date().toISOString().split("T")[0],
        };
      }

      const connection = linkToExisting && targetNodeId ? {
        target_node_id: targetNodeId,
        relationship_type: relationshipType,
        direction: direction,
      } : null;

      await onSubmit({
        label: selectedType,
        title: title.trim(),
        properties: payloadProps,
        connection: connection,
      });

      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create entity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-entity-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-badge" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", borderColor: "rgba(99, 102, 241, 0.3)" }}>
                <Plus size={12} style={{ display: "inline", marginRight: "4px" }} />
                Ingest Context
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                FalkorDB Topological Write
              </span>
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "6px", color: "#ffffff" }}>
              Add New Knowledge Entity
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div className="modal-body" style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "60vh", display: "flex", flexDirection: "column", gap: "18px" }}>
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
                {errorMsg}
              </div>
            )}

            {/* Entity Type Selector */}
            <div>
              <label className="input-field-label">1. Select Entity Type</label>
              <div className="entity-type-grid">
                {ENTITY_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.label;
                  return (
                    <button
                      type="button"
                      key={t.label}
                      onClick={() => setSelectedType(t.label)}
                      className={`entity-type-card ${isSelected ? "selected" : ""}`}
                      style={{
                        borderColor: isSelected ? t.color : "rgba(255, 255, 255, 0.08)",
                        background: isSelected ? t.bg : "rgba(255, 255, 255, 0.02)",
                      }}
                    >
                      <Icon size={16} style={{ color: t.color }} />
                      <span className="type-title" style={{ color: isSelected ? "#ffffff" : "#94a3b8" }}>{t.label}</span>
                      <span className="type-desc">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entity Title */}
            <div>
              <label className="input-field-label">2. Entity Name / Title *</label>
              <input
                type="text"
                className="modal-text-input"
                placeholder={
                  selectedType === "Project" ? "e.g. Apex Global Checkout, Enterprise Payment Mesh" :
                  selectedType === "Team" ? "e.g. Team Alpha (Checkout Core), Platform SRE Squad" :
                  selectedType === "Service" ? "e.g. Fraud-Guard-Service, Notification-Worker" :
                  selectedType === "Person" ? "e.g. Sarah Chen, Marcus Vance" :
                  selectedType === "JiraTicket" ? "e.g. INC-502 or Auth Token Leakage Incident" :
                  selectedType === "Decision" ? "e.g. ADR-016: Migrate to Kafka Event Stream" :
                  "e.g. Payment SLA Runbook v2"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Dynamic Specific Fields */}
            {selectedType === "Project" && (
              <div className="form-subgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label className="input-field-label">Project Priority</label>
                  <select
                    className="modal-select-input"
                    value={properties.project_priority}
                    onChange={(e) => handlePropChange("project_priority", e.target.value)}
                  >
                    <option value="P0 - Critical">P0 - Critical (Mission Critical)</option>
                    <option value="P1 - High">P1 - High Priority</option>
                    <option value="P2 - Medium">P2 - Medium</option>
                    <option value="P3 - Low">P3 - Low</option>
                  </select>
                </div>
                <div>
                  <label className="input-field-label">Project Status</label>
                  <select
                    className="modal-select-input"
                    value={properties.status}
                    onChange={(e) => handlePropChange("status", e.target.value)}
                  >
                    <option value="Active">Active / In Production</option>
                    <option value="In Progress">In Progress (Active Sprint)</option>
                    <option value="In Planning">In Planning / RFC</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="input-field-label">Annual Revenue / Budget</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. $18,000,000 ARR"
                    value={properties.budget}
                    onChange={(e) => handlePropChange("budget", e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-field-label">Profit Margin / ROI</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. +42% Net Margin"
                    value={properties.profit_margin}
                    onChange={(e) => handlePropChange("profit_margin", e.target.value)}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="input-field-label">Strategic Deliverable Description</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. Core enterprise payment checkout engine handling SLA commitments"
                    value={properties.description}
                    onChange={(e) => handlePropChange("description", e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedType === "Team" && (
              <div className="form-subgrid">
                <div>
                  <label className="input-field-label">Team Lead (@handle)</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. @sarah"
                    value={properties.lead}
                    onChange={(e) => handlePropChange("lead", e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-field-label">Department / Squad Focus</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. Checkout Engineering"
                    value={properties.department}
                    onChange={(e) => handlePropChange("department", e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedType === "Service" && (
              <div className="form-subgrid">
                <div>
                  <label className="input-field-label">Tier</label>
                  <select
                    className="modal-select-input"
                    value={properties.tier}
                    onChange={(e) => handlePropChange("tier", e.target.value)}
                  >
                    <option value="Tier-1">Tier-1 (Mission Critical)</option>
                    <option value="Tier-2">Tier-2 (Business Essential)</option>
                    <option value="Tier-3">Tier-3 (Internal / Batch)</option>
                  </select>
                </div>
                <div>
                  <label className="input-field-label">Service Description</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="Short description of service responsibilities"
                    value={properties.description}
                    onChange={(e) => handlePropChange("description", e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedType === "Person" && (
              <div className="form-subgrid">
                <div>
                  <label className="input-field-label">Engineering Role</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. Staff Security Architect"
                    value={properties.role}
                    onChange={(e) => handlePropChange("role", e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-field-label">Department / Team</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="e.g. Platform Infrastructure"
                    value={properties.department}
                    onChange={(e) => handlePropChange("department", e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedType === "JiraTicket" && (
              <div className="form-subgrid">
                <div>
                  <label className="input-field-label">Severity / Priority</label>
                  <select
                    className="modal-select-input"
                    value={properties.priority}
                    onChange={(e) => handlePropChange("priority", e.target.value)}
                  >
                    <option value="P0 - Blocker">P0 - Blocker (Critical Outage)</option>
                    <option value="P1 - High">P1 - High Priority</option>
                    <option value="P2 - Medium">P2 - Medium</option>
                    <option value="P3 - Low">P3 - Low</option>
                  </select>
                </div>
                <div>
                  <label className="input-field-label">Ticket Summary / Root Cause</label>
                  <input
                    type="text"
                    className="modal-text-input"
                    placeholder="Summary of incident or requirement"
                    value={properties.summary}
                    onChange={(e) => handlePropChange("summary", e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedType === "Decision" && (
              <div>
                <label className="input-field-label">Architectural Rationale / Tradeoff</label>
                <textarea
                  className="modal-textarea-input"
                  rows={2}
                  placeholder="Explain why this decision was made and what was accepted/rejected..."
                  value={properties.rationale}
                  onChange={(e) => handlePropChange("rationale", e.target.value)}
                />
              </div>
            )}

            {/* Relationship / Graph Connection Section */}
            <div className="graph-connection-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Link2 size={14} className="text-cyan" />
                  <span className="input-field-label" style={{ margin: 0 }}>3. Connect into Company Graph</span>
                </div>
                <label className="toggle-label" style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.78rem", color: "#94a3b8" }}>
                  <input
                    type="checkbox"
                    checked={linkToExisting}
                    onChange={(e) => setLinkToExisting(e.target.checked)}
                  />
                  <span>Create Relationship Edge</span>
                </label>
              </div>

              {linkToExisting && hasExistingNodes && (
                <div className="connection-controls">
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "10px" }}>
                    <div>
                      <span className="sub-label">Target Graph Node</span>
                      <select
                        className="modal-select-input"
                        value={targetNodeId}
                        onChange={(e) => setTargetNodeId(e.target.value)}
                      >
                        {existingNodes?.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.title} ({n.label})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="sub-label">Relationship</span>
                      <select
                        className="modal-select-input"
                        value={relationshipType}
                        onChange={(e) => setRelationshipType(e.target.value)}
                      >
                        {COMMON_RELATIONSHIPS.map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="sub-label">Edge Direction</span>
                      <select
                        className="modal-select-input"
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                      >
                        <option value="OUTGOING">New ➔ Target</option>
                        <option value="INCOMING">Target ➔ New</option>
                      </select>
                    </div>
                  </div>

                  <div className="connection-preview-pill">
                    <span style={{ color: "#38bdf8" }}>{title || `[${selectedType}]`}</span>
                    <ArrowRight size={12} className="text-cyan" style={{ transform: direction === "INCOMING" ? "rotate(180deg)" : "none" }} />
                    <span style={{ color: "#a855f7", fontFamily: "var(--font-mono)", fontSize: "0.74rem" }}>[:{relationshipType}]</span>
                    <ArrowRight size={12} className="text-cyan" style={{ transform: direction === "INCOMING" ? "rotate(180deg)" : "none" }} />
                    <span style={{ color: "#f59e0b" }}>
                      {existingNodes?.find((n) => n.id === targetNodeId)?.title || "Target Node"}
                    </span>
                  </div>
                </div>
              )}

              {linkToExisting && !hasExistingNodes && (
                <div style={{ padding: "12px 14px", background: "rgba(56, 189, 248, 0.08)", border: "1px dashed rgba(56, 189, 248, 0.3)", borderRadius: "8px", fontSize: "0.82rem", color: "#7dd3fc" }}>
                  💡 <strong>Initial Node in Knowledge Graph:</strong> No other nodes exist yet. This entity will be created as the initial root entity, and you can connect other nodes to it!
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !title.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "190px",
                justifyContent: "center",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.9 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span style={{ fontWeight: 600, color: "#ffffff" }}>Writing to FalkorDB...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Ingest Into Knowledge Graph</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

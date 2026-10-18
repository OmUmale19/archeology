import React, { useState } from "react";
import { X, Play, Code, FileText, Plus, Trash2, Sparkles, CheckCircle2, AlertCircle, Briefcase, Users, Server, Shield, Loader2 } from "lucide-react";

const SAMPLE_PROJECT_TEMPLATE = {
  project_name: "Apex Global Checkout",
  priority: "P0 - Critical",
  status: "Active",
  budget: "$24,000,000 ARR",
  profit_margin: "+44% Net Margin",
  description: "Global enterprise checkout infrastructure handling multi-region checkout transactions with 99.99% contractual uptime.",
  team_name: "Team Apex (Checkout Core)",
  team_members: [
    {
      name: "Sarah Chen",
      handle: "@sarah",
      role: "Staff Engineering Lead",
      department: "Checkout Engineering",
      is_lead: true
    },
    {
      name: "Marcus Vance",
      handle: "@marcus",
      role: "Principal Systems Architect",
      department: "Platform Architecture",
      is_lead: false
    },
    {
      name: "Elena Rostova",
      handle: "@elena",
      role: "Senior Distributed Systems Engineer",
      department: "Ledger & Core Services",
      is_lead: false
    },
    {
      name: "David Kim",
      handle: "@david",
      role: "Site Reliability Lead",
      department: "Infrastructure & Cloud Ops",
      is_lead: false
    }
  ],
  services: [
    {
      name: "Payment-Gateway",
      tier: "Tier-1",
      description: "Synchronous gateway authorizing customer card transactions.",
      repo_url: "github.com/company/payment-gateway"
    },
    {
      name: "Billing-Core",
      tier: "Tier-1",
      description: "Batch ledger reconciliation and tax compliance processor.",
      repo_url: "github.com/company/billing-core"
    },
    {
      name: "Fraud-Shield",
      tier: "Tier-2",
      description: "Real-time AI behavioral transaction scoring service.",
      repo_url: "github.com/company/fraud-shield"
    }
  ],
  decisions: [
    {
      title: "ADR-014: Set Checkout Session Lock TTL to 7 Minutes",
      status: "ACCEPTED",
      rationale: "Prevents Redis cluster saturation in peak seasons while protecting 94% of buyer sessions."
    },
    {
      title: "ADR-018: Implement Ed25519 Partner Webhook Verification",
      status: "ACCEPTED",
      rationale: "Replaced legacy HMAC-SHA1 to prevent timing side-channel attacks."
    }
  ],
  tickets: [
    {
      key: "INC-104",
      summary: "Redis memory saturation during flash sale spike",
      priority: "P0 - Blocker",
      status: "Resolved",
      assignee_handle: "@david"
    },
    {
      key: "RFC-205",
      summary: "Implement 7-minute cart lock policy",
      priority: "P1 - High",
      status: "Implemented",
      assignee_handle: "@sarah"
    }
  ]
};

export default function ProjectScriptModal({ isOpen, onClose, onIngest }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState("form"); // "form" | "json"
  const [projectData, setProjectData] = useState(SAMPLE_PROJECT_TEMPLATE);
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_PROJECT_TEMPLATE, null, 2));
  const [jsonError, setJsonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFieldChange = (field, val) => {
    const updated = { ...projectData, [field]: val };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleMemberChange = (idx, field, val) => {
    const updatedMembers = [...projectData.team_members];
    updatedMembers[idx] = { ...updatedMembers[idx], [field]: val };
    const updated = { ...projectData, team_members: updatedMembers };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const addMember = () => {
    const newMember = {
      name: "New Engineer",
      handle: `@eng${projectData.team_members.length + 1}`,
      role: "Software Engineer",
      department: "Platform Engineering",
      is_lead: false
    };
    const updated = { ...projectData, team_members: [...projectData.team_members, newMember] };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const removeMember = (idx) => {
    const updatedMembers = projectData.team_members.filter((_, i) => i !== idx);
    const updated = { ...projectData, team_members: updatedMembers };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleServiceChange = (idx, field, val) => {
    const updatedServices = [...projectData.services];
    updatedServices[idx] = { ...updatedServices[idx], [field]: val };
    const updated = { ...projectData, services: updatedServices };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const addService = () => {
    const newService = {
      name: `Service-${projectData.services.length + 1}`,
      tier: "Tier-2",
      description: "Autonomous microservice component",
      repo_url: ""
    };
    const updated = { ...projectData, services: [...projectData.services, newService] };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const removeService = (idx) => {
    const updatedServices = projectData.services.filter((_, i) => i !== idx);
    const updated = { ...projectData, services: updatedServices };
    setProjectData(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setProjectData(parsed);
      setJsonError("");
    } catch (err) {
      setJsonError("Invalid JSON format: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    let payloadToSend = projectData;
    if (activeTab === "json") {
      try {
        payloadToSend = JSON.parse(jsonText);
      } catch (err) {
        setErrorMsg("Please fix JSON syntax errors before running ingestion.");
        return;
      }
    }

    if (!payloadToSend.project_name || !payloadToSend.project_name.trim()) {
      setErrorMsg("Project name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onIngest(payloadToSend);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to ingest project script");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 840, width: "95%" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-badge" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee", borderColor: "rgba(6, 182, 212, 0.3)" }}>
                <Code size={13} style={{ display: "inline", marginRight: "4px" }} />
                Batch Ingestion Script
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Project • Priority • Team Members • Architecture
              </span>
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "6px", color: "#ffffff" }}>
              Ingest Complete Project Ecosystem
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: "10px", padding: "12px 24px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            type="button"
            className={`glass-pill ${activeTab === "form" ? "active" : ""}`}
            onClick={() => setActiveTab("form")}
            style={{ borderRadius: "8px 8px 0 0", padding: "8px 16px" }}
          >
            <FileText size={14} className="pill-icon text-cyan" />
            <span>Interactive Project Form</span>
          </button>
          <button
            type="button"
            className={`glass-pill ${activeTab === "json" ? "active" : ""}`}
            onClick={() => setActiveTab("json")}
            style={{ borderRadius: "8px 8px 0 0", padding: "8px 16px" }}
          >
            <Code size={14} className="pill-icon text-pink" />
            <span>Raw Script / JSON Editor</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="modal-body" style={{ padding: "20px 24px", maxHeight: "62vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px" }}>
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
                {errorMsg}
              </div>
            )}

            {activeTab === "form" ? (
              <>
                {/* Project Details Section */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.07)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Briefcase size={16} className="text-cyan" />
                    <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ffffff" }}>1. Strategic Project Identity</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label className="input-field-label">Project Name *</label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={projectData.project_name}
                        onChange={(e) => handleFieldChange("project_name", e.target.value)}
                        placeholder="e.g. Apex Global Checkout"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-field-label">Priority</label>
                      <select
                        className="modal-select-input"
                        value={projectData.priority}
                        onChange={(e) => handleFieldChange("priority", e.target.value)}
                      >
                        <option value="P0 - Critical">P0 - Critical</option>
                        <option value="P1 - High">P1 - High</option>
                        <option value="P2 - Medium">P2 - Medium</option>
                        <option value="P3 - Low">P3 - Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-field-label">Status</label>
                      <select
                        className="modal-select-input"
                        value={projectData.status}
                        onChange={(e) => handleFieldChange("status", e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Planning">In Planning</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="input-field-label">Revenue / Budget ARR</label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={projectData.budget}
                        onChange={(e) => handleFieldChange("budget", e.target.value)}
                        placeholder="$24,000,000 ARR"
                      />
                    </div>
                    <div>
                      <label className="input-field-label">Profit Margin</label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={projectData.profit_margin}
                        onChange={(e) => handleFieldChange("profit_margin", e.target.value)}
                        placeholder="+44% Net Margin"
                      />
                    </div>
                    <div>
                      <label className="input-field-label">Assigned Delivery Team</label>
                      <input
                        type="text"
                        className="modal-text-input"
                        value={projectData.team_name}
                        onChange={(e) => handleFieldChange("team_name", e.target.value)}
                        placeholder="Team Apex"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Members Section */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.07)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={16} className="text-cyan" />
                      <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ffffff" }}>
                        2. Team Members & Roles ({projectData.team_members.length})
                      </span>
                    </div>
                    <button type="button" onClick={addMember} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                      <Plus size={13} /> Add Member
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {projectData.team_members.map((m, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.2fr 0.9fr auto auto", gap: "8px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={m.name}
                          onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                          placeholder="Full Name"
                          required
                        />
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={m.handle}
                          onChange={(e) => handleMemberChange(idx, "handle", e.target.value)}
                          placeholder="@handle"
                        />
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={m.role}
                          onChange={(e) => handleMemberChange(idx, "role", e.target.value)}
                          placeholder="Engineering Role"
                        />
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={m.department}
                          onChange={(e) => handleMemberChange(idx, "department", e.target.value)}
                          placeholder="Department"
                        />
                        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.74rem", color: m.is_lead ? "#22d3ee" : "#94a3b8", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={m.is_lead}
                            onChange={(e) => handleMemberChange(idx, "is_lead", e.target.checked)}
                          />
                          Lead
                        </label>
                        <button type="button" onClick={() => removeMember(idx)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Microservices Section */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.07)", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Server size={16} className="text-cyan" />
                      <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ffffff" }}>
                        3. Connected Services ({projectData.services.length})
                      </span>
                    </div>
                    <button type="button" onClick={addService} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                      <Plus size={13} /> Add Service
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {projectData.services.map((s, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 2fr auto", gap: "8px", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={s.name}
                          onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                          placeholder="Service Name"
                          required
                        />
                        <select
                          className="modal-select-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={s.tier}
                          onChange={(e) => handleServiceChange(idx, "tier", e.target.value)}
                        >
                          <option value="Tier-1">Tier-1 (Critical)</option>
                          <option value="Tier-2">Tier-2 (Essential)</option>
                          <option value="Tier-3">Tier-3 (Batch)</option>
                        </select>
                        <input
                          type="text"
                          className="modal-text-input"
                          style={{ padding: "6px 10px", fontSize: "0.82rem" }}
                          value={s.description}
                          onChange={(e) => handleServiceChange(idx, "description", e.target.value)}
                          placeholder="Component responsibility description"
                        />
                        <button type="button" onClick={() => removeService(idx)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Raw JSON Editor View */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="input-field-label" style={{ margin: 0 }}>Editable Project Script Payload (JSON)</label>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Compatible with <code>scripts/sample_project.json</code>
                  </span>
                </div>
                {jsonError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#fca5a5", borderRadius: "6px", padding: "6px 10px", fontSize: "0.78rem", marginBottom: "8px" }}>
                    {jsonError}
                  </div>
                )}
                <textarea
                  className="modal-textarea-input"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", minHeight: "360px", lineHeight: "1.45" }}
                  value={jsonText}
                  onChange={handleJsonChange}
                  rows={18}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setProjectData(SAMPLE_PROJECT_TEMPLATE);
                setJsonText(JSON.stringify(SAMPLE_PROJECT_TEMPLATE, null, 2));
              }}
              style={{ fontSize: "0.8rem" }}
            >
              🔄 Reset to Template
            </button>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !!jsonError}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "190px",
                  justifyContent: "center",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.9 : 1,
                  boxShadow: isSubmitting ? "0 0 16px rgba(99, 102, 241, 0.6)" : "0 4px 14px rgba(99, 102, 241, 0.35)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>Ingesting Graph...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>Run Ingestion Script</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

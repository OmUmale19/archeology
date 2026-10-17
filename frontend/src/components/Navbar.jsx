import React from "react";
import { Activity, Database, Sparkles, RefreshCw, Layers, ShieldCheck, Plus, Briefcase, Code, Trash2 } from "lucide-react";
import ClerkAuthBar from "./ClerkAuthBar";

export default function Navbar({
  onSelectScenario,
  activeScenario,
  health,
  onClearData,
  isResetting,
  onOpenAddEntity,
  onOpenScriptModal,
  isClerkConfigured,
  onTenantChange,
  currentTenant,
}) {
  return (
    <header className="app-header">
      {/* Brand Identity */}
      <div className="brand-group">
        <div className="brand-logo-glow">
          <Database size={18} className="brand-logo-icon" />
        </div>
        <div className="brand-meta">
          <div className="brand-title-row">
            <span className="brand-title-text">Archaeologist</span>
            <span className="brand-pill">Company Brain</span>
          </div>
          <span className="brand-byline">Powered by FalkorDB</span>
        </div>
      </div>

      {/* Glassmorphic Action & Scenario Bar */}
      <nav className="scenario-nav">
        <button
          onClick={onOpenAddEntity}
          className="add-entity-nav-btn"
          title="Add single entity into graph"
        >
          <Plus size={14} />
          <span>+ Add Entity</span>
        </button>

        <button
          onClick={onOpenScriptModal}
          className="glass-pill"
          title="Batch ingest complete project ecosystem via script"
          style={{ borderColor: "rgba(6, 182, 212, 0.4)", background: "rgba(6, 182, 212, 0.12)", color: "#22d3ee" }}
        >
          <Code size={13} className="pill-icon text-cyan" />
          <span>📜 Ingest Project Script</span>
        </button>

        <button
          className={`glass-pill ${activeScenario === "org" ? "active" : ""}`}
          onClick={() => onSelectScenario("org", "Analyze active projects, priorities, and team productivity across the company")}
        >
          <Briefcase size={13} className="pill-icon text-cyan" />
          <span>Project & Org Analysis</span>
        </button>

        <button
          className={`glass-pill ${activeScenario === "blast" ? "active" : ""}`}
          onClick={() => onSelectScenario("blast", "Simulate departure blast-radius and key-person bus-factor risks")}
        >
          <Activity size={13} className="pill-icon text-pink" />
          <span>Blast Radius Simulation</span>
        </button>
      </nav>

      {/* Status & Control Panel */}
      <div className="header-actions">
        <ClerkAuthBar
          isClerkConfigured={isClerkConfigured}
          onTenantChange={onTenantChange}
          currentTenant={currentTenant}
        />

        <div className="status-capsule">
          <span className="status-ping"></span>
          <span className="status-label">
            {health?.falkordb_connected ? "FalkorDB Live" : "FalkorDB Graph Engine"}
          </span>
          <span className="status-separator">·</span>
          <span className="status-count">
            {health?.total_nodes || 0} nodes
          </span>
        </div>

        <button
          onClick={onClearData}
          disabled={isResetting}
          title="Wipe & Clear All Graph Data for Active Workspace"
          className="reset-icon-btn"
          style={{ color: "#f87171" }}
        >
          <Trash2 size={14} className={isResetting ? "spin-icon" : ""} />
        </button>
      </div>
    </header>
  );
}

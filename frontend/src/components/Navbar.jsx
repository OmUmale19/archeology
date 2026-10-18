import React from "react";
import { Activity, Sparkles, Plus, Briefcase, Code, Trash2, Home } from "lucide-react";
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
  onNavigateHome,
  onNavigateFeatures,
}) {
  return (
    <header className="app-header">
      {/* Zone 1: Brand Identity & Quick Navigation */}
      <div className="header-left-zone">
        <div
          className="brand-group brand-clickable"
          onClick={onNavigateHome}
          title="Return to Home Overview"
        >
          <div className="brand-logo-glow">
            <img src="/logo.png" alt="Archaeologist Logo" className="brand-logo-img" />
          </div>
          <div className="brand-meta">
            <div className="brand-title-row">
              <span className="brand-title-text">Archaeologist</span>
              <span className="brand-pill">Brain</span>
            </div>
            <span className="brand-byline">Powered by FalkorDB</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="header-view-segmented-pill">
          <button
            onClick={onNavigateHome}
            className="segmented-tab-btn"
            title="Return to Home Page"
          >
            <Home size={12} className="text-cyan" />
            <span>Home</span>
          </button>
          <button
            onClick={onNavigateFeatures}
            className="segmented-tab-btn"
            title="View Project Features & Architecture"
          >
            <Sparkles size={12} className="text-purple" />
            <span>Features</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Central Actions & Scenario Intelligence Bar */}
      <nav className="header-center-zone">
        {/* Data Ingestion Actions */}
        <div className="header-toolbar-group">
          <button
            onClick={onOpenAddEntity}
            className="toolbar-action-primary"
            title="Add individual entity (Project, Person, Service, Decision, Ticket) into graph"
          >
            <Plus size={14} />
            <span>Add Entity</span>
          </button>

          <button
            onClick={onOpenScriptModal}
            className="toolbar-action-secondary"
            title="Batch ingest complete project ecosystem via script"
          >
            <Code size={13} className="text-cyan" />
            <span>Ingest Script</span>
          </button>
        </div>

        <div className="header-toolbar-divider" />

        {/* Scenario Analysis Modes */}
        <div className="header-toolbar-group">
          <button
            className={`toolbar-scenario-pill ${activeScenario === "org" ? "active" : ""}`}
            onClick={() =>
              onSelectScenario(
                "org",
                "Analyze active projects, priorities, and team productivity across the company"
              )
            }
            title="Analyze active projects, team productivity, and cross-team bottlenecks"
          >
            <Briefcase size={13} className="text-cyan" />
            <span>Org Analysis</span>
          </button>

          <button
            className={`toolbar-scenario-pill ${activeScenario === "blast" ? "active" : ""}`}
            onClick={() =>
              onSelectScenario(
                "blast",
                "Simulate departure blast-radius and key-person bus-factor risks"
              )
            }
            title="Simulate departure blast radius, key-person risk, and orphaned services"
          >
            <Activity size={13} className="text-pink" />
            <span>Blast Simulation</span>
          </button>
        </div>
      </nav>

      {/* Zone 3: Status & Tenant Controls */}
      <div className="header-right-zone">
        <div className="status-capsule" title="FalkorDB Graph Engine status">
          <span className="status-ping" />
          <span className="status-label">
            {health?.falkordb_connected ? "FalkorDB Live" : "Engine Ready"}
          </span>
          <span className="status-separator">·</span>
          <span className="status-count">{health?.total_nodes || 0} nodes</span>
        </div>

        <ClerkAuthBar
          isClerkConfigured={isClerkConfigured}
          onTenantChange={onTenantChange}
          currentTenant={currentTenant}
        />

        <button
          onClick={onClearData}
          disabled={isResetting}
          title="Clear all graph data in this workspace"
          className="reset-icon-btn"
        >
          <Trash2 size={14} className={isResetting ? "spin-icon" : ""} />
        </button>
      </div>
    </header>
  );
}

import React from "react";
import { Activity, Database, Sparkles, RefreshCw, Layers, ShieldCheck, Plus, Briefcase } from "lucide-react";

export default function Navbar({ onSelectScenario, activeScenario, health, onResetGraph, isResetting, onOpenAddEntity }) {
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

      {/* Glassmorphic Scenario Pills */}
      <nav className="scenario-nav">
        <button
          className={`glass-pill ${activeScenario === "org" ? "active" : ""}`}
          onClick={() => onSelectScenario("org", "Analyze project performance, profits, and team productivity across the company")}
        >
          <Briefcase size={13} className="pill-icon text-cyan" />
          <span>$20M Uber & Team Org</span>
        </button>

        <button
          className={`glass-pill ${activeScenario === "archaeology" ? "active" : ""}`}
          onClick={() => onSelectScenario("archaeology", "Why is the checkout timeout 7 minutes?")}
        >
          <Sparkles size={13} className="pill-icon text-cyan" />
          <span>7m Timeout Lineage</span>
        </button>

        <button
          className={`glass-pill ${activeScenario === "blast" ? "active" : ""}`}
          onClick={() => onSelectScenario("blast", "Simulate what happens if Elena Rostova leaves")}
        >
          <Activity size={13} className="pill-icon text-pink" />
          <span>Elena Departure Risk</span>
        </button>

        <button
          className={`glass-pill ${activeScenario === "drift" ? "active" : ""}`}
          onClick={() => onSelectScenario("drift", "Audit documentation for stale specs and drift")}
        >
          <Layers size={13} className="pill-icon text-amber" />
          <span>Stale Webhook Docs</span>
        </button>
      </nav>

      {/* Status & Control Panel */}
      <div className="header-actions">
        <button
          onClick={onOpenAddEntity}
          className="add-entity-nav-btn"
          title="Ingest New Entity into Graph"
        >
          <Plus size={14} />
          <span>+ Add Entity</span>
        </button>

        <div className="status-capsule">
          <span className="status-ping"></span>
          <span className="status-label">
            {health?.falkordb_connected ? "FalkorDB Live" : "FalkorDB Graph Engine"}
          </span>
          <span className="status-separator">·</span>
          <span className="status-count">
            {health?.total_nodes || 35} nodes
          </span>
        </div>

        <button
          onClick={onResetGraph}
          disabled={isResetting}
          title="Reset Graph"
          className="reset-icon-btn"
        >
          <RefreshCw size={14} className={isResetting ? "spin-icon" : ""} />
        </button>
      </div>
    </header>
  );
}

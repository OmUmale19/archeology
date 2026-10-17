import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, DollarSign, X, CheckSquare, Square, ArrowRight, UserCheck, Flame, RotateCcw } from "lucide-react";

export default function DisasterHUD({ simulation, onReset, onTriggerHandoff }) {
  if (!simulation) return null;

  const [checkedSteps, setCheckedSteps] = useState({});

  const toggleCheck = (idx) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const {
    target_entity,
    entity_type,
    risk_level,
    arr_at_risk_millions,
    impacted_services,
    impacted_customers,
    mitigation_steps,
    recommended_successor,
  } = simulation;

  return (
    <div className="disaster-hud-card">
      {/* Top Alert Banner */}
      <div className="hud-banner">
        <div className="hud-banner-title">
          <span className="blinking-red-dot"></span>
          <Flame size={15} className="text-red" />
          <span className="hud-live-tag">DISASTER BLAST RADIUS SIMULATOR</span>
        </div>
        <button className="hud-close-btn" onClick={onReset} title="Exit Simulation">
          <RotateCcw size={14} style={{ marginRight: "4px" }} />
          <span>Reset</span>
        </button>
      </div>

      {/* Epicenter Target */}
      <div className="hud-epicenter-row">
        <div>
          <span className="hud-label">EPICENTER OF FAILURE</span>
          <h3 className="hud-target-name">{target_entity}</h3>
          <span className="hud-sub">{entity_type}</span>
        </div>
        <div className={`risk-badge ${risk_level?.toLowerCase() || "critical"}`}>
          <ShieldAlert size={13} />
          <span>{risk_level} RISK</span>
        </div>
      </div>

      {/* Metrics Ticker */}
      <div className="hud-metrics-grid">
        <div className="hud-metric-box revenue">
          <div className="metric-header">
            <DollarSign size={13} className="text-red" />
            <span>ARR AT RISK</span>
          </div>
          <div className="metric-val text-red">
            ${arr_at_risk_millions || 20.5}M
          </div>
          <span className="metric-note">Contractual SLA Exposure</span>
        </div>

        <div className="hud-metric-box">
          <div className="metric-header">
            <AlertTriangle size={13} className="text-amber" />
            <span>COMPROMISED SERVICES</span>
          </div>
          <div className="metric-val text-amber">
            {impacted_services?.length || 3}
          </div>
          <span className="metric-note">Cascading Downstream</span>
        </div>
      </div>

      {/* Impacted Clients / Customer SLAs */}
      {impacted_customers && impacted_customers.length > 0 && (
        <div className="hud-section">
          <span className="hud-label">SLA BREACH EXPOSURE</span>
          <div className="hud-tags-row">
            {impacted_customers.map((cust, idx) => (
              <span key={idx} className="hud-customer-tag">
                {cust}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Standby Successor */}
      {recommended_successor && (
        <div className="hud-successor-card">
          <UserCheck size={16} className="text-cyan" />
          <div>
            <span className="hud-label" style={{ color: "#38bdf8" }}>RECOMMENDED STANDBY SUCCESSOR</span>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f8fafc" }}>
              {recommended_successor}
            </div>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              Ranked highest by graph knowledge distance (reviewed relevant PRs)
            </span>
          </div>
        </div>
      )}

      {/* Instant Continuity Checklist */}
      <div className="hud-section">
        <span className="hud-label">INSTANT BUSINESS CONTINUITY CHECKLIST</span>
        <div className="hud-checklist">
          {mitigation_steps?.map((step, idx) => {
            const isChecked = !!checkedSteps[idx];
            return (
              <div
                key={idx}
                className={`checklist-item ${isChecked ? "completed" : ""}`}
                onClick={() => toggleCheck(idx)}
              >
                {isChecked ? (
                  <CheckSquare size={14} className="check-icon text-cyan" />
                ) : (
                  <Square size={14} className="check-icon" />
                )}
                <span className="check-text">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mitigation Action Footer */}
      <div className="hud-footer">
        <button
          className="hud-action-btn"
          onClick={() =>
            onTriggerHandoff(
              "CREATE_HANDOFF_EPIC",
              {
                departing_person: target_entity,
                successor: recommended_successor || "Marcus Vance",
              }
            )
          }
        >
          <span>Generate Jira Continuity Epic</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

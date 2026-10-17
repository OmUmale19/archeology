import React from "react";
import { X, ExternalLink, MessageSquare, GitPullRequest, ShieldAlert, Cpu, Flame } from "lucide-react";

export default function NodeInspector({ node, onClose, onQueryEntity, onSimulateOutage }) {
  if (!node) return null;

  const props = node.properties || {};

  return (
    <div className="node-inspector-drawer">
      <div className="inspector-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: `${node.color}25`,
                color: node.color,
                border: `1px solid ${node.color}50`,
              }}
            >
              {node.label}
            </span>
            {props.role_tier && (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                {props.role_tier}
              </span>
            )}
            {props.node_size && (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                📐 Size: {props.node_size}px
              </span>
            )}
          </div>
          <h3 className="inspector-title" style={{ marginTop: "6px" }}>
            {node.title}
          </h3>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Special Highlights based on Node Type */}
      {node.label === "SlackMessage" && (
        <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "10px", margin: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
            <MessageSquare size={13} />
            <span>Slack Context ({props.channel})</span>
          </div>
          <p style={{ fontSize: "0.84rem", color: "#e2e8f0", marginTop: "6px", fontStyle: "italic" }}>
            "{props.text}"
          </p>
        </div>
      )}

      {node.label === "PullRequest" && (
        <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.2)", borderRadius: "8px", padding: "10px", margin: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#c084fc", fontWeight: 600 }}>
            <GitPullRequest size={13} />
            <span>PR Diff Summary</span>
          </div>
          <p style={{ fontSize: "0.82rem", color: "#e2e8f0", marginTop: "6px" }}>
            {props.diff_summary}
          </p>
        </div>
      )}

      {node.label === "CustomerTier" && (
        <div style={{ background: "rgba(251, 191, 36, 0.08)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "8px", padding: "10px", margin: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#fbbf24", fontWeight: 600 }}>
            <ShieldAlert size={13} />
            <span>Contractual SLA</span>
          </div>
          <p style={{ fontSize: "0.95rem", color: "#fef3c7", fontWeight: 700, marginTop: "4px" }}>
            {props.sla_level} • {props.tier_name}
          </p>
        </div>
      )}

      {node.label === "Project" && (
        <div style={{ background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: "8px", padding: "12px", margin: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.72rem", color: "#67e8f9", fontWeight: 700, textTransform: "uppercase" }}>Project Financial & Profitability</span>
            <span style={{ fontSize: "0.72rem", background: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
              {props.profit_margin || "+40%"}
            </span>
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff", marginTop: "6px" }}>
            {props.budget || "$20,000,000 ARR"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginTop: "4px" }}>
            {props.profitability} • SLA: <strong style={{ color: "#38bdf8" }}>{props.sla || "99.99%"}</strong>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "6px" }}>
            <div>👔 <strong>Coordinator:</strong> {props.coordinating_manager}</div>
            <div>👥 <strong>Delivery Team:</strong> {props.team_assigned}</div>
          </div>
        </div>
      )}

      {node.label === "Team" && (
        <div style={{ background: props.health?.includes("RISK") ? "rgba(239, 68, 68, 0.08)" : "rgba(139, 92, 246, 0.08)", border: `1px solid ${props.health?.includes("RISK") ? "rgba(239, 68, 68, 0.35)" : "rgba(139, 92, 246, 0.3)"}`, borderRadius: "8px", padding: "12px", margin: "10px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.72rem", color: props.health?.includes("RISK") ? "#fca5a5" : "#c4b5fd", fontWeight: 700, textTransform: "uppercase" }}>Team Productivity Radar</span>
            <span style={{ fontSize: "0.72rem", background: props.health?.includes("RISK") ? "rgba(239, 68, 68, 0.2)" : "rgba(139, 92, 246, 0.2)", color: props.health?.includes("RISK") ? "#f87171" : "#a78bfa", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
              {props.health}
            </span>
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
            Velocity: {props.productivity_score}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#cbd5e1", marginTop: "4px" }}>
            Sprint Completion: <strong>{props.sprint_completion}</strong> • Active Blockers: <strong style={{ color: props.blockers > 0 ? "#f87171" : "#34d399" }}>{props.blockers}</strong>
          </div>
          {props.bottleneck_reason && (
            <div style={{ fontSize: "0.74rem", color: "#fca5a5", marginTop: "6px", background: "rgba(239, 68, 68, 0.12)", padding: "6px 8px", borderRadius: "4px" }}>
              ⚠️ {props.bottleneck_reason}
            </div>
          )}
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "6px" }}>
            <div>🎯 <strong>Assigned Project:</strong> {props.project}</div>
            <div>👑 <strong>Team Lead:</strong> {props.lead}</div>
          </div>
        </div>
      )}


      {/* Property Details Table */}
      <table className="prop-table" style={{ marginTop: "12px" }}>
        <tbody>
          <tr>
            <td className="prop-label">Graph ID</td>
            <td className="prop-val" style={{ fontFamily: "var(--font-mono)" }}>{node.id}</td>
          </tr>
          {Object.entries(props).map(([k, v]) => {
            if (["text", "diff_summary", "avatar"].includes(k)) return null;
            return (
              <tr key={k}>
                <td className="prop-label">{k}</td>
                <td className="prop-val">{typeof v === "object" ? JSON.stringify(v) : String(v)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Disaster Blast Radius Simulation Trigger Button */}
      <button
        onClick={() => onSimulateOutage(node.id)}
        style={{
          width: "100%",
          marginTop: "16px",
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(249, 115, 22, 0.2))",
          border: "1px solid rgba(239, 68, 68, 0.45)",
          borderRadius: "8px",
          padding: "10px",
          color: "#fca5a5",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.25)",
          transition: "all 0.2s ease",
        }}
      >
        <Flame size={15} style={{ color: "#ef4444" }} />
        <span>Simulate Outage / Blast Radius</span>
      </button>

      {/* Quick Action Button */}
      <button
        onClick={() => onQueryEntity(node.title || node.id)}
        style={{
          width: "100%",
          marginTop: "8px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(255, 51, 102, 0.15))",
          border: "1px solid var(--border-active)",
          borderRadius: "8px",
          padding: "10px",
          color: "#ffffff",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <Cpu size={14} />
        Ask Agent About This Node
      </button>
    </div>
  );
}

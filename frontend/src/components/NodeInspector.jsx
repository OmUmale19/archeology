import React from "react";
import { X, ExternalLink, MessageSquare, GitPullRequest, ShieldAlert, Cpu } from "lucide-react";

export default function NodeInspector({ node, onClose, onQueryEntity }) {
  if (!node) return null;

  const props = node.properties || {};

  return (
    <div className="node-inspector-drawer">
      <div className="inspector-header">
        <div>
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

      {/* Quick Action Button */}
      <button
        onClick={() => onQueryEntity(node.title || node.id)}
        style={{
          width: "100%",
          marginTop: "16px",
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

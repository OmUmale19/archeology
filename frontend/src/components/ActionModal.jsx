import React, { useState } from "react";
import { X, Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function ActionModal({ actionResult, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!actionResult) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(actionResult.artifact_content);
    setCopied(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                Workflow Executed
              </span>
              {actionResult.ticket_id && (
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  [{actionResult.ticket_id}]
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "6px", color: "#ffffff" }}>
              {actionResult.title}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {actionResult.artifact_content}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Artifact Markdown"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

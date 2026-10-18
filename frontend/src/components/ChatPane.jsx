import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, ArrowRight, Clock, Sparkles } from "lucide-react";

export default function ChatPane({ messages, onSendMessage, isLoading, onTriggerAction }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const formatInlineSegments = (text) => {
    const codeParts = text.split("`");
    return codeParts.map((codeSeg, cIdx) => {
      if (cIdx % 2 === 1) {
        return (
          <code key={cIdx} className="bubble-inline-code">
            {codeSeg}
          </code>
        );
      }
      const boldParts = codeSeg.split("**");
      return boldParts.map((p, bIdx) =>
        bIdx % 2 === 1 ? <strong key={bIdx}>{p}</strong> : p
      );
    });
  };

  const renderFormattedText = (text) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="bubble-h3">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={idx} className="bubble-h4">{line.replace("#### ", "")}</h4>;
      }
      if (line.startsWith("> ")) {
        return (
          <blockquote key={idx} className="bubble-quote">
            {formatInlineSegments(line.replace("> ", ""))}
          </blockquote>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="bubble-li">
            {formatInlineSegments(line.replace("- ", ""))}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={idx} className="bubble-li-num">
            {formatInlineSegments(line.replace(/^\d+\.\s/, ""))}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} style={{ height: "6px" }} />;
      }
      return (
        <p key={idx} className="bubble-p">
          {formatInlineSegments(line)}
        </p>
      );
    });
  };

  return (
    <section className="chat-section-glass">
      {/* Pane Top Header */}
      <div className="chat-pane-header">
        <div className="copilot-brand-badge">
          <div className="copilot-glow-avatar">
            <Bot size={15} />
            <span className="copilot-online-dot" />
          </div>
          <div className="copilot-header-info">
            <div className="copilot-title-row">
              <span className="copilot-title-text">Company Copilot</span>
              <span className="copilot-engine-tag">Graph RAG</span>
            </div>
            <span className="copilot-subtext">Autonomous Reasoning & Blast Radius</span>
          </div>
        </div>
      </div>

      <div className="chat-stream">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-row ${msg.sender}`}>
            {msg.sender === "agent" && (
              <div className="agent-avatar">
                <Bot size={14} className="avatar-icon" />
              </div>
            )}

            <div className={`chat-bubble-card ${msg.sender}`}>
              {msg.sender === "agent" && msg.toolCalled && (
                <div className="tool-pill" title={msg.toolCalled}>
                  <Sparkles size={11} className="text-cyan shrink-0" />
                  <span className="tool-pill-name">{msg.toolCalled}</span>
                  {msg.latency && (
                    <span className="tool-latency">
                      <Clock size={10} />
                      {msg.latency}ms
                    </span>
                  )}
                </div>
              )}

              <div className="bubble-content">
                {renderFormattedText(msg.text)}
              </div>

              {msg.actionCards && msg.actionCards.length > 0 && (
                <div className="workflow-deck">
                  {msg.actionCards.map((card, cIdx) => (
                    <button
                      key={cIdx}
                      className="workflow-glass-btn"
                      onClick={() => onTriggerAction(card.action_type, card.payload)}
                    >
                      <span className="workflow-btn-text">{card.button_label}</span>
                      <ArrowRight size={14} className="workflow-arrow" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-row agent">
            <div className="agent-avatar">
              <Bot size={14} className="avatar-icon" />
            </div>
            <div className="chat-bubble-card agent loading-bubble">
              <span className="glowing-spinner"></span>
              <span>Traversing FalkorDB knowledge graph...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Glass Input Form */}
      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <div className="glass-input-container">
          <input
            type="text"
            className="modern-chat-input"
            placeholder="Ask about architecture, owners, or decisions..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="glass-send-btn"
            disabled={isLoading || !inputText.trim()}
            title="Send Query"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </section>
  );
}

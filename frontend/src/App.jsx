import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ChatPane from "./components/ChatPane";
import GraphCanvas from "./components/GraphCanvas";
import NodeInspector from "./components/NodeInspector";
import ActionModal from "./components/ActionModal";
import { fetchHealth, fetchGraphOverview, sendChatMessage, triggerAction, reseedGraph } from "./services/api";

export default function App() {
  const [health, setHealth] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "### Autonomous Company Brain\nConnected organizational context layer powered by **FalkorDB**.\n\nAsk any question about architectural decisions, key-person risk, or documentation drift across Slack, GitHub, Jira, and Confluence.",
      toolCalled: null,
      latency: null,
      actionCards: [],
    },
  ]);

  // Load initial data
  useEffect(() => {
    loadHealth();
    loadGraph();
  }, []);

  const loadHealth = async () => {
    const data = await fetchHealth();
    setHealth(data);
  };

  const loadGraph = async () => {
    const data = await fetchGraphOverview();
    setGraphData(data);
  };

  const handleSendMessage = async (text) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text }]);

    try {
      const res = await sendChatMessage(text);
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: res.answer,
          toolCalled: res.tool_called,
          latency: res.latency_ms,
          actionCards: res.action_cards || [],
        },
      ]);

      // If response includes a subgraph, highlight those nodes in canvas
      if (res.graph?.nodes && res.graph.nodes.length > 0) {
        const ids = res.graph.nodes.map((n) => n.id);
        setHighlightedNodeIds(ids);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `⚠️ **Error communicating with FalkorDB Backend:** ${err.message}. Make sure the backend server is running on port 8000.`,
          toolCalled: null,
          latency: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = (key, promptText) => {
    setActiveScenario(key);
    handleSendMessage(promptText);
  };

  const handleTriggerAction = async (actionType, payload) => {
    try {
      const res = await triggerAction(actionType, payload);
      setActionResult(res);
    } catch (err) {
      alert(`Action execution failed: ${err.message}`);
    }
  };

  const handleResetGraph = async () => {
    setIsResetting(true);
    try {
      await reseedGraph();
      await loadGraph();
      await loadHealth();
      setHighlightedNodeIds([]);
    } catch (err) {
      console.error("Failed to reset graph:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onSelectScenario={handleSelectScenario}
        activeScenario={activeScenario}
        health={health}
        onResetGraph={handleResetGraph}
        isResetting={isResetting}
      />

      <main className="main-workspace">
        <ChatPane
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onTriggerAction={handleTriggerAction}
        />

        <GraphCanvas
          graphData={graphData}
          onSelectNode={(node) => setSelectedNode(node)}
          highlightedNodeIds={highlightedNodeIds}
        />

        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onQueryEntity={(title) => handleSendMessage(`Tell me everything you know about: ${title}`)}
          />
        )}
      </main>

      {actionResult && (
        <ActionModal
          actionResult={actionResult}
          onClose={() => setActionResult(null)}
        />
      )}
    </div>
  );
}

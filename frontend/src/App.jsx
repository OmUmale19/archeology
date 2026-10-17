import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import Navbar from "./components/Navbar";
import ChatPane from "./components/ChatPane";
import GraphCanvas from "./components/GraphCanvas";
import NodeInspector from "./components/NodeInspector";
import ActionModal from "./components/ActionModal";
import AddEntityModal from "./components/AddEntityModal";
import DisasterHUD from "./components/DisasterHUD";
import { fetchHealth, fetchGraphOverview, sendChatMessage, triggerAction, reseedGraph, createGraphNode, simulateBlastRadius } from "./services/api";

export default function App() {
  const [health, setHealth] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState(null);


  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "### Autonomous Company Brain\nConnected organizational context layer powered by **FalkorDB**.\n\nAsk any question about architectural decisions, key-person risk, or documentation drift across Slack, GitHub, Jira, and Confluence. You can also click **+ Add Entity** in the top navigation to inject your own services, engineers, incidents, or decisions into the graph!",
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
    if (actionType === "QUERY_ENTITY") {
      handleSendMessage(`Tell me everything you know about: ${payload.title}`);
      return;
    }
    if (actionType === "AUDIT_PRODUCTIVITY") {
      handleSendMessage(payload.query || "Which teams lack productivity or have bottlenecks?");
      return;
    }
    if (actionType === "INSPECT_NODE") {
      const target = graphData.nodes?.find((n) => n.id === payload.node_id);
      if (target) {
        setSelectedNode(target);
      }
      return;
    }
    try {
      const res = await triggerAction(actionType, payload);
      setActionResult(res);
    } catch (err) {
      alert(`Action execution failed: ${err.message}`);
    }
  };

  const handleCreateEntity = async (payload) => {
    const res = await createGraphNode(payload);

    // Play confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    // Refresh graph and health stats
    await loadGraph();
    await loadHealth();

    const createdId = res.node?.id;
    if (createdId) {
      setHighlightedNodeIds([createdId]);
    }

    // Add announcement to chat pane with quick query action
    const relText = res.edge ? ` linked to **${payload.connection?.target_node_id}** via \`[:${res.edge.label}]\`` : "";
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `✨ **Ingested New Entity into FalkorDB Knowledge Graph!**\n\n- **Entity:** **${payload.title}** (\`${payload.label}\`)\n- **Graph ID:** \`${createdId}\`${relText}\n\nYou can now ask questions about **${payload.title}** or inspect its relationships in the topological canvas.`,
        toolCalled: `falkordb_ingest(${createdId})`,
        latency: 15,
        actionCards: [
          {
            title: `Query ${payload.title}`,
            action_type: "QUERY_ENTITY",
            payload: { title: payload.title },
            button_label: `🔍 Ask Agent About ${payload.title}`,
          },
        ],
      },
    ]);
  };

  const handleSimulateBlastRadius = async (nodeId) => {
    try {
      const res = await simulateBlastRadius(nodeId);
      setActiveSimulation(res);

      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `🚨 **DISASTER BLAST RADIUS SIMULATED: ${res.target_entity}**\n\n- **Risk Level:** \`${res.risk_level}\`\n- **Contractual ARR at Risk:** **$${res.arr_at_risk_millions}M ARR** across ${res.impacted_customers.join(", ")}\n- **Compromised Services:** ${res.impacted_services.join(", ")}\n- **Recommended Standby Successor:** **${res.recommended_successor || "Marcus Vance"}**\n\nReview the live **Disaster Impact HUD** over the graph canvas or trigger the automated continuity epic below!`,
          toolCalled: `simulate_dynamic_blast_radius(${res.node_id || nodeId})`,
          latency: 18,
          actionCards: [
            {
              title: `Generate Continuity Epic for ${res.target_entity}`,
              action_type: "CREATE_HANDOFF_EPIC",
              payload: {
                departing_person: res.target_entity,
                successor: res.recommended_successor || "Marcus Vance",
              },
              button_label: `📋 Generate Continuity Jira Epic (Standby: ${res.recommended_successor?.split(" ")[0] || "Marcus"})`,
            },
          ],
        },
      ]);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    }
  };

  const handleResetGraph = async () => {
    setIsResetting(true);
    try {
      await reseedGraph();
      await loadGraph();
      await loadHealth();
      setHighlightedNodeIds([]);
      setActiveSimulation(null);
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
        onOpenAddEntity={() => setIsAddEntityOpen(true)}
      />

      <main className="main-workspace">
        <ChatPane
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onTriggerAction={handleTriggerAction}
        />

        <div style={{ position: "relative", flex: 1, height: "100%", overflow: "hidden" }}>
          <GraphCanvas
            graphData={graphData}
            onSelectNode={(node) => setSelectedNode(node)}
            highlightedNodeIds={highlightedNodeIds}
            activeSimulation={activeSimulation}
          />

          {activeSimulation && (
            <DisasterHUD
              simulation={activeSimulation}
              onReset={() => setActiveSimulation(null)}
              onTriggerHandoff={handleTriggerAction}
            />
          )}
        </div>

        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onQueryEntity={(title) => handleSendMessage(`Tell me everything you know about: ${title}`)}
            onSimulateOutage={handleSimulateBlastRadius}
          />
        )}
      </main>

      {isAddEntityOpen && (
        <AddEntityModal
          isOpen={isAddEntityOpen}
          onClose={() => setIsAddEntityOpen(false)}
          existingNodes={graphData.nodes}
          onSubmit={handleCreateEntity}
        />
      )}

      {actionResult && (
        <ActionModal
          actionResult={actionResult}
          onClose={() => setActionResult(null)}
        />
      )}
    </div>
  );
}


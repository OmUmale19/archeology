import React, { useState, useEffect, useCallback } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import ChatPane from "./components/ChatPane";
import GraphCanvas from "./components/GraphCanvas";
import NodeInspector from "./components/NodeInspector";
import ActionModal from "./components/ActionModal";
import AddEntityModal from "./components/AddEntityModal";
import ProjectScriptModal from "./components/ProjectScriptModal";
import DisasterHUD from "./components/DisasterHUD";
import HomePage from "./components/HomePage";
import FeaturesPage from "./components/FeaturesPage";
import {
  fetchHealth,
  fetchGraphOverview,
  sendChatMessage,
  triggerAction,
  clearGraphData,
  ingestProject,
  createGraphNode,
  simulateBlastRadius,
  setTenantContext,
} from "./services/api";

export default function App({ isClerkConfigured = false }) {
  const [view, setView] = useState("home");
  const [currentTenant, setCurrentTenant] = useState({
    id: "default",
    name: "Default Workspace",
    type: "workspace",
    token: null,
  });
  const [health, setHealth] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "### Autonomous Company Brain\nConnected organizational context layer powered by **FalkorDB**.\n\nAll previous data has been cleaned. You can input data into the company brain in two ways:\n\n1. **+ Add Entity:** Click the button in the header to create an entity one-by-one (Project, Team, Person, Service, Decision, or Ticket).\n2. **📜 Ingest Project Script:** Click the script button in the header or run `python scripts/ingest_project.py` in your terminal to batch-import a complete project ecosystem with priority, team members, and architecture!",
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

  const handleTenantChange = useCallback(async (newTenant) => {
    if (!newTenant) return;
    setTenantContext(newTenant);
    setCurrentTenant(newTenant);

    try {
      const [dataHealth, dataGraph] = await Promise.all([
        fetchHealth(),
        fetchGraphOverview(),
      ]);
      setHealth(dataHealth);
      setGraphData(dataGraph);
      setHighlightedNodeIds([]);
      setSelectedNode(null);
      setActiveSimulation(null);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    }
  }, []);

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
    if (actionType === "OPEN_ADD_ENTITY") {
      setIsAddEntityOpen(true);
      return;
    }
    if (actionType === "OPEN_SCRIPT_MODAL") {
      setIsScriptModalOpen(true);
      return;
    }
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

  const handleClearData = async () => {
    if (!window.confirm("Are you sure you want to completely delete all graph data? This will wipe the graph database.")) {
      return;
    }
    setIsResetting(true);
    try {
      await clearGraphData();
      await loadGraph();
      await loadHealth();
      setHighlightedNodeIds([]);
      setActiveSimulation(null);
      setSelectedNode(null);
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "🗑️ **All Graph Data Has Been Cleared!**\n\nThe knowledge graph is now completely empty (0 nodes, 0 edges).\n\nYou can input data using either of the two methods:\n1. Click **`+ Add Entity`** to add entities individually.\n2. Click **`📜 Ingest Project Script`** or execute `python scripts/ingest_project.py` in your terminal to batch-import a project.",
          toolCalled: "clear_all_graph_data()",
          latency: 8,
          actionCards: [
            {
              title: "Add Entity",
              action_type: "OPEN_ADD_ENTITY",
              payload: {},
              button_label: "➕ Add First Entity",
            },
            {
              title: "Ingest Project Script",
              action_type: "OPEN_SCRIPT_MODAL",
              payload: {},
              button_label: "📜 Ingest Project Script",
            },
          ],
        },
      ]);
    } catch (err) {
      console.error("Failed to clear graph:", err);
      alert(`Clear failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleIngestProject = async (payload) => {
    const res = await ingestProject(payload);

    await loadGraph();
    await loadHealth();

    const projId = res.project_id;
    if (projId) {
      setHighlightedNodeIds([projId]);
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `🎉 **Successfully Ingested Project Ecosystem via Script!**\n\n- **Project:** **${payload.project_name}** (\`${payload.priority || "P0"}\`)\n- **Budget:** ${payload.budget || "N/A"} (${payload.profit_margin || "N/A"})\n- **Team:** ${payload.team_name || "N/A"} (${payload.team_members?.length || 0} members)\n- **Services:** ${payload.services?.map((s) => s.name).join(", ") || "None"}\n- **Created Elements:** **${res.nodes_created} nodes**, **${res.edges_created} edges**\n\nYou can now inspect the graph canvas or ask questions about **${payload.project_name}**!`,
        toolCalled: `ingest_project(${projId})`,
        latency: 22,
        actionCards: [
          {
            title: `Query ${payload.project_name}`,
            action_type: "QUERY_ENTITY",
            payload: { title: payload.project_name },
            button_label: `🔍 Ask About ${payload.project_name}`,
          },
        ],
      },
    ]);
  };

  const homeElement = (
    <HomePage
      isClerkConfigured={isClerkConfigured}
      onEnterWorkspace={() => setView("workspace")}
      onNavigateFeatures={() => setView("features")}
      currentTenant={currentTenant}
      health={health}
    />
  );

  const featuresElement = (
    <FeaturesPage
      isClerkConfigured={isClerkConfigured}
      onNavigateHome={() => setView("home")}
      onEnterWorkspace={() => setView("workspace")}
      health={health}
    />
  );

  const workspaceElement = (
    <div className="app-container">
      <Navbar
        onSelectScenario={handleSelectScenario}
        activeScenario={activeScenario}
        health={health}
        onClearData={handleClearData}
        isResetting={isResetting}
        onOpenAddEntity={() => setIsAddEntityOpen(true)}
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        isClerkConfigured={isClerkConfigured}
        onTenantChange={handleTenantChange}
        currentTenant={currentTenant}
        onNavigateHome={() => setView("home")}
        onNavigateFeatures={() => setView("features")}
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
            onOpenAddEntity={() => setIsAddEntityOpen(true)}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
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

      {isScriptModalOpen && (
        <ProjectScriptModal
          isOpen={isScriptModalOpen}
          onClose={() => setIsScriptModalOpen(false)}
          onIngest={handleIngestProject}
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

  if (isClerkConfigured) {
    return (
      <ClerkGatedWorkspace
        view={view}
        homeElement={homeElement}
        featuresElement={featuresElement}
        workspaceElement={workspaceElement}
      />
    );
  }

  return view === "home" ? homeElement : view === "features" ? featuresElement : workspaceElement;
}

function ClerkGatedWorkspace({ view, homeElement, featuresElement, workspaceElement }) {
  return (
    <>
      <SignedOut>
        {view === "features" ? featuresElement : homeElement}
      </SignedOut>
      <SignedIn>
        {view === "home" ? homeElement : view === "features" ? featuresElement : workspaceElement}
      </SignedIn>
    </>
  );
}


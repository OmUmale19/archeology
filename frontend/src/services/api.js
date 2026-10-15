const API_BASE = "http://localhost:8000/api";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error("Health check error:", err);
    return { status: "offline", falkordb_connected: false, total_nodes: 0, total_edges: 0 };
  }
}

export async function fetchGraphOverview() {
  try {
    const res = await fetch(`${API_BASE}/graph/overview`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch graph overview:", err);
    return { nodes: [], edges: [] };
  }
}

export async function sendChatMessage(message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function triggerAction(actionType, parameters) {
  const res = await fetch(`${API_BASE}/actions/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action_type: actionType,
      parameters: parameters || {},
    }),
  });
  if (!res.ok) {
    throw new Error(`Action trigger failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function reseedGraph() {
  const res = await fetch(`${API_BASE}/seed`, { method: "POST" });
  return await res.json();
}

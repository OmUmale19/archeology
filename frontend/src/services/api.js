const rawApiBase = import.meta.env.VITE_API_BASE || "/api";
const API_BASE = rawApiBase.replace(/\/+$/, "");

const BACKEND_FALLBACK = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

let currentTenant = {
  id: "default",
  name: "Default Workspace",
  type: "workspace",
  token: null,
};

export function setTenantContext(tenant) {
  if (!tenant) return;
  currentTenant = {
    ...currentTenant,
    ...tenant,
    id: tenant.id || "default",
  };
}

export function getTenantContext() {
  return currentTenant;
}

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-Tenant-Id": currentTenant.id || "default",
    "X-Tenant-Name": currentTenant.name || "Default Workspace",
    "X-Tenant-Type": currentTenant.type || "workspace",
    ...(currentTenant.token ? { Authorization: `Bearer ${currentTenant.token}` } : {}),
    ...(options.headers || {}),
  };

  const primaryUrl = `${API_BASE}${endpoint}`;
  try {
    return await fetch(primaryUrl, { ...options, headers });
  } catch (err) {
    // If the proxied /api request fails (e.g. Vite dev proxy drop, IPv6 issue),
    // automatically attempt failover to direct backend server
    if (primaryUrl.startsWith("/api") && !primaryUrl.startsWith("http")) {
      const fallbackUrl = `${BACKEND_FALLBACK}/api${endpoint}`;
      try {
        console.warn(`[API] Proxy request failed (${err.message}). Retrying direct backend: ${fallbackUrl}`);
        return await fetch(fallbackUrl, { ...options, headers });
      } catch (fallbackErr) {
        console.error(`[API] Both proxy (${primaryUrl}) and direct backend (${fallbackUrl}) failed:`, fallbackErr);
        throw new Error(`Unable to reach backend server: ${err.message}. Please ensure the backend is running on port 8000.`);
      }
    }
    throw err;
  }
}

export async function fetchHealth() {
  try {
    const res = await request("/health");
    return await res.json();
  } catch (err) {
    console.error("Health check error:", err);
    return { status: "offline", falkordb_connected: false, total_nodes: 0, total_edges: 0 };
  }
}

export async function fetchGraphOverview() {
  try {
    const res = await request("/graph/overview");
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch graph overview:", err);
    return { nodes: [], edges: [] };
  }
}

export async function sendChatMessage(message) {
  const res = await request("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function triggerAction(actionType, parameters) {
  const res = await request("/actions/trigger", {
    method: "POST",
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
  const res = await request("/seed", { method: "POST" });
  return await res.json();
}

export async function clearGraphData() {
  const res = await request("/graph/clear", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Clear graph failed: ${res.statusText}`);
  }
  return await res.json();
}

export async function ingestProject(payload) {
  const res = await request("/projects/ingest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errorDetail = `Failed to ingest project: HTTP ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorDetail = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }
  return await res.json();
}

export async function createGraphNode(payload) {
  const res = await request("/graph/nodes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create entity: ${res.statusText}`);
  }
  return await res.json();
}

export async function simulateBlastRadius(nodeId) {
  const res = await request("/simulation/blast-radius", {
    method: "POST",
    body: JSON.stringify({ node_id: nodeId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Blast radius simulation failed: ${res.statusText}`);
  }
  return await res.json();
}

import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Database,
  Plus,
  Code
} from "lucide-react";

const NODE_PALETTE = {
  Person: {
    bg: "#38bdf8",
    border: "#7dd3fc",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  Service: {
    bg: "#6366f1",
    border: "#818cf8",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  Decision: {
    bg: "#ec4899",
    border: "#f472b6",
    glow: "rgba(236, 72, 153, 0.4)",
  },
  SlackMessage: {
    bg: "#10b981",
    border: "#34d399",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  JiraTicket: {
    bg: "#f59e0b",
    border: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  PullRequest: {
    bg: "#a855f7",
    border: "#c084fc",
    glow: "rgba(168, 85, 247, 0.4)",
  },
  Document: {
    bg: "#14b8a6",
    border: "#2dd4bf",
    glow: "rgba(20, 184, 166, 0.4)",
  },
  CustomerTier: {
    bg: "#eab308",
    border: "#fde047",
    glow: "rgba(234, 179, 8, 0.4)",
  },
  Project: {
    bg: "#06b6d4",
    border: "#22d3ee",
    glow: "rgba(6, 182, 212, 0.5)",
  },
  Team: {
    bg: "#8b5cf6",
    border: "#c4b5fd",
    glow: "rgba(139, 92, 246, 0.45)",
  },
};

const DEFAULT_PALETTE = {
  bg: "#94a3b8",
  border: "#cbd5e1",
  glow: "rgba(148, 163, 184, 0.4)",
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_FACTOR = 1.6;

const LAYOUT_OPTIONS = {
  name: "cose",
  idealEdgeLength: 200,
  nodeOverlap: 20,
  refresh: 20,
  fit: true,
  padding: 60,
  randomize: false,
  componentSpacing: 200,
  nodeRepulsion: 1600000,
  edgeElasticity: 100,
  nestingFactor: 5,
  gravity: 50,
  numIter: 1000,
  initialTemp: 250,
  coolingFactor: 0.95,
  minTemp: 1,
};

const GRAPH_STYLE = [
  {
    selector: "node",
    style: {
      "background-color": "data(bg)",
      label: "data(title)",
      color: "#e2e8f0",
      "font-size": "data(fontSize)",
      "font-family": "Outfit, sans-serif",
      "font-weight": "data(fontWeight)",
      "text-valign": "bottom",
      "text-margin-y": "data(textMargin)",
      "text-wrap": "ellipsis",
      "text-max-width": "data(textMaxWidth)",
      "text-background-color": "rgba(10, 13, 20, 0.8)",
      "text-background-padding": 4,
      "text-background-shape": "roundrectangle",
      "text-background-opacity": 0.9,
      width: "data(nodeSize)",
      height: "data(nodeSize)",
      shape: "data(nodeShape)",
      "border-width": "data(borderWidth)",
      "border-color": "data(border)",
      "border-opacity": 0.85,
      "overlay-opacity": 0,
      "transition-property":
        "width, height, border-width, opacity, text-background-color",
      "transition-duration": "200ms",
    },
  },
  {
    selector: "node[label = 'Project']",
    style: {
      shape: "hexagon",
      "border-width": 5,
      "border-color": "#22d3ee",
      color: "#a5f3fc",
      "text-background-color": "rgba(8, 51, 68, 0.95)",
      "text-background-padding": 6,
      "z-index": 120,
    },
  },
  {
    selector: "node[label = 'Team']",
    style: {
      shape: "round-rectangle",
      "border-width": 3.5,
      "border-color": "#c4b5fd",
      color: "#ddd6fe",
      "text-background-color": "rgba(46, 16, 101, 0.95)",
      "z-index": 100,
    },
  },
  {
    selector: "edge[label = 'COORDINATES_PROJECT']",
    style: {
      width: 3.5,
      "line-color": "#38bdf8",
      "target-arrow-color": "#38bdf8",
      "line-style": "dashed",
      "line-dash-pattern": [6, 3],
      "curve-style": "bezier",
      "arrow-scale": 1.3,
      "z-index": 85,
      color: "#7dd3fc",
      "font-weight": 700,
    },
  },

  {
    selector: "node[?isHighlighted]",
    style: {
      "border-color": "#ffffff",
      "border-opacity": 1,
      opacity: 1,
      color: "#ffffff",
      "text-background-color": "rgba(15, 23, 42, 0.95)",
      "text-background-opacity": 0.95,
      "z-index": 100,
    },
  },
  {
    selector: "node[!isHighlighted]",
    style: {
      opacity: 0.18,
      "text-background-opacity": 0.2,
    },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "rgba(148, 163, 215, 0.45)",
      "target-arrow-color": "rgba(165, 180, 252, 0.75)",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      "arrow-scale": 0.85,
      opacity: 0.85,
      label: "data(label)",
      "font-size": 8,
      "font-family": "JetBrains Mono, monospace",
      color: "#94a3b8",
      "text-rotation": "autorotate",
      "text-background-color": "rgba(10, 13, 22, 0.75)",
      "text-background-padding": 3,
      "text-background-shape": "roundrectangle",
      "text-background-opacity": 0.85,
      "transition-property": "width, line-color, opacity",
      "transition-duration": "200ms",
    },
  },
  {
    selector: "edge[?isHighlighted]",
    style: {
      width: 3.5,
      "line-color": "#818cf8",
      "target-arrow-color": "#a5b4fc",
      "arrow-scale": 1.2,
      opacity: 1,
      "z-index": 90,
      "font-size": 9.5,
      "font-weight": 600,
      color: "#ffffff",
      "text-background-color": "rgba(49, 46, 129, 0.95)",
      "text-background-padding": 4,
      "text-background-shape": "roundrectangle",
      "text-background-opacity": 0.98,
    },
  },
  {
    selector: "edge[!isHighlighted]",
    style: {
      opacity: 0.25,
      width: 1.6,
      "text-background-opacity": 0.3,
    },
  },
  {
    selector: "node.blast-hop-0",
    style: {
      "background-color": "#ef4444",
      "border-color": "#fecaca",
      "border-width": 6,
      opacity: 1,
      "z-index": 200,
      color: "#ffffff",
      "text-background-color": "#7f1d1d",
      "text-background-opacity": 0.98,
      "text-background-padding": 6,
    },
  },
  {
    selector: "node.blast-hop-1",
    style: {
      "background-color": "#f97316",
      "border-color": "#fed7aa",
      "border-width": 5,
      opacity: 1,
      "z-index": 180,
      color: "#ffffff",
      "text-background-color": "#7c2d12",
      "text-background-opacity": 0.95,
      "text-background-padding": 5,
    },
  },
  {
    selector: "node.blast-hop-2",
    style: {
      "background-color": "#dc2626",
      "border-color": "#fca5a5",
      "border-width": 4,
      opacity: 1,
      "z-index": 160,
      color: "#fecaca",
      "text-background-color": "#450a0a",
      "text-background-opacity": 0.9,
    },
  },
  {
    selector: "node.blast-hop-3",
    style: {
      "background-color": "#eab308",
      "border-color": "#fef08a",
      "border-width": 4,
      opacity: 1,
      "z-index": 190,
      color: "#fef9c3",
      "text-background-color": "#713f12",
      "text-background-opacity": 0.95,
    },
  },
  {
    selector: "edge.blast-edge",
    style: {
      width: 4,
      "line-color": "#ef4444",
      "target-arrow-color": "#f87171",
      "arrow-scale": 1.4,
      opacity: 1,
      "z-index": 150,
      color: "#fca5a5",
      "font-weight": 700,
      "text-background-color": "rgba(69, 10, 10, 0.95)",
    },
  },
  {
    selector: ".blast-dimmed",
    style: {
      opacity: 0.12,
      "text-opacity": 0.1,
    },
  },
];

export default function GraphCanvas({
  graphData,
  onSelectNode,
  highlightedNodeIds = [],
  activeSimulation = null,
  onOpenAddEntity,
  onOpenScriptModal,
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Keep the latest props without recreating Cytoscape.
  const onSelectNodeRef = useRef(onSelectNode);
  const highlightedIdsRef = useRef(highlightedNodeIds);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    highlightedIdsRef.current = highlightedNodeIds;
  }, [highlightedNodeIds]);


  // Create the graph when the actual graph data changes.
  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = graphData?.nodes || [];
    const edges = graphData?.edges || [];
    const highlighted = new Set(highlightedIdsRef.current);

    const elements = [
      ...nodes.map((n) => {
        const palette = NODE_PALETTE[n.label] || DEFAULT_PALETTE;
        const props = n.properties || {};

        let size = n.node_size || props.node_size;
        let fontSize = 10;
        let borderWidth = 2.5;
        let textMargin = 8;
        let textMaxWidth = 120;
        let fontWeight = 500;
        let nodeShape = "ellipse";

        if (n.label === "Project") {
          nodeShape = "hexagon";
          const titleLower = (n.title || "").toLowerCase();
          if (titleLower.includes("20m") || titleLower.includes("uber") || String(n.id).includes("20m")) {
            size = 96;
            fontSize = 14;
            borderWidth = 5;
            textMargin = 12;
            textMaxWidth = 180;
            fontWeight = 800;
          } else if (titleLower.includes("8m") || titleLower.includes("shopify")) {
            size = 82;
            fontSize = 13;
            borderWidth = 4.5;
            textMargin = 10;
            textMaxWidth = 160;
            fontWeight = 750;
          } else {
            size = 72;
            fontSize = 12;
            borderWidth = 4;
            textMargin = 9;
            textMaxWidth = 150;
            fontWeight = 700;
          }
        } else if (n.label === "CustomerTier") {
          size = 54;
          fontSize = 11;
          borderWidth = 3.5;
          textMargin = 8;
          textMaxWidth = 130;
          fontWeight = 700;
        } else if (n.label === "Team") {
          nodeShape = "round-rectangle";
          size = 60;
          fontSize = 11.5;
          borderWidth = 3.5;
          textMargin = 9;
          textMaxWidth = 140;
          fontWeight = 700;
        } else if (n.label === "Person") {
          const roleStr = ((props.role || "") + " " + (props.role_tier || "")).toLowerCase();
          if (roleStr.includes("vp") || roleStr.includes("director") || roleStr.includes("manager")) {
            size = 68;
            fontSize = 12;
            borderWidth = 4;
            textMargin = 9;
            textMaxWidth = 140;
            fontWeight = 700;
          } else if (roleStr.includes("lead") || roleStr.includes("staff")) {
            size = 58;
            fontSize = 11;
            borderWidth = 3.5;
            textMargin = 8;
            textMaxWidth = 130;
            fontWeight = 650;
          } else if (roleStr.includes("senior") || roleStr.includes("principal")) {
            size = 44;
            fontSize = 9.5;
            borderWidth = 2.5;
            textMargin = 7;
            textMaxWidth = 120;
            fontWeight = 550;
          } else if (roleStr.includes("junior") || roleStr.includes("associate") || roleStr.includes("intern")) {
            size = 32;
            fontSize = 8.5;
            borderWidth = 2;
            textMargin = 6;
            textMaxWidth = 110;
            fontWeight = 500;
          } else {
            size = 36;
            fontSize = 9;
            borderWidth = 2;
            textMargin = 6;
            textMaxWidth = 110;
            fontWeight = 500;
          }
        } else if (n.label === "Service") {
          size = 40;
          fontSize = 9.5;
          borderWidth = 2.5;
          textMargin = 7;
        } else if (n.label === "Decision") {
          size = 28;
          fontSize = 8.5;
          borderWidth = 2;
          textMargin = 5;
        } else {
          // JiraTicket, PullRequest, Document, SlackMessage
          size = n.label === "SlackMessage" ? 24 : 26;
          fontSize = 8;
          borderWidth = 1.5;
          textMargin = 5;
          textMaxWidth = 100;
        }

        return {
          group: "nodes",
          data: {
            id: String(n.id),
            label: n.label,
            title: n.title || n.label,
            bg: palette.bg,
            border: palette.border,
            properties: props,
            nodeSize: size,
            nodeShape,
            fontSize,
            fontWeight,
            borderWidth,
            textMargin,
            textMaxWidth,
            isHighlighted:
              highlighted.size === 0 || highlighted.has(String(n.id)),
          },
        };
      }),


      ...edges.map((e, index) => ({
        group: "edges",
        data: {
          id: String(e.id ?? `edge-${index}`),
          source: String(e.source),
          target: String(e.target),
          label: e.label || "",
          isHighlighted:
            highlighted.size > 0 &&
            highlighted.has(String(e.source)) &&
            highlighted.has(String(e.target)),
          properties: e.properties || {},
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: GRAPH_STYLE,

      // Consistent zoom boundaries.
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,

      // Much smoother mouse-wheel zoom.
      wheelSensitivity: 1.8,

      boxSelectionEnabled: false,
      zoomingEnabled: true,
      userZoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,

      layout: {
        ...LAYOUT_OPTIONS,
      },
    });

    cy.on("tap", "node", (evt) => {
      onSelectNodeRef.current?.(evt.target.data());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();

      if (cyRef.current === cy) {
        cyRef.current = null;
      }
    };
  }, [graphData]);

  // Update highlighting without resetting zoom or node positions.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const highlighted = new Set(highlightedNodeIds);

    cy.batch(() => {
      cy.nodes().forEach((node) => {
        const isHighlighted =
          highlighted.size === 0 || highlighted.has(node.id());

        node.data("isHighlighted", isHighlighted);
      });

      cy.edges().forEach((edge) => {
        const isHighlighted =
          highlighted.size > 0 &&
          highlighted.has(edge.data("source")) &&
          highlighted.has(edge.data("target"));

        edge.data("isHighlighted", isHighlighted);
      });
    });
  }, [highlightedNodeIds]);

  // Handle interactive disaster blast-wave propagation
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Reset previous blast classes
    cy.elements().removeClass(
      "blast-hop-0 blast-hop-1 blast-hop-2 blast-hop-3 blast-edge blast-dimmed"
    );

    if (!activeSimulation || !activeSimulation.cascade_stages) {
      return;
    }

    const stages = activeSimulation.cascade_stages;
    const allBlastIds = new Set([
      ...(stages.hop_0 || []),
      ...(stages.hop_1 || []),
      ...(stages.hop_2 || []),
      ...(stages.hop_3 || []),
    ]);

    // Dim unaffected elements
    cy.elements().forEach((ele) => {
      if (ele.isNode() && !allBlastIds.has(ele.id())) {
        ele.addClass("blast-dimmed");
      } else if (ele.isEdge()) {
        const s = ele.source().id();
        const t = ele.target().id();
        if (allBlastIds.has(s) && allBlastIds.has(t)) {
          ele.addClass("blast-edge");
        } else {
          ele.addClass("blast-dimmed");
        }
      }
    });

    // Stage 0: Epicenter (immediate zoom & pulse)
    (stages.hop_0 || []).forEach((id) => {
      const node = cy.$(`#${id}`);
      node.addClass("blast-hop-0");
      if (node.length > 0) {
        cy.animate({ center: { eles: node }, zoom: 1.15 }, { duration: 400 });
      }
    });

    // Stage 1: Hop 1 Direct dependencies (250ms)
    const t1 = setTimeout(() => {
      (stages.hop_1 || []).forEach((id) => cy.$(`#${id}`).addClass("blast-hop-1"));
    }, 250);

    // Stage 2: Hop 2 Downstream services (550ms)
    const t2 = setTimeout(() => {
      (stages.hop_2 || []).forEach((id) => cy.$(`#${id}`).addClass("blast-hop-2"));
    }, 550);

    // Stage 3: Hop 3 Customer tiers (850ms)
    const t3 = setTimeout(() => {
      (stages.hop_3 || []).forEach((id) => cy.$(`#${id}`).addClass("blast-hop-3"));
    }, 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeSimulation]);


  // Zoom around the exact center of the visible canvas.
  const zoomAtCenter = (factor) => {
    const cy = cyRef.current;
    if (!cy) return;

    const currentZoom = cy.zoom();
    const targetZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, currentZoom * factor)
    );

    if (Math.abs(targetZoom - currentZoom) < 0.0001) return;

    const center = {
      x: cy.width() / 2,
      y: cy.height() / 2,
    };

    // Preserve the graph point currently underneath the viewport center.
    const currentPan = cy.pan();

    const targetPan = {
      x: center.x - (center.x - currentPan.x) *
        (targetZoom / currentZoom),
      y: center.y - (center.y - currentPan.y) *
        (targetZoom / currentZoom),
    };

    cy.stop();

    cy.animate(
      {
        zoom: targetZoom,
        pan: targetPan,
      },
      {
        duration: 180,
        easing: "ease-out-cubic",
      }
    );
  };

  const handleZoomIn = () => {
    zoomAtCenter(ZOOM_FACTOR);
  };

  const handleZoomOut = () => {
    zoomAtCenter(1 / ZOOM_FACTOR);
  };

  const handleFit = () => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;

    cy.stop();

    cy.animate(
      {
        fit: {
          eles: cy.elements(),
          padding: 70,
        },
      },
      {
        duration: 300,
        easing: "ease-out-cubic",
      }
    );
  };

  const handleResetLayout = () => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.stop();

    cy.layout({
      ...LAYOUT_OPTIONS,
      fit: true,
    }).run();
  };

  return (
    <div className="graph-pane">
      <div className="canvas-grid-bg" />

      {/* Visual Hierarchy Scale Pill */}
      <div className="canvas-size-hierarchy-bar">
        <span className="hierarchy-title">📐 Scale Hierarchy:</span>
        <div className="hierarchy-step">
          <span className="hierarchy-circle project-dot" style={{ width: 14, height: 14 }}></span>
          <span>Project (96px)</span>
        </div>
        <span className="hierarchy-arrow">➔</span>
        <div className="hierarchy-step">
          <span className="hierarchy-circle manager-dot" style={{ width: 12, height: 12 }}></span>
          <span>Manager (68px)</span>
        </div>
        <span className="hierarchy-arrow">➔</span>
        <div className="hierarchy-step">
          <span className="hierarchy-circle lead-dot" style={{ width: 10, height: 10 }}></span>
          <span>Lead (58px)</span>
        </div>
        <span className="hierarchy-arrow">➔</span>
        <div className="hierarchy-step">
          <span className="hierarchy-circle senior-dot" style={{ width: 8, height: 8 }}></span>
          <span>Senior (44px)</span>
        </div>
        <span className="hierarchy-arrow">➔</span>
        <div className="hierarchy-step">
          <span className="hierarchy-circle junior-dot" style={{ width: 6, height: 6 }}></span>
          <span>Junior (32px)</span>
        </div>
      </div>

      <div
        className="cytoscape-container"
        ref={containerRef}
      />

      {(!graphData?.nodes || graphData.nodes.length === 0) && (
        <div className="canvas-empty-overlay">
          <div className="empty-state-card">
            <div className="empty-state-icon-glow">
              <Database size={38} className="text-cyan" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              Company Brain Ready
            </h3>
            <p style={{ fontSize: "0.86rem", color: "#94a3b8", maxWidth: "420px", margin: "0 auto 20px", lineHeight: "1.5" }}>
              All existing data is cleared. Input your company context using either method:
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={onOpenAddEntity}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.86rem" }}
              >
                <Plus size={16} />
                <span>1. Add Entity (One-by-One)</span>
              </button>
              <button
                onClick={onOpenScriptModal}
                className="btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.86rem", borderColor: "rgba(6, 182, 212, 0.4)", color: "#22d3ee" }}
              >
                <Code size={16} />
                <span>2. Ingest Project Script</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="canvas-controls-glass">
        <button
          className="glass-icon-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
          type="button"
        >
          <ZoomIn size={15} />
        </button>

        <button
          className="glass-icon-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
          type="button"
        >
          <ZoomOut size={15} />
        </button>

        <button
          className="glass-icon-btn"
          onClick={handleFit}
          title="Fit to View"
          aria-label="Fit graph to view"
          type="button"
        >
          <Maximize2 size={15} />
        </button>

        <button
          className="glass-icon-btn"
          onClick={handleResetLayout}
          title="Rearrange Layout"
          aria-label="Rearrange graph layout"
          type="button"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="canvas-legend-glass">
        {Object.entries(NODE_PALETTE).map(([label, item]) => (
          <div key={label} className="legend-chip">
            <span
              className="legend-glow-dot"
              style={{ backgroundColor: item.bg }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

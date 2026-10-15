import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
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
  idealEdgeLength: 180,
  nodeOverlap: 40,
  refresh: 20,
  fit: true,
  padding: 60,
  randomize: false,
  componentSpacing: 180,
  nodeRepulsion: 1200000,
  edgeElasticity: 100,
  nestingFactor: 5,
  gravity: 60,
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
      "font-size": 10,
      "font-family": "Outfit, sans-serif",
      "font-weight": 500,
      "text-valign": "bottom",
      "text-margin-y": 8,
      "text-wrap": "ellipsis",
      "text-max-width": 110,
      "text-background-color": "rgba(10, 13, 20, 0.8)",
      "text-background-padding": 4,
      "text-background-shape": "roundrectangle",
      "text-background-opacity": 0.9,
      width: 32,
      height: 32,
      "border-width": 2,
      "border-color": "data(border)",
      "border-opacity": 0.8,
      "overlay-opacity": 0,
      "transition-property":
        "width, height, border-width, opacity, text-background-color",
      "transition-duration": "200ms",
    },
  },
  {
    selector: "node[?isHighlighted]",
    style: {
      width: 44,
      height: 44,
      "border-width": 3,
      "border-color": "#ffffff",
      "border-opacity": 1,
      opacity: 1,
      "font-weight": 700,
      "font-size": 11,
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
];

export default function GraphCanvas({
  graphData,
  onSelectNode,
  highlightedNodeIds = [],
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

        return {
          group: "nodes",
          data: {
            id: String(n.id),
            label: n.label,
            title: n.title || n.label,
            bg: palette.bg,
            border: palette.border,
            properties: n.properties || {},
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

      <div
        className="cytoscape-container"
        ref={containerRef}
      />

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

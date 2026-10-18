import React, { useEffect, useRef } from "react";

export default function InfiniteGraphBackground({
  opacity = 0.1, // Default 10% steady opacity
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener("resize", handleResize);

    // Node graph generation: Big hub nodes + smaller clustered satellite nodes
    let nodes = [];

    const initNodes = () => {
      nodes = [];
      const isMobile = width < 768;

      // Stratified grid system ensures zero empty voids or patchy clusters across the canvas
      const cols = isMobile ? 4 : 7;
      const rows = isMobile ? 3 : 4;
      const cellW = width / cols;
      const cellH = height / rows;

      // 1. Create Major/Bigger Hub Nodes - evenly placed in each grid cell with natural jitter
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const baseX = (c + 0.5) * cellW;
          const baseY = (r + 0.5) * cellH;
          const jitterX = (Math.random() - 0.5) * cellW * 0.6;
          const jitterY = (Math.random() - 0.5) * cellH * 0.6;

          const bigNode = {
            id: `big-${i}`,
            isBig: true,
            x: Math.max(25, Math.min(width - 25, baseX + jitterX)),
            y: Math.max(25, Math.min(height - 25, baseY + jitterY)),
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            radius: Math.random() * 2.2 + 5.5,
            baseRadius: Math.random() * 2.2 + 5.5,
            pulseSpeed: Math.random() * 0.02 + 0.015,
            pulseAngle: Math.random() * Math.PI * 2,
            connectedSatelliteIds: [],
          };

          nodes.push(bigNode);

          // 2. Create smaller satellite nodes orbiting each hub
          const satellitesCount = isMobile ? 3 : 5;
          for (let j = 0; j < satellitesCount; j++) {
            const angle = (j / satellitesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
            const dist = Math.random() * 60 + 28;
            const smallNode = {
              id: `small-${i}-${j}`,
              isBig: false,
              hubId: bigNode.id,
              x: (bigNode.x + Math.cos(angle) * dist + width) % width,
              y: (bigNode.y + Math.sin(angle) * dist + height) % height,
              vx: bigNode.vx + (Math.random() - 0.5) * 0.22,
              vy: bigNode.vy + (Math.random() - 0.5) * 0.22,
              radius: Math.random() * 1.1 + 2.1,
              pulseSpeed: 0.02,
              pulseAngle: Math.random() * Math.PI,
            };

            bigNode.connectedSatelliteIds.push(smallNode.id);
            nodes.push(smallNode);
          }
        }
      }

      // 3. Grid-stratified free interstitial nodes to fill all spaces between hubs
      const freeCols = isMobile ? 5 : 9;
      const freeRows = isMobile ? 4 : 6;
      const freeCellW = width / freeCols;
      const freeCellH = height / freeRows;

      let freeIdx = 0;
      for (let r = 0; r < freeRows; r++) {
        for (let c = 0; c < freeCols; c++) {
          const baseX = (c + 0.5) * freeCellW;
          const baseY = (r + 0.5) * freeCellH;
          const jitterX = (Math.random() - 0.5) * freeCellW * 0.75;
          const jitterY = (Math.random() - 0.5) * freeCellH * 0.75;

          nodes.push({
            id: `free-${freeIdx++}`,
            isBig: false,
            x: Math.max(15, Math.min(width - 15, baseX + jitterX)),
            y: Math.max(15, Math.min(height - 15, baseY + jitterY)),
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.1 + 1.8,
            pulseSpeed: 0.02,
            pulseAngle: Math.random() * Math.PI,
          });
        }
      }
    };

    initNodes();

    // Render loop with steady organic drift (no hover effect)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions with infinite wrapping & steady organic motion
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Apply speed limits & smooth damping
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        const maxSpeed = node.isBig ? 1.5 : 2.0;
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
        }

        // Natural organic drift
        node.x += node.vx;
        node.y += node.vy;

        // Infinite screen wrapping
        const pad = 40;
        if (node.x < -pad) node.x = width + pad;
        if (node.x > width + pad) node.x = -pad;
        if (node.y < -pad) node.y = height + pad;
        if (node.y > height + pad) node.y = -pad;

        // Pulse bigger hub nodes
        if (node.isBig) {
          node.pulseAngle += node.pulseSpeed;
          node.radius = node.baseRadius + Math.sin(node.pulseAngle) * 1.4;
        }
      }

      // Draw Connections (White edges at steady 10% opacity)
      const maxDistance = 145;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        // Draw explicit connections to its satellites
        if (a.isBig && a.connectedSatelliteIds) {
          for (const satId of a.connectedSatelliteIds) {
            const b = nodes.find((n) => n.id === satId);
            if (b) {
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 195) {
                const lineAlpha = (0.4 + 0.6 * (1 - dist / 195)) * opacity * 1.4;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(lineAlpha, 0.45)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          }
        }

        // Proximity connections between any nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Hub to Hub arterial trunks (bridges neighboring grid zones)
          if (a.isBig && b.isBig && dist < 260) {
            const trunkAlpha = (0.35 + 0.65 * (1 - dist / 260)) * opacity * 1.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${trunkAlpha})`;
            ctx.lineWidth = 1.25;
            ctx.stroke();
          } else if (dist < maxDistance) {
            const lineAlpha = (0.35 + 0.65 * (1 - dist / maxDistance)) * opacity * (a.isBig || b.isBig ? 1.3 : 1.0);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(lineAlpha, 0.4)})`;
            ctx.lineWidth = a.isBig && b.isBig ? 1.2 : 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw Nodes (White particles with glow at uniform 10% steady opacity)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (node.isBig) {
          // Bigger Hub node
          ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 2.5})`;
          ctx.shadowBlur = 8;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 2.2})`;
          ctx.fill();

          // Outer halo ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 1.4})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else {
          // Smaller Satellite node
          ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 1.8})`;
          ctx.shadowBlur = 4;
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 1.5})`;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="infinite-graph-canvas"
      style={{ opacity: 1 }}
    />
  );
}

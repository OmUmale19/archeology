import React from "react";
import {
  Database,
  GitBranch,
  Activity,
  Sparkles,
  Server,
  ShieldCheck,
  FileCode,
  ArrowLeft,
  ArrowRight,
  LogIn,
  Layers,
  Cpu,
  Workflow,
  Compass,
  CheckCircle2,
  Home,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import InfiniteGraphBackground from "./InfiniteGraphBackground";

export default function FeaturesPage({
  isClerkConfigured,
  onNavigateHome,
  onEnterWorkspace,
  health,
}) {
  return (
    <div className="features-page-container">
      {/* Infinite White Topological Graph Background (steady 10% opacity) */}
      <InfiniteGraphBackground opacity={0.1} />

      {/* Ambient background glows */}
      <div className="home-ambient-glow glow-1" />
      <div className="home-ambient-glow glow-2" />
      <div className="home-ambient-glow glow-3" />

      {/* Navigation Header (Professional 3-Zone Architecture) */}
      <header className="home-header">
        {/* Zone 1: Left Brand */}
        <div
          className="brand-group brand-clickable"
          onClick={onNavigateHome}
          title="Return to Home Overview"
        >
          <div className="brand-logo-glow">
            <img src="/logo.png" alt="Archaeologist Logo" className="brand-logo-img" />
          </div>
          <div className="brand-meta">
            <div className="brand-title-row">
              <span className="brand-title-text">Archaeologist</span>
              <span className="brand-pill">Brain</span>
            </div>
            <span className="brand-byline">Powered by FalkorDB</span>
          </div>
        </div>

        {/* Zone 2: Centered Segmented Navigation */}
        <div className="header-view-segmented-pill">
          <button
            onClick={onNavigateHome}
            className="segmented-tab-btn"
            title="Return to Home Page"
          >
            <Home size={12} className="text-cyan" />
            <span>Home</span>
          </button>
          <button
            className="segmented-tab-btn active"
            title="Current Page: Features & Architecture"
          >
            <Sparkles size={12} className="text-purple" />
            <span>Features</span>
          </button>
        </div>

        {/* Zone 3: Right Status & Launch Controls */}
        <div className="home-header-right">
          <div className="status-capsule" title="FalkorDB Graph Engine status">
            <span className="status-ping" />
            <span className="status-label">
              {health?.falkordb_connected ? "FalkorDB Live" : "Engine Ready"}
            </span>
            <span className="status-separator">·</span>
            <span className="status-count">{health?.total_nodes || 0} nodes</span>
          </div>

          {isClerkConfigured ? (
            <div className="home-header-auth">
              <SignedIn>
                <div className="home-header-user-row">
                  <button
                    onClick={onEnterWorkspace}
                    className="toolbar-action-primary"
                    title="Launch Graph Workspace"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight size={13} />
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="home-header-user-row">
                  <SignInButton mode="modal">
                    <button className="clerk-auth-btn clerk-signin-btn">
                      <LogIn size={13} />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                  <button
                    onClick={onEnterWorkspace}
                    className="toolbar-action-primary"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </SignedOut>
            </div>
          ) : (
            <div className="home-header-user-row">
              <button
                onClick={onEnterWorkspace}
                className="toolbar-action-primary"
                title="Launch Graph Workspace"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="features-content-section">
        {/* Eyebrow and Headline */}
        <div className="features-hero-box">
          <span className="home-eyebrow-pill">
            <Sparkles size={14} className="text-cyan" />
            Core Capabilities & System Architecture
          </span>
          <h1 className="features-main-title">
            What <span className="home-title-gradient">Archaeologist</span> Does
          </h1>
          <p className="features-main-subtitle">
            An in-depth look at how the FalkorDB-powered company brain solves knowledge silos,
            models institutional dependencies, and predicts the blast radius of engineering departures.
          </p>
        </div>

        {/* 3 Core Pillars (From original Home page) */}
        <div className="features-pillars-grid">
          <div className="home-pillar-card feature-card-elevated">
            <div className="pillar-icon-box cyan">
              <GitBranch size={22} />
            </div>
            <h3 className="pillar-title">Topological Company Graph</h3>
            <p className="pillar-desc">
              Unifies fragmented knowledge across teams, microservices, repositories, Jira epics,
              and Architectural Decision Records (ADRs) into an interconnected graph stored natively
              in FalkorDB. Enables sub-millisecond Cypher queries across multi-hop relationships.
            </p>
            <ul className="feature-checklist">
              <li><CheckCircle2 size={13} className="text-cyan" /> Instant multi-hop Cypher queries</li>
              <li><CheckCircle2 size={13} className="text-cyan" /> Interactive Cytoscape topological canvas</li>
              <li><CheckCircle2 size={13} className="text-cyan" /> Real-time entity & dependency inspector</li>
            </ul>
          </div>

          <div className="home-pillar-card feature-card-elevated">
            <div className="pillar-icon-box pink">
              <Activity size={22} />
            </div>
            <h3 className="pillar-title">Departure Blast Radius Simulator</h3>
            <p className="pillar-desc">
              Simulates the departure of key architects or engineers in real time. Discovers single points
              of failure, bus-factor bottlenecks, orphaned services, compromised tier-1 clients, and
              calculates contractual ARR at risk before outages occur.
            </p>
            <ul className="feature-checklist">
              <li><CheckCircle2 size={13} className="text-pink" /> Real-time Disaster Impact HUD</li>
              <li><CheckCircle2 size={13} className="text-pink" /> Dollar ARR at risk calculation</li>
              <li><CheckCircle2 size={13} className="text-pink" /> Automated Jira continuity handoff epic</li>
            </ul>
          </div>

          <div className="home-pillar-card feature-card-elevated">
            <div className="pillar-icon-box purple">
              <Sparkles size={22} />
            </div>
            <h3 className="pillar-title">Contextual AI Agent Reasoning</h3>
            <p className="pillar-desc">
              Supercharges LLM agents with structured graph context instead of flat vector embeddings.
              Agents query FalkorDB Cypher directly to answer complex questions like "Which services
              depend on the Payment Gateway and who owns them?".
            </p>
            <ul className="feature-checklist">
              <li><CheckCircle2 size={13} className="text-purple" /> Dynamic tool calling with FalkorDB Cypher</li>
              <li><CheckCircle2 size={13} className="text-purple" /> Actionable scenario analysis cards</li>
              <li><CheckCircle2 size={13} className="text-purple" /> Multi-turn institutional memory</li>
            </ul>
          </div>
        </div>

        {/* Ecosystem & Infrastructure Bar */}
        <div className="features-ecosystem-wrapper">
          <h3 className="features-section-title">Built On Modern Infrastructure</h3>
          <div className="home-ecosystem-bar">
            <div className="ecosystem-col">
              <div className="ecosystem-badge">
                <Server size={15} className="text-emerald" />
                <span>FalkorDB Graph Engine</span>
              </div>
              <p className="ecosystem-text">
                High-throughput, low-latency graph database written in C and built for lightning-fast
                Cypher pattern matching and enterprise knowledge graphs.
              </p>
            </div>

            <div className="ecosystem-col">
              <div className="ecosystem-badge">
                <ShieldCheck size={15} className="text-cyan" />
                <span>Clerk Multi-Tenancy</span>
              </div>
              <p className="ecosystem-text">
                Strict workspace isolation per company and organization. Every tenant operates in its
                own dedicated graph namespace (<code>Archaeologist_&lt;tenant_id&gt;</code>).
              </p>
            </div>

            <div className="ecosystem-col">
              <div className="ecosystem-badge">
                <FileCode size={15} className="text-pink" />
                <span>Automated Script Ingestion</span>
              </div>
              <p className="ecosystem-text">
                Import complete project ecosystems, team structures, and service architectures in one
                step using <code>scripts/ingest_project.py</code> or the in-app modal.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="features-cta-box">
          <div className="features-cta-glow" />
          <h2 className="features-cta-title">Ready to explore your company's living brain?</h2>
          <p className="features-cta-desc">
            Return to the Home page to authenticate or launch directly into the interactive workspace.
          </p>
          <div className="features-cta-buttons">
            <button onClick={onNavigateHome} className="home-btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
            <button onClick={onEnterWorkspace} className="home-btn-primary">
              <span>Launch Workspace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <span>Archaeologist · Features & Architecture</span>
        <span className="footer-dot">·</span>
        <span>Powered by FalkorDB</span>
        <span className="footer-dot">·</span>
        <span>Secured by Clerk Authentication</span>
      </footer>
    </div>
  );
}

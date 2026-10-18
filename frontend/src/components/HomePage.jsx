import React, { useState } from "react";
import {
  Database,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Activity,
  GitBranch,
  Key,
  Users,
  Server,
  FileCode,
  LogIn,
  CheckCircle,
  Building2,
  User,
  AlertTriangle,
  Home,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useOrganization,
} from "@clerk/clerk-react";

import InfiniteGraphBackground from "./InfiniteGraphBackground";

export default function HomePage({
  isClerkConfigured,
  onEnterWorkspace,
  onNavigateFeatures,
  currentTenant,
  health,
}) {
  return (
    <div className="home-container">
      {/* Infinite White Topological Graph Background (steady 10% opacity) */}
      <InfiniteGraphBackground opacity={0.1} />

      {/* Ambient Radial Lights */}
      <div className="home-ambient-glow glow-1" />
      <div className="home-ambient-glow glow-2" />
      <div className="home-ambient-glow glow-3" />

      {/* Glassmorphic Navigation Bar (Professional 3-Zone Architecture) */}
      <header className="home-header">
        {/* Zone 1: Left Brand */}
        <div
          className="brand-group brand-clickable"
          onClick={onEnterWorkspace}
          title="Open Archaeologist Brain Workspace"
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
            className="segmented-tab-btn active"
            title="Current Page: Home Overview"
          >
            <Home size={12} className="text-cyan" />
            <span>Home</span>
          </button>
          <button
            onClick={onNavigateFeatures}
            className="segmented-tab-btn"
            title="View Project Features & Architecture"
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
                  <div
                    className="tenant-isolation-badge"
                    title={`FalkorDB Multi-Tenant Isolated Graph for ${currentTenant?.name || "Workspace"}`}
                  >
                    <span className="isolation-ping-dot" />
                    <span>Isolated Graph</span>
                  </div>
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

      {/* Main Hero & Content - Compact Non-Scrollable Layout */}
      <main className="home-hero-section">
        {/* Project Title */}
        <h1 className="home-title">
          <span className="home-title-gradient">Archaeologist</span>
        </h1>

        {/* What it does */}
        <p className="home-description">
          An autonomous company brain powered by <strong>FalkorDB</strong> that continuously maps
          teams, microservices, repositories, decision records (ADRs), and dependencies into a living
          knowledge graph. It simulates departure blast radiuses to prevent critical outages and
          equips AI agents with instant institutional context.
        </p>

        {/* Central Glassmorphic Authentication Card */}
        <div className="home-auth-gate-card">
          <div className="auth-card-top-glow" />

          {isClerkConfigured ? (
            <ClerkConnectedAuthCard
              onEnterWorkspace={onEnterWorkspace}
              currentTenant={currentTenant}
            />
          ) : (
            <ClerkUnconfiguredCard onEnterWorkspace={onEnterWorkspace} />
          )}
        </div>

        {/* Direct Link to Dedicated Features Page */}
        <div className="home-features-link-row">
          <button
            onClick={onNavigateFeatures}
            className="home-explore-features-btn"
            title="Explore Archaeologist's features & system architecture"
          >
            <Sparkles size={14} className="text-purple" />
            <span>Explore System Features & Architecture</span>
            <ArrowRight size={14} className="text-cyan" />
          </button>
        </div>
      </main>

      {/* Minimalist Glass Footer */}
      <footer className="home-footer">
        <span>Archaeologist · Autonomous Company Brain</span>
        <span className="footer-dot">·</span>
        <span>Secured by Clerk Authentication</span>
        <span className="footer-dot">·</span>
        <span>FalkorDB Context Engine</span>
      </footer>
    </div>
  );
}

function ClerkConnectedAuthCard({ onEnterWorkspace, currentTenant }) {
  return (
    <>
      <SignedIn>
        <SignedInAuthCard onEnterWorkspace={onEnterWorkspace} currentTenant={currentTenant} />
      </SignedIn>

      <SignedOut>
        <SignedOutAuthCard />
      </SignedOut>
    </>
  );
}

function SignedInAuthCard({ onEnterWorkspace, currentTenant }) {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="auth-card-signed-in">
      <div className="auth-card-header">
        <div className="auth-lock-circle unlocked">
          <ShieldCheck size={26} className="text-emerald" />
        </div>
        <div className="auth-text-meta">
          <span className="auth-badge-live">
            <span className="status-ping" style={{ backgroundColor: "#10b981" }} />
            Authenticated Session
          </span>
          <h2 className="auth-title">
            Welcome back, {user?.firstName || user?.fullName || user?.username || "Architect"}
          </h2>
          <p className="auth-subtitle">
            Your company knowledge graph and autonomous reasoning agent are ready.
          </p>
        </div>
      </div>

      <div className="auth-tenant-info-row">
        <div className="auth-tenant-chip">
          {organization ? (
            <>
              <Building2 size={15} className="text-cyan" />
              <span className="tenant-chip-name">{organization.name}</span>
              <span className="tenant-chip-badge">Organization</span>
            </>
          ) : (
            <>
              <User size={15} className="text-emerald" />
              <span className="tenant-chip-name">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Personal Workspace"}
              </span>
              <span className="tenant-chip-badge">Personal</span>
            </>
          )}
        </div>
        <span className="auth-isolation-text">
          Isolated namespace: <code>Archaeologist_{organization?.id || user?.id || "workspace"}</code>
        </span>
      </div>

      <button onClick={onEnterWorkspace} className="home-launch-workspace-btn">
        <span>Launch Company Brain Workspace</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function SignedOutAuthCard() {
  return (
    <div className="auth-card-signed-out">
      <div className="auth-lock-circle locked">
        <Lock size={26} className="text-pink" />
      </div>

          <span className="auth-badge-gated">
            <ShieldCheck size={13} />
            Authentication Required
          </span>

          <h2 className="auth-title">Access Restricted to Authenticated Members</h2>
          <p className="auth-subtitle">
            Sign in with your organization or team credentials to enter the company brain and
            explore the knowledge graph canvas.
          </p>

          <div className="auth-action-buttons">
            <SignInButton mode="modal">
              <button className="home-btn-primary">
                <LogIn size={16} />
                <span>Sign In to Enter</span>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="home-btn-secondary">
                <span>Create Account</span>
              </button>
            </SignUpButton>
          </div>

          <div className="auth-guarantee-row">
            <div className="guarantee-item">
              <CheckCircle size={14} className="text-cyan" />
              <span>Isolated Company Graph</span>
            </div>
            <div className="guarantee-item">
              <CheckCircle size={14} className="text-cyan" />
              <span>Blast Radius Simulator</span>
            </div>
            <div className="guarantee-item">
              <CheckCircle size={14} className="text-cyan" />
              <span>Autonomous Copilot</span>
            </div>
          </div>
        </div>
  );
}

/**
 * Rendered when Clerk publishable key is not yet set in environment.
 * Explains authentication requirement and provides an instant input to connect Clerk or offline dev mode.
 */
function ClerkUnconfiguredCard({ onEnterWorkspace }) {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith("pk_")) {
      setError("Clerk Publishable Key must start with 'pk_test_' or 'pk_live_'");
      return;
    }
    localStorage.setItem("clerk_publishable_key", trimmed);
    window.location.reload();
  };

  return (
    <div className="auth-card-unconfigured">
      <div className="auth-lock-circle locked">
        <Lock size={26} className="text-cyan" />
      </div>

      <span className="auth-badge-gated">
        <Key size={13} />
        Clerk Authentication Required
      </span>

      <h2 className="auth-title">Authentication Enforced</h2>
      <p className="auth-subtitle">
        No user can enter the workspace without login. To enable Clerk sign-in, provide your Clerk
        Publishable Key below, or add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to your{" "}
        <code>.env</code> file.
      </p>

      <form onSubmit={handleSaveKey} className="clerk-key-form">
        <div className="clerk-input-group">
          <input
            type="text"
            placeholder="pk_test_..."
            value={keyInput}
            onChange={(e) => {
              setKeyInput(e.target.value);
              setError("");
            }}
            className="clerk-key-input"
          />
          <button type="submit" className="home-btn-primary">
            <span>Connect Clerk</span>
            <ArrowRight size={14} />
          </button>
        </div>
        {error && <span className="clerk-form-error">{error}</span>}
      </form>

      <div className="clerk-env-guide">
        <span>Or add to your root <code>.env</code>:</span>
        <pre className="clerk-env-snippet">VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."</pre>
      </div>

      <div className="dev-bypass-box">
        <span className="dev-bypass-label">Local Developer Session:</span>
        <button
          onClick={onEnterWorkspace}
          className="dev-bypass-btn"
          title="Bypass login for offline testing only"
        >
          Enter as Local Guest (Dev Only)
        </button>
      </div>
    </div>
  );
}

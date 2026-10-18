import React, { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  OrganizationSwitcher,
  useUser,
  useOrganization,
  useAuth,
} from "@clerk/clerk-react";
import { Building2, User, Lock } from "lucide-react";

export default function ClerkAuthBar({ isClerkConfigured, onTenantChange, currentTenant }) {
  if (!isClerkConfigured) {
    return (
      <div className="tenant-badge-pill" title="Running in single-tenant mode. Add VITE_CLERK_PUBLISHABLE_KEY to .env for multi-company Clerk auth.">
        <Building2 size={13} className="text-cyan" />
        <span className="tenant-badge-title">Local Workspace</span>
        <span className="tenant-badge-tag">Single Tenant</span>
      </div>
    );
  }

  return (
    <ClerkConnectedBar onTenantChange={onTenantChange} currentTenant={currentTenant} />
  );
}

function ClerkConnectedBar({ onTenantChange, currentTenant }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { getToken } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function sync() {
      if (!userLoaded) return;

      let token = null;
      try {
        token = await getToken();
      } catch (err) {
        // Token optional
      }

      if (!isMounted) return;

      if (organization) {
        onTenantChange({
          id: organization.id,
          name: organization.name,
          type: "organization",
          token,
        });
      } else if (user) {
        onTenantChange({
          id: user.id,
          name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Personal Workspace",
          type: "personal",
          token,
        });
      } else {
        onTenantChange({
          id: "default",
          name: "Guest Workspace",
          type: "guest",
          token: null,
        });
      }
    }

    sync();

    return () => {
      isMounted = false;
    };
  }, [user, organization, userLoaded, orgLoaded, onTenantChange, getToken]);

  return (
    <div className="clerk-auth-wrapper">
      <SignedIn>
        <div className="clerk-signed-in-group">
          {/* Multi-Tenant Security & Isolation Indicator */}
          {currentTenant?.type === "organization" ? (
            <div
              className="tenant-isolation-badge"
              title={`FalkorDB Multi-Tenant Isolated Graph for ${currentTenant.name}`}
            >
              <span className="isolation-ping-dot" />
              <span>Isolated Graph</span>
            </div>
          ) : (
            <div
              className="active-tenant-indicator"
              title={`Personal Isolated Graph for ${currentTenant?.name || "Workspace"}`}
            >
              <User size={13} className="text-emerald" />
              <span className="active-tenant-name">
                {currentTenant?.name || "Personal"}
              </span>
              <span className="active-tenant-badge">Isolated</span>
            </div>
          )}

          {/* Clerk Organization / Company Switcher */}
          <div className="clerk-org-switcher-box">
            <OrganizationSwitcher
              hidePersonal={false}
              afterCreateOrganizationUrl="/"
              afterLeaveOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              afterSelectPersonalUrl="/"
            />
          </div>

          {/* User Profile Button */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="clerk-signed-out-group">
          <div className="signed-out-notice">
            <Lock size={12} className="text-cyan" />
            <span>Multi-Tenant Auth</span>
          </div>
          <SignInButton mode="modal">
            <button className="clerk-auth-btn clerk-signin-btn">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="clerk-auth-btn clerk-signup-btn">Sign Up</button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  );
}

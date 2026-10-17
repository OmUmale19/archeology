---
name: clerk
description: Clerk authentication router. Use when user asks about Clerk CLI operations, adding authentication, setting up Clerk, custom sign-in flows, Swift or native iOS auth, native Android auth, Next.js patterns, React patterns, Vue patterns, Nuxt patterns, Astro patterns, TanStack Start patterns, Expo patterns, React Router patterns, Chrome Extension patterns, organizations, billing, subscriptions, payments, pricing, plans, seat-based pricing, feature entitlements, syncing users, testing, impersonating a user, or testing webhooks locally.
license: MIT
metadata:
  version: 2.0.0
---

# Clerk Skills Router

## Version Detection

Check `package.json` to determine the Clerk SDK version:

| Package | Core 2 (LTS until Jan 2027) | Current |
|---|---|---|
| `@clerk/nextjs` | v5–v6 | v7+ |
| `@clerk/react` or `@clerk/clerk-react` | v5–v6 | v7+ |
| `@clerk/expo` or `@clerk/clerk-expo` | v1–v2 | v3+ |
| `@clerk/react-router` | v1–v2 | v3+ |
| `@clerk/tanstack-react-start` | < v0.26.0 | v0.26.0+ |

**Default to current** if the version is unclear or the project is new. Core 2 packages use `@clerk/clerk-react` and `@clerk/clerk-expo` (with `clerk-` prefix); current packages use `@clerk/react` and `@clerk/expo`.

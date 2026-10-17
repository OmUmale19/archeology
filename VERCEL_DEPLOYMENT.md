# 🚀 Deploying Archaeologist to Vercel (Multi-Service Architecture)

This repository is configured for **Vercel Services**, enabling multi-service deployment where both the **Vite React UI** and the **FastAPI Python Backend** deploy atomically under a single shared domain.

---

## ⚡ Quick Deployment

### Option 1: Vercel Web Dashboard (Git Push)
1. Push your changes to GitHub / GitLab / Bitbucket:
   ```bash
   git add .
   git commit -m "Configure Vercel multi-service deployment"
   git push origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/new), select your repository.
3. Vercel automatically detects the multi-service `vercel.json` configuration.
4. (Optional) Set environment variables (e.g., `FALKORDB_HOST`, `FALKORDB_PASSWORD`, `OPENAI_API_KEY`).
5. Click **Deploy**.

### Option 2: Deploy Using the Vercel CLI
```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Test locally with all services running together
vercel dev

# 3. Deploy to production
vercel --prod
```

---

## 🛠️ Architecture & Service Layout

| Service | Root Directory | Framework | Entrypoint | Routing |
|---|---|---|---|---|
| **`frontend`** | `frontend/` | `vite` | Static SPA build (`dist`) | `/(.*)` (Public) |
| **`backend`** | `backend/` | `fastapi` | `main:app` | `/api/(.*)` (Public) |

### Service Roles & Communication
- **`frontend` (Public)**: Serves the React UI to end-user browsers. In the browser, API calls hit `/api/...` relative paths.
- **`backend` (Public via `/api/*`)**: Serves the FastAPI REST API, graph endpoints, and conversational agent.
- **Internal Service Bindings**: None required. Because `frontend` is a client-side Single Page Application running in the user's browser (not on a Vercel serverless function runtime), all API communication occurs via the public `/api/(.*)` rewrite.

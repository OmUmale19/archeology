# 🚀 Deploying Archaeologist to Vercel

This repository is pre-configured for seamless deployment to **Vercel** with full-stack support (Vite React Single Page Application + FastAPI Python serverless functions).

---

## ⚡ Quick Deployment (2 Options)

### Option 1: All-in-One Full-Stack Deployment (Recommended)
Both the **Vite React UI** and the **FastAPI Backend** run together on Vercel as a single deployment.

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Configure project for Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your Git repository.
   - **Root Directory**: Leave as `./` (the root).
   - **Build Command**: `npm run build --prefix frontend` (automatically configured by `vercel.json`).
   - **Output Directory**: `frontend/dist` (automatically configured by `vercel.json`).
   - **Install Command**: `npm install --prefix frontend` (automatically configured by `vercel.json`).

3. **Configure Environment Variables (Optional)**:
   In the Vercel project settings, you can optionally configure:
   | Variable | Description | Default (if unset) |
   |---|---|---|
   | `FALKORDB_HOST` | Hostname for your FalkorDB / Redis Cloud instance | Falls back to in-memory graph |
   | `FALKORDB_PORT` | Port for FalkorDB | `6379` |
   | `FALKORDB_PASSWORD` | Password for FalkorDB Cloud | Empty |
   | `OPENAI_API_KEY` | OpenAI API key for LLM responses | Uses built-in heuristic agent |
   | `GEMINI_API_KEY` | Google Gemini API key | Optional |
   | `DEFAULT_LLM_PROVIDER` | `mock` / `openai` / `gemini` / `anthropic` | `mock` |

4. **Click "Deploy"**:
   - Vercel will install dependencies, build the Vite app, bundle the Python serverless function (`api/index.py`), and provide a live URL (e.g., `https://your-app.vercel.app`).

---

### Option 2: Deploy Using the Vercel CLI

If you have the Vercel CLI installed:

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy Preview
vercel

# 4. Deploy Production
vercel --prod
```

---

### Option 3: Frontend on Vercel + Backend on External Host (Render / Railway / Fly.io)

If you prefer to host the Python FastAPI server and FalkorDB Docker container on a persistent VPS, Render, or Railway:

1. **Deploy your backend** to Railway / Render / Fly.io.
2. In your Vercel Project Settings under **Environment Variables**, add:
   ```
   VITE_API_BASE=https://your-backend-url.railway.app/api
   ```
3. Redeploy the Vercel frontend. The React application will automatically route all API queries directly to your external backend.

---

## 🛠️ Architecture Summary

- **`vercel.json`**: Directs traffic matching `/api/*` to the Python serverless function (`api/index.py`) and all other routes to the Vite single-page application (`/index.html`).
- **`api/index.py`**: ASGI serverless entrypoint featuring `VercelPathRewriter` middleware to ensure query string parameters and path rewrites correctly map to FastAPI route handlers.
- **`frontend/src/services/api.js`**: Uses `import.meta.env.VITE_API_BASE || "/api"`. In production on Vercel, requests use relative `/api` paths with zero CORS friction. In local development, the Vite dev server proxies `/api` to `http://localhost:8000`.
- **`requirements.txt`**: Root-level dependencies enabling Vercel's Python runtime to package FastAPI, FalkorDB client, NetworkX, and Pydantic.

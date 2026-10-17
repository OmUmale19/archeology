import sys
import os
from urllib.parse import parse_qs, urlencode

# Ensure root and backend directory are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.main import app as fastapi_app

class VercelPathRewriter:
    """
    ASGI middleware that normalizes incoming paths when deployed to Vercel.
    Handles path rewriting, query parameter path injection, and ensures
    FastAPI receives the expected /api/... paths.
    """
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            query_string = scope.get("query_string", b"").decode("latin-1")
            query_params = parse_qs(query_string)

            # If path came via ?path= query param from vercel.json rewrite
            if "path" in query_params:
                raw_target = query_params["path"][0].lstrip("/")
                target_path = f"/api/{raw_target}" if raw_target else "/api"
                scope["path"] = target_path
                scope["raw_path"] = target_path.encode("latin-1")

                # Remove routing artifact from query string
                cleaned_query = [
                    (k, v) for k, values in query_params.items() if k != "path" for v in values
                ]
                scope["query_string"] = urlencode(cleaned_query).encode("latin-1")
            elif not path.startswith("/api") and path not in ("", "/"):
                # If path was stripped of /api prefix
                target_path = f"/api{path}"
                scope["path"] = target_path
                scope["raw_path"] = target_path.encode("latin-1")

        await self.asgi_app(scope, receive, send)

app = VercelPathRewriter(fastapi_app)

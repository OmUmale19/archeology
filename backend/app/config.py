import os
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

# Search cwd and parent directories
load_dotenv(find_dotenv(usecwd=True))
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
if os.path.exists(root_env):
    load_dotenv(root_env)

class Settings(BaseModel):
    PROJECT_NAME: str = "Archaeologist - Company Brain"
    VERSION: str = "1.0.0"
    
    # FalkorDB settings
    FALKORDB_URL: str = os.getenv("FALKORDB_URL", "")
    FALKORDB_HOST: str = os.getenv("FALKORDB_HOST", "localhost")
    FALKORDB_PORT: int = int(os.getenv("FALKORDB_PORT", "6379"))
    FALKORDB_USERNAME: str = os.getenv("FALKORDB_USERNAME", "")
    FALKORDB_PASSWORD: str = os.getenv("FALKORDB_PASSWORD", "")
    FALKORDB_SSL: bool = os.getenv("FALKORDB_SSL", "false").lower() in ("true", "1", "yes")
    FALKORDB_GRAPH_NAME: str = os.getenv("FALKORDB_GRAPH_NAME", "FinFlowBrain")
    
    # LLM Settings (OpenAI / Gemini / Anthropic / Local)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "gemini") # "openai" | "gemini" | "anthropic" | "mock"
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()

import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Archaeologist - Company Brain"
    VERSION: str = "1.0.0"
    
    # FalkorDB settings
    FALKORDB_HOST: str = os.getenv("FALKORDB_HOST", "localhost")
    FALKORDB_PORT: int = int(os.getenv("FALKORDB_PORT", "6379"))
    FALKORDB_PASSWORD: str = os.getenv("FALKORDB_PASSWORD", "")
    FALKORDB_GRAPH_NAME: str = os.getenv("FALKORDB_GRAPH_NAME", "FinFlowBrain")
    
    # LLM Settings (OpenAI / Gemini / Anthropic / Local)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "mock") # "openai" | "gemini" | "anthropic" | "mock"
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()

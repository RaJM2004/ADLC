import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "GENQUANTAA_ADLC"
    API_PREFIX: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "genquantaa_adlc"

    # Storage
    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = str(BASE_DIR / "storage" / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 20

    # AI Provider Gateway
    LLM_PROVIDER: str = "mock"  # "mock" | "openai" | "gemini"
    LLM_MODEL: str = "mock-adlc-agent-v1"
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    LLM_REQUEST_TIMEOUT_SECONDS: int = 60
    LLM_MAX_RETRIES: int = 2
    MAX_AGENT_STEPS: int = 10
    MAX_RUN_COST_USD: float = 10.0

    # Demo & Dev Auth
    DEMO_MODE: bool = True
    ENABLE_DEV_AUTH: bool = True

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

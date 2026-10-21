from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.database.client import db_manager
from app.api.v1.api import api_router
from app.api.v1.endpoints import health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting GENQUANTAA ADLC platform service...")
    db_manager.connect()
    # Initialize basic collection indexes
    try:
        projects_col = db_manager.get_collection("adlc_projects")
        projects_col.create_index([("organization_id", 1)])
        projects_col.create_index([("id", 1)], unique=True)
    except Exception as e:
        logger.warning(f"Index initialization warning: {e}")
    yield
    # Shutdown
    logger.info("Shutting down GENQUANTAA ADLC platform service.")

app = FastAPI(
    title="GENQUANTAA ADLC Platform API",
    description=(
        "Enterprise-style AI Development Lifecycle Orchestration Platform API. "
        "Governs discovery, requirements, architecture, development, evaluations, "
        "risk & compliance, deployment, and evidence tracking. (MVP Prototype)"
    ),
    version="0.1.0-mvp",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health endpoint
app.include_router(health.router)

# Versioned API
app.include_router(api_router, prefix=settings.API_PREFIX)

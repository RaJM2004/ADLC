from fastapi import APIRouter
from app.core.config import settings
from app.database.client import db_manager
from app.schemas.system import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health():
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version="0.1.0-mvp",
        environment=settings.APP_ENV,
        database=db_manager.get_status(),
        storage={
            "backend": settings.STORAGE_BACKEND,
            "path": settings.LOCAL_STORAGE_PATH
        },
        llm_provider=settings.LLM_PROVIDER
    )

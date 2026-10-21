from fastapi import APIRouter
from app.api.v1.endpoints import health, system, projects, documents, requirements, planning, evaluations, risks

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(system.router)
api_router.include_router(projects.router)
api_router.include_router(documents.router)
api_router.include_router(requirements.router)
api_router.include_router(planning.router)
api_router.include_router(evaluations.router)
api_router.include_router(risks.router)


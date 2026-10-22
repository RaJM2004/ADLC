from fastapi import APIRouter, Depends, HTTPException
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.architecture.agent import architecture_agent
from app.services.project_service import project_service

router = APIRouter()

@router.post("/projects/{project_id}/architecture/generate", tags=["Architecture & API Design"])
def generate_project_architecture(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    req_col = db_manager.get_collection("project_requirements")
    approved_reqs = req_col.find({"project_id": project_id, "status": "approved"})
    if not approved_reqs:
        approved_reqs = req_col.find({"project_id": project_id})
    return architecture_agent.design_architecture(project_id, approved_reqs)

@router.get("/projects/{project_id}/architecture", tags=["Architecture & API Design"])
def get_project_architecture(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    arch_col = db_manager.get_collection("project_architectures")
    arch = arch_col.find_one({"project_id": project_id})
    if not arch:
        req_col = db_manager.get_collection("project_requirements")
        approved_reqs = req_col.find({"project_id": project_id, "status": "approved"})
        if not approved_reqs:
            approved_reqs = req_col.find({"project_id": project_id})
        arch = architecture_agent.design_architecture(project_id, approved_reqs)
    return arch

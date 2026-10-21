from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query, status
from app.core.security import CurrentUser, get_current_user
from app.models.enums import LifecycleStage
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.services.project_service import project_service

router = APIRouter()

class StageTransitionRequest(BaseModel):
    target_stage: LifecycleStage
    reviewer_name: Optional[str] = "Lead Architect"
    comments: Optional[str] = None

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, tags=["Projects"])
def create_project(
    data: ProjectCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    data.organization_id = current_user.organization_id
    return project_service.create_project(data)

@router.get("/projects", response_model=ProjectListResponse, tags=["Projects"])
def list_projects(
    current_user: CurrentUser = Depends(get_current_user)
):
    items = project_service.list_projects(current_user.organization_id)
    return ProjectListResponse(total=len(items), items=items)

@router.post("/projects/seed-demo", response_model=ProjectResponse, tags=["Projects"])
def seed_demo_project(
    current_user: CurrentUser = Depends(get_current_user)
):
    return project_service.seed_demo_project()

@router.get("/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def get_project(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    return project_service.get_project(project_id)

@router.patch("/projects/{project_id}", response_model=ProjectResponse, tags=["Projects"])
def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    return project_service.update_project(project_id, data)

@router.post("/projects/{project_id}/lifecycle/transition", response_model=ProjectResponse, tags=["Projects"])
def transition_lifecycle_stage(
    project_id: str,
    req: StageTransitionRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    reviewer = req.reviewer_name or current_user.display_name
    return project_service.transition_stage(
        project_id=project_id,
        target_stage=req.target_stage,
        reviewer_name=reviewer,
        comments=req.comments
    )

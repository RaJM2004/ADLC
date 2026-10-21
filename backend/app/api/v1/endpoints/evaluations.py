from fastapi import APIRouter, Depends, HTTPException
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.testing.agent import test_runner_agent
from app.services.project_service import project_service

router = APIRouter()

@router.post("/projects/{project_id}/evaluations/run", tags=["Evaluations & Testing"])
def run_evaluation_suite(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    # Verify project exists
    project_service.get_project(project_id)
    return test_runner_agent.run_tests(project_id)

@router.get("/projects/{project_id}/evaluations", tags=["Evaluations & Testing"])
def list_evaluations(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_evaluations")
    items = col.find({"project_id": project_id})
    return {"total": len(items), "items": items}

@router.get("/projects/{project_id}/evaluations/latest", tags=["Evaluations & Testing"])
def get_latest_evaluation(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    col = db_manager.get_collection("project_evaluations")
    items = col.find({"project_id": project_id})
    if not items:
        # Run tests automatically if none yet
        return test_runner_agent.run_tests(project_id)
    return items[-1]

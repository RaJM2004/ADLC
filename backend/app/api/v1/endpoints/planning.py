from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.planning.agent import planning_agent
from app.services.project_service import project_service

router = APIRouter()

class UpdateTaskStatusRequest(BaseModel):
    status: str = Field(..., description="'todo' | 'in_progress' | 'review' | 'done'")

@router.post("/projects/{project_id}/planning/generate", tags=["Planning & Tasks"])
def generate_work_breakdown_with_agent_2(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    # Verify project exists
    project_service.get_project(project_id)

    # Fetch approved requirements for this project
    req_col = db_manager.get_collection("project_requirements")
    approved_reqs = req_col.find({"project_id": project_id, "review_status": "approved"})

    # If no approved requirements found, fetch all requirements as fallback
    if not approved_reqs:
        approved_reqs = req_col.find({"project_id": project_id})

    result = planning_agent.generate_plan(
        project_id=project_id,
        approved_requirements=approved_reqs
    )

    return result

@router.get("/projects/{project_id}/tasks", tags=["Planning & Tasks"])
def list_project_tasks(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    tasks_col = db_manager.get_collection("project_tasks")
    items = tasks_col.find({"project_id": project_id})
    if not items:
        req_col = db_manager.get_collection("project_requirements")
        reqs = req_col.find({"project_id": project_id, "review_status": "approved"})
        if not reqs:
            reqs = req_col.find({"project_id": project_id})
        if reqs:
            plan = planning_agent.generate_plan(project_id=project_id, approved_requirements=reqs)
            items = plan.get("tasks", [])
    return {"total": len(items), "items": items}

@router.patch("/tasks/{task_id}", tags=["Planning & Tasks"])
def update_task_status(
    task_id: str,
    req: UpdateTaskStatusRequest,
    current_user: CurrentUser = Depends(get_current_user)
):
    tasks_col = db_manager.get_collection("project_tasks")
    task = tasks_col.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    tasks_col.update_one(
        {"id": task_id},
        {"$set": {"status": req.status, "updated_at": datetime.utcnow().isoformat()}}
    )
    return tasks_col.find_one({"id": task_id})

@router.get("/projects/{project_id}/test-cases", tags=["Planning & Tasks"])
def list_project_test_cases(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    tests_col = db_manager.get_collection("project_test_cases")
    items = tests_col.find({"project_id": project_id})
    return {"total": len(items), "items": items}

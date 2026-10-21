from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import CurrentUser, get_current_user
from app.database.client import db_manager
from app.modules.risks.agent import risk_agent
from app.services.project_service import project_service

router = APIRouter()

class RiskSignOffPayload(BaseModel):
    signed_off_by: str
    status: str = "signed_off"
    notes: Optional[str] = None

@router.post("/projects/{project_id}/risks/generate", tags=["Risks & Compliance"])
def generate_risk_assessment(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    req_col = db_manager.get_collection("project_requirements")
    approved_reqs = req_col.find({"project_id": project_id, "status": "approved"})
    if not approved_reqs:
        # Fallback to all requirements for project
        approved_reqs = req_col.find({"project_id": project_id})
    return risk_agent.assess_risks(project_id, approved_reqs)

@router.get("/projects/{project_id}/risks", tags=["Risks & Compliance"])
def list_project_risks(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    risk_col = db_manager.get_collection("project_risks")
    items = risk_col.find({"project_id": project_id})
    if not items:
        # Auto-assess if not generated yet
        req_col = db_manager.get_collection("project_requirements")
        approved_reqs = req_col.find({"project_id": project_id, "status": "approved"})
        if not approved_reqs:
            approved_reqs = req_col.find({"project_id": project_id})
        res = risk_agent.assess_risks(project_id, approved_reqs)
        items = res.get("risks", [])
    
    return {
        "total": len(items),
        "items": items,
        "critical_count": len([r for r in items if r.get("severity") == 5]),
        "average_rpn": round(sum(r.get("rpn", 10) for r in items) / max(len(items), 1), 1)
    }

@router.patch("/risks/{risk_id}/sign-off", tags=["Risks & Compliance"])
def sign_off_risk(
    risk_id: str,
    payload: RiskSignOffPayload,
    current_user: CurrentUser = Depends(get_current_user)
):
    risk_col = db_manager.get_collection("project_risks")
    item = risk_col.find_one({"id": risk_id})
    if not item:
        raise HTTPException(status_code=404, detail="Risk item not found")
    
    updates = {
        "status": payload.status,
        "signed_off_by": payload.signed_off_by,
        "signed_off_at": datetime.utcnow().isoformat(),
    }
    if payload.notes:
        updates["notes"] = payload.notes
        
    risk_col.update_one({"id": risk_id}, {"$set": updates})
    updated = risk_col.find_one({"id": risk_id})
    return updated

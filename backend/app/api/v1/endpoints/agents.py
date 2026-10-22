from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import CurrentUser, get_current_user
from app.modules.agents.unified_engine import unified_agent_registry
from app.services.project_service import project_service

router = APIRouter()

class RunAgentPayload(BaseModel):
    params: Optional[Dict[str, Any]] = None

@router.post("/projects/{project_id}/agents/{agent_id}/run", tags=["Specialist AI Agents"])
def run_specialist_agent(
    project_id: str,
    agent_id: str,
    payload: Optional[RunAgentPayload] = None,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    return unified_agent_registry.execute_agent(agent_id, project_id, payload.params if payload else None)

@router.get("/projects/{project_id}/agents/catalog", tags=["Specialist AI Agents"])
def get_agents_catalog(
    project_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    project_service.get_project(project_id)
    return {
        "total_agents": 11,
        "active_mvp_agents": 11,
        "agents": [
            {"id": "agent_01", "name": "Agent 1: Intake & Requirements", "category": "Intake", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_02", "name": "Agent 2: Planning & Tasks", "category": "Planning", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_03", "name": "Agent 3: Architecture & API", "category": "Architecture", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_04", "name": "Agent 4: Data Engineering", "category": "Data", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_05", "name": "Agent 5: Software Development", "category": "Development", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_06", "name": "Agent 6: Model & LLM Dev", "category": "AI / ML", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_07", "name": "Agent 7: QA & Test", "category": "Testing", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_08", "name": "Agent 8: AI Risk & Compliance", "category": "Governance", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_09", "name": "Agent 9: Security Agent", "category": "Security", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_10", "name": "Agent 10: Release & Deployment", "category": "Release", "version": "1.0.0", "status": "Ready"},
            {"id": "agent_11", "name": "Agent 11: Monitoring & Optimization", "category": "Operations", "version": "1.0.0", "status": "Ready"}
        ]
    }

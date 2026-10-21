from datetime import datetime
import time
from fastapi import APIRouter
from app.core.config import settings
from app.database.client import db_manager
from app.models.enums import LifecycleStage, AgentId
from app.repositories.project_repository import project_repo
from app.schemas.system import SystemCapabilitiesResponse, SystemStatusResponse, SystemCapability

router = APIRouter()
START_TIME = time.time()

@router.get("/system/status", response_model=SystemStatusResponse, tags=["System"])
def get_system_status():
    projects = project_repo.list_all()
    runs_col = db_manager.get_collection("workflow_runs")
    active_runs = runs_col.count_documents({"status": "running"})
    return SystemStatusResponse(
        status="operational",
        timestamp=datetime.utcnow().isoformat(),
        uptime_seconds=round(time.time() - START_TIME, 2),
        projects_count=len(projects),
        active_runs_count=active_runs,
        database=db_manager.get_status()
    )

@router.get("/system/capabilities", response_model=SystemCapabilitiesResponse, tags=["System"])
def get_system_capabilities():
    caps = [
        SystemCapability(
            name="Orchestration State Machine",
            category="Workflow",
            supported=True,
            details="8-stage lifecycle with state persistence and human review gates"
        ),
        SystemCapability(
            name="Specialist Agent Registry",
            category="AI Agents",
            supported=True,
            details="11 Agent definitions registered; 4 active MVP agents (1, 2, 7, 8)"
        ),
        SystemCapability(
            name="AI Provider Abstraction",
            category="AI Provider",
            supported=True,
            details=f"Configured provider: {settings.LLM_PROVIDER} with structured Pydantic schema validation"
        ),
        SystemCapability(
            name="Document Ingestion & Text Extraction",
            category="Data Layer",
            supported=True,
            details="Multi-format document parsing (PDF, DOCX, TXT, CSV) with SHA-256 integrity"
        ),
        SystemCapability(
            name="Deterministic Test Execution",
            category="QA & Verification",
            supported=True,
            details="Real automated test runner executing code against requirement criteria"
        ),
        SystemCapability(
            name="Evidence & Traceability Matrix",
            category="Governance",
            supported=True,
            details="End-to-end bidirectional linking across requirements, tasks, tests, and evidence"
        )
    ]
    return SystemCapabilitiesResponse(
        stages_count=len(LifecycleStage),
        agents_registered=len(AgentId),
        active_mvp_agents=4,
        llm_provider=settings.LLM_PROVIDER,
        database_mode=db_manager.get_status().get("mode", "unknown"),
        storage_backend=settings.STORAGE_BACKEND,
        capabilities=caps
    )

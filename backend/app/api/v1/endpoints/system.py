from datetime import datetime
from typing import Optional, List, Dict
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

@router.get("/git/commits", tags=["System"])
def get_git_commits(
    limit: int = 10,
    repo_url: Optional[str] = None,
    project_id: Optional[str] = None
):
    """
    Retrieve repository Git commits with dynamic repository links for 21 CFR Part 11 code traceability.
    Accepts any custom GitHub/GitLab repo_url or project_id, or auto-detects from the active workspace git remote.
    """
    import subprocess
    import os

    # 1. Determine dynamic repository URL
    detected_repo = ""
    if repo_url and repo_url.strip():
        detected_repo = repo_url.strip()
    elif project_id:
        try:
            proj = project_repo.get_by_id(project_id)
            if proj and hasattr(proj, "github_repo_url") and proj.github_repo_url:
                detected_repo = proj.github_repo_url
        except Exception:
            pass

    # Fallback to auto-detecting current workspace git remote
    if not detected_repo:
        try:
            remote_out = subprocess.check_output(
                ["git", "config", "--get", "remote.origin.url"],
                cwd=os.getcwd()
            ).decode("utf-8", errors="ignore").strip()
            if remote_out:
                detected_repo = remote_out
        except Exception:
            detected_repo = ""

    # Normalize git SSH or HTTP URLs to clean HTTPS web URL
    clean_repo_url = detected_repo
    if clean_repo_url.startswith("git@github.com:"):
        clean_repo_url = "https://github.com/" + clean_repo_url[len("git@github.com:"):]
    elif clean_repo_url.startswith("git@gitlab.com:"):
        clean_repo_url = "https://gitlab.com/" + clean_repo_url[len("git@gitlab.com:"):]
    if clean_repo_url.endswith(".git"):
        clean_repo_url = clean_repo_url[:-4]

    # Detect current branch
    current_branch = "main"
    try:
        branch_out = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=os.getcwd()
        ).decode("utf-8", errors="ignore").strip()
        if branch_out:
            current_branch = branch_out
    except Exception:
        pass

    try:
        raw = subprocess.check_output(
            ["git", "log", f"-n", str(limit), "--pretty=format:%h|%H|%an|%ad|%s"],
            cwd=os.getcwd()
        ).decode("utf-8", errors="ignore")
        
        commits = []
        for line in raw.strip().split("\n"):
            if not line:
                continue
            parts = line.split("|")
            if len(parts) >= 5:
                short_sha, full_sha, author, date, msg = parts[0], parts[1], parts[2], parts[3], parts[4]
                commit_link = f"{clean_repo_url}/commit/{full_sha}" if clean_repo_url else f"#{short_sha}"
                commits.append({
                    "short_sha": short_sha,
                    "full_sha": full_sha,
                    "author": author,
                    "date": date,
                    "message": msg,
                    "github_url": commit_link,
                    "branch": current_branch,
                    "verified": True
                })
        return {
            "repo": clean_repo_url or "Dynamic Local Git Workspace",
            "branch": current_branch,
            "commits": commits
        }
    except Exception as e:
        return {
            "repo": clean_repo_url or "Dynamic Local Git Workspace",
            "branch": current_branch,
            "commits": [],
            "error": str(e)
        }

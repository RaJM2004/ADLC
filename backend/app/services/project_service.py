from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.enums import LifecycleStage, StageStatus, ProjectStatus
from app.repositories.project_repository import project_repo
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectService:
    def create_project(self, data: ProjectCreate) -> dict:
        return project_repo.create(data, is_demo=False)

    def list_projects(self, org_id: Optional[str] = None) -> List[dict]:
        return project_repo.list_all(org_id)

    def get_project(self, project_id: str) -> dict:
        project = project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found."
            )
        return project

    def update_project(self, project_id: str, data: ProjectUpdate) -> dict:
        self.get_project(project_id)  # ensure exists
        return project_repo.update(project_id, data)

    def seed_demo_project(self) -> dict:
        """
        Seeds the mandatory pilot project:
        'End-to-End CSV Copilot for GxP ADLC'
        """
        demo_payload = ProjectCreate(
            name="End-to-End CSV Copilot for GxP ADLC",
            description=(
                "GxP-oriented AI assistant for clinical trial CSV data ingestion, "
                "schema validation, missingness detection, and anomaly flagging. "
                "Governed under GENQUANTAA ADLC lifecycle management."
            ),
            intended_use=(
                "Assist clinical data managers in verifying clinical trial dataset integrity "
                "against 21 CFR Part 11 and ALCOA+ data integrity guidelines."
            ),
            domain="GxP Clinical Data Engineering",
            risk_tier="High",
            owner="Clinical AI Platform Team",
            organization_id="org_genquantaa_primary"
        )
        # Check if already exists to avoid redundant duplication
        existing = project_repo.list_all("org_genquantaa_primary")
        for p in existing:
            if p.get("name") == demo_payload.name and p.get("is_demo"):
                return p

        return project_repo.create(demo_payload, is_demo=True)

    def transition_stage(
        self,
        project_id: str,
        target_stage: LifecycleStage,
        reviewer_name: str,
        comments: Optional[str] = None
    ) -> dict:
        project = self.get_project(project_id)
        current_stage = project.get("current_stage")

        # Validate prerequisites
        stages = project.get("stages", {})
        current_stage_info = stages.get(current_stage, {})
        
        # Must not be failed or blocked
        if current_stage_info.get("status") == StageStatus.FAILED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot advance from stage '{current_stage}' because it is in FAILED status. Remediation required."
            )

        # Mark current stage completed
        project_repo.update_stage(
            project_id=project_id,
            stage=LifecycleStage(current_stage),
            stage_data={
                "status": StageStatus.COMPLETED.value,
                "completed_at": datetime.utcnow().isoformat(),
                "approval_status": "approved",
                "reviewer": reviewer_name
            }
        )

        # Mark target stage running or draft
        return project_repo.update_stage(
            project_id=project_id,
            stage=target_stage,
            stage_data={
                "status": StageStatus.RUNNING.value,
                "started_at": datetime.utcnow().isoformat(),
                "prerequisites_met": True
            }
        )

project_service = ProjectService()

from datetime import datetime
from typing import Dict, List, Optional
import uuid
from app.database.client import db_manager
from app.models.enums import LifecycleStage, StageStatus, ProjectStatus
from app.schemas.project import ProjectCreate, ProjectUpdate

class ProjectRepository:
    def __init__(self):
        self.collection_name = "adlc_projects"

    @property
    def col(self):
        return db_manager.get_collection(self.collection_name)

    def _default_stages(self) -> Dict[str, dict]:
        stages = {}
        for stage in LifecycleStage:
            stages[stage.value] = {
                "stage": stage.value,
                "status": StageStatus.DRAFT.value if stage == LifecycleStage.DISCOVERY_INTAKE else StageStatus.PENDING.value,
                "started_at": datetime.utcnow().isoformat() if stage == LifecycleStage.DISCOVERY_INTAKE else None,
                "completed_at": None,
                "reviewer": None,
                "approval_status": None,
                "prerequisites_met": True if stage == LifecycleStage.DISCOVERY_INTAKE else False,
                "errors": [],
                "warnings": []
            }
        return stages

    def create(self, data: ProjectCreate, is_demo: bool = False) -> dict:
        now = datetime.utcnow()
        doc = {
            "id": f"prj_{uuid.uuid4().hex[:12]}",
            "name": data.name,
            "description": data.description,
            "intended_use": data.intended_use,
            "domain": data.domain,
            "risk_tier": data.risk_tier,
            "owner": data.owner,
            "organization_id": data.organization_id,
            "status": ProjectStatus.ACTIVE.value,
            "current_stage": LifecycleStage.DISCOVERY_INTAKE.value,
            "stages": self._default_stages(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "is_demo": is_demo
        }
        self.col.insert_one(doc)
        return doc

    def list_all(self, org_id: Optional[str] = None) -> List[dict]:
        query = {}
        if org_id:
            query["organization_id"] = org_id
        items = self.col.find(query)
        # Sort by updated_at descending
        items.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return items

    def get_by_id(self, project_id: str) -> Optional[dict]:
        return self.col.find_one({"id": project_id})

    def update(self, project_id: str, data: ProjectUpdate) -> Optional[dict]:
        update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            return self.get_by_id(project_id)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        self.col.update_one({"id": project_id}, {"$set": update_data})
        return self.get_by_id(project_id)

    def update_stage(self, project_id: str, stage: LifecycleStage, stage_data: dict) -> Optional[dict]:
        project = self.get_by_id(project_id)
        if not project:
            return None
        
        stages = project.get("stages", {})
        if stage.value in stages:
            stages[stage.value].update(stage_data)
        else:
            stages[stage.value] = stage_data

        update_data = {
            "stages": stages,
            "current_stage": stage.value,
            "updated_at": datetime.utcnow().isoformat()
        }
        self.col.update_one({"id": project_id}, {"$set": update_data})
        return self.get_by_id(project_id)

    def delete(self, project_id: str) -> bool:
        res = self.col.delete_one({"id": project_id})
        return getattr(res, "deleted_count", 0) > 0

project_repo = ProjectRepository()

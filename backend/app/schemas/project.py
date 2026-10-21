from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.enums import LifecycleStage, StageStatus, ProjectStatus

class StageInfo(BaseModel):
    stage: LifecycleStage
    status: StageStatus = StageStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    reviewer: Optional[str] = None
    approval_status: Optional[str] = None
    prerequisites_met: bool = False
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=5, max_length=2000)
    intended_use: str = Field(..., min_length=5, max_length=1000)
    domain: str = Field("GxP / Regulated AI Systems", max_length=100)
    risk_tier: str = Field("Medium", max_length=50)  # Low | Medium | High | Critical
    owner: str = Field("Architect Team", max_length=100)
    organization_id: str = "org_genquantaa_primary"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    intended_use: Optional[str] = None
    risk_tier: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[ProjectStatus] = None
    current_stage: Optional[LifecycleStage] = None

class ProjectResponse(ProjectBase):
    id: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    current_stage: LifecycleStage = LifecycleStage.DISCOVERY_INTAKE
    stages: Dict[str, StageInfo]
    created_at: datetime
    updated_at: datetime
    is_demo: bool = False

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    total: int
    items: List[ProjectResponse]

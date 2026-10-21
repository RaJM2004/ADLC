from typing import Any, Dict, List
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    database: Dict[str, Any]
    storage: Dict[str, Any]
    llm_provider: str

class SystemCapability(BaseModel):
    name: str
    category: str
    supported: bool
    details: str

class SystemCapabilitiesResponse(BaseModel):
    stages_count: int
    agents_registered: int
    active_mvp_agents: int
    llm_provider: str
    database_mode: str
    storage_backend: str
    capabilities: List[SystemCapability]

class SystemStatusResponse(BaseModel):
    status: str
    timestamp: str
    uptime_seconds: float
    projects_count: int
    active_runs_count: int
    database: Dict[str, Any]

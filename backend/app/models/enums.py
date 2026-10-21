from enum import Enum

class LifecycleStage(str, Enum):
    DISCOVERY_INTAKE = "discovery_intake"
    REQUIREMENTS_PLANNING = "requirements_planning"
    ARCHITECTURE_DESIGN = "architecture_design"
    DEVELOPMENT = "development"
    DATA_MODEL_DEV = "data_model_dev"
    VERIFICATION_TESTING = "verification_testing"
    RELEASE_DEPLOYMENT = "release_deployment"
    MONITORING_RETIREMENT = "monitoring_retirement"

class StageStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_REVIEW = "awaiting_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"

class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class AgentId(str, Enum):
    INTAKE_REQUIREMENTS = "agent_01_intake_requirements"
    PLANNING_TASK = "agent_02_planning_task"
    ARCHITECTURE_API = "agent_03_architecture_api"
    DATA_ENGINEERING = "agent_04_data_engineering"
    SOFTWARE_DEV = "agent_05_software_dev"
    MODEL_LLM_DEV = "agent_06_model_llm_dev"
    QA_TEST = "agent_07_qa_test"
    AI_RISK_COMPLIANCE = "agent_08_ai_risk_compliance"
    SECURITY = "agent_09_security"
    RELEASE_DEPLOYMENT = "agent_10_release_deployment"
    MONITORING_OPTIMIZATION = "agent_11_monitoring_optimization"

class AgentStatus(str, Enum):
    ACTIVE_MVP = "active_mvp"
    PLANNED = "planned"
    INACTIVE = "inactive"

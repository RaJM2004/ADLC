export type LifecycleStage =
  | 'discovery_intake'
  | 'requirements_planning'
  | 'architecture_design'
  | 'development'
  | 'data_model_dev'
  | 'verification_testing'
  | 'release_deployment'
  | 'monitoring_retirement';

export type StageStatus =
  | 'draft'
  | 'pending'
  | 'running'
  | 'awaiting_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled';

export interface StageInfo {
  stage: LifecycleStage;
  status: StageStatus;
  started_at?: string;
  completed_at?: string;
  reviewer?: string;
  approval_status?: string;
  prerequisites_met: boolean;
  errors: string[];
  warnings: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  intended_use: string;
  domain: string;
  risk_tier: string;
  owner: string;
  organization_id: string;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  current_stage: LifecycleStage;
  stages: Record<string, StageInfo>;
  created_at: string;
  updated_at: string;
  is_demo: boolean;
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  uptime_seconds: number;
  projects_count: number;
  active_runs_count: number;
  database: {
    mode: string;
    connected: boolean;
    database: string;
    storage_path?: string;
  };
}

export interface SystemCapabilities {
  stages_count: number;
  agents_registered: number;
  active_mvp_agents: number;
  llm_provider: string;
  database_mode: string;
  storage_backend: string;
  capabilities: Array<{
    name: string;
    category: string;
    supported: boolean;
    details: string;
  }>;
}

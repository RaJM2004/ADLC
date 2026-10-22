import { Project, SystemStatus, SystemCapabilities, LifecycleStage } from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Unknown API error';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health & System
  async getHealth() {
    const res = await fetch('/health');
    return handleResponse<any>(res);
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    return handleResponse<SystemStatus>(res);
  },

  async getSystemCapabilities(): Promise<SystemCapabilities> {
    const res = await fetch(`${API_BASE}/system/capabilities`);
    return handleResponse<SystemCapabilities>(res);
  },

  // Projects
  async listProjects(): Promise<{ total: number; items: Project[] }> {
    const res = await fetch(`${API_BASE}/projects`);
    return handleResponse<{ total: number; items: Project[] }>(res);
  },

  async getProject(projectId: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    return handleResponse<Project>(res);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async seedDemoProject(): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/seed-demo`, {
      method: 'POST',
    });
    return handleResponse<Project>(res);
  },

  async transitionStage(
    projectId: string,
    targetStage: LifecycleStage,
    reviewerName: string = 'Lead Architect',
    comments?: string
  ): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/lifecycle/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_stage: targetStage,
        reviewer_name: reviewerName,
        comments,
      }),
    });
    return handleResponse<Project>(res);
  },

  async getGitCommits(
    limit: number = 10,
    repoUrl?: string,
    projectId?: string
  ): Promise<{
    repo: string;
    branch: string;
    commits: Array<{
      short_sha: string;
      full_sha: string;
      author: string;
      date: string;
      message: string;
      github_url: string;
      branch: string;
      verified: boolean;
    }>;
    error?: string;
  }> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (repoUrl) params.set('repo_url', repoUrl);
    if (projectId) params.set('project_id', projectId);
    const res = await fetch(`${API_BASE}/git/commits?${params.toString()}`);
    return handleResponse(res);
  },
};

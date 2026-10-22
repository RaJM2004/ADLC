import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { PipelineBoard } from './pages/PipelineBoard';
import { AgentsView } from './pages/AgentsView';
import { EvaluationsView } from './pages/EvaluationsView';
import { RequirementsView } from './pages/RequirementsView';
import { TasksView } from './pages/TasksView';
import { ArchitectureView } from './pages/ArchitectureView';
import { RisksView } from './pages/RisksView';
import { TraceabilityView } from './pages/TraceabilityView';
import { PlaceholderView } from './pages/PlaceholderView';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectWorkspace />} />
          <Route path="pipeline" element={<PipelineBoard />} />
          <Route path="assets" element={<PipelineBoard />} />
          <Route path="agents" element={<AgentsView />} />
          <Route path="architecture" element={<ArchitectureView />} />
          <Route path="evaluations" element={<EvaluationsView />} />
          <Route path="requirements" element={<RequirementsView />} />
          <Route path="tasks" element={<TasksView />} />
          <Route
            path="datasets"
            element={
              <PlaceholderView
                title="Data & Datasets"
                subtitle="Clinical and experimental datasets governed under 21 CFR Part 11"
                agentBadge="Data Layer"
                milestone="Data Management"
                description="Profiles dataset schemas, checksums, quality rules, and rejected-row audit logs."
              />
            }
          />
          <Route path="risks" element={<RisksView />} />
          <Route path="traceability" element={<TraceabilityView />} />


          <Route
            path="evidence"
            element={
              <PlaceholderView
                title="Evidence and Reports"
                subtitle="Immutable evidence records, test execution logs, and audit summaries"
                agentBadge="Evidence Vault"
                milestone="Milestone 4"
                description="Collects verifiable evidence artifacts and generates project summary reports."
              />
            }
          />
          <Route
            path="approvals"
            element={
              <PlaceholderView
                title="Approvals and Governance Gates"
                subtitle="Human-in-the-loop review decisions and signature records"
                agentBadge="Approval Gate"
                milestone="Orchestration"
                description="Enforces dual-approval policies and prevents autonomous agent progression without human sign-off."
              />
            }
          />
          <Route
            path="integrations"
            element={
              <PlaceholderView
                title="Integrations & Connectors"
                subtitle="AI Model Providers, Git/CI, and Object Storage"
                agentBadge="Connectors"
                milestone="Integrations"
                description="Configured model provider (Gemini / Mock), MongoDB Atlas, and local object storage."
              />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderView
                title="Platform Settings"
                subtitle="Environment variables, tenant configuration, and security policies"
                agentBadge="Settings"
                milestone="System Config"
                description="Configured for development mode with developer authentication enabled."
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

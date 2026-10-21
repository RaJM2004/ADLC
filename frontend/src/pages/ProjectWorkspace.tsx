import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Workflow,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  Bot,
  ShieldAlert,
  GitFork,
  FileCheck,
  ArrowRight,
  ChevronRight,
  Upload,
  Play,
  RotateCw,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { Project, LifecycleStage, StageStatus } from '../types';
import { StatusChip } from '../components/common/StatusChip';

const STAGE_ORDER: { id: LifecycleStage; name: string; number: number }[] = [
  { id: 'discovery_intake', name: 'Discovery & Intake', number: 1 },
  { id: 'requirements_planning', name: 'Requirements & Planning', number: 2 },
  { id: 'architecture_design', name: 'Architecture & Design', number: 3 },
  { id: 'development', name: 'Development', number: 4 },
  { id: 'data_model_dev', name: 'Data & Model Dev', number: 5 },
  { id: 'verification_testing', name: 'Verification & Testing', number: 6 },
  { id: 'release_deployment', name: 'Release & Deployment', number: 7 },
  { id: 'monitoring_retirement', name: 'Monitoring & Optimization', number: 8 },
];

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<LifecycleStage>('discovery_intake');
  const [transitioning, setTransitioning] = useState(false);

  const loadProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await api.getProject(projectId);
      setProject(data);
      setSelectedStageId(data.current_stage || 'discovery_intake');
    } catch (err: any) {
      alert(`Error loading project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleAdvanceStage = async () => {
    if (!project) return;
    const currentIndex = STAGE_ORDER.findIndex((s) => s.id === project.current_stage);
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentIndex + 1].id;
      try {
        setTransitioning(true);
        const updated = await api.transitionStage(
          project.id,
          nextStage,
          'Lead Architect',
          `Controlled transition approved from ${project.current_stage} to ${nextStage}`
        );
        setProject(updated);
        setSelectedStageId(nextStage);
      } catch (err: any) {
        alert(`Cannot transition stage: ${err.message}`);
      } finally {
        setTransitioning(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-semibold">
        Loading workspace for project {projectId}...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-sm font-bold text-slate-800">Project Not Found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="mt-3 text-xs font-semibold text-blue-600 underline"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const selectedStageInfo = project.stages?.[selectedStageId] || {
    stage: selectedStageId,
    status: 'pending' as StageStatus,
    prerequisites_met: false,
    errors: [],
    warnings: [],
  };

  const isCurrentStage = project.current_stage === selectedStageId;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">
                {project.name}
              </h1>
              {project.is_demo && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Pilot Project
                </span>
              )}
              <StatusChip status={project.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={loadProject}
              className="p-2.5 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              title="Refresh Project Data"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleAdvanceStage}
              disabled={transitioning}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl shadow-md shadow-blue-500/25 transition-all"
            >
              <span>{transitioning ? 'Advancing...' : 'Advance Stage Gate'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Project Meta Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Domain</span>
            <span className="font-bold text-slate-800">{project.domain}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Risk Classification</span>
            <span className="font-extrabold text-rose-600">{project.risk_tier} Tier</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Active Stage</span>
            <span className="font-bold text-blue-600 capitalize">
              {project.current_stage.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Project Owner</span>
            <span className="font-bold text-slate-800">{project.owner}</span>
          </div>
        </div>
      </div>

      {/* 8-Stage Lifecycle Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              8-Stage ADLC Lifecycle Pipeline
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Click any stage to view prerequisites & artifacts
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGE_ORDER.map((stage) => {
            const info = project.stages?.[stage.id];
            const isCurrent = project.current_stage === stage.id;
            const isSelected = selectedStageId === stage.id;
            const isCompleted = info?.status === 'completed';

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : isCurrent
                    ? 'border-blue-400 bg-blue-50/30'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      0{stage.number}
                    </span>
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">
                    {stage.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100/80">
                  <StatusChip status={info?.status || 'pending'} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Selected Lifecycle Stage
            </div>
            <h3 className="text-base font-extrabold text-[#0f172a] capitalize">
              {selectedStageId.replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <StatusChip status={selectedStageInfo.status} />
            {isCurrentStage && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Authoritative Active Stage
              </span>
            )}
          </div>
        </div>

        {/* Stage Governance & Prerequisite Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Prerequisites</span>
            <div className="flex items-center space-x-1.5 text-slate-600">
              <CheckCircle className={`w-3.5 h-3.5 ${selectedStageInfo.prerequisites_met ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>
                {selectedStageInfo.prerequisites_met
                  ? 'All stage prerequisites verified'
                  : 'Pending previous stage sign-off'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Human Reviewer Gate</span>
            <div className="text-slate-600 font-medium">
              <span>{selectedStageInfo.reviewer || 'Assigned to Lead Architect / QA'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Specialist Agent</span>
            <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
              <Bot className="w-3.5 h-3.5" />
              <span>
                {selectedStageId === 'discovery_intake'
                  ? 'Agent 1: Intake & Requirements'
                  : selectedStageId === 'requirements_planning'
                  ? 'Agent 2: Planning & Task Breakdown'
                  : selectedStageId === 'verification_testing'
                  ? 'Agent 7: QA & Deterministic Test'
                  : selectedStageId === 'release_deployment'
                  ? 'Agent 8: AI Risk & Compliance'
                  : 'Orchestrator Gateway'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            Intake document upload and requirement generation are ready for execution.
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/requirements')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Requirements (Agent 1)</span>
            </button>
            <button
              onClick={() => navigate('/evaluations')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deterministic Tests (Agent 7)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

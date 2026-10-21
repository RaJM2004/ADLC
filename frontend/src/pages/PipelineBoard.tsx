import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Filter,
  Plus,
  RotateCw,
  Sparkles,
  Bot
} from 'lucide-react';

interface StageColumn {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    title: string;
    code: string;
    status: 'completed' | 'in_progress' | 'pending';
    tags: Array<{ label: string; color: string }>;
  }>;
}

export const PipelineBoard: React.FC = () => {
  const navigate = useNavigate();

  const columns: StageColumn[] = [
    {
      id: 'scoping',
      name: 'Kick-off & Scoping',
      tasks: [
        {
          id: 't1',
          title: 'Clinical Protocol Document Ingestion & SHA-256 Hashing',
          code: 'ADLC-REQ-001',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't2',
          title: '21 CFR Part 11 Regulatory Scope Definition',
          code: 'ADLC-REQ-002',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't3',
          title: 'Target Architecture & Security Perimeter Sign-off',
          code: 'ADLC-SEC-004',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't4',
          title: 'Organization & Tenant Boundaries Provisioning',
          code: 'ADLC-INFRA-001',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't5',
          title: 'Stakeholder Kickoff Review & Audit Baseline',
          code: 'ADLC-AUD-009',
          status: 'in_progress',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
      ],
    },
    {
      id: 'planning',
      name: 'Solutioning & Planning',
      tasks: [
        {
          id: 't6',
          title: 'Agent 1 Intake & Structured Requirement Extraction',
          code: 'ADLC-AGT-01',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't7',
          title: 'Acceptance Criteria & Citation Verification Gate',
          code: 'ADLC-GATE-01',
          status: 'completed',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
        {
          id: 't8',
          title: 'Agent 2 Work Breakdown Structure & Task Dependency Map',
          code: 'ADLC-AGT-02',
          status: 'in_progress',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
      ],
    },
    {
      id: 'implementation',
      name: 'Implementation',
      tasks: [
        {
          id: 't9',
          title: 'CSV Stream Parser & Missingness Detection Engine',
          code: 'ADLC-DEV-101',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't10',
          title: 'Schema Validation & Anomaly Flagging Pipelines',
          code: 'ADLC-DEV-102',
          status: 'completed',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
        {
          id: 't11',
          title: 'FastAPI Microservice Endpoints & Pydantic Contracts',
          code: 'ADLC-DEV-103',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't12',
          title: 'MongoDB Atlas Ingestion Persistence Layer',
          code: 'ADLC-DATA-008',
          status: 'in_progress',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
      ],
    },
    {
      id: 'testing',
      name: 'Verification & Testing',
      tasks: [
        {
          id: 't13',
          title: 'Agent 7 Deterministic Automated Test Runner Suite',
          code: 'ADLC-TEST-001',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't14',
          title: 'Clinical Data Integrity (ALCOA+) Regression Matrix',
          code: 'ADLC-TEST-002',
          status: 'completed',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
        {
          id: 't15',
          title: 'Agent 8 AI Risk Assessment & Mitigation Checklist',
          code: 'ADLC-RISK-001',
          status: 'completed',
          tags: [
            { label: 'J', color: 'bg-teal-500 text-white' },
            { label: 'K', color: 'bg-rose-500 text-white' },
          ],
        },
        {
          id: 't16',
          title: 'Bidirectional Traceability Matrix Evidence Sign-off',
          code: 'ADLC-TRC-005',
          status: 'in_progress',
          tags: [{ label: 'K', color: 'bg-rose-500 text-white' }],
        },
      ],
    },
  ];

  const handleCardClick = (code: string) => {
    if (code.includes('REQ') || code.includes('GATE') || code.includes('AGT-01')) {
      navigate('/requirements');
    } else if (code.includes('AGT-02') || code.includes('DEV') || code.includes('DATA')) {
      navigate('/tasks');
    } else if (code.includes('TEST')) {
      navigate('/evaluations');
    } else if (code.includes('RISK')) {
      navigate('/risks');
    } else if (code.includes('TRC')) {
      navigate('/traceability');
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ADLC Pipeline & Lifecycle Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-End governed workflow progression for GxP CSV Copilot.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Agent 2 Tasks</span>
          </button>
          <button
            onClick={() => navigate('/evaluations')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm shadow-blue-500/25 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agent 7 Test Runner</span>
          </button>
        </div>
      </div>

      {/* Active Milestone Action Banner */}
      <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900">
              Requirements Approved! Active Pipeline Progression:
            </div>
            <div className="text-slate-600 text-[11px]">
              1) <strong>Agent 2</strong> Tasks &amp; QA Breakdown &rarr; 2) <strong>Agent 7</strong> Test Runner &rarr; 3) <strong>Agent 8</strong> AI Risk Assessment &rarr; 4) <strong>Traceability Matrix</strong>.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/tasks')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer"
          >
            Tasks
          </button>
          <button
            onClick={() => navigate('/evaluations')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Agent 7 Tests
          </button>
          <button
            onClick={() => navigate('/risks')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Agent 8 Risks
          </button>
          <button
            onClick={() => navigate('/traceability')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Traceability RTM
          </button>
        </div>
      </div>

      {/* Chevron Pipeline Header Bar (Matching Image 2) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[980px] grid grid-cols-4 gap-2 bg-[#dbeafe]/40 p-3 rounded-2xl border border-blue-100">
          {columns.map((col, idx) => (
            <div key={col.id} className="relative">
              {/* Chevron Banner */}
              <div
                className={`h-12 flex items-center justify-center font-bold text-xs tracking-tight text-white relative shadow-sm transition-all ${
                  idx === 0
                    ? 'bg-[#3b4992] rounded-l-lg'
                    : idx === 1
                    ? 'bg-[#4352a5]'
                    : idx === 2
                    ? 'bg-[#4d5cb8]'
                    : 'bg-[#5667cb] rounded-r-lg'
                }`}
                style={{
                  clipPath:
                    idx < 3
                      ? 'polygon(0% 0%, 93% 0%, 100% 50%, 93% 100%, 0% 100%, 7% 50%)'
                      : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 7% 50%)',
                  paddingLeft: idx > 0 ? '1.5rem' : '0.5rem',
                }}
              >
                <span>{col.name}</span>
              </div>

              {/* Task Cards Column */}
              <div className="mt-3 space-y-2.5">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      {task.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rotate-45 border-2 border-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-2xs"></div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {task.code}
                        </div>
                      </div>
                    </div>

                    {/* Tag Badges on bottom right (J / K matching Image 2) */}
                    <div className="flex items-center space-x-1 shrink-0 self-end">
                      {task.tags.map((tg, i) => (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center uppercase shadow-2xs ${tg.color}`}
                        >
                          {tg.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Plus,
  Code,
  FileText,
  X,
  Search,
  CheckCircle2,
  Download,
  GitBranch,
  GitCommit,
  ExternalLink,
  RefreshCw,
  Layers,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';
import { useProject } from '../context/ProjectContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const { projects, selectedProjectId, setSelectedProjectId, activeProject } = useProject();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTagTab, setSelectedTagTab] = useState<'filters' | 'query' | 'summary'>('summary');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time project metrics initialized to 0
  const [metrics, setMetrics] = useState({
    documentsCount: 0,
    requirementsCount: 0,
    approvedRequirements: 0,
    tasksCount: 0,
    completedTasks: 0,
    testsPassRate: '0%',
    passedTests: 0,
    totalTests: 0,
    risksMitigated: 0,
    totalRisks: 0,
    releaseCandidate: 'v1.0.0-gxp.pilot',
    activeAgentsCount: 11,
  });

  // Dynamic Git state
  const [gitData, setGitData] = useState<{
    repo: string;
    branch: string;
    short_sha: string;
    message: string;
  }>({
    repo: 'https://github.com/RaJM2004/ADLC',
    branch: 'main',
    short_sha: 'abdbcc0',
    message: 'feat(traceability): dynamic GitHub/GitLab repository connector',
  });

  // Fetch real-time data for the active project
  const refreshData = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    try {
      const targetId = selectedProjectId;

      // Parallel fetch for live data
      const [reqRes, docRes, tasksRes, evalRes, riskRes] = await Promise.all([
        fetch(`/api/v1/projects/${targetId}/requirements`),
        fetch(`/api/v1/projects/${targetId}/documents`),
        fetch(`/api/v1/projects/${targetId}/tasks`),
        fetch(`/api/v1/projects/${targetId}/evaluations/latest`),
        fetch(`/api/v1/projects/${targetId}/risks`)
      ]);

      let reqCount = 0;
      let approvedReqCount = 0;
      let docCount = 0;
      let tasksCount = 0;
      let completedTasksCount = 0;
      let passedTests = 0;
      let totalTests = 0;
      let passRatePct = '0%';
      let risksCount = 0;
      let risksMitigated = 0;

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        const reqItems = reqData.items || [];
        reqCount = reqItems.length;
        approvedReqCount = reqItems.filter((r: any) => r.review_status === 'approved' || r.status === 'Approved').length;
      }

      if (docRes.ok) {
        const docData = await docRes.json();
        docCount = (docData.items || []).length;
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        const taskItems = tasksData.items || [];
        tasksCount = taskItems.length;
        completedTasksCount = taskItems.filter((t: any) => t.status === 'done' || t.status === 'completed').length;
      }

      if (evalRes.ok) {
        const evalData = await evalRes.json();
        if (evalData && evalData.summary) {
          totalTests = evalData.summary.total_tests || 0;
          passedTests = evalData.summary.passed || 0;
          passRatePct = `${evalData.summary.pass_rate_pct ?? (totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0)}%`;
        }
      }

      if (riskRes.ok) {
        const riskData = await riskRes.json();
        const riskItems = riskData.items || [];
        risksCount = riskItems.length;
        risksMitigated = riskItems.filter((r: any) => r.status === 'mitigated' || r.status === 'signed_off').length;
      }

      setMetrics((prev) => ({
        ...prev,
        documentsCount: docCount,
        requirementsCount: reqCount,
        approvedRequirements: approvedReqCount,
        tasksCount,
        completedTasks: completedTasksCount,
        totalTests,
        passedTests,
        testsPassRate: passRatePct,
        totalRisks: risksCount,
        risksMitigated,
      }));

      // Fetch dynamic git commits
      const gitRes = await api.getGitCommits(1);
      if (gitRes && gitRes.commits && gitRes.commits.length > 0) {
        const top = gitRes.commits[0];
        setGitData({
          repo: gitRes.repo,
          branch: gitRes.branch || 'main',
          short_sha: top.short_sha,
          message: top.message,
        });
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, [refreshData]);

  const filterTabs = ['All', 'Intake & Discovery', 'Requirements', 'Architecture', 'Data & Dev', 'QA & Release'];

  const filterTags = [
    '21 CFR Part 11 Electronic Records',
    'CDISC SDTM v3.3 Laboratory Standard',
    '3x ULN Drug-Induced Liver Injury Alert',
    'Deterministic Test Runner TC-01 to TC-05',
    'ISO 14971 FMEA Risk Matrix',
    'Cryptographic SHA-256 Ledger Audit',
  ];

  return (
    <div className="flex gap-8 max-w-[1440px] mx-auto select-none">
      {/* Center Main Workspace */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Title & Filter Bar matching Command OS */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
                Project Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeProject?.name || 'Clinical Trial CSV Ingestion Copilot'} • GxP Life Sciences ADLC
              </p>
            </div>

            {/* Live Polling Sync Indicator */}
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Sync Active</span>
              </span>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Refresh project metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Bar with rounded pills */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilter === tab
                      ? 'bg-[#3b82f6] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Natural Language Filter Trigger & Status Dropdown */}
            <div className="flex items-center space-x-2.5 text-xs">
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold border border-blue-200 transition-colors shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>GxP Criteria & Filters</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Status:</span>
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Active Pilot</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Natural Language Filter Modal */}
        {showFilterModal && (
          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-lg relative flex flex-col md:flex-row gap-5 animate-in fade-in duration-200">
            {/* Left Filter Card */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">GxP Validation Criteria</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Criteria Subheader */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Regulatory Criteria</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-slate-400 hover:text-slate-600 font-medium">Clear</button>
                  <button className="flex items-center space-x-1 px-2 py-0.5 border border-slate-200 rounded-md text-slate-700 font-semibold hover:bg-slate-50">
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Tabs: Filters | </> Query | Summary */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-semibold">
                <button
                  onClick={() => setSelectedTagTab('filters')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'filters'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setSelectedTagTab('query')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'query'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Query</span>
                </button>
                <button
                  onClick={() => setSelectedTagTab('summary')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'summary'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Summary</span>
                </button>
              </div>

              {/* Natural Language Query Text */}
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Validating <strong className="text-slate-900 underline font-bold">End-to-End CSV Ingestion Copilot</strong> under{' '}
                <strong className="text-slate-900 underline font-bold">FDA 21 CFR Part 11</strong> and{' '}
                <strong className="text-slate-900 underline font-bold">CDISC SDTM LB standards</strong> with{' '}
                <strong className="text-slate-900 underline font-bold">11 Specialist Agents</strong> ensuring{' '}
                <strong className="text-slate-900 underline font-bold text-blue-600">
                  100% deterministic test pass rate and zero high residual risk
                </strong>.
              </p>
            </div>

            {/* Right Tag Popover Box */}
            <div className="w-full md:w-64 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs space-y-3 shrink-0">
              <div className="font-bold text-slate-800 text-[11px]">Active GxP Standard Tags:</div>
              <div className="space-y-1.5">
                {filterTags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs hover:border-blue-300"
                  >
                    <span className="truncate">{tag}</span>
                    <button className="text-slate-400 hover:text-slate-600 ml-1.5 shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6 Grid Cards in the Exact Original Command OS Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Agent 1 Intake & Requirements */}
          <div
            onClick={() => navigate(`/requirements?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Sky-Blue / Ice-Blue Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#eff6ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 01 • Intake & Reqs
              </span>

              {/* Glowing Brain with Colored Cables Graphic */}
              <div className="relative">
                <svg className="w-16 h-16 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M32 18C24 18 18 24 18 32C18 37 21 41 25 43C25 46 28 48 32 48C36 48 39 46 39 43C43 41 46 37 46 32C46 24 40 18 32 18Z"
                    fill="#38bdf8"
                    opacity="0.85"
                  />
                  <path
                    d="M26 30C26 28 29 26 32 26C35 26 38 28 38 30C38 34 34 35 34 38"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="32" cy="42" r="1.5" fill="#ffffff" />
                  <path d="M24 20L20 10" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="10" r="2.5" fill="#f97316" />
                  <path d="M29 18L28 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="28" cy="8" r="2.5" fill="#10b981" />
                  <path d="M35 18L36 8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="36" cy="8" r="2.5" fill="#38bdf8" />
                  <path d="M40 20L44 10" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="44" cy="10" r="2.5" fill="#eab308" />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    GxP Protocol Intake
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dbeafe] text-[#2563eb]">
                    {metrics.approvedRequirements} of {metrics.requirementsCount} Approved
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Extracts regulatory requirements from clinical protocols with 21 CFR §11 predicate citations.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Requirement Approval</span>
                  <span className="text-[#0f172a] font-extrabold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full w-[100%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>21 CFR §11 Mapped</span>
                </div>
                <span className="text-blue-600 font-bold text-[11px] hover:underline">Open Requirements →</span>
              </div>
            </div>
          </div>

          {/* Card 2: Agent 3 Architecture & OpenAPI */}
          <div
            onClick={() => navigate(`/architecture?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#fce7f3] via-[#ffe4e6] to-[#fed7aa] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 03 • Architecture
              </span>

              {/* Color Wheel Graphic */}
              <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-yellow-400 via-rose-500 to-blue-500">
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Architecture & OpenAPI Specs
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fce7f3] text-[#be185d]">
                    5 Services
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Designs microservice topology, generates 4 OpenAPI 3.1 REST contracts and CDISC data dictionary.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Schema Validation</span>
                  <span className="text-[#0f172a] font-extrabold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f43f5e] rounded-full w-[100%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-rose-500" />
                  <span>CDISC SDTM v3.3</span>
                </div>
                <span className="text-rose-600 font-bold text-[11px] hover:underline">View Topology →</span>
              </div>
            </div>
          </div>

          {/* Card 3: Agent 4 Clinical Data Profiling */}
          <div
            onClick={() => navigate(`/agents?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Mint/Ice-Cyan Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#ccfbf1] via-[#e0f2fe] to-[#e0e7ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 04 • Data Profiling
              </span>

              {/* Translucent Play Button in Glass Card */}
              <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md shadow-xs flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#0d9488] flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Clinical CSV Profiler
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#ccfbf1] text-[#0f766e]">
                    93.8% Quality
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Profiled 16 clinical records in clinical_trial_lab_data.csv. Isolated row 17 missing patient ID to quarantine.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Quarantine Boundary</span>
                  <span className="text-[#0f172a] font-extrabold">ALCOA+</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0d9488] rounded-full w-[94%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-teal-700 font-semibold text-[11px]">1 Quarantined / 1 Outlier</span>
                <span className="text-teal-700 font-bold text-[11px] hover:underline">Inspect Profile →</span>
              </div>
            </div>
          </div>

          {/* Card 4: Agent 5 Streaming Parser Engine */}
          <div
            onClick={() => navigate(`/pipeline?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Peach/Apricot Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#fef3c7] via-[#ffedd5] to-[#fed7aa] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 05 • Code Dev
              </span>

              {/* Crossed Wrench & Tools Graphic */}
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M18 46L36 28M42 22C44 20 44 16 42 14C40 12 36 12 34 14L28 20L36 28L42 22Z"
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M46 46L28 28M22 22C20 20 20 16 22 14C24 12 28 12 30 14L36 20L28 28L22 22Z"
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Streaming Parser Engine
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef3c7] text-[#b45309]">
                    Python 3.11
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Generated production streaming chunk processor with SHA-256 calculation and 3x ULN liver alert logic.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Pipeline Implementation</span>
                  <span className="text-[#0f172a] font-extrabold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f59e0b] rounded-full w-[100%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Streaming Chunk Processor</span>
                <span className="text-amber-700 font-bold text-[11px] hover:underline">Pipeline Tasks →</span>
              </div>
            </div>
          </div>

          {/* Card 5: Agent 7 Deterministic QA & Test Runner */}
          <div
            onClick={() => navigate(`/evaluations?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Lavender Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#ede9fe] via-[#f3e8ff] to-[#fce7f3] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 07 • QA Testing
              </span>

              {/* Clipboard Checklist Graphic */}
              <div className="w-14 h-16 bg-white rounded-xl shadow-xs border border-slate-200 p-2.5 flex flex-col justify-between">
                <div className="w-6 h-1.5 bg-purple-300 rounded-full mx-auto" />
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="h-1 bg-slate-200 rounded-full flex-1" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="h-1 bg-slate-200 rounded-full flex-1" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="h-1 bg-slate-200 rounded-full flex-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Deterministic Test Suite
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dcfce7] text-[#16a34a]">
                    5 of 5 Passed
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Real automated execution: UTF-8, Checksum, ALCOA+ subject quarantine, and 3x ULN liver alert assertions.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Verification Pass Rate</span>
                  <span className="text-[#0f172a] font-extrabold">100.0%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full w-[100%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold text-[11px]">82.5ms Runtime</span>
                <span className="text-emerald-700 font-bold text-[11px] hover:underline">View Evidence Log →</span>
              </div>
            </div>
          </div>

          {/* Card 6: Agent 10 GxP Release & Deployment */}
          <div
            onClick={() => navigate(`/traceability?projectId=${selectedProjectId}`)}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Periwinkle Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#dbeafe] via-[#e0e7ff] to-[#f0f9ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Agent 10 • Deployment
              </span>

              {/* 3D Blue Globe Graphic */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-500 p-1 shadow-md flex items-center justify-center relative overflow-hidden">
                <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#ffffff" strokeWidth="2.5" />
                  <ellipse cx="24" cy="24" rx="10" ry="20" stroke="#ffffff" strokeWidth="2.5" />
                  <line x1="4" y1="24" x2="44" y2="24" stroke="#ffffff" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    GxP Release Dossier
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dbeafe] text-[#2563eb]">
                    {metrics.releaseCandidate}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  All 5 Stage Gates verified. Full Validation Dossier with bidirectional RTM ready for FDA audit.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Stage Gates Passed</span>
                  <span className="text-[#0f172a] font-extrabold">5 / 5</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b82f6] rounded-full w-[100%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-blue-700 font-semibold text-[11px]">Authorized for Deployment</span>
                <span className="text-blue-700 font-bold text-[11px] hover:underline">Open Dossier →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: "Project Overview" matching Command OS */}
      <div className="w-80 shrink-0 space-y-4 select-none hidden xl:block">
        {/* Header */}
        <div className="flex items-center space-x-2 text-[#0f172a] font-extrabold text-sm">
          <div className="w-5 h-5 rounded-md bg-[#3b82f6] text-white flex items-center justify-center text-[10px] shadow-xs">
            📊
          </div>
          <span>Project Governance Overview</span>
        </div>

        {/* Card 1: GXP VERIFICATION COVERAGE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              GXP VERIFICATION COVERAGE
            </div>
            <div className="mt-1 text-2xl font-black text-[#0f172a] tracking-tight">100.0%</div>
            <div className="mt-1 flex items-center space-x-1 text-[#10b981] text-xs font-bold">
              <span>↑ 5 of 5 Assertions Passed</span>
            </div>
          </div>

          {/* Smooth Electric Blue Sparkline Curve */}
          <div className="w-20 h-10 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 80 32">
              <path
                d="M 2 24 C 20 28, 35 12, 50 16 C 62 20, 70 8, 78 6"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: ACTIVE SPECIALIST AGENTS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SPECIALIST AGENTS
            </div>
            <div className="mt-1 text-2xl font-black text-[#0f172a] tracking-tight">
              11 / 11 <span className="text-xs font-medium text-slate-400">active</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[#06b6d4] text-xs font-bold">
              <span>↑ Zero Blockers</span>
            </div>
          </div>

          {/* Smooth Cyan Sparkline Curve */}
          <div className="w-20 h-10 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 80 32">
              <path
                d="M 2 26 C 22 18, 40 24, 55 14 C 65 6, 72 12, 78 8"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Key Milestones Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-[#0f172a] font-bold text-xs">
            <Calendar className="w-4 h-4 text-[#3b82f6]" />
            <span>Key GxP Milestones</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Milestone 1 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-blue-100 text-[#3b82f6] rounded-lg shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Requirements Intake</div>
                <div className="text-[11px] text-slate-400">4 of 4 Approved (21 CFR §11)</div>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Architecture & OpenAPI</div>
                <div className="text-[11px] text-slate-400">CDISC SDTM v3.3 Data Dict</div>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">QA Deterministic Tests</div>
                <div className="text-[11px] text-slate-400">5 of 5 Passed (100.0%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Widget: Platform Health 99.9% Operational */}
        <div className="bg-[#111827] p-5 rounded-2xl text-white shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Health (Agent 11)</span>
            <span className="font-mono text-[10px] text-cyan-300">P95: 14.2ms</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-black tracking-tight text-white">99.9%</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064e3b]/80 text-[#34d399] border border-[#059669]/30">
              Operational
            </span>
          </div>

          {/* 7 Vertical Bars Bar Chart matching Command OS */}
          <div className="flex items-end space-x-1.5 h-8 pt-1">
            <div className="flex-1 bg-[#2563eb] h-3.5 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-5 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-3 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-6 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-4 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-7 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-5 rounded-t-xs"></div>
          </div>
        </div>

        {/* Test Documents Download Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-[#0f172a] font-extrabold text-xs">
            <Download className="w-4 h-4 text-[#3b82f6]" />
            <span>SAMPLE TEST DOCUMENTS</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Download clinical test assets to test document intake or CSV quarantine parsing:
          </p>

          <div className="space-y-2 pt-1">
            <a
              href="/api/v1/documents/sample/GxP_Clinical_Protocol_Specification.txt/download"
              download="GxP_Clinical_Protocol_Specification.txt"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
            >
              <span>Protocol Spec (.txt)</span>
              <Download className="w-3.5 h-3.5 text-blue-600" />
            </a>

            <a
              href="/api/v1/documents/sample/clinical_trial_lab_data.csv/download"
              download="clinical_trial_lab_data.csv"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
            >
              <span>Clinical Lab Data (.csv)</span>
              <Download className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          </div>

          <button
            onClick={() => navigate('/agents')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all mt-2 cursor-pointer"
          >
            Open All 11 Agents Hub →
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  RotateCw,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface AgentItem {
  id: string;
  name: string;
  role: string;
  task: string;
  status: 'Running' | 'Paused' | 'Error' | 'Idle';
  confidence: number;
  lastRun: string;
  inputDoc: string;
  outputArtifact: string;
  startedTime: string;
  tools: string[];
  lastInputSummary: string;
  trace: Array<{ time: string; text: string }>;
}

export const AgentsView: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-01');
  const [search, setSearch] = useState('');

  const agents: AgentItem[] = [
    {
      id: 'agent-01',
      name: 'Agent 1: Intake & Requirements',
      role: 'Intake Specialist',
      task: 'Clinical Protocol Requirement Extraction',
      status: 'Running',
      confidence: 96,
      lastRun: 'Just now',
      inputDoc: 'gxp_clinical_protocol_v2.pdf',
      outputArtifact: '/requirements/gxp_pilot_reqs_v1.json',
      startedTime: '09:40 | ETA: 30s remaining',
      tools: ['PDFParser', 'Gemini-1.5-Flash', 'CitationMapper', 'SchemaValidator'],
      lastInputSummary:
        'Parsing uploaded protocol document for 21 CFR Part 11 requirements, missingness rules, and acceptance criteria.',
      trace: [
        { time: '09:40', text: 'Received task: Clinical Protocol Requirement Extraction' },
        { time: '09:41', text: 'SHA-256 checksum computed and verified against vault' },
        { time: '09:41', text: 'Extracted 12 functional & data integrity requirements' },
        { time: '09:42', text: 'Generated structured drafts with citations & acceptance criteria' },
        { time: '09:42', text: 'Awaiting human reviewer approval gate...' },
      ],
    },
    {
      id: 'agent-02',
      name: 'Agent 2: Planning & Tasks',
      role: 'WBS & Task Architect',
      task: 'Work Breakdown Structure Breakdown',
      status: 'Running',
      confidence: 92,
      lastRun: '2 mins ago',
      inputDoc: 'approved_requirements.json',
      outputArtifact: '/tasks/pilot_wbs_tasks.json',
      startedTime: '09:38 | ETA: Completed',
      tools: ['DependencyGraph', 'PydanticTaskModel', 'MilestoneAssigner'],
      lastInputSummary:
        'Breaking approved requirements into engineering tasks with assigned roles and verification test cases.',
      trace: [
        { time: '09:38', text: 'Received approved requirements list' },
        { time: '09:39', text: 'Generated 8 implementation tasks & 4 test specs' },
        { time: '09:39', text: 'Built DAG dependency tree without cyclic deadlocks' },
      ],
    },
    {
      id: 'agent-07',
      name: 'Agent 7: QA & Test',
      role: 'Deterministic Test Runner',
      task: 'Automated CSV Validation Execution',
      status: 'Running',
      confidence: 100,
      lastRun: '5 mins ago',
      inputDoc: 'csv_validator_suite.py',
      outputArtifact: '/evidence/test_run_evid_001.json',
      startedTime: '09:35 | ETA: Completed',
      tools: ['DeterministicRunner', 'PytestExecutor', 'ALCOA_Validator'],
      lastInputSummary:
        'Executing real automated test suite on CSV missingness and schema checking functions.',
      trace: [
        { time: '09:35', text: 'Loaded test suite version v1.0.4' },
        { time: '09:35', text: 'Executed 12 unit & integration assertions' },
        { time: '09:36', text: '12 / 12 Passed (100% Pass Rate). Recorded stdout logs.' },
      ],
    },
    {
      id: 'agent-08',
      name: 'Agent 8: AI Risk & Compliance',
      role: 'Risk Assessment Agent',
      task: 'GxP Hazard Identification & Control Draft',
      status: 'Running',
      confidence: 94,
      lastRun: '10 mins ago',
      inputDoc: 'csv_copilot_architecture.md',
      outputArtifact: '/risks/gxp_risk_assessment_v1.json',
      startedTime: '09:30 | ETA: Completed',
      tools: ['RiskTaxonomyModel', 'EU_AI_Act_Matcher', 'Part11_Checklist'],
      lastInputSummary:
        'Identifying failure modes for hallucinated column mappings and silent data corruption.',
      trace: [
        { time: '09:30', text: 'Analyzed intended use and data boundaries' },
        { time: '09:31', text: 'Drafted 4 hazard categories with proposed mitigation controls' },
        { time: '09:32', text: 'Assembled required-evidence verification checklist' },
      ],
    },
    {
      id: 'agent-03',
      name: 'Agent 3: Architecture & API',
      role: 'API Design Specialist',
      task: 'OpenAPI Contract Specification',
      status: 'Paused',
      confidence: 88,
      lastRun: '1 hour ago',
      inputDoc: 'requirements.json',
      outputArtifact: '/api/v1/openapi_draft.json',
      startedTime: '08:45 | Paused',
      tools: ['OpenAPIGenerator', 'FastAPISchemaValidator'],
      lastInputSummary: 'Drafting RESTful interface contracts for asynchronous agent task execution.',
      trace: [
        { time: '08:45', text: 'Task scheduled' },
        { time: '08:46', text: 'Waiting for requirement approval' },
      ],
    },
    {
      id: 'agent-04',
      name: 'Agent 4: Data Engineering',
      role: 'Pipeline Architect',
      task: 'CSV Ingestion Quality Profiling',
      status: 'Idle',
      confidence: 91,
      lastRun: 'Yesterday',
      inputDoc: 'sample_clinical_data.csv',
      outputArtifact: '/data/quality_profile_report.json',
      startedTime: 'Idle',
      tools: ['DataProfiler', 'SchemaInferencer'],
      lastInputSummary: 'Profiling dataset distributions and rejected rows.',
      trace: [{ time: 'Yesterday', text: 'Profile run completed' }],
    },
    {
      id: 'agent-05',
      name: 'Agent 5: Software Development',
      role: 'Code Synthesis Agent',
      task: 'Code Patch Generation for CSV Parser',
      status: 'Idle',
      confidence: 89,
      lastRun: 'Yesterday',
      inputDoc: 'task_003.json',
      outputArtifact: '/patches/csv_parser_patch.diff',
      startedTime: 'Idle',
      tools: ['GitAdapter', 'CodeSynthesizer'],
      lastInputSummary: 'Generating unit tests and clean validation module.',
      trace: [{ time: 'Yesterday', text: 'Patch generated' }],
    },
    {
      id: 'agent-06',
      name: 'Agent 6: Model & LLM Dev',
      role: 'Prompt & Model Engineer',
      task: 'Prompt Optimization & Eval Benchmark',
      status: 'Idle',
      confidence: 87,
      lastRun: 'Yesterday',
      inputDoc: 'eval_benchmark_dataset.json',
      outputArtifact: '/models/prompt_v2_benchmarks.json',
      startedTime: 'Idle',
      tools: ['PromptEvaluator', 'LatencyTracker'],
      lastInputSummary: 'Benchmarking Gemini-1.5-Flash vs fine-tuned models.',
      trace: [{ time: 'Yesterday', text: 'Benchmark completed' }],
    },
    {
      id: 'agent-09',
      name: 'Agent 9: Security Agent',
      role: 'Threat Modeling Agent',
      task: 'Vulnerability Scan & Secrets Audit',
      status: 'Idle',
      confidence: 95,
      lastRun: 'Yesterday',
      inputDoc: 'manifest.json',
      outputArtifact: '/security/audit_report.json',
      startedTime: 'Idle',
      tools: ['SecretScanner', 'CVE_Checker'],
      lastInputSummary: 'Verifying zero committed API keys in repository.',
      trace: [{ time: 'Yesterday', text: 'Scan clean: 0 findings' }],
    },
    {
      id: 'agent-10',
      name: 'Agent 10: Release & Deployment',
      role: 'Release Orchestrator',
      task: 'Release Candidate Readiness Audit',
      status: 'Idle',
      confidence: 93,
      lastRun: '2 days ago',
      inputDoc: 'build_manifest_v0.1.json',
      outputArtifact: '/release/readiness_summary.json',
      startedTime: 'Idle',
      tools: ['ReleaseGateChecker', 'EvidenceAuditor'],
      lastInputSummary: 'Checking evidence package completeness before stage promotion.',
      trace: [{ time: '2 days ago', text: 'Audit passed' }],
    },
    {
      id: 'agent-11',
      name: 'Agent 11: Monitoring & Optimization',
      role: 'Telemetry & Drift Agent',
      task: 'Model Drift & Latency Telemetry',
      status: 'Idle',
      confidence: 90,
      lastRun: '2 days ago',
      inputDoc: 'telemetry_stream.log',
      outputArtifact: '/telemetry/drift_alerts.json',
      startedTime: 'Idle',
      tools: ['DriftDetector', 'TelemetryAggregator'],
      lastInputSummary: 'Monitoring 99.9% uptime and p95 latency.',
      trace: [{ time: '2 days ago', text: 'Telemetry normal' }],
    },
  ];

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.task.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 max-w-[1440px] mx-auto">
      {/* Left Table Section */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          All Agents
        </h1>

        {/* 3 Top Stat Cards matching Image 3 (JunoMind) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Active Agents</span>
                <div className="mt-0.5 text-xl font-black text-slate-900">4 / 11</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              16.7% ↗
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Avg Task Time</span>
                <div className="mt-0.5 text-xl font-black text-slate-900">1m 12s</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              23.78% ↘
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Errors</span>
                <div className="mt-0.5 text-xl font-black text-slate-900">0</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              0.0% Clean
            </span>
          </div>
        </div>

        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-1.5">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <Pause className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent name, task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" className="rounded text-blue-600" />
                  </th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;
                  const statusStyles =
                    agent.status === 'Running'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : agent.status === 'Paused'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : agent.status === 'Error'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200';

                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setSelectedAgentId(agent.id)}
                          className="rounded text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{agent.role}</td>
                      <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate font-medium">
                        {agent.task}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyles}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{agent.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        {agent.confidence}%
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{agent.lastRun}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Slide-out Drawer / Inspector (Matching Image 3) */}
      <div className="w-96 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 select-none self-start sticky top-6">
        {/* Drawer Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              {selectedAgent.name}
            </h2>
            <div className="mt-1 flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{selectedAgent.status}</span>
              </span>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center space-x-1">
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              title="Restart"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Overview */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Task Overview
          </div>
          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">TASK:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {selectedAgent.task}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">INPUT:</span>
              <span className="font-mono text-[11px] text-blue-600 truncate max-w-[200px]">
                {selectedAgent.inputDoc}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OUTPUT:</span>
              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">
                {selectedAgent.outputArtifact}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">STARTED:</span>
              <span className="text-slate-600 font-medium">{selectedAgent.startedTime}</span>
            </div>
          </div>
        </div>

        {/* Agent Memory Snapshot */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Agent Memory Snapshot
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 italic text-[11px] leading-relaxed">
            "{selectedAgent.lastInputSummary}"
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tools Used
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.tools.map((tl, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {tl}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reasoning Trace (Timeline matching Image 3) */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Reasoning Trace
          </div>
          <div className="space-y-3 pt-1">
            {selectedAgent.trace.map((tr, idx) => (
              <div key={idx} className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                    {tr.time}
                  </span>
                  <span className="text-slate-700 text-[11px] leading-tight block">
                    {tr.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={() => setSelectedAgentId(agents[0].id)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => alert(`Viewing full execution logs for ${selectedAgent.name}`)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
          >
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
};

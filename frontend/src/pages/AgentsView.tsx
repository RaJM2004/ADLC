import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Code2,
  Database,
  Lock,
  Server,
  Activity,
  CheckSquare
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';
import { useProject } from '../context/ProjectContext';

interface AgentItem {
  id: string;
  name: string;
  role: string;
  task: string;
  category: string;
  status: 'Running' | 'Completed' | 'Idle' | 'Error';
  confidence: number;
  lastRun: string;
  inputDoc: string;
  outputArtifact: string;
  startedTime: string;
  tools: string[];
  lastInputSummary: string;
  trace: Array<{ time: string; text: string }>;
  artifactPayload?: any;
}

export const AgentsView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();

  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-01');
  const [search, setSearch] = useState('');
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [artifactModalOpen, setArtifactModalOpen] = useState(false);

  // If url has projectId, apply it
  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Initial 11 Specialist Agents Registry
  const [agents, setAgents] = useState<AgentItem[]>([
    {
      id: 'agent-01',
      name: 'Agent 1: Intake & Requirements',
      role: 'Intake Specialist',
      category: 'Intake',
      task: 'Clinical Protocol Requirement Extraction',
      status: 'Completed',
      confidence: 98,
      lastRun: '1 min ago',
      inputDoc: 'GxP_Clinical_Protocol_Specification.txt',
      outputArtifact: '/requirements/extracted_reqs.json',
      startedTime: 'Active',
      tools: ['DocumentParser', 'Gemini-Flash', 'CitationMapper', 'Part11_Validator'],
      lastInputSummary: 'Extracted 4 mandatory GxP requirements with 21 CFR §11 citations and acceptance criteria.',
      trace: [
        { time: '10:00', text: 'Ingested raw clinical protocol specification' },
        { time: '10:01', text: 'Verified SHA-256 cryptographic checksum' },
        { time: '10:01', text: 'Synthesized structured draft requirements REQ-CSV-001..004' },
        { time: '10:02', text: 'Human approval gate signed off' }
      ]
    },
    {
      id: 'agent-02',
      name: 'Agent 2: Planning & Tasks',
      role: 'WBS & Task Architect',
      category: 'Planning',
      task: 'Work Breakdown Structure Breakdown',
      status: 'Completed',
      confidence: 96,
      lastRun: '2 mins ago',
      inputDoc: 'approved_requirements.json',
      outputArtifact: '/tasks/project_tasks.json',
      startedTime: 'Active',
      tools: ['DAGBuilder', 'DoDGenerator', 'RoleMapper'],
      lastInputSummary: 'Synthesized 4 cross-functional development tasks and 4 formal QA test cases.',
      trace: [
        { time: '10:02', text: 'Loaded 4 approved requirements' },
        { time: '10:02', text: 'Generated 4 tasks with assigned roles & hour estimates' },
        { time: '10:03', text: 'Formulated Definition-of-Done (DoD) verification criteria' }
      ]
    },
    {
      id: 'agent-03',
      name: 'Agent 3: Architecture & API',
      role: 'API Design Specialist',
      category: 'Architecture',
      task: 'OpenAPI 3.1 & Microservice Topology',
      status: 'Completed',
      confidence: 95,
      lastRun: 'Just now',
      inputDoc: 'requirements_spec.json',
      outputArtifact: '/architecture/openapi_v31.json',
      startedTime: 'Active',
      tools: ['OpenAPIGenerator', 'FastAPISchemaValidator', 'CDISC_SDTM_Dict'],
      lastInputSummary: 'Synthesized 5 core microservice topologies and 4 OpenAPI 3.1 REST contracts.',
      trace: [
        { time: '10:05', text: 'Mapped requirements to streaming ingestion gateway' },
        { time: '10:05', text: 'Synthesized OpenAPI 3.1 REST contracts with RBAC scopes' },
        { time: '10:06', text: 'Formulated CDISC SDTM v3.3 clinical data dictionary' }
      ]
    },
    {
      id: 'agent-04',
      name: 'Agent 4: Data Engineering',
      role: 'Data Quality & CDISC Architect',
      category: 'Data',
      task: 'Clinical CSV Profiling & Isolation',
      status: 'Completed',
      confidence: 98,
      lastRun: 'Just now',
      inputDoc: 'clinical_trial_lab_data.csv',
      outputArtifact: '/data/quality_profile.json',
      startedTime: 'Active',
      tools: ['DataProfiler', 'CDISCSchemaValidator', 'QuarantineFilter'],
      lastInputSummary: 'Profiled 16 clinical records. Quality Score: 93.8%. Isolated Line 17 under ALCOA+ rules.',
      trace: [
        { time: '10:08', text: 'Ingested raw CSV byte stream' },
        { time: '10:08', text: 'Validated UTF-8 encoding and 10 CDISC headers' },
        { time: '10:09', text: 'Detected missing AST on Line 12 (missingness rate 6.25%)' },
        { time: '10:09', text: 'Isolated Line 17 with missing USUBJID to quarantine partition' }
      ]
    },
    {
      id: 'agent-05',
      name: 'Agent 5: Software Development',
      role: 'Code Synthesis Agent',
      category: 'Development',
      task: 'Stream Parser Code Patch Synthesis',
      status: 'Completed',
      confidence: 94,
      lastRun: 'Just now',
      inputDoc: 'tasks_and_contracts.json',
      outputArtifact: '/src/clinical_csv_parser.py',
      startedTime: 'Active',
      tools: ['PythonCodeSynthesizer', 'MemoryProfiler', 'ASTValidator'],
      lastInputSummary: 'Synthesized production Python GxP streaming parser with memory-bounded quarantine and safety filters.',
      trace: [
        { time: '10:12', text: 'Loaded task TSK-CSV-001 & TSK-CSV-003' },
        { time: '10:12', text: 'Synthesized streaming generator to guarantee O(1) memory complexity' },
        { time: '10:13', text: 'Inlined deterministic 3x ULN DILI safety boundary check' }
      ]
    },
    {
      id: 'agent-06',
      name: 'Agent 6: Model & LLM Dev',
      role: 'Prompt & Model Engineer',
      category: 'AI / ML',
      task: 'Gemini Regulatory Guardrail Benchmarking',
      status: 'Completed',
      confidence: 97,
      lastRun: 'Just now',
      inputDoc: 'eval_benchmark_suite.json',
      outputArtifact: '/models/prompt_benchmark_v2.json',
      startedTime: 'Active',
      tools: ['PromptBenchmarker', 'LatencyTracker', 'HallucinationScanner'],
      lastInputSummary: 'Benchmarked Gemini model configuration: 98.4% extraction accuracy, 0.0% hallucination rate on clinical protocol text.',
      trace: [
        { time: '10:15', text: 'Configured temperature=0.1 with JSON schema enforcement' },
        { time: '10:15', text: 'Benchmarked 20 clinical protocol extraction passes' },
        { time: '10:16', text: 'Verified 0.0% hallucination rate on regulatory citations' }
      ]
    },
    {
      id: 'agent-07',
      name: 'Agent 7: QA & Test',
      role: 'Deterministic Test Runner',
      category: 'Testing',
      task: 'Automated CSV Validation Execution',
      status: 'Completed',
      confidence: 100,
      lastRun: 'Just now',
      inputDoc: 'clinical_trial_lab_data.csv',
      outputArtifact: '/evaluations/latest_run.json',
      startedTime: 'Active',
      tools: ['DeterministicRunner', 'ALCOA_Validator', '21CFR_AssertionEngine'],
      lastInputSummary: 'Executed 5 deterministic verification tests on live clinical data. Pass Rate: 100.0%.',
      trace: [
        { time: '10:18', text: 'TC-01: UTF-8 & CDISC headers passed' },
        { time: '10:18', text: 'TC-02: Cryptographic SHA-256 hash verified' },
        { time: '10:19', text: 'TC-03: Null USUBJID quarantine verified on Line 17' },
        { time: '10:19', text: 'TC-04: Missingness rate calculated (6.25%)' },
        { time: '10:19', text: 'TC-05: 3x ULN DILI safety alerts asserted on Lines 9-10' }
      ]
    },
    {
      id: 'agent-08',
      name: 'Agent 8: AI Risk & Compliance',
      role: 'Risk Assessment Specialist',
      category: 'Governance',
      task: 'GxP Hazard Identification & Control Draft',
      status: 'Completed',
      confidence: 96,
      lastRun: 'Just now',
      inputDoc: 'approved_requirements.json',
      outputArtifact: '/risks/fmea_matrix.json',
      startedTime: 'Active',
      tools: ['RiskTaxonomyModel', 'ISO14971_Matcher', 'Part11_Checklist'],
      lastInputSummary: 'Synthesized ISO 14971 FMEA with 4 failure modes. Average RPN: 17.5. All mitigations verified.',
      trace: [
        { time: '10:21', text: 'Evaluated 4 approved requirements for clinical failure modes' },
        { time: '10:21', text: 'Calculated Severity, Probability, Detection RPN ratings' },
        { time: '10:22', text: 'Engineered traceable mitigations to 21 CFR Part 11 and ALCOA+' }
      ]
    },
    {
      id: 'agent-09',
      name: 'Agent 9: Security Agent',
      role: 'Threat Modeling Agent',
      category: 'Security',
      task: 'STRIDE Threat Model & Secrets Scan',
      status: 'Completed',
      confidence: 99,
      lastRun: 'Just now',
      inputDoc: 'codebase_manifest.json',
      outputArtifact: '/security/audit_report.json',
      startedTime: 'Active',
      tools: ['SecretScanner', 'STRIDE_Auditor', 'TLSEnforcer'],
      lastInputSummary: 'Completed STRIDE Threat Model & Secrets Scan: 0 vulnerabilities found, TLS 1.3 enforced, 21 CFR §11 audit trail secure.',
      trace: [
        { time: '10:24', text: 'Scanned repository for committed secrets: 0 findings' },
        { time: '10:24', text: 'Verified SHA-256 HMAC ledger chaining' },
        { time: '10:25', text: 'Asserted strict TLS 1.3 transport encryption' }
      ]
    },
    {
      id: 'agent-10',
      name: 'Agent 10: Release & Deployment',
      role: 'Release Orchestrator',
      category: 'Release',
      task: 'Release Candidate Readiness Audit',
      status: 'Completed',
      confidence: 100,
      lastRun: 'Just now',
      inputDoc: 'gxp_quality_gates.json',
      outputArtifact: '/release/readiness_dossier.json',
      startedTime: 'Active',
      tools: ['StageGateChecker', 'EvidenceAuditor', 'ManifestBuilder'],
      lastInputSummary: 'All 5 Stage Gates passed: 100% requirements verified, 100% tests passed, 0 security defects. Authorized for Deployment.',
      trace: [
        { time: '10:27', text: 'Checked Stage Gate 1: Requirements Intake (Approved)' },
        { time: '10:27', text: 'Checked Stage Gate 2: Architecture & OpenAPI (Approved)' },
        { time: '10:28', text: 'Checked Stage Gate 3: Deterministic Tests 5/5 (Passed)' },
        { time: '10:28', text: 'Checked Stage Gate 4: FMEA Risks (Mitigated)' },
        { time: '10:28', text: 'Authorized for GxP Production Pilot Deployment' }
      ]
    },
    {
      id: 'agent-11',
      name: 'Agent 11: Monitoring & Optimization',
      role: 'Telemetry & Drift Agent',
      category: 'Operations',
      task: 'Runtime Telemetry & Drift Monitoring',
      status: 'Completed',
      confidence: 98,
      lastRun: 'Just now',
      inputDoc: 'runtime_telemetry.log',
      outputArtifact: '/telemetry/runtime_metrics.json',
      startedTime: 'Active',
      tools: ['DriftDetector', 'LatencyTracker', 'CostLedger'],
      lastInputSummary: 'Runtime Health: 99.99% uptime, P95 latency 14.2ms, zero data drift, $0.0014 cost expenditure.',
      trace: [
        { time: '10:30', text: 'Polled runtime latency: P50=3.8ms, P95=14.2ms' },
        { time: '10:30', text: 'Evaluated KL-divergence for clinical lab distributions: 0.012 (No drift)' },
        { time: '10:31', text: 'Logged token cost: $0.0014 USD' }
      ]
    }
  ]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // Live Agent Trigger
  const handleRunAgent = async (agentId: string) => {
    if (!selectedProjectId) return;
    try {
      setRunningAgentId(agentId);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/agents/${agentId}/run`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Agent execution failed');
      }
      const data = await res.json();
      
      // Update agent state
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === agentId || a.id.replace('-', '_') === agentId.replace('-', '_')) {
            return {
              ...a,
              status: 'Completed',
              confidence: data.confidence || 98,
              lastRun: 'Just now',
              lastInputSummary: data.summary || a.lastInputSummary,
              artifactPayload: data.artifact,
              trace: (data.trace || []).map((t: string) => ({
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: t
              }))
            };
          }
          return a;
        })
      );
    } catch (err: any) {
      alert(`Error running agent: ${err.message}`);
    } finally {
      setRunningAgentId(null);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.task.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px] mx-auto">
      {/* Left Table Section */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header & Project Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>All 11 Specialist AI Agents</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Operational
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous multi-agent orchestration engine governing the full ADLC lifecycle.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.is_demo ? '(Demo)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Operational Agents</span>
                <div className="mt-0.5 text-2xl font-black text-slate-900">11 / 11</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              All Active
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Avg Ingestion Latency</span>
                <div className="mt-0.5 text-2xl font-black text-slate-900">129 ms</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Sub-Second
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400">Stage Gate Blockers</span>
                <div className="mt-0.5 text-2xl font-black text-slate-900">0</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% Cleared
            </span>
          </div>
        </div>

        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700">Specialist Agent Registry</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent name, task, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Core Directive</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3 text-right">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgents.map((agent) => {
                  const isSelected = agent.id === selectedAgentId;
                  const isRunning = runningAgentId === agent.id;

                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {agent.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate font-medium">
                        {agent.task}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{agent.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        {agent.confidence}%
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunAgent(agent.id);
                          }}
                          disabled={isRunning}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 inline-flex items-center space-x-1 transition-colors"
                        >
                          <RotateCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                          <span>{isRunning ? 'Running...' : 'Run Agent'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Slide-out Drawer / Inspector */}
      <div className="w-full lg:w-96 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 select-none self-start sticky top-6">
        {/* Drawer Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              {selectedAgent.name}
            </h2>
            <div className="mt-1 flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{selectedAgent.status}</span>
              </span>
              <span className="text-xs font-bold text-slate-500">
                Confidence: {selectedAgent.confidence}%
              </span>
            </div>
          </div>

          {/* Trigger Action */}
          <button
            onClick={() => handleRunAgent(selectedAgent.id)}
            disabled={runningAgentId === selectedAgent.id}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs hover:from-blue-500 hover:to-indigo-500 flex items-center space-x-1"
          >
            <RotateCw className={`w-3.5 h-3.5 ${runningAgentId === selectedAgent.id ? 'animate-spin' : ''}`} />
            <span>Execute</span>
          </button>
        </div>

        {/* Task Overview */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Agent Directive & Schema
          </div>
          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">TASK:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {selectedAgent.task}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">INPUT REF:</span>
              <span className="font-mono text-[11px] text-blue-600 truncate max-w-[200px]">
                {selectedAgent.inputDoc}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ARTIFACT:</span>
              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]">
                {selectedAgent.outputArtifact}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Memory Snapshot */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Latest Execution Output Summary
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-[11px] leading-relaxed">
            "{selectedAgent.lastInputSummary}"
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tools & Grounding Guardrails
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

        {/* Reasoning Trace */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Autonomous Reasoning Trace
          </div>
          <div className="space-y-2.5 pt-1 max-h-48 overflow-y-auto">
            {selectedAgent.trace.map((tr, idx) => (
              <div key={idx} className="flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
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
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setArtifactModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Inspect Artifact</span>
          </button>

          <button
            onClick={() => handleRunAgent(selectedAgent.id)}
            disabled={runningAgentId === selectedAgent.id}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1"
          >
            <RotateCw className={`w-3.5 h-3.5 ${runningAgentId === selectedAgent.id ? 'animate-spin' : ''}`} />
            <span>Re-Run</span>
          </button>
        </div>
      </div>

      {/* Artifact Inspector Modal */}
      {artifactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Artifact Output: {selectedAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setArtifactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Output artifact for <span className="font-mono text-blue-600 font-bold">{selectedAgent.outputArtifact}</span>
            </div>

            <div className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs max-h-96 overflow-y-auto leading-relaxed">
              <pre>{JSON.stringify(selectedAgent.artifactPayload || {
                agent: selectedAgent.name,
                status: "Completed",
                summary: selectedAgent.lastInputSummary,
                artifact_reference: selectedAgent.outputArtifact
              }, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setArtifactModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

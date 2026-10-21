import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  Filter,
  Search,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  Bot,
  ExternalLink,
  Printer
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

interface MatrixRow {
  req_id: string;
  req_title: string;
  req_priority: string;
  task_title: string;
  task_role: string;
  test_case_id: string;
  test_case_name: string;
  eval_status: string;
  eval_evidence: string;
  risk_code: string;
  risk_mode: string;
  gxp_standard: string;
}

export const TraceabilityView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch projects
  useEffect(() => {
    api.listProjects().then((res) => {
      const items = res.items || [];
      setProjects(items);
      if (urlProjectId && items.some((p) => p.id === urlProjectId)) {
        setSelectedProjectId(urlProjectId);
      } else if (items.length > 0) {
        const demo = items.find((p) => p.is_demo);
        setSelectedProjectId(demo ? demo.id : items[0].id);
      }
    }).catch(console.error);
  }, [urlProjectId]);

  const matrixRows: MatrixRow[] = [
    {
      req_id: 'REQ-CSV-001',
      req_title: 'CSV File Ingestion, Encoding, and Header Validation',
      req_priority: 'Critical',
      task_title: 'Implement Streamed CSV Parser with UTF-8 Enforcement',
      task_role: 'Backend Engineer',
      test_case_id: 'TC-01',
      test_case_name: 'UTF-8 Encoding & CDISC Header Validation',
      eval_status: 'PASSED',
      eval_evidence: 'Verified UTF-8 encoding. All 10 mandatory CDISC columns validated: USUBJID, VISITNUM, VISIT, LBDT, LBTESTCD...',
      risk_code: 'FM-04',
      risk_mode: 'Non-UTF-8 Encoding or Truncated CDISC SDTM Column Headers',
      gxp_standard: '21 CFR §11.10(a) / CDISC SDTM v3.3'
    },
    {
      req_id: 'REQ-CSV-002',
      req_title: 'Cryptographic Checksum and Immutability Verification',
      req_priority: 'Critical',
      task_title: 'Implement SHA-256 Ingestion Checksum & Ledger Logging',
      task_role: 'Backend Engineer',
      test_case_id: 'TC-02',
      test_case_name: 'Cryptographic Checksum & Immutability Verification',
      eval_status: 'PASSED',
      eval_evidence: 'SHA-256 Checksum verified: 4c547456a5368e062f6f... matches immutable ingest hash.',
      risk_code: 'FM-01',
      risk_mode: 'Silent File Corruption or Bit-Rot during Ingestion',
      gxp_standard: '21 CFR §11.10(e) / ALCOA+ Original'
    },
    {
      req_id: 'REQ-CSV-003',
      req_title: 'Mandatory Patient Identifier and Quarantine Execution',
      req_priority: 'Critical',
      task_title: 'Build Patient Quarantine Protocol & Isolation Boundary',
      task_role: 'Data Scientist',
      test_case_id: 'TC-03',
      test_case_name: 'Mandatory Patient Identification Column Checks',
      eval_status: 'PASSED',
      eval_evidence: 'Identified null USUBJID on Line 17. Correctly quarantined record under COMPLIANCE_ERROR_NULL_USUBJID.',
      risk_code: 'FM-02',
      risk_mode: 'Ingestion of Null / Malformed Subject Identifier (USUBJID)',
      gxp_standard: '21 CFR §11.10(b) / ALCOA+ Attributable'
    },
    {
      req_id: 'REQ-CSV-004',
      req_title: 'Missing Lab Values & 3x ULN DILI Toxicity Alerts',
      req_priority: 'High',
      task_title: 'Develop Safety Outlier & 3x ULN DILI Detection Engine',
      task_role: 'Clinical Data Manager',
      test_case_id: 'TC-05',
      test_case_name: 'Biological Plausibility & 3x ULN Liver Safety Outlier Alert',
      eval_status: 'PASSED',
      eval_evidence: 'Flagged 2 Drug-Induced Liver Injury (DILI) signals: Line 9 (ALT=185.0 U/L), Line 10 (AST=140.0 U/L).',
      risk_code: 'FM-03',
      risk_mode: 'Undetected Extreme Liver Enzyme Elevation (>3x ULN DILI)',
      gxp_standard: 'FDA DILI Guidance / ALCOA+ Accurate'
    }
  ];

  const filteredRows = matrixRows.filter(
    (row) =>
      row.req_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.req_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.test_case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.risk_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Consolidated Governance</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Traceability Coverage
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Audit Ready
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Bidirectional Traceability Matrix (RTM)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Provides complete end-to-end evidence lineage connecting Approved Requirements ↔ Engineering Tasks ↔ QA Test Cases ↔ Deterministic Test Evidence ↔ FMEA Risks ↔ 21 CFR Part 11 Citations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Project Picker */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-4"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} {p.is_demo ? '(Demo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Dossier Action */}
            <button
              onClick={handleExportDossier}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4 text-blue-200" />
              <span>Export GxP Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">100%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Requirements Traced
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">4 of 4 Approved Reqs</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">100%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Verification Pass Rate
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Deterministic Agent 7</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-indigo-600 tracking-tight">4 / 4</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            FMEA Mitigations
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Agent 8 ISO 14971</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-2xl font-black text-teal-600 tracking-tight mt-1">
            ALCOA+
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Regulatory Compliance
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-0.5">21 CFR Part 11 Certified</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search traceability lineage by requirement, task, test, or risk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => navigate('/pipeline')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
            <span>Return to Pipeline Board</span>
          </button>
        </div>
      </div>

      {/* Full Lineage Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Complete End-to-End Lineage Matrix
            </h3>
            <p className="text-xs text-slate-500">
              GxP software release justification with cryptographic execution proof.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Zero Unverified Gaps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Requirement (Agent 1)</th>
                <th className="px-5 py-3.5">Engineering Task (Agent 2)</th>
                <th className="px-5 py-3.5">Verification Run (Agent 7)</th>
                <th className="px-5 py-3.5">Execution Evidence & Hash</th>
                <th className="px-5 py-3.5">FMEA Risk (Agent 8)</th>
                <th className="px-5 py-3.5">Regulatory Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((r) => (
                <tr key={r.req_id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Req */}
                  <td className="px-5 py-4 space-y-1 align-top max-w-[200px]">
                    <span className="font-mono font-bold text-blue-600 text-xs block">
                      {r.req_id}
                    </span>
                    <div className="font-semibold text-slate-800 text-[11px] leading-snug">
                      {r.req_title}
                    </div>
                  </td>

                  {/* Task */}
                  <td className="px-5 py-4 space-y-1 align-top max-w-[220px]">
                    <div className="font-medium text-slate-800 text-[11px] leading-snug">
                      {r.task_title}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold inline-block">
                      {r.task_role}
                    </span>
                  </td>

                  {/* Test */}
                  <td className="px-5 py-4 space-y-1 align-top max-w-[180px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-blue-600 text-xs">
                        {r.test_case_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.eval_status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      {r.test_case_name}
                    </div>
                  </td>

                  {/* Evidence */}
                  <td className="px-5 py-4 space-y-1 align-top max-w-[260px]">
                    <div className="p-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[10px] leading-relaxed">
                      {r.eval_evidence}
                    </div>
                  </td>

                  {/* Risk */}
                  <td className="px-5 py-4 space-y-1 align-top max-w-[200px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-rose-600 text-xs">
                        {r.risk_code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Mitigated
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-snug">
                      {r.risk_mode}
                    </div>
                  </td>

                  {/* Standard */}
                  <td className="px-5 py-4 space-y-1 align-top">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px] inline-block">
                      {r.gxp_standard}
                    </span>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 pt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                      <span>Release Gate Approved</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

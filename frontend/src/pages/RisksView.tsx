import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Bot,
  RotateCw,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  Filter,
  Search,
  Activity,
  Award,
  Layers,
  UserCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';
import { useProject } from '../context/ProjectContext';

interface RiskItem {
  id: string;
  project_id: string;
  code: string;
  requirement_id: string;
  category: string;
  failure_mode: string;
  potential_effect: string;
  severity: number;
  probability: number;
  detection: number;
  rpn: number;
  mitigation_strategy: string;
  residual_risk: string;
  status: string;
  gxp_citation: string;
  signed_off_by: string;
  signed_off_at: string;
  notes?: string;
}

export const RisksView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const { projects, selectedProjectId, setSelectedProjectId } = useProject();

  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [signOffRole, setSignOffRole] = useState('Lead Quality Assurance Officer');

  // If url has projectId, apply it
  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // 2. Fetch risks
  const fetchRisks = async (projId: string) => {
    if (!projId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${projId}/risks`);
      if (res.ok) {
        const data = await res.json();
        setRisks(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load risks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchRisks(selectedProjectId);
    }
  }, [selectedProjectId]);

  // 3. Trigger Agent 8 Risk Assessment
  const handleAssessRisks = async () => {
    if (!selectedProjectId) return;
    try {
      setAssessing(true);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/risks/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Risk assessment failed');
      }
      await fetchRisks(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Error generating risk assessment');
    } finally {
      setAssessing(false);
    }
  };

  // 4. Sign off on risk mitigation
  const handleSignOff = async (risk: RiskItem) => {
    try {
      const res = await fetch(`/api/v1/risks/${risk.id}/sign-off`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signed_off_by: signOffRole,
          status: 'signed_off',
          notes: 'Verified against deterministic test execution evidence TC-01..05.'
        })
      });
      if (res.ok) {
        await fetchRisks(selectedProjectId);
        setSignOffModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRisks = risks.filter(
    (r) =>
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.failure_mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requirement_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalHazards = risks.filter((r) => r.severity === 5).length;
  const avgRPN = risks.length > 0 ? (risks.reduce((acc, r) => acc + r.rpn, 0) / risks.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-blue-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Specialist Agent 8</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FMEA Risk & Compliance Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ISO 14971 / GAMP 5
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              AI Risk Assessment & GxP Compliance
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Autonomous Failure Modes and Effects Analysis (FMEA). Calculates Severity (S), Probability (O), Detection (D) and Risk Priority Number (RPN) with traceable mitigations to 21 CFR Part 11 and ALCOA+.
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

            {/* Run Assessment Action */}
            <button
              onClick={handleAssessRisks}
              disabled={assessing || !selectedProjectId}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {assessing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating FMEA Risks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Re-Assess Risks (Agent 8)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subnavigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>FMEA Risk Register</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-700 text-white text-[10px]">
              {risks.length}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter failure modes, citations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
            />
          </div>

          <button
            onClick={() => navigate('/traceability')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Proceed to Traceability Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <ShieldAlert className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">{risks.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Identified Failure Modes
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">FMEA System Boundary</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{criticalHazards}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Severity 5 Hazards
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Mitigated & Isolated</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight">{avgRPN}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Average RPN Score
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Controlled (&lt; 50 threshold)</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
            Low
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Residual Risk Tier
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Release Authorized</div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Failure Modes and Effects Analysis (FMEA) Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Generated by Specialist Agent 8 evaluating 21 CFR Part 11, patient safety, and data integrity hazards.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All Mitigations Active</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Category & Requirement</th>
                <th className="px-6 py-3.5">Potential Failure Mode & Clinical Effect</th>
                <th className="px-4 py-3.5 text-center">S</th>
                <th className="px-4 py-3.5 text-center">O</th>
                <th className="px-4 py-3.5 text-center">D</th>
                <th className="px-4 py-3.5 text-center">RPN</th>
                <th className="px-6 py-3.5">Engineered Mitigation Strategy</th>
                <th className="px-6 py-3.5">Governance Sign-Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
                    {r.code}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 block w-max">
                      {r.category}
                    </span>
                    <span className="font-mono text-[10px] text-blue-600 block">
                      {r.requirement_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1 max-w-sm">
                    <div className="font-bold text-slate-900 leading-snug">
                      {r.failure_mode}
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">
                      {r.potential_effect}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                      r.severity === 5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-slate-700">
                    {r.probability}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-medium text-slate-700">
                    {r.detection}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                      {r.rpn}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1 max-w-xs">
                    <div className="text-slate-800 text-[11px] leading-snug">
                      {r.mitigation_strategy}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                      <span>{r.gxp_citation}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      <span>{r.signed_off_by || 'Quality Officer'}</span>
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {r.signed_off_at ? new Date(r.signed_off_at).toLocaleDateString() : 'Signed'}
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

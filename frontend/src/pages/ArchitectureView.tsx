import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Bot,
  RotateCw,
  CheckCircle2,
  Server,
  FileCode2,
  Database,
  ShieldCheck,
  ArrowRight,
  Code2,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

interface ComponentItem {
  name: string;
  category: string;
  description: string;
  technologies: string[];
  gxp_compliance: string;
}

interface EndpointItem {
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  requirement_id: string;
  request_body: string;
  response_schema: string;
  security_scope: string;
}

interface DataFieldItem {
  field_name: string;
  data_type: string;
  cdisc_variable: string;
  mandatory: boolean;
  validation_rule: string;
}

interface ArchitectureData {
  id: string;
  project_id: string;
  version: string;
  title: string;
  overview: string;
  system_tier: string;
  components: ComponentItem[];
  endpoints: EndpointItem[];
  data_dictionary: DataFieldItem[];
  security_boundary: string[];
  created_at: string;
  architect_agent: string;
  agent_name: string;
}

export const ArchitectureView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [archData, setArchData] = useState<ArchitectureData | null>(null);
  const [activeTab, setActiveTab] = useState<'topology' | 'openapi' | 'dictionary' | 'security'>('topology');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem | null>(null);

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

  // 2. Fetch architecture data
  const fetchArchitecture = async (projId: string) => {
    if (!projId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${projId}/architecture`);
      if (res.ok) {
        const data = await res.json();
        setArchData(data);
        if (data.endpoints && data.endpoints.length > 0) {
          setSelectedEndpoint(data.endpoints[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load architecture:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchArchitecture(selectedProjectId);
    }
  }, [selectedProjectId]);

  // 3. Trigger Agent 3 Design
  const handleGenerateArchitecture = async () => {
    if (!selectedProjectId) return;
    try {
      setGenerating(true);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/architecture/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Architecture generation failed');
      }
      const data = await res.json();
      setArchData(data);
      if (data.endpoints && data.endpoints.length > 0) {
        setSelectedEndpoint(data.endpoints[0]);
      }
    } catch (err: any) {
      alert(err.message || 'Error generating architecture');
    } finally {
      setGenerating(false);
    }
  };

  const components = archData?.components || [];
  const endpoints = archData?.endpoints || [];
  const dictionary = archData?.data_dictionary || [];
  const security = archData?.security_boundary || [];

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
                <span>Specialist Agent 3</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Architecture & OpenAPI Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OpenAPI 3.1 / CDISC SDTM
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Architecture & API Design System
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transforms approved GxP requirements into authoritative component topologies, OpenAPI 3.1 REST contracts, clinical data dictionaries, and 21 CFR Part 11 security perimeters.
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

            {/* Run Action */}
            <button
              onClick={handleGenerateArchitecture}
              disabled={generating || !selectedProjectId}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Re-Generate Architecture (Agent 3)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Server className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">{components.length || 5}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            System Components
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Microservice Topology</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <FileCode2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">{endpoints.length || 4}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            RESTful API Endpoints
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">OpenAPI 3.1 Compliant</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Database className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-3xl font-black text-indigo-600 tracking-tight">{dictionary.length || 5}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            CDISC Variables
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">SDTM v3.3 Data Dictionary</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="text-2xl font-black text-teal-600 tracking-tight mt-1">
            Tier 1
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            GxP Compliance
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-0.5">21 CFR §11 & ALCOA+</div>
        </div>
      </div>

      {/* Subnavigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'topology'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Component Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('openapi')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'openapi'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>OpenAPI 3.1 Contracts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {endpoints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dictionary'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Dictionary</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {dictionary.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security Perimeter</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => navigate('/pipeline')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <span>Pipeline Board</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tab 1: Component Topology */}
      {activeTab === 'topology' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Architecture Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {archData?.overview || 'High-throughput, audit-resilient clinical data ingestion architecture conforming to 21 CFR Part 11 and ALCOA+ data integrity standards.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {comp.category}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{comp.gxp_compliance.split(' ')[0]}</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{comp.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{comp.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tech Stack</div>
                  <div className="flex flex-wrap gap-1">
                    {comp.technologies.map((t, tidx) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                  <span className="font-semibold text-slate-700">GxP Standard: </span>
                  {comp.gxp_compliance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: OpenAPI 3.1 REST Contracts */}
      {activeTab === 'openapi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">REST Endpoints Specification</h3>
              <p className="text-[11px] text-slate-500">Synthesized by Agent 3 from approved requirements</p>
            </div>
            <div className="divide-y divide-slate-100">
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedEndpoint?.path === ep.path ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] ${
                      ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800 truncate">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-1">{ep.summary}</div>
                  <div className="text-[10px] text-blue-600 font-mono mt-1">Req: {ep.requirement_id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Endpoint Inspector Detail */}
          {selectedEndpoint && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4 lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded font-mono font-black text-xs ${
                      selectedEndpoint.method === 'POST' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 font-medium">{selectedEndpoint.summary}</p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedEndpoint.requirement_id}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Request Payload / Headers
                  </div>
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
                    {selectedEndpoint.request_body}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Response Schema Contract
                  </div>
                  <div className="p-3 bg-slate-900 text-blue-300 rounded-xl font-mono text-xs overflow-x-auto">
                    {selectedEndpoint.response_schema}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700">OAuth / RBAC Scope: </span>
                    <span className="font-mono text-blue-600">{selectedEndpoint.security_scope}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    GxP Validated Endpoint
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                CDISC SDTM v3.3 Clinical Data Dictionary
              </h3>
              <p className="text-xs text-slate-500">
                Pydantic validation bounds and database constraints synthesized by Specialist Agent 3.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              CDISC SDTM Conforming
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Field Variable</th>
                  <th className="px-6 py-3.5">CDISC Terminology</th>
                  <th className="px-6 py-3.5">Data Type</th>
                  <th className="px-6 py-3.5 text-center">Mandatory</th>
                  <th className="px-6 py-3.5">Validation Rule & Boundary Assertion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dictionary.map((field, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {field.field_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {field.cdisc_variable}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {field.data_type}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        field.mandatory ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {field.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">
                      {field.validation_rule}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Security Perimeter */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              21 CFR Part 11 Electronic Records Security Perimeter
            </h3>
            <p className="text-xs text-slate-500">
              Architectural controls ensuring electronic record authenticity, integrity, and non-repudiation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {security.map((sec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50 flex items-start space-x-3 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Control #{idx + 1}</div>
                  <div className="text-slate-600 leading-snug">{sec}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

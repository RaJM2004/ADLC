import React, { useEffect, useState } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  Upload,
  FileText,
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  ChevronRight,
  FileCheck2,
  AlertTriangle,
  FolderGit2,
  BookOpen,
  ExternalLink,
  Download,
  Info
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

interface Requirement {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  acceptance_criteria: string[];
  source_reference: string;
  review_status: 'draft' | 'approved' | 'rejected';
  reviewer?: string;
  reviewed_at?: string;
}

export const RequirementsView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [showSourceGuide, setShowSourceGuide] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Load projects
  useEffect(() => {
    api.listProjects().then((res) => {
      const items = res.items || [];
      setProjects(items);
      if (urlProjectId && items.some((p) => p.id === urlProjectId)) {
        setSelectedProjectId(urlProjectId);
      } else {
        const demo = items.find((p) => p.is_demo);
        if (demo) {
          setSelectedProjectId(demo.id);
        } else if (items.length > 0) {
          setSelectedProjectId(items[0].id);
        }
      }
    }).catch(() => null);
  }, [urlProjectId]);

  // Fetch documents for selected project
  const fetchProjectDocs = async (projId: string) => {
    if (!projId) return;
    try {
      const res = await fetch(`/api/v1/projects/${projId}/documents`);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setProjectDocs(items);
        if (items.length > 0) {
          setUploadedDoc(items[items.length - 1]);
        }
      }
    } catch {
      // ignore
    }
  };

  // Fetch requirements for selected project
  const fetchRequirements = async (projId: string) => {
    if (!projId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${projId}/requirements`);
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.items || []);
        if (data.items && data.items.length > 0) {
          setSelectedReq(data.items[0]);
        } else {
          setSelectedReq(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchRequirements(selectedProjectId);
      fetchProjectDocs(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Handle Multi-Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProjectId) return;

    try {
      setUploading(true);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch(`/api/v1/projects/${selectedProjectId}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || `Upload failed for ${files[i].name}`);
        }
      }
      await fetchProjectDocs(selectedProjectId);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Load Built-in Sample GxP Document
  const handleLoadSample = async (type: 'spec' | 'csv') => {
    if (!selectedProjectId) return;
    try {
      setLoadingSample(true);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/documents/load-sample?sample_type=${type}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to load sample document');
      }
      await fetchProjectDocs(selectedProjectId);
    } catch (err: any) {
      alert(`Error loading sample document: ${err.message}`);
    } finally {
      setLoadingSample(false);
    }
  };

  // Run Agent 1 Extraction across all project documents
  const handleExtractWithAgent1 = async () => {
    if (!selectedProjectId) return;
    try {
      setExtracting(true);
      const docIds = projectDocs.map((d) => d.id);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/requirements/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_ids: docIds.length > 0 ? docIds : null,
          document_id: uploadedDoc?.id || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Extraction failed');
      }

      await fetchRequirements(selectedProjectId);
    } catch (err: any) {
      alert(`Agent 1 Extraction failed: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  // Human Review Gate: Approve / Reject
  const handleReviewDecision = async (reqId: string, decision: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/v1/requirements/${reqId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
        if (selectedReq?.id === reqId) {
          setSelectedReq(updated);
        }
      }
    } catch (err: any) {
      alert(`Review action failed: ${err.message}`);
    }
  };

  // Bulk Approve All Drafts
  const handleApproveAllDrafts = async () => {
    const drafts = requirements.filter((r) => r.review_status === 'draft');
    if (drafts.length === 0) return;
    try {
      setLoading(true);
      for (const req of drafts) {
        const res = await fetch(`/api/v1/requirements/${req.id}/review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'approved' }),
        });
        if (res.ok) {
          const updated = await res.json();
          setRequirements((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
          if (selectedReq?.id === req.id) {
            setSelectedReq(updated);
          }
        }
      }
    } catch (err: any) {
      alert(`Error approving all: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requirements
    .filter((r) => activeFilter === 'all' || r.review_status === activeFilter)
    .filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
    );

  const approvedCount = requirements.filter((r) => r.review_status === 'approved').length;
  const draftCount = requirements.filter((r) => r.review_status === 'draft').length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
              Requirements Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              Agent 1 Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            AI-assisted requirement extraction, citation mapping, and human approval gates.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400 font-semibold">Active Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.is_demo ? '(Pilot GxP)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Ingestion & Agent 1 Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Document Ingestion & Text Extraction
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-normal">
            Upload clinical protocols, GxP specs, or guidelines (PDF, DOCX, TXT, CSV). The system validates SHA-256 integrity, extracts structured text, and invokes Specialist Agent 1.
          </p>

          {projectDocs.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ingested Documents ({projectDocs.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {projectDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2 bg-blue-50/70 rounded-xl border border-blue-200/70 text-xs flex items-center space-x-2 font-mono text-[11px] text-blue-900"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold">{doc.filename}</span>
                    <span className="text-slate-400">({doc.file_size_bytes} B)</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      SHA: {doc.sha256_checksum?.slice(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : uploadedDoc && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/70 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono text-[11px] text-blue-900">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span className="font-bold">{uploadedDoc.filename}</span>
                <span className="text-slate-400">({uploadedDoc.file_size_bytes} bytes)</span>
                <span className="text-slate-500 truncate max-w-xs">
                  SHA-256: {uploadedDoc.sha256_checksum?.slice(0, 16)}...
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          <button
            onClick={() => handleLoadSample('spec')}
            disabled={loadingSample}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Load sample FDA 21 CFR Part 11 Protocol Specification from sample_documents/"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{loadingSample ? 'Loading Spec...' : '+ Sample Spec'}</span>
          </button>

          <button
            onClick={() => handleLoadSample('csv')}
            disabled={loadingSample}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            title="Load sample multi-site clinical lab CSV data from sample_documents/"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>{loadingSample ? 'Loading CSV...' : '+ Sample CSV'}</span>
          </button>

          <label className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>{uploading ? 'Ingesting...' : 'Upload Files'}</span>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowSourceGuide(!showSourceGuide)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              showSourceGuide
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sources Guide</span>
          </button>

          <button
            onClick={handleExtractWithAgent1}
            disabled={extracting}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{extracting ? 'Agent 1 Extracting...' : 'Extract with Agent 1'}</span>
          </button>
        </div>
      </div>

      {/* Online Document Sources & Sample Files Guide Card */}
      {showSourceGuide && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-blue-200 p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                <Info className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Where to Get Documents to Upload</h4>
            </div>
            <button
              onClick={() => setShowSourceGuide(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Section 1: Pre-packaged Local Files */}
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 font-bold text-sky-900">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>1. Local Sample Files in this Project</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Ready-to-use clinical files are already included in your workspace folder{' '}
                <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono text-sky-800 font-semibold">
                  ADLC/sample_documents/
                </code>:
              </p>
              <ul className="space-y-1.5 text-slate-700 text-[11px]">
                <li className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-sky-200/50">
                  <span className="font-mono font-semibold">GxP_Clinical_Protocol_Specification.txt</span>
                  <button
                    onClick={() => handleLoadSample('spec')}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[10px] underline ml-2"
                  >
                    1-Click Load
                  </button>
                </li>
                <li className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-sky-200/50">
                  <span className="font-mono font-semibold">clinical_trial_lab_data.csv</span>
                  <button
                    onClick={() => handleLoadSample('csv')}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[10px] underline ml-2"
                  >
                    1-Click Load
                  </button>
                </li>
              </ul>
            </div>

            {/* Section 2: Authoritative Online Sources */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 font-bold text-slate-800">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>2. Free Online Repositories to Download Real Documents</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <a
                    href="https://clinicaltrials.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center justify-between"
                  >
                    <span>ClinicalTrials.gov (Protocols & SAPs)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-slate-500 mt-0.5">
                    Search any clinical trial (e.g. NCT03458429) &rarr; Go to <strong>"Study Documents"</strong> tab &rarr; Download official Protocol or Statistical Analysis Plan PDF.
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <a
                    href="https://github.com/cdisc-org"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center justify-between"
                  >
                    <span>CDISC Open Source Public Datasets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-slate-500 mt-0.5">
                    Official sample CDISC SDTM and ADaM clinical datasets (Laboratory `LB`, Demographics `DM`, Adverse Events `AE`).
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <a
                    href="https://www.fda.gov/regulatory-information/search-fda-guidance-documents"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center justify-between"
                  >
                    <span>FDA Guidance Documents & 21 CFR Part 11</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-slate-500 mt-0.5">
                    Search for "Computer Software Assurance (CSA)" or "Part 11 Electronic Records" for regulatory PDF specifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Requirements Explorer */}
      <div className="flex gap-6">
        {/* Left List Section */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filter Pills & Search */}
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({requirements.length})
              </button>
              <button
                onClick={() => setActiveFilter('draft')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeFilter === 'draft'
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Draft ({draftCount})
              </button>
              <button
                onClick={() => setActiveFilter('approved')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeFilter === 'approved'
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Approved ({approvedCount})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {draftCount > 0 && (
                <button
                  onClick={handleApproveAllDrafts}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Approve all draft requirements in 1 click"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve All ({draftCount})</span>
                </button>
              )}

              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Next Step Banner when requirements are approved */}
          {approvedCount > 0 && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-900">
                    {approvedCount} GxP Requirement{approvedCount > 1 ? 's' : ''} Approved with Audit Trace
                  </div>
                  <div className="text-emerald-700 text-[11px]">
                    Human governance gate confirmed. Proceed to Pipeline & Task breakdown.
                  </div>
                </div>
              </div>

              <NavLink
                to="/pipeline"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <span>Go to Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          )}

          {/* Requirements List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-semibold bg-white rounded-2xl border border-slate-200">
              Loading requirements...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No requirements extracted yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click <strong>"Extract with Agent 1"</strong> to automatically draft structured requirements with regulatory citations.
              </p>
              <button
                onClick={handleExtractWithAgent1}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#3b82f6] text-white font-bold text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Agent 1 Extraction</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                const statusStyles =
                  req.review_status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : req.review_status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 shadow-sm ring-2 ring-blue-500/15'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-blue-600">
                            {req.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                            {req.type}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles}`}
                          >
                            {req.review_status}
                          </span>
                        </div>
                        <h4 className="mt-1.5 text-xs font-bold text-[#0f172a]">{req.title}</h4>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
                    </div>

                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-sm">Source: {req.source_reference}</span>
                      <span className="font-semibold text-slate-600">
                        {req.acceptance_criteria?.length || 0} Criteria
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail & Human Review Drawer */}
        {selectedReq && (
          <div className="w-96 shrink-0 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 self-start sticky top-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-black text-blue-600">
                  {selectedReq.id}
                </span>
                <h3 className="mt-1 text-sm font-extrabold text-[#0f172a] leading-tight">
                  {selectedReq.title}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                  selectedReq.review_status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedReq.review_status === 'rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {selectedReq.review_status}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Specification
              </span>
              <p className="text-slate-700 leading-relaxed p-3 rounded-xl bg-slate-50 border border-slate-100">
                {selectedReq.description}
              </p>
            </div>

            {/* Source Reference Citation */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Source Reference Citation
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 font-medium">
                {selectedReq.source_reference}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Acceptance Criteria ({selectedReq.acceptance_criteria?.length || 0})
              </span>
              <div className="space-y-1.5">
                {(selectedReq.acceptance_criteria || []).map((crit, i) => (
                  <div key={i} className="flex items-start space-x-2 text-slate-700 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Human Review Gate Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Human Governance Gate
              </div>

              {selectedReq.review_status === 'approved' ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approved by {selectedReq.reviewer || 'Lead QA'}</span>
                  </div>
                  <button
                    onClick={() => handleReviewDecision(selectedReq.id, 'rejected')}
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Revoke
                  </button>
                </div>
              ) : selectedReq.review_status === 'rejected' ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Rejected</span>
                  </div>
                  <button
                    onClick={() => handleReviewDecision(selectedReq.id, 'approved')}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    Re-approve
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleReviewDecision(selectedReq.id, 'rejected')}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleReviewDecision(selectedReq.id, 'approved')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Draft</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

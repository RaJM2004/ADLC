import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Upload,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../../api/client';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('Clinical Trial CSV Ingestion Copilot');
  const [description, setDescription] = useState(
    'Automated clinical trial laboratory dataset ingestion, patient ID reconciliation, and safety outlier checks.'
  );
  const [intendedUse, setIntendedUse] = useState(
    'GxP-governed assistive software tool for Clinical Data Managers to verify lab data missingness under 21 CFR Part 11.'
  );
  const [domain, setDomain] = useState('GxP / Regulated Clinical Systems');
  const [riskTier, setRiskTier] = useState('High');

  // Requirements Source State
  const [docSourceType, setDocSourceType] = useState<'sample' | 'upload' | 'later'>('sample');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [autoExtract, setAutoExtract] = useState(true);

  // Submission / Loading State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setUploadedFiles((prev) => {
        const existing = new Set(prev.map((f) => f.name));
        return [...prev, ...selected.filter((f) => !existing.has(f.name))];
      });
    }
  };

  const removeFile = (nameToRemove: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== nameToRemove));
  };

  const handleCreateAndIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Project Name is required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      // Step 1: Create Project
      setCurrentStep('1/3: Creating project record in database...');
      const newProject = await api.createProject({
        name,
        description,
        intended_use: intendedUse,
        domain,
        risk_tier: riskTier,
        owner: 'Clinical Architecture Team',
      });

      const projectId = newProject.id;
      const documentIds: string[] = [];

      // Step 2: Ingest Requirements Document(s)
      if (docSourceType === 'sample') {
        setCurrentStep('2/3: Ingesting sample GxP Protocol Spec (SHA-256 integrity check)...');
        const res = await fetch(`/api/v1/projects/${projectId}/documents/load-sample?sample_type=spec`, {
          method: 'POST',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Failed to ingest sample document');
        }
        const docData = await res.json();
        documentIds.push(docData.id);
      } else if (docSourceType === 'upload' && uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i];
          setCurrentStep(`2/3: Uploading ${i + 1}/${uploadedFiles.length}: ${file.name} & calculating SHA-256...`);
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch(`/api/v1/projects/${projectId}/documents`, {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || `Failed to upload ${file.name}`);
          }
          const docData = await res.json();
          documentIds.push(docData.id);
        }
      }

      // Step 3: Auto-extract with Specialist Agent 1 across all ingested documents
      if (autoExtract && documentIds.length > 0) {
        setCurrentStep(`3/3: Invoking Specialist Agent 1 across ${documentIds.length} ingested document(s)...`);
        const extractRes = await fetch(`/api/v1/projects/${projectId}/requirements/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_ids: documentIds }),
        });
        if (!extractRes.ok) {
          console.warn('Extraction completed with warnings');
        }
      }

      setCurrentStep('Success! Opening Project Workspace...');
      if (onProjectCreated) {
        onProjectCreated(projectId);
      }
      onClose();
      // Navigate to requirements view where extracted requirements are immediately ready
      navigate(`/requirements?projectId=${projectId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Create New ADLC Project & Intake
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Set up regulatory scope and attach requirements for instant Agent 1 extraction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleCreateAndIngest} className="p-7 overflow-y-auto space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Project Details */}
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Step 1: Project Scope & Regulatory Intent</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Clinical Trial Data Ingestion & GxP Copilot"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Regulatory Domain</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Risk Classification</label>
                <select
                  value={riskTier}
                  onChange={(e) => setRiskTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Critical">Critical (21 CFR Part 11 / EU Annex 11)</option>
                  <option value="High">High (GxP Clinical Trial Operations)</option>
                  <option value="Medium">Medium (Internal Operational Tool)</option>
                  <option value="Low">Low (Exploratory / Non-GxP)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Intended Use & Objective</label>
              <textarea
                rows={2}
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
              />
            </div>
          </div>

          {/* Step 2: Requirements Document Attachment */}
          <div className="pt-2 space-y-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Step 2: Ingest Requirements Document</span>
              <span className="text-blue-600 font-semibold normal-case">No separate upload needed</span>
            </div>

            <div className="space-y-2.5">
              {/* Option A: Sample GxP Spec */}
              <label
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  docSourceType === 'sample'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="docSource"
                  checked={docSourceType === 'sample'}
                  onChange={() => setDocSourceType('sample')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      Use Built-in GxP Protocol Specification (Recommended)
                    </span>
                    <span className="bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      1-Click Ready
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    Includes FDA 21 CFR Part 11, ALCOA+, clinical data ingestion, missingness limits, and safety outlier verification rules.
                  </p>
                </div>
              </label>

              {/* Option B: Upload Custom File */}
              <label
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  docSourceType === 'upload'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="docSource"
                  checked={docSourceType === 'upload'}
                  onChange={() => setDocSourceType('upload')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Upload Your Own Documents (Multi-File Supported)</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Select multiple clinical protocol PDFs, specifications (.docx, .txt), and data tables (.csv) at once.
                  </p>

                  {docSourceType === 'upload' && (
                    <div className="mt-3 space-y-2">
                      <label className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Files (or select multiple)</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx,.txt,.csv,.md"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {uploadedFiles.length > 0 ? (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Selected Files ({uploadedFiles.length}):
                          </div>
                          {uploadedFiles.map((f) => (
                            <div
                              key={f.name}
                              className="flex items-center justify-between p-2 bg-blue-50/70 border border-blue-200/50 rounded-xl text-xs font-mono text-blue-900"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-semibold truncate text-[11px]">{f.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  ({(f.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(f.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-2 shrink-0 cursor-pointer"
                                title="Remove file"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          No files selected yet. You can select both your protocol spec and dataset CSV!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Option C: Start Blank */}
              <label
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  docSourceType === 'later'
                    ? 'border-blue-400 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="docSource"
                  checked={docSourceType === 'later'}
                  onChange={() => setDocSourceType('later')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-slate-900">Start Blank</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Create an empty project shell and attach requirements manually later.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Automated Agent Extraction Toggle */}
          {docSourceType !== 'later' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-3.5 bg-blue-50/40 rounded-2xl border border-blue-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    Auto-Extract with Specialist Agent 1
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Extracts structured GxP functional requirements with acceptance criteria upon creation.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoExtract}
                onChange={(e) => setAutoExtract(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          )}

          {/* Loading Step Tracker */}
          {loading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-center animate-pulse">
              <div className="flex items-center justify-center space-x-2 text-blue-700 font-bold text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>{currentStep}</span>
              </div>
              <p className="text-[11px] text-blue-600/80">
                Please wait while MongoDB records and AI requirement extraction complete.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Create Project & Ingest Requirements</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

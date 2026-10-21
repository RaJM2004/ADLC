import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderGit2, Sparkles, Filter, X } from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';
import { StatusChip } from '../components/common/StatusChip';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.listProjects();
      setProjects(res.items || []);
    } catch (err: any) {
      alert(`Error loading projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSeedDemo = async () => {
    try {
      const demo = await api.seedDemoProject();
      await loadProjects();
      navigate(`/projects/${demo.id}`);
    } catch (err: any) {
      alert(`Error seeding pilot project: ${err.message}`);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">ADLC Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Governed AI systems tracked across all eight lifecycle stages.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSeedDemo}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load GxP Pilot Project</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, domain, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Showing {filtered.length} of {projects.length} projects
        </span>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No matching projects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new ADLC project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#0f172a] hover:text-blue-600 line-clamp-1">
                    {project.name}
                  </h3>
                  <StatusChip status={project.status} size="sm" />
                </div>
                {project.is_demo && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    GxP Pilot Project
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-normal">
                  {project.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Stage:</span>
                  <span className="font-bold text-blue-600 capitalize">
                    {project.current_stage.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Risk Tier:</span>
                  <span className="font-bold text-slate-700">{project.risk_tier}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Owner: {project.owner}</span>
                  <span className="text-blue-600 font-bold hover:underline">
                    Open Workspace →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project & Intake Modal */}
      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={loadProjects}
      />
    </div>
  );
};

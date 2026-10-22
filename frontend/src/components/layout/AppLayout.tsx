import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Folder,
  Workflow,
  Layers,
  CreditCard,
  Zap,
  TrendingUp,
  Globe,
  Shield,
  Settings,
  History,
  Search,
  List,
  Plus,
  LogOut,
  HelpCircle,
  FolderGit2,
  FileCheck2,
  Bot,
  CheckSquare,
  FileText,
  Server
} from 'lucide-react';

import { api } from '../../api/client';
import { CreateProjectModal } from '../modals/CreateProjectModal';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleQuickNewProject = async () => {
    try {
      const demo = await api.seedDemoProject();
      navigate(`/projects/${demo.id}`);
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-slate-800">
      {/* Outer App Frame (Matching Command OS rounded canvas) */}
      <div className="w-full max-w-[1540px] bg-white rounded-[32px] shadow-[0_25px_70px_rgba(14,165,233,0.25)] border border-white/80 overflow-hidden flex min-h-[90vh]">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 select-none p-5">
          <div className="space-y-6">
            {/* Logo matching Command OS */}
            <div className="flex items-center space-x-3 px-1">
              {/* Cyan / Blue 3D Cube Icon */}
              <div className="w-8 h-8 relative flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="16" cy="16" r="4.5" fill="#38bdf8" />
                </svg>
              </div>
              <div className="font-extrabold text-slate-900 tracking-tight text-[15px] font-sans">
                COMMAND OS
              </div>
            </div>

            {/* Sidebar Sections */}
            <div className="space-y-5 text-xs font-semibold">
              {/* WORKSPACE */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  WORKSPACE
                </div>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <LayoutGrid className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Folder className="w-4 h-4 text-blue-500" />
                  <span>Projects</span>
                </NavLink>

                <NavLink
                  to="/requirements"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <FileCheck2 className="w-4 h-4 text-blue-500" />
                  <span>Requirements</span>
                </NavLink>

                <NavLink
                  to="/pipeline"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Workflow className="w-4 h-4 text-blue-500" />
                  <span>Pipeline</span>
                </NavLink>

                <NavLink
                  to="/architecture"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Server className="w-4 h-4 text-blue-500" />
                  <span>Architecture & APIs</span>
                </NavLink>

                <NavLink
                  to="/tasks"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Tasks</span>
                </NavLink>

              </div>

              {/* INTELLIGENCE & ASSURANCE */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  INTELLIGENCE & GXP
                </div>
                <NavLink
                  to="/agents"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span>AI Agents</span>
                </NavLink>

                <NavLink
                  to="/evaluations"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  <span>Evaluations & Tests</span>
                </NavLink>

                <NavLink
                  to="/risks"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Risk & Compliance</span>
                </NavLink>

                <NavLink
                  to="/traceability"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Traceability</span>
                </NavLink>
              </div>

              {/* SYSTEM */}
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SYSTEM
                </div>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span>Settings</span>
                </NavLink>

                <NavLink
                  to="/evidence"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/25 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <History className="w-4 h-4 text-blue-500" />
                  <span>Audit Logs</span>
                </NavLink>
              </div>
            </div>
          </div>

          {/* User Profile Card matching Command OS */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center space-x-3 px-1">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Adham H."
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 leading-tight">Adham H.</div>
                <div className="text-[10px] text-slate-400 font-medium">UI/UX Designer</div>
              </div>
            </div>

            {/* Dark Slate Logout Button */}
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#475569] hover:bg-[#334155] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top Header Bar matching Command OS */}
          <header className="h-20 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
            {/* Search Pill */}
            <div className="relative w-84">
              <Search className="w-4 h-4 absolute left-4 top-3 text-blue-500" />
              <input
                type="text"
                placeholder="Search tasks, files, or notes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#f1f5f9] hover:bg-[#eaf0f6] focus:bg-white border border-transparent focus:border-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center space-x-4">
              {/* Grid / List Switcher Pill */}
              <div className="flex items-center p-1 bg-[#f1f5f9] rounded-full border border-slate-200/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#3b82f6] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#3b82f6] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>

              {/* + New Project Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Project</span>
              </button>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-8 relative">
            <Outlet />

            {/* Floating Soft Blue Help Bubble in bottom right matching screenshot */}
            <div className="fixed bottom-9 right-9 z-40">
              <button
                className="w-10 h-10 rounded-2xl bg-[#c7d2fe]/70 hover:bg-[#c7d2fe] text-blue-800 font-bold text-sm flex items-center justify-center shadow-md transition-all hover:scale-105"
                title="Help & Documentation"
              >
                ?
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* New Project & Intake Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

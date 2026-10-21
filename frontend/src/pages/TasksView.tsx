import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Filter,
  CheckSquare,
  User,
  ShieldCheck,
  ChevronRight,
  Calendar,
  FolderGit2
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

interface TaskItem {
  id: string;
  project_id: string;
  requirement_id: string;
  title: string;
  description: string;
  role: string;
  estimated_hours: number;
  priority: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  definition_of_done: string[];
  dependencies: string[];
}

interface TestCaseItem {
  id: string;
  project_id: string;
  requirement_id: string;
  title: string;
  category: string;
  preconditions: string;
  test_steps: string[];
  expected_result: string;
  is_automated: boolean;
  status: string;
}

export const TasksView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [testCases, setTestCases] = useState<TestCaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'tests'>('tasks');

  // Load projects
  useEffect(() => {
    api.listProjects().then((res) => {
      const items = res.items || [];
      setProjects(items);
      if (urlProjectId && items.some((p) => p.id === urlProjectId)) {
        setSelectedProjectId(urlProjectId);
      } else if (items.length > 0) {
        // default to first or demo
        const demo = items.find((p) => p.is_demo);
        setSelectedProjectId(demo ? demo.id : items[0].id);
      }
    }).catch(() => null);
  }, [urlProjectId]);

  const fetchTasksAndTests = async (projId: string) => {
    if (!projId) return;
    try {
      setLoading(true);
      const [tasksRes, testsRes] = await Promise.all([
        fetch(`/api/v1/projects/${projId}/tasks`),
        fetch(`/api/v1/projects/${projId}/test-cases`),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.items || []);
      }
      if (testsRes.ok) {
        const data = await testsRes.json();
        setTestCases(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasksAndTests(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Run Agent 2 Planning Breakdown
  const handleGeneratePlan = async () => {
    if (!selectedProjectId) return;
    try {
      setGenerating(true);
      const res = await fetch(`/api/v1/projects/${selectedProjectId}/planning/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Plan generation failed');
      }
      await fetchTasksAndTests(selectedProjectId);
    } catch (err: any) {
      alert(`Agent 2 generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Move task status
  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'review' | 'done') => {
    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      }
    } catch (err: any) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  const columns: Array<{ id: 'todo' | 'in_progress' | 'review' | 'done'; title: string; color: string }> = [
    { id: 'todo', title: 'To Do', color: 'border-slate-300 text-slate-700' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-400 text-blue-700' },
    { id: 'review', title: 'Quality Review', color: 'border-amber-400 text-amber-700' },
    { id: 'done', title: 'Done / Verified', color: 'border-emerald-400 text-emerald-700' },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
              Planning & Work Breakdown
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
              Agent 2 Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Automated work breakdown structure, role assignments, definition of done, and QA test cases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Agent 2 Generating...' : 'Run Agent 2 Planning'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tasks' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engineering Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tests' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QA Test Cases ({testCases.length})
          </button>
        </div>

        {/* Next Stage Shortcut */}
        <button
          onClick={() => navigate('/evaluations')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          <span>Run Deterministic Test Suite (Agent 7)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500 font-semibold bg-white rounded-2xl border border-slate-200">
          Loading tasks and test suites...
        </div>
      ) : activeTab === 'tasks' ? (
        tasks.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No tasks generated yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click <strong>"Run Agent 2 Planning"</strong> to break down your approved requirements into engineering tasks with role assignments and DoD.
            </p>
            <button
              onClick={handleGeneratePlan}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Work Breakdown Structure</span>
            </button>
          </div>
        ) : (
          /* Kanban Board Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-extrabold text-xs text-slate-800">{col.title}</span>
                    <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 bg-white rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {t.requirement_id}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              t.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-700'
                                : t.priority === 'High'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs leading-snug">{t.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{t.description}</p>

                        {/* Role & Hours */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span className="font-semibold flex items-center space-x-1 text-slate-700">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{t.role}</span>
                          </span>
                          <span className="font-mono text-slate-400">{t.estimated_hours}h</span>
                        </div>

                        {/* Definition of Done Checklist */}
                        {t.definition_of_done && t.definition_of_done.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              Definition of Done:
                            </span>
                            {t.definition_of_done.slice(0, 2).map((dod, idx) => (
                              <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-600">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span className="truncate">{dod}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status Transition Quick Actions */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400 font-medium">Move to:</span>
                          <div className="flex items-center space-x-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'todo')}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              >
                                To Do
                              </button>
                            )}
                            {col.id !== 'in_progress' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'in_progress')}
                                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold"
                              >
                                Progress
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => handleStatusChange(t.id, 'done')}
                                className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* QA Test Cases View */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((tc) => (
              <div key={tc.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{tc.id}</span>
                      <span className="text-[10px] font-bold text-slate-400">({tc.requirement_id})</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{tc.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {tc.category}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Preconditions:
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px]">
                    {tc.preconditions}
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Test Steps:
                  </div>
                  <div className="space-y-1 pl-2">
                    {tc.test_steps.map((st, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-[11px]">
                        <span className="font-mono text-slate-400">{i + 1}.</span>
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Expected: {tc.expected_result}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {tc.is_automated ? 'Automated Deterministic' : 'Manual QA'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

interface PlaceholderViewProps {
  title: string;
  subtitle: string;
  agentBadge?: string;
  milestone: string;
  description: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  subtitle,
  agentBadge,
  milestone,
  description,
}) => {
  const navigate = useNavigate();
  const [pilotProject, setPilotProject] = useState<Project | null>(null);

  useEffect(() => {
    api.listProjects().then((res) => {
      const demo = (res.items || []).find((p) => p.is_demo);
      if (demo) setPilotProject(demo);
    }).catch(() => null);
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-[#0f172a] tracking-tight">{title}</h1>
            {agentBadge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {agentBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 self-start sm:self-auto">
          {milestone}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-2xl mx-auto shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#0f172a]">{title} Workspace</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Pilot Workflow Integration:</span>
          </div>
          <p className="text-slate-500">
            This module connects directly with the pilot workflow{' '}
            <strong className="text-slate-700">"End-to-End CSV Copilot for GxP ADLC"</strong>.
          </p>
        </div>

        {pilotProject ? (
          <button
            onClick={() => navigate(`/projects/${pilotProject.id}`)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl shadow-md shadow-blue-500/25 transition-colors"
          >
            <span>Open CSV Copilot Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={async () => {
              const demo = await api.seedDemoProject();
              navigate(`/projects/${demo.id}`);
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-xl shadow-md shadow-blue-500/25 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Pilot Project</span>
          </button>
        )}
      </div>
    </div>
  );
};

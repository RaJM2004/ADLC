import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Plus,
  Code,
  FileText,
  X,
  Search
} from 'lucide-react';
import { api } from '../api/client';
import { Project } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [demoProject, setDemoProject] = useState<Project | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTagTab, setSelectedTagTab] = useState<'filters' | 'query' | 'summary'>('summary');

  useEffect(() => {
    api.listProjects()
      .then((res) => {
        const demo = (res.items || []).find((p) => p.is_demo);
        if (demo) setDemoProject(demo);
      })
      .catch(() => null);
  }, []);

  const handleCardNavigation = () => {
    if (demoProject) {
      navigate(`/projects/${demoProject.id}`);
    } else {
      navigate('/pipeline');
    }
  };

  const filterTabs = ['All', 'Product Design', 'Brand Design', 'Motion', 'Web', 'Engineering'];

  const filterTags = [
    'Security engineer',
    'Cybersecurity engineer',
    'Information security engineer',
    'Application security engineer',
    'Cloud security engineer',
    'Detection & response engineer',
  ];

  return (
    <div className="flex gap-8 max-w-[1440px] mx-auto select-none">
      {/* Center Main Workspace */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Title & Filter Bar matching Command OS */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Project Workspace
          </h1>

          {/* Filter Bar with rounded pills */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeFilter === tab
                      ? 'bg-[#3b82f6] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Natural Language Filter Trigger & Status Dropdown */}
            <div className="flex items-center space-x-2.5 text-xs">
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold border border-blue-200 transition-colors shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Find with filters</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Status:</span>
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 font-bold shadow-2xs">
                  <span>Active</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Natural Language Search / Filter Modal matching user's newest screenshot */}
        {showFilterModal && (
          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-lg relative flex flex-col md:flex-row gap-5 animate-in fade-in duration-200">
            {/* Left Filter Card */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800">Find with filters</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Criteria Subheader */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Criteria</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-slate-400 hover:text-slate-600 font-medium">Clear</button>
                  <button className="flex items-center space-x-1 px-2 py-0.5 border border-slate-200 rounded-md text-slate-700 font-semibold hover:bg-slate-50">
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Tabs: Filters | </> Query | Summary */}
              <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-semibold">
                <button
                  onClick={() => setSelectedTagTab('filters')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'filters'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setSelectedTagTab('query')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'query'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Query</span>
                </button>
                <button
                  onClick={() => setSelectedTagTab('summary')}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-md transition-all ${
                    selectedTagTab === 'summary'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Summary</span>
                </button>
              </div>

              {/* Natural Language Query Text */}
              <p className="text-xs text-slate-700 leading-relaxed pt-1">
                Looking for <strong className="text-slate-900 underline font-bold">Engineering managers</strong> or{' '}
                <strong className="text-slate-900 underline font-bold">CTOs</strong> at companies in the{' '}
                <strong className="text-slate-900 underline font-bold">US, UK</strong>, or{' '}
                <strong className="text-slate-900 underline font-bold">Australia</strong> with{' '}
                <strong className="text-slate-900 underline font-bold">$10-$250M</strong> in revenue or{' '}
                <strong className="text-slate-900 underline font-bold">series A-C</strong> with{' '}
                <strong className="text-slate-900 underline font-bold">$10M+ in funding</strong> that use{' '}
                <strong className="text-slate-900 underline font-bold">AWS</strong> or{' '}
                <strong className="text-slate-900 underline font-bold">Google Cloud</strong> and are{' '}
                <strong className="text-slate-900 underline font-bold text-blue-600">
                  hiring security engineers
                </strong>
              </p>
            </div>

            {/* Right Tag Popover Box */}
            <div className="w-full md:w-64 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs space-y-3 shrink-0">
              <div className="font-bold text-slate-800 text-[11px]">Summary title:</div>
              <div className="space-y-1.5">
                {filterTags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs hover:border-blue-300"
                  >
                    <span>{tag}</span>
                    <button className="text-slate-400 hover:text-slate-600 ml-1.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6 Grid Cards matching Command OS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: FlowPay Dashboard */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Sky-Blue / Ice-Blue Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#dbeafe] via-[#e0f2fe] to-[#eff6ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Product Design
              </span>

              {/* Glowing Brain with Colored Cables Graphic */}
              <div className="relative">
                <svg className="w-16 h-16 drop-shadow-sm" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M32 18C24 18 18 24 18 32C18 37 21 41 25 43C25 46 28 48 32 48C36 48 39 46 39 43C43 41 46 37 46 32C46 24 40 18 32 18Z"
                    fill="#38bdf8"
                    opacity="0.85"
                  />
                  <path
                    d="M26 30C26 28 29 26 32 26C35 26 38 28 38 30C38 34 34 35 34 38"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="32" cy="42" r="1.5" fill="#ffffff" />
                  <path d="M24 20L20 10" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="20" cy="10" r="2.5" fill="#f97316" />
                  <path d="M29 18L28 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="28" cy="8" r="2.5" fill="#10b981" />
                  <path d="M35 18L36 8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="36" cy="8" r="2.5" fill="#38bdf8" />
                  <path d="M40 20L44 10" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="44" cy="10" r="2.5" fill="#eab308" />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    FlowPay Dashboard
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#ffe4e6] text-[#e11d48]">
                    High
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Designing a scalable financial dashboard focused on clarity and usability.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Design Phase</span>
                  <span className="text-[#0f172a] font-extrabold">72%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full w-[72%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-800">
                    AD
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    RK
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    +3
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">Due in 3 days</span>
              </div>
            </div>
          </div>

          {/* Card 2: Nova Identity System */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#fce7f3] via-[#ffe4e6] to-[#fed7aa] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Brand Design
              </span>

              {/* Color Wheel Graphic */}
              <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden bg-gradient-to-tr from-yellow-400 via-rose-500 to-blue-500">
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Nova Identity System
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dbeafe] text-[#2563eb]">
                    Review
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Developing a complete visual identity including logo, typography, and brand...
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Review Progress</span>
                  <span className="text-[#0f172a] font-extrabold">88%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b82f6] rounded-full w-[88%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-800">
                    EM
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    TL
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    +2
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">Due Tomorrow</span>
              </div>
            </div>
          </div>

          {/* Card 3: Launch Intro Sequence */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Mint/Ice-Cyan Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#ccfbf1] via-[#e0f2fe] to-[#e0e7ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Motion Design
              </span>

              {/* Translucent Play Button in Glass Card */}
              <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-md shadow-xs flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-[#38bdf8] flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Launch Intro Sequence
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dcfce7] text-[#16a34a]">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Creating a short cinematic motion sequence for product launch.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Animation</span>
                  <span className="text-[#0f172a] font-extrabold">46%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full w-[46%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-teal-800">
                    JS
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    +1
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">Due Feb 15</span>
              </div>
            </div>
          </div>

          {/* Card 4: Payment SDK */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Peach/Apricot Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#fef3c7] via-[#ffedd5] to-[#fed7aa] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Engineering
              </span>

              {/* Crossed Wrench & Tools Graphic */}
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none">
                  <path
                    d="M18 46L36 28M42 22C44 20 44 16 42 14C40 12 36 12 34 14L28 20L36 28L42 22Z"
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M46 46L28 28M22 22C20 20 20 16 22 14C24 12 28 12 30 14L36 20L28 28L22 22Z"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Payment SDK
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef3c7] text-[#d97706]">
                    Paused
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Building a modular SDK for secure payment integrations.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Core Development</span>
                  <span className="text-[#0f172a] font-extrabold">12%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#f97316] rounded-full w-[12%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-amber-800">
                    KL
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">
                  Awaiting specifications
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Focus Calendar */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Cool Gray/Blue Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#f8fafc] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                UX / Product
              </span>

              {/* Clean Teal Calendar Graphic */}
              <div className="w-16 h-16 rounded-2xl bg-white p-2.5 shadow-sm flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="10" width="36" height="32" rx="6" stroke="#0d9488" strokeWidth="3" />
                  <line x1="6" y1="20" x2="42" y2="20" stroke="#0d9488" strokeWidth="2.5" />
                  <line x1="16" y1="6" x2="16" y2="12" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                  <line x1="32" y1="6" x2="32" y2="12" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                  <rect x="12" y="26" width="6" height="6" rx="1.5" fill="#14b8a6" />
                  <rect x="22" y="26" width="6" height="6" rx="1.5" fill="#f87171" />
                  <rect x="30" y="26" width="6" height="6" rx="1.5" fill="#14b8a6" />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Focus Calendar
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dcfce7] text-[#16a34a]">
                    Active
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Minimal scheduling tool designed to support deep work and focus.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Wireframes</span>
                  <span className="text-[#0f172a] font-extrabold">80%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e293b] rounded-full w-[80%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-emerald-800">
                    AD
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    LM
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">Due Feb 25</span>
              </div>
            </div>
          </div>

          {/* Card 6: Asset Explorer */}
          <div
            onClick={handleCardNavigation}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Top Pastel Periwinkle Illustration Banner */}
            <div className="h-40 bg-gradient-to-br from-[#dbeafe] via-[#e0e7ff] to-[#f0f9ff] relative flex items-center justify-center p-4">
              <span className="absolute top-3.5 left-3.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-600 shadow-2xs">
                Web / Web3
              </span>

              {/* 3D Blue Globe Graphic */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-sky-400 to-indigo-500 p-1 shadow-md flex items-center justify-center relative overflow-hidden">
                <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#ffffff" strokeWidth="2.5" />
                  <ellipse cx="24" cy="24" rx="10" ry="20" stroke="#ffffff" strokeWidth="2.5" />
                  <line x1="4" y1="24" x2="44" y2="24" stroke="#ffffff" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-blue-600 transition-colors">
                    Asset Explorer
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#dbeafe] text-[#2563eb]">
                    Review
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Interactive visualization for on-chain asset performance and insights.
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Interactive Layer</span>
                  <span className="text-[#0f172a] font-extrabold">55%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b82f6] rounded-full w-[55%]"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-800">
                    RS
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                    +1
                  </div>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">Reviewing assets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: "Project Overview" matching Command OS */}
      <div className="w-80 shrink-0 space-y-4 select-none hidden xl:block">
        {/* Header */}
        <div className="flex items-center space-x-2 text-[#0f172a] font-extrabold text-sm">
          <div className="w-5 h-5 rounded-md bg-[#3b82f6] text-white flex items-center justify-center text-[10px] shadow-xs">
            📊
          </div>
          <span>Project Overview</span>
        </div>

        {/* Card 1: TOTAL WORKLOAD VALUE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL WORKLOAD VALUE
            </div>
            <div className="mt-1 text-2xl font-black text-[#0f172a] tracking-tight">$184.5k</div>
            <div className="mt-1 flex items-center space-x-1 text-[#10b981] text-xs font-bold">
              <span>↑ 12% this month</span>
            </div>
          </div>

          {/* Smooth Electric Blue Sparkline Curve */}
          <div className="w-20 h-10 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 80 32">
              <path
                d="M 2 24 C 20 28, 35 12, 50 16 C 62 20, 70 8, 78 6"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: DELIVERY PACE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              DELIVERY PACE
            </div>
            <div className="mt-1 text-2xl font-black text-[#0f172a] tracking-tight">
              4.2 <span className="text-xs font-medium text-slate-400">items/day</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[#06b6d4] text-xs font-bold">
              <span>↑ Improving</span>
            </div>
          </div>

          {/* Smooth Cyan Sparkline Curve */}
          <div className="w-20 h-10 flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 80 32">
              <path
                d="M 2 26 C 22 18, 40 24, 55 14 C 65 6, 72 12, 78 8"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Key Milestones Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-[#0f172a] font-bold text-xs">
            <Calendar className="w-4 h-4 text-[#3b82f6]" />
            <span>Key Milestones</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Milestone 1 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-blue-100 text-[#3b82f6] rounded-lg shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Alpha Review</div>
                <div className="text-[11px] text-slate-400">Internal Review Phase</div>
              </div>
            </div>

            {/* Milestone 2 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Brand Presentation</div>
                <div className="text-[11px] text-slate-400">Mainstage Presentation</div>
              </div>
            </div>

            {/* Milestone 3 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Motion Export</div>
                <div className="text-[11px] text-slate-400">Final Export Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Widget: Platform Health 99.9% Operational */}
        <div className="bg-[#111827] p-5 rounded-2xl text-white shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Health</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-2xl font-black tracking-tight text-white">99.9%</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064e3b]/80 text-[#34d399] border border-[#059669]/30">
              Operational
            </span>
          </div>

          {/* 7 Vertical Bars Bar Chart matching Screenshot */}
          <div className="flex items-end space-x-1.5 h-8 pt-1">
            <div className="flex-1 bg-[#2563eb] h-3.5 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-5 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-3 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-6 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-4 rounded-t-xs"></div>
            <div className="flex-1 bg-[#38bdf8] h-7 rounded-t-xs"></div>
            <div className="flex-1 bg-[#2563eb] h-5 rounded-t-xs"></div>
          </div>
        </div>

        {/* Bottom Card: STARTER PLAN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-[#0f172a] font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
            <span>STARTER PLAN</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Upgrade to unlock unlimited access
          </p>
          <button
            onClick={() => navigate('/pipeline')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

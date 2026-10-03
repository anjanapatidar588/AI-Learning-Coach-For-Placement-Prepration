import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  ChevronRight,
  Code2,
  BrainCircuit,
  Database,
  Cpu,
  Layers,
  Network,
  Check,
  Bot,
  Calendar,
  Play,
  Lock,
  RotateCw,
  Search,
  MessageSquare,
  Sprout,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Award,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

const StudentRoadmap = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);
  const [activeStepModal, setActiveStepModal] = useState(null); // 'assessment' | 'analysis' | 'gaps'

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/roadmap');
      if (res.data?.success) {
        setRoadmapData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to fetch roadmap');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await API.post('/student/roadmap/recalculate');
      if (res.data?.success) {
        setRoadmapData(res.data.data);
      }
    } catch (err) {
      console.error('Error recalculating roadmap:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Loading your personalized learning roadmap...</p>
      </div>
    );
  }

  // Raw data from server or default fallbacks matching reference
  const {
    nodes = [],
    learningMapBySubject = {},
    overallProgressPercent = 0,
    currentLearningItem,
    strongAreas = [],
    weakAreas = [],
    knowledgeGaps = [],
    studentContext = {},
    adaptiveSummary = {}
  } = roadmapData || {};

  const completedCount = adaptiveSummary.completedNodesCount ?? nodes.filter(n => ['completed', 'COMPLETED'].includes(n.status)).length;
  const inProgressCount = adaptiveSummary.inProgressNodesCount ?? nodes.filter(n => ['in_progress', 'current', 'CURRENT', 'IN_PROGRESS'].includes(n.status)).length;
  const totalTopicsCount = adaptiveSummary.totalNodes || nodes.length;
  const upcomingCount = Math.max(0, totalTopicsCount - (completedCount + inProgressCount));
  const targetRoleName = studentContext.targetRole || user?.targetRole || 'Software Development';

  // Build subject columns dynamically from actual backend roadmap nodes / learningMapBySubject
  const subjectKeys = [
    { key: 'dsa', title: 'DSA', icon: Code2, color: 'from-indigo-500 to-purple-600', iconBg: 'bg-indigo-100 text-indigo-600' },
    { key: 'aptitude', title: 'Aptitude', icon: BrainCircuit, color: 'from-blue-500 to-cyan-600', iconBg: 'bg-blue-100 text-blue-600' },
    { key: 'dbms', title: 'DBMS', icon: Database, color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 text-amber-600' },
    { key: 'oops', title: 'OOPS', icon: Layers, color: 'from-purple-500 to-pink-600', iconBg: 'bg-purple-100 text-purple-600' },
    { key: 'os', title: 'Operating Systems', icon: Cpu, color: 'from-rose-500 to-red-600', iconBg: 'bg-rose-100 text-rose-600' },
    { key: 'cn', title: 'Computer Networks', icon: Network, color: 'from-cyan-500 to-teal-600', iconBg: 'bg-cyan-100 text-cyan-600' },
  ];

  const subjectColumns = subjectKeys.map(subj => {
    const rawItems = learningMapBySubject[subj.key] || nodes.filter(n => (n.subject || n.category || '').toLowerCase() === subj.key);
    const items = rawItems.map(node => ({
      title: node.topicName || node.topicId?.title || node.title || node.nodeId,
      status: node.status === 'completed' ? 'completed' : ['in_progress', 'current', 'CURRENT', 'IN_PROGRESS'].includes(node.status) ? 'in_progress' : 'upcoming',
      topicId: node.topicId?._id || node.topicId || node.nodeId
    }));
    const done = items.filter(i => i.status === 'completed').length;
    const total = items.length;
    const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      ...subj,
      progressPct,
      topicsCount: total > 0 ? `${done} / ${total} Topics` : '0 Topics',
      items
    };
  });

  // Map real backend nodes into subject columns if nodes exist
  if (nodes.length > 0) {
    subjectColumns.forEach(col => {
      const subjNodes = nodes.filter(n => (n.subject || '').toLowerCase() === col.key || (n.category || '').toLowerCase() === col.key);
      if (subjNodes.length > 0) {
        const comp = subjNodes.filter(n => ['completed', 'COMPLETED'].includes(n.status)).length;
        col.topicsCount = `${comp} / ${subjNodes.length} Topics`;
        col.progressPct = Math.round((comp / subjNodes.length) * 100);
        col.items = subjNodes.map(n => ({
          title: n.topicName || n.nodeId,
          status: (n.status || 'upcoming').toLowerCase(),
          topicId: n.topicId?._id || n.topicId || n.nodeId
        }));
      }
    });
  }

  // Circular progress math
  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (overallProgressPercent / 100) * ringCircumference;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">

      {/* 1. TOP SCENIC BANNER CARD WITH MOUNTAIN PATH ARTWORK & METRICS */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#f3e8ff] border border-white/90 shadow-[0_6px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        
        {/* Background Mountain Path Artwork SVG */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg
            className="w-full h-full object-cover opacity-90"
            viewBox="0 0 1200 240"
            preserveAspectRatio="xMaxYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skyGradRoad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="mountGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="mountGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Glowing Sun / Sunrise */}
            <circle cx="950" cy="80" r="120" fill="#fef08a" fillOpacity="0.5" />

            {/* Background Mountains */}
            <path d="M450 240 L580 120 L680 160 L800 90 L920 170 L1040 100 L1200 160 L1200 240 Z" fill="url(#mountGrad1)" />
            <path d="M600 240 L720 140 L820 180 L940 110 L1080 175 L1200 130 L1200 240 Z" fill="url(#mountGrad2)" />

            {/* Winding Golden Path to Peak */}
            <path
              d="M400 240 C550 220 620 200 700 190 C780 180 840 160 900 140 C950 125 1000 115 1040 100"
              stroke="url(#pathGrad)"
              strokeWidth="6"
              strokeDasharray="6 4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Peak Flag */}
            <g transform="translate(1038, 75)">
              <line x1="0" y1="0" x2="0" y2="28" stroke="#1e1b4b" strokeWidth="2.5" />
              <path d="M0 0 L16 6 L0 12 Z" fill="#ef4444" />
            </g>
          </svg>
        </div>

        {/* Foreground Header Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/90 border border-purple-200 text-purple-700 text-xs font-extrabold uppercase font-mono shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>LEARNING MAP</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Your Personalized Learning Roadmap
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              A step-by-step visual journey designed based on your assessment performance, knowledge gaps and placement goals. Follow the path, complete topics, and get closer to your dream job!
            </p>

            {/* 4 Frosted Glass Metric Pills matching reference design */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Completed Pill */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-white shadow-xs flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{completedCount} / {totalTopicsCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Topics Completed</span>
                </div>
              </div>

              {/* In Progress Pill */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-white shadow-xs flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{inProgressCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">In Progress</span>
                </div>
              </div>

              {/* Upcoming Pill */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-white shadow-xs flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{upcomingCount}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Upcoming</span>
                </div>
              </div>

              {/* Target Role Pill */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 border border-white shadow-xs flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Role</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">{targetRoleName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right Overall Progress Donut Card matching reference design */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-md flex flex-col items-center justify-center text-center w-full lg:w-56 shrink-0 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Overall Progress</span>

            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r={ringRadius} stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r={ringRadius}
                  stroke="#6366f1"
                  strokeWidth="6"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] font-bold text-slate-400 block -mb-1">Overall</span>
                <span className="text-lg font-black text-slate-900">{overallProgressPercent}%</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-medium italic">
              "Small steps every day lead to big results!"
            </p>
          </div>

        </div>
      </div>

      {/* 2. TOP STEPPER PROCESS FLOW ROW (Steps 1 to 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Step 1: Assessment */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-indigo-200/80 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              1
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold inline-flex items-center space-x-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Completed</span>
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Baseline Assessment</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => setActiveStepModal('assessment')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 2: AI Analysis */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              2
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              Completed
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">AI Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your performance analysis is ready</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => setActiveStepModal('analysis')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 3: Knowledge Gaps */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
              3
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              Completed
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Knowledge Gaps</h3>
            <p className="text-xs text-slate-500 mt-0.5">Key areas to focus on</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-start">
            <button
              onClick={() => navigate('/student/weak-areas')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Gaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 4: Personalized Roadmap */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-indigo-500/60 shadow-md flex flex-col justify-between space-y-3 relative ring-4 ring-indigo-50">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              4
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold animate-pulse">
              In Progress
            </span>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Personalized Roadmap</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your custom learning path</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-start">
            <span className="text-xs font-bold text-indigo-600 inline-flex items-center space-x-1">
              <span>View Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </span>
          </div>
        </div>

      </div>

      {/* 3. MAIN SECTION: 6 SUBJECT COLUMNS (Left 9 Cols) + RIGHT SIDEBAR (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 6 SUBJECT COLUMNS GRID (9 Cols) */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectColumns.map((col) => {
            const Icon = col.icon;
            return (
              <div
                key={col.key}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all"
              >
                {/* Subject Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-2xl ${col.iconBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{col.title}</h3>
                      <p className="text-[11px] text-slate-400 font-semibold">{col.topicsCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-black text-slate-800">{col.progressPct}%</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Topic Items List */}
                <div className="space-y-2 flex-1">
                  {col.items.map((item, iIdx) => {
                    const isCompleted = item.status === 'completed';
                    const isInProgress = item.status === 'in_progress' || item.status === 'current';

                    return (
                      <div
                        key={iIdx}
                        onClick={() => navigate(`/student/learn/${item.topicId}`)}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-50/40 border-emerald-100 text-slate-800 hover:bg-emerald-50'
                            : isInProgress
                            ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-bold shadow-2xs hover:bg-indigo-50'
                            : 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          {isCompleted ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : isInProgress ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                              <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                          )}

                          <span className={`truncate ${isCompleted ? 'font-semibold text-slate-700' : isInProgress ? 'font-extrabold text-indigo-900' : 'text-slate-500'}`}>
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {isCompleted && (
                            <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono">Completed</span>
                          )}
                          {isInProgress && (
                            <span className="text-[9px] font-bold text-indigo-600 uppercase font-mono">In Progress</span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDEBAR PANEL (3 Cols) matching reference image */}
        <div className="lg:col-span-3 space-y-4">

          {/* CARD 1: Quick Stats */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-100 pb-2.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Quick Stats</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Total Topics</span>
                <span className="font-extrabold text-slate-900 font-mono">{totalTopicsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Completed</span>
                </span>
                <span className="font-extrabold text-emerald-700 font-mono">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>In Progress</span>
                </span>
                <span className="font-extrabold text-blue-700 font-mono">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span>Upcoming</span>
                </span>
                <span className="font-extrabold text-slate-600 font-mono">{upcomingCount}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: Need Help? Ask AI Coach */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-3xl border border-indigo-100 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center space-x-3">
              {/* 3D Bot Mascot Icon */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Need Help?</h4>
                <p className="text-xs font-bold text-indigo-700">Ask AI Coach</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug font-medium">
              Get personalized guidance, explanations and study plans.
            </p>

            <button
              onClick={() => navigate('/student/ai-coach')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-sm transition-opacity inline-flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Chat Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 3: Roadmap Legend */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-100 pb-2.5">
              Roadmap Legend
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span>Current / In Progress</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-white shrink-0" />
                <span>Upcoming</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Locked</span>
              </div>
            </div>
          </div>

          {/* CARD 4: Inspirational Quote */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Sprout className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-slate-600 italic leading-relaxed">
              "Success is the sum of small efforts, repeated day in and day out."
            </p>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM ENCOURAGEMENT BANNER BAR matching reference */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">Keep going!</h4>
            <p className="text-[11px] text-slate-500 font-medium">You're doing great. Every topic you complete brings you closer to your goal.</p>
          </div>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-2 transition-colors cursor-pointer shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Syncing...' : 'Re-sync Roadmap'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

export default StudentRoadmap;

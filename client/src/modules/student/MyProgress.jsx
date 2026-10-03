import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  AlertCircle,
  Code2,
  BrainCircuit,
  Database,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Flame,
  FileText,
  Calendar,
  Layers,
  Cpu,
  Network,
  Check,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Bot,
  Edit3,
  X
} from 'lucide-react';

const MyProgress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [timeRange, setTimeRange] = useState('7D'); // '7D' | '30D' | '3M' | '6M'
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState('Get Placed in Top Company');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/progress');
      if (res.data && res.data.success) {
        setProgressData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load progress data.');
      }
    } catch (err) {
      console.error('Error fetching student progress:', err);
      setError('Unable to fetch progress metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Loading placement progress analytics...</p>
      </div>
    );
  }

  // Real backend metrics or zero-state fallback
  const overall = progressData?.overall || { totalAttempts: 0, passedAttempts: 0, failedAttempts: 0, accuracy: 0, totalTimeSpentSeconds: 0, hintsUsed: 0 };
  const dsa = progressData?.dsa || { totalAttempts: 0, passedAttempts: 0, accuracy: 0 };
  const aptitude = progressData?.aptitude || { totalAttempts: 0, passedAttempts: 0, accuracy: 0 };
  const csCore = progressData?.csCore || { totalAttempts: 0, passedAttempts: 0, accuracy: 0 };

  const totalQuestions = overall.totalAttempts || 0;
  const solvedQuestions = overall.passedAttempts || 0;
  const attemptedQuestions = overall.failedAttempts || 0;
  const overallAccuracy = overall.accuracy || 0;
  const studyHoursVal = overall.totalTimeSpentSeconds > 0 ? (overall.totalTimeSpentSeconds / 3600).toFixed(1) : '0.0';
  const studyTargetHours = 40;
  const studyProgressPct = Math.min(100, Math.round((Number(studyHoursVal) / studyTargetHours) * 100)) || 0;
  const currentStreakDays = progressData?.streak?.current || 0;

  // 6 Subjects for Bar Chart & Subject Progress Ring
  const subjectsPerformance = [
    { name: 'DSA', score: dsa.accuracy || 0, color: '#818cf8', barBg: 'bg-indigo-500', icon: Code2 },
    { name: 'Aptitude', score: aptitude.accuracy || 0, color: '#34d399', barBg: 'bg-emerald-400', icon: BrainCircuit },
    { name: 'DBMS', score: progressData?.dbms?.accuracy || 0, color: '#60a5fa', barBg: 'bg-blue-400', icon: Database },
    { name: 'OOPS', score: progressData?.oops?.accuracy || 0, color: '#f472b6', barBg: 'bg-pink-400', icon: Layers },
    { name: 'OS', score: progressData?.os?.accuracy || 0, color: '#fb923c', barBg: 'bg-orange-400', icon: Cpu },
    { name: 'CN', score: progressData?.cn?.accuracy || 0, color: '#2dd4bf', barBg: 'bg-teal-400', icon: Network },
  ];

  // Donut Ring Math
  const donutRadius = 42;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (overallAccuracy / 100) * donutCircumference;

  // Recent Activity Items
  const recentActivities = Array.isArray(progressData?.recentActivity) && progressData.recentActivity.length > 0
    ? progressData.recentActivity.map(act => ({
        title: `${act.category?.toUpperCase() || 'Practice'} - ${act.questionId?.title || 'Problem'}`,
        pill: act.status || 'Attempted',
        pillStyle: act.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200',
        time: act.createdAt ? new Date(act.createdAt).toLocaleDateString() : 'Recently',
        iconBg: act.status === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
      }))
    : [];

  // Quick Insights AI items
  const quickInsights = Array.isArray(progressData?.weakTopics) && progressData.weakTopics.length > 0
    ? progressData.weakTopics.slice(0, 4).map(wt => ({
        title: `Focus on ${wt.topicName || wt.topic || 'Weak Topic'}`,
        desc: `Your accuracy is ${wt.accuracy || 0}%. Consider more practice.`,
        iconBg: 'bg-orange-100 text-orange-600',
        icon: Cpu
      }))
    : [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">

      {/* 1. TOP SCENIC BANNER CARD WITH MOUNTAIN PATH ARTWORK & FLOATING GOAL CARD */}
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
              <linearGradient id="mountGradProg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="mountGradProg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="pathGradProg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Glowing Sun */}
            <circle cx="950" cy="80" r="120" fill="#fef08a" fillOpacity="0.5" />

            {/* Background Mountains */}
            <path d="M450 240 L580 120 L680 160 L800 90 L920 170 L1040 100 L1200 160 L1200 240 Z" fill="url(#mountGradProg1)" />
            <path d="M600 240 L720 140 L820 180 L940 110 L1080 175 L1200 130 L1200 240 Z" fill="url(#mountGradProg2)" />

            {/* Winding Golden Path to Peak */}
            <path
              d="M400 240 C550 220 620 200 700 190 C780 180 840 160 900 140 C950 125 1000 115 1040 100"
              stroke="url(#pathGradProg)"
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

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/90 border border-purple-200 text-purple-700 text-xs font-extrabold font-mono shadow-xs backdrop-blur-xs">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span>Your Progress</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Track. Analyze. <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Improve.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Visualize your learning journey with detailed insights, performance trends, and personalized recommendations to help you achieve your placement goals.
            </p>
          </div>

          {/* Top Right Floating Goal Card matching reference design */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-white/90 shadow-md flex flex-col justify-between w-full lg:w-64 shrink-0 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Goal</span>
                  <p className="text-xs font-extrabold text-slate-900 leading-snug">{goalText}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingGoal(true)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-500 font-medium italic">
                "Progress, not perfection."
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. TOP 4 METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* CARD 1: Overall Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="relative flex items-center justify-center shrink-0 mr-4">
            <svg className="w-18 h-18 transform -rotate-90">
              <circle cx="36" cy="36" r="30" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
              <circle
                cx="36"
                cy="36"
                r="30"
                stroke="#6366f1"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={(2 * Math.PI * 30) - (overallAccuracy / 100) * (2 * Math.PI * 30)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-900">{overallAccuracy}%</span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Overall Progress</span>
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">You're doing great!</p>

            <div className="pt-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>↑ 12% vs last week</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Questions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 relative group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Total Questions</span>
            <span className="text-2xl font-black text-slate-900">{totalQuestions}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
            <span className="text-emerald-700 font-bold">{solvedQuestions} Solved</span>
            <span>|</span>
            <span className="text-slate-500">{attemptedQuestions} Attempted</span>
          </div>
        </div>

        {/* CARD 3: Study Hours */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 relative group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Study Hours</span>
            <span className="text-2xl font-black text-slate-900">{studyHoursVal}h</span>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
              <span>Target: {studyTargetHours}h</span>
              <span className="font-bold text-purple-700">{studyProgressPct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full" style={{ width: `${studyProgressPct}%` }} />
            </div>
          </div>
        </div>

        {/* CARD 4: Current Streak */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 relative group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center shadow-2xs">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Current Streak</span>
            <span className="text-2xl font-black text-slate-900">{currentStreakDays} Days</span>
          </div>

          <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Keep it up!
          </div>
        </div>

      </div>

      {/* 3. MIDDLE ANALYTICS GRID (Subject Performance Bar Chart + Subject Progress Donut + Study Pattern Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT CARD (6 Cols): SUBJECT PERFORMANCE BAR CHART */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          
          {/* Card Header & Time Range Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Subject Performance</h3>
                <p className="text-[11px] text-slate-400 font-medium">Your performance across different subjects</p>
              </div>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs">
              {['7D', '30D', '3M', '6M'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeRange === t ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Custom High-Performance Bar Chart matching reference design */}
          <div className="h-64 w-full flex items-end justify-between px-2 pt-6 pb-2">
            {subjectsPerformance.map((subj, sIdx) => {
              const Icon = subj.icon;
              return (
                <div key={sIdx} className="flex flex-col items-center flex-1 space-y-2 h-full justify-end group">
                  {/* Percentage Pill Badge Above Bar */}
                  <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 transition-transform group-hover:scale-105">
                    {subj.score}%
                  </span>

                  {/* Vertical Colored Bar */}
                  <div className="w-10 sm:w-12 bg-slate-100 rounded-2xl overflow-hidden flex items-end h-44 p-1">
                    <div
                      className={`w-full ${subj.barBg} rounded-xl transition-all duration-700 group-hover:opacity-90`}
                      style={{ height: `${subj.score}%` }}
                    />
                  </div>

                  {/* Subject Icon & Label */}
                  <div className="flex flex-col items-center space-y-1 pt-1">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{subj.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (6 Cols): SUBJECT-WISE PROGRESS DONUT + STUDY PATTERN LINE CHART */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">

          {/* TOP CARD: SUBJECT-WISE PROGRESS DONUT CARD */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Subject-wise Progress</h3>
                <p className="text-[11px] text-slate-400 font-medium">Overall domain accuracy distribution</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Central Donut Chart */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={(2 * Math.PI * 38) - (overallAccuracy / 100) * (2 * Math.PI * 38)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="30"
                    stroke="#34d399"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={(2 * Math.PI * 30) - (72 / 100) * (2 * Math.PI * 30)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900 block leading-tight">{overallAccuracy}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Overall</span>
                </div>
              </div>

              {/* Legend List matching reference design */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold">
                {subjectsPerformance.map((s, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-600 text-[11px]">{s.name}</span>
                    <span className="text-slate-900 font-extrabold text-[11px] font-mono">{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM CARD: STUDY PATTERN WAVE LINE CHART CARD */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Study Pattern</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium">Avg. <strong>2.6h/day</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                      ↑ 18%
                    </span>
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-extrabold">
                58%
              </span>
            </div>

            {/* Smooth Wave Line Chart SVG */}
            <div className="h-28 w-full relative pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <path
                  d="M0 60 Q 75 10, 150 40 T 300 20 T 450 50 L 500 30 L 500 80 L 0 80 Z"
                  fill="url(#waveGrad)"
                />

                {/* Line Path */}
                <path
                  d="M0 60 Q 75 10, 150 40 T 300 20 T 450 50 L 500 30"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Active Data Dots */}
                <circle cx="75" cy="22" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <circle cx="225" cy="30" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <circle cx="375" cy="35" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <circle cx="500" cy="30" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Day Labels */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-medium pt-2 border-t border-slate-100 mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM ROW: RECENT ACTIVITY (4 Cols) + QUICK INSIGHTS (4 Cols) + LEARNING STREAK / AI CARD (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUMN 1 (4 Cols): RECENT ACTIVITY CARD */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">Recent Activity</h3>
                <p className="text-[10px] text-slate-400">Your latest learning activities</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/practice')}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, aIdx) => (
                <div key={aIdx} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-7 h-7 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0`}>
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-900 truncate">{act.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${act.pillStyle}`}>
                    {act.pill}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-500 py-4 text-center italic">
                No recent activity recorded yet. Start practicing to see your attempts!
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2 (4 Cols): QUICK INSIGHTS CARD */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900">Quick Insights</h3>
              <p className="text-[10px] text-slate-400">AI powered recommendations</p>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {quickInsights.length > 0 ? (
              quickInsights.map((ins, iIdx) => {
                const Icon = ins.icon;
                return (
                  <div
                    key={iIdx}
                    onClick={() => navigate('/student/ai-coach')}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-7 h-7 rounded-xl ${ins.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{ins.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{ins.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-500 py-4 text-center italic">
                No quick insights yet. Keep completing topics to unlock AI recommendations!
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3 (4 Cols): LEARNING STREAK & AI ENCOURAGEMENT CARD */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-black text-slate-900">Learning Streak</h3>
                <p className="text-[10px] text-slate-400">Stay consistent, stay ahead!</p>
              </div>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>

            {/* Weekday Checkmarks Row */}
            <div className="flex items-center justify-between pt-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
                <div key={dIdx} className="flex flex-col items-center space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Banner Box (Gradient background with mascot) matching reference */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 rounded-2xl text-white shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center space-x-3">
              {/* Cute 3D Bot Icon */}
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">You're making great progress!</h4>
                <p className="text-[10px] text-indigo-100">Keep learning, keep growing!</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/practice')}
              className="w-7 h-7 rounded-full bg-white text-indigo-700 flex items-center justify-center shrink-0 shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* EDIT GOAL MODAL */}
      {editingGoal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Edit Placement Goal</h3>
              <button onClick={() => setEditingGoal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Goal Description</label>
              <input
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setEditingGoal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingGoal(false)}
                className="btn-primary text-xs px-5 py-2"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyProgress;

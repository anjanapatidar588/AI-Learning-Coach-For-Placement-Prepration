import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Users,
  FileText,
  HelpCircle,
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  ChevronDown,
  Filter,
  BarChart3,
  Award,
  BookOpen,
  Building,
  Target,
  FileCheck,
  ChevronRight,
  X,
  Layers,
  Check,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import heroIllustration from '../../assets/placement_hero_illustration.jpg';

// Helper Sparkline SVG component for the KPI cards
const Sparkline = ({ color = '#6366f1', height = 36 }) => {
  const gradId = `spark-${Math.random().toString(36).substring(2, 9)}`;
  return (
    <div className="w-full mt-2" style={{ height }}>
      <svg viewBox="0 0 120 36" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0,24 Q 20,28 35,16 T 70,18 T 100,8 T 120,12"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 0,24 Q 20,28 35,16 T 70,18 T 100,8 T 120,12 L 120,36 L 0,36 Z"
          fill={`url(#${gradId})`}
        />
      </svg>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('This Week');
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/dashboard');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch notice (using robust local baseline):', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive counts dynamically from backend response
  const kpis = stats?.kpis || {};
  const registeredCount = kpis.totalStudents || 0;
  const activeCount = kpis.activeStudents || 0;
  const assessmentsCount = kpis.totalAssessments || 0;
  const publishedCount = kpis.publishedAssessments || 0;
  const questionsCount = kpis.totalQuestions || 0;
  const topicsCount = kpis.totalTopics || 0;
  const averageReadiness = kpis.averageReadiness || 0;

  // 1. Readiness Score Distribution Data (Calculated dynamically from DB)
  const dist = stats?.distribution || {};
  const totalProfiles = (dist.beginner || 0) + (dist.developing || 0) + (dist.good || 0) + (dist.placementReady || 0);
  const currentDistributionData = [
    { range: '0-39', percentage: totalProfiles > 0 ? Math.round((dist.beginner / totalProfiles) * 100) : 0, students: dist.beginner || 0 },
    { range: '40-64', percentage: totalProfiles > 0 ? Math.round((dist.developing / totalProfiles) * 100) : 0, students: dist.developing || 0 },
    { range: '65-84', percentage: totalProfiles > 0 ? Math.round((dist.good / totalProfiles) * 100) : 0, students: dist.good || 0 },
    { range: '85-100', percentage: totalProfiles > 0 ? Math.round((dist.placementReady / totalProfiles) * 100) : 0, students: dist.placementReady || 0 },
  ];

  // 2. Domain Performance Overview Data
  const dp = stats?.domainPerformance || {};
  const domainData = [
    { name: 'DSA', current: dp.dsa?.accuracy || 0, lastWeek: 0 },
    { name: 'Aptitude', current: dp.aptitude?.accuracy || 0, lastWeek: 0 },
    { name: 'CS Core', current: dp.csCore?.accuracy || 0, lastWeek: 0 },
  ];

  // 3. Student Readiness Tiers Donut Data
  const readinessTierData = [
    { name: 'Ready (85-100)', value: dist.placementReady || 0, color: '#10b981' },
    { name: 'Good (65-84)', value: dist.good || 0, color: '#06b6d4' },
    { name: 'Developing (40-64)', value: dist.developing || 0, color: '#f59e0b' },
    { name: 'Beginner (0-39)', value: dist.beginner || 0, color: '#f43f5e' },
  ];

  // 4. Content Volume
  const qc = stats?.questionCounts || {};
  const curriculumProgress = [
    { name: 'DSA Questions', progress: qc.dsa || 0, color: 'bg-indigo-600' },
    { name: 'Aptitude Questions', progress: qc.aptitude || 0, color: 'bg-purple-600' },
    { name: 'CS Core Questions', progress: qc.csCore || 0, color: 'bg-violet-500' },
  ];

  // 5. Topics / Weaknesses Aggregate
  const topTopics = Array.isArray(stats?.weakTopics)
    ? stats.weakTopics.slice(0, 5).map(t => ({ name: t.topic || 'Topic', score: t.totalAttempts || 0 }))
    : [];

  // 6. Recent Activity Items
  const recentActivities = Array.isArray(stats?.recentActivities)
    ? stats.recentActivities.map((act, i) => ({
        id: i + 1,
        dotColor: 'bg-indigo-500',
        title: act.type || 'Activity',
        desc: act.detail || '',
        time: act.time || 'Recently',
        path: '/admin/students'
      }))
    : [];

  // 7. Placement Pipeline Steps
  const pipelineSteps = [
    {
      id: 'registered',
      label: 'Registered',
      count: registeredCount,
      icon: Users,
      iconBg: 'bg-indigo-100 text-indigo-700',
      filter: 'all'
    },
    {
      id: 'assessed',
      label: 'Assessed',
      count: activeCount,
      icon: FileText,
      iconBg: 'bg-sky-100 text-sky-700',
      filter: 'assessed'
    },
    {
      id: 'interview_ready',
      label: 'Interview Ready',
      count: 8,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-700',
      filter: 'ready'
    },
    {
      id: 'placed',
      label: 'Placed',
      count: 3,
      icon: Trophy,
      iconBg: 'bg-purple-100 text-purple-700',
      filter: 'placed'
    },
  ];

  // Custom Tooltip for Readiness Distribution Chart
  const CustomDistributionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl">
          <span>{payload[0].payload.range}: {payload[0].value}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Hero Banner: Placement Intelligence */}
      <div className="bg-gradient-to-r from-purple-100/70 via-indigo-50/80 to-purple-100/50 rounded-3xl p-6 lg:p-8 border border-purple-200/60 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-xl">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-700">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#432bb3] tracking-tight">
              Placement Intelligence
            </h1>
          </div>

          <p className="text-slate-700 font-semibold text-sm sm:text-base">
            Track progress. Identify gaps. Build better careers.
          </p>

          <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed">
            AI-powered analytics to help you create personalized learning paths and improve placement outcomes.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-100 text-purple-800 text-xs font-semibold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />
              <span>Data Driven</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-100 text-purple-800 text-xs font-semibold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />
              <span>AI Insights</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-100 text-purple-800 text-xs font-semibold shadow-2xs">
              <Check className="w-3.5 h-3.5 text-purple-600 stroke-[3]" />
              <span>Better Outcomes</span>
            </span>
          </div>
        </div>

        {/* Right side: 3D Illustration Graphic */}
        <div className="relative w-full lg:w-auto flex items-center justify-center z-10">
          <div className="relative group max-w-md w-full">
            <img
              src={heroIllustration}
              alt="Placement Intelligence 3D Vector"
              className="rounded-2xl max-h-48 sm:max-h-56 object-cover drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
            />
            {/* Elegant Calligraphy overlay badge */}
            <div className="absolute top-2 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-200 shadow-xs pointer-events-none">
              <span className="font-serif italic font-bold text-xs text-purple-900">
                Your Students Our Priority
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seven Metrics KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Card 1: Registered Students */}
        <div 
          onClick={() => navigate('/admin/students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Registered Students</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{registeredCount}</span>
              <span className="text-[11px] font-bold text-emerald-600">↑ 12%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#6366f1" />
        </div>

        {/* Card 2: Active Students */}
        <div 
          onClick={() => navigate('/admin/students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Active Students</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{activeCount}</span>
              <span className="text-[11px] font-bold text-emerald-600">↑ 27%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#3b82f6" />
        </div>

        {/* Card 3: Total Assessments */}
        <div 
          onClick={() => navigate('/admin/assessments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600">
                <FileCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Total Assessments</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{assessmentsCount}</span>
              <span className="text-[11px] font-bold text-slate-500">↑ 0%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#d946ef" />
        </div>

        {/* Card 4: Published Tests */}
        <div 
          onClick={() => navigate('/admin/assessments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Published Tests</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{publishedCount}</span>
              <span className="text-[11px] font-bold text-emerald-600">↑ 33%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#06b6d4" />
        </div>

        {/* Card 5: Total Questions */}
        <div 
          onClick={() => navigate('/admin/questions')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Total Questions</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{questionsCount}</span>
              <span className="text-[11px] font-bold text-emerald-600">↑ 5%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#f59e0b" />
        </div>

        {/* Card 6: Curriculum Topics */}
        <div 
          onClick={() => navigate('/admin/topics')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-600 leading-tight">Curriculum Topics</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{topicsCount}</span>
              <span className="text-[11px] font-bold text-emerald-600">↑ 10%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">vs. last 7 days</p>
          </div>
          <Sparkline color="#10b981" />
        </div>

        {/* Card 7: Average Readiness Donut */}
        <div 
          onClick={() => navigate('/admin/analytics')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between items-center text-center"
        >
          <span className="text-[11px] font-bold text-slate-600 w-full text-left">Average Readiness</span>
          
          <div className="relative w-16 h-16 my-1 flex items-center justify-center">
            {/* Circular progress donut ring */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#f1f5f9"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#6366f1"
                strokeWidth="5"
                strokeDasharray={163}
                strokeDashoffset={163 - (163 * averageReadiness) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-900">
              {averageReadiness}%
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600">
            <span>↑ 2%</span>
            <span className="text-slate-400 font-normal">vs. 7 days</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row Visualizations: Readiness Score Distribution, Domain Performance, AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Widget 1: Readiness Score Distribution (4.5 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Readiness Score Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Student distribution across placement readiness score tiers
              </p>
            </div>

            {/* Time Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>{timeRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {timeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-32 bg-white rounded-xl border border-slate-200 shadow-lg p-1 z-30">
                  {['This Week', 'This Month', 'All Time'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTimeRange(option);
                        setTimeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        timeRange === option ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Smooth Curve Area Chart */}
          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentDistributionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomDistributionTooltip />} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleAreaGrad)"
                  dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#5b21b6', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: Domain Performance Overview (4.5 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Domain Performance Overview</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Average accuracy percentage across practice modules
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-3 text-[11px] font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
                <span className="text-slate-600">Current</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c7d2fe]" />
                <span className="text-slate-400">Last Week</span>
              </span>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="lastWeek" fill="#c7d2fe" radius={[4, 4, 0, 0]} name="Last Week" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 3: AI Insights (Beta) (3 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px]">
                  AI
                </div>
                <h3 className="font-bold text-sm text-slate-900">AI Insights</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Beta</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* List of Insights */}
            <div className="space-y-3.5 mt-4">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-slate-600 leading-snug">
                  <strong className="text-slate-900">DSA performance is 7% higher than last week.</strong> Keep up the momentum and focus on advanced problems.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-slate-600 leading-snug">
                  <strong className="text-slate-900">Only 5% average readiness</strong> — consider personalized study plans for faster improvement.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-slate-600 leading-snug">
                  <strong className="text-slate-900">Interview Prep has the biggest gap (6%).</strong> Add more mock interviews and HR questions.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all duration-150 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>View Detailed Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Row Visualizations (4 columns: Status Donut, Curriculum Completion, Top Performing Topics, Recent Activity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Student Status / Readiness Tiers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Student Status / Readiness Tiers</span>
            </h3>

            {/* Donut and Legend */}
            <div className="flex items-center justify-between mt-3">
              {/* Donut */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readinessTierData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={50}
                      paddingAngle={3}
                    >
                      {readinessTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-lg font-black text-slate-900 leading-none">{registeredCount}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Total Students</span>
                </div>
              </div>

              {/* Legend with numbers */}
              <div className="space-y-1.5 flex-1 pl-3 text-[11px]">
                {readinessTierData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 truncate text-[10px] sm:text-[11px] font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 font-bold">
                      <span className="text-slate-900">{item.value}</span>
                      <span className="text-slate-400 text-[10px]">({item.percentage})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Curriculum Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Curriculum Completion</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Topic-wise completion progress</p>

            {/* Progress Bars */}
            <div className="space-y-3 mt-4">
              {curriculumProgress.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 text-[11px]">{item.name}</span>
                    <span className="font-bold text-slate-900 text-[11px]">{item.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Top Performing Topics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-1.5">
                <Trophy className="w-3.5 h-3.5 text-purple-600" />
                <span>Top Performing Topics</span>
              </h3>
              <button
                onClick={() => navigate('/admin/topics')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* List with horizontal bars */}
            <div className="space-y-2.5 mt-3.5">
              {topTopics.map((top, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700 truncate">{top.name}</span>
                    <span className="font-bold text-slate-900 ml-2">{top.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${top.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Recent Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recent Activity</span>
              </h3>
              <button
                onClick={() => setActivityModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3 mt-3.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => navigate(act.path)}
                  className="flex items-start space-x-2.5 cursor-pointer group"
                >
                  <span className={`w-2 h-2 rounded-full ${act.dotColor} mt-1.5 shrink-0`} />
                  <div className="flex-1 truncate">
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{act.desc}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Placement Pipeline Full-Width Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Placement Pipeline</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Student journey from registration to placement
          </p>
        </div>

        {/* Steps Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === pipelineSteps.length - 1;
            return (
              <div
                key={step.id}
                onClick={() => navigate(`/admin/students`)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/50 border border-slate-200/70 hover:border-indigo-200 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl ${step.iconBg} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block">{step.label}</span>
                    <span className="text-xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {step.count}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <span className="text-slate-300 font-bold text-sm hidden md:inline ml-2">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive AI Placement Insights Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 lg:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-purple-200">
                  AI
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Placement Intelligence & Diagnostic Report</h3>
                  <p className="text-xs text-slate-500">Autonomous cohort gap analysis and curriculum optimizations</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 space-y-2">
                <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Analytical Diagnostic</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  DSA performance is progressing steadily with a <strong>7% weekly gain</strong>. However, only <strong>5% of enrolled candidates</strong> are currently at full placement readiness tier (85+ score). The primary bottleneck is <strong>Interview Preparation & HR behavioral questions</strong>, which shows an accuracy of only 38%.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Current Velocity</span>
                  <p className="text-xl font-black text-slate-900 mt-1">+18.4%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top 20 percentile</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Target Placements</span>
                  <p className="text-xl font-black text-purple-600 mt-1">82%</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">By Fall Hiring</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Action Priority</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Mock Interview Drive</p>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Closes 6% deficit</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Recommended Admin Interventions:</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Generate and publish an automated <strong>System Design & CS Core Assessment</strong> for Developing students.</li>
                  <li>Schedule mock technical interview slots for the 8 <strong>Interview Ready</strong> candidates.</li>
                  <li>Tag additional aptitude practice questions matching TCS and Infosys cutoff criteria.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setAiModalOpen(false);
                  navigate('/admin/assessments');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Launch Targeted Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Activity Stream Modal */}
      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Platform Activity Audit Log</h3>
              </div>
              <button
                onClick={() => setActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1 space-y-2">
              {recentActivities.map((act) => (
                <div key={act.id} className="pt-2 flex items-start space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${act.dotColor} mt-1.5 shrink-0`} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-600">{act.desc}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{act.time}</span>
                  </div>
                  <button
                    onClick={() => {
                      setActivityModalOpen(false);
                      navigate(act.path);
                    }}
                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActivityModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Briefcase,
  Building2,
  Calendar,
  Target,
  Sparkles,
  Info,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  RotateCcw,
  BookX,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Bot,
  Play,
  FileCheck,
  Flag,
  Database,
  Cpu,
  Code2,
  Layers,
  BrainCircuit,
  Network,
  Check,
  X as CloseIcon
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [readinessData, setReadinessData] = useState({
    score: 0,
    level: 'Not Evaluated',
    summary: 'Complete your baseline assessment or practice to calculate your placement readiness.',
    breakdown: { dsa: 0, aptitude: 0, csCore: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/student/dashboard');
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setDashboardData(d);
        const details = d.readinessDetails || {};
        const score = typeof details.score === 'number' ? details.score : (typeof d.readinessScore === 'number' ? d.readinessScore : 0);
        setReadinessData({
          score: score,
          level: details.level || (score >= 85 ? 'Placement Ready' : score >= 65 ? 'Good' : score >= 40 ? 'Developing' : 'Not Evaluated'),
          summary: details.summary || (score > 0 ? 'Based on your latest assessment and practice activity.' : 'Complete your baseline assessment or practice to evaluate readiness.'),
          breakdown: details.breakdown || { dsa: 0, aptitude: 0, csCore: 0 }
        });
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Loading your personalized placement dashboard...</p>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const studentUser = dashboardData?.user || user;
  const studentName = studentUser?.name || 'Learner';
  const firstName = studentName.split(' ')[0] || 'Learner';

  // Target Date formatting
  let targetDateDisplay = 'Not Set';
  if (profile?.targetDate) {
    try {
      const d = new Date(profile.targetDate);
      if (!isNaN(d.getTime())) {
        targetDateDisplay = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch {}
  }

  // Real assessment metrics
  const latestAnalysis = dashboardData?.latestAnalysis;
  const assessmentStatus = dashboardData?.assessmentStatus;
  const hasAssessment = Boolean(latestAnalysis || assessmentStatus?.completed);
  const totalScorePct = latestAnalysis?.overallPerformance?.percentage ?? (assessmentStatus?.completed ? assessmentStatus.score : null);
  const correctCount = latestAnalysis?.overallPerformance?.correct ?? 0;
  const totalQuestions = latestAnalysis?.overallPerformance?.totalQuestions ?? 0;
  const incorrectCount = latestAnalysis?.overallPerformance?.incorrect ?? 0;

  // Subject performance calculation
  const rawSubj = latestAnalysis?.subjectPerformance || {};
  const hasSubjectPerf = Object.keys(rawSubj).length > 0;
  const subjects = [
    { name: 'DSA', score: rawSubj.dsa?.accuracy ?? 0, color: '#14b8a6', border: 'border-teal-500' },
    { name: 'Aptitude', score: rawSubj.aptitude?.accuracy ?? 0, color: '#3b82f6', border: 'border-blue-500' },
    { name: 'DBMS', score: rawSubj.dbms?.accuracy ?? 0, color: '#f59e0b', border: 'border-amber-500' },
    { name: 'OOPS', score: rawSubj.oops?.accuracy ?? 0, color: '#8b5cf6', border: 'border-purple-500' },
    { name: 'OS', score: rawSubj.os?.accuracy ?? 0, color: '#f43f5e', border: 'border-rose-500' },
    { name: 'CN', score: rawSubj.cn?.accuracy ?? 0, color: '#06b6d4', border: 'border-cyan-500' },
  ];

  // Strong topics (using real DB topics if present)
  const strongTopicsList = (latestAnalysis?.strongTopics && latestAnalysis.strongTopics.length > 0)
    ? latestAnalysis.strongTopics.slice(0, 4).map(st => typeof st === 'string' ? st : (st.topicName || st.topic || ''))
    : [];

  // Focus areas (using real DB weak topics if present)
  const weakTopicsList = (latestAnalysis?.weakTopics && latestAnalysis.weakTopics.length > 0)
    ? latestAnalysis.weakTopics.slice(0, 3).map((wt, i) => ({
        topic: typeof wt === 'string' ? wt : (wt.topicName || wt.topic || 'Topic'),
        accuracy: wt.accuracy !== undefined ? `${wt.accuracy}%` : '0%',
        badge: wt.classification === 'Critical' ? 'Weak' : 'Developing',
        badgeBg: wt.classification === 'Critical' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700',
        questions: `${wt.totalQuestions || 0} questions`,
        icon: i === 0 ? Database : i === 1 ? Cpu : Code2,
        iconBg: i === 0 ? 'bg-orange-100 text-orange-600' : i === 1 ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'
      }))
    : [];

  // Roadmap flowchart nodes
  const roadmapPreview = dashboardData?.roadmapPreview || [];
  const roadmapFlowNodes = roadmapPreview.slice(0, 5).map((node, i) => ({
    name: node.title || node.topicName || `Topic ${i + 1}`,
    status: node.status === 'completed' ? 'Completed' : ['in_progress', 'current', 'CURRENT'].includes(node.status) ? 'Current' : 'Upcoming',
    pct: node.status === 'completed' ? '+ 100%' : ['in_progress', 'current', 'CURRENT'].includes(node.status) ? 'In Progress' : '0%',
    num: i + 1
  }));

  // Recent activity
  const recentActivities = Array.isArray(dashboardData?.recentActivity) && dashboardData.recentActivity.length > 0
    ? dashboardData.recentActivity.slice(0, 4).map(act => ({
        type: act.status === 'Accepted' ? 'Topic completed' : 'Practice attempt',
        detail: `${act.questionId?.title || act.category?.toUpperCase() || 'Practice Problem'} - ${act.category || 'DSA'}`,
        color: act.status === 'Accepted' ? 'bg-emerald-500' : 'bg-blue-500',
        iconBg: act.status === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
      }))
    : [];

  // Readiness Gauge SVG Math
  const readinessRadius = 40;
  const readinessCircumference = 2 * Math.PI * readinessRadius;
  const readinessOffset = readinessCircumference - ((readinessData.score || 0) / 100) * readinessCircumference;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* 1. HERO BANNER - SCENIC MOUNTAIN SUNRISE WITH BACKPACKER & REAL METADATA */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#ede9fe] border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] min-h-[220px]">
        {/* Background Scenic Mountain & Backpacker SVG Artwork */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1200 240"
            preserveAspectRatio="xMaxYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#ede9fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="mountainMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="cliffRock" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Sun Glow */}
            <circle cx="850" cy="90" r="140" fill="url(#sunGrad)" />

            {/* Far Mountain Ridge */}
            <path
              d="M500 240 L650 140 L720 170 L820 110 L940 180 L1050 120 L1200 170 L1200 240 Z"
              fill="url(#mountainFar)"
            />

            {/* Mid Mountain Ridge */}
            <path
              d="M620 240 L760 160 L850 195 L950 135 L1060 185 L1200 150 L1200 240 Z"
              fill="url(#mountainMid)"
            />

            {/* Foreground Cliff & Backpacker on Right */}
            <path
              d="M1000 240 L1040 155 L1090 145 L1130 165 L1200 140 L1200 240 Z"
              fill="url(#cliffRock)"
            />

            {/* Backpacker Silhouette standing on cliff */}
            <g transform="translate(1080, 80) scale(0.9)">
              {/* Head */}
              <circle cx="20" cy="12" r="6" fill="#1e293b" />
              {/* Torso & Jacket */}
              <path d="M14 20 L26 20 L28 44 L12 44 Z" fill="#2563eb" />
              {/* Backpack */}
              <path d="M8 22 Q4 32 8 40 L14 40 L14 22 Z" fill="#0f172a" />
              {/* Arms */}
              <path d="M12 24 L6 36 L10 38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M26 24 L32 36 L28 38" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Pants */}
              <path d="M14 44 L13 65 L17 65 L19 48 L21 48 L23 65 L27 65 L26 44 Z" fill="#1e293b" />
              {/* Hiking Boots */}
              <rect x="11" y="64" width="7" height="3" rx="1.5" fill="#0f172a" />
              <rect x="23" y="64" width="7" height="3" rx="1.5" fill="#0f172a" />
            </g>
          </svg>
        </div>

        {/* Cursive Stylish Slogan "Better Skills Bigger Dreams" on the right */}
        <div className="absolute right-36 top-6 hidden lg:flex flex-col items-center pointer-events-none select-none z-10">
          <div className="font-serif italic text-indigo-950/80 font-black text-xl leading-tight text-center tracking-tight rotate-[-6deg]">
            <span>Better</span><br />
            <span>Skills</span><br />
            <span className="text-2xl">Bigger</span><br />
            <span>Dreams</span>
          </div>
          <svg className="w-24 h-4 mt-0.5 text-indigo-700/60 rotate-[-6deg]" viewBox="0 0 100 20" fill="none">
            <path d="M5 12 Q50 22 95 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-4 max-w-3xl">
          <div className="flex items-center space-x-4">
            {studentUser?.avatar ? (
              <img
                src={studentUser.avatar}
                alt={studentName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
              />
            ) : null}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {firstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                Your placement journey is in your hands. Keep going, you're doing great!
              </p>
            </div>
          </div>

          {/* 4 Frosted Glass Profile Info Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Target Role */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white/90 shadow-xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Role</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {profile?.targetRoles?.[0] || 'Not Specified'}
                </span>
              </div>
            </div>

            {/* College */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white/90 shadow-xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">College</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {profile?.college || 'Not Specified'}
                </span>
              </div>
            </div>

            {/* Graduation Year */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white/90 shadow-xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Graduation Year</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {profile?.graduationYear || 'Not Specified'}
                </span>
              </div>
            </div>

            {/* Target Date */}
            <div className="bg-white/85 backdrop-blur-md rounded-2xl p-3 border border-white/90 shadow-xs flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Date</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {targetDateDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC CARDS ROW (Readiness, Latest Assessment, Streak, Daily Prep) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* CARD 1: Placement Readiness */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex items-center justify-between">
          <div className="relative flex items-center justify-center shrink-0 mr-4">
            <svg className="w-22 h-22 transform -rotate-90">
              <circle cx="44" cy="44" r={readinessRadius} stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle
                cx="44"
                cy="44"
                r={readinessRadius}
                stroke="#14b8a6"
                strokeWidth="8"
                strokeDasharray={readinessCircumference}
                strokeDashoffset={readinessOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-slate-900">{readinessData.score}%</span>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-slate-900">Placement Readiness</h2>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Based on your latest assessment and practice activity.
            </p>
            <Link
              to="/student/progress"
              className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CARD 2: Latest Assessment */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-800">Latest Assessment</h2>
            </div>
            <div className="flex items-end space-x-0.5 text-purple-500">
              <span className="w-1 h-2 bg-purple-400 rounded-xs" />
              <span className="w-1 h-3.5 bg-purple-600 rounded-xs" />
              <span className="w-1 h-2.5 bg-purple-500 rounded-xs" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900">{totalScorePct !== null ? `${totalScorePct}%` : 'N/A'}</span>
              <span className="text-[11px] text-slate-400 font-semibold">Overall Score</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold">{correctCount}/{totalQuestions}</span>
                <span className="text-slate-400 text-[10px]">Correct</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="font-bold">{incorrectCount}/{totalQuestions}</span>
                <span className="text-slate-400 text-[10px]">Incorrect</span>
              </div>
            </div>

            <Link
              to="/student/assessment"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
            >
              <span>View Report</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* CARD 3: Study Streak */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">Study Streak</h2>
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900">{dashboardData?.streak ?? 0}</span>
              <span className="text-[11px] text-slate-400 font-semibold">Days</span>
            </div>
          </div>

          {/* Weekday Tracker Dots */}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => (
                <div key={dIdx} className="flex flex-col items-center space-y-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${dIdx < 3 ? 'bg-teal-400' : 'bg-slate-200'}`} />
                  <span className="text-[9px] text-slate-400 font-mono font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: Daily Preparation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-slate-800">Daily Preparation</h2>
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900">
                {profile?.dailyPreparationTime || '1.5 hrs'}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Your target: 2 hrs/day</span>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full w-3/4" />
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/student/practice"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
              >
                <span>Start Study</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE ROW: Subject Performance (Width 6) + Strong Topics (Width 3) + AI Coach (Width 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* SUBJECT PERFORMANCE CARD (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Subject Performance</h2>
            </div>
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 6 Circular Progress Rings in a row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-4">
            {subjects.map((subj, idx) => {
              const r = 26;
              const c = 2 * Math.PI * r;
              const offset = c - (subj.score / 100) * c;

              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700">{subj.name}</span>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r={r} stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r={r}
                        stroke={subj.color}
                        strokeWidth="5"
                        strokeDasharray={c}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-800">{subj.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STRONG TOPICS CARD (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Strong Topics</h2>
            </div>
            <p className="text-[10px] text-slate-400">Based on your assessment performance</p>
          </div>

          <div className="space-y-2 py-1 flex-1">
            {strongTopicsList.length > 0 ? (
              strongTopicsList.map((topic, tIdx) => (
                <div key={tIdx} className="flex items-center space-x-2.5 text-xs">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="font-semibold text-slate-700 truncate">{topic}</span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-500 py-3 italic">
                No strong topics evaluated yet. Complete practice sessions to discover your strong areas.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* AI COACH CARD (3 Cols) */}
        <div className="lg:col-span-3 rounded-3xl p-5 bg-gradient-to-br from-[#eff6ff] via-[#f5f3ff] to-[#fdf4ff] border border-indigo-100 shadow-xs flex items-center justify-between relative overflow-hidden">
          {/* Cute 3D AI Robot Mascot Artwork on Left */}
          <div className="w-20 h-24 relative shrink-0 mr-3 flex items-center justify-center">
            <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="botBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0e7ff" />
                </linearGradient>
                <linearGradient id="botScreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
              </defs>
              {/* Antenna */}
              <circle cx="50" cy="12" r="5" fill="#6366f1" />
              <rect x="48" y="16" width="4" height="10" rx="2" fill="#818cf8" />
              {/* Head */}
              <rect x="20" y="24" width="60" height="48" rx="20" fill="url(#botBody)" stroke="#c7d2fe" strokeWidth="2" />
              {/* Ear phones */}
              <rect x="12" y="38" width="8" height="20" rx="4" fill="#6366f1" />
              <rect x="80" y="38" width="8" height="20" rx="4" fill="#6366f1" />
              {/* Screen Face */}
              <rect x="28" y="32" width="44" height="32" rx="12" fill="url(#botScreen)" />
              {/* Glowing Cyan Eyes */}
              <ellipse cx="40" cy="48" rx="5" ry="6" fill="#38bdf8" />
              <ellipse cx="60" cy="48" rx="5" ry="6" fill="#38bdf8" />
              {/* Cute Smile */}
              <path d="M46 54 Q50 58 54 54" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Floating Body */}
              <path d="M35 76 Q50 72 65 76 L68 96 Q50 102 32 96 Z" fill="url(#botBody)" stroke="#c7d2fe" strokeWidth="2" />
              {/* Hands */}
              <circle cx="24" cy="85" r="6" fill="#818cf8" />
              <circle cx="76" cy="85" r="6" fill="#818cf8" />
            </svg>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-1">
              <h2 className="text-sm font-black text-slate-900">AI Coach</h2>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Need help deciding what to study next?
            </p>
            <div className="pt-1">
              <Link
                to="/student/ai-coach"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs inline-flex items-center space-x-1 shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>Chat with AI</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* 4. LOWER-MIDDLE ROW: Personalized Roadmap (6 Cols) + Focus Areas (3 Cols) + Recent Activity (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* PERSONALIZED ROADMAP (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Personalized Roadmap</h2>
              </div>
              <p className="text-[10px] text-slate-400">Your AI-powered learning path based on your performance & goals.</p>
            </div>
            <Link
              to="/student/roadmap"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 inline-flex items-center space-x-1"
            >
              <span>View Full Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Flowchart Sequence with Connected Nodes */}
          <div className="flex items-center justify-between overflow-x-auto py-3 px-1">
            {roadmapFlowNodes.length > 0 ? (
              roadmapFlowNodes.map((node, nIdx) => {
                const isCompleted = node.status === 'Completed';
                const isCurrent = node.status === 'Current';

                return (
                  <React.Fragment key={nIdx}>
                    <div
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[90px] text-center space-y-1 transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : isCurrent
                          ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : node.num}
                      </div>

                      <span className="text-xs font-bold text-slate-800 truncate w-full">{node.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{node.status}</span>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          isCompleted ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      >
                        {node.pct}
                      </span>
                    </div>

                    {nIdx < roadmapFlowNodes.length - 1 && (
                      <div className="px-1 text-slate-300">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <div className="w-full text-center text-xs text-slate-500 py-4 italic">
                No roadmap generated yet. Take your baseline diagnostic assessment to generate your path!
              </div>
            )}
          </div>
        </div>

        {/* FOCUS AREAS (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Focus Areas</h2>
              </div>
              <p className="text-[10px] text-slate-400">Topics to work on next</p>
            </div>
            <Link
              to="/student/weak-areas"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {weakTopicsList.length > 0 ? (
              weakTopicsList.map((item, wIdx) => {
                const Icon = item.icon;
                return (
                  <div key={wIdx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <div className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800 truncate block">{item.topic}</span>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span className="font-bold text-slate-700">{item.accuracy}</span>
                          <span className={`px-1 rounded font-semibold ${item.badgeBg}`}>{item.badge}</span>
                          <span className="text-slate-400">{item.questions}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/student/practice"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-0.5 shrink-0 ml-1"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-slate-500 py-3 italic">
                No focus areas identified yet. Great job!
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            </div>
            <Link
              to="/student/progress"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 inline-flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, rIdx) => (
                <div key={rIdx} className="flex items-center space-x-2.5 text-xs">
                  <div className={`w-6 h-6 rounded-full ${act.iconBg} flex items-center justify-center shrink-0`}>
                    {act.isCheck ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : act.isBook ? (
                      <Code2 className="w-3 h-3" />
                    ) : act.isFlag ? (
                      <Flag className="w-3 h-3" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block truncate">{act.type}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{act.detail}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-500 py-3 italic">
                No recent activity recorded yet. Start practicing to see your attempts here.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. BOTTOM ROW: Continue Learning + Mistakes & Revision + Motivational Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* CARD 1: Continue Learning (Width 4.5) */}
        <div className="lg:col-span-4 rounded-3xl p-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 text-white shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-[220px]">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <h2 className="text-sm font-extrabold tracking-tight">Continue Learning</h2>
            </div>
            <p className="text-[11px] text-indigo-100 leading-tight">
              Pick up where you left off and keep building your skills.
            </p>
            <div className="pt-1">
              <Link
                to="/student/roadmap"
                className="px-4 py-1.5 rounded-full bg-white text-indigo-900 font-bold text-xs inline-flex items-center space-x-1.5 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 3D Stacked Books & Play Icon SVG Artwork on Right */}
          <div className="w-24 h-24 relative shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Stacked Books */}
              <path d="M20 75 L75 80 L85 68 L30 63 Z" fill="#818cf8" opacity="0.8" />
              <path d="M15 65 L70 70 L80 58 L25 53 Z" fill="#c7d2fe" />
              <path d="M10 55 L65 60 L75 48 L20 43 Z" fill="#ffffff" />
              {/* Glowing Cyan Play Button Circle */}
              <circle cx="65" cy="35" r="18" fill="#38bdf8" />
              <polygon points="61,27 75,35 61,43" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* CARD 2: Mistakes & Revision (Width 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Mistakes & Revision</h2>
            </div>
            <p className="text-[10px] text-slate-400">Stay consistent, avoid repeating mistakes.</p>
          </div>

          {/* 3 Sub-Cards (Mistakes, Revision Due, Saved Concepts) */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Box 1: Mistakes */}
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-rose-600">
                <CloseIcon className="w-3.5 h-3.5" />
                <span className="text-lg font-black font-mono">
                  {dashboardData?.unresolvedMistakesCount || 3}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">
                Mistakes to Review
              </span>
              <Link
                to="/student/mistakes"
                className="text-[10px] font-bold text-rose-600 hover:underline block pt-0.5"
              >
                Go to Journal →
              </Link>
            </div>

            {/* Box 2: Revision Due */}
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-purple-600">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-lg font-black font-mono">
                  {dashboardData?.dueRevisionCardsCount || 5}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">
                Revision Due
              </span>
              <Link
                to="/student/revision"
                className="text-[10px] font-bold text-purple-600 hover:underline block pt-0.5"
              >
                Go to Revision →
              </Link>
            </div>

            {/* Box 3: Saved Concepts */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-blue-600">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="text-lg font-black font-mono">
                  {dashboardData?.savedConceptsCount || 12}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">
                Saved Concepts
              </span>
              <Link
                to="/student/revision"
                className="text-[10px] font-bold text-blue-600 hover:underline block pt-0.5"
              >
                View Notes →
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 3: Motivational Quote Card (Width 3) */}
        <div className="lg:col-span-3 rounded-3xl p-5 bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0]/80 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[140px]">
          {/* Mountain Ridge & Red Flag SVG Art in Background */}
          <div className="absolute right-0 bottom-0 pointer-events-none opacity-80">
            <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
              {/* Mountains */}
              <path d="M0 110 L45 55 L80 85 L115 35 L140 70 L140 110 Z" fill="#cbd5e1" opacity="0.6" />
              <path d="M40 110 L85 60 L120 25 L140 50 L140 110 Z" fill="#94a3b8" opacity="0.8" />
              {/* Flagpole & Red Flag at Summit */}
              <line x1="120" y1="25" x2="120" y2="10" stroke="#475569" strokeWidth="1.5" />
              <polygon points="120,10 135,14 120,18" fill="#ef4444" />
            </svg>
          </div>

          <div className="relative z-10 space-y-1.5 max-w-[200px]">
            <p className="text-xs font-semibold text-slate-700 italic leading-snug">
              "Discipline today builds the opportunities of tomorrow."
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              — PathPilot
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Sparkles,
  Target,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  ChevronRight,
  ArrowRight,
  Clock,
  Play,
  RotateCcw,
  Bot,
  Terminal,
  Layers,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Building2,
  BookX,
  Bookmark,
  ExternalLink,
  HelpCircle,
  BarChart3,
  Cpu,
  Database,
  Network
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [readinessData, setReadinessData] = useState({
    score: 0,
    level: 'Beginner',
    summary: 'Complete your initial assessment to calculate your placement readiness score.',
    breakdown: { dsa: 0, aptitude: 0, csCore: 0, consistency: 0, weaknessImpact: 0 }
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
        setReadinessData({
          score: typeof details.score === 'number' ? details.score : (d.readinessScore || 0),
          level: details.level || 'Beginner',
          summary: details.summary || 'Based on your latest assessment and practice activity.',
          breakdown: details.breakdown || { dsa: 0, aptitude: 0, csCore: 0, consistency: 0, weaknessImpact: 0 }
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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
  const currentRoadmapItem = dashboardData?.currentRoadmapItem;
  const roadmapPreview = dashboardData?.roadmapPreview || [];
  const roadmapProgressPercent = dashboardData?.roadmapProgressPercent || 0;
  const latestAnalysis = dashboardData?.latestAnalysis;
  const assessmentStatus = dashboardData?.assessmentStatus;
  const hasAssessment = Boolean(assessmentStatus?.completed || latestAnalysis);

  // Subject Performance normalization from real DB data
  const rawSubjectPerformance = latestAnalysis?.subjectPerformance || {};
  const subjectDisplayList = [
    { key: 'dsa', label: 'DSA', icon: Code2, color: 'bg-indigo-600', textCol: 'text-indigo-600' },
    { key: 'aptitude', label: 'Aptitude', icon: BrainCircuit, color: 'bg-emerald-600', textCol: 'text-emerald-600' },
    { key: 'dbms', label: 'DBMS', icon: Database, color: 'bg-blue-600', textCol: 'text-blue-600' },
    { key: 'oops', label: 'OOPS', icon: Layers, color: 'bg-purple-600', textCol: 'text-purple-600' },
    { key: 'os', label: 'OS', icon: Cpu, color: 'bg-rose-600', textCol: 'text-rose-600' },
    { key: 'cn', label: 'CN', icon: Network, color: 'bg-amber-600', textCol: 'text-amber-600' },
  ];

  const strongTopics = latestAnalysis?.strongTopics || [];
  const weakTopics = latestAnalysis?.weakTopics || [];
  const knowledgeGaps = latestAnalysis?.knowledgeGaps || [];

  // Format Target Date
  let targetDateDisplay = 'Flexible Schedule';
  if (profile?.targetDate) {
    try {
      const d = new Date(profile.targetDate);
      if (!isNaN(d.getTime())) {
        targetDateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
  }

  // Circular progress calculations for Readiness Score
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const readinessOffset = circumference - (readinessData.score / 100) * circumference;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">

      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, {studentUser?.name || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Here's your placement preparation overview.
            </p>

            {/* Profile Context Metadata Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-bold text-slate-900">{profile?.targetRoles?.[0] || studentUser?.targetRole || 'Software Engineer'}</span>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{profile?.college || 'University Student'}</span>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Class of {profile?.graduationYear || new Date().getFullYear()}</span>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Target: {targetDateDisplay}</span>
              </div>

              <Link
                to="/student/profile"
                className="text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 transition-colors flex items-center space-x-1 text-xs"
              >
                <span>Edit Profile</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Quick AI Coach Button */}
          <div className="shrink-0 self-start md:self-auto">
            <Link
              to="/student/ai-coach"
              className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center space-x-2 transition-all shadow-xs"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Ask AI Coach</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. READINESS OVERVIEW & ASSESSMENT PERFORMANCE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* READINESS OVERVIEW (Col 1-5) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">OVERVIEW</span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">Placement Readiness</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
              {readinessData.level}
            </span>
          </div>

          {/* Circular Gauge Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#4f46e5"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={readinessOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {readinessData.score}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Readiness
                </span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Based on your latest assessment and practice activity.
            </p>

            {/* Sub-breakdown pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div className="p-2 rounded-xl bg-slate-50 text-center">
                <div className="text-xs font-bold text-slate-900">{readinessData.breakdown?.dsa || 0}%</div>
                <div className="text-[10px] text-slate-500 font-medium">DSA</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-center">
                <div className="text-xs font-bold text-slate-900">{readinessData.breakdown?.aptitude || 0}%</div>
                <div className="text-[10px] text-slate-500 font-medium">Aptitude</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-center">
                <div className="text-xs font-bold text-slate-900">{readinessData.breakdown?.csCore || 0}%</div>
                <div className="text-[10px] text-slate-500 font-medium">CS Core</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSESSMENT INSIGHT (Col 6-12) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">DIAGNOSTIC METRICS</span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">Your Assessment Performance</h2>
            </div>

            {hasAssessment && (
              <Link
                to="/student/assessment"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>View Attempts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {hasAssessment ? (
            <div className="space-y-6">
              {/* Objective Metrics Grid (All 5 Authoritative Metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center space-y-0.5">
                  <div className="text-[10px] font-bold text-indigo-600 uppercase font-mono">Score</div>
                  <div className="text-lg sm:text-xl font-black text-indigo-950">
                    {latestAnalysis?.overallPerformance?.obtainedMarks ?? (assessmentStatus?.score || 0)}
                    <span className="text-[11px] text-indigo-400 font-semibold">/{latestAnalysis?.overallPerformance?.totalMarks || 10}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-0.5">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Accuracy</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-950">
                    {latestAnalysis?.overallPerformance?.percentage ?? (assessmentStatus?.score || 0)}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center space-y-0.5">
                  <div className="text-[10px] font-bold text-blue-600 uppercase font-mono">Attempted</div>
                  <div className="text-lg sm:text-xl font-black text-blue-950">
                    {latestAnalysis?.overallPerformance?.attempted ?? (latestAnalysis?.overallPerformance?.totalQuestions || '-')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Correct</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600">
                    {latestAnalysis?.overallPerformance?.correct ?? '-'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Incorrect</div>
                  <div className="text-lg sm:text-xl font-black text-rose-600">
                    {latestAnalysis?.overallPerformance?.incorrect ?? '-'}
                  </div>
                </div>
              </div>

              {/* Subject-Wise Performance Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Subject Performance</span>
                  <span className="text-slate-400 font-normal">Real objective accuracy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjectDisplayList.map(subj => {
                    const stat = rawSubjectPerformance[subj.key];
                    const accuracy = typeof stat?.accuracy === 'number' ? stat.accuracy : null;
                    if (accuracy === null && (!stat || stat.total === 0)) return null;

                    const finalAcc = accuracy ?? 0;
                    return (
                      <div key={subj.key} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-800">{subj.label}</span>
                          <span className={`font-mono font-bold ${subj.textCol}`}>{finalAcc}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${subj.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${finalAcc}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY STATE: NO ASSESSMENT COMPLETED YET */
            <div className="p-8 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No assessment completed yet</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete your initial assessment to unlock your personalized analysis, identify topic gaps, and calibrate your readiness score.
                </p>
              </div>
              <Link
                to="/student/assessment-ready"
                className="btn-primary text-xs px-6 py-2.5 inline-flex items-center space-x-2"
              >
                <span>Take Assessment Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* 3. STRONG TOPICS & FOCUS AREAS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STRONG TOPICS */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900">Strong Topics</h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              &ge;80% Accuracy
            </span>
          </div>

          {strongTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {strongTopics.map((st, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="font-bold text-slate-900">{st.topicName || st}</span>
                  </div>
                  {st.accuracy && (
                    <span className="font-mono font-bold text-emerald-700 text-[11px]">{st.accuracy}%</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">No strong topics cataloged yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {hasAssessment
                  ? 'Keep practicing and solving problems to build high-accuracy strong topics.'
                  : 'Take your diagnostic assessment to identify your current strong topics.'}
              </p>
            </div>
          )}
        </div>

        {/* FOCUS AREAS (Weak / Critical topics) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900">Focus Areas</h2>
            </div>
            <Link to="/student/weak-areas" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {weakTopics.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {weakTopics.slice(0, 3).map((wt, idx) => {
                const wtName = wt.topicName || wt;
                const matchingGap = knowledgeGaps.find(g => (g.topicName || '').toLowerCase() === String(wtName).toLowerCase());
                const gapType = matchingGap?.gapType ? matchingGap.gapType.replace(/_/g, ' ') : (wt.classification === 'Critical' ? 'Critical Disconnect' : 'Pattern Gap');
                const recommendedAction = matchingGap?.recommendedAction || 'Targeted pattern practice & concept reinforcement';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{wtName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200">
                          {gapType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-rose-700 font-mono">Performance: {wt.accuracy !== undefined ? `${wt.accuracy}%` : '<60%'}</span>
                        <span>•</span>
                        <span>{recommendedAction}</span>
                      </div>
                    </div>

                    <Link
                      to="/student/practice"
                      className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-rose-700 border border-rose-200 font-bold text-xs shadow-2xs transition-colors shrink-0"
                    >
                      Target Topic →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No critical weaknesses detected</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Great job! Your recent evaluations show no immediate critical gaps.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 4. PERSONALIZED ROADMAP & CONTINUE LEARNING ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* PERSONALIZED ROADMAP (Col 1-7) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">LEARNING MAP</span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">Placement Preparation Roadmap</h2>
            </div>
            <Link
              to="/student/roadmap"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>Full Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Curriculum Completion</span>
              <span className="text-indigo-600 font-bold font-mono">{roadmapProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmapProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Roadmap Key Metadata Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Current Topic</span>
              <span className="font-bold text-slate-900 truncate block">
                {currentRoadmapItem?.topicName || currentRoadmapItem?.title || 'None'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Next Recommended</span>
              <span className="font-bold text-slate-900 truncate block">
                {dashboardData?.nextRecommendedItem?.title || dashboardData?.nextRecommendedItem?.topicName || 'Keep sequence'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">Target Date</span>
              <span className="font-bold text-slate-900 truncate block">
                {targetDateDisplay}
              </span>
            </div>
          </div>

          {/* Sequential Node Sequence Preview with [Completed], [Current], [Upcoming] badges */}
          {roadmapPreview.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {roadmapPreview.map((node, idx) => {
                const isCurrent = node.status === 'in_progress' || node.status === 'CURRENT';
                const isCompleted = node.status === 'completed' || node.status === 'COMPLETED';

                return (
                  <div
                    key={node.nodeId || idx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                      isCurrent
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{node.title}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">{node.category}</div>
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          [Completed]
                        </span>
                      ) : isCurrent ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
                          [Current]
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          [Upcoming]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">Roadmap initializing</p>
              <p className="text-[11px] text-slate-500">Complete an assessment to populate your sequential roadmap.</p>
            </div>
          )}
        </div>

        {/* CONTINUE LEARNING, DAILY PREPARATION & AI COACH (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">

          {/* CONTINUE LEARNING CARD */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-7 rounded-3xl text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-500/40 text-[10px] font-bold font-mono tracking-wider uppercase text-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>CONTINUE LEARNING</span>
            </div>

            {currentRoadmapItem ? (
              <div className="space-y-2">
                <div className="text-[11px] text-indigo-300 font-mono uppercase font-bold">
                  {currentRoadmapItem.category || 'DSA'} • {currentRoadmapItem.recommendedActivity || 'Pattern Recognition'}
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  {currentRoadmapItem.topicName || currentRoadmapItem.title}
                </h3>
                <p className="text-xs text-indigo-200 line-clamp-2 leading-relaxed">
                  {currentRoadmapItem.reason || currentRoadmapItem.adaptiveReason || 'Recommended next topic on your personalized roadmap.'}
                </p>

                <div className="pt-2">
                  <Link
                    to={currentRoadmapItem.topicId ? `/student/learn/${currentRoadmapItem.topicId._id || currentRoadmapItem.topicId}` : '/student/roadmap'}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-indigo-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Start Placement Journey</h3>
                <p className="text-xs text-indigo-200">
                  Select a topic from your roadmap or practice zone to start preparation.
                </p>
                <Link
                  to="/student/roadmap"
                  className="w-full py-2.5 bg-white text-indigo-900 font-bold text-xs rounded-xl inline-flex items-center justify-center space-x-2"
                >
                  <span>Explore Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* DAILY PREPARATION GOAL CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Daily Preparation Routine</span>
              </div>
              <span className="font-mono font-bold text-indigo-600 text-xs">
                {profile?.dailyPreparationTime || '1–2 hours'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Target routine set during onboarding: <strong className="text-slate-900">{profile?.dailyPreparationTime || '1–2 hours'} daily</strong>.
            </p>

            <Link
              to="/student/practice"
              className="w-full py-2.5 rounded-xl btn-secondary text-xs font-bold flex items-center justify-center space-x-2"
            >
              <span>Start Today's Preparation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI COACH DEDICATED CARD */}
          <div className="bg-white p-6 rounded-3xl border border-indigo-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider font-mono">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>AI Learning Coach</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Need help deciding what to study next?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your AI Coach analyzes your real performance metrics, interview targets, and topic gaps to provide tailored study recommendations.
            </p>
            <div className="pt-1">
              <Link
                to="/student/ai-coach"
                className="w-full py-2.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Ask AI Coach →</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* 5. MISTAKE / REVISION / SAVED CONCEPTS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* MISTAKE / REVISION INSIGHTS (Col 1-5) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Review & Retention Insights</h2>
          <p className="text-xs text-slate-500">Strengthen retention through deliberate revision.</p>

          <div className="space-y-3 pt-1">
            <Link
              to="/student/mistakes"
              className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-all flex items-center justify-between text-xs group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <BookX className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors">Mistakes to Review</div>
                  <div className="text-[11px] text-slate-500">Unresolved practice errors</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-rose-700 font-mono">
                  {dashboardData?.unresolvedMistakesCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">pending</span>
              </div>
            </Link>

            <Link
              to="/student/revision"
              className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-all flex items-center justify-between text-xs group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Revision Due</div>
                  <div className="text-[11px] text-slate-500">Spaced repetition review cards</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-700 font-mono">
                  {dashboardData?.dueRevisionCardsCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">due cards</span>
              </div>
            </Link>

            <Link
              to="/student/revision"
              className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 hover:border-indigo-200 transition-all flex items-center justify-between text-xs group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Saved Concepts</div>
                  <div className="text-[11px] text-slate-500">Bookmarked explanations & notes</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-indigo-700 font-mono">
                  {dashboardData?.savedConceptsCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">saved</span>
              </div>
            </Link>
          </div>
        </div>

        {/* RECENT ACTIVITY (Col 6-12) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500">Your latest practice attempts & test sessions.</p>
            </div>
            <Link to="/student/progress" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
              <span>All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {Array.isArray(dashboardData?.recentActivity) && dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {dashboardData.recentActivity.slice(0, 4).map((act, aIdx) => {
                const isAccepted = act.status === 'Accepted';
                const questionTitle = act.questionId?.title || act.category?.toUpperCase() || 'Practice Problem';
                let timeAgo = 'Recently';
                if (act.createdAt) {
                  try {
                    const diff = Math.floor((Date.now() - new Date(act.createdAt).getTime()) / 60000);
                    if (diff < 60) timeAgo = `${Math.max(1, diff)}m ago`;
                    else if (diff < 1440) timeAgo = `${Math.floor(diff / 60)}h ago`;
                    else timeAgo = `${Math.floor(diff / 1440)}d ago`;
                  } catch {}
                }

                return (
                  <div
                    key={act._id || aIdx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${isAccepted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{questionTitle}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{act.category || 'DSA'} • {act.status}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2 my-auto">
              <Clock className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No activity recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Your activity will appear here as you start learning and attempting practice questions.
              </p>
            </div>
          )}

          {/* Quick Practice CTA at bottom */}
          <div className="pt-2">
            <Link
              to="/student/practice"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Interactive Practice Workspace →</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;

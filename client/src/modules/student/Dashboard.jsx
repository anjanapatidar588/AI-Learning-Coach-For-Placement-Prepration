import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowUpRight,
  Loader2,
  MapPin,
  CheckCircle2,
  Clock,
  Play,
  Database,
  Cpu,
  Network,
  BookX,
  RotateCcw,
  Bot,
  Terminal,
  ArrowRight,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

import SmartRecommendations from '../../components/student/SmartRecommendations';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [readinessData, setReadinessData] = useState({
    score: 0,
    level: 'Beginner',
    summary: 'Loading readiness score...',
    breakdown: { dsa: 0, aptitude: 0, csCore: 0, consistency: 0, weaknessImpact: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/student/dashboard');
      if (res.data && res.data.success) {
        const d = res.data.data;
        setDashboardData(d);
        const details = d.readinessDetails || {};
        setReadinessData({
          score: typeof details.score === 'number' ? details.score : (d.readinessScore || 0),
          level: details.level || 'Beginner',
          summary: details.summary || 'Complete practice problems to calculate your deterministic readiness score.',
          breakdown: details.breakdown || { dsa: 0, aptitude: 0, csCore: 0, consistency: 0, weaknessImpact: 0 }
        });
      }
    } catch (err) {
      setReadinessData(prev => ({
        ...prev,
        summary: 'Unable to calculate readiness score at this time.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const currentRoadmapItem = dashboardData?.currentRoadmapItem;
  const roadmapProgressPercent = dashboardData?.roadmapProgressPercent || 0;
  const strongAreas = dashboardData?.strongAreas || [];
  const weakAreas = dashboardData?.weakAreas || [];
  const assessmentStatus = dashboardData?.assessmentStatus;

  // Subjects for Learning Map Grid
  const subjectList = [
    { name: 'Data Structures & Algorithms', key: 'dsa', icon: Code2, path: '/student/dsa', progress: 75, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { name: 'Quantitative Aptitude', key: 'aptitude', icon: BrainCircuit, path: '/student/aptitude', progress: 82, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { name: 'Database Management (DBMS)', key: 'dbms', icon: Database, path: '/student/cs-core', progress: 68, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { name: 'Object-Oriented Programming (OOPS)', key: 'oops', icon: Layers, path: '/student/cs-core', progress: 70, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { name: 'Operating Systems (OS)', key: 'os', icon: Cpu, path: '/student/cs-core', progress: 60, color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { name: 'Computer Networks (CN)', key: 'cn', icon: Network, path: '/student/cs-core', progress: 64, color: 'bg-sky-50 border-sky-200 text-sky-700' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. TOP WELCOME & HERO "YOUR NEXT STEP" CARD */}
      <div className="space-y-4">
        <div>
          <h1 className="heading-page">
            Good morning, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Let's make progress today.
          </p>
        </div>

        {/* Large Primary Card: Your Next Step */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200/80 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>YOUR NEXT STEP</span>
              </div>

              {currentRoadmapItem ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentRoadmapItem.topicName || currentRoadmapItem.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    <strong className="text-slate-900 font-bold">Why recommended: </strong>
                    {currentRoadmapItem.reason || currentRoadmapItem.adaptiveReason || 'Recommended next topic based on your baseline assessment analysis.'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Est. Time: 25 mins</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>Roadmap Node #{currentRoadmapItem.nodeOrder || 1}</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">Continue Placement Roadmap</h2>
                  <p className="text-xs text-slate-600">
                    Take your baseline assessment or continue practice problems to unlock personalized topic recommendations.
                  </p>
                </>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to={currentRoadmapItem?.topicId ? `/student/learn/${currentRoadmapItem.topicId._id || currentRoadmapItem.topicId}` : '/student/roadmap'}
                  className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Learning</span>
                </Link>

                <Link
                  to="/student/roadmap"
                  className="btn-secondary text-xs px-4 py-2.5 flex items-center space-x-1.5"
                >
                  <span>View Roadmap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Readiness Summary Badge Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shrink-0 min-w-[260px] space-y-3 text-center lg:text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Placement Readiness</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700">
                  {readinessData.level}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 justify-center lg:justify-start">
                <span className="text-4xl font-black text-slate-900">{readinessData.score}%</span>
                <span className="text-xs text-slate-500 font-medium">Overall Score</span>
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                {readinessData.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREPARATION OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Placement Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Readiness Score</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{readinessData.score}%</div>
          <p className="text-[11px] text-slate-500">Based on baseline assessment & practice accuracy</p>
        </div>

        {/* Stat 2: Topics Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Topics Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {dashboardData?.completedTopicsCount ?? 0} / {dashboardData?.totalTopicsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">{roadmapProgressPercent}% overall roadmap progress</p>
        </div>

        {/* Stat 3: Practice Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Practice Solved</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {dashboardData?.totalSolvedQuestions ?? 0} Questions
          </div>
          <p className="text-[11px] text-slate-500">Pattern-based problem attempts</p>
        </div>

        {/* Stat 4: Revision Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Revision Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {dashboardData?.dueRevisionCardsCount ?? 0} Cards
          </div>
          <p className="text-[11px] text-slate-500">Spaced repetition review items</p>
        </div>
      </div>

      {/* 3. PROGRESS JOURNEY VISUALIZER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="heading-section">Product Learning Journey</h3>
            <p className="text-xs text-slate-500">Solved ≠ Understood. How your progress is verified.</p>
          </div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            Adaptive Pipeline
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {[
            { step: '1', title: 'Assessment', active: Boolean(assessmentStatus?.completed) },
            { step: '2', title: 'Knowledge Gap', active: Boolean(weakAreas && weakAreas.length > 0) },
            { step: '3', title: 'Learn', active: Boolean(currentRoadmapItem) },
            { step: '4', title: 'Practice', active: Boolean(dashboardData?.totalSolvedQuestions > 0) },
            { step: '5', title: 'Mistake Journal', active: Boolean(dashboardData?.unresolvedMistakesCount > 0) },
            { step: '6', title: 'Revision', active: Boolean(dashboardData?.dueRevisionCardsCount > 0) },
            { step: '7', title: 'Reassessment', active: Boolean(dashboardData?.reassessmentAvailable) },
            { step: '8', title: 'Improvement', active: readinessData.score >= 70 }
          ].map((pj, i) => (
            <div key={i} className={`p-3 rounded-xl border text-center transition-all ${
              pj.active
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
            }`}>
              <div className="text-[10px] font-mono text-slate-400 uppercase mb-0.5">Step {pj.step}</div>
              <div className="text-xs truncate">{pj.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. LEARNING MAP SUBJECT GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="heading-section">Learning Map Subjects</h3>
          <Link to="/student/roadmap" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>Full Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectList.map((subj) => {
            const Icon = subj.icon;
            return (
              <Link
                key={subj.key}
                to={subj.path}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${subj.color} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>

                <h4 className="mt-4 font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {subj.name}
                </h4>

                <div className="mt-3 flex items-center justify-between text-xs text-indigo-600 font-medium">
                  <span>Explore Curriculum</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. AI RECOMMENDATIONS & FOCUS AREAS */}
      <SmartRecommendations />

      {/* FOCUS AREAS & RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Skill Mastery Spectrum</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-time</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Multi-dimensional evaluation across technical placement domains.</p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                { subject: 'DSA', score: readinessData.breakdown?.dsa || 0, fullMark: 100 },
                { subject: 'Aptitude', score: readinessData.breakdown?.aptitude || 0, fullMark: 100 },
                { subject: 'CS Core', score: readinessData.breakdown?.csCore || 0, fullMark: 100 },
                { subject: 'Consistency', score: readinessData.breakdown?.consistency || 0, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Student Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Areas (Weak topics explanation) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Knowledge Gap Focus Areas</span>
              </h3>
              <Link to="/student/weak-areas" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-500 mt-1">Targeted weak areas identified from baseline assessment.</p>
          </div>

          <div className="space-y-3">
            {weakAreas.length > 0 ? (
              weakAreas.slice(0, 3).map((wa, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">{wa.topicName || wa}</p>
                    <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                      <span className="font-bold">Focus: </span>
                      {wa.priority ? `Priority: ${wa.priority}` : 'Recommended review topic based on assessment analysis.'}
                    </p>
                  </div>
                  <Link to="/student/roadmap" className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shrink-0 hover:bg-amber-700 shadow-xs">
                    Target
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">No Knowledge Gaps Detected</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Take your baseline assessment or solve practice questions to identify specific gaps.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. QUICK ACTIONS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/student/practice" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Practice Zone</div>
            <div className="text-[10px] text-slate-500">Pattern practice</div>
          </div>
        </Link>

        <Link to="/student/mistakes" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <BookX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Mistake Journal</div>
            <div className="text-[10px] text-slate-500">{dashboardData?.unresolvedMistakesCount || 0} unresolved</div>
          </div>
        </Link>

        <Link to="/student/revision" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Revision Center</div>
            <div className="text-[10px] text-slate-500">{dashboardData?.dueRevisionCardsCount || 0} due cards</div>
          </div>
        </Link>

        <Link to="/student/ai-coach" className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">AI Coach</div>
            <div className="text-[10px] text-slate-500">24/7 AI mentor</div>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  ShieldAlert,
  Users,
  FileQuestion,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Loader2,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Database,
  Code2,
  Brain
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      } else {
        setError({
          status: 400,
          message: res.data?.message || 'Failed to load platform analytics.'
        });
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      const status = err.response?.status;
      const message = status === 403
        ? 'Admin access required.'
        : status === 401
        ? 'Authentication required. Please log in as Admin.'
        : 'Unable to fetch admin platform analytics. Please try again.';
      setError({ status, message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-semibold">Loading platform administration metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">
          {error.status === 403 ? 'Access Denied' : 'Failed to Load Dashboard'}
        </h3>
        <p className="text-xs text-slate-600">{error.message}</p>
        {error.status !== 403 && (
          <button
            onClick={fetchAdminDashboard}
            className="btn-danger text-xs px-4 py-2"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  const {
    kpis = {},
    students = { total: 0, active: 0, baselineCompleted: 0, averageReadiness: 0 },
    questions = { total: 0, dsa: 0, aptitude: 0, csCore: 0 },
    assessments = { total: 0, published: 0, completionRate: 0 },
    topics = { total: 0 },
    attempts = { total: 0, successful: 0, failed: 0, overallAccuracy: 0 },
    readiness = { average: 0, distribution: { beginner: 0, developing: 0, good: 0, placementReady: 0 } },
    domains = { dsa: { accuracy: 0 }, aptitude: { accuracy: 0 }, csCore: { accuracy: 0 } },
    weaknesses = [],
    recentActivity = []
  } = stats || {};

  const totalRegisteredStudents = kpis.totalStudents ?? students.total ?? 0;
  const activeStudentsCount = kpis.activeStudents ?? students.active ?? 0;
  const totalAssessmentsCount = kpis.totalAssessments ?? assessments.total ?? 0;
  const publishedAssessmentsCount = kpis.publishedAssessments ?? assessments.published ?? 0;
  const totalQuestionsCount = kpis.totalQuestions ?? questions.total ?? 0;
  const totalTopicsCount = kpis.totalTopics ?? topics.total ?? 0;
  const avgReadiness = kpis.averageReadiness ?? readiness.average ?? 0;
  const completionRate = kpis.assessmentCompletionRate ?? assessments.completionRate ?? 0;

  const readinessChartData = [
    { range: '0–39 (Beginner)', count: readiness.distribution?.beginner || 0, color: '#e11d48' },
    { range: '40–64 (Developing)', count: readiness.distribution?.developing || 0, color: '#d97706' },
    { range: '65–84 (Good)', count: readiness.distribution?.good || 0, color: '#4f46e5' },
    { range: '85–100 (Ready)', count: readiness.distribution?.placementReady || 0, color: '#059669' }
  ];

  const domainPerformanceData = [
    { domain: 'DSA', accuracy: domains.dsa?.accuracy || 0, color: '#4f46e5' },
    { domain: 'Aptitude', accuracy: domains.aptitude?.accuracy || 0, color: '#7c3aed' },
    { domain: 'CS Core', accuracy: domains.csCore?.accuracy || 0, color: '#059669' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin Platform Control Panel</span>
          </div>
          <h1 className="heading-page">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Platform-level analytics across students, content banks, practice attempts, and readiness indices.</p>
        </div>
      </div>

      {/* 8 Top KPI Cards (Phase 8 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Registered Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalRegisteredStudents}</span>
            <span className="text-xs text-slate-500">enrolled</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Platform student records</p>
        </div>

        {/* KPI 2: Active Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Active Students</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{activeStudentsCount}</span>
            <span className="text-xs text-slate-500">practicing</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">At least 1 verified attempt</p>
        </div>

        {/* KPI 3: Total Assessments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Total Assessments</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalAssessmentsCount}</span>
            <span className="text-xs text-slate-500">blueprints</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Created assessment structures</p>
        </div>

        {/* KPI 4: Published Assessments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Published Tests</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{publishedAssessmentsCount}</span>
            <span className="text-xs text-slate-500">live</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Accessible by students</p>
        </div>

        {/* KPI 5: Total Questions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Total Questions</span>
            <FileQuestion className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalQuestionsCount}</span>
            <span className="text-xs text-slate-500">questions</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono font-semibold">
            <span>DSA: {questions.dsa}</span>
            <span>Apt: {questions.aptitude}</span>
            <span>CS: {questions.csCore}</span>
          </div>
        </div>

        {/* KPI 6: Total Topics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Curriculum Topics</span>
            <Brain className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{totalTopicsCount}</span>
            <span className="text-xs text-slate-500">topics</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">DSA, Aptitude & CS Core</p>
        </div>

        {/* KPI 7: Average Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Average Readiness</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{avgReadiness}%</span>
            <span className="text-xs text-slate-500">platform score</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, Math.max(0, avgReadiness))}%` }}></div>
          </div>
        </div>

        {/* KPI 8: Assessment Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase font-mono">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{completionRate}%</span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Score Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Readiness Score Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Student distribution across placement readiness score tiers</p>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
                  {readinessChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Accuracy Breakdown Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Domain Performance Overview</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Aggregate student accuracy percentage across practice modules</p>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="domain" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy %">
                  {domainPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Weak Topics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Top Platform Weak Topics</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Accuracy &lt; 60%</span>
          </div>

          {weaknesses.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold">No weakness data available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-slate-500 uppercase font-mono border-b border-slate-100 font-bold">
                  <tr>
                    <th className="py-2 px-3">Topic</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Students</th>
                    <th className="py-2 px-3">Accuracy</th>
                    <th className="py-2 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weaknesses.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{w.topic}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {w.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{w.affectedStudents}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-600 font-black">{w.accuracy}%</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.severity === 'High' ? 'badge-hard' :
                          w.severity === 'Medium' ? 'badge-medium' :
                          'badge-neutral'
                        }`}>
                          {w.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recent Submissions Activity</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live Stream</span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-500">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold">No recent activity recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act) => {
                const isPassed = act.status === 'Accepted';
                return (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{act.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">{act.category}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPassed ? 'badge-easy' : 'badge-hard'
                      }`}>
                        {act.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">
                        {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

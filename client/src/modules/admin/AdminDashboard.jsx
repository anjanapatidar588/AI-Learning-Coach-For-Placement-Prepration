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
  Cell,
  PieChart,
  Pie
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-sm text-slate-400 font-mono">Loading platform administration metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">
          {error.status === 403 ? 'Access Denied' : 'Failed to Load Dashboard'}
        </h3>
        <p className="text-xs text-slate-300">{error.message}</p>
        {error.status !== 403 && (
          <button
            onClick={fetchAdminDashboard}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  const {
    students = { total: 0, active: 0, baselineCompleted: 0, averageReadiness: 0 },
    questions = { total: 0, dsa: 0, aptitude: 0, csCore: 0 },
    attempts = { total: 0, successful: 0, failed: 0, overallAccuracy: 0 },
    readiness = { average: 0, distribution: { beginner: 0, developing: 0, good: 0, placementReady: 0 } },
    domains = { dsa: { accuracy: 0 }, aptitude: { accuracy: 0 }, csCore: { accuracy: 0 } },
    weaknesses = [],
    recentActivity = []
  } = stats || {};

  const readinessChartData = [
    { range: '0–39 (Beginner)', count: readiness.distribution?.beginner || 0, color: '#f43f5e' },
    { range: '40–64 (Developing)', count: readiness.distribution?.developing || 0, color: '#f59e0b' },
    { range: '65–84 (Good)', count: readiness.distribution?.good || 0, color: '#6366f1' },
    { range: '85–100 (Ready)', count: readiness.distribution?.placementReady || 0, color: '#10b981' }
  ];

  const questionDistributionData = [
    { name: 'DSA', count: questions.dsa || 0, color: '#6366f1' },
    { name: 'Aptitude', count: questions.aptitude || 0, color: '#8b5cf6' },
    { name: 'CS Core', count: questions.csCore || 0, color: '#10b981' }
  ];

  const domainPerformanceData = [
    { domain: 'DSA', accuracy: domains.dsa?.accuracy || 0, color: '#6366f1' },
    { domain: 'Aptitude', accuracy: domains.aptitude?.accuracy || 0, color: '#8b5cf6' },
    { domain: 'CS Core', accuracy: domains.csCore?.accuracy || 0, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Platform Control Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Platform-level analytics across students, content banks, practice attempts, and readiness indices.</p>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{students.total}</span>
            <span className="text-xs text-slate-400">registered</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">{students.active} active practicing | {students.baselineCompleted} baseline done</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Question Bank Items</span>
            <FileQuestion className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{questions.total}</span>
            <span className="text-xs text-slate-400">questions</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
            <span>DSA: {questions.dsa}</span>
            <span>Apt: {questions.aptitude}</span>
            <span>CS: {questions.csCore}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Submissions</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{attempts.total}</span>
            <span className="text-xs text-slate-400">attempts</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-emerald-400">{attempts.successful} Passed</span>
            <span className="text-rose-400">{attempts.failed} Failed</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Placement Readiness</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{students.averageReadiness}%</span>
            <span className="text-xs text-slate-400">platform avg</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, students.averageReadiness))}%` }}></div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Score Distribution Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Readiness Score Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Student distribution across placement readiness score tiers</p>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="range" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
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
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Domain Performance Overview</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Aggregate student accuracy percentage across practice modules</p>
          </div>

          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="domain" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
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
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Top Platform Weak Topics</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Accuracy &lt; 60%</span>
          </div>

          {weaknesses.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs">No weakness data available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Topic</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Affected Students</th>
                    <th className="py-2 px-3">Accuracy</th>
                    <th className="py-2 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {weaknesses.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">{w.topic}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                          {w.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{w.affectedStudents}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-400 font-bold">{w.accuracy}%</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.severity === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          w.severity === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
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

        {/* Recent Platform Activity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Recent Submissions Activity</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Stream</span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-400">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs">No recent activity recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act) => {
                const isPassed = act.status === 'Accepted';
                return (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{act.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{act.category}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {act.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
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

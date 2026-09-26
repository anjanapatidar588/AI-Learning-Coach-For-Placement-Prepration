import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Loader2,
  AlertCircle,
  Code2,
  Brain,
  Database,
  ArrowRight,
  Activity
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

const MyProgress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);

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

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0m';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm text-gray-400 font-mono">Loading placement progress analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Failed to Load Progress</h3>
        <p className="text-xs text-gray-300">{error}</p>
        <button
          onClick={fetchProgressData}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overall = progressData?.overall || { totalAttempts: 0, passedAttempts: 0, failedAttempts: 0, accuracy: 0, totalTimeSpentSeconds: 0, hintsUsed: 0 };
  const dsa = progressData?.dsa || { totalAttempts: 0, passedAttempts: 0, failedAttempts: 0, accuracy: 0, totalTimeSpentSeconds: 0, hintsUsed: 0 };
  const aptitude = progressData?.aptitude || { totalAttempts: 0, passedAttempts: 0, failedAttempts: 0, accuracy: 0, totalTimeSpentSeconds: 0, hintsUsed: 0 };
  const csCore = progressData?.csCore || { totalAttempts: 0, passedAttempts: 0, failedAttempts: 0, accuracy: 0, totalTimeSpentSeconds: 0, hintsUsed: 0 };
  const recentActivity = progressData?.recentActivity || [];

  const hasData = overall.totalAttempts > 0;

  const domainChartData = [
    { domain: 'DSA', accuracy: dsa.accuracy, attempts: dsa.totalAttempts, passed: dsa.passedAttempts, color: '#6366f1' },
    { domain: 'Aptitude', accuracy: aptitude.accuracy, attempts: aptitude.totalAttempts, passed: aptitude.passedAttempts, color: '#8b5cf6' },
    { domain: 'CS Core', accuracy: csCore.accuracy, attempts: csCore.totalAttempts, passed: csCore.passedAttempts, color: '#10b981' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            <span>My Placement Progress</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track your placement preparation journey, accuracy trends, and module performance.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/student/practice')}
            className="btn-primary text-xs px-4 py-2"
          >
            <span>Practice Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="empty-state-card py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="heading-section">No practice data yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Start solving questions across DSA, Aptitude, or CS Core to see your real-time accuracy and performance metrics.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/student/dsa')}
              className="btn-primary text-xs px-4 py-2"
            >
              Start DSA Practice
            </button>
            <button
              onClick={() => navigate('/student/assessment/baseline')}
              className="btn-secondary text-xs px-4 py-2"
            >
              Take Baseline Assessment
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Overall Accuracy</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{overall.accuracy}%</span>
                <span className="text-xs text-gray-400">rate</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, overall.accuracy))}%` }}></div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Total Attempts</span>
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{overall.totalAttempts}</span>
                <span className="text-xs text-gray-400">questions</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{overall.passedAttempts} Passed</span>
                </span>
                <span className="text-rose-400 flex items-center space-x-1">
                  <XCircle className="w-3 h-3" />
                  <span>{overall.failedAttempts} Failed</span>
                </span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Total Practice Time</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{formatTime(overall.totalTimeSpentSeconds)}</span>
              </div>
              <p className="text-[11px] text-gray-400">Time spent answering questions</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Hints Requested</span>
                <HelpCircle className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-white">{overall.hintsUsed}</span>
                <span className="text-xs text-gray-400">hints</span>
              </div>
              <p className="text-[11px] text-gray-400">AI hints & solutions referenced</p>
            </div>
          </div>

          {/* Domain Performance Section & Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Domain Cards Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Domain Performance Breakdown</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DSA */}
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-white">DSA</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400">{dsa.accuracy}%</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Attempts:</span>
                      <span className="font-mono">{dsa.totalAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Passed:</span>
                      <span className="font-mono text-emerald-400">{dsa.passedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="font-mono text-rose-400">{dsa.failedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Spent:</span>
                      <span className="font-mono">{formatTime(dsa.totalTimeSpentSeconds)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/student/dsa')}
                    className="w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold transition-all"
                  >
                    Practice DSA
                  </button>
                </div>

                {/* Aptitude */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/20 bg-violet-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-white">Aptitude</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-400">{aptitude.accuracy}%</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Attempts:</span>
                      <span className="font-mono">{aptitude.totalAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Passed:</span>
                      <span className="font-mono text-emerald-400">{aptitude.passedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="font-mono text-rose-400">{aptitude.failedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Spent:</span>
                      <span className="font-mono">{formatTime(aptitude.totalTimeSpentSeconds)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/student/aptitude')}
                    className="w-full py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 text-xs font-semibold transition-all"
                  >
                    Practice Aptitude
                  </button>
                </div>

                {/* CS Core */}
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Database className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-white">CS Core</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{csCore.accuracy}%</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Attempts:</span>
                      <span className="font-mono">{csCore.totalAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Passed:</span>
                      <span className="font-mono text-emerald-400">{csCore.passedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="font-mono text-rose-400">{csCore.failedAttempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Spent:</span>
                      <span className="font-mono">{formatTime(csCore.totalTimeSpentSeconds)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/student/cs-core')}
                    className="w-full py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-xs font-semibold transition-all"
                  >
                    Practice CS Core
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Accuracy Visualization */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Domain Accuracy Comparison</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Real-time percentage accuracy across technical domains</p>
              </div>

              <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="domain" stroke="#9ca3af" fontSize={11} />
                    <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy %">
                      {domainChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          {recentActivity.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Recent Practice Activity</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-gray-400 uppercase font-mono border-b border-gray-800">
                    <tr>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Time Spent</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {recentActivity.map((act, idx) => {
                      const isPassed = act.status === 'Accepted';
                      return (
                        <tr key={idx} className="hover:bg-gray-900/40 transition-colors">
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                              {act.category ? act.category.replace('_', ' ') : 'Practice'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{act.status}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-300">
                            {formatTime(act.timeSpentSeconds)}
                          </td>
                          <td className="py-3 px-3 text-gray-400">
                            {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyProgress;

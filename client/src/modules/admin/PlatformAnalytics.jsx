import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter,
  Download
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
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const PlatformAnalytics = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Time series submission volume
  const submissionTrendData = [
    { day: 'Mon', submissions: 28, passRate: 72 },
    { day: 'Tue', submissions: 42, passRate: 76 },
    { day: 'Wed', submissions: 35, passRate: 68 },
    { day: 'Thu', submissions: 58, passRate: 80 },
    { day: 'Fri', submissions: 48, passRate: 74 },
    { day: 'Sat', submissions: 64, passRate: 82 },
    { day: 'Sun', submissions: 52, passRate: 79 },
  ];

  // Domain comparison
  const domainComparisonData = [
    { domain: 'DSA', attempts: 184, accuracy: 72, color: '#6366f1' },
    { domain: 'Quantitative Aptitude', attempts: 142, accuracy: 58, color: '#8b5cf6' },
    { domain: 'CS Core (DBMS, OS, CN)', attempts: 96, accuracy: 65, color: '#06b6d4' },
    { domain: 'System Design', attempts: 68, accuracy: 52, color: '#f59e0b' },
    { domain: 'HR & Mock Interview', attempts: 45, accuracy: 48, color: '#ec4899' },
  ];

  // Error distribution
  const errorDistribution = [
    { name: 'Time Limit Exceeded (TLE)', value: 38, color: '#f43f5e' },
    { name: 'Wrong Output / Logic Bug', value: 32, color: '#f59e0b' },
    { name: 'Edge Case / Null Pointer', value: 18, color: '#8b5cf6' },
    { name: 'Runtime Error', value: 12, color: '#06b6d4' },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Domain,Total Attempts,Average Accuracy\n"
      + domainComparisonData.map(d => `"${d.domain}",${d.attempts},${d.accuracy}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pathpilot_platform_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Platform Intelligence & Cohort Diagnostics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Analytics & Metrics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated student submission volumes, accuracy trajectories, common failure modes, and readiness trends.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {['7d', '30d', '90d'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === t ? 'bg-white text-purple-700 shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Total Submissions</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">327</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> 18.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Coding & MCQ attempts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Platform Accuracy</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">74.6%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> 4.5%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Accepted on first submission</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">AI Coach Invocations</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">1,480</span>
            <span className="text-xs font-bold text-indigo-600 flex items-center">
              <Sparkles className="w-3 h-3 ml-1" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Hints, reviews & explanations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Avg Daily Practice</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">46 mins</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Active learner engagement</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Volume & Pass Rate Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Daily Submission Volume & Pass Rates</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Cohort activity by day of the week</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTrendData}>
                <defs>
                  <linearGradient id="submGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [name === 'submissions' ? `${val} attempts` : `${val}% pass rate`, name === 'submissions' ? 'Submissions' : 'Pass Rate']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#submGrad)" dot={{ r: 4, fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Domain Performance & Attempt Volume</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Aggregate student proficiency across core categories</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainComparisonData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="domain" type="category" stroke="#64748b" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                  {domainComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Error Breakdown & Platform Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Common Submission Failure Modes</span>
          </h3>
          <p className="text-[11px] text-slate-400">Distribution of failed practice attempts</p>

          <div className="space-y-3 mt-4">
            {errorDistribution.map((err, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{err.name}</span>
                  <span className="text-slate-900 font-bold">{err.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${err.value}%`, backgroundColor: err.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Automated Remediation Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1.5">
              <span className="text-xs font-bold text-purple-900">Optimization Required: Arrays & Hashing</span>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                38% of submissions fail with TLE due to nested quadratic loops. Deploying an algorithmic complexity module is recommended.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
              <span className="text-xs font-bold text-indigo-900">High Readiness: SQL & DBMS</span>
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                Database query accuracy is 82% across the cohort. Recommended to introduce advanced indexing and transaction isolation drills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;

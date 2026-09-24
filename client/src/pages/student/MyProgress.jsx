import React from 'react';
import { LineChart as LineChartIcon, BarChart3, TrendingUp, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';

export default function MyProgress() {
  const weeklyData = [
    { day: 'Mon', problems: 2, accuracy: 70 },
    { day: 'Tue', problems: 4, accuracy: 80 },
    { day: 'Wed', problems: 3, accuracy: 66 },
    { day: 'Thu', problems: 5, accuracy: 90 },
    { day: 'Fri', problems: 1, accuracy: 100 },
    { day: 'Sat', problems: 4, accuracy: 75 },
    { day: 'Sun', problems: 3, accuracy: 85 }
  ];

  const categoryMastery = [
    { category: 'DSA', mastery: 74 },
    { category: 'Aptitude', mastery: 82 },
    { category: 'CS Core', mastery: 68 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <LineChartIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">My Learning Progress Analytics</h1>
            <p className="text-xs text-slate-400">Detailed historical breakdown across DSA, Aptitude, and CS Core modules.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Weekly Solve Count & Accuracy Trend</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Accuracy %" />
                <Line type="monotone" dataKey="problems" stroke="#3b82f6" strokeWidth={2} name="Problems Solved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <span>Module Mastery Percentage</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryMastery}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="mastery" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Mastery %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

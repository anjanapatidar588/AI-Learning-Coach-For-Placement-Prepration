import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PlatformAnalytics() {
  const analyticsData = [
    { name: 'DSA', submissions: 620 },
    { name: 'Aptitude', submissions: 410 },
    { name: 'CS Core', submissions: 210 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Platform Analytics</h1>
            <p className="text-xs text-slate-400">Aggregate platform practice stats, submission volume, and common error analytics.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-100">Module Practice Volume</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="submissions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

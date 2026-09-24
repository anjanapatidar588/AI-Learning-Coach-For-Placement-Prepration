import React from 'react';
import { AlertTriangle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WeakAreas() {
  const navigate = useNavigate();

  const weakTopics = [
    {
      id: 'w-1',
      topicTitle: 'Dynamic Programming - Memory Optimization',
      category: 'DSA',
      severity: 'High',
      failureCount: 3,
      pattern: 'Overlapping subproblems state space confusion',
      actionPlan: 'Solve 3 1D DP problems (Climbing Stairs, Coin Change) with space optimization.'
    },
    {
      id: 'w-2',
      topicTitle: 'DBMS - Transaction Concurrency & Locking',
      category: 'CS Core',
      severity: 'Medium',
      failureCount: 2,
      pattern: 'Confusion between Shared vs Exclusive locks',
      actionPlan: 'Review ACID isolation level flashcards and complete 2PL quiz.'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Weakness Detection Engine</h1>
            <p className="text-xs text-slate-400">Topics flagged by the intelligence engine based on consecutive submission errors.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {weakTopics.map(w => (
          <div key={w.id} className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{w.topicTitle}</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                  {w.severity} Severity
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase">
                  {w.category}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Failed Attempts: {w.failureCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <div className="text-[10px] font-semibold text-rose-400 uppercase">Identified Error Pattern</div>
              <p className="text-slate-300">{w.pattern}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <div className="text-[10px] font-semibold text-purple-400 uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>AI Recommended Remedial Plan</span>
              </div>
              <p className="text-slate-300">{w.actionPlan}</p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => navigate(w.category === 'DSA' ? '/dsa' : '/cs-core')}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-rose-600/20"
              >
                <span>Start Remedial Practice</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

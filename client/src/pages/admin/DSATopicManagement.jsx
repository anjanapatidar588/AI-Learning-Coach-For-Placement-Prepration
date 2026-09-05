import React from 'react';
import { Layers, Plus } from 'lucide-react';

export default function DSATopicManagement() {
  const topics = [
    { id: 1, name: 'Arrays & Strings', count: 24, order: 1 },
    { id: 2, name: 'Linked Lists', count: 16, order: 2 },
    { id: 3, name: 'Binary Trees & BST', count: 18, order: 3 },
    { id: 4, name: 'Dynamic Programming', count: 20, order: 4 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DSA Topic Management</h1>
            <p className="text-xs text-slate-400">Manage data structures & algorithm topic hierarchy and prerequisites.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Add DSA Topic</span>
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        {topics.map(t => (
          <div key={t.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="font-semibold text-xs text-slate-200">{t.name}</div>
            <div className="text-xs text-slate-400">Order #{t.order} • {t.count} Problems</div>
          </div>
        ))}
      </div>
    </div>
  );
}

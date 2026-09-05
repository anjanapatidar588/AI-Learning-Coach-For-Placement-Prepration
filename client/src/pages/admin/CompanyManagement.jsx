import React from 'react';
import { Building2, Plus } from 'lucide-react';

export default function CompanyManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Company Management</h1>
            <p className="text-xs text-slate-400">Configure target company hiring profiles, round descriptions, and benchmarks.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Add Company Profile</span>
        </button>
      </div>
    </div>
  );
}

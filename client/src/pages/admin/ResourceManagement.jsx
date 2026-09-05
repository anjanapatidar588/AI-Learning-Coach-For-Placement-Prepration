import React from 'react';
import { FolderKanban, Plus } from 'lucide-react';

export default function ResourceManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Resource Management</h1>
            <p className="text-xs text-slate-400">Manage external study links, reference cheatsheets, and preparation material.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Add Resource</span>
        </button>
      </div>
    </div>
  );
}

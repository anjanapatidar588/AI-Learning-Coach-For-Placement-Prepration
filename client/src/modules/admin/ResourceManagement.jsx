import React from 'react';
import { Library } from 'lucide-react';

const ResourceManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Library className="w-7 h-7 text-indigo-400" />
        <span>Resource & Material Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Manage supplementary PDF cheatsheets, interview guides, and reference materials.</p>
      </div>
    </div>
  );
};

export default ResourceManagement;

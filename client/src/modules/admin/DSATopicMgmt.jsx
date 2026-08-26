import React from 'react';
import { FolderKanban } from 'lucide-react';

const DSATopicMgmt = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <FolderKanban className="w-7 h-7 text-indigo-400" />
        <span>DSA Topic Hierarchy & Syllabus Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Organize DSA topics, difficulty levels, and prerequisite sequences for student roadmap generation.</p>
      </div>
    </div>
  );
};

export default DSATopicMgmt;

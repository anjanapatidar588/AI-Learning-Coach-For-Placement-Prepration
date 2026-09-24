import React from 'react';
import { BookOpen } from 'lucide-react';

const CSCoreContentMgmt = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <BookOpen className="w-7 h-7 text-emerald-400" />
        <span>CS Core Content & Subject Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Manage subject modules for DBMS, OS, Computer Networks, and System Design theory guides.</p>
      </div>
    </div>
  );
};

export default CSCoreContentMgmt;

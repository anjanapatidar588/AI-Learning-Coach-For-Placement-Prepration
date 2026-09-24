import React from 'react';
import { BookOpenCheck } from 'lucide-react';

const CSCoreModule = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <BookOpenCheck className="w-7 h-7 text-emerald-400" />
        <span>CS Core Fundamentals</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Master DBMS (SQL, Normalization, ACID), Operating Systems (Processes, Threads, Memory), and Computer Networks (OSI, TCP/IP).</p>
      </div>
    </div>
  );
};

export default CSCoreModule;

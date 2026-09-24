import React from 'react';
import { Calculator } from 'lucide-react';

const AptitudeTopicMgmt = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Calculator className="w-7 h-7 text-violet-400" />
        <span>Aptitude Topic Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Manage Quantitative Aptitude & Logical Reasoning syllabus tree and topic formulas.</p>
      </div>
    </div>
  );
};

export default AptitudeTopicMgmt;

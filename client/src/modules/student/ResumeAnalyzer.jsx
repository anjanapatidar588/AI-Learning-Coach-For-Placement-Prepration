import React from 'react';
import { FileCheck } from 'lucide-react';

const ResumeAnalyzer = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <FileCheck className="w-7 h-7 text-rose-400" />
        <span>AI Resume ATS Analyzer</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Upload your resume to receive AI ATS score breakdowns, keyword extraction, and targeted suggestions to match top company job descriptions.</p>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;

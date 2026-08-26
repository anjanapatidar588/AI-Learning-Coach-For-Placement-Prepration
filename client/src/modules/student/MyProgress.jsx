import React from 'react';
import { TrendingUp } from 'lucide-react';

const MyProgress = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <TrendingUp className="w-7 h-7 text-indigo-400" />
        <span>My Placement Progress</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Longitudinal performance tracking across practice questions, mock interviews, accuracy trends, and readiness score updates.</p>
      </div>
    </div>
  );
};

export default MyProgress;

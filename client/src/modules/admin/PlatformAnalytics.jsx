import React from 'react';
import { BarChart3 } from 'lucide-react';

const PlatformAnalytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <BarChart3 className="w-7 h-7 text-indigo-400" />
        <span>Platform-Wide Usage & Readiness Analytics</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Monitor aggregated student submission volumes, pass rates, AI call frequency, and cohort placement readiness indicators.</p>
      </div>
    </div>
  );
};

export default PlatformAnalytics;

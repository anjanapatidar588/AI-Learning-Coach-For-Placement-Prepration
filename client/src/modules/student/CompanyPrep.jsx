import React from 'react';
import { Building2 } from 'lucide-react';

const CompanyPrep = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Building2 className="w-7 h-7 text-indigo-400" />
        <span>Target Company Preparation</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Explore company-specific interview patterns, tagged question archives, and custom readiness scores for target product & service companies.</p>
      </div>
    </div>
  );
};

export default CompanyPrep;

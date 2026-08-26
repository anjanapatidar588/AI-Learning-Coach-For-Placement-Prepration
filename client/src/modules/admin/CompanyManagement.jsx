import React from 'react';
import { Building } from 'lucide-react';

const CompanyManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Building className="w-7 h-7 text-amber-400" />
        <span>Company Profile & Pattern Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Add target placement company profiles, weightage vectors, and tag practice questions to company archives.</p>
      </div>
    </div>
  );
};

export default CompanyManagement;

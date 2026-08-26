import React from 'react';
import { ShieldAlert, Users, HelpCircle, Building, Sliders } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-rose-900/30">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
          <ShieldAlert className="w-7 h-7 text-rose-400" />
          <span>Admin Platform Overview</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage platform content, question banks, AI prompts, hiring companies, and registered students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="mt-3 text-xl font-bold text-white">1,240</h3>
          <p className="text-xs text-gray-400 mt-0.5">Active Students</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="mt-3 text-xl font-bold text-white">450</h3>
          <p className="text-xs text-gray-400 mt-0.5">Question Items</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <Building className="w-5 h-5 text-amber-400" />
          <h3 className="mt-3 text-xl font-bold text-white">28</h3>
          <p className="text-xs text-gray-400 mt-0.5">Company Profiles</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <Sliders className="w-5 h-5 text-rose-400" />
          <h3 className="mt-3 text-xl font-bold text-white">Gemini 1.5</h3>
          <p className="text-xs text-gray-400 mt-0.5">Active AI Engine</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

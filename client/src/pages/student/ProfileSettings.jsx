import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, CheckCircle2, User, Building2, Briefcase } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Johnson');
  const [email, setEmail] = useState(user?.email || 'alex.student@placementcoach.ai');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [targetCompanies, setTargetCompanies] = useState(user?.targetCompanies?.join(', ') || 'Google, Amazon, TCS');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profile & Target Preferences</h1>
            <p className="text-xs text-slate-400">Configure your target job role and companies to drive the AI personalization engine.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Software Development Engineer (SDE-1)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">Target Companies (Comma separated)</label>
          <input
            type="text"
            value={targetCompanies}
            onChange={(e) => setTargetCompanies(e.target.value)}
            placeholder="Google, Amazon, TCS, Infosys"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Preferences</span>
          </button>

          {saved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved & AI Personalization Updated!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

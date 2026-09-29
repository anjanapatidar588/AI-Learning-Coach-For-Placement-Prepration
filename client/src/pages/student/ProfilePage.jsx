import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { User, GraduationCap, Target, Calendar, Building2, Clock, Menu } from 'lucide-react';
import { initialStudentData } from '../../services/pathpilotData';

const ProfilePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const student = initialStudentData;

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Student Profile</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-cyan-500/20 shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <p className="text-xs text-slate-400 font-mono">{student.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {student.targetRole}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel-dark p-6 space-y-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Academic Profile</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div><span className="text-slate-500 block">University / College</span> <span className="font-semibold text-white">{student.college}</span></div>
                <div><span className="text-slate-500 block">Graduation Year</span> <span className="font-semibold text-white">{student.graduationYear}</span></div>
                <div><span className="text-slate-500 block">Daily Study Commitment</span> <span className="font-semibold text-cyan-400">{student.dailyPreparationTime}</span></div>
              </div>
            </div>

            <div className="glass-panel-dark p-6 space-y-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Target Companies</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {student.targetCompanies.map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 border border-slate-800">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProfilePage;

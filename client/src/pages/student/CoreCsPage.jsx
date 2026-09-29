import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { Cpu, Database, Network, ShieldCheck, HardDrive, ArrowRight, Menu, CheckCircle2 } from 'lucide-react';
import { subjectsData } from '../../services/pathpilotData';

const CoreCsPage = () => {
  const { subject } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const coreModule = subjectsData.find((s) => s.id === 'core');
  const activeSubject = coreModule.subjects.find((s) => s.id === subject) || coreModule.subjects[1]; // DBMS default

  const subjectIcons = {
    oops: ShieldCheck,
    dbms: Database,
    os: HardDrive,
    cn: Network,
    coa: Cpu
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">CS Core Fundamentals</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          {/* Header */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-indigo-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Computer Science Core Subjects</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">CS Core Fundamentals</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Master OOPS, DBMS Normalization, Operating Systems Mutex/Paging, and Computer Networks.
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl glass-panel-dark border-indigo-500/30 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block">Core CS Progress</span>
              <span className="text-lg font-bold text-indigo-400">{coreModule.progress}% Completed</span>
            </div>
          </div>

          {/* 5 Core Subject Tabs / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreModule.subjects.map((sub) => {
              const Icon = subjectIcons[sub.id] || Cpu;
              const isSelected = sub.id === activeSubject.id;

              return (
                <Link
                  key={sub.id}
                  to={`/core/${sub.id}`}
                  className={`p-4 rounded-xl glass-card-dark text-left space-y-3 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{sub.name}</h4>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400" style={{ width: `${sub.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300 font-bold block text-right">{sub.progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Active Core Subject Details & Syllabus Topics */}
          <div className="glass-panel-dark p-6 sm:p-8 space-y-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">Active Subject</span>
                <h3 className="text-xl font-bold text-white">{activeSubject.name}</h3>
              </div>

              <Link to="/practice" className="btn-pathpilot-primary text-xs py-2.5 px-5">
                <span>Start Subject Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Topics List for Active Subject */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Syllabus Topics & Mastery</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSubject.topics.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-white">{t.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.completed ? '✓ Completed' : t.current ? '⚡ Active Study' : '⏳ Upcoming'}
                      </span>
                    </div>

                    <span className={`text-xs font-bold font-mono ${t.completed ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {t.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default CoreCsPage;

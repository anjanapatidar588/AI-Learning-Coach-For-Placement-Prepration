import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { Compass, CheckCircle2, Clock, ArrowRight, RefreshCw, Menu, Sparkles, AlertCircle } from 'lucide-react';
import { roadmapData } from '../../services/pathpilotData';

const RoadmapPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar */}
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Personalized Roadmap</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          {/* Page Header */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-Generated Dynamic Learning Path</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Personalized Placement Roadmap</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Your pathway adapts authoritatively based on assessment scores, practice accuracy, and knowledge gaps.
              </p>
            </div>

            <button
              onClick={() => alert("Roadmap resynced with latest performance metrics!")}
              className="btn-pathpilot-secondary text-xs py-2.5 px-4 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Re-sync Roadmap</span>
            </button>
          </div>

          {/* Timeline Pathway */}
          <div className="space-y-8 relative before:absolute before:left-4 sm:before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-slate-800">
            {roadmapData.map((phase, idx) => (
              <div key={idx} className="relative pl-10 sm:pl-16 space-y-4">
                
                {/* Node Status Marker */}
                <div className={`absolute left-2 sm:left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center -translate-x-1/2 border ${
                  phase.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : phase.status === 'current'
                    ? 'bg-cyan-500 border-cyan-300 text-slate-950 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  {phase.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>

                {/* Phase Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-3">
                    <span>{phase.phase}</span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
                      phase.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                      phase.status === 'current' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                      'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {phase.status}
                    </span>
                  </h3>
                </div>

                {/* Phase Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phase.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`glass-panel-dark p-4 space-y-3 flex flex-col justify-between ${
                        item.status === 'current'
                          ? 'border-cyan-500/50 bg-slate-950/80 shadow-lg shadow-cyan-500/10'
                          : item.status === 'completed'
                          ? 'border-emerald-500/20 bg-slate-950/40'
                          : 'border-slate-800 opacity-80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.date}</span>
                          {item.status === 'current' && <span className="text-cyan-400 font-semibold font-mono">Active Target</span>}
                        </div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.status === 'completed' ? '✓ Mastered' : item.status === 'current' ? '⚡ High Priority' : '⏳ Scheduled'}
                        </span>
                        <Link
                          to="/practice"
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            item.status === 'current' ? 'text-cyan-400 hover:underline' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>Open Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};

export default RoadmapPage;

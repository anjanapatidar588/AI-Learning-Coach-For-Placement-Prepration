import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { Bot, Play, CheckCircle2, Menu, Sparkles, Star, ArrowRight } from 'lucide-react';
import { mockInterviewSessions } from '../../services/pathpilotData';

const MockInterviewPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const startInterview = (session) => {
    setActiveSession(session);
    setSummaryOpen(false);
    setTimeout(() => {
      setSummaryOpen(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Mock Interview</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Technical & HR Interview Simulator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Mock Interview Prep</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Simulate real technical rounds with live feedback, edge-case probing, and behavioral scoring.
              </p>
            </div>
          </div>

          {/* Interview Tracks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockInterviewSessions.map((session) => (
              <div key={session.id} className="glass-panel-dark p-6 space-y-4 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">{session.duration}</span>
                    <span className="text-[10px] font-bold text-amber-400">{session.difficulty}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{session.title}</h3>
                </div>

                <button
                  onClick={() => startInterview(session)}
                  className="btn-pathpilot-primary text-xs w-full text-center py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Mock Interview →</span>
                </button>
              </div>
            ))}
          </div>

          {/* Simulated Interview Active / Completed State */}
          {activeSession && !summaryOpen && (
            <div className="glass-panel-glow p-6 text-center space-y-3 border-cyan-500/40 animate-pulse">
              <Bot className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Simulating AI Technical Interview Round...</h4>
              <p className="text-xs text-slate-400 font-mono">Analyzing voice response, code efficiency, and conceptual clarity...</p>
            </div>
          )}

          {summaryOpen && (
            <div className="glass-panel-glow p-6 sm:p-8 space-y-6 border border-emerald-500/40 bg-slate-950 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Interview Performance Summary</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded border border-emerald-500/30">Score: 88%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-emerald-400">Strengths</h5>
                  <p className="text-slate-300 leading-relaxed">Clear communication of Space Complexity & Hash Map pattern choice.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-amber-400">Areas to Improve</h5>
                  <p className="text-slate-300 leading-relaxed">Mention edge cases (null root, empty inputs) before writing code.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-cyan-400">Recommended Action</h5>
                  <p className="text-slate-300 leading-relaxed">Review Binary Tree recursion stack overflow handling.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MockInterviewPage;

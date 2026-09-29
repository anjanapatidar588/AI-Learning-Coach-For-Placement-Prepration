import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { TrendingUp, Award, CheckCircle2, Flame, Menu, Target, BarChart2 } from 'lucide-react';
import { initialStudentData } from '../../services/pathpilotData';

const ProgressPage = () => {
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
          <span className="text-sm font-bold text-white">Progress & Analytics</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Performance Indices</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Progress Analytics</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Track problem-solving accuracy, daily study streak, and subject-wise mastery.
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel-dark p-6 space-y-2 border-cyan-500/20">
              <span className="text-xs text-slate-400">Questions Solved</span>
              <div className="text-3xl font-extrabold text-white">{student.questionsSolved} / {student.totalQuestions}</div>
              <span className="text-[11px] text-cyan-400 font-mono">67.6% Completed</span>
            </div>

            <div className="glass-panel-dark p-6 space-y-2 border-emerald-500/20">
              <span className="text-xs text-slate-400">Accuracy Rate</span>
              <div className="text-3xl font-extrabold text-emerald-400">{student.accuracy}%</div>
              <span className="text-[11px] text-emerald-400 font-mono">High Precision</span>
            </div>

            <div className="glass-panel-dark p-6 space-y-2 border-amber-500/20">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Daily Streak</span>
              </span>
              <div className="text-3xl font-extrabold text-amber-400">{student.streakDays} Days</div>
              <span className="text-[11px] text-slate-500 font-mono">Consistent Learner</span>
            </div>

            <div className="glass-panel-dark p-6 space-y-2 border-purple-500/20">
              <span className="text-xs text-slate-400">Topics Mastered</span>
              <div className="text-3xl font-extrabold text-purple-400">{student.topicsCompleted}</div>
              <span className="text-[11px] text-slate-500 font-mono">Across DSA & Core CS</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProgressPage;

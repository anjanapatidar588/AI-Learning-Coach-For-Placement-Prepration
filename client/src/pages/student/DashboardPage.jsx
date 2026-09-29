import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Code2,
  Calculator,
  Cpu,
  Compass,
  Play,
  Menu,
  Zap,
  BookOpen
} from 'lucide-react';
import { initialStudentData, subjectsData } from '../../services/pathpilotData';

const DashboardPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const student = initialStudentData;

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Compact Mobile Top Bar */}
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Dashboard</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* TOP WELCOME BANNER */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Placement Preparation Command Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Good Morning, {student.name} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Let's make progress today. You have <span className="text-cyan-400 font-bold">{student.daysRemaining} days remaining</span> until your placement target date ({student.placementTargetDate}).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <div className="px-4 py-3 rounded-2xl glass-panel-dark border-indigo-500/30 text-left">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Target Date</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{student.placementTargetDate}</span>
                </span>
              </div>

              <Link to="/practice" className="btn-pathpilot-primary text-xs py-3 px-5">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* YOUR NEXT STEP (PRIMARY RECOMMENDED ACTION) */}
          <div className="glass-panel-dark p-6 border-indigo-500/40 space-y-4 text-left relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <span>Your Next Step</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Est. Time: {student.nextRecommendedTopic.estimatedTime}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{student.nextRecommendedTopic.title}</h3>
                <p className="text-xs text-slate-400">{student.nextRecommendedTopic.reason}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link to="/practice" className="btn-pathpilot-primary text-xs py-2.5 px-5">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Continue Learning</span>
                </Link>
                <Link to="/roadmap" className="btn-pathpilot-secondary text-xs py-2.5 px-4">
                  <span>View Roadmap</span>
                </Link>
              </div>
            </div>
          </div>

          {/* PREPARATION OVERVIEW STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            
            {/* Overall Progress Card */}
            <div className="glass-panel-dark p-5 space-y-2 border-cyan-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Placement Readiness</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{student.overallProgress}%</span>
                <span className="text-xs font-semibold text-emerald-400">+{student.progressIncrement}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${student.overallProgress}%` }} />
              </div>
            </div>

            {/* DSA Progress Card */}
            <div className="glass-panel-dark p-5 space-y-2 border-indigo-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>DSA Mastery</span>
                <Code2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{student.domainProgress.dsa}%</span>
                <span className="text-xs text-slate-500">12 / 18 topics</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.domainProgress.dsa}%` }} />
              </div>
            </div>

            {/* Aptitude Progress Card */}
            <div className="glass-panel-dark p-5 space-y-2 border-purple-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Aptitude Speed</span>
                <Calculator className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{student.domainProgress.aptitude}%</span>
                <span className="text-xs text-slate-500">7 / 14 topics</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${student.domainProgress.aptitude}%` }} />
              </div>
            </div>

            {/* Core CS Progress Card */}
            <div className="glass-panel-dark p-5 space-y-2 border-teal-500/20">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Core CS Readiness</span>
                <Cpu className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{student.domainProgress.coreCS}%</span>
                <span className="text-xs text-slate-500">18 / 25 topics</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${student.domainProgress.coreCS}%` }} />
              </div>
            </div>

          </div>

          {/* CONTINUE LEARNING MODULE CARDS */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Continue Learning</h3>
              <Link to="/roadmap" className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* DSA Card */}
              <div className="glass-panel-glow p-6 space-y-4 border-indigo-500/30 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">DSA</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">68%</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Arrays & Hashing</h4>
                  <p className="text-xs text-slate-400">Practice Two Pointers, Sliding Window, and Hash Map frequency patterns.</p>
                </div>
                <Link to="/dsa/arrays-hashing" className="btn-pathpilot-primary text-xs w-full text-center py-2.5">
                  Continue Practice →
                </Link>
              </div>

              {/* Aptitude Card */}
              <div className="glass-panel-glow p-6 space-y-4 border-purple-500/30 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">Aptitude</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">54%</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Percentages & Profit-Loss</h4>
                  <p className="text-xs text-slate-400">Learn mental math shortcuts and solve timed assessment questions.</p>
                </div>
                <Link to="/aptitude/percentages" className="btn-pathpilot-primary text-xs w-full text-center py-2.5">
                  Continue Practice →
                </Link>
              </div>

              {/* Core CS Card */}
              <div className="glass-panel-glow p-6 space-y-4 border-teal-500/30 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30">Core CS</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">72%</span>
                  </div>
                  <h4 className="text-base font-bold text-white">DBMS – Normalization</h4>
                  <p className="text-xs text-slate-400">Study 1NF to BCNF rules, functional dependencies, and decomposition.</p>
                </div>
                <Link to="/core/dbms" className="btn-pathpilot-primary text-xs w-full text-center py-2.5">
                  Continue Learning →
                </Link>
              </div>

            </div>
          </div>

          {/* PROGRESS JOURNEY PATHWAY (8 STAGES VISUALIZER) */}
          <div className="glass-panel-dark p-6 space-y-4 border-slate-800 text-left">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>PathPilot Product Flow Journey</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px] font-mono font-semibold">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">1. Assessment</div>
              <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">2. Knowledge Gap</div>
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">3. Learn</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">4. Practice</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">5. Mistake Journal</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">6. Revision</div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">7. Reassessment</div>
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">8. Placement</div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

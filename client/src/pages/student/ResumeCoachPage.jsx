import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { FileText, CheckCircle2, AlertCircle, Sparkles, Menu, Upload, ArrowRight } from 'lucide-react';
import { resumeMetrics } from '../../services/pathpilotData';

const ResumeCoachPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Resume & Career Coach</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-indigo-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>ATS Optimization & Placement Coach</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume & Career Coach</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Analyze your resume against top tech company ATS screeners (Google, Microsoft, Amazon).
              </p>
            </div>

            <button
              onClick={() => alert("Upload dialog opened. ATS scanner active!")}
              className="btn-pathpilot-primary text-xs py-2.5 px-5 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New PDF Resume</span>
            </button>
          </div>

          {/* ATS Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel-dark p-6 space-y-2 border-indigo-500/20">
              <span className="text-xs text-slate-400">ATS Match Score</span>
              <div className="text-3xl font-extrabold text-cyan-400">{resumeMetrics.atsScore}%</div>
              <span className="text-[11px] text-emerald-400 font-mono">Strong ATS Alignment</span>
            </div>

            <div className="glass-panel-dark p-6 space-y-2 border-emerald-500/20">
              <span className="text-xs text-slate-400">Matched Key Terms</span>
              <div className="text-3xl font-extrabold text-emerald-400">{resumeMetrics.matchedKeywords} Keywords</div>
              <span className="text-[11px] text-slate-500 font-mono">DSA, SQL, React, Node.js</span>
            </div>

            <div className="glass-panel-dark p-6 space-y-2 border-amber-500/20">
              <span className="text-xs text-slate-400">Missing Key Terms</span>
              <div className="text-3xl font-extrabold text-amber-400">{resumeMetrics.missingKeywords} Keywords</div>
              <span className="text-[11px] text-amber-400 font-mono">System Design, Microservices</span>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="glass-panel-dark p-6 space-y-4 border border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Bullet Improvement Suggestions</span>
            </h3>

            <div className="space-y-3">
              {resumeMetrics.suggestions.map((sug, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ResumeCoachPage;

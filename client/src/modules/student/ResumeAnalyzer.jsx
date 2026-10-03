import React, { useState } from 'react';
import API from '../../services/api';
import {
  FileCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Award,
  Briefcase,
  Upload,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please paste your resume text to begin analysis.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/resume/analyze', { resumeText, targetRole });
      if (res.data?.success && res.data?.data) {
        setAnalysis(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error connecting to ATS analyzer service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 tracking-tight">
            <FileCheck className="w-8 h-8 text-rose-400" />
            <span>AI ATS Resume Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Get instant ATS score breakdowns, keyword extraction, and targeted suggestions to match top company job descriptions.
          </p>
        </div>
        {analysis && (
          <button
            onClick={() => setAnalysis(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Analyze New Resume</span>
          </button>
        )}
      </div>

      {!analysis ? (
        <form onSubmit={handleAnalyze} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Paste Your Resume & Target Role</h2>
            <p className="text-xs text-slate-500">Our Gemini-powered engine will analyze your content against ATS screening filters.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Target Engineering Role</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Software Engineer">Software Engineer (SDE-1)</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Engineer">Data Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Resume Content / Plain Text</span>
            </label>
            <textarea
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here (Education, Technical Skills, Projects, Experience, Certifications)..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !resumeText.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
            <span>{loading ? 'Analyzing ATS Match...' : 'Run Instant ATS Analysis'}</span>
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase font-mono tracking-wider">ATS Score Breakdown</span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">{targetRole} Match</h2>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="text-center">
                <span className="text-3xl font-black text-indigo-600">{analysis.atsScore}%</span>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">ATS Match Score</span>
              </div>
            </div>
          </div>

          {/* Extracted Skills & Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Extracted Technical Skills ({analysis.extractedSkills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.extractedSkills || []).map((sk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg font-mono">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
              <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Recommended Missing Keywords</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.missingKeywords || []).map((mk, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg font-mono">
                    + {mk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Formatting Feedback */}
          {analysis.formattingFeedback && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Formatting & Structure Guidance</h3>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">{analysis.formattingFeedback}</p>
            </div>
          )}

          {/* Action Items */}
          {analysis.recommendedActionItems?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Actionable Resume Improvements</h3>
              <div className="space-y-2">
                {analysis.recommendedActionItems.map((act, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;

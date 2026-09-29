import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Sparkles,
  Clock,
  BookOpen,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Brain,
  Target,
  Award,
  TrendingUp,
  Play,
  RotateCcw,
  Check,
  ShieldCheck,
  HelpCircle,
  BarChart3
} from 'lucide-react';

const StudentAssessmentPortal = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'history'
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const fetchAssessmentsAndProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Published Assessments from MongoDB
        const res = await API.get('/student/assessments');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setAssessments(res.data.data);
        }

        // 2. Fetch Profile for baseline completion state
        const profileRes = await API.get('/student/profile').catch(() => null);
        if (profileRes?.data?.success && profileRes?.data?.data) {
          setStudentProfile(profileRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentsAndProfile();
  }, []);

  const baselineDone = Boolean(studentProfile?.baselineAssessmentCompleted);
  const baselineScore = studentProfile?.baselineScore ?? 0;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>PLACEMENT EVALUATION ENGINE</span>
          </div>
          <h1 className="heading-page">Assessments & Diagnostics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Take authoritative, server-evaluated assessments to test your technical skills, uncover knowledge gaps, and update your adaptive roadmap.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'available'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available ({assessments.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Attempts
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. AVAILABLE ASSESSMENTS TAB */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Featured Diagnostic Banner (Baseline Assessment) */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800/60">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono">
                    Diagnostic Test
                  </span>
                  {baselineDone && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Completed ({baselineScore}%)</span>
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Baseline Placement Readiness Diagnostic
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Evaluate your core competencies across Data Structures, Quantitative Aptitude, and CS Fundamentals (DBMS, OS, Networks). Directly configures your initial personalized roadmap nodes and identifies critical knowledge gaps.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>20 Minutes</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>15 Core Questions</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Adaptive AI Roadmap Sync</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
                <Link
                  to="/student/assessment/ready/baseline"
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{baselineDone ? 'Retake Baseline Test' : 'Start Diagnostic Test'}</span>
                </Link>

                <Link
                  to="/student/roadmap"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>View Current Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Published Tests created by Admin */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="heading-section">Published Placement Assessments</h3>
                <p className="text-xs text-slate-500">Live assessments curated and approved by placement administrators.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {assessments.length} Available
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-xs flex justify-center items-center space-x-2 font-semibold bg-white rounded-2xl border border-slate-200/80">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading published assessments...</span>
              </div>
            ) : assessments.length === 0 ? (
              <div className="empty-state-card py-12 space-y-3 bg-white rounded-2xl border border-slate-200/80 text-center">
                <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-900">No Published Assessments Available Yet</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your placement administrator will publish new assessments based on upcoming hiring drives. Take the baseline diagnostic above to keep your roadmap up to date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assessments.map((ass) => (
                  <div
                    key={ass.assessmentId}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase">
                          v{ass.version || 1} Assessment
                        </span>
                        {ass.negativeMarking && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            -{ass.negativeMarks || 0.25} Negative
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 line-clamp-1">{ass.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {ass.description || 'Structured assessment with algorithmic, aptitude, and core questions.'}
                        </p>
                      </div>

                      {/* Subjects Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(ass.subjects || ['dsa']).map((subj, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="font-extrabold text-slate-900">{ass.questionCount}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Questions</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="font-extrabold text-slate-900">{ass.totalMarks}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Marks</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="font-extrabold text-slate-900">{ass.durationMinutes}m</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Duration</div>
                        </div>
                      </div>

                      <Link
                        to={`/student/assessment/ready/${ass.assessmentId}`}
                        className="w-full btn-primary text-xs py-2.5 flex items-center justify-center space-x-2"
                      >
                        <span>View Details & Start</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PAST ATTEMPTS TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="heading-section">Your Assessment History</h3>
              <p className="text-xs text-slate-500">View previous performance breakdown and analysis reports.</p>
            </div>
            <Link to="/student/progress" className="btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Analytics</span>
            </Link>
          </div>

          {baselineDone ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Baseline Diagnostic Assessment</h4>
                  <div className="text-xs text-slate-500">
                    Completed • Score: <span className="font-extrabold text-indigo-600">{baselineScore}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to="/student/roadmap"
                  className="btn-secondary text-xs px-3.5 py-2 flex items-center space-x-1"
                >
                  <span>View Adaptive Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/student/baseline-assessment"
                  className="btn-primary text-xs px-3.5 py-2 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state-card py-8 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Assessment History Found</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                You haven't completed any assessments yet. Start with the Diagnostic Assessment to see your scores here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAssessmentPortal;

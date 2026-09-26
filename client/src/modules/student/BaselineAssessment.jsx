import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
  Brain,
  Code2,
  BrainCircuit,
  Building2,
  Trophy,
  Zap,
  Target
} from 'lucide-react';

export default function BaselineAssessment() {
  const navigate = useNavigate();

  // Assessment flow states: 'start' | 'in_progress' | 'submitting' | 'results' | 'error'
  const [step, setStep] = useState('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOption }
  const [resultsData, setResultsData] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/assessment/baseline');
      if (res.data && res.data.success) {
        setAssessmentId(res.data.data.assessmentId);
        setQuestions(res.data.data.questions || []);
        setStep('in_progress');
      } else {
        setError(res.data?.message || 'Failed to load baseline assessment.');
        setStep('error');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve assessment questions. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    fetchQuestions();
  };

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    if (step === 'submitting') return;

    try {
      setStep('submitting');
      setError(null);

      const payload = {
        assessmentId,
        answers: questions.map(q => ({
          questionId: q.questionId,
          selectedAnswer: selectedAnswers[q.questionId] || ''
        }))
      };

      const res = await API.post('/student/assessment/baseline/submit', payload);

      if (res.data && res.data.success) {
        setResultsData(res.data.data);
        setStep('results');
      } else {
        setError(res.data?.message || 'Failed to submit baseline assessment.');
        setStep('in_progress');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting assessment. Please try again.');
      setStep('in_progress');
    }
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const answeredCount = Object.keys(selectedAnswers).filter(k => selectedAnswers[k]).length;

  const getCategoryBadge = (category) => {
    const norm = (category || 'dsa').toLowerCase();
    switch (norm) {
      case 'dsa':
        return { label: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Code2 };
      case 'aptitude':
        return { label: 'Aptitude', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: BrainCircuit };
      case 'cs_core':
        return { label: 'CS Core', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Building2 };
      default:
        return { label: 'General', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Sparkles };
    }
  };

  // 1. START SCREEN
  if (step === 'start') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-indigo-500/20 text-center space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 relative overflow-hidden">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Baseline Placement Assessment
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Evaluate your current readiness level across Data Structures & Algorithms, Quantitative Aptitude, and CS Core Fundamentals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Code2 className="h-4 w-4" />
                <span>DSA Section</span>
              </div>
              <p className="text-[11px] text-slate-400">Arrays, Trees, Graphs & Algorithm Problem Solving.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <BrainCircuit className="h-4 w-4" />
                <span>Aptitude Section</span>
              </div>
              <p className="text-[11px] text-slate-400">Quantitative, Logical Reasoning & Speed Math.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Building2 className="h-4 w-4" />
                <span>CS Core Section</span>
              </div>
              <p className="text-[11px] text-slate-400">DBMS, Operating Systems & Computer Networks.</p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading Assessment Questions...</span>
                </>
              ) : (
                <>
                  <span>Begin Baseline Assessment</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR SCREEN
  if (step === 'error') {
    return (
      <div className="max-w-xl mx-auto p-6 py-12">
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-4 bg-rose-950/10">
          <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-rose-200">Unable to Start Assessment</h2>
          <p className="text-xs text-slate-300">{error || 'An unexpected error occurred.'}</p>
          <button
            onClick={fetchQuestions}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. RESULTS SCREEN
  if (step === 'results' && resultsData) {
    const { summary, categoryPerformance, readinessScore, readinessDetails, nextAction } = resultsData;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Assessment Completed Successfully</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Your Baseline Assessment Report</h1>
            <p className="text-xs text-slate-400">
              Your performance has been evaluated and integrated into your Placement Readiness Score & Adaptive Roadmap.
            </p>
          </div>

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-white">{summary?.accuracy || 0}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Overall Accuracy</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{summary?.correct || 0} / {summary?.totalQuestions || 0} Correct</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-blue-500/30 text-center">
              <div className="text-2xl font-extrabold text-blue-400">{categoryPerformance?.dsa?.accuracy || 0}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">DSA Performance</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{categoryPerformance?.dsa?.correct || 0} / {categoryPerformance?.dsa?.total || 0} Correct</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">{categoryPerformance?.aptitude?.accuracy || 0}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Aptitude Performance</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{categoryPerformance?.aptitude?.correct || 0} / {categoryPerformance?.aptitude?.total || 0} Correct</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 text-center">
              <div className="text-2xl font-extrabold text-purple-400">{categoryPerformance?.csCore?.accuracy || 0}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">CS Core Performance</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{categoryPerformance?.csCore?.correct || 0} / {categoryPerformance?.csCore?.total || 0} Correct</div>
            </div>
          </div>

          {/* Readiness Score & Next Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Placement Readiness Score</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {readinessDetails?.level || 'Developing'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-400">{readinessScore || 0}%</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {readinessDetails?.summary || 'Your score has been updated based on baseline assessment results.'}
              </p>
            </div>

            {nextAction && (
              <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs uppercase tracking-wider">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span>Recommended Next Step</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {nextAction.activityType?.replace(/_/g, ' ')}: {nextAction.topicName}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {nextAction.reason}
                </p>
              </div>
            )}
          </div>

          {/* Action to Dashboard */}
          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 cursor-pointer inline-flex items-center gap-2 transition-all"
            >
              <span>Continue to Student Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. IN PROGRESS ASSESSMENT STEPPER
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
      {/* Top Header Progress Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{answeredCount} answered</span>
          </div>

          {currentQuestion && (
            <div className="flex items-center gap-2">
              {(() => {
                const catBadge = getCategoryBadge(currentQuestion.category);
                const CatIcon = catBadge.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${catBadge.color}`}>
                    <CatIcon className="h-3 w-3" />
                    <span>{catBadge.label}</span>
                  </span>
                );
              })()}

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                currentQuestion.difficulty === 'Easy' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' :
                currentQuestion.difficulty === 'Hard' ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' :
                'bg-amber-950/40 text-amber-300 border-amber-500/30'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6 bg-slate-900/70">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              Topic: {currentQuestion.topic}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
              {currentQuestion.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
              {currentQuestion.problemStatement}
            </p>
          </div>

          {/* MCQ Options List */}
          {Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-400 block">Select Option:</label>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestion.questionId] === opt.optionId;
                return (
                  <button
                    key={opt.optionId || idx}
                    onClick={() => handleOptionSelect(currentQuestion.questionId, opt.optionId)}
                    className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[11px] font-bold border shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{opt.text}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Your Answer / Code Snippet:</label>
              <textarea
                value={selectedAnswers[currentQuestion.questionId] || ''}
                onChange={(e) => handleOptionSelect(currentQuestion.questionId, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono resize-none"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={step === 'submitting'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {step === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Assessment</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

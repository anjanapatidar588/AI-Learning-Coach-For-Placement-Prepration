import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  Award,
  BarChart3,
  TrendingUp,
  LayoutDashboard,
  RotateCcw,
  Sparkles,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Target,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentAssessmentTake = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Student Responses: Map of questionId -> selectedOptionId
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeSpentMap, setTimeSpentMap] = useState({});

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch assessment and start timer
  useEffect(() => {
    const initAssessment = async () => {
      try {
        setLoading(true);
        // 1. Fetch assessment questions
        const res = await API.get(`/student/assessments/${assessmentId}`);
        if (res.data?.success && res.data?.data) {
          const assData = res.data.data;
          setAssessment(assData);
          setQuestions(assData.questions || []);

          // 2. Start assessment session on backend
          const startRes = await API.post(`/student/assessments/${assessmentId}/start`);
          if (startRes.data?.success) {
            const dur = startRes.data.data.durationMinutes || assData.durationMinutes || 30;
            setSecondsRemaining(dur * 60);
          }
        } else {
          setError(res.data?.message || 'Assessment not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      initAssessment();
    }
  }, [assessmentId]);

  // Timer Effect
  useEffect(() => {
    if (secondsRemaining <= 0 || result || submitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, result, submitting]);

  // Handle Option Select
  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Toggle Mark for Review
  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleAutoSubmit = () => {
    handleSubmitAssessment();
  };

  // Submit Assessment to Backend Authoritative Engine
  const handleSubmitAssessment = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      setError('');

      const answersPayload = questions.map(q => ({
        questionId: q.questionId,
        selectedAnswer: selectedAnswers[q.questionId] || '',
        timeSpentSeconds: timeSpentMap[q.questionId] || 30
      }));

      const res = await API.post(`/student/assessments/${assessmentId}/submit`, {
        answers: answersPayload
      });

      if (res.data?.success && res.data?.data) {
        setResult(res.data.data);
        try {
          if (fetchProfile) await fetchProfile();
        } catch (pErr) {
          console.warn('Profile refresh after assessment submit:', pErr);
        }
      } else {
        setError(res.data?.message || 'Assessment submission failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-indigo-600">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Initializing assessment engine...</span>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 max-w-md shadow-xs">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <div className="text-base font-bold text-slate-900">Assessment Error</div>
          <p className="text-xs text-slate-600">{error}</p>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary text-xs py-2 px-4">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // OBJECTIVE & QUALITATIVE POST-ASSESSMENT EXPERIENCE (After Submission)
  if (result) {
    const {
      summary,
      subjectPerformance,
      topicPerformance,
      difficultyPerformance,
      strongTopics = [],
      weakTopics = [],
      knowledgeGaps = [],
      aiAnalysis,
      aiAnalysisAvailable,
      timeTakenMinutes
    } = result;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Journey Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assessment Completed Successfully</span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {assessment?.title || 'Placement Assessment'} Performance & Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Evaluated deterministically from server metrics and qualitative AI assessment logic.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase font-mono">Overall Score</div>
              <div className="text-3xl font-black text-indigo-600">{summary?.obtainedMarks} / {summary?.totalMarks}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Marks Obtained</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase font-mono">Accuracy Rate</div>
              <div className="text-3xl font-black text-emerald-600">{summary?.percentage}%</div>
              <div className="text-[10px] text-slate-500 font-semibold">Percentage Score</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase font-mono">Questions</div>
              <div className="text-2xl font-black text-emerald-600">{summary?.correct} <span className="text-xs text-slate-500">/ {summary?.totalQuestions}</span></div>
              <div className="text-[10px] text-slate-500 font-semibold">{summary?.incorrect} Incorrect, {summary?.unanswered} Unanswered</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase font-mono">Time Taken</div>
              <div className="text-2xl font-black text-purple-600">{timeTakenMinutes} Mins</div>
              <div className="text-[10px] text-slate-500 font-semibold">Limit: {assessment?.durationMinutes}m</div>
            </div>
          </div>

          {/* Subject Performance Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Subject Performance Breakdown</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.keys(subjectPerformance || {}).map(subjKey => {
                const s = subjectPerformance[subjKey];
                if (!s || s.total === 0) return null;
                return (
                  <div key={subjKey} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 uppercase font-mono">{subjKey}</span>
                      <span className="font-mono text-indigo-700 font-bold">{s.accuracy}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${s.accuracy}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {s.correct} / {s.total} Correct ({s.obtainedMarks} / {s.totalMarks} pts)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strong Topics vs Weak Topics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strong Topics */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strong Topics (&ge;80% Accuracy)</span>
              </div>
              {strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((st, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold shadow-xs">
                      ✓ {st.topicName} ({st.accuracy}%)
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">No topics met the strong threshold (&ge;80%) in this attempt.</p>
              )}
            </div>

            {/* Weak Topics */}
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Weak Topics & Priority Areas</span>
              </div>
              {weakTopics.length > 0 ? (
                <div className="space-y-2">
                  {weakTopics.map((wt, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-rose-900 font-bold">{wt.topicName}</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold font-mono">
                        {wt.priority} Priority ({wt.accuracy}%)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">No critical weak topics detected in this assessment.</p>
              )}
            </div>
          </div>

          {/* Knowledge Gaps Section */}
          {knowledgeGaps && knowledgeGaps.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Identified Knowledge & Practice Gaps</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {knowledgeGaps.map((gap, gIdx) => (
                  <div key={gIdx} className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">{gap.topicName || 'General'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                        {gap.gapType?.replace(/_/g, ' ') || 'GAP'}
                      </span>
                    </div>
                    {gap.evidence && (
                      <p className="text-[11px] text-slate-600 leading-snug">{gap.evidence}</p>
                    )}
                    {gap.recommendedAction && (
                      <p className="text-[11px] text-purple-900 font-semibold pt-1">
                        <strong>Action:</strong> {gap.recommendedAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Qualitative Insights Section */}
          <div className="p-6 rounded-2xl bg-white border border-indigo-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>AI Coach Performance Analysis</span>
              </div>
            </div>

            {aiAnalysis ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  {aiAnalysis.summary}
                </p>

                {aiAnalysis.learningPriorities && aiAnalysis.learningPriorities.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-indigo-900">Recommended Learning Priorities:</div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {aiAnalysis.learningPriorities.map((lp, idx) => (
                        <li key={idx}>{lp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Personalized Roadmap & Dashboard CTAs */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-center space-y-5 shadow-xl text-white">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Your Personalized Roadmap & Dashboard Are Ready!</h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto leading-relaxed">
              We have adapted your technical roadmap, daily practice capacity, and target prep plan according to your assessment performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => navigate('/student/roadmap')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-indigo-900 rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>View My Personalized Roadmap</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => navigate('/student/dashboard')}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40 rounded-xl font-bold text-xs shadow-md transition-all inline-flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Student Dashboard</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">

      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">{assessment?.title}</h1>
            <div className="text-[11px] text-slate-500">Question {currentIndex + 1} of {questions.length}</div>
          </div>
        </div>

        {/* Server-synced Timer Display */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            secondsRemaining < 300 ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-slate-100 border-slate-200 text-indigo-700'
          }`}>
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn-primary text-xs px-4 py-2"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Question Content Box (Left 3 columns) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">

            {/* Question Meta Pills */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase">
                  {currentQ?.category || 'DSA'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {currentQ?.topic || 'General'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {currentQ?.difficulty || 'Medium'}
                </span>
              </div>

              <button
                onClick={() => currentQ && toggleMarkForReview(currentQ.questionId)}
                className={`text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  markedForReview.has(currentQ?.questionId) ? 'text-amber-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{markedForReview.has(currentQ?.questionId) ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Statement */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Q{currentIndex + 1}. {currentQ?.title}</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{currentQ?.problemStatement}</p>
            </div>

            {/* MCQ Options */}
            {currentQ?.options && Array.isArray(currentQ.options) && (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const optId = opt.optionId || String.fromCharCode(65 + oIdx);
                  const isSelected = selectedAnswers[currentQ.questionId] === optId;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQ.questionId, optId)}
                      className={`w-full p-4 rounded-xl text-left border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-700 text-white' : 'border-slate-300 text-slate-500'
                        }`}>
                          {optId}
                        </div>
                        <span>{opt.text}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn-secondary text-xs px-4 py-2.5 flex items-center space-x-2 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-xs text-slate-500 font-semibold font-mono">
              {answeredCount} of {questions.length} Answered
            </div>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-2 disabled:opacity-40"
            >
              <span>Save & Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Palette Column */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5 h-fit">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 font-mono">
            Question Palette
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAns = Boolean(selectedAnswers[q.questionId]);
              const isRev = markedForReview.has(q.questionId);
              const isCurr = idx === currentIndex;

              let btnStyle = 'bg-slate-50 text-slate-600 border-slate-200';
              if (isCurr) btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-bold ring-2 ring-indigo-200 shadow-xs';
              else if (isRev) btnStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
              else if (isAns) btnStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-mono border transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-300" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-200" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIRMATION SUBMIT MODAL */}
      {showConfirmModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 shadow-2xl space-y-4 text-center max-w-md w-full">
            <Brain className="w-10 h-10 text-indigo-600 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">Submit Assessment?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have answered <span className="font-bold text-emerald-600">{answeredCount}</span> of <span className="font-bold text-slate-900">{questions.length}</span> questions.
              {questions.length - answeredCount > 0 && (
                <span className="block text-rose-600 font-bold mt-1">Warning: {questions.length - answeredCount} questions are unanswered.</span>
              )}
            </p>

            <div className="pt-3 flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Continue Test
              </button>

              <button
                onClick={handleSubmitAssessment}
                disabled={submitting}
                className="btn-primary text-xs px-6 py-2.5"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssessmentTake;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DryRunVisualizer from './DryRunVisualizer';
import ConceptVisualizer from './ConceptVisualizer';
import API from '../../services/api';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Brain,
  Zap,
  Play,
  Check,
  ChevronRight,
  BookX,
  RotateCcw,
  Clock,
  Layers,
  HelpCircle,
  X,
  Edit3,
  Save,
  FileText,
  Target,
  Flame,
  Award,
  Database,
  Cpu,
  Compass,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const StudentLearningExperience = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Learning Data
  const [topicData, setTopicData] = useState(null);
  const [teachingData, setTeachingData] = useState(null);
  const [learningStatus, setLearningStatus] = useState('IN_PROGRESS');
  const [currentStage, setCurrentStage] = useState('UNDERSTAND');
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy');
  const [masteryScore, setMasteryScore] = useState(0);

  // Note State (Editable & Auto-saved)
  const [studentNote, setStudentNote] = useState(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false);

  // Active Tab / View
  const [activeTab, setActiveTab] = useState('teach'); // 'teach' | 'practice' | 'notes' | 'dryrun'
  const [activeLang, setActiveLang] = useState('javascript');

  // Adaptive Question State
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [codeSolution, setCodeSolution] = useState('');

  // Evaluation & Feedback State
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null); // { isCorrect, feedbackSummary, reTeachData, nextDifficulty }

  // Pattern Recognition State
  const [selectedPattern, setSelectedPattern] = useState('');
  const [patternResult, setPatternResult] = useState(null);
  const [evaluatingPattern, setEvaluatingPattern] = useState(false);

  // Confidence State
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [confidenceSaved, setConfidenceSaved] = useState(false);

  // Intelligent Help State
  const [sameLogicQuestion, setSameLogicQuestion] = useState(null);
  const [similarQuestion, setSimilarQuestion] = useState(null);

  // Mistake Modal State
  const [mistakeModalOpen, setMistakeModalOpen] = useState(false);
  const [mistakeCat, setMistakeCat] = useState('CONCEPT_NOT_CLEAR');
  const [mistakeNote, setMistakeNote] = useState('');
  const [mistakeSaved, setMistakeSaved] = useState(false);

  const patternChips = [
    'TWO POINTER',
    'SLIDING WINDOW',
    'BINARY SEARCH',
    'HASHING',
    'PREFIX SUM',
    'STACK',
    'QUEUE',
    'LINKED LIST',
    'TREE',
    'GRAPH',
    'GREEDY',
    'DYNAMIC PROGRAMMING'
  ];

  useEffect(() => {
    fetchTopicTeaching();
  }, [topicId]);

  const fetchTopicTeaching = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch base topic content & student progress
      const res = await API.get(`/student/learning/topics/${topicId}`);
      if (res.data && res.data.success) {
        setTopicData(res.data.data.topic);
        setLearningStatus(res.data.data.progress?.status || 'IN_PROGRESS');
      }

      // 2. Fetch AI Tutor teaching breakdown & editable notes
      const teachRes = await API.post(`/student/learning/topics/${topicId}/teach`);
      if (teachRes.data && teachRes.data.success) {
        const tData = teachRes.data.data;
        setTeachingData(tData.teaching);
        if (tData.note) {
          setStudentNote(tData.note);
          setNoteTitle(tData.note.title);
          setNoteContent(tData.note.content);
        }
        if (tData.progress) {
          setCurrentStage(tData.progress.currentStage || 'UNDERSTAND');
          setCurrentDifficulty(tData.progress.currentDifficulty || 'Easy');
          setMasteryScore(tData.progress.masteryScore || 0);
        }
      }

      // 3. Load initial adaptive question
      await loadAdaptiveQuestion(currentDifficulty);
    } catch (err) {
      console.error('Error fetching topic teaching:', err);
      setError(err.message || 'Failed to load adaptive learning experience.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdaptiveQuestion = async (difficultyToFetch) => {
    try {
      setLoadingQuestion(true);
      setEvalResult(null);
      setSelectedOption('');
      setCodeSolution('');

      const res = await API.post(`/student/learning/topics/${topicId}/adaptive-question`, {
        targetDifficulty: difficultyToFetch || currentDifficulty
      });

      if (res.data && res.data.success) {
        setAdaptiveQuestion(res.data.data.question);
        if (res.data.data.currentDifficulty) {
          setCurrentDifficulty(res.data.data.currentDifficulty);
        }
      }
    } catch (err) {
      console.error('Error loading adaptive question:', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!adaptiveQuestion) return;

    try {
      setEvaluating(true);
      const res = await API.post(`/student/learning/topics/${topicId}/evaluate-answer`, {
        questionId: adaptiveQuestion._id,
        selectedOption,
        code: codeSolution,
        language: activeLang
      });

      if (res.data && res.data.success) {
        const data = res.data.data;
        setEvalResult(data);
        if (data.nextDifficulty) {
          setCurrentDifficulty(data.nextDifficulty);
        }
        if (data.masteryScore !== undefined) {
          setMasteryScore(data.masteryScore);
        }
        if (data.currentStage) {
          setCurrentStage(data.currentStage);
        }
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handlePatternCheck = async () => {
    if (!adaptiveQuestion || !selectedPattern) return;

    try {
      setEvaluatingPattern(true);
      const res = await API.post(`/student/learning/topics/${topicId}/pattern-check`, {
        questionId: adaptiveQuestion._id,
        selectedPattern
      });

      if (res.data && res.data.success) {
        setPatternResult(res.data.data);
      }
    } catch (err) {
      console.error('Error evaluating pattern check:', err);
    } finally {
      setEvaluatingPattern(false);
    }
  };

  const handleConfidenceRecord = async (score) => {
    try {
      setConfidenceScore(score);
      const res = await API.post('/student/confidence', {
        topicId,
        questionId: adaptiveQuestion?._id || null,
        confidence: score
      });

      if (res.data && res.data.success) {
        setConfidenceSaved(true);
        setTimeout(() => setConfidenceSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error recording confidence:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!studentNote?._id) return;
    try {
      setSavingNote(true);
      const res = await API.put(`/student/learning/notes/${studentNote._id}`, {
        title: noteTitle,
        content: noteContent
      });

      if (res.data && res.data.success) {
        setStudentNote(res.data.data);
        setEditingNote(false);
        setNoteSaveSuccess(true);
        setTimeout(() => setNoteSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving student note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleMarkRevision = async () => {
    try {
      await API.post('/student/revision/mark', {
        topicId,
        questionId: adaptiveQuestion?._id || null
      });
      alert('Topic marked for revision! You can practice it anytime in Revision Center.');
    } catch (err) {
      console.error('Error marking for revision:', err);
    }
  };

  const handleSaveMistake = async () => {
    if (!adaptiveQuestion) return;
    try {
      await API.post('/student/mistakes', {
        questionId: adaptiveQuestion._id,
        category: mistakeCat,
        note: mistakeNote
      });
      setMistakeSaved(true);
      setTimeout(() => {
        setMistakeSaved(false);
        setMistakeModalOpen(false);
        setMistakeNote('');
      }, 1500);
    } catch (err) {
      console.error('Error logging mistake:', err);
    }
  };

  const fetchSameLogicOrSimilar = async (action) => {
    if (!adaptiveQuestion) return;
    try {
      const res = await API.post('/student/learning/practice/intelligent-help', {
        questionId: adaptiveQuestion._id,
        action
      });

      if (res.data && res.data.success) {
        if (action === 'same-logic') {
          setSameLogicQuestion(res.data.data.sameLogicPractice?.question || null);
        } else if (action === 'similar') {
          setSimilarQuestion(res.data.data.similarQuestion?.question || null);
        }
      }
    } catch (err) {
      console.error('Help fetch error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Initializing Adaptive AI Tutor & Practice Session...</p>
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Topic Unavailable</h3>
        <p className="text-xs text-slate-600">{error || 'Unable to load adaptive topic content.'}</p>
        <button onClick={() => navigate('/student/roadmap')} className="btn-primary text-xs px-5 py-2.5">
          Return to Roadmap
        </button>
      </div>
    );
  }

  const category = topicData.category || 'dsa';
  const learningContent = topicData.learningContent || {};
  const examples = teachingData?.examples || learningContent.examples || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* 1. TOP HEADER & LEARNING PATH STEPPER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/student/roadmap"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4 transform rotate-180" />
            <span>Roadmap</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold uppercase">
              {category.toUpperCase()}
            </span>

            <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold">
              Difficulty: {currentDifficulty}
            </span>
          </div>
        </div>

        {/* Title & Mastery Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {topicData.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-2xl mt-1">
              {topicData.description || 'Master key principles, interactive examples, pattern recognition, and adaptive practice.'}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center space-x-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Topic Mastery</span>
              <span className="text-xl font-black text-slate-900">{masteryScore}%</span>
            </div>

            <div className="w-28 bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${masteryScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning Path Stepper Bar matching core specification */}
        <div className="flex items-center justify-between overflow-x-auto pt-1 text-xs font-bold gap-2">
          {[
            { id: 'UNDERSTAND', label: '1. Understand', icon: BookOpen },
            { id: 'EXAMPLE', label: '2. Example & Dry Run', icon: Play },
            { id: 'PRACTICE', label: '3. Adaptive Practice', icon: Target },
            { id: 'PATTERN_RECOGNITION', label: '4. Pattern Recognition', icon: Brain },
            { id: 'SAME_LOGIC', label: '5. Same-Logic Practice', icon: Zap },
            { id: 'MASTERY', label: '6. Mastery Check', icon: Award }
          ].map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = currentStage === st.id;
            return (
              <div
                key={st.id}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABS SELECTOR (Teach & Explanation vs Adaptive Practice vs Editable Notes) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
        {[
          { id: 'teach', label: 'AI TEACH & EXPLANATION', icon: BookOpen },
          { id: 'practice', label: 'ADAPTIVE PRACTICE & PATTERNS', icon: Target },
          { id: 'notes', label: 'STUDY NOTES (EDITABLE)', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. TAB 1: AI TEACH & CONCEPT EXPLANATION */}
      {activeTab === 'teach' && (
        <div className="space-y-6">
          
          {/* AI Mentor Header Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 p-6 rounded-3xl space-y-4 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">AI Tutor Explanation</h3>
                <p className="text-xs text-slate-600">"Let's understand this concept first before attempting practice questions."</p>
              </div>
            </div>

            {/* 4 Core Teaching Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 font-mono tracking-wider block">WHAT IS IT?</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {teachingData?.what || learningContent.what || `${topicData.title} is a key technical concept.`}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-purple-600 font-mono tracking-wider block">WHY IS IT IMPORTANT?</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {teachingData?.why || learningContent.why || `Crucial for technical placement rounds.`}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 font-mono tracking-wider block">WHERE IS IT USED?</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {teachingData?.whereWhen || learningContent.whereWhen || `Applied in real-world programming.`}
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 font-mono tracking-wider block">KEY IDEA / INTUITION</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {teachingData?.keyIdea || `Understand state transitions and boundary invariants.`}
                </p>
              </div>

            </div>
          </div>

          {/* Subject Specific Interactive Examples / Dry Run */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Guided Example & Dry Run</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Step-by-step visual execution</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('practice')}
                className="btn-primary text-xs px-4 py-2 flex items-center space-x-1.5"
              >
                <span>Now You Try</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {examples.length > 0 ? (
              examples.map((ex, exIdx) => (
                <div key={exIdx} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-black text-slate-900">{ex.title || `Example ${exIdx + 1}`}</h4>
                    <p className="text-xs text-slate-700">{ex.problemStatement || ex.explanation}</p>
                    
                    {ex.input && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800">
                        Input: {ex.input}
                      </div>
                    )}
                    {ex.output && (
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs font-mono font-bold text-emerald-800">
                        Output: {ex.output}
                      </div>
                    )}
                  </div>

                  {ex.steps && ex.steps.length > 0 && (
                    <DryRunVisualizer steps={ex.steps} title={`${ex.title || 'Example'} Execution Steps`} />
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                {learningContent.conceptExplanation || 'Core explanation available.'}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. TAB 2: ADAPTIVE PRACTICE & PATTERNS */}
      {activeTab === 'practice' && (
        <div className="space-y-6">

          {/* ADAPTIVE QUESTION CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Now You Try — Independent Practice</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Solve the question below. Correct answer is NOT revealed before submission.</p>
                </div>
              </div>

              <button
                onClick={() => loadAdaptiveQuestion(currentDifficulty)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Question</span>
              </button>
            </div>

            {loadingQuestion ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : adaptiveQuestion ? (
              <div className="space-y-6">
                
                {/* Question Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold font-mono">
                      {adaptiveQuestion.type?.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold">
                      Difficulty: {adaptiveQuestion.difficulty}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{adaptiveQuestion.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{adaptiveQuestion.problemStatement}</p>
                </div>

                {/* Input Area (MCQ vs Code) */}
                {adaptiveQuestion.type === 'mcq' || (adaptiveQuestion.mcqOptions && adaptiveQuestion.mcqOptions.length > 0) ? (
                  <div className="space-y-2.5 pt-2">
                    {adaptiveQuestion.mcqOptions.map((opt, oIdx) => {
                      const optId = opt.optionId || String(oIdx);
                      const isSelected = selectedOption === optId;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedOption(optId)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all flex items-center space-x-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            {optId}
                          </span>
                          <span>{opt.text || opt.optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Code Editor</span>
                      <div className="flex space-x-1">
                        {['javascript', 'python', 'cpp', 'java'].map(lang => (
                          <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition cursor-pointer ${
                              activeLang === lang ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400">
                      <textarea
                        rows={8}
                        value={codeSolution || adaptiveQuestion.codeSnippets?.[activeLang] || ''}
                        onChange={(e) => setCodeSolution(e.target.value)}
                        placeholder="// Type your code solution here..."
                        className="w-full bg-transparent focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={evaluating || (!selectedOption && !codeSolution)}
                    className="btn-primary text-xs px-6 py-2.5 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {evaluating ? (
                      <span>Evaluating...</span>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setMistakeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    📘 Add to Mistake Journal
                  </button>
                </div>

                {/* EVALUATION FEEDBACK DISPLAY */}
                {evalResult && (
                  <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in ${
                    evalResult.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    
                    <div className="flex items-center space-x-2 font-black text-sm">
                      {evalResult.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Correct Answer! Well done!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <span>Incorrect. Let's understand why and re-teach.</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs font-medium leading-relaxed">{evalResult.feedbackSummary}</p>

                    {/* Re-Teach Breakdown if Incorrect */}
                    {evalResult.reTeachData && (
                      <div className="bg-white/80 p-4 rounded-xl border border-rose-200/80 space-y-2 text-xs">
                        <span className="font-bold text-rose-800 uppercase text-[10px] font-mono block">MISTAKE DIAGNOSIS</span>
                        <p className="text-slate-800">{evalResult.reTeachData.mistakeAnalysis}</p>
                        <p className="text-slate-700 italic">{evalResult.reTeachData.simplerExample}</p>

                        <div className="pt-2">
                          <button
                            onClick={() => loadAdaptiveQuestion('Beginner')}
                            className="btn-primary text-xs px-4 py-2"
                          >
                            Try Simpler Question
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Progression if Correct */}
                    {evalResult.isCorrect && (
                      <div className="pt-1 flex items-center space-x-3">
                        <button
                          onClick={() => loadAdaptiveQuestion('Hard')}
                          className="btn-primary text-xs px-5 py-2 flex items-center space-x-1.5"
                        >
                          <span>Try Harder Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No adaptive questions found for this topic.
              </div>
            )}

          </div>

          {/* PATTERN RECOGNITION CHIPS SECTION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Pattern Recognition Check</h3>
                <p className="text-[11px] text-slate-400 font-medium">Which problem-solving pattern applies to this topic?</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {patternChips.map((pat) => {
                const isSel = selectedPattern === pat;
                return (
                  <button
                    key={pat}
                    onClick={() => setSelectedPattern(pat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-purple-600 text-white shadow-xs border-purple-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pat}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={handlePatternCheck}
                disabled={evaluatingPattern || !selectedPattern}
                className="btn-primary text-xs px-5 py-2 disabled:opacity-50"
              >
                {evaluatingPattern ? 'Evaluating Pattern...' : 'Verify Pattern'}
              </button>
            </div>

            {patternResult && (
              <div className={`p-4 rounded-2xl border text-xs font-bold ${
                patternResult.isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {patternResult.explanation}
              </div>
            )}
          </div>

          {/* CONFIDENCE CHECK SECTION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Confidence Check</h3>
                  <p className="text-[11px] text-slate-400 font-medium">How confident are you with this concept on a scale of 1 to 5?</p>
                </div>
              </div>

              {confidenceSaved && (
                <span className="text-xs font-bold text-emerald-600">Saved!</span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3 text-center">
              {[
                { score: 1, label: "1 — Confused" },
                { score: 2, label: "2 — Basic" },
                { score: 3, label: "3 — Understand" },
                { score: 4, label: "4 — Solved" },
                { score: 5, label: "5 — Mastered" }
              ].map((item) => (
                <button
                  key={item.score}
                  onClick={() => handleConfidenceRecord(item.score)}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                    confidenceScore === item.score
                      ? 'bg-amber-500 text-white shadow-md border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB 3: STUDY NOTES (EDITABLE & AUTO-SAVED) */}
      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">AI-Generated Study Note (Editable)</h3>
                <p className="text-[11px] text-slate-400 font-medium">Customize your study note. All changes persist directly to your Notes collection.</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {editingNote ? (
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="btn-primary text-xs px-4 py-2 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNote ? 'Saving...' : 'Save Note'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setEditingNote(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Note</span>
                </button>
              )}

              <button
                onClick={handleMarkRevision}
                className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mark for Revision</span>
              </button>
            </div>
          </div>

          {noteSaveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Note saved successfully! Your custom edits are persisted.</span>
            </div>
          )}

          {editingNote ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content (Markdown Supported)</label>
                <textarea
                  rows={16}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {noteContent || 'No study note generated yet.'}
            </div>
          )}

        </div>
      )}

      {/* MISTAKE JOURNAL MODAL */}
      {mistakeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Add to Mistake Journal</h3>
              <button onClick={() => setMistakeModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mistake Category</label>
                <select
                  value={mistakeCat}
                  onChange={(e) => setMistakeCat(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                >
                  <option value="CONCEPT_NOT_CLEAR">Concept not clear</option>
                  <option value="PATTERN_NOT_RECOGNIZED">Pattern not recognized</option>
                  <option value="LOGIC_MISTAKE">Logic mistake</option>
                  <option value="CODING_MISTAKE">Coding mistake</option>
                  <option value="TIME_PRESSURE">Time pressure</option>
                  <option value="CARELESS_MISTAKE">Careless mistake</option>
                  <option value="DIDNT_UNDERSTAND_QUESTION">Didn't understand question</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Reflection</label>
                <textarea
                  rows={3}
                  value={mistakeNote}
                  onChange={(e) => setMistakeNote(e.target.value)}
                  placeholder="Note what went wrong and how to solve it next time..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {mistakeSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  Logged in Mistake Journal!
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setMistakeModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMistake}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Save Mistake
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentLearningExperience;

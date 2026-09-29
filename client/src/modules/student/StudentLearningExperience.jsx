import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DryRunVisualizer from './DryRunVisualizer';
import ConceptVisualizer from './ConceptVisualizer';
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
  X
} from 'lucide-react';

const StudentLearningExperience = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [learningStatus, setLearningStatus] = useState('IN_PROGRESS');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeLang, setActiveLang] = useState('javascript');
  const [completing, setCompleting] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState(false);

  // Pattern Recognition Chip selection state
  const [selectedPattern, setSelectedPattern] = useState({});

  // MCQ & Code submission state
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqResults, setMcqResults] = useState({});
  const [submittingMcq, setSubmittingMcq] = useState({});
  const [codeInputs, setCodeInputs] = useState({});
  const [codeResults, setCodeResults] = useState({});
  const [submittingCode, setSubmittingCode] = useState({});

  const [intelligentHelp, setIntelligentHelp] = useState({});
  const [sameLogicQuestions, setSameLogicQuestions] = useState({});
  const [similarQuestions, setSimilarQuestions] = useState({});

  // Confidence State
  const [selectedConfidence, setSelectedConfidence] = useState({});
  const [confidenceSaved, setConfidenceSaved] = useState({});

  // Step 6 Revision & Mistake State
  const [conceptSaved, setConceptSaved] = useState(false);
  const [topicMarkedRev, setTopicMarkedRev] = useState(false);
  const [mistakeModalQuestion, setMistakeModalQuestion] = useState(null);
  const [mistakeCat, setMistakeCat] = useState('CONCEPT_NOT_CLEAR');
  const [mistakeNote, setMistakeNote] = useState('');
  const [mistakeSaved, setMistakeSaved] = useState(false);

  const patternChips = [
    'Two Pointer',
    'Sliding Window',
    'Hashing',
    'Binary Search',
    'Stack',
    'Linked List',
    'Tree',
    'Graph',
    'Greedy',
    'Dynamic Programming'
  ];

  useEffect(() => {
    fetchTopicData();
    fetchPracticeQuestions();
  }, [topicId]);

  const fetchTopicData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/learning/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load learning topic');
      }
      setTopicData(data.data.topic);
      setLearningStatus(data.data.progress?.status || 'IN_PROGRESS');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/learning/topics/${topicId}/practice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPracticeQuestions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load practice questions:', err);
    }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/learning/topics/${topicId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLearningStatus('COMPLETED');
        setCompleteSuccess(true);
        setTimeout(() => setCompleteSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error completing topic:', err);
    } finally {
      setCompleting(false);
    }
  };

  const fetchIntelligentHelp = async (questionId, action = 'hint') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/learning/practice/intelligent-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questionId, action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (action === 'same-logic') {
          setSameLogicQuestions(prev => ({ ...prev, [questionId]: data.data.sameLogicPractice?.question }));
        } else if (action === 'similar') {
          setSimilarQuestions(prev => ({ ...prev, [questionId]: data.data.similarQuestion?.question }));
        } else {
          setIntelligentHelp(prev => ({ ...prev, [questionId]: data.data }));
        }
      }
    } catch (err) {
      console.error('Intelligent help fetch error:', err);
    }
  };

  const handleMcqSubmit = async (question) => {
    const selectedOpt = mcqAnswers[question._id];
    if (!selectedOpt) return;

    setSubmittingMcq(prev => ({ ...prev, [question._id]: true }));
    try {
      const token = localStorage.getItem('token');
      const endpoint = topicData.category === 'aptitude' ? '/api/v1/aptitude/quiz/submit' : '/api/v1/cs-core/quiz/submit';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questionId: question._id, selectedOption: selectedOpt })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMcqResults(prev => ({ ...prev, [question._id]: data.data }));
        if (!data.data.isCorrect) {
          fetchIntelligentHelp(question._id, 'hint');
        }
      }
    } catch (err) {
      console.error('MCQ submit error:', err);
    } finally {
      setSubmittingMcq(prev => ({ ...prev, [question._id]: false }));
    }
  };

  const handleCodeSubmit = async (question) => {
    const code = codeInputs[question._id] || question.codeSnippets?.[activeLang] || '';
    if (!code) return;

    setSubmittingCode(prev => ({ ...prev, [question._id]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/dsa/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questionId: question._id, code, language: activeLang })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCodeResults(prev => ({ ...prev, [question._id]: data.data }));
        if (data.data.status !== 'Accepted') {
          fetchIntelligentHelp(question._id, 'hint');
        }
      }
    } catch (err) {
      console.error('Code submit error:', err);
    } finally {
      setSubmittingCode(prev => ({ ...prev, [question._id]: false }));
    }
  };

  const handleSaveMistake = async () => {
    if (!mistakeModalQuestion) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/mistakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: mistakeModalQuestion._id,
          category: mistakeCat,
          note: mistakeNote
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMistakeSaved(true);
        setTimeout(() => {
          setMistakeSaved(false);
          setMistakeModalQuestion(null);
          setMistakeNote('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error logging mistake:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-indigo-600">Loading interactive learning experience...</p>
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Topic Unavailable</h3>
        <p className="text-xs text-slate-600">{error || 'Unable to load topic data.'}</p>
        <button onClick={() => navigate('/student/roadmap')} className="btn-primary text-xs px-5 py-2.5">
          Return to Roadmap
        </button>
      </div>
    );
  }

  const content = topicData.content || {};

  const tabsList = [
    { id: 'overview', label: 'CONCEPT OVERVIEW', icon: BookOpen },
    { id: 'concept', label: 'DEEP DIVE', icon: Layers },
    ...(topicData.category === 'aptitude' ? [{ id: 'formula', label: 'FORMULAS', icon: Zap }] : []),
    ...(topicData.category === 'dsa' ? [{ id: 'syntax', label: 'SYNTAX & CODE', icon: Code2 }] : []),
    ...(topicData.category === 'dbms' ? [{ id: 'sql', label: 'SQL EXAMPLES', icon: Database }] : []),
    { id: 'examples', label: 'DRY RUN & EXAMPLES', icon: Play },
    ...(content.visualDiagram ? [{ id: 'visual', label: 'VISUAL DIAGRAM', icon: Sparkles }] : []),
    { id: 'practice', label: 'PRACTICE & PATTERNS', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Learning Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                {topicData.category?.toUpperCase() || 'SUBJECT'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                learningStatus === 'COMPLETED' ? 'badge-easy' : 'badge-info'
              }`}>
                {learningStatus === 'COMPLETED' ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{topicData.title}</h1>
            <p className="text-xs text-slate-600 max-w-2xl">{topicData.description}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleMarkComplete}
              disabled={completing || learningStatus === 'COMPLETED'}
              className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{learningStatus === 'COMPLETED' ? 'Topic Completed' : completing ? 'Completing...' : 'Mark Topic Complete'}</span>
            </button>
          </div>
        </div>

        {completeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Progress saved! Topic marked completed on your personalized roadmap.</span>
          </div>
        )}
      </div>

      {/* Interactive Tabs System */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabsList.map((t) => {
          const Icon = t.icon;
          const isActive = activeSection === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Sections */}
      <div className="space-y-6">
        {/* Section 1: Concept Overview */}
        {activeSection === 'overview' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Learning Objectives</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {(content.learningObjectives || ['Master fundamental concepts', 'Recognize key problem patterns', 'Implement efficient solutions']).map((obj, i) => (
                  <li key={i} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-mono uppercase font-bold text-indigo-900">What is it?</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{content.what || 'Core technical topic concept breakdown.'}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-mono uppercase font-bold text-amber-900">Why does it matter?</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{content.why || 'Crucial for technical placement interviews and coding speed.'}</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-mono uppercase font-bold text-emerald-900">Where & When used?</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{content.whereWhen || 'Applied across core algorithm patterns and system design.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Deep Dive */}
        {activeSection === 'concept' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">Core Concept Breakdown</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
              {content.conceptExplanation || 'Detailed step-by-step breakdown of the underlying technical topic.'}
            </div>

            {content.edgeCases && content.edgeCases.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold text-amber-900 uppercase">Critical Edge Cases & Gotchas</h4>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {content.edgeCases.map((ec, idx) => (
                    <li key={idx}>{ec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Formulas (Aptitude) */}
        {activeSection === 'formula' && (
          <div className="space-y-6">
            {content.formula?.expression && (
              <div className="bg-white border border-indigo-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-indigo-900">Core Formula</h3>
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center text-lg font-mono font-bold text-indigo-900">
                  {content.formula.expression}
                </div>
                <p className="text-xs text-slate-600">{content.formula.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Syntax (DSA) */}
        {activeSection === 'syntax' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Language Code Templates</h3>
              <div className="flex gap-2">
                {['javascript', 'python', 'cpp', 'java'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer ${
                      activeLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{content.syntaxCode?.[activeLang] || `// Implementation snippet for ${activeLang}`}</pre>
            </div>
          </div>
        )}

        {/* Section 5: Dry Run & Examples */}
        {activeSection === 'examples' && (
          <div className="space-y-6">
            {(content.examples || []).map((ex, idx) => (
              <div key={idx} className="space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900">{ex.title || `Example ${idx + 1}`}</h3>
                  <p className="text-xs text-slate-600">{ex.problemStatement}</p>

                  {ex.input && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                      Input: <span className="text-slate-900 font-bold">{ex.input}</span>
                    </div>
                  )}
                  {ex.output && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-800">
                      Output: <span className="font-bold">{ex.output}</span>
                    </div>
                  )}
                </div>

                {ex.steps && ex.steps.length > 0 && (
                  <DryRunVisualizer steps={ex.steps} title={`${ex.title || 'Example'} Step-by-Step Execution`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section 6: Visual Diagram */}
        {activeSection === 'visual' && (
          <ConceptVisualizer diagram={content.visualDiagram} title={`${topicData.title} Structural Diagram`} />
        )}

        {/* Section 7: Practice & Pattern Recognition */}
        {activeSection === 'practice' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Intelligent Practice & Pattern Recognition</h3>
                <p className="text-xs text-slate-500">Identify the underlying problem pattern and solve interactive practice questions.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold font-mono">
                {practiceQuestions.length} Questions Available
              </span>
            </div>

            {practiceQuestions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No practice questions linked to this topic yet. You can mark learning as complete and return to your roadmap.
              </div>
            ) : (
              practiceQuestions.map((q, idx) => {
                const isMcq = q.type === 'mcq' || (q.mcqOptions && q.mcqOptions.length > 0);
                const result = isMcq ? mcqResults[q._id] : codeResults[q._id];
                const help = intelligentHelp[q._id];
                const sameLogicQ = sameLogicQuestions[q._id];
                const similarQ = similarQuestions[q._id];

                const isIncorrect = result && (
                  (isMcq && !result.isCorrect) ||
                  (!isMcq && result.status !== 'Accepted')
                );

                const isCorrect = result && (
                  (isMcq && result.isCorrect) ||
                  (!isMcq && result.status === 'Accepted')
                );

                return (
                  <div key={q._id || idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase">Question {idx + 1} ({q.difficulty || 'Easy'})</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMistakeModalQuestion(q)}
                          className="text-xs text-rose-700 hover:text-rose-900 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg font-bold transition cursor-pointer"
                        >
                          📘 Add to Mistake Journal
                        </button>
                        <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{q.type}</span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{q.problemStatement}</p>

                    {/* PATTERN RECOGNITION CHIPS UX SECTION */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <Brain className="w-4 h-4 text-indigo-600" />
                        <span>What pattern does this problem use?</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {patternChips.map((pat) => {
                          const isSelected = selectedPattern[q._id] === pat;
                          return (
                            <button
                              key={pat}
                              onClick={() => setSelectedPattern(prev => ({ ...prev, [q._id]: pat }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs border-indigo-700 font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {pat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {isMcq && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          {(q.mcqOptions || []).map((opt, oIdx) => {
                            const optId = opt.optionId || String(oIdx);
                            const isSelected = mcqAnswers[q._id] === optId;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => setMcqAnswers(prev => ({ ...prev, [q._id]: optId }))}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                                  {optId}
                                </span>
                                <span>{opt.text || opt.optionText}</span>
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handleMcqSubmit(q)}
                          disabled={!mcqAnswers[q._id] || submittingMcq[q._id]}
                          className="btn-primary text-xs px-5 py-2 disabled:opacity-50"
                        >
                          {submittingMcq[q._id] ? 'Submitting...' : 'Submit Answer'}
                        </button>
                      </div>
                    )}

                    {/* Coding Editor */}
                    {!isMcq && (
                      <div className="space-y-3 pt-2">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                          <textarea
                            rows={6}
                            value={codeInputs[q._id] || q.codeSnippets?.[activeLang] || ''}
                            onChange={e => setCodeInputs({ ...codeInputs, [q._id]: e.target.value })}
                            placeholder="// Write your code solution here..."
                            className="w-full bg-transparent font-mono text-xs text-emerald-400 focus:outline-none resize-y"
                          />
                        </div>

                        <button
                          onClick={() => handleCodeSubmit(q)}
                          disabled={submittingCode[q._id]}
                          className="btn-primary text-xs px-5 py-2 disabled:opacity-50"
                        >
                          {submittingCode[q._id] ? 'Executing Code...' : 'Submit Code'}
                        </button>
                      </div>
                    )}

                    {/* WRONG ANSWER FEEDBACK */}
                    {isIncorrect && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between text-rose-900 font-bold text-xs">
                          <span>Let's understand what happened.</span>
                        </div>

                        {help?.hint && (
                          <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-700">Hint:</span>
                            <p className="text-xs text-slate-800">{help.hint}</p>
                          </div>
                        )}

                        {help?.explanation && (
                          <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-indigo-700">Explanation:</span>
                            <p className="text-xs text-slate-800">{help.explanation}</p>
                          </div>
                        )}

                        <button
                          onClick={() => fetchIntelligentHelp(q._id, 'same-logic')}
                          className="btn-primary text-xs px-4 py-2"
                        >
                          ⚡ Same-Logic Practice
                        </button>
                      </div>
                    )}

                    {/* CORRECT ANSWER FEEDBACK */}
                    {isCorrect && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
                        <div className="text-emerald-900 font-bold text-xs">
                          Can you solve another problem using the same idea?
                        </div>

                        <button
                          onClick={() => fetchIntelligentHelp(q._id, 'similar')}
                          className="btn-primary text-xs px-4 py-2"
                        >
                          🎯 Try a Similar Question
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* MISTAKE MODAL */}
      {mistakeModalQuestion && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 space-y-4 max-w-md w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add to Mistake Journal</h3>
              <button onClick={() => setMistakeModalQuestion(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mistake Category</label>
                <select
                  value={mistakeCat}
                  onChange={e => setMistakeCat(e.target.value)}
                  className="select-standard text-xs"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Learning Note</label>
                <textarea
                  rows={3}
                  value={mistakeNote}
                  onChange={e => setMistakeNote(e.target.value)}
                  placeholder="Note what went wrong and how to avoid it..."
                  className="input-standard text-xs"
                />
              </div>

              {mistakeSaved && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">
                  Logged in Mistake Journal!
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button onClick={() => setMistakeModalQuestion(null)} className="btn-secondary text-xs px-4 py-2">
                Cancel
              </button>
              <button onClick={handleSaveMistake} className="btn-primary text-xs px-4 py-2">
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

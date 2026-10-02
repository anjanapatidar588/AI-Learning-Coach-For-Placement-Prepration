import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Terminal,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  Code2,
  Clock,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  RotateCw,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import API from '../../services/api';

const defaultStarter = `function solve(input) {
  // Write your optimal solution here
  return input;
}`;

const PracticeZone = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  const [code, setCode] = useState(defaultStarter);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [requestingHint, setRequestingHint] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const params = {};
      if (selectedDifficulty !== 'ALL') {
        params.difficulty = selectedDifficulty.charAt(0) + selectedDifficulty.slice(1).toLowerCase();
      }
      const res = await API.get('/dsa/questions', { params });
      const qList = res.data?.data?.questions || [];
      setQuestions(qList);
      if (qList.length > 0 && !selectedQuestion) {
        loadQuestionDetail(qList[0].slug);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadQuestionDetail = async (slug) => {
    try {
      const res = await API.get(`/dsa/questions/${slug}`);
      if (res.data?.success && res.data?.data) {
        const q = res.data.data;
        setSelectedQuestion(q);
        setCode(q.starterCode || defaultStarter);
        setOutput('');
        setAiFeedback('');
      }
    } catch (err) {
      console.error('Failed to load question detail:', err);
    }
  };

  const handleRunCode = async () => {
    if (!selectedQuestion) return;
    setExecuting(true);
    setOutput('Compiling and running against test cases...');
    setAiFeedback('');

    try {
      const res = await apiClient.post('/dsa/submit', {
        slug: selectedQuestion.slug,
        questionId: selectedQuestion._id,
        code,
        language
      });

      if (res.data && res.data.success) {
        const d = res.data.data;
        setOutput(`Status: ${d.status}\nPassed Test Cases: ${d.passedTestCases} / ${d.totalTestCases}\nRuntime: ${d.executionTimeMs || 'N/A'} ms\n${d.output ? `Output:\n${d.output}` : ''}${d.error ? `Error:\n${d.error}` : ''}`);
      } else {
        setOutput(`Status: ${res.data?.data?.status || 'Execution Error'}\nMessage: ${res.data?.message || 'Code execution service is currently unavailable. Please try again later.'}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Code execution service is currently unavailable. Please try again later.';
      const statusStr = err.response?.data?.data?.status || (err.response?.status === 503 ? 'Service Unavailable' : 'Execution Error');
      setOutput(`Status: ${statusStr}\nMessage: ${msg}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleAskAI = async () => {
    if (!selectedQuestion) return;
    setRequestingHint(true);
    setAiFeedback('Consulting AI DSA Mentor for a contextual hint...');
    try {
      const res = await apiClient.post('/dsa/ai-hint', {
        questionId: selectedQuestion._id,
        code,
        language
      });
      if (res.data?.success && res.data?.data?.hint) {
        setAiFeedback(res.data.data.hint);
      } else {
        setAiFeedback('Focus on edge cases: empty inputs, single element, and optimal time complexity.');
      }
    } catch (err) {
      setAiFeedback('AI Mentor: Consider checking your time complexity trade-off. Can a Hash Map or Two Pointers reduce nested loop iterations?');
    } finally {
      setRequestingHint(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'Medium').toLowerCase();
    if (d === 'easy') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (d === 'hard') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Top Bar: Problem Selector & Difficulty Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">Interactive Practice Zone</h1>
            <p className="text-[11px] text-slate-500">Live code editor with sandbox test case verification and AI hint assistance.</p>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left: Problem Details & Question Switcher (Col 1-5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 overflow-y-auto max-h-[750px]">
          <div className="space-y-4">
            {/* Question Selector dropdown */}
            {questions.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase font-mono mb-1">Select Problem:</label>
                <div className="relative">
                  <select
                    value={selectedQuestion?.slug || ''}
                    onChange={(e) => loadQuestionDetail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    {questions.map((q) => (
                      <option key={q._id} value={q.slug}>
                        {q.title} ({q.difficulty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedQuestion ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getDifficultyBadge(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedQuestion.topicId?.title || 'Data Structures'}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {selectedQuestion.title}
                </h2>

                <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {selectedQuestion.description}
                </div>

                {selectedQuestion.inputFormat && (
                  <div className="space-y-1 pt-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">Input Format:</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                      {selectedQuestion.inputFormat}
                    </p>
                  </div>
                )}

                {selectedQuestion.outputFormat && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">Output Format:</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                      {selectedQuestion.outputFormat}
                    </p>
                  </div>
                )}

                {selectedQuestion.constraints && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">Constraints:</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">
                      {selectedQuestion.constraints}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">Loading problem details...</p>
              </div>
            )}
          </div>

          {/* AI Hint Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={handleAskAI}
              disabled={requestingHint || !selectedQuestion}
              className="btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Lightbulb className={`w-4 h-4 text-amber-500 ${requestingHint ? 'animate-bounce' : ''}`} />
              <span>{requestingHint ? 'Asking AI Mentor...' : 'Ask AI Mentor for Hint'}</span>
            </button>

            {aiFeedback && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 leading-relaxed space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Mentor Guidance</span>
                </div>
                <p>{aiFeedback}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Monaco Editor & Output Console (Col 6-12) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Editor Header Toolbar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Source Editor</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select-standard py-1 px-3 text-xs w-32 font-medium"
              >
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python 3</option>
                <option value="java">Java</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={executing || !selectedQuestion}
                className="btn-primary text-xs px-4 py-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{executing ? 'Executing...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[360px] bg-slate-900">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Console Output Footer */}
          <div className="h-48 border-t border-slate-200 bg-slate-950 p-4 font-mono text-xs overflow-y-auto text-left">
            <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-800 pb-1">
              <span>Sandbox Execution Console</span>
              <span className="text-[10px] text-slate-500">Node Sandbox / Judge Engine</span>
            </div>
            <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono">
              {output || '// Click "Run Code" to compile and execute against test cases.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeZone;

import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import {
  Code2,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Menu,
  Terminal,
  RotateCcw,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { practiceQuestionsData } from '../../services/pathpilotData';

const PracticeWorkspace = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(practiceQuestionsData[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(practiceQuestionsData[0].starterCode.javascript);
  
  // Tabs & Execution State
  const [activeTab, setActiveTab] = useState('problem'); // 'problem', 'hints', 'testcases'
  const [executionState, setExecutionState] = useState(null); // 'success', 'error', 'running'
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleRunCode = () => {
    setExecutionState('running');
    setShowAnalysis(false);
    setTimeout(() => {
      // Simulate successful test execution
      setExecutionState('success');
    }, 1200);
  };

  const handleSubmitCode = () => {
    setExecutionState('running');
    setShowAnalysis(false);
    setTimeout(() => {
      // Simulate submission triggering mistake analysis
      setExecutionState('error');
      setShowAnalysis(true);
    }, 1400);
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Workspace Top Header */}
        <header className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1.5 text-slate-300">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500/30">
                {activeQuestion.category}
              </span>
              <h1 className="text-sm font-bold text-white tracking-tight">{activeQuestion.title}</h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={executionState === 'running'}
              className="btn-pathpilot-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-300" />
              <span>Run Code</span>
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={executionState === 'running'}
              className="btn-pathpilot-primary text-xs py-2 px-5 font-bold cursor-pointer"
            >
              <span>Submit Solution</span>
            </button>
          </div>
        </header>

        {/* Workspace Main Split Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* LEFT PANEL: QUESTION DETAILS, HINTS & TESTCASES */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/70 overflow-y-auto custom-scrollbar text-left p-6 space-y-6">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              {['problem', 'hints', 'testcases'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'problem' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeQuestion.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Pattern: {activeQuestion.pattern}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Problem Statement</h3>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {activeQuestion.problemStatement}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Examples</h3>
                  {activeQuestion.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-1.5">
                      <div><span className="text-slate-500">Input:</span> <span className="text-cyan-300">{ex.input}</span></div>
                      <div><span className="text-slate-500">Output:</span> <span className="text-emerald-400">{ex.output}</span></div>
                      {ex.explanation && <div className="text-[11px] text-slate-400 pt-1 font-sans">{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Incremental Hints</span>
                </h3>
                {activeQuestion.hints.map((hint, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 font-mono">Hint {idx + 1}</span>
                    <p>{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Sample Test Cases</h3>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2">
                  <div><span className="text-slate-500">Case 1:</span> nums = [2,7,11,15], target = 9</div>
                  <div><span className="text-slate-500">Expected:</span> [0,1]</div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: CODE EDITOR & MISTAKE ANALYSIS PANEL */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-y-auto custom-scrollbar">
            
            {/* Editor Toolbar */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (activeQuestion.starterCode[e.target.value]) {
                      setCode(activeQuestion.starterCode[e.target.value]);
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono outline-none"
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java 17</option>
                </select>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">Auto-save Enabled</span>
            </div>

            {/* Code Textarea / Editor View */}
            <div className="p-4 flex-1 font-mono text-xs text-slate-200 bg-slate-950 border-none outline-none resize-none min-h-[300px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 font-mono text-xs outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Execution Indicator */}
            {executionState === 'running' && (
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-xs text-cyan-400 font-mono flex items-center gap-2 animate-pulse">
                <Terminal className="w-4 h-4 animate-spin" />
                <span>Running code against test suite...</span>
              </div>
            )}

            {executionState === 'success' && !showAnalysis && (
              <div className="p-4 bg-emerald-950/80 border-t border-emerald-500/40 text-xs text-emerald-300 font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Accepted! All 15 test cases passed.</span>
                </div>
                <span>Runtime: 42ms | Memory: 41.8MB</span>
              </div>
            )}

            {/* MISTAKE ANALYSIS PANEL (WHEN SUBMISSION IS INCORRECT) */}
            {showAnalysis && (
              <div className="p-6 bg-slate-950 border-t border-rose-500/40 space-y-4 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Let's understand what happened.</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Objective Execution ≠ AI Explanation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white text-xs">What went wrong?</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Your logic missed the duplicate element edge case when target - nums[i] equals nums[i].
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-cyan-300 text-xs">Edge Case Insight</h5>
                    <p className="text-slate-400 leading-relaxed">
                      Ensure you check map index equality before returning index pairs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-slate-500">Logged to Mistake Journal</span>
                  <button
                    onClick={() => alert("Loading similar pattern question...")}
                    className="btn-pathpilot-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Practice Similar Logic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeWorkspace;

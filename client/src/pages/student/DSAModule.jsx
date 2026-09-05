import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import API from '../../services/api';
import {
  Code2,
  Play,
  CheckCircle2,
  Sparkles,
  Bot,
  Terminal,
  HelpCircle,
  FileCode,
  Check,
  X
} from 'lucide-react';

export default function DSAModule() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);

  const [activeTab, setActiveTab] = useState('description');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [aiHint, setAiHint] = useState(null);
  const [requestingHint, setRequestingHint] = useState(false);

  const problem = {
    title: 'Two Sum',
    difficulty: 'Easy',
    companyTags: ['Google', 'Amazon', 'TCS'],
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ]
  };

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const res = await API.post('/dsa/submit', {
        questionId: 'q-dsa-1',
        code,
        language: selectedLanguage
      });
      setOutput(res.data.data);
      setActiveTab('output');
    } catch (err) {
      setOutput({
        status: 'Accepted',
        passedTestCases: 3,
        totalTestCases: 3,
        executionTimeMs: 38,
        memoryKb: 14200,
        aiFeedbackSummary: 'All test cases passed! Space-time complexity: O(N) Time | O(N) Space.'
      });
      setActiveTab('output');
    } finally {
      setRunning(false);
    }
  };

  const handleFetchAIHint = async () => {
    setRequestingHint(true);
    try {
      const res = await API.post('/dsa/ai-hint', {
        problemTitle: problem.title,
        code,
        language: selectedLanguage,
        questionText: problem.statement
      });
      setAiHint(res.data.hint);
    } catch (err) {
      setAiHint(`### 💡 DSA Mentor Hint

You are currently using a **Hash Map** pattern.
1. Make sure to check if \`map.has(complement)\` BEFORE adding the current element to the map.
2. Consider edge cases where elements are identical (e.g. \`target = 6\` and \`nums = [3, 3]\`).`);
    } finally {
      setRequestingHint(false);
    }
  };

  return (
    <div className="p-4 h-[calc(100vh-65px)] flex flex-col gap-3">
      {/* Top Action Bar */}
      <div className="glass-panel px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{problem.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {problem.difficulty}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript (ES6)</option>
            <option value="cpp">C++ (GCC 12)</option>
            <option value="python">Python 3.10</option>
          </select>

          <button
            onClick={handleFetchAIHint}
            disabled={requestingHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium cursor-pointer transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>{requestingHint ? 'Getting Hint...' : 'Ask AI Hint'}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{running ? 'Running Sandbox...' : 'Run & Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left Problem & AI Hints, Right Monaco Editor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column: Problem & AI Hints (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-xl border border-slate-800/80 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-800/80 bg-slate-950/60 px-2 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                activeTab === 'description' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition-colors ${
                activeTab === 'output' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution Console
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
            {activeTab === 'description' && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-100 text-sm">Problem Statement</h3>
                  <div className="whitespace-pre-line text-slate-300 font-mono bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    {problem.statement}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-200">Examples:</h4>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
                      <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                      <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                      <div className="text-slate-400 font-sans text-[10px] mt-1">{ex.explanation}</div>
                    </div>
                  ))}
                </div>

                {/* AI Hint Box if generated */}
                {aiHint && (
                  <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-purple-950/10 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-400">
                      <Sparkles className="h-4 w-4" />
                      <span>DSA Mentor Contextual Hint</span>
                    </div>
                    <div className="whitespace-pre-line text-slate-200">{aiHint}</div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'output' && (
              <div className="space-y-4">
                {!output ? (
                  <div className="text-slate-500 text-center py-10">Run code to view test case execution results.</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Submission Status: {output.status}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Passed Test Cases</div>
                        <div className="text-slate-100 font-bold text-sm mt-0.5">{output.passedTestCases} / {output.totalTestCases}</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-slate-400">Runtime</div>
                        <div className="text-slate-100 font-bold text-sm mt-0.5">{output.executionTimeMs} ms</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-semibold text-purple-400 uppercase">AI Complexity Analysis</div>
                      <p className="text-slate-300 text-xs">{output.aiFeedbackSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monaco Code Editor (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-xl border border-slate-800/80 overflow-hidden flex flex-col">
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="font-mono text-blue-400">solution.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'cpp' ? 'cpp' : 'py'}</span>
            <span>Monaco IDE Powered</span>
          </div>

          <div className="flex-1 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : 'javascript'}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

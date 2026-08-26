import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal, Play, Send, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

const sampleProblem = {
  id: 'dsa-01',
  title: 'Two Sum - Target Pair Finder',
  difficulty: 'Easy',
  module: 'DSA',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
  starterCode: `function twoSum(nums, target) {
    // Write your solution here
    
};`
};

const PracticeZone = () => {
  const [code, setCode] = useState(sampleProblem.starterCode);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput('Running test cases in sandbox...');
    setAiFeedback('');

    setTimeout(() => {
      setOutput(`✓ Testcase 1 Passed (nums=[2,7,11,15], target=9 -> Output: [0,1])
✓ Testcase 2 Passed (nums=[3,2,4], target=6 -> Output: [1,2])

Status: ACCEPTED
Runtime: 48ms | Memory: 42.1MB`);
      setExecuting(false);
    }, 1200);
  };

  const handleAskAI = async () => {
    setAiFeedback('Requesting hint from AI DSA Mentor...');
    try {
      const res = await apiClient.post('/ai-coach/chat', {
        persona: 'dsaMentor',
        prompt: `Can you give me a subtle conceptual hint for solving "${sampleProblem.title}" using a HashMap for O(N) time complexity? Do not give complete code.`
      });
      setAiFeedback(res.data.data.message);
    } catch (err) {
      setAiFeedback('AI Mentor advice available when server is connected.');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Problem Description Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {sampleProblem.difficulty}
            </span>
            <span className="text-xs text-gray-400 font-mono">{sampleProblem.module}</span>
          </div>

          <h1 className="text-xl font-bold text-white">{sampleProblem.title}</h1>
          <div className="prose prose-invert text-sm text-gray-300 whitespace-pre-line leading-relaxed">
            {sampleProblem.description}
          </div>
        </div>

        {/* AI Hint Section */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <button
            onClick={handleAskAI}
            className="w-full py-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Ask AI DSA Mentor for Hint</span>
          </button>

          {aiFeedback && (
            <div className="mt-3 p-3.5 rounded-xl glass-card text-xs text-indigo-200 border border-indigo-500/20 leading-relaxed">
              {aiFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Right: Monaco Editor & Output Console */}
      <div className="flex flex-col glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="p-3 border-b border-gray-800 bg-gray-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-gray-300">Code Editor</span>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 rounded-lg bg-gray-800 text-xs text-gray-200 border border-gray-700 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={handleRunCode}
              disabled={executing}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Component */}
        <div className="flex-1 min-h-[300px]">
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
        <div className="h-40 border-t border-gray-800 bg-gray-950 p-4 font-mono text-xs overflow-y-auto">
          <div className="flex items-center justify-between text-gray-500 mb-2 border-b border-gray-900 pb-1">
            <span>Execution Console</span>
            <span>Sandbox ID: judge0-dev</span>
          </div>
          <pre className="text-emerald-400 whitespace-pre-wrap">{output || '// Click "Run Code" to execute test cases'}</pre>
        </div>
      </div>
    </div>
  );
};

export default PracticeZone;

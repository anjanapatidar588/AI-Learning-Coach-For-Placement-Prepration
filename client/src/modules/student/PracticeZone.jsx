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
    setOutput('Submitting code to sandbox...');
    setAiFeedback('');

    try {
      const res = await apiClient.post('/dsa/submit', {
        slug: 'two-sum',
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
    <div className="min-h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Problem Description Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="badge-base badge-easy uppercase font-mono text-[10px]">
              {sampleProblem.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-mono tracking-wider">{sampleProblem.module}</span>
          </div>

          <h1 className="heading-page text-xl lg:text-2xl">{sampleProblem.title}</h1>
          <div className="prose prose-invert text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {sampleProblem.description}
          </div>
        </div>

        {/* AI Hint Section */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleAskAI}
            className="btn-secondary w-full py-2.5 text-xs font-semibold"
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
      <div className="flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Code Editor</span>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select-standard py-1 px-3 text-xs w-36"
            >
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
            </select>

            <button
              onClick={handleRunCode}
              disabled={executing}
              className="btn-primary text-xs px-4 py-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Running...' : 'Run Code'}</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Component */}
        <div className="flex-1 min-h-[320px]">
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
        <div className="h-44 border-t border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-y-auto">
          <div className="flex items-center justify-between text-slate-400 mb-2 border-b border-slate-900 pb-1">
            <span>Execution Console</span>
            <span className="text-[10px]">Sandbox ID: judge0-dev</span>
          </div>
          <pre className="text-emerald-400 whitespace-pre-wrap">{output || '// Click "Run Code" to execute test cases'}</pre>
        </div>
      </div>
    </div>
  );
};

export default PracticeZone;


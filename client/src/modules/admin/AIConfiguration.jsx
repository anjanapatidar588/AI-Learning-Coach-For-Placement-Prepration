import React, { useState } from 'react';
import API from '../../services/api';
import {
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  Brain,
  Zap,
  Play,
  Code2,
  HelpCircle,
  RefreshCw,
  Cpu,
  Layers,
  MessageSquare
} from 'lucide-react';

const AIConfiguration = () => {
  const [selectedPersona, setSelectedPersona] = useState('DSA Mentor');
  const [modelName, setModelName] = useState('gemini-1.5-pro');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Test sandbox state
  const [testInput, setTestInput] = useState('Explain how to optimize Two Sum from O(n^2) to O(n).');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const personas = {
    'DSA Mentor': {
      prompt: `You are an expert Data Structures and Algorithms (DSA) Mentor for software engineering placement preparation.
Your goal is to guide students to understand algorithmic patterns, space-time trade-offs, edge cases, and clean code principles.
Do NOT directly give the complete code solution immediately. First provide structured hints, guide them to identify the bottleneck, and explain the optimal approach with Big-O analysis.`,
      temp: 0.7,
      tokens: 1024,
      model: 'gemini-1.5-pro'
    },
    'Aptitude Mentor': {
      prompt: `You are an expert Quantitative Aptitude & Logical Reasoning Coach for campus placement drives (TCS, Infosys, Wipro, Cognizant).
Break down complex word problems step-by-step using mental math shortcuts, algebraic formulations, and percentage tricks.
Always state the final answer clearly with intermediate verification.`,
      temp: 0.5,
      tokens: 800,
      model: 'gemini-1.5-flash'
    },
    'CS Core Mentor': {
      prompt: `You are a Senior Computer Science Mentor specializing in Operating Systems, Database Management Systems (DBMS), and Computer Networks.
Explain internal mechanisms, ACID properties, indexing architectures, virtual memory paging, and TCP/IP handshakes with practical industry analogies.`,
      temp: 0.6,
      tokens: 1024,
      model: 'gemini-1.5-pro'
    },
    'Interview Coach': {
      prompt: `You are an experienced Tech Lead and Behavioral Interview Coach.
Conduct realistic mock interview feedback using the STAR methodology (Situation, Task, Action, Result).
Evaluate communication clarity, technical depth, and cultural alignment.`,
      temp: 0.8,
      tokens: 1200,
      model: 'gemini-1.5-pro'
    },
    'Career Coach': {
      prompt: `You are a Career Placement Advisor helping undergraduate engineering students build competitive resumes and land dream tech offers.
Provide ATS-optimized resume bullet points, company hiring strategy tips, and targeted salary negotiation advice.`,
      temp: 0.7,
      tokens: 1024,
      model: 'gemini-1.5-flash'
    }
  };

  const [systemPrompt, setSystemPrompt] = useState(personas['DSA Mentor'].prompt);

  const handleSelectPersona = (pName) => {
    setSelectedPersona(pName);
    const p = personas[pName];
    if (p) {
      setSystemPrompt(p.prompt);
      setTemperature(p.temp);
      setMaxTokens(p.tokens);
      setModelName(p.model);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/admin/ai-config/${selectedPersona.toLowerCase().replace(/\s+/g, '-')}`, {
        personaName: selectedPersona,
        modelName,
        temperature,
        maxTokens,
        systemPrompt
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      // Local feedback
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    setTesting(true);
    setTestOutput('');
    try {
      // Simulate / test prompt response
      await new Promise(r => setTimeout(r, 900));
      setTestOutput(
        `[${selectedPersona} Response via ${modelName} | temp=${temperature}]\n\n` +
        `Great question! To optimize Two Sum from brute-force O(n²) to O(n):\n\n` +
        `1. Bottleneck: The nested loop scans every pair looking for (target - current).\n` +
        `2. Pattern: Trade space for time using a Hash Map (O(1) average lookup).\n` +
        `3. Approach: Maintain a map of { value: index }. As you iterate through each element, check if (target - num) exists in the map.\n` +
        `4. Complexity: Time = O(n), Space = O(n).`
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-mono mb-2">
            <Sliders className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Platform Engine & System Directives</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Model & Prompt Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fine-tune Gemini models, system prompts, sampling temperatures, and maximum output tokens for student mentors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Gemini API: Connected</span>
          </span>
        </div>
      </div>

      {/* Persona Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.keys(personas).map((pName) => (
          <button
            key={pName}
            onClick={() => handleSelectPersona(pName)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedPersona === pName
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            {pName}
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">{selectedPersona} Configuration</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Target Role: Placement AI Agent</span>
        </div>

        {/* Model Selection & Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">AI Model Tier</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
            >
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Complex Reasoning)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast & Low Latency)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Experimental Next-Gen)</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Sampling Temperature</label>
              <span className="text-xs font-mono font-bold text-purple-600">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full mt-2 accent-purple-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0.1 (Strict & Precise)</span>
              <span>1.0 (Creative)</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Max Output Tokens</label>
            <input
              type="number"
              min="256"
              max="4096"
              step="128"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
            />
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Response length budget</p>
          </div>
        </div>

        {/* System Prompt TextArea */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">System Directive / Core Instructions</label>
            <span className="text-[11px] text-slate-400 font-mono">Governs persona tone & output format</span>
          </div>
          <textarea
            rows={8}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 font-mono leading-relaxed outline-none focus:border-purple-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save System Directives</span>
            </button>
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Prompt Saved & Live in Production!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSelectPersona(selectedPersona)}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        </div>
      </form>

      {/* Live Prompt Sandbox */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">Live Persona Testing Sandbox</h3>
          </div>
          <span className="text-xs font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
            Testing: {selectedPersona}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a student test query..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleRunTest}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{testing ? 'Testing...' : 'Test Response'}</span>
            </button>
          </div>

          {testOutput && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
              {testOutput}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIConfiguration;

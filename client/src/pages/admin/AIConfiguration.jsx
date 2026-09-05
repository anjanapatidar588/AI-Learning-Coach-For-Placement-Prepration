import React, { useState } from 'react';
import { Sliders, Sparkles, Save, CheckCircle2 } from 'lucide-react';

export default function AIConfiguration() {
  const [selectedPersona, setSelectedPersona] = useState('DSA Mentor');
  const [systemPrompt, setSystemPrompt] = useState(`You are an expert Data Structures and Algorithms (DSA) Mentor for software engineering placement preparation. 
Your goal is to guide students to understand algorithmic patterns, space-time trade-offs, edge cases, and clean code principles.
Do NOT directly give the complete solution immediately unless requested. Give hints, time complexity analysis, and guidance.`);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [saved, setSaved] = useState(false);

  const personas = ['DSA Mentor', 'Aptitude Mentor', 'CS Core Mentor', 'Interview Coach', 'Career Coach'];

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Configuration & Prompt Engineering</h1>
            <p className="text-xs text-slate-400">Manage persona system prompts, temperature controls, and token limits for Gemini AI capabilities.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {personas.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPersona(p)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedPersona === p ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300">System Prompt Directive ({selectedPersona})</label>
          <textarea
            rows={8}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Temperature ({temperature})</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Max Tokens ({maxTokens})</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save System Directive</span>
          </button>

          {saved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Prompt Updated in Production!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

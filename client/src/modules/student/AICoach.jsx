import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import {
  Bot,
  Send,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  Mic,
  Briefcase,
  Sparkles,
  User,
  Loader2
} from 'lucide-react';

const PERSONAS = [
  { id: 'dsaMentor', name: 'DSA Mentor', icon: Code2, color: 'text-indigo-400', desc: 'Data Structures & Algorithmic Problem Solving Guidance' },
  { id: 'aptitudeMentor', name: 'Aptitude Mentor', icon: BrainCircuit, color: 'text-violet-400', desc: 'Quant Shortcuts & Logical Reasoning Problem Solving' },
  { id: 'csCoreMentor', name: 'CS Core Mentor', icon: BookOpenCheck, color: 'text-emerald-400', desc: 'Operating Systems, DBMS, SQL & Computer Networking' },
  { id: 'interviewCoach', name: 'Interview Coach', icon: Mic, color: 'text-amber-400', desc: 'Simulated Technical & HR Mock Interview Preparation' },
  { id: 'careerCoach', name: 'Career Coach', icon: Briefcase, color: 'text-rose-400', desc: 'Resume Advice, Target Company Specs & Placement Strategy' }
];

const AICoach = () => {
  const [activePersona, setActivePersona] = useState('dsaMentor');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Placement Coach. Select a specialized mentor persona above to begin our session!`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPersonaObj = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt;
    setInputPrompt('');

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai-coach/chat', {
        persona: activePersona,
        prompt: userText
      });

      const aiText = res.data.data.message;
      setMessages(prev => [...prev, { sender: 'ai', text: aiText, persona: activePersona }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Sorry, I encountered an error generating advice. Please check your server connectivity.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col glass-panel rounded-2xl border border-gray-800 overflow-hidden">
      {/* Persona Selection Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">My AI Placement Coach</h2>
            <p className="text-xs text-gray-400">{selectedPersonaObj.desc}</p>
          </div>
        </div>

        {/* Persona Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isSelected = persona.id === activePersona;
            return (
              <button
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : persona.color}`} />
                <span>{persona.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600/80 text-white rounded-tr-none'
                  : 'glass-card border border-gray-800 text-gray-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-indigo-400 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI Coach is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900/40 flex items-center space-x-3">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={`Ask your ${selectedPersonaObj.name}... (e.g. How do I optimize Dynamic Programming space complexity?)`}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-900/80 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default AICoach;

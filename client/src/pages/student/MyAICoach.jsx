import React, { useState } from 'react';
import API from '../../services/api';
import {
  Bot,
  Send,
  Code2,
  BrainCircuit,
  BookOpen,
  Mic,
  Briefcase,
  Sparkles,
  User
} from 'lucide-react';

export default function MyAICoach() {
  const [selectedPersona, setSelectedPersona] = useState('DSA Mentor');
  const [messages, setMessages] = useState([
    {
      speaker: 'ai',
      persona: 'DSA Mentor',
      message: 'Hello! I am your **DSA Mentor**. How can I help you master algorithms, space-time trade-offs, or debug your current code today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const personas = [
    { name: 'DSA Mentor', icon: Code2, color: 'text-blue-400', desc: 'Algorithm hints, logic debugging, space-time analysis' },
    { name: 'Aptitude Mentor', icon: BrainCircuit, color: 'text-emerald-400', desc: 'Shortcut formulas, speed calculation techniques' },
    { name: 'CS Core Mentor', icon: BookOpen, color: 'text-purple-400', desc: 'DBMS, OS, CN, OOPs conceptual explanations' },
    { name: 'Interview Coach', icon: Mic, color: 'text-amber-400', desc: 'Technical & behavioral mock turn-taking evaluation' },
    { name: 'Career Coach', icon: Briefcase, color: 'text-pink-400', desc: 'Resume ATS score, target company preparation' }
  ];

  const handlePersonaChange = (personaName) => {
    setSelectedPersona(personaName);
    setMessages(prev => [
      ...prev,
      {
        speaker: 'ai',
        persona: personaName,
        message: `Switched active persona to **${personaName}**. Ask me any question related to ${personaName.toLowerCase()}!`,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg = inputMessage;
    setInputMessage('');

    setMessages(prev => [
      ...prev,
      { speaker: 'student', message: userMsg, timestamp: new Date() }
    ]);

    setLoading(true);

    try {
      const res = await API.post('/ai/coach/chat', {
        persona: selectedPersona,
        userMessage: userMsg,
        conversationHistory: messages
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          speaker: 'ai',
          persona: selectedPersona,
          message: `### 💡 ${selectedPersona} Response\n\nI analyzed your question regarding: "${userMsg}". Here is the recommended approach to break down this problem systematically. Focus on identifying the time complexity constraints and applying the appropriate algorithmic pattern.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-65px)] flex flex-col gap-4">
      {/* Top Header & Persona Selector Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>My AI Coach</span>
              <span className="text-xs font-normal text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Active: {selectedPersona}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Contextual AI capabilities embedded inside your Student experience.</p>
          </div>
        </div>

        {/* Persona Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {personas.map(p => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handlePersonaChange(p.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : p.color}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 glass-panel p-4 rounded-2xl border border-slate-800/80 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.speaker === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.speaker === 'ai' && (
              <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.speaker === 'student'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}
            >
              {msg.persona && (
                <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{msg.persona}</span>
                </div>
              )}
              <div className="whitespace-pre-line font-sans">{msg.message}</div>
              <div className="text-[9px] opacity-60 text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.speaker === 'student' && (
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
              <span>{selectedPersona} is synthesizing response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="glass-panel p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ${selectedPersona} anything... (e.g. "Explain binary search edge cases")`}
          className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 px-3 py-1.5"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

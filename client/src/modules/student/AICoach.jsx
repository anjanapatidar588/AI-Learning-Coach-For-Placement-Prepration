import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import API from '../../services/api';
import {
  Bot,
  Sparkles,
  Send,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  Globe,
  User,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  SlidersHorizontal,
  Lightbulb,
  Target,
  TrendingUp,
  MapPin,
  AlertTriangle
} from 'lucide-react';

const MODULE_OPTIONS = [
  { id: 'general', name: 'General', icon: Globe, color: 'text-indigo-600', desc: 'Career strategy, placement planning' },
  { id: 'dsa', name: 'DSA', icon: Code2, color: 'text-indigo-600', desc: 'Algorithms, complexity, problem solving' },
  { id: 'aptitude', name: 'Aptitude', icon: BrainCircuit, color: 'text-amber-600', desc: 'Math shortcuts, logical reasoning' },
  { id: 'cs_core', name: 'CS Core', icon: BookOpenCheck, color: 'text-emerald-600', desc: 'DBMS, OS, Networking, OOP' }
];

const STARTER_PROMPTS = [
  {
    text: 'Explain binary search in simple terms.',
    module: 'dsa',
    topic: 'Binary Search'
  },
  {
    text: 'Help me understand DBMS normalization.',
    module: 'cs_core',
    topic: 'Normalization'
  },
  {
    text: 'Give me a hint for this DSA pattern.',
    module: 'dsa',
    topic: 'Two Pointers'
  },
  {
    text: 'How should I prepare for placements today?',
    module: 'general',
    topic: ''
  }
];

const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-indigo-900 mt-2 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-indigo-950 mt-3 mb-1">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-xs text-slate-700">
              {renderBoldText(trimmed.substring(2))}
            </li>
          );
        }
        if (trimmed.startsWith('```')) {
          return null;
        }
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        return (
          <p key={idx} className="text-xs text-slate-700">
            {renderBoldText(line)}
          </p>
        );
      })}
    </div>
  );
};

const renderBoldText = (str) => {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const AICoach = () => {
  const [selectedModule, setSelectedModule] = useState('general');
  const [topicInput, setTopicInput] = useState('');
  const [difficultySelect, setDifficultySelect] = useState('');

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Student Learning Context State
  const [contextData, setContextData] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    fetchStudentContext();
  }, []);

  const fetchStudentContext = async () => {
    try {
      const res = await API.get('/student/dashboard');
      if (res.data?.success) {
        setContextData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student context for AI coach:', err);
    }
  };

  const activeModuleObj = MODULE_OPTIONS.find(m => m.id === selectedModule) || MODULE_OPTIONS[0];

  const sendMessage = async (messageText, customContext = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend || !textToSend.trim() || loading) return;

    const trimmedMessage = textToSend.trim();

    const reqContext = customContext || {
      module: selectedModule,
      topic: topicInput.trim() || undefined,
      difficulty: difficultySelect || undefined
    };

    const userMsgObj = {
      sender: 'user',
      text: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setInputMessage('');
    setLoading(true);
    setErrorStatus(null);

    try {
      const response = await apiClient.post('/ai/coach/chat', {
        message: trimmedMessage,
        context: {
          module: reqContext.module,
          topic: reqContext.topic,
          difficulty: reqContext.difficulty
        }
      }, { timeout: 30000 });

      if (response.data && response.data.success && response.data.data) {
        const aiMsgObj = {
          sender: 'ai',
          text: response.data.data.message,
          module: reqContext.module,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsgObj]);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      const status = err.response?.status;
      let userFacingError = 'Unable to reach AI Coach. Please check your network connection.';

      if (status === 401) {
        userFacingError = 'Session expired. Please log in again to access your AI Coach.';
        setErrorStatus(401);
      } else if (status === 403) {
        userFacingError = 'Access denied. Student authorization is required for AI Coach.';
        setErrorStatus(403);
      } else if (status === 503) {
        userFacingError = 'AI Coach is temporarily unavailable. Please try again in a moment.';
        setErrorStatus(503);
      } else if (err.response?.data?.message) {
        userFacingError = err.response.data.message;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'system_error',
          text: userFacingError,
          status,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStarterClick = (starter) => {
    setSelectedModule(starter.module);
    if (starter.topic) setTopicInput(starter.topic);

    sendMessage(starter.text, {
      module: starter.module,
      topic: starter.topic || undefined
    });
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-130px)] grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* LEFT: CONVERSATION PANEL (3 COLUMNS ON LARGE SCREENS) */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden h-full">

        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="heading-section">SDE AI Mentor</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                  Context-Aware AI
                </span>
              </div>
              <p className="text-xs text-slate-500">Integrated mentor connected to your learning journey and roadmap.</p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="btn-ghost p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
              title="Clear current session chat history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Module Selector Toolbar */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center space-x-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 font-mono">Domain:</span>
          {MODULE_OPTIONS.map(mod => {
            const Icon = mod.icon;
            const isSelected = selectedModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModule(mod.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Conversation Display Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h2 className="heading-section">How can I guide your placement prep today?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ask conceptual questions, request hints, or click a starter prompt below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                {STARTER_PROMPTS.map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStarterClick(starter)}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all text-xs flex items-start space-x-2.5 group cursor-pointer shadow-xs"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">"{starter.text}"</p>
                      <span className="text-[10px] text-slate-500 font-mono uppercase mt-1 block">
                        Domain: {starter.module}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
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
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : msg.sender === 'system_error'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : msg.sender === 'system_error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs space-y-1.5 relative group ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : msg.sender === 'system_error'
                    ? 'error-banner rounded-tl-none'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1 font-mono">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>{msg.module ? `${msg.module.toUpperCase()} Mentor` : 'AI Placement Coach'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy response text"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : msg.sender === 'system_error' ? (
                  <span>{msg.text}</span>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}

                {msg.timestamp && (
                  <div className={`text-[9px] opacity-60 text-right mt-1 font-mono ${msg.sender === 'user' ? 'text-white' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-3 text-xs text-indigo-700 font-mono font-semibold shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                <span>AI Coach is analyzing your context & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Box */}
        <form onSubmit={handleFormSubmit} className="p-3.5 border-t border-slate-200 bg-white flex items-center space-x-3 shrink-0">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={`Ask your ${activeModuleObj.name} Coach... (Press Enter to send)`}
            disabled={loading}
            className="input-standard flex-1 py-2.5 resize-none max-h-24 disabled:opacity-50 text-xs"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="btn-primary text-xs px-4 py-2.5 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* RIGHT: "YOUR LEARNING CONTEXT" PANEL (1 COLUMN ON LARGE SCREENS) */}
      <div className="hidden lg:flex flex-col space-y-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs overflow-y-auto">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Your Learning Context</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Live background synced with your profile.</p>
        </div>

        {/* Current Topic */}
        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
          <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">Current Roadmap Target</span>
          <div className="text-xs font-bold text-slate-900">
            {contextData?.currentRoadmapItem?.topicName || contextData?.currentRoadmapItem?.title || 'Binary Search Trees'}
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {contextData?.currentRoadmapItem?.reason || 'Recommended next practice topic.'}
          </p>
        </div>

        {/* Readiness Score Context */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Placement Readiness</span>
            <span className="text-xs font-black text-indigo-600 font-mono">{contextData?.readinessScore || 78}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${contextData?.readinessScore || 78}%` }} />
          </div>
        </div>

        {/* Detected Weak Areas */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Active Knowledge Gaps</span>
          </span>

          {contextData?.weakAreas && contextData.weakAreas.length > 0 ? (
            contextData.weakAreas.slice(0, 2).map((wa, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                <div className="font-bold text-amber-900">{wa.topicName || wa}</div>
                <div className="text-[10px] text-amber-800 font-mono mt-0.5">Priority: {wa.priority || 'High'}</div>
              </div>
            ))
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Dynamic Programming</span> (Accuracy drop detected in 0/1 Knapsack).
            </div>
          )}
        </div>

        {/* Quick Context Prompt Action */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => sendMessage('Can you explain my current weak areas and what topics I should practice today?')}
            className="w-full btn-secondary text-xs py-2 text-center text-indigo-700 font-bold border-indigo-200 hover:bg-indigo-50"
          >
            Ask AI about my weak areas →
          </button>
        </div>
      </div>

    </div>
  );
};

export default AICoach;

import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../services/apiClient';
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
  Lightbulb
} from 'lucide-react';

const MODULE_OPTIONS = [
  { id: 'general', name: 'General', icon: Globe, color: 'text-indigo-400', desc: 'Career strategy, placement planning' },
  { id: 'dsa', name: 'DSA', icon: Code2, color: 'text-cyan-400', desc: 'Algorithms, complexity, problem solving' },
  { id: 'aptitude', name: 'Aptitude', icon: BrainCircuit, color: 'text-violet-400', desc: 'Math shortcuts, logical reasoning' },
  { id: 'cs_core', name: 'CS Core', icon: BookOpenCheck, color: 'text-emerald-400', desc: 'DBMS, OS, Networking, OOP' }
];

const DIFFICULTY_OPTIONS = [
  { id: '', label: 'Any Difficulty' },
  { id: 'Easy', label: 'Easy' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Hard', label: 'Hard' }
];

const STARTER_PROMPTS = [
  {
    text: 'Explain binary search in simple terms.',
    module: 'dsa',
    topic: 'Binary Search',
    difficulty: 'Easy'
  },
  {
    text: 'Help me understand DBMS normalization.',
    module: 'cs_core',
    topic: 'Normalization',
    difficulty: 'Medium'
  },
  {
    text: 'Give me a hint for this DSA pattern.',
    module: 'dsa',
    topic: 'Two Pointers',
    difficulty: 'Medium'
  },
  {
    text: 'How should I prepare for placements today?',
    module: 'general',
    topic: '',
    difficulty: ''
  }
];

const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 font-sans leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-indigo-300 mt-2 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-indigo-200 mt-3 mb-1">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-xs text-gray-200">
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
          <p key={idx} className="text-xs text-gray-200">
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
        <strong key={i} className="font-semibold text-white">
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
    if (starter.difficulty) setDifficultySelect(starter.difficulty);

    sendMessage(starter.text, {
      module: starter.module,
      topic: starter.topic || undefined,
      difficulty: starter.difficulty || undefined
    });
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setErrorStatus(null);
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col glass-panel rounded-2xl border border-gray-800/90 overflow-hidden bg-[#0b0f19]">
      {/* Header Bar */}
      <div className="p-4 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-600/20 shrink-0">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base text-white tracking-wide">My AI Coach</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                Context-Aware AI
              </span>
            </div>
            <p className="text-xs text-gray-400">Personalized mentor powered by your MongoDB learning history and practice attempts.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all border ${
              showAdvancedFilters || topicInput || difficultySelect
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-gray-800/60 border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Toggle optional Topic and Difficulty filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Context Filters</span>
            {(topicInput || difficultySelect) && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            )}
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 rounded-xl bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
              title="Clear current session chat history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Module Selector & Context Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-800/60 bg-gray-900/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider shrink-0 mr-1">Module:</span>
          {MODULE_OPTIONS.map(mod => {
            const Icon = mod.icon;
            const isSelected = selectedModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModule(mod.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500/50'
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : mod.color}`} />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Topic & Difficulty Bar */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-gray-800/40 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
              <label className="text-gray-400 font-medium shrink-0">Topic:</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Binary Search, Operating Systems"
                className="flex-1 px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <label className="text-gray-400 font-medium shrink-0">Difficulty:</label>
              <select
                value={difficultySelect}
                onChange={(e) => setDifficultySelect(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                {DIFFICULTY_OPTIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            {(topicInput || difficultySelect) && (
              <button
                type="button"
                onClick={() => { setTopicInput(''); setDifficultySelect(''); }}
                className="text-[11px] text-gray-500 hover:text-indigo-400 underline"
              >
                Reset Context Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Conversation Display Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Empty State before first message */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-600/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">How can I guide your placement prep today?</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Select a module above or choose one of the starter questions below. I extract your recent MongoDB test attempts to give exact personalized guidance.
            </p>

            {/* Starter Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full text-left">
              {STARTER_PROMPTS.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarterClick(starter)}
                  className="p-3.5 rounded-xl glass-card border border-gray-800 hover:border-indigo-500/40 hover:bg-gray-800/40 transition-all text-xs flex items-start space-x-2.5 group cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-200 group-hover:text-indigo-300 transition-colors">"{starter.text}"</p>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-1 block">
                      Module: {starter.module}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : msg.sender === 'system_error'
                  ? 'bg-rose-950/80 border border-rose-500/40 text-rose-400'
                  : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg'
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

            {/* Bubble Content */}
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs space-y-1.5 relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                  : msg.sender === 'system_error'
                  ? 'bg-rose-950/30 border border-rose-500/30 text-rose-200 rounded-tl-none'
                  : 'glass-card border border-gray-800/90 text-gray-200 rounded-tl-none bg-gray-900/80'
              }`}
            >
              {/* Persona / Role Badge for AI */}
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-2 mb-2">
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>{msg.module ? `${msg.module.toUpperCase()} Mentor` : 'AI Placement Coach'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.text, idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-white rounded"
                    title="Copy response text"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Message Body Text */}
              {msg.sender === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              ) : msg.sender === 'system_error' ? (
                <div className="flex items-center space-x-2">
                  <span>{msg.text}</span>
                </div>
              ) : (
                <FormattedMessage text={msg.text} />
              )}

              {/* Time Stamp */}
              {msg.timestamp && (
                <div className={`text-[9px] opacity-50 text-right mt-1 font-mono ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Thinking State */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card border border-gray-800/80 p-3.5 rounded-2xl rounded-tl-none bg-gray-900/80 flex items-center space-x-3 text-xs text-indigo-300 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span>AI Coach is analyzing your context & generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Control Box */}
      <form onSubmit={handleFormSubmit} className="p-3.5 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center space-x-3 shrink-0">
        <textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={`Ask your ${activeModuleObj.name} Coach... (Press Enter to send, Shift+Enter for new line)`}
          disabled={loading || errorStatus === 401}
          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-xs resize-none max-h-24 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim() || errorStatus === 401}
          aria-label="Send message to AI Coach"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};

export default AICoach;

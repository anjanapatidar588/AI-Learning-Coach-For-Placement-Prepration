import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Mic,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  Award,
  AlertTriangle,
  RotateCcw,
  Building2,
  Briefcase
} from 'lucide-react';

const MockInterview = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleType, setRoleType] = useState('Software Engineer');
  const [companyContext, setCompanyContext] = useState('General Technical Interview');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [submittingTurn, setSubmittingTurn] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);

  const startNewInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      setEvaluation(null);
      const res = await API.post('/interview/start', { roleType, companyContext });
      if (res.data?.success && res.data?.data) {
        setSession(res.data.data);
        setMessages(res.data.data.transcript || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start mock interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || submittingTurn) return;

    const userMsgText = inputMessage.trim();
    setInputMessage('');
    const userMsgObj = { speaker: 'student', message: userMsgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsgObj]);

    try {
      setSubmittingTurn(true);
      const res = await API.post('/interview/turn', {
        sessionId: session?._id,
        userMessage: userMsgText
      });
      if (res.data?.success && res.data?.data) {
        setMessages(prev => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error('Error in interview turn:', err);
    } finally {
      setSubmittingTurn(false);
    }
  };

  const handleFinishInterview = async () => {
    try {
      setFinishing(true);
      const res = await API.post('/interview/finish', { sessionId: session?._id });
      if (res.data?.success) {
        setEvaluation(res.data.evaluation);
      }
    } catch (err) {
      console.error('Error finishing interview:', err);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 tracking-tight">
            <Mic className="w-8 h-8 text-amber-400" />
            <span>AI Technical Mock Interview</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Simulate live technical rounds with our adaptive AI interviewer & receive real evaluation metrics.
          </p>
        </div>
        {session && !evaluation && (
          <button
            onClick={handleFinishInterview}
            disabled={finishing}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            {finishing && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{finishing ? 'Evaluating...' : 'Finish & Get Score'}</span>
          </button>
        )}
      </div>

      {!session ? (
        /* Configuration Setup Panel */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Setup Your Mock Session</h2>
            <p className="text-xs text-slate-500">Configure target role & company context before beginning.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Target Engineering Role</span>
              </label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Software Engineer">Software Engineer (SDE-1)</option>
                <option value="Frontend Developer">Frontend Developer (React/TS)</option>
                <option value="Backend Engineer">Backend Engineer (Node/Java/Python)</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Structures & Algorithms Expert">DSA Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Company Context</span>
              </label>
              <input
                type="text"
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                placeholder="e.g. Google SDE-1 / Amazon Leadership Round / General Tech"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={startNewInterview}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
            <span>{loading ? 'Initializing AI Interviewer...' : 'Start Mock Interview Session'}</span>
          </button>
        </div>
      ) : evaluation ? (
        /* Evaluation Summary Report Panel */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase font-mono tracking-wider">Evaluation Report</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{session.roleType} Interview</h2>
            </div>
            <button
              onClick={() => { setSession(null); setEvaluation(null); setMessages([]); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Interview</span>
            </button>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Overall Score</span>
              <span className="text-3xl font-black text-indigo-900">{evaluation.overallScore || 80}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Technical</span>
              <span className="text-3xl font-black text-emerald-900">{evaluation.technicalScore || 80}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Communication</span>
              <span className="text-3xl font-black text-blue-900">{evaluation.communicationScore || 80}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Problem Solving</span>
              <span className="text-3xl font-black text-purple-900">{evaluation.problemSolvingScore || 80}%</span>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Detailed Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{evaluation.detailedFeedback}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-1">
                  {(evaluation.strengths || []).map((s, i) => (
                    <li key={i} className="text-xs text-emerald-900 font-medium flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Areas for Improvement</span>
                </h4>
                <ul className="space-y-1">
                  {(evaluation.improvements || []).map((imp, i) => (
                    <li key={i} className="text-xs text-amber-900 font-medium flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Interactive Interview Chat Panel */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-[550px] overflow-hidden">
          {/* Chat Transcript Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
            {messages.map((msg, idx) => {
              const isAi = msg.speaker === 'ai';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 ${isAi ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[78%] p-4 rounded-2xl text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-xs font-medium'
                      : 'bg-indigo-600 text-white rounded-tr-xs font-medium'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            {submittingTurn && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>AI Interviewer is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* User Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50 flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your response to the interviewer..."
              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={submittingTurn || !inputMessage.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MockInterview;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Sparkles,
  Zap,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  Code2,
  BrainCircuit,
  Building2,
  HelpCircle
} from 'lucide-react';

export default function SmartRecommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Explanation state
  const [explainingIndex, setExplainingIndex] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      const res = await API.get('/student/recommendations');
      if (res.data && res.data.success) {
        setRecommendations(Array.isArray(res.data.data) ? res.data.data.slice(0, 5) : []);
      } else {
        setError(res.data?.message || 'Failed to retrieve recommendations.');
      }
    } catch (err) {
      const status = err.response?.status;
      setErrorCode(status);
      if (status === 401) {
        setError('Your session has expired. Please sign in again.');
      } else if (status === 403) {
        setError('Access restricted to student accounts.');
      } else if (status === 503) {
        setError('AI recommendation engine is temporarily offline. Please try again shortly.');
      } else {
        setError('Unable to load smart recommendations at this time.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (rec, index) => {
    if (expandedIndex === index && explanations[index] && !explanations[index].error) {
      setExpandedIndex(null);
      return;
    }

    setExpandedIndex(index);

    if (explanations[index] && !explanations[index].error) {
      return;
    }

    setExplainingIndex(index);
    setExplanations(prev => ({
      ...prev,
      [index]: null
    }));

    try {
      const payload = {
        recommendation: {
          type: rec.type,
          category: rec.category,
          topicName: rec.topicName,
          topicId: rec.topicId,
          title: rec.title
        }
      };

      const res = await API.post('/ai/recommendation-explain', payload);

      if (res.data && res.data.success) {
        setExplanations(prev => ({
          ...prev,
          [index]: {
            explanation: res.data.data.explanation,
            nextAction: res.data.data.nextAction
          }
        }));
      } else {
        setExplanations(prev => ({
          ...prev,
          [index]: {
            error: res.data?.message || 'Could not generate AI explanation.'
          }
        }));
      }
    } catch (err) {
      const status = err.response?.status;
      let errMsg = 'Failed to load AI explanation.';
      if (status === 503) {
        errMsg = 'AI Coach is temporarily unavailable. Please try again in a moment.';
      } else if (status === 401) {
        errMsg = 'Your session has expired. Please sign in again.';
      } else if (status === 403) {
        errMsg = 'You are not authorized to request this explanation.';
      } else if (status === 400) {
        errMsg = err.response?.data?.message || 'This recommendation is no longer active for your profile.';
      }

      setExplanations(prev => ({
        ...prev,
        [index]: {
          error: errMsg,
          errorCode: status
        }
      }));
    } finally {
      setExplainingIndex(null);
    }
  };

  const getCategoryBadge = (category) => {
    const norm = (category || 'general').toLowerCase();
    switch (norm) {
      case 'dsa':
        return { label: 'DSA', color: 'badge-info', icon: Code2 };
      case 'aptitude':
        return { label: 'Aptitude', color: 'badge-easy', icon: BrainCircuit };
      case 'cs_core':
        return { label: 'CS Core', color: 'badge-neutral', icon: Building2 };
      default:
        return { label: 'General', color: 'badge-medium', icon: Sparkles };
    }
  };

  const getPriorityBadge = (priority) => {
    const norm = (priority || 'medium').toLowerCase();
    switch (norm) {
      case 'high':
        return { label: 'High Priority', color: 'badge-hard' };
      case 'low':
        return { label: 'Low Priority', color: 'badge-neutral' };
      default:
        return { label: 'Medium Priority', color: 'badge-medium' };
    }
  };

  const getTargetRoute = (category) => {
    const norm = (category || 'general').toLowerCase();
    switch (norm) {
      case 'dsa': return '/student/dsa';
      case 'aptitude': return '/student/aptitude';
      case 'cs_core': return '/student/cs-core';
      default: return '/student/practice';
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-800 space-y-5 bg-slate-900/60 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="heading-section">Smart Recommendations</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider font-mono">
                AI Driven
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized target topics prioritized from your practice attempts & weak areas.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn-secondary text-xs px-3 py-1.5 self-start sm:self-auto cursor-pointer disabled:opacity-50"
          title="Refresh recommendations"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content States */}
      {loading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 skeleton-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-800 rounded-md"></div>
                <div className="h-5 w-20 bg-slate-800 rounded-md"></div>
              </div>
              <div className="h-5 w-3/4 bg-slate-800 rounded-md"></div>
              <div className="h-4 w-full bg-slate-800/60 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-banner flex-col items-center justify-center text-center space-y-3 p-5">
          <ShieldAlert className="h-8 w-8 text-rose-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-rose-200">Unable to Load Recommendations</h3>
            <p className="text-xs text-slate-300 max-w-md">{error}</p>
          </div>
          <button
            onClick={fetchRecommendations}
            className="btn-danger text-xs px-4 py-2 mt-2"
          >
            Try Again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="empty-state-card">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No Pending Recommendations</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Great job! You have addressed your active study targets. Practice more questions to unlock personalized AI recommendations.
            </p>
          </div>
          <button
            onClick={() => navigate('/student/dsa')}
            className="btn-primary text-xs px-4 py-2 mt-3 inline-flex items-center gap-1.5"
          >
            <span>Start Practice</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const catBadge = getCategoryBadge(rec.category);
            const prioBadge = getPriorityBadge(rec.priority);
            const CategoryIcon = catBadge.icon;
            const isExplaining = explainingIndex === index;
            const isExpanded = expandedIndex === index;
            const explanationData = explanations[index];

            return (
              <div
                key={index}
                className={`p-4 md:p-5 rounded-xl border transition-all space-y-3 ${
                  rec.priority === 'high'
                    ? 'bg-slate-900/80 border-rose-500/30 hover:border-rose-500/50'
                    : rec.priority === 'medium'
                    ? 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Header Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${catBadge.color}`}>
                      <CategoryIcon className="h-3.5 w-3.5" />
                      <span>{catBadge.label}</span>
                    </span>

                    {rec.topicName && (
                      <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">
                        {rec.topicName}
                      </span>
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${prioBadge.color}`}>
                    {prioBadge.label}
                  </span>
                </div>

                {/* Main Recommendation Content */}
                <div className="space-y-1.5">
                  <h3 className="heading-card">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-400">Why recommended: </span>
                    {rec.reason}
                  </p>
                  {rec.action && (
                    <div className="flex items-start gap-2 pt-1 text-xs text-indigo-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong className="text-indigo-200">Recommended Action:</strong> {rec.action}</span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60">
                  <button
                    onClick={() => handleExplain(rec, index)}
                    disabled={isExplaining}
                    className={`btn-secondary text-xs px-3 py-1.5 cursor-pointer ${
                      isExpanded && explanationData && !explanationData.error
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                        : ''
                    }`}
                  >
                    {isExplaining ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                        <span>Asking AI Coach...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>Why this recommendation?</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" /> : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(getTargetRoute(rec.category))}
                    className="btn-primary text-xs px-4 py-1.5"
                  >
                    <span>Start Practice</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* AI Explanation Expandable Panel */}
                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                        <Brain className="h-4 w-4 text-indigo-400" />
                        <span>AI Coach Explanation</span>
                      </div>
                      <button
                        onClick={() => setExpandedIndex(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>

                    {isExplaining ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        <span>Analyzing your learning context with AI Coach...</span>
                      </div>
                    ) : explanationData?.error ? (
                      <div className="error-banner text-xs">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{explanationData.error}</span>
                        <button
                          onClick={() => handleExplain(rec, index)}
                          className="btn-danger text-xs px-2.5 py-1 ml-auto"
                        >
                          Retry Explanation
                        </button>
                      </div>
                    ) : explanationData ? (
                      <div className="space-y-3 text-xs text-slate-200">
                        <p className="leading-relaxed text-slate-300">
                          {explanationData.explanation}
                        </p>

                        {explanationData.nextAction && (
                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-indigo-500/20 flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-indigo-300">Suggested Next Step: </span>
                              <span className="text-slate-300">{explanationData.nextAction}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


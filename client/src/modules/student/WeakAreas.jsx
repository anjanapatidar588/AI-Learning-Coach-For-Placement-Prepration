import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
  Target,
  BarChart2
} from 'lucide-react';

const WeakAreas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);

  useEffect(() => {
    fetchWeakAreas();
  }, []);

  const fetchWeakAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/weak-areas');
      if (res.data && res.data.success) {
        setWeakAreas(res.data.data?.weakAreas || []);
      } else {
        setError(res.data?.message || 'Failed to load weak areas data.');
      }
    } catch (err) {
      console.error('Error fetching weak areas:', err);
      setError('Unable to fetch weak areas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityInfo = (item) => {
    const acc = typeof item.accuracy === 'number' ? item.accuracy : 0;
    if (acc < 30 || item.failedAttempts >= 3) {
      return {
        label: 'High Severity',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        cardBorder: 'border-rose-500/30 bg-rose-950/10'
      };
    }
    if (acc <= 45) {
      return {
        label: 'Medium Severity',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        cardBorder: 'border-amber-500/30 bg-amber-950/10'
      };
    }
    return {
      label: 'Low Severity',
      badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      cardBorder: 'border-yellow-500/30 bg-yellow-950/10'
    };
  };

  const getCategoryRoute = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'dsa') return '/student/dsa';
    if (cat === 'aptitude') return '/student/aptitude';
    if (cat === 'cs_core' || cat === 'cs core' || cat === 'cscore') return '/student/cs-core';
    return '/student/practice';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm text-gray-400 font-mono">Analyzing student weakness patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Failed to Load Weak Areas</h3>
        <p className="text-xs text-gray-300">{error}</p>
        <button
          onClick={fetchWeakAreas}
          className="btn-danger text-xs px-4 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            <span>Weak Areas & Remediation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Topics identified with accuracy below 60% based on your actual practice submissions.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/ai-coach')}
          className="btn-primary text-xs px-4 py-2"
        >
          <Bot className="w-4 h-4 text-indigo-300" />
          <span>Consult AI Coach</span>
        </button>
      </div>

      {weakAreas.length === 0 ? (
        <div className="empty-state-card py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="heading-section">Great work! No significant weak areas detected yet.</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your recent practice accuracy is consistently solid across attempted topics. Keep practicing to maintain high precision!
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/student/practice')}
              className="btn-primary text-xs px-4 py-2"
            >
              Explore Practice Zone
            </button>
            <button
              onClick={() => navigate('/student/progress')}
              className="btn-secondary text-xs px-4 py-2"
            >
              View Full Progress
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span>Detected Weak Topics ({weakAreas.length})</span>
            <span>Sorted by Accuracy & Error Frequency</span>
          </div>

          {weakAreas.map((item, idx) => {
            const severity = getSeverityInfo(item);
            const route = getCategoryRoute(item.category);

            return (
              <div
                key={idx}
                className={`glass-panel p-5 rounded-2xl border ${severity.cardBorder} space-y-4 transition-all hover:border-amber-500/40`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="heading-card">{item.topic || 'Practice Topic'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${severity.badgeBg}`}>
                        {severity.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono bg-slate-800 text-slate-300">
                        {item.category ? item.category.replace('_', ' ') : 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Accuracy</span>
                      <span className="font-bold text-rose-400 text-sm">{item.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Attempts</span>
                      <span className="font-bold text-white text-sm">{item.totalAttempts}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Failed</span>
                      <span className="font-bold text-rose-400 text-sm">{item.failedAttempts}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1 font-mono">
                      <BarChart2 className="w-3 h-3" />
                      <span>Attempt Performance Summary</span>
                    </span>
                    <p className="text-slate-300">
                      Passed {item.passedAttempts} out of {item.totalAttempts} attempts. Focus on underlying core concepts and step-by-step problem decomposition.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1 font-mono">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Recommended Action</span>
                    </span>
                    <p className="text-slate-300">
                      Solve targeted problems in {item.topic} to improve accuracy above 60% and boost placement readiness score.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800/60">
                  <button
                    onClick={() => navigate('/student/ai-coach', { state: { initialPrompt: `I need help understanding and fixing my weak area in topic: ${item.topic}` } })}
                    className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ask AI Coach</span>
                  </button>

                  <button
                    onClick={() => navigate(route)}
                    className="btn-primary text-xs px-4 py-1.5 cursor-pointer"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeakAreas;


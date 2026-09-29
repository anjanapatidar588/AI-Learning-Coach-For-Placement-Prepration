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
        badgeBg: 'badge-hard',
        cardBorder: 'border-rose-200 bg-rose-50/40'
      };
    }
    if (acc <= 45) {
      return {
        label: 'Medium Severity',
        badgeBg: 'badge-medium',
        cardBorder: 'border-amber-200 bg-amber-50/40'
      };
    }
    return {
      label: 'Low Severity',
      badgeBg: 'badge-neutral',
      cardBorder: 'border-slate-200 bg-white'
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-semibold">Analyzing weakness patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Failed to Load Weak Areas</h3>
        <p className="text-xs text-slate-600">{error}</p>
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
            <span>Weak Areas & Remediation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Topics identified with accuracy below 60% based on your actual practice submissions.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/ai-coach')}
          className="btn-primary text-xs px-4 py-2"
        >
          <Bot className="w-4 h-4 text-white" />
          <span>Consult AI Coach</span>
        </button>
      </div>

      {weakAreas.length === 0 ? (
        <div className="empty-state-card py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="heading-section">Great work! No significant weak areas detected yet.</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
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
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold px-1">
            <span>Detected Weak Topics ({weakAreas.length})</span>
            <span>Sorted by Accuracy & Error Frequency</span>
          </div>

          {weakAreas.map((item, idx) => {
            const severity = getSeverityInfo(item);
            const route = getCategoryRoute(item.category);

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${severity.cardBorder} space-y-4 transition-all hover:border-amber-400 shadow-xs`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="heading-card">{item.topic || 'Practice Topic'}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${severity.badgeBg}`}>
                        {severity.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category ? item.category.replace('_', ' ') : 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Accuracy</span>
                      <span className="font-extrabold text-rose-600 text-sm">{item.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Attempts</span>
                      <span className="font-bold text-slate-900 text-sm">{item.totalAttempts}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Failed</span>
                      <span className="font-extrabold text-rose-600 text-sm">{item.failedAttempts}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center space-x-1 font-mono">
                      <BarChart2 className="w-3 h-3" />
                      <span>Attempt Performance Summary</span>
                    </span>
                    <p className="text-slate-600">
                      Passed {item.passedAttempts} out of {item.totalAttempts} attempts. Focus on underlying core concepts and step-by-step problem decomposition.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1 font-mono">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Why this topic?</span>
                    </span>
                    <p className="text-slate-600">
                      Recommended because your assessment showed a pattern-recognition gap in {item.topic}.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/60">
                  <button
                    onClick={() => navigate('/student/ai-coach', { state: { initialPrompt: `I need help understanding and fixing my weak area in topic: ${item.topic}` } })}
                    className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
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

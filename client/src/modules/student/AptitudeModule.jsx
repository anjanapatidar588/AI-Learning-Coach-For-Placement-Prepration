import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import {
  BrainCircuit,
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  RotateCw,
  CheckCircle2,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

const AptitudeModule = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    fetchAptitudeTopics();
  }, []);

  const fetchAptitudeTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/aptitude/topics');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTopics(res.data.data);
      } else {
        setTopics([]);
      }
    } catch (err) {
      console.error('Failed to load aptitude topics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load Aptitude topics');
    } finally {
      setLoading(false);
    }
  };

  // Filter topics based on search query & difficulty
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty =
      selectedDifficulty === 'ALL' ||
      (t.difficulty || '').toUpperCase() === selectedDifficulty.toUpperCase();

    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty) => {
    const diff = (difficulty || 'Medium').toLowerCase();
    if (diff === 'easy') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Easy
        </span>
      );
    }
    if (diff === 'hard') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          Hard
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
        Medium
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-100/50 via-purple-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Campus Placement Screening</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span>Quantitative Aptitude & Logical Reasoning</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Master speed shortcuts, mental math formulas, and high-frequency aptitude problem patterns asked in campus placement screening rounds.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-medium">Curated Topics</div>
              <div className="text-lg font-black text-slate-900">{topics.length}</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search aptitude topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff.charAt(0) + diff.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-20 h-5 bg-slate-100 rounded-full" />
                <div className="w-14 h-5 bg-slate-100 rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
              <div className="w-full h-10 bg-slate-100 rounded-md" />
              <div className="pt-2 flex items-center justify-between">
                <div className="w-24 h-4 bg-slate-100 rounded" />
                <div className="w-24 h-8 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. ERROR STATE */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Failed to Load Aptitude Topics</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchAptitudeTopics}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 4. EMPTY STATE */}
      {!loading && !error && filteredTopics.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Aptitude Topics Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedDifficulty !== 'ALL'
                ? 'Try adjusting your search query or difficulty filter to view available topics.'
                : 'Aptitude topics are being curated by the placement team. Check back shortly.'}
            </p>
          </div>
          {(searchQuery || selectedDifficulty !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('ALL');
              }}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* 5. POPULATED TOPIC CARDS GRID */}
      {!loading && !error && filteredTopics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => {
            const timeEst = topic.learningContent?.estimatedLearningTimeMinutes || 30;
            const summaryText =
              topic.summary ||
              topic.description ||
              topic.learningContent?.what ||
              'Explore formula shortcuts, step-by-step examples, and placement screening question patterns.';

            return (
              <div
                key={topic._id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {topic.subject || 'Quantitative'}
                    </span>
                    {getDifficultyBadge(topic.difficulty)}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors leading-snug">
                    {topic.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {summaryText}
                  </p>
                </div>

                {/* Bottom info & Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{timeEst} mins</span>
                  </div>

                  <Link
                    to={`/student/learn/${topic._id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs group-hover:scale-102 cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AptitudeModule;

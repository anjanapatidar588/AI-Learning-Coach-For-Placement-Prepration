import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Play,
  Code2,
  Database,
  Brain,
  Zap,
  Loader2,
  AlertCircle,
  Trophy,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  play: Play,
  code: Code2,
  'check-circle': CheckCircle2,
  database: Database,
  brain: Brain,
  zap: Zap,
  award: Award,
  trophy: Trophy
};

const Achievements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievementsData, setAchievementsData] = useState({
    achievements: [],
    streak: { current: 0, longest: 0 }
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/achievements');
      if (res.data && res.data.success) {
        setAchievementsData({
          achievements: res.data.data?.achievements || [],
          streak: res.data.data?.streak || { current: 0, longest: 0 }
        });
      } else {
        setError(res.data?.message || 'Failed to load achievements data.');
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Unable to fetch achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm text-gray-400 font-mono">Fetching milestone badges & streak metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Failed to Load Achievements</h3>
        <p className="text-xs text-gray-300">{error}</p>
        <button
          onClick={fetchAchievements}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { achievements, streak } = achievementsData;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <Award className="w-7 h-7 text-amber-400" />
            <span>Achievements & Badges</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active practice streaks and unlock placement milestone badges as you solve questions.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/practice')}
          className="btn-primary text-xs px-4 py-2"
        >
          <span>Keep Practice Streak</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Streak & Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block font-mono">Current Practice Streak</span>
            <span className="text-2xl font-extrabold text-white">{streak.current} {streak.current === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block font-mono">Longest Streak</span>
            <span className="text-2xl font-extrabold text-white">{streak.longest} {streak.longest === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block font-mono">Badges Unlocked</span>
            <span className="text-2xl font-extrabold text-white">{unlockedCount} / {achievements.length}</span>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      {achievements.length === 0 ? (
        <div className="empty-state-card py-12 space-y-3">
          <Award className="w-12 h-12 text-slate-500 mb-2" />
          <h3 className="heading-section">No achievements available</h3>
          <p className="text-xs text-slate-400">Start practicing to earn placement badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((badge) => {
            const IconComponent = iconMap[badge.icon] || Award;
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isUnlocked
                    ? 'border-amber-500/40 bg-amber-950/10 shadow-lg shadow-amber-500/5'
                    : 'border-slate-800 bg-slate-950/30 opacity-70 hover:opacity-90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    isUnlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                    isUnlocked
                      ? 'badge-medium'
                      : 'badge-neutral'
                  }`}>
                    {badge.type || 'Milestone'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="heading-card">{badge.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  {isUnlocked ? (
                    <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked {badge.unlockedAt ? badge.unlockedAt : 'Recently'}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500 font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked Milestone</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achievements;


import React from 'react';
import { Award, Flame, Code2, Zap, CheckCircle2 } from 'lucide-react';

export default function Achievements() {
  const badges = [
    { id: 1, title: 'Code Pioneer', desc: 'Solved first 10 DSA coding problems', icon: Code2, unlocked: true, date: '2026-08-28' },
    { id: 2, title: '5-Day Streak', desc: 'Maintained active practice streak for 5 consecutive days', icon: Flame, unlocked: true, date: '2026-09-01' },
    { id: 3, title: 'Aptitude Ace', desc: 'Scored 90%+ in 3 Quantitative Aptitude quizzes', icon: Zap, unlocked: true, date: '2026-08-30' },
    { id: 4, title: 'Interview Champion', desc: 'Completed first full AI Mock Interview with 75%+ readiness score', icon: Award, unlocked: false }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Achievements & Badges</h1>
            <p className="text-xs text-slate-400">Unlock placement milestone badges as you practice across modules.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map(b => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className={`glass-panel p-5 rounded-2xl border text-center space-y-3 ${
                b.unlocked ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className={`h-12 w-12 mx-auto rounded-2xl flex items-center justify-center ${
                b.unlocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{b.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{b.desc}</p>
              </div>
              {b.unlocked ? (
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Unlocked {b.date}</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Locked Milestone</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Target, Search, Filter, Code2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PracticeZone() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const questions = [
    { id: 'q-1', title: 'Two Sum', slug: 'two-sum', category: 'dsa', difficulty: 'Easy', companies: ['Google', 'Amazon', 'TCS'] },
    { id: 'q-2', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating', category: 'dsa', difficulty: 'Medium', companies: ['Google', 'Microsoft'] },
    { id: 'q-3', title: 'Successive Percentage Net Change', slug: 'percentages', category: 'aptitude', difficulty: 'Easy', companies: ['TCS', 'Infosys'] },
    { id: 'q-4', title: 'DBMS Isolation Levels & Concurrency', slug: 'dbms-isolation', category: 'cs_core', difficulty: 'Medium', companies: ['Amazon', 'Uber'] }
  ];

  const filtered = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Practice Zone</h1>
            <p className="text-xs text-slate-400">Universal problem repository filtered by difficulty, topic, and target companies.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problems or tags..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        {filtered.map(q => (
          <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-blue-500/30 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-100">{q.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {q.difficulty}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-800">
                  {q.category}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Tagged Companies:</span>
                <span className="text-blue-300 font-medium">{q.companies.join(', ')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(q.category === 'dsa' ? '/dsa' : q.category === 'aptitude' ? '/aptitude' : '/cs-core')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-600/20"
            >
              <span>Solve Problem</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

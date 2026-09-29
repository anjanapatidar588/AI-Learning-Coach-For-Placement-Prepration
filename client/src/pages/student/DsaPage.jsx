import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { Code2, ArrowRight, Play, CheckCircle2, Clock, Filter, Search, Menu } from 'lucide-react';
import { subjectsData, practiceQuestionsData } from '../../services/pathpilotData';

const DsaPage = () => {
  const { topic } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');

  const dsaModule = subjectsData.find((s) => s.id === 'dsa');
  const activeTopic = dsaModule.topics.find((t) => t.id === topic) || dsaModule.topics[0];

  const filteredQuestions = practiceQuestionsData.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficulty === 'all' || q.difficulty.toLowerCase() === difficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">DSA Practice</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          {/* Header */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pattern Recognition Training</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Data Structures & Algorithms</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Learn underlying problem patterns (Two Pointers, Sliding Window, DFS/BFS) instead of memorizing solutions.
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl glass-panel-dark border-cyan-500/30 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block">DSA Progress</span>
              <span className="text-lg font-bold text-cyan-400">{dsaModule.progress}% Completed</span>
            </div>
          </div>

          {/* Topics Selector Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Select Topic Pattern</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dsaModule.topics.map((t) => (
                <Link
                  key={t.id}
                  to={`/dsa/${t.id}`}
                  className={`p-4 rounded-xl glass-card-dark text-left space-y-3 border transition-all ${
                    t.id === activeTopic.id
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      t.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                      'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {t.difficulty}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${t.progress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{t.questionsCount} Questions</span>
                    <span className="text-cyan-400 font-semibold">{t.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Practice Questions List */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {activeTopic.name} — Question Bank
              </h3>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search problem..."
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="glass-panel-dark p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-500/40 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {q.pattern}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{q.problemStatement}</p>
                  </div>

                  <Link
                    to="/practice"
                    className="btn-pathpilot-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Solve Problem</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DsaPage;

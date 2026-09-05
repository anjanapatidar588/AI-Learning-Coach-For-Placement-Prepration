import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Sparkles,
  Flame,
  Target,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Code2,
  Building2,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(false);
      const res = await API.get('/student/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setLoading(false);
      // Fallback data
      setData({
        profile: { readinessScore: 74, currentStreak: 5, totalProblemsSolved: 28 },
        roadmap: [
          { nodeId: 'n-1', title: 'Arrays & Two Pointers', category: 'dsa', status: 'in_progress', priorityScore: 10 },
          { nodeId: 'n-2', title: 'Percentages & Profit Loss', category: 'aptitude', status: 'in_progress', priorityScore: 9 },
          { nodeId: 'n-3', title: 'DBMS Fundamentals & SQL', category: 'cs_core', status: 'locked', priorityScore: 8 },
          { nodeId: 'n-4', title: 'Binary Trees & BFS/DFS', category: 'dsa', status: 'locked', priorityScore: 8 }
        ],
        recentAttempts: [
          { id: 'att-1', questionTitle: 'Two Sum', category: 'dsa', status: 'Accepted', time: '2 hours ago' },
          { id: 'att-2', questionTitle: 'Time & Work Efficiency', category: 'aptitude', status: 'Accepted', time: 'Yesterday' }
        ]
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Welcome & Readiness Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Personalized Readiness Track</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name}</span>!
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Your AI Coach analyzed your recent practice runs. You are on track for your target companies: <span className="text-blue-300 font-semibold">{user?.targetCompanies?.join(', ') || 'Google, Amazon, TCS'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-xl">
                <Flame className="h-5 w-5 fill-amber-400" />
                <span>5 Days</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Active Streak</div>
            </div>

            <div className="text-center px-3">
              <div className="text-2xl font-extrabold text-emerald-400">74%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">Placement Index</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Roadmap & Modules Quick Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Roadmap Engine (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                <h2 className="text-base font-semibold text-slate-100">Personalized Learning Roadmap</h2>
              </div>
              <button 
                onClick={() => navigate('/dsa')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(data?.roadmap || []).map((node, index) => (
                <div 
                  key={node.nodeId || index} 
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    node.status === 'in_progress'
                      ? 'bg-blue-950/20 border-blue-500/30 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      node.status === 'in_progress'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <span>{node.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                          node.category === 'dsa' ? 'bg-blue-500/10 text-blue-400' :
                          node.category === 'aptitude' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
                        }`}>
                          {node.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Priority Score: {node.priorityScore}/10 • Estimated: 3 hrs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {node.status === 'in_progress' ? (
                      <button 
                        onClick={() => navigate(node.category === 'dsa' ? '/dsa' : node.category === 'aptitude' ? '/aptitude' : '/cs-core')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                      >
                        Start Node
                      </button>
                    ) : (
                      <span className="p-2 text-slate-600">
                        <Lock className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launcher for Learning Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/dsa')}
              className="glass-panel glass-panel-hover p-4 rounded-xl border border-slate-800/80 cursor-pointer space-y-2 group"
            >
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">DSA Module</h3>
              <p className="text-[11px] text-slate-400">Arrays, Trees, Graphs, DP with Monaco Code Editor & AI Debugger.</p>
            </div>

            <div 
              onClick={() => navigate('/aptitude')}
              className="glass-panel glass-panel-hover p-4 rounded-xl border border-slate-800/80 cursor-pointer space-y-2 group"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Aptitude Module</h3>
              <p className="text-[11px] text-slate-400">Quantitative, Logical, Verbal tests with AI step-by-step shortcuts.</p>
            </div>

            <div 
              onClick={() => navigate('/cs-core')}
              className="glass-panel glass-panel-hover p-4 rounded-xl border border-slate-800/80 cursor-pointer space-y-2 group"
            >
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">CS Core Module</h3>
              <p className="text-[11px] text-slate-400">DBMS, OS, Computer Networks & OOPs flashcards and concept breakdown.</p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Coach Widget & Recent Activity */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4 bg-gradient-to-b from-slate-900 to-indigo-950/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
              <h2 className="text-base font-semibold text-slate-100">Ask Your AI Coach</h2>
            </div>
            <p className="text-xs text-slate-400">
              Need help with a coding problem, aptitude trick, or resume feedback? Switch AI personas anytime!
            </p>
            <button 
              onClick={() => navigate('/ai-coach')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open My AI Coach</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Recent Attempt Activity</h2>
              <Clock className="h-4 w-4 text-slate-500" />
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Two Sum</div>
                  <div className="text-[10px] text-slate-500">DSA • Hash Map Pattern</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Accepted
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Time & Work Efficiency</div>
                  <div className="text-[10px] text-slate-500">Aptitude • Quantitative</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Accepted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const mockRadarData = [
  { subject: 'DSA & Algo', score: 75, fullMark: 100 },
  { subject: 'Aptitude', score: 82, fullMark: 100 },
  { subject: 'DBMS & SQL', score: 68, fullMark: 100 },
  { subject: 'OS & Networks', score: 60, fullMark: 100 },
  { subject: 'System Design', score: 55, fullMark: 100 },
  { subject: 'HR & Soft Skills', score: 85, fullMark: 100 },
];

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Welcome & Target Hero Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized AI Placement Engine Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Placement Readiness Hub</h1>
            <p className="text-sm text-gray-400 mt-1">Your AI-driven adaptive roadmap is dynamically updating based on recent practice attempts.</p>
          </div>

          <div className="flex items-center space-x-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              72%
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Target Readiness Score</p>
              <p className="text-sm font-bold text-white">SDE-1 Role Benchmark</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/student/dsa" className="glass-card p-5 rounded-2xl block hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <h3 className="mt-4 font-bold text-base text-white">DSA & Algorithms</h3>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">Mastery Level:</span>
            <span className="text-indigo-400 font-mono font-bold">75% (Intermediate)</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </Link>

        <Link to="/student/aptitude" className="glass-card p-5 rounded-2xl block hover:border-violet-500/40">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <h3 className="mt-4 font-bold text-base text-white">Aptitude & Logic</h3>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">Accuracy Rate:</span>
            <span className="text-violet-400 font-mono font-bold">82% (High)</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </Link>

        <Link to="/student/cs-core" className="glass-card p-5 rounded-2xl block hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
          <h3 className="mt-4 font-bold text-base text-white">CS Core Fundamentals</h3>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-400">Completed Topics:</span>
            <span className="text-emerald-400 font-mono font-bold">14 / 22 Topics</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64%' }}></div>
          </div>
        </Link>
      </div>

      {/* Analytics Radar Chart & Weakness Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Skill Mastery Radar</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">Live Sync</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Multi-dimensional evaluation across technical placement domain specs.</p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockRadarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" />
                <Radar name="Student Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Area Detection Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Detected Weak Areas</span>
              </h3>
              <Link to="/student/weak-areas" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-1">AI Personalization Engine detected precision drops in these topics.</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200">Dynamic Programming (Knapsack & Subsequences)</p>
                <p className="text-xs text-amber-400/80 mt-0.5">Accuracy drop: 40% on recent 5 submissions</p>
              </div>
              <Link to="/student/practice" className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold shrink-0">
                Practice
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200">DBMS Transactions & Concurrency Control</p>
                <p className="text-xs text-amber-400/80 mt-0.5">Concept gap detected in ACID properties test</p>
              </div>
              <Link to="/student/cs-core" className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold shrink-0">
                Review
              </Link>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-200">Time & Work (Quantitative Aptitude)</p>
                <p className="text-xs text-indigo-400/80 mt-0.5">Speed bottleneck: 2.1x average time limit</p>
              </div>
              <Link to="/student/aptitude" className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold shrink-0">
                Drill
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

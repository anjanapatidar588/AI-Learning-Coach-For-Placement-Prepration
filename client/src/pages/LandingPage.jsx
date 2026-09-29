import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Target,
  Code2,
  Database,
  Cpu,
  Network,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Layers,
  FileCode2,
  RotateCcw,
  BarChart3,
  MessageSquareText,
  ChevronRight,
  Compass,
  BookX,
  Check
} from 'lucide-react';

const LandingPage = () => {
  const subjects = [
    {
      name: 'Data Structures & Algorithms',
      code: 'DSA',
      icon: Code2,
      desc: 'Master Array Traversals, Trees, Dynamic Programming, and Graph algorithms with pattern recognition.',
      topics: ['Arrays & Two Pointers', 'Trees & Graphs', 'Dynamic Programming', 'Recursion & Backtracking'],
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    {
      name: 'Quantitative Aptitude',
      code: 'APTITUDE',
      icon: Target,
      desc: 'Build speed and precision for placement screening tests with time-tested numerical techniques.',
      topics: ['Percentages & Profit/Loss', 'Time, Speed & Distance', 'Permutations & Probability', 'Data Interpretation'],
      color: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    {
      name: 'Object-Oriented Programming',
      code: 'OOPS',
      icon: Layers,
      desc: 'Understand core design concepts, OOP principles, and real-world implementation techniques.',
      topics: ['Inheritance & Polymorphism', 'Encapsulation & Abstraction', 'SOLID Principles', 'Design Patterns'],
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      name: 'Database Management Systems',
      code: 'DBMS',
      icon: Database,
      desc: 'Ace relational database concepts, SQL query optimization, normalization, and ACID properties.',
      topics: ['SQL Queries & Joins', 'Normalization (1NF-BCNF)', 'Indexing & B-Trees', 'Transactions & Locks'],
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    {
      name: 'Operating Systems',
      code: 'OS',
      icon: Cpu,
      desc: 'Master process management, memory allocation, deadlocks, and system-level questions.',
      topics: ['Process Scheduling', 'Virtual Memory & Paging', 'Deadlock Detection', 'Threads & Concurrency'],
      color: 'bg-rose-50 border-rose-200 text-rose-700'
    },
    {
      name: 'Computer Networks',
      code: 'CN',
      icon: Network,
      desc: 'Understand network architectures, protocols, routing algorithms, and security fundamentals.',
      topics: ['OSI & TCP/IP Models', 'HTTP/HTTPS & DNS', 'Routing & Subnetting', 'Sockets & Security'],
      color: 'bg-sky-50 border-sky-200 text-sky-700'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Baseline Assessment',
      desc: 'Evaluate your baseline knowledge across DSA, Aptitude, and CS Core to identify exact skill gaps.'
    },
    {
      step: '02',
      title: 'Adaptive Placement Roadmap',
      desc: 'Get an AI-generated study sequence that dynamically adapts priority based on your performance.'
    },
    {
      step: '03',
      title: 'Pattern Recognition Practice',
      desc: 'Solve curated problems grouped by underlying patterns rather than memorizing individual solutions.'
    },
    {
      step: '04',
      title: 'AI Coach & Revision System',
      desc: 'Receive real-time hints, mistake analysis, and flashcard spaced repetition from your AI Coach.'
    }
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Placement Readiness Score',
      desc: 'A real-time, multi-dimensional metric reflecting your technical accuracy, speed, and syllabus coverage.'
    },
    {
      icon: Compass,
      title: 'Smart Recommendations',
      desc: 'AI-driven suggestions guiding you to your highest-impact next practice activity every session.'
    },
    {
      icon: TrendingUp,
      title: 'Automated Weak Area Targeting',
      desc: 'Identifies concept bottlenecks below 60% accuracy and generates customized practice sets.'
    },
    {
      icon: FileCode2,
      title: 'Real Code Execution Sandbox',
      desc: 'Practice DSA problems with code editor, multi-language compiler, test cases, and time limit checks.'
    },
    {
      icon: MessageSquareText,
      title: 'AI Persona Coach',
      desc: 'Instant context-aware mentor providing hints, error diagnosis, and topic explanations 24/7.'
    },
    {
      icon: BookX,
      title: 'Mistake & Revision Journal',
      desc: 'Categorizes mistakes by type and provides flashcard revision decks to turn weaknesses into strengths.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight">AI Learning Coach</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Placement Prep
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#subjects" className="hover:text-indigo-600 transition-colors">Subjects</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Core Features</a>
            <a href="#ai-coach" className="hover:text-indigo-600 transition-colors">AI Coach</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary py-2 px-4 text-sm flex items-center space-x-2"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Decorative Light Background Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-blue-200/40 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Modern AI-Powered Learning Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Don't just solve questions.{' '}
              <span className="gradient-text">
                Learn how to recognize the pattern.
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              The platform analyzes assessment performance, identifies knowledge gaps, creates a personalized roadmap, teaches concepts, provides practice, tracks mistakes, and adapts learning.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <span>Start Preparing</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-base shadow-xs flex items-center justify-center space-x-2 transition-all"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Quick Proof Pills */}
            <div className="pt-8 flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Readiness Score</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Adaptive Learning Roadmap</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Context-Aware AI Tutor</span>
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview Card */}
          <div className="mt-14 relative max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300/40 via-purple-300/40 to-blue-300/40 rounded-3xl blur-lg opacity-80" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-500 ml-2">Placement Readiness Engine v2.4</span>
                </div>
                <div className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
                  Live Readiness: 78 / 100
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DSA Mastery</div>
                  <div className="text-2xl font-black text-indigo-600">82%</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Aptitude Precision</div>
                  <div className="text-2xl font-black text-amber-600">74%</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CS Core Accuracy</div>
                  <div className="text-2xl font-black text-purple-600">79%</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '79%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Recommended Next Step:</span> Practice 5 Medium questions in <span className="text-indigo-700 font-bold">Binary Search Trees</span> to raise readiness by +4 pts.
                  </div>
                </div>
                <Link to="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0">
                  Execute →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 font-mono">Systematic Learning Flow</h2>
            <h3 className="text-3xl font-black text-slate-900">How The Platform Prepares You</h3>
            <p className="text-slate-600 text-sm">
              From initial baseline assessment to placement-ready execution in 4 structured phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((hw, idx) => (
              <div key={idx} className="relative group p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:bg-white transition-all shadow-xs hover:shadow-md">
                <div className="text-3xl font-black text-indigo-600/30 group-hover:text-indigo-600 transition-colors mb-4 font-mono">
                  {hw.step}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{hw.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{hw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="py-20 border-t border-slate-200/80 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 font-mono">Comprehensive Curriculum</h2>
            <h3 className="text-3xl font-black text-slate-900">All Core Placement Domains Covered</h3>
            <p className="text-slate-600 text-sm">
              Every domain structured with clear pattern taxonomy and real assessment metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj, idx) => {
              const IconComp = subj.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${subj.color} border`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">{subj.code}</span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 mb-2">{subj.name}</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{subj.desc}</p>

                    <div className="space-y-1.5 mb-4">
                      {subj.topics.map((t, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link to="/register" className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-2">
                    <span>Explore Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 font-mono">Intelligent Tools</h2>
            <h3 className="text-3xl font-black text-slate-900">Engineered For Technical Performance</h3>
            <p className="text-slate-600 text-sm">
              Features built specifically to maximize concept retention and placement readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-4 text-indigo-700">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Coach Highlight */}
      <section id="ai-coach" className="py-20 border-t border-slate-200/80 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>AI Technical Mentor</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Get Instant Hints & Pattern Explanations Without Spoilers
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed">
                Stuck on a problem? The AI Coach analyzes your current code or quiz attempt and provides progressive hints, guiding you toward the underlying concept instead of giving away full solutions immediately.
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Context-Aware Guidance</div>
                    <div className="text-xs text-slate-600">Understands your current attempt, topic difficulty, and previous mistakes.</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Multi-Domain Expertise</div>
                    <div className="text-xs text-slate-600">Trained on DSA patterns, Aptitude formulas, and CS Core interview concepts.</div>
                  </div>
                </div>
              </div>

              <Link to="/register" className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 pt-2">
                <span>Try AI Coach In Action</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* AI Chat Graphic */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">SDE AI Coach</div>
                  <div className="text-[10px] text-emerald-600 flex items-center space-x-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Mentor</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <span className="font-bold text-indigo-600">Student:</span> I'm getting TLE on 0/1 Knapsack using recursion. How do I optimize it?
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-slate-800 space-y-2">
                  <div className="font-bold text-indigo-700 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>AI Coach Pattern Breakdown:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Notice overlapping subproblems for state <code className="text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">(index, remainingWeight)</code>.
                    Instead of recomputing recursive branches, store computed results in a 2D memo table.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Build Real Placement Readiness?
          </h2>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Take your baseline assessment today and let the AI Placement Coach guide your daily preparation with pattern precision.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-base shadow-xs flex items-center justify-center transition-all"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/80 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">AI Learning Coach</span>
            <span>— Placement Preparation Architecture</span>
          </div>
          <div>
            © {new Date().getFullYear()} AI Learning Coach. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

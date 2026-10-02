import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PreparationLoop from '../components/common/PreparationLoop';
import Footer from '../components/common/Footer';
import {
  Sparkles,
  ArrowRight,
  Target,
  Brain,
  Compass,
  BookOpen,
  Code2,
  RotateCcw,
  CheckCircle2,
  Search,
  Play,
  X,
  Layers,
  Award,
  ChevronRight
} from 'lucide-react';

const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const stepDetails = [
    {
      num: '01',
      title: 'Assessment: Adaptive Diagnostics',
      badge: 'Step 1: Evaluate',
      icon: Target,
      summary: '15-minute diagnostic screening across DSA, DBMS, OS, Networks, and Quantitative Aptitude.',
      points: [
        'Dynamically calibrated difficulty based on initial responses',
        'Tests core speed, analytical accuracy, and foundational retention',
        'Zero guessing penalty calibration with confidence markers'
      ]
    },
    {
      num: '02',
      title: 'AI Analysis: Knowledge Gaps',
      badge: 'Step 2: Diagnose',
      icon: Brain,
      summary: 'Classifies knowledge disconnects vs pattern recognition slips into 7 precise buckets.',
      points: [
        'Separates "Concept Not Clear" from "Time Pressure"',
        'Identifies algorithmic blindspots in time and space complexity',
        'Generates objective topic gap priority indexes'
      ]
    },
    {
      num: '03',
      title: 'Roadmap: Personalized Sequence',
      badge: 'Step 3: Guide',
      icon: Compass,
      summary: 'Sequential flowchart connecting prerequisite fundamentals to target company patterns.',
      points: [
        'Targeted toward your actual campus drive dates and dream companies',
        'Dynamic nodes update based on daily practice accuracy',
        'Prerequisite chains ensure you never skip essential building blocks'
      ]
    },
    {
      num: '04',
      title: 'Learning: Socratic Mastery',
      badge: 'Step 4: Master',
      icon: BookOpen,
      summary: 'Concept breakdowns, dry runs, and interactive Socratic hints that teach intuition.',
      points: [
        'Structured What / Why / Where / When learning layout',
        'Interactive step-by-step visual code dry runs',
        'Pattern recognition templates to identify common problem archetypes'
      ]
    },
    {
      num: '05',
      title: 'Practice: Monaco Code Sandbox',
      badge: 'Step 5: Code',
      icon: Code2,
      summary: 'Real coding environment with automated test case evaluation and progressive hints.',
      points: [
        'Multi-language code editor (C++, Java, Python, JavaScript)',
        'Edge case and hidden test case verification sandbox',
        'Socratic hints that guide without spoiling full solutions'
      ]
    },
    {
      num: '06',
      title: 'Reassessment: Spaced Retention',
      badge: 'Step 6: Retain',
      icon: RotateCcw,
      summary: 'Spaced repetition schedule (+1, +3, +7, +14, +30 days) to lock in conceptual retention.',
      points: [
        'Automatic Mistake Journal logging of every failed attempt',
        'Calibrated revision triggers based on forgetting curves',
        'Re-test verification to turn weak areas into verified strengths'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* 1. FLOATING PILL NAVBAR */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-white/85 backdrop-blur-md rounded-full border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
          <Link to="/" className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">PathPilot</span>
              <span className="text-[10px] text-slate-400 font-medium block">Your AI Learning Coach</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <Link to="/" className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Home
            </Link>
            <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold transition-colors">
              How It Works
            </span>
            <Link to="/#curriculum" className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Curriculum
            </Link>
            <Link to="/student/roadmap" className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Roadmap
            </Link>
            <Link to="/student/ai-coach" className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              AI Coach
            </Link>
          </nav>

          <div className="flex items-center space-x-2.5">
            <Link
              to="/login"
              className="text-xs font-bold text-indigo-700 px-4 py-2 hover:bg-indigo-50/60 rounded-full transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/student/onboarding"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center space-x-1.5 transition-all transform hover:scale-102"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. THE PREPARATION LOOP HERO / DIAGRAM */}
      <div className="pt-24">
        <PreparationLoop />
      </div>

      {/* 3. DEEP-DIVE INTERACTIVE STEP EXPLANATION */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Deep-Dive Mechanics</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How Each Step Guarantees Mastery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Explore the engineering and pedagogical intelligence powering every stage of your preparation.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {stepDetails.map((st, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setActiveTab(sIdx)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                  activeTab === sIdx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{st.num}</span>
                <span>{st.title.split(':')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase Card */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-slate-50 p-8 sm:p-10 rounded-3xl border border-indigo-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white text-indigo-700 border border-indigo-200 inline-block shadow-2xs">
                {stepDetails[activeTab].badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {stepDetails[activeTab].title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {stepDetails[activeTab].summary}
              </p>

              <div className="space-y-2.5 pt-2">
                {stepDetails[activeTab].points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-center space-x-2.5 text-xs text-slate-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md flex flex-col justify-between space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {React.createElement(stepDetails[activeTab].icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Placement Impact</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Calibrated Feedback Loop</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
                <span className="font-bold text-slate-800 block">Why this matters:</span>
                <p>
                  By connecting diagnostic evaluation directly into a customized flowchart, you never waste hours solving random problems that do not address your actual placement interview knowledge gaps.
                </p>
              </div>

              <Link
                to="/student/onboarding"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
              >
                <span>Experience This Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
};

export default HowItWorksPage;

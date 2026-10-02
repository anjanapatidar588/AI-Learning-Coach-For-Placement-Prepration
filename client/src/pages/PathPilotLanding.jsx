import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PreparationLoop from '../components/common/PreparationLoop';
import Footer from '../components/common/Footer';
import {
  Sparkles,
  ArrowRight,
  Play,
  Target,
  Compass,
  Brain,
  Code2,
  Cpu,
  Calculator,
  Bot,
  Check,
  X,
  RotateCcw,
  BookX,
  CheckCircle2,
  Search,
  BookOpen,
  MapPin,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

const PathPilotLanding = () => {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      step: '01',
      title: 'Adaptive Diagnostics',
      badge: 'Step 1: Evaluate',
      subtitle: 'Pinpoint conceptual strengths and topic gaps.',
      description: 'Our 15-minute diagnostic screening evaluates your foundational speed and accuracy across DSA, DBMS, OS, Networks, and Quantitative Aptitude.'
    },
    {
      step: '02',
      title: 'AI Gap Analysis',
      badge: 'Step 2: Diagnose',
      subtitle: 'Classify knowledge disconnects vs pattern slips.',
      description: 'The platform tags your mistakes into 7 precise categories (e.g. Concept Not Clear, Pattern Not Recognized, Time Pressure) so you never waste time re-studying what you already know.'
    },
    {
      step: '03',
      title: 'Personalized Flowchart Roadmap',
      badge: 'Step 3: Guide',
      subtitle: 'Sequential path from prerequisite to target mastery.',
      description: 'Day-by-day roadmap targeting your campus drive date and desired role. Connects conceptual deep-dives to progressive coding practice.'
    },
    {
      step: '04',
      title: 'Guided Learning & Socratic AI Mentor',
      badge: 'Step 4: Master',
      subtitle: 'Concept intuition, dry-runs, and progressive hints.',
      description: 'Learn through What/Why/When breakdowns, visual dry runs, and sandbox code execution with contextual hints that teach pattern recognition rather than spoiling solutions.'
    },
    {
      step: '05',
      title: 'Mistake Journal & Spaced Revision',
      badge: 'Step 5: Retain',
      subtitle: 'Spaced repetition schedule (+1, +3, +7, +14, +30 days).',
      description: 'Automatically logs failed attempts and reminds you to review cards and reassess until every critical weak area becomes a verified strength.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-900">

      {/* 1. FLOATING PILL TOP NAVBAR (Matching Reference) */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-white/85 backdrop-blur-md rounded-full border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">PathPilot</span>
              <span className="text-[10px] text-slate-400 font-medium block">Your AI Learning Coach</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <a
              href="#hero"
              className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold transition-colors"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#curriculum"
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Curriculum
            </a>
            <Link
              to="/student/roadmap"
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Roadmap
            </Link>
            <Link
              to="/student/ai-coach"
              className="px-4 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              AI Coach
            </Link>
          </nav>

          {/* Search Pill & Auth Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Search Pill */}
            <div className="hidden lg:flex items-center bg-slate-50/80 border border-slate-200/60 rounded-full px-3.5 py-1.5 text-xs text-slate-400 space-x-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search anything...</span>
            </div>

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

      {/* 2. MAJESTIC HERO SECTION (Matching Reference Image) */}
      <section id="hero" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 min-h-[92vh] flex items-center overflow-hidden">
        
        {/* Scenic Background with Mountain Sunrise, Winding Trail, Summit Flag & Seated Student */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Pastel Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe] via-[#ede9fe]/40 to-[#f8fafc]" />

          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cloudGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="sunBurst" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="25%" stopColor="#cbd5e1" />
                <stop offset="60%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="pathGlow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="cliffGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Sun Burst behind Peak */}
            <circle cx="1080" cy="220" r="320" fill="url(#sunBurst)" />

            {/* Distant Mountains */}
            <path d="M600 700 L850 320 L1080 180 L1300 360 L1600 240 L1600 900 L600 900 Z" fill="#c7d2fe" opacity="0.35" />
            <path d="M750 700 L980 340 L1080 180 L1250 380 L1500 500 L1600 450 L1600 900 L750 900 Z" fill="url(#peakGrad)" />

            {/* Summit Victory Flag on the Peak! */}
            <g transform="translate(1078, 160)">
              <line x1="0" y1="20" x2="0" y2="0" stroke="#475569" strokeWidth="2.5" />
              <polygon points="0,0 20,6 0,12" fill="#ef4444" />
            </g>

            {/* Glowing Winding Mountain Path from valley to summit */}
            <path
              d="M720 720 Q780 660 840 680 T950 560 T1020 440 T1040 320 T1080 180"
              stroke="url(#pathGlow)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="12 4"
              opacity="0.9"
            />
            {/* Soft Ambient Glow of the path */}
            <path
              d="M720 720 Q780 660 840 680 T950 560 T1020 440 T1040 320 T1080 180"
              stroke="#38bdf8"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.25"
              filter="blur(6px)"
            />

            {/* Pine Trees on Slopes */}
            <g opacity="0.6">
              {[800, 830, 860, 920, 960, 1150, 1180, 1220].map((x, idx) => (
                <polygon
                  key={idx}
                  points={`${x},${600 + (idx % 3) * 20} ${x - 12},${630 + (idx % 3) * 20} ${x + 12},${630 + (idx % 3) * 20}`}
                  fill="#1e3a5f"
                />
              ))}
            </g>

            {/* Rocky Foreground Cliff with Seated Student in Center */}
            <path
              d="M620 900 L680 740 L760 710 L840 730 L900 820 L960 900 Z"
              fill="url(#cliffGrad)"
            />

            {/* Seated Student Silhouette looking up at the glowing path */}
            <g transform="translate(735, 615) scale(1.15)">
              {/* Head */}
              <circle cx="28" cy="20" r="8" fill="#1e293b" />
              {/* Torso & Blue Hoodie */}
              <path d="M20 30 L38 30 L40 62 L18 62 Z" fill="#2563eb" />
              {/* Backpack resting beside */}
              <rect x="6" y="36" width="14" height="24" rx="6" fill="#0f172a" />
              <path d="M12 36 Q16 46 12 56" stroke="#475569" strokeWidth="2" fill="none" />
              {/* Crossed/Seated Legs */}
              <path d="M18 62 L42 62 L48 76 L14 76 Z" fill="#1e293b" />
              {/* Shoes on cliff ledge */}
              <rect x="42" y="74" width="10" height="5" rx="2" fill="#0f172a" />
            </g>

            {/* Soft Fluffy Clouds around margins */}
            <ellipse cx="200" cy="850" rx="350" ry="120" fill="url(#cloudGlow)" />
            <ellipse cx="1400" cy="860" rx="400" ry="140" fill="url(#cloudGlow)" />
            <ellipse cx="100" cy="300" rx="250" ry="80" fill="url(#cloudGlow)" opacity="0.7" />
            <ellipse cx="1500" cy="200" rx="260" ry="90" fill="url(#cloudGlow)" opacity="0.6" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-8 lg:pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* LEFT COLUMN: HERO HEADLINE & CTAS */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Tag Pill */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>AI-Powered Placement Preparation</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.12]">
                <span className="text-slate-900 block">Prepare Smarter.</span>
                <span className="text-indigo-600 block">Recognize Patterns.</span>
                <span className="text-slate-900 block">Get Placement Ready.</span>
              </h1>

              {/* Supporting Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                PathPilot evaluates your technical <strong className="text-slate-900">foundation</strong>, identifies knowledge gaps, creates a personalized learning path, and adapts your daily preparation until you are campus hiring ready.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/student/onboarding"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-300 flex items-center space-x-2 transition-all transform hover:scale-102"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsTourModalOpen(true)}
                  className="px-6 py-3.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-indigo-900 font-bold text-sm border border-slate-200/90 shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                  </div>
                  <span>Explore How It Works</span>
                </button>
              </div>

              {/* 4 Feature Badges in a Row */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'AI Powered Personalization', icon: Target },
                  { label: 'Real Assessment & Analysis', icon: CheckCircle2 },
                  { label: 'Personalized Roadmap', icon: Compass },
                  { label: 'Track Progress & Improve', icon: RotateCcw },
                ].map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xs flex items-center space-x-2 text-xs font-semibold text-slate-700"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-[11px] leading-tight">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: FLOATING CARDS & YOUR LEARNING JOURNEY */}
            <div className="lg:col-span-6 relative flex flex-col items-center lg:items-end space-y-4">

              {/* Top Floating Card: Placement Readiness */}
              <div className="w-full max-w-xs bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/90 shadow-xl flex items-center space-x-3 self-center lg:self-start lg:ml-12">
                {/* Circular Gauge */}
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeDasharray="138"
                      strokeDashoffset="44"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-900">68%</span>
                </div>

                <div className="flex-1 truncate">
                  <h3 className="text-xs font-black text-slate-900">Placement Readiness</h3>
                  <p className="text-[10px] text-slate-500 truncate">Based on latest assessment and practice activity.</p>
                </div>

                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Main Center Card: "Your Learning Journey" Timeline */}
              <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-white/90 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-black text-slate-900">Your Learning Journey</h2>
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Vertical Timeline Steps */}
                <div className="space-y-3.5 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-200" />

                  {/* Step 1: Assessment */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0 z-10">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Assessment</div>
                        <div className="text-[10px] text-slate-400">Completed • 78% accuracy</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Done</span>
                    </span>
                  </div>

                  {/* Step 2: AI Analysis */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0 z-10">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">AI Analysis</div>
                        <div className="text-[10px] text-slate-400">Identified 6 knowledge gaps</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Done</span>
                    </span>
                  </div>

                  {/* Step 3: Personalized Roadmap */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0 z-10 animate-pulse">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-indigo-900">Personalized Roadmap</div>
                        <div className="text-[10px] text-indigo-600 font-semibold">12 topics • 4 weeks</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      In Progress
                    </span>
                  </div>

                  {/* Step 4: Learning & Practice */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0 z-10">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-600">Learning & Practice</div>
                        <div className="text-[10px] text-slate-400">Build your skills</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                      Upcoming
                    </span>
                  </div>

                  {/* Step 5: Reassessment */}
                  <div className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0 z-10">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-600">Reassessment</div>
                        <div className="text-[10px] text-slate-400">Track your improvement</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>

              {/* Lower Floating Cards Row: AI Coach Card + Next Goal Card */}
              <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Floating AI Coach Pill */}
                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-lg flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your</span>
                    <span className="text-xs font-black text-slate-900 block leading-tight">AI Coach</span>
                    <span className="text-[10px] text-slate-500 block">is always here!</span>
                  </div>
                  <Link
                    to="/student/ai-coach"
                    className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-2xs hover:bg-indigo-700 transition-colors shrink-0"
                  >
                    Ask Now →
                  </Link>
                </div>

                {/* Floating Next Goal Pill */}
                <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-lg flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="flex-1 truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Goal</span>
                    <span className="text-xs font-black text-slate-900 block leading-tight truncate">Complete DSA Module</span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-indigo-600 h-full rounded-full w-2/5" />
                    </div>
                  </div>
                  <Link
                    to="/student/practice"
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-colors shrink-0"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 3. HOW IT WORKS: THE 6-STEP PREPARATION LOOP (Matching Visual Reference) */}
      <div id="how-it-works">
        <PreparationLoop />
      </div>

      {/* 4. CURRICULUM SUBJECTS (DSA, CS CORE, APTITUDE) */}
      <section id="curriculum" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest font-mono">Curriculum Focus</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The Three Pillars of Software Placements
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Complete coverage for on-campus drives, product unicorn tests, and technical screening rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Subject 1: DSA */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Data Structures & Algorithms</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Arrays, Two Pointers, Sliding Window, Trees, Graphs, and Dynamic Programming broken down by algorithmic pattern rather than isolated problems.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Recognize problem patterns in &lt;60s</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Sandbox test case verification in Monaco</span>
                  </div>
                </div>
              </div>
              <Link
                to="/student/dsa"
                className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center justify-center space-x-2"
              >
                <span>Explore DSA Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Subject 2: CS Core */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">CS Core Engineering</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  DBMS (Normalization, ACID, Indexing), Operating Systems (Processes, Semaphores, Deadlocks), Computer Networks, and Object-Oriented Principles.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Interview question defense templates</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Visual architectural diagrams & examples</span>
                  </div>
                </div>
              </div>
              <Link
                to="/student/cs-core"
                className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center justify-center space-x-2"
              >
                <span>Explore CS Core Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Subject 3: Aptitude */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Quantitative & Reasoning</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Time & Work shortcut algorithms, Percentages, Profit & Loss, Probability, and Logical Reasoning patterns tested in first-round company elimination tests.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Solve in &lt;60 seconds via mental math</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold flex items-center space-x-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>Campus screening drive frequency filters</span>
                  </div>
                </div>
              </div>
              <Link
                to="/student/aptitude"
                className="btn-secondary text-xs py-2.5 px-4 font-bold flex items-center justify-center space-x-2"
              >
                <span>Explore Aptitude Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE TOUR MODAL */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl relative text-left space-y-6">
            <button
              onClick={() => setIsTourModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                {tourSteps[tourStep].badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {tourSteps[tourStep].title}
              </h3>
            </div>

            {/* Step Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
              {tourSteps.map((st, i) => (
                <button
                  key={i}
                  onClick={() => setTourStep(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    tourStep === i
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Step {i + 1}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">{tourSteps[tourStep].subtitle}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{tourSteps[tourStep].description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                disabled={tourStep === 0}
                onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
                className="btn-secondary text-xs px-4 py-2 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {tourStep < tourSteps.length - 1 ? (
                <button
                  onClick={() => setTourStep((prev) => prev + 1)}
                  className="btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to="/student/onboarding"
                  onClick={() => setIsTourModalOpen(false)}
                  className="btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PathPilotLanding;

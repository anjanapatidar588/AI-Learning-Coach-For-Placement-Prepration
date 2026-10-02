import React from 'react';
import {
  Sparkles,
  FileText,
  Brain,
  MapPin,
  BookOpen,
  Code2,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Target,
  Infinity as InfinityIcon,
  ShieldCheck,
  Star
} from 'lucide-react';

const PreparationLoop = () => {
  const steps = [
    {
      num: '01',
      title: 'Assessment',
      desc: '15-min multi-domain diagnostic tests current knowledge.',
      icon: FileText,
      pillCol: 'bg-purple-600',
      iconCol: 'bg-purple-100 text-purple-600',
      arrowCol: 'from-purple-600 to-indigo-600',
      borderCol: 'hover:border-purple-300'
    },
    {
      num: '02',
      title: 'AI Analysis',
      desc: 'Pinpoints specific conceptual disconnects and time traps.',
      icon: Brain,
      pillCol: 'bg-blue-600',
      iconCol: 'bg-blue-100 text-blue-600',
      arrowCol: 'from-blue-600 to-teal-500',
      borderCol: 'hover:border-blue-300'
    },
    {
      num: '03',
      title: 'Roadmap',
      desc: 'Generates sequential flowchart tailored to target dates.',
      icon: MapPin,
      pillCol: 'bg-teal-500',
      iconCol: 'bg-teal-100 text-teal-600',
      arrowCol: 'from-teal-500 to-purple-600',
      borderCol: 'hover:border-teal-300'
    },
    {
      num: '04',
      title: 'Learning',
      desc: 'Concept breakdowns, visual intuition, and dry-run steps.',
      icon: BookOpen,
      pillCol: 'bg-purple-600',
      iconCol: 'bg-purple-100 text-purple-600',
      arrowCol: 'from-purple-600 to-blue-600',
      borderCol: 'hover:border-purple-300'
    },
    {
      num: '05',
      title: 'Practice',
      desc: 'Monaco coding editor with test cases & Socratic hints.',
      icon: Code2,
      pillCol: 'bg-blue-600',
      iconCol: 'bg-blue-100 text-blue-600',
      arrowCol: 'from-blue-600 to-indigo-600',
      borderCol: 'hover:border-blue-300'
    },
    {
      num: '06',
      title: 'Reassessment',
      desc: 'Spaced repetition testing to verify permanent retention.',
      icon: RotateCcw,
      pillCol: 'bg-indigo-600',
      iconCol: 'bg-indigo-100 text-indigo-600',
      arrowCol: 'from-indigo-600 to-purple-600',
      borderCol: 'hover:border-indigo-300'
    }
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#e0e7ff]/30 via-white to-[#ede9fe]/30 overflow-hidden select-none">
      
      {/* Background Mountain Peak with Summit Flag (Top-Left) & Glowing Orb */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-40">
        <svg viewBox="0 0 300 300" fill="none">
          <path d="M0 300 L90 140 L140 180 L210 70 L300 240 L300 300 Z" fill="#c7d2fe" />
          <path d="M60 300 L140 160 L210 70 L250 140 L300 300 Z" fill="#a5b4fc" />
          {/* Flag on Peak */}
          <line x1="210" y1="70" x2="210" y2="45" stroke="#475569" strokeWidth="2.5" />
          <polygon points="210,45 228,52 210,59" fill="#f43f5e" />
        </svg>
      </div>

      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[300px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>THE PREPARATION LOOP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            From Gap Discovery to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700">
              Placement Readiness
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A continuous, scientific preparation feedback loop engineered to convert technical interview friction into mastery.
          </p>
        </div>

        {/* Outer Loop Canvas with Satellite Badges & Continuous Flow Cards */}
        <div className="relative pt-6 pb-12">

          {/* TOP SATELLITES ROW */}
          <div className="flex justify-between items-center max-w-6xl mx-auto px-4 mb-6">
            {/* Top Left Satellite: Knowledge Gaps */}
            <div className="relative group">
              <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Knowledge Gaps</span>
                  <span className="text-[10px] text-slate-400 block">Identify what to improve</span>
                </div>
              </div>
              {/* Curved dotted line pointing down */}
              <svg className="hidden md:block absolute -bottom-6 left-12 w-12 h-6 text-purple-300" viewBox="0 0 50 30" fill="none">
                <path d="M10 0 C 10 20, 40 10, 40 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Top Right Satellite: Personalized Path */}
            <div className="relative group">
              <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-teal-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Personalized Path</span>
                  <span className="text-[10px] text-slate-400 block">Built for your goals</span>
                </div>
              </div>
              {/* Curved dotted line pointing down */}
              <svg className="hidden md:block absolute -bottom-6 right-12 w-12 h-6 text-teal-300" viewBox="0 0 50 30" fill="none">
                <path d="M40 0 C 40 20, 10 10, 10 30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>

          {/* MAIN 6-STEP CONNECTED HORIZONTAL FLOW */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-2">
            {steps.map((step, idx) => {
              const Icon = step.icon;

              return (
                <div key={idx} className="relative flex items-center">
                  {/* Card Container */}
                  <div
                    className={`w-full bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg ${step.borderCol} transition-all duration-200 flex flex-col justify-between text-left space-y-4 min-h-[220px] relative z-10 group`}
                  >
                    {/* Top Row: Number Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono text-white ${step.pillCol} shadow-xs`}>
                        {step.num}
                      </span>
                    </div>

                    {/* Step Icon */}
                    <div className={`w-11 h-11 rounded-2xl ${step.iconCol} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Interlocking Arrow Badge Connector between consecutive cards */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3.5 z-20 w-7 h-7 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white items-center justify-center shadow-md shadow-indigo-200">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM SATELLITES & ADAPTIVE FEEDBACK LOOP */}
          <div className="mt-10 relative">

            {/* Curving Dotted Loop-back Path from Reassessment back to Assessment */}
            <div className="hidden lg:block absolute inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-full h-16 text-indigo-300" viewBox="0 0 1000 60" fill="none">
                <path
                  d="M950 10 C 950 50, 500 50, 500 50 C 500 50, 50 50, 50 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* Arrowhead pointing back to Step 01 */}
                <polygon points="45,15 50,5 55,15" fill="currentColor" />
              </svg>
            </div>

            {/* Bottom Satellites Grid */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto px-4">
              
              {/* Pattern Recognition (Bottom Left) */}
              <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Pattern Recognition</span>
                  <span className="text-[10px] text-slate-400 block">Spot. Learn. Apply.</span>
                </div>
              </div>

              {/* Adaptive Roadmap (Center Loop Node) */}
              <div className="flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-indigo-200 shadow-md hover:border-indigo-400 transition-all scale-105">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <InfinityIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-950 block">Adaptive Roadmap</span>
                  <span className="text-[10px] text-indigo-600 font-semibold block">Learns. Adapts. Improves.</span>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Progress Tracking</span>
                  <span className="text-[10px] text-slate-400 block">Measure your growth</span>
                </div>
              </div>

              {/* Confidence Check (Bottom Right) */}
              <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Confidence Check</span>
                  <span className="text-[10px] text-slate-400 block">Build real confidence</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PreparationLoop;

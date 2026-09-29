import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { Calculator, Play, CheckCircle2, Menu, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { subjectsData } from '../../services/pathpilotData';

const AptitudePage = () => {
  const { topic } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const aptModule = subjectsData.find((s) => s.id === 'aptitude');
  const activeTopic = aptModule.topics.find((t) => t.id === topic) || aptModule.topics[0];

  const sampleQuestion = {
    id: "q1",
    question: "If a candidate scores 40% marks and fails by 20 marks, while another candidate scores 60% marks and gets 30 marks more than the passing marks, what is the maximum marks of the examination?",
    options: [
      { id: "A", text: "250 marks" },
      { id: "B", text: "200 marks" },
      { id: "C", text: "300 marks" },
      { id: "D", text: "150 marks" }
    ],
    correctAnswer: "A",
    shortcutMethod: "Difference in % = (60% - 40%) = 20%. Difference in total marks needed = (20 + 30) = 50 marks. So 20% = 50 marks, hence 100% = (50 * 5) = 250 marks.",
    conceptExplanation: "When comparing two percentage scores with pass/fail offsets, calculate the percentage difference between the two candidates and set it equal to the sum of the failing shortfall and passing excess."
  };

  const handleSelectOption = (optId) => {
    if (submitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Quantitative Aptitude</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          {/* Header */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-purple-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Calculator className="w-3.5 h-3.5 text-purple-400" />
                <span>Speed Math & Logical Reasoning</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Quantitative Aptitude</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Learn formulas, mental shortcuts, and solve timed hiring assessment questions.
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl glass-panel-dark border-purple-500/30 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block">Aptitude Progress</span>
              <span className="text-lg font-bold text-purple-400">{aptModule.progress}% Completed</span>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aptModule.topics.map((t) => (
              <Link
                key={t.id}
                to={`/aptitude/${t.id}`}
                className={`p-4 rounded-xl glass-card-dark text-left space-y-2 border transition-all ${
                  t.id === activeTopic.id
                    ? 'border-purple-500/60 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{t.name}</h4>
                  <span className="text-[10px] font-mono text-purple-300">{t.progress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${t.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Active Aptitude Question Simulation */}
          <div className="glass-panel-dark p-6 sm:p-8 space-y-6 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                {activeTopic.name} Practice Session
              </span>
              <span className="text-xs font-mono text-slate-400">Question 1 of 10</span>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {sampleQuestion.question}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === sampleQuestion.correctAnswer;

                let btnStyle = "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200";
                if (submitted) {
                  if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-500/80 text-emerald-200 font-bold";
                  else if (isSelected) btnStyle = "bg-rose-950/80 border-rose-500/80 text-rose-200";
                } else if (isSelected) {
                  btnStyle = "bg-purple-950/80 border-purple-500 text-purple-200 font-bold";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-xl text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span><strong className="mr-2">{opt.id}.</strong> {opt.text}</span>
                    {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="btn-pathpilot-primary text-xs py-2.5 px-6 disabled:opacity-40 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              /* Concept Breakdown Card after answer */
              <div className="glass-panel-glow p-5 space-y-3 border-cyan-500/30 bg-slate-950 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Concept & Mental Shortcut Explanation</span>
                </div>
                <p className="text-slate-300 leading-relaxed"><strong className="text-white">Shortcut Method:</strong> {sampleQuestion.shortcutMethod}</p>
                <p className="text-slate-400 leading-relaxed"><strong className="text-slate-300">Underlying Principle:</strong> {sampleQuestion.conceptExplanation}</p>
                
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setSubmitted(false); setSelectedOption(null); }}
                    className="btn-pathpilot-secondary text-xs py-2 px-4 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Try Similar Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
};

export default AptitudePage;

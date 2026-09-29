import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { RotateCcw, BookOpen, AlertTriangle, CheckCircle2, Menu, Sparkles, RefreshCw } from 'lucide-react';
import { revisionHubData, mistakeJournalData } from '../../services/pathpilotData';

const RevisionPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [flippedCard, setFlippedCard] = useState(null);

  const flashcards = [
    { id: 1, topic: "DBMS", question: "What is BCNF vs 3NF?", answer: "BCNF requires every determinant to be a super key. In 3NF, the dependent attribute can be a prime attribute." },
    { id: 2, topic: "DSA", question: "When to use Two Pointers?", answer: "When searching pairs or subarrays in a sorted array or palindrome checks in linear O(N) time." },
    { id: 3, topic: "OS", question: "Difference between Mutex and Semaphore?", answer: "Mutex is a locking mechanism (owned by one thread); Semaphore is a signaling mechanism (counter)." }
  ];

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Revision Hub</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          {/* Header */}
          <div className="glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personal Study Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Revision Hub</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Spaced-repetition cards, mistake journal items, and saved concept notes.
              </p>
            </div>
          </div>

          {/* Flashcards Deck Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Interactive Flashcards</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flashcards.map((card) => {
                const isFlipped = flippedCard === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => setFlippedCard(isFlipped ? null : card.id)}
                    className="h-48 glass-panel-glow p-6 border-cyan-500/30 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">{card.topic}</span>
                      <span className="text-[10px] text-slate-500">Click to flip</span>
                    </div>

                    <div className="my-auto text-center space-y-2">
                      <p className="text-xs font-bold text-white">
                        {isFlipped ? card.answer : card.question}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-center text-slate-500">
                      {isFlipped ? "Showing Answer" : "Showing Question"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mistake Journal Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Mistake Journal Log</h3>
            <div className="space-y-3">
              {mistakeJournalData.map((m) => (
                <div key={m.id} className="glass-panel-dark p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">{m.category}</span>
                      <span className="text-xs font-bold text-white">{m.topic}</span>
                    </div>
                    <p className="text-xs text-slate-400">{m.learningNote}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded shrink-0 ${m.resolved ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                    {m.resolved ? '✓ Resolved' : '⏳ Review Needed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default RevisionPage;

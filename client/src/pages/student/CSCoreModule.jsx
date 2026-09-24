import React, { useState } from 'react';
import API from '../../services/api';
import {
  BookOpen,
  Database,
  Cpu,
  Wifi,
  Box,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function CSCoreModule() {
  const [selectedSubject, setSelectedSubject] = useState('dbms');
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const subjects = [
    { id: 'dbms', name: 'DBMS & SQL', icon: Database, color: 'text-blue-400', mastery: 65 },
    { id: 'os', name: 'Operating Systems', icon: Cpu, color: 'text-purple-400', mastery: 50 },
    { id: 'cn', name: 'Computer Networks', icon: Wifi, color: 'text-emerald-400', mastery: 55 },
    { id: 'oops', name: 'OOPs & Design Patterns', icon: Box, color: 'text-amber-400', mastery: 70 }
  ];

  const handleFetchAIExplanation = async (conceptTitle) => {
    setLoadingAi(true);
    try {
      const res = await API.post('/cs-core/ai-explain', { conceptTitle });
      setAiExplanation(res.data.explanation);
    } catch (err) {
      setAiExplanation(`### 💻 CS Core Mentor: ${conceptTitle}

**Core Concept Breakdown:**
- **ACID Properties** ensure database transaction reliability.
- **B+ Tree Indexing** minimizes disk I/O operations by storing data pointers strictly at the leaf nodes.
- **Concurrency Control** uses 2-Phase Locking (2PL) to guarantee serializability.

**Real-world Analogy:**
Think of a Banking ATM withdrawal transaction. Either both the account debit and cash output succeed together, or the entire transaction rolls back cleanly!`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CS Core Subject Module</h1>
            <p className="text-xs text-slate-400">Master fundamental engineering theory required for technical interviews (DBMS, OS, CN, OOPs).</p>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {subjects.map(s => {
          const Icon = s.icon;
          const isSelected = selectedSubject === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`glass-panel glass-panel-hover p-4 rounded-2xl border cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-purple-500/40 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-purple-400">{s.mastery}% Mastery</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{s.name}</h3>
            </div>
          );
        })}
      </div>

      {/* Subject Detail & Concept Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">Core Subject Notes & Flashcards</h2>
            <button
              onClick={() => handleFetchAIExplanation(selectedSubject === 'dbms' ? 'Database Transactions & ACID' : 'Process Deadlocks & Semaphores')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI CS Core Mentor</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs leading-relaxed text-slate-300">
            <h3 className="font-bold text-purple-300 font-sans text-sm">1. Database Transactions & ACID Guarantees</h3>
            <p>
              A transaction is a logical unit of work. The DBMS enforces **Atomicity** (All or Nothing), **Consistency** (Valid State Rules), **Isolation** (Independent Concurrent Execution), and **Durability** (Committed updates persist permanently).
            </p>

            <h3 className="font-bold text-purple-300 font-sans text-sm mt-4">2. B+ Tree Indexing vs Hash Indexing</h3>
            <p>
              Hash Indexing offers **O(1)** exact key lookup but does NOT support range queries. B+ Trees support both **O(log N)** point lookups and fast sequential range scans due to leaf-level doubly linked lists.
            </p>
          </div>
        </div>

        {/* AI CS Core Explanation Drawer */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-gradient-to-b from-slate-900 to-purple-950/20">
          <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI Concept Explanation</span>
          </div>
          <p className="text-xs text-slate-400">
            Click on any topic above to generate real-world engineering analogies and interview flashcards.
          </p>
          {aiExplanation ? (
            <div className="whitespace-pre-line text-xs text-slate-200 font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              {aiExplanation}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-8">
              Select a concept to ask your CS Core Mentor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

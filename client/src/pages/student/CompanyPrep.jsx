import React, { useState } from 'react';
import { Building2, CheckCircle2, ArrowRight, Layers, FileCode } from 'lucide-react';

export default function CompanyPrep() {
  const [selectedCompany, setSelectedCompany] = useState('Google');

  const companies = [
    {
      name: 'Google',
      category: 'Product-based',
      benchmark: 85,
      description: 'Focuses heavily on algorithmic optimization, graphs, tree traversals, and dynamic programming.',
      rounds: [
        { title: 'Round 1: OA', desc: '2 Hard Coding Questions on Graphs / DP' },
        { title: 'Round 2: Technical Interview 1', desc: 'Data structures, algorithm complexity' },
        { title: 'Round 3: Technical Interview 2', desc: 'System design, scalability, database indexing' }
      ]
    },
    {
      name: 'Amazon',
      category: 'Product-based',
      benchmark: 80,
      description: 'Focuses on Leadership Principles, arrays, trees, and object-oriented design patterns.',
      rounds: [
        { title: 'Round 1: OA Simulation', desc: '2 Coding questions + Work style survey' },
        { title: 'Round 2: Technical Interview', desc: 'Tree traversals + Leadership STAR questions' }
      ]
    },
    {
      name: 'TCS (Digital / Ninja)',
      category: 'Service-based',
      benchmark: 70,
      description: 'Evaluates Quantitative Aptitude, Logical Reasoning, DBMS/OS fundamentals, and coding.',
      rounds: [
        { title: 'Round 1: TCS NQT', desc: 'Aptitude + CS Core + 2 Coding Problems' },
        { title: 'Round 2: Technical & HR', desc: 'DBMS SQL queries, OOPs concepts, project review' }
      ]
    }
  ];

  const currentComp = companies.find(c => c.name === selectedCompany) || companies[0];

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Company Preparation Track</h1>
            <p className="text-xs text-slate-400">Target company hiring patterns, benchmark cutoffs, and tagged questions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.map(c => (
          <div
            key={c.name}
            onClick={() => setSelectedCompany(c.name)}
            className={`glass-panel glass-panel-hover p-4 rounded-2xl border cursor-pointer space-y-3 ${
              selectedCompany === c.name ? 'border-blue-500/40 bg-blue-950/20 shadow-lg shadow-blue-500/10' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">{c.name}</h3>
              <span className="text-xs font-semibold text-emerald-400">Benchmark: {c.benchmark}%</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-400" />
          <span>{currentComp.name} Hiring Round Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentComp.rounds.map((r, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-blue-400">{r.title}</div>
              <div className="text-xs text-slate-300">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

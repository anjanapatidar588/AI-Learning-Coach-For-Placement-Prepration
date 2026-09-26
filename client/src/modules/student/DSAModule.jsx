import React from 'react';
import { Code2, ChevronRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const topics = [
  { name: 'Arrays & Strings', status: 'Completed', problems: '24/24', level: 'Easy' },
  { name: 'Two Pointers & Sliding Window', status: 'Completed', problems: '18/18', level: 'Medium' },
  { name: 'Binary Search & Searching', status: 'In Progress', problems: '12/20', level: 'Medium' },
  { name: 'Linked List & Fast/Slow Pointer', status: 'Pending', problems: '0/15', level: 'Medium' },
  { name: 'Trees & Binary Search Trees', status: 'Pending', problems: '0/30', level: 'Hard' },
  { name: 'Dynamic Programming', status: 'Needs Revision', problems: '8/35', level: 'Hard' }
];

const DSAModule = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <Code2 className="w-7 h-7 text-indigo-400" />
            <span>Data Structures & Algorithms</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Syllabus breakdown with AI hint assistance and Monaco code execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-indigo-500/30 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                  t.level === 'Easy' ? 'badge-easy' :
                  t.level === 'Medium' ? 'badge-medium' :
                  'badge-hard'
                }`}>{t.level}</span>
                <span className="text-xs text-slate-400 font-mono">{t.problems} Solved</span>
              </div>
              <h3 className="font-semibold text-base text-white">{t.name}</h3>
            </div>
            <Link to="/student/practice" className="btn-primary text-xs px-3.5 py-2 shrink-0">
              <PlayCircle className="w-4 h-4" />
              <span>Practice</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DSAModule;


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
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Code2 className="w-7 h-7 text-indigo-400" />
            <span>Data Structures & Algorithms</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Syllabus breakdown with AI hint assistance and Monaco code execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-gray-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                  t.level === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' :
                  t.level === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-500/20' :
                  'bg-rose-950 text-rose-400 border border-rose-500/20'
                }`}>{t.level}</span>
                <span className="text-xs text-gray-400">{t.problems} Solved</span>
              </div>
              <h3 className="font-bold text-base text-white">{t.name}</h3>
            </div>
            <Link to="/student/practice" className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center space-x-1.5">
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

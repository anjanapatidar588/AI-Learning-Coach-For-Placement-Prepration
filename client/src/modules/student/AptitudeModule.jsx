import React from 'react';
import { BrainCircuit, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AptitudeModule = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <BrainCircuit className="w-7 h-7 text-violet-400" />
        <span>Quantitative Aptitude & Logical Reasoning</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Practice speed shortcuts, mental math formulas, and logical reasoning problem sets curated for placement screening exams.</p>
      </div>
    </div>
  );
};

export default AptitudeModule;

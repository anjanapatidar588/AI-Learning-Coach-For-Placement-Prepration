import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

const MockInterview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Mic className="w-7 h-7 text-amber-400" />
        <span>AI Placement Mock Interview Simulator</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Simulate live technical & HR interview rounds with the AI Interview Coach. Receive detailed evaluation reports on technical accuracy and communication clarity.</p>
      </div>
    </div>
  );
};

export default MockInterview;

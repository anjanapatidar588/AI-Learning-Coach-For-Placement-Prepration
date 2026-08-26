import React from 'react';
import { Sliders } from 'lucide-react';

const AIConfiguration = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Sliders className="w-7 h-7 text-rose-400" />
        <span>AI Model & System Prompt Configuration</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Configure backend Gemini AI parameters (model tier, temperature, token limits) and edit persona prompts for DSA, Aptitude, CS Core, Interview, and Career Coaches.</p>
      </div>
    </div>
  );
};

export default AIConfiguration;

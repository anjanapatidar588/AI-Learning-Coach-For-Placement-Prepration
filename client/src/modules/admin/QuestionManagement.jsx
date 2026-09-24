import React from 'react';
import { HelpCircle } from 'lucide-react';

const QuestionManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <HelpCircle className="w-7 h-7 text-emerald-400" />
        <span>Question Bank CRUD Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Create, edit, and delete questions across DSA, Aptitude, and CS Core modules with test cases and solution code.</p>
      </div>
    </div>
  );
};

export default QuestionManagement;

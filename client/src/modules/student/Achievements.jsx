import React from 'react';
import { Award } from 'lucide-react';

const Achievements = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Award className="w-7 h-7 text-amber-400" />
        <span>Achievements & Placement Badges</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">Gamified learning milestones, streak tracking, accuracy badges, and mock interview completion certificates.</p>
      </div>
    </div>
  );
};

export default Achievements;

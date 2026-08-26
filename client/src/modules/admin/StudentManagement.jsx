import React from 'react';
import { Users } from 'lucide-react';

const StudentManagement = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <Users className="w-7 h-7 text-indigo-400" />
        <span>Student Directory & Management</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800">
        <p className="text-gray-300 text-sm">View student profiles, performance records, attempt histories, and account statuses.</p>
      </div>
    </div>
  );
};

export default StudentManagement;

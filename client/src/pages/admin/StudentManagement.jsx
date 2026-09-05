import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, Search, Shield, Eye } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setStudents([
        { id: 'u-1', name: 'Alex Johnson', email: 'alex@example.com', targetRole: 'SDE-1', targetCompanies: ['Google', 'Amazon'], readiness: 74, solvedProblems: 32, status: 'Active' },
        { id: 'u-2', name: 'Priya Sharma', email: 'priya@example.com', targetRole: 'Frontend Engineer', targetCompanies: ['Meta', 'Uber'], readiness: 82, solvedProblems: 48, status: 'Active' },
        { id: 'u-3', name: 'Rahul Verma', email: 'rahul@example.com', targetRole: 'Backend Developer', targetCompanies: ['TCS', 'Infosys'], readiness: 65, solvedProblems: 19, status: 'Active' }
      ]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Student Management</h1>
            <p className="text-xs text-slate-400">View enrolled students, track placement index, and monitor progress.</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Target Companies</th>
                <th className="py-3 px-4">Readiness Index</th>
                <th className="py-3 px-4">Solved Problems</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{s.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.targetRole}</td>
                  <td className="py-3.5 px-4 text-blue-400 font-medium">{s.targetCompanies?.join(', ')}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{s.readiness}%</td>
                  <td className="py-3.5 px-4">{s.solvedProblems}</td>
                  <td className="py-3.5 px-4">
                    <button className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

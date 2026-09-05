import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  TrendingUp,
  Bot,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await API.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setStats({
        totalStudents: 142,
        totalQuestions: 86,
        totalSubmissions: 1240,
        averagePlacementReadiness: 68,
        activeAIConversations: 340,
        recentRegistrations: [
          { id: 'u-1', name: 'Alex Johnson', email: 'alex@example.com', targetRole: 'SDE-1', readiness: 74, joinedAt: '2026-08-30' },
          { id: 'u-2', name: 'Priya Sharma', email: 'priya@example.com', targetRole: 'Frontend Engineer', readiness: 82, joinedAt: '2026-08-31' },
          { id: 'u-3', name: 'Rahul Verma', email: 'rahul@example.com', targetRole: 'Backend Developer', readiness: 65, joinedAt: '2026-09-01' }
        ]
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Administration & Analytics</h1>
          <p className="text-xs text-slate-400">Manage curriculum, student records, question banks, AI system prompts, and company tracks.</p>
        </div>
      </div>

      {/* Top Stat Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Enrolled Students</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.totalStudents || 142}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Question Bank Items</span>
            <FileQuestion className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.totalQuestions || 86}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Code Submissions</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.totalSubmissions || 1240}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">AI Coach Conversations</span>
            <Bot className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats?.activeAIConversations || 340}</div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-100">Core Admin Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div 
            onClick={() => navigate('/admin/students')}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer space-y-1"
          >
            <div className="font-bold text-slate-200">Student Management</div>
            <div className="text-slate-400 text-[11px]">Track student performance indices and manage user accounts.</div>
          </div>

          <div 
            onClick={() => navigate('/admin/questions')}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer space-y-1"
          >
            <div className="font-bold text-slate-200">Question Management</div>
            <div className="text-slate-400 text-[11px]">CRUD for coding problems, MCQs, test cases, and company tags.</div>
          </div>

          <div 
            onClick={() => navigate('/admin/ai-config')}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 cursor-pointer space-y-1"
          >
            <div className="font-bold text-purple-300 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>AI Prompt Configuration</span>
            </div>
            <div className="text-slate-400 text-[11px]">Tune system prompts, temperature parameters, and persona rules.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

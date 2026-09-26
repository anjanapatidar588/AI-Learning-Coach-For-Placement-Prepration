import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Code2,
  BrainCircuit,
  BookOpen,
  Target,
  Mic,
  Building2,
  FileCheck,
  LineChart,
  AlertTriangle,
  Award,
  Settings,
  Users,
  FileQuestion,
  Layers,
  Sparkles,
  Sliders,
  BarChart3,
  FolderKanban
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const studentNavItems = [
    { label: 'Student Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My AI Coach', path: '/ai-coach', icon: Bot, highlight: true },
    { label: 'DSA Module', path: '/dsa', icon: Code2 },
    { label: 'Aptitude Module', path: '/aptitude', icon: BrainCircuit },
    { label: 'CS Core Module', path: '/cs-core', icon: BookOpen },
    { label: 'Practice Zone', path: '/practice', icon: Target },
    { label: 'Mock Interview', path: '/mock-interview', icon: Mic },
    { label: 'Company Preparation', path: '/company-prep', icon: Building2 },
    { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileCheck },
    { label: 'My Progress', path: '/my-progress', icon: LineChart },
    { label: 'Weak Areas', path: '/weak-areas', icon: AlertTriangle },
    { label: 'Achievements', path: '/achievements', icon: Award },
    { label: 'Profile / Settings', path: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Student Management', path: '/admin/students', icon: Users },
    { label: 'Question Management', path: '/admin/questions', icon: FileQuestion },
    { label: 'DSA Topic Management', path: '/admin/dsa-topics', icon: Layers },
    { label: 'Aptitude Topic Management', path: '/admin/aptitude-topics', icon: BrainCircuit },
    { label: 'CS Core Content', path: '/admin/cs-core-content', icon: BookOpen },
    { label: 'Company Management', path: '/admin/companies', icon: Building2 },
    { label: 'Resource Management', path: '/admin/resources', icon: FolderKanban },
    { label: 'AI Configuration', path: '/admin/ai-config', icon: Sliders },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/60 bg-[#0b0f19] flex flex-col justify-between py-4 px-3 min-h-[calc(100vh-57px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          {isAdmin ? 'ADMINISTRATION' : 'LEARNING HUB'}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : item.highlight
                      ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.highlight ? 'text-indigo-400' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 glass-card rounded-xl border border-slate-800/60 mt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Placement Readiness</span>
        </div>
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden my-2">
          <div className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full w-[74%] rounded-full"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Current Index</span>
          <span className="font-bold text-emerald-400">74% Target</span>
        </div>
      </div>
    </aside>
  );
}


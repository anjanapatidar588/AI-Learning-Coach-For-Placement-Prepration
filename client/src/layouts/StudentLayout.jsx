import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bot,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  Terminal,
  Mic,
  Building2,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Award,
  UserCog,
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My AI Coach', path: '/student/ai-coach', icon: Bot, highlight: true },
    { label: 'DSA Module', path: '/student/dsa', icon: Code2 },
    { label: 'Aptitude Module', path: '/student/aptitude', icon: BrainCircuit },
    { label: 'CS Core Module', path: '/student/cs-core', icon: BookOpenCheck },
    { label: 'Practice Zone', path: '/student/practice', icon: Terminal },
    { label: 'Mock Interview', path: '/student/mock-interview', icon: Mic },
    { label: 'Company Prep', path: '/student/company-prep', icon: Building2 },
    { label: 'Resume Analyzer', path: '/student/resume-analyzer', icon: FileCheck },
    { label: 'My Progress', path: '/student/progress', icon: TrendingUp },
    { label: 'Weak Areas', path: '/student/weak-areas', icon: AlertTriangle },
    { label: 'Achievements', path: '/student/achievements', icon: Award },
    { label: 'Profile Settings', path: '/student/profile', icon: UserCog },
  ];

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-gray-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide text-white">Placement AI</h1>
                <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">Student Portal</span>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20'
                        : item.highlight
                        ? 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 border border-indigo-500/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-900/80 border border-indigo-500/40 flex items-center justify-center text-indigo-200 font-bold text-xs">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || 'student@platform.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
          <div className="flex items-center space-x-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-medium text-gray-300">Welcome back, <span className="text-white font-semibold">{user?.name || 'Student'}</span></h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>AI Engine Connected</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0b0f19]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

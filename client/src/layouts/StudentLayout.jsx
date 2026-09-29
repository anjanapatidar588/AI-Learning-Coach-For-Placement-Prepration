import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Bot,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  Terminal,
  Mic,
  Building2,
  FileCheck,
  TrendingUp,
  Award,
  UserCog,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookX,
  RotateCcw,
  BarChart3,
  Compass,
  Brain
} from 'lucide-react';

const StudentLayout = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If taking an assessment, provide full-width dedicated workspace without distracting sidebar/headers
  if (location.pathname.startsWith('/student/assessments/take')) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Outlet />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isOnboardingIncomplete = !profile?.onboardingCompleted;
  const isAssessmentPending = profile?.onboardingCompleted && !profile?.baselineAssessmentCompleted;

  const navGroups = [
    {
      title: 'LEARN',
      items: [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Learning Map', path: '/student/roadmap', icon: MapPin },
        { label: 'DSA', path: '/student/dsa', icon: Code2 },
        { label: 'Aptitude', path: '/student/aptitude', icon: BrainCircuit },
        { label: 'CS Core', path: '/student/cs-core', icon: BookOpenCheck },
      ]
    },
    {
      title: 'PRACTICE',
      items: [
        { label: 'Practice', path: '/student/practice', icon: Terminal },
        { label: 'Mistake Journal', path: '/student/mistakes', icon: BookX },
        { label: 'Revision Center', path: '/student/revision', icon: RotateCcw, highlight: true },
      ]
    },
    {
      title: 'PROGRESS & EVALUATION',
      items: [
        { label: 'Roadmap', path: '/student/roadmap', icon: TrendingUp },
        { label: 'Assessments', path: '/student/assessment', icon: FileCheck, highlight: true },
        { label: 'Progress', path: '/student/progress', icon: BarChart3 },
        { label: 'Diagnostic Test', path: '/student/baseline-assessment', icon: Brain },
      ]
    },
    {
      title: 'AI',
      items: [
        { label: 'AI Coach', path: '/student/ai-coach', icon: Bot, highlight: true },
      ]
    },
    {
      title: 'PREPARATION',
      items: [
        { label: 'Mock Interview', path: '/student/mock-interview', icon: Mic },
        { label: 'Company Prep', path: '/student/company-prep', icon: Building2 },
        { label: 'Resume Analyzer', path: '/student/resume-analyzer', icon: FileCheck },
        { label: 'Achievements', path: '/student/achievements', icon: Award },
        { label: 'Profile Settings', path: '/student/profile', icon: UserCog },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between shadow-sm`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900">Placement AI</h1>
                <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  Student Portal
                </span>
              </div>
            </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onboarding Flow Indicator Banner if incomplete */}
          {isOnboardingIncomplete && (
            <div className="mx-3.5 mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Step 1: Onboarding</span>
              </div>
              <p className="text-[11px] text-indigo-700">Complete your profile to personalize prep.</p>
              <NavLink
                to="/student/onboarding"
                className="inline-block mt-1 text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Continue Onboarding →
              </NavLink>
            </div>
          )}

          {isAssessmentPending && (
            <div className="mx-3.5 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                <Brain className="w-3.5 h-3.5 text-amber-600" />
                <span>Step 2: Initial Assessment</span>
              </div>
              <p className="text-[11px] text-amber-700">Required to unlock personalized dashboard & roadmap.</p>
              <NavLink
                to="/student/assessment-ready"
                className="inline-block mt-1 text-[11px] font-bold text-amber-800 hover:underline"
              >
                Start Assessment →
              </NavLink>
            </div>
          )}

          {/* Navigation Group Links */}
          <nav className="p-3.5 space-y-4 overflow-y-auto flex-1">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase font-mono mb-1">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path + item.label}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold'
                            : item.highlight
                            ? 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-100'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Identity & Logout Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'student@platform.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-30 shadow-xs">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xs lg:text-sm font-medium text-slate-600">
              Welcome back, <span className="text-slate-900 font-bold">{user?.name || 'Student'}</span> 👋
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Engine Active</span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

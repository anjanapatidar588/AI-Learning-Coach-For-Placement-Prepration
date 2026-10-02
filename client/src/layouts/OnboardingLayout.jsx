import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut } from 'lucide-react';

const OnboardingLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentName = user?.name || 'Student';
  const initial = studentName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Header Header */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between z-30 sticky top-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900">PathPilot</h1>
            <p className="text-[10px] text-slate-400 font-medium">Onboarding Workspace</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={studentName}
                className="w-8 h-8 rounded-full object-cover border border-indigo-200 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initial}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              {studentName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-6">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-slate-200/60 bg-white/60 text-center text-xs text-slate-400">
        PathPilot AI Placement Coach • Personalization & Assessment Setup
      </footer>
    </div>
  );
};

export default OnboardingLayout;

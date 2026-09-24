import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Shield, LogOut, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    const nextRole = user?.role === 'admin' ? 'student' : 'admin';
    switchRole(nextRole);
    if (nextRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20">
          <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight gradient-text">AI Placement Coach</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">v1.0 Pro</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 w-80 text-sm text-slate-400">
        <Search className="h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search DSA problems, concepts, companies..."
          className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full text-xs"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Role Switcher Button for instant testing */}
        <button
          onClick={handleRoleToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer shadow-sm"
          title="Toggle view between Student and Admin"
        >
          {user?.role === 'admin' ? (
            <>
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Switch to Student View</span>
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5 text-purple-400" />
              <span>Switch to Admin Panel</span>
            </>
          )}
        </button>

        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
            <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
              {user?.role} Account
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

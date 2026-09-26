import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Shield, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    const nextRole = user?.role === 'admin' ? 'student' : 'admin';
    switchRole(nextRole);
    if (nextRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20">
          <div className="h-full w-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <span className="font-bold text-base tracking-tight gradient-text">Placement AI</span>
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">PRO</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3.5 py-1.5 w-80 text-xs text-slate-300">
        <Search className="h-4 w-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="Search DSA problems, concepts, companies..."
          className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full text-xs"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Role Switcher Button for instant testing */}
        <button
          onClick={handleRoleToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer shadow-sm"
          title="Toggle view between Student and Admin"
        >
          {user?.role === 'admin' ? (
            <>
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Student View</span>
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              <span>Admin Panel</span>
            </>
          )}
        </button>

        <button 
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-xl transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800/80">
          <div className="h-8 w-8 rounded-full bg-indigo-900/80 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-200">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white">{user?.name}</div>
            <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1 font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${user?.role === 'admin' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


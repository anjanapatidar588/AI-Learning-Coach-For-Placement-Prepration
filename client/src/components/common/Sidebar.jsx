import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PathPilotLogo from './PathPilotLogo';
import {
  LayoutDashboard,
  Map,
  Code2,
  Calculator,
  Cpu,
  Terminal,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Bot,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Roadmap', path: '/roadmap', icon: Map },
    { name: 'DSA', path: '/dsa', icon: Code2 },
    { name: 'Aptitude', path: '/aptitude', icon: Calculator },
    { name: 'Core CS', path: '/core', icon: Cpu },
    { name: 'Practice', path: '/practice', icon: Terminal },
    { name: 'Revision', path: '/revision', icon: RotateCcw },
    { name: 'Saved Notes', path: '/notes', icon: BookOpen },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Mock Interview', path: '/mock-interview', icon: Bot },
    { name: 'Resume Coach', path: '/resume', icon: FileText }
  ];

  const bottomNavItems = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    localStorage.removeItem('pathpilot_user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 p-5 space-y-6">
      {/* Brand Header */}
      <div className="pb-4 border-b border-slate-800/60">
        <PathPilotLogo />
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono px-3 mb-2 block">
          Preparation Command Center
        </span>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/15 to-purple-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile & Settings */}
      <div className="pt-4 border-t border-slate-800/60 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  HelpCircle,
  FolderKanban,
  Calculator,
  BookOpen,
  Building,
  Library,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: ShieldAlert },
    { label: 'Student Management', path: '/admin/students', icon: Users },
    { label: 'Question Management', path: '/admin/questions', icon: HelpCircle },
    { label: 'DSA Topic Mgmt', path: '/admin/dsa-topics', icon: FolderKanban },
    { label: 'Aptitude Topic Mgmt', path: '/admin/aptitude-topics', icon: Calculator },
    { label: 'CS Core Content Mgmt', path: '/admin/cs-core-content', icon: BookOpen },
    { label: 'Company Management', path: '/admin/companies', icon: Building },
    { label: 'Resource Management', path: '/admin/resources', icon: Library },
    { label: 'AI Configuration', path: '/admin/ai-config', icon: Sliders },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[#090d16] text-gray-100 overflow-hidden">
      {/* Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-rose-900/30 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-rose-900/30">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-wide text-white">Placement Admin</h1>
                <span className="text-[10px] text-rose-400 font-mono tracking-wider uppercase">Control Panel</span>
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
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
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
        <div className="p-4 border-t border-rose-900/30 bg-gray-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-200 font-bold text-xs">
                A
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-rose-300 truncate font-mono">ROLE: ADMIN</p>
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
        <header className="h-16 border-b border-gray-800 bg-[#090d16]/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
          <div className="flex items-center space-x-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-medium text-gray-300">Admin Workspace</h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono">
              SYSTEM PRIVILEGED ACCESS
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

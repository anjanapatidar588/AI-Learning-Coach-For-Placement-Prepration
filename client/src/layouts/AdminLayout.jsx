import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  HelpCircle,
  FolderKanban,
  FileCheck,
  Building,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'CORE MANAGEMENT',
      items: [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Assessments', path: '/admin/assessments', icon: FileCheck },
        { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
      ]
    },
    {
      title: 'STUDENTS & CURRICULUM',
      items: [
        { label: 'Student Directory', path: '/admin/students', icon: Users },
        { label: 'Topics & Curriculum', path: '/admin/topics', icon: FolderKanban },
        { label: 'Hiring Companies', path: '/admin/companies', icon: Building },
      ]
    },
    {
      title: 'SYSTEM & INTELLIGENCE',
      items: [
        { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
        { label: 'AI Engine Settings', path: '/admin/ai-config', icon: Sliders },
      ]
    }
  ];

  // Dynamic breadcrumb title
  const currentPath = location.pathname;
  let pageTitle = 'Dashboard';
  if (currentPath.includes('/assessments')) pageTitle = 'Assessments & Blueprints';
  else if (currentPath.includes('/questions')) pageTitle = 'Question Bank Management';
  else if (currentPath.includes('/students')) pageTitle = 'Student Directory & Performance';
  else if (currentPath.includes('/topics')) pageTitle = 'Topic & Syllabus Management';
  else if (currentPath.includes('/analytics')) pageTitle = 'Platform Analytics';
  else if (currentPath.includes('/companies')) pageTitle = 'Company Management';
  else if (currentPath.includes('/ai-config')) pageTitle = 'AI Engine Configuration';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between shadow-xs`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-900">Placement Admin</h1>
                <span className="text-[10px] text-indigo-700 font-semibold tracking-wider uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 font-mono">
                  Control Panel
                </span>
              </div>
            </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3.5 space-y-4 overflow-y-auto flex-1">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase font-mono mb-1">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold'
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

          {/* User Info & Logout Footer */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold font-mono">ROLE: ADMIN</p>
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 z-30 shadow-xs shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Admin Panel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-800 font-bold">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Privileged Clearance</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

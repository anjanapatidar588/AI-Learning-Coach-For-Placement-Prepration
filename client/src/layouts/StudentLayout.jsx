import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Bot,
  Code2,
  BrainCircuit,
  BookOpenCheck,
  Terminal,
  FileCheck,
  TrendingUp,
  Award,
  LogOut,
  Sparkles,
  Menu,
  X,
  BookX,
  RotateCcw,
  BarChart3,
  Brain,
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  FolderOpen,
  Sun,
  Sprout,
  ExternalLink
} from 'lucide-react';

const StudentLayout = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dedicated clean workspace for active assessment
  if (location.pathname.startsWith('/student/assessments/take')) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Outlet />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentName = user?.name || 'nishkarsh patidar';
  const initial = studentName.charAt(0).toUpperCase();

  // Navigation structure categorized exactly matching reference image
  const navCategories = [
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
        { label: 'Revision Center', path: '/student/revision', icon: RotateCcw },
      ]
    },
    {
      title: 'PROGRESS & EVALUATION',
      items: [
        { label: 'Roadmap', path: '/student/roadmap', icon: TrendingUp },
        { label: 'Assessments', path: '/student/assessment', icon: FileCheck },
        { label: 'Progress', path: '/student/progress', icon: BarChart3 },
        { label: 'Diagnostic Test', path: '/student/assessment', icon: Sparkles },
      ]
    },
    {
      title: 'AI',
      items: [
        { label: 'AI Coach', path: '/student/ai-coach', icon: Bot },
      ]
    },
    {
      title: 'PREPARATION',
      items: [
        { label: 'Mock Interview', path: '/student/mock-interview', icon: Award },
      ]
    },
    {
      title: null,
      items: [
        { label: 'Notes', path: '/student/revision', icon: BookOpen },
        { label: 'Resources', path: '/student/practice', icon: FolderOpen },
        { label: 'Settings', path: '/student/profile', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-800 font-sans overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Modern Sidebar matching reference design */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/70 transform transition-all duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'} flex flex-col justify-between shadow-[2px_0_12px_rgba(0,0,0,0.02)]`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between h-20 px-5 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-slate-900">PathPilot</h1>
                  <p className="text-[11px] text-slate-400 font-medium">Your AI Learning Coach</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="px-3.5 py-2 space-y-4 overflow-y-auto flex-1 text-xs">
            {navCategories.map((cat, cIdx) => (
              <div key={cIdx} className="space-y-1">
                {cat.title && !sidebarCollapsed && (
                  <div className="px-3.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1">
                    {cat.title}
                  </div>
                )}
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path + item.label}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center ${
                          sidebarCollapsed ? 'justify-center px-2 py-2' : 'space-x-3 px-3.5 py-2'
                        } rounded-2xl font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-[#ede9fe] text-[#6366f1] font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Motivational Inset Card (as seen in reference design) */}
        {!sidebarCollapsed && (
          <div className="mx-3.5 mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/60 border border-blue-100 flex items-center space-x-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Keep Going!</p>
              <p className="text-[10px] text-slate-500 leading-tight">Small steps every day lead to big results.</p>
            </div>
          </div>
        )}

        {/* Bottom Student Profile & Logout Bar */}
        <div className="p-3.5 border-t border-slate-100 bg-white shrink-0">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={studentName}
                    className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    {initial}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">{studentName}</p>
                  <p className="text-[10px] text-slate-400 capitalize">Student</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={studentName}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {initial}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 overflow-hidden ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Navbar matching reference design */}
        <header className="h-20 bg-[#f8fafc]/90 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center space-x-3 flex-1 max-w-2xl">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-white"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            {/* Search Bar - Full rounded pill matching reference */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search anything... (topics, questions, concepts)"
                className="w-full pl-10 pr-12 py-2 text-xs bg-white/90 border border-slate-200/80 rounded-full text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-mono font-bold">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell with red count badge */}
            <button
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Theme sun icon */}
            <button
              className="p-2.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-full transition-colors cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pr-2 rounded-full hover:bg-white transition-colors cursor-pointer"
                aria-label="User Menu"
              >
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
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{studentName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'student@pathpilot.com'}</p>
                  </div>
                  <Link
                    to="/student/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Goals</span>
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport with pastel gradient background */}
        <main className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

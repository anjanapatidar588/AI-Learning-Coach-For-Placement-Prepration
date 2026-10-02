import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  HelpCircle,
  FileCheck,
  Building2,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Search,
  Bell,
  Home,
  Crown,
  ArrowRight,
  Check,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [aiInsightsModalOpen, setAiInsightsModalOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Assessments', path: '/admin/assessments', icon: FileCheck },
    { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { label: 'Student Directory', path: '/admin/students', icon: Users },
    { label: 'Topics & Curriculum', path: '/admin/topics', icon: BookOpen },
    { label: 'Hiring Companies', path: '/admin/companies', icon: Building2 },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Engine Settings', path: '/admin/ai-config', icon: Sliders },
  ];

  // Dynamic breadcrumb title
  const currentPath = location.pathname;
  let pageTitle = 'Dashboard';
  if (currentPath.includes('/assessments')) pageTitle = 'Assessments';
  else if (currentPath.includes('/questions')) pageTitle = 'Question Bank';
  else if (currentPath.includes('/students')) pageTitle = 'Student Directory';
  else if (currentPath.includes('/topics')) pageTitle = 'Topics & Curriculum';
  else if (currentPath.includes('/companies')) pageTitle = 'Hiring Companies';
  else if (currentPath.includes('/analytics')) pageTitle = 'Platform Analytics';
  else if (currentPath.includes('/ai-config')) pageTitle = 'AI Engine Settings';

  // Mock search suggestions for quick jump
  const quickLinks = [
    { type: 'student', title: 'Riya Sharma', subtitle: 'Ready (88%) • Target: Google', path: '/admin/students?search=Riya' },
    { type: 'student', title: 'Aditya Verma', subtitle: 'Developing (62%) • Target: Microsoft', path: '/admin/students?search=Aditya' },
    { type: 'topic', title: 'Dynamic Programming & Memoization', subtitle: 'DSA • 14 Questions', path: '/admin/topics?search=Dynamic' },
    { type: 'topic', title: 'System Design Fundamentals', subtitle: 'CS Core • 8 Questions', path: '/admin/topics?search=System' },
    { type: 'company', title: 'Tata Consultancy Services (TCS)', subtitle: 'Benchmark: 70% • 3 Rounds', path: '/admin/companies' },
    { type: 'company', title: 'Amazon AWS SDE-1', subtitle: 'Benchmark: 82% • 4 Rounds', path: '/admin/companies' },
    { type: 'assessment', title: 'Full Stack DSA Mock Assessment', subtitle: 'Live • 14 Submissions', path: '/admin/assessments' },
  ];

  const filteredLinks = searchQuery.trim()
    ? quickLinks.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks.slice(0, 4);

  const notifications = [
    { id: 1, title: 'DSA Mock Test completed', desc: '14 students finished the assessment', time: '4 hours ago', unread: true },
    { id: 2, title: 'New test published', desc: 'Aptitude Practice Test is now live', time: '6 hours ago', unread: true },
    { id: 3, title: 'New student registered', desc: 'Riya Sharma enrolled on PathPilot', time: '2 hours ago', unread: false },
    { id: 4, title: 'Company profile added', desc: 'TCS hiring pattern & syllabus updated', time: '1 day ago', unread: false },
  ];

  return (
    <div className="flex h-screen bg-[#f8faff] text-slate-800 overflow-hidden font-sans">
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)]`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 shrink-0">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  PathPilot
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1">
                  Your Placement Preparation Partner
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#eeecfd] text-[#5542f6] font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate text-[13px]">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Bottom Card: AI Placement Insights */}
          <div className="p-4 shrink-0">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-violet-50/80 border border-indigo-100/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">AI-Powered Placement Insights</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Smarter decisions. Better placements.</p>
                </div>
              </div>
              <button
                onClick={() => setAiInsightsModalOpen(true)}
                className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all duration-150 shadow-md shadow-indigo-200 cursor-pointer shrink-0 ml-2"
                title="Open AI Insights"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileOpen(true)} 
              className="md:hidden text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <Link to="/admin/dashboard" className="hover:text-indigo-600 flex items-center">
                <Home className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-500">Admin Panel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-bold">{pageTitle}</span>
            </div>
          </div>

          {/* Search Bar, Notifications, Profile, Privileged Badge */}
          <div className="flex items-center space-x-4">
            {/* Global Search Pill */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="flex items-center bg-slate-50 border border-slate-200/90 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:bg-white rounded-full px-4 py-2 w-72 lg:w-96 transition-all duration-200 shadow-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search students, topics, companies..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
                    {searchQuery ? 'Search Results' : 'Suggested Jump Links'}
                  </div>
                  <div className="space-y-1">
                    {filteredLinks.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {item.type}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  2
                </span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-tight">{n.desc}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  AP
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline">Admin</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@pathpilot.com'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/ai-config"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>System Settings</span>
                    </Link>
                    <Link
                      to="/admin/analytics"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Platform Analytics</span>
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Privileged Admin Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 text-purple-700 text-xs font-bold shadow-xs">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>Privileged (Admin)</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 bg-[#f8faff]">
          <Outlet />
        </main>
      </div>

      {/* AI Insights Modal */}
      {aiInsightsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 lg:p-8 space-y-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-100">
                  AI
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">AI-Powered Placement Insights</h3>
                  <p className="text-xs text-slate-500">Autonomous cohort gap analysis and placement readiness predictions</p>
                </div>
              </div>
              <button
                onClick={() => setAiInsightsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>High Impact Observation</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  DSA performance has surged by <strong>7%</strong> over the past week, driven by Trees and Graph problems. However, <strong>Interview Prep</strong> and HR behavioral mock assessments are lagging at <strong>38%</strong> readiness.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Cohort Velocity</span>
                  <p className="text-xl font-black text-slate-900 mt-1">+18.4%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top 20 percentile</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Target Placements</span>
                  <p className="text-xl font-black text-indigo-600 mt-1">82%</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">By Q4 Cycle</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Recommended Action</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Host 2 Mock HR Rounds</p>
                  <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Closes 6% gap</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Recommended Next Steps for Admin:</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Publish an automated <strong>System Design & CS Core Mock</strong> for developing students.</li>
                  <li>Schedule 1-on-1 interview practice slots for the 8 <strong>Interview Ready</strong> candidates.</li>
                  <li>Tag additional aptitude practice questions matching TCS and Infosys cutoff criteria.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setAiInsightsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAiInsightsModalOpen(false);
                  navigate('/admin/assessments');
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center space-x-1.5"
              >
                <span>Create Targeted Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

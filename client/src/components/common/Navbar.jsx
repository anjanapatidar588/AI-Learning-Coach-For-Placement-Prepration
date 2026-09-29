import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import PathPilotLogo from './PathPilotLogo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Subjects', path: '/#subjects' },
    { name: 'Core Features', path: '/#features' },
    { name: 'AI Coach', path: '/#ai-coach' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.hash === path.replace('/', '') || location.pathname.startsWith(path);
  };

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (path.includes('#')) {
      const elementId = path.split('#')[1];
      const elem = document.getElementById(elementId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <header className="absolute top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="glass-nav-floating rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">
        
        {/* LEFT: PathPilot Logo */}
        <PathPilotLogo />

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300 tracking-wide">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`transition-all hover:text-cyan-400 cursor-pointer ${
                  active ? 'text-white font-bold nav-active-glow' : 'text-slate-300'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-full bg-slate-900/60 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          {/* Sign In Button */}
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/40 hover:bg-slate-800 text-slate-200 text-xs font-semibold hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            Sign In
          </Link>

          {/* Start Preparing Gradient CTA */}
          <Link
            to="/dashboard"
            className="btn-pathpilot-primary text-xs py-1.5 px-4"
          >
            <span>Start Preparing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-400"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 glass-card-floating p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/95 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-200 text-xs font-semibold transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold bg-slate-900"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pathpilot-primary w-full text-xs text-center justify-center"
            >
              <span>Start Preparing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

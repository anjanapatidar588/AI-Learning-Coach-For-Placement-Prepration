import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X, Bot, ShieldCheck } from 'lucide-react';
import PathPilotLogo from './PathPilotLogo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Curriculum', path: '/#subjects' },
    { name: 'Personalized Roadmap', path: '/#roadmap' },
    { name: 'AI Coach', path: '/#ai-coach' }
  ];

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
    <header className="absolute top-5 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="bg-white/90 backdrop-blur-md rounded-full px-5 sm:px-6 py-2.5 flex items-center justify-between border border-slate-200/80 shadow-xs transition-all duration-300">

        {/* LEFT: PathPilot Logo */}
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-base tracking-tight block leading-tight">
              PathPilot
            </span>
            <span className="text-[10px] text-indigo-600 font-bold tracking-tight block">
              Your AI Learning Coach
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-bold text-slate-600 tracking-wide">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* RIGHT: Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Sign In Button */}
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-slate-700 hover:text-indigo-600 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>

          {/* Start Preparing CTA */}
          <Link
            to="/dashboard"
            className="btn-primary text-xs py-2 px-4 shadow-xs"
          >
            <span>Start Preparing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2.5 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-150">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className="text-left py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-xs text-center justify-center"
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

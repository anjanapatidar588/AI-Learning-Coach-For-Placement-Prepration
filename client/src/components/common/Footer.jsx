import React from 'react';
import { Link } from 'react-router-dom';
import PathPilotLogo from './PathPilotLogo';
import { ArrowUpRight, Github, Twitter, Linkedin, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-100">

          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4 text-left">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-900 text-lg tracking-tight">PathPilot</span>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              PathPilot is an AI-guided adaptive learning platform engineered for engineering students preparing for technical screenings and campus placements.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a href="#" className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <Github className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 3: Preparation Areas */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono mb-4">Curriculum</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><Link to="/student/dsa" className="hover:text-indigo-600 transition-colors">Data Structures & Algorithms</Link></li>
              <li><Link to="/student/aptitude" className="hover:text-indigo-600 transition-colors">Quantitative Aptitude</Link></li>
              <li><Link to="/student/cs-core" className="hover:text-indigo-600 transition-colors">DBMS & Normalization</Link></li>
              <li><Link to="/student/cs-core" className="hover:text-indigo-600 transition-colors">Operating Systems & Mutex</Link></li>
              <li><Link to="/student/cs-core" className="hover:text-indigo-600 transition-colors">Computer Networks & OSI</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Features */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono mb-4">Learning Engine</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><Link to="/student/roadmap" className="hover:text-indigo-600 transition-colors">Personalized Roadmap</Link></li>
              <li><Link to="/student/practice" className="hover:text-indigo-600 transition-colors">Pattern-Based Practice</Link></li>
              <li><Link to="/student/mistakes" className="hover:text-indigo-600 transition-colors">Mistake Journal</Link></li>
              <li><Link to="/student/revision" className="hover:text-indigo-600 transition-colors">Spaced Revision Center</Link></li>
              <li><Link to="/student/ai-coach" className="hover:text-indigo-600 transition-colors">Socratic AI Mentor</Link></li>
            </ul>
          </div>

          {/* Col 5: Access */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono mb-4">Portal Access</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><Link to="/login" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold">Sign In <ArrowUpRight className="w-3 h-3" /></Link></li>
              <li><Link to="/signup" className="hover:text-indigo-600 transition-colors">Get Started</Link></li>
              <li><Link to="/student/dashboard" className="hover:text-indigo-600 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/student/profile" className="hover:text-indigo-600 transition-colors">Profile & Goals</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} PathPilot AI Learning Coach. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Engineered for campus placement readiness</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

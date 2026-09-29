import React from 'react';
import { Link } from 'react-router-dom';
import PathPilotLogo from './PathPilotLogo';
import { ArrowUpRight, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <PathPilotLogo size="large" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              PathPilot is an AI-powered adaptive learning platform engineered for university students preparing for top tier tech placement roles.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Preparation Areas */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Preparation Areas</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/dsa" className="hover:text-cyan-400 transition-colors">Data Structures & Algorithms</Link></li>
              <li><Link to="/aptitude" className="hover:text-cyan-400 transition-colors">Quantitative Aptitude</Link></li>
              <li><Link to="/core" className="hover:text-cyan-400 transition-colors">DBMS & Normalization</Link></li>
              <li><Link to="/core" className="hover:text-cyan-400 transition-colors">Operating Systems & Mutex</Link></li>
              <li><Link to="/core" className="hover:text-cyan-400 transition-colors">Computer Networks & OSI</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Core Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/roadmap" className="hover:text-cyan-400 transition-colors">Personalized Roadmap</Link></li>
              <li><Link to="/practice" className="hover:text-cyan-400 transition-colors">Pattern-Based Practice</Link></li>
              <li><Link to="/revision" className="hover:text-cyan-400 transition-colors">Mistake Journal & Notes</Link></li>
              <li><Link to="/mock-interview" className="hover:text-cyan-400 transition-colors">AI Mock Interviews</Link></li>
              <li><Link to="/resume" className="hover:text-cyan-400 transition-colors">ATS Resume Analyzer</Link></li>
            </ul>
          </div>

          {/* Col 5: Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Account & Access</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/login" className="hover:text-cyan-400 transition-colors flex items-center gap-1">Student Sign In <ArrowUpRight className="w-3 h-3" /></Link></li>
              <li><Link to="/signup" className="hover:text-cyan-400 transition-colors">Get Started</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard Overview</Link></li>
              <li><Link to="/profile" className="hover:text-cyan-400 transition-colors">Student Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PathPilot AI Learning Coach. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for student success</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

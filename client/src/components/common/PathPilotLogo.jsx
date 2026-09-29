import React from 'react';
import { Link } from 'react-router-dom';

const PathPilotLogo = ({ className = '', iconOnly = false, size = 'default' }) => {
  const isLarge = size === 'large';

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group text-left ${className}`}>
      {/* Icon Container with glowing blue/cyan gradient */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300 ${isLarge ? 'w-11 h-11' : 'w-10 h-10'}`}>
        <svg className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'} text-white group-hover:scale-105 transition-transform duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Brain Neural Network Icon */}
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
          <path d="M6 12h3" />
          <path d="M15 12h3" />
          <path d="M8 8h1" />
          <path d="M15 8h1" />
          <path d="M8 16h1" />
          <path d="M15 16h1" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-white leading-none ${isLarge ? 'text-xl' : 'text-lg'}`}>
            PathPilot
          </span>
          <span className="text-[11px] font-normal tracking-tight text-slate-300 mt-1">
            Your AI Learning Coach
          </span>
        </div>
      )}
    </Link>
  );
};

export default PathPilotLogo;

import React from 'react';
import { Loader2, AlertCircle, RotateCw, Search, X, CheckCircle2, Clock, Play, SkipForward } from 'lucide-react';

/**
 * 1. GlassCard
 * Modern glassmorphic card container with soft shadow, translucent border, and optional hover lift.
 */
export const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs ${
        hoverEffect
          ? 'hover:shadow-md hover:border-indigo-300/80 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
          : 'transition-all duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * 2. GradientCard
 * High-emphasis card featuring subtle soft gradients and glowing borders.
 */
export const GradientCard = ({
  children,
  className = '',
  variant = 'indigo', // 'indigo', 'purple', 'emerald', 'sky'
  ...props
}) => {
  const gradients = {
    indigo: 'from-indigo-600 via-indigo-700 to-indigo-900 text-white shadow-indigo-200/50',
    purple: 'from-purple-600 via-indigo-600 to-slate-900 text-white shadow-purple-200/50',
    emerald: 'from-emerald-600 via-teal-700 to-slate-900 text-white shadow-emerald-200/50',
    sky: 'from-sky-500 via-blue-600 to-indigo-800 text-white shadow-sky-200/50',
    light: 'from-white via-indigo-50/30 to-purple-50/20 text-slate-900 border-slate-200/80'
  };

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-gradient-to-br ${gradients[variant] || gradients.indigo} p-6 sm:p-7 shadow-md relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * 3. SectionHeader
 * Consistent typographic hierarchy for dashboard panels and module pages.
 */
export const SectionHeader = ({
  title,
  subtitle,
  badge,
  action,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              {badge}
            </span>
          )}
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
    </div>
  );
};

/**
 * 4. StatCard
 * Quick metric stat box with numeric value, trend, label, and icon.
 */
export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-200',
  className = ''
}) => {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-[11px] text-slate-500 font-medium">
            {subtext}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

/**
 * 5. ProgressRing
 * Circular SVG gauge visualization for readiness and subject performance scores.
 */
export const ProgressRing = ({
  value = 0,
  size = 120,
  strokeWidth = 10,
  color = '#4f46e5',
  trackColor = '#f1f5f9',
  label = 'Score',
  sublabel = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-black text-slate-900 tracking-tight" style={{ fontSize: size * 0.22 }}>
          {clampedValue}%
        </span>
        {label && (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[8px] text-slate-400 font-mono">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * 6. ProgressBar
 * Linear horizontal progress bar with subtle gradient fill.
 */
export const ProgressBar = ({
  value = 0,
  color = 'bg-indigo-600',
  height = 'h-2',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

/**
 * 7. StatusBadge
 * High-legibility status pill with icon and subtle pastel border.
 */
export const StatusBadge = ({
  status = 'pending',
  label,
  className = ''
}) => {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;
  let text = label || status;

  if (norm === 'completed' || norm === 'passed' || norm === 'easy') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = CheckCircle2;
  } else if (norm === 'in_progress' || norm === 'current' || norm === 'active') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    Icon = Play;
  } else if (norm === 'medium' || norm === 'warning' || norm === 'review') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = Clock;
  } else if (norm === 'hard' || norm === 'failed' || norm === 'critical') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertCircle;
  } else if (norm === 'skipped') {
    styles = 'bg-slate-100 text-slate-500 border-slate-200';
    Icon = SkipForward;
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${styles} ${className}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span>{text}</span>
    </span>
  );
};

/**
 * 8. EmptyState
 * Accessible empty container with clear copy and action button.
 */
export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No Data Found',
  description = 'There are currently no items available to display.',
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

/**
 * 9. LoadingSkeleton
 * Pulsing skeleton cards for loading states.
 */
export const LoadingSkeleton = ({ count = 3, type = 'card' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-20 h-5 bg-slate-100 rounded-full" />
            <div className="w-14 h-5 bg-slate-100 rounded-full" />
          </div>
          <div className="w-3/4 h-5 bg-slate-200 rounded-md" />
          <div className="w-full h-10 bg-slate-100 rounded-md" />
          <div className="pt-2 flex items-center justify-between">
            <div className="w-24 h-4 bg-slate-100 rounded" />
            <div className="w-24 h-8 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 10. ErrorState
 * Error alert card with retry CTA.
 */
export const ErrorState = ({
  message = 'An unexpected error occurred.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 ${className}`}>
      <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
      <h3 className="text-sm font-bold text-slate-900">Failed to Load Content</h3>
      <p className="text-xs text-slate-600 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

/**
 * 11. SearchBar
 * Rounded search input field with instant clear button.
 */
export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

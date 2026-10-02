import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentInitialRoute } from '../../utils/studentRouting';
import { Loader2 } from 'lucide-react';

/**
 * Shared Loading Indicator
 */
const GuardLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
    <p className="text-xs text-slate-400 font-mono">Verifying authorization & student status...</p>
  </div>
);

/**
 * OnboardingGuard
 * Protects /student/onboarding.
 * If user is fully onboarded and baseline assessment complete, redirects them to dashboard.
 * If user is onboarded but baseline assessment is pending, redirects them to assessment-ready.
 */
export const OnboardingGuard = ({ children }) => {
  const { user, token, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoader />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (profile && profile.onboardingCompleted) {
    if (!profile.baselineAssessmentCompleted) {
      return <Navigate to="/student/assessment-ready" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

/**
 * AssessmentGuard
 * Protects /student/assessment-ready and active assessment routes.
 * If onboarding is incomplete, redirects to /student/onboarding.
 * If baseline assessment is already complete (and not taking an active test), redirects to /student/dashboard.
 */
export const AssessmentGuard = ({ children }) => {
  const { user, token, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoader />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If onboarding is incomplete, force back to onboarding
  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to="/student/onboarding" replace />;
  }

  // If baseline assessment is already complete, redirect to dashboard unless user is taking a specific test
  const isTakingTest = location.pathname.includes('/assessments/take/');
  if (profile.baselineAssessmentCompleted && !isTakingTest) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

/**
 * StudentAccessGuard
 * Protects normal student application routes (/student/dashboard, /student/dsa, /student/practice, etc.)
 * Strictly enforces:
 * 1. Onboarding complete -> else redirect /student/onboarding
 * 2. Baseline assessment complete -> else redirect /student/assessment-ready
 */
export const StudentAccessGuard = ({ children }) => {
  const { user, token, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoader />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 1. Check Onboarding
  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to="/student/onboarding" replace />;
  }

  // 2. Check Baseline Assessment
  if (!profile.baselineAssessmentCompleted) {
    return <Navigate to="/student/assessment-ready" replace />;
  }

  return children ? children : <Outlet />;
};

/**
 * Base ProtectedRoute (for backwards compatibility and Admin routes)
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return <GuardLoader />;

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') {
      return <Navigate to={getStudentInitialRoute(profile)} replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

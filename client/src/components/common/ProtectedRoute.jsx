import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentInitialRoute } from '../../utils/studentRouting';
import { Loader2 } from 'lucide-react';

/**
 * Role-aware ProtectedRoute component.
 * Ensures:
 * 1. Unauthenticated users are redirected to /login
 * 2. Authenticated Students accessing admin routes are redirected to their appropriate route
 * 3. Authenticated Admins accessing student routes are redirected to /admin/dashboard
 * 4. Students who have not completed onboarding are redirected to /student/onboarding
 * 5. Students who have not completed initial assessment are redirected to /student/assessment-ready
 * 6. Fully initialized students access the dashboard
 *
 * @param {Array<string>} allowedRoles Roles permitted for this route ('student', 'admin')
 * @param {React.ReactNode} children Component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <p className="text-xs text-slate-400 font-mono">Verifying authorization...</p>
      </div>
    );
  }

  // 1. Unauthenticated user -> redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role verification
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If student attempting admin route -> redirect to their appropriate route
    if (user.role === 'student') {
      return <Navigate to={getStudentInitialRoute(profile)} replace />;
    }
    // If admin attempting student route -> redirect to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Any unrecognized role -> fallback to /login
    return <Navigate to="/login" replace />;
  }

  // 3. Student State Flow Enforcement
  if (user.role === 'student') {
    const pathname = location.pathname;
    const isExempt =
      pathname === '/student/onboarding' ||
      pathname.startsWith('/student/assessment-ready') ||
      pathname.startsWith('/student/assessments/take') ||
      pathname === '/student/profile';

    // A & B: Incomplete onboarding (or profile not yet initialized) -> redirect to onboarding
    if (!profile || !profile.onboardingCompleted) {
      if (pathname !== '/student/onboarding') {
        return <Navigate to="/student/onboarding" replace />;
      }
    } 
    // C: Onboarding complete but initial assessment pending -> redirect to assessment-ready
    else if (!profile.baselineAssessmentCompleted && !isExempt) {
      return <Navigate to="/student/assessment-ready" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;


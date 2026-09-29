import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Role-aware ProtectedRoute component.
 * Ensures:
 * 1. Unauthenticated users are redirected to /login
 * 2. Authenticated Students accessing admin routes are redirected to /student/dashboard
 * 3. Authenticated Admins accessing student routes are redirected to /admin/dashboard
 *
 * @param {Array<string>} allowedRoles Roles permitted for this route ('student', 'admin')
 * @param {React.ReactNode} children Component to render if authorized
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, token, loading } = useAuth();
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
    // If student attempting admin route -> redirect to student dashboard
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin attempting student route -> redirect to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Any unrecognized role -> fallback to /login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

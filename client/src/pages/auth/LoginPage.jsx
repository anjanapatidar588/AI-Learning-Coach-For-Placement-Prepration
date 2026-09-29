import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PathPilotLogo from '../../components/common/PathPilotLogo';
import { ArrowRight, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentInitialRoute } from '../../utils/studentRouting';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, profile, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to role-specific destination
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const studentDest = getStudentInitialRoute(profile);
        navigate(studentDest, { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);

      if (res.success && res.user) {
        // Authoritative role check directly from authenticated user identity
        const from = location.state?.from?.pathname;
        if (res.user.role === 'admin') {
          navigate(from?.startsWith('/admin') ? from : '/admin/dashboard', { replace: true });
        } else {
          const studentProfile = res.profile || profile;
          const studentDest = getStudentInitialRoute(studentProfile);
          if (studentProfile?.onboardingCompleted && studentProfile?.baselineAssessmentCompleted && from?.startsWith('/student')) {
            navigate(from, { replace: true });
          } else {
            navigate(studentDest, { replace: true });
          }
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="mb-8 text-center">
        <PathPilotLogo size="large" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel-glow p-8 space-y-6 border border-cyan-500/30 bg-slate-950/85">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your account with your credentials.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-pathpilot-primary w-full text-xs py-3 mt-2 font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Register as Student
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

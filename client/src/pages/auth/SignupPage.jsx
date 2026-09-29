import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PathPilotLogo from '../../components/common/PathPilotLogo';
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const updateForm = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    if (error) setError('');
  };

  const handleSignup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (res.success) {
        if (formData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        setError(res.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      setError('An unexpected error occurred during signup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <div className="mb-6 text-center">
        <PathPilotLogo size="large" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md glass-panel-glow p-8 space-y-6 border border-cyan-500/30 bg-slate-950/90 relative rounded-2xl shadow-2xl">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-400 mt-1">Select your account role to configure the correct interface.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5 text-left">
          {/* Role Selection UI */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select your account role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateForm({ role: 'student' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formData.role === 'student'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => updateForm({ role: 'admin' })}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formData.role === 'admin'
                    ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder={formData.role === 'admin' ? 'Admin Team' : 'Alex Rivera'}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  placeholder={formData.role === 'admin' ? 'admin@placementcoach.ai' : 'student@university.edu'}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full text-xs py-3 px-6 font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg ${
              formData.role === 'admin'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20'
                : 'btn-pathpilot-primary shadow-cyan-500/20'
            }`}
          >
            <span>
              {submitting
                ? (formData.role === 'admin' ? 'Creating Admin Account...' : 'Creating Student Account...')
                : (formData.role === 'admin' ? 'Create Admin Account' : 'Create Student Account')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link back to login */}
        <p className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

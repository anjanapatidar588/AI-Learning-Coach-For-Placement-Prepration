import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthIllustration from '../../components/auth/AuthIllustration';
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentInitialRoute } from '../../utils/studentRouting';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, user, profile, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(getStudentInitialRoute(profile), { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

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
          // Redirect newly registered student directly to onboarding
          navigate('/student/onboarding', { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#ede9fe]/40 text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* 1. TOP HEADER (Matching Reference Image) */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-2 shrink-0">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">PathPilot</h1>
            <p className="text-[11px] text-slate-400 font-medium">Your Placement Preparation Partner</p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <span>Better Preparation</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <span>Brighter Future</span>
        </div>
      </header>

      {/* 2. MAIN TWO-COLUMN SPLIT SCREEN */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
        
        {/* LEFT COLUMN: HERO ILLUSTRATION & HEADLINE */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Learn. Practice. Crack.<br />
              <span className="text-indigo-600">Your Dream Placement.</span>
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-md">
              Build your skills, boost your confidence and step closer to your dream job with PathPilot.
            </p>
          </div>

          {/* Student At Desk Study Illustration */}
          <div className="pt-2">
            <AuthIllustration />
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED GLASS CARD SIGNUP FORM */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/90 shadow-[0_16px_50px_rgba(0,0,0,0.06)] space-y-5">
            
            {/* Top Purple Icon Badge & Heading */}
            <div className="space-y-1.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Start your personalized placement preparation journey.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5 text-left">
              {/* Role Selection Tabs */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Role</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateForm({ role: 'student' })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      formData.role === 'student'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm({ role: 'admin' })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      formData.role === 'admin'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-xs ring-2 ring-purple-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => updateForm({ password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl pl-11 pr-11 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 transition-all transform hover:scale-[1.01]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>{formData.role === 'admin' ? 'Create Admin Account' : 'Register as Student'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="pt-2 text-center space-y-1.5 border-t border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Already have an account?</span>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>

          </div>
        </div>

      </main>

      {/* 3. UNDERSTATED FOOTER */}
      <footer className="text-center py-2 text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} PathPilot Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default SignupPage;

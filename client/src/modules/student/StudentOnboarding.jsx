import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  Briefcase,
  Building2,
  Sun,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

const StudentOnboarding = () => {
  const { user, fetchProfile, setProfile } = useAuth();
  const navigate = useNavigate();

  // Wizard Step state (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear() + 1);
  const [dailyPreparationTime, setDailyPreparationTime] = useState('2–3 hours');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [targetCompanies, setTargetCompanies] = useState(
    Array.isArray(user?.targetCompanies) ? user.targetCompanies.join(', ') : 'Google, Amazon, TCS'
  );
  const [preferredStudyTime, setPreferredStudyTime] = useState('Evening');
  const [preparationDetails, setPreparationDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('/student/profile');
        if (res.data?.success && res.data?.data) {
          const p = res.data.data;
          if (p.user?.name) setName(p.user.name);
          if (p.college) setCollege(p.college);
          if (p.graduationYear) setGraduationYear(p.graduationYear);
          if (p.dailyPreparationTime) setDailyPreparationTime(p.dailyPreparationTime);
          if (p.targetDate) setTargetDate(new Date(p.targetDate).toISOString().split('T')[0]);
          if (p.targetRoles && p.targetRoles.length > 0) setTargetRole(p.targetRoles[0]);
          if (p.targetCompanies && p.targetCompanies.length > 0) setTargetCompanies(p.targetCompanies.join(', '));
          if (p.preferredStudyTime) setPreferredStudyTime(p.preferredStudyTime);
          if (p.preparationDetails) setPreparationDetails(p.preparationDetails);
        }
      } catch (err) {
        // use default values
      } finally {
        setFetchingExisting(false);
      }
    };
    loadProfile();
  }, []);

  // Options for selectable cards
  const dailyTimeOptions = [
    { label: '30–60 min', val: '30–60 min', desc: 'Light daily practice' },
    { label: '1–2 hours', val: '1–2 hours', desc: 'Balanced routine' },
    { label: '2–3 hours', val: '2–3 hours', desc: 'Recommended pacing' },
    { label: '3+ hours', val: '3+ hours', desc: 'Intensive prep' }
  ];

  const studyTimeOptions = [
    { label: 'Morning', val: 'Morning', icon: Sun },
    { label: 'Afternoon', val: 'Afternoon', icon: Sun },
    { label: 'Evening', val: 'Evening', icon: Clock },
    { label: 'Night', val: 'Night', icon: Clock },
    { label: 'Flexible', val: 'Flexible', icon: Sparkles }
  ];

  const currentYear = new Date().getFullYear();
  const gradYears = Array.from({ length: 6 }, (_, i) => currentYear + i - 1);

  // Step validation
  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!name.trim()) {
        setError('Full Name is required.');
        return false;
      }
    } else if (step === 2) {
      if (!college.trim()) {
        setError('College / University is required.');
        return false;
      }
      if (!graduationYear) {
        setError('Graduation Year is required.');
        return false;
      }
    } else if (step === 3) {
      if (!dailyPreparationTime) {
        setError('Please select your daily preparation time.');
        return false;
      }
    } else if (step === 4) {
      if (!targetDate) {
        setError('Target / Placement Date is required.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(4)) return;

    setError('');
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        college: college.trim(),
        graduationYear: Number(graduationYear),
        dailyPreparationTime,
        targetDate,
        targetRoles: targetRole.trim() ? [targetRole.trim()] : [],
        targetCompanies: targetCompanies ? targetCompanies.split(',').map(c => c.trim()).filter(Boolean) : [],
        preferredStudyTime,
        preparationDetails: preparationDetails.trim(),
        onboardingCompleted: true
      };

      const res = await API.put('/student/profile', payload);
      if (res.data?.success) {
        if (setProfile && res.data.data) {
          setProfile(res.data.data);
        }
        await fetchProfile();
        navigate('/student/assessment-ready');
      } else {
        setError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingExisting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-indigo-600">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading onboarding profile...</span>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'About You' },
    { num: 2, title: 'Education' },
    { num: 3, title: 'Routine' },
    { num: 4, title: 'Your Goal' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-8">

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Placement Preparation Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personalize Your AI Learning Plan
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
            Step {currentStep} of 4 — {stepsList[currentStep - 1].title}
          </p>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {stepsList.map((st, i) => {
              const isDone = st.num < currentStep;
              const isCurrent = st.num === currentStep;
              return (
                <React.Fragment key={st.num}>
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-100'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 text-white" /> : st.num}
                    </div>
                    <span className={`text-[10px] font-bold tracking-tight ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {st.title}
                    </span>
                  </div>
                  {i < stepsList.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${st.num < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-lg relative">

          {/* STEP 1: ABOUT YOU */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Let's get to know you</h2>
                <p className="text-xs text-slate-500">We'll use this to personalize your learning experience.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Tell us about your education</h2>
                <p className="text-xs text-slate-500">helps tailor company-specific preparation schedules.</p>
              </div>

              <div className="space-y-4">
                {/* College */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    College / University <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Bombay / Delhi University / MIT"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Graduation Year <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all cursor-pointer"
                    >
                      {gradYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREPARATION ROUTINE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">How do you want to prepare?</h2>
                <p className="text-xs text-slate-500">Choose a sustainable daily routine for high practice consistency.</p>
              </div>

              {/* Daily Prep Time Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3">
                  Daily Preparation Time <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dailyTimeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setDailyPreparationTime(opt.val)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        dailyPreparationTime === opt.val
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-extrabold text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Study Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3">
                  Preferred Study Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {studyTimeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = preferredStudyTime === opt.val;
                    return (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => setPreferredStudyTime(opt.val)}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-semibold ${
                          isSelected
                            ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-purple-600" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: YOUR GOAL */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">What are you preparing for?</h2>
                <p className="text-xs text-slate-500">Set your placement targets and deadline goals.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Target / Placement Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Target Role</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. SDE-1 / Data Engineer / Frontend Dev"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Companies */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Target Companies</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      placeholder="e.g. Google, Amazon, Microsoft, TCS"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Additional Preparation Details</label>
                  <textarea
                    value={preparationDetails}
                    onChange={(e) => setPreparationDetails(e.target.value)}
                    rows={2}
                    placeholder="Mention specific areas or upcoming campus drive dates..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-sm font-medium transition-all"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-indigo-900">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>You're all set!</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-snug">
                    We'll understand your strengths and weaknesses through your assessment instead of asking you to guess your skill level.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn-secondary text-xs px-4 py-2 flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary text-xs px-6 py-2.5 flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Learning Plan...' : 'Create My Learning Plan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Skill levels are evaluated strictly via initial assessment.</span>
        </div>

      </div>
    </div>
  );
};

export default StudentOnboarding;

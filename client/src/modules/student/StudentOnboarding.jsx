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
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  Target,
  FileText,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

const StudentOnboarding = () => {
  const { user, fetchProfile, setProfile } = useAuth();
  const navigate = useNavigate();

  // Wizard Step state (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear() + 1);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer (SDE-1)');
  const [targetCompanies, setTargetCompanies] = useState(
    Array.isArray(user?.targetCompanies) ? user.targetCompanies.join(', ') : 'Google, Amazon, Microsoft, TCS'
  );
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [dailyPreparationTime, setDailyPreparationTime] = useState('2–3 hours');
  const [preferredStudyTime, setPreferredStudyTime] = useState('Evening');
  const [preparationDetails, setPreparationDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(true);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('/student/profile');
        if (res.data?.success && res.data?.data) {
          const p = res.data.data;
          if (p.user?.name) setName(p.user.name);
          if (p.user?.avatar) setAvatar(p.user.avatar);
          if (p.college) setCollege(p.college);
          if (p.graduationYear) setGraduationYear(p.graduationYear);
          if (p.targetRoles && p.targetRoles.length > 0) setTargetRole(p.targetRoles[0]);
          if (p.targetCompanies && p.targetCompanies.length > 0) setTargetCompanies(p.targetCompanies.join(', '));
          if (p.targetDate) setTargetDate(new Date(p.targetDate).toISOString().split('T')[0]);
          if (p.dailyPreparationTime) setDailyPreparationTime(p.dailyPreparationTime);
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');

    // Format validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError('Invalid image format. Allowed formats: JPG, JPEG, PNG, WebP.');
      return;
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size exceeds 5MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress/resize on canvas for optimal storage & speed
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatar(dataUrl);
      };
      img.onerror = () => {
        setPhotoError('Failed to load image file.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

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
      if (!college.trim()) {
        setError('College / University is required.');
        return false;
      }
      if (!graduationYear) {
        setError('Graduation Year is required.');
        return false;
      }
    } else if (step === 2) {
      if (!targetRole.trim()) {
        setError('Target Role is required.');
        return false;
      }
      if (!targetDate) {
        setError('Target / Placement Date is required.');
        return false;
      }
    } else if (step === 3) {
      if (!dailyPreparationTime) {
        setError('Please select your daily preparation time.');
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
    if (!validateStep(currentStep)) return;

    setError('');
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        avatar,
        college: college.trim(),
        graduationYear: Number(graduationYear),
        targetRoles: targetRole.trim() ? [targetRole.trim()] : [],
        targetCompanies: targetCompanies ? targetCompanies.split(',').map(c => c.trim()).filter(Boolean) : [],
        targetDate,
        dailyPreparationTime,
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
          <span className="text-sm font-semibold">Loading profile information...</span>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Placement Goals' },
    { num: 3, title: 'Preparation Schedule' },
    { num: 4, title: 'Additional Details' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-7">

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
                          ? 'bg-emerald-600 text-white shadow-xs'
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
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl relative">

          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Provide your basic profile details for customized college-drive alignment.</p>
              </div>

              {/* Profile Photo Picker */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col items-center justify-center text-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Profile Photo
                </label>

                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center relative">
                  {avatar ? (
                    <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <User className="w-10 h-10 stroke-1.5 text-slate-300" />
                      <span className="text-[10px] font-semibold text-slate-400">No Photo</span>
                    </div>
                  )}
                </div>

                {photoError && (
                  <div className="text-[11px] font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    {photoError}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <label className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer transition-colors inline-flex items-center space-x-1.5 shadow-2xs">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center space-x-1"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400">
                  Supports JPG, JPEG, PNG, WebP up to 5MB
                </span>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                {/* College / University */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    College / University <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Bombay / University of Delhi / MIT"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Graduation Year <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all cursor-pointer"
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

          {/* STEP 2: PLACEMENT GOALS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Placement Goals</h2>
                <p className="text-xs text-slate-500">Configure your target company types, job roles, and placement deadlines.</p>
              </div>

              <div className="space-y-4">
                {/* Target Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. SDE-1 / Software Engineer / Frontend Dev"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Target Companies */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Companies</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={targetCompanies}
                      onChange={(e) => setTargetCompanies(e.target.value)}
                      placeholder="e.g. Google, Amazon, Microsoft, TCS, Infosys"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target / Placement Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREPARATION SCHEDULE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Preparation Schedule</h2>
                <p className="text-xs text-slate-500">Pick a sustainable daily commitment to ensure steady preparation momentum.</p>
              </div>

              {/* Daily Prep Time Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2.5">
                  Daily Preparation Time <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dailyTimeOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setDailyPreparationTime(opt.val)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        dailyPreparationTime === opt.val
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-900 shadow-xs'
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
                <label className="block text-xs font-bold text-slate-700 mb-2.5">
                  Preferred Study Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {studyTimeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = preferredStudyTime === opt.val;
                    return (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => setPreferredStudyTime(opt.val)}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-semibold ${
                          isSelected
                            ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-2xs'
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

          {/* STEP 4: ADDITIONAL DETAILS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Additional Details</h2>
                <p className="text-xs text-slate-500">Include any special preparation preferences or upcoming interview dates.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Additional Preparation Details</label>
                  <textarea
                    value={preparationDetails}
                    onChange={(e) => setPreparationDetails(e.target.value)}
                    rows={3}
                    placeholder="Mention specific upcoming campus drives, special topics you want prioritized, or specific technical roles..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium transition-all"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-black text-indigo-900">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>Objective Evaluation Guarantee</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Notice we do not ask you to guess your skill level. Your actual strengths, weakness gaps, and readiness score are objectively determined through your diagnostic assessment.
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
                className="btn-secondary text-xs px-4 py-2 flex items-center space-x-1.5 cursor-pointer"
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
                className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary text-xs px-6 py-2.5 flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
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

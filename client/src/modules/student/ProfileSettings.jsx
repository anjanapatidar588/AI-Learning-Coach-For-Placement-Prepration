import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  User,
  GraduationCap,
  Target,
  Clock,
  FileText,
  Shield,
  Camera,
  Bot,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Calendar,
  Briefcase,
  Sliders,
  Bell,
  Key,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.name || 'nishkarsh patidar');
  const [email, setEmail] = useState(user?.email || 'nishkarsh@email.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [college, setCollege] = useState('IIT Bombay / University of Delhi / MIT');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [degree, setDegree] = useState('B.Tech (Computer Science)');

  const [targetRole, setTargetRole] = useState('Software Engineer / SDE');
  const [targetCompanies, setTargetCompanies] = useState('FAANG / Top Product Companies');
  const [targetDate, setTargetDate] = useState('2026-06-30');

  const [dailyTime, setDailyTime] = useState('2-3 hours');
  const [preferredTime, setPreferredTime] = useState('Evening / Night');
  const [preparationDetails, setPreparationDetails] = useState('');

  // Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/student/profile');
      if (res.data && res.data.success) {
        const pData = res.data.data;
        const uData = pData.user || user;
        if (uData?.name) setFullName(uData.name);
        if (uData?.email) setEmail(uData.email);
        if (uData?.avatar) setAvatar(uData.avatar);

        if (pData.college) setCollege(pData.college);
        if (pData.graduationYear) setGraduationYear(String(pData.graduationYear));
        if (pData.targetRoles && pData.targetRoles.length > 0) setTargetRole(pData.targetRoles[0]);
        if (pData.targetCompanies && pData.targetCompanies.length > 0) {
          setTargetCompanies(Array.isArray(pData.targetCompanies) ? pData.targetCompanies.join(', ') : pData.targetCompanies);
        }
        if (pData.dailyPreparationTime) setDailyTime(pData.dailyPreparationTime);
        if (pData.preferredStudyTime) setPreferredTime(pData.preferredStudyTime);
        if (pData.preparationDetails) setPreparationDetails(pData.preparationDetails);
        if (pData.targetDate) {
          const d = new Date(pData.targetDate);
          if (!isNaN(d.getTime())) {
            setTargetDate(d.toISOString().split('T')[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
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
    };
    reader.readAsDataURL(file);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      const payload = {
        name: fullName,
        college,
        graduationYear: Number(graduationYear) || 2027,
        targetRoles: [targetRole],
        targetCompanies: targetCompanies.split(',').map(c => c.trim()).filter(Boolean),
        dailyPreparationTime: dailyTime,
        preferredStudyTime: preferredTime,
        preparationDetails,
        targetDate,
        avatar
      };

      const res = await API.put('/student/profile', payload);
      if (res.data && res.data.success) {
        if (updateUser) {
          updateUser({
            name: fullName,
            avatar
          });
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setError(res.data?.message || 'Failed to save profile changes.');
      }
    } catch (err) {
      console.error('Error saving profile settings:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Loading student profile & preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* 1. TOP SCENIC HERO BANNER CARD */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#f3e8ff] border border-white/90 shadow-[0_6px_30px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        
        {/* Mountain Vector Graphic Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <svg
            className="w-full h-full object-cover opacity-80"
            viewBox="0 0 1200 240"
            preserveAspectRatio="xMaxYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="980" cy="70" r="100" fill="#fef08a" fillOpacity="0.5" />
            <path d="M480 240 L600 130 L700 170 L820 100 L940 180 L1060 110 L1200 170 L1200 240 Z" fill="#c7d2fe" fillOpacity="0.6" />
            <path d="M620 240 L740 150 L840 190 L960 120 L1100 185 L1200 140 L1200 240 Z" fill="#818cf8" fillOpacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* User Info & Avatar Header */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            
            {/* Avatar Circle with Ring */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                title="Update Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-purple-200 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>YOUR PROFILE</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome, {fullName} 👋
              </h1>

              <p className="text-xs text-slate-600 font-medium max-w-md leading-relaxed">
                Manage your profile, preferences and placement goals. Keep your information updated to get the best personalized learning experience.
              </p>

              <div className="pt-1 flex items-center justify-center sm:justify-start space-x-3 text-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Change Photo
                </button>

                <div className="flex items-center space-x-2 bg-white/80 px-3 py-1 rounded-xl border border-slate-200 text-slate-700 font-mono text-[11px]">
                  <span>{email}</span>
                  <button onClick={copyEmail} className="text-slate-400 hover:text-indigo-600 cursor-pointer">
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Donut Gauge & AI Coach Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            
            {/* Completion Gauge Card */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-white/90 shadow-md flex items-center space-x-4 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#06b6d4"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={(2 * Math.PI * 26) - (0.80) * (2 * Math.PI * 26)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-900">80%</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 block">Profile Complete</span>
                <p className="text-[10px] text-slate-500 max-w-[120px] leading-tight">Keep updating your details for better recommendations.</p>
              </div>
            </div>

            {/* AI Coach Banner Box */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-white/90 shadow-md flex items-center space-x-4 shrink-0 max-w-xs">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black text-slate-900 block">AI Coach</span>
                <p className="text-[10px] text-slate-500 leading-tight">Your profile helps us create a personalized roadmap.</p>
                <button
                  onClick={() => navigate('/student/ai-coach')}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold cursor-pointer transition-colors mt-1"
                >
                  <span>Chat Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Notification Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile and placement preferences saved successfully! Your learning roadmap has been updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. MAIN FORM CARDS GRID & RIGHT SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT & MIDDLE COLUMNS (9 COLS): 6 PROFILE SECTIONS */}
        <div className="lg:col-span-9 space-y-6">

          {/* ROW 1: PERSONAL INFORMATION & EDUCATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: PERSONAL INFORMATION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Personal Information</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Basic details about you.</p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center space-y-2 shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={fullName} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: EDUCATION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Education</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Your academic background.</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-50 text-purple-600 text-xs font-bold">
                  Edit
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">College / University</label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="IIT Bombay / University of Delhi / MIT">IIT Bombay / University of Delhi / MIT</option>
                    <option value="Delhi Technological University (DTU)">Delhi Technological University (DTU)</option>
                    <option value="BITS Pilani">BITS Pilani</option>
                    <option value="National Institute of Technology (NIT)">National Institute of Technology (NIT)</option>
                    <option value="Other University / College">Other University / College</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Degree / Course</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                  >
                    <option value="B.Tech (Computer Science)">B.Tech (Computer Science)</option>
                    <option value="B.Tech (Information Technology)">B.Tech (Information Technology)</option>
                    <option value="MCA / M.Tech CS">MCA / M.Tech CS</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 2: PLACEMENT GOALS & PREPARATION PREFERENCES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 3: PLACEMENT GOALS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Placement Goals</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Your target role, companies and timeline.</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-50 text-blue-600 text-xs font-bold">
                  Edit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Ring Visual */}
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="w-14 h-14 rounded-full border-4 border-blue-500 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-800 mt-2 text-center">Set Your Targets</span>
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Role</span>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="text-xs font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Companies</span>
                      <input
                        type="text"
                        value={targetCompanies}
                        onChange={(e) => setTargetCompanies(e.target.value)}
                        className="text-xs font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Date</span>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="text-xs font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-700 font-medium">
                Complete your placement goals to get a personalized learning roadmap.
              </div>
            </div>

            {/* CARD 4: PREPARATION PREFERENCES */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Preparation Preferences</h3>
                    <p className="text-[11px] text-slate-400 font-medium">When and how you like to prepare.</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-50 text-amber-600 text-xs font-bold">
                  Edit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <Clock className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 block">Daily Preparation Time</span>
                  <select
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="w-full text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none"
                  >
                    <option value="1-2 hours">1-2 hours / day</option>
                    <option value="2-3 hours">2-3 hours / day</option>
                    <option value="4+ hours">4+ hours / day</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <Calendar className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700 block">Preferred Study Time</span>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none"
                  >
                    <option value="Morning (6 AM - 12 PM)">Morning (6 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                    <option value="Evening / Night">Evening / Night (5 PM - 12 AM)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* ROW 3: ADDITIONAL DETAILS & ACCOUNT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 5: ADDITIONAL DETAILS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Additional Details</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Help us understand your preparation better.</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-50 text-emerald-600 text-xs font-bold">
                  Edit
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows="4"
                  maxLength={500}
                  value={preparationDetails}
                  onChange={(e) => setPreparationDetails(e.target.value)}
                  placeholder="Add any additional details about your preparation, interests, background, or other relevant information..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600 placeholder:text-slate-400"
                />
                <span className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono">
                  {preparationDetails.length}/500
                </span>
              </div>
            </div>

            {/* CARD 6: ACCOUNT DETAILS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Account Details</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Your account information and settings.</p>
                  </div>
                </div>

                <Lock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Account Created</span>
                  <p className="font-extrabold text-slate-900">01 Oct 2025</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Last Login</span>
                  <p className="font-extrabold text-slate-900">Today, Active</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                    Student
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR (3 COLS): QUICK ACTIONS, PROMO BOXES, NEED HELP */}
        <div className="lg:col-span-3 space-y-6">

          {/* CARD 1: QUICK ACTIONS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black text-slate-900">Quick Actions</h3>
            </div>

            <div className="space-y-1.5 text-xs font-semibold">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <span>Update Photo</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleSaveChanges}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Edit Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Key className="w-4 h-4 text-slate-400" />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => alert('Notifications are enabled for mock assessments and study reminders.')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-indigo-600 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Notification Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* CARD 2: SCENIC GOAL PROMO BOX */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-md space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200">Set Your Goals</span>
              <h4 className="text-sm font-black text-white leading-tight">Turn your dreams into a clear roadmap!</h4>
            </div>

            <button
              onClick={() => navigate('/student/roadmap')}
              className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold inline-flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Go to Placement Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CARD 3: NEED HELP AI COACH BOX */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Need Help?</h4>
                <p className="text-[10px] text-slate-500">Ask AI Coach</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Get personalized guidance, explanations and study plans.
            </p>

            <button
              onClick={() => navigate('/student/ai-coach')}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Chat Now →
            </button>
          </div>

          {/* CARD 4: MOTIVATIONAL QUOTE CARD */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-2">
            <span className="text-3xl font-serif text-indigo-300 block">“</span>
            <p className="text-xs text-slate-700 font-bold italic">
              "Your future is built by what you do today."
            </p>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">— PathPilot</span>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM ACTIONS STICKY BAR */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">All set!</h4>
            <p className="text-[11px] text-slate-500">Your profile is almost complete. Update the remaining details to unlock your personalized roadmap.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            onClick={fetchProfileData}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-95 text-white text-xs font-extrabold shadow-md flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Changes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  alert('Password changed successfully!');
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileSettings;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  ArrowRight,
  Clock,
  Target,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCw,
  BookOpen,
  Layers,
  Compass,
  FileQuestion,
  HelpCircle,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AssessmentReady = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAssessmentData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      // 1. Fetch Student Profile for context
      const profileRes = await API.get('/student/profile').catch(() => null);
      if (profileRes?.data?.success && profileRes?.data?.data) {
        setProfile(profileRes.data.data);
      }

      // 2. Fetch Published Initial Baseline Assessment from Admin Assessment Engine
      const baselineRes = await API.get('/student/assessment/baseline').catch(() => null);
      if (baselineRes?.data?.success && baselineRes?.data?.data) {
        setAssessment(baselineRes.data.data);
        setAssessments([baselineRes.data.data]);
      } else {
        // Fallback check published assessments list for assessmentPurpose === 'INITIAL_BASELINE'
        const assListRes = await API.get('/student/assessments').catch(() => null);
        if (assListRes?.data?.success && Array.isArray(assListRes.data?.data)) {
          const publishedList = assListRes.data.data;
          const baselineDoc = publishedList.find(a => a.assessmentPurpose === 'INITIAL_BASELINE');
          if (baselineDoc) {
            const detailRes = await API.get(`/student/assessments/${baselineDoc.assessmentId || baselineDoc._id}`);
            if (detailRes.data?.success && detailRes.data?.data) {
              setAssessment(detailRes.data.data);
              setAssessments([detailRes.data.data]);
            } else {
              setAssessment(null);
              setAssessments([]);
            }
          } else {
            setAssessment(null);
            setAssessments([]);
          }
        } else {
          setAssessments([]);
          setAssessment(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load assessment information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-indigo-700">Checking assessment availability...</p>
      </div>
    );
  }

  // CASE 1: NO PUBLISHED ASSESSMENT EXISTS YET
  if (!assessment && assessments.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-lg p-8 sm:p-10 space-y-8 text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/70 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
            <Clock className="w-8 h-8" />
          </div>

          {/* Heading */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>Assessment Setup Pending</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Your Initial Assessment Is Being Prepared
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              No assessment is currently published. Your placement coach or administrator is preparing your diagnostic assessment blueprint. As soon as an assessment is approved and published, it will be ready for you here.
            </p>
          </div>

          {/* Diagnostic Pillars Preview Card */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 text-left space-y-4 relative z-10">
            <div className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
              What your initial assessment will evaluate:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Strong Topics:</strong> Areas where you already demonstrate high accuracy</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Target className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Developing Topics:</strong> Concepts that need targeted pattern practice</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Weak & Critical Topics:</strong> Topics requiring conceptual reinforcement</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Brain className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-slate-700"><strong>Knowledge Gaps:</strong> Precise pattern and concept disconnects</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => fetchAssessmentData(true)}
              disabled={refreshing}
              className="w-full sm:w-auto px-6 py-3 rounded-xl btn-primary font-bold text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking...' : 'Check for Available Assessments'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: PUBLISHED ASSESSMENT IS AVAILABLE
  const targetAssessmentId = assessment.assessmentId || assessment._id;
  const subjectsList = Array.isArray(assessment.subjects) && assessment.subjects.length > 0
    ? assessment.subjects.map(s => s.toUpperCase()).join(', ')
    : 'DSA, APTITUDE, CS CORE';

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-6">

        {/* Top Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Placement Diagnostic Assessment</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Let's Understand Where You Stand
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Your placement readiness score and personalized roadmap are generated directly from this assessment. Take this initial test to benchmark your real knowledge without guessing.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* What This Assessment Identifies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Strong & Developing</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Identifies topics where you already show high accuracy and fast problem-solving.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center space-x-2 text-rose-600 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Weak Topics & Gaps</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Pinpoints exact concept, pattern, and practice disconnects for prioritized review.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>Current Readiness Level</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Calculates your initial Placement Readiness Score to guide daily prep pacing.
            </p>
          </div>
        </div>

        {/* Main Assessment Specification Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">

          {/* Assessment Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {assessment.title || 'Placement Diagnostic Assessment'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {assessment.description || 'Admin-curated placement readiness diagnostic.'}
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto font-mono">
              Ready to Attempt
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duration</span>
              </div>
              <div className="text-base font-black text-slate-900">
                {assessment.durationMinutes || 30} Minutes
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <FileQuestion className="w-3.5 h-3.5 text-indigo-600" />
                <span>Questions</span>
              </div>
              <div className="text-base font-black text-slate-900">
                {assessment.questionCount || 10} Questions
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Marks</span>
              </div>
              <div className="text-base font-black text-slate-900">
                {assessment.totalMarks || assessment.questionCount || 10} Marks
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Marking Scheme</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {assessment.negativeMarking
                  ? `+${assessment.marksPerQuestion || 1} / -${assessment.negativeMarks || 0.25}`
                  : `+${assessment.marksPerQuestion || 1} (No Neg.)`}
              </div>
            </div>
          </div>

          {/* Subjects Covered */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-950">Subjects Covered:</span>
            <span className="font-mono font-bold text-indigo-700">{subjectsList}</span>
          </div>

          {/* Instructions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Assessment Instructions
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Server-synchronized timer begins as soon as you click <strong>Start Assessment Now</strong>.</li>
              <li>Scoring is authoritative and calculated by the backend grading engine upon submission.</li>
              <li>Do not refresh or navigate away from the test window during the active session.</li>
              <li>Your objective results immediately drive your AI Analysis, Knowledge Gaps, and Personalized Roadmap.</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/student/assessments/take/${targetAssessmentId}`}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl btn-primary font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Assessment Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Candidate Context Pill */}
        <div className="text-center text-xs text-slate-500">
          Candidate: <span className="font-bold text-slate-700">{profile?.user?.name || user?.name}</span> • College: <span className="font-bold text-slate-700">{profile?.college || 'Not set'}</span> • Target: <span className="font-bold text-slate-700">{profile?.targetRoles?.[0] || 'Software Engineer'}</span>
        </div>

      </div>
    </div>
  );
};

export default AssessmentReady;

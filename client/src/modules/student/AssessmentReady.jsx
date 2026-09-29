import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  ArrowRight,
  ArrowLeft,
  Code2,
  Target,
  Database,
  Calendar,
  Clock,
  Briefcase,
  Building2,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';

const AssessmentReady = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isBaseline = !assessmentId || assessmentId === 'baseline';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch Student Profile
        const profileRes = await API.get('/student/profile').catch(() => null);
        if (profileRes?.data?.success && profileRes?.data?.data) {
          setProfile(profileRes.data.data);
        }

        // If specific published assessment requested, fetch its details
        if (!isBaseline) {
          const assRes = await API.get(`/student/assessments/${assessmentId}`);
          if (assRes.data?.success && assRes.data?.data) {
            setAssessment(assRes.data.data);
          } else {
            setError(assRes.data?.message || 'Assessment details could not be retrieved');
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load assessment information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assessmentId, isBaseline]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            to="/student/assessment"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Assessments</span>
          </Link>
        </div>

        {/* Header Indicator */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isBaseline ? 'Baseline Placement Diagnostic' : 'Curated Assessment Ready'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isBaseline
              ? 'Your Diagnostic Assessment is Ready!'
              : (assessment?.title || 'Placement Assessment')}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            {isBaseline
              ? "We'll assess your current foundation across Data Structures & Algorithms, Aptitude, and CS Core to build your placement readiness score."
              : (assessment?.description || 'Take this timed assessment to benchmark your skills against technical placement requirements.')}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Assessment Specification Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {profile?.user?.name || 'Student Candidate'}
                </h2>
                <div className="text-xs text-slate-500">{profile?.college || 'Registered Student'}</div>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono">
              Ready to Begin
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duration</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {isBaseline ? '20 Minutes' : `${assessment?.durationMinutes || 30} Minutes`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Questions</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {isBaseline ? '15 Questions' : `${assessment?.questionCount || 5} Questions`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Marking Scheme</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {isBaseline
                  ? '+1 per correct'
                  : assessment?.negativeMarking
                  ? `+${assessment?.marksPerQuestion || 1} / -${assessment?.negativeMarks || 0.25}`
                  : `+${assessment?.marksPerQuestion || 1} (No negative)`}
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Assessment Instructions
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Server-synchronized timer begins immediately when you click <strong>Start Assessment</strong>.</li>
              <li>You can navigate questions using the question palette and flag questions for review.</li>
              <li>Scoring is computed authoritatively on the backend upon submission.</li>
              <li>Your results directly update your knowledge gaps and personalized roadmap.</li>
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isBaseline ? (
            <Link
              to="/student/baseline-assessment"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-primary font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Baseline Assessment</span>
            </Link>
          ) : (
            <Link
              to={`/student/assessments/take/${assessmentId}`}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-primary font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Assessment Now</span>
            </Link>
          )}

          <Link
            to="/student/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl btn-secondary font-semibold text-xs flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AssessmentReady;

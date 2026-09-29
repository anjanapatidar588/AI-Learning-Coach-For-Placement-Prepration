import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCw,
  BookOpen,
  Target,
  Brain,
  ChevronRight,
  ShieldAlert,
  Play,
  Check,
  SkipForward,
  LayoutDashboard
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StudentRoadmap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/roadmap`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setRoadmapData(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch roadmap');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/roadmap/recalculate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (resData.success) {
        setRoadmapData(resData.data);
      }
    } catch (err) {
      console.error('Error recalculating roadmap:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleUpdateNodeStatus = async (nodeId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/student/roadmap/nodes/${nodeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await response.json();
      if (resData.success) {
        setRoadmapData(resData.data);
      }
    } catch (err) {
      console.error('Error updating node status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-indigo-600">Loading your personalized learning roadmap...</p>
      </div>
    );
  }

  if (error || !roadmapData) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Roadmap Unavailable</h3>
        <p className="text-xs text-slate-600">{error || 'No roadmap generated yet. Complete an assessment to generate your personalized learning plan.'}</p>
        <button
          onClick={handleRecalculate}
          className="btn-primary text-xs px-5 py-2.5 inline-flex items-center space-x-2"
        >
          <RotateCw className="w-4 h-4" />
          <span>Generate Personalized Roadmap</span>
        </button>
      </div>
    );
  }

  const {
    nodes = [],
    learningMapBySubject = {},
    overallProgressPercent = 0,
    currentLearningItem,
    todayRecommendedTasks = [],
    strongAreas = [],
    weakAreas = [],
    knowledgeGaps = [],
    studentContext = {},
    adaptiveSummary = {}
  } = roadmapData;

  const subjects = Object.keys(learningMapBySubject);

  const getPriorityBadge = (priority) => {
    switch ((priority || '').toUpperCase()) {
      case 'CRITICAL':
        return 'badge-hard';
      case 'HIGH':
        return 'badge-medium';
      case 'MEDIUM':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return { label: 'Completed', class: 'badge-easy', icon: CheckCircle2 };
      case 'in_progress':
      case 'current':
        return { label: 'In Progress', class: 'badge-info animate-pulse', icon: Play };
      case 'skipped':
        return { label: 'Skipped', class: 'badge-neutral', icon: SkipForward };
      default:
        return { label: 'Upcoming', class: 'badge-neutral', icon: Clock };
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 lg:p-8 border border-slate-200/80 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold font-mono tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Personalized AI Learning Map</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Your Adaptive Placement Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Tailored specifically to your assessment performance, target role ({studentContext.targetRole}), daily preparation time ({studentContext.dailyPreparationTime}), and weak area priorities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-600" />
              <span>Go to Dashboard</span>
            </button>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="btn-primary text-xs px-4 py-2.5 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
              <span>{recalculating ? 'Recalculating...' : 'Re-sync Roadmap'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-mono font-bold tracking-wider">Overall Progress</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-black text-slate-900">{overallProgressPercent}%</span>
              <span className="text-xs text-emerald-600 font-bold">({adaptiveSummary.completedNodesCount}/{adaptiveSummary.totalNodes} Topics)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-mono font-bold tracking-wider">Daily Capacity</span>
            <div className="text-sm font-bold text-indigo-900 mt-1 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{studentContext.dailyPreparationTime || '1-2 hours'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-mono font-bold tracking-wider">Target Date</span>
            <div className="text-sm font-bold text-emerald-800 mt-1 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {adaptiveSummary.daysRemainingTargetDate !== null && adaptiveSummary.daysRemainingTargetDate !== undefined
                  ? `${adaptiveSummary.daysRemainingTargetDate} days left`
                  : 'Flexible schedule'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-mono font-bold tracking-wider">Focus Priority</span>
            <div className="text-sm font-bold text-rose-800 mt-1 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{weakAreas.length > 0 ? `${weakAreas.length} Weak Areas` : 'Optimal Momentum'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Card: Current Learning Item */}
      {currentLearningItem && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500/40 shadow-md relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  CURRENT TARGET NODE
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(currentLearningItem.priority)}`}>
                  {currentLearningItem.priority || 'High'} Priority
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <span>{currentLearningItem.topicName}</span>
                <span className="text-xs text-slate-500 font-normal">({currentLearningItem.subject?.toUpperCase()})</span>
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                <strong className="text-indigo-700">Why now:</strong> {currentLearningItem.reason || 'Recommended based on assessment analysis.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => {
                  const targetId = currentLearningItem.topicId?._id || currentLearningItem.topicId || currentLearningItem.nodeId?.replace('node-', '');
                  navigate(`/student/learn/${targetId}`);
                }}
                className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-2"
              >
                <span>Start Guided Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateNodeStatus(currentLearningItem.nodeId, 'completed')}
                className="btn-secondary text-xs px-3.5 py-2.5 flex items-center space-x-1.5"
                title="Mark Completed"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Mark Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject-Wise Learning Map (COMPLETED / CURRENT / UPCOMING) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>Learning Path Timeline (Completed / Current / Upcoming)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Visual journey path of your technical prep topics.</p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setActiveTab(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                  activeTab === s ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Sequence Nodes */}
        <div className="space-y-4">
          {nodes
            .filter(node => activeTab === 'all' || (node.subject || '').toLowerCase() === activeTab.toLowerCase())
            .map((node, index) => {
              const statusInfo = getStatusBadge(node.status);
              const StatusIcon = statusInfo.icon;
              const isCurrent = node.status === 'in_progress' || node.status === 'current' || currentLearningItem?.nodeId === node.nodeId;
              const isCompleted = node.status === 'completed';

              return (
                <div
                  key={node.nodeId || index}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : isCurrent
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-700 uppercase px-2 py-0.5 rounded bg-white border border-indigo-200">
                          {node.subject}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(node.priority)}`}>
                          {node.priority} Priority
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{node.topicName}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{node.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                    <button
                      onClick={() => {
                        const targetId = node.topicId?._id || node.topicId || node.nodeId?.replace('node-', '');
                        navigate(`/student/learn/${targetId}`);
                      }}
                      className={isCurrent ? 'btn-primary text-xs px-4 py-2' : 'btn-secondary text-xs px-4 py-2'}
                    >
                      <span>{isCompleted ? 'Review Topic' : isCurrent ? 'Continue Learning' : 'Start Topic'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default StudentRoadmap;

import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Target,
  Award,
  BookOpen,
  MapPin,
  AlertTriangle
} from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [baselineFilter, setBaselineFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Student Detail Modal state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [baselineFilter, skillFilter, page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (baselineFilter !== 'all') params.baselineStatus = baselineFilter;
      if (skillFilter !== 'all') params.skillLevel = skillFilter;

      const res = await API.get('/admin/students', { params });
      if (res.data?.success) {
        const studentList = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.students || [];
        const pag = res.data.pagination || res.data.data?.pagination || { total: 0, pages: 1, limit: 10, page: 1 };
        setStudents(studentList);
        setPagination(pag);
      } else {
        setError(res.data?.message || 'Failed to fetch students.');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      const status = err.response?.status;
      const message = status === 403
        ? 'Admin access required.'
        : status === 401
        ? 'Authentication required.'
        : 'Unable to load student directory.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClearFilters = () => {
    setSearch('');
    setBaselineFilter('all');
    setSkillFilter('all');
    setPage(1);
  };

  const handleViewStudentDetail = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);

    try {
      const res = await API.get(`/admin/students/${studentId}`);
      if (res.data?.success) {
        setDetailData(res.data.data);
      } else {
        setDetailError(res.data?.message || 'Failed to fetch student details.');
      }
    } catch (err) {
      console.error('Failed to load student detail:', err);
      setDetailError(err.response?.data?.message || 'Could not load student profile.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Student Directory & Monitoring</h1>
            <p className="text-xs text-slate-400 mt-0.5">Monitor registered student performance, readiness indices, and learning milestones.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Baseline Status Filter */}
          <div>
            <select
              value={baselineFilter}
              onChange={(e) => { setBaselineFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
            >
              <option value="all">All Baseline Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Skill Level Filter */}
          <div>
            <select
              value={skillFilter}
              onChange={(e) => { setSkillFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
            >
              <option value="all">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>Filter</span>
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Student Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Loading registered students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No students found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered students matched your query filters or the system database has no active student records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Skill Level</th>
                  <th className="py-3 px-4">Baseline Assessment</th>
                  <th className="py-3 px-4">Placement Readiness</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {students.map((s) => {
                  const readiness = typeof s.readinessScore === 'number' ? s.readinessScore : 0;
                  return (
                    <tr key={s._id || s.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                          {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="truncate">{s.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {s.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {s.currentSkillLevel || 'Intermediate'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {s.baselineAssessmentCompleted ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done ({s.baselineScore || 0}%)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-purple-300">{readiness}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {s.targetRole || 'SDE-1'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewStudentDetail(s._id || s.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && students.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-white">{pagination.pages}</span> ({pagination.total} total students)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 w-full max-w-4xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-200 font-bold text-base">
                  {detailData?.profile?.name ? detailData.profile.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{detailData?.profile?.name || 'Student Overview'}</h2>
                  <p className="text-xs text-slate-400 font-mono">{detailData?.profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono">
                  MONITORING MODE (READ-ONLY)
                </span>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Fetching student learning profile and performance statistics...</p>
              </div>
            ) : detailError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{detailError}</span>
              </div>
            ) : detailData ? (
              <div className="space-y-6">
                {/* Section 1: Profile & Target Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5 text-blue-400" />
                      <span>Target Role</span>
                    </span>
                    <p className="font-semibold text-xs text-white truncate">{detailData.profile.targetRole}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>Skill Level</span>
                    </span>
                    <p className="font-semibold text-xs text-white">{detailData.profile.currentSkillLevel}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Baseline Assessment</span>
                    </span>
                    <p className="font-semibold text-xs text-white">
                      {detailData.profile.baselineAssessmentCompleted
                        ? `Completed (${detailData.profile.baselineScore}%)`
                        : 'Baseline Pending'}
                    </p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Enrolled Date</span>
                    </span>
                    <p className="font-semibold text-xs text-white font-mono">
                      {detailData.profile.createdAt ? new Date(detailData.profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Section 2: Placement Readiness */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span>Placement Readiness Overview</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      detailData.readiness.level === 'Placement Ready' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      detailData.readiness.level === 'Good' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      detailData.readiness.level === 'Developing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {detailData.readiness.level}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-extrabold text-white">{detailData.readiness.score}%</span>
                        <span className="text-xs text-slate-400">Readiness Score</span>
                      </div>
                      <p className="text-xs text-slate-300">{detailData.readiness.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-[10px] font-mono shrink-0">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">DSA Acc</span>
                        <span className="text-purple-300 font-bold">{detailData.readiness.breakdown?.dsa || 0}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Apt Acc</span>
                        <span className="text-purple-300 font-bold">{detailData.readiness.breakdown?.aptitude || 0}%</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">CS Acc</span>
                        <span className="text-purple-300 font-bold">{detailData.readiness.breakdown?.csCore || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Domain Performance Metrics */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Practice & Domain Performance</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* DSA */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">DSA Module</span>
                        <span className="font-mono text-purple-400 font-bold">{detailData.performance.domains?.dsa?.accuracy || 0}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {detailData.performance.domains?.dsa?.passedAttempts || 0} passed / {detailData.performance.domains?.dsa?.totalAttempts || 0} attempts
                      </p>
                    </div>

                    {/* Aptitude */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">Aptitude Module</span>
                        <span className="font-mono text-purple-400 font-bold">{detailData.performance.domains?.aptitude?.accuracy || 0}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {detailData.performance.domains?.aptitude?.passedAttempts || 0} passed / {detailData.performance.domains?.aptitude?.totalAttempts || 0} attempts
                      </p>
                    </div>

                    {/* CS Core */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">CS Core Module</span>
                        <span className="font-mono text-purple-400 font-bold">{detailData.performance.domains?.csCore?.accuracy || 0}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {detailData.performance.domains?.csCore?.passedAttempts || 0} passed / {detailData.performance.domains?.csCore?.totalAttempts || 0} attempts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Weak Areas & Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weak Areas */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Detected Weak Areas</span>
                    </h3>

                    {!detailData.weakAreas || detailData.weakAreas.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No weak areas detected yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {detailData.weakAreas.map((w, idx) => (
                          <div key={w._id || idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-200">{w.topic}</p>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{w.category}</span>
                            </div>
                            <div className="flex items-center space-x-2 font-mono text-[11px]">
                              <span className="text-rose-400 font-bold">{w.accuracy}% Acc</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                w.severity === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {w.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity Stream */}
                  <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Recent Activity Log</span>
                    </h3>

                    {!detailData.recentActivity || detailData.recentActivity.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No practice activity recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {detailData.recentActivity.map((act) => (
                          <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-200">{act.title}</p>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{act.category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                act.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {act.status}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;


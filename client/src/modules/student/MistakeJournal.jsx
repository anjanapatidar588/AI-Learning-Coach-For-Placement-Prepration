import React, { useState, useEffect } from 'react';
import {
  BookX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  Tag,
  BookOpen,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

const CATEGORY_LABELS = {
  CONCEPT_NOT_CLEAR: 'Concept Not Clear',
  PATTERN_NOT_RECOGNIZED: 'Pattern Not Recognized',
  LOGIC_MISTAKE: 'Logic Mistake',
  CODING_IMPLEMENTATION_MISTAKE: 'Coding / Implementation Mistake',
  TIME_PRESSURE: 'Time Pressure',
  CARELESS_MISTAKE: 'Careless Mistake',
  DID_NOT_UNDERSTAND_QUESTION: "Didn't Understand Question"
};

const CATEGORY_COLORS = {
  CONCEPT_NOT_CLEAR: 'bg-rose-50 text-rose-700 border-rose-200',
  PATTERN_NOT_RECOGNIZED: 'bg-amber-50 text-amber-700 border-amber-200',
  LOGIC_MISTAKE: 'bg-purple-50 text-purple-700 border-purple-200',
  CODING_IMPLEMENTATION_MISTAKE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TIME_PRESSURE: 'bg-orange-50 text-orange-700 border-orange-200',
  CARELESS_MISTAKE: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  DID_NOT_UNDERSTAND_QUESTION: 'bg-sky-50 text-sky-700 border-sky-200'
};

const MistakeJournal = () => {
  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, unresolved: 0, categoryBreakdown: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterResolved, setFilterResolved] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingMistake, setEditingMistake] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetchMistakes();
  }, [filterSubject, filterCategory, filterResolved]);

  const fetchMistakes = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterSubject) queryParams.append('subject', filterSubject);
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterResolved !== '') queryParams.append('resolved', filterResolved);

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/mistakes?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMistakes(data.mistakes || []);
        setStats(data.stats || { total: 0, resolved: 0, unresolved: 0, categoryBreakdown: {} });
      } else {
        setError(data.message || 'Failed to fetch mistakes');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (mistakeId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/mistakes/${mistakeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resolved: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchMistakes();
      }
    } catch (err) {
      console.error('Error toggling resolve status:', err);
    }
  };

  const handleDeleteMistake = async (mistakeId) => {
    if (!window.confirm('Are you sure you want to remove this mistake from your journal?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/mistakes/${mistakeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMistakes();
      }
    } catch (err) {
      console.error('Error deleting mistake:', err);
    }
  };

  const startEdit = (mistake) => {
    setEditingMistake(mistake);
    setEditNote(mistake.learningNote || '');
    setEditCategory(mistake.mistakeCategory || 'CONCEPT_NOT_CLEAR');
  };

  const handleSaveEdit = async () => {
    if (!editingMistake) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/mistakes/${editingMistake._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          learningNote: editNote,
          mistakeCategory: editCategory
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingMistake(null);
        fetchMistakes();
      }
    } catch (err) {
      console.error('Error saving mistake edit:', err);
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (!searchQuery) return true;
    const qText = m.questionId?.title || '';
    const noteText = m.learningNote || '';
    const catText = CATEGORY_LABELS[m.mistakeCategory] || '';
    return (
      qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catText.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <BookX className="w-7 h-7 text-rose-600" />
            <span>Your Mistake Journal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mistakes are signals showing you what to learn next.
          </p>
        </div>
        <button
          onClick={fetchMistakes}
          className="btn-secondary text-xs px-3.5 py-2 flex items-center space-x-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Journal</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Total Mistakes</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-rose-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase font-mono">Unresolved Mistakes</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.unresolved}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-emerald-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase font-mono">Resolved Mistakes</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Breakdown bar */}
      {stats.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Mistake Category Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
              const count = stats.categoryBreakdown[catKey] || 0;
              const colorStyle = CATEGORY_COLORS[catKey] || 'bg-slate-100 text-slate-700 border-slate-200';
              return (
                <div
                  key={catKey}
                  onClick={() => setFilterCategory(filterCategory === catKey ? '' : catKey)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${colorStyle} ${
                    filterCategory === catKey ? 'ring-2 ring-indigo-600 scale-105 font-bold shadow-xs' : 'hover:opacity-90'
                  }`}
                >
                  <div className="text-base font-black">{count}</div>
                  <div className="text-[10px] font-semibold truncate mt-0.5" title={label}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search mistakes by question, topic, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-standard pl-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="select-standard text-xs py-2"
          >
            <option value="">All Subjects</option>
            <option value="dsa">DSA</option>
            <option value="aptitude">Aptitude</option>
            <option value="cs_core">CS Core</option>
            <option value="DBMS">DBMS</option>
            <option value="OS">OS</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-standard text-xs py-2"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Resolved Filter */}
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="select-standard text-xs py-2"
          >
            <option value="">All Statuses</option>
            <option value="false">Unresolved Only</option>
            <option value="true">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Mistake List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
          <p className="text-xs font-semibold">Loading Mistake Journal entries...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
          {error}
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="empty-state-card py-12 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-1" />
          <h3 className="text-base font-bold text-slate-900">No Mistakes Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterSubject || filterCategory || filterResolved
              ? 'No mistakes match your filter criteria. Try adjusting your search or filters.'
              : 'Your mistake journal will grow as you practice. Learn from errors to target weaknesses.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((m) => {
            const qTitle = m.questionId?.title || 'Practice Question';
            const topicName = m.topicId?.name || m.topicId?.title || 'General Topic';
            const catLabel = CATEGORY_LABELS[m.mistakeCategory] || m.mistakeCategory;
            const catClass = CATEGORY_COLORS[m.mistakeCategory] || 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={m._id}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-xs ${
                  m.resolved ? 'border-slate-200/60 opacity-80' : 'border-slate-200/80 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${catClass}`}>
                      {catLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {m.subject || 'DSA'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>{qTitle}</span>
                    <span className="text-xs text-indigo-700 font-semibold">Topic: {topicName}</span>
                  </h3>

                  {m.shortDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed">{m.shortDescription}</p>
                  )}

                  {m.learningNote && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span className="text-indigo-700 font-bold block mb-1">Learning Note:</span>
                      {m.learningNote}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleResolve(m._id, m.resolved)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      m.resolved
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {m.resolved ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mark Unresolved</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(m)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit note/category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMistake(m._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete mistake"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingMistake && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 space-y-4 max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Mistake Entry</h3>
              <button onClick={() => setEditingMistake(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mistake Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="select-standard text-xs"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Learning Note</label>
                <textarea
                  rows={4}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="input-standard text-xs"
                  placeholder="Write your key takeaway..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingMistake(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary text-xs px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakeJournal;

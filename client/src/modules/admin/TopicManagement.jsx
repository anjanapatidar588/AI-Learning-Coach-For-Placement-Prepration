import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';

const CATEGORY_LABELS = {
  dsa: 'DSA',
  aptitude: 'Aptitude',
  cs_core: 'CS Core'
};

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Form State
  const initialFormState = {
    title: '',
    category: 'dsa',
    subject: 'Data Structures',
    difficulty: 'Medium',
    order: 0,
    summary: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTopics();
  }, [categoryFilter, difficultyFilter, page]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 10 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const res = await API.get('/admin/topics', { params });
      if (res.data?.success) {
        const topicList = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.topics || [];
        const pag = res.data.pagination || res.data.data?.pagination || { total: 0, pages: 1, limit: 10, page: 1 };
        setTopics(topicList);
        setPagination(pag);
      } else {
        setError(res.data?.message || 'Failed to fetch topics.');
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      const status = err.response?.status;
      const message = status === 403
        ? 'Admin access required.'
        : status === 401
        ? 'Authentication required.'
        : 'Unable to load topic directory.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTopics();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalError(null);
    setFormData({
      ...initialFormState,
      subject: categoryFilter === 'aptitude' ? 'Quantitative Aptitude' : categoryFilter === 'cs_core' ? 'Computer Science' : 'Data Structures'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (t) => {
    setIsEditing(true);
    setEditingId(t._id || t.id);
    setModalError(null);
    setFormData({
      title: t.title || t.name || '',
      category: t.category || 'dsa',
      subject: t.subject || '',
      difficulty: t.difficulty || 'Medium',
      order: typeof t.order === 'number' ? t.order : 0,
      summary: t.summary || '',
      description: t.description || ''
    });
    setShowModal(true);
  };

  const handleCategoryChangeInForm = (newCategory) => {
    let defaultSubject = 'Data Structures';
    if (newCategory === 'aptitude') defaultSubject = 'Quantitative Aptitude';
    if (newCategory === 'cs_core') defaultSubject = 'Computer Science';

    setFormData(prev => ({
      ...prev,
      category: newCategory,
      subject: defaultSubject
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.title.trim()) {
      setModalError('Topic title is required.');
      return;
    }
    if (!formData.subject.trim()) {
      setModalError('Subject is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      subject: formData.subject.trim(),
      difficulty: formData.difficulty,
      order: parseInt(formData.order, 10) || 0,
      summary: formData.summary.trim(),
      description: formData.description.trim()
    };

    try {
      setActionLoading(true);
      let res;
      if (isEditing) {
        res = await API.put(`/admin/topics/${editingId}`, payload);
      } else {
        res = await API.post('/admin/topics', payload);
      }

      if (res.data?.success) {
        setSuccessMessage(isEditing ? 'Topic updated successfully!' : 'Topic created successfully!');
        setShowModal(false);
        fetchTopics();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setModalError(res.data?.message || 'Action failed.');
      }
    } catch (err) {
      console.error('Error saving topic:', err);
      setModalError(err.response?.data?.message || 'Server error occurred while saving topic.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDeleteModal = (t) => {
    setDeletingTopic(t);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopic) return;
    setDeleteError(null);

    try {
      setActionLoading(true);
      const res = await API.delete(`/admin/topics/${deletingTopic._id || deletingTopic.id}`);
      if (res.data?.success) {
        setSuccessMessage('Topic deleted successfully.');
        setShowDeleteModal(false);
        setDeletingTopic(null);
        fetchTopics();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setDeleteError(res.data?.message || 'Failed to delete topic.');
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
      const msg = err.response?.data?.message || 'Failed to delete topic due to server error.';
      setDeleteError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Topic & Syllabus Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage learning topics across DSA, Aptitude, and CS Core modules.</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Top Banner Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

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
              placeholder="Search topics by title or subject..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
            >
              <option value="all">All Categories</option>
              <option value="dsa">DSA</option>
              <option value="aptitude">Aptitude</option>
              <option value="cs_core">CS Core</option>
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={difficultyFilter}
              onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
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

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Loading topic bank...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No topics found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No learning topics matched your current filters or the topic database is empty.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Topic Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Linked Questions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {topics.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs truncate">
                      {t.title || t.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-purple-950/60 border border-purple-500/30 text-purple-300">
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {t.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-300 font-semibold">
                      {typeof t.questionCount === 'number' ? `${t.questionCount} questions` : '0 questions'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Edit Topic"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(t)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && topics.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-white">{pagination.pages}</span> ({pagination.total} total topics)
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-purple-400" />
                <span>{isEditing ? 'Edit Topic' : 'Create New Topic'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="dsa">DSA</option>
                    <option value="aptitude">Aptitude</option>
                    <option value="cs_core">CS Core</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Data Structures"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Topic Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Arrays & Hashing"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Difficulty & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Order / Sequence Index</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Topic Summary</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Short overview of the topic..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed topic scope and learning objectives..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? 'Update Topic' : 'Create Topic'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 w-full max-w-md space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-base font-bold text-white">Confirm Topic Deletion</h2>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">"{deletingTopic.title || deletingTopic.name}"</span>?
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <p className="font-semibold mb-0.5">Deletion Prevented</p>
                <p className="text-[11px]">{deleteError}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeletingTopic(null); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Topic</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManagement;

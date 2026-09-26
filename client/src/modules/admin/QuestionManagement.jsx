import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  FileQuestion,
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
  Code,
  CheckSquare,
  BookOpen
} from 'lucide-react';

const CATEGORY_LABELS = {
  dsa: 'DSA',
  aptitude: 'Aptitude',
  cs_core: 'CS Core'
};

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter & Pagination state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Form State
  const initialFormState = {
    title: '',
    category: 'dsa',
    topicId: '',
    difficulty: 'Easy',
    type: 'coding',
    problemStatement: '',
    solutionCode: '',
    solutionExplanation: '',
    companyTags: '',
    hints: '',
    mcqOptions: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    testCases: [
      { input: '', output: '', isHidden: false }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch topics once on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch questions when filters or page change
  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, difficultyFilter, topicFilter, page]);

  const fetchTopics = async () => {
    try {
      const res = await API.get('/admin/topics');
      if (res.data?.success) {
        const topicsList = Array.isArray(res.data.data) ? res.data.data : res.data.data?.topics || [];
        setTopics(topicsList);
      }
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10
      };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (topicFilter !== 'all') params.topicId = topicFilter;
      if (search.trim()) params.search = search.trim();

      const res = await API.get('/admin/questions', { params });
      if (res.data?.success) {
        const qList = Array.isArray(res.data.data) ? res.data.data : res.data.data?.questions || [];
        const pag = res.data.pagination || res.data.data?.pagination || { total: 0, pages: 1, limit: 10, page: 1 };
        setQuestions(qList);
        setPagination(pag);
      } else {
        setError(res.data?.message || 'Failed to fetch questions.');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      const status = err.response?.status;
      const message = status === 403
        ? 'Admin access required.'
        : status === 401
        ? 'Authentication required.'
        : 'Failed to load question bank.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setTopicFilter('all');
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalError(null);
    
    // Find default topic if available
    const defaultTopic = topics.find(t => t.category === 'dsa')?._id || topics[0]?._id || '';
    setFormData({
      ...initialFormState,
      topicId: defaultTopic
    });
    setShowModal(true);
  };

  const handleOpenEditModal = async (q) => {
    setIsEditing(true);
    setEditingId(q._id);
    setModalError(null);
    setShowModal(true);
    setActionLoading(true);

    try {
      // Fetch full question detail
      const res = await API.get(`/admin/questions/${q._id}`);
      if (res.data?.success) {
        const fullQ = res.data.data;
        setFormData({
          title: fullQ.title || '',
          category: fullQ.category || 'dsa',
          topicId: fullQ.topicId?._id || fullQ.topicId || '',
          difficulty: fullQ.difficulty || 'Easy',
          type: fullQ.type || 'coding',
          problemStatement: fullQ.problemStatement || '',
          solutionCode: fullQ.solutionCode || '',
          solutionExplanation: fullQ.solutionExplanation || '',
          companyTags: Array.isArray(fullQ.companyTags) ? fullQ.companyTags.join(', ') : '',
          hints: Array.isArray(fullQ.hints) ? fullQ.hints.join(', ') : '',
          mcqOptions: Array.isArray(fullQ.mcqOptions) && fullQ.mcqOptions.length > 0
            ? fullQ.mcqOptions.map(opt => ({ text: opt.text || '', isCorrect: !!opt.isCorrect }))
            : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
          testCases: Array.isArray(fullQ.testCases) && fullQ.testCases.length > 0
            ? fullQ.testCases.map(tc => ({ input: tc.input || '', output: tc.expectedOutput || tc.output || '', isHidden: !!tc.isHidden }))
            : [{ input: '', output: '', isHidden: false }]
        });
      } else {
        setModalError('Failed to load full question detail.');
      }
    } catch (err) {
      console.error('Failed to load question details:', err);
      setModalError('Could not retrieve question information.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryChangeInForm = (newCategory) => {
    // Pick first topic matching category
    const matchingTopic = topics.find(t => t.category === newCategory)?._id || '';
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      topicId: matchingTopic,
      type: newCategory === 'dsa' ? 'coding' : 'mcq'
    }));
  };

  // MCQ handlers
  const handleAddMcqOption = () => {
    setFormData(prev => ({
      ...prev,
      mcqOptions: [...prev.mcqOptions, { text: '', isCorrect: false }]
    }));
  };

  const handleRemoveMcqOption = (index) => {
    setFormData(prev => ({
      ...prev,
      mcqOptions: prev.mcqOptions.filter((_, i) => i !== index)
    }));
  };

  const handleMcqOptionChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.mcqOptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, mcqOptions: updated };
    });
  };

  // Test Case handlers
  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '', isHidden: false }]
    }));
  };

  const handleRemoveTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.testCases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testCases: updated };
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Client-side validations
    if (!formData.title.trim()) {
      setModalError('Question title is required.');
      return;
    }
    if (!formData.problemStatement.trim()) {
      setModalError('Problem statement is required.');
      return;
    }
    if (!formData.topicId) {
      setModalError('Please select a valid topic.');
      return;
    }

    if (formData.type === 'mcq') {
      if (!formData.mcqOptions || formData.mcqOptions.length < 2) {
        setModalError('MCQ questions must have at least 2 options.');
        return;
      }
      const hasEmpty = formData.mcqOptions.some(opt => !opt.text.trim());
      if (hasEmpty) {
        setModalError('All MCQ option text fields must be filled out.');
        return;
      }
      const hasCorrect = formData.mcqOptions.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        setModalError('At least one MCQ option must be marked as correct.');
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      topicId: formData.topicId,
      difficulty: formData.difficulty,
      type: formData.type,
      problemStatement: formData.problemStatement.trim(),
      solutionCode: formData.solutionCode,
      solutionExplanation: formData.solutionExplanation,
      companyTags: formData.companyTags.split(',').map(s => s.trim()).filter(Boolean),
      hints: formData.hints.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (formData.type === 'mcq') {
      payload.mcqOptions = formData.mcqOptions.map(opt => ({
        text: opt.text.trim(),
        isCorrect: !!opt.isCorrect
      }));
    }

    if (formData.type === 'coding') {
      payload.testCases = formData.testCases
        .filter(tc => tc.input.trim() || tc.output.trim())
        .map(tc => ({
          input: tc.input.trim(),
          expectedOutput: tc.output.trim(),
          isHidden: !!tc.isHidden
        }));
    }

    try {
      setActionLoading(true);
      let res;
      if (isEditing) {
        res = await API.put(`/admin/questions/${editingId}`, payload);
      } else {
        res = await API.post('/admin/questions', payload);
      }

      if (res.data?.success) {
        setSuccessMessage(isEditing ? 'Question updated successfully!' : 'Question created successfully!');
        setShowModal(false);
        fetchQuestions();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setModalError(res.data?.message || 'Action failed.');
      }
    } catch (err) {
      console.error('Error saving question:', err);
      setModalError(err.response?.data?.message || 'Server error occurred while saving question.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handlers
  const handleOpenDeleteModal = (q) => {
    setDeletingQuestion(q);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    setDeleteError(null);

    try {
      setActionLoading(true);
      const res = await API.delete(`/admin/questions/${deletingQuestion._id}`);
      if (res.data?.success) {
        setSuccessMessage('Question deleted successfully.');
        setShowDeleteModal(false);
        setDeletingQuestion(null);
        fetchQuestions();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setDeleteError(res.data?.message || 'Failed to delete question.');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      const msg = err.response?.data?.message || 'Failed to delete question due to server error.';
      setDeleteError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter topics for form select based on current form category
  const filteredFormTopics = topics.filter(t => t.category === formData.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Question Bank Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage DSA problems, Aptitude MCQs, and CS Core question repositories.</p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
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
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or company tags..."
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
            <p className="text-xs text-slate-400 font-mono">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No questions matched your current filter criteria or the database question bank is empty.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Company Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-xs truncate">
                      {q.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-purple-950/60 border border-purple-500/30 text-purple-300">
                        {CATEGORY_LABELS[q.category] || q.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {q.topicId?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[11px] text-slate-400 font-mono">
                        {q.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {Array.isArray(q.companyTags) && q.companyTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {q.companyTags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {tag}
                            </span>
                          ))}
                          {q.companyTags.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{q.companyTags.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(q)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title="Delete Question"
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
        {!loading && questions.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-white">{pagination.pages}</span> ({pagination.total} total items)
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 w-full max-w-3xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-purple-400" />
                <span>{isEditing ? 'Edit Question' : 'Create New Question'}</span>
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
              {/* Category, Topic, Difficulty & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Topic *</label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData(prev => ({ ...prev, topicId: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="">Select Topic</option>
                    {filteredFormTopics.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

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
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value="coding">Coding Problem</option>
                    <option value="mcq">MCQ Question</option>
                    <option value="descriptive">Descriptive</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Two Sum"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Problem Statement */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Problem Statement *</label>
                <textarea
                  rows={4}
                  value={formData.problemStatement}
                  onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                  placeholder="Detailed problem description..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50 font-sans"
                />
              </div>

              {/* Dynamic MCQ Options Section */}
              {formData.type === 'mcq' && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-purple-300 flex items-center space-x-1.5">
                      <CheckSquare className="w-4 h-4" />
                      <span>MCQ Options (Check the correct answer)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMcqOption}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-[11px] font-medium hover:bg-purple-600/30 transition-colors cursor-pointer"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.mcqOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => handleMcqOptionChange(idx, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer shrink-0"
                          title="Is correct option?"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleMcqOptionChange(idx, 'text', e.target.value)}
                          placeholder={`Option ${idx + 1} text`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                        />
                        {formData.mcqOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMcqOption(idx)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Coding Test Cases & Solution Section */}
              {formData.type === 'coding' && (
                <div className="space-y-4">
                  {/* Test Cases */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-purple-300 flex items-center space-x-1.5">
                        <Code className="w-4 h-4" />
                        <span>Test Cases</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 text-[11px] font-medium hover:bg-purple-600/30 transition-colors cursor-pointer"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.testCases.map((tc, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Test Case #{idx + 1}</span>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                  className="w-3 h-3 accent-purple-600"
                                />
                                <span className="text-[10px]">Hidden</span>
                              </label>
                              {formData.testCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTestCase(idx)}
                                  className="text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <textarea
                              rows={2}
                              value={tc.input}
                              onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                              placeholder="Input (e.g. [2,7,11,15]\n9)"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                            />
                            <textarea
                              rows={2}
                              value={tc.output}
                              onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                              placeholder="Expected Output (e.g. [0,1])"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solution Code */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 mb-1 block">Solution Code (Admin Reference)</label>
                    <textarea
                      rows={4}
                      value={formData.solutionCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, solutionCode: e.target.value }))}
                      placeholder="Reference solution code..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Solution Explanation */}
              <div>
                <label className="text-[11px] font-medium text-slate-300 mb-1 block">Solution Explanation</label>
                <textarea
                  rows={3}
                  value={formData.solutionExplanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, solutionExplanation: e.target.value }))}
                  placeholder="Detailed explanation of the solution..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              {/* Tags & Hints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Company Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.companyTags}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyTags: e.target.value }))}
                    placeholder="Google, Amazon, Microsoft"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">Hints (comma separated)</label>
                  <input
                    type="text"
                    value={formData.hints}
                    onChange={(e) => setFormData(prev => ({ ...prev, hints: e.target.value }))}
                    placeholder="Use a HashMap, Track two pointers"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Form Footer */}
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
                  <span>{isEditing ? 'Update Question' : 'Create Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 w-full max-w-md space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-base font-bold text-white">Confirm Question Deletion</h2>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">"{deletingQuestion.title}"</span>?
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
                onClick={() => { setShowDeleteModal(false); setDeletingQuestion(null); }}
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
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;


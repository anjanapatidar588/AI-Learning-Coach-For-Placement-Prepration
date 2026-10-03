import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Sparkles,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Brain,
  Eye,
  Edit3,
  Trash2,
  Send,
  Check,
  X,
  ChevronRight,
  ShieldAlert,
  Archive,
  Search
} from 'lucide-react';

const AdminAssessmentManagement = () => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Drawer states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // AI Generation Loading state
  const [generatingId, setGeneratingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formErrorMessage, setFormErrorMessage] = useState('');

  // Form State for Blueprint Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Students');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [assessmentPurpose, setAssessmentPurpose] = useState('PRACTICE');

  const AVAILABLE_TOPICS = [
    { name: 'Arrays & Two Pointers', category: 'dsa', categoryLabel: 'DSA' },
    { name: 'Strings & Hashing', category: 'dsa', categoryLabel: 'DSA' },
    { name: 'Stacks, Queues & Linked Lists', category: 'dsa', categoryLabel: 'DSA' },
    { name: 'Trees & Graph Algorithms', category: 'dsa', categoryLabel: 'DSA' },
    { name: 'Dynamic Programming', category: 'dsa', categoryLabel: 'DSA' },
    { name: 'Quantitative Aptitude', category: 'aptitude', categoryLabel: 'Aptitude' },
    { name: 'Logical Reasoning', category: 'aptitude', categoryLabel: 'Aptitude' },
    { name: 'Data Interpretation', category: 'aptitude', categoryLabel: 'Aptitude' },
    { name: 'SQL & DBMS', category: 'dbms', categoryLabel: 'DBMS' },
    { name: 'OOP Concepts', category: 'oops', categoryLabel: 'OOPS' },
    { name: 'Operating Systems', category: 'os', categoryLabel: 'OS' },
    { name: 'Computer Networks', category: 'cn', categoryLabel: 'CN' }
  ];

  const [selectedTopics, setSelectedTopics] = useState([
    'Arrays & Two Pointers',
    'Quantitative Aptitude',
    'SQL & DBMS'
  ]);

  const toggleTopicSelection = (topicName) => {
    if (selectedTopics.includes(topicName)) {
      if (selectedTopics.length <= 1) {
        setFormErrorMessage('At least one topic must be selected.');
        return;
      }
      setSelectedTopics(selectedTopics.filter(t => t !== topicName));
    } else {
      setSelectedTopics([...selectedTopics, topicName]);
    }
    if (formErrors.selectedTopics) {
      setFormErrors({ ...formErrors, selectedTopics: null });
    }
    setFormErrorMessage('');
  };

  const fetchBlueprints = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/assessment-blueprints');
      if (res.data?.success && res.data?.data?.blueprints) {
        setBlueprints(res.data.data.blueprints);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch blueprints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  // Handle Blueprint Creation
  const handleCreateBlueprint = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setFormErrorMessage('');
    setError('');

    // Explicit Form Validation
    const errors = {};
    if (!title || !title.trim()) {
      errors.title = 'Blueprint title is required.';
    }

    const qCount = Number(questionCount);
    if (!qCount || isNaN(qCount) || qCount < 1) {
      errors.questionCount = 'Question count must be at least 1.';
    }

    const dur = Number(durationMinutes);
    if (!dur || isNaN(dur) || dur < 5) {
      errors.durationMinutes = 'Duration must be at least 5 minutes.';
    }

    const marks = Number(marksPerQuestion);
    if (!marks || isNaN(marks) || marks < 1) {
      errors.marksPerQuestion = 'Marks per question must be at least 1.';
    }

    if (!selectedTopics || selectedTopics.length === 0) {
      errors.selectedTopics = 'At least one topic or subject must be selected.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormErrorMessage('Please resolve the validation errors below before saving.');
      return;
    }

    try {
      setActionLoading(true);

      const matchedCategories = Array.from(
        new Set(
          selectedTopics
            .map(tName => AVAILABLE_TOPICS.find(at => at.name === tName)?.category)
            .filter(Boolean)
        )
      );
      const finalSubjects = matchedCategories.length > 0 ? matchedCategories : ['dsa'];

      const payload = {
        title: title.trim(),
        description: (description || '').trim(),
        targetAudience: (targetAudience || 'All Students').trim(),
        assessmentPurpose,
        subjects: finalSubjects,
        selectedTopics,
        difficulty: selectedDifficulty,
        questionCount: qCount,
        durationMinutes: dur,
        marksPerQuestion: marks,
        totalMarks: qCount * marks,
        negativeMarking: Boolean(negativeMarking),
        negativeMarks: negativeMarking ? (Number(negativeMarks) || 0) : 0,
        topicDistribution: selectedTopics.map(tName => {
          const match = AVAILABLE_TOPICS.find(at => at.name === tName);
          return {
            topicName: tName,
            category: match?.category || 'dsa',
            questionCount: 1,
            difficulty: selectedDifficulty
          };
        })
      };

      const res = await API.post('/admin/assessment-blueprints', payload);
      if (res.data?.success) {
        setSuccessMessage('Blueprint created successfully.');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setFormErrors({});
        setFormErrorMessage('');
        await fetchBlueprints();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setFormErrorMessage(res.data?.message || 'Failed to save blueprint');
      }
    } catch (err) {
      console.error('[AdminAssessmentManagement] Save Blueprint Error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save blueprint';
      setFormErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger AI Question Generation
  const handleGenerateQuestions = async (blueprintId) => {
    try {
      setGeneratingId(blueprintId);
      setError('');
      const res = await API.post(`/admin/assessment-blueprints/${blueprintId}/generate-questions`);
      if (res.data?.success) {
        fetchBlueprints();
        if (res.data.data) {
          handleOpenReview(res.data.data);
        }
      } else {
        setError(res.data?.message || 'AI Generation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'AI Generation error');
    } finally {
      setGeneratingId(null);
    }
  };

  // Open Question Review Modal
  const handleOpenReview = async (bp) => {
    setSelectedBlueprint(bp);
    setShowReviewModal(true);
    try {
      const res = await API.get(`/admin/assessment-blueprints/${bp._id}/questions`);
      if (res.data?.success && res.data?.data?.questions) {
        setReviewQuestions(res.data.data.questions);
      }
    } catch (err) {
      setError('Could not load review questions');
    }
  };

  // Handle Question Edit Save
  const handleSaveQuestionEdit = async (e) => {
    e.preventDefault();
    if (!editingQuestion || !selectedBlueprint) return;
    try {
      setActionLoading(true);
      const res = await API.put(
        `/admin/assessment-blueprints/${selectedBlueprint._id}/questions/${editingQuestion._id}`,
        editingQuestion
      );
      if (res.data?.success) {
        setEditingQuestion(null);
        handleOpenReview(selectedBlueprint);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question edit');
    } finally {
      setActionLoading(false);
    }
  };

  // Approve & Publish Actions
  const handleApprove = async (bpId) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/admin/assessment-blueprints/${bpId}/approve`);
      if (res.data?.success) {
        fetchBlueprints();
        if (selectedBlueprint && selectedBlueprint._id === bpId) {
          setSelectedBlueprint(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve blueprint');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (bpId) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/admin/assessment-blueprints/${bpId}/publish`);
      if (res.data?.success) {
        setShowReviewModal(false);
        fetchBlueprints();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish assessment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'badge-neutral',
      GENERATING: 'badge-info animate-pulse',
      REVIEW: 'badge-medium',
      APPROVED: 'badge-info',
      PUBLISHED: 'badge-easy',
      ARCHIVED: 'badge-hard'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-mono ${badges[status] || badges.DRAFT}`}>
        {status}
      </span>
    );
  };

  const counts = {
    ALL: blueprints.length,
    DRAFT: blueprints.filter(b => ['DRAFT', 'GENERATING'].includes(b.status)).length,
    REVIEW: blueprints.filter(b => b.status === 'REVIEW').length,
    APPROVED: blueprints.filter(b => b.status === 'APPROVED').length,
    PUBLISHED: blueprints.filter(b => b.status === 'PUBLISHED').length,
    ARCHIVED: blueprints.filter(b => b.status === 'ARCHIVED').length,
  };

  const filteredBlueprints = blueprints.filter(bp => {
    const matchesTab = activeTab === 'ALL'
      ? true
      : activeTab === 'DRAFT'
      ? ['DRAFT', 'GENERATING'].includes(bp.status)
      : bp.status === activeTab;
    const matchesSearch = searchQuery
      ? (bp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bp.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="heading-page flex items-center space-x-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Assessment Blueprints & AI Generation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure placement assessment blueprints, trigger Gemini AI question generation, review questions, and publish assessments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blueprint</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Section Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: 'ALL', label: 'All Assessments', count: counts.ALL },
            { id: 'DRAFT', label: 'Drafts', count: counts.DRAFT },
            { id: 'REVIEW', label: 'Under Review', count: counts.REVIEW },
            { id: 'APPROVED', label: 'Approved', count: counts.APPROVED },
            { id: 'PUBLISHED', label: 'Published', count: counts.PUBLISHED },
            { id: 'ARCHIVED', label: 'Archived', count: counts.ARCHIVED },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints..."
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Blueprints Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex justify-center items-center space-x-2 font-semibold">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading assessment blueprints...</span>
        </div>
      ) : filteredBlueprints.length === 0 ? (
        <div className="empty-state-card py-12 space-y-3">
          <Brain className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-900">No Assessment Blueprints Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || activeTab !== 'ALL'
              ? 'No blueprints match your filter criteria.'
              : 'Create your first assessment blueprint to define subjects, topics, and trigger AI question generation.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Blueprint Title</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Questions / Duration</th>
                <th className="py-3.5 px-4">Subjects Covered</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBlueprints.map((bp) => (
                <tr key={bp._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{bp.title}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{bp.description || 'No description'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {bp.assessmentPurpose === 'INITIAL_BASELINE' ? (
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold font-mono border border-purple-200">
                        INITIAL BASELINE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold font-mono border border-slate-200">
                        PRACTICE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{bp.questionCount} Questions ({bp.totalMarks} Marks)</div>
                    <div className="text-[11px] text-slate-500">{bp.durationMinutes} Minutes</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(bp.subjects || ['dsa']).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-indigo-700 font-bold border border-slate-200">
                          {s.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(bp.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {['DRAFT', 'GENERATING'].includes(bp.status) && (
                      <button
                        onClick={() => handleGenerateQuestions(bp._id)}
                        disabled={generatingId === bp._id}
                        className="btn-primary text-xs px-3 py-1.5 inline-flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{generatingId === bp._id ? 'Generating...' : 'Generate AI Questions'}</span>
                      </button>
                    )}

                    {['REVIEW', 'APPROVED', 'PUBLISHED'].includes(bp.status) && (
                      <button
                        onClick={() => handleOpenReview(bp)}
                        className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Review Questions</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE BLUEPRINT MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Fixed Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Configure Assessment Blueprint</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormErrors({});
                  setFormErrorMessage('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form id="create-blueprint-form" onSubmit={handleCreateBlueprint} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
              {formErrorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{formErrorMessage}</span>
                </div>
              )}

              {/* Blueprint Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Blueprint Title <span className="text-rose-500">*</span></label>
                  {formErrors.title && <span className="text-rose-600 font-semibold text-[11px]">{formErrors.title}</span>}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) setFormErrors({ ...formErrors, title: null });
                  }}
                  placeholder="e.g. Standard Placement Readiness Blueprint v1"
                  className={`input-standard text-xs ${formErrors.title ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Comprehensive baseline evaluation for technical roles"
                  className="input-standard text-xs"
                />
              </div>

              {/* Assessment Purpose Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Purpose</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssessmentPurpose('PRACTICE')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      assessmentPurpose === 'PRACTICE'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Practice Assessment</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Regular or topic-specific practice evaluation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssessmentPurpose('INITIAL_BASELINE')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      assessmentPurpose === 'INITIAL_BASELINE'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Initial Baseline Assessment</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-800 text-[9px] uppercase font-mono font-extrabold">Baseline</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Placement diagnostic test for new students</div>
                  </button>
                </div>

                {assessmentPurpose === 'INITIAL_BASELINE' && (
                  <div className="mt-2 p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Initial Baseline Assessment:</span>
                      <p className="text-[11px] text-purple-800 leading-snug mt-0.5">
                        This assessment is used to evaluate a new student's current preparation level and generate their personalized roadmap.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Question Count <span className="text-rose-500">*</span></label>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={questionCount}
                    onChange={(e) => {
                      setQuestionCount(e.target.value);
                      if (formErrors.questionCount) setFormErrors({ ...formErrors, questionCount: null });
                    }}
                    className={`input-standard text-xs ${formErrors.questionCount ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                  />
                  {formErrors.questionCount && <p className="text-rose-600 font-semibold text-[10px] mt-1">{formErrors.questionCount}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Duration (Minutes)</label>
                  </div>
                  <input
                    type="number"
                    min={5}
                    value={durationMinutes}
                    onChange={(e) => {
                      setDurationMinutes(e.target.value);
                      if (formErrors.durationMinutes) setFormErrors({ ...formErrors, durationMinutes: null });
                    }}
                    className={`input-standard text-xs ${formErrors.durationMinutes ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                  />
                  {formErrors.durationMinutes && <p className="text-rose-600 font-semibold text-[10px] mt-1">{formErrors.durationMinutes}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Marks / Question</label>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={marksPerQuestion}
                    onChange={(e) => {
                      setMarksPerQuestion(e.target.value);
                      if (formErrors.marksPerQuestion) setFormErrors({ ...formErrors, marksPerQuestion: null });
                    }}
                    className={`input-standard text-xs ${formErrors.marksPerQuestion ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
                  />
                  {formErrors.marksPerQuestion && <p className="text-rose-600 font-semibold text-[10px] mt-1">{formErrors.marksPerQuestion}</p>}
                </div>
              </div>

              {/* Negative Marking Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Enable Negative Marking</div>
                  <div className="text-[11px] text-slate-500 font-medium">Apply server-side penalty for incorrect answers</div>
                </div>

                <div className="flex items-center space-x-3">
                  {negativeMarking && (
                    <input
                      type="number"
                      step="0.25"
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(e.target.value)}
                      placeholder="Deduction"
                      className="w-20 input-standard py-1 text-xs"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setNegativeMarking(!negativeMarking)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${negativeMarking ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${negativeMarking ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Mixed', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedDifficulty === diff
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subjects & Topics Selection UX */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-900 block">Subjects & Topics</label>
                    <span className="text-[11px] text-slate-500 font-medium">Select the topics you want AI to cover in this assessment</span>
                  </div>
                </div>

                {formErrors.selectedTopics && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{formErrors.selectedTopics}</span>
                  </div>
                )}

                {/* Topic Selection Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1 pt-1">
                  {AVAILABLE_TOPICS.map((top) => {
                    const isSelected = selectedTopics.includes(top.name);
                    return (
                      <button
                        key={top.name}
                        type="button"
                        onClick={() => toggleTopicSelection(top.name)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-600">
                            {top.categoryLabel}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <span className="text-xs font-bold leading-snug">{top.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Summary Pill */}
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>{questionCount} questions</strong> will be generated across <strong>{selectedTopics.length} selected topics</strong>.
                  </span>
                </div>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedTopics.length} topics selected</span>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormErrors({});
                    setFormErrorMessage('');
                  }}
                  className="btn-secondary text-xs px-5 py-2.5 min-h-[40px] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="create-blueprint-form"
                  disabled={actionLoading}
                  className="btn-primary text-xs px-6 py-2.5 min-h-[40px] cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Blueprint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION REVIEW MODAL */}
      {showReviewModal && selectedBlueprint && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 space-y-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider font-mono">Review Generated Questions</div>
                <h2 className="text-lg font-bold text-slate-900">{selectedBlueprint.title}</h2>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {reviewQuestions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No generated questions available for review yet.</div>
              ) : (
                reviewQuestions.map((q, idx) => (
                  <div key={q._id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700">Q{idx + 1}. {q.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-mono font-bold border border-slate-200">
                          {q.difficulty || 'Medium'}
                        </span>
                        <button
                          onClick={() => setEditingQuestion({ ...q })}
                          className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700">{q.problemStatement}</p>

                    {Array.isArray(q.mcqOptions) && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.mcqOptions.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{opt.optionId || String.fromCharCode(65 + oIdx)}. {opt.text || opt.optionText}</span>
                            {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.solutionExplanation && (
                      <div className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900">Explanation: </span>{q.solutionExplanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-600 font-semibold">
                Status: {getStatusBadge(selectedBlueprint.status)}
              </div>

              <div className="flex items-center space-x-3">
                {selectedBlueprint.status === 'REVIEW' && (
                  <button
                    onClick={() => handleApprove(selectedBlueprint._id)}
                    disabled={actionLoading}
                    className="btn-secondary text-xs px-4 py-2 font-bold text-indigo-700"
                  >
                    Approve Blueprint
                  </button>
                )}

                {['APPROVED', 'REVIEW'].includes(selectedBlueprint.status) && (
                  <button
                    onClick={() => handlePublish(selectedBlueprint._id)}
                    disabled={actionLoading}
                    className="btn-primary text-xs px-5 py-2.5 flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SINGLE QUESTION MODAL */}
      {editingQuestion && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 space-y-4 max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Generated Question</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={editingQuestion.title}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                  className="input-standard text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Problem Statement</label>
                <textarea
                  rows={3}
                  value={editingQuestion.problemStatement}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, problemStatement: e.target.value })}
                  className="input-standard text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Options & Correct Answer</label>
                <div className="space-y-2">
                  {editingQuestion.mcqOptions?.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctOptGroup"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const opts = editingQuestion.mcqOptions.map((o, i) => ({
                            ...o,
                            isCorrect: i === oIdx
                          }));
                          setEditingQuestion({ ...editingQuestion, mcqOptions: opts });
                        }}
                      />
                      <input
                        type="text"
                        value={opt.text || opt.optionText}
                        onChange={(e) => {
                          const opts = [...editingQuestion.mcqOptions];
                          opts[oIdx].text = e.target.value;
                          opts[oIdx].optionText = e.target.value;
                          setEditingQuestion({ ...editingQuestion, mcqOptions: opts });
                        }}
                        className="flex-1 input-standard text-xs py-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssessmentManagement;

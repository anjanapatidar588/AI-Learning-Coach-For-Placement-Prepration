import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Bookmark,
  Star,
  Sparkles,
  Layers,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const RevisionCenter = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes, revision, important, saved, cards
  const [overview, setOverview] = useState({
    notesCount: 0,
    revisionItemsCount: 0,
    importantTopicsCount: 0,
    savedConceptsCount: 0,
    dueCardsCount: 0,
    totalCardsCount: 0
  });

  // Tab Data States
  const [notes, setNotes] = useState([]);
  const [revisionItems, setRevisionItems] = useState([]);
  const [importantTopics, setImportantTopics] = useState([]);
  const [savedConcepts, setSavedConcepts] = useState([]);
  const [revisionCards, setRevisionCards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState('DSA');

  // Card Modal
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  // Active Flashcard Deck Review state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Reassessment Engine Modal State
  const [reassessmentState, setReassessmentState] = useState(null); // null, 'in_progress', 'result'
  const [reassessmentData, setReassessmentData] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [reassessmentResult, setReassessmentResult] = useState(null);

  useEffect(() => {
    fetchOverview();
    fetchTabData(activeTab);
  }, [activeTab]);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/revision/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error('Error fetching revision overview:', err);
    }
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (tab === 'notes') {
        const res = await fetch('/api/v1/student/notes', { headers });
        const data = await res.json();
        if (data.success) setNotes(data.notes || []);
      } else if (tab === 'revision') {
        const res = await fetch('/api/v1/student/revision/items', { headers });
        const data = await res.json();
        if (data.success) setRevisionItems(data.items || []);
      } else if (tab === 'important') {
        const res = await fetch('/api/v1/student/revision/important-topics', { headers });
        const data = await res.json();
        if (data.success) setImportantTopics(data.importantTopics || []);
      } else if (tab === 'saved') {
        const res = await fetch('/api/v1/student/revision/saved-concepts', { headers });
        const data = await res.json();
        if (data.success) setSavedConcepts(data.concepts || []);
      } else if (tab === 'cards') {
        const res = await fetch('/api/v1/student/revision/cards', { headers });
        const data = await res.json();
        if (data.success) {
          setRevisionCards(data.cards || []);
          setCurrentCardIndex(0);
          setShowAnswer(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Error fetching revision data');
    } finally {
      setLoading(false);
    }
  };

  // Create Personal Note
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          subject: noteSubject
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowNoteModal(false);
        setNoteTitle('');
        setNoteContent('');
        fetchOverview();
        fetchTabData('notes');
      }
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this personal note?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/student/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOverview();
      fetchTabData('notes');
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Create Revision Card
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!cardFront || !cardBack) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/revision/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          front: cardFront,
          back: cardBack,
          sourceType: 'MANUAL'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCardModal(false);
        setCardFront('');
        setCardBack('');
        fetchOverview();
        fetchTabData('cards');
      }
    } catch (err) {
      console.error('Error creating card:', err);
    }
  };

  // Review Revision Card
  const handleReviewCard = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/revision/cards/${cardId}/review`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setShowAnswer(false);
        fetchOverview();
        if (currentCardIndex + 1 < revisionCards.length) {
          setCurrentCardIndex(currentCardIndex + 1);
        } else {
          fetchTabData('cards');
        }
      }
    } catch (err) {
      console.error('Error reviewing card:', err);
    }
  };

  const handleUnmarkRevision = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/v1/student/revision/unmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });
      fetchOverview();
      fetchTabData('revision');
    } catch (err) {
      console.error('Error unmarking item:', err);
    }
  };

  const handleRemoveImportantTopic = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/student/revision/important-topics/${topicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOverview();
      fetchTabData('important');
    } catch (err) {
      console.error('Error removing important topic:', err);
    }
  };

  const handleDeleteSavedConcept = async (conceptId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/student/revision/saved-concepts/${conceptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOverview();
      fetchTabData('saved');
    } catch (err) {
      console.error('Error deleting saved concept:', err);
    }
  };

  // Reassessment Engine Flow
  const handleStartReassessment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/student/reassessment/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReassessmentData(data.data);
        setStudentAnswers({});
        setReassessmentState('in_progress');
      } else {
        alert(data.message || 'Could not start reassessment');
      }
    } catch (err) {
      alert('Error starting reassessment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReassessment = async () => {
    if (!reassessmentData) return;
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(studentAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/student/reassessment/${reassessmentData.attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      const data = await res.json();
      if (data.success) {
        setReassessmentResult(data.data);
        setReassessmentState('result');
      } else {
        alert(data.message || 'Submission error');
      }
    } catch (err) {
      alert('Error submitting reassessment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Reassessment Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-page flex items-center space-x-3">
            <RotateCcw className="w-7 h-7 text-indigo-600" />
            <span>Revision Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consolidate your learning, revisit marked concepts, practice smart flashcards, and prove improvement with Reassessment.
          </p>
        </div>

        <button
          onClick={handleStartReassessment}
          className="btn-primary text-xs px-4 py-2.5 flex items-center space-x-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Take Reassessment</span>
        </button>
      </div>

      {/* Locked Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'notes', label: 'PERSONAL NOTES', icon: FileText, count: overview.notesCount },
          { id: 'revision', label: 'MARKED FOR REVISION', icon: Bookmark, count: overview.revisionItemsCount },
          { id: 'important', label: 'IMPORTANT TOPICS', icon: Star, count: overview.importantTopicsCount },
          { id: 'saved', label: 'SAVED CONCEPTS', icon: Sparkles, count: overview.savedConceptsCount },
          { id: 'cards', label: 'REVISION CARDS', icon: Layers, count: overview.dueCardsCount }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-700 text-white font-bold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div
              onClick={() => setActiveTab('notes')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 cursor-pointer transition-all space-y-2 shadow-xs"
            >
              <FileText className="w-5 h-5 text-indigo-600" />
              <div className="text-2xl font-black text-slate-900">{overview.notesCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Personal Notes</div>
            </div>

            <div
              onClick={() => setActiveTab('revision')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 cursor-pointer transition-all space-y-2 shadow-xs"
            >
              <Bookmark className="w-5 h-5 text-amber-600" />
              <div className="text-2xl font-black text-slate-900">{overview.revisionItemsCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Marked for Revision</div>
            </div>

            <div
              onClick={() => setActiveTab('important')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 cursor-pointer transition-all space-y-2 shadow-xs"
            >
              <Star className="w-5 h-5 text-purple-600" />
              <div className="text-2xl font-black text-slate-900">{overview.importantTopicsCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Important Topics</div>
            </div>

            <div
              onClick={() => setActiveTab('saved')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 cursor-pointer transition-all space-y-2 shadow-xs"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div className="text-2xl font-black text-slate-900">{overview.savedConceptsCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Saved Concepts</div>
            </div>

            <div
              onClick={() => setActiveTab('cards')}
              className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-200 hover:border-indigo-300 cursor-pointer transition-all space-y-2 shadow-xs"
            >
              <Layers className="w-5 h-5 text-indigo-600" />
              <div className="text-2xl font-black text-indigo-950">{overview.dueCardsCount}</div>
              <div className="text-xs text-indigo-700 font-bold">Due Flashcards</div>
            </div>
          </div>

          {/* Quick CTA Card */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Ready to prove your understanding?</span>
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                The Reassessment Engine builds a fresh assessment targeting your weak areas and compares your new score directly against your past performance.
              </p>
            </div>
            <button
              onClick={handleStartReassessment}
              className="btn-primary text-xs px-5 py-3 flex items-center space-x-2 shrink-0"
            >
              <span>Launch Reassessment Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Personal Notes ({notes.length})</h2>
            <button
              onClick={() => setShowNoteModal(true)}
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="empty-state-card py-10 text-slate-500 text-xs">
              No personal notes created yet. Click "Create Note" to add study notes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => (
                <div key={n._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{n.title}</span>
                    <button
                      onClick={() => handleDeleteNote(n._id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{n.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    <span className="uppercase font-bold text-indigo-700">{n.subject || 'General'}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MARKED FOR REVISION */}
      {activeTab === 'revision' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Questions & Topics Marked for Revision</h2>
          {revisionItems.length === 0 ? (
            <div className="empty-state-card py-10 text-slate-500 text-xs">
              No questions or topics currently marked for revision.
            </div>
          ) : (
            <div className="space-y-3">
              {revisionItems.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-bold mr-2">
                      {item.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.questionId?.title || item.topicId?.name || 'Item marked for revision'}
                    </span>
                    {item.reason && <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>}
                  </div>
                  <button
                    onClick={() => handleUnmarkRevision(item._id)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    Unmark
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMPORTANT TOPICS */}
      {activeTab === 'important' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Important Topics</h2>
          {importantTopics.length === 0 ? (
            <div className="empty-state-card py-10 text-slate-500 text-xs">
              No topics marked as important.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {importantTopics.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900">{item.topicId?.name || item.topicId?.title || 'Important Topic'}</span>
                      <p className="text-[10px] text-slate-500">{item.reason || 'High priority for placement preparation'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveImportantTopic(item.topicId?._id || item.topicId)}
                    className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SAVED CONCEPTS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Saved Concepts & Takeaways</h2>
          {savedConcepts.length === 0 ? (
            <div className="empty-state-card py-10 text-slate-500 text-xs">
              No concepts saved. Click "Save Concept" during learning to keep key explanations here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedConcepts.map((c) => (
                <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.title}</span>
                    <button onClick={() => handleDeleteSavedConcept(c._id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {c.conceptSnapshot}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REVISION CARDS (Flashcards Deck) */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Flashcard Revision ({revisionCards.length} cards)</h2>
            <button
              onClick={() => setShowCardModal(true)}
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>

          {revisionCards.length === 0 ? (
            <div className="empty-state-card py-12 text-slate-500 text-xs space-y-3">
              <Layers className="w-10 h-10 text-indigo-600 mx-auto opacity-50" />
              <p>No revision cards available. Click "Add Card" to create your first flashcard.</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Card {currentCardIndex + 1} of {revisionCards.length}</span>
                <span className="font-mono font-bold text-indigo-700">
                  Reviews: {revisionCards[currentCardIndex]?.reviewCount || 0}
                </span>
              </div>

              {/* Flashcard Box */}
              <div
                onClick={() => setShowAnswer(!showAnswer)}
                className="bg-white p-8 rounded-3xl border-2 border-indigo-200 text-center min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all transform hover:scale-[1.01] shadow-md relative"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 absolute top-4 left-4 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {showAnswer ? 'Back (Answer)' : 'Front (Question / Concept)'}
                </span>

                <p className="text-base font-bold text-slate-900 px-4 leading-relaxed">
                  {showAnswer
                    ? revisionCards[currentCardIndex]?.back
                    : revisionCards[currentCardIndex]?.front}
                </p>

                <div className="absolute bottom-4 text-xs text-slate-500 font-semibold flex items-center space-x-1">
                  {showAnswer ? <EyeOff className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>Click to flip card</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => { setCurrentCardIndex(currentCardIndex - 1); setShowAnswer(false); }}
                  className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() => handleReviewCard(revisionCards[currentCardIndex]._id)}
                  className="btn-primary text-xs px-5 py-2.5"
                >
                  Mark Reviewed (Schedule Next)
                </button>

                <button
                  disabled={currentCardIndex === revisionCards.length - 1}
                  onClick={() => { setCurrentCardIndex(currentCardIndex + 1); setShowAnswer(false); }}
                  className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="modal-backdrop-custom">
          <form onSubmit={handleCreateNote} className="modal-container-custom p-6 space-y-4 max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Personal Study Note</h3>
              <button type="button" onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="input-standard text-xs"
                  placeholder="Note title..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="input-standard text-xs"
                  placeholder="Write your study notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary text-xs px-4 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs px-4 py-2">
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Flashcard Modal */}
      {showCardModal && (
        <div className="modal-backdrop-custom">
          <form onSubmit={handleCreateCard} className="modal-container-custom p-6 space-y-4 max-w-lg w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Revision Flashcard</h3>
              <button type="button" onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Front (Question / Concept)</label>
                <input
                  type="text"
                  required
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="input-standard text-xs"
                  placeholder="e.g. What is the time complexity of QuickSort average case?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Back (Explanation / Key Takeaway)</label>
                <textarea
                  rows={3}
                  required
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="input-standard text-xs"
                  placeholder="e.g. O(N log N)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowCardModal(false)} className="btn-secondary text-xs px-4 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs px-4 py-2">
                Create Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REASSESSMENT ENGINE MODAL */}
      {reassessmentState === 'in_progress' && reassessmentData && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-6 space-y-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>{reassessmentData.title}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Targeted questions based on your weak areas ({reassessmentData.totalQuestions} questions)
                </p>
              </div>
              <button
                onClick={() => setReassessmentState(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {reassessmentData.questions.map((q, idx) => (
                <div key={q.questionId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-700">Question {idx + 1}</span>
                    <span className="text-[10px] font-mono text-slate-700 font-bold uppercase bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {q.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                  <p className="text-xs text-slate-600">{q.problemStatement}</p>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt) => {
                        const isSelected = studentAnswers[q.questionId] === opt.optionId;
                        return (
                          <button
                            key={opt.optionId}
                            type="button"
                            onClick={() =>
                              setStudentAnswers({ ...studentAnswers, [q.questionId]: opt.optionId })
                            }
                            className={`p-3 rounded-xl text-xs text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="font-bold mr-2">{opt.optionId}:</span>
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setReassessmentState(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReassessment}
                className="btn-primary text-xs px-6 py-2.5"
              >
                Submit Reassessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSESSMENT RESULTS MODAL */}
      {reassessmentState === 'result' && reassessmentResult && (
        <div className="modal-backdrop-custom">
          <div className="modal-container-custom p-8 space-y-6 text-center max-w-2xl w-full">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Reassessment Evaluation Complete</h2>
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm mt-2">
                {reassessmentResult.improvementStatement}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Previous Score</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{reassessmentResult.previousScore}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 uppercase">Reassessment Score</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{reassessmentResult.reassessmentScore}%</div>
              </div>
            </div>

            {reassessmentResult.topicsImproved && reassessmentResult.topicsImproved.length > 0 && (
              <div className="text-left space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase">Improved Topics:</span>
                <div className="flex flex-wrap gap-2">
                  {reassessmentResult.topicsImproved.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 font-bold">
                      ✓ {t.topicName} ({t.newAccuracy}%)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setReassessmentState(null)}
              className="btn-primary w-full py-3 text-xs"
            >
              Done & Return to Revision Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionCenter;

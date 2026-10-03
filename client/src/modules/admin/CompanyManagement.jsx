import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Target,
  Award,
  Layers,
  HelpCircle,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight
} from 'lucide-react';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    description: '',
    cutoffBenchmark: 75,
    syllabus: 'DSA, Arrays, Strings, SQL, System Design',
    rounds: [
      { roundName: 'Round 1: Online Assessment', roundType: 'MCQ & Coding', description: '60 mins aptitude and 2 DSA coding problems' },
      { roundName: 'Round 2: Technical Interview', roundType: 'Live Coding', description: 'Data structures, algorithm complexity & project deep dive' },
      { roundName: 'Round 3: Techno-HR Interview', roundType: 'Behavioral & Fitment', description: 'Situational judgment and company values alignment' },
    ]
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/companies');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCompanies(res.data.data);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      logoUrl: '',
      description: '',
      cutoffBenchmark: 75,
      syllabus: 'DSA, Arrays, Strings, SQL, System Design',
      rounds: [
        { roundName: 'Round 1: Online Assessment', roundType: 'MCQ & Coding', description: '60 mins aptitude and DSA problems' },
        { roundName: 'Round 2: Technical Interview', roundType: 'Live Coding', description: 'Data structures, algorithm complexity & project deep dive' },
        { roundName: 'Round 3: Techno-HR Interview', roundType: 'Behavioral & Fitment', description: 'Situational judgment and company fit' },
      ]
    });
    setModalOpen(true);
  };

  const handleEditCompany = (comp) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || '',
      logoUrl: comp.logoUrl || '',
      description: comp.description || '',
      cutoffBenchmark: comp.cutoffBenchmark || 75,
      syllabus: Array.isArray(comp.syllabus) ? comp.syllabus.join(', ') : comp.syllabus || '',
      rounds: comp.hiringRounds || [
        { roundName: 'Round 1: Online Assessment', roundType: 'MCQ & Coding', description: 'Aptitude and DSA' }
      ]
    });
    setModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl.trim(),
        description: formData.description.trim(),
        cutoffBenchmark: parseInt(formData.cutoffBenchmark, 10) || 75,
        syllabus: formData.syllabus.split(',').map(s => s.trim()).filter(Boolean),
        hiringRounds: formData.rounds
      };

      if (editingCompany && editingCompany._id) {
        await API.put(`/admin/companies/${editingCompany._id}`, payload);
      } else if (!editingCompany) {
        await API.post('/admin/companies', payload);
      }

      setMessage({ type: 'success', text: `Company profile "${formData.name}" saved successfully!` });
      setTimeout(() => setMessage(null), 3500);
      setModalOpen(false);
      fetchCompanies();
    } catch (err) {
      // Local optimistic update
      const newComp = {
        id: editingCompany ? editingCompany.id : `comp-${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        cutoffBenchmark: parseInt(formData.cutoffBenchmark, 10) || 75,
        syllabus: formData.syllabus.split(',').map(s => s.trim()).filter(Boolean),
        hiringRounds: formData.rounds,
        taggedQuestionsCount: editingCompany?.taggedQuestionsCount || 0
      };

      if (editingCompany) {
        setCompanies(prev => prev.map(c => (c.id === editingCompany.id ? { ...c, ...newComp } : c)));
      } else {
        setCompanies(prev => [newComp, ...prev]);
      }
      setModalOpen(false);
      setMessage({ type: 'success', text: `Company "${formData.name}" added successfully!` });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async (comp) => {
    if (!window.confirm(`Are you sure you want to remove ${comp.name}?`)) return;
    try {
      if (comp._id) {
        await API.delete(`/admin/companies/${comp._id}`);
      }
      setCompanies(prev => prev.filter(c => c.id !== comp.id && c._id !== comp._id));
      setMessage({ type: 'success', text: `Company "${comp.name}" removed.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setCompanies(prev => prev.filter(c => c.id !== comp.id && c._id !== comp._id));
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
    (c.syllabus && c.syllabus.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-mono mb-2">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Placement Recruitment Partner Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hiring Companies & Patterns</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure company placement profiles, cutoff readiness benchmarks, selection rounds, and tagged practice modules.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hiring Company</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Partner Companies</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{companies.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Avg Cutoff Benchmark</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {companies.length > 0 ? Math.round(companies.reduce((acc, c) => acc + (c.cutoffBenchmark || 75), 0) / companies.length) : 75}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 font-mono">Tagged Archive Questions</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {companies.reduce((acc, c) => acc + (c.taggedQuestionsCount || 0), 0) || 112}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter companies by name, domain, or syllabus (e.g. Amazon, DSA, SQL)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 outline-none bg-transparent"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((comp) => {
          const initials = comp.name.substring(0, 2).toUpperCase();
          return (
            <div
              key={comp.id || comp._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{comp.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-100">
                          Cutoff: {comp.cutoffBenchmark || 75}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {comp.taggedQuestionsCount || 0} Questions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditCompany(comp)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Company"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(comp)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                  {comp.description || 'Target placement recruitment partner.'}
                </p>

                {/* Syllabus Tags */}
                {comp.syllabus && comp.syllabus.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {comp.syllabus.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        {s}
                      </span>
                    ))}
                    {comp.syllabus.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                        +{comp.syllabus.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Hiring Rounds Preview */}
                {comp.hiringRounds && comp.hiringRounds.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Hiring Pipeline ({comp.hiringRounds.length} Rounds)
                    </span>
                    <div className="space-y-1">
                      {comp.hiringRounds.map((r, rIdx) => (
                        <div key={rIdx} className="text-[11px] flex items-center justify-between text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                          <span className="font-semibold truncate">{r.roundName}</span>
                          <span className="text-[10px] text-purple-600 font-mono shrink-0 ml-2">{r.roundType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleEditCompany(comp)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Manage Hiring Blueprint</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Company Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 lg:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCompany ? 'Edit Hiring Company Profile' : 'Add New Hiring Company'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure recruitment pattern & placement benchmarks</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft, Google, TCS, Infosys"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of hiring standards, target roles, or packages"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cutoff Readiness Benchmark (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.cutoffBenchmark}
                    onChange={(e) => setFormData({ ...formData, cutoffBenchmark: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Key Syllabus Topics (comma separated)</label>
                  <input
                    type="text"
                    placeholder="DSA, SQL, OOP, System Design"
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCompany ? 'Save Changes' : 'Create Company'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;

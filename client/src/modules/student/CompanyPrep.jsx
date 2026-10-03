import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Building2,
  Search,
  BookOpen,
  HelpCircle,
  Award,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  Layers,
  Code2,
  CheckCircle2
} from 'lucide-react';

const CompanyPrep = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/company');
      if (res.data?.success) {
        const list = res.data.data || [];
        setCompanies(list);
        if (list.length > 0) {
          fetchCompanyDetail(list[0]._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load company prep module.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetail = async (companyId) => {
    try {
      setLoadingDetail(true);
      setSelectedCompany(companyId);
      const res = await API.get(`/company/${companyId}`);
      if (res.data?.success) {
        setCompanyDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load company details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-indigo-700">Loading target company preparation modules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center space-x-3 tracking-tight">
            <Building2 className="w-8 h-8 text-indigo-400" />
            <span>Target Company Preparation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Master interview hiring patterns, syllabus benchmarks & tagged question archives for top product & service companies.
          </p>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Target Companies Configured</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no company preparation archives configured in the database. Please check back after admin publishes company profiles or continue practice.
          </p>
          <button
            onClick={() => navigate('/student/practice')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Explore Practice Zone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Company List Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search target company..."
                className="w-full text-xs text-slate-800 bg-transparent outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              {filteredCompanies.map((c) => {
                const isSelected = c._id === selectedCompany;
                return (
                  <button
                    key={c._id}
                    onClick={() => fetchCompanyDetail(c._id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-600'}`}>
                        {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-6 h-6 object-contain" /> : c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold">{c.name}</h4>
                        <p className={`text-[10px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          Cutoff: {c.cutoffBenchmark || 75}%
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Company Details Main Content (8 Cols) */}
          <div className="lg:col-span-8">
            {loadingDetail ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-500 font-semibold">Loading company archives...</p>
              </div>
            ) : companyDetail?.company ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {/* Header Info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-xl">
                      {companyDetail.company.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{companyDetail.company.name}</h2>
                      <p className="text-xs text-slate-500 font-medium">{companyDetail.company.description || 'Target Tech Company Archive'}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold font-mono">
                    Cutoff: {companyDetail.company.cutoffBenchmark || 75}%
                  </div>
                </div>

                {/* Hiring Rounds */}
                {companyDetail.company.hiringRounds?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Hiring Process & Rounds</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {companyDetail.company.hiringRounds.map((round, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">Round {idx + 1}</span>
                          <h4 className="text-xs font-bold text-slate-900">{round.name || round}</h4>
                          <p className="text-[11px] text-slate-500 leading-snug">{round.description || 'Technical & Problem Solving Assessment'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tagged Questions List */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    <span>Tagged Question Archive ({companyDetail.questions?.length || 0})</span>
                  </h3>

                  {companyDetail.questions?.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                      <p className="text-xs text-slate-500 font-medium">No specific tagged questions archived for this company yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {companyDetail.questions.map((q) => (
                        <div key={q._id} className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 flex items-center justify-between transition-colors">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{q.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                                q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {q.difficulty || 'Medium'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{q.topicId?.title || 'DSA'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/student/practice')}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Practice
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPrep;

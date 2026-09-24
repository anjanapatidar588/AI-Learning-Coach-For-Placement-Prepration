import React, { useState } from 'react';
import { FileQuestion, Plus, Edit, Trash2 } from 'lucide-react';

export default function QuestionManagement() {
  const [questions, setQuestions] = useState([
    { id: 'q-1', title: 'Two Sum', category: 'dsa', difficulty: 'Easy', type: 'coding', companyTags: ['Google', 'Amazon'] },
    { id: 'q-2', title: 'Longest Substring Without Repeating Characters', category: 'dsa', difficulty: 'Medium', type: 'coding', companyTags: ['Google', 'Microsoft'] },
    { id: 'q-3', title: 'Successive Percentage Change', category: 'aptitude', difficulty: 'Easy', type: 'mcq', companyTags: ['TCS'] }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('dsa');
  const [newDifficulty, setNewDifficulty] = useState('Easy');

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        difficulty: newDifficulty,
        type: 'coding',
        companyTags: ['Amazon']
      }
    ]);

    setNewTitle('');
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FileQuestion className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Question Management</h1>
            <p className="text-xs text-slate-400">CRUD operations for DSA coding problems, Aptitude MCQs, and CS Core questions.</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Question</span>
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Company Tags</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {questions.map(q => (
                <tr key={q.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{q.title}</td>
                  <td className="py-3.5 px-4 uppercase font-bold text-slate-400 text-[10px]">{q.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize">{q.type}</td>
                  <td className="py-3.5 px-4 text-blue-400">{q.companyTags.join(', ')}</td>
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <button className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setQuestions(questions.filter(x => x.id !== q.id))}
                      className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddQuestion} className="glass-panel p-6 rounded-2xl border border-slate-800 w-full max-w-md space-y-4">
            <h2 className="text-base font-bold text-white">Add Question to Bank</h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Problem Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Valid Anagram"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="dsa">DSA</option>
                  <option value="aptitude">Aptitude</option>
                  <option value="cs_core">CS Core</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

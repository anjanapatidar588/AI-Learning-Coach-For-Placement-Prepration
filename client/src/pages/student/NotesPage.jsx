import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { BookOpen, Plus, Search, Menu, Sparkles } from 'lucide-react';
import { revisionHubData } from '../../services/pathpilotData';

const NotesPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState(revisionHubData.savedNotes);

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Saved Notes</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-purple-500/30 bg-slate-950/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Concept Reference Repository</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Saved Notes & Key Insights</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalized notes saved during topic learning and coding practice sessions.
              </p>
            </div>

            <button
              onClick={() => {
                const title = prompt("Enter note title:");
                if (title) {
                  setNotes([...notes, { id: Date.now().toString(), title, topic: "General", content: "Personal learning insight." }]);
                }
              }}
              className="btn-pathpilot-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Note</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by keyword..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <div key={note.id} className="glass-panel-dark p-6 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{note.title}</h4>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">{note.topic}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
};

export default NotesPage;

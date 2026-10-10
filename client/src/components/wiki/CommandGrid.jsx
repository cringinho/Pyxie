import React, { useEffect, useState } from 'react';
import { Search, Terminal, Sparkles, Filter, BookOpen } from 'lucide-react';
import CommandCard from './CommandCard';
import CommandDetailModal from './CommandDetailModal';
import CommandPaletteModal from './CommandPaletteModal';

export default function CommandGrid({ t, lang }) {
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Fetch dynamic commands
  useEffect(() => {
    fetch(`/api/commands?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.modules)) {
          const validModules = data.modules.filter(
            (m) => m.commands && m.commands.length > 0
          );
          setModules(validModules);
        }
      })
      .catch((err) => console.error('Erro ao buscar comandos:', err));
  }, [lang]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Deep linking anchor support from URL hash (#py-daily, #daily)
  useEffect(() => {
    if (modules.length === 0) return;
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (!hash) return;

    const all = modules.flatMap((m) => m.commands || []);
    const matched = all.find(
      (c) =>
        c.name?.toLowerCase() === hash ||
        `py-${c.name}`.toLowerCase() === hash ||
        c.aliases?.some((a) => a.toLowerCase() === hash)
    );

    if (matched) {
      setSelectedCommand(matched);
      const cleanName = (matched.name || '').replace(/^\/+/, '');
      const el = document.getElementById(`cmd-${cleanName}`) || document.getElementById(`cmd-${matched.name}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
    }
  }, [modules]);

  // Compute all commands
  const allCommands = modules.flatMap((m) => m.commands || []);
  const displayedCommands =
    activeTab === 'todos'
      ? allCommands
      : (modules.find((m) => m.id === activeTab)?.commands || []);

  const filteredCommands = displayedCommands.filter((cmd) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = cmd.name?.toLowerCase().includes(term);
    const descMatch = cmd.description?.toLowerCase().includes(term);
    const aliasMatch = cmd.aliases?.some((a) => a.toLowerCase().includes(term));
    return nameMatch || descMatch || aliasMatch;
  });

  return (
    <section id="comandos" className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span>{t('wiki.badge')}</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-5xl text-white tracking-tight">
          {t('wiki.title')}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3">
          {t('wiki.subtitle')}
        </p>
      </div>

      {/* Search Input Triggering Command Palette */}
      <div className="max-w-2xl mx-auto mb-8 relative">
        <div
          onClick={() => setPaletteOpen(true)}
          className="relative flex items-center cursor-pointer group"
        >
          <Search className="absolute left-4 w-5 h-5 text-slate-400 group-hover:text-pink-400 transition-colors pointer-events-none" />
          <input
            type="text"
            readOnly
            value={searchTerm}
            onClick={() => setPaletteOpen(true)}
            placeholder={t('wiki.searchPlaceholder')}
            className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 group-hover:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg cursor-pointer"
          />
          <div className="absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Category Tabs with Animated Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'todos'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105'
              : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {t('catalog.all')} ({allCommands.length})
        </button>

        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === m.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105'
                : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{m.title || m.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({m.commands?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Commands Grid */}
      {filteredCommands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommands.map((cmd) => (
            <CommandCard
              key={cmd.name}
              command={cmd}
              onSelect={(c) => setSelectedCommand(c)}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm">
          {t('catalog.empty')}
        </div>
      )}

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={allCommands}
        onSelectCommand={(cmd) => setSelectedCommand(cmd)}
        t={t}
      />

      {/* Command Detail Drawer Modal */}
      {selectedCommand && (
        <CommandDetailModal
          command={selectedCommand}
          onClose={() => setSelectedCommand(null)}
          lang={lang}
          t={t}
        />
      )}
    </section>
  );
}

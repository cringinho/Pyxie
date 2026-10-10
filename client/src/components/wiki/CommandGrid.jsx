import React, { useEffect, useState, useRef } from 'react';
import { Search, Terminal, Sparkles, Filter } from 'lucide-react';
import CommandCard from './CommandCard';

export default function CommandGrid({ t, lang }) {
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // Fetch dynamic commands
  useEffect(() => {
    fetch(`/api/commands?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.modules)) {
          // Filter out categories that have 0 commands
          const validModules = data.modules.filter(
            (m) => m.commands && m.commands.length > 0
          );
          setModules(validModules);
        }
      })
      .catch((err) => console.error('Erro ao buscar comandos:', err));
  }, [lang]);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <section id="comandos" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm">
          <Terminal className="w-3.5 h-3.5 text-pink-400" />
          <span>Wiki Interativa</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-4xl text-white tracking-tight">
          {t('wiki.title')}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mt-2">
          {t('wiki.subtitle')}
        </p>
      </div>

      {/* Search Input with Cmd+K */}
      <div className="max-w-2xl mx-auto mb-8 relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('wiki.searchPlaceholder')}
            className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 focus:border-pink-500 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg focus:shadow-neon-pink"
          />
          <div className="absolute right-3.5 px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1 pointer-events-none">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'todos'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink'
              : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          Todos ({allCommands.length})
        </button>

        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === m.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink'
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
          {filteredCommands.map((cmd, i) => (
            <CommandCard key={cmd.name || i} command={cmd} t={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm">
          Nenhum comando encontrado com os filtros atuais.
        </div>
      )}
    </section>
  );
}

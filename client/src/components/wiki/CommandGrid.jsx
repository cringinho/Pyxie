import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, RefreshCw } from 'lucide-react';
import CommandCard from './CommandCard';
import CommandDetailModal from './CommandDetailModal';
import CommandPaletteModal from './CommandPaletteModal';
import { matchesAnchor, matchesQuery } from '../../utils/commands';

export default function CommandGrid({ t, lang }) {
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Catálogo real (/api/commands): três estados distintos — carregando, erro e vazio.
  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetch(`/api/commands?lang=${lang}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive) return;
        if (data && data.success && Array.isArray(data.modules)) {
          setModules(data.modules.filter((m) => Array.isArray(m.commands) && m.commands.length > 0));
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [lang, reloadKey]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeDetail = useCallback(() => setSelectedCommand(null), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const allCommands = useMemo(() => modules.flatMap((m) => m.commands || []), [modules]);
  const labelOf = useCallback(
    (cmd) => modules.find((m) => m.id === cmd?.category)?.label || '',
    [modules]
  );

  // Link direto (#py-daily, #daily, #diario): abre o comando certo para quem recebe o link.
  useEffect(() => {
    if (allCommands.length === 0) return undefined;
    const openFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const matched = allCommands.find((c) => matchesAnchor(c, hash));
      if (!matched) return;
      setSelectedCommand(matched);
      const el = document.getElementById(`cmd-${String(matched.name || '').replace(/^\/+/, '')}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [allCommands]);

  const displayedCommands =
    activeTab === 'todos' ? allCommands : modules.find((m) => m.id === activeTab)?.commands || [];
  const filteredCommands = displayedCommands.filter((cmd) => matchesQuery(cmd, searchTerm, labelOf(cmd)));

  return (
    <section id="comandos" className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span>{t('wiki.badge')}</span>
        </div>
        <h2 className="font-title font-black text-3xl sm:text-5xl text-white tracking-tight">{t('wiki.title')}</h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-3">{t('wiki.subtitle')}</p>
      </div>

      {/* Busca: filtra a grade enquanto digita (Ctrl+K abre a paleta no computador) */}
      <div className="max-w-2xl mx-auto mb-8 relative">
        <label htmlFor="command-search" className="sr-only">
          {t('wiki.searchLabel')}
        </label>
        <div className="relative flex items-center group">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-pink-400 transition-colors pointer-events-none" />
          <input
            id="command-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('wiki.searchPlaceholder')}
            autoComplete="off"
            className="w-full pl-12 pr-4 sm:pr-24 py-3.5 rounded-2xl bg-white/5 border border-purple-500/25 focus:border-pink-500/60 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-xl transition-all shadow-lg"
          />
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex absolute right-3.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-slate-300 items-center gap-1 hover:text-white"
            aria-label={t('wiki.openPalette')}
          >
            <span>Ctrl</span>
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          type="button"
          onClick={() => setActiveTab('todos')}
          aria-pressed={activeTab === 'todos'}
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
            type="button"
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            aria-pressed={activeTab === m.id}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === m.id
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink scale-105'
                : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {m.emoji && <span aria-hidden="true">{m.emoji}</span>}
            <span>{m.label || m.id}</span>
            <span className="text-[10px] opacity-75 font-mono">({m.commands?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Commands Grid */}
      {status === 'loading' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-live="polite">
          <span className="sr-only">{t('catalog.loading')}</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl glass-panel border border-purple-500/15 animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="text-center py-16 space-y-4" role="alert">
          <p className="text-slate-300 text-sm">{t('catalog.error')}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>{t('catalog.retry')}</span>
          </button>
        </div>
      ) : filteredCommands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommands.map((cmd) => (
            <CommandCard key={cmd.name} command={cmd} onSelect={(c) => setSelectedCommand(c)} t={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm">
          {searchTerm ? t('palette.empty') : t('catalog.empty')}
        </div>
      )}

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={paletteOpen}
        onClose={closePalette}
        commands={allCommands}
        labelOf={labelOf}
        onSelectCommand={(cmd) => setSelectedCommand(cmd)}
        t={t}
      />

      {/* Command Detail Modal */}
      {selectedCommand && (
        <CommandDetailModal
          command={selectedCommand}
          onClose={closeDetail}
          lang={lang}
          t={t}
        />
      )}
    </section>
  );
}

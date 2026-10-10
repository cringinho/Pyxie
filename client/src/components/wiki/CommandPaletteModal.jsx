import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, ArrowRight, CornerDownLeft, X, Sparkles } from 'lucide-react';

export default function CommandPaletteModal({ isOpen, onClose, commands = [], onSelectCommand }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = cmd.name?.toLowerCase().includes(q);
    const descMatch = cmd.description?.toLowerCase().includes(q);
    const aliasMatch = cmd.aliases?.some((a) => a.toLowerCase().includes(q));
    const catMatch = cmd.category?.toLowerCase().includes(q);
    return nameMatch || descMatch || aliasMatch || catMatch;
  }).slice(0, 8); // Top 8 results for quick display

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectCommand(filtered[selectedIndex]);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectCommand]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0e071a] border border-purple-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-purple-500/20 bg-white/5">
          <Search className="w-5 h-5 text-pink-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar comandos por nome, palavra-chave ou categoria..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/5">
          {filtered.length > 0 ? (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.name || idx}
                onClick={() => {
                  onSelectCommand(cmd);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  selectedIndex === idx
                    ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-sm text-white block truncate">
                      {cmd.name?.startsWith('/') ? cmd.name : `/${cmd.name || ''}`}
                    </span>
                    <span className="text-xs text-slate-400 truncate block">
                      {cmd.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {cmd.aliases && cmd.aliases[0] && (
                    <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300">
                      py!{cmd.aliases[0]}
                    </span>
                  )}
                  <CornerDownLeft className="w-4 h-4 text-purple-400 opacity-60" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              Nenhum comando encontrado para "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Abrir Detalhes</span>
          </div>
          <span>ESC para fechar</span>
        </div>
      </div>
    </div>
  );
}


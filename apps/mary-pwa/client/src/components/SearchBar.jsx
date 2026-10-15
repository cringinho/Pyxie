import React, { useRef, useEffect } from 'react';
import { MagnifyingGlass, X, Images, Heart, Sparkle, Lightning, Funnel } from '@phosphor-icons/react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalCount
}) {
  const inputRef = useRef(null);

  // Atalho global Ctrl+K / Cmd+K para focar a barra de pesquisa
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filterChips = [
    { id: 'all', label: 'Todos', icon: Funnel },
    { id: 'photos', label: 'Com Fotos', icon: Images },
    { id: 'liked', label: 'Curtidos', icon: Heart },
    { id: 'mary', label: 'Mary', icon: Sparkle },
    { id: 'leh', label: 'Leh', icon: Lightning }
  ];

  return (
    <div className="space-y-2.5">
      {/* Campo de Busca */}
      <div className="relative">
        <MagnifyingGlass
          weight="bold"
          className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar no Universo... (Ctrl+K para pesquisar)"
          className="w-full pl-10 pr-16 py-2.5 bg-white/5 border border-pink-500/20 rounded-2xl text-white text-xs placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-sans transition-all"
        />

        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            title="Limpar pesquisa"
          >
            <X weight="bold" className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/10 text-gray-400 border border-white/10">
            Ctrl+K
          </span>
        )}
      </div>

      {/* Chips de Filtros Rápidos */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {filterChips.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeFilter === chip.id;

          return (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`px-3 py-1.5 rounded-xl font-sans text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-all border ${
                isActive
                  ? 'bg-pink-500/25 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon weight={isActive ? 'fill' : 'duotone'} className="w-3.5 h-3.5 text-pink-400" />
              <span>{chip.label}</span>
            </button>
          );
        })}

        {typeof totalCount === 'number' && (
          <span className="ml-auto text-[10px] text-gray-500 font-sans shrink-0 pl-2">
            {totalCount} {totalCount === 1 ? 'relato' : 'relatos'}
          </span>
        )}
      </div>
    </div>
  );
}

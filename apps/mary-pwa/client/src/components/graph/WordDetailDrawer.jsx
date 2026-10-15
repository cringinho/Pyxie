import React from 'react';
import { X, Sparkle, Quotes, BookOpenText, Trash } from '@phosphor-icons/react';

export default function WordDetailDrawer({ word, isOpen, onClose, onDeleteWord, onGoToMemory }) {
  if (!isOpen || !word) return null;

  const snippets = word.snippets || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0f091a]/95 backdrop-blur-2xl border-l border-pink-500/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header do Drawer */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 rounded-full shadow-md"
            style={{ backgroundColor: word.color || '#EC4899' }}
          />
          <div>
            <h3 className="text-base font-bold font-display text-white">{word.word}</h3>
            <span className="text-[11px] text-pink-300 font-sans">
              {word.count} {word.count === 1 ? 'ocorrência nos relatos' : 'ocorrências nos relatos'}
            </span>
          </div>
        </div>

        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {word.meaningOrNote && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Significado / Nota Afetiva
            </span>
            <p className="text-xs text-pink-200 font-sans italic">
              "{word.meaningOrNote}"
            </p>
          </div>
        )}

        {/* Trechos Exatos (Snippets) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-1.5">
            <Quotes weight="duotone" className="w-4 h-4 text-pink-400" />
            <span>Trechos Onde Vocês Usaram Esta Palavra</span>
          </h4>

          {snippets.length > 0 ? (
            <div className="space-y-2.5">
              {snippets.map((snip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/5 border border-pink-500/15 space-y-1.5 hover:border-pink-500/35 transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] text-pink-300/80 font-sans">
                    <span className="font-semibold text-white">{snip.memoryTitle}</span>
                    <span>{snip.memoryDate}</span>
                  </div>

                  <p className="text-xs text-gray-200/90 font-sans italic leading-relaxed">
                    "{snip.snippet}"
                  </p>

                  {onGoToMemory && (
                    <button
                      onClick={() => {
                        onClose();
                        onGoToMemory(snip.memoryId);
                      }}
                      className="text-[10px] font-sans font-semibold text-pink-400 hover:underline inline-flex items-center gap-1 pt-0.5"
                    >
                      <BookOpenText weight="bold" className="w-3 h-3" />
                      <span>Ver este relato completo</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-sans text-center py-6">
              Nenhuma memória recente citando esta palavra ainda.
            </p>
          )}
        </div>
      </div>

      {/* Rodapé com Ação de Excluir */}
      {onDeleteWord && word.id && (
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              if (window.confirm(`Deseja remover "${word.word}" do grafo?`)) {
                onDeleteWord(word.id);
                onClose();
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 font-sans"
          >
            <Trash weight="duotone" className="w-3.5 h-3.5" />
            <span>Remover Palavra do Grafo</span>
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { X, Sparkle, ShareNetwork, BookOpenText, CalendarBlank } from '@phosphor-icons/react';

export default function MemoryTimelineModal({ memory, connectedMemories = [], isOpen, onClose, onGoToMemory }) {
  if (!isOpen || !memory) return null;

  const timelineList = [memory, ...connectedMemories].sort((a, b) => {
    return (a.memoryDate || '').localeCompare(b.memoryDate || '');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl my-auto animate-in fade-in duration-150">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <ShareNetwork weight="duotone" className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold font-display text-white">Evolução da História</h3>
              <p className="text-[10px] text-pink-300 font-sans">
                {timelineList.length} momentos interligados no tempo
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="relative border-l-2 border-pink-500/40 ml-3.5 space-y-6 py-2">
            {timelineList.map((m, idx) => {
              const isCurrent = m.id === memory.id;
              return (
                <div key={m.id || idx} className="relative pl-6">
                  {/* Ponto na timeline */}
                  <div
                    className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                      isCurrent
                        ? 'bg-pink-500 border-white shadow-[0_0_12px_#EC4899]'
                        : 'bg-[#18121e] border-pink-400'
                    }`}
                  />

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-pink-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-pink-300 flex items-center gap-1">
                        <CalendarBlank weight="bold" className="w-3 h-3" />
                        {m.memoryDate}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 font-sans">
                          Momento Selecionado
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold font-display text-white">{m.title}</h4>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-400 font-sans">
                        Por {m.authorName || 'Autor'}
                      </span>

                      {onGoToMemory && (
                        <button
                          onClick={() => {
                            onClose();
                            onGoToMemory(m.memoryId || m.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-[10px] font-sans font-semibold inline-flex items-center gap-1"
                        >
                          <BookOpenText weight="bold" className="w-3 h-3" />
                          <span>Ver no Feed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

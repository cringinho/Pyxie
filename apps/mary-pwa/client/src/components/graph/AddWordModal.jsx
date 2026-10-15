import React, { useState } from 'react';
import { X, Check, Sparkle, Heart, Star, Cloud, Crown, Cat, Handshake } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';

const PALETTE = ['#EC4899', '#9333EA', '#38BDF8', '#F59E0B', '#10B981', '#F43F5E'];
const ICONS = [
  { name: 'Sparkles', icon: Sparkle },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Cloud', icon: Cloud },
  { name: 'Crown', icon: Crown },
  { name: 'Cat', icon: Cat },
  { name: 'Handshake', icon: Handshake }
];
const CATEGORIES = ['Afeto', 'Piada Interna', 'Lugar', 'Música', 'Promessa', 'Apelido'];

export default function AddWordModal({ isOpen, onClose, onWordAdded }) {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customNote, setCustomNote] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [iconName, setIconName] = useState('Sparkles');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!word.trim()) {
      setErrorMsg('Informe a palavra ou expressão.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const combinedNote = customNote.trim() ? `[${category}] ${customNote.trim()}` : `[${category}]`;
      const res = await fetch('/api/graph/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ word: word.trim(), color, meaningOrNote: combinedNote, iconName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao cadastrar palavra');
      if (onWordAdded) onWordAdded(data.word);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao registrar palavra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden border border-pink-500/30 shadow-2xl my-auto animate-in fade-in duration-150">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <Sparkle weight="duotone" className="w-5 h-5" />
            <h3 className="text-sm font-bold font-display text-white">Cadastrar Palavra no Grafo</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-sans">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Palavra ou Expressão</label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Ex: Cringinho, Maricota, Boleta..."
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-display font-semibold focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Categoria</label>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-sans border transition-all ${
                    category === cat ? 'bg-pink-500/25 border-pink-500 text-pink-200' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Nota / Significado (Opcional)</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: O apelido mais fofo do mundo..."
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Cor Neon</label>
            <div className="flex items-center gap-2">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Ícone</label>
            <div className="flex items-center gap-1.5">
              {ICONS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIconName(item.name)}
                    className={`p-1.5 rounded-lg border transition-all ${iconName === item.name ? 'bg-pink-500/25 border-pink-500 text-pink-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <Icon weight="duotone" className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-white/5 text-gray-300 text-xs">Cancelar</button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check weight="bold" className="w-3.5 h-3.5" />}
              <span>Cadastrar Palavra</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

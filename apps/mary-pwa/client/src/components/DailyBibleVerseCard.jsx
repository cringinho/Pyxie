import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenText, Sparkle, ArrowClockwise, BookmarkSimple, NotePencil, Check } from '@phosphor-icons/react';
import { getDailyVerse, getNewWordVerse, saveFavoriteVerse } from '../services/bibleService';
import { useAuth } from '../context/AuthContext';

export default function DailyBibleVerseCard({ onTransformToMemory }) {
  const { user } = useAuth();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    async function loadVerse() {
      setLoading(true);
      try {
        const v = await getDailyVerse();
        setVerse(v);
      } catch (err) {
        console.warn('Erro ao carregar versículo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVerse();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setIsFavorited(false);
    try {
      const v = await getNewWordVerse();
      setVerse(v);
      setFeedbackMsg('Nova palavra do céu recebida! ✨');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.warn('Erro ao sortear versículo:', err);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleFavorite() {
    if (!verse || isFavorited) return;
    setFavoriting(true);
    try {
      await saveFavoriteVerse(verse, noteText || null);
      setIsFavorited(true);
      setNoteOpen(false);
      setFeedbackMsg('Versículo guardado nos favoritos! 💖');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setFeedbackMsg('Erro ao salvar favorito.');
      setTimeout(() => setFeedbackMsg(null), 2500);
    } finally {
      setFavoriting(false);
    }
  }

  const isMary = user?.username == 'mary';

  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel border border-pink-500/25 shadow-2xl p-5 sm:p-6 transition-all">
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
        <div className="flex items-center gap-2 text-pink-400">
          <BookOpenText weight="duotone" className="w-5 h-5" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-display text-pink-300 flex items-center gap-1.5">
            <span>{isMary ? 'Palavra do Dia para Mary' : 'Versículo Diário'}</span>
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </h3>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-pink-300 border border-white/10 transition-all flex items-center gap-1.5 text-[11px] disabled:opacity-50"
          title="Receber nova palavra da Bíblia"
        >
          <ArrowClockwise weight="bold" className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-pink-400' : ''}`} />
          <span className="hidden sm:inline">Nova Palavra</span>
        </button>
      </div>
      <div className="relative z-10 space-y-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-gray-400">Buscando palavra inspiracional...</div>
        ) : verse ? (
          <>
            <blockquote className="font-verse italic text-base sm:text-lg leading-relaxed text-pink-50/95 font-medium">
              "{verse.text}"
            </blockquote>

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
              <span className="font-display font-semibold text-xs sm:text-sm text-pink-300">
                — {verse.reference}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNoteOpen(!noteOpen)}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all border ${
                    isFavorited ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-white/5 text-gray-300 border-white/10'
                  }`}
                  title="Guardar nos Favoritos"
                >
                  <BookmarkSimple weight={isFavorited ? 'fill' : 'duotone'} className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
                </button>

                <button
                  onClick={() => onTransformToMemory && onTransformToMemory(verse)}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs flex items-center gap-1.5 transition-all"
                  title="Criar relato a partir do versículo"
                >
                  <NotePencil weight="duotone" className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">Criar Relato</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {noteOpen && !isFavorited && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 overflow-hidden space-y-2"
                >
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Nota pessoal ou oração da Mary (opcional)..."
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setNoteOpen(false)} className="px-2 py-1 text-[11px] text-gray-400">Cancelar</button>
                    <button
                      onClick={handleFavorite}
                      disabled={favoriting}
                      className="px-3 py-1 rounded-lg bg-pink-600 text-white text-[11px] font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check weight="bold" className="w-3 h-3" />
                      <span>{favoriting ? 'Guardando...' : 'Salvar Favorito'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}

        {feedbackMsg && (
          <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs text-center">
            {feedbackMsg}
          </div>
        )}
      </div>

    </div>
  );
}

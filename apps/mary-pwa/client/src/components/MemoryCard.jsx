import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import {
  Heart, Sparkle, Skull, Fire, Drop, ShareNetwork, LockKey,
  MapPin, Trash, ChatTeardropText, Smiley
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import LightboxModal from './LightboxModal';

const REACTIONS = [
  { id: 'heart', label: 'Amor', icon: Heart, color: '#EC4899' },
  { id: 'sparkle', label: 'Glitter', icon: Sparkle, color: '#F59E0B' },
  { id: 'kuromi', label: 'Kuromi', icon: Skull, color: '#9333EA' },
  { id: 'fire', label: 'Fogo', icon: Fire, color: '#EF4444' },
  { id: 'emotional', label: 'Emocionada', icon: Drop, color: '#38BDF8' }
];

export default function MemoryCard({ memory, onLike, onDelete, onTagClick, onSelectMemory }) {
  const { user } = useAuth();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showConnections, setShowConnections] = useState(false);

  const isAuthor = user?.id === memory.authorId;
  const userLike = memory.likes?.find(l => l.userId === user?.id);
  const isLiked = Boolean(userLike);
  const currentReactionId = userLike?.reaction || 'heart';
  const currentReaction = REACTIONS.find(r => r.id === currentReactionId) || REACTIONS[0];

  function triggerConfetti() {
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#EC4899', '#A855F7', '#F59E0B']
      });
    } catch (e) {}
  }

  function handleQuickLike() {
    if (!isLiked) triggerConfetti();
    onLike(memory.id, currentReactionId);
  }

  function handleSelectReaction(reactionId) {
    setShowReactionPicker(false);
    triggerConfetti();
    onLike(memory.id, reactionId);
  }

  // Formatação segura da data
  let formattedDate = memory.memoryDate;
  try {
    formattedDate = format(parseISO(memory.memoryDate), "d 'de' MMMM, yyyy", { locale: ptBR });
  } catch (e) {}

  const images = memory.media || [];
  const ReactionIcon = currentReaction.icon;
  const isMaryAuthor = memory.author?.username === 'mary';

  // Tratamento 100% seguro de tags (array, string JSON ou texto)
  let safeTags = [];
  if (Array.isArray(memory.tags)) {
    safeTags = memory.tags;
  } else if (typeof memory.tags === 'string' && memory.tags.trim()) {
    try {
      const parsed = JSON.parse(memory.tags);
      safeTags = Array.isArray(parsed) ? parsed : [memory.tags];
    } catch (e) {
      safeTags = memory.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    }
  }

  return (
    <article className="glass-panel rounded-3xl overflow-hidden border border-pink-500/20 shadow-xl transition-all duration-300 hover:border-pink-500/40 relative">
      {/* Header do Relato */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border overflow-hidden bg-[#18121e] flex items-center justify-center shrink-0 ${
            isMaryAuthor ? 'border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.25)]' : 'border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.2)]'
          }`}>
            {memory.author?.avatarUrl ? (
              <img src={memory.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={`font-serif font-bold text-sm ${isMaryAuthor ? 'text-sky-300' : 'text-purple-300'}`}>
                {isMaryAuthor ? 'M' : 'L'}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-display font-semibold text-xs sm:text-sm text-white">
              <span>{memory.author?.displayName || 'Autor'}</span>
              {memory.author?.nickname && (
                <span className={`text-[11px] font-sans font-medium ${isMaryAuthor ? 'text-sky-400' : 'text-purple-400'}`}>
                  ({memory.author.nickname})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans">
              <span>{formattedDate}</span>
              {memory.location && (
                <span className="flex items-center gap-0.5 text-pink-300/80">
                  <MapPin weight="fill" className="w-2.5 h-2.5" />
                  <span>{memory.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {memory.isLocked ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
              <LockKey weight="duotone" className="w-3 h-3" />
              <span>Selado</span>
            </span>
          ) : memory.mood && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-pink-300">
              {memory.mood}
            </span>
          )}

          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
              title="Apagar este relato"
            >
              <Trash weight="duotone" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Corpo do Relato */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <h3 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
          {memory.title}
        </h3>

        <p className="text-xs sm:text-sm text-gray-200/95 font-sans leading-relaxed whitespace-pre-wrap">
          {memory.content}
        </p>

        {/* Mosaico de Imagens */}
        {images.length > 0 && (
          <div className="pt-1">
            {images.length === 1 ? (
              <div
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="rounded-2xl overflow-hidden cursor-pointer max-h-96 group relative border border-white/10"
              >
                <img
                  src={images[0].fileUrl}
                  alt={images[0].caption || ''}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            ) : (
              <div className={`grid gap-2 rounded-2xl overflow-hidden ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {images.slice(0, 3).map((img, idx) => {
                  const hasMore = idx === 2 && images.length > 3;
                  return (
                    <div
                      key={img.id || idx}
                      onClick={() => {
                        setLightboxIndex(idx);
                        setLightboxOpen(true);
                      }}
                      className="aspect-square relative cursor-pointer overflow-hidden rounded-xl border border-white/10 group"
                    >
                      <img
                        src={img.thumbUrl || img.fileUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {hasMore && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-display font-bold text-sm">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {safeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick && onTagClick(tag)}
                className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20 hover:bg-pink-500/20 transition-all"
              >
                #{String(tag).replace(/^#/, '')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé: Likes Afetivos & Conexões do Grafo */}
      <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 1.35 }}
            onClick={handleQuickLike}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowReactionPicker(!showReactionPicker);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all font-sans font-semibold text-xs ${
              isLiked
                ? 'bg-pink-500/25 border-pink-500 text-pink-300 shadow-md shadow-pink-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <ReactionIcon weight={isLiked ? 'fill' : 'duotone'} className="w-4 h-4 text-pink-400" />
            <span>{memory.likes?.length || 0}</span>
          </motion.button>

          {/* Mini-avatares */}
          {memory.likes && memory.likes.length > 0 && (
            <div className="flex -space-x-1.5 items-center">
              {memory.likes.map((like) => (
                <div
                  key={like.userId}
                  className="w-5 h-5 rounded-full border border-[#0b090e] overflow-hidden bg-purple-900/60"
                  title={`${like.nickname || like.displayName}: ${like.reaction}`}
                >
                  {like.avatarUrl ? (
                    <img src={like.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-center block text-pink-300">
                      {like.username === 'mary' ? 'M' : 'L'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Seletor de Reações Flutuante */}
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 p-1.5 rounded-2xl bg-[#140e20] border border-pink-500/30 shadow-2xl flex items-center gap-1 z-30"
              >
                {REACTIONS.map((reac) => {
                  const Icon = reac.icon;
                  return (
                    <button
                      key={reac.id}
                      onClick={() => handleSelectReaction(reac.id)}
                      className="p-2 rounded-xl hover:bg-pink-500/20 text-white transition-all flex flex-col items-center gap-0.5"
                      title={reac.label}
                    >
                      <Icon weight="duotone" className="w-5 h-5" style={{ color: reac.color }} />
                      <span className="text-[9px] font-sans text-gray-300">{reac.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chip de Conexões */}
        {memory.connectionsCount > 0 && (
          <button
            onClick={() => onSelectMemory && onSelectMemory(memory)}
            className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 flex items-center gap-1.5 text-[11px] font-sans font-medium transition-all"
          >
            <ShareNetwork weight="duotone" className="w-3.5 h-3.5 text-purple-400" />
            <span>{memory.connectionsCount} {memory.connectionsCount === 1 ? 'conexão' : 'conexões'}</span>
          </button>
        )}
      </div>

      {/* Lightbox Cinemático */}
      <LightboxModal
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

    </article>
  );
}

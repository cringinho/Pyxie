import React, { useState, useEffect } from 'react';
import { X, CaretLeft, CaretRight, MagnifyingGlassPlus, MagnifyingGlassMinus, Heart, BookOpenText } from '@phosphor-icons/react';

export default function LightboxModal({
  images = [],
  initialIndex = 0,
  isOpen,
  onClose,
  onToggleFavorite,
  onGoToMemory
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((i) => (i + 1) % images.length);
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((i) => (i - 1 + images.length) % images.length);
        setIsZoomed(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Barra superior de ações */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImg.albumName && (
            <span className="text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {currentImg.albumName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(currentImg.id)}
              className={`p-2 rounded-full border transition-all ${
                currentImg.isFavorite
                  ? 'bg-pink-600/30 border-pink-500 text-pink-400'
                  : 'bg-white/10 border-white/10 text-gray-300 hover:text-white'
              }`}
              title={currentImg.isFavorite ? 'Remover dos Favoritos' : 'Marcar como Favorita'}
            >
              <Heart weight={currentImg.isFavorite ? 'fill' : 'bold'} className="w-4 h-4 text-pink-400" />
            </button>
          )}

          {currentImg.memoryId && onGoToMemory && (
            <button
              onClick={() => {
                onClose();
                onGoToMemory(currentImg.memoryId);
              }}
              className="px-3 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-all"
              title="Ler relato completo desta foto"
            >
              <BookOpenText weight="duotone" className="w-4 h-4" />
              <span>Ver Relato</span>
            </button>
          )}

          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Alternar Zoom"
          >
            {isZoomed ? <MagnifyingGlassMinus weight="bold" className="w-5 h-5" /> : <MagnifyingGlassPlus weight="bold" className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Fechar (Esc)"
          >
            <X weight="bold" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Botão Anterior */}
      {images.length > 1 && (
        <button
          onClick={() => {
            setCurrentIndex((i) => (i - 1 + images.length) % images.length);
            setIsZoomed(false);
          }}
          className="absolute left-3 sm:left-6 z-50 p-2.5 rounded-full bg-black/50 hover:bg-pink-600/80 text-white transition-all"
        >
          <CaretLeft weight="bold" className="w-6 h-6" />
        </button>
      )}

      {/* Imagem Central */}
      <div className="max-w-5xl max-h-[85vh] p-2 flex flex-col items-center justify-center overflow-auto">
        <img
          src={currentImg.fileUrl || currentImg.thumbUrl}
          alt={currentImg.caption || 'Foto da Galeria'}
          className={`rounded-2xl shadow-2xl transition-transform duration-300 select-none ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[80vh] w-auto object-contain cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        {currentImg.caption && (
          <p className="mt-3 text-xs text-center text-pink-200/90 font-sans font-medium px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
            {currentImg.caption}
          </p>
        )}
      </div>

      {/* Botão Próximo */}
      {images.length > 1 && (
        <button
          onClick={() => {
            setCurrentIndex((i) => (i + 1) % images.length);
            setIsZoomed(false);
          }}
          className="absolute right-3 sm:right-6 z-50 p-2.5 rounded-full bg-black/50 hover:bg-pink-600/80 text-white transition-all"
        >
          <CaretRight weight="bold" className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}


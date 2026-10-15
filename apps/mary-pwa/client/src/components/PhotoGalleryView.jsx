import React, { useState, useEffect } from 'react';
import {
  Images, Plus, Heart, Folder, CalendarBlank, Funnel, Sparkle,
  BookOpenText, Eye
} from '@phosphor-icons/react';
import LightboxModal from './LightboxModal';
import UploadGalleryModal from './UploadGalleryModal';

export default function PhotoGalleryView({ onGoToMemory }) {
  const [media, setMedia] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'favorite', 'standalone', 'memories'
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Modais
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  async function fetchGallery() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedAlbum !== 'all') params.append('albumName', selectedAlbum);
      if (selectedMonth) params.append('month', selectedMonth);
      if (typeFilter === 'favorite') params.append('isFavorite', 'true');
      else if (typeFilter === 'standalone') params.append('type', 'standalone');
      else if (typeFilter === 'memories') params.append('type', 'memories');

      const res = await fetch(`/api/gallery?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
        if (data.albums) setAlbums(data.albums);
      }
    } catch (err) {
      console.warn('Erro ao carregar galeria:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGallery();
  }, [typeFilter, selectedAlbum, selectedMonth]);

  async function handleToggleFavorite(mediaId) {
    try {
      const res = await fetch(`/api/gallery/${mediaId}/favorite`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMedia(prev => prev.map(m => m.id === mediaId ? { ...m, isFavorite: data.isFavorite } : m));
      }
    } catch (err) {
      console.warn('Erro ao alternar favorito:', err);
    }
  }

  function handlePhotoUploaded(newItems) {
    fetchGallery();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filtros da Galeria */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-pink-400">
            <Images weight="duotone" className="w-6 h-6" />
            <div>
              <h2 className="text-base font-bold font-display text-white">Galeria Privada Mary & Leh</h2>
              <p className="text-[11px] text-pink-300/70 font-sans">
                {media.length} {media.length === 1 ? 'foto registrada' : 'fotos registradas'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-pink-500/20 font-display shrink-0"
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span>Adicionar Fotos</span>
          </button>
        </div>

        {/* Filtros em Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'Todas', icon: Funnel },
            { id: 'favorite', label: 'Favoritas', icon: Heart },
            { id: 'standalone', label: 'Fotos Avulsas', icon: Images },
            { id: 'memories', label: 'De Relatos', icon: BookOpenText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-sans text-[11px] font-medium flex items-center gap-1.5 shrink-0 transition-all border ${
                  isActive
                    ? 'bg-pink-500/25 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon weight={isActive ? 'fill' : 'duotone'} className="w-3.5 h-3.5 text-pink-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Seletores de Álbum e Mês */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Folder weight="duotone" className="w-4 h-4 text-pink-400 shrink-0" />
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="bg-transparent text-white text-xs w-full focus:outline-none font-sans"
            >
              <option value="all" className="bg-[#140e20]">Todos os Álbuns</option>
              {albums.map(a => (
                <option key={a} value={a} className="bg-[#140e20]">{a}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <CalendarBlank weight="duotone" className="w-4 h-4 text-pink-400 shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs w-full focus:outline-none font-mono"
            />
            {selectedMonth && (
              <button onClick={() => setSelectedMonth('')} className="text-[10px] text-pink-400 hover:text-white">
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Masonry de Fotos */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 font-sans flex items-center justify-center gap-2">
          <Sparkle weight="fill" className="w-4 h-4 text-pink-400 animate-spin" />
          <span>Carregando galeria...</span>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {media.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer border border-pink-500/20 hover:border-pink-500/50 shadow-md relative transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="aspect-square relative overflow-hidden bg-[#18121e]">
                <img
                  src={item.thumbUrl || item.fileUrl}
                  alt={item.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Overlay com Ações Rápidas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                        item.isFavorite
                          ? 'bg-pink-600/80 text-white'
                          : 'bg-black/40 text-gray-300 hover:text-white'
                      }`}
                      title={item.isFavorite ? 'Favorita' : 'Favoritar'}
                    >
                      <Heart weight={item.isFavorite ? 'fill' : 'bold'} className="w-3.5 h-3.5 text-pink-300" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {item.caption && (
                      <p className="text-[11px] text-white font-sans font-medium line-clamp-1">
                        {item.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-pink-200/80 font-sans">
                      <span>{item.albumName}</span>
                      {item.memoryTitle && (
                        <span className="flex items-center gap-0.5 text-purple-300">
                          <BookOpenText weight="bold" className="w-3 h-3" />
                          <span>Relato</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge de Favorita permanente */}
                {Boolean(item.isFavorite) && (
                  <span className="absolute top-2 left-2 p-1 rounded-full bg-black/60 backdrop-blur-md text-pink-400">
                    <Heart weight="fill" className="w-3 h-3 text-pink-400" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-3xl border border-pink-500/20 text-center space-y-3">
          <Images weight="duotone" className="w-10 h-10 text-pink-400/60 mx-auto" />
          <h3 className="text-base font-bold font-display text-white">Nenhuma foto encontrada</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto font-sans">
            Nenhuma foto coincide com os filtros aplicados. Que tal adicionar novas fotos ao álbum?
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold inline-flex items-center gap-1.5 mt-2"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Adicionar Fotos</span>
          </button>
        </div>
      )}

      {/* Lightbox Cinemático */}
      <LightboxModal
        images={media}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onToggleFavorite={handleToggleFavorite}
        onGoToMemory={onGoToMemory}
      />

      {/* Modal de Upload */}
      <UploadGalleryModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handlePhotoUploaded}
        albums={albums}
      />
    </div>
  );
}

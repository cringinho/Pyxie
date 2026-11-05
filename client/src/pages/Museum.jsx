import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles, Search, User, Calendar, Trash2, Edit3, X,
  ExternalLink, ShieldAlert, LayoutGrid, MessageSquare,
  Share2, Check, ZoomIn, ZoomOut, ChevronLeft, ChevronRight
} from 'lucide-react';

const getAuthorName = (art) => {
  return art?.authorName || art?.author || art?.authorUsername || 'A';
};

export default function Museum({ t, lang }) {
  const fmt = (key, vars = {}) => t(key).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
  const dateLocale = lang === 'en' ? 'en-US' : 'pt-BR';
  // 'Artista' é o marcador que o servidor usa quando não acha o nome.
  const getAuthorHandle = (art) => {
    const raw = art?.authorUsername || art?.authorName || art?.author || '';
    const clean = String(raw).trim().replace(/^@+/, '');
    return clean && clean.toLowerCase() !== 'artista' ? `@${clean}` : art?.userId ? `@${t('museum.member')}` : `@${t('museum.author')}`;
  };
  const artAlt = (art) => fmt('museum.artAlt', { author: getAuthorHandle(art) });

  const [arts, setArts] = useState([]);
  // 'loading' | 'ready' | 'error': "nenhuma obra" só aparece quando a API respondeu de verdade.
  const [loadState, setLoadState] = useState('loading');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'forum'
  // Dono logado no painel com Discord: a chave mestra nunca fica no navegador (Q267).
  const [isOwner, setIsOwner] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [editingArt, setEditingArt] = useState(null);
  const [newDesc, setNewDesc] = useState('');
  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem('pyxie_admin_token');
    } catch (_) {}
    fetch('/api/admin/modules/museum/config', { credentials: 'same-origin' })
      .then((res) => setIsOwner(res.ok))
      .catch(() => setIsOwner(false));
  }, []);

  const fetchArts = (p = 1, user = selectedUser) => {
    let url = `/api/museum/arts?page=${p}&limit=24`;
    if (user) url += `&user=${encodeURIComponent(user)}`;

    setLoadState('loading');
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !data.success) throw new Error('museum_unavailable');
        setArts(data.arts || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  };

  useEffect(() => {
    fetchArts(1);
  }, [selectedUser]);

  // Link direto (/museu?art=ID): busca a obra pelo ID, mesmo fora da 1ª página.
  useEffect(() => {
    const artParam = new URLSearchParams(window.location.search).get('art');
    if (!artParam) return;
    fetch(`/api/museum/art/${encodeURIComponent(artParam)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.art) {
          setSelectedArt(data.art);
          setLightboxZoom(1);
        }
      })
      .catch(() => {});
  }, []);

  // Extract unique authors for filter pills
  const authorPills = useMemo(() => {
    const map = new Map();
    arts.forEach((a) => {
      const name = a.authorUsername || a.authorName || a.author;
      if (a.userId && name && !map.has(a.userId)) {
        map.set(a.userId, String(name).trim().replace(/^@+/, ''));
      }
    });
    return Array.from(map.entries()).map(([userId, name]) => ({ userId, name }));
  }, [arts]);

  // Filtered arts by search
  const filteredArts = useMemo(() => {
    if (!searchQuery.trim()) return arts;
    const q = searchQuery.toLowerCase();
    return arts.filter(
      (a) =>
        a.description?.toLowerCase().includes(q) ||
        a.authorName?.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q) ||
        a.authorUsername?.toLowerCase().includes(q)
    );
  }, [arts, searchQuery]);

  const handleShare = (art, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/museu?art=${art.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm(t('museum.confirmDelete'))) return;
    try {
      const res = await fetch(`/api/museum/art/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'X-Pyxie-Panel': '1' },
      });
      const data = await res.json();
      if (data.success) {
        if (selectedArt?.id === id) setSelectedArt(null);
        fetchArts(page);
      } else {
        alert(t('museum.deleteFail'));
      }
    } catch (_) {
      alert(t('museum.requestFail'));
    }
  };

  const handleEditSave = async () => {
    if (!editingArt) return;
    try {
      const res = await fetch(`/api/museum/art/${editingArt.id}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Pyxie-Panel': '1',
        },
        body: JSON.stringify({ description: newDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingArt(null);
        fetchArts(page);
      } else {
        alert(t('museum.editFail'));
      }
    } catch (_) {
      alert(t('museum.requestFail'));
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShieldModalOpen(true);
  };

  const handleCopy = (e) => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 3) {
      e.preventDefault();
      const textWithAttribution = `${selection}\n\n${t('museum.copySource')} (https://pyxie.com.br/)`;
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', textWithAttribution);
      }
    }
  };

  return (
    <div onCopy={handleCopy} className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{t('museum.badge')}</span>
        </div>
        <h1 className="font-title font-black text-3xl sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-pink-200 to-purple-300 bg-clip-text text-transparent tracking-tight">
          {t('museum.mobileTitle')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          {t('museum.mobileSubtitle')}
        </p>
      </div>

      {/* Controls Bar: Search, View Mode Toggle & Active Author */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-purple-500/20">
        {/* Search Input */}
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('museum.searchPlaceholder')}
            aria-label={t('museum.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label={t('museum.clearSearch')}
              className="absolute right-3 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-purple-500/20">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('museum.viewGrid')}</span>
          </button>
          <button
            onClick={() => setViewMode('forum')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'forum'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('museum.viewForum')}</span>
          </button>
        </div>
      </div>

      {/* Author Filter Pills */}
      {authorPills.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedUser('')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !selectedUser
                ? 'bg-pink-600 text-white shadow-neon-pink'
                : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t('museum.allArtists')}
          </button>
          {authorPills.map(({ userId, name }) => (
            <button
              key={userId}
              onClick={() => setSelectedUser(selectedUser === userId ? '' : userId)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedUser === userId
                  ? 'bg-pink-600 text-white shadow-neon-pink'
                  : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10'
              }`}
            >
              <User className="w-3 h-3 text-purple-400" />
              <span>@{name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Gallery Render: Grid vs Forum Mode */}
      {loadState === 'loading' && arts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-busy="true" aria-label={t('museum.loading')}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-2xl glass-panel border border-purple-500/20 overflow-hidden animate-pulse">
              <div className="aspect-square bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-1/2 rounded bg-white/10" />
                <div className="h-3 w-3/4 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : loadState === 'error' ? (
        <div role="alert" className="text-center py-20 space-y-4">
          <p className="text-slate-300 text-sm">{t('museum.loadError')}</p>
          <button
            onClick={() => fetchArts(page)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold"
          >
            {t('museum.retry')}
          </button>
        </div>
      ) : filteredArts.length > 0 ? (
        viewMode === 'grid' ? (
          /* Masonry Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredArts.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  setSelectedArt(art);
                  setLightboxZoom(1);
                }}
                className="group relative rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between"
              >
                {/* Artwork Media with Anti-Copy Shield */}
                <div
                  onContextMenu={handleContextMenu}
                  className="relative aspect-square overflow-hidden bg-black/40 select-none art-shield"
                >
                  <img
                    src={art.imageUrl || `/api/museum/art-image/${art.id}`}
                    alt={artAlt(art)}
                    data-canonical-url="https://pyxie.com.br/"
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  {/* Share button hover pill */}
                  <button
                    onClick={(e) => handleShare(art, e)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    title={t('museum.shareArt')}
                    aria-label={t('museum.shareArt')}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Footer Metadata */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-title font-bold text-pink-300 truncate max-w-[150px]">
                      {getAuthorHandle(art)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {art.createdAt ? new Date(art.createdAt).toLocaleDateString(dateLocale) : ''}
                    </span>
                  </div>
                  {art.description && (
                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {art.description}
                    </p>
                  )}
                </div>

                {/* Admin controls */}
                {isOwner && (
                  <div className="p-3 border-t border-purple-500/15 flex items-center justify-end gap-2 bg-black/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingArt(art);
                        setNewDesc(art.description || '');
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(art.id, e)}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Expanded Forum Mode */
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredArts.map((art) => (
              <div
                key={art.id}
                className="rounded-3xl glass-panel border border-purple-500/20 p-6 space-y-4 hover:border-pink-500/40 transition-colors"
              >
                {/* Forum Post Header */}
                <div className="flex items-center justify-between border-b border-purple-500/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-sm">
                      <div className="w-full h-full rounded-full bg-[#0e071a] flex items-center justify-center text-pink-300 font-bold font-mono text-xs">
                        {(getAuthorName(art) || 'A')[0].toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="font-title font-bold text-white text-sm block">
                        {getAuthorHandle(art)}
                      </span>
                      <span className="text-[11px] font-mono text-purple-300/70">
                        {fmt('museum.publishedOn', { date: art.createdAt ? new Date(art.createdAt).toLocaleDateString(dateLocale) : t('museum.noDate') })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShare(art)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('museum.share')}</span>
                  </button>
                </div>

                {/* Forum Description */}
                {art.description && (
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {art.description}
                  </p>
                )}

                {/* Forum Main Art Attachment */}
                <div
                  onContextMenu={handleContextMenu}
                  onClick={() => {
                    setSelectedArt(art);
                    setLightboxZoom(1);
                  }}
                  className="rounded-2xl overflow-hidden bg-black/60 max-h-[500px] flex items-center justify-center cursor-pointer select-none art-shield border border-purple-500/15"
                >
                  <img
                    src={art.imageUrl || `/api/museum/art-image/${art.id}`}
                    alt={artAlt(art)}
                    data-canonical-url="https://pyxie.com.br/"
                    loading="lazy"
                    className="w-full h-full object-contain max-h-[500px] pointer-events-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24 text-slate-300 text-sm">
          {arts.length === 0 && !selectedUser ? t('museum.emptyGallery') : t('museum.emptySearch')}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => fetchArts(page - 1)}
            disabled={page <= 1}
            aria-label={t('museum.prevPage')}
            className="p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs text-slate-300">
            {fmt('museum.pageOf', { page, total: totalPages })}
          </span>
          <button
            onClick={() => fetchArts(page + 1)}
            disabled={page >= totalPages}
            aria-label={t('museum.nextPage')}
            className="p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cinematic Lightbox Modal */}
      {selectedArt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedArt(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between mb-3 px-2 text-white">
              <div className="flex items-center gap-3">
                <span className="font-title font-bold text-sm text-pink-300">
                  {getAuthorHandle(selectedArt)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {t('museum.id')}: {selectedArt.id?.slice(0, 10)}...
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxZoom((z) => Math.min(z + 0.25, 2.5))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title={t('museum.zoomIn')}
                  aria-label={t('museum.zoomIn')}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightboxZoom((z) => Math.max(z - 0.25, 0.75))}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                  title={t('museum.zoomOut')}
                  aria-label={t('museum.zoomOut')}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleShare(selectedArt, e)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold"
                  title={t('museum.shareArt')}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? t('museum.copied') : t('museum.share')}</span>
                </button>
                <button
                  onClick={() => setSelectedArt(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white ml-2 transition-colors"
                  title={t('museum.close')}
                  aria-label={t('museum.close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image with Zoom, Art Shield & Honeypot Ribbon */}
            <div
              onContextMenu={handleContextMenu}
              className="relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl select-none art-shield flex items-center justify-center bg-black/50 p-2 group"
            >
              <img
                src={selectedArt.imageUrl || `/api/museum/art-image/${selectedArt.id}`}
                alt={artAlt(selectedArt)}
                data-canonical-url="https://pyxie.com.br/"
                style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.2s ease-out' }}
                className="max-h-[72vh] max-w-full object-contain pointer-events-none rounded-lg"
              />
              {/* Honeypot Ribbon sobre a base da imagem para capturas de tela (Print Screen) */}
              <div className="absolute inset-x-0 bottom-0 py-2.5 px-4 bg-black/85 backdrop-blur-md border-t border-pink-500/40 flex items-center justify-between text-xs font-mono tracking-wide z-20 select-none pointer-events-none">
                <span className="text-white font-bold truncate">
                  <span className="text-pink-400 font-extrabold mr-1.5">✦</span>
                  pyxie.com.br • {getAuthorHandle(selectedArt)}
                </span>
                <span className="text-purple-300/80 text-[11px] shrink-0 ml-2 hidden sm:inline">
                  {t('museum.officialGallery')}
                </span>
              </div>
            </div>

            {/* Lightbox Description */}
            {selectedArt.description && (
              <p className="mt-4 text-center text-slate-300 text-sm max-w-2xl px-4">
                "{selectedArt.description}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Description Modal (Admin) */}
      {editingArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e071a] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-title font-bold text-white text-lg">{t('museum.editTitle')}</h3>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full h-32 p-3 rounded-xl bg-white/5 border border-purple-500/25 text-white text-sm outline-none focus:border-pink-500"
              placeholder={t('museum.editPlaceholder')}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingArt(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
              >
                {t('museum.cancel')}
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-neon-pink"
              >
                {t('museum.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Copy Protection Modal */}
      {shieldModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShieldModalOpen(false)}
        >
          <div
            className="bg-[#0e071a] border border-pink-500/40 rounded-3xl p-6 max-w-md text-center space-y-4 shadow-neon-pink"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="font-title font-bold text-white text-lg">
              {t('museum.artShieldTitle')}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('museum.artShield')}
            </p>
            <button
              onClick={() => setShieldModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-neon-pink"
            >
              {t('museum.modalUnderstood')} ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

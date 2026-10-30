import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Search, ExternalLink, Flame, Share2, Check,
  ChevronDown, ChevronUp, Rocket, ShieldCheck, Heart,
  Users, Bot, Globe, AlertCircle, Award
} from 'lucide-react';
import ShopeeBentoGrid from '../components/shopee/ShopeeBentoGrid';

// Macro-category visual themes
const MACRO_THEMES = {
  community: {
    border: 'border-purple-500/30 hover:border-purple-500/60',
    topBorder: 'border-t-purple-500',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    glow: 'rgba(139, 92, 246, 0.25)',
    icon: Users,
    color: '#8B5CF6',
  },
  creator: {
    border: 'border-pink-500/30 hover:border-pink-500/60',
    topBorder: 'border-t-pink-500',
    badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    glow: 'rgba(236, 72, 153, 0.25)',
    icon: Sparkles,
    color: '#EC4899',
  },
  service: {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    topBorder: 'border-t-cyan-500',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.25)',
    icon: Bot,
    color: '#06B6D4',
  },
  ong: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    topBorder: 'border-t-emerald-500',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.25)',
    icon: Heart,
    color: '#10B981',
  },
};

// Normalize external image URLs (e.g. unpacking Discord proxy wrappers)
function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  const discordProxyMatch = trimmed.match(/\/https\/(.+)$/i);
  if (discordProxyMatch) {
    return 'https://' + discordProxyMatch[1];
  }
  const discordProxyHttpMatch = trimmed.match(/\/http\/(.+)$/i);
  if (discordProxyHttpMatch) {
    return 'http://' + discordProxyHttpMatch[1];
  }
  return trimmed;
}

// Safe image component with 2-tier fallback: direct -> server proxy -> Pyxie mascot
function PartnerImage({ src, alt, className = '' }) {
  const cleanSrc = useMemo(() => normalizeImageUrl(src) || '/assets/pyxie/sticker/sticker_smile.png', [src]);
  const [currentSrc, setCurrentSrc] = useState(cleanSrc);
  const [attempt, setAttempt] = useState(0); // 0: direct, 1: proxy, 2: default
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(cleanSrc);
    setAttempt(0);
    setLoaded(false);
  }, [cleanSrc]);

  const handleError = () => {
    if (attempt === 0 && cleanSrc && (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://'))) {
      // 1st Fallback: attempt through safe backend proxy
      setAttempt(1);
      setCurrentSrc(`/api/partnerships/proxy-image?url=${encodeURIComponent(cleanSrc)}`);
    } else if (attempt <= 1) {
      // 2nd Fallback: official Pyxie mascot fallback
      setAttempt(2);
      setCurrentSrc('/assets/pyxie/sticker/sticker_smile.png');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
      className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-70'}`}
    />
  );
}

// Partner Card with expandable description ("Leia mais")
function PartnerCard({ partner, isFeatured = false, t, lang, onBump, bumpingId, onShare, copiedId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const macro = partner.macroCategory || 'community';
  const theme = MACRO_THEMES[macro] || MACRO_THEMES.community;
  const MacroIcon = theme.icon;

  const desc = partner.publicDesc || '';
  const isLongDesc = desc.length > 140;
  const displayDesc = !isLongDesc || isExpanded ? desc : `${desc.slice(0, 140)}...`;

  const categoryLabel =
    (partner.categoryLabel && (partner.categoryLabel[lang] || partner.categoryLabel.en)) ||
    partner.categoryKey ||
    '';

  const tier = partner.badge?.tier || 0;
  const tierRing = tier === 3 ? 'ring-2 ring-amber-400/80' : tier === 2 ? 'ring-2 ring-[#E60067]/80 motion-safe:animate-pulse' : tier === 1 ? 'ring-1 ring-violet-500/80' : '';
  const tierTitle = partner.badge?.label ? partner.badge.label[lang] || partner.badge.label.pt : undefined;
  const isBumping = bumpingId === partner.id;
  const isCopied = copiedId === partner.id;

  return (
    <div
      id={`partner-${partner.id}`}
      title={tierTitle}
      className={`${tierRing} relative group flex flex-col rounded-2xl bg-[#120a24]/80 backdrop-blur-xl border border-t-[3px] ${theme.topBorder} ${theme.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${
        isFeatured ? 'ring-1 ring-amber-400/30 shadow-amber-500/10' : ''
      }`}
      style={{
        boxShadow: isFeatured
          ? `0 12px 35px rgba(0,0,0,0.6), 0 0 25px rgba(245, 158, 11, 0.12)`
          : `0 10px 30px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>{t('partnerships.featuredBadge')}</span>
        </div>
      )}

      {/* Share / Copy link top right */}
      <button
        onClick={() => onShare(partner)}
        title={t('partnerships.share')}
        className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>

      {/* Card Banner / Thumbnail */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#0a0515]">
        <PartnerImage
          src={partner.imageUrl}
          alt={`Parceria: ${partner.projectName}`}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120a24] via-[#120a24]/40 to-transparent" />
      </div>

      {/* Card Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Header Row: Category Pill & Flame Streak */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
              <span>{partner.categoryEmoji || '🤝'}</span>
              <span>{categoryLabel}</span>
            </div>

            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm"
              title={`${partner.bumpCount || 0} ${t('partnerships.bumpStreak')}`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{partner.bumpCount || 0} {t('partnerships.bumpStreak')}</span>
            </div>
          </div>

          {/* Project Title */}
          <h3 className="font-title font-extrabold text-lg sm:text-xl text-white group-hover:text-pink-300 transition-colors line-clamp-1">
            {partner.projectName}
          </h3>

          {/* Project Description with Read More */}
          <div className="mt-2 text-sm text-slate-300/90 leading-relaxed">
            <p className="whitespace-pre-line break-words">{displayDesc}</p>
            {isLongDesc && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300 hover:underline focus:outline-none transition-colors"
              >
                <span>{isExpanded ? t('partnerships.readLess') : t('partnerships.readMore')}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-purple-500/15 flex items-center gap-2.5">
          <a
            href={partner.accessLink || '#'}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 hover:shadow-purple-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{t('partnerships.visit')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onBump(partner.id)}
            disabled={isBumping}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            title={t('partnerships.bump')}
          >
            <Rocket className={`w-4 h-4 ${isBumping ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('partnerships.bump')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Partnerships({ t, lang }) {
  const [catalog, setCatalog] = useState([]);
  const [mosaic, setMosaic] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bumpingId, setBumpingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Fetch partnerships from API
  const fetchPartnerships = (cat = null) => {
    setLoading(true);
    const url = `/api/partnerships${cat && cat !== 'all' ? `?category=${encodeURIComponent(cat)}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setCatalog(data.catalog || []);
          if (data.mosaic) setMosaic(data.mosaic);
        }
      })
      .catch((err) => {
        console.error('[Partnerships] Erro ao carregar catálogo:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartnerships(selectedCategory === 'all' ? null : selectedCategory);
  }, [selectedCategory]);

  // Deep linking: scroll to #partner-:id if in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('partner') || window.location.hash.replace('#partner-', '');
    if (targetId && catalog.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`partner-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-pink-500');
        }
      }, 400);
    }
  }, [catalog]);

  // Bump action
  const handleBump = async (partnerId) => {
    setBumpingId(partnerId);
    try {
      const res = await fetch(`/api/partnerships/bump/${encodeURIComponent(partnerId)}?lang=${lang}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || t('partnerships.bumpSuccess'));
        fetchPartnerships(selectedCategory === 'all' ? null : selectedCategory);
      } else {
        showToast(data.message || t('partnerships.bumpWait'));
      }
    } catch (_) {
      showToast(t('common.error'));
    } finally {
      setBumpingId(null);
    }
  };

  // Share action
  const handleShare = (partner) => {
    const url = `${window.location.origin}/parcerias?partner=${encodeURIComponent(partner.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(partner.id);
        showToast(t('partnerships.copied'));
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  // Filter catalog by search query
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter(
      (p) =>
        (p.projectName && p.projectName.toLowerCase().includes(q)) ||
        (p.publicDesc && p.publicDesc.toLowerCase().includes(q)) ||
        (p.categoryKey && p.categoryKey.toLowerCase().includes(q)) ||
        (p.macroCategory && p.macroCategory.toLowerCase().includes(q))
    );
  }, [catalog, searchQuery]);

  // Category tab definitions
  const CATEGORY_TABS = [
    { key: 'all', label: t('partnerships.tabAll'), icon: Globe },
    { key: 'community', label: t('partnerships.tabCommunity'), icon: Users },
    { key: 'creator', label: t('partnerships.tabCreator'), icon: Sparkles },
    { key: 'service', label: t('partnerships.tabService'), icon: Bot },
    { key: 'ong', label: t('partnerships.tabOng'), icon: Heart },
  ];

  // Global metrics
  const totalBumps = useMemo(() => {
    return catalog.reduce((sum, p) => sum + (p.bumpCount || 0), 0);
  }, [catalog]);

  const mosaicList = useMemo(() => {
    return Object.values(mosaic || {}).filter(Boolean);
  }, [mosaic]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#120a24]/95 border border-emerald-400 text-white shadow-2xl backdrop-blur-2xl">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg shadow-emerald-500/10 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t('partnerships.badge')}</span>
        </div>

        {/* Mascot Centerpiece */}
        <div className="relative w-36 h-24 sm:w-52 sm:h-32 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
          <img
            src="/assets/pyxie/icons/astaroth_heart_icon.svg?v=2.2.3"
            alt="Guardião Astaroth"
            className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_8px_24px_rgba(16,185,129,0.45)] transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title */}
        <h1 className="font-title font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
          <span>{t('partnerships.titlePrefix')} </span>
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {t('partnerships.titleHighlight')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300/85 leading-relaxed font-normal">
          {t('partnerships.subtitle')}
        </p>

        <div className="mt-6 flex flex-col items-center gap-2">
          <a
            href={`/meu-perfil/divulgar${lang === 'en' ? '?lang=en' : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-xl shadow-pink-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('partnerships.applyBtn')}</span>
          </a>
          <a href="/discord" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-300 hover:text-white underline">
            {t('partnerships.applyDiscord')}
          </a>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-purple-500/20 backdrop-blur-md">
            <img src="/assets/pyxie/emojis/astaroth_gem.png" alt="Gem" className="w-5 h-5 object-contain" />
            <div className="text-left">
              <div className="text-xs text-purple-300 font-medium">{t('partnerships.statPartners')}</div>
              <div className="text-lg font-extrabold text-white font-title">{catalog.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-amber-500/20 backdrop-blur-md">
            <Flame className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-xs text-amber-300 font-medium">{t('partnerships.statBumps')}</div>
              <div className="text-lg font-extrabold text-white font-title">{totalBumps}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-cyan-500/20 backdrop-blur-md">
            <Globe className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <div className="text-xs text-cyan-300 font-medium">{t('partnerships.statCategories')}</div>
              <div className="text-lg font-extrabold text-white font-title">4</div>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Mosaic (When no specific category is selected) */}
      {selectedCategory === 'all' && mosaicList.length > 0 && !searchQuery && (
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-title font-extrabold text-xl sm:text-2xl text-white">
                {t('partnerships.featuredBadge')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {t('partnerships.featuredDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mosaicList.map((p) => (
              <PartnerCard
                key={`mosaic-${p.id}`}
                partner={p}
                isFeatured={true}
                t={t}
                lang={lang}
                onBump={handleBump}
                bumpingId={bumpingId}
                onShare={handleShare}
                copiedId={copiedId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Control Strip: Search Bar & Category Filter Pills */}
      <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/25 border border-pink-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-purple-500/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('partnerships.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-purple-500/20 focus:border-pink-500 text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="mb-14">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="font-title font-extrabold text-xl sm:text-2xl text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-400" />
            <span>{t('partnerships.catalogTitle')}</span>
          </h2>
          <span className="text-xs sm:text-sm text-slate-400">
            {filteredCatalog.length} {t('partnerships.statPartners').toLowerCase()}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">{t('partnerships.loading')}</p>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-white/5 border border-purple-500/15">
            <AlertCircle className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
            <p className="text-slate-300 font-semibold">{t('partnerships.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                isFeatured={false}
                t={t}
                lang={lang}
                onBump={handleBump}
                bumpingId={bumpingId}
                onShare={handleShare}
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA Card: Apply for Partnership */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-indigo-900/40 border border-pink-500/30 p-8 sm:p-10 mb-16 backdrop-blur-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{t('nav.partnerships')}</span>
          </div>
          <h2 className="font-title font-black text-2xl sm:text-3xl text-white">
            {t('partnerships.applyTitle')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            {t('partnerships.applyDesc')}
          </p>
        </div>

        <a
          href={`/meu-perfil/divulgar${lang === 'en' ? '?lang=en' : ''}`}
          className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('partnerships.applyBtn')}</span>
        </a>
      </div>

      {/* Shopee Bento Deals Showcase */}
      <ShopeeBentoGrid t={t} lang={lang} />
    </div>
  );
}


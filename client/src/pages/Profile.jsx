import React, { useEffect, useState } from 'react';
import {
  Sparkles, Heart, Award, Share2, Check, ExternalLink,
  BookOpen, Coins, ShieldCheck, User, Compass, Lock
} from 'lucide-react';

export default function Profile({ t, lang, userId }) {
  const [profileData, setProfileData] = useState(null);
  const [tarotCards, setTarotCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeTab, setActiveTab] = useState('tarot'); // 'tarot' | 'achievements'
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract userId from URL if not passed
  const resolvedUserId = userId || window.location.pathname.split('/u/')[1] || '';

  // Fetch full profile data
  useEffect(() => {
    if (!resolvedUserId) return;
    setLoading(true);
    fetch(`/api/profile/${resolvedUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setProfileData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar perfil:', err);
        setLoading(false);
      });
  }, [resolvedUserId]);

  // Fetch all 78 tarot cards catalog
  useEffect(() => {
    fetch('/api/tarot/cards')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.cards)) {
          setTarotCards(data.cards);
        }
      })
      .catch((err) => console.error('Erro ao buscar cartas:', err));
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Perfil de Membro da Pyxie`,
        text: `Confira minha coleção de Tarot e status na Pyxie!`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm">
        <Sparkles className="w-5 h-5 text-pink-400 animate-spin mr-2" />
        <span>Sintonizando perfil cósmico...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-title font-bold text-2xl text-white">Perfil Não Encontrado</h2>
        <p className="text-slate-400 text-sm max-w-md">
          Nenhum registro cósmico associado ao ID {resolvedUserId} foi localizado no banco de dados.
        </p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs shadow-neon-pink"
        >
          Voltar para o Início
        </a>
      </div>
    );
  }

  const { account, marriage, tarot, achievements } = profileData;
  const discoveredSet = new Set(tarot.discoveredCards || []);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl glass-panel border border-purple-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* User Avatar */}
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 shadow-neon-pink flex-shrink-0">
              <img
                src="/assets/pyxie/pyxie_mascot.png"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full bg-[#0e071a]"
              />
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-400 border-2 border-[#0e071a] flex items-center justify-center text-[10px] text-black font-bold">
                ✓
              </span>
            </div>

            {/* User Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-title font-black text-2xl sm:text-3xl text-white">
                  Membro ({resolvedUserId.slice(-4)})
                </h1>
                {account.activeTitle && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                    👑 {account.activeTitle}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-pink-300">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Profissão: {account.profession || 'Aventureiro Místico'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{account.balance.toLocaleString('pt-BR')} Moedas</span>
                </span>
                {account.dailyStreak > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-orange-400 font-bold">🔥 {account.dailyStreak} dias</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Share Profile Button */}
          <button
            onClick={handleShare}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-title font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-pink-400" />}
            <span>{copiedLink ? 'Link Copiado! 🔗' : 'Compartilhar Perfil'}</span>
          </button>
        </div>

        {/* Marriage Love Bar (If Married) */}
        {marriage && marriage.isMarried && (
          <div className="mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-pink-500/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <Heart className="w-5 h-5 fill-pink-500" />
              </div>
              <div>
                <span className="font-title font-bold text-sm text-white block">
                  Laço Matrimonial Ativo
                </span>
                <span className="text-xs text-purple-300/80">
                  Árvore da Vida: Nível {marriage.treeLevel} • Cofre: {marriage.vaultCoins} 🪙
                </span>
              </div>
            </div>

            {/* Love Bar Progress */}
            <div className="w-full sm:w-60 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-pink-300 font-bold">
                <span>Barra do Amor</span>
                <span>{marriage.love}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 shadow-neon-pink"
                  style={{ width: `${Math.min(marriage.love, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation: Tarot Album vs Achievements */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('tarot')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tarot'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink'
              : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Álbum de Tarot ({tarot.discoveredCount}/78)</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-neon-pink'
              : 'bg-white/5 border border-purple-500/20 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Conquistas Arcanas</span>
        </button>
      </div>

      {/* Tab 1: 3D Tarot Cards Showcase */}
      {activeTab === 'tarot' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-mono">
            <span>Progresso da Coleção: {tarot.discoveredCount} de 78 cartas ({Math.round((tarot.discoveredCount / 78) * 100)}%)</span>
            <span>Clique na carta para inspecionar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tarotCards.map((card, idx) => {
              const cardNum = idx + 1;
              const isDiscovered = discoveredSet.has(cardNum);

              return (
                <div
                  key={card.id || idx}
                  onClick={() => isDiscovered && setSelectedCard(card)}
                  className={`group relative rounded-2xl p-2.5 border transition-all duration-300 transform flex flex-col items-center justify-between aspect-[2/3] ${
                    isDiscovered
                      ? 'bg-[#140a28]/80 border-purple-500/40 hover:border-pink-500 hover:shadow-neon-pink hover:-translate-y-1.5 cursor-pointer'
                      : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                  style={{ perspective: '1000px' }}
                >
                  {/* Card Illustration / Silhouette */}
                  <div className="w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center bg-black/60">
                    {isDiscovered ? (
                      <img
                        src={`/api/tarot/card-image?id=${card.id}`}
                        alt={card.name}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center space-y-2 text-slate-500">
                        <Lock className="w-5 h-5 text-slate-600" />
                        <span className="font-mono text-[10px] tracking-wider">#{String(cardNum).padStart(2, '0')}</span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-600">Bloqueado</span>
                      </div>
                    )}
                  </div>

                  {/* Card Name Footer */}
                  <div className="w-full pt-2 text-center">
                    <span className={`text-[11px] font-bold block truncate ${isDiscovered ? 'text-white group-hover:text-pink-300' : 'text-slate-600'}`}>
                      {isDiscovered ? card.name : '???'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab 2: Reactive Achievements Showcase */}
      {activeTab === 'achievements' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                ach.completed
                  ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-pink-500/40'
                  : 'bg-white/5 border-white/5 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  ach.completed ? 'bg-pink-500/20 border border-pink-500/40 text-pink-400' : 'bg-white/5 text-slate-500'
                }`}
              >
                {ach.completed ? '🏆' : '🔒'}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-title font-bold text-sm text-white truncate">
                    {lang === 'en' ? ach.nameEn : ach.namePt}
                  </h4>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    +{ach.rewardCoins} 🪙
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'en' ? ach.descEn : ach.descPt}
                </p>

                {/* Progress Mini Bar */}
                <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${Math.min((ach.current / ach.target) * 100, 100)}%` }}
                    />
                  </div>
                  <span>{ach.current}/{ach.target}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Card Inspection Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="relative max-w-md w-full rounded-3xl bg-[#0e071a] border border-purple-500/40 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
              <span className="font-title font-bold text-lg text-white">
                {selectedCard.name}
              </span>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="aspect-[2/3] max-h-72 mx-auto rounded-xl overflow-hidden border border-purple-500/30">
              <img
                src={`/api/tarot/card-image?id=${selectedCard.id}`}
                alt={selectedCard.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="font-bold text-pink-300 block mb-0.5">Significado Direto:</span>
                <p className="leading-relaxed">{selectedCard.upright}</p>
              </div>
              <div>
                <span className="font-bold text-purple-300 block mb-0.5">Significado Invertido:</span>
                <p className="leading-relaxed">{selectedCard.reversed}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

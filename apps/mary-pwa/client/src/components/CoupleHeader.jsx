import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkle, CalendarHeart } from '@phosphor-icons/react';
import { Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoupleHeader({ onOpenProfile }) {
  const { user } = useAuth();
  const [coupleData, setCoupleData] = useState(null);
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    async function loadCouple() {
      try {
        const res = await fetch('/api/couple', { credentials: 'include' });
        if (res.ok) setCoupleData(await res.json());
      } catch (err) {
        console.warn('Erro ao carregar dados do casal:', err);
      }
    }
    loadCouple();
  }, [user?.avatarUrl, user?.nickname, user?.moodStatus]);

  useEffect(() => {
    const anniversaryStr = coupleData?.settings?.anniversaryDate || '2026-01-30';
    const startDate = new Date(`${anniversaryStr}T00:00:00`);

    function updateCounter() {
      const diffMs = Math.max(0, Date.now() - startDate.getTime());
      setTimeTogether({
        days: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffMs / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diffMs / (1000 * 60)) % 60)
      });
    }

    updateCounter();
    const interval = setInterval(updateCounter, 60000);
    return () => clearInterval(interval);
  }, [coupleData?.settings?.anniversaryDate]);

  const me = user;
  const partner = coupleData?.partner || {
    username: me?.username === 'mary' ? 'leh' : 'mary',
    displayName: me?.username === 'mary' ? 'Leandro' : 'Mary',
    nickname: me?.username === 'mary' ? 'Cringinho' : 'Maricota',
    avatarUrl: null
  };

  const isMaryMe = me?.username === 'mary';
  const maryUser = isMaryMe ? me : partner;
  const lehUser = isMaryMe ? partner : me;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-pink-500/20 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Avatares Mary & Leandro */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={isMaryMe ? onOpenProfile : undefined}
            className={`relative group ${isMaryMe ? 'cursor-pointer' : ''}`}
            title={isMaryMe ? 'Editar meu perfil' : maryUser.displayName}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-400 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#18121e] flex items-center justify-center">
                {maryUser.avatarUrl ? (
                  <img src={maryUser.avatarUrl} alt="Mary" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold font-serif text-pink-300">M</span>
                )}
              </div>
            </div>
            {isMaryMe && (
              <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-pink-600 text-white shadow-sm border border-[#0b090e]">
                <Settings className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <motion.div
            animate={{ scale: [1, 1.25, 1, 1.28, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-pink-500 px-0.5"
          >
            <Heart weight="fill" className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>

          <div
            onClick={!isMaryMe ? onOpenProfile : undefined}
            className={`relative group ${!isMaryMe ? 'cursor-pointer' : ''}`}
            title={!isMaryMe ? 'Editar meu perfil' : lehUser.displayName}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#18121e] flex items-center justify-center">
                {lehUser.avatarUrl ? (
                  <img src={lehUser.avatarUrl} alt="Leandro" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold font-serif text-purple-300">L</span>
                )}
              </div>
            </div>
            {!isMaryMe && (
              <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-purple-600 text-white shadow-sm border border-[#0b090e]">
                <Settings className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          <div className="hidden xs:block pl-1">
            <div className="flex items-center gap-1 font-display font-semibold text-xs sm:text-sm text-white">
              <span>{maryUser.nickname || 'Maricota'}</span>
              <span className="text-pink-400 font-serif italic text-xs">&</span>
              <span>{lehUser.nickname || 'Cringinho'}</span>
            </div>
            <div className="text-[10px] text-pink-300/70 flex items-center gap-1">
              <Sparkle weight="fill" className="w-2.5 h-2.5 text-pink-400" />
              <span>Nosso Universo Privado</span>
            </div>
          </div>
        </div>

        {/* Contador de Tempo */}
        <div className="flex items-center gap-2 bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-2xl border border-white/10 shadow-sm">
          <CalendarHeart weight="duotone" className="w-4 h-4 text-pink-400 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold font-display text-white">
              {timeTogether.days}d {timeTogether.hours}h {timeTogether.minutes}m
            </div>
            <div className="text-[9px] text-pink-200/60 uppercase tracking-wider">
              Juntos no Tempo
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

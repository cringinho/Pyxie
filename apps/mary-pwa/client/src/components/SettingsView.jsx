import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  SlidersHorizontal, Palette, BellRinging, BellSlash, Heart,
  Sparkle, CalendarHeart, Plus, Trash, DownloadSimple,
  SignOut, NotePencil, Check, PaperPlaneTilt
} from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function SettingsView({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const {
    isSupported, isSubscribed, loading: pushLoading,
    subscribe, unsubscribe, sendThinkingOfYou, sendTestPush
  } = usePushNotifications();

  const [thinkingSending, setThinkingSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Datas Especiais & Contador
  const [anniversaryDate, setAnniversaryDate] = useState('2026-01-30');
  const [specialDates, setSpecialDates] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [daysUntilAnniversary, setDaysUntilAnniversary] = useState(0);

  // Instalação PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  async function handleInstallApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  }

  // Carrega datas comemorativas do casal
  useEffect(() => {
    async function loadCoupleDates() {
      try {
        const res = await fetch('/api/couple', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const anni = data.settings?.anniversaryDate || '2026-01-30';
          setAnniversaryDate(anni);

          if (data.settings?.specialDatesJson) {
            try {
              setSpecialDates(JSON.parse(data.settings.specialDatesJson));
            } catch (e) {
              setSpecialDates([]);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar datas:', err);
      }
    }
    loadCoupleDates();
  }, []);

  // Calcula contagem regressiva para o próximo aniversário
  useEffect(() => {
    function calcDays() {
      const now = new Date();
      const [, m, d] = anniversaryDate.split('-');
      const targetThisYear = new Date(now.getFullYear(), parseInt(m, 10) - 1, parseInt(d, 10));
      let nextTarget = targetThisYear;
      if (now > targetThisYear) {
        nextTarget = new Date(now.getFullYear() + 1, parseInt(m, 10) - 1, parseInt(d, 10));
      }
      const diffDays = Math.ceil((nextTarget.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setDaysUntilAnniversary(diffDays);
    }
    calcDays();
  }, [anniversaryDate]);

  async function handleSendThinking() {
    setThinkingSending(true);
    setFeedback(null);
    try {
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.8 }, colors: ['#EC4899', '#F43F5E', '#A855F7'] });
      const result = await sendThinkingOfYou();
      setFeedback({ type: result.success ? 'success' : 'error', text: result.message });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setThinkingSending(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Ajustes */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5 text-pink-400">
          <SlidersHorizontal weight="duotone" className="w-6 h-6" />
          <div>
            <h2 className="text-base font-bold font-display text-white">Ajustes & Personalização</h2>
            <p className="text-[11px] text-pink-300/70 font-sans">
              Notificações, temas, datas marcantes e instalação PWA
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-2xl text-xs text-center font-sans font-medium ${
          feedback.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* CARD 1: INSTALAÇÃO DO PWA */}
      {isInstallable && (
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-600/10 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <DownloadSimple weight="bold" className="w-4 h-4" />
              <span>Instalar Aplicativo Nativo</span>
            </h3>
            <p className="text-[11px] text-gray-300 font-sans">
              Instale o Nosso Universo na tela inicial do seu celular para acesso rápido em tela cheia e offline!
            </p>
          </div>

          <button
            onClick={handleInstallApp}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 text-black font-bold text-xs shrink-0 shadow-lg shadow-amber-500/20 font-display"
          >
            Instalar App
          </button>
        </div>
      )}

      {/* CARD 2: NOTIFICAÇÕES PUSH NATIVAS (VAPID) */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-pink-400">
            <BellRinging weight="duotone" className="w-5 h-5" />
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
              Notificações Push em Tempo Real
            </h3>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${
            isSubscribed
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-white/5 border-white/10 text-gray-400'
          }`}>
            {isSubscribed ? 'Ativo neste Celular' : 'Desativado'}
          </span>
        </div>

        <p className="text-xs text-gray-300 font-sans leading-relaxed">
          Receba avisos instantâneos quando o parceiro publicar um relato, curtir uma memória com corações ou adicionar fotos à galeria.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {isSubscribed ? (
            <button
              onClick={unsubscribe}
              disabled={pushLoading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-sans font-medium flex items-center gap-1.5 transition-all"
            >
              <BellSlash weight="duotone" className="w-4 h-4" />
              <span>Desativar neste Dispositivo</span>
            </button>
          ) : (
            <button
              onClick={subscribe}
              disabled={pushLoading || !isSupported}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all font-display disabled:opacity-50"
            >
              <BellRinging weight="bold" className="w-4 h-4" />
              <span>Ativar Notificações Push</span>
            </button>
          )}

          {/* Botão de Enviar Pensando em Você */}
          <button
            onClick={handleSendThinking}
            disabled={thinkingSending}
            className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all font-display ml-auto"
            title="Mandar um 'Pensando em você' com notificação push imediata para o parceiro"
          >
            {thinkingSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PaperPlaneTilt weight="fill" className="w-3.5 h-3.5 text-pink-400" />}
            <span>Pensando em você 💭</span>
          </button>
        </div>
      </div>

      {/* CARD 3: TEMAS VISUAIS DINÂMICOS */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-3">
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-1.5">
          <Palette weight="duotone" className="w-4 h-4 text-pink-400" />
          <span>Tema Visual do Universo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                theme === t.id
                  ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: t.primary }} />
                <span className="text-xs font-bold font-display text-white">{t.name}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">{t.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CARD 4: DATAS COMEMORATIVAS & CONTAGEM REGRESSIVA */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center gap-1.5">
            <CalendarHeart weight="duotone" className="w-4 h-4 text-pink-400" />
            <span>Datas Marcantes do Casal</span>
          </h3>

          <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
            Faltam {daysUntilAnniversary} dias para o próximo marco!
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="text-white font-display font-semibold block">Início da Nossa História</span>
            <span className="text-[11px] text-pink-300 font-mono">30 de Janeiro de 2026</span>
          </div>
          <Heart weight="fill" className="w-5 h-5 text-pink-500 animate-pulse" />
        </div>
      </div>

      {/* CARD 5: AÇÕES DA CONTA */}
      <div className="glass-panel p-5 rounded-3xl border border-pink-500/20 shadow-xl flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpenProfile}
          className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 font-display"
        >
          <NotePencil weight="duotone" className="w-4 h-4 text-pink-400" />
          <span>Editar Perfil & Foto de {user.displayName}</span>
        </button>

        <button
          onClick={logout}
          className="py-2.5 px-5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center justify-center gap-2 font-display"
        >
          <SignOut weight="bold" className="w-4 h-4" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
}

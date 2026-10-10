import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, CheckCircle2, Clock, Volume2, VolumeX } from 'lucide-react';
import ShopeeBentoGrid from '../components/shopee/ShopeeBentoGrid';

export default function Bonus({ t, lang }) {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isReady, setIsReady] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Parse token from query
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token') || '';

  // Sound beep effect (Web Audio API synthetic chime)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (_) {}
  };

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
      playChime();
    }
  }, [secondsLeft]);

  const handleClaim = async () => {
    if (!token) {
      alert('Token de bônus não informado na URL. Abra o link enviado pelo bot no Discord.');
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch('/api/bonus/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data && data.success) {
        setIsClaimed(true);
        setClaimResult(data);
      } else {
        alert(data.error || 'Falha ao reivindicar bônus.');
      }
    } catch (err) {
      alert('Erro na conexão com o servidor.');
    } finally {
      setClaiming(false);
    }
  };

  // SVG Radial circle calculation
  const totalSeconds = 10;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((10 - secondsLeft) / totalSeconds) * circumference;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 shadow-sm">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Bônus Mágico da Comunidade</span>
        </div>
        <h1 className="font-title font-black text-4xl sm:text-5xl text-white tracking-tight">
          {t('bonus.title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2">
          {t('bonus.subtitle')}
        </p>
      </div>

      {/* 10s Countdown Card */}
      <div className="max-w-md mx-auto p-8 rounded-3xl glass-panel border border-purple-500/30 text-center shadow-2xl relative overflow-hidden">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 border border-purple-500/20 text-slate-400 hover:text-white"
          title={soundEnabled ? 'Silenciar som' : 'Ativar som'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Radial SVG Countdown */}
        <div className="relative w-44 h-44 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Neon Circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="#E60067"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 12px rgba(230, 0, 103, 0.8))' }}
            />
          </svg>

          {/* Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isReady ? (
              <Sparkles className="w-10 h-10 text-emerald-400 animate-bounce" />
            ) : (
              <>
                <span className="font-title font-black text-4xl text-white">
                  {secondsLeft}s
                </span>
                <span className="text-[11px] font-mono text-purple-300 uppercase tracking-widest mt-1">
                  Alinhando
                </span>
              </>
            )}
          </div>
        </div>

        {/* Claim Status & Button */}
        {isClaimed ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-2 animate-scaleIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-title font-bold text-lg">{t('bonus.claimed')}</h4>
            <p className="text-xs text-slate-200">
              {claimResult?.message || 'Suas moedinhas mágicas foram creditadas na sua conta do Discord!'}
            </p>
          </div>
        ) : (
          <button
            disabled={!isReady || claiming}
            onClick={handleClaim}
            className={`w-full py-4 rounded-2xl font-title font-black text-base text-white transition-all transform ${
              isReady && !claiming
                ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-neon-pink hover:-translate-y-1 active:translate-y-0 cursor-pointer'
                : 'bg-white/10 text-slate-400 border border-purple-500/20 cursor-not-allowed opacity-60'
            }`}
          >
            {claiming ? 'Reivindicando...' : isReady ? t('bonus.claim') : `Aguarde ${secondsLeft} segundos...`}
          </button>
        )}
      </div>

      {/* Repositioned Native Shopee Bento Grid */}
      <ShopeeBentoGrid t={t} lang={lang} />
    </div>
  );
}

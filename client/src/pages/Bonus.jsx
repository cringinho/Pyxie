import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles, CheckCircle2, Clock, Volume2, VolumeX, AlertCircle, ArrowRight } from 'lucide-react';
import ShopeeBentoGrid from '../components/shopee/ShopeeBentoGrid';

export default function Bonus({ t, lang }) {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isReady, setIsReady] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef(null);

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
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (_) {}
  };

  // 10s Timer
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
      playChime();
      triggerConfetti();
    }
  }, [secondsLeft]);

  // Particle explosion upon readiness
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const particles = Array.from({ length: 40 }, () => ({
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      radius: Math.random() * 3 + 2,
      color: ['#f472b6', '#c084fc', '#38bdf8', '#fbbf24', '#34d399'][Math.floor(Math.random() * 5)],
      alpha: 1,
    }));

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
      });

      frame++;
      if (frame < 60) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }
    animate();
  };

  // Dynamic speech bubble quotes for reactive mascot
  const getMascotSpeech = () => {
    if (isClaimed) {
      return 'Moedinhas entregues no seu cofre com sucesso! Volte amanhã para mais! 🎉';
    }
    if (secondsLeft > 7) {
      return 'Canalizando a energia estelar do seu cofre mágico... ⚡';
    }
    if (secondsLeft > 3) {
      return 'Quase lá! As moedas estão brilhando na penumbra cósmica... ✨';
    }
    if (secondsLeft > 0) {
      return 'Sintonização quase concluída! Prepare seu cofre! 🌟';
    }
    return 'Energia cósmica pronta! Clique no botão abaixo para resgatar! 🎁';
  };

  const handleClaim = async () => {
    if (!token) {
      alert('Token de bônus não informado na URL. Abra o link gerado pelo comando /py-bonus no Discord.');
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
      setClaiming(false);
      if (data && data.success) {
        setIsClaimed(true);
        setClaimResult(data);
        playChime();
      } else {
        alert(data.error || 'Falha ao reivindicar bônus.');
      }
    } catch (_) {
      setClaiming(false);
      alert('Erro na requisição com o servidor.');
    }
  };

  // SVG Radial progress calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((10 - secondsLeft) / 10) * circumference;

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Canalização de Recompensas Cósmicas</span>
        </div>
        <h1 className="font-title font-black text-3xl sm:text-5xl text-white tracking-tight">
          {t('bonus.title')}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          {t('bonus.subtitle')}
        </p>
      </div>

      {/* Main Countdown & Mascot Stage */}
      <div className="max-w-2xl mx-auto relative rounded-3xl glass-panel border border-purple-500/30 p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden">
        {/* Confetti canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20"
        />

        {/* Sound toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-30"
          title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reactive Mascot & Speech Bubble */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 max-w-lg">
          <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-pink-500 to-purple-600 shadow-neon-pink flex-shrink-0 animate-bounce-slow">
            <img
              src="/assets/pyxie/pyxie_mascot.png"
              alt="Mascote Pyxie"
              className="w-full h-full object-contain rounded-full bg-[#0e071a] p-1.5"
            />
          </div>
          <div className="relative p-3.5 rounded-2xl bg-white/10 border border-purple-500/30 text-xs sm:text-sm text-slate-100 font-medium text-left shadow-lg">
            {getMascotSpeech()}
            <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white/10 border-l border-b border-purple-500/30 rotate-45" />
          </div>
        </div>

        {/* Holographic Radial SVG Timer Ring */}
        <div className="relative w-44 h-44 flex items-center justify-center z-10">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Gradient Ring */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="url(#gradient-ring)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center font-title">
            {isClaimed ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
            ) : isReady ? (
              <Sparkles className="w-12 h-12 text-pink-400 animate-spin-slow" />
            ) : (
              <span className="font-black text-4xl sm:text-5xl text-white tracking-tighter">
                {secondsLeft}s
              </span>
            )}
            <span className="text-[11px] font-mono text-purple-300/80 uppercase tracking-widest mt-1">
              {isClaimed ? 'Resgatado' : isReady ? 'Pronto!' : 'Canalizando'}
            </span>
          </div>
        </div>

        {/* Claim Action Button */}
        <div className="w-full max-w-sm space-y-3 z-10">
          {!token && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Abra o link enviado pelo comando <strong>/py-bonus</strong> no Discord para validar seu token.</span>
            </div>
          )}

          {isClaimed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{t('bonus.claimed')}</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={!isReady || claiming || !token}
              className={`w-full py-4 rounded-2xl font-title font-black text-sm tracking-wide transition-all transform flex items-center justify-center gap-2 ${
                isReady && token
                  ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink hover:scale-102 cursor-pointer'
                  : 'bg-white/5 border border-purple-500/20 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {claiming
                  ? 'Creditando no cofre...'
                  : isReady
                  ? t('bonus.claim')
                  : `Aguarde ${secondsLeft}s para liberar ✨`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Shopee Bento Grid ("Achadinhos da Fada") */}
      <ShopeeBentoGrid t={t} lang={lang} />
    </div>
  );
}

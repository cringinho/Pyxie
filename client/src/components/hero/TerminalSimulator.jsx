import React, { useState, useEffect } from 'react';
import { Terminal, Briefcase, Heart, Sparkles, CheckCircle2, Coins, ArrowRight } from 'lucide-react';

export default function TerminalSimulator({ t }) {
  const [activeTab, setActiveTab] = useState('work');
  const [workSelected, setWorkSelected] = useState(null);
  const [tarotTyped, setTarotTyped] = useState('');
  const [tarotRevealed, setTarotRevealed] = useState(false);

  // Typewriter effect for tarot tab
  useEffect(() => {
    if (activeTab === 'tarot') {
      const fullText = t('terminal.tarotDesc');
      let i = 0;
      setTarotTyped('');
      setTarotRevealed(false);
      const timer = setInterval(() => {
        if (i < fullText.length) {
          setTarotTyped(fullText.slice(0, i + 1));
          i++;
        } else {
          setTarotRevealed(true);
          clearInterval(timer);
        }
      }, 25);
      return () => clearInterval(timer);
    }
  }, [activeTab, t]);

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl glass-panel border border-purple-500/25 overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Terminal Titlebar */}
      <div className="px-4 py-3 bg-[#0d071b]/90 border-b border-purple-500/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="ml-2 font-mono text-xs text-purple-300/60 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-pink-400" /> pyxie-simulator@discord:~
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono text-emerald-300 font-bold">READY</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-500/15 bg-[#0a0515]/60 px-2 pt-2 gap-1 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('work'); setWorkSelected(null); }}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'work'
              ? 'bg-[#180d2d] text-pink-300 border-t-2 border-pink-500'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-3 h-3 text-pink-400" />
          {t('terminal.tabWork')}
        </button>

        <button
          onClick={() => setActiveTab('marriage')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'marriage'
              ? 'bg-[#180d2d] text-purple-300 border-t-2 border-purple-500'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-3 h-3 text-rose-400" />
          {t('terminal.tabMarriage')}
        </button>

        <button
          onClick={() => setActiveTab('tarot')}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tarot'
              ? 'bg-[#180d2d] text-cyan-300 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {t('terminal.tabTarot')}
        </button>
      </div>

      {/* Terminal View Content */}
      <div className="p-5 font-mono text-xs sm:text-sm min-h-[260px] flex flex-col justify-between bg-gradient-to-b from-[#120824]/90 to-[#0a0416]/95">
        {/* TAB 1: /py-work */}
        {activeTab === 'work' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-pink-400 font-bold flex items-center gap-2">
              <span className="text-slate-500">$</span> /py-work
            </div>
            <div className="text-slate-200 font-semibold">{t('terminal.workTitle')}</div>
            <p className="text-slate-400 text-xs leading-relaxed">{t('terminal.workDesc')}</p>

            <div className="space-y-2 pt-1">
              {[
                { id: 1, label: t('terminal.opt1') },
                { id: 2, label: t('terminal.opt2') },
                { id: 3, label: t('terminal.opt3') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setWorkSelected(opt.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    workSelected === opt.id
                      ? 'bg-pink-500/20 border-pink-500 text-white shadow-neon-pink'
                      : 'bg-white/5 border-purple-500/20 text-slate-300 hover:bg-white/10 hover:border-pink-500/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  {workSelected === opt.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>

            {workSelected && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-scaleIn flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('terminal.workResult')}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: /py-casamento */}
        {activeTab === 'marriage' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-purple-400 font-bold flex items-center gap-2">
              <span className="text-slate-500">$</span> /py-casamento status
            </div>
            <div className="text-slate-200 font-bold flex items-center gap-2">
              <span>{t('terminal.marriageTitle')}</span>
              <span className="text-rose-400 animate-pulse">💖</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-rose-300 mb-1">
                <span>{t('terminal.loveBar')}</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5">
                <div className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full animate-pulse w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-slate-300">
                {t('terminal.loveTree')}
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-amber-300">
                {t('terminal.loveVault')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: /py-tarot */}
        {activeTab === 'tarot' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-cyan-400 font-bold flex items-center gap-2">
              <span className="text-slate-500">$</span> /py-tarot daily
            </div>
            <div className="text-amber-300 font-bold flex items-center gap-2">
              <span>{t('terminal.tarotTitle')}</span>
              <span className="text-cyan-300">✦</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="text-pink-400 font-bold text-sm tracking-wide">
                🔮 {t('terminal.tarotCard')}
              </div>
              <p className="text-slate-300 text-xs italic leading-relaxed min-h-[48px]">
                {tarotTyped}
                {!tarotRevealed && <span className="inline-block w-1.5 h-3.5 bg-pink-400 ml-1 animate-pulse" />}
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-purple-500/10 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Pyxie Discord Engine v14</span>
          <span className="text-purple-400/80 font-semibold">100% Interativo</span>
        </div>
      </div>
    </div>
  );
}


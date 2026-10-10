import React from 'react';
import { Sparkles, MessageCircle, Coins, Briefcase, Activity } from 'lucide-react';
import TerminalSimulator from './TerminalSimulator';

export default function HeroSection({ t, stats }) {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-pink-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Narrative & Clean CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Semantic H1 Header */}
            <h1 className="font-title font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]">
              <span className="text-white">Pyxie</span> •{' '}
              <span className="text-slate-200">{t('hero.titlePrefix')}</span>{' '}
              <span className="gradient-text-pink">{t('hero.titleHighlight')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {t('hero.subtitle')}
            </p>

            {/* Semantic Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/25 text-xs font-semibold text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{t('hero.badgeEconomy')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/25 text-xs font-semibold text-purple-300">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>{t('hero.badgeCareers')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/25 text-xs font-semibold text-emerald-300">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>{stats?.uptime || '99.9% Uptime'}</span>
              </div>
            </div>

            {/* TWO CLEAN HIGH-CONVERTING CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="/invite"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-neon-pink transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 border border-pink-400/30"
              >
                <Sparkles className="w-5 h-5 text-pink-200" />
                <span>{t('hero.btnInvite')}</span>
              </a>

              <a
                href="/discord"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2.5 backdrop-blur-xl"
              >
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span>{t('hero.btnSupport')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Live Bot Terminal Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <TerminalSimulator t={t} />
          </div>

        </div>
      </div>
    </section>
  );
}


import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Terminal, Clock, ShieldCheck, Share2 } from 'lucide-react';
import DiscordEmbedPreview from './DiscordEmbedPreview';
import { cleanAliases, cleanName } from '../../utils/commands';
import { localeHref } from '../../utils/localePath';

// Recarga em texto curto ("24 h", "3 h", "30 s"); null quando o comando não declara.
function formatCooldown(seconds, t) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return null;
  if (s >= 3600 && s % 3600 === 0) return t('cmdModal.cooldownHours', { n: s / 3600 });
  if (s >= 60 && s % 60 === 0) return t('cmdModal.cooldownMinutes', { n: s / 60 });
  return t('cmdModal.cooldownSecondsN', { n: s });
}

export default function CommandDetailModal({ command, onClose, lang = 'pt', t }) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const closeRef = useRef(null);

  // Fecha com ESC e devolve o foco ao botão de fechar ao abrir (janela de verdade).
  useEffect(() => {
    if (!command) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const timer = setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, [command, onClose]);

  if (!command) return null;

  const bare = cleanName(command);
  const displayName = `/${bare}`;
  const aliases = cleanAliases(command);
  const cooldownText = formatCooldown(command.cooldownSeconds, t);
  const permissionText =
    command.permission === 'staff' ? t('cmdModal.permStaff') : command.permission === 'everyone' ? t('cmdModal.permEveryone') : null;
  const titleId = `cmd-modal-title-${bare}`;

  const handleCopyCmd = () => {
    try {
      navigator.clipboard.writeText(displayName);
    } catch (_) {}
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${localeHref('/wiki', lang)}#${bare}`;
    try {
      navigator.clipboard.writeText(url);
    } catch (_) {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar fixo no topo enquanto o conteúdo rola */}
        <div className="sticky top-0 z-10 flex justify-end p-3 pb-0 bg-gradient-to-b from-[#0e071a] via-[#0e071a]/90 to-transparent">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={t('cmdModal.close')}
            aria-label={t('cmdModal.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs">
              <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{displayName}</span>
            </div>
            <h3 id={titleId} className="font-title font-extrabold text-2xl text-white tracking-tight">
              {displayName}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{command.desc}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopyCmd}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                copiedCmd
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink'
              }`}
            >
              {copiedCmd ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCmd ? t('cmdModal.copiedCmd') : t('cmdModal.copyCmd')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                copiedLink
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? t('cmdModal.copiedLink') : t('cmdModal.copyLink')}</span>
            </button>
          </div>

          {/* Metadados: só o que o código do comando declara (nada inventado) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs">
            {cooldownText && (
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{t('cmdModal.cooldown')}</span>
                  <span className="font-semibold text-slate-200">{cooldownText}</span>
                </div>
              </div>
            )}

            {permissionText && (
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{t('cmdModal.permissions')}</span>
                  <span className="font-semibold text-slate-200">{permissionText}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">{t('cmdModal.platform')}</span>
                <span className="font-semibold text-slate-200">
                  {aliases.length > 0 ? t('cmdModal.platformVal') : t('cmdModal.platformSlash')}
                </span>
              </div>
            </div>
          </div>

          {/* Aliases */}
          {aliases.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('cmdModal.aliasesTitle')}</span>
              <div className="flex flex-wrap gap-2">
                {aliases.map((alias) => (
                  <span
                    key={alias}
                    className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    py!{alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exemplo ilustrativo do formato da resposta */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('cmdModal.liveSimulation')}</span>
            <DiscordEmbedPreview command={command} lang={lang} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

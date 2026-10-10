import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Clock, ShieldCheck, Share2, ExternalLink } from 'lucide-react';
import DiscordEmbedPreview from './DiscordEmbedPreview';

export default function CommandDetailModal({ command, onClose, lang = 'pt', t }) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!command) return null;

  const rawName = command.name || '';
  const displayName = rawName.startsWith('/') ? rawName : `/${rawName}`;
  const cleanName = rawName.replace(/^\/+/, '');

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(displayName);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/wiki#${cleanName}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0e071a] border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Fechar (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono font-bold text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>{displayName}</span>
          </div>
          <h3 className="font-title font-extrabold text-2xl text-white tracking-tight">
            {displayName}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {command.description}
          </p>
        </div>

        {/* Action Buttons: Copy Command & Share Deep-link */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleCopyCmd}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              copiedCmd
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-neon-pink'
            }`}
          >
            {copiedCmd ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCmd ? 'Comando Copiado! ✨' : 'Copiar Sintaxe'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-purple-500/25 text-purple-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copiado! 🔗' : 'Copiar Deep Link'}</span>
          </button>
        </div>

        {/* Metadata badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-purple-500/15 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Cooldown</span>
              <span className="font-semibold text-slate-200">{command.cooldown ? `${command.cooldown}s` : '3 segundos'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Permissões</span>
              <span className="font-semibold text-slate-200">@everyone</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Plataforma</span>
              <span className="font-semibold text-slate-200">Slash & Prefixo</span>
            </div>
          </div>
        </div>

        {/* Aliases */}
        {command.aliases && command.aliases.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Prefixos Alternativos (py!)
            </span>
            <div className="flex flex-wrap gap-2">
              {command.aliases.map((alias, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-cyan-300 font-mono text-xs font-medium tracking-wider"
                  style={{ letterSpacing: '0.05em' }}
                >
                  py!{alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Realistic Discord Embed Preview */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resposta Real no Discord
            </span>
            <span className="text-[11px] text-purple-400 font-mono">Live Simulation</span>
          </div>
          <DiscordEmbedPreview command={command} lang={lang} />
        </div>
      </div>
    </div>
  );
}


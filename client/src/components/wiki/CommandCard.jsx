import React, { useState } from 'react';
import { Copy, Check, Terminal, ChevronRight } from 'lucide-react';
import { cleanAliases, cleanName } from '../../utils/commands';

export default function CommandCard({ command, onSelect, t }) {
  const [copied, setCopied] = useState(false);

  const bare = cleanName(command);
  const displayName = `/${bare}`;
  const aliases = cleanAliases(command);

  const handleCopy = (e) => {
    e.stopPropagation();
    const cmdText = bare ? displayName : `py!${aliases[0] || ''}`;
    try {
      navigator.clipboard.writeText(cmdText);
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`cmd-${bare}`}
      className="group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 focus-within:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink flex flex-col justify-between relative overflow-hidden"
    >
      {/* Accent corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all pointer-events-none" />

      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span>{displayName}</span>
          </h3>

          <button
            type="button"
            onClick={handleCopy}
            className={`relative z-20 p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30'
            }`}
            title={t('wiki.copyBtn')}
            aria-label={`${t('wiki.copyBtn')} ${displayName}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">{command.desc}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between gap-2">
        {aliases.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {aliases.slice(0, 2).map((alias) => (
              <span
                key={alias}
                className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider"
                style={{ letterSpacing: '0.05em' }}
              >
                py!{alias}
              </span>
            ))}
            {aliases.length > 2 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400">+{aliases.length - 2}</span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">{t('catalog.slashOnly')}</span>
        )}

        {/* Botão de verdade (teclado e leitor de tela); o ::after estende o clique ao card todo */}
        <button
          type="button"
          onClick={() => onSelect && onSelect(command)}
          className="text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-pink-400 after:absolute after:inset-0 after:content-['']"
          aria-label={`${t('catalog.details')}: ${displayName}`}
        >
          <span>{t('catalog.details')}</span>
          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Copy, Check, Terminal, ChevronRight, Sparkles } from 'lucide-react';

export default function CommandCard({ command, onSelect, t }) {
  const [copied, setCopied] = useState(false);

  const rawName = command.name || '';
  const cleanName = rawName.replace(/^\/+/, '');
  const displayName = `/${cleanName}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    const cmdText = rawName ? displayName : `py!${command.aliases?.[0] || ''}`;
    navigator.clipboard.writeText(cmdText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const anchorId = `cmd-${cleanName}`;

  return (
    <div
      id={anchorId}
      onClick={() => onSelect && onSelect(command)}
      className="group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Accent corner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/15 transition-all" />

      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>{displayName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-purple-500/20 text-slate-400 group-hover:text-white group-hover:border-pink-500/30'
              }`}
              title="Copiar comando"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
          {command.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between relative z-10">
        {command.aliases && command.aliases.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {command.aliases.slice(0, 2).map((alias, i) => (
              <span
                key={i}
                className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider"
                style={{ letterSpacing: '0.05em' }}
              >
                py!{alias}
              </span>
            ))}
            {command.aliases.length > 2 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                +{command.aliases.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">Slash Oficial</span>
        )}

        <span className="text-[11px] font-bold text-purple-300 group-hover:text-pink-300 transition-colors flex items-center gap-0.5">
          <span>Detalhes</span>
          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}

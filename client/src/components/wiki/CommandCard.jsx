import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CommandCard({ command, t }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    const cmdText = command.name ? `/${command.name}` : `py!${command.alias || ''}`;
    navigator.clipboard.writeText(cmdText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="group rounded-2xl glass-panel border border-purple-500/20 hover:border-pink-500/40 p-5 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-neon-pink cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-mono font-bold text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>/{command.name}</span>
          </div>
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

        <p className="text-slate-300 text-xs leading-relaxed">
          {command.description}
        </p>
      </div>

      {command.aliases && command.aliases.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-500/15 flex flex-wrap gap-1.5">
          {command.aliases.map((alias, i) => (
            <span
              key={i}
              className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-purple-500/20 text-cyan-300 tracking-wider"
              style={{ letterSpacing: '0.05em' }}
            >
              py!{alias}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

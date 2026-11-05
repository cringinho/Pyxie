import React from 'react';
import { cleanName } from '../../utils/commands';

// Exemplo ilustrativo do formato da resposta no Discord. Só usa dados reais do catálogo
// (/api/commands): nome, emoji e descrição. Nada de valores de recompensa, recarga ou
// horários inventados (AGENTS.md §12, zero mock).
export default function DiscordEmbedPreview({ command, t }) {
  const bare = cleanName(command);
  const title = `${command.emoji ? `${command.emoji} ` : ''}/${bare}`;

  return (
    <div className="rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none">
      {/* Bot Header in Discord Style */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0">
          <img src="/assets/pyxie/pyxie_pixelart_face.png" alt={t('preview.avatarAlt')} className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-white text-sm">Pyxie</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase">
            {t('preview.botTag')}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5" style={{ borderLeftColor: '#E60067' }}>
        <h4 className="font-bold text-white text-sm tracking-tight">{title}</h4>
        <p className="text-xs text-[#dbdee1] leading-relaxed">{command.desc}</p>
        <div className="pt-2 border-t border-white/5 text-[10px] text-[#949ba4]">{t('preview.note')}</div>
      </div>
    </div>
  );
}

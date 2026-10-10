import React from 'react';

export default function DiscordEmbedPreview({ command, lang = 'pt' }) {
  const isEn = lang === 'en';

  // Customize preview content based on command
  const getPreviewData = (cmd) => {
    const name = cmd.name || '';
    if (name.includes('daily')) {
      return {
        color: '#E60067',
        title: isEn ? '✨ Cosmic Daily Reward' : '✨ Recompensa Diária Cósmica',
        desc: isEn 
          ? 'You channeled the astral energy and claimed your daily coins!' 
          : 'Você canalizou a energia astral e resgatou suas moedas diárias!',
        fields: [
          { name: isEn ? '🪙 Coins' : '🪙 Recompensa', value: '+100 moedas', inline: true },
          { name: isEn ? '🔥 Daily Streak' : '🔥 Sequência', value: '7 dias (+25 bônus)', inline: true },
        ],
        footer: 'Pyxie Bot • Discord.js v14',
      };
    }
    if (name.includes('work') || name.includes('trabalho')) {
      return {
        color: '#8B5CF6',
        title: isEn ? '💼 Professional Shift: Alchemist' : '💼 Expediente: Alquimista Místico',
        desc: isEn
          ? 'You combined the essence of the Arcane Rose with stardust. Perfect synthesis!'
          : 'Você combinou a essência da Rosa Arcana com pó estelar. Síntese perfeita!',
        fields: [
          { name: isEn ? '💰 Earnings' : '💰 Rendimento', value: '+95 moedas', inline: true },
          { name: isEn ? '⭐ Experience' : '⭐ Experiência', value: '+15 XP Alquimia', inline: true },
        ],
        footer: 'Pyxie Carreiras • Cooldown: 3h',
      };
    }
    if (name.includes('tarot')) {
      return {
        color: '#A855F7',
        title: isEn ? '🔮 Daily Arcana: The Magician' : '🔮 Arcano do Dia: O Mago (I)',
        desc: isEn
          ? '"The power of creation and transmutation is alive in your hands today."'
          : '"O poder da criação e transmutação está vivo em suas mãos hoje. Molde seu destino."',
        fields: [
          { name: isEn ? '🧭 Orientation' : '🧭 Orientação', value: isEn ? 'Upright (Direct)' : 'Em Pé (Direta)', inline: true },
          { name: isEn ? '⭐ Arcana Type' : '⭐ Tipo de Arcano', value: isEn ? 'Major Arcana (01/22)' : 'Arcano Maior (01/22)', inline: true },
        ],
        footer: 'Pyxie Tarot • 78 Arcanos em Canvas HD',
      };
    }
    if (name.includes('casamento') || name.includes('marry')) {
      return {
        color: '#EC4899',
        title: isEn ? '💍 Matrimonial Bond: Pyxie & Astaroth' : '💍 Laço Matrimonial: Pyxie & Astaroth',
        desc: isEn
          ? 'Eternal union blessed by the cosmic fairies under the Tree of Life.'
          : 'União eterna abençoada pelas fadas cósmicas sob a Árvore da Vida.',
        fields: [
          { name: isEn ? '💖 Love Bar' : '💖 Barra do Amor', value: '100% [██████████]', inline: true },
          { name: isEn ? '🌳 Tree Level' : '🌳 Nível da Árvore', value: 'Nível 3 (+30% Amor)', inline: true },
        ],
        footer: 'Pyxie Matrimônio & Família',
      };
    }

    // Generic fallback preview
    return {
      color: '#3B82F6',
      title: `✨ /${cmd.name}`,
      desc: cmd.description || (isEn ? 'Command executed successfully.' : 'Comando executado com sucesso.'),
      fields: [
        { name: isEn ? 'Status' : 'Status', value: '✅ Operacional', inline: true },
        { name: isEn ? 'Cooldown' : 'Recarga', value: cmd.cooldown ? `${cmd.cooldown}s` : '3s', inline: true },
      ],
      footer: 'Pyxie Discord Bot • 2026',
    };
  };

  const preview = getPreviewData(command);

  return (
    <div className="rounded-xl bg-[#2b2d31] border border-[#1e1f22] p-4 text-[#dbdee1] font-sans text-sm shadow-xl select-none">
      {/* Bot Header in Discord Style */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900 border border-purple-500/30 flex-shrink-0">
          <img
            src="/assets/pyxie/pyxie_pixelart_face.png"
            alt="Pyxie Avatar"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-white text-sm">Pyxie</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865F2] text-white tracking-wide uppercase">
            BOT
          </span>
          <span className="text-[11px] text-[#949ba4] ml-1">hoje às 14:32</span>
        </div>
      </div>

      {/* Embed Container with left colored stripe */}
      <div
        className="rounded-lg bg-[#232428] p-3.5 pl-4 border-l-4 space-y-2.5 transition-all"
        style={{ borderLeftColor: preview.color }}
      >
        <h4 className="font-bold text-white text-sm tracking-tight">{preview.title}</h4>
        <p className="text-xs text-[#dbdee1] leading-relaxed">{preview.desc}</p>

        {preview.fields && preview.fields.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {preview.fields.map((f, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[11px] font-bold text-[#b5bac1] block">{f.name}</span>
                <span className="text-xs text-white font-medium block">{f.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#949ba4]">
          <span>{preview.footer}</span>
          <span className="font-mono text-[9px] opacity-70">Embed v2</span>
        </div>
      </div>
    </div>
  );
}


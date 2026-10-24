/**
 * Títulos de conquista: não estão à venda e só aparecem para quem desbloqueou.
 * style define o alfabeto/moldura no Discord (src/utils/fancyText.js) e o selo no cartão de perfil.
 * Nomes neutros em gênero de propósito: a Pyxie é para todo mundo.
 */
const ACHIEVEMENT_TITLES = {
  // Série "streak" (bônus diário seguido): 7 → 30 → 100 → 365 dias
  constancia: {
    id: 'constancia',
    series: 'streak',
    tier: 1,
    style: 'spark',
    emoji: '🕯️',
    name: { pt: 'Constância', en: 'Steadfast' },
    desc: { pt: 'Resgatou o bônus diário 7 dias seguidos.', en: 'Claimed the daily bonus 7 days in a row.' },
  },
  rotina_de_fada: {
    id: 'rotina_de_fada',
    series: 'streak',
    tier: 2,
    style: 'arcane',
    emoji: '🧚',
    name: { pt: 'Rotina de Fada', en: 'Fairy Routine' },
    desc: { pt: 'Resgatou o bônus diário 30 dias seguidos.', en: 'Claimed the daily bonus 30 days in a row.' },
  },
  chama_eterna: {
    id: 'chama_eterna',
    series: 'streak',
    tier: 4,
    style: 'celestial',
    emoji: '🔥',
    name: { pt: 'Chama Eterna', en: 'Eternal Flame' },
    desc: { pt: 'Um ano inteiro de bônus diário sem falhar um dia.', en: 'A whole year of daily bonus without missing a day.' },
  },
  // Série "likes" (curtidas na casinha): 10 → 50 → 200 → 500
  visita_querida: {
    id: 'visita_querida',
    series: 'likes',
    tier: 1,
    style: 'spark',
    emoji: '🌷',
    name: { pt: 'Visita Querida', en: 'Beloved Host' },
    desc: { pt: 'A casinha recebeu 10 curtidas.', en: 'Their room received 10 likes.' },
  },
  xodo_da_rua: {
    id: 'xodo_da_rua',
    series: 'likes',
    tier: 2,
    style: 'arcane',
    emoji: '💐',
    name: { pt: 'Xodó da Rua', en: 'Street Darling' },
    desc: { pt: 'A casinha recebeu 50 curtidas.', en: 'Their room received 50 likes.' },
  },
  brilho_do_bairro: {
    id: 'brilho_do_bairro',
    series: 'likes',
    tier: 3,
    style: 'eclipse',
    emoji: '🏮',
    name: { pt: 'Brilho do Bairro', en: 'Neighborhood Glow' },
    desc: { pt: 'A casinha recebeu 200 curtidas.', en: 'Their room received 200 likes.' },
  },
  // Série "nyx" (vitórias sobre a Nyx): 1 → 10 → 50 → 100
  pesadelo_nyx: {
    id: 'pesadelo_nyx',
    series: 'nyx',
    tier: 3,
    style: 'eclipse',
    emoji: '🦋',
    name: { pt: 'Pesadelo da Nyx', en: "Nyx's Nightmare" },
    desc: { pt: 'Venceu a Nyx 50 vezes. Ela já reconhece seus passos.', en: 'Beat Nyx 50 times. She already knows your footsteps.' },
  },
  fim_da_noite: {
    id: 'fim_da_noite',
    series: 'nyx',
    tier: 4,
    style: 'celestial',
    emoji: '🌅',
    name: { pt: 'Fim da Noite', en: 'End of Night' },
    desc: { pt: 'Venceu a Nyx 100 vezes. As catacumbas amanhecem quando você chega.', en: 'Beat Nyx 100 times. The catacombs see dawn when you arrive.' },
  },
  eclipse_nyx: {
    id: 'eclipse_nyx',
    series: 'nyx',
    tier: 1,
    style: 'spark',
    emoji: '🌑',
    name: { pt: 'Eclipse da Nyx', en: "Nyx's Eclipse" },
    desc: { pt: 'Derrotou a Mariposa Devora-Luz no fundo das Catacumbas.', en: 'Defeated the Light-Eating Moth at the bottom of the Catacombs.' },
  },
  lenda_catacumbas: {
    id: 'lenda_catacumbas',
    series: 'nyx',
    tier: 2,
    style: 'arcane',
    emoji: '🕯️',
    name: { pt: 'Lenda das Catacumbas', en: 'Legend of the Catacombs' },
    desc: { pt: 'Venceu a Nyx dez vezes. As velas acendem sozinhas quando passa.', en: 'Beat Nyx ten times. Candles light up on their own as they pass.' },
  },
  oraculo_completo: {
    id: 'oraculo_completo',
    style: 'arcane',
    emoji: '🔮',
    name: { pt: 'Oráculo Completo', en: 'Complete Oracle' },
    desc: { pt: 'Reuniu as 78 cartas do Tarot no álbum.', en: 'Collected all 78 Tarot cards in the album.' },
  },
  lar_dos_sonhos: {
    id: 'lar_dos_sonhos',
    style: 'aurora',
    emoji: '🏡',
    name: { pt: 'Lar dos Sonhos', en: 'Dream Home' },
    desc: { pt: 'Chegou a 800 de Charme na casinha.', en: 'Reached 800 Charm in their room.' },
  },
  coroa_oficios: {
    id: 'coroa_oficios',
    style: 'royal',
    emoji: '👑',
    name: { pt: 'Coroa dos Ofícios', en: 'Crown of Crafts' },
    desc: { pt: 'Concluiu 500 turnos de trabalho.', en: 'Completed 500 work shifts.' },
  },
  inabalavel: {
    id: 'inabalavel',
    series: 'streak',
    tier: 3,
    style: 'eclipse',
    emoji: '🔥',
    name: { pt: 'Inabalável', en: 'Unshakable' },
    desc: { pt: 'Manteve 100 dias seguidos de bônus diário.', en: 'Kept a 100-day daily bonus streak.' },
  },
  tesouro_vivo: {
    id: 'tesouro_vivo',
    style: 'prism',
    emoji: '💎',
    name: { pt: 'Tesouro Vivo', en: 'Living Treasure' },
    desc: { pt: 'Possui 3 itens míticos diferentes.', en: 'Owns 3 different mythic items.' },
  },
  estrela_pyxie: {
    id: 'estrela_pyxie',
    style: 'stardust',
    emoji: '⭐',
    name: { pt: 'Estrela da Pyxie', en: "Pyxie's Star" },
    desc: { pt: 'Votou na Pyxie 100 vezes no Top.gg.', en: 'Voted for Pyxie 100 times on Top.gg.' },
  },
  coracao_vizinhanca: {
    id: 'coracao_vizinhanca',
    series: 'likes',
    tier: 4,
    style: 'celestial',
    emoji: '💗',
    name: { pt: 'Coração da Vizinhança', en: 'Heart of the Neighborhood' },
    desc: { pt: 'A casinha recebeu 500 curtidas.', en: 'Their room received 500 likes.' },
  },
};

/** Títulos de uma série em ordem de meta (para trocar o equipado pelo próximo degrau). */
function seriesTitles(series) {
  return Object.values(ACHIEVEMENT_TITLES).filter((title) => title.series === series).sort((a, b) => a.tier - b.tier);
}

module.exports = { ACHIEVEMENT_TITLES, seriesTitles };

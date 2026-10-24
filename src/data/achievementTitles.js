/**
 * Títulos de conquista: não estão à venda e só aparecem para quem desbloqueou.
 * style define o alfabeto/moldura no Discord (src/utils/fancyText.js) e o selo no cartão de perfil.
 * Nomes neutros em gênero de propósito: a Pyxie é para todo mundo.
 */
const ACHIEVEMENT_TITLES = {
  eclipse_nyx: {
    id: 'eclipse_nyx',
    style: 'eclipse',
    emoji: '🌑',
    name: { pt: 'Eclipse da Nyx', en: "Nyx's Eclipse" },
    desc: { pt: 'Derrotou a Mariposa Devora-Luz no fundo das Catacumbas.', en: 'Defeated the Light-Eating Moth at the bottom of the Catacombs.' },
  },
  lenda_catacumbas: {
    id: 'lenda_catacumbas',
    style: 'void',
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
    style: 'ember',
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
    style: 'bloom',
    emoji: '💗',
    name: { pt: 'Coração da Vizinhança', en: 'Heart of the Neighborhood' },
    desc: { pt: 'A casinha recebeu 500 curtidas.', en: 'Their room received 500 likes.' },
  },
};

module.exports = { ACHIEVEMENT_TITLES };

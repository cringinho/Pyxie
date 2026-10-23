/**
 * Conteúdo das Catacumbas de Veludo: andares, inimigos, amuletos, talentos e eventos.
 * Todo texto de jogo vem em pares { pt, en } (AGENTS.md §1.6). Textos de interface ficam
 * em src/utils/i18n.js, no namespace "dungeon".
 *
 * `glyph` é o emoji Unicode usado pelo renderizador (pixelado no canvas);
 * `emoji` é a chave canônica de src/utils/appEmojis.js usada nos embeds.
 */

const FLOORS = [
  {
    id: 1,
    rooms: 7,
    name: { pt: 'Porão das Velas Tortas', en: 'Crooked Candle Cellar' },
    flavor: {
      pt: 'Velas derretidas pingam cera roxa no chão. Algo pequeno arranha as paredes.',
      en: 'Melted candles drip purple wax on the floor. Something small scratches the walls.',
    },
    palette: { floor: '#2a1838', wall: '#160c20', accent: '#f5a742', glow: '#ffb35c' },
    enemies: ['rat', 'bat', 'candle', 'spider'],
    guardian: 'granny_spider',
  },
  {
    id: 2,
    rooms: 8,
    name: { pt: 'Biblioteca Sussurrante', en: 'Whispering Library' },
    flavor: {
      pt: 'Prateleiras infinitas cochicham segredos. Os livros daqui mordem.',
      en: 'Endless shelves whisper secrets. The books down here bite.',
    },
    palette: { floor: '#1c2140', wall: '#0d1026', accent: '#7aa2ff', glow: '#9ec1ff' },
    enemies: ['grimoire', 'ghost', 'crow'],
    guardian: 'librarian',
  },
  {
    id: 3,
    rooms: 9,
    name: { pt: 'Jardim de Ossos', en: 'Bone Garden' },
    flavor: {
      pt: 'Flores pálidas brotam de costelas antigas. O ar cheira a terra molhada e chá velho.',
      en: 'Pale flowers sprout from ancient ribs. The air smells of wet soil and old tea.',
    },
    palette: { floor: '#17261c', wall: '#0a140d', accent: '#8be28b', glow: '#b6ff9e' },
    enemies: ['skeleton', 'shroom', 'pumpkin'],
    guardian: 'gardener',
  },
  {
    id: 4,
    rooms: 10,
    name: { pt: 'Salão dos Espelhos Rachados', en: 'Hall of Cracked Mirrors' },
    flavor: {
      pt: 'Seu reflexo sorri um segundo atrasado. Bonecas observam de cima dos lustres.',
      en: 'Your reflection smiles one second too late. Dolls watch from the chandeliers.',
    },
    palette: { floor: '#2b1630', wall: '#14081a', accent: '#ff8fd6', glow: '#ffc2ec' },
    enemies: ['doll', 'gargoyle', 'shade'],
    guardian: 'porcelain_queen',
  },
  {
    id: 5,
    rooms: 6,
    name: { pt: 'Coração da Cripta', en: 'Heart of the Crypt' },
    flavor: {
      pt: 'Não há mais velas. Só o bater de asas enormes no escuro… e um brilho dourado lá no fundo.',
      en: 'No more candles. Only the beating of huge wings in the dark… and a golden glow far below.',
    },
    palette: { floor: '#24090f', wall: '#0c0306', accent: '#ff5c7a', glow: '#ffd36b' },
    enemies: ['doll', 'shade', 'gargoyle'],
    guardian: 'nyx',
  },
];

/**
 * Movimentos dos inimigos (intenções telegrafadas, estilo Slay the Spire):
 * attack (mult), multi (hits x mult), charge (prepara heavy), heavy (mult), defend (value),
 * heal (value), drain (mult + light), poison (mult + poison/turns), steal (mult + gold), web (mult).
 */
const ENEMIES = {
  // Andar 1
  rat: {
    glyph: '🐀',
    emoji: 'DUNGEON_SKULL',
    name: { pt: 'Ratinho Sonâmbulo', en: 'Sleepwalking Rat' },
    hp: 9,
    atk: 3,
    gold: [3, 6],
    moves: [
      { type: 'attack', mult: 1, w: 3 },
      { type: 'multi', hits: 2, mult: 0.6, w: 1 },
    ],
  },
  bat: {
    glyph: '🦇',
    emoji: 'BAT',
    name: { pt: 'Morceguinho Faminto', en: 'Hungry Little Bat' },
    hp: 7,
    atk: 2,
    dodge: 0.15,
    gold: [3, 6],
    moves: [
      { type: 'multi', hits: 2, mult: 1, w: 2 },
      { type: 'attack', mult: 1.3, w: 1 },
    ],
  },
  candle: {
    glyph: '🕯️',
    emoji: 'DUNGEON_CANDLE',
    name: { pt: 'Vela Rabugenta', en: 'Grumpy Candle' },
    hp: 11,
    atk: 3,
    gold: [4, 7],
    moves: [
      { type: 'attack', mult: 1, w: 2 },
      { type: 'drain', mult: 0.6, light: 12, w: 2 },
    ],
  },
  spider: {
    glyph: '🕷️',
    emoji: 'DUNGEON_SPIDER',
    name: { pt: 'Aranha Costureira', en: 'Seamstress Spider' },
    hp: 10,
    atk: 3,
    gold: [4, 7],
    moves: [
      { type: 'attack', mult: 1, w: 2 },
      { type: 'poison', mult: 0.5, poison: 2, turns: 3, w: 1 },
      { type: 'web', mult: 0.6, w: 1 },
    ],
  },

  // Andar 2
  grimoire: {
    glyph: '📖',
    emoji: 'SPELLBOOK',
    name: { pt: 'Grimório Mordedor', en: 'Biting Grimoire' },
    hp: 15,
    atk: 5,
    gold: [7, 11],
    moves: [
      { type: 'attack', mult: 1, w: 3 },
      { type: 'charge', w: 1 },
    ],
  },
  ghost: {
    glyph: '👻',
    emoji: 'DUNGEON_GHOST',
    name: { pt: 'Fantasminha Tímido', en: 'Shy Little Ghost' },
    hp: 13,
    atk: 4,
    dodge: 0.3,
    gold: [7, 11],
    moves: [
      { type: 'attack', mult: 1, w: 2 },
      { type: 'defend', value: 6, w: 1 },
      { type: 'drain', mult: 0.5, light: 15, w: 1 },
    ],
  },
  crow: {
    glyph: '🐦',
    emoji: 'DUNGEON_CROW',
    name: { pt: 'Corvo Fofoqueiro', en: 'Gossiping Crow' },
    hp: 12,
    atk: 4,
    gold: [8, 12],
    moves: [
      { type: 'steal', mult: 0.6, gold: 8, w: 2 },
      { type: 'attack', mult: 1, w: 2 },
      { type: 'multi', hits: 2, mult: 0.7, w: 1 },
    ],
  },

  // Andar 3
  skeleton: {
    glyph: '💀',
    emoji: 'DUNGEON_SKULL',
    name: { pt: 'Esqueleto Dançarino', en: 'Dancing Skeleton' },
    hp: 19,
    atk: 6,
    gold: [9, 13],
    moves: [
      { type: 'multi', hits: 2, mult: 0.7, w: 2 },
      { type: 'attack', mult: 1, w: 2 },
      { type: 'defend', value: 6, w: 1 },
    ],
  },
  shroom: {
    glyph: '🍄',
    emoji: 'DUNGEON_MUSHROOM',
    name: { pt: 'Cogumelo Sonolento', en: 'Sleepy Shroom' },
    hp: 17,
    atk: 5,
    gold: [9, 13],
    moves: [
      { type: 'poison', mult: 0.5, poison: 3, turns: 3, w: 2 },
      { type: 'attack', mult: 1, w: 2 },
      { type: 'heal', value: 6, w: 1 },
    ],
  },
  pumpkin: {
    glyph: '🎃',
    emoji: 'DUNGEON_PUMPKIN',
    name: { pt: 'Abóbora Risonha', en: 'Giggling Pumpkin' },
    hp: 22,
    atk: 6,
    gold: [10, 14],
    moves: [
      { type: 'attack', mult: 1, w: 3 },
      { type: 'charge', w: 2 },
    ],
  },

  // Andar 4
  doll: {
    glyph: '🪆',
    emoji: 'DUNGEON_BOW',
    name: { pt: 'Boneca de Porcelana', en: 'Porcelain Doll' },
    hp: 24,
    atk: 7,
    gold: [12, 17],
    moves: [
      { type: 'attack', mult: 1, w: 2 },
      { type: 'multi', hits: 3, mult: 0.5, w: 2 },
      { type: 'web', mult: 0.6, w: 1 },
    ],
  },
  gargoyle: {
    glyph: '🗿',
    emoji: 'DUNGEON_HEADSTONE',
    name: { pt: 'Gárgula Preguiçosa', en: 'Lazy Gargoyle' },
    hp: 32,
    atk: 6,
    gold: [12, 18],
    moves: [
      { type: 'defend', value: 10, w: 2 },
      { type: 'attack', mult: 1.2, w: 2 },
      { type: 'charge', w: 1 },
    ],
  },
  shade: {
    glyph: '👁️',
    emoji: 'DUNGEON_EYE',
    name: { pt: 'Sombra do Espelho', en: 'Mirror Shade' },
    hp: 22,
    atk: 8,
    gold: [12, 18],
    moves: [
      { type: 'attack', mult: 1, w: 2 },
      { type: 'drain', mult: 0.6, light: 18, w: 1 },
      { type: 'steal', mult: 0.6, gold: 15, w: 1 },
    ],
  },

  // Mímico (aparece em baús)
  mimic: {
    glyph: '🧰',
    emoji: 'DUNGEON_CHEST',
    name: { pt: 'Baú Mímico', en: 'Mimic Chest' },
    hp: 14,
    atk: 3,
    gold: [10, 14],
    scalesWithFloor: true,
    moves: [
      { type: 'multi', hits: 2, mult: 0.8, w: 2 },
      { type: 'attack', mult: 1.2, w: 2 },
      { type: 'charge', w: 1 },
    ],
  },

  // Guardiões (ciclo fixo de intenções)
  granny_spider: {
    glyph: '🕷️',
    emoji: 'DUNGEON_SPIDER',
    guardian: true,
    name: { pt: 'Vovó Aranha', en: 'Granny Spider' },
    hp: 30,
    atk: 4,
    gold: [18, 24],
    cycle: [
      { type: 'attack', mult: 1 },
      { type: 'poison', mult: 0.6, poison: 2, turns: 3 },
      { type: 'charge' },
      { type: 'defend', value: 6 },
      { type: 'multi', hits: 2, mult: 0.8 },
    ],
  },
  librarian: {
    glyph: '📚',
    emoji: 'SPELLBOOK',
    guardian: true,
    name: { pt: 'Bibliotecário Sem Cabeça', en: 'Headless Librarian' },
    hp: 44,
    atk: 6,
    gold: [28, 36],
    cycle: [
      { type: 'attack', mult: 1 },
      { type: 'web', mult: 0.7 },
      { type: 'charge' },
      { type: 'defend', value: 8 },
      { type: 'multi', hits: 3, mult: 0.6 },
    ],
  },
  gardener: {
    glyph: '🌹',
    emoji: 'DUNGEON_ROSE',
    guardian: true,
    name: { pt: 'Jardineiro de Ossos', en: 'Bone Gardener' },
    hp: 58,
    atk: 7,
    gold: [34, 42],
    cycle: [
      { type: 'poison', mult: 0.5, poison: 3, turns: 3 },
      { type: 'attack', mult: 1 },
      { type: 'defend', value: 10 },
      { type: 'charge' },
      { type: 'heal', value: 8 },
      { type: 'multi', hits: 2, mult: 0.8 },
    ],
  },
  porcelain_queen: {
    glyph: '👑',
    emoji: 'CROWN',
    guardian: true,
    name: { pt: 'Rainha de Porcelana', en: 'Porcelain Queen' },
    hp: 80,
    atk: 8,
    gold: [45, 56],
    cycle: [
      { type: 'multi', hits: 3, mult: 0.6 },
      { type: 'defend', value: 12 },
      { type: 'charge' },
      { type: 'web', mult: 0.7 },
      { type: 'attack', mult: 1.2 },
    ],
  },
  nyx: {
    glyph: '🦋',
    emoji: 'BUTTERFLY',
    guardian: true,
    boss: true,
    name: { pt: 'Nyx, a Mariposa Devora-Luz', en: 'Nyx, the Light-Eating Moth' },
    hp: 130,
    atk: 10,
    gold: [120, 150],
    cycle: [
      { type: 'drain', mult: 0.7, light: 15 },
      { type: 'attack', mult: 1 },
      { type: 'charge' },
      { type: 'multi', hits: 4, mult: 0.5 },
      { type: 'heal', value: 10 },
      { type: 'attack', mult: 1.2 },
    ],
  },
};

/** Amuletos (bênçãos do run): escolhidos após cada guardião e achados em tesouros e altares. */
const CHARMS = {
  velvet_ribbon: {
    glyph: '🎀',
    emoji: 'DUNGEON_BOW',
    name: { pt: 'Laço de Veludo', en: 'Velvet Ribbon' },
    desc: { pt: '+6 de vida máxima e cura 6 agora.', en: '+6 max HP and heals 6 now.' },
  },
  moon_wand: {
    glyph: '🪄',
    emoji: 'DUNGEON_WAND',
    name: { pt: 'Varinha Lunar Afiada', en: 'Sharpened Moon Wand' },
    desc: { pt: '+2 de ataque.', en: '+2 attack.' },
  },
  armored_wings: {
    glyph: '🪽',
    emoji: 'WINGS_PURPLE',
    name: { pt: 'Asas Blindadas', en: 'Armored Wings' },
    desc: { pt: '+1 de defesa contra todo golpe.', en: '+1 defense against every hit.' },
  },
  astaroth_bell: {
    glyph: '🔔',
    emoji: 'ASTAROTH_HAPPY',
    name: { pt: 'Sininho do Astaroth', en: "Astaroth's Little Bell" },
    desc: {
      pt: 'A Patada do Astaroth causa +3 de dano e a primeira de cada luta é grátis.',
      en: "Astaroth's Swipe deals +3 damage and the first one each fight is free.",
    },
  },
  eternal_candle: {
    glyph: '🕯️',
    emoji: 'DUNGEON_CANDLE',
    name: { pt: 'Vela Eterna', en: 'Eternal Candle' },
    desc: { pt: 'A luz se gasta pela metade ao andar.', en: 'Light drains at half speed while walking.' },
  },
  amethyst_heart: {
    glyph: '💜',
    emoji: 'DUNGEON_HEART',
    name: { pt: 'Coração de Ametista', en: 'Amethyst Heart' },
    desc: { pt: 'Cura 4 de vida após cada vitória.', en: 'Heals 4 HP after every victory.' },
  },
  cursed_coin: {
    glyph: '🪙',
    emoji: 'DUNGEON_MOON_COIN',
    name: { pt: 'Moeda Amaldiçoada', en: 'Cursed Coin' },
    desc: { pt: '+35% de ouro de todas as fontes, mas -4 de vida máxima.', en: '+35% gold from every source, but -4 max HP.' },
  },
  cat_eye: {
    glyph: '👁️',
    emoji: 'DUNGEON_EYE',
    name: { pt: 'Olho de Gato', en: "Cat's Eye" },
    desc: { pt: '+12% de chance de crítico e críticos causam 2,5x.', en: '+12% crit chance and crits deal 2.5x.' },
  },
  pocket_grimoire: {
    glyph: '📕',
    emoji: 'SPELLBOOK',
    name: { pt: 'Grimório de Bolso', en: 'Pocket Grimoire' },
    desc: { pt: 'O Raio Lunar custa só 1 de brilho.', en: 'Moon Bolt costs only 1 spark.' },
  },
  bottomless_flask: {
    glyph: '🧪',
    emoji: 'POTION',
    name: { pt: 'Frasco Sem Fundo', en: 'Bottomless Flask' },
    desc: { pt: '+1 poção agora e poções curam 50% a mais.', en: '+1 potion now and potions heal 50% more.' },
  },
  rose_thorns: {
    glyph: '🥀',
    emoji: 'DUNGEON_ROSE',
    name: { pt: 'Espinhos de Rosa Negra', en: 'Black Rose Thorns' },
    desc: { pt: 'Ao se defender, devolve 4 de dano a quem te atacar.', en: 'While guarding, deal 4 damage back to attackers.' },
  },
  master_key: {
    glyph: '🗝️',
    emoji: 'DUNGEON_KEY',
    name: { pt: 'Chave Mestra Secreta', en: 'Secret Master Key' },
    desc: { pt: '+2 chaves agora. Baús trancados rendem o dobro de ouro.', en: '+2 keys now. Locked chests give double gold.' },
  },
  fairy_dust: {
    glyph: '✨',
    emoji: 'DUNGEON_DUST',
    name: { pt: 'Pó de Fada', en: 'Fairy Dust' },
    desc: { pt: '+15% de chance de fuga e 8% de esquiva.', en: '+15% flee chance and 8% dodge.' },
  },
  waning_necklace: {
    glyph: '🌙',
    emoji: 'DUNGEON_MOON',
    name: { pt: 'Colar da Lua Minguante', en: 'Waning Moon Necklace' },
    desc: { pt: '+1 de brilho máximo e começa as lutas com +1 de brilho.', en: '+1 max spark and start fights with +1 spark.' },
  },
  cute_leech: {
    glyph: '🩸',
    emoji: 'DUNGEON_BLOOD',
    name: { pt: 'Sanguessuga Fofinha', en: 'Cuddly Leech' },
    desc: { pt: 'Recupera 20% do dano que você causa.', en: 'Recover 20% of the damage you deal.' },
  },
  moth_lantern: {
    glyph: '🏮',
    emoji: 'DUNGEON_CRYSTAL',
    name: { pt: 'Lanterna de Mariposa', en: 'Moth Lantern' },
    desc: { pt: 'Revela o tipo de todas as salas de cada andar.', en: 'Reveals the type of every room on each floor.' },
  },
};

/** Talentos permanentes comprados com Ecos (meta-progressão roguelite, sem moedas). */
const TALENTS = {
  vitality: {
    glyph: '❤️',
    costs: [4, 8, 14],
    name: { pt: 'Vitalidade', en: 'Vitality' },
    desc: { pt: '+3 de vida máxima por nível.', en: '+3 max HP per rank.' },
  },
  satchel: {
    glyph: '🧪',
    costs: [6, 12],
    name: { pt: 'Bolsinha de Poções', en: 'Potion Satchel' },
    desc: { pt: 'Começa com +1 poção por nível.', en: 'Start with +1 potion per rank.' },
  },
  nose: {
    glyph: '🐈‍⬛',
    costs: [4, 9],
    name: { pt: 'Faro do Astaroth', en: "Astaroth's Nose" },
    desc: {
      pt: 'Nv. 1: o Astaroth fareja mímicos. Nv. 2: também revela armadilhas.',
      en: 'Rank 1: Astaroth sniffs out mimics. Rank 2: also reveals traps.',
    },
  },
  wick: {
    glyph: '🕯️',
    costs: [5, 10],
    name: { pt: 'Pavio Longo', en: 'Long Wick' },
    desc: { pt: '+15 de luz máxima e -1 de luz gasta por sala, por nível.', en: '+15 max light and -1 light per room, per rank.' },
  },
  wand: {
    glyph: '🪄',
    costs: [12],
    name: { pt: 'Varinha Treinada', en: 'Trained Wand' },
    desc: { pt: '+1 de ataque.', en: '+1 attack.' },
  },
  luck: {
    glyph: '🍀',
    costs: [6, 12],
    name: { pt: 'Sorte de Gato Preto', en: 'Black Cat Luck' },
    desc: { pt: '+4% de crítico e +5% de ouro por nível.', en: '+4% crit and +5% gold per rank.' },
  },
};

/** Textos de ambientação das salas vazias, sorteados ao entrar. */
const EMPTY_FLAVORS = [
  { pt: 'Só poeira, teias e um ursinho de pelúcia sem um olho. Que fofo. Que horror.', en: 'Just dust, cobwebs and a one-eyed teddy bear. How cute. How horrifying.' },
  { pt: 'Um relógio parado marca 3:33. O Astaroth encara o canto vazio e rosna baixinho.', en: 'A stopped clock reads 3:33. Astaroth stares at the empty corner and growls softly.' },
  { pt: 'Desenhos de giz na parede mostram uma fadinha fugindo de algo enorme.', en: 'Chalk drawings on the wall show a little fairy fleeing something huge.' },
  { pt: 'Uma xícara de chá ainda morna repousa na mesa. Quem estava aqui?', en: 'A still-warm cup of tea rests on the table. Who was just here?' },
  { pt: 'O silêncio é tão grande que dá para ouvir o coração do Astaroth batendo.', en: "It's so quiet you can hear Astaroth's little heart beating." },
  { pt: 'Pétalas pretas caem do teto sem nenhuma flor à vista.', en: 'Black petals fall from the ceiling with no flower in sight.' },
];

const DIRECTIONS = {
  n: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  w: { dx: -1, dy: 0 },
  e: { dx: 1, dy: 0 },
};

function localized(pair, lang) {
  if (!pair) return '';
  if (typeof pair === 'string') return pair;
  return pair[lang] || pair.pt || pair.en || '';
}

module.exports = {
  FLOORS,
  ENEMIES,
  CHARMS,
  TALENTS,
  EMPTY_FLAVORS,
  DIRECTIONS,
  localized,
};

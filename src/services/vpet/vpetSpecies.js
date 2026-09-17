const path = require('node:path');

const STAGES = {
  EGG: 0,
  BABY_1: 1,
  BABY_2: 2,
  ROOKIE: 3,
  CHAMPION: 4,
  ULTIMATE: 5,
  MEGA: 6,
};

const STAGE_NAMES = {
  0: { pt: 'Ovo', en: 'Egg' },
  1: { pt: 'Bebê I', en: 'Baby I' },
  2: { pt: 'Bebê II', en: 'Baby II' },
  3: { pt: 'Principiante', en: 'Rookie' },
  4: { pt: 'Campeão', en: 'Champion' },
  5: { pt: 'Perfeito', en: 'Ultimate' },
  6: { pt: 'Extremo', en: 'Mega' },
};

const BASE_SPRITE_URL = process.env.PUBLIC_URL || 'http://pyxie.duckdns.org:3000';

const VPET_SPECIES = {
  slime: {
    key: 'slime',
    name: { pt: 'Slime', en: 'Slime' },
    stage: STAGES.BABY_1,
    element: 'ORVALHO',
    emoji: '💧',
    minWeight: 5,
    baseStats: { hp: 40, atk: 8, def: 8, spd: 10 },
    descriptions: {
      pt: 'Pequena gota gelatinosa translúcida recém-saída do ovo. Bouncy, dócil e cheia de curiosidade.',
      en: 'A tiny translucent gelatinous drop newly hatched from an egg. Bouncy, docile, and curious.',
    },
    evolutions: [
      { target: 'mushroom', minWeight: 8, minAgeMinutes: 10 },
      { target: 'turtle', maxWeight: 7, minAgeMinutes: 10 },
    ],
  },
  mushroom: {
    key: 'mushroom',
    name: { pt: 'Spore Mushroom', en: 'Spore Mushroom' },
    stage: STAGES.BABY_2,
    element: 'SILVESTRE',
    emoji: '🍄',
    minWeight: 10,
    baseStats: { hp: 55, atk: 11, def: 12, spd: 11 },
    descriptions: {
      pt: 'Cogumelinho saltitante das colinas com esporos cintilantes. Muito carismático e guloso por frutas.',
      en: 'A bouncy little mushroom from the hills with sparkling spores. Very charismatic and loves treats.',
    },
    evolutions: [
      { target: 'dino', maxMistakes: 1, minAgeMinutes: 45 },
      { target: 'bat', minMistakes: 2, minAgeMinutes: 45 },
    ],
  },
  turtle: {
    key: 'turtle',
    name: { pt: 'Mini Turtle', en: 'Mini Turtle' },
    stage: STAGES.BABY_2,
    element: 'ORVALHO',
    emoji: '🐢',
    minWeight: 10,
    baseStats: { hp: 60, atk: 9, def: 16, spd: 8 },
    descriptions: {
      pt: 'Pequena tartaruguinha de carapaça resistente. Muito calma, paciente e resistente a doenças.',
      en: 'A tiny turtle with a sturdy shell. Extremely calm, patient, and naturally resilient.',
    },
    evolutions: [
      { target: 'dino', maxMistakes: 1, minAgeMinutes: 45 },
      { target: 'ghost', minMistakes: 2, minAgeMinutes: 45 },
    ],
  },
  dino: {
    key: 'dino',
    name: { pt: 'Forest Dino', en: 'Forest Dino' },
    stage: STAGES.ROOKIE,
    element: 'SILVESTRE',
    emoji: '🦖',
    minWeight: 15,
    baseStats: { hp: 75, atk: 18, def: 15, spd: 16 },
    descriptions: {
      pt: 'Dinossauro filhote saltador com garras verdes e dentes pontudos. Ama sparring e corridas no bosque.',
      en: 'A bouncing young dino with green claws and sharp teeth. Loves sparring and forest runs.',
    },
    evolutions: [
      { target: 'reptile', maxMistakes: 2, minTrain: 8, minAgeMinutes: 180 },
      { target: 'boar', minMistakes: 3, maxMistakes: 5, minAgeMinutes: 180 },
      { target: 'mimic', minMistakes: 6, minAgeMinutes: 180 },
    ],
  },
  bat: {
    key: 'bat',
    name: { pt: 'Night Bat', en: 'Night Bat' },
    stage: STAGES.ROOKIE,
    element: 'TRAVESSURA',
    emoji: '🦇',
    minWeight: 14,
    baseStats: { hp: 68, atk: 19, def: 12, spd: 22 },
    descriptions: {
      pt: 'Morceguinho ágil das cavernas noturnas. Voa rápido, esquiva de golpes e prefere treinar à noite.',
      en: 'An agile little bat from midnight caverns. Flies fast, dodges attacks, and loves night training.',
    },
    evolutions: [
      { target: 'snake', maxMistakes: 3, minTrain: 8, minAgeMinutes: 180 },
      { target: 'mimic', minMistakes: 4, minAgeMinutes: 180 },
    ],
  },
  ghost: {
    key: 'ghost',
    name: { pt: 'Spirit Ghost', en: 'Spirit Ghost' },
    stage: STAGES.ROOKIE,
    element: 'CHARME',
    emoji: '👻',
    minWeight: 12,
    baseStats: { hp: 70, atk: 20, def: 14, spd: 18 },
    descriptions: {
      pt: 'Espírito translúcido que flutua suavemente. Muito brincalhão e resistente a ataques físicos.',
      en: 'A translucent playful spirit floating gently. Highly mischievous and resistant to physical blows.',
    },
    evolutions: [
      { target: 'reptile', maxMistakes: 2, minTrain: 10, minAgeMinutes: 180 },
      { target: 'mimic', minMistakes: 3, minAgeMinutes: 180 },
    ],
  },
  reptile: {
    key: 'reptile',
    name: { pt: 'Reptile Warrior', en: 'Reptile Warrior' },
    stage: STAGES.CHAMPION,
    element: 'SILVESTRE',
    emoji: '🦎',
    minWeight: 30,
    baseStats: { hp: 120, atk: 32, def: 28, spd: 26 },
    descriptions: {
      pt: 'Guerreiro réptil disciplinado que empunha uma cimitarra afiada. Linhagem nobre fruto de rigoroso treino.',
      en: 'A disciplined reptile swordsman wielding a sharp scimitar. A noble line forged through intense training.',
    },
    evolutions: [
      { target: 'tyranno', minTrain: 18, minBattles: 12, minWinRate: 65, minAgeMinutes: 480 },
    ],
  },
  boar: {
    key: 'boar',
    name: { pt: 'Iron Boar', en: 'Iron Boar' },
    stage: STAGES.CHAMPION,
    element: 'BRISA',
    emoji: '🐗',
    minWeight: 34,
    baseStats: { hp: 135, atk: 35, def: 30, spd: 20 },
    descriptions: {
      pt: 'Javali de batalha musculoso com presas de ferro. Investe contra os adversários com força bruta.',
      en: 'A muscular battle boar with iron tusks. Charges at opponents with raw, unstoppable strength.',
    },
    evolutions: [
      { target: 'giant', minTrain: 15, minBattles: 10, minWeight: 38, minAgeMinutes: 480 },
    ],
  },
  snake: {
    key: 'snake',
    name: { pt: 'Shadow Snake', en: 'Shadow Snake' },
    stage: STAGES.CHAMPION,
    element: 'TRAVESSURA',
    emoji: '🐍',
    minWeight: 26,
    baseStats: { hp: 110, atk: 36, def: 24, spd: 32 },
    descriptions: {
      pt: 'Serpente astuta camuflada nas trevas. Ataca num piscar de olhos e desorienta os inimigos com veneno.',
      en: 'A cunning serpent shrouded in shadow. Strikes in the blink of an eye with venomous fangs.',
    },
    evolutions: [
      { target: 'tyranno', minTrain: 20, minBattles: 15, minWinRate: 70, minAgeMinutes: 480 },
    ],
  },
  mimic: {
    key: 'mimic',
    name: { pt: 'Tricky Mimic', en: 'Tricky Mimic' },
    stage: STAGES.CHAMPION,
    element: 'TRAVESSURA',
    emoji: '📦',
    minWeight: 28,
    baseStats: { hp: 100, atk: 28, def: 35, spd: 15 },
    descriptions: {
      pt: 'Baú vivo e travesso resultante de muitos erros de cuidado. Cômico, teimoso, mas com grande potencial.',
      en: 'A mischievous living chest born from care mistakes. Comical and stubborn, yet full of surprise potential.',
    },
    evolutions: [
      { target: 'giant', minTrain: 25, minBattles: 20, minWinRate: 60, minAgeMinutes: 600 },
    ],
  },
  tyranno: {
    key: 'tyranno',
    name: { pt: 'Primal Tyranno', en: 'Primal Tyranno' },
    stage: STAGES.ULTIMATE,
    element: 'BRISA',
    emoji: '🦖',
    minWeight: 45,
    baseStats: { hp: 180, atk: 52, def: 42, spd: 36 },
    descriptions: {
      pt: 'Predador ápice pré-histórico com rugido ensurdecedor. Domina a arena de sparring com ferocidade titânica.',
      en: 'A prehistoric apex predator with a deafening roar. Dominates the sparring arena with titanic ferocity.',
    },
    evolutions: [
      { target: 'dragon', minTrain: 30, minBattles: 25, minWinRate: 75, minAgeMinutes: 960 },
    ],
  },
  giant: {
    key: 'giant',
    name: { pt: 'Ancient Titan', en: 'Ancient Titan' },
    stage: STAGES.ULTIMATE,
    element: 'SILVESTRE',
    emoji: '🗿',
    minWeight: 50,
    baseStats: { hp: 210, atk: 48, def: 55, spd: 22 },
    descriptions: {
      pt: 'Colosso ancião feito de pedra viva e runas. Sua defesa é impenetrável e seus punhos abalam montanhas.',
      en: 'An ancient colossus of living stone and runes. Possesses an impenetrable defense and mountain-shattering fists.',
    },
    evolutions: [
      { target: 'dragon', minTrain: 32, minBattles: 25, minWinRate: 75, minAgeMinutes: 960 },
    ],
  },
  dragon: {
    key: 'dragon',
    name: { pt: 'Infernal Dragon', en: 'Infernal Dragon' },
    stage: STAGES.MEGA,
    element: 'CHARME',
    emoji: '🐉',
    minWeight: 60,
    baseStats: { hp: 280, atk: 70, def: 60, spd: 48 },
    descriptions: {
      pt: 'A lendária forma extrema de dragão ancestral alado. Cospe labaredas sagradas e reina supremo no Hall da Fama.',
      en: 'The legendary pinnacle dragon form. Breathes sacred dragonflame and reigns supreme in the Hall of Fame.',
    },
    evolutions: [],
  },
};

const VPET_EGGS = {
  egg_mystic: {
    key: 'egg_mystic',
    name: { pt: 'Ovo Místico', en: 'Mystic Egg' },
    element: 'CHARME',
    emoji: '🥚',
    sprite: `${BASE_SPRITE_URL}/sprites/vpet/eggs/egg_mystic.png`,
  },
  egg_water: {
    key: 'egg_water',
    name: { pt: 'Ovo das Marés', en: 'Tide Egg' },
    element: 'ORVALHO',
    emoji: '💧',
    sprite: `${BASE_SPRITE_URL}/sprites/vpet/eggs/egg_water.png`,
  },
  egg_grass: {
    key: 'egg_grass',
    name: { pt: 'Ovo da Floresta', en: 'Forest Egg' },
    element: 'SILVESTRE',
    emoji: '🍃',
    sprite: `${BASE_SPRITE_URL}/sprites/vpet/eggs/egg_grass.png`,
  },
  egg_fire: {
    key: 'egg_fire',
    name: { pt: 'Ovo Vulcânico', en: 'Volcano Egg' },
    element: 'BRISA',
    emoji: '🔥',
    sprite: `${BASE_SPRITE_URL}/sprites/vpet/eggs/egg_fire.png`,
  },
  egg_golden: {
    key: 'egg_golden',
    name: { pt: 'Ovo Dourado', en: 'Golden Egg' },
    element: 'CHARME',
    emoji: '✨',
    sprite: `${BASE_SPRITE_URL}/sprites/vpet/eggs/egg_golden.png`,
  },
};

const VPET_ITEMS = {
  meat: `${BASE_SPRITE_URL}/sprites/vpet/items/meat.png`,
  pill: `${BASE_SPRITE_URL}/sprites/vpet/items/pill.png`,
  medicine: `${BASE_SPRITE_URL}/sprites/vpet/items/medicine.png`,
  poop: `${BASE_SPRITE_URL}/sprites/vpet/items/poop.png`,
  clean: `${BASE_SPRITE_URL}/sprites/vpet/items/clean.png`,
  sleep: `${BASE_SPRITE_URL}/sprites/vpet/items/sleep.png`,
};

const LEGACY_SPECIES_MAP = {
  cinna: 'slime',
  bonorka: 'turtle',
  pomcorin: 'dino',
  bakuphant: 'bat',
  clovis: 'boar',
  kerobola: 'reptile',
  nekomandra: 'ghost',
  nekoterra: 'snake',
  rionator: 'tyranno',
  spiromuffin: 'dragon',
};

function resolveSpeciesKey(key) {
  if (!key) return 'slime';
  const clean = String(key).toLowerCase().trim();
  return LEGACY_SPECIES_MAP[clean] || (VPET_SPECIES[clean] ? clean : 'slime');
}

function getVpetSpecies(key) {
  return VPET_SPECIES[key] || VPET_SPECIES.slime;
  const resolved = resolveSpeciesKey(key);
  return VPET_SPECIES[resolved] || VPET_SPECIES.slime;
}

function getVpetSpriteUrl(speciesKey, state = 'idle', isSleeping = false, lightOff = false) {
  if (isSleeping && lightOff) {
    return VPET_ITEMS.sleep;
  }
  const resolved = resolveSpeciesKey(speciesKey);
  const validStates = ['idle', 'attack', 'hit'];
  const anim = validStates.includes(state) ? state : 'idle';
  return `${BASE_SPRITE_URL}/sprites/vpet/pets/${speciesKey}_${anim}.gif`;
  return `${BASE_SPRITE_URL}/sprites/vpet/pets/${resolved}_${anim}.gif`;
}

module.exports = {
  STAGES,
  STAGE_NAMES,
  BASE_SPRITE_URL,
  VPET_SPECIES,
  VPET_EGGS,
  VPET_ITEMS,
  LEGACY_SPECIES_MAP,
  resolveSpeciesKey,
  getVpetSpecies,
  getVpetSpriteUrl,
};


const fs = require('node:fs');
const path = require('node:path');
const { createBonusSession, verifyBonusSession } = require('./bonusTimer');
const EXPLORATION_EVENTS_CONFIG = require('../data/explorationEvents.json');

const gloomFile = path.join(__dirname, '..', '..', 'data', 'gloom.json');
const gloomBackupFile = `${gloomFile}.bak`;

const MAX_ENERGY = 10;
const ENERGY_REGEN_MS = 6 * 60 * 1000; // 1 energia a cada 6 minutos (10 por hora)
const TRACE_BASE_COST = 15;
const TIDE_CYCLE_MS = 6 * 60 * 60 * 1000; // 6 horas
const MAP_MOVE_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutos para troca de mapa

// Matriz de Afinidade Psicológica Atlus SMT (Temperamento x Tom de Resposta)
const PSYCHOLOGY_MATRIX = {
  caotico: {
    chaotic: 2,
    arrogant: 1,
    rational: -1,
    empathetic: -2,
    flattery: -2,
    submissive: -2,
    pragmatic: -1,
    bribe: 0,
  },
  sadico: {
    arrogant: 1,
    chaotic: 1,
    rational: 0,
    empathetic: -2,
    flattery: -2,
    submissive: -2,
    pragmatic: 0,
    bribe: 0,
  },
  orgulhoso: {
    arrogant: 1,
    rational: 1,
    chaotic: -1,
    empathetic: -1,
    flattery: -2,
    submissive: -2,
    pragmatic: 0,
    bribe: -1,
  },
  pragmatico: {
    pragmatic: 2,
    rational: 2,
    bribe: 1,
    arrogant: 0,
    chaotic: -2,
    empathetic: -1,
    flattery: -1,
    submissive: 0,
  },
  timido: {
    empathetic: 2,
    submissive: 1,
    rational: 1,
    arrogant: -2,
    chaotic: -2,
    flattery: 0,
    pragmatic: 0,
    bribe: 0,
  },
  ganancioso: {
    bribe: 2,
    pragmatic: 2,
    rational: 1,
    submissive: 1,
    arrogant: -1,
    chaotic: -1,
    empathetic: -1,
    flattery: 0,
  },
};

const PERSONALITY_TO_TEMPERAMENT = {
  melancholic: 'timido',
  lazy: 'caotico',
  sarcastic: 'sadico',
  gothic_rock: 'caotico',
  shadow_merchant: 'ganancioso',
  ironic_specter: 'sadico',
  cold_sentinel: 'orgulhoso',
  glutton_alchemist: 'pragmatico',
  nihilist_lord: 'orgulhoso',
  phoenix_scholar: 'pragmatico',
  blood_succubus: 'sadico',
  abyssal_chimera: 'caotico',
  ancient_shadow: 'orgulhoso',
  relic_mimic: 'ganancioso',
};

// Regras e Metas Rígidas de Negociação por Tier (SMT V3 Hardcore)
const TIER_NEGOTIATION_RULES = {
  1: { rounds: 2, targetScore: 2, maxSingleScore: 2, baseBribe: 90 },
  2: { rounds: 3, targetScore: 3, maxSingleScore: 2, baseBribe: 325 },
  3: { rounds: 3, targetScore: 3, maxSingleScore: 2, baseBribe: 900, requiresRelicTier: 2 },
  4: { rounds: 4, targetScore: 4, maxSingleScore: 2, baseBribe: 2650, energyCost: 3 },
  5: { rounds: 4, targetScore: 4, maxSingleScore: 1, baseBribe: 5000, drainsAllEnergy: true, requiresRelicTier: 4 },
};

// 1. Definição dos 10 Cenários do Reino da Penumbra
const LOCATIONS = {
  portao_penumbra: {
    id: 'portao_penumbra',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Portão das Fadas Decaídas', en: 'Gates of the Fallen' },
    desc: {
      pt: 'Portões góticos de ferro batido cercados por névoa lilás e corvos silenciosos. A entrada do reino esquecido.',
      en: 'Gothic wrought-iron gates shrouded in purple mist and silent ravens. The threshold to the forgotten realm.',
    },
    image: 'portao_penumbra.png',
    neighbors: ['cemiterio_espinhos', 'floresta_sussurros'],
    loot: [
      { item: 'phantomCoins', min: 8, max: 20, weight: 60 },
      { item: 'cravo_negro', name: { pt: 'Cravo Negro', en: 'Black Carnation' }, weight: 25 },
      { item: 'pedra_tumular', name: { pt: 'Fragmento de Lápide', en: 'Tombstone Shard' }, weight: 15 },
    ],
    spirits: ['espectro_baixo_astral', 'gargula_procrastinador', 'morcego_shoegaze'],
  },
  cemiterio_espinhos: {
    id: 'cemiterio_espinhos',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Cemitério dos Cravos Roxos', en: 'Thorn Graveyard' },
    desc: {
      pt: 'Lápides antigas tomadas por trepadeiras espinhosas e cravos arroxeados. O vento sussurra versos melancólicos.',
      en: 'Ancient tombstones overgrown with thorny vines and purple carnations. The wind whispers melancholic poetry.',
    },
    image: 'cemiterio_espinhos.png',
    neighbors: ['portao_penumbra', 'pantano_lagrimas', 'mausoleu_ancestral'],
    loot: [
      { item: 'phantomCoins', min: 10, max: 25, weight: 55 },
      { item: 'cravo_negro', name: { pt: 'Cravo Negro', en: 'Black Carnation' }, weight: 25 },
      { item: 'lagrima_emo', name: { pt: 'Lágrima Emo', en: 'Emo Tear' }, weight: 15 },
      { item: 'spectral_key', name: { pt: 'Chave Espectral', en: 'Spectral Key' }, weight: 5 },
    ],
    spirits: ['espectro_baixo_astral', 'fada_desencantada', 'corvo_poeta', 'esqueleto_allstar'],
  },
  floresta_sussurros: {
    id: 'floresta_sussurros',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Floresta dos Sussurros', en: 'Whispering Woods' },
    desc: {
      pt: 'Árvores retorcidas e cogumelos luminescentes que brilham em ciano e roxo. Ecos de guitarras distantes preenchem o ar.',
      en: 'Twisted ancient trees and glowing bioluminescent fungi. Faint echoes of distant distorted guitars fill the air.',
    },
    image: 'floresta_sussurros.png',
    neighbors: ['portao_penumbra', 'pantano_lagrimas', 'ponte_abismo'],
    loot: [
      { item: 'phantomCoins', min: 10, max: 22, weight: 55 },
      { item: 'cogumelo_rochedo', name: { pt: 'Cogumelo Violeta', en: 'Violet Mushroom' }, weight: 30 },
      { item: 'corda_guitarra', name: { pt: 'Corda Rompida', en: 'Broken Guitar String' }, weight: 15 },
    ],
    spirits: ['fada_desencantada', 'morcego_shoegaze', 'lobisomem_introvertido'],
  },
  pantano_lagrimas: {
    id: 'pantano_lagrimas',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Pântano das Lágrimas Secas', en: 'Swamp of Dry Tears' },
    desc: {
      pt: 'Águas escuras e imóveis sob salgueiros chorões. Fogo-fátuos púrpuras dançam na superfície lodosa.',
      en: 'Dark still waters under weeping willows. Purple wisps dance upon the melancholic muddy surface.',
    },
    image: 'pantano_lagrimas.png',
    neighbors: ['cemiterio_espinhos', 'floresta_sussurros'],
    loot: [
      { item: 'phantomCoins', min: 12, max: 26, weight: 50 },
      { item: 'lagrima_emo', name: { pt: 'Lágrima Emo', en: 'Emo Tear' }, weight: 25 },
      { item: 'lodo_espectral', name: { pt: 'Lodo Espectral', en: 'Spectral Slime' }, weight: 25 },
    ],
    spirits: ['espectro_baixo_astral', 'morcego_shoegaze', 'banshee_descarregada'],
  },
  mausoleu_ancestral: {
    id: 'mausoleu_ancestral',
    tier: 3,
    rarity: 'common',
    name: { pt: 'Mausoléu da Melancolia', en: 'Mausoleum of Melancholy' },
    desc: {
      pt: 'Salão gótico sagrado de pedra escura com vitrais violeta e um sarcófago esculpido. Velas gotejam cera roxa.',
      en: 'Sacred stone hall with purple stained glass and an ancient stone sarcophagus. Candles drip purple wax in silence.',
    },
    image: 'mausoleu_ancestral.png',
    neighbors: ['cemiterio_espinhos', 'biblioteca_esquecida', 'santuario_touca_preta'],
    loot: [
      { item: 'phantomCoins', min: 15, max: 30, weight: 50 },
      { item: 'cera_roxa', name: { pt: 'Cera Roxa', en: 'Purple Wax' }, weight: 30 },
      { item: 'reliquia_ancestral', name: { pt: 'Relíquia Ancestral', en: 'Ancient Relic' }, weight: 20 },
    ],
    spirits: ['gargula_procrastinador', 'banshee_descarregada', 'lorde_apatia'],
  },
  biblioteca_esquecida: {
    id: 'biblioteca_esquecida',
    tier: 3,
    rarity: 'uncommon',
    name: { pt: 'Biblioteca dos Manuscritos', en: 'Forgotten Archives' },
    desc: {
      pt: 'Estantes intermináveis repletas de tratados ocultistas, grimórios esquecidos e pergaminhos poeirentos iluminados por orbes flutuantes.',
      en: 'Towering shelves lined with occult treatises, forgotten grimoires, and dusty scrolls lit by floating spectral orbs.',
    },
    image: 'biblioteca_esquecida.png',
    requiresItem: 'spectral_key',
    keyCost: 30,
    neighbors: ['mausoleu_ancestral'],
    loot: [
      { item: 'phantomCoins', min: 20, max: 40, weight: 45 },
      { item: 'pergaminho_antigo', name: { pt: 'Pergaminho Antigo', en: 'Ancient Scroll' }, weight: 35 },
      { item: 'essencia_sombra', name: { pt: 'Essência da Sombra', en: 'Shadow Essence' }, weight: 20 },
    ],
    spirits: ['corvo_poeta', 'esqueleto_allstar', 'sucubo_tedio'],
  },
  ponte_abismo: {
    id: 'ponte_abismo',
    tier: 3,
    rarity: 'uncommon',
    name: { pt: 'Ponte dos Suspiros', en: 'Bridge of Sighs' },
    desc: {
      pt: 'Arco monumental de pedra sobre um abismo profundo e sem fundo. Ventos cortantes uivam melodias esquecidas.',
      en: 'Monumental stone arch over a bottomless void. Biting winds howl forgotten gothic melodies into the night.',
    },
    image: 'ponte_abismo.png',
    minLocationsVisited: 3,
    neighbors: ['floresta_sussurros', 'catacumba_sangue_roxo', 'jardim_fadas_negras'],
    loot: [
      { item: 'phantomCoins', min: 18, max: 35, weight: 50 },
      { item: 'fragmento_abismo', name: { pt: 'Fragmento do Abismo', en: 'Void Shard' }, weight: 30 },
      { item: 'pluma_corvo', name: { pt: 'Pluma de Corvo', en: 'Raven Feather' }, weight: 20 },
    ],
    spirits: ['lobisomem_introvertido', 'cavaleiro_nevoa', 'corvo_poeta'],
  },
  catacumba_sangue_roxo: {
    id: 'catacumba_sangue_roxo',
    tier: 4,
    rarity: 'rare',
    name: { pt: 'Catacumbas do Sangue Púrpura', en: 'Purple Blood Catacombs' },
    desc: {
      pt: 'Cripta subterrânea iluminada por cristais roxos e veios luminescentes. O ar vibra com energia proibida e pura melancolia.',
      en: 'Subterranean crypt illuminated by purple crystals and glowing mineral veins. Forbidden energy pulses through the cold air.',
    },
    image: 'catacumba_sangue_roxo.png',
    tideCondition: 'purple_moon',
    requiresItemAlternative: 'lagrima_emo',
    neighbors: ['ponte_abismo'],
    loot: [
      { item: 'phantomCoins', min: 35, max: 70, weight: 50 },
      { item: 'cristal_purpura', name: { pt: 'Cristal Púrpura', en: 'Purple Crystal' }, weight: 30 },
      { item: 'essencia_sombra', name: { pt: 'Essência da Sombra', en: 'Shadow Essence' }, weight: 20 },
    ],
    spirits: ['lorde_apatia', 'cavaleiro_nevoa', 'quimera_madrugada'],
  },
  jardim_fadas_negras: {
    id: 'jardim_fadas_negras',
    tier: 4,
    rarity: 'rare',
    name: { pt: 'Jardim das Rosas de Vidro', en: 'Glass Rose Garden' },
    desc: {
      pt: 'Santuário secreto repleto de rosas translúcidas de cristal escuro ao redor de uma fonte de fada com águas púrpuras.',
      en: 'Secret twilight sanctuary featuring translucent dark crystal roses surrounding an ornate purple fairy fountain.',
    },
    image: 'jardim_fadas_negras.png',
    requiresFairyFamiliar: true,
    portalChance: 0.15,
    neighbors: ['ponte_abismo'],
    loot: [
      { item: 'phantomCoins', min: 30, max: 65, weight: 50 },
      { item: 'rosa_vidro', name: { pt: 'Rosa de Vidro', en: 'Glass Rose' }, weight: 35 },
      { item: 'gota_orvalho_místico', name: { pt: 'Orvalho Místico', en: 'Mystic Dew' }, weight: 15 },
    ],
    spirits: ['fada_desencantada', 'sucubo_tedio', 'quimera_madrugada'],
  },
  santuario_touca_preta: {
    id: 'santuario_touca_preta',
    tier: 5,
    rarity: 'legendary',
    name: { pt: 'Santuário Secreto de Pyxie', en: 'Pyxie\'s Obsidian Haven' },
    desc: {
      pt: 'O trono de obsidiana da Fadinha Emo. Caldeirão místico de fusão borbulha fumaça violeta enquanto velas negras queimam.',
      en: 'The obsidian throne of the Emo Fairy. A mystic fusion cauldron bubbles purple vapors while black candles burn.',
    },
    image: 'santuario_touca_preta.png',
    requiresHardcoreSanctuary: true,
    requiresBossParticipation: true,
    altarFee: 50,
    neighbors: ['mausoleu_ancestral'],
    loot: [
      { item: 'phantomCoins', min: 50, max: 100, weight: 60 },
      { item: 'essencia_sombra', name: { pt: 'Essência da Sombra', en: 'Shadow Essence' }, weight: 25 },
      { item: 'insignia_touca_preta', name: { pt: 'Insígnia da Touca Preta', en: 'Black Beanie Crest' }, weight: 15 },
    ],
    spirits: ['sombra_ancestral', 'fenix_cinzas', 'lorde_apatia'],
  },
};

// 1.1 Carregador de Encontros SMT V2 (src/data/encounters.json)
const ENCOUNTERS_MAP = new Map();
let ENCOUNTERS_LIST = [];

function loadEncounters() {
  try {
    const encPath = path.join(__dirname, '..', 'data', 'encounters.json');
    const fallbackPath = path.join(__dirname, '..', '..', 'data', 'encounters.json');
    const targetPath = fs.existsSync(encPath) ? encPath : fallbackPath;
    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
      ENCOUNTERS_LIST = data.encounters || [];
      ENCOUNTERS_MAP.clear();
      for (const enc of ENCOUNTERS_LIST) {
        ENCOUNTERS_MAP.set(enc.id, enc);
        if (enc.is_cataloged && enc.monster_id) {
          ENCOUNTERS_MAP.set(`monster:${enc.monster_id}`, enc);
        }
      }
    }
  } catch (err) {
    console.warn('[gloomRealm] Aviso ao carregar encounters.json:', err.message);
  }
}
loadEncounters();

function getEncounters() {
  if (ENCOUNTERS_LIST.length === 0) loadEncounters();
  return ENCOUNTERS_LIST;
}

function getEncounterById(encounterId) {
  if (ENCOUNTERS_MAP.size === 0) loadEncounters();
  return ENCOUNTERS_MAP.get(encounterId) || null;
}

function getEncounterForSpirit(spiritId) {
  if (ENCOUNTERS_MAP.size === 0) loadEncounters();
  return ENCOUNTERS_MAP.get(`monster:${spiritId}`) || null;
}

function getRandomEncounter(tier = 1, context = null) {
  if (ENCOUNTERS_LIST.length === 0) loadEncounters();
  let candidates = ENCOUNTERS_LIST.filter((e) => e.tier === tier);
  if (context) {
    const byContext = candidates.filter((e) => e.situational_context === context);
    if (byContext.length > 0) candidates = byContext;
  }
  if (candidates.length === 0) candidates = ENCOUNTERS_LIST;
  return candidates[Math.floor(Math.random() * candidates.length)] || null;
}

// 2. Roster de 14 Espíritos / Sombras com Personalidade e Diálogos Atlus/DemiKids
const SPIRITS = {
  espectro_baixo_astral: {
    id: 'espectro_baixo_astral',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Espectro do Baixo Astral', en: 'Low Astral Wraith' },
    personality: 'melancholic',
    image: '/assets/spirits/espectro_baixo_astral.gif',
    dialogue: {
      question: {
        pt: 'A existência é um fardo pesado... Você também sente que nada tem sentido ou só está entediado?',
        en: 'Existence is a heavy burden... Do you also feel everything is meaningless or are you just bored?',
      },
      choices: [
        { id: 'c1', label: { pt: '🖤 O vazio cósmico dói, mas me acostumei', en: '🖤 The cosmic void aches, but I got used to it' }, success: true, score: 1 },
        { id: 'c2', label: { pt: '🎧 Prefiro colocar um som e esquecer', en: '🎧 I rather put headphones on and forget' }, success: true, score: 1 },
        { id: 'c3', label: { pt: '💀 Para de drama e passa suas moedas', en: '💀 Stop the drama and hand over coins' }, success: false, score: -2, criticalFailure: true },
      ],
      bribeCost: 15,
    },
    aura: {
      id: 'wraith_coins',
      name: { pt: 'Aura da Apatia Rentável', en: 'Profitable Apathy Aura' },
      desc: { pt: '+5% Phantom Coins ao forragear', en: '+5% Phantom Coins when foraging' },
      bonusCoinsPercent: 5,
    },
  },
  gargula_procrastinador: {
    id: 'gargula_procrastinador',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Gárgula Procrastinador', en: 'Sloth Gargoyle' },
    personality: 'lazy',
    image: '/assets/spirits/gargula_procrastinador.gif',
    dialogue: {
      question: {
        pt: 'Eu poderia te atacar agora... mas fingir que sou pedra é tão mais confortável. O que você acha de não fazermos nada hoje?',
        en: 'I could attack you right now... but pretending to be stone is so much easier. What if we just do nothing today?',
      },
      choices: [
        { id: 'c1', label: { pt: '🪨 Apoio totalmente, deitar e procrastinar', en: '🪨 Fully support that, lay down and procrastinate' }, success: true, score: 1 },
        { id: 'c2', label: { pt: '☕ Uma pausa rápida antes de continuar', en: '☕ Just a quick break before continuing' }, success: true, score: 1 },
        { id: 'c3', label: { pt: '⚡ Levanta daí e vai trabalhar!', en: '⚡ Get up from there and do some work!' }, success: false, score: -2, criticalFailure: true },
      ],
      bribeCost: 15,
    },
    aura: {
      id: 'sloth_save',
      name: { pt: 'Inércia Protetora', en: 'Protective Inertia' },
      desc: { pt: '10% de chance de não gastar energia ao forragear', en: '10% chance to not spend energy when foraging' },
      energySaveChance: 0.10,
    },
  },
  fada_desencantada: {
    id: 'fada_desencantada',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Fada Desencantada', en: 'Disenchanted Pixie' },
    personality: 'sarcastic',
    image: '/assets/spirits/fada_desencantada.gif',
    dialogue: {
      question: {
        pt: 'Esperava pozinho mágico e purpurina? Meu rímel borrado e minhas asas roxas têm mais história que qualquer fada de conto de fadas.',
        en: 'Were you expecting fairy dust and glitter? My smudged mascara and purple wings have more lore than any generic fairy.',
      },
      choices: [
        { id: 'c1', label: { pt: '💜 Seu estilo gótico é infinitamente melhor', en: '💜 Your gothic style is infinitely superior' }, success: true },
        { id: 'c2', label: { pt: '🦇 Trevas com asas combinam muito mais', en: '🦇 Wings and darkness match much better' }, success: true },
        { id: 'c3', label: { pt: '🧚‍♀️ Fadas deveriam ser doces e rosas', en: '🧚‍♀️ Fairies should be sweet and pink' }, success: false },
      ],
      bribeCost: 20,
    },
    affinity: 'fairy',
    aura: {
      id: 'pixie_relics',
      name: { pt: 'Faro Obscuro', en: 'Dark Scent' },
      desc: { pt: '+5% de chance de relíquias raras', en: '+5% rare relic chance' },
      relicBonusPercent: 5,
    },
  },
  morcego_shoegaze: {
    id: 'morcego_shoegaze',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Morcego do Shoegaze', en: 'Shoegaze Bat' },
    personality: 'aerial',
    image: '/assets/spirits/morcego_shoegaze.gif',
    dialogue: {
      question: {
        pt: 'As paredes dessas cavernas reverberam um eco em tom menor... Você consegue ouvir o som ou sua mente está cheia de ruído?',
        en: 'These cave walls reverberate in a minor chord... Can you hear the melody or is your mind full of white noise?',
      },
      choices: [
        { id: 'c1', label: { pt: '🎵 Ouço perfeitamente, é melancólico e belo', en: '🎵 I hear it clearly, melancholic and beautiful' }, success: true },
        { id: 'c2', label: { pt: '🦇 Guie meu caminho pelas frequências sombrias', en: '🦇 Guide my path through dark frequencies' }, success: true },
        { id: 'c3', label: { pt: '🔇 Esse barulho está me dando dor de cabeça', en: '🔇 That noise is giving me a headache' }, success: false },
      ],
      bribeCost: 15,
    },
    aura: {
      id: 'bat_radar',
      name: { pt: 'Ecolocalização Sombria', en: 'Dark Echolocation' },
      desc: { pt: 'Alerta sobre armadilhas em pântanos e catacumbas', en: 'Warns of traps in swamps and catacombs' },
      trapImmunity: true,
    },
  },
  corvo_poeta: {
    id: 'corvo_poeta',
    tier: 2,
    rarity: 'uncommon',
    name: { pt: 'Corvo Poeta Nihilista', en: 'Nihilist Raven' },
    personality: 'poetic',
    dialogue: {
      question: {
        pt: 'Nunca mais... ou talvez amanhã de novo? Por que os mortais buscam tesouros quando o tempo consome tudo em poeira?',
        en: 'Nevermore... or perhaps tomorrow once more? Why do mortals seek treasure when time reduces all to dust?',
      },
      choices: [
        { id: 'c1', label: { pt: '📜 Pela beleza efêmera da jornada poética', en: '📜 For the fleeting beauty of the poetic journey' }, success: true },
        { id: 'c2', label: { pt: '🖤 Porque mesmo na poeira há brilho prateado', en: '🖤 Because even in dust there is silver gleam' }, success: true },
        { id: 'c3', label: { pt: '💰 Porque moedas compram coisas melhores que poesia', en: '💰 Because coins buy better things than poetry' }, success: false },
      ],
      bribeCost: 25,
    },
    aura: {
      id: 'raven_wealth',
      name: { pt: 'Riqueza dos Versos Tristes', en: 'Wealth of Sad Verses' },
      desc: { pt: '+10% Phantom Coins ao forragear', en: '+10% Phantom Coins when foraging' },
      bonusCoinsPercent: 10,
    },
  },
  banshee_descarregada: {
    id: 'banshee_descarregada',
    tier: 2,
    rarity: 'uncommon',
    name: { pt: 'Banshee do Fone Descarregado', en: 'Dead Phone Banshee' },
    personality: 'screamer',
    dialogue: {
      question: {
        pt: 'Meu grito primordial não é por ódio... é porque meu cabo quebrou bem na dobra e eu fiquei sem bateria no metrô! Você me entende?!',
        en: 'My primordial wail is not born of hate... it is because my cable frayed and my battery died on the train! Do you understand me?!',
      },
      choices: [
        { id: 'c1', label: { pt: '😭 Essa é a maior tragédia da era moderna!', en: '😭 That is the greatest tragedy of our modern age!' }, success: true },
        { id: 'c2', label: { pt: '🔌 Toma um cabo reserva, acalme seu espírito', en: '🔌 Take a spare cable, calm your spirit' }, success: true },
        { id: 'c3', label: { pt: '📢 Para de gritar no meu ouvido por bobagem', en: '📢 Stop shouting in my ears over nonsense' }, success: false },
      ],
      bribeCost: 25,
    },
    aura: {
      id: 'banshee_discount',
      name: { pt: 'Eco da Economia', en: 'Echo of Frugality' },
      desc: { pt: 'Reduz o custo de deixar rastros em 20%', en: 'Reduces trace placement cost by 20%' },
      traceDiscountPercent: 20,
    },
  },
  lobisomem_introvertido: {
    id: 'lobisomem_introvertido',
    tier: 2,
    rarity: 'uncommon',
    name: { pt: 'Lobisomem Introvertido', en: 'Introvert Werewolf' },
    personality: 'timid',
    dialogue: {
      question: {
        pt: 'Por favor, não me faça uivar na frente de todo mundo... Eu prefiro uivar baixinho no meu quarto escuro. Você pode falar baixo?',
        en: 'Please do not make me howl in front of everyone... I prefer to howl quietly in my dark room. Can you keep your voice down?',
      },
      choices: [
        { id: 'c1', label: { pt: '🤫 *Sussurrando*: Fique tranquilo, silêncio sagrado', en: '🤫 *Whispering*: Rest easy, silence is sacred' }, success: true },
        { id: 'c2', label: { pt: '🛋️ Entendo perfeitamente, a paz de ficar na sua', en: '🛋️ I completely get it, the comfort of your space' }, success: true },
        { id: 'c3', label: { pt: '🗣️ UIVA LOGO PRA EU GRAVAR UM VÍDEO!', en: '🗣️ HOWL ALREADY SO I CAN RECORD A VIDEO!' }, success: false },
      ],
      bribeCost: 25,
    },
    aura: {
      id: 'wolf_fog',
      name: { pt: 'Resiliência Silenciosa', en: 'Silent Resilience' },
      desc: { pt: 'Protege contra os efeitos do nevoeiro ácido', en: 'Protects against acid fog effects' },
      acidFogImmunity: true,
    },
  },
  esqueleto_allstar: {
    id: 'esqueleto_allstar',
    tier: 2,
    rarity: 'uncommon',
    name: { pt: 'Esqueleto de All-Star', en: 'Retro Punk Skeleton' },
    personality: 'punk',
    dialogue: {
      question: {
        pt: 'Ano 2004 foi ontem, cara. Meus ossos doem de tanto bater cabeça ouvindo rock triste. Você ainda ouve guitarras com distorção?',
        en: '2004 was basically yesterday, dude. My bones ache from headbanging to sad rock. Do you still blast distorted guitars?',
      },
      choices: [
        { id: 'c1', label: { pt: '🎸 Todo santo dia, rock melancólico na veia', en: '🎸 Every single day, melancholic rock forever' }, success: true },
        { id: 'c2', label: { pt: '👟 All-Star preto riscado de caneta é patrimônio', en: '👟 Beaten black sneakers with marker doodles are eternal' }, success: true },
        { id: 'c3', label: { pt: '📻 Isso é coisa de velho, vira a página', en: '📻 That is old news, move on already' }, success: false },
      ],
      bribeCost: 25,
    },
    aura: {
      id: 'punk_grimoire',
      name: { pt: 'Mochila de Rebeldia', en: 'Rebel Backpack' },
      desc: { pt: 'Concede +1 slot ativo no Grimório', en: 'Grants +1 active familiar slot in the Grimoire' },
      extraGrimoireSlot: 1,
    },
  },
  lorde_apatia: {
    id: 'lorde_apatia',
    tier: 3,
    rarity: 'rare',
    name: { pt: 'Lorde da Apatia', en: 'Lord of Apathy' },
    personality: 'sovereign',
    dialogue: {
      question: {
        pt: 'Mares de drama humano já se afogaram aos meus pés. Por que você tenta me convencer em vez de simplesmente aceitar o inevitável?',
        en: 'Seas of human drama have drowned at my feet. Why do you attempt to bargain instead of accepting the inevitable?',
      },
      choices: [
        { id: 'c1', label: { pt: '👑 Porque o inevitável pode ser compartilhado com elegância', en: '👑 Because the inevitable can be shared with elegance' }, success: true },
        { id: 'c2', label: { pt: '☕ Não tento convencer, apenas trouxe serenidade', en: '☕ I do not bargain, I merely brought serenity' }, success: true },
        { id: 'c3', label: { pt: '🗡️ Renda-se ou eu destruo seu trono de tédio', en: '🗡️ Surrender or I shatter your throne of boredom' }, success: false },
      ],
      bribeCost: 50,
    },
    aura: {
      id: 'lord_wealth',
      name: { pt: 'Soberania da Serenidade', en: 'Sovereignty of Serenity' },
      desc: { pt: '+20% Phantom Coins em todo o jogo', en: '+20% Phantom Coins across the game' },
      bonusCoinsPercent: 20,
    },
  },
  quimera_madrugada: {
    id: 'quimera_madrugada',
    tier: 3,
    rarity: 'rare',
    name: { pt: 'Quimera da Madrugada', en: 'Midnight Chimera' },
    personality: 'mystic',
    dialogue: {
      question: {
        pt: 'Eu me alimento dos pensamentos das 3 da manhã que não te deixam dormir. Qual é a sua insônia favorita?',
        en: 'I feast upon the 3 AM thoughts that keep you wide awake. What is your favorite sleepless contemplation?',
      },
      choices: [
        { id: 'c1', label: { pt: '🌌 O tamanho assustador do universo infinito', en: '🌌 The staggering size of the infinite universe' }, success: true },
        { id: 'c2', label: { pt: '💭 Aquela frase constrangedora que falei anos atrás', en: '💭 That awkward thing I blurted out years ago' }, success: true },
        { id: 'c3', label: { pt: '😴 Eu durmo que nem uma pedra, não tenho insônia', en: '😴 I sleep like a rock, I have no insomnia' }, success: false },
      ],
      bribeCost: 50,
    },
    aura: {
      id: 'chimera_portal',
      name: { pt: 'Passagem Noturna', en: 'Night Passage' },
      desc: { pt: '+15% de chance de portais raros abrirem', en: '+15% chance for rare portals to appear' },
      rarePortalChanceBonus: 0.15,
    },
  },
  cavaleiro_nevoa: {
    id: 'cavaleiro_nevoa',
    tier: 3,
    rarity: 'rare',
    name: { pt: 'Cavaleiro da Névoa Violeta', en: 'Violet Mist Knight' },
    personality: 'protector',
    dialogue: {
      question: {
        pt: 'Minha espada é forjada em lealdade silenciosa. Você jurará proteger os recantos sombrios deste purgatório?',
        en: 'My blade is forged in silent loyalty. Will you swear to protect the shadowy recesses of this sanctuary?',
      },
      choices: [
        { id: 'c1', label: { pt: '🛡️ Juro pela honra da penumbra e das fadas', en: '🛡️ I swear upon the honor of gloom and fairies' }, success: true },
        { id: 'c2', label: { pt: '⚔️ Nossa aliança guardará cada rastro esquecido', en: '⚔️ Our alliance shall guard every forgotten trace' }, success: true },
        { id: 'c3', label: { pt: '🤷 Só vim buscar recompensas fáceis', en: '🤷 I only came for quick loot' }, success: false },
      ],
      bribeCost: 50,
    },
    aura: {
      id: 'knight_shield',
      name: { pt: 'Baluarte Violeta', en: 'Violet Bulwark' },
      desc: { pt: 'Absorve penalidades de armadilhas e recupera energia', en: 'Absorbs trap penalties and recovers energy' },
      trapImmunity: true,
    },
  },
  sucubo_tedio: {
    id: 'sucubo_tedio',
    tier: 3,
    rarity: 'rare',
    name: { pt: 'Súcubo do Tédio', en: 'Boredom Succubus' },
    personality: 'tired_seduction',
    dialogue: {
      question: {
        pt: 'Prometo a você o maior dos prazeres... nunca mais precisar responder uma mensagem no privado ou sair da cama. Aceita meu pacto?',
        en: 'I promise you the greatest pleasure... never needing to reply to a message or leave your bed ever again. Accept my pact?',
      },
      choices: [
        { id: 'c1', label: { pt: '🛌 O sonho de qualquer ser cansado, aceito!', en: '🛌 The dream of every tired soul, I accept!' }, success: true },
        { id: 'c2', label: { pt: '🔕 Modo Não Perturbe ativado para todo o sempre', en: '🔕 Do Not Disturb mode activated forevermore' }, success: true },
        { id: 'c3', label: { pt: '🏃‍♂️ Tenho que correr, muita coisa pra fazer hoje!', en: '🏃‍♂️ Must run, I have way too much to do today!' }, success: false },
      ],
      bribeCost: 50,
    },
    aura: {
      id: 'succubus_archive',
      name: { pt: 'Paz Profunda', en: 'Deep Slumber' },
      desc: { pt: 'Dobra recompensas ao forragear na Biblioteca', en: 'Doubles foraging yields in the Forgotten Archives' },
      archiveDoubler: true,
    },
  },
  fenix_cinzas: {
    id: 'fenix_cinzas',
    tier: 4,
    rarity: 'legendary',
    name: { pt: 'Fênix de Cinzas Frias', en: 'Cold Ash Phoenix' },
    personality: 'glacial_myth',
    dialogue: {
      question: {
        pt: 'Quando a última esperança se desfaz, eu renasço em chamas roxas e frias. Você aceita o renascimento através das cinzas?',
        en: 'When the last sliver of hope shatters, I rise in cold violet flames. Do you accept rebirth through the ashes?',
      },
      choices: [
        { id: 'c1', label: { pt: '❄️ Renascer do frio é a maior das vitórias', en: '❄️ Rebirth from cold is the greatest victory' }, success: true },
        { id: 'c2', label: { pt: '💜 Que as cinzas violeta abracem minha jornada', en: '💜 Let the violet embers embrace my journey' }, success: true },
        { id: 'c3', label: { pt: '🔥 Prefiro fogo quente normal, valeu', en: '🔥 Prefer normal warm fire, thanks' }, success: false },
      ],
      bribeCost: 100,
    },
    aura: {
      id: 'phoenix_energy',
      name: { pt: 'Chama Eterna Glacial', en: 'Eternal Glacial Flame' },
      desc: { pt: 'Recupera 3 energias instantâneas a cada troca de maré', en: 'Recovers 3 instant energy points on each tide change' },
      tideEnergyBonus: 3,
    },
  },
  sombra_ancestral: {
    id: 'sombra_ancestral',
    tier: 4,
    rarity: 'legendary',
    name: { pt: 'Sombra Ancestral da Meia-Noite', en: 'Ancient Midnight Shadow' },
    personality: 'ancient_ruler',
    dialogue: {
      question: {
        pt: 'Eu vi impérios caírem e canções serem esquecidas. Diante da meia-noite eterna, qual é o seu juramento?',
        en: 'I witnessed empires crumble and anthems fade into silence. Before the eternal midnight, what is your pledge?',
      },
      choices: [
        { id: 'c1', label: { pt: '🌌 Lealdade à noite sem fim e à melancolia soberana', en: '🌌 Fealty to the endless night and sovereign melancholy' }, success: true },
        { id: 'c2', label: { pt: '🖤 Carregar a tocha roxa onde quer que eu vá', en: '🖤 To carry the purple torch wherever I roam' }, success: true },
        { id: 'c3', label: { pt: '👑 Me dá seus poderes que eu governo melhor', en: '👑 Hand over your powers, I rule better' }, success: false },
      ],
      bribeCost: 150,
    },
    aura: {
      id: 'ancient_dominion',
      name: { pt: 'Domínio da Meia-Noite', en: 'Midnight Dominion' },
      desc: { pt: '+30% Phantom Coins em todo o jogo e aura roxa permanente', en: '+30% Phantom Coins across game and purple aura' },
      bonusCoinsPercent: 30,
    },
  },
};

// 3. Fórmulas de Fusão (Atlus DemiKids Style)
const FUSION_RECIPES = [
  // Fusão Cruzada para Tier 3
  { a: 'corvo_poeta', b: 'gargula_procrastinador', result: 'quimera_madrugada' },
  { a: 'esqueleto_allstar', b: 'lobisomem_introvertido', result: 'cavaleiro_nevoa' },
  { a: 'fada_desencantada', b: 'banshee_descarregada', result: 'sucubo_tedio' },
  // Fusão Cruzada para Tier 4
  { a: 'cavaleiro_nevoa', b: 'quimera_madrugada', result: 'fenix_cinzas' },
];

// 3.1 Durabilidade e Tempos de Banimento por Tier de Sala (Falha Crítica -2)
const ROOM_BAN_DURATIONS_MS = {
  1: 30 * 60 * 1000, // 30 minutos
  2: 60 * 60 * 1000, // 1 hora
  3: 120 * 60 * 1000, // 2 horas
  4: 180 * 60 * 1000, // 3 horas
  5: 240 * 60 * 1000, // 4 horas
};

// 3.2 Catálogo de Relíquias Místicas (Tiers 1 a 5)
const RELICS = {
  spectral_key: {
    id: 'spectral_key',
    tier: 1,
    name: { pt: 'Chave Espectral', en: 'Spectral Key' },
    desc: { pt: 'Uma chave translúcida que emite um brilho frio.', en: 'A translucent key emitting a cold glow.' },
    cost: 50,
  },
  amuleto_osso: {
    id: 'amuleto_osso',
    tier: 1,
    name: { pt: 'Amuleto de Osso Quebrado', en: 'Cracked Bone Amulet' },
    desc: { pt: 'Um pequeno amuleto rústico entalhado em osso de corvo.', en: 'A small rustic amulet carved from raven bone.' },
    cost: 30,
  },
  pedra_lunar_opaca: {
    id: 'pedra_lunar_opaca',
    tier: 1,
    name: { pt: 'Pedra Lunar Opaca', en: 'Dull Moonstone' },
    desc: { pt: 'Pedra opaca que reflete fracamente a luz violeta.', en: 'An opaque stone faintly reflecting violet light.' },
    cost: 35,
  },
  relogio_quebrado: {
    id: 'relogio_quebrado',
    tier: 2,
    name: { pt: 'Relógio de Bolso Parado', en: 'Frozen Pocketwatch' },
    desc: { pt: 'Os ponteiros congelaram para sempre na hora do crepúsculo.', en: 'The clock hands froze forever at twilight hour.' },
    cost: 75,
  },
  pingente_obsidiana: {
    id: 'pingente_obsidiana',
    tier: 2,
    name: { pt: 'Pingente de Obsidiana', en: 'Obsidian Pendant' },
    desc: { pt: 'Cristal polido com emanações de calma melancólica.', en: 'Polished crystal pulsing with calm melancholy.' },
    cost: 85,
  },
  calice_lagrimas: {
    id: 'calice_lagrimas',
    tier: 3,
    name: { pt: 'Cálice de Lágrimas Roxas', en: 'Chalice of Purple Tears' },
    desc: { pt: 'Taça de prata envelhecida banhada em essência espectral.', en: 'Aged silver chalice washed in spectral essence.' },
    cost: 160,
  },
  orbe_crepusculo: {
    id: 'orbe_crepusculo',
    tier: 3,
    name: { pt: 'Orbe do Crepúsculo', en: 'Twilight Orb' },
    desc: { pt: 'Esfera vítrea contendo névoa viva em rotação hipnótica.', en: 'Glassy sphere encapsulating living rotating mist.' },
    cost: 180,
  },
  coroa_espinhos_sombria: {
    id: 'coroa_espinhos_sombria',
    tier: 4,
    name: { pt: 'Coroa de Espinhos da Meia-Noite', en: 'Midnight Thorn Crown' },
    desc: { pt: 'Diadema forjado com espinhos etéreos e magia proibida.', en: 'Diadem wrought with ethereal thorns and forbidden magic.' },
    cost: 350,
  },
  espelho_almas: {
    id: 'espelho_almas',
    tier: 4,
    name: { pt: 'Espelho das Almas Esquecidas', en: 'Mirror of Forgotten Souls' },
    desc: { pt: 'Reflete sombras do passado com brilho púrpura.', en: 'Reflects shadows of the past with purple radiance.' },
    cost: 400,
  },
  
  lagrima_deusa_touca: { id: 'lagrima_deusa_touca', tier: 5, name: { pt: 'Lágrima Eterna da Fadinha Emo', en: 'Eternal Tear of the Emo Fairy' }, desc: { pt: 'A mais pura cristalização do sentimento cósmico gótico. O ápice do Bosque.', en: 'Pure crystallization of gothic emotion. Apex of the Grove.' }, cost: 800 },
  cravo_negro: { id: 'cravo_negro', tier: 1, name: { pt: 'Cravo Negro', en: 'Black Carnation' }, desc: { pt: 'Uma flor escura encontrada nas sombras.', en: 'A dark flower found in the shadows.' }, cost: 20 },
  pedra_tumular: { id: 'pedra_tumular', tier: 1, name: { pt: 'Fragmento de Lápide', en: 'Tombstone Shard' }, desc: { pt: 'Pedaço quebrado de um túmulo antigo.', en: 'Broken piece of an ancient tomb.' }, cost: 20 },
  lagrima_emo: { id: 'lagrima_emo', tier: 1, name: { pt: 'Lágrima Emo', en: 'Emo Tear' }, desc: { pt: 'Uma gota cristalizada de pura melancolia.', en: 'A crystallized drop of pure melancholy.' }, cost: 25 },
  cogumelo_rochedo: { id: 'cogumelo_rochedo', tier: 1, name: { pt: 'Cogumelo Violeta', en: 'Violet Mushroom' }, desc: { pt: 'Fungo bioluminescente raro.', en: 'Rare bioluminescent fungus.' }, cost: 20 },
  corda_guitarra: { id: 'corda_guitarra', tier: 1, name: { pt: 'Corda Rompida', en: 'Broken Guitar String' }, desc: { pt: 'Um fio de aço que ainda vibra levemente.', en: 'A steel string that still vibrates faintly.' }, cost: 15 },
  lodo_espectral: { id: 'lodo_espectral', tier: 1, name: { pt: 'Lodo Espectral', en: 'Spectral Slime' }, desc: { pt: 'Resíduo ectoplasmático.', en: 'Ectoplasmic residue.' }, cost: 15 },
  cera_roxa: { id: 'cera_roxa', tier: 3, name: { pt: 'Cera Roxa', en: 'Purple Wax' }, desc: { pt: 'Restos de velas derretidas em rituais.', en: 'Melted candle remains from rituals.' }, cost: 150 },
  reliquia_ancestral: { id: 'reliquia_ancestral', tier: 3, name: { pt: 'Relíquia Ancestral', en: 'Ancient Relic' }, desc: { pt: 'Objeto de um passado esquecido.', en: 'Object from a forgotten past.' }, cost: 200 },
  pergaminho_antigo: { id: 'pergaminho_antigo', tier: 3, name: { pt: 'Pergaminho Antigo', en: 'Ancient Scroll' }, desc: { pt: 'Contém escritas místicas e rasgadas.', en: 'Contains torn mystic writings.' }, cost: 180 },
  fragmento_abismo: { id: 'fragmento_abismo', tier: 3, name: { pt: 'Fragmento do Abismo', en: 'Void Shard' }, desc: { pt: 'Pedra de escuridão solidificada.', en: 'Solidified darkness stone.' }, cost: 190 },
  pluma_corvo: { id: 'pluma_corvo', tier: 3, name: { pt: 'Pluma de Corvo', en: 'Raven Feather' }, desc: { pt: 'Pena negra de ave sombria.', en: 'Black feather of a shadowy bird.' }, cost: 140 },
  cristal_purpura: { id: 'cristal_purpura', tier: 4, name: { pt: 'Cristal Púrpura', en: 'Purple Crystal' }, desc: { pt: 'Brilha com energia ancestral.', en: 'Shines with ancestral energy.' }, cost: 350 },
  rosa_vidro: { id: 'rosa_vidro', tier: 4, name: { pt: 'Rosa de Vidro', en: 'Glass Rose' }, desc: { pt: 'Delicada, mas perigosa e cortante.', en: 'Delicate, yet dangerous and sharp.' }, cost: 380 },
  'gota_orvalho_místico': { id: 'gota_orvalho_místico', tier: 4, name: { pt: 'Orvalho Místico', en: 'Mystic Dew' }, desc: { pt: 'Água sagrada das fadas.', en: 'Sacred water of fairies.' }, cost: 400 },
  essencia_sombra: { id: 'essencia_sombra', tier: 5, name: { pt: 'Essência da Sombra', en: 'Shadow Essence' }, desc: { pt: 'A manifestação da escuridão.', en: 'The manifestation of darkness.' }, cost: 800 },
  insignia_touca_preta: { id: 'insignia_touca_preta', tier: 5, name: { pt: 'Insígnia da Touca Preta', en: 'Black Beanie Insignia' }, desc: { pt: 'Prova de coragem no Santuário.', en: 'Proof of courage in the Sanctuary.' }, cost: 900 },

};

const ENGINEER_RECIPES = {
  1: { cost: 25, successRate: 1.0, targetTier: 2 },
  2: { cost: 50, successRate: 1.0, targetTier: 3 },
  3: { cost: 100, successRate: 0.75, targetTier: 4 },
  4: { cost: 200, successRate: 0.50, targetTier: 5 },
};

const ENGINEER_SARCASTIC_QUOTES = {
  pt: [
    'Puff! Virou cinzas roxas. Parabéns, você conseguiu estragar relíquias ancestrais com maestria.',
    'Ops! A solda rúnica colapsou e seus materiais evaporaram no éter. Que desastre fascinante!',
    'Minha bancada agradece o espetáculo pirotécnico... suas relíquias, no entanto, viraram fumaça.',
  ],
  en: [
    'Poof! Turned into purple ashes. Congratulations, you masterfully ruined ancient relics.',
    'Oops! The runic solder collapsed and your materials evaporated into the ether. What a fascinating disaster!',
    'My workbench appreciates the pyrotechnics... your relics, however, are now smoke.',
  ],
};

function isLocationBanned(user, locationId) {
  if (!user) {
    return { banned: false, remainingMs: 0, remainingSec: 0, remainingMinutes: 0 };
  }
  const cooldowns = user.room_cooldowns || user.roomBans;
  if (!cooldowns || !cooldowns[locationId]) {
    return { banned: false, remainingMs: 0, remainingSec: 0, remainingMinutes: 0 };
  }
  const now = Date.now();
  const expiresAt = cooldowns[locationId];
  if (expiresAt > now) {
    const remainingMs = expiresAt - now;
    const remainingSec = Math.ceil(remainingMs / 1000);
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    return { banned: true, remainingMs, remainingSec, remainingMinutes };
  }
  return { banned: false, remainingMs: 0, remainingSec: 0, remainingMinutes: 0 };
}

function checkMapTravelCooldown(user) {
  if (!user) return { canTravel: true, remainingMs: 0, remainingMinutes: 0, hasBuff: false };
  const now = Date.now();

  // Se o usuário possui buff ativo de Sela de Cavalo / Asas, o cooldown é 0
  if (user.mapTravelBuffExpiresAt && user.mapTravelBuffExpiresAt > now) {
    const buffRemainingMs = user.mapTravelBuffExpiresAt - now;
    return {
      canTravel: true,
      remainingMs: 0,
      remainingMinutes: 0,
      hasBuff: true,
      buffRemainingMinutes: Math.ceil(buffRemainingMs / 60000),
    };
  }

  const lastMove = user.lastMapMoveAt || 0;
  const elapsed = now - lastMove;
  if (elapsed < MAP_MOVE_COOLDOWN_MS) {
    const remainingMs = MAP_MOVE_COOLDOWN_MS - elapsed;
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    return {
      canTravel: false,
      remainingMs,
      remainingMinutes,
      hasBuff: false,
    };
  }

  return { canTravel: true, remainingMs: 0, remainingMinutes: 0, hasBuff: false };
}

function banUserFromLocation(userId, locationId) {
  const user = getGloomUser(userId);
  const loc = LOCATIONS[locationId] || LOCATIONS.portao_penumbra;
  const tier = loc.tier || 1;
  const durationMs = ROOM_BAN_DURATIONS_MS[tier] || ROOM_BAN_DURATIONS_MS[1];
  const expiresAt = Date.now() + durationMs;

  user.room_cooldowns = user.room_cooldowns || user.roomBans || {};
  user.room_cooldowns[locationId] = expiresAt;
  user.roomBans = user.room_cooldowns; // compatibilidade retroativa com testes legados

  let ejectedLocation = user.currentLocation;
  if (user.currentLocation === locationId) {
    user.currentLocation = 'portao_penumbra';
    ejectedLocation = 'portao_penumbra';
  }

  updateGloomUser(userId, user);
  return {
    banned: true,
    locationId,
    tier,
    durationMs,
    remainingMinutes: Math.round(durationMs / 60000),
    ejectedLocation,
  };
}

function generateMerchantStock() {
  const allRelics = Object.values(RELICS);
  const getWeight = (r) => {
    if (r.tier === 1) return 50;
    if (r.tier === 2) return 30;
    if (r.tier === 3) return 15;
    if (r.tier === 4) return 4;
    return 1;
  };

  const selected = [];
  const candidates = [...allRelics];

  while (selected.length < 3 && candidates.length > 0) {
    const totalWeight = candidates.reduce((sum, r) => sum + getWeight(r), 0);
    let roll = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < candidates.length; i++) {
      const w = getWeight(candidates[i]);
      if (roll < w) {
        chosenIndex = i;
        break;
      }
      roll -= w;
    }
    selected.push(candidates[chosenIndex]);
    candidates.splice(chosenIndex, 1);
  }
  return selected;
}

function buyMerchantRelic(userId, relicId) {
  const user = getGloomUser(userId);
  const relic = RELICS[relicId];
  if (!relic) return { success: false, reason: 'invalid_relic' };

  if (user.phantomCoins < relic.cost) {
    return { success: false, reason: 'insufficient_coins', cost: relic.cost };
  }

  user.phantomCoins -= relic.cost;
  user.inventory = user.inventory || {};
  user.inventory[relicId] = (user.inventory[relicId] || 0) + 1;

  updateGloomUser(userId, user);
  return {
    success: true,
    relic,
    remainingCoins: user.phantomCoins,
  };
}

function upgradeRelicsWithEngineer(userId, sourceTier, forceRoll = null, lang = 'pt') {
  const user = getGloomUser(userId);
  const recipe = ENGINEER_RECIPES[sourceTier];
  if (!recipe) return { success: false, reason: 'invalid_tier' };

  if (user.phantomCoins < recipe.cost) {
    return { success: false, reason: 'insufficient_coins', cost: recipe.cost };
  }

  user.inventory = user.inventory || {};
  const matchingRelics = Object.entries(user.inventory).filter(([itemId, count]) => {
    return count > 0 && RELICS[itemId] && RELICS[itemId].tier === sourceTier;
  });

  const totalMatching = matchingRelics.reduce((sum, [, count]) => sum + count, 0);
  if (totalMatching < 2) {
    return { success: false, reason: 'insufficient_materials', tier: sourceTier };
  }

  let toRemove = 2;
  const consumed = [];
  for (const [itemId] of matchingRelics) {
    while (user.inventory[itemId] > 0 && toRemove > 0) {
      user.inventory[itemId] -= 1;
      consumed.push(itemId);
      toRemove -= 1;
      if (user.inventory[itemId] <= 0) {
        delete user.inventory[itemId];
      }
    }
    if (toRemove === 0) break;
  }

  user.phantomCoins -= recipe.cost;
  const isSuccess = forceRoll !== null ? forceRoll : Math.random() < recipe.successRate;

  if (!isSuccess) {
    updateGloomUser(userId, user);
    const quotes = ENGINEER_SARCASTIC_QUOTES[lang] || ENGINEER_SARCASTIC_QUOTES.pt;
    const sarcasticQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return {
      success: true,
      upgraded: false,
      destroyed: true,
      cost: recipe.cost,
      sourceTier,
      remainingCoins: user.phantomCoins,
      consumed,
      sarcasticQuote,
    };
  }

  const targetRelics = Object.values(RELICS).filter((r) => r.tier === recipe.targetTier);
  const targetRelic = targetRelics[Math.floor(Math.random() * targetRelics.length)] || targetRelics[0];

  user.inventory[targetRelic.id] = (user.inventory[targetRelic.id] || 0) + 1;
  updateGloomUser(userId, user);

  return {
    success: true,
    upgraded: true,
    destroyed: false,
    cost: recipe.cost,
    sourceTier,
    targetTier: recipe.targetTier,
    targetRelic,
    remainingCoins: user.phantomCoins,
    consumed,
  };
}

let gloomCache = null;

function ensureGloomStorage() {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(gloomFile)) {
    const initial = {
      users: {},
      traces: {}, // guildId -> locationId -> array of traces
      worldBoss: {
        id: 'ancient_behemoth',
        name: { pt: 'A Sombra do Tédio Ancestral', en: 'The Ancient Gloom Behemoth' },
        maxHp: 3000,
        currentHp: 3000,
        level: 1,
        cycleStart: Date.now(),
        participants: {}, // userId -> { count, extraUnlocked, damageDealt }
      },
    };
    fs.writeFileSync(gloomFile, JSON.stringify(initial, null, 2), 'utf8');
  }
}

let gloomMtime = 0;

function readGloomData() {
  ensureGloomStorage();
  try {
    const stat = fs.statSync(gloomFile);
    if (gloomCache && stat.mtimeMs <= gloomMtime) {
      return gloomCache;
    }
    const raw = fs.readFileSync(gloomFile, 'utf8');
    gloomCache = raw ? JSON.parse(raw) : null;
    gloomMtime = stat.mtimeMs;
  } catch (error) {
    try {
      const backup = fs.readFileSync(gloomBackupFile, 'utf8');
      gloomCache = backup ? JSON.parse(backup) : null;
    } catch (e) {
      gloomCache = null;
    }
  }

  if (!gloomCache) {
    gloomCache = { users: {}, traces: {}, worldBoss: { maxHp: 3000, currentHp: 3000, level: 1, cycleStart: Date.now(), participants: {} } };
  }
  return gloomCache;
}

function invalidateGloomCache() {
  gloomCache = null;
  gloomMtime = 0;
}

function writeGloomData(data) {
  ensureGloomStorage();
  const temporaryFile = `${gloomFile}.${process.pid}.${Date.now()}.tmp`;
  const serialized = JSON.stringify(data, null, 2);

  fs.writeFileSync(temporaryFile, serialized, 'utf8');
  try {
    if (fs.existsSync(gloomFile)) {
      fs.copyFileSync(gloomFile, gloomBackupFile);
    }
    fs.renameSync(temporaryFile, gloomFile);
  } catch (error) {
    if (fs.existsSync(temporaryFile)) {
      fs.unlinkSync(temporaryFile);
    }
    throw error;
  }
  gloomCache = data;
  try {
    gloomMtime = fs.statSync(gloomFile).mtimeMs;
  } catch (_) {
    gloomMtime = Date.now();
  }
}

// 4. Grafo de Navegação (Inspirado em graphlib / graph-data-structure)
class GloomGraph {
  constructor() {
    this.nodes = new Map();
  }

  init() {
    for (const [id, loc] of Object.entries(LOCATIONS)) {
      this.nodes.set(id, loc);
    }
  }

  getLocation(id) {
    return this.nodes.get(id) || this.nodes.get('portao_penumbra');
  }

  getAvailableNeighbors(currentLocationId, user, currentTide) {
    const loc = this.getLocation(currentLocationId);
    if (!loc) return [];

    const available = [];
    for (const neighborId of loc.neighbors) {
      const nLoc = this.getLocation(neighborId);
      if (!nLoc) continue;

      // Verificação de Condições
      let canEnter = true;
      let reason = '';

      // Condição de Maré
      if (nLoc.tideCondition && nLoc.tideCondition !== currentTide.id) {
        if (!nLoc.requiresItemAlternative || !user.inventory?.[nLoc.requiresItemAlternative]) {
          canEnter = false;
          reason = 'locked_tide';
        }
      }

      // Condição de Chave de Item
      if (nLoc.requiresItem && (!user.inventory || !user.inventory[nLoc.requiresItem])) {
        canEnter = false;
        reason = 'requires_key';
      }

      // Condição de Mínimo de Locais
      if (nLoc.minLocationsVisited && (user.visitedLocations?.length || 0) < nLoc.minLocationsVisited) {
        canEnter = false;
        reason = 'insufficient_exploration';
      }

      // Condição de Familiar Fada
      if (nLoc.requiresFairyFamiliar) {
        const hasFairy = (user.equippedFamiliars || []).some((fId) => SPIRITS[fId]?.affinity === 'fairy');
        if (!hasFairy && !user.temporaryPortalOpen) {
          canEnter = false;
          reason = 'requires_fairy';
        }
      }

      // Condição Hardcore do Santuário Secreto (Tier 5):
      // 1. Chefão Derrotado no ciclo atual + Participação ativa
      // 2. Grimório com pelo menos 3 espíritos recrutados
      // 3. Carregar pelo menos 1 Relíquia de Tier 4 ou 5
      if (nLoc.requiresHardcoreSanctuary || nLoc.requiresBossParticipation) {
        const boss = readGloomData().worldBoss;
        const bossDefeated = boss?.defeatedInCycle === true || (boss?.currentHp || 0) <= 0;
        const participatedInCycle = (boss?.participants?.[user.userId]?.count || 0) >= 1;
        const grimoireCount = (user.grimoire || []).length;
        const userRelics = user.inventory || {};
        const hasT4OrT5Relic = Object.entries(userRelics).some(
          ([id, count]) => count > 0 && (RELICS[id]?.tier || 1) >= 4
        );

        if (!bossDefeated || !participatedInCycle) {
          canEnter = false;
          reason = 'requires_boss_defeated';
        } else if (grimoireCount < 3) {
          canEnter = false;
          reason = 'requires_grimoire_spirits';
        } else if (!hasT4OrT5Relic) {
          canEnter = false;
          reason = 'requires_t4_relic';
        }
      }

      // Condição de Banimento de Sala (Falha Crítica em Negociação)
      const banInfo = isLocationBanned(user, neighborId);
      if (banInfo.banned) {
        canEnter = false;
        reason = 'banned';
      }

      available.push({
        location: nLoc,
        canEnter,
        reason,
        banRemainingMinutes: banInfo.remainingMinutes,
      });
    }

    return available;
  }
}

const gloomGraph = new GloomGraph();
gloomGraph.init();

// 5. Ciclo de Marés da Penumbra (6 Horas)
function getGloomTide() {
  const tides = [
    {
      id: 'purple_moon',
      name: { pt: 'Lua de Sangue Roxo', en: 'Purple Blood Moon' },
      desc: { pt: 'As Catacumbas Roxas estão abertas e espíritos raros vagam pelo reino.', en: 'The Purple Catacombs are unsealed and rare spirits roam freely.' },
      color: '#a855f7',
    },
    {
      id: 'acid_fog',
      name: { pt: 'Nevoeiro Ácido', en: 'Acid Fog' },
      desc: { pt: 'Relíquias raras têm chance dobrada, mas cuidado com as armadilhas sombrias.', en: 'Rare relics have doubled drop rates, but beware of lurking gloom traps.' },
      color: '#10b981',
    },
    {
      id: 'silent_wind',
      name: { pt: 'Vento Silencioso', en: 'Silent Wind' },
      desc: { pt: 'Brumas tranquilas concedem o dobro de Phantom Coins ao forragear.', en: 'Serene mists yield double Phantom Coins while foraging.' },
      color: '#38bdf8',
    },
    {
      id: 'emo_moon',
      name: { pt: 'Lua da Melancolia Emo', en: 'Melancholic Emo Moon' },
      desc: { pt: 'Espíritos estão mais empáticos; negociações exigem menos tributos.', en: 'Spirits are deeply empathetic; negotiations require fewer tributes.' },
      color: '#e879f9',
    },
  ];

  const now = Date.now();
  const index = Math.floor(now / TIDE_CYCLE_MS) % tides.length;
  const current = tides[index];
  const nextChangeMs = TIDE_CYCLE_MS - (now % TIDE_CYCLE_MS);

  return { ...current, nextChangeMs };
}

// 6. Gerenciamento de Usuário & Energia
function getGloomUser(userId) {
  const data = readGloomData();
  const now = Date.now();

  if (!data.users[userId]) {
    data.users[userId] = {
      userId,
      currentLocation: 'portao_penumbra',
      phantomCoins: 50,
      energy: MAX_ENERGY,
      lastEnergyUpdate: now,
      grimoire: [], // Array of spirit IDs
      equippedFamiliars: [], // Max 2 spirit IDs
      inventory: {
        cravo_negro: 2,
        lagrima_emo: 1,
      },
      roomBans: {}, // locationId -> expiresAt timestamp
      visitedLocations: ['portao_penumbra'],
      totalForaged: 0,
      negotiationsWon: 0,
      bossPacifiedInCycle: false,
    };
    writeGloomData(data);
  }

  const user = data.users[userId];
  user.roomBans = user.roomBans || {};

  // Recarga de Energia a cada 6 minutos
  if (user.energy < MAX_ENERGY) {
    const elapsed = now - (user.lastEnergyUpdate || now);
    const recovered = Math.floor(elapsed / ENERGY_REGEN_MS);
    if (recovered > 0) {
      user.energy = Math.min(MAX_ENERGY, user.energy + recovered);
      user.lastEnergyUpdate = now - (elapsed % ENERGY_REGEN_MS);
      writeGloomData(data);
    }
  }

  return user;
}

function updateGloomUser(userId, changes) {
  const data = readGloomData();
  const current = getGloomUser(userId);

  data.users[userId] = {
    ...current,
    ...changes,
  };

  writeGloomData(data);
  return data.users[userId];
}

// 7. Vasculhar / Forrageamento nos Cenários
function forage(userId, locationId) {
  const user = getGloomUser(userId);
  const location = LOCATIONS[locationId] || LOCATIONS.portao_penumbra;
  const tide = getGloomTide();

  // 1. Verificar se a sala atual possui banimento temporário por falha crítica
  const banInfo = isLocationBanned(user, location.id);
  if (banInfo.banned) {
    return {
      success: false,
      reason: 'room_banned',
      banRemainingMinutes: banInfo.remainingMinutes,
    };
  }

  if (user.energy <= 0) {
    const nextRegenSec = Math.ceil((ENERGY_REGEN_MS - (Date.now() - (user.lastEnergyUpdate || Date.now()))) / 1000);
    return {
      success: false,
      reason: 'no_energy',
      timeRemainingSec: Math.max(1, nextRegenSec),
    };
  }

  // Verificar passiva de economia de energia
  const saveEnergy = (user.equippedFamiliars || []).some((fId) => {
    return SPIRITS[fId]?.aura?.energySaveChance && Math.random() < SPIRITS[fId].aura.energySaveChance;
  });

  const nextEnergy = saveEnergy ? user.energy : user.energy - 1;

  // 2. Chance de Evento Raro de Exploração (configurado via explorationEvents.json)
  let rareEvent = null;
  const rollRare = Math.random() * 100;
  let accumulated = 0;

  const horseChance = EXPLORATION_EVENTS_CONFIG?.forage_event_weights?.wild_horse_saddle?.chance_percentage ?? 3.0;
  accumulated += horseChance;

  if (rollRare < accumulated) {
    const { addItem } = require('./inventory');
    addItem(userId, 'sela_cavalo', 1);
    rareEvent = {
      type: 'wild_horse_saddle',
      item: 'sela_cavalo',
      message: EXPLORATION_EVENTS_CONFIG?.forage_event_weights?.wild_horse_saddle?.description,
    };
  } else {
    const merchantChance = EXPLORATION_EVENTS_CONFIG?.forage_event_weights?.relic_merchant?.chance_percentage ?? 7.0;
    accumulated += merchantChance;
    if (rollRare < accumulated) {
      rareEvent = {
        type: 'relic_merchant',
        stock: generateMerchantStock(),
      };
    } else {
      const engineerChance = EXPLORATION_EVENTS_CONFIG?.forage_event_weights?.relic_engineer?.chance_percentage ?? 7.0;
      accumulated += engineerChance;
      if (rollRare < accumulated) {
        rareEvent = {
          type: 'relic_engineer',
        };
      }
    }
  }

  // Cálculo de Loot
  let totalWeight = location.loot.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected = location.loot[0];

  for (const item of location.loot) {
    if (roll < item.weight) {
      selected = item;
      break;
    }
    roll -= item.weight;
  }

  let rewardCoins = 0;
  let rewardItem = null;

  if (selected.item === 'phantomCoins') {
    let coins = Math.floor(Math.random() * (selected.max - selected.min + 1)) + selected.min;
    if (tide.id === 'silent_wind') coins *= 2;

    // Bônus de auras equipadas
    let coinBonusPercent = 0;
    for (const fId of user.equippedFamiliars || []) {
      if (SPIRITS[fId]?.aura?.bonusCoinsPercent) {
        coinBonusPercent += SPIRITS[fId].aura.bonusCoinsPercent;
      }
    }
    if (coinBonusPercent > 0) {
      coins = Math.round(coins * (1 + coinBonusPercent / 100));
    }

    rewardCoins = coins;
    user.phantomCoins += rewardCoins;
  } else {
    rewardItem = selected;
    user.inventory = user.inventory || {};
    user.inventory[selected.item] = (user.inventory[selected.item] || 0) + 1;
  }

  user.energy = nextEnergy;
  user.totalForaged = (user.totalForaged || 0) + 1;

  // Chance de encontro com espírito (35% de chance)
  let encounteredSpirit = null;
  let encounteredEncounter = null;
  if (!rareEvent && Math.random() < 0.35 && location.spirits?.length) {
    const spiritId = location.spirits[Math.floor(Math.random() * location.spirits.length)];
    encounteredSpirit = SPIRITS[spiritId];
    encounteredEncounter = getEncounterForSpirit(spiritId) || getRandomEncounter(location.tier || 1);
  }

  // Chance de abrir portal para Jardim de Vidro
  let openedRarePortal = false;
  if (locationId === 'ponte_abismo' && Math.random() < 0.15) {
    openedRarePortal = true;
    user.temporaryPortalOpen = true;
  }

  updateGloomUser(userId, user);

  return {
    success: true,
    energyRemaining: user.energy,
    savedEnergy: saveEnergy,
    rewardCoins,
    rewardItem,
    encounteredSpirit,
    encounteredEncounter,
    openedRarePortal,
    rareEvent,
    phantomCoins: user.phantomCoins,
  };
}

// 8. Negociação de Espírito (Atlus SMT V3 Hardcore Engine)
function negotiateSpirit(
  userId,
  spiritId,
  choiceId,
  usedBribe = false,
  encounterId = null,
  phase = 1,
  currentScore = 0,
  neutralsCount = 0,
  isBailout = false
) {
  const user = getGloomUser(userId);
  const spirit = spiritId ? SPIRITS[spiritId] || null : null;
  const encounter = encounterId ? getEncounterById(encounterId) : (spiritId ? getEncounterForSpirit(spiritId) : null);
  const tide = getGloomTide();

  if (!spirit && !encounter) return { success: false, reason: 'invalid_spirit' };

  const tier = encounter?.tier || spirit?.tier || 1;
  const rules = TIER_NEGOTIATION_RULES[tier] || TIER_NEGOTIATION_RULES[1];
  const temperament = encounter?.temperament || (spirit?.personality ? PERSONALITY_TO_TEMPERAMENT[spirit.personality] : null) || 'caotico';

  // Suborno / Tributo direto / Resgate Extorsivo
  if (usedBribe || isBailout) {
    let cost = rules.baseBribe;
    if (isBailout) {
      cost = rules.baseBribe * 3;
    } else if (encounter?.extortion_phase?.amount_or_item && typeof encounter.extortion_phase.amount_or_item === 'number') {
      cost = Math.max(encounter.extortion_phase.amount_or_item, rules.baseBribe);
    } else if (spirit?.dialogue?.bribeCost) {
      cost = Math.max(spirit.dialogue.bribeCost, rules.baseBribe);
    }

    if (tide.id === 'emo_moon') cost = Math.round(cost * 0.75);

    // Verificação de Vigor (Tier 4 exige 3, Tier 5 drena 100%)
    if (tier === 4 && !isBailout) {
      if ((user.energy || 0) < 3) {
        return { success: false, reason: 'insufficient_energy', requiredEnergy: 3, cost };
      }
    }

    // Verificação de Relíquia (Tier 5: exige relic T4 ou T5)
    let consumedRelic = null;
    if (tier === 5 && !isBailout) {
      user.inventory = user.inventory || {};
      const relicT4orT5 = Object.keys(user.inventory).find(
        (rId) => (user.inventory[rId] > 0) && (RELICS[rId]?.tier === 4 || RELICS[rId]?.tier === 5)
      );
      if (!relicT4orT5) {
        return { success: false, reason: 'missing_relic_t4_t5', cost };
      }
      consumedRelic = relicT4orT5;
    }

    // Verificação de Phantom Coins
    if (user.phantomCoins < cost) {
      return { success: false, reason: 'insufficient_coins', cost };
    }

    // Debitar recursos
    user.phantomCoins -= cost;
    if (tier === 4 && !isBailout) {
      user.energy = Math.max(0, (user.energy || 0) - 3);
    } else if (tier === 5 && !isBailout) {
      user.energy = 0;
      if (consumedRelic) {
        user.inventory[consumedRelic]--;
      }
    }

    if (spiritId && SPIRITS[spiritId]) {
      if (!user.grimoire.includes(spiritId)) {
        user.grimoire.push(spiritId);
      }
    }
    user.negotiationsWon = (user.negotiationsWon || 0) + 1;
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: true,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      cost,
      remainingCoins: user.phantomCoins,
      consumedEnergy: tier === 4 && !isBailout ? 3 : (tier === 5 && !isBailout ? 'all' : 0),
      consumedRelic,
      method: isBailout ? 'bailout' : 'bribe',
    };
  }

  // Escolha de Diálogo (Encounter ou Spirit)
  let choice = null;
  if (encounter && Array.isArray(encounter.phases) && encounter.phases[phase - 1]) {
    const currentPhaseObj = encounter.phases[phase - 1];
    if (Array.isArray(currentPhaseObj.options)) {
      choice = currentPhaseObj.options.find((o) => o.id === choiceId);
    }
  }
  if (!choice && encounter && Array.isArray(encounter.options)) {
    choice = encounter.options.find((o) => o.id === choiceId);
  }
  if (!choice && spirit?.dialogue?.choices) {
    choice = spirit.dialogue.choices.find((c) => c.id === choiceId);
  }
  if (!choice) return { success: false, reason: 'invalid_choice' };

  // 1. Cálculo da Afinidade Psicológica (Matriz SMT)
  const tone = choice.tone || 'rational';
  let matrixScore = 0;
  if (PSYCHOLOGY_MATRIX[temperament] && PSYCHOLOGY_MATRIX[temperament][tone] !== undefined) {
    matrixScore = PSYCHOLOGY_MATRIX[temperament][tone];
  } else {
    matrixScore = typeof choice.success_chance_modifier === 'number'
      ? choice.success_chance_modifier
      : (choice.score ?? (choice.success ? 1 : -1));
  }

  // 2. Taxa de Desacato por Bajulação (submissive ou flattery contra orgulhoso ou sadico)
  let theftCoins = 0;
  const isSycophancy = (tone === 'submissive' || tone === 'flattery') && (temperament === 'orgulhoso' || temperament === 'sadico');
  if (isSycophancy) {
    matrixScore = -2;
    theftCoins = Math.min(user.phantomCoins, Math.floor(Math.random() * 201) + 100);
    user.phantomCoins -= theftCoins;
  }

  // 3. Decaimento por Hesitação (Tier >= 3): 2 respostas neutras = -2 automático
  let newNeutrals = neutralsCount;
  let hesitationDecay = false;
  if (matrixScore === 0) {
    newNeutrals += 1;
    if (tier >= 3 && newNeutrals >= 2) {
      matrixScore = -2;
      hesitationDecay = true;
    }
  }

  // 4. Modificadores por Tier & Maré
  if (tier === 5 && matrixScore > 1) {
    matrixScore = 1; // No Tier 5, respostas perfeitas dão máx +1
  }
  if (tier === 1 && matrixScore === -2 && !choice.criticalFailure && !isSycophancy && choice.score !== -2) {
    matrixScore = -1; // Tier 1 é tolerante
  }
  if (tide.id === 'purple_moon' && tone === 'chaotic') matrixScore += 1;
  if (tide.id === 'blood_mist' && tone === 'arrogant') matrixScore += 1;
  if (tide.id === 'emo_moon' && (tone === 'empathetic' || tone === 'rational')) matrixScore += 1;
  if (tide.id === 'eclipse') matrixScore -= 1;

  // 5. Avaliação de Falha Crítica
  const isCritical = matrixScore <= -2 || choice.criticalFailure === true || choice.score === -2;

  if (isCritical) {
    // Multa de Ejeção: 10% do saldo total de Phantom Coins
    const ejectionFine = Math.floor(user.phantomCoins * 0.10);
    user.phantomCoins = Math.max(0, user.phantomCoins - ejectionFine);

    const banDetails = banUserFromLocation(userId, user.currentLocation);
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: false,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      escaped: true,
      criticalFailure: true,
      roomBanned: true,
      bannedLocation: banDetails?.locationId || user.currentLocation,
      banDurationMinutes: banDetails?.remainingMinutes || 30,
      ejectedTo: banDetails?.ejectedLocation || 'portao_penumbra',
      choice,
      theftCoins,
      ejectionFine,
      hesitationDecay,
      isSycophancy,
      matrixScore,
    };
  }

  // Somar à pontuação acumulada
  const totalRounds = encounterId ? rules.rounds : 1;
  const targetScore = encounterId ? rules.targetScore : 1;
  const newScore = currentScore + matrixScore;

  // Se a pontuação acumulada despencar para <= -2, vira falha crítica imediata
  if (newScore <= -2) {
    const ejectionFine = Math.floor(user.phantomCoins * 0.10);
    user.phantomCoins = Math.max(0, user.phantomCoins - ejectionFine);
    const banDetails = banUserFromLocation(userId, user.currentLocation);
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: false,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      escaped: true,
      criticalFailure: true,
      roomBanned: true,
      bannedLocation: banDetails?.locationId || user.currentLocation,
      banDurationMinutes: banDetails?.remainingMinutes || 30,
      ejectedTo: banDetails?.ejectedLocation || 'portao_penumbra',
      choice,
      theftCoins,
      ejectionFine,
      matrixScore,
      finalScore: newScore,
    };
  }

  // Rodada intermediária (ainda restam fases)
  if (phase < totalRounds) {
    updateGloomUser(userId, user);
    return {
      success: true,
      recruited: false,
      inProgress: true,
      nextPhase: phase + 1,
      currentPhase: phase,
      totalRounds,
      currentScore: newScore,
      targetScore,
      neutralsCount: newNeutrals,
      choice,
      matrixScore,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
    };
  }

  // Rodada final concluída
  if (newScore >= targetScore || choice.success === true) {
    let coinsReward = Math.floor(Math.random() * 25) + 15;
    user.phantomCoins += coinsReward;
    if (spiritId && SPIRITS[spiritId] && !user.grimoire.includes(spiritId)) {
      user.grimoire.push(spiritId);
    }
    user.negotiationsWon = (user.negotiationsWon || 0) + 1;
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: true,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      rewardCoins: coinsReward,
      remainingCoins: user.phantomCoins,
      method: 'wit',
      choice,
      finalScore: newScore,
      targetScore,
      matrixScore,
    };
  } else if (newScore === targetScore - 1) {
    // Bateu na trave: Suborno de Resgate Extorsivo (3x o pedágio base)
    const bailoutCost = rules.baseBribe * 3;
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: false,
      canBailout: true,
      bailoutCost,
      finalScore: newScore,
      targetScore,
      choice,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      matrixScore,
    };
  } else {
    // Negociação Falhou Comum (Sem ban, espírito recua com desdém)
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: false,
      escaped: true,
      criticalFailure: false,
      roomBanned: false,
      choice,
      finalScore: newScore,
      targetScore,
      spirit: spirit || { id: encounter.id, name: encounter.creature_concept },
      encounter,
      matrixScore,
    };
  }
}

// 9. Caldeirão de Fusão de Almas (Soul Fusion)
function fuseSpirits(userId, spiritAId, spiritBId) {
  const user = getGloomUser(userId);

  if (!user.grimoire.includes(spiritAId) || !user.grimoire.includes(spiritBId)) {
    return { success: false, reason: 'spirit_not_owned' };
  }

  const fusionCost = 30;
  if (user.phantomCoins < fusionCost) {
    return { success: false, reason: 'insufficient_coins', cost: fusionCost };
  }

  let resultSpiritId = null;

  // 1. Fusão Pura (Dois do mesmo)
  if (spiritAId === spiritBId) {
    if (spiritAId === 'espectro_baixo_astral') resultSpiritId = 'lorde_apatia';
    else if (spiritAId === 'morcego_shoegaze') resultSpiritId = 'cavaleiro_nevoa';
    else if (spiritAId === 'fada_desencantada') resultSpiritId = 'sucubo_tedio';
    else resultSpiritId = 'quimera_madrugada';
  } else {
    // 2. Fusão Cruzada (Receitas pré-definidas)
    const match = FUSION_RECIPES.find(
      (r) => (r.a === spiritAId && r.b === spiritBId) || (r.a === spiritBId && r.b === spiritAId)
    );

    if (match) {
      resultSpiritId = match.result;
    } else {
      // Fusão padrão de afinidade
      resultSpiritId = 'quimera_madrugada';
    }
  }

  const resultSpirit = SPIRITS[resultSpiritId] || SPIRITS.quimera_madrugada;

  user.phantomCoins -= fusionCost;
  // Desequipar se necessário
  user.equippedFamiliars = user.equippedFamiliars.filter((id) => id !== spiritAId && id !== spiritBId);

  // Remover ingredientes (se for puro, remove 1 cópia visual)
  if (spiritAId !== spiritBId) {
    user.grimoire = user.grimoire.filter((id) => id !== spiritAId && id !== spiritBId);
  } else {
    user.grimoire = user.grimoire.filter((id) => id !== spiritAId);
  }

  if (!user.grimoire.includes(resultSpirit.id)) {
    user.grimoire.push(resultSpirit.id);
  }

  updateGloomUser(userId, user);

  return {
    success: true,
    resultSpirit,
    remainingCoins: user.phantomCoins,
  };
}

// 10. Equipar Familiar no Grimório
function equipFamiliar(userId, spiritId) {
  const user = getGloomUser(userId);
  if (!user.grimoire.includes(spiritId)) {
    return { success: false, reason: 'not_owned' };
  }

  user.equippedFamiliars = user.equippedFamiliars || [];

  if (user.equippedFamiliars.includes(spiritId)) {
    user.equippedFamiliars = user.equippedFamiliars.filter((id) => id !== spiritId);
    updateGloomUser(userId, user);
    return { success: true, action: 'unequipped', spirit: SPIRITS[spiritId] };
  }

  let maxSlots = 2;
  for (const fId of user.equippedFamiliars) {
    if (SPIRITS[fId]?.aura?.extraGrimoireSlot) maxSlots += SPIRITS[fId].aura.extraGrimoireSlot;
  }

  if (user.equippedFamiliars.length >= maxSlots) {
    user.equippedFamiliars.shift(); // Remove o mais antigo
  }

  user.equippedFamiliars.push(spiritId);
  updateGloomUser(userId, user);
  return { success: true, action: 'equipped', spirit: SPIRITS[spiritId] };
}

// 11. Rastros de Giz Roxo Sociais (Assíncronos com Custo de Moedinhas)
function leaveTrace(guildId, locationId, userId, authorName, messageText, offeringCoins = 0) {
  const user = getGloomUser(userId);
  let cost = TRACE_BASE_COST;

  // Redução de custo por banshee
  const discount = (user.equippedFamiliars || []).some((fId) => SPIRITS[fId]?.aura?.traceDiscountPercent);
  if (discount) cost = Math.round(cost * 0.8);

  const totalCost = cost + Math.max(0, Math.floor(Number(offeringCoins) || 0));

  if (user.phantomCoins < totalCost) {
    return { success: false, reason: 'insufficient_coins', cost: totalCost };
  }

  const data = readGloomData();
  data.traces = data.traces || {};
  data.traces[guildId] = data.traces[guildId] || {};
  data.traces[guildId][locationId] = data.traces[guildId][locationId] || [];

  const trace = {
    id: `trace_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    authorName,
    message: String(messageText).slice(0, 150),
    offering: Math.max(0, Math.floor(Number(offeringCoins) || 0)),
    timestamp: Date.now(),
  };

  data.traces[guildId][locationId].unshift(trace);
  if (data.traces[guildId][locationId].length > 5) {
    data.traces[guildId][locationId] = data.traces[guildId][locationId].slice(0, 5);
  }

  user.phantomCoins -= totalCost;
  writeGloomData(data);
  updateGloomUser(userId, user);

  return {
    success: true,
    cost: totalCost,
    trace,
    remainingCoins: user.phantomCoins,
  };
}

function getTraces(guildId, locationId) {
  const data = readGloomData();
  return data.traces?.[guildId]?.[locationId] || [];
}

// 12. Chefão Comunitário (World Bounty) com Bônus Patrocinado de 10s
function checkAndResetBossCycle(data) {
  const boss = data.worldBoss;
  if (!boss) return false;
  const now = Date.now();
  if (!boss.cycleStart || now - boss.cycleStart >= TIDE_CYCLE_MS) {
    boss.cycleStart = now;
    boss.participants = {};
    boss.defeatedInCycle = false;
    boss.currentHp = boss.maxHp || 3000;
    return true;
  }
  return false;
}

function getBossStatus() {
  const data = readGloomData();
  if (checkAndResetBossCycle(data)) {
    writeGloomData(data);
  }
  return data.worldBoss;
}

function attackBoss(userId, method = 'familiar', lang = 'pt') {
  const data = readGloomData();
  checkAndResetBossCycle(data);
  const boss = data.worldBoss;
  const user = getGloomUser(userId);

  if (boss.defeatedInCycle) {
    return {
      success: false,
      reason: 'already_defeated',
      boss,
    };
  }

  boss.participants = boss.participants || {};
  const participant = boss.participants[userId] || { count: 0, extraUnlocked: false, damageDealt: 0 };

  if (participant.count >= 1 && !participant.extraUnlocked) {
    const session = createBonusSession(userId, 'gloom_boss', {}, lang);
    return {
      success: false,
      reason: 'cooldown_web_bonus',
      bonusUrl: session.url,
      boss,
    };
  }

  const baseDamage = Math.floor(Math.random() * 50) + 50; // 50 a 100 de dano
  const damage = baseDamage;

  boss.currentHp = Math.max(0, boss.currentHp - damage);
  participant.count += 1;
  participant.damageDealt += damage;
  participant.extraUnlocked = false; // Consome o bônus
  boss.participants[userId] = participant;

  user.phantomCoins += 35;
  user.bossPacifiedInCycle = true;

  let defeated = false;
  if (boss.currentHp <= 0) {
    defeated = true;
    boss.defeatedInCycle = true;
    boss.currentHp = 0;
    boss.level = (boss.level || 1) + 1;
    boss.maxHp = 3000 + boss.level * 500;
  }

  writeGloomData(data);
  updateGloomUser(userId, user);

  return {
    success: true,
    damage,
    currentHp: boss.currentHp,
    maxHp: boss.maxHp,
    rewardCoins: 35,
    defeated,
    remainingCoins: user.phantomCoins,
  };
}

function unlockBossExtraAttack(userId) {
  const data = readGloomData();
  checkAndResetBossCycle(data);
  const boss = data.worldBoss;
  boss.participants = boss.participants || {};
  const participant = boss.participants[userId] || { count: 0, extraUnlocked: false, damageDealt: 0 };
  participant.extraUnlocked = true;
  boss.participants[userId] = participant;

  data.users = data.users || {};
  if (!data.users[userId]) {
    getGloomUser(userId);
  }
  const user = data.users[userId];
  if (user) {
    user.phantomCoins = (user.phantomCoins || 0) + 50;
  }

  writeGloomData(data);
  return { success: true, phantomCoins: user ? user.phantomCoins : 50 };
}

function sellRelic(userId, relicId, count = 1) {
  const user = getGloomUser(userId);
  const userRelics = user.inventory || {};
  const available = userRelics[relicId] || 0;
  if (available < count) {
    return { success: false, reason: 'insufficient_relics' };
  }
  const def = RELICS[relicId];
  const sellPrice = Math.max(5, Math.floor((def?.cost || 20) * 0.5));
  const totalCoins = sellPrice * count;

  userRelics[relicId] -= count;
  if (userRelics[relicId] <= 0) {
    delete userRelics[relicId];
  }
  user.inventory = userRelics;
  user.phantomCoins = (user.phantomCoins || 0) + totalCoins;

  updateGloomUser(userId, user);
  return { success: true, relic: def, totalCoins, sellPrice, remaining: userRelics[relicId] || 0 };
}

module.exports = {
  LOCATIONS,
  SPIRITS,
  FUSION_RECIPES,
  RELICS,
  ENGINEER_RECIPES,
  ROOM_BAN_DURATIONS_MS,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  updateGloomUser,
  forage,
  scavengeLocation: forage,
  scavenge: forage,
  isLocationBanned,
  banUserFromLocation,
  checkMapTravelCooldown,
  MAP_MOVE_COOLDOWN_MS,
  generateMerchantStock,
  buyMerchantRelic,
  sellRelic,
  upgradeRelicsWithEngineer,
  negotiateSpirit,
  fuseSpirits,
  equipFamiliar,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
  unlockBossExtraAttack,
  invalidateGloomCache,
  getEncounters,
  getEncounterById,
  getEncounterForSpirit,
  getRandomEncounter,
  PSYCHOLOGY_MATRIX,
  PERSONALITY_TO_TEMPERAMENT,
  TIER_NEGOTIATION_RULES,
};


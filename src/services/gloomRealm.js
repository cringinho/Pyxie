const fs = require('node:fs');
const path = require('node:path');
const { createBonusSession, verifyBonusSession } = require('./bonusTimer');

const gloomFile = path.join(__dirname, '..', '..', 'data', 'gloom.json');
const gloomBackupFile = `${gloomFile}.bak`;

const MAX_ENERGY = 10;
const ENERGY_REGEN_MS = 6 * 60 * 1000; // 1 energia a cada 6 minutos (10 por hora)
const TRACE_BASE_COST = 15;
const TIDE_CYCLE_MS = 6 * 60 * 60 * 1000; // 6 horas

// 1. Definição dos 10 Cenários do Reino da Penumbra
const LOCATIONS = {
  portao_penumbra: {
    id: 'portao_penumbra',
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
    rarity: 'legendary',
    name: { pt: 'Santuário Secreto de Pyxie', en: 'Pyxie\'s Obsidian Haven' },
    desc: {
      pt: 'O trono de obsidiana da Fadinha Emo. Caldeirão místico de fusão borbulha fumaça violeta enquanto velas negras queimam.',
      en: 'The obsidian throne of the Emo Fairy. A mystic fusion cauldron bubbles purple vapors while black candles burn.',
    },
    image: 'santuario_touca_preta.png',
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

// 2. Roster de 14 Espíritos / Sombras com Personalidade e Diálogos Atlus/DemiKids
const SPIRITS = {
  espectro_baixo_astral: {
    id: 'espectro_baixo_astral',
    tier: 1,
    rarity: 'common',
    name: { pt: 'Espectro do Baixo Astral', en: 'Low Astral Wraith' },
    personality: 'melancholic',
    dialogue: {
      question: {
        pt: 'A existência é um fardo pesado... Você também sente que nada tem sentido ou só está entediado?',
        en: 'Existence is a heavy burden... Do you also feel everything is meaningless or are you just bored?',
      },
      choices: [
        { id: 'c1', label: { pt: '🖤 O vazio cósmico dói, mas me acostumei', en: '🖤 The cosmic void aches, but I got used to it' }, success: true },
        { id: 'c2', label: { pt: '🎧 Prefiro colocar um som e esquecer', en: '🎧 I rather put headphones on and forget' }, success: true },
        { id: 'c3', label: { pt: '💀 Para de drama e passa suas moedas', en: '💀 Stop the drama and hand over coins' }, success: false },
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
    dialogue: {
      question: {
        pt: 'Eu poderia te atacar agora... mas fingir que sou pedra é tão mais confortável. O que você acha de não fazermos nada hoje?',
        en: 'I could attack you right now... but pretending to be stone is so much easier. What if we just do nothing today?',
      },
      choices: [
        { id: 'c1', label: { pt: '🪨 Apoio totalmente, deitar e procrastinar', en: '🪨 Fully support that, lay down and procrastinate' }, success: true },
        { id: 'c2', label: { pt: '☕ Uma pausa rápida antes de continuar', en: '☕ Just a quick break before continuing' }, success: true },
        { id: 'c3', label: { pt: '⚡ Levanta daí e vai trabalhar!', en: '⚡ Get up from there and do some work!' }, success: false },
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

function readGloomData() {
  ensureGloomStorage();
  if (gloomCache) return gloomCache;

  try {
    const raw = fs.readFileSync(gloomFile, 'utf8');
    gloomCache = raw ? JSON.parse(raw) : null;
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

      // Condição de Altar do Santuário
      if (nLoc.requiresBossParticipation && !user.bossPacifiedInCycle) {
        canEnter = false;
        reason = 'requires_boss';
      }

      available.push({
        location: nLoc,
        canEnter,
        reason,
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
      visitedLocations: ['portao_penumbra'],
      totalForaged: 0,
      negotiationsWon: 0,
      bossPacifiedInCycle: false,
    };
    writeGloomData(data);
  }

  const user = data.users[userId];

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

// 7. Forrageamento nos Cenários
function forage(userId, locationId) {
  const user = getGloomUser(userId);
  const location = LOCATIONS[locationId] || LOCATIONS.portao_penumbra;
  const tide = getGloomTide();

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
  if (Math.random() < 0.35 && location.spirits?.length) {
    const spiritId = location.spirits[Math.floor(Math.random() * location.spirits.length)];
    encounteredSpirit = SPIRITS[spiritId];
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
    openedRarePortal,
    phantomCoins: user.phantomCoins,
  };
}

// 8. Negociação de Espírito (Atlus DemiKids)
function negotiateSpirit(userId, spiritId, choiceId, usedBribe = false) {
  const user = getGloomUser(userId);
  const spirit = SPIRITS[spiritId];
  const tide = getGloomTide();

  if (!spirit) return { success: false, reason: 'invalid_spirit' };

  // Suborno direto
  if (usedBribe) {
    let cost = spirit.dialogue.bribeCost;
    if (tide.id === 'emo_moon') cost = Math.round(cost * 0.75);

    if (user.phantomCoins < cost) {
      return { success: false, reason: 'insufficient_coins', cost };
    }

    user.phantomCoins -= cost;
    if (!user.grimoire.includes(spiritId)) {
      user.grimoire.push(spiritId);
    }
    user.negotiationsWon = (user.negotiationsWon || 0) + 1;
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: true,
      spirit,
      remainingCoins: user.phantomCoins,
      method: 'bribe',
    };
  }

  // Escolha de Diálogo
  const choice = spirit.dialogue.choices.find((c) => c.id === choiceId);
  if (!choice) return { success: false, reason: 'invalid_choice' };

  if (choice.success) {
    let coinsReward = Math.floor(Math.random() * 20) + 15;
    user.phantomCoins += coinsReward;
    if (!user.grimoire.includes(spiritId)) {
      user.grimoire.push(spiritId);
    }
    user.negotiationsWon = (user.negotiationsWon || 0) + 1;
    updateGloomUser(userId, user);

    return {
      success: true,
      recruited: true,
      spirit,
      rewardCoins: coinsReward,
      remainingCoins: user.phantomCoins,
      method: 'wit',
    };
  } else {
    return {
      success: true,
      recruited: false,
      spirit,
      escaped: true,
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
function getBossStatus() {
  const data = readGloomData();
  return data.worldBoss;
}

function attackBoss(userId, method = 'familiar', lang = 'pt') {
  const data = readGloomData();
  const boss = data.worldBoss;
  const user = getGloomUser(userId);

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
    boss.level += 1;
    boss.maxHp = 3000 + boss.level * 500;
    boss.currentHp = boss.maxHp;
    boss.participants = {}; // Reset de ciclo
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
  const boss = data.worldBoss;
  boss.participants = boss.participants || {};
  const participant = boss.participants[userId] || { count: 0, extraUnlocked: false, damageDealt: 0 };
  participant.extraUnlocked = true;
  boss.participants[userId] = participant;

  const user = getGloomUser(userId);
  user.phantomCoins += 50; // Brinde por ver o anúncio

  writeGloomData(data);
  updateGloomUser(userId, user);

  return { success: true, phantomCoins: user.phantomCoins };
}

module.exports = {
  LOCATIONS,
  SPIRITS,
  FUSION_RECIPES,
  gloomGraph,
  getGloomTide,
  getGloomUser,
  updateGloomUser,
  forage,
  negotiateSpirit,
  fuseSpirits,
  equipFamiliar,
  leaveTrace,
  getTraces,
  getBossStatus,
  attackBoss,
  unlockBossExtraAttack,
};


const TAROT_ACHIEVEMENTS = [
  {
    id: 'first_card',
    namePt: 'Primeiro Vislumbre',
    nameEn: 'First Glimpse',
    descPt: 'Cole sua 1ª carta no Álbum de Tarot da Pyxie.',
    descEn: 'Paste your 1st card into the Pyxie Tarot Album.',
    rewardCoins: 100,
    check: (cards) => ({ current: Math.min(cards.length, 1), target: 1 }),
  },
  {
    id: 'queens_court',
    namePt: 'A Corte das Rainhas',
    nameEn: "The Queens' Court",
    descPt: 'Reúna as 4 Rainhas do Tarot (Paus, Espadas, Copas e Ouros).',
    descEn: 'Gather all 4 Tarot Queens (Wands, Swords, Cups, and Pentacles).',
    rewardCoins: 800,
    requiredCards: [35, 49, 63, 77],
    check: (cards) => {
      const needed = [35, 49, 63, 77];
      const match = needed.filter((id) => cards.includes(id)).length;
      return { current: match, target: 4 };
    },
  },
  {
    id: 'kings_banquet',
    namePt: 'O Banquete dos Reis',
    nameEn: "The Kings' Banquet",
    descPt: 'Reúna os 4 Reis do Tarot de todos os naipes.',
    descEn: 'Gather all 4 Tarot Kings of all suits.',
    rewardCoins: 800,
    requiredCards: [36, 50, 64, 78],
    check: (cards) => {
      const needed = [36, 50, 64, 78];
      const match = needed.filter((id) => cards.includes(id)).length;
      return { current: match, target: 4 };
    },
  },
  {
    id: 'fools_journey',
    namePt: 'O Louco e o Mundo',
    nameEn: "The Fool's Journey",
    descPt: 'Obtenha a primeira (01) e a última (22) carta dos Arcanos Maiores.',
    descEn: 'Obtain the first (01) and the last (22) cards of the Major Arcana.',
    rewardCoins: 500,
    requiredCards: [1, 22],
    check: (cards) => {
      const needed = [1, 22];
      const match = needed.filter((id) => cards.includes(id)).length;
      return { current: match, target: 2 };
    },
  },
  {
    id: 'major_mastery',
    namePt: 'Peregrino do Destino',
    nameEn: 'Destiny Pilgrim',
    descPt: 'Descubra todos os 22 Arcanos Maiores (Posições 01 a 22).',
    descEn: 'Discover all 22 Major Arcana (Positions 01 to 22).',
    rewardCoins: 2500,
    check: (cards) => {
      const match = cards.filter((id) => id >= 1 && id <= 22).length;
      return { current: match, target: 22 };
    },
  },
  {
    id: 'suit_wands_complete',
    namePt: 'Chama Imperecível',
    nameEn: 'Unquenchable Flame',
    descPt: 'Colete as 14 cartas do Naipe de Paus (Posições 23 a 36).',
    descEn: 'Collect all 14 cards of the Suit of Wands (Positions 23 to 36).',
    rewardCoins: 1500,
    check: (cards) => {
      const match = cards.filter((id) => id >= 23 && id <= 36).length;
      return { current: match, target: 14 };
    },
  },
  {
    id: 'full_deck_78',
    namePt: 'Soberano do Oráculo',
    nameEn: 'Sovereign of the Oracle',
    descPt: 'Complete integralmente as 78 cartas do Álbum de Tarot da Pyxie.',
    descEn: 'Complete all 78 cards of the Pyxie Tarot Album.',
    rewardCoins: 15000,
    check: (cards) => ({ current: cards.length, target: 78 }),
  },
];

const ACHIEVEMENTS_BY_ID = new Map(TAROT_ACHIEVEMENTS.map((a) => [a.id, a]));

function makeProgressBar(current, target, length = 8) {
  if (target <= 0) return '░'.repeat(length);
  const ratio = Math.min(1, Math.max(0, current / target));
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

function getAchievementById(id) {
  return ACHIEVEMENTS_BY_ID.get(id) || null;
}

/**
 * Avalia e ordena dinamicamente as conquistas com base no estado do usuário.
 * [ Nível 1: Prontas para Resgate ] -> [ Nível 2: Em Progresso ] -> [ Nível 3: Resgatadas ]
 * @param {number[]} discoveredCards
 * @param {string[]} claimedAchievements
 * @param {'pt'|'en'} [lang='pt']
 */
function evaluateAndSortAchievements(discoveredCards = [], claimedAchievements = [], lang = 'pt') {
  const cardsSet = Array.isArray(discoveredCards) ? discoveredCards : [];
  const claimedSet = new Set(Array.isArray(claimedAchievements) ? claimedAchievements : []);

  const evaluated = TAROT_ACHIEVEMENTS.map((ach) => {
    const { current, target } = ach.check(cardsSet);
    const isClaimed = claimedSet.has(ach.id);
    const isReady = !isClaimed && current >= target;
    const progressRatio = target > 0 ? current / target : 0;
    const remaining = Math.max(0, target - current);
    const desc = lang === 'en' ? ach.descEn : ach.descPt;
    const progressBar = makeProgressBar(current, target, 8);

    return {
      id: ach.id,
      name: lang === 'en' ? ach.nameEn : ach.namePt,
      description: lang === 'en' ? ach.descEn : ach.descPt,
      desc,
      description: desc,
      rewardCoins: ach.rewardCoins,
      current,
      target,
      remaining,
      progressRatio,
      isReady,
      isClaimed,
      percent: Math.min(100, Math.floor(progressRatio * 100)),
      progressBar,
    };
  });

  return evaluated.sort((a, b) => {
    // Nível 1: Prontas para Resgate primeiro
    if (a.isReady && !b.isReady) return -1;
    if (!a.isReady && b.isReady) return 1;
    if (a.isReady && b.isReady) {
      return b.rewardCoins - a.rewardCoins; // Maior recompensa primeiro
    }

    // Nível 3: Resgatadas por último
    if (a.isClaimed && !b.isClaimed) return 1;
    if (!a.isClaimed && b.isClaimed) return -1;
    if (a.isClaimed && b.isClaimed) {
      return a.name.localeCompare(b.name);
    }

    // Nível 2: Em progresso - maior % primeiro, desempate com menor 'remaining'
    if (b.progressRatio !== a.progressRatio) {
      return b.progressRatio - a.progressRatio;
    }
    return a.remaining - b.remaining;
  });
}

module.exports = {
  TAROT_ACHIEVEMENTS,
  getAchievementById,
  evaluateAndSortAchievements,
};


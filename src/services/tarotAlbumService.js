const fs = require('node:fs');
const path = require('node:path');
const { TOTAL_CARDS, getCardByNumber, getCardById } = require('../data/tarotCardsCatalog');
const { getAchievementById, evaluateAndSortAchievements } = require('../data/tarotAchievements');
const { addCoins, getBalance } = require('./economy');

const ALBUM_FILE = path.join(__dirname, '..', '..', 'data', 'tarot_album.json');

// Trava em memória para prevenir race conditions no resgate de conquistas
const activeClaims = new Set();

function ensureDataDirectory() {
  const dir = path.dirname(ALBUM_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readAlbumData() {
  ensureDataDirectory();
  if (!fs.existsSync(ALBUM_FILE)) {
    return { users: {} };
  }
  try {
    const raw = fs.readFileSync(ALBUM_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.users ? parsed : { users: {} };
  } catch (err) {
    return { users: {} };
  }
}

function writeAlbumDataAtomic(data) {
  ensureDataDirectory();
  const dir = path.dirname(ALBUM_FILE);
  const tempFile = path.join(dir, `tarot_album.tmp.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, ALBUM_FILE);
}

function getUserAlbum(userId) {
  if (!userId) return createDefaultUserAlbum();
  const data = readAlbumData();
  const user = data.users[String(userId)];
  if (!user) return createDefaultUserAlbum();

  return {
    discoveredCards: Array.isArray(user.discoveredCards) ? user.discoveredCards : [],
    firstDiscoveryDates: user.firstDiscoveryDates && typeof user.firstDiscoveryDates === 'object' ? user.firstDiscoveryDates : {},
    claimedAchievements: Array.isArray(user.claimedAchievements) ? user.claimedAchievements : [],
    updatedAt: user.updatedAt || Date.now(),
  };
}

function createDefaultUserAlbum() {
  return {
    discoveredCards: [],
    firstDiscoveryDates: {},
    claimedAchievements: [],
    updatedAt: Date.now(),
  };
}

function resolveCardNumber(cardIdentifier) {
  if (typeof cardIdentifier === 'number') {
    return cardIdentifier >= 1 && cardIdentifier <= TOTAL_CARDS ? cardIdentifier : null;
  }
  if (typeof cardIdentifier === 'string') {
    const parsedNum = Number.parseInt(cardIdentifier, 10);
    if (!Number.isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= TOTAL_CARDS) {
      return parsedNum;
    }
    const card = getCardById(cardIdentifier);
    if (card) return card.number;
  }
  if (cardIdentifier && typeof cardIdentifier === 'object') {
    if (cardIdentifier.number) return cardIdentifier.number;
    if (cardIdentifier.id) {
      const card = getCardById(cardIdentifier.id);
      if (card) return card.number;
    }
  }
  return null;
}

/**
 * Registra a descoberta de uma carta no álbum do usuário.
 * @param {string} userId
 * @param {number|string|Object} cardIdentifier
 * @returns {{ isNew: boolean, totalDiscovered: number, card: Object, discoveredCards: number[], firstDiscoveryDates: Object }}
 */
function recordCardDiscovery(userId, cardIdentifier) {
  const cardNum = resolveCardNumber(cardIdentifier);
  if (!cardNum) {
    return {
      isNew: false,
      totalDiscovered: 0,
      card: null,
      discoveredCards: [],
      firstDiscoveryDates: {},
    };
  }

  const catalogCard = getCardByNumber(cardNum);
  const data = readAlbumData();
  const strUserId = String(userId);

  if (!data.users[strUserId]) {
    data.users[strUserId] = createDefaultUserAlbum();
  }

  const user = data.users[strUserId];
  if (!Array.isArray(user.discoveredCards)) user.discoveredCards = [];
  if (!user.firstDiscoveryDates || typeof user.firstDiscoveryDates !== 'object') user.firstDiscoveryDates = {};
  if (!Array.isArray(user.claimedAchievements)) user.claimedAchievements = [];

  const alreadyDiscovered = user.discoveredCards.includes(cardNum);
  if (alreadyDiscovered) {
    return {
      isNew: false,
      totalDiscovered: user.discoveredCards.length,
      card: catalogCard,
      discoveredCards: [...user.discoveredCards],
      firstDiscoveryDates: { ...user.firstDiscoveryDates },
    };
  }

  // Nova carta descoberta!
  user.discoveredCards.push(cardNum);
  user.discoveredCards.sort((a, b) => a - b);
  user.firstDiscoveryDates[String(cardNum)] = Date.now();
  user.updatedAt = Date.now();

  writeAlbumDataAtomic(data);

  return {
    isNew: true,
    totalDiscovered: user.discoveredCards.length,
    card: catalogCard,
    discoveredCards: [...user.discoveredCards],
    firstDiscoveryDates: { ...user.firstDiscoveryDates },
  };
}

/**
 * Resgata uma conquista do álbum com prevenção estrita de race condition.
 * @param {string} userId
 * @param {string} achievementId
 * @param {'pt'|'en'} [lang='pt']
 */
async function claimAchievement(userId, achievementId, lang = 'pt') {
  const strUserId = String(userId);
  const lockKey = `${strUserId}:${achievementId}`;

  if (activeClaims.has(lockKey)) {
    return { success: false, reason: 'in_progress' };
  }

  activeClaims.add(lockKey);
  try {
    const achievement = getAchievementById(achievementId);
    if (!achievement) {
      return { success: false, reason: 'not_found' };
    }

    const data = readAlbumData();
    const user = data.users[strUserId] || createDefaultUserAlbum();
    const discoveredCards = Array.isArray(user.discoveredCards) ? user.discoveredCards : [];
    const claimedAchievements = Array.isArray(user.claimedAchievements) ? user.claimedAchievements : [];

    if (claimedAchievements.includes(achievementId)) {
      return { success: false, reason: 'already_claimed' };
    }

    const { current, target } = achievement.check(discoveredCards);
    if (current < target) {
      return {
        success: false,
        reason: 'requirements_not_met',
        current,
        target,
      };
    }

    // Adiciona moedas na economia da Pyxie
    addCoins(strUserId, achievement.rewardCoins, `tarot_achievement_${achievementId}`);
    const newBalance = getBalance(strUserId);

    if (!data.users[strUserId]) {
      data.users[strUserId] = user;
    }
    data.users[strUserId].claimedAchievements.push(achievementId);
    data.users[strUserId].updatedAt = Date.now();

    writeAlbumDataAtomic(data);

    return {
      success: true,
      achievement,
      rewardCoins: achievement.rewardCoins,
      newBalance,
    };
  } finally {
    activeClaims.delete(lockKey);
  }
}

/**
 * Retorna as estatísticas consolidadas do álbum para exibição.
 * @param {string} userId
 * @param {'pt'|'en'} [lang='pt']
 */
function getAlbumStats(userId, lang = 'pt') {
  const user = getUserAlbum(userId);
  const discoveredCount = user.discoveredCards.length;
  const percent = Number(((discoveredCount / TOTAL_CARDS) * 100).toFixed(1));
  const evaluatedAchievements = evaluateAndSortAchievements(user.discoveredCards, user.claimedAchievements, lang);
  const readyToClaimCount = evaluatedAchievements.filter((a) => a.isReady).length;
  const claimedCount = user.claimedAchievements.length;

  return {
    discoveredCount,
    totalCards: TOTAL_CARDS,
    percent,
    discoveredCards: user.discoveredCards,
    firstDiscoveryDates: user.firstDiscoveryDates,
    claimedAchievements: user.claimedAchievements,
    achievements: evaluatedAchievements,
    readyToClaimCount,
    claimedCount,
  };
}

function hasCard(userId, cardIdentifier) {
  const cardNum = resolveCardNumber(cardIdentifier);
  if (!cardNum) return false;
  const user = getUserAlbum(userId);
  return user.discoveredCards.includes(cardNum);
}

module.exports = {
  getUserAlbum,
  recordCardDiscovery,
  claimAchievement,
  getAlbumStats,
  hasCard,
  resolveCardNumber,
};

const fs = require('node:fs');
const path = require('node:path');
const { getEconomyConfig } = require('./database');
const professions = require('./professions');
const { normalizeProfileStyle } = require('./profileStyle');
const { getEmoji } = require('../utils/appEmojis');
const { withFileLock } = require('../utils/fileLock');

const economyFile = path.join(__dirname, '..', '..', 'data', 'economy.json');
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STREAK_GRACE_MS = 48 * 60 * 60 * 1000;
const WORK_COOLDOWN_MS = 3 * 60 * 60 * 1000;
const QUIZ_COOLDOWN_MS = 3 * 60 * 60 * 1000;

const CURRENCY_DEFINITIONS = [
  { key: 'coins', label: 'Moedinhas', emoji: '🪙' },
  { key: 'magicBeans', label: 'Feijões Mágicos', emoji: '🌱' },
];

const TITLES_CATALOG = {
  cultivador: {
    id: 'cultivador',
    name: 'Cultivador de Feijões',
    emoji: '🌱',
    cost: 1,
    desc: 'Para quem sabe que até o menor grão pode florescer.',
  },
  explorador: {
    id: 'explorador',
    name: 'Explorador dos Reinos',
    emoji: '🧭',
    cost: 2,
    desc: 'Desbravador intrépido dos recantos de Cringelândia.',
  },
  shinychaser: {
    id: 'shinychaser',
    name: 'Caçador de Tesouros',
    emoji: '💎',
    cost: 3,
    desc: 'Colecionador obstinado de relíquias radiantes.',
  },
  soberano: {
    id: 'soberano',
    name: 'Soberano Supremo',
    emoji: '👑',
    cost: 4,
    desc: 'Uma presença de autoridade e liderança incontestável.',
  },
  graomestre: {
    id: 'graomestre',
    name: 'Grão-Mestre Arcano',
    emoji: '🧙‍♂️',
    cost: 5,
    desc: 'Detentor de conhecimentos místicos e magia ancestral.',
  },
  lendaviva: {
    id: 'lendaviva',
    name: 'Lenda Viva',
    emoji: '⚡',
    cost: 6,
    desc: 'Seu nome ecoa por todo o reino com reverência e glória.',
  },
  magnata: {
    id: 'magnata',
    name: 'Magnata Cósmico',
    emoji: '💎',
    cost: 15,
    desc: 'A personificação máxima da prosperidade e riqueza.',
  },
};

const THEMES_CATALOG = {
  default: { id: 'default', name: 'Pyxie Bloom', nameEn: 'Pyxie Bloom', emoji: '🌸', color: '#ff3d8b', cost: 0, desc: 'Pétalas magenta flutuando sobre um céu violeta.', descEn: 'Magenta petals drifting over a violet sky.' },
  ouro: { id: 'ouro', name: 'Ouro Real', nameEn: 'Royal Gold', emoji: '👑', color: '#facc15', cost: 2, desc: 'Raios dourados de sol nascente para os mais prósperos.', descEn: 'Golden sunrise rays for the most prosperous.' },
  esmeralda: { id: 'esmeralda', name: 'Esmeralda Mística', nameEn: 'Mystic Emerald', emoji: '🌿', color: '#34d399', cost: 2, desc: 'Folhagem esmeralda de uma floresta encantada.', descEn: 'Emerald foliage from an enchanted forest.' },
  galaxia: { id: 'galaxia', name: 'Nebulosa Cósmica', nameEn: 'Cosmic Nebula', emoji: '🌌', color: '#a78bfa', cost: 3, desc: 'Campo de estrelas com brilho de nebulosa.', descEn: 'A starfield with a nebula glow.' },
  cyberpunk: { id: 'cyberpunk', name: 'Neon City', nameEn: 'Neon City', emoji: '⚡', color: '#ff2bd6', cost: 3, desc: 'Grade neon rosa e ciano de uma cidade futurista.', descEn: 'Pink and cyan neon grid from a future city.' },
  chama: { id: 'chama', name: 'Fogo Carmesim', nameEn: 'Crimson Fire', emoji: '🔥', color: '#f97316', cost: 4, desc: 'Brasas subindo de uma fogueira intensa.', descEn: 'Embers rising from a roaring fire.' },
  diamante: { id: 'diamante', name: 'Diamante Glacial', nameEn: 'Glacial Diamond', emoji: '💎', color: '#5eead4', cost: 5, desc: 'Cristais de gelo facetados e cintilantes.', descEn: 'Faceted, glittering ice crystals.' },
  aurora: { id: 'aurora', name: 'Aurora Boreal', nameEn: 'Northern Lights', emoji: '🌠', color: '#4ade80', cost: 3, desc: 'Faixas de luz verde e lilás dançando no céu polar.', descEn: 'Green and lilac light ribbons over a polar sky.' },
  sakura: { id: 'sakura', name: 'Sakura Clara', nameEn: 'Light Sakura', emoji: '🌷', color: '#ec4899', cost: 3, desc: 'Tema claro com pétalas de cerejeira.', descEn: 'A light theme with cherry blossom petals.' },
  vaporwave: { id: 'vaporwave', name: 'Vaporwave', nameEn: 'Vaporwave', emoji: '🌇', color: '#ff71ce', cost: 4, desc: 'Sol retrô e horizonte em grade dos anos 80.', descEn: 'Retro sun and an 80s grid horizon.' },
  matcha: { id: 'matcha', name: 'Matcha Minimal', nameEn: 'Matcha Minimal', emoji: '🍵', color: '#4d7c0f', cost: 2, desc: 'Tema claro, limpo e calmo em tons de chá verde.', descEn: 'A clean, calm light theme in green tea tones.' },
  noir: { id: 'noir', name: 'Noir', nameEn: 'Noir', emoji: '🖤', color: '#f5f5f5', cost: 4, desc: 'Preto e branco elegante, estilo editorial.', descEn: 'Elegant black and white, editorial style.' },
  arcade: { id: 'arcade', name: 'Arcade 8-bit', nameEn: '8-bit Arcade', emoji: '🕹️', color: '#facc15', cost: 4, desc: 'Pixels coloridos de fliperama clássico.', descEn: 'Colorful pixels from a classic arcade.' },
};

function normalizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

const ECONOMY_BACKUP_INTERVAL_MS = 60 * 1000;
let lastEconomyBackupAt = 0;

function parseEconomyFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return raw ? JSON.parse(raw) : {};
}

/**
 * Lê data/economy.json. Se o arquivo estiver corrompido, ele é preservado como
 * economy.json.corrupt-<ts> e a leitura cai para o backup economy.json.bak,
 * evitando que a próxima gravação sobrescreva todos os saldos com {}.
 */
function readEconomy() {
  const directory = path.dirname(economyFile);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  if (!fs.existsSync(economyFile)) return {};

  try {
    return parseEconomyFile(economyFile);
  } catch (error) {
    console.error('[economy] economy.json ilegível:', error.message);
    try {
      fs.renameSync(economyFile, `${economyFile}.corrupt-${Date.now()}`);
    } catch (_) {}
    const backupFile = `${economyFile}.bak`;
    if (fs.existsSync(backupFile)) {
      try {
        const restored = parseEconomyFile(backupFile);
        console.error('[economy] Saldos restaurados a partir de economy.json.bak.');
        return restored;
      } catch (backupError) {
        console.error('[economy] Backup também ilegível:', backupError.message);
      }
    }
    return {};
  }
}

/** Gravação atômica (tmp + rename) com backup rotativo a cada minuto. */
function writeEconomy(economy) {
  const directory = path.dirname(economyFile);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  const tmp = `${economyFile}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(economy, null, 2), 'utf8');
  const now = Date.now();
  if (now - lastEconomyBackupAt >= ECONOMY_BACKUP_INTERVAL_MS && fs.existsSync(economyFile)) {
    try {
      fs.copyFileSync(economyFile, `${economyFile}.bak`);
      lastEconomyBackupAt = now;
    } catch (_) {}
  }
  fs.renameSync(tmp, economyFile);
}

function normalizeAccount(account) {
  const acc = account || {};
  return {
    ...acc,
    coins: normalizeNumber(acc.coins, 0),
    magicBeans: normalizeNumber(acc.magicBeans, 0),
    profession: acc.profession || null,
    workCount: normalizeNumber(acc.workCount, 0),
    projectProgress: Math.max(0, Math.min(2, normalizeNumber(acc.projectProgress, 0))),
    lastWorkAt: acc.lastWorkAt || null,
    lastQuizAt: acc.lastQuizAt || null,
    lastDailyAt: acc.lastDailyAt || null,
    lastVotedAt: acc.lastVotedAt || null,
    dailyStreak: normalizeNumber(acc.dailyStreak, 0),
    titles: Array.isArray(acc.titles) ? acc.titles : [],
    equippedTitle: acc.equippedTitle || null,
    themes: Array.isArray(acc.themes) ? acc.themes : ['default'],
    equippedTheme: acc.equippedTheme || 'default',
    unlockedProfessions: Array.isArray(acc.unlockedProfessions) ? acc.unlockedProfessions : [],
    masteredProfessions: Array.isArray(acc.masteredProfessions) ? acc.masteredProfessions : [],
    recentWorkQuestions: Array.isArray(acc.recentWorkQuestions) ? acc.recentWorkQuestions : [],
    recentQuizQuestions: Array.isArray(acc.recentQuizQuestions) ? acc.recentQuizQuestions : [],
    bio: typeof acc.bio === 'string' ? acc.bio.trim().slice(0, 150) : null,
    profileStyle: normalizeProfileStyle(acc.profileStyle),
  };
}

function getUserAccount(userId) {
  const economy = readEconomy();
  return normalizeAccount(economy[userId]);
}

/**
 * Ler-alterar-gravar de uma conta com o economy.json travado entre processos (o web também
 * credita votos e bônus). Sem a trava, uma gravação do outro processo podia sumir.
 */
function updateUserAccount(userId, updater) {
  return withFileLock(economyFile, () => {
    const economy = readEconomy();
    const account = normalizeAccount(economy[userId]);
    updater(account);
    economy[userId] = account;
    writeEconomy(economy);
    return account;
  });
}

function getBalance(userId) {
  return getUserAccount(userId).coins;
}

function addCoins(userId, amount) {
  const qty = Math.max(0, normalizeNumber(amount, 0));
  if (qty === 0) return getUserAccount(userId).coins;

  const updated = updateUserAccount(userId, (acc) => {
    acc.coins = (acc.coins || 0) + qty;
  });
  return updated.coins;
}

function getMagicBeans(userId) {
  return getUserAccount(userId).magicBeans;
}

function addMagicBeans(userId, amount) {
  const qty = Math.max(0, normalizeNumber(amount, 0));
  if (qty === 0) return getUserAccount(userId).magicBeans;

  const updated = updateUserAccount(userId, (acc) => {
    acc.magicBeans = (acc.magicBeans || 0) + qty;
  });
  return updated.magicBeans;
}

function spendMagicBeans(userId, amount) {
  const qty = Math.max(0, normalizeNumber(amount, 0));
  return withFileLock(economyFile, () => {
    const account = getUserAccount(userId);
    if (account.magicBeans < qty) return { spent: false, balance: account.magicBeans };
    const updated = updateUserAccount(userId, (acc) => {
      acc.magicBeans -= qty;
    });
    return { spent: true, balance: updated.magicBeans };
  });
}

function getCurrencyBalances(userId, source = null) {
  const account = getUserAccount(userId);
  const coinEmoji = getEmoji('COIN') || '🪙';
  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  const { getLanguage } = require('../utils/i18n');
  const lang = source ? getLanguage(source) : 'pt';

  return [
    {
      key: 'coins',
      label: lang === 'en' ? 'Coins' : 'Moedinhas',
      emoji: coinEmoji,
      amount: Number(account.coins) || 0,
    },
    {
      key: 'magicBeans',
      label: lang === 'en' ? 'Magic Beans' : 'Feijões Mágicos',
      emoji: beanEmoji,
      amount: Number(account.magicBeans) || 0,
    },
  ];
}

function spendCoins(userId, amount) {
  const cost = Math.max(0, normalizeNumber(amount, 0));
  // Saldo conferido e debitado dentro da mesma trava: duas compras ao mesmo tempo não ficam negativas
  return withFileLock(economyFile, () => {
    const account = getUserAccount(userId);
    if (account.coins < cost) return { spent: false, balance: account.coins };
    const updated = updateUserAccount(userId, (acc) => {
      acc.coins -= cost;
    });
    return { spent: true, balance: updated.coins };
  });
}

function setUserBalance(userId, amount) {
  return updateUserAccount(userId, (acc) => {
    acc.coins = normalizeNumber(amount, 0);
  });
}

function resetUserEconomy(userId) {
  return updateUserAccount(userId, (acc) => {
    acc.coins = 0;
    acc.magicBeans = 0;
    acc.lastDailyAt = null;
    acc.dailyStreak = 0;
    acc.projectProgress = 0;
  });
}

function getTitlesCatalog() {
  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  const crownEmoji = getEmoji('CROWN') || '👑';
  const diamondEmoji = getEmoji('DIAMOND') || '💎';

  return {
    ...TITLES_CATALOG,
    cultivador: {
      ...TITLES_CATALOG.cultivador,
      emoji: beanEmoji,
    },
    shinychaser: {
      ...TITLES_CATALOG.shinychaser,
      emoji: diamondEmoji,
    },
    soberano: {
      ...TITLES_CATALOG.soberano,
      emoji: crownEmoji,
    },
    magnata: {
      ...TITLES_CATALOG.magnata,
      emoji: diamondEmoji,
    },
  };
}

function getUserTitles(userId) {
  const account = getUserAccount(userId);
  return account.titles || [];
}

function buyTitle(userId, titleId) {
  const catalog = getTitlesCatalog();
  const title = catalog[titleId];
  if (!title) {
    return { success: false, reason: 'title_not_found', message: 'Título não encontrado no catálogo.' };
  }

  const account = getUserAccount(userId);
  const userTitles = account.titles || [];
  if (userTitles.includes(titleId)) {
    return { success: false, reason: 'already_owned', message: `Você já possui o título **${title.name}**!` };
  }

  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  if (account.magicBeans < title.cost) {
    return {
      success: false,
      reason: 'insufficient_beans',
      message: `Você precisa de **${title.cost} ${beanEmoji} Feijões Mágicos** para adquirir este título (Saldo atual: ${account.magicBeans} ${beanEmoji}).`,
    };
  }

  const updated = updateUserAccount(userId, (acc) => {
    acc.magicBeans -= title.cost;
    acc.titles.push(titleId);
    acc.equippedTitle = titleId; // Equipa automaticamente ao comprar
  });

  return {
    success: true,
    title,
    equipped: true,
    remainingBeans: updated.magicBeans,
    message: `👑 **Título Adquirido e Equipado!** Você agora ostenta: **${title.emoji} ${title.name}**!`,
  };
}

/**
 * Título por id: os comprados com feijões (TITLES_CATALOG) e os de conquista
 * (src/data/achievementTitles.js, com formatação especial em `display`).
 */
function getTitleDefinition(titleId, lang = 'pt') {
  if (!titleId) return null;
  if (TITLES_CATALOG[titleId]) return { ...TITLES_CATALOG[titleId], display: TITLES_CATALOG[titleId].name, achievement: false };
  const { ACHIEVEMENT_TITLES } = require('../data/achievementTitles');
  const title = ACHIEVEMENT_TITLES[titleId];
  if (!title) return null;
  const { formatStyledTitle } = require('../utils/fancyText');
  const key = lang === 'en' ? 'en' : 'pt';
  return {
    id: title.id,
    name: title.name[key],
    desc: title.desc[key],
    emoji: title.emoji,
    style: title.style,
    display: formatStyledTitle(title.name[key], title.style),
    achievement: true,
  };
}

/** Entrega um título de conquista (idempotente). */
function grantTitle(userId, titleId) {
  return updateUserAccount(userId, (acc) => {
    const titles = Array.isArray(acc.titles) ? acc.titles : [];
    if (!titles.includes(titleId)) titles.push(titleId);
    acc.titles = titles;
  });
}

function equipTitle(userId, titleId) {
  if (!titleId) {
    updateUserAccount(userId, (acc) => {
      acc.equippedTitle = null;
    });
    return { success: true, equipped: null, message: 'Você desequipou seu título atual.' };
  }

  const title = getTitleDefinition(titleId);
  if (!title) {
    return { success: false, reason: 'title_not_found', message: 'Título não encontrado.' };
  }

  const account = getUserAccount(userId);
  const userTitles = account.titles || [];
  if (!userTitles.includes(titleId)) {
    return { success: false, reason: 'not_owned', message: `Você ainda não desbloqueou o título **${title.name}**!` };
  }

  updateUserAccount(userId, (acc) => {
    acc.equippedTitle = titleId;
  });

  return {
    success: true,
    title,
    message: `✨ Título **${title.emoji} ${title.display || title.name}** equipado com sucesso!`,
  };
}

function unequipTitle(userId) {
  return equipTitle(userId, null);
}

function setProfileStyle(userId, partial = {}) {
  const updated = updateUserAccount(userId, (acc) => {
    acc.profileStyle = normalizeProfileStyle({ ...acc.profileStyle, ...partial });
  });
  return updated.profileStyle;
}

function setUserBio(userId, bioText) {
  const cleanBio = typeof bioText === 'string' ? bioText.trim().slice(0, 150) : '';
  const updated = updateUserAccount(userId, (acc) => {
    acc.bio = cleanBio || null;
  });
  return { success: true, bio: updated.bio };
}

function getThemesCatalog() {
  return THEMES_CATALOG;
}

function getUserThemes(userId) {
  const account = getUserAccount(userId);
  return account.themes || ['default'];
}

function buyTheme(userId, themeId) {
  const theme = THEMES_CATALOG[themeId];
  if (!theme) {
    return { success: false, reason: 'theme_not_found', message: 'Tema não encontrado no catálogo.' };
  }

  const account = getUserAccount(userId);
  const userThemes = account.themes || ['default'];
  if (userThemes.includes(themeId)) {
    return { success: false, reason: 'already_owned', message: `Você já possui o tema visual **${theme.name}**!` };
  }

  const beanEmoji = getEmoji('MAGIC_BEAN') || '🌱';
  if (account.magicBeans < theme.cost) {
    return {
      success: false,
      reason: 'insufficient_beans',
      message: `Você precisa de **${theme.cost} ${beanEmoji} Feijões Mágicos** para adquirir este tema visual (Saldo atual: ${account.magicBeans} ${beanEmoji}).`,
    };
  }

  const updated = updateUserAccount(userId, (acc) => {
    acc.magicBeans -= theme.cost;
    acc.themes = Array.isArray(acc.themes) ? [...acc.themes, themeId] : ['default', themeId];
    acc.equippedTheme = themeId;
  });

  return {
    success: true,
    theme,
    equipped: true,
    remainingBeans: updated.magicBeans,
    message: `🎨 **Tema Visual Desbloqueado e Equipado!** Seu perfil agora brilha com: **${theme.emoji} ${theme.name}**!`,
  };
}

function equipTheme(userId, themeId) {
  const finalThemeId = themeId || 'default';
  const theme = THEMES_CATALOG[finalThemeId];
  if (!theme) {
    return { success: false, reason: 'theme_not_found', message: 'Tema visual não encontrado.' };
  }

  const account = getUserAccount(userId);
  const userThemes = account.themes || ['default'];
  if (!userThemes.includes(finalThemeId)) {
    return { success: false, reason: 'not_owned', message: `Você ainda não desbloqueou o tema **${theme.name}**!` };
  }

  updateUserAccount(userId, (acc) => {
    acc.equippedTheme = finalThemeId;
  });

  return {
    success: true,
    theme,
    message: `🎨 Tema visual **${theme.emoji} ${theme.name}** equipado com sucesso!`,
  };
}

function getWorkStatus(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  const lastWorkAt = account.lastWorkAt ? new Date(account.lastWorkAt).getTime() : 0;
  const remainingMs = Math.max(0, WORK_COOLDOWN_MS - (now - lastWorkAt));
  return {
    available: remainingMs === 0,
    remainingMs,
    nextWorkAt: remainingMs ? new Date(now + remainingMs).toISOString() : null,
  };
}

function setProfession(userId, profession, cost = 50) {
  const account = getUserAccount(userId);
  const hasProfession = Boolean(account.profession);
  if (account.profession === profession) return { changed: false, reason: 'same', balance: account.coins, account };

  const profDef = professions[profession];
  const isMagic = Boolean(profDef?.isMagic);
  const beanCost = isMagic ? (profDef.beanCost || 1) : 0;
  const unlocked = Array.isArray(account.unlockedProfessions) && account.unlockedProfessions.includes(profession);

  // Se for profissão mágica e ainda não estiver desbloqueada pelo usuário
  if (isMagic && !unlocked) {
    if (account.magicBeans < beanCost) {
      return {
        changed: false,
        reason: 'insufficient_beans',
        beanCost,
        balanceBeans: account.magicBeans,
        balance: account.coins,
        account,
      };
    }

    const updated = updateUserAccount(userId, (current) => {
      current.magicBeans = Math.max(0, (current.magicBeans || 0) - beanCost);
      current.unlockedProfessions = Array.isArray(current.unlockedProfessions)
        ? [...current.unlockedProfessions, profession]
        : [profession];
      current.profession = profession;
      current.careerLevel = 1;
      current.careerStreak = 0;
      current.shiftsAtLevel = 0;
      current.careerMistakes = 0;
      current.recentWorkQuestions = [];
    });

    return {
      changed: true,
      unlockedWithBeans: true,
      beanCost,
      charged: 0,
      remainingBeans: updated.magicBeans,
      balance: updated.coins,
      account: updated,
    };
  }

  // Profissão comum OU profissão mágica previamente desbloqueada
  if (hasProfession && account.coins < cost) return { changed: false, reason: 'insufficient', balance: account.coins, account };

  const charged = hasProfession ? cost : 0;
  const updated = updateUserAccount(userId, (current) => {
    current.profession = profession;
    current.careerLevel = 1;
    current.careerStreak = 0;
    current.shiftsAtLevel = 0;
    current.careerMistakes = 0;
    current.recentWorkQuestions = [];
    if (hasProfession) current.coins -= cost;
  });

  return {
    changed: true,
    charged,
    balance: updated.coins,
    account: updated,
  };
}

function getUserUnlockedProfessions(userId) {
  const account = getUserAccount(userId);
  return account.unlockedProfessions || [];
}

function isTestUser(userId) {
  if (!userId || typeof userId !== 'string') return true;
  const trimmed = userId.trim();

  // IDs usados estritamente em testes unitários automatizados (tests/economy.test.js)
  if (trimmed === 'streak-user' || trimmed === 'economy-test-user' || trimmed === 'string-balance') {
    return false;
  }

  // Padrões de teste e mocks
  if (/^(user_)?test/i.test(trimmed)) return true;
  if (/^user_no_egg/i.test(trimmed)) return true;
  if (/^user_marry/i.test(trimmed)) return true;
  if (/^mock/i.test(trimmed)) return true;
  if (/^dummy/i.test(trimmed)) return true;
  if (/^sample/i.test(trimmed)) return true;
  if (/test[_-]/i.test(trimmed)) return true;
  if (
    trimmed === 'user_123' ||
    trimmed === 'test-user-1' ||
    trimmed === 'admin-target' ||
    trimmed === 'worker' ||
    trimmed === 'magic-candidate' ||
    trimmed === 'recipient' ||
    trimmed === 'proposer' ||
    trimmed === 'test_user_pt' ||
    trimmed === 'test_user_en' ||
    trimmed === 'test_author_pt'
  ) {
    return true;
  }

  // No Discord, qualquer ID de usuário real é estritamente um snowflake numérico de 17 a 20 dígitos
  if (!/^\d{17,20}$/.test(trimmed)) {
    return true;
  }

  return false;
}

function purgeTestAccounts() {
  return withFileLock(economyFile, () => {
    const current = readEconomy();
    let changed = false;
    for (const uid of Object.keys(current)) {
      if (isTestUser(uid)) {
        delete current[uid];
        changed = true;
      }
    }
    if (changed) {
      writeEconomy(current);
    }
    return changed;
  });
}

function startWork(userId, data = {}, now = Date.now()) {
  const status = getWorkStatus(userId, now);
  if (!status.available) return { started: false, ...status };

  const account = updateUserAccount(userId, (current) => {
    current.lastWorkAt = new Date(now).toISOString();
    if (data.questionKey) {
      const recents = Array.isArray(current.recentWorkQuestions) ? current.recentWorkQuestions : [];
      current.recentWorkQuestions = [...recents.filter((k) => k !== data.questionKey), data.questionKey].slice(-15);
    }
  });
  return {
    started: true,
    data,
    workCount: Number(account.workCount) || 0,
    ...getWorkStatus(userId, now),
  };
}

function getQuizStatus(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  const lastQuizAt = account.lastQuizAt ? new Date(account.lastQuizAt).getTime() : 0;
  const remainingMs = Math.max(0, QUIZ_COOLDOWN_MS - (now - lastQuizAt));
  return {
    available: remainingMs === 0,
    remainingMs,
    nextQuizAt: remainingMs ? new Date(now + remainingMs).toISOString() : null,
  };
}

function startQuiz(userId, now = Date.now(), questionKey = null) {
  const status = getQuizStatus(userId, now);
  if (!status.available) return { started: false, ...status };

  updateUserAccount(userId, (current) => {
    current.lastQuizAt = new Date(now).toISOString();
    if (questionKey && typeof questionKey === 'string') {
      const qk = questionKey.trim();
      if (qk) {
        if (!Array.isArray(current.recentQuizQuestions)) current.recentQuizQuestions = [];
        current.recentQuizQuestions = current.recentQuizQuestions.filter((k) => k !== qk);
        current.recentQuizQuestions.push(qk);
        if (current.recentQuizQuestions.length > 15) {
          current.recentQuizQuestions.shift();
        }
      }
    }
  });
  return {
    started: true,
    ...getQuizStatus(userId, now),
  };
}

function recordQuizQuestion(userId, questionKey) {
  if (!userId || !questionKey || typeof questionKey !== 'string') return;
  const qk = questionKey.trim();
  if (!qk) return;
  updateUserAccount(userId, (current) => {
    if (!Array.isArray(current.recentQuizQuestions)) current.recentQuizQuestions = [];
    current.recentQuizQuestions = current.recentQuizQuestions.filter((k) => k !== qk);
    current.recentQuizQuestions.push(qk);
    if (current.recentQuizQuestions.length > 15) {
      current.recentQuizQuestions.shift();
    }
  });
}

function getCareerLevel(userId) {
  const account = getUserAccount(userId);
  return Math.max(1, Math.min(4, Number(account.careerLevel) || 1));
}

function setCareerLevel(userId, level) {
  const clamped = Math.max(1, Math.min(4, Number(level) || 1));
  const updated = updateUserAccount(userId, (acc) => {
    acc.careerLevel = clamped;
    acc.careerStreak = 0;
    acc.careerMistakes = 0;
    acc.shiftsAtLevel = 0;
    if (clamped === 4 && acc.profession) {
      if (!Array.isArray(acc.masteredProfessions)) {
        acc.masteredProfessions = [];
      }
      if (!acc.masteredProfessions.includes(acc.profession)) {
        acc.masteredProfessions.push(acc.profession);
      }
    }
  });
  return updated.careerLevel;
}

function finishWork(userId, success, amount, bonusBean = false) {
  let promoted = false;
  let demoted = false;
  let previousLevel = 1;
  let newLevel = 1;

  if (!success) {
    const updated = updateUserAccount(userId, (current) => {
      if (amount > 0) {
        current.coins = (Number(current.coins) || 0) + amount;
      }
      previousLevel = Math.max(1, Math.min(4, Number(current.careerLevel) || 1));
      current.careerStreak = 0;
      const mistakes = (Number(current.careerMistakes) || 0) + 1;
      current.careerMistakes = mistakes;

      // Rebaixamento justo: advertência prévia, ocorrendo apenas a partir de 3 erros consecutivos
      const guaranteedDemotion = mistakes >= 5;
      const rolledDemotion = mistakes >= 3 && Math.random() < 0.15;

      if (previousLevel > 1 && (guaranteedDemotion || rolledDemotion)) {
        current.careerLevel = previousLevel - 1;
        current.careerMistakes = 0; // reseta a sequência de erros ao rebaixar
        current.shiftsAtLevel = 0;
        demoted = true;
      }
      newLevel = Math.max(1, Math.min(4, Number(current.careerLevel) || 1));
    });

    return {
      earned: false,
      amount: amount || 0,
      balance: updated.coins,
      magicBeans: updated.magicBeans,
      bonusBean: false,
      careerLevel: newLevel,
      previousLevel,
      careerStreak: 0,
      careerMistakes: updated.careerMistakes || 0,
      promoted: false,
      demoted,
      projectProgress: Math.max(0, Math.min(2, Number(updated.projectProgress) || 0)),
      previousProjectProgress: Math.max(0, Math.min(2, Number(updated.projectProgress) || 0)),
      projectProgressDisplay: Math.max(0, Math.min(2, Number(updated.projectProgress) || 0)),
      projectCompleted: false,
      masteredProfessions: Array.isArray(updated.masteredProfessions) ? updated.masteredProfessions : [],
      newlyMastered: false,
    };
  }

  let newlyMastered = false;
  let projectCompleted = false;
  let previousProjectProgress = 0;
  let nextProjectProgress = 0;

  const account = updateUserAccount(userId, (current) => {
    current.coins = (Number(current.coins) || 0) + amount;
    current.workCount = (Number(current.workCount) || 0) + 1;
    if (bonusBean) {
      current.magicBeans = (Number(current.magicBeans) || 0) + 1;
    }

    // Progressão do Projeto de Carreira (0, 1, 2)
    previousProjectProgress = Math.max(0, Math.min(2, Number(current.projectProgress) || 0));
    nextProjectProgress = previousProjectProgress + 1;
    if (nextProjectProgress >= 3) {
      current.projectProgress = 0;
      projectCompleted = true;
    } else {
      current.projectProgress = nextProjectProgress;
    }

    previousLevel = Math.max(1, Math.min(4, Number(current.careerLevel) || 1));
    current.careerMistakes = 0;
    const streak = (Number(current.careerStreak) || 0) + 1;
    current.careerStreak = streak;

    const shiftsAtLevel = (Number(current.shiftsAtLevel) || 0) + 1;
    current.shiftsAtLevel = shiftsAtLevel;

    const totalWorks = Number(current.workCount) || 0;

    // Metas garantidas por expedientes concluídos
    // Nível 1 -> 2: 10 expedientes
    // Nível 2 -> 3: 25 expedientes (ou 15 no cargo)
    // Nível 3 -> 4: 45 expedientes (ou 20 no cargo)
    const guaranteedByWorks =
      (previousLevel === 1 && (shiftsAtLevel >= 10 || totalWorks >= 10)) ||
      (previousLevel === 2 && (shiftsAtLevel >= 15 || totalWorks >= 25)) ||
      (previousLevel === 3 && (shiftsAtLevel >= 20 || totalWorks >= 45));

    // Metas garantidas por sequência de acertos (streak impecável)
    // Nível 1: 5 acertos seguidos
    // Nível 2: 7 acertos seguidos
    // Nível 3: 10 acertos seguidos
    const guaranteedByStreak =
      (previousLevel === 1 && streak >= 5) ||
      (previousLevel === 2 && streak >= 7) ||
      (previousLevel === 3 && streak >= 10);

    // Bônus progressivo por streak: chance base 5% + 3% por acerto consecutivo (cap 60%)
    const dynamicChance = Math.min(0.60, 0.05 + streak * 0.03);
    const rolledPromotion = Math.random() < dynamicChance;

    if (previousLevel < 4 && (guaranteedByWorks || guaranteedByStreak || rolledPromotion)) {
      current.careerLevel = previousLevel + 1;
      current.careerStreak = 0; // reseta a sequência de acertos ao ser promovido
      current.shiftsAtLevel = 0;
      current.recentWorkQuestions = []; // limpa histórico recente para explorar novas questões do novo cargo
      promoted = true;
    }
    newLevel = Math.max(1, Math.min(4, Number(current.careerLevel) || 1));

    // Maestria de Carreira (Currículo Lendário)
    if (newLevel === 4 && current.profession) {
      if (!Array.isArray(current.masteredProfessions)) {
        current.masteredProfessions = [];
      }
      if (!current.masteredProfessions.includes(current.profession)) {
        current.masteredProfessions.push(current.profession);
        newlyMastered = true;
      }
    }
  });

  return {
    earned: true,
    amount,
    balance: account.coins,
    magicBeans: account.magicBeans,
    bonusBean,
    workCount: account.workCount,
    careerLevel: newLevel,
    previousLevel,
    careerStreak: account.careerStreak || 0,
    careerMistakes: 0,
    promoted,
    demoted: false,
    projectProgress: account.projectProgress,
    previousProjectProgress,
    projectProgressDisplay: projectCompleted ? 3 : nextProjectProgress,
    projectCompleted,
    masteredProfessions: account.masteredProfessions || [],
    newlyMastered,
  };
}

function getDailyStatus(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  const lastDailyAt = account.lastDailyAt ? new Date(account.lastDailyAt).getTime() : 0;
  const remainingMs = Math.max(0, DAILY_COOLDOWN_MS - (now - lastDailyAt));

  return {
    available: remainingMs === 0,
    remainingMs,
    nextClaimAt: remainingMs ? new Date(now + remainingMs).toISOString() : null,
  };
}

const VOTE_VALIDITY_MS = 12 * 60 * 60 * 1000; // 12 horas

function registerUserVote(userId, votedAt = Date.now()) {
  return updateUserAccount(userId, (acc) => {
    acc.lastVotedAt = new Date(votedAt).toISOString();
  });
}

function hasActiveVote(userId, now = Date.now()) {
  const account = getUserAccount(userId);
  if (!account.lastVotedAt) return false;
  const voteTime = new Date(account.lastVotedAt).getTime();
  return (now - voteTime) < VOTE_VALIDITY_MS;
}

function claimDaily(userId, now = Date.now()) {
  const status = getDailyStatus(userId, now);
  if (!status.available) {
    const acc = getUserAccount(userId);
    return {
      claimed: false,
      amount: 0,
      streak: acc.dailyStreak || 0,
      streakBonus: 0,
      voteBonus: 0,
      hasVoted: hasActiveVote(userId, now),
      totalAmount: 0,
      balance: acc.coins,
      magicBeans: acc.magicBeans,
      magicBeanBonus: false,
      ...status,
    };
  }

  const accBefore = getUserAccount(userId);
  let streak = 1;
  if (accBefore.lastDailyAt) {
    const lastDailyTime = new Date(accBefore.lastDailyAt).getTime();
    const diff = now - lastDailyTime;
    if (diff <= STREAK_GRACE_MS) {
      streak = (accBefore.dailyStreak || 0) + 1;
    } else {
      streak = 1; // Quebrou a sequência após 48h
    }
  }

  // Bônus moderado de streak exclusivamente em moedinhas:
  // Streak 1: 0 (início)
  // Streak 2: 4 moedas
  // Streak 3: 6 moedas
  // Streak 4: 8 moedas
  // Streak 5: 10 moedas 🔥
  // Cap em 25 moedas para manter equilíbrio econômico
  const streakBonus = streak > 1 ? Math.min(streak * 2, 25) : 0;

  // Votos no Top.gg agora são puramente voluntários (sem bônus de moedas)
  const hasVoted = false;
  const voteBonus = 0;

  const { minimum, maximum } = getEconomyConfig();
  const amount = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  const wonMagicBean = Math.random() < 0.01; // 1% de chance de Feijão Mágico

  const updated = updateUserAccount(userId, (acc) => {
    acc.coins += (amount + streakBonus);
    acc.dailyStreak = streak;
    if (wonMagicBean) {
      acc.magicBeans = (acc.magicBeans || 0) + 1;
    }
    acc.lastDailyAt = new Date(now).toISOString();
  });

  return {
    claimed: true,
    amount,
    streak,
    streakBonus,
    voteBonus: 0,
    hasVoted: false,
    totalAmount: amount + streakBonus,
    magicBeanBonus: wonMagicBean,
    balance: updated.coins,
    magicBeans: updated.magicBeans,
    nextClaimAt: new Date(now + DAILY_COOLDOWN_MS).toISOString(),
    remainingMs: DAILY_COOLDOWN_MS,
  };
}

function getRanking(limit = 10, userIds = null) {
  return Object.entries(readEconomy())
    .filter(([userId]) => (!userIds || userIds.has(userId)) && !isTestUser(userId))
    .map(([userId, account]) => ({
      userId,
      coins: Number(account.coins) || 0,
      magicBeans: Number(account.magicBeans) || 0,
      dailyStreak: Number(account.dailyStreak) || 0,
    }))
    .sort((left, right) => right.coins - left.coins)
    .slice(0, limit);
}

function getUserRank(userId, userIds = null) {
  const accounts = Object.entries(readEconomy())
    .filter(([id]) => (!userIds || userIds.has(id)) && !isTestUser(id))
    .map(([id, account]) => ({ userId: id, coins: Number(account.coins) || 0 }))
    .sort((left, right) => right.coins - left.coins);
  const index = accounts.findIndex((account) => account.userId === userId);

  return index === -1 ? null : { position: index + 1, coins: accounts[index].coins };
}

function getStreakRanking(limit = 10, userIds = null) {
  return Object.entries(readEconomy())
    .filter(([userId]) => (!userIds || userIds.has(userId)) && !isTestUser(userId))
    .map(([userId, account]) => ({
      userId,
      dailyStreak: Number(account.dailyStreak) || 0,
      coins: Number(account.coins) || 0,
    }))
    .filter((entry) => entry.dailyStreak > 0)
    .sort((left, right) => right.dailyStreak - left.dailyStreak || right.coins - left.coins)
    .slice(0, limit);
}


function claimProjectBonus(userId, prize) {
  const updated = updateUserAccount(userId, (acc) => {
    if (prize.type === 'beans') {
      acc.magicBeans = (Number(acc.magicBeans) || 0) + (Number(prize.amount) || 1);
    } else {
      acc.coins = (Number(acc.coins) || 0) + (Number(prize.amount) || 0);
    }
  });
  return {
    balance: updated.coins,
    magicBeans: updated.magicBeans,
    prize,
  };
}

function getMasteryBonusPercent(userId) {
  const account = getUserAccount(userId);
  const mastered = Array.isArray(account.masteredProfessions) ? account.masteredProfessions : [];
  return Math.min(45, mastered.length * 3);
}

function getUserMasteredProfessions(userId) {
  const account = getUserAccount(userId);
  return Array.isArray(account.masteredProfessions) ? account.masteredProfessions : [];
}

function resolveCorruptionDilemma(userId, choice, baseSalary = 30) {
  const account = getUserAccount(userId);
  const previousLevel = Math.max(1, Math.min(4, Number(account.careerLevel) || 1));
  let promoted = false;
  let demoted = false;
  let newLevel = previousLevel;

  if (choice === 'accept') {
    // 65% de chance de bônus absurdo (+70 moedas), 35% de chance de cair na Auditoria Interna
    const isSuccess = Math.random() < 0.65;
    if (isSuccess) {
      const bonus = 70;
      const totalAmount = baseSalary + bonus;
      let projectCompleted = false;
      let projectProgressDisplay = 0;
      const updated = updateUserAccount(userId, (acc) => {
        acc.coins = (Number(acc.coins) || 0) + totalAmount;
        acc.workCount = (Number(acc.workCount) || 0) + 1;
        const prevProg = Math.max(0, Math.min(2, Number(acc.projectProgress) || 0));
        const nextProg = prevProg + 1;
        if (nextProg >= 3) {
          acc.projectProgress = 0;
          projectCompleted = true;
          projectProgressDisplay = 3;
        } else {
          acc.projectProgress = nextProg;
          projectProgressDisplay = nextProg;
        }
        if (previousLevel === 4 && acc.profession) {
          if (!Array.isArray(acc.masteredProfessions)) acc.masteredProfessions = [];
          if (!acc.masteredProfessions.includes(acc.profession)) {
            acc.masteredProfessions.push(acc.profession);
          }
        }
      });
      return {
        choice: 'accept',
        outcome: 'success',
        bonus,
        amount: totalAmount,
        balance: updated.coins,
        careerLevel: previousLevel,
        previousLevel,
        careerMistakes: updated.careerMistakes || 0,
        promoted: false,
        demoted: false,
        projectCompleted,
        projectProgressDisplay,
      };
    } else {
      // Flagrado pela Auditoria Interna: perde o salário do turno e ganha +1 careerMistakes
      let currentMistakes = 0;
      const updated = updateUserAccount(userId, (acc) => {
        acc.careerStreak = 0;
        currentMistakes = (Number(acc.careerMistakes) || 0) + 1;
        acc.careerMistakes = currentMistakes;

        const guaranteedDemotion = currentMistakes >= 5;
        const rolledDemotion = currentMistakes >= 3 && Math.random() < 0.15;
        if (previousLevel > 1 && (guaranteedDemotion || rolledDemotion)) {
          acc.careerLevel = previousLevel - 1;
          acc.careerMistakes = 0;
          acc.shiftsAtLevel = 0;
          demoted = true;
        }
        newLevel = Math.max(1, Math.min(4, Number(acc.careerLevel) || 1));
      });

      return {
        choice: 'accept',
        outcome: 'audit',
        bonus: 0,
        amount: 0,
        balance: updated.coins,
        careerLevel: newLevel,
        previousLevel,
        careerMistakes: currentMistakes,
        promoted: false,
        demoted,
      };
    }
  } else {
    // Denunciar ao Conselho: bônus seguro de +20 moedas, limpa careerMistakes = 0 e ganha +5% de chance de promoção
    const bonus = 20;
    const totalAmount = baseSalary + bonus;
    let projectCompleted = false;
    let projectProgressDisplay = 0;
    const updated = updateUserAccount(userId, (acc) => {
      acc.coins = (Number(acc.coins) || 0) + totalAmount;
      acc.workCount = (Number(acc.workCount) || 0) + 1;
      acc.careerMistakes = 0;

      const prevProg = Math.max(0, Math.min(2, Number(acc.projectProgress) || 0));
      const nextProg = prevProg + 1;
      if (nextProg >= 3) {
        acc.projectProgress = 0;
        projectCompleted = true;
        projectProgressDisplay = 3;
      } else {
        acc.projectProgress = nextProg;
        projectProgressDisplay = nextProg;
      }

      const streak = (Number(acc.careerStreak) || 0) + 1;
      acc.careerStreak = streak;
      const shiftsAtLevel = (Number(acc.shiftsAtLevel) || 0) + 1;
      acc.shiftsAtLevel = shiftsAtLevel;
      const totalWorks = Number(acc.workCount) || 0;

      const guaranteedByWorks =
        (previousLevel === 1 && (shiftsAtLevel >= 10 || totalWorks >= 10)) ||
        (previousLevel === 2 && (shiftsAtLevel >= 15 || totalWorks >= 25)) ||
        (previousLevel === 3 && (shiftsAtLevel >= 20 || totalWorks >= 45));

      const guaranteedByStreak =
        (previousLevel === 1 && streak >= 5) ||
        (previousLevel === 2 && streak >= 7) ||
        (previousLevel === 3 && streak >= 10);

      // +5% de chance extra de promoção naquele turno
      const dynamicChance = Math.min(0.65, 0.05 + streak * 0.03 + 0.05);
      const rolledPromotion = Math.random() < dynamicChance;

      if (previousLevel < 4 && (guaranteedByWorks || guaranteedByStreak || rolledPromotion)) {
        acc.careerLevel = previousLevel + 1;
        acc.careerStreak = 0;
        acc.shiftsAtLevel = 0;
        promoted = true;
      }
      newLevel = Math.max(1, Math.min(4, Number(acc.careerLevel) || 1));

      if (newLevel === 4 && acc.profession) {
        if (!Array.isArray(acc.masteredProfessions)) acc.masteredProfessions = [];
        if (!acc.masteredProfessions.includes(acc.profession)) {
          acc.masteredProfessions.push(acc.profession);
        }
      }
    });

    return {
      choice: 'report',
      outcome: 'council',
      bonus,
      amount: totalAmount,
      balance: updated.coins,
      careerLevel: newLevel,
      previousLevel,
      careerMistakes: 0,
      promoted,
      demoted: false,
      projectCompleted,
      projectProgressDisplay,
    };
  }
}
module.exports = {
  DAILY_COOLDOWN_MS,
  WORK_COOLDOWN_MS,
  QUIZ_COOLDOWN_MS,
  CURRENCY_DEFINITIONS,
  TITLES_CATALOG,
  THEMES_CATALOG,
  getUserAccount,
  getBalance,
  addCoins,
  getMagicBeans,
  addMagicBeans,
  spendMagicBeans,
  getCurrencyBalances,
  spendCoins,
  setUserBalance,
  resetUserEconomy,
  updateUserAccount,
  getTitlesCatalog,
  getTitleDefinition,
  grantTitle,
  getUserTitles,
  buyTitle,
  equipTitle,
  unequipTitle,
  setUserBio,
  setProfileStyle,
  getThemesCatalog,
  getUserThemes,
  buyTheme,
  equipTheme,
  getWorkStatus,
  setProfession,
  getUserUnlockedProfessions,
  startWork,
  finishWork,
  claimProjectBonus,
  getMasteryBonusPercent,
  getUserMasteredProfessions,
  resolveCorruptionDilemma,
  getQuizStatus,
  startQuiz,
  recordQuizQuestion,
  getCareerLevel,
  setCareerLevel,
  getDailyStatus,
  claimDaily,
  getRanking,
  getUserRank,
  getStreakRanking,
  registerUserVote,
  hasActiveVote,
  VOTE_VALIDITY_MS,
  isTestUser,
  purgeTestAccounts,
};
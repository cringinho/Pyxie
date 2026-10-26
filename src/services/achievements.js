const path = require('node:path');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { ACHIEVEMENTS, CATEGORIES, TIERS, getAchievement } = require('../data/achievementsCatalog');
const { ACHIEVEMENT_TITLES } = require('../data/achievementTitles');
const { formatStyledTitle } = require('../utils/fancyText');

/**
 * Conquistas da Pyxie: lê números reais de cada sistema (economia, trabalho, Catacumbas, álbum
 * de Tarot, Casinha, cofre de itens, votos, casamento), desbloqueia o que foi alcançado e entrega
 * a recompensa uma única vez. Estado em data/achievements.json (gravado só pelo bot).
 */

const CHECK_COOLDOWN_MS = 15 * 1000;
const lastCheck = new Map();

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'achievements.json');
}

function load() {
  const stored = readJson(stateFile(), {});
  return {
    users: stored.users && typeof stored.users === 'object' ? stored.users : {},
    totals: stored.totals && typeof stored.totals === 'object' ? stored.totals : { unlocked: 0 },
  };
}

function save(state) {
  return writeJsonAtomic(stateFile(), state);
}

function userState(state, userId) {
  const id = String(userId);
  if (!state.users[id]) state.users[id] = { unlocked: {}, best: {} };
  state.users[id].unlocked = state.users[id].unlocked || {};
  state.users[id].best = state.users[id].best || {};
  return state.users[id];
}

function brtHour(now) {
  return new Date(now - 3 * 60 * 60 * 1000).getUTCHours();
}

function safe(fn, fallback) {
  try {
    return fn();
  } catch (_) {
    return fallback;
  }
}

/** Números atuais de cada sistema. Cada fonte é isolada: um módulo fora do ar não derruba as outras. */
function collectStats(userId, { now = Date.now(), best = {} } = {}) {
  const id = String(userId);
  const account = safe(() => require('./economy').getUserAccount(id), {});
  const album = safe(() => require('./tarotAlbumService').getUserAlbum(id), { discoveredCards: [] });
  const dungeon = safe(() => {
    const store = require('../modules/dungeon/dungeonStore');
    return store.getPlayerStats(id);
  }, {});
  const home = safe(() => require('../modules/home/homeStore').getHome(id), null);
  const charm = safe(() => (home ? require('../modules/home/homeEngine').computeCharm(home) : null), null);
  const collection = safe(() => require('./itemVault').getCollectionStats(id), { distinct: 0, byRarity: {}, distinctByKind: {} });
  const married = safe(() => (require('./marriage').getSpouseId(id) ? 1 : 0), 0);

  const dailyStreak = Number(account.dailyStreak) || 0;
  return {
    coins: Number(account.coins) || 0,
    workCount: Number(account.workCount) || 0,
    dailyStreak,
    bestDailyStreak: Math.max(dailyStreak, Number(best.dailyStreak) || 0),
    mastered: Array.isArray(account.masteredProfessions) ? account.masteredProfessions.length : 0,
    votes: Number(account.voteCount) || 0,
    tarotCards: Array.isArray(album.discoveredCards) ? album.discoveredCards.length : 0,
    dungeonRuns: Number(dungeon.runs) || 0,
    dungeonVictories: Number(dungeon.victories) || 0,
    dungeonBestFloor: Number(dungeon.bestFloor) || 0,
    dungeonKills: Number(dungeon.kills) || 0,
    dungeonRevives: Number(dungeon.revives) || 0,
    dungeonHelps: Number(dungeon.helps) || 0,
    homePlaced: home ? home.placements.length : 0,
    homeLikes: home ? home.likes : 0,
    homeBestCharm: Math.max(home?.bestCharm || 0, charm?.score || 0),
    homeSets: charm ? charm.activeSets.length : 0,
    itemsDistinct: collection.distinct || 0,
    petsDistinct: collection.distinctByKind?.pet || 0,
    legendaryDistinct: collection.byRarity?.legendary || 0,
    mythicDistinct: collection.byRarity?.mythic || 0,
    married,
    bondLevel: safe(() => require('../modules/marriage/coupleBond').bondLevelOf(id), 0),
    nightOwl: brtHour(now) === 3 ? 1 : 0,
  };
}

function evaluate(userId, { now = Date.now() } = {}) {
  const state = load();
  const user = state.users[String(userId)] || { unlocked: {}, best: {} };
  const stats = collectStats(userId, { now, best: user.best || {} });
  return ACHIEVEMENTS.map((entry) => {
    const current = Number(stats[entry.metric]) || 0;
    const unlockedAt = user.unlocked?.[entry.id] || null;
    return {
      entry,
      current: Math.min(current, entry.target),
      target: entry.target,
      done: Boolean(unlockedAt) || current >= entry.target,
      unlockedAt,
    };
  });
}

/**
 * Títulos que evoluem: se a pessoa está usando um degrau mais baixo da mesma série, o título
 * equipado sobe sozinho para o novo (o visual fica mais enfeitado a cada meta).
 */
function upgradeEquippedSeriesTitle(userId, title) {
  if (!title.series) return false;
  const economy = require('./economy');
  const equipped = ACHIEVEMENT_TITLES[economy.getUserAccount(userId).equippedTitle];
  if (!equipped || equipped.series !== title.series || equipped.tier >= title.tier) return false;
  return economy.equipTitle(userId, title.id).success;
}

/** Entrega a recompensa de uma conquista. Itens que esgotaram viram nada (o resto é entregue). */
function grantReward(userId, entry, now) {
  const delivered = { coins: 0, beans: 0, items: [], title: null };
  const reward = entry.reward || {};
  const economy = require('./economy');
  if (reward.coins) {
    economy.addCoins(userId, reward.coins);
    delivered.coins = reward.coins;
  }
  if (reward.beans) {
    economy.addMagicBeans(userId, reward.beans);
    delivered.beans = reward.beans;
  }
  for (const itemId of reward.items || []) {
    const result = require('./itemVault').grantItem(userId, itemId, { source: 'achievement', detail: entry.id }, now);
    if (result.ok) delivered.items.push(result.instance);
  }
  if (reward.title && ACHIEVEMENT_TITLES[reward.title]) {
    economy.grantTitle(userId, reward.title);
    delivered.title = reward.title;
    upgradeEquippedSeriesTitle(userId, ACHIEVEMENT_TITLES[reward.title]);
  }
  return delivered;
}

/**
 * Desbloqueia o que foi alcançado e entrega as recompensas. Marca como desbloqueada antes de
 * pagar, então uma conquista nunca paga duas vezes. Retorna [{ entry, delivered }].
 */
function checkAndGrant(userId, { now = Date.now() } = {}) {
  const state = load();
  const user = userState(state, userId);
  const stats = collectStats(userId, { now, best: user.best });
  user.best.dailyStreak = stats.bestDailyStreak;

  const newly = ACHIEVEMENTS.filter((entry) => !user.unlocked[entry.id] && (Number(stats[entry.metric]) || 0) >= entry.target);
  for (const entry of newly) user.unlocked[entry.id] = now;
  state.totals.unlocked = (state.totals.unlocked || 0) + newly.length;
  if (!save(state)) return [];

  return newly.map((entry) => ({ entry, delivered: grantReward(userId, entry, now) }));
}

function lang(source) {
  return require('../utils/i18n').getLanguage(source);
}

function titleDisplay(titleId, language) {
  const title = ACHIEVEMENT_TITLES[titleId];
  if (!title) return '';
  return formatStyledTitle(title.name[language === 'en' ? 'en' : 'pt'], title.style);
}

function rewardLines(delivered, language) {
  const { t } = require('../utils/i18n');
  const { getItem, itemName } = require('../modules/home/homeCatalog');
  const source = { lang: language };
  const lines = [];
  if (delivered.coins) lines.push(t('achievements.reward.coins', source, { coins: delivered.coins }));
  if (delivered.beans) lines.push(t('achievements.reward.beans', source, { beans: delivered.beans }));
  for (const instance of delivered.items) {
    const entry = getItem(instance.itemId);
    lines.push(t('achievements.reward.item', source, { name: itemName(entry, language), serial: instance.serial ? ` #${instance.serial}` : '' }));
  }
  if (delivered.title) lines.push(t('achievements.reward.title', source, { title: titleDisplay(delivered.title, language) }));
  return lines;
}

/** Embed de "conquista desbloqueada" (efêmero, só para quem conquistou). */
function buildUnlockEmbed(unlocked, source) {
  const { t } = require('../utils/i18n');
  const language = lang(source);
  const blocks = unlocked.map(({ entry, delivered }) => {
    const tier = TIERS[entry.tier];
    const head = t('achievements.unlock.line', { lang: language }, {
      tier: tier.emoji,
      name: entry.name[language === 'en' ? 'en' : 'pt'],
      desc: entry.desc[language === 'en' ? 'en' : 'pt'],
    });
    const rewards = rewardLines(delivered, language);
    return [head, ...rewards].join('\n\n');
  });
  const isMythic = unlocked.some(({ entry }) => entry.tier === 'mythic');
  return new EmbedBuilder()
    .setColor(isMythic ? TIERS.mythic.color : TIERS.gold.color)
    .setTitle(t(unlocked.length > 1 ? 'achievements.unlock.titleMany' : 'achievements.unlock.title', { lang: language }, { count: unlocked.length }))
    .setDescription([...blocks, t('achievements.unlock.tip', { lang: language })].join('\n\n'))
    .setTimestamp();
}

/**
 * Verifica conquistas depois de uma interação e avisa com uma mensagem privada.
 * Limitado a uma verificação a cada 15s por pessoa (cada verificação lê vários arquivos).
 */
async function notifyNewAchievements(interaction, { now = Date.now() } = {}) {
  const userId = interaction?.user?.id;
  if (!userId) return [];
  // Só depois que a interação já foi respondida: o aviso vai como followUp privado
  if (!interaction.replied && !interaction.deferred) return [];
  const last = lastCheck.get(userId) || 0;
  if (now - last < CHECK_COOLDOWN_MS) return [];
  lastCheck.set(userId, now);
  if (lastCheck.size > 5000) {
    for (const [key, ts] of lastCheck) if (now - ts > CHECK_COOLDOWN_MS) lastCheck.delete(key);
  }

  const unlocked = checkAndGrant(userId, { now });
  if (!unlocked.length) return [];
  const payload = { embeds: [buildUnlockEmbed(unlocked, interaction)], flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };
  await interaction.followUp(payload).catch(() => null);
  return unlocked;
}

/** Mesma verificação para comandos por prefixo (py!). */
async function notifyForMessage(message, { now = Date.now() } = {}) {
  const userId = message?.author?.id;
  if (!userId || message.author.bot) return [];
  const last = lastCheck.get(userId) || 0;
  if (now - last < CHECK_COOLDOWN_MS) return [];
  lastCheck.set(userId, now);
  const unlocked = checkAndGrant(userId, { now });
  if (!unlocked.length) return [];
  await message.reply({ embeds: [buildUnlockEmbed(unlocked, message)], allowedMentions: { parse: [], repliedUser: false } }).catch(() => null);
  return unlocked;
}

function getUserSummary(userId) {
  const results = evaluate(userId);
  const done = results.filter((r) => r.done).length;
  return { done, total: results.length, results };
}

/** Números reais para o /admin e o system-truth. */
function getAchievementStats() {
  const state = load();
  const users = Object.values(state.users);
  const byAchievement = {};
  for (const user of users) {
    for (const achievementId of Object.keys(user.unlocked || {})) {
      byAchievement[achievementId] = (byAchievement[achievementId] || 0) + 1;
    }
  }
  const mythicIds = new Set(ACHIEVEMENTS.filter((entry) => entry.tier === 'mythic').map((entry) => entry.id));
  return {
    catalog: ACHIEVEMENTS.length,
    players: users.filter((user) => Object.keys(user.unlocked || {}).length > 0).length,
    unlocked: state.totals.unlocked || 0,
    mythicUnlocked: Object.entries(byAchievement).filter(([idKey]) => mythicIds.has(idKey)).reduce((acc, [, n]) => acc + n, 0),
    byAchievement,
  };
}

function resetForTests() {
  lastCheck.clear();
}

module.exports = {
  CATEGORIES,
  TIERS,
  collectStats,
  evaluate,
  checkAndGrant,
  titleDisplay,
  rewardLines,
  buildUnlockEmbed,
  notifyNewAchievements,
  notifyForMessage,
  getUserSummary,
  getAchievementStats,
  getAchievement,
  resetForTests,
};

const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const { withFileLock } = require('../../utils/fileLock');
const { getBrtDateKey } = require('../../utils/brtDate');
const economy = require('../../services/economy');
const { BOSSES, STANCES, INTENTS } = require('./bossData');

/**
 * Chefe semanal de cada servidor (data/guildBoss.json).
 *
 * - Um chefe por semana (segunda 00:00 BRT), escolhido pela semana e pelo servidor.
 * - Vida base + um tanto por pessoa nova que entra na luta: servidor pequeno e grande têm
 *   o mesmo desafio por cabeça.
 * - 3 ataques por pessoa por dia (BRT). A intenção do dia diz qual postura dá dano dobrado.
 * - Quando cai, todo mundo que bateu recebe na hora: moedinhas e Ecos modestos, bônus para o
 *   pódio e itens para a Casinha. O total por semana tem teto (AGENTS.md §5).
 * - Se a semana vira sem vitória, o chefe vai embora sem recompensa e fica o ranking.
 */

const SETTINGS = {
  baseHp: 2000,
  hpPerFighter: 600,
  attacksPerDay: 3,
  participantCoins: 40,
  podiumCoins: [60, 40, 20],
  participantEchoes: 3,
  weeklyCoinCap: 2000,
};

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guildBoss.json');
}

function load() {
  const stored = readJson(stateFile(), {});
  return {
    guilds: stored.guilds && typeof stored.guilds === 'object' ? stored.guilds : {},
    totals: { spawned: 0, defeated: 0, attacks: 0, coinsPaid: 0, ...(stored.totals || {}) },
  };
}

function save(state) {
  return writeJsonAtomic(stateFile(), state);
}

function hash(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mesma semana do ranking das Catacumbas (segunda 00:00 BRT). */
function weekKey(now = Date.now()) {
  return require('../dungeon/dungeonStore').brtWeekKey(now);
}

function pickBoss(guildId, week) {
  return BOSSES[hash(`${guildId}:${week}`) % BOSSES.length];
}

/** Intenção do dia (igual para o servidor inteiro naquele dia). */
function intentFor(guildId, now = Date.now()) {
  const keys = Object.keys(INTENTS);
  return keys[hash(`${guildId}:${getBrtDateKey(now)}`) % keys.length];
}

function freshBoss(guildId, week, now) {
  const boss = pickBoss(guildId, week);
  return {
    week,
    bossId: boss.id,
    maxHp: SETTINGS.baseHp,
    hp: SETTINGS.baseHp,
    startedAt: now,
    defeatedAt: null,
    killerId: null,
    damage: {},
    attacks: {},
    rewards: null,
    lastWeek: null,
  };
}

/** Boss atual do servidor; na virada da semana guarda o resumo da anterior e chama outro. */
function currentBoss(state, guildId, now) {
  const id = String(guildId);
  const week = weekKey(now);
  let entry = state.guilds[id];
  if (!entry || entry.week !== week) {
    const previous = entry
      ? { week: entry.week, bossId: entry.bossId, defeated: Boolean(entry.defeatedAt), top: ranking(entry).slice(0, 3) }
      : null;
    entry = freshBoss(id, week, now);
    entry.lastWeek = previous;
    state.guilds[id] = entry;
    state.totals.spawned += 1;
  }
  return entry;
}

function ranking(entry) {
  return Object.entries(entry.damage || {})
    .map(([userId, damage]) => ({ userId, damage }))
    .sort((a, b) => b.damage - a.damage);
}

function attacksLeft(entry, userId, now) {
  const today = getBrtDateKey(now);
  const used = entry.attacks?.[String(userId)];
  return SETTINGS.attacksPerDay - (used && used.day === today ? used.count : 0);
}

/** Força de quem ataca: recorde nas Catacumbas e talentos contam um pouco. */
function attackPower(userId) {
  try {
    const stats = require('../dungeon/dungeonStore').getPlayerStats(userId);
    return 40 + 8 * (Number(stats.bestFloor) || 0) + 5 * Math.min(10, Number(stats.victories) || 0);
  } catch (_) {
    return 40;
  }
}

/** Fotografia para a tela: chefe, vida, intenção, ranking e ataques da pessoa. */
function getStatus(guildId, userId, now = Date.now()) {
  const entry = withFileLock(stateFile(), () => {
    const state = load();
    const before = state.guilds[String(guildId)]?.week;
    const current = currentBoss(state, guildId, now);
    if (before !== current.week) save(state);
    return current;
  });
  const rows = ranking(entry);
  const position = rows.findIndex((r) => r.userId === String(userId)) + 1;
  return {
    ...entry,
    intent: intentFor(guildId, now),
    ranking: rows,
    position,
    myDamage: Number(entry.damage[String(userId)]) || 0,
    attacksLeft: attacksLeft(entry, userId, now),
    fighters: rows.length,
  };
}

/**
 * Um ataque. A trava do arquivo garante que dois golpes ao mesmo tempo não derrubam o chefe
 * duas vezes nem pagam duas vezes.
 */
function attack(guildId, userId, stance, now = Date.now(), random = Math.random) {
  if (!STANCES[stance]) return { ok: false, reason: 'invalid' };
  const file = stateFile();
  return withFileLock(file, () => {
    const state = load();
    const entry = currentBoss(state, guildId, now);
    const id = String(userId);
    if (entry.defeatedAt) return { ok: false, reason: 'defeated' };
    if (attacksLeft(entry, id, now) <= 0) return { ok: false, reason: 'no_attacks' };

    const intent = intentFor(guildId, now);
    const counter = STANCES[stance].beats === intent;
    const weak = INTENTS[intent].weak === stance;
    const mult = counter ? 2 : weak ? 0.5 : 1;
    const crit = random() < 0.1;
    const base = attackPower(id) + Math.floor(random() * 31);
    let damage = Math.max(1, Math.round(base * mult * (crit ? 1.5 : 1)));

    // Gente nova na luta deixa o chefe mais forte (antes do golpe dela)
    if (!entry.damage[id]) {
      entry.maxHp += SETTINGS.hpPerFighter;
      entry.hp += SETTINGS.hpPerFighter;
    }
    damage = Math.min(damage, entry.hp);
    entry.hp -= damage;
    entry.damage[id] = (Number(entry.damage[id]) || 0) + damage;
    const today = getBrtDateKey(now);
    const used = entry.attacks[id] && entry.attacks[id].day === today ? entry.attacks[id].count : 0;
    entry.attacks[id] = { day: today, count: used + 1 };
    state.totals.attacks += 1;

    let rewards = null;
    if (entry.hp <= 0) {
      entry.hp = 0;
      entry.defeatedAt = now;
      entry.killerId = id;
      state.totals.defeated += 1;
      rewards = planRewards(entry);
      entry.rewards = rewards;
      state.totals.coinsPaid += rewards.reduce((acc, r) => acc + r.coins, 0);
    }
    if (!save(state)) return { ok: false, reason: 'save' };
    if (rewards) deliverRewards(rewards, guildId, entry.week);
    require('../../services/battlePass').safeAddXp(id, 'boss', { now });
    return { ok: true, damage, counter, weak, crit, intent, defeated: Boolean(rewards), rewards, hp: entry.hp, maxHp: entry.maxHp };
  });
}

/** Moedinhas e Ecos para todo mundo que bateu, pódio com extra, teto semanal por servidor. */
function planRewards(entry) {
  const rows = ranking(entry);
  let budget = SETTINGS.weeklyCoinCap;
  return rows.map((row, index) => {
    const wanted = SETTINGS.participantCoins + (SETTINGS.podiumCoins[index] || 0);
    const coins = Math.max(0, Math.min(wanted, budget));
    budget -= coins;
    const items = ['boss_banner'];
    if (index === 0) items.push('boss_trophy');
    return { userId: row.userId, place: index + 1, damage: row.damage, coins, echoes: SETTINGS.participantEchoes, items };
  });
}

/** Entrega depois de gravar a vitória: se algo falhar no meio, a vitória já está registrada. */
function deliverRewards(rewards, guildId, week) {
  const vault = require('../../services/itemVault');
  let dungeon = null;
  try {
    dungeon = require('../dungeon/dungeonStore');
  } catch (_) {
    dungeon = null;
  }
  for (const reward of rewards) {
    try {
      if (reward.coins > 0) economy.addCoins(reward.userId, reward.coins);
      if (dungeon?.addEchoes) dungeon.addEchoes(reward.userId, reward.echoes);
      for (const itemId of reward.items) vault.grantItem(reward.userId, itemId, { source: 'boss', detail: `${guildId}:${week}` });
    } catch (err) {
      console.error('[guildBoss] Falha ao entregar recompensa:', err.message);
    }
  }
}

/** Números reais para o /admin, Visual DB e /api/public/system-truth. */
function getBossStats(now = Date.now()) {
  const state = load();
  const week = weekKey(now);
  const thisWeek = Object.values(state.guilds).filter((g) => g.week === week);
  return {
    ...state.totals,
    activeThisWeek: thisWeek.length,
    defeatedThisWeek: thisWeek.filter((g) => g.defeatedAt).length,
  };
}

module.exports = {
  SETTINGS,
  stateFile,
  weekKey,
  intentFor,
  getStatus,
  attack,
  planRewards,
  getBossStats,
};

const fs = require('node:fs');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const { withFileLock } = require('../utils/fileLock');

/**
 * Recursos por servidor, escolhidos pela administração no /py-setup:
 *
 * - Modo do Mundo Pyxie (MMO): `full` (padrão), `classic` (só moedinhas pelo trabalho e perfil
 *   padrão) e um teste de 7 dias que servidores no modo clássico podem ativar uma única vez.
 * - Grupos de comandos desligáveis por servidor (minigames, casamento, tarot).
 * - Canais permitidos por grupo (RPG/MMO e minigames). Threads herdam o canal pai.
 * - Procura: quantas pessoas tentaram usar o Mundo Pyxie num servidor clássico (prova social
 *   para quem administra decidir com números do próprio servidor).
 *
 * O estado mora em data/guildFeatures.json, lido de novo quando o arquivo muda (bot e web
 * compartilham o arquivo) e gravado sob trava entre processos.
 */

const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
const DEMAND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CHANNELS = 10;
const MAX_DEMAND_ENTRIES = 50;

const MMO_MODES = ['full', 'classic'];

/**
 * Grupos de comandos controlados por servidor. Comandos novos entram marcando `mmo: true` ou
 * `featureGroup: '<grupo>'` no próprio arquivo; a lista de nomes cobre os comandos antigos.
 */
const FEATURE_GROUPS = {
  mmo: {
    emoji: '🗺️',
    toggleable: false, // controlado pelo modo (completo, teste ou clássico)
    channelScoped: true,
    names: ['py-dungeon', 'py-home', 'py-boss', 'py-craft', 'py-market', 'py-festival'],
  },
  games: {
    emoji: '🎲',
    toggleable: true,
    channelScoped: true,
    names: [
      'py-jokenpo', 'py-cookie', 'py-likely', 'py-dice', 'py-coinflip', 'py-quiz', 'py-duel',
      'py-challenge', 'py-anime', 'py-ship', 'py-sixseven', 'matematica', 'jogodavelha', 'campominado',
    ],
  },
  marriage: {
    emoji: '💍',
    toggleable: true,
    channelScoped: false,
    names: ['py-marriage', 'py-divorce', 'py-child'],
  },
  tarot: {
    emoji: '🔮',
    toggleable: true,
    channelScoped: false,
    names: ['py-tarot', 'py-album'],
  },
};

const NAME_TO_GROUP = new Map();
for (const [group, def] of Object.entries(FEATURE_GROUPS)) {
  for (const name of def.names) NAME_TO_GROUP.set(name, group);
}

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guildFeatures.json');
}

let cache = null;
let cacheMtime = 0;
let cacheFile = null;

function load() {
  const file = stateFile();
  let mtime = 0;
  try {
    mtime = fs.statSync(file).mtimeMs;
  } catch (_) {
    mtime = -1;
  }
  if (cache && cacheFile === file && mtime === cacheMtime) return cache;
  const stored = readJson(file, {});
  cache = { guilds: stored.guilds && typeof stored.guilds === 'object' ? stored.guilds : {} };
  cacheMtime = mtime;
  cacheFile = file;
  return cache;
}

function save(state) {
  const ok = writeJsonAtomic(stateFile(), state);
  cache = null; // a próxima leitura pega o mtime novo
  return ok;
}

function normalize(raw = {}) {
  return {
    mmoMode: MMO_MODES.includes(raw.mmoMode) ? raw.mmoMode : 'full',
    mmoTrialUntil: Number(raw.mmoTrialUntil) || 0,
    mmoTrialUsed: Boolean(raw.mmoTrialUsed),
    mmoChangedAt: Number(raw.mmoChangedAt) || 0,
    mmoChangedBy: raw.mmoChangedBy || null,
    disabled: Array.isArray(raw.disabled) ? raw.disabled.filter((g) => FEATURE_GROUPS[g]?.toggleable) : [],
    channels: {
      mmo: Array.isArray(raw.channels?.mmo) ? raw.channels.mmo.map(String).slice(0, MAX_CHANNELS) : [],
      games: Array.isArray(raw.channels?.games) ? raw.channels.games.map(String).slice(0, MAX_CHANNELS) : [],
    },
    demand: Array.isArray(raw.demand) ? raw.demand.filter((d) => d && d.userId && Number(d.at)) : [],
  };
}

function getGuildFeatures(guildId) {
  if (!guildId) return normalize();
  return normalize(load().guilds[String(guildId)]);
}

/** Lê, altera e grava a configuração de um servidor sob a trava do arquivo. */
function mutate(guildId, fn) {
  const file = stateFile();
  return withFileLock(file, () => {
    cache = null;
    const state = load();
    const id = String(guildId);
    const current = normalize(state.guilds[id]);
    const result = fn(current);
    state.guilds[id] = current;
    save(state);
    return result === undefined ? current : result;
  });
}

/** Estado efetivo do Mundo Pyxie: `full`, `trial` (teste em andamento) ou `classic`. */
function getMmoState(guildId, now = Date.now()) {
  if (!guildId) return 'full';
  const features = getGuildFeatures(guildId);
  if (features.mmoMode === 'full') return 'full';
  if (features.mmoTrialUntil > now) return 'trial';
  return 'classic';
}

function isMmoActive(guildId, now = Date.now()) {
  return getMmoState(guildId, now) !== 'classic';
}

function setMmoMode(guildId, mode, { by = null, now = Date.now() } = {}) {
  if (!guildId || !MMO_MODES.includes(mode)) return null;
  return mutate(guildId, (features) => {
    features.mmoMode = mode;
    features.mmoChangedAt = now;
    features.mmoChangedBy = by ? String(by) : null;
    // Ativar de vez encerra o teste; voltar ao clássico também
    features.mmoTrialUntil = 0;
  });
}

/** Teste de 7 dias para servidores no modo clássico. Uma vez por servidor. */
function startMmoTrial(guildId, { by = null, now = Date.now() } = {}) {
  if (!guildId) return { ok: false, reason: 'no_guild' };
  return mutate(guildId, (features) => {
    if (features.mmoMode === 'full') return { ok: false, reason: 'already_full' };
    if (features.mmoTrialUntil > now) return { ok: false, reason: 'trial_running', until: features.mmoTrialUntil };
    if (features.mmoTrialUsed) return { ok: false, reason: 'trial_used' };
    features.mmoTrialUsed = true;
    features.mmoTrialUntil = now + TRIAL_MS;
    features.mmoChangedAt = now;
    features.mmoChangedBy = by ? String(by) : null;
    return { ok: true, until: features.mmoTrialUntil };
  });
}

function setGroupEnabled(guildId, group, enabled) {
  if (!guildId || !FEATURE_GROUPS[group]?.toggleable) return null;
  return mutate(guildId, (features) => {
    const set = new Set(features.disabled);
    if (enabled) set.delete(group);
    else set.add(group);
    features.disabled = [...set];
  });
}

function isGroupEnabled(guildId, group, now = Date.now()) {
  if (!guildId || !FEATURE_GROUPS[group]) return true;
  if (group === 'mmo') return isMmoActive(guildId, now);
  return !getGuildFeatures(guildId).disabled.includes(group);
}

function setGroupChannels(guildId, group, channelIds = []) {
  if (!guildId || !FEATURE_GROUPS[group]?.channelScoped) return null;
  const ids = [...new Set((channelIds || []).map(String).filter((id) => /^\d{5,25}$/.test(id)))].slice(0, MAX_CHANNELS);
  return mutate(guildId, (features) => {
    features.channels[group] = ids;
  });
}

/** Threads contam como o canal pai: a dungeon roda em threads abertas no canal liberado. */
function isChannelAllowed(guildId, group, channel) {
  if (!guildId || !FEATURE_GROUPS[group]?.channelScoped) return true;
  const allowed = getGuildFeatures(guildId).channels[group] || [];
  if (allowed.length === 0) return true;
  if (!channel) return true;
  const ids = [channel.id, channel.parentId].filter(Boolean).map(String);
  return ids.some((id) => allowed.includes(id));
}

/** Grupo de um comando: marcação no próprio comando, depois nome canônico e apelidos. */
function getCommandGroup(command) {
  if (!command) return null;
  if (typeof command === 'string') return NAME_TO_GROUP.get(command) || null;
  if (command.featureGroup && FEATURE_GROUPS[command.featureGroup]) return command.featureGroup;
  if (command.mmo === true) return 'mmo';
  const names = [command.name, command.data?.name, ...(Array.isArray(command.aliases) ? command.aliases : [])].filter(Boolean);
  for (const name of names) {
    const group = NAME_TO_GROUP.get(name);
    if (group) return group;
  }
  return null;
}

/**
 * Pode rodar este comando aqui? DMs e instalações de usuário sem servidor sempre podem.
 * Devolve { allowed, reason?: 'classic'|'disabled'|'channel', group?, channels? }.
 */
function checkCommandAccess({ guildId, channel = null, command, now = Date.now() } = {}) {
  const group = getCommandGroup(command);
  if (!guildId || !group) return { allowed: true, group };
  if (group === 'mmo' && !isMmoActive(guildId, now)) {
    return { allowed: false, reason: 'classic', group };
  }
  if (group !== 'mmo' && !isGroupEnabled(guildId, group, now)) {
    return { allowed: false, reason: 'disabled', group };
  }
  if (!isChannelAllowed(guildId, group, channel)) {
    return { allowed: false, reason: 'channel', group, channels: getGuildFeatures(guildId).channels[group] };
  }
  return { allowed: true, group };
}

/** Registra que alguém tentou usar o Mundo Pyxie num servidor clássico. */
function recordMmoDemand(guildId, userId, now = Date.now()) {
  if (!guildId || !userId) return 0;
  return mutate(guildId, (features) => {
    const cutoff = now - DEMAND_WINDOW_MS;
    const recent = features.demand.filter((d) => d.at >= cutoff && d.userId !== String(userId));
    recent.push({ userId: String(userId), at: now });
    features.demand = recent.slice(-MAX_DEMAND_ENTRIES);
    return features.demand.length;
  });
}

/** Pessoas diferentes que pediram o Mundo Pyxie nos últimos 7 dias. */
function getMmoDemand(guildId, now = Date.now()) {
  const cutoff = now - DEMAND_WINDOW_MS;
  return getGuildFeatures(guildId).demand.filter((d) => d.at >= cutoff).length;
}

/** Números reais para o /admin, a Verdade Absoluta do site e o Visual DB. */
function getFeatureStats(now = Date.now()) {
  const guilds = load().guilds;
  const stats = { configured: 0, full: 0, trial: 0, classic: 0, trialsUsed: 0, demandRecent: 0, disabledGroups: {}, channelScoped: 0 };
  for (const guildId of Object.keys(guilds)) {
    const features = normalize(guilds[guildId]);
    stats.configured += 1;
    stats[getMmoState(guildId, now)] += 1;
    if (features.mmoTrialUsed) stats.trialsUsed += 1;
    stats.demandRecent += features.demand.filter((d) => d.at >= now - DEMAND_WINDOW_MS).length;
    for (const group of features.disabled) stats.disabledGroups[group] = (stats.disabledGroups[group] || 0) + 1;
    if (features.channels.mmo.length || features.channels.games.length) stats.channelScoped += 1;
  }
  return stats;
}

module.exports = {
  TRIAL_MS,
  DEMAND_WINDOW_MS,
  MAX_CHANNELS,
  FEATURE_GROUPS,
  stateFile,
  getGuildFeatures,
  getMmoState,
  isMmoActive,
  setMmoMode,
  startMmoTrial,
  setGroupEnabled,
  isGroupEnabled,
  setGroupChannels,
  isChannelAllowed,
  getCommandGroup,
  checkCommandAccess,
  recordMmoDemand,
  getMmoDemand,
  getFeatureStats,
};

// Persistência e envio do estúdio de mensagens.
// data/guilds/<guildId>/messages.json → { messages: { <id>: doc + history + sent } } (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');
const studio = require('./messageStudio');

const HISTORY_LIMIT = 10;
const SENT_LIMIT = 20;
const API = 'https://discord.com/api/v10';

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'messages.json');
}

function load(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return raw && typeof raw.messages === 'object' ? raw : { messages: {} };
  } catch (_) {
    return { messages: {} };
  }
}

function save(guildId, state) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

function listMessages(guildId) {
  return Object.values(load(guildId).messages)
    .map((m) => ({ id: m.id, name: m.name, mode: m.mode, updatedAt: m.updatedAt, sentCount: (m.sent || []).length }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function getMessage(guildId, id) {
  return load(guildId).messages[id] || null;
}

// Salva (cria ou atualiza). A versão anterior vai para o histórico (máx. 10).
// Devolve { ok, doc } ou { ok: false, errors }.
function saveMessage(guildId, raw, { by = null } = {}) {
  const doc = studio.normalizeMessage(raw);
  const errors = studio.validateMessage(doc);
  if (errors.length) return { ok: false, errors };
  const state = load(guildId);
  const prev = state.messages[doc.id];
  const now = Date.now();
  const history = prev ? [{ ...stripMeta(prev), savedAt: prev.updatedAt || now }, ...(prev.history || [])].slice(0, HISTORY_LIMIT) : [];
  state.messages[doc.id] = {
    ...doc,
    history,
    sent: prev?.sent || [],
    createdAt: prev?.createdAt || now,
    updatedAt: now,
    updatedBy: by,
  };
  save(guildId, state);
  return { ok: true, doc: state.messages[doc.id] };
}

function stripMeta(m) {
  const { history, sent, createdAt, updatedAt, updatedBy, ...rest } = m;
  return rest;
}

function restoreVersion(guildId, id, index, { by = null } = {}) {
  const current = getMessage(guildId, id);
  const version = current?.history?.[index];
  if (!version) return { ok: false, errors: [{ code: 'version_not_found', path: 'history' }] };
  const { savedAt, ...doc } = version;
  return saveMessage(guildId, { ...doc, id }, { by });
}

function deleteMessage(guildId, id) {
  const state = load(guildId);
  if (!state.messages[id]) return false;
  delete state.messages[id];
  save(guildId, state);
  return true;
}

function recordSent(guildId, id, entry) {
  const state = load(guildId);
  const m = state.messages[id];
  if (!m) return;
  m.sent = [entry, ...(m.sent || []).filter((s) => s.messageId !== entry.messageId)].slice(0, SENT_LIMIT);
  save(guildId, state);
}

// ---------- REST do Discord ----------

async function discord(method, route, body, fetchImpl = fetch) {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    const err = new Error('discord_token_missing');
    err.code = 'discord_token_missing';
    throw err;
  }
  const res = await fetchImpl(`${API}${route}`, {
    method,
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `discord_${res.status}`);
    err.code = `discord_${data.code || res.status}`;
    err.status = res.status;
    throw err;
  }
  return data;
}

async function getContext(guildId, fetchImpl) {
  const [guild, me] = await Promise.all([
    discord('GET', `/guilds/${guildId}`, null, fetchImpl).catch(() => null),
    discord('GET', '/users/@me', null, fetchImpl).catch(() => null),
  ]);
  return {
    guild: guild
      ? { name: guild.name, iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256` : '' }
      : null,
    botAvatarUrl: me?.avatar ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=256` : '',
    now: new Date(),
  };
}

// Confere que o canal pertence ao servidor antes de enviar (um admin não manda em canal de outra guild).
async function assertChannelInGuild(guildId, channelId, fetchImpl) {
  const channel = await discord('GET', `/channels/${channelId}`, null, fetchImpl);
  if (String(channel.guild_id) !== String(guildId)) {
    const err = new Error('channel_not_in_guild');
    err.code = 'channel_not_in_guild';
    throw err;
  }
  return channel;
}

async function sendMessage(guildId, id, channelId, { fetchImpl = fetch, by = null } = {}) {
  const doc = getMessage(guildId, id);
  if (!doc) throw Object.assign(new Error('message_not_found'), { code: 'message_not_found' });
  await assertChannelInGuild(guildId, channelId, fetchImpl);
  const payload = studio.buildPayload(doc, await getContext(guildId, fetchImpl));
  const sent = await discord('POST', `/channels/${channelId}/messages`, payload, fetchImpl);
  recordSent(guildId, id, { channelId, messageId: sent.id, mode: doc.mode, sentAt: Date.now(), by });
  return { channelId, messageId: sent.id };
}

// Atualiza as mensagens já enviadas com a versão salva (o Discord não troca o formato de uma mensagem já enviada).
async function updateSent(guildId, id, { fetchImpl = fetch } = {}) {
  const doc = getMessage(guildId, id);
  if (!doc) throw Object.assign(new Error('message_not_found'), { code: 'message_not_found' });
  const payload = studio.buildPayload(doc, await getContext(guildId, fetchImpl));
  if (doc.mode === 'classic') {
    payload.content = payload.content || '';
    payload.embeds = payload.embeds || [];
    payload.components = payload.components || [];
  }
  const results = [];
  for (const s of doc.sent || []) {
    if (s.mode && s.mode !== doc.mode) {
      results.push({ ...s, ok: false, error: 'mode_changed' });
      continue;
    }
    try {
      await discord('PATCH', `/channels/${s.channelId}/messages/${s.messageId}`, payload, fetchImpl);
      results.push({ ...s, ok: true });
    } catch (err) {
      results.push({ ...s, ok: false, error: err.code });
    }
  }
  return results;
}

// Prévia real no canal de homologação: menções viram texto entre crases e ninguém é marcado.
async function sendHomologationPreview(guildId, id, { fetchImpl = fetch } = {}) {
  const { HOMOLOGATION_CHANNEL_ID } = require('../config/scopes');
  const { shieldAntiPing } = require('../utils/homologationPreviewDispatcher');
  const doc = getMessage(guildId, id);
  if (!doc) throw Object.assign(new Error('message_not_found'), { code: 'message_not_found' });
  const payload = studio.buildPayload(doc, await getContext(guildId, fetchImpl));
  const shielded = JSON.parse(JSON.stringify(payload), (key, value) => (typeof value === 'string' && key !== 'url' ? shieldAntiPing(value) : value));
  shielded.allowed_mentions = { parse: [], users: [], roles: [], replied_user: false };
  const sent = await discord('POST', `/channels/${HOMOLOGATION_CHANNEL_ID}/messages`, shielded, fetchImpl);
  return { channelId: HOMOLOGATION_CHANNEL_ID, messageId: sent.id };
}

module.exports = {
  listMessages,
  getMessage,
  saveMessage,
  restoreVersion,
  deleteMessage,
  recordSent,
  sendMessage,
  updateSent,
  sendHomologationPreview,
  discord,
};

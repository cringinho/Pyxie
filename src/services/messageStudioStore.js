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

function listGuildsWithMessages() {
  const root = path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds');
  try {
    return fs.readdirSync(root).filter((id) => /^\d{17,20}$/.test(id) && fs.existsSync(path.join(root, id, 'messages.json')));
  } catch (_) {
    return [];
  }
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
  if (res.status === 204) return {};
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

// Texto puxado da última mensagem de uma pessoa num tópico de fórum (delivery.source).
async function readForumSource(source, fetchImpl) {
  if (!source?.threadId || !source?.authorId) return null;
  const list = await discord('GET', `/channels/${source.threadId}/messages?limit=50`, null, fetchImpl).catch(() => []);
  const msg = (Array.isArray(list) ? list : []).find((m) => m.author?.id === source.authorId);
  if (!msg) return null;
  const links = (msg.attachments || []).map((a) => a.url);
  return { content: [msg.content, ...links].filter(Boolean).join('\n'), embeds: (msg.embeds || []).slice(0, 9) };
}

function applySource(doc, payload, src) {
  if (!src) return payload;
  if (doc.mode === 'v2') {
    payload.components[0].components.unshift({ type: 10, content: src.content.slice(0, 3900) });
    return payload;
  }
  let content = src.content;
  const embeds = [...src.embeds, ...(payload.embeds || [])];
  if (content.length > 2000) {
    embeds.unshift({ color: 0x8b5cf6, description: content.slice(0, 4096) });
    content = '';
  }
  return { ...payload, content: content || payload.content, embeds: embeds.slice(0, 10) };
}

// Webhook da própria Pyxie no canal (só webhook da aplicação aceita botões interativos).
async function getStudioWebhook(channelId, fetchImpl) {
  const channel = await discord('GET', `/channels/${channelId}`, null, fetchImpl);
  const isThread = [10, 11, 12].includes(channel.type);
  const parentId = isThread ? channel.parent_id : channelId;
  const me = await discord('GET', '/users/@me', null, fetchImpl);
  const hooks = await discord('GET', `/channels/${parentId}/webhooks`, null, fetchImpl);
  let hook = hooks.find((h) => h.application_id === me.id && h.token);
  if (!hook) hook = await discord('POST', `/channels/${parentId}/webhooks`, { name: 'Pyxie Studio' }, fetchImpl);
  return { hook, threadId: isThread ? channelId : null };
}

async function buildDelivery(guildId, doc, fetchImpl) {
  let payload = studio.buildPayload(doc, await getContext(guildId, fetchImpl));
  payload = applySource(doc, payload, await readForumSource(doc.delivery.source, fetchImpl));
  return payload;
}

async function postPayload(doc, channelId, payload, fetchImpl) {
  const identity = doc.envelope.identity;
  if (!identity?.useWebhook) {
    const sent = await discord('POST', `/channels/${channelId}/messages`, payload, fetchImpl);
    return { messageId: sent.id };
  }
  const { hook, threadId } = await getStudioWebhook(channelId, fetchImpl);
  const query = `?wait=true&with_components=true${threadId ? `&thread_id=${threadId}` : ''}`;
  const body = { ...payload };
  if (identity.username) body.username = identity.username.slice(0, 80);
  if (identity.avatarUrl && /^https:\/\//.test(identity.avatarUrl)) body.avatar_url = identity.avatarUrl;
  const sent = await discord('POST', `/webhooks/${hook.id}/${hook.token}${query}`, body, fetchImpl);
  return { messageId: sent.id, webhookId: hook.id, threadId };
}

async function sendMessage(guildId, id, channelId, { fetchImpl = fetch, by = null, payloadOverride = null, record = true } = {}) {
  const doc = getMessage(guildId, id);
  if (!doc) throw Object.assign(new Error('message_not_found'), { code: 'message_not_found' });
  await assertChannelInGuild(guildId, channelId, fetchImpl);
  const payload = payloadOverride ? payloadOverride(await buildDelivery(guildId, doc, fetchImpl)) : await buildDelivery(guildId, doc, fetchImpl);
  const sent = await postPayload(doc, channelId, payload, fetchImpl);
  if (record) recordSent(guildId, id, { channelId, messageId: sent.messageId, webhookId: sent.webhookId || null, threadId: sent.threadId || null, mode: doc.mode, sentAt: Date.now(), by });
  return { channelId, messageId: sent.messageId };
}

async function deleteChannelMessage(channelId, messageId, fetchImpl = fetch) {
  await discord('DELETE', `/channels/${channelId}/messages/${messageId}`, null, fetchImpl).catch(() => null);
}

// Atualiza as mensagens já enviadas com a versão salva (o Discord não troca o formato de uma mensagem já enviada).
async function updateSent(guildId, id, { fetchImpl = fetch } = {}) {
  const doc = getMessage(guildId, id);
  if (!doc) throw Object.assign(new Error('message_not_found'), { code: 'message_not_found' });
  const payload = await buildDelivery(guildId, doc, fetchImpl);
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
      if (s.webhookId) {
        const hook = await discord('GET', `/webhooks/${s.webhookId}`, null, fetchImpl);
        const q = `?with_components=true${s.threadId ? `&thread_id=${s.threadId}` : ''}`;
        await discord('PATCH', `/webhooks/${hook.id}/${hook.token}/messages/${s.messageId}${q}`, payload, fetchImpl);
      } else {
        await discord('PATCH', `/channels/${s.channelId}/messages/${s.messageId}`, payload, fetchImpl);
      }
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
  listGuildsWithMessages,
  listMessages,
  getMessage,
  saveMessage,
  restoreVersion,
  deleteMessage,
  recordSent,
  sendMessage,
  deleteChannelMessage,
  updateSent,
  sendHomologationPreview,
  discord,
};

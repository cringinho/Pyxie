// Apelações de banimento: regras e armazenamento (só o processo do bot grava).
// data/guilds/<id>/appeals.json guarda os pedidos; um pendente por pessoa e, depois de uma
// recusa, 30 dias até poder pedir de novo. O texto da pessoa vai só para o canal da staff.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_TEXT = 20;
const MAX_TEXT = 1500;
const MAX_STORED = 300;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'appeals.json');
}

function read(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return Array.isArray(raw.appeals) ? raw.appeals : [];
  } catch (_) {
    return [];
  }
}

function write(guildId, appeals) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ appeals: appeals.slice(0, MAX_STORED) }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

function latestFor(guildId, userId) {
  return read(guildId).find((a) => a.userId === String(userId)) || null;
}

// Pode pedir? Devolve { ok } ou { ok: false, reason, until? }.
function canAppeal(guildId, userId, now = Date.now()) {
  const last = latestFor(guildId, userId);
  if (!last) return { ok: true };
  if (last.status === 'pending') return { ok: false, reason: 'pending' };
  if (last.status === 'rejected' && now - last.decidedAt < COOLDOWN_MS) return { ok: false, reason: 'cooldown', until: last.decidedAt + COOLDOWN_MS };
  return { ok: true };
}

function cleanText(text) {
  return String(text || '').replace(/\r/g, '').trim().slice(0, MAX_TEXT);
}

function create(guildId, { userId, username, text, banReason }, now = Date.now()) {
  const body = cleanText(text);
  if (body.length < MIN_TEXT) return { ok: false, reason: 'too_short' };
  const check = canAppeal(guildId, userId, now);
  if (!check.ok) return check;
  const appeal = { id: crypto.randomBytes(6).toString('hex'), userId: String(userId), username: String(username || '').slice(0, 64), text: body, banReason: String(banReason || '').slice(0, 500), status: 'pending', createdAt: now };
  write(guildId, [appeal, ...read(guildId)]);
  return { ok: true, appeal };
}

function setMessage(guildId, appealId, messageId, channelId) {
  write(guildId, read(guildId).map((a) => (a.id === appealId ? { ...a, messageId, channelId } : a)));
}

// Decisão da staff. Só muda pedido pendente (dois cliques ao mesmo tempo decidem uma vez).
function decide(guildId, appealId, { approved, by }, now = Date.now()) {
  const all = read(guildId);
  const appeal = all.find((a) => a.id === appealId);
  if (!appeal) return { ok: false, reason: 'not_found' };
  if (appeal.status !== 'pending') return { ok: false, reason: 'already_decided', appeal };
  const updated = { ...appeal, status: approved ? 'approved' : 'rejected', decidedBy: String(by), decidedAt: now };
  write(guildId, all.map((a) => (a.id === appealId ? updated : a)));
  return { ok: true, appeal: updated };
}

// O que a pessoa vê sobre o próprio pedido (sem quem decidiu).
function publicView(appeal) {
  if (!appeal) return null;
  return { status: appeal.status, createdAt: appeal.createdAt, decidedAt: appeal.decidedAt || null };
}

module.exports = { canAppeal, create, decide, setMessage, latestFor, publicView, read, MIN_TEXT, MAX_TEXT, COOLDOWN_MS };

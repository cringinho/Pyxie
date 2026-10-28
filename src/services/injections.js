// Injeções: cargos prontos (gênero, sexualidade, neurodivergência, cores) com painel de escolha.
// Regras puras, desenho da bandeira e armazenamento (só o bot grava: data/guilds/<id>/injections.json).
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PACKS } = require('../data/injectionPacks');

const ID_RE = /^\d{17,20}$/;
const MAX_STORED = 30;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'injections.json');
}

function list(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return Array.isArray(raw.injections) ? raw.injections : [];
  } catch (_) {
    return [];
  }
}

function saveAll(guildId, all) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ injections: all.slice(0, MAX_STORED) }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

function get(guildId, injId) {
  return list(guildId).find((i) => i.id === injId) || null;
}

function store(guildId, injection) {
  saveAll(guildId, [injection, ...list(guildId).filter((i) => i.id !== injection.id)]);
}

function remove(guildId, injId) {
  saveAll(guildId, list(guildId).filter((i) => i.id !== injId));
}

const label = (item, lang) => (lang === 'en' ? item.en : item.pt);

// Cor do cargo: a listra mais viva da bandeira (branco, preto e cinzas só se não houver outra).
function roleColor(item) {
  const sat = (hex) => {
    const n = parseInt(hex, 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return Math.max(...c) - Math.min(...c);
  };
  const best = [...item.stripes].sort((a, b) => sat(b) - sat(a))[0];
  return parseInt(best, 16);
}

// Bandeira em PNG 64x64 com listras horizontais (ícone do cargo, se o servidor tiver boost nível 2).
async function flagPng(item) {
  const sharp = require('sharp');
  const size = 64;
  const raw = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y += 1) {
    const hex = item.stripes[Math.min(item.stripes.length - 1, Math.floor((y * item.stripes.length) / size))];
    const n = parseInt(hex, 16);
    for (let x = 0; x < size; x += 1) raw.set([(n >> 16) & 255, (n >> 8) & 255, n & 255], (y * size + x) * 3);
  }
  return sharp(raw, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer();
}

// Limpa o que veio do painel. Botões só cabem até 20 itens (4 fileiras de 5 + a de "tirar").
function normalizeOptions(packId, input = {}) {
  const pack = PACKS[packId];
  if (!pack) return null;
  const valid = new Set(pack.items.map((i) => i.id));
  const items = (Array.isArray(input.items) ? input.items : pack.items.map((i) => i.id)).filter((id) => valid.has(id));
  if (!items.length) return null;
  const ids = (l) => [...new Set((l || []).map(String).filter((id) => ID_RE.test(id)))].slice(0, 25);
  return {
    items,
    mode: input.mode === 'single' || input.mode === 'multi' ? input.mode : pack.defaultMode,
    format: input.format === 'buttons' && items.length <= 20 ? 'buttons' : 'select',
    publish: input.publish !== false,
    channelId: ID_RE.test(String(input.channelId || '')) ? String(input.channelId) : '',
    allowedRoleIds: ids(input.allowedRoleIds),
    position: input.position === 'bottom' ? 'bottom' : 'top',
    onboarding: input.onboarding === true,
    title: String(input.title || '').slice(0, 200),
    description: String(input.description || '').slice(0, 1000),
  };
}

function newId() {
  return crypto.randomBytes(4).toString('hex');
}

// Quem escolhe num menu: adiciona o que marcou e tira o que desmarcou só daquele menu
// (modo um-só: tira todos os outros cargos desta injeção).
function applySelection(memberRoleIds, injection, { chunkRoleIds, selected }) {
  const has = new Set(memberRoleIds);
  const all = injection.items.map((i) => i.roleId).filter(Boolean);
  const chosen = injection.mode === 'single' ? selected.slice(0, 1) : selected;
  const pool = injection.mode === 'single' ? all : chunkRoleIds;
  const add = chosen.filter((id) => !has.has(id));
  const removeIds = pool.filter((id) => has.has(id) && !chosen.includes(id));
  return { add, remove: removeIds };
}

module.exports = { PACKS, list, get, store, remove, label, roleColor, flagPng, normalizeOptions, newId, applySelection };

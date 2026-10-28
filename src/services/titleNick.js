// [Título] Nick (plano 5.9): a pessoa escolhe mostrar o título equipado antes do apelido, só no
// servidor oficial. Precisa de Gerenciar Apelidos e de a Pyxie estar acima da pessoa. Limite de 32.
// Quem ligou fica em data/guilds/<guildId>/titleNicks.json com o apelido original para devolver.
const fs = require('node:fs');
const path = require('node:path');

const MAX_NICK = 32;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'titleNicks.json');
}

function load(guildId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function save(guildId, state) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

// Monta "[Título] Nome" cortando o nome (nunca o título) para caber em 32.
function composeNick(title, baseName) {
  const prefix = `[${String(title).trim()}] `;
  if (prefix.length >= MAX_NICK - 2) return prefix.slice(0, MAX_NICK).trim();
  const room = MAX_NICK - prefix.length;
  const base = Array.from(String(baseName || '').trim());
  return prefix + (base.length > room ? `${base.slice(0, room - 1).join('')}…` : base.join(''));
}

function isEnabled(guildId, userId) {
  return Boolean(load(guildId)[String(userId)]);
}

// Aplica ou remove o título no apelido conforme a preferência. Devolve { ok, reason?, nick? }.
async function sync(member, titleName) {
  const state = load(member.guild.id);
  const entry = state[member.id];
  if (!entry) return { ok: true, nick: null };
  if (!member.manageable) return { ok: false, reason: 'not_manageable' };
  const nick = titleName ? composeNick(titleName, entry.original || member.user.globalName || member.user.username) : entry.original || null;
  await member.setNickname(nick, 'Pyxie: [Título] Nick');
  return { ok: true, nick };
}

async function toggle(member, titleName) {
  const state = load(member.guild.id);
  if (state[member.id]) {
    const original = state[member.id].original ?? null;
    delete state[member.id];
    save(member.guild.id, state);
    if (member.manageable) await member.setNickname(original, 'Pyxie: [Título] Nick desligado').catch(() => null);
    return { ok: true, enabled: false };
  }
  if (!member.manageable) return { ok: false, reason: 'not_manageable' };
  state[member.id] = { original: member.nickname || null, since: Date.now() };
  save(member.guild.id, state);
  const res = await sync(member, titleName);
  return { ...res, enabled: true };
}

module.exports = { MAX_NICK, composeNick, isEnabled, sync, toggle };

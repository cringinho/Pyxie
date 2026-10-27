// Preferência de marcação por pessoa e servidor: quem está no modo silencioso aparece em negrito,
// sem ping. data/guilds/<guildId>/mentionPrefs.json → { silent: { <userId>: true } }
const fs = require('node:fs');
const path = require('node:path');

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'mentionPrefs.json');
}

function load(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return { silent: raw && typeof raw.silent === 'object' ? raw.silent : {} };
  } catch (_) {
    return { silent: {} };
  }
}

function isSilent(guildId, userId) {
  return Boolean(load(guildId).silent[String(userId)]);
}

function toggleSilent(guildId, userId) {
  const state = load(guildId);
  const id = String(userId);
  if (state.silent[id]) delete state.silent[id];
  else state.silent[id] = true;
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return Boolean(state.silent[id]);
}

// Monta a lista de premiados: quem aceita ping vira menção, quem está no silencioso vira **nome**.
// Devolve { text, allowedUserIds } para usar em allowedMentions.users.
function formatMentions(guildId, users, separator = ', ') {
  const prefs = load(guildId).silent;
  const allowedUserIds = [];
  const parts = users.map((u) => {
    const id = String(u.id);
    if (prefs[id]) return `**${String(u.displayName || u.username || id).replace(/\*/g, '')}**`;
    allowedUserIds.push(id);
    return `<@${id}>`;
  });
  return { text: parts.join(separator), allowedUserIds };
}

module.exports = { isSilent, toggleSilent, formatMentions };

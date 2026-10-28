// Fogueira de voz: configuração por servidor e regra de quando avisar (função pura).
// data/guilds/<id>/campfire.json (só o painel grava). Desligada por padrão.
const fs = require('node:fs');
const path = require('node:path');

const ID_RE = /^\d{17,20}$/;
const clamp = (n, min, max, d) => (Number.isFinite(Number(n)) ? Math.min(max, Math.max(min, Math.round(Number(n)))) : d);

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'campfire.json');
}

function normalize(raw = {}) {
  return {
    enabled: raw.enabled === true,
    channelId: ID_RE.test(String(raw.channelId || '')) ? String(raw.channelId) : '',
    minPeople: clamp(raw.minPeople, 3, 50, 5),
    minMinutes: clamp(raw.minMinutes, 5, 120, 10),
    cooldownMinutes: clamp(raw.cooldownMinutes, 30, 1440, 120),
    excludedChannelIds: [...new Set((raw.excludedChannelIds || []).map(String).filter((id) => ID_RE.test(id)))].slice(0, 50),
  };
}

const cache = new Map();
function getConfig(guildId) {
  const hit = cache.get(guildId);
  if (hit && Date.now() - hit.at < 30000) return hit.config;
  let raw = {};
  try {
    raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
  } catch (_) {}
  const config = normalize(raw);
  cache.set(guildId, { at: Date.now(), config });
  return config;
}

function saveConfig(guildId, input) {
  const config = normalize({ ...getConfig(guildId), ...input });
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(config, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  cache.set(guildId, { at: Date.now(), config });
  return config;
}

// O que fazer com uma call agora: 'announce', 'remove' (esvaziou) ou null.
function decide({ people, since, announcedMessageId, lastAnnouncedAt }, cfg, now = Date.now()) {
  if (announcedMessageId) return people < 2 ? 'remove' : null;
  if (people < cfg.minPeople || since == null) return null;
  if (now - since < cfg.minMinutes * 60000) return null;
  if (lastAnnouncedAt && now - lastAnnouncedAt < cfg.cooldownMinutes * 60000) return null;
  return 'announce';
}

module.exports = { getConfig, saveConfig, normalize, decide };

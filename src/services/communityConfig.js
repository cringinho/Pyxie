// Configuração das funções de comunidade (plano 5.9): fórum de hiperfocos e radar de notícias.
// data/guilds/<guildId>/community.json (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');

const ids = (list, max = 20) => [...new Set((list || []).map(String).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, max);
const id1 = (v) => (/^\d{17,20}$/.test(String(v || '')) ? String(v) : '');

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'community.json');
}

function normalize(raw = {}) {
  const h = raw.hyperfocus || {};
  const r = raw.radar || {};
  const hex = String(r.color || '#8b5cf6').trim().toLowerCase();
  return {
    hyperfocus: {
      forumIds: ids(h.forumIds),
      // Anti-inflação (AGENTS §5): moedinhas com teto diário, texto mínimo e sem recompensa por edição.
      rewardCoins: Math.min(30, Math.max(0, Math.round(Number(h.rewardCoins ?? 15)))),
      minChars: Math.min(2000, Math.max(50, Math.round(Number(h.minChars ?? 200)))),
      waitMinutes: Math.min(120, Math.max(5, Math.round(Number(h.waitMinutes ?? 15)))),
      reactionEmoji: String(h.reactionEmoji ?? '💜').trim().slice(0, 32),
      customComment: String(h.customComment || '').slice(0, 400),
    },
    radar: {
      feeds: [...new Set((Array.isArray(r.feeds) ? r.feeds : String(r.feeds || '').split(/\s+/)).map((u) => String(u).trim()).filter((u) => /^https:\/\/\S+$/.test(u)))].slice(0, 15),
      staffChannelId: id1(r.staffChannelId),
      publishChannelId: id1(r.publishChannelId),
      maxItemsPerCycle: Math.min(10, Math.max(1, Math.round(Number(r.maxItemsPerCycle ?? 5)))),
      color: /^#[0-9a-f]{6}$/.test(hex) ? hex : '#8b5cf6',
      pingRoleId: id1(r.pingRoleId),
    },
  };
}

function getCommunityConfig(guildId) {
  try {
    return normalize(JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')));
  } catch (_) {
    return normalize({});
  }
}

function saveCommunityConfig(guildId, input) {
  const current = getCommunityConfig(guildId);
  const next = normalize({ hyperfocus: { ...current.hyperfocus, ...(input.hyperfocus || {}) }, radar: { ...current.radar, ...(input.radar || {}) } });
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(next, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return next;
}

module.exports = { getCommunityConfig, saveCommunityConfig, normalize };

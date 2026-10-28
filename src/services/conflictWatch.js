// Controle de brigas (plano 5.7), no processo do bot.
// 1. Detector em memória: respostas diretas entre duas pessoas (mais de 4 em 2 min no mesmo canal).
// 2. Só então o Groq lê as últimas 6 mensagens das duas pessoas e classifica "animada" ou "hostil".
//    Nunca em canais de desabafo/acolhimento (D9) nem em canais isentos.
// 3. Ações em ordem: aviso leve → modo lento temporário (volta ao valor anterior) → castigo de 15 min
//    nas duas pessoas com DM acolhedora. Tudo registrado no canal da staff. Nunca bane.
// Configuração e estado em data/guilds/<guildId>/moderation.json (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');

const WINDOW_MS = 2 * 60 * 1000;
const REPLIES_TO_TRIGGER = 5; // "mais de 4"
const ESCALATION_WINDOW_MS = 10 * 60 * 1000;
const PAIR_COOLDOWN_MS = 3 * 60 * 1000;
const SLOWMODE_SECONDS = 30;
const SLOWMODE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 15 * 60 * 1000;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'moderation.json');
}

function loadState(guildId) {
  try {
    const raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8'));
    return { config: { ...defaultConfig(), ...(raw.config || {}) }, slowmodes: raw.slowmodes || {}, incidents: raw.incidents || [] };
  } catch (_) {
    return { config: defaultConfig(), slowmodes: {}, incidents: [] };
  }
}

function saveState(guildId, state) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

function defaultConfig() {
  return { enabled: false, staffLogChannelId: '', exemptChannelIds: [] };
}

function normalizeConfig(raw = {}) {
  const ids = (list) => [...new Set((list || []).map(String).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, 50);
  return {
    enabled: Boolean(raw.enabled),
    staffLogChannelId: /^\d{17,20}$/.test(String(raw.staffLogChannelId || '')) ? String(raw.staffLogChannelId) : '',
    exemptChannelIds: ids(raw.exemptChannelIds),
  };
}

function getConfig(guildId) {
  return loadState(guildId).config;
}

function saveConfig(guildId, input) {
  const state = loadState(guildId);
  state.config = normalizeConfig({ ...state.config, ...input });
  saveState(guildId, state);
  return state.config;
}

function listIncidents(guildId, limit = 30) {
  return loadState(guildId).incidents.slice(0, limit);
}

// ---------- Detector em memória ----------

const replies = new Map(); // `${guild}:${channel}:${a}:${b}` -> [timestamps]
const pairLevel = new Map(); // mesma chave -> { level, at }
const pairCooldown = new Map();

function pairKey(guildId, channelId, a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `${guildId}:${channelId}:${x}:${y}`;
}

// Registra uma resposta direta e devolve a chave do par quando passa do limite.
function trackReply({ guildId, channelId, authorId, repliedToId, now = Date.now() }) {
  if (!repliedToId || authorId === repliedToId) return null;
  const key = pairKey(guildId, channelId, authorId, repliedToId);
  const list = (replies.get(key) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  replies.set(key, list);
  if (list.length < REPLIES_TO_TRIGGER) return null;
  if (now - (pairCooldown.get(key) || 0) < PAIR_COOLDOWN_MS) return null;
  pairCooldown.set(key, now);
  replies.set(key, []);
  return key;
}

// Próximo degrau para o par: 1 aviso, 2 modo lento, 3 castigo. Volta a 1 depois de 10 min de calma.
function nextLevel(key, now = Date.now()) {
  const prev = pairLevel.get(key);
  const level = prev && now - prev.at < ESCALATION_WINDOW_MS ? Math.min(3, prev.level + 1) : 1;
  pairLevel.set(key, { level, at: now });
  return level;
}

function resetMemory() {
  replies.clear();
  pairLevel.clear();
  pairCooldown.clear();
}

// ---------- Classificação pelo Groq ----------

async function classify(messages, { chat } = {}) {
  const groq = chat || require('./groqClient').chatCompletionNow;
  const transcript = messages.map((m) => `${m.author}: ${String(m.content).slice(0, 300)}`).join('\n');
  const res = await groq(
    {
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 20,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Você modera um servidor brasileiro acolhedor. Classifique a conversa entre duas pessoas. ' +
            'Responda só JSON: {"label":"animada"} para brincadeira, debate amigável ou empolgação; ' +
            '{"label":"hostil"} para ofensas, ataques pessoais, humilhação ou escalada agressiva.',
        },
        { role: 'user', content: transcript },
      ],
    },
    { label: 'Moderação' }
  );
  if (!res.ok) return { label: 'desconhecida', error: res.error || (res.rateLimited ? 'rate_limited' : 'groq_error') };
  try {
    const parsed = JSON.parse(res.data.choices[0].message.content);
    return { label: parsed.label === 'hostil' ? 'hostil' : 'animada' };
  } catch (_) {
    return { label: 'desconhecida', error: 'parse_error' };
  }
}

// ---------- Modo lento com volta garantida ----------

function rememberSlowmode(guildId, channelId, previous, until) {
  const state = loadState(guildId);
  if (!state.slowmodes[channelId]) state.slowmodes[channelId] = { previous, until };
  else state.slowmodes[channelId].until = until;
  saveState(guildId, state);
}

// Chamado de minuto em minuto: devolve o modo lento original dos canais vencidos (sobrevive a reinício).
async function restoreExpiredSlowmodes(client, guildIds, now = Date.now()) {
  for (const guildId of guildIds) {
    const state = loadState(guildId);
    let changed = false;
    for (const [channelId, entry] of Object.entries(state.slowmodes)) {
      if (entry.until > now) continue;
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (channel?.setRateLimitPerUser) await channel.setRateLimitPerUser(entry.previous || 0, 'Pyxie: fim do modo lento temporário').catch(() => null);
      delete state.slowmodes[channelId];
      changed = true;
    }
    if (changed) saveState(guildId, state);
  }
}

function recordIncident(guildId, incident) {
  const state = loadState(guildId);
  state.incidents = [incident, ...state.incidents].slice(0, 100);
  saveState(guildId, state);
}

module.exports = {
  WINDOW_MS,
  REPLIES_TO_TRIGGER,
  SLOWMODE_SECONDS,
  SLOWMODE_MS,
  TIMEOUT_MS,
  getConfig,
  saveConfig,
  listIncidents,
  trackReply,
  nextLevel,
  resetMemory,
  classify,
  rememberSlowmode,
  restoreExpiredSlowmodes,
  recordIncident,
  loadState,
};

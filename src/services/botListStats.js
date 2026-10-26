const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

/**
 * Publica a contagem de servidores da Pyxie nas listas de bots. Cada lista só é chamada
 * quando o token dela existe no .env, então nada é enviado sem configuração explícita.
 *
 * O resultado de cada envio fica em data/botListStats.json para o /admin mostrar se
 * as listas estão recebendo os números.
 */

const POST_INTERVAL_MS = 30 * 60 * 1000;
const FIRST_POST_DELAY_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

const BOT_LISTS = [
  {
    id: 'topgg',
    name: 'Top.gg',
    tokenEnv: ['TOPGG_API_TOKEN', 'TOPGG_TOKEN'],
    url: (botId) => `https://top.gg/api/bots/${botId}/stats`,
    body: ({ guilds, shards }) => ({ server_count: guilds, shard_count: shards }),
  },
  {
    id: 'discordbotlist',
    name: 'Discord Bot List',
    tokenEnv: ['DISCORDBOTLIST_TOKEN'],
    url: (botId) => `https://discordbotlist.com/api/v1/bots/${botId}/stats`,
    body: ({ guilds, users }) => ({ guilds, users }),
  },
  {
    id: 'discords',
    name: 'Discords.com',
    tokenEnv: ['DISCORDS_TOKEN'],
    url: (botId) => `https://discords.com/bots/api/bot/${botId}`,
    body: ({ guilds }) => ({ server_count: guilds }),
  },
  {
    id: 'discordbotsgg',
    name: 'discord.bots.gg',
    tokenEnv: ['DISCORD_BOTS_GG_TOKEN'],
    url: (botId) => `https://discord.bots.gg/api/v1/bots/${botId}/stats`,
    body: ({ guilds, shards }) => ({ guildCount: guilds, shardCount: shards }),
  },
];

function statusFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'botListStats.json');
}

function resolveToken(list, env = process.env) {
  for (const key of list.tokenEnv) {
    if (env[key]) return env[key];
  }
  return null;
}

function collectCounts(client) {
  const guilds = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const shards = client.shard?.count || client.ws?.shards?.size || 1;
  return { guilds, users, shards };
}

async function postToList(list, botId, token, counts, fetchImpl = fetch) {
  const startedAt = Date.now();
  try {
    const response = await fetchImpl(list.url(botId), {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify(list.body(counts)),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return { ok: response.ok, status: response.status, ms: Date.now() - startedAt };
  } catch (error) {
    return { ok: false, status: 0, error: error.message, ms: Date.now() - startedAt };
  }
}

async function postBotListStats(client, { env = process.env, fetchImpl = fetch, now = Date.now() } = {}) {
  const botId = client?.user?.id;
  if (!botId) return { posted: 0, results: {} };

  const counts = collectCounts(client);
  const stored = readJson(statusFile(), {});
  const results = { ...(stored.results || {}) };
  let posted = 0;

  for (const list of BOT_LISTS) {
    const token = resolveToken(list, env);
    if (!token) {
      results[list.id] = { name: list.name, configured: false };
      continue;
    }
    const outcome = await postToList(list, botId, token, counts, fetchImpl);
    results[list.id] = { name: list.name, configured: true, at: now, guilds: counts.guilds, ...outcome };
    if (outcome.ok) posted += 1;
    else console.warn(`[BotLists] ${list.name} recusou a contagem (${outcome.status || outcome.error}).`);
  }

  writeJsonAtomic(statusFile(), { updatedAt: now, counts, results });
  return { posted, counts, results };
}

let intervalHandle = null;

function startBotListStats(client) {
  if (intervalHandle) return intervalHandle;
  const run = () => postBotListStats(client).catch((error) => console.error('[BotLists] Falha no envio:', error.message));
  const first = setTimeout(run, FIRST_POST_DELAY_MS);
  if (typeof first.unref === 'function') first.unref();
  intervalHandle = setInterval(run, POST_INTERVAL_MS);
  if (typeof intervalHandle.unref === 'function') intervalHandle.unref();
  return intervalHandle;
}

function getBotListStatus() {
  const stored = readJson(statusFile(), {});
  const results = stored.results || {};
  return {
    updatedAt: stored.updatedAt || null,
    counts: stored.counts || null,
    lists: BOT_LISTS.map((list) => ({
      id: list.id,
      name: list.name,
      configured: Boolean(resolveToken(list)),
      ...(results[list.id] || {}),
    })),
  };
}

module.exports = {
  BOT_LISTS,
  collectCounts,
  postBotListStats,
  startBotListStats,
  getBotListStatus,
};

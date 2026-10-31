/**
 * Alerta de estoque baixo por DM.
 *
 * A lojinha perde venda quando o código acaba no meio do dia; o dado já existia
 * (`storeProducts.stockReport`), faltava alguém avisar. Aqui o aviso sai uma vez por dia
 * por produto — DM para o dono do servidor, sem ping (`allowedMentions` vazio).
 *
 * Estado: `data/guilds/<id>/storeAlerts.json` (escrita atômica). Só o processo do bot grava.
 */
const fs = require('node:fs');
const path = require('node:path');
const storeProducts = require('../../services/storeProducts');
const { canUseStore } = require('./storeAccess');
const storefront = require('./storefront');
const { dataPath } = require('../../utils/dataDir');
const { getLanguage } = require('../../utils/i18n');

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_EVERY_MS = DAY;
const MAX_GUILDS = 500;

const alertFile = (guildId) => dataPath('guilds', String(guildId), 'storeAlerts.json');

function readState(guildId) {
  try {
    const parsed = JSON.parse(fs.readFileSync(alertFile(guildId), 'utf8'));
    const notified = parsed && typeof parsed.notified === 'object' ? parsed.notified : {};
    return { version: 1, notified };
  } catch (_) {
    return { version: 1, notified: {} };
  }
}

function writeState(guildId, state) {
  const file = alertFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return state;
}

/** O produto já foi avisado dentro da janela? (função pura, testável) */
function shouldNotify(lastAt, now = Date.now(), everyMs = DEFAULT_EVERY_MS) {
  const last = Number(lastAt) || 0;
  return !last || now - last >= everyMs;
}

/** Produtos que precisam de aviso agora. */
function pendingAlerts(guildId, { now = Date.now(), everyMs = DEFAULT_EVERY_MS, state = null } = {}) {
  const current = state || readState(guildId);
  return storeProducts
    .lowStock(guildId)
    .filter((p) => shouldNotify(current.notified[p.id], now, everyMs))
    .map((p) => ({ ...p }));
}

/** Grava o aviso só dos produtos que entraram na mensagem (o resto recebe no próximo ciclo). */
function markNotified(guildId, ids = [], now = Date.now()) {
  const state = readState(guildId);
  for (const id of ids) state.notified[String(id)] = now;
  return writeState(guildId, state);
}

/** Apaga o histórico de avisos (usado quando o produto volta a ter estoque cheio). */
function clearNotified(guildId, ids = []) {
  const state = readState(guildId);
  for (const id of ids) delete state.notified[String(id)];
  return writeState(guildId, state);
}

/**
 * Varre os servidores com loja ativa e manda a DM. Devolve o que aconteceu para o log/teste.
 * `sendDm(owner, payload)` é injetado para poder testar sem Discord.
 */
async function scan(client, { now = Date.now(), everyMs = DEFAULT_EVERY_MS, limit = MAX_GUILDS, sendDm = null } = {}) {
  const result = { checked: 0, alerts: 0, sent: 0, skipped: 0, failed: 0 };
  const guilds = client && client.guilds && client.guilds.cache ? [...client.guilds.cache.values()] : [];
  for (const guild of guilds.slice(0, limit)) {
    const guildId = String(guild?.id || '');
    if (!guildId || !canUseStore(guildId)) continue;
    result.checked += 1;
    const pending = pendingAlerts(guildId, { now, everyMs });
    if (!pending.length) continue;
    result.alerts += pending.length;

    const storeName = (() => {
      try {
        return require('./maryDashboard').getStore(guildId).storeName || '';
      } catch (_) {
        return '';
      }
    })();
    const payload = storefront.lowStockEmbed(guildId, {
      lang: getLanguage(guildId),
      guildName: guild?.name || '',
      storeName,
    });
    if (!payload) continue;

    const owner = await (guild.fetchOwner ? guild.fetchOwner().catch(() => null) : Promise.resolve(null));
    if (!owner || typeof owner.send !== 'function') {
      result.skipped += 1;
      continue;
    }
    try {
      const send = sendDm || ((target, body) => target.send(body));
      await send(owner, { embeds: [payload.embed], allowedMentions: { parse: [], users: [], roles: [] } });
      markNotified(guildId, pending.map((p) => p.id), now);
      result.sent += 1;
    } catch (_) {
      result.failed += 1;
    }
  }
  return result;
}

module.exports = {
  DAY,
  DEFAULT_EVERY_MS,
  alertFile,
  readState,
  writeState,
  shouldNotify,
  pendingAlerts,
  markNotified,
  clearNotified,
  scan,
};

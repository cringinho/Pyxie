const path = require('path');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

try {
  require('dotenv').config();
} catch (_) {}

/**
 * Cliente Groq compartilhado por workSeeder, quizSeeder e arcaneMath.
 * Todas as chamadas passam por uma fila única (uma requisição por vez, com espaçamento mínimo),
 * porque os três serviços dividem a mesma GROQ_API_KEY e o mesmo limite de tokens por minuto.
 */

const CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS_URL = 'https://api.groq.com/openai/v1/models';

const MIN_INTERVAL_MS = Number(process.env.GROQ_MIN_INTERVAL_MS) || 12000;
const DEFAULT_MAX_RETRIES = 4;
const FALLBACK_BACKOFF_MS = 15000;
// Esperas maiores que isso indicam cota diária esgotada: pausa a fila em vez de bloquear o processo.
const MAX_INLINE_WAIT_MS = 5 * 60 * 1000;

const STATE_FILE = path.join(__dirname, '../../data/groqSchedulerState.json');

let queueTail = Promise.resolve();
let lastRequestAt = 0;
let pausedUntil = 0;
const modelCache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converte o tempo pedido pela Groq em milissegundos.
 * Aceita o header `retry-after` (segundos) e mensagens como
 * "try again in 7.5s", "try again in 2m30.5s", "try again in 1h2m3s" ou "try again in 450ms".
 */
function parseRetryDelayMs(retryAfterHeader, message = '') {
  const headerSec = parseFloat(retryAfterHeader);
  let headerMs = Number.isFinite(headerSec) && headerSec >= 0 ? headerSec * 1000 : null;

  let messageMs = null;
  const match = String(message).match(/try again in ((?:\d+(?:\.\d+)?(?:ms|h|m|s))+)/i);
  if (match) {
    messageMs = 0;
    for (const [, value, unit] of match[1].matchAll(/(\d+(?:\.\d+)?)(ms|h|m|s)/gi)) {
      const n = parseFloat(value);
      const u = unit.toLowerCase();
      messageMs += u === 'h' ? n * 3600000 : u === 'm' ? n * 60000 : u === 's' ? n * 1000 : n;
    }
  }

  if (headerMs === null && messageMs === null) return null;
  return Math.ceil(Math.max(headerMs || 0, messageMs || 0));
}

function enqueue(task) {
  const run = queueTail.then(task, task);
  queueTail = run.catch(() => {});
  return run;
}

async function waitForSlot() {
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

/**
 * Envia um chat completion pela fila única.
 * @returns {Promise<{ ok: boolean, status?: number, data?: object, rateLimited?: boolean, error?: string }>}
 */
function chatCompletion(body, { label = 'Groq', maxRetries = DEFAULT_MAX_RETRIES } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return Promise.resolve({ ok: false, error: 'missing_api_key' });

  return enqueue(async () => {
    for (let attempt = 0; ; attempt++) {
      if (Date.now() < pausedUntil) {
        return { ok: false, rateLimited: true, error: 'paused' };
      }

      await waitForSlot();

      let response;
      try {
        response = await fetch(CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(body),
        });
      } catch (err) {
        if (attempt < 2) {
          await sleep(3000 * (attempt + 1));
          continue;
        }
        return { ok: false, error: err.message };
      }

      if (response.status === 429) {
        const errJson = await response.json().catch(() => ({}));
        const requested = parseRetryDelayMs(response.headers.get('retry-after'), errJson.error?.message);
        const waitMs = (requested ?? FALLBACK_BACKOFF_MS * 2 ** attempt) + 1000;

        if (waitMs > MAX_INLINE_WAIT_MS) {
          pausedUntil = Date.now() + waitMs;
          console.log(
            `[Groq] ${label}: cota esgotada, fila pausada por ${Math.ceil(waitMs / 60000)} min (até ${new Date(pausedUntil).toISOString()}).`
          );
          return { ok: false, rateLimited: true, error: 'quota_exhausted' };
        }
        if (attempt >= maxRetries) {
          console.log(`[Groq] ${label}: limite por minuto ainda ativo após ${attempt + 1} tentativa(s). Lote adiado.`);
          return { ok: false, rateLimited: true, error: 'rate_limit' };
        }

        console.log(`[Groq] ${label}: limite por minuto (429). Aguardando ${Math.ceil(waitMs / 1000)}s (tentativa ${attempt + 1}/${maxRetries}).`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[Groq] ${label}: erro HTTP ${response.status}: ${errText.slice(0, 120)}`);
        return { ok: false, status: response.status, error: 'http_error' };
      }

      try {
        return { ok: true, status: response.status, data: await response.json() };
      } catch (err) {
        return { ok: false, status: response.status, error: 'invalid_json' };
      }
    }
  });
}

/**
 * Uma chamada só, fora da fila dos geradores: para quem está esperando resposta (falas da
 * Pyxie e moderação). Não espera nem tenta de novo; num 429 devolve quanto tempo aguardar.
 * @returns {Promise<{ ok: boolean, data?: object, rateLimited?: boolean, retryAfterMs?: number, error?: string }>}
 */
async function chatCompletionNow(body, { label = 'Groq' } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, error: 'missing_api_key' };
  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });
    if (response.status === 429) {
      const errJson = await response.json().catch(() => ({}));
      const retryAfterMs = parseRetryDelayMs(response.headers.get('retry-after'), errJson.error?.message) ?? FALLBACK_BACKOFF_MS;
      console.log(`[Groq] ${label}: limite (429), tentar de novo em ${Math.ceil(retryAfterMs / 1000)}s.`);
      return { ok: false, rateLimited: true, retryAfterMs };
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[Groq] ${label}: erro HTTP ${response.status}: ${errText.slice(0, 120)}`);
      return { ok: false, status: response.status, error: 'http_error' };
    }
    return { ok: true, data: await response.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/** Escolhe o primeiro modelo disponível da lista (consulta /models uma vez por lista). */
async function resolveModel(candidates, fallback = candidates[0]) {
  const key = candidates.join('|');
  if (modelCache.has(key)) return modelCache.get(key);

  const apiKey = process.env.GROQ_API_KEY;
  let chosen = fallback;
  if (apiKey) {
    try {
      const res = await fetch(MODELS_URL, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (res.ok) {
        const data = await res.json();
        const available = new Set((data.data || []).map((m) => m.id));
        chosen = candidates.find((m) => available.has(m)) || fallback;
      }
    } catch (_) {}
  }
  modelCache.set(key, chosen);
  return chosen;
}

/** Último início de lote de um agendador, persistido para sobreviver a reinícios do PM2. */
function getLastRun(schedulerKey) {
  const state = readJson(STATE_FILE, {});
  return Number(state[schedulerKey]) || 0;
}

function markRun(schedulerKey, at = Date.now()) {
  const state = readJson(STATE_FILE, {});
  state[schedulerKey] = at;
  writeJsonAtomic(STATE_FILE, state);
}

/** Atraso até o próximo lote: nunca no boot; respeita o intervalo desde o último lote real. */
function computeFirstRunDelay(lastRunAt, intervalMs, now = Date.now(), minDelayMs = 10 * 60 * 1000) {
  const dueIn = lastRunAt ? lastRunAt + intervalMs - now : intervalMs;
  return Math.max(minDelayMs, dueIn);
}

function getQueueStatus() {
  return { minIntervalMs: MIN_INTERVAL_MS, pausedUntil: pausedUntil > Date.now() ? pausedUntil : null };
}

module.exports = {
  chatCompletion,
  chatCompletionNow,
  resolveModel,
  parseRetryDelayMs,
  computeFirstRunDelay,
  getLastRun,
  markRun,
  getQueueStatus,
};

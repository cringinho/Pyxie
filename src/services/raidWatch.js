// Anti-raid: detector em memória de entradas em massa (só no processo do bot).
// Dispara quando entram `joins` contas em `seconds` segundos, ou metade disso só de contas
// com menos de 7 dias. Em servidor grande o piso sobe (1 a cada 2.000 membros) para não
// confundir divulgação com ataque.
const YOUNG_MS = 7 * 24 * 60 * 60 * 1000;

const state = new Map(); // guildId -> { joins: [{ at, young }], activeUntil }

function threshold(configJoins, memberCount = 0) {
  return Math.max(configJoins, Math.ceil(memberCount / 2000));
}

function trackJoin(guildId, { now = Date.now(), accountCreatedAt = now, joins: limit, seconds, memberCount = 0 }) {
  const entry = state.get(guildId) || { joins: [], activeUntil: 0 };
  entry.joins = entry.joins.filter((j) => now - j.at < seconds * 1000);
  entry.joins.push({ at: now, young: now - accountCreatedAt < YOUNG_MS });
  state.set(guildId, entry);
  const total = entry.joins.length;
  const young = entry.joins.filter((j) => j.young).length;
  const need = threshold(limit, memberCount);
  const triggered = entry.activeUntil <= now && (total >= need || young >= Math.ceil(need / 2));
  return { triggered, total, young };
}

function markActive(guildId, until) {
  const entry = state.get(guildId) || { joins: [], activeUntil: 0 };
  entry.activeUntil = until;
  entry.joins = [];
  state.set(guildId, entry);
}

function clearActive(guildId) {
  const entry = state.get(guildId);
  if (entry) entry.activeUntil = 0;
}

// Limpa servidores sem entradas recentes (chamado de tempos em tempos).
function sweep(now = Date.now()) {
  for (const [id, entry] of state) if (!entry.joins.some((j) => now - j.at < 120000) && entry.activeUntil <= now) state.delete(id);
}

function resetMemory() {
  state.clear();
}

module.exports = { trackJoin, markActive, clearActive, sweep, resetMemory, threshold, YOUNG_MS };

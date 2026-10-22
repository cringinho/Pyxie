// Datas de calendário no fuso de Brasília (UTC-3, sem horário de verão desde 2019)
const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Chave 'YYYY-MM-DD' do dia corrente em BRT. */
function getBrtDateKey(now = Date.now()) {
  return new Date(now - BRT_OFFSET_MS).toISOString().slice(0, 10);
}

/** Chave do dia anterior a `dateKey`. */
function getPreviousDateKey(dateKey) {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

/** Milissegundos até a próxima meia-noite em BRT. */
function msUntilNextBrtMidnight(now = Date.now()) {
  const shifted = now - BRT_OFFSET_MS;
  return DAY_MS - (((shifted % DAY_MS) + DAY_MS) % DAY_MS);
}

module.exports = {
  getBrtDateKey,
  getPreviousDateKey,
  msUntilNextBrtMidnight,
};

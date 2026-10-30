const path = require('node:path');
const crypto = require('node:crypto');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');

function getQueueFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'hyperfokus', 'pin_queue.json');
}

function loadQueue() {
  return readJson(getQueueFile(), {
    pins: [],
    config: {
      slotsPerDay: 3,
      hours: [12.5, 18.5, 21.5], // 12h30, 18h30, 21h30 BRT
    },
  });
}

function saveQueue(data) {
  return writeJsonAtomic(getQueueFile(), data);
}

/**
 * Calcula jitter determinístico de ±20 minutos com base no ID do item para evitar repetição do minuto exato.
 */
function getJitterMinutes(id) {
  const hash = crypto.createHash('md5').update(String(id)).digest('hex');
  const num = parseInt(hash.slice(0, 4), 16);
  return (num % 41) - 20; // -20 a +20
}

/**
 * Converte data e hora em timestamp UTC considerando o fuso de Brasília (UTC-3).
 */
function createBrtDate(year, month, day, hourFloat) {
  const hour = Math.floor(hourFloat);
  const minute = Math.round((hourFloat - hour) * 60);
  // Brasília é UTC-3 fixo
  const utcHour = hour + 3;
  return new Date(Date.UTC(year, month, day, utcHour, minute, 0)).getTime();
}

/**
 * Encontra o próximo slot livre na fila respeitando o teto de 3 pins/dia e separação horária.
 */
function getNextReleaseSlot(afterTime = Date.now(), pinId = 'pin') {
  const queue = loadQueue();
  const scheduledPins = queue.pins
    .filter((p) => p.status === 'SCHEDULED' && p.releaseAt > afterTime)
    .sort((a, b) => a.releaseAt - b.releaseAt);

  const baseDate = new Date(afterTime);
  let year = baseDate.getUTCFullYear();
  let month = baseDate.getUTCMonth();
  let day = baseDate.getUTCDate();

  // Tenta encontrar o próximo slot disponível a partir de hoje
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const checkDate = new Date(Date.UTC(year, month, day + dayOffset, 12, 0, 0));
    const cy = checkDate.getUTCFullYear();
    const cm = checkDate.getUTCMonth();
    const cd = checkDate.getUTCDate();

    for (const baseHour of queue.config.hours) {
      const jitter = getJitterMinutes(`${pinId}:${dayOffset}:${baseHour}`);
      const hourWithJitter = baseHour + jitter / 60;
      const candidateTime = createBrtDate(cy, cm, cd, hourWithJitter);

      if (candidateTime <= afterTime) continue;

      // Verifica se já existe pin alocado próximo (menos de 2 horas) deste slot
      const hasConflict = scheduledPins.some((p) => Math.abs(p.releaseAt - candidateTime) < 2 * 3600 * 1000);
      if (!hasConflict) {
        return candidateTime;
      }
    }
  }

  // Fallback: 24h após o último pin agendado
  const lastPin = scheduledPins[scheduledPins.length - 1];
  return (lastPin ? lastPin.releaseAt : afterTime) + 8 * 3600 * 1000;
}

/**
 * Enfileira um novo Pin para o feed do Pinterest.
 */
function enqueuePin({ source = 'hyperfokus', sourceId, title, description, imageUrl, targetUrl, altText }) {
  if (!title || !imageUrl) return null;

  const queue = loadQueue();
  const id = `pin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const releaseAt = getNextReleaseSlot(Date.now(), id);

  // Sanitização de limites do Pinterest: título <= 100, descrição <= 500
  const cleanTitle = String(title).slice(0, 100).trim();
  const cleanDesc = String(description || title).slice(0, 500).trim();

  const newPin = {
    id,
    source,
    sourceId: String(sourceId || id),
    title: cleanTitle,
    description: cleanDesc,
    imageUrl,
    targetUrl: targetUrl || 'https://pyxie.com.br/hyperfokus',
    altText: altText || cleanTitle,
    releaseAt,
    status: 'SCHEDULED', // SCHEDULED, PAUSED, PUBLISHED
    createdAt: Date.now(),
  };

  queue.pins.push(newPin);
  saveQueue(queue);

  return newPin;
}

/**
 * Retorna pins liberados (releaseAt <= agora) para renderizar no feed /rss-pinterest.xml.
 */
function getReleasedPins(now = Date.now()) {
  const queue = loadQueue();
  return queue.pins.filter((p) => p.status === 'SCHEDULED' && p.releaseAt <= now);
}

/**
 * Lista toda a fila para exibição no painel administrativo.
 */
function getQueuePins() {
  const queue = loadQueue();
  return queue.pins.sort((a, b) => a.releaseAt - b.releaseAt);
}

/**
 * Pausa ou despausa um pin agendado.
 */
function togglePinPause(id) {
  const queue = loadQueue();
  const pin = queue.pins.find((p) => p.id === id);
  if (!pin) return null;
  pin.status = pin.status === 'PAUSED' ? 'SCHEDULED' : 'PAUSED';
  saveQueue(queue);
  return pin;
}

/**
 * Remove pin da fila.
 */
function removePin(id) {
  const queue = loadQueue();
  const before = queue.pins.length;
  queue.pins = queue.pins.filter((p) => p.id !== id);
  saveQueue(queue);
  return queue.pins.length < before;
}

module.exports = {
  loadQueue,
  saveQueue,
  getNextReleaseSlot,
  enqueuePin,
  getReleasedPins,
  getQueuePins,
  togglePinPause,
  removePin,
};


// Disjuntor de memória (só no processo do bot). Acima de 85% do teto de memória do Node,
// esvazia os caches de imagem e pede aos recursos pesados e secundários (cartão de perfil)
// que respondam só em texto. Abaixo de 75%, volta ao normal (folga para não ficar piscando).
const v8 = require('node:v8');
const { monitorEventLoopDelay } = require('node:perf_hooks');

const ENTER = 0.85;
const LEAVE = 0.75;

let state = 'normal';
let since = Date.now();
let lastSample = null;
const clearers = [];
const listeners = [];
let histogram = null;

// Quem guarda imagem em memória se inscreve aqui para ser esvaziado sob pressão.
function onPressure(fn) {
  clearers.push(fn);
}

function onStateChange(fn) {
  listeners.push(fn);
}

function sample() {
  const heapUsed = process.memoryUsage().heapUsed;
  const limit = v8.getHeapStatistics().heap_size_limit;
  const loopP99Ms = histogram ? Math.round(histogram.percentile(99) / 1e6) : 0;
  histogram?.reset();
  return { heapUsedMb: Math.round(heapUsed / 1048576), heapLimitMb: Math.round(limit / 1048576), ratio: heapUsed / limit, loopP99Ms };
}

function check(now = Date.now(), measure = sample) {
  lastSample = measure();
  const before = state;
  if (state === 'normal' && lastSample.ratio >= ENTER) state = 'pressure';
  else if (state === 'pressure' && lastSample.ratio < LEAVE) state = 'normal';
  if (state !== before) {
    since = now;
    if (state === 'pressure') {
      for (const fn of clearers) {
        try {
          fn();
        } catch (_) {}
      }
    }
    for (const fn of listeners) {
      try {
        fn(state, lastSample);
      } catch (_) {}
    }
  }
  return state;
}

function startSampling() {
  if (!histogram) {
    histogram = monitorEventLoopDelay({ resolution: 20 });
    histogram.enable();
  }
}

function stopSampling() {
  histogram?.disable();
  histogram = null;
}

function isUnderPressure() {
  return state === 'pressure';
}

function status() {
  return { state, since, ...(lastSample || sample()) };
}

function reset() {
  state = 'normal';
  since = Date.now();
}

module.exports = { onPressure, onStateChange, check, startSampling, stopSampling, isUnderPressure, status, reset, ENTER, LEAVE };

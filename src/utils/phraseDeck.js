// Sorteio das falas da Pyxie sem repetição perceptível.
// - Cada banco (chave) lembra as últimas falas que saiu e não as repete até girar boa parte da lista.
// - Cada pessoa (ou o bot inteiro, sem pessoa) lembra as últimas ABERTURAS que viu: duas falas
//   seguidas não começam igual ("Plot twist…", "Tô passada…"), mesmo vindo de bancos diferentes.
// Tudo em memória e com limite de tamanho: reiniciar o bot só zera a memória, nada quebra.

const MAX_KEYS = 5000;
const OPENER_MEMORY = 6;
const GLOBAL_AUDIENCE = '*';

const decks = new Map(); // chave do banco -> últimas falas usadas
const audiences = new Map(); // pessoa (ou '*') -> últimas aberturas vistas

function touch(map, key, create) {
  let value = map.get(key);
  if (value) {
    map.delete(key);
  } else {
    value = create();
    if (map.size >= MAX_KEYS) map.delete(map.keys().next().value);
  }
  map.set(key, value);
  return value;
}

/** As duas primeiras palavras, sem acento, emoji, pontuação nem markdown do Discord. */
function openerOf(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/<a?:\w+:\d+>/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

/**
 * Escolhe uma fala de `list`.
 * - `key`: identifica o banco (ex.: "quip:py-dice:pt").
 * - `user`: quem vai ler; sem ela, a memória de aberturas é a do bot inteiro.
 * - `rng`: para testes.
 */
function pick(list, { key = 'default', user = null, rng = Math.random } = {}) {
  if (!Array.isArray(list) || list.length === 0) return null;
  if (list.length === 1) return list[0];

  const recent = touch(decks, key, () => []);
  const windowSize = Math.max(1, Math.min(list.length - 1, Math.floor(list.length * 0.6)));
  const seenOpeners = touch(audiences, user ? String(user) : GLOBAL_AUDIENCE, () => []);

  let candidates = list.filter((line) => !recent.includes(line));
  if (!candidates.length) candidates = list.slice();
  // Prefere aberturas que a pessoa não viu nas últimas N; se todas já saíram, encolhe a memória
  // até sobrar ao menos uma diferente da última (lista pequena nunca repete a abertura colada).
  for (let k = seenOpeners.length; k > 0; k -= 1) {
    const recentOpeners = seenOpeners.slice(-k);
    const fresh = candidates.filter((line) => !recentOpeners.includes(openerOf(line)));
    if (fresh.length) {
      candidates = fresh;
      break;
    }
  }

  const chosen = candidates[Math.floor(rng() * candidates.length)] ?? candidates[0];

  recent.push(chosen);
  while (recent.length > windowSize) recent.shift();
  seenOpeners.push(openerOf(chosen));
  while (seenOpeners.length > OPENER_MEMORY) seenOpeners.shift();
  return chosen;
}

function _reset() {
  decks.clear();
  audiences.clear();
}

module.exports = { pick, openerOf, OPENER_MEMORY, _reset };

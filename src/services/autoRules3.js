// Regras puras do lote 3 de automações (bem-estar, moderação leve e ferramentas). Sem Discord.

const strip = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Frases de crise (PT/EN). Só sinais claros, para não assustar ninguém à toa com falso positivo.
const CRISIS = [
  /\bquero morrer\b/,
  /\bvontade de morrer\b/,
  /\b(me|eu vou me|vou me) matar\b/,
  /\bme suicidar\b/,
  /\bsuicid(io|ar)\b/,
  /\bnao (aguento|quero) mais viver\b/,
  /\bacabar com (a )?minha vida\b/,
  /\bme machucar de proposito\b/,
  /\bkill myself\b/,
  /\bwant to die\b/,
  /\bend (my|it all|my life)\b/,
  /\bsuicid(e|al)\b/,
  /\bself[- ]?harm\b/,
];
function isCrisis(text) {
  const s = strip(text);
  return CRISIS.some((re) => re.test(s));
}

// Proporção de maiúsculas entre as letras (ignora menções, emojis e links).
function capsRatio(text) {
  const letters = String(text || '')
    .replace(/<[^>]+>|https?:\/\/\S+|:\w+:/g, '')
    .match(/\p{L}/gu);
  if (!letters || !letters.length) return { letters: 0, ratio: 0 };
  const upper = letters.filter((c) => c !== c.toLowerCase() && c === c.toUpperCase()).length;
  return { letters: letters.length, ratio: upper / letters.length };
}

// "gatilho => resposta" (uma por linha). Gatilhos podem ter variações separadas por |.
function parseFaq(lines) {
  return (lines || [])
    .map((line) => {
      const [left, ...rest] = String(line).split('=>');
      const answer = rest.join('=>').trim();
      const triggers = String(left || '')
        .split('|')
        .map((x) => strip(x).trim())
        .filter((x) => x.length >= 2);
      return triggers.length && answer ? { triggers, answer } : null;
    })
    .filter(Boolean);
}
function matchFaq(pairs, text) {
  const s = ` ${strip(text).replace(/[^\p{L}\p{N}\s]/gu, ' ')} `;
  return pairs.find((p) => p.triggers.some((tr) => s.includes(` ${tr} `))) || null;
}

const MILESTONES = [50, 100, 200, 250, 300, 400, 500, 750, 1000];
function isMilestone(count) {
  return MILESTONES.includes(count) || (count > 1000 && count % 1000 === 0);
}

const LINK_RE = /https?:\/\/\S+|discord(?:app)?\.(?:gg|com\/invite)\/\S+/i;
const hasLink = (text) => LINK_RE.test(String(text || ''));

const BRT = 3 * 3600000;
const brtParts = (now) => {
  const d = new Date(now - BRT);
  return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours(), weekday: d.getUTCDay() };
};
// Semana ISO aproximada (segunda a domingo) para não mandar o resumo duas vezes.
function weekKey(now) {
  const d = new Date(now - BRT);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));
  return monday.toISOString().slice(0, 10);
}

function fill(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

// Sequência de foco: mensagens seguidas com pausas menores que gapMs.
function createFocusTracker(gapMs = 20 * 60000) {
  const map = new Map();
  return {
    hit(key, at) {
      const s = map.get(key);
      const next = s && at - s.last < gapMs ? { ...s, last: at, count: s.count + 1 } : { start: at, last: at, count: 1, remindedAt: s?.remindedAt || 0 };
      map.set(key, next);
      if (map.size > 5000) map.delete(map.keys().next().value);
      return next;
    },
    reminded(key, at) {
      const s = map.get(key);
      if (s) map.set(key, { ...s, start: at, count: 0, remindedAt: at });
    },
    reset: () => map.clear(),
  };
}

// Disboard: mensagem do bot depois de um /bump bem-sucedido.
const DISBOARD_ID = '302050872383242240';
function isBumpDone(message) {
  if (message?.author?.id !== DISBOARD_ID) return false;
  const text = (message.embeds || []).map((e) => `${e.description || e.data?.description || ''}`).join(' ');
  return /bump (done|feito|effectué|hecho)|:thumbsup:|👍/i.test(text);
}

module.exports = { isCrisis, capsRatio, parseFaq, matchFaq, isMilestone, hasLink, brtParts, weekKey, fill, createFocusTracker, isBumpDone, DISBOARD_ID, strip };

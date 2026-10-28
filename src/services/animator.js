// Animador de chat: regras puras de quando falar e o que postar.
// Só fala quando o chat JÁ parou, num canal que estava vivo, no horário escolhido e com limite.
const BANK = require('../data/animatorBank');

const HOUR = 3600000;
const ANSWER_WINDOW_MS = 30 * 60000;
const GUILD_GAP_MS = 30 * 60000;
const MIN_ALIVE_MSGS = 5;

const brtHour = (now) => new Date(now - 3 * HOUR).getUTCHours();
const brtDay = (now) => new Date(now - 3 * HOUR).toISOString().slice(0, 10);

function inWindow(hour, start, end) {
  return start <= end ? hour >= start && hour <= end : hour >= start || hour <= end;
}

// Fator de espera: a cada 3 tentativas seguidas sem resposta, dobra (até 8x).
function waitFactor(failures) {
  return Math.min(8, 2 ** Math.floor((failures || 0) / 3));
}

// ch: { lastHumanAt, recent24h, lastWasBot, failures, pausedUntil, postsToday, postsDay }
function shouldPost({ now = Date.now(), cfg, ch, guildLastPostAt = 0, blocked = false }) {
  if (blocked || !cfg.enabled) return 'off';
  if (ch.pausedUntil && ch.pausedUntil > now) return 'paused';
  if (!inWindow(brtHour(now), cfg.hourStart, cfg.hourEnd)) return 'hours';
  if (!ch.lastHumanAt || ch.recent24h < MIN_ALIVE_MSGS) return 'dead';
  if (ch.lastWasBot) return 'bot_last';
  if (now - ch.lastHumanAt < cfg.silenceMinutes * 60000 * waitFactor(ch.failures)) return 'not_quiet';
  if ((ch.postsDay === brtDay(now) ? ch.postsToday : 0) >= cfg.maxPerDay) return 'limit';
  if (now - guildLastPostAt < GUILD_GAP_MS) return 'guild_gap';
  return 'post';
}

function shuffleWord(word, rng = Math.random) {
  const letters = [...word];
  for (let tries = 0; tries < 10; tries += 1) {
    for (let i = letters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    if (letters.join('') !== word) break;
  }
  return letters.join('');
}

const normalizeAnswer = (s) => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]/gi, '').toUpperCase();

// Escolhe o conteúdo. houseLines = perguntas escritas pela staff.
function pickContent({ types, lang, houseLines = [] }, rng = Math.random) {
  const usable = types.filter((t) => t !== 'house' || houseLines.length);
  if (!usable.length) return null;
  const type = usable[Math.floor(rng() * usable.length)];
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const en = lang === 'en';
  if (type === 'house') return { type, text: pick(houseLines) };
  if (type === 'thisOrThat') {
    const [aPt, bPt, aEn, bEn] = pick(BANK.thisOrThat);
    return { type, a: en ? aEn : aPt, b: en ? bEn : bPt };
  }
  if (type === 'poll') {
    const [qPt, oPt, qEn, oEn] = pick(BANK.poll);
    return { type, text: en ? qEn : qPt, answers: en ? oEn : oPt };
  }
  if (type === 'scramble') {
    const word = pick(BANK.scramble[en ? 'en' : 'pt']);
    return { type, answer: word, text: shuffleWord(word, rng) };
  }
  const [pt, enText] = pick(BANK[type]);
  return { type, text: en ? enText : pt };
}

module.exports = { shouldPost, pickContent, shuffleWord, normalizeAnswer, inWindow, waitFactor, brtDay, brtHour, ANSWER_WINDOW_MS, MIN_ALIVE_MSGS };

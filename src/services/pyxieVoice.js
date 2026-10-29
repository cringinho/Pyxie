// Voz da Pyxie (plano 5.8): uma fala curta e debochada para o daily, o trabalho e o tarot.
// - Groq só na Cringelândia, com teto diário próprio e espera máxima de 3 s; fora dela ou se o Groq
//   falhar, usa as falas prontas de i18n (pyxieVoice.<evento>.<n>).
// - Contexto enviado: apelido, horário, profissão, casamento, sequência, carta. NUNCA o texto das
//   mensagens da pessoa.
// - Persona: presunçosa, dramática, "desaforada"; zoa situações e escolhas, nunca traços da pessoa;
//   nada de política, religião, sexualidade ou saúde; nunca em acolhimento (não é chamada lá).
const fs = require('node:fs');
const path = require('node:path');
const { t, TRANSLATIONS } = require('../utils/i18n');

const DAILY_CAP = 300;
const TIMEOUT_MS = 3000;
const MAX_LEN = 180;
const CACHE_MS = 10 * 60 * 1000;
const EVENTS = ['daily', 'work', 'tarot'];

// Palavras que nunca podem sair numa fala (temas proibidos e ofensas comuns).
const BANNED = /\b(pol[ií]tic|bolsonar|lula|elei[cç]|religi|deus|igreja|sexo|sexual|gay|l[eé]sbica|trans\b|suic[ií]d|depress|ansiedad|autis|tdah|doen[cç]a|rem[eé]dio|morte|morrer|burr|idiot|retardad|feio|gord|magr)/i;

const cache = new Map();

function stateFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'pyxieVoice.json');
}

function today(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(now));
}

function takeQuota(now = Date.now()) {
  let state = { day: '', count: 0 };
  try {
    state = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
  } catch (_) {}
  const day = today(now);
  if (state.day !== day) state = { day, count: 0 };
  if (state.count >= DAILY_CAP) return false;
  state.count++;
  fs.mkdirSync(path.dirname(stateFile()), { recursive: true });
  fs.writeFileSync(`${stateFile()}.tmp`, JSON.stringify(state));
  fs.renameSync(`${stateFile()}.tmp`, stateFile());
  return true;
}

// Fala pronta aleatória do banco (voiceSeederService dinâmico ou i18n).
function fallbackLine(event, lang, vars = {}) {
  try {
    const seeder = require('./voiceSeederService');
    const seederLine = seeder.getRandomLine(event, lang);
    if (seederLine && Math.random() < 0.5) {
      return seederLine.replace(/{name}/g, vars.name || '');
    }
  } catch (_) {}

  const bank = TRANSLATIONS[lang]?.pyxieVoice?.[event] || TRANSLATIONS.pt.pyxieVoice[event] || {};
  const keys = Object.keys(bank);
  if (!keys.length) return '';
  const key = keys[Math.floor(Math.random() * keys.length)];
  return t(`pyxieVoice.${event}.${key}`, lang, vars);
}

// Filtro da resposta antes de enviar: tamanho, menções, links e temas proibidos.
function cleanLine(raw) {
  if (typeof raw !== 'string') return null;
  const line = raw.replace(/\s+/g, ' ').replace(/^["“'\s]+|["”'\s]+$/g, '').trim();
  if (!line || line.length > MAX_LEN) return null;
  if (/<[@#]|@everyone|@here|https?:\/\/|www\.|discord\.gg/i.test(line)) return null;
  if (BANNED.test(line)) return null;
  return line;
}

function buildPrompt(event, ctx, lang) {
  const facts = [
    `evento: ${event}`,
    ctx.nickname ? `apelido: ${String(ctx.nickname).slice(0, 32)}` : null,
    `hora em Brasília: ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }).format(ctx.now || new Date())}`,
    ctx.profession ? `profissão no bot: ${ctx.profession}` : null,
    ctx.married !== undefined ? `casada(o) no bot: ${ctx.married ? 'sim' : 'não'}` : null,
    ctx.streak ? `sequência do diário: ${ctx.streak} dias` : null,
    ctx.card ? `carta do tarot: ${ctx.card}` : null,
    ctx.success !== undefined ? `resultado: ${ctx.success ? 'acertou' : 'errou'}` : null,
  ].filter(Boolean);
  return [
    {
      role: 'system',
      content:
        `Você é a Pyxie, uma fada tsundere de um servidor do Discord. Escreva UMA frase curta (até 140 caracteres) em ${lang === 'en' ? 'inglês' : 'português do Brasil'}, ` +
        'presunçosa, dramática e debochada, como quem finge não se importar. Zoe a situação ou a escolha, nunca traços da pessoa ' +
        '(aparência, inteligência, lentidão, deficiência, identidade). Proibido: política, religião, sexualidade, saúde, menções, links, emojis demais. ' +
        'Responda só a frase.',
    },
    { role: 'user', content: facts.join('\n') },
  ];
}

/**
 * Devolve { text, source: 'groq'|'fallback' }.
 * options: { inCringelandia, lang, chat (injetável), now }
 */
async function line(event, ctx = {}, { inCringelandia = false, lang = 'pt', chat = null, now = Date.now() } = {}) {
  if (!EVENTS.includes(event)) return { text: '', source: 'none' };
  const vars = { name: ctx.nickname || '' };
  if (!inCringelandia) return { text: fallbackLine(event, lang, vars), source: 'fallback' };

  const cacheKey = `${event}:${ctx.userId || ''}:${lang}`;
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < CACHE_MS) return { text: hit.text, source: 'cache' };

  if (!takeQuota(now)) return { text: fallbackLine(event, lang, vars), source: 'fallback' };
  const groq = chat || require('./groqClient').chatCompletionNow;
  let text = null;
  try {
    const res = await Promise.race([
      groq({ model: 'llama-3.1-8b-instant', temperature: 0.9, max_tokens: 60, messages: buildPrompt(event, { ...ctx, now: new Date(now) }, lang) }, { label: 'Voz da Pyxie' }),
      new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: 'timeout' }), TIMEOUT_MS)),
    ]);
    if (res?.ok) text = cleanLine(res.data?.choices?.[0]?.message?.content);
  } catch (_) {}
  if (!text) return { text: fallbackLine(event, lang, vars), source: 'fallback' };
  cache.set(cacheKey, { text, at: now });
  return { text, source: 'groq' };
}

// Atalho para os comandos: resolve servidor e idioma a partir da interação/mensagem.
async function lineFor(event, source, ctx = {}) {
  try {
    const { CRINGELANDIA_GUILD_ID } = require('../config/scopes');
    const { getLanguage } = require('../utils/i18n');
    const guildId = source?.guildId ?? source?.guild?.id ?? null;
    const nickname = source?.member?.displayName || source?.user?.globalName || source?.author?.globalName || source?.user?.username || source?.author?.username || '';
    const userId = source?.user?.id || source?.author?.id;
    const res = await line(event, { nickname, userId, ...ctx }, { inCringelandia: guildId === CRINGELANDIA_GUILD_ID, lang: getLanguage(source) });
    return res.text;
  } catch (_) {
    return '';
  }
}

function _resetCache() {
  cache.clear();
}

module.exports = { line, lineFor, cleanLine, fallbackLine, DAILY_CAP, _resetCache };

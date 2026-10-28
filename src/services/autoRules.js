// Regras puras das automações de segurança, moderação e utilidade (sem Discord, fáceis de testar).

// ---------- Nomes ----------
const ZALGO_RE = /[̀-ͯ҃-҉᪰-᫿᷀-᷿⃐-⃿︠-︯]{2,}/g;
const INVISIBLE_RE = /[​-‏⁠-⁤ㅤﾠᅟᅠ឴឵᠎]/g;
const LINK_RE = /(https?:\/\/\S+|discord(?:app)?\.(?:gg|com\/invite)\/\S+|\b[a-z0-9-]+\.(?:gg|com|net|xyz|ru|io)\b)/gi;
const HOIST_RE = /^[^\p{L}\p{N}]+/u;

// Nome limpo, ou null quando não precisa mexer. fallback entra quando sobra nada.
function cleanName(name, { zalgo = true, links = true, hoist = false } = {}, fallback = 'Pessoa') {
  const original = String(name || '');
  let out = original;
  if (zalgo) out = out.replace(ZALGO_RE, '').replace(INVISIBLE_RE, '');
  if (links) out = out.replace(LINK_RE, '');
  if (hoist) out = out.replace(HOIST_RE, '');
  out = out.replace(/\s{2,}/g, ' ').trim().slice(0, 32);
  if (out === original) return null;
  return out.length >= 2 ? out : fallback;
}

// Forma "esqueleto" para comparar nomes parecidos (acentos, leetspeak, símbolos).
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i', '|': 'l' };
function skeleton(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[0-9@$!|]/g, (c) => LEET[c] || c)
    .replace(/l/g, 'i')
    .replace(/rn/g, 'm')
    .replace(/[^a-z]/g, '');
}

function distance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

// Nome que imita alguém da staff (mesmo esqueleto, ou 1 letra de diferença em nomes de 5+).
function imitates(name, staffName) {
  const a = skeleton(name);
  const b = skeleton(staffName);
  if (a.length < 3 || b.length < 3) return false;
  if (a === b) return true;
  return b.length >= 5 && distance(a, b) <= 1;
}

// ---------- Mensagens ----------
const INVITE_RE = /(?:discord(?:app)?\.com\/invite|discord\.gg|dsc\.gg)\/([a-z0-9-]{2,32})/gi;
function inviteCodes(text) {
  return [...String(text || '').matchAll(INVITE_RE)].map((m) => m[1]);
}

const FIXERS = {
  x: [/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/(\w+\/status\/\d+)\S*/gi, 'https://fxtwitter.com/$1'],
  instagram: [/https?:\/\/(?:www\.)?instagram\.com\/((?:p|reel|reels)\/[\w-]+)\S*/gi, 'https://ddinstagram.com/$1'],
  tiktok: [/https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/(\S+)/gi, 'https://vxtiktok.com/$1'],
  reddit: [/https?:\/\/(?:www\.|old\.)?reddit\.com\/(r\/\w+\/comments\/\S+)/gi, 'https://rxddit.com/$1'],
  bluesky: [/https?:\/\/bsky\.app\/(profile\/\S+\/post\/\w+)/gi, 'https://fxbsky.app/$1'],
};
// Links trocados por versões que mostram a prévia no Discord. Ignora links entre < > (sem prévia de propósito).
function fixLinks(text, sites) {
  const out = [];
  const clean = String(text || '').replace(/<https?:\/\/[^>]+>/g, '');
  for (const site of sites) {
    const [re, to] = FIXERS[site] || [];
    if (!re) continue;
    for (const m of clean.matchAll(re)) out.push(m[0].replace(new RegExp(re.source, 'i'), to));
  }
  return [...new Set(out)].slice(0, 5);
}

function lineCount(text) {
  return String(text || '').split('\n').length;
}

function parseEmojis(text) {
  return String(text || '')
    .split(/\s+/)
    .map((e) => e.trim())
    .filter((e) => /^<a?:\w+:\d{17,20}>$/.test(e) || /\p{Extended_Pictographic}/u.test(e))
    .slice(0, 5);
}

// ---------- Contraste de cor (WCAG) ----------
const BACKGROUNDS = { dark: '313338', light: 'ffffff' };
function luminance(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
// Clareia (fundo escuro) até passar no mínimo; devolve hex.
function suggestColor(hex, min, bg = BACKGROUNDS.dark) {
  let n = parseInt(String(hex).replace('#', ''), 16);
  for (let step = 0; step < 40 && contrast(n.toString(16).padStart(6, '0'), bg) < min; step += 1) {
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.min(255, Math.round(v + (255 - v) * 0.12)));
    n = (c[0] << 16) | (c[1] << 8) | c[2];
  }
  return n.toString(16).padStart(6, '0');
}

// ---------- Contadores em janela ----------
// Mesmo texto em vários canais em pouco tempo (conta invadida espalhando golpe).
function createSpamTracker(windowMs = 60000) {
  const seen = new Map(); // guild:user -> [{ channelId, messageId, hash, at }]
  return {
    add({ guildId, userId, channelId, messageId, content, at }, threshold) {
      const key = `${guildId}:${userId}`;
      const hash = String(content || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 300);
      if (hash.length < 8) return null;
      const list = (seen.get(key) || []).filter((e) => at - e.at < windowMs);
      list.push({ channelId, messageId, hash, at });
      seen.set(key, list.slice(-20));
      if (seen.size > 5000) seen.delete(seen.keys().next().value);
      const same = list.filter((e) => e.hash === hash);
      return new Set(same.map((e) => e.channelId)).size >= threshold ? same : null;
    },
    clear: (guildId, userId) => seen.delete(`${guildId}:${userId}`),
    reset: () => seen.clear(),
  };
}

// Ritmo por chave (mensagens por minuto num canal, ações de moderação por pessoa).
function createRateCounter() {
  const map = new Map();
  return {
    hit(key, at, windowMs) {
      const list = (map.get(key) || []).filter((x) => at - x < windowMs);
      list.push(at);
      map.set(key, list);
      if (map.size > 5000) map.delete(map.keys().next().value);
      return list.length;
    },
    count(key, at, windowMs) {
      return (map.get(key) || []).filter((x) => at - x < windowMs).length;
    },
    reset: () => map.clear(),
  };
}

// ---------- Status do Discord ----------
function unresolvedIncidents(json) {
  return (json?.incidents || [])
    .filter((i) => i && i.status !== 'resolved' && i.status !== 'postmortem')
    .map((i) => ({ id: String(i.id), name: String(i.name || '').slice(0, 200), status: String(i.status || ''), impact: String(i.impact || 'none'), url: i.shortlink || 'https://discordstatus.com' }));
}

module.exports = {
  cleanName,
  skeleton,
  imitates,
  inviteCodes,
  fixLinks,
  lineCount,
  parseEmojis,
  contrast,
  suggestColor,
  BACKGROUNDS,
  createSpamTracker,
  createRateCounter,
  unresolvedIncidents,
};

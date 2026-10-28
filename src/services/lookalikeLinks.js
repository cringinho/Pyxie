// Detector de links que imitam sites conhecidos (escudo de links). Função pura, sem rede:
// só olha o endereço. Cobre letras de outro alfabeto (dіscord com "і" ucraniano), troca de
// letras parecidas (disc0rd), erro de digitação proposital (discrod), nome certo com final
// errado (discord.xyz), isca (discord-nitro.gift) e o endereço verdadeiro no começo de outro
// site (discord.com.login-verify.ru).
const { domainToUnicode } = require('node:url');

// Domínios verdadeiros: nunca são marcados. A marca (primeira parte) também serve de referência.
const LEGIT_DOMAINS = [
  'discord.com', 'discord.gg', 'discordapp.com', 'discordapp.net', 'discord.gift', 'discord.new', 'discord.media',
  'discordstatus.com', 'dis.gd', 'steamcommunity.com', 'steampowered.com', 'steamstatic.com', 'roblox.com',
  'epicgames.com', 'twitch.tv', 'youtube.com', 'youtu.be', 'google.com', 'instagram.com', 'tiktok.com',
  'github.com', 'minecraft.net', 'riotgames.com', 'leagueoflegends.com', 'spotify.com', 'paypal.com',
  'mercadopago.com.br', 'mercadolivre.com.br', 'nubank.com.br', 'playstation.com', 'xbox.com', 'microsoft.com',
  'apple.com', 'netflix.com', 'whatsapp.com', 'facebook.com', 'hoyoverse.com', 'x.com', 'twitter.com',
];

// Sites de comunidade que usam a marca no nome e não são golpe (listas de servidores e bots).
const KNOWN_SAFE = ['discord.me', 'discord.bio', 'discords.com', 'discordbotlist.com', 'discordservers.com', 'discordtemplates.me', 'disboard.org', 'top.gg', 'discord.js.org', 'steamdb.info', 'steamtrades.com'];

// Marcas mais usadas em golpe no Discord: final de site trocado já basta para marcar.
const STRICT_BRANDS = ['discord', 'discordapp', 'steamcommunity', 'steampowered'];

// Palavras de isca que, junto com a marca (ou com "nitro"), denunciam golpe.
const LURE_WORDS = ['nitro', 'gift', 'free', 'gratis', 'airdrop', 'verify', 'verification', 'login', 'giveaway', 'promo', 'claim', 'reward', 'trade', 'presente'];
const LURE_BRANDS = ['discord', 'steamcommunity', 'steampowered', 'roblox', 'nitro'];

// Erro de digitação só conta nestas marcas: em nomes comuns daria falso alarme (twister ≈ twitter).
const TYPO_BRANDS = ['discord', 'discordapp', 'steamcommunity', 'steampowered', 'instagram', 'epicgames', 'mercadopago', 'mercadolivre'];

// Sufixos de dois níveis comuns (o domínio que alguém registra fica um nível antes).
const TWO_LEVEL_SUFFIXES = new Set(['com.br', 'net.br', 'org.br', 'gov.br', 'edu.br', 'co.uk', 'org.uk', 'com.au', 'co.jp', 'com.mx', 'com.ar', 'co.nz', 'com.tr']);

// Letras de outros alfabetos que parecem latinas (cirílico, grego, armênio e afins).
const CONFUSABLES = {
  а: 'a', в: 'b', е: 'e', ё: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x',
  і: 'i', ї: 'i', ј: 'j', ԁ: 'd', ѕ: 's', ӏ: 'l', ԛ: 'q', ԝ: 'w', һ: 'h', ɡ: 'g', ı: 'i',
  α: 'a', β: 'b', ε: 'e', η: 'n', ι: 'i', κ: 'k', ν: 'v', ο: 'o', ρ: 'p', τ: 't', υ: 'u', χ: 'x', ω: 'w',
  օ: 'o', ս: 'u', ց: 'g', հ: 'h', ո: 'n', ⅼ: 'l',
};

// Troca o que "parece igual" por uma forma única; os dois lados da comparação passam por aqui.
function skeleton(text) {
  let s = String(text || '').normalize('NFKC').toLowerCase();
  s = Array.from(s, (ch) => CONFUSABLES[ch] || ch).join('');
  s = s.normalize('NFD').replace(/\p{M}/gu, '');
  return s
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    .replace(/[01il|]/g, (c) => (c === '0' ? 'o' : 'l'))
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's');
}

function registrableOf(host) {
  const labels = host.split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  return TWO_LEVEL_SUFFIXES.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo;
}

function brandOf(domain) {
  return domain.split('.')[0];
}

// Distância de edição com troca de vizinhas (Damerau, versão simples).
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

const LEGIT_SET = new Set([...LEGIT_DOMAINS, ...KNOWN_SAFE]);
const LEGIT_SKELETONS = new Map(LEGIT_DOMAINS.map((d) => [skeleton(d), d]));
const BRAND_SKELETONS = new Map();
for (const d of LEGIT_DOMAINS) {
  const brand = brandOf(d);
  if (!BRAND_SKELETONS.has(skeleton(brand))) BRAND_SKELETONS.set(skeleton(brand), d);
}

function scriptsOf(label) {
  const scripts = new Set();
  for (const ch of label) {
    if (/\p{Script=Latin}/u.test(ch)) scripts.add('latin');
    else if (/\p{Script=Cyrillic}/u.test(ch)) scripts.add('cyrillic');
    else if (/\p{Script=Greek}/u.test(ch)) scripts.add('greek');
    else if (/\p{Script=Armenian}/u.test(ch)) scripts.add('armenian');
  }
  return scripts;
}

// Analisa um endereço. Devolve null quando está tudo bem.
function analyzeHost(rawHost, { allowDomains = [] } = {}) {
  const asciiHost = String(rawHost || '').toLowerCase().replace(/\.$/, '');
  if (!asciiHost || /^[\d.]+$/.test(asciiHost) || asciiHost.includes(':')) return null;
  const host = domainToUnicode(asciiHost) || asciiHost;
  const registrable = registrableOf(host);
  const registrableAscii = registrableOf(asciiHost);
  if (LEGIT_SET.has(registrableAscii)) return null;
  if (LEGIT_SET.has(asciiHost)) return null;
  if (allowDomains.some((d) => registrableAscii === d || asciiHost === d || asciiHost.endsWith(`.${d}`))) return null;

  const hit = (reason, imitates) => ({ host: asciiHost, unicodeHost: host, registrable: registrableAscii, reason, imitates });
  const isIdn = asciiHost.split('.').some((l) => l.startsWith('xn--'));
  const regSkeleton = skeleton(registrable);
  const label = brandOf(registrable);
  const labelSkeleton = skeleton(label);

  // 1. O domínio inteiro "se lê" igual a um verdadeiro.
  if (LEGIT_SKELETONS.has(regSkeleton)) return hit(isIdn ? 'homograph' : 'lookalike', LEGIT_SKELETONS.get(regSkeleton));

  // 2. Endereço verdadeiro no começo, outro site no fim (discord.com.login-verify.ru).
  const sub = host.slice(0, Math.max(0, host.length - registrable.length - 1));
  if (sub) {
    const subSkeleton = skeleton(sub);
    for (const [legitSkeleton, legit] of LEGIT_SKELETONS) {
      if (subSkeleton === legitSkeleton || subSkeleton.endsWith(`.${legitSkeleton}`) || subSkeleton.includes(`${legitSkeleton}.`)) return hit('subdomain', legit);
    }
  }

  // 3. Nome da marca com final de site trocado (discord.xyz, steamcommunity.ru).
  const strict = STRICT_BRANDS.find((b) => skeleton(b) === labelSkeleton);
  if (strict) return hit(isIdn ? 'homograph' : 'tld', BRAND_SKELETONS.get(labelSkeleton));

  // 4. Erro de digitação proposital em marca longa (discrod, steamcomunity).
  const compact = labelSkeleton.replace(/-/g, '');
  for (const brand of TYPO_BRANDS) {
    const brandSkeleton = skeleton(brand);
    if (compact !== brandSkeleton && editDistance(compact, brandSkeleton) === 1) return hit('typo', BRAND_SKELETONS.get(brandSkeleton));
  }

  // 5. Marca + isca (discord-nitro.gift, free-nitro.com, steam-gift.ru).
  const words = skeleton(host.replace(/[.-]/g, ' '));
  const brand = LURE_BRANDS.find((b) => words.includes(skeleton(b)));
  if (brand && LURE_WORDS.some((w) => w !== brand && words.includes(skeleton(w)))) {
    return hit('lure', BRAND_SKELETONS.get(skeleton(brand)) || 'discord.com');
  }

  // 6. Alfabetos misturados no mesmo nome (navegadores também desconfiam disso).
  if (isIdn && host.split('.').some((l) => scriptsOf(l).size > 1)) return hit('mixed', null);
  return null;
}

const URL_RE = /https?:\/\/[^\s<>()[\]"'`]+/gi;
const MAX_URLS = 10;

// Procura links numa mensagem. Barato: sem "http" no texto, nem começa.
function findLookalikes(content, options = {}) {
  const text = String(content || '');
  if (!/https?:\/\//i.test(text)) return [];
  const found = [];
  const seen = new Set();
  for (const raw of (text.match(URL_RE) || []).slice(0, MAX_URLS)) {
    let host;
    try {
      host = new URL(raw.replace(/[.,;:!?]+$/, '')).hostname;
    } catch (_) {
      continue;
    }
    if (seen.has(host)) continue;
    seen.add(host);
    const result = analyzeHost(host, options);
    if (result) found.push({ ...result, url: raw });
  }
  return found;
}

// Normaliza a lista de domínios liberados pelo servidor (um por linha, sem http, sem barra).
function normalizeDomainList(list) {
  const out = new Set();
  for (const item of Array.isArray(list) ? list : String(list || '').split(/[\s,]+/)) {
    let d = String(item || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/^\*\./, '');
    if (!d) continue;
    try {
      d = new URL(`http://${d}`).hostname;
    } catch (_) {
      continue;
    }
    if (/^[a-z0-9.-]+\.[a-z0-9-]{2,}$/.test(d)) out.add(d);
  }
  return [...out].slice(0, 50);
}

module.exports = { findLookalikes, analyzeHost, skeleton, normalizeDomainList, LEGIT_DOMAINS };

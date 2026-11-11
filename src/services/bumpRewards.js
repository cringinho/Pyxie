// Recompensa por bump no DISBOARD, só na Cringelândia: `100` moedinhas (pelo teto diário) e, raramente,
// um feijão mágico. Regras de economia (docs/agents/05-economia.md):
// - permissão: só conta a mensagem "Bump done" do próprio DISBOARD (autoRules3.isBumpDone);
// - cooldown: um bump premiado a cada 110 min por servidor (o DISBOARD libera de 2 em 2 h), então no
//   máximo 13 por dia; cada pessoa ainda passa pelo teto diário de moedas da economia;
// - atomicidade: o estado é gravado ANTES do crédito (reinício no meio não paga duas vezes) e o
//   crédito de moedas + feijão sai numa trava só (economy.grantReward).
// Estado em data/guilds/<id>/bumpRewards.json. Texto com a voz da Pyxie, sorteado sem repetir (phraseDeck).
const { EmbedBuilder } = require('discord.js');
const { CRINGELANDIA_GUILD_ID } = require('../config/scopes');
const { t, TRANSLATIONS } = require('../utils/i18n');
const deck = require('../utils/phraseDeck');
const { bumperFrom } = require('./bumpReminder');

const MINUTE = 60000;
const COINS = 100;
const BEANS = 1;
const BEAN_CHANCE = 0.05;
const MIN_GAP_MS = 110 * MINUTE;
const NEXT_BUMP_MS = 120 * MINUTE;
const USER_CAP = 200;
const RECENT_IDS = 20;
const COLOR = '#ec4899';
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };
const ID_RE = /^\d{17,20}$/;

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

const eligible = (guildId) => Boolean(guildId) && String(guildId) === String(CRINGELANDIA_GUILD_ID);

function normalize(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const totals = src.totals && typeof src.totals === 'object' ? src.totals : {};
  const byUser = {};
  for (const [id, u] of Object.entries(src.byUser && typeof src.byUser === 'object' ? src.byUser : {})) {
    if (!ID_RE.test(id) || !u) continue;
    const n = num(u.n);
    if (!n) continue;
    byUser[id] = { n, coins: num(u.coins), beans: num(u.beans), lastAt: num(u.lastAt), name: String(u.name || '').slice(0, 40) };
  }
  const capped = Object.entries(byUser)
    .sort((a, b) => b[1].n - a[1].n || b[1].lastAt - a[1].lastAt)
    .slice(0, USER_CAP);
  return {
    version: 1,
    lastAt: num(src.lastAt),
    recentIds: (Array.isArray(src.recentIds) ? src.recentIds : []).map(String).filter((id) => ID_RE.test(id)).slice(-RECENT_IDS),
    totals: { bumps: num(totals.bumps), coins: num(totals.coins), beans: num(totals.beans) },
    byUser: Object.fromEntries(capped),
  };
}

// Decide e paga. Síncrono: o envio da mensagem fica com quem chama.
// Devolve { granted: false, reason } ou { granted: true, userId, coins, beans, capped, nextAt, n }.
function claim(message, { now = Date.now(), rng = Math.random, store = require('./autoState'), economy = require('./economy') } = {}) {
  const guildId = message?.guild?.id;
  if (!eligible(guildId)) return { granted: false, reason: 'zone' };
  const bumper = bumperFrom(message);
  if (!bumper.id) return { granted: false, reason: 'no-user' };

  const s = normalize(store.read(guildId, 'bumpRewards.json'));
  const messageId = ID_RE.test(String(message?.id || '')) ? String(message.id) : '';
  if (messageId && s.recentIds.includes(messageId)) return { granted: false, reason: 'duplicate' };
  if (s.lastAt && now - s.lastAt < MIN_GAP_MS) return { granted: false, reason: 'cooldown' };

  // Reserva primeiro: se o processo cair depois daqui, o pior caso é não pagar, nunca pagar em dobro.
  s.lastAt = now;
  if (messageId) s.recentIds = [...s.recentIds, messageId].slice(-RECENT_IDS);
  store.write(guildId, 'bumpRewards.json', s);

  const beans = rng() < BEAN_CHANCE ? BEANS : 0;
  const paid = economy.grantReward(bumper.id, { coins: COINS, beans }, now);

  const prev = s.byUser[bumper.id] || { n: 0, coins: 0, beans: 0, lastAt: 0, name: '' };
  const name = String(bumper.name || message?.interaction?.user?.username || prev.name || '').slice(0, 40);
  s.byUser[bumper.id] = { n: prev.n + 1, coins: prev.coins + paid.coinsAdded, beans: prev.beans + paid.beansAdded, lastAt: now, name };
  s.totals.bumps += 1;
  s.totals.coins += paid.coinsAdded;
  s.totals.beans += paid.beansAdded;
  store.write(guildId, 'bumpRewards.json', normalize(s));

  return {
    granted: true,
    userId: bumper.id,
    coins: paid.coinsAdded,
    beans: paid.beansAdded,
    capped: paid.coinsAdded < COINS,
    cap: typeof economy.dailyCoinCap === 'function' ? economy.dailyCoinCap() : null,
    nextAt: now + NEXT_BUMP_MS,
    n: s.byUser[bumper.id].n,
  };
}

// Sorteia pelo texto (não pela chave) para a memória de aberturas do phraseDeck valer de verdade.
function pickKey(lang, group, user) {
  const bank = TRANSLATIONS[lang]?.bumpReward?.[group] || TRANSLATIONS.pt.bumpReward[group] || {};
  const entries = Object.entries(bank);
  const chosen = deck.pick(entries.map(([, text]) => text), { key: `bumpReward:${group}:${lang}`, user });
  return (entries.find(([, text]) => text === chosen) || entries[0] || ['1'])[0];
}

// Cartão do agradecimento pago (docs/agents/09-embeds.md: título curto com um emoji, blocos com \n\n).
function buildMessage(result = {}, lang = 'pt', emojis = {}) {
  const code = lang === 'en' ? 'en' : 'pt';
  const coin = emojis.coin || '🪙';
  const bean = emojis.bean || '🌱';
  const user = result.userId ? `<@${result.userId}>` : '';
  const title = t(`bumpReward.title.${pickKey(code, 'title')}`, code);
  const blocks = [t(`bumpReward.line.${pickKey(code, 'line', result.userId)}`, code, { user })];

  const reward = [];
  if (result.coins > 0) reward.push(t('bumpReward.coins', code, { coin, coins: result.coins }));
  if (result.beans > 0) reward.push(t('bumpReward.beans', code, { bean, beans: result.beans }));
  if (reward.length) blocks.push(reward.join('\n'));
  if (result.beans > 0) blocks.push(`> ${t(`bumpReward.bean.${pickKey(code, 'bean', result.userId)}`, code)}`);

  const notes = [];
  if (result.capped && result.cap) notes.push(t(result.coins > 0 ? 'bumpReward.capped' : 'bumpReward.cappedAll', code, { cap: result.cap }));
  if (result.nextAt) notes.push(t('bumpReward.next', code, { when: `<t:${Math.floor(result.nextAt / 1000)}:R>` }));
  if (notes.length) blocks.push(notes.join('\n'));

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title.slice(0, 256))
    .setDescription(blocks.join('\n\n').slice(0, 4000))
    .setFooter({ text: t('bumpReward.footer', code, { n: result.n || 1 }).slice(0, 2048) });
  // A menção fica dentro do embed: aparece o nome, sem notificar ninguém.
  return { embeds: [embed], allowedMentions: NO_PING };
}

// Números do painel (Automações → Lembrete de bump), só na Cringelândia.
function insights(raw = {}, now = Date.now()) {
  const s = normalize(raw);
  const top = Object.entries(s.byUser)
    .map(([id, u]) => ({ id, name: u.name, n: u.n, coins: u.coins, beans: u.beans }))
    .sort((a, b) => b.n - a.n || b.coins - a.coins)
    .slice(0, 5);
  const readyAt = s.lastAt ? s.lastAt + MIN_GAP_MS : 0;
  return {
    coinsPerBump: COINS,
    beanChance: BEAN_CHANCE,
    totals: s.totals,
    lastAt: s.lastAt || null,
    readyAt: readyAt > now ? readyAt : null,
    top,
  };
}

module.exports = { COINS, BEANS, BEAN_CHANCE, MIN_GAP_MS, NEXT_BUMP_MS, USER_CAP, eligible, normalize, claim, buildMessage, insights };

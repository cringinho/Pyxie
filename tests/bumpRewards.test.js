const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('📣 Testes da recompensa de bump da Cringelândia (moedas, feijão raro, cooldown e voz)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-bumpreward-'));

const rewards = require('../src/services/bumpRewards');
const economy = require('../src/services/economy');
const autoState = require('../src/services/autoState');
const tools = require('../src/modules/auto-tools');
const deck = require('../src/utils/phraseDeck');
const { TRANSLATIONS } = require('../src/utils/i18n');
const { CRINGELANDIA_GUILD_ID } = require('../src/config/scopes');

const G = CRINGELANDIA_GUILD_ID;
const OTHER = '111111111111111111';
const ids = (n) => String(800000000000000000n + BigInt(n));
const USER = ids(10);
const USER2 = ids(11);
const MIN = 60000;
// Um dia atrás: o passo 6 passa pelo módulo, que usa o relógio real.
const T0 = Date.now() - 24 * 3600000;
const DISBOARD_ID = '302050872383242240';

const disboard = (n, extra = {}) => ({
  id: ids(100 + n),
  guild: { id: G },
  channel: { id: ids(2) },
  author: { id: DISBOARD_ID, username: 'DISBOARD', bot: true },
  interaction: { user: { id: USER, username: 'ana', globalName: 'Ana' } },
  embeds: [{ description: 'Bump done! :thumbsup:' }],
  content: '',
  ...extra,
});

const always = () => 0; // rng que sempre sorteia o feijão
const never = () => 0.99;

const flat = (embed) => {
  const d = embed.data || embed;
  return `${d.title || ''}\n${d.description || ''}\n${d.footer?.text || ''}`;
};

(async () => {
  try {
    // 1. Zona, permissão (só DISBOARD) e quem bumpou.
    assert.equal(rewards.eligible(G), true);
    assert.equal(rewards.eligible(OTHER), false);
    assert.deepEqual(rewards.claim(disboard(0, { guild: { id: OTHER } }), { now: T0 }), { granted: false, reason: 'zone' });
    assert.equal(rewards.claim(disboard(0, { interaction: null, embeds: [{ description: 'Bump done!' }] }), { now: T0 }).reason, 'no-user');
    const forged = { ...disboard(1), author: { id: ids(99), bot: false } };
    assert.equal(tools.rewardBump(forged, T0), false, 'Mensagem que não é do DISBOARD não paga nada');
    // discord.js novo: quem bumpou vem em interactionMetadata.
    const meta = disboard(2, { interaction: null, interactionMetadata: { user: { id: USER2, username: 'bia' } } });
    const metaResult = rewards.claim(meta, { now: T0, rng: never });
    assert.equal(metaResult.granted, true);
    assert.equal(metaResult.userId, USER2);
    console.log('  ✅ 1. Só Cringelândia, só a mensagem do DISBOARD, quem bumpou pela interação.');

    // 2. Paga 100 moedinhas pelo teto, nada de feijão sem sorte, e cooldown de 110 min por servidor.
    const before = economy.getUserAccount(USER);
    const t1 = T0 + rewards.MIN_GAP_MS;
    const first = rewards.claim(disboard(3), { now: t1, rng: never });
    assert.equal(first.granted, true);
    assert.equal(first.coins, rewards.COINS);
    assert.equal(first.beans, 0);
    assert.equal(first.capped, false);
    assert.equal(first.nextAt, t1 + rewards.NEXT_BUMP_MS);
    const after = economy.getUserAccount(USER);
    assert.equal(after.coins - before.coins, 100);
    assert.equal(after.magicBeans, before.magicBeans);
    assert.equal(rewards.claim(disboard(3), { now: t1 + 1 }).reason, 'duplicate', 'Mesma mensagem não paga duas vezes');
    assert.equal(rewards.claim(disboard(4), { now: t1 + rewards.MIN_GAP_MS - 1 }).reason, 'cooldown');
    console.log('  ✅ 2. 100 moedinhas, sem duplicar e com cooldown de 110 min.');

    // 3. Feijão raro: ~5% e entra na mesma trava das moedas.
    assert.equal(rewards.BEAN_CHANCE, 0.05);
    const t2 = t1 + rewards.MIN_GAP_MS;
    const lucky = rewards.claim(disboard(5), { now: t2, rng: always });
    assert.equal(lucky.beans, 1);
    assert.equal(economy.getUserAccount(USER).magicBeans, before.magicBeans + 1);
    console.log('  ✅ 3. Feijão mágico raro creditado junto.');

    // 4. Teto diário da economia continua valendo e a mensagem conta a verdade.
    const fake = {
      dailyCoinCap: () => 500,
      grantReward: (_id, { beans }) => ({ coinsAdded: 30, beansAdded: beans, coins: 530, magicBeans: 0 }),
    };
    const store = { data: {}, read: (g, n) => store.data[`${g}/${n}`] || {}, write: (g, n, v) => (store.data[`${g}/${n}`] = JSON.parse(JSON.stringify(v))) };
    const partial = rewards.claim(disboard(6), { now: T0, rng: never, store, economy: fake });
    assert.equal(partial.coins, 30);
    assert.equal(partial.capped, true);
    const partialCard = flat(rewards.buildMessage(partial, 'pt').embeds[0]);
    assert.match(partialCard, /`30`/);
    assert.match(partialCard, /teto diário de `500`/);
    const zero = rewards.buildMessage({ ...partial, coins: 0 }, 'en').embeds[0];
    assert.match(flat(zero), /paid in gratitude/);
    assert.doesNotMatch(flat(zero), /\+`0`/);
    // Estado gravado antes do crédito: se a economia falhar, o bump não fica pagável de novo.
    const boom = { dailyCoinCap: () => 500, grantReward: () => { throw new Error('disco cheio'); } };
    const store2 = { data: {}, read: (g, n) => store2.data[`${g}/${n}`] || {}, write: (g, n, v) => (store2.data[`${g}/${n}`] = JSON.parse(JSON.stringify(v))) };
    assert.throws(() => rewards.claim(disboard(7), { now: T0, store: store2, economy: boom }));
    assert.equal(rewards.claim(disboard(7), { now: T0 + 1, store: store2, economy: fake }).reason, 'duplicate');
    console.log('  ✅ 4. Teto diário respeitado, aviso honesto e reserva antes de pagar.');

    // 5. Cartão: título com um emoji e até 8 palavras, sem ping, PT/EN, sem repetir a fala seguida.
    const pt = TRANSLATIONS.pt.bumpReward;
    const en = TRANSLATIONS.en.bumpReward;
    for (const group of ['title', 'line', 'bean']) {
      assert.deepEqual(Object.keys(pt[group]), Object.keys(en[group]), `bumpReward.${group} com par PT/EN`);
    }
    assert.ok(Object.keys(pt.line).length >= 12, 'Banco de falas grande o bastante para não cansar');
    for (const lang of [pt, en]) {
      for (const title of Object.values(lang.title)) {
        assert.ok(title.split(/\s+/).length - 1 <= 8, `Título curto: ${title}`);
        assert.equal((title.match(/\p{Extended_Pictographic}/gu) || []).length, 1, `Um emoji no título: ${title}`);
      }
      for (const line of Object.values(lang.line)) {
        assert.ok(line.includes('{user}'), 'Toda fala cita quem bumpou');
        assert.doesNotMatch(line, /^(Claro|Aqui está|Olá|Hello|Sure)\b|mero mortal|ora, ora|mwahaha/i);
      }
    }
    const card = rewards.buildMessage(lucky, 'pt', { coin: '🪙', bean: '🌱' });
    assert.deepEqual(card.allowedMentions, { parse: [], users: [], roles: [], repliedUser: false });
    const body = card.embeds[0].data.description;
    assert.match(body, new RegExp(`<@${USER}>`));
    assert.match(body, /### 🪙 \+`100` moedinhas/);
    assert.match(body, /### 🌱 \+`1` feijão mágico/);
    assert.match(body, /<t:\d+:R>/);
    assert.ok(body.includes('\n\n'));
    assert.ok(card.embeds[0].data.footer.text.length > 0);
    const enBody = rewards.buildMessage(first, 'en').embeds[0].data.description;
    assert.match(enBody, /\+`100` coins/);
    assert.doesNotMatch(enBody, /magic bean/);
    deck._reset();
    const seen = [];
    for (let i = 0; i < 6; i += 1) seen.push(rewards.buildMessage(first, 'pt').embeds[0].data.description.split('\n\n')[0]);
    for (let i = 1; i < seen.length; i += 1) assert.notEqual(seen[i], seen[i - 1], 'Fala não repete em seguida');
    console.log('  ✅ 5. Cartão bilíngue, sem ping, um emoji no título e falas sem repetir.');

    // 6. Módulo: paga, manda o cartão e não duplica o agradecimento do lembrete.
    const sent = [];
    const channel = { id: ids(2), send: async (p) => (sent.push(p), { id: ids(300) }) };
    await tools.onMessage({ ...disboard(8), channel });
    const saved = autoState.read(G, 'bumpRewards.json');
    assert.ok(saved.totals.bumps >= 3);
    assert.equal(sent.length, 1, 'Um cartão só (lembrete desligado não manda obrigado extra)');
    assert.ok(sent[0].embeds?.length === 1);
    assert.deepEqual(sent[0].allowedMentions.parse, []);
    const panel = rewards.insights(saved, Date.now());
    assert.equal(panel.coinsPerBump, 100);
    assert.ok(panel.top.find((u) => u.id === USER));
    assert.ok(panel.totals.coins >= 300);
    console.log('  ✅ 6. Módulo, cartão único e números do painel.');

    console.log('📣 Recompensa de bump: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na recompensa de bump:', err);
    process.exit(1);
  }
})();

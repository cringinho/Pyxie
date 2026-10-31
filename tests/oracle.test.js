const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🔮 Testes do Oráculo com IA (cota, cooldown, Premium e fallback)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-oracle-'));

const quota = require('../src/services/aiQuota');
const oracle = require('../src/services/oracle');
const plans = require('../src/services/guildPlans');
const command = require('../src/commands/oraculo');

const G = '1453890868980482090';
const U = '700000000000000021';
const day = (n) => Date.UTC(2026, 10, 2 + n, 13, 0, 0); // 10:00 BRT
const okChat = (text) => async () => ({ ok: true, data: { choices: [{ message: { content: text } }] } });

(async () => {
  // 1. Cota: servidor, pessoa, cooldown e reset do dia
  assert.equal(quota.check(G, U, { now: day(0) }).allowed, true);
  assert.equal(quota.consume(G, U, { now: day(0) }).recorded, true);
  const afterFirst = quota.check(G, U, { now: day(0) + 60 * 1000 });
  assert.equal(afterFirst.reason, 'cooldown', 'Cooldown por pessoa');
  assert.ok(afterFirst.retryMs > 0);
  assert.equal(quota.check(G, '700000000000000022', { now: day(0) }).allowed, true, 'Outra pessoa passa');
  assert.equal(quota.check(G, U, { now: day(0) + 21 * 60 * 1000 }).allowed, true, 'Libra depois do cooldown');
  const G2 = '1453890868980482091';
  const capTest = quota.check(G2, '700000000000000023', { now: day(0), cap: 1 });
  assert.equal(capTest.allowed, true);
  quota.consume(G2, '700000000000000023', { now: day(0), cap: 1 });
  assert.equal(quota.check(G2, '700000000000000024', { now: day(0), cap: 1 }).reason, 'guild_cap');
  assert.equal(quota.check(G, U, { now: day(1) }).allowed, true, 'Novo dia zera a cota');
  assert.equal(quota.snapshot(G, { now: day(1) }).used, 0);
  console.log('  ✅ 1. Cota diária, limite por pessoa, cooldown e virada do dia.');

  // 2. Só Premium usa (plano vencido não vale)
  assert.equal(command.canUse(G, day(0)).allowed, false);
  plans.grantPlan(G, 'basic', { months: 1, now: day(0) });
  assert.equal(command.canUse(G, day(0)).allowed, false, 'Básico não tem Oráculo');
  plans.grantPlan(G, 'premium', { months: 1, now: day(0) });
  assert.equal(command.canUse(G, day(0)).allowed, true);
  assert.equal(command.canUse(G, day(0) + 70 * 24 * 3600000).allowed, false, 'Plano vencido bloqueia');
  console.log('  ✅ 2. Oráculo restrito ao Premium ativo.');

  // 3. Resposta da IA entra sanitizada
  plans.grantPlan(G, 'premium', { months: 1, now: day(1) });
  const clean = await oracle.ask({ question: 'o que eu faço hoje?', chat: okChat('Vai com calma, @everyone! <@123> olha https://x.test') });
  assert.equal(clean.ok, true);
  assert.ok(!clean.answer.includes('@everyone'));
  assert.ok(!clean.answer.includes('<@123>'));
  assert.ok(!clean.answer.includes('http'));
  console.log('  ✅ 3. Resposta sem pings e sem links.');

  // 4. Falha da IA cai no fallback; crise nunca chama a IA
  let chamou = false;
  const failed = await oracle.ask({ question: 'e agora?', chat: async () => { chamou = true; return { ok: false, rateLimited: true }; } });
  assert.equal(failed.ok, false);
  assert.equal(failed.fallback, true);
  assert.ok(failed.line.length > 0);
  assert.equal(chamou, true);
  const crisis = await oracle.ask({ question: 'eu não aguento mais viver', chat: async () => { throw new Error('não deveria chamar'); } });
  assert.equal(crisis.crisis, true);
  console.log('  ✅ 4. Fallback gracioso e acolhimento em crise sem IA.');

  // 5. run(): plano + cota + resposta
  const first = await command.run({ guild: { id: G, name: 'Teste' }, userId: '700000000000000031', question: 'pergunta livre', source: { lang: 'pt' }, chat: okChat('Uma resposta curta.'), now: day(1) });
  assert.equal(first.ok, true);
  assert.equal(first.answer, 'Uma resposta curta.');
  assert.equal(first.remaining, quota.GUILD_DAILY_CAP - quota.snapshot(G, { now: day(1) }).used);
  const blocked = await command.run({ guild: { id: G, name: 'Teste' }, userId: '700000000000000031', question: 'de novo', source: { lang: 'pt' }, chat: okChat('x'), now: day(1) + 1000 });
  assert.equal(blocked.reason, 'cooldown');
  const free = await command.run({ guild: { id: '700000000000000099', name: 'Free' }, userId: U, question: 'oi', source: { lang: 'pt' }, chat: okChat('x'), now: day(1) });
  assert.equal(free.reason, 'premium');
  const dm = await command.run({ guild: null, userId: U, question: 'oi', source: { lang: 'pt' }, now: day(1) });
  assert.equal(dm.reason, 'guild_only');
  console.log('  ✅ 5. Fluxo completo (plano, cota, cooldown e DM).');

  console.log('🔮 Oráculo: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes do Oráculo:', err);
  process.exit(1);
});

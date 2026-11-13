const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🔑 Testes das chaves de acesso vitalício (chave única, vitalício, checklist e revogação)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-founder-'));

const founder = require('../src/services/founderProgram');
const plans = require('../src/services/guildPlans');
const addons = require('../src/services/guildAddons');

const DAY = 24 * 60 * 60 * 1000;
const G = '1453890868980482090';
const day = (n) => Date.UTC(2026, 10, 2 + n, 13, 0, 0);

(async () => {
  // 1. O dono gera quantas chaves quiser (teto só de segurança) e cada uma é única
  const keys = [];
  for (let i = 0; i < 25; i += 1) {
    const made = founder.createKey({ note: `amigo ${i + 1}`, now: day(0) });
    assert.equal(made.ok, true);
    keys.push(made.seat.code);
  }
  assert.equal(new Set(keys).size, 25, 'Uma chave por pessoa');
  assert.ok(founder.SEATS > 20, 'Sem o antigo limite de 20 vagas');
  assert.equal(founder.stats({ now: day(0) }).available, 25);
  console.log('  ✅ 1. Chaves únicas, sem o limite de 20 vagas.');

  // 2. Resgate libera acesso vitalício (plano + Estúdio de Loja), sem vencimento
  const redeemed = founder.redeem(keys[0], G, { now: day(0) });
  assert.equal(redeemed.ok, true);
  assert.equal(redeemed.lifetime, true);
  const active = plans.getPlan(G, day(1));
  assert.equal(active.plan, 'founder');
  assert.equal(active.active, true);
  assert.equal(active.lifetime, true);
  assert.equal(plans.getPlan(G, day(0) + 20 * 365 * DAY).active, true, 'Vinte anos depois continua ativo');
  assert.equal(addons.isActive(G, 'lojinha', day(0) + 20 * 365 * DAY), true, 'Estúdio de Loja vem junto');
  assert.equal(founder.redeem(keys[0], G, { now: day(1) }).reason, 'used');
  assert.equal(founder.redeem('FUND-XXXX-YYYY', G, { now: day(1) }).reason, 'invalid_code');
  assert.equal(founder.redeem(keys[1], '700000000000000099', { now: day(0) }).ok, true);
  assert.equal(founder.redeem(keys[1], '700000000000000098', { now: day(0) }).reason, 'used');
  console.log('  ✅ 2. Chave de uso único liga o servidor ao acesso vitalício.');

  // 3. Chave vence em 30 dias se não resgatada
  assert.equal(founder.redeem(keys[2], '700000000000000097', { now: day(29) }).ok, true, 'Dentro do prazo resgata');
  assert.equal(founder.redeem(keys[3], '700000000000000096', { now: day(31) }).reason, 'expired_key');
  console.log('  ✅ 3. Chave expira em 30 dias.');

  // 4. Checklist de acompanhamento salvo
  assert.equal(founder.checklist(G, { channel: true }).seat.checklist.channel, true);
  assert.equal(founder.checklist(G, { announcement: true }).seat.checklist.announcement, true);
  const seat = founder.list({ now: day(1) }).find((s) => s.guildId === G);
  assert.equal(seat.checklistDone, 2);
  assert.equal(seat.checklistTotal, 3);
  assert.equal(seat.lifetime, true);
  console.log('  ✅ 4. Checklist salvo na chave.');

  // 5. Vitalício nunca é pausado por inatividade
  const swept = founder.sweep({ now: day(400) });
  assert.deepEqual(swept.paused, [], 'Sem pausa por inatividade');
  assert.equal(plans.getPlan(G, day(400)).active, true);
  assert.equal(founder.list({ now: day(400) }).find((s) => s.guildId === G).status, 'active');
  console.log('  ✅ 5. Vitalício não pausa por inatividade.');

  // 6. Revogar corta o plano e o Estúdio de Loja
  const revoked = founder.revoke('700000000000000099', { reason: 'revoked', now: day(50) });
  assert.equal(revoked.ok, true);
  assert.equal(plans.getPlan('700000000000000099', day(50)).plan, 'free');
  assert.equal(addons.isActive('700000000000000099', 'lojinha', day(50)), false);
  assert.equal(founder.stats({ now: day(50) }).revoked, 1);
  console.log('  ✅ 6. Revogação devolve o servidor ao plano livre.');

  console.log('🔑 Chaves de acesso vitalício: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes das chaves:', err);
  process.exit(1);
});

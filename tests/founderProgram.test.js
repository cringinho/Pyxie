const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🏅 Testes do Programa Fundador (20 vagas, chave, checklist e inatividade)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-founder-'));

const founder = require('../src/services/founderProgram');
const plans = require('../src/services/guildPlans');

const DAY = 24 * 60 * 60 * 1000;
const G = '1453890868980482090';
const day = (n) => Date.UTC(2026, 10, 2 + n, 13, 0, 0);

(async () => {
  // 1. Limite duro de 20 vagas e chave única
  const keys = [];
  for (let i = 0; i < founder.SEATS; i += 1) {
    const made = founder.createKey({ note: `parceria ${i + 1}`, now: day(0) });
    assert.equal(made.ok, true);
    keys.push(made.seat.code);
  }
  assert.equal(new Set(keys).size, founder.SEATS, 'Uma chave por vaga');
  assert.equal(founder.createKey({ now: day(0) }).reason, 'full');
  assert.equal(founder.stats({ now: day(0) }).available, founder.SEATS);
  console.log('  ✅ 1. 20 vagas com chave única e limite respeitado.');

  // 2. Resgate libera o Básico por 12 meses
  const redeemed = founder.redeem(keys[0], G, { now: day(0) });
  assert.equal(redeemed.ok, true);
  assert.equal(redeemed.months, 12);
  const active = plans.getPlan(G, day(1));
  assert.equal(active.plan, 'founder');
  assert.equal(active.active, true);
  assert.ok(active.paidUntil >= day(0) + 359 * DAY, 'Quase um ano de validade');
  assert.equal(founder.redeem(keys[0], G, { now: day(1) }).reason, 'used');
  assert.equal(founder.redeem('FUND-XXXX-YYYY', G, { now: day(1) }).reason, 'invalid_code');
  assert.equal(founder.redeem(keys[1], '700000000000000099', { now: day(0) }).ok, true);
  assert.equal(founder.redeem(keys[1], '700000000000000098', { now: day(0) }).reason, 'used');
  console.log('  ✅ 2. Chave de uso único ligada ao servidor e Básico de 12 meses.');

  // 3. Chave vence em 7 dias se não resgatada
  assert.equal(founder.redeem(keys[2], '700000000000000097', { now: day(9) }).reason, 'expired_key');
  console.log('  ✅ 3. Chave expira em 7 dias.');

  // 4. Checklist da contrapartida
  assert.equal(founder.checklist(G, { channel: true }).seat.checklist.channel, true);
  const withAnnouncement = founder.checklist(G, { announcement: true });
  assert.equal(withAnnouncement.seat.checklist.announcement, true);
  const seat = founder.list({ now: day(1) }).find((s) => s.guildId === G);
  assert.equal(seat.checklistDone, 2);
  assert.equal(seat.checklistTotal, 3);
  console.log('  ✅ 4. Checklist de contrapartida salvo na vaga.');

  // 5. Inatividade: marca e depois pausa
  const quiet = () => ({ hasData: true, week: { messages: 0 } });
  const first = founder.sweep({ now: day(40), activity: quiet });
  assert.ok(first.flagged.includes(G), 'Semana parada marca a vaga');
  const second = founder.sweep({ now: day(48), activity: quiet });
  assert.ok(second.paused.includes(G), 'Após 7 dias, pausa');
  assert.equal(plans.getPlan(G, day(48)).active, false);
  assert.equal(founder.list({ now: day(48) }).find((s) => s.guildId === G).status, 'paused');
  // Com atividade, a marcação some
  founder.redeem(keys[3], '700000000000000096', { now: day(0) });
  founder.sweep({ now: day(40), activity: quiet });
  const busy = () => ({ hasData: true, week: { messages: 42 } });
  founder.sweep({ now: day(41), activity: busy });
  assert.equal(founder.list({ now: day(41) }).find((s) => s.guildId === '700000000000000096').inactiveSince, 0);
  console.log('  ✅ 5. Inatividade marca, pausa depois de 7 dias e limpa com atividade.');

  // 6. Revogar libera a vaga e corta o plano
  const revoked = founder.revoke('700000000000000099', { reason: 'revoked', now: day(50) });
  assert.equal(revoked.ok, true);
  assert.equal(plans.getPlan('700000000000000099', day(50)).plan, 'free');
  assert.equal(founder.stats({ now: day(50) }).revoked, 1);
  console.log('  ✅ 6. Revogação devolve o servidor ao Free.');

  console.log('🏅 Programa Fundador: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes do Programa Fundador:', err);
  process.exit(1);
});

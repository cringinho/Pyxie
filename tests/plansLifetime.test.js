// Plano vitalício: Mary, Cringelândia e o servidor do dono nunca expiram,
// e revogar volta para free limpando a flag.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('👑 Testes do plano vitalício (lifetime)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-lifetime-'));

const plans = require('../src/services/guildPlans');
const perks = require('../src/services/guildPerks');

const MARY = '1557399041443111025';
const CRINGE = '1453890868980482090';
const DAY = 24 * 60 * 60 * 1000;

// 1. Concessão vitalícia
const granted = plans.grantPlan(MARY, 'premium', { lifetime: true, source: 'lifetime', note: 'Mary' });
assert.equal(granted.ok, true, 'concessão deve funcionar');
assert.equal(granted.record.lifetime, true);
assert.equal(granted.record.paidUntil, 0, 'vitalício não usa paidUntil');
const nowPlan = plans.getPlan(MARY);
assert.equal(nowPlan.active, true);
assert.equal(nowPlan.expired, false);
console.log('  ✅ 1. Premium vitalício concedido e ativo.');

// 2. Não expira nem 10 anos depois
const far = Date.now() + 10 * 365 * DAY;
const future = plans.getPlan(MARY, far);
assert.equal(future.active, true, 'vitalício nunca expira');
assert.equal(future.expired, false);
console.log('  ✅ 2. Vitalício continua ativo 10 anos depois.');

// 3. Plano mensal comum continua expirando
plans.grantPlan(CRINGE, 'basic', { months: 1, source: 'manual' });
const basicLater = plans.getPlan(CRINGE, Date.now() + 40 * DAY);
assert.equal(basicLater.lifetime, false);
assert.equal(basicLater.active, false, 'mensal sem vitalício expira');
assert.equal(basicLater.expired, true);
console.log('  ✅ 3. Plano mensal normal expira em 30 dias (vitalício não vazou).');

// 4. Patch parcial preserva a flag
plans.setPlan(MARY, { note: 'ajuste de nota' });
const patched = plans.getPlan(MARY);
assert.equal(patched.lifetime, true, 'patch parcial não pode zerar o vitalício');
assert.equal(patched.note, 'ajuste de nota');
console.log('  ✅ 4. Atualização parcial preserva o vitalício.');

// 5. Benefícios seguem o plano (sem multiplicador; só o bônus fixo)
const perk = perks.forGuild(MARY);
assert.equal(perk.plan, 'premium');
assert.equal(perk.active, true);
assert.equal(perk.dailyBonus, 120);
console.log('  ✅ 5. Benefícios do Premium aplicados (bônus fixo 120, sem multiplicador).');

// 6. Revogar limpa a flag e volta para free
plans.revokePlan(MARY, 'canceled');
const revoked = plans.getPlan(MARY);
assert.equal(revoked.plan, 'free');
assert.equal(revoked.lifetime, false);
assert.equal(revoked.active, false);
console.log('  ✅ 6. Revogação volta para free e limpa o vitalício.');

console.log('👑 Plano vitalício: tudo certo.');

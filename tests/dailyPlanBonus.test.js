const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🪙 Testes do teto diário de moedinhas e do bônus de plano no /py-daily...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-econ-'));

const economy = require('../src/services/economy');
const plans = require('../src/services/guildPlans');
const perks = require('../src/services/guildPerks');

const G = '1453890868980482090';
const U = '700000000000000001';
const DAY = 24 * 60 * 60 * 1000;
const day = (n) => Date.UTC(2026, 10, 2 + n, 13, 0, 0); // 10:00 em Brasília

// 1. Teto diário alto, reset por dia (BRT) e transferência fora do teto
assert.equal(economy.DAILY_COIN_CAP_DEFAULT, 50000);
assert.equal(economy.dailyCoinCap(), 50000);
assert.equal(economy.getDailyCoinStatus(U, day(0)).remaining, 50000);
economy.setUserBalance(U, 0);
economy.addCoins(U, 49000, { now: day(0) });
assert.equal(economy.getBalance(U), 49000);
economy.addCoins(U, 5000, { now: day(0) });
assert.equal(economy.getBalance(U), 50000, 'O excedente do teto não entra');
assert.equal(economy.getDailyCoinStatus(U, day(0)).remaining, 0);
economy.addCoins(U, 1000, { bypassCap: true, now: day(0) });
assert.equal(economy.getBalance(U), 51000, 'Transferência do mercado não consome o teto');
assert.equal(economy.getDailyCoinStatus(U, day(1)).remaining, 50000, 'Novo dia zera o contador');
economy.addCoins(U, 10, { now: day(1) });
assert.equal(economy.getBalance(U), 51010);
console.log('  ✅ 1. Teto de 50 mil/dia, reset em Brasília e transferências fora do teto.');

// 2. Planos com validade (free por padrão; expira sozinho)
assert.equal(plans.getPlan(G, day(0)).plan, 'free');
assert.equal(plans.getPlan(G, day(0)).active, false);
assert.equal(perks.forGuild(G, day(0)).dailyBonus, 0);
assert.equal(plans.grantPlan(G, 'basic', { months: 1, source: 'test', now: day(0) }).ok, true);
const basic = plans.getPlan(G, day(0) + DAY);
assert.equal(basic.plan, 'basic');
assert.equal(basic.active, true);
assert.equal(perks.forGuild(G, day(0) + DAY).dailyBonus, 50);
assert.equal(perks.forGuild(G, day(0) + 31 * DAY).dailyBonus, 0, 'Plano vencido não dá bônus');
assert.equal(plans.getPlan(G, day(0) + 31 * DAY).expired, true);
plans.grantPlan(G, 'premium', { months: 2, now: day(0) });
assert.equal(perks.forGuild(G, day(0)).dailyBonus, 120);
assert.equal(plans.revokePlan(G, 'canceled', day(0)).ok, true);
assert.equal(perks.forGuild(G, day(0)).dailyBonus, 0);
console.log('  ✅ 2. Plano com validade, expiração automática e bônus por plano.');

// 3. /py-daily: cooldown continua 24 h e o bônus do servidor entra no total
plans.grantPlan(G, 'premium', { months: 1, now: day(2) });
const daily = economy.claimDaily(U, day(2), { guildId: G });
assert.equal(daily.claimed, true);
assert.equal(daily.planBonus, 120);
assert.equal(daily.plan, 'premium');
assert.equal(daily.remainingMs, economy.DAILY_COOLDOWN_MS, 'Cooldown do diário não muda');
assert.equal(daily.totalAmount, Math.min(daily.amount + daily.streakBonus + daily.planBonus, daily.cap));
const again = economy.claimDaily(U, day(2) + 60 * 60 * 1000, { guildId: G });
assert.equal(again.claimed, false, 'Continua uma vez a cada 24 h');
const freeUser = economy.claimDaily('700000000000000002', day(3), { guildId: '700000000000000009' });
assert.equal(freeUser.planBonus, 0, 'Servidor sem plano não paga bônus');
console.log('  ✅ 3. Daily com bônus do plano e cooldown intacto.');

console.log('🪙 Teto diário e bônus de plano: tudo certo.');

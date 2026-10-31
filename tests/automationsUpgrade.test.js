// Automações v2: bugs corrigidos + campos/funções novos (meta, falhas, carência, teto diário).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('⚙️  Testes das automações (correções e campos novos)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-autov2-'));

const auto = require('../src/services/automations');
const stats = require('../src/services/automationStats');
const addons = require('../src/services/guildAddons');
const periodic = require('../src/services/periodicMessages');
const presence = require('../src/services/presenceRotator');

const G = '123456789012345678';
const G2 = '223456789012345678';
const G3 = '323456789012345678';
const DAY = 24 * 60 * 60 * 1000;

// 1. Campo `number` sem min/max não vira NaN
auto.register('testeNumero', { fields: [{ key: 'n', type: 'number', default: 1 }] });
const numbered = auto.normalize('testeNumero', { n: 5 });
assert.equal(numbered.n, 5);
assert.ok(Number.isFinite(auto.normalize('testeNumero', { n: 'abc' }).n));
console.log('  ✅ 1. Campo numérico nunca mais vira NaN.');

// 2. Histórico: quem mudou, quando e o que mudou
auto.register('testeTexto', { fields: [{ key: 'msg', type: 'text', maxLength: 50 }] });
auto.saveConfig(G, 'testeTexto', { enabled: true, msg: 'oi' });
const meta = auto.getMeta(G, 'testeTexto');
assert.ok(meta.updatedAt > 0);
assert.equal(meta.updatedBy, 'panel');
assert.deepEqual(meta.changed.sort(), ['enabled', 'msg']);
const log = auto.auditLog(G);
assert.equal(log.length, 1);
assert.equal(log[0].key, 'testeTexto');
console.log('  ✅ 2. Mudança de automação fica registrada (updatedAt/updatedBy).');

// 3. diffConfig só lista o que mudou
assert.deepEqual(auto.diffConfig('testeTexto', { enabled: true, msg: 'oi' }, { enabled: true, msg: 'tchau' }), ['msg']);
console.log('  ✅ 3. diffConfig aponta só o campo alterado.');

// 4. Estatísticas: answered/delivered entram no total e falha é registrada
stats.bump(G, 'testeTexto', 'answered', 2);
stats.bump(G, 'testeTexto', 'delivered', 3);
stats.recordFailure(G, 'testeTexto', new Error('canal sumiu'));
stats.flush();
const perKey = stats.perKey(G);
assert.equal(perKey.testeTexto.answered, 2);
assert.equal(perKey.testeTexto.delivered, 3);
assert.equal(perKey.testeTexto.failed, 1);
assert.equal(perKey.testeTexto.lastError, 'canal sumiu');
const summary = stats.summary(G);
const item = summary.items.find((i) => i.key === 'testeTexto');
assert.equal(item.hits, 5);
assert.equal(item.failed, 1);

// 5. Extra: prazo e contador de renovação
const start = Date.UTC(2026, 0, 1, 12);
const granted = addons.grant(G2, 'lojinha', { months: 1, source: 'teste', graceDays: 7, now: start });
assert.equal(granted.ok, true);
assert.equal(granted.record.renewals, 1);
assert.equal(granted.record.graceDays, 7);
assert.equal(addons.daysLeft(G2, 'lojinha', start), 30);
console.log('  ✅ 5. Extra guarda prazo, carência e contagem de renovação.');

// 6. Carência: passou do vencimento mas o módulo segue de pé
const inGrace = addons.status(G2, 'lojinha', start + 31 * DAY);
assert.equal(inGrace.expired, false);
assert.equal(inGrace.inGrace, true);
assert.equal(inGrace.active, true);
console.log('  ✅ 6. Carência de 7 dias mantém o extra ativo.');

// 7. Depois da carência expira de verdade e o arquivo é atualizado
const past = start + 38 * DAY;
const expired = addons.status(G2, 'lojinha', past);
assert.equal(expired.expired, true);
assert.equal(expired.active, false);
const swept = addons.sweep(past);
assert.equal(swept.length, 1);
assert.equal(addons.status(G2, 'lojinha', past).status, 'expired');
console.log('  ✅ 7. Varredura grava o vencimento (antes só calculava na leitura).');

// 8. Renovar depois de vencer recomeça do agora e soma a renovação
const renewed = addons.grant(G2, 'lojinha', { months: 1, source: 'teste', now: past });
assert.equal(renewed.record.renewals, 2);
assert.ok(renewed.record.until > past);
const revoked = addons.revoke(G2, 'lojinha', 'pedido do dono', past);
assert.equal(revoked.ok, true);
const after = addons.status(G2, 'lojinha', past);
assert.equal(after.status, 'canceled');
assert.equal(after.revokedAt, past);
assert.equal(after.renewals, 2);
assert.equal(after.since, start);
console.log('  ✅ 8. Revogar preserva o histórico (since/renovações).');

// 9. Guia de bump: teto diário e horário de silêncio
const noon = Date.UTC(2026, 0, 1, 15); // 12h de Brasília
periodic.saveConfig(G3, { bumpGuide: { enabled: true, channelId: G, maxPerDay: 2 } });
assert.equal(periodic.canSendNow(G3, noon).ok, true);
periodic.noteSent(G3, noon);
periodic.noteSent(G3, noon);
assert.equal(periodic.canSendNow(G3, noon).reason, 'daily_cap');
periodic.saveConfig(G3, { bumpGuide: { maxPerDay: 0, quietFrom: 20, quietTo: 6 } });
const night = Date.UTC(2026, 0, 2, 2); // 23h de Brasília
assert.equal(periodic.brtHour(night), 23);
assert.equal(periodic.canSendNow(G3, night).reason, 'quiet_hours');
console.log('  ✅ 9. Teto diário e horário de silêncio funcionam.');

// 10. Presença rotativa: trocar a lista e pausar
const set = presence.setActivities([{ name: 'Loja de Robux aberta' }]);
assert.equal(set.ok, true);
assert.equal(presence.currentActivities()[0].name, 'Loja de Robux aberta');
presence.pauseFor(60000);
assert.equal(presence.isPaused(), true);
presence.pauseFor(0);
assert.equal(presence.isPaused(), false);
assert.equal(presence.setActivities([]).reason, 'empty');
console.log('  ✅ 10. Presença aceita lista nova e pausa.');

console.log('⚙️  Automações v2: tudo certo.');

console.log('  ✅ 4. Contadores e falhas aparecem no painel.');

// Avisos de renovação do extra: D-7, D-3, D-0 e expirado, sem repetir.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('⏳ Testes dos avisos de renovação do extra...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-addonnotice-'));

const plansModule = require('../src/modules/plans');
const notices = require('../src/services/planNotices');
const { TRANSLATIONS } = require('../src/utils/i18n');

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const G = '123456789012345678';

// 1. Cinco dias para vencer -> aviso D-7
const due7 = plansModule.addonNoticesDue({ now, list: [{ addonId: 'lojinha', guildId: G, active: true, until: now + 5 * DAY }] });
assert.equal(due7.length, 1);
assert.equal(due7[0].kind, 'addon_reminder');
assert.equal(due7[0].step, '7');
console.log('  ✅ 1. Extra vencendo em 5 dias gera aviso D-7.');

// 2. Dois dias -> D-3
const due3 = plansModule.addonNoticesDue({ now, list: [{ addonId: 'lojinha', guildId: G, active: true, until: now + 2 * DAY }] });
assert.equal(due3[0].step, '3');
console.log('  ✅ 2. Extra vencendo em 2 dias gera aviso D-3.');

// 3. Vencido -> extra pausado
const due0 = plansModule.addonNoticesDue({ now, list: [{ addonId: 'lojinha', guildId: G, expired: true, active: false, until: now - DAY }] });
assert.equal(due0[0].kind, 'addon_expired');
assert.equal(due0[0].step, '0');
console.log('  ✅ 3. Extra vencido gera aviso de pausa.');

// 4. Vitalício e inativo não geram aviso
const none = plansModule.addonNoticesDue({
  now,
  list: [
    { addonId: 'lojinha', guildId: G, active: true, lifetime: true, until: 0 },
    { addonId: 'lojinha', guildId: G, active: false, expired: false, until: now + DAY },
    { addonId: 'lojinha', guildId: G, active: true, until: now + 30 * DAY },
  ],
});
assert.equal(none.length, 0);
console.log('  ✅ 4. Vitalício, inativo e longe do vencimento não avisam.');

// 5. Fila + marcação por marco (não repete)
assert.equal(notices.push({ guildId: G, kind: 'addon_reminder', addonId: 'lojinha', step: '7', days: 5 }), true);
assert.equal(notices.hasCustomMark(G, 'addon:lojinha:7'), false);
notices.markCustom(G, 'addon:lojinha:7');
assert.equal(notices.hasCustomMark(G, 'addon:lojinha:7'), true);
const queue = notices.takeAll();
assert.equal(queue.length, 1);
assert.equal(queue[0].addonId, 'lojinha');
console.log('  ✅ 5. Aviso entra na fila e a marcação evita repetir.');

// 6. Paridade bilíngue dos textos novos
for (const key of ['addonReminderTitle', 'addonReminderBody', 'addonExpiredTitle', 'addonExpiredBody']) {
  assert.ok(TRANSLATIONS.pt.plans.dm[key], `pt precisa de plans.dm.${key}`);
  assert.ok(TRANSLATIONS.en.plans.dm[key], `en precisa de plans.dm.${key}`);
}
console.log('  ✅ 6. Textos de aviso existem em PT e EN.');

console.log('⏳ Avisos de renovação: tudo certo.');

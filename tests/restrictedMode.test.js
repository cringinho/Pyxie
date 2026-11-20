// Modo restrito (PYXIE_RESTRICTED_MODE): com dados provisórios, o que grava progresso de pessoas fica
// pausado com aviso; moderação, boas-vindas, registros e cores continuam.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const rm = require('../src/services/restrictedMode');
const { t } = require('../src/utils/i18n');

console.log('🛠️ [TEST] Modo restrito...');

const ON = { PYXIE_RESTRICTED_MODE: '1' };
const OFF = {};

// 1. Liga só com a variável.
assert.equal(rm.isActive(OFF), false, 'desligado sem a variável');
assert.equal(rm.isActive({ PYXIE_RESTRICTED_MODE: '0' }), false, '0 = desligado');
['1', 'true', 'on', 'sim'].forEach((v) => assert.equal(rm.isActive({ PYXIE_RESTRICTED_MODE: v }), true, `${v} liga`));
console.log('  ✅ 1. Ativação pela variável de ambiente.');

// 2. O que grava progresso é bloqueado (com e sem py-, aliases PT e EN).
['py-daily', 'diario', 'py-quiz', 'tarot', 'py-tarot', 'py-profile', 'perfil', 'casamento', 'py-wallet',
  'py-dungeon', 'catacumbas', 'py-pass', 'py-market', 'py-sorteio', 'py-museum'].forEach((name) => {
  assert.equal(rm.shouldBlockCommand(name, undefined, ON), true, `${name} bloqueado`);
  assert.equal(rm.shouldBlockCommand(name, undefined, OFF), false, `${name} livre fora do modo restrito`);
});
console.log('  ✅ 2. Economia, tarot, social e afins pausados.');

// 3. Moderação, boas-vindas, registros, cores e brincadeiras sem gravação continuam.
['py-help', 'py-setup', 'py-welcome', 'py-warn', 'py-case', 'py-ping', 'py-status', 'py-language',
  'py-ship', 'py-dice', 'py-tictactoe', 'py-minesweeper', 'py-jokenpo'].forEach((name) => {
  assert.equal(rm.shouldBlockCommand(name, undefined, ON), false, `${name} liberado`);
});
assert.equal(rm.shouldBlockCommand('py-cores', 'utilidades', ON), false, 'categoria utilidades liberada');
assert.equal(rm.shouldBlockCommand('qualquer', 'economia', ON), true, 'categoria declarada no comando vale');
console.log('  ✅ 3. Moderação, boas-vindas, cores e jogos sem gravação seguem.');

// 4. Módulos que gravam progresso não sobem; os demais sobem.
assert.equal(rm.shouldSkipModule({ id: 'dungeon', category: 'economia' }, ON), true);
assert.equal(rm.shouldSkipModule({ id: 'marriage', category: 'social' }, ON), true);
assert.equal(rm.shouldSkipModule({ id: 'hyperfokus', category: 'community' }, ON), true);
assert.equal(rm.shouldSkipModule({ id: 'giveaways' }, ON), true);
assert.equal(rm.shouldSkipModule({ id: 'moderation' }, ON), false);
assert.equal(rm.shouldSkipModule({ id: 'tickets', category: 'moderation' }, ON), false);
assert.equal(rm.shouldSkipModule({ id: 'dungeon', category: 'economia' }, OFF), false);
// Todo módulo real tem decisão coerente (nenhum quebra a função).
const modulesDir = path.join(__dirname, '..', 'src', 'modules');
for (const dir of fs.readdirSync(modulesDir)) {
  const idx = path.join(modulesDir, dir, 'index.js');
  if (!fs.existsSync(idx)) continue;
  const mod = require(idx);
  if (!mod?.id) continue;
  assert.equal(typeof rm.shouldSkipModule(mod, ON), 'boolean', `${mod.id}: decisão booleana`);
}
// Comandos de módulo pausado sem entrada no mapa de categorias (ex.: Hyperfokus) também recebem o aviso.
rm.registerSkippedModule({ id: 'hyperfokus', commands: [{ name: 'py-add' }, { data: { name: 'py-concluir' } }] });
assert.equal(rm.shouldBlockCommand('py-concluir', undefined, ON), true, 'comando de módulo pausado bloqueado');
assert.equal(rm.shouldBlockCommand('add', undefined, ON), true, 'vale sem o py- também');
assert.equal(rm.shouldBlockCommand('py-mary', undefined, ON), false, 'loja da Mary segue funcionando');
console.log('  ✅ 4. Módulos de progresso pausados; os demais sobem.');

// 5. Aviso bilíngue, sem menções.
const pt = t('restricted.notice', 'pt');
const en = t('restricted.notice', 'en');
assert.ok(pt !== 'restricted.notice' && /instabilidade/i.test(pt), 'aviso em PT');
assert.ok(en !== 'restricted.notice' && /instability/i.test(en), 'aviso em EN');
assert.deepEqual(rm.notice('pt').allowedMentions, { parse: [] }, 'aviso sem pings');
console.log('  ✅ 5. Aviso bilíngue e sem menções.');

console.log('✅ Modo restrito: OK');

// E1b: os handlers do Estúdio de Loja só agem no servidor da Mary ou em quem tem o extra.
// Sem isso, o listener de mensagens lia a config da Mary em QUALQUER servidor (o anti-link
// chegava a apagar convites fora da Mary).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛡️ Testes do gate do Estúdio de Loja (handlers)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-storegate-'));

const { MARY_GUILD_ID } = require('../src/config/scopes');
const addons = require('../src/services/guildAddons');
const { canUseStore } = require('../src/modules/mary-studio/storeAccess');
const buttonHandler = require('../src/modules/mary-studio/handlers/buttonActionHandler');
const stickyHandler = require('../src/modules/mary-studio/handlers/stickyAndFaqHandler');

const CLIENT = '123456789012345678';

// 1. Mary sempre pode
assert.equal(canUseStore(MARY_GUILD_ID), true);
assert.equal(buttonHandler.isMaryGuild(MARY_GUILD_ID), true);
console.log('  ✅ 1. Servidor da Mary continua liberado.');

// 2. Servidor sem extra não pode
assert.equal(canUseStore(CLIENT), false);
assert.equal(buttonHandler.isMaryGuild(CLIENT), false);
assert.equal(buttonHandler.isMaryGuild(null), false);
console.log('  ✅ 2. Servidor sem o extra (ou sem guild) é recusado.');

// 3. Com o extra ativo, pode
addons.grant(CLIENT, 'lojinha', { months: 1, source: 'test' });
assert.equal(canUseStore(CLIENT), true);
assert.equal(buttonHandler.isMaryGuild(CLIENT), true);
console.log('  ✅ 3. Servidor com o extra ativo passa no gate.');

// 4. Extra vencido volta a recusar
addons.revoke(CLIENT, 'lojinha', 'canceled');
assert.equal(canUseStore(CLIENT), false);
console.log('  ✅ 4. Extra revogado volta a ser recusado.');

// 5. Sticky: mensagem de servidor sem acesso não toca em configuração nenhuma
let loads = 0;
stickyHandler.manager = {
  loadConfig: () => {
    loads += 1;
    return {};
  },
  loadStoreData: () => {
    loads += 1;
    return {};
  },
};
const fakeMessage = {
  author: { bot: false, id: '111111111111111111' },
  guild: { id: CLIENT },
  channel: { id: '222222222222222222', send: async () => null },
  content: 'discord.gg/qualquer-coisa',
  member: { permissions: { has: () => false } },
};
(async () => {
  await stickyHandler.handleMessage(fakeMessage);
  assert.equal(loads, 0, 'handler de sticky não pode ler config de servidor sem acesso');
  console.log('  ✅ 5. Sticky não lê configuração em servidor sem o extra (anti-link não vaza).');

  // 6. Com o extra, ele volta a ler
  addons.grant(CLIENT, 'lojinha', { months: 1, source: 'test' });
  await stickyHandler.handleMessage(fakeMessage);
  assert.ok(loads > 0, 'com o extra, o handler deve ler a config do servidor');
  console.log('  ✅ 6. Com o extra ativo, o sticky volta a funcionar.');

  console.log('🛡️ Gate do Estúdio de Loja: tudo certo.');
})();

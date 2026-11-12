const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🎃 Testes: reinício da VM não reencerra o evento sazonal nem repete o anúncio...');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-seasonal-'));
process.env.SEASONAL_CONFIG_PATH = path.join(dir, 'config.json');
process.env.SEASONAL_DATA_PATH = path.join(dir, 'data.json');
process.env.PYXIE_DATA_DIR = dir;

const manager = require('../src/modules/seasonal/seasonalManager');
const seasonalModule = require('../src/modules/seasonal');

const sent = [];
const channel = { isTextBased: () => true, send: async (p) => (sent.push(p), {}) };
const makeClient = () => ({
  channels: { fetch: async () => channel },
  guilds: { cache: new Map() },
  users: { fetch: async () => null },
  on() {},
  off() {},
  removeListener() {},
});
const boot = async () => {
  await seasonalModule.onLoad({ client: makeClient(), app: null, sendIpc: null });
  await new Promise((r) => setTimeout(r, 150));
  await seasonalModule.onUnload({});
};
const past = new Date(Date.now() - 10 * 86400000).toISOString();

(async () => {
  try {
    // 1. Evento já encerrado (active: false, prazo vencido): reiniciar não religa nem anuncia.
    manager.saveConfig({ ...manager.DEFAULT_CONFIG, active: false, dates: { ...manager.DEFAULT_CONFIG.dates, endDate: past }, channels: { ...manager.DEFAULT_CONFIG.channels, announcementsChannelId: '123456789012345678' } });
    for (let i = 0; i < 3; i += 1) await boot();
    assert.equal(manager.isSeasonalActive(), false, 'Reinício não pode religar o evento');
    assert.equal(sent.length, 0, 'Reinício não pode anunciar encerramento');
    console.log('  ✅ 1. Evento encerrado continua desligado e mudo a cada reinício.');

    // 2. Evento ativo com prazo vencido (VM ficou fora do ar): encerra UMA vez e os reinícios seguintes ficam mudos.
    manager.saveConfig({ active: true });
    await boot();
    assert.equal(manager.isSeasonalActive(), false, 'Prazo vencido encerra o evento');
    assert.equal(sent.length, 1, 'Anúncio de encerramento sai uma única vez');
    for (let i = 0; i < 3; i += 1) await boot();
    assert.equal(sent.length, 1, 'Reinícios seguintes não repetem o anúncio');
    console.log('  ✅ 2. Encerramento tardio anuncia uma vez só.');

    // 3. Mesmo religado por engano com o mesmo prazo, não repete o anúncio.
    manager.saveConfig({ active: true });
    assert.equal(await manager.checkEndEvent(makeClient()), false);
    assert.equal(manager.isSeasonalActive(), false);
    assert.equal(sent.length, 1, 'Mesmo prazo nunca anuncia duas vezes');
    console.log('  ✅ 3. Mesmo prazo não anuncia de novo.');

    // 4. Evento novo (prazo futuro) continua ligando no boot.
    manager.saveConfig({ active: true, dates: { ...manager.DEFAULT_CONFIG.dates, endDate: new Date(Date.now() + 30 * 86400000).toISOString() } });
    await seasonalModule.onLoad({ client: makeClient(), app: null, sendIpc: null });
    assert.equal(manager.isSeasonalActive(), true, 'Evento com prazo futuro segue ativo');
    await seasonalModule.onUnload({});
    console.log('  ✅ 4. Evento novo segue funcionando.');

    manager.stop(false);
    console.log('🎃 Reinício do evento sazonal: tudo certo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha no teste de reinício sazonal:', err);
    process.exit(1);
  }
})();

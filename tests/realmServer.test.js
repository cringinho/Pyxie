const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Estado isolado: as rotas são gravadas no guildFeatures.json do diretório temporário
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-realm-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const BP = require('../src/modules/realm/realmBlueprint');
const realm = require('../src/modules/realm');
const guildFeatures = require('../src/services/guildFeatures');
const setup = require('../src/commands/setup');
const { commands } = require('../src/commands');
const moduleManager = require('../src/services/moduleManager');

console.log("🧪 [TEST] Pyxie's Realm: blueprint, rotas de comandos e leis...");

try {
  // 1. Blueprint dentro dos limites do Discord e sem referências quebradas
  const channels = BP.CATEGORIES.flatMap((c) => c.channels);
  const keys = new Set(channels.map((c) => c.key));
  const roleKeys = new Set(BP.ROLES.map((r) => r.key));
  assert.equal(keys.size, channels.length, 'chaves de canal únicas');
  for (const c of channels) {
    assert.ok(c.name.length <= 100, `nome curto: ${c.name}`);
    assert.ok(!c.topic || c.topic.length <= 1024, `tópico curto: ${c.name}`);
    for (const tag of c.tags || []) assert.ok(tag.name.length <= 20, `tag curta: ${tag.name}`);
  }
  assert.ok(BP.ONBOARDING.prompts.length <= 4, 'até 4 perguntas no onboarding');
  assert.ok(BP.ONBOARDING.defaultChannels.length >= 7, 'onboarding com 7+ canais padrão');
  for (const key of BP.ONBOARDING.defaultChannels) assert.ok(keys.has(key), `canal padrão existe: ${key}`);
  for (const prompt of BP.ONBOARDING.prompts) {
    for (const opt of prompt.options) {
      assert.ok(opt.title.length <= 50, `opção curta: ${opt.title}`);
      for (const key of opt.channels || []) assert.ok(keys.has(key), `canal da opção existe: ${key}`);
      for (const key of opt.roles || []) assert.ok(roleKeys.has(key), `cargo da opção existe: ${key}`);
    }
  }
  for (const rule of BP.AUTOMOD) for (const key of rule.exemptChannels || []) assert.ok(keys.has(key), `canal isento existe: ${key}`);
  assert.ok(!BP.ROLES.some((r) => /orientation|sexual|\bage\b|\+18|-18/i.test(r.name)), 'sem cargos de dados sensíveis');
  console.log('  ✅ 1. Blueprint dentro dos limites do Discord e sem referências quebradas.');

  // 2. Toda rota aponta para um comando que existe
  const names = new Set(commands.map((c) => c.data?.name).filter(Boolean));
  for (const mod of moduleManager.discoverModules().values()) for (const c of mod.commands || []) names.add(c.data?.name);
  const routed = channels.flatMap((c) => c.commands || []);
  for (const name of routed) assert.ok(names.has(name), `comando roteado existe: ${name}`);
  assert.equal(new Set(routed).size, routed.length, 'cada comando mora em um canal só');
  console.log('  ✅ 2. Rotas apontam para comandos reais.');

  // 3. Rotas aplicadas: canal certo e threads passam; outro canal recebe o caminho em privado
  let n = 0;
  const fake = channels.map((c) => ({ id: String(9000000 + ++n), name: c.name, key: c.key }));
  const client = { guilds: { cache: { get: (id) => (id === BP.GUILD_ID ? { channels: { cache: { find: (fn) => fake.find(fn) } } } : null) } } };
  const routes = realm.applyCommandRoutes(client);
  assert.equal(Object.keys(routes).length, routed.length);
  const idOf = (key) => fake.find((c) => c.key === key).id;
  const check = (name, channel, guildId = BP.GUILD_ID) => guildFeatures.checkCommandAccess({ guildId, channel, command: { data: { name } } });
  assert.equal(check('py-dungeon', { id: idOf('catacombs') }).allowed, true);
  assert.equal(check('py-dungeon', { id: '1', parentId: idOf('catacombs') }).allowed, true, 'thread do canal certo');
  const denied = check('py-quiz', { id: idOf('plaza') });
  assert.equal(denied.reason, 'route');
  const reply = setup.handleAccessDenied(denied, { locale: 'pt-BR', guildId: BP.GUILD_ID }, null);
  assert.ok(reply.content.includes(`<#${idOf('arcade')}>`), 'resposta aponta o canal do comando');
  assert.equal(check('py-help', { id: idOf('plaza') }).allowed, true, 'comandos sem rota continuam livres');
  assert.equal(check('py-quiz', { id: '1' }, '123').allowed, true, 'outros servidores não são afetados');
  console.log('  ✅ 3. Rotas aplicadas: canal certo passa, fora dele a Pyxie aponta o caminho.');

  // 4. Leis em EN com botões; PT e ES sem botões
  const en = realm.buildLawsMessage('en');
  assert.equal(en.embeds.length, 3);
  assert.deepEqual(en.components[0].components.map((b) => b.custom_id), ['realm:laws:pt', 'realm:laws:es']);
  for (const lang of ['pt', 'es']) {
    const msg = realm.buildLawsMessage(lang);
    assert.ok(!msg.components && msg.embeds.every((e) => e.description.length <= 4096));
  }
  console.log('  ✅ 4. Leis em três idiomas.');

  console.log("🎉 [TEST] Pyxie's Realm validado!");
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.exit(0);
} catch (error) {
  console.error("❌ [TEST] Falha no Pyxie's Realm:", error);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.exit(1);
}

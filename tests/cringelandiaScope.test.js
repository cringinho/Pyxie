const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🏰 Testes do escopo da Cringelândia (plano D5)...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-scope-'));

const { CRINGELANDIA_GUILD_ID, MARY_GUILD_ID } = require('../src/config/scopes');
const { getHelpModules } = require('../src/commands/commandHelpers');
const battlePass = require('../src/services/battlePass');

try {
  // 1. Módulos exclusivos declaram o escopo da Cringelândia
  for (const id of ['dungeon', 'guildBoss', 'festival', 'home', 'market', 'battlePass']) {
    const mod = require(`../src/modules/${id}`);
    assert.deepEqual(mod.guildScope, [CRINGELANDIA_GUILD_ID], `${id} é exclusivo da Cringelândia`);
  }
  for (const dir of ['realm', 'roleplay']) {
    assert.ok(!fs.existsSync(path.join(__dirname, '..', 'src', 'modules', dir)), `Módulo ${dir} removido`);
  }
  console.log('  ✅ 1. Módulos exclusivos com guildScope; Realm e roleplay removidos.');

  // 2. Comandos da Mary só no servidor dela
  for (const f of ['pyMaryStudio', 'pyGamepass', 'pyMaryEditContext']) {
    assert.deepEqual(require(`../src/modules/mary-studio/commands/${f}`).guildScope, [MARY_GUILD_ID]);
  }
  console.log('  ✅ 2. Comandos da Mary presos ao servidor da Mary.');

  // 3. Ajuda: Cringelândia marcada, Mary escondida
  const fake = [
    { name: 'py-daily', data: { name: 'py-daily', description: 'Daily' } },
    { name: 'py-dungeon', guildScope: [CRINGELANDIA_GUILD_ID], data: { name: 'py-dungeon', description: 'Catacombs' } },
    { name: 'py-mary', guildScope: [MARY_GUILD_ID], data: { name: 'py-mary', description: 'Mary' } },
  ];
  const cmds = getHelpModules(fake, { lang: 'en' }).flatMap((m) => m.commands || []);
  const dungeon = cmds.find((c) => c.name === '/py-dungeon');
  assert.equal(dungeon.cringelandiaOnly, true);
  assert.match(dungeon.desc, /Cringelândia only/);
  assert.equal(cmds.find((c) => c.name === '/py-daily').cringelandiaOnly, false);
  assert.ok(!cmds.some((c) => c.name === '/py-mary'), 'Comandos da Mary nunca aparecem');
  console.log('  ✅ 3. Ajuda e /api/commands com a marca da Cringelândia.');

  // 4. XP do Passe só conta na Cringelândia quando o gancho informa o servidor
  const user = `user_test_scope_${Date.now()}`;
  assert.equal(battlePass.safeAddXp(user, 'work', { guildId: '999999999999999999' }), null, 'Fora da Cringelândia não dá XP');
  assert.equal(battlePass.safeAddXp(user, 'daily', { guildId: null }), null, 'DM não dá XP');
  assert.ok(battlePass.safeAddXp(user, 'work', { guildId: CRINGELANDIA_GUILD_ID }), 'Na Cringelândia dá XP');
  console.log('  ✅ 4. XP do Passe só na Cringelândia.');

  console.log('🎉 [TEST] Escopo da Cringelândia validado!');
} finally {
  fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
}

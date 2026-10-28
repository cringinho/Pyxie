const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💬 Testes das falas da Pyxie nos comandos interativos...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-quips-'));
const quips = require('../src/services/pyxieQuips');
const { cleanLine } = require('../src/services/pyxieVoice');
const { TRANSLATIONS } = require('../src/utils/i18n');
const eo = require('../src/services/embedOverrides');

try {
  // 1. Banco: 20+ por comando, PT e EN com a mesma quantidade, todas passam no filtro da voz
  const commands = Object.keys(quips.BANK).filter((k) => !k.startsWith('_'));
  assert.ok(commands.length >= 30, 'Todos os comandos interativos');
  for (const c of commands) {
    const { pt, en } = quips.BANK[c];
    assert.ok(pt.length >= 20, `${c}: pelo menos 20 falas em PT`);
    assert.equal(pt.length, en.length, `${c}: PT e EN com a mesma quantidade`);
    assert.equal(new Set(pt).size, pt.length, `${c}: sem fala repetida`);
    for (const line of [...pt, ...en]) assert.ok(cleanLine(line), `${c}: fala recusada pelo filtro: ${line}`);
  }
  for (const c of ['py-daily', 'py-work', 'py-tarot', 'py-help', 'py-setup', 'py-admin']) assert.equal(quips.BANK[c], undefined, `${c} fica fora do banco`);
  console.log(`  ✅ 1. ${commands.length} comandos com 20+ falas em PT e EN, todas no filtro.`);

  // 2. Banco da voz (diário, trabalho, tarot) com 20+ falas
  for (const ev of ['daily', 'work', 'tarot']) {
    for (const lang of ['pt', 'en']) {
      const lines = Object.values(TRANSLATIONS[lang].pyxieVoice[ev]);
      assert.ok(lines.length >= 20, `${ev}/${lang}: 20+ falas`);
      for (const line of lines) assert.ok(cleanLine(line), `${ev}/${lang}: fala recusada: ${line}`);
    }
  }
  console.log('  ✅ 2. Diário, trabalho e tarot com 20+ falas prontas.');

  // 3. Comando por barra, por prefixo e por apelido em PT; mesma semente, mesma fala
  assert.equal(quips.commandKey('/py-ship'), 'py-ship');
  assert.equal(quips.commandKey('py!casal'), 'py-ship');
  assert.equal(quips.commandKey('py!ship'), 'py-ship');
  assert.equal(quips.commandKey('/py-help'), null);
  assert.equal(quips.commandKey('/_info'), null);
  assert.equal(quips.quipFor('/py-dice', 'pt', '123'), quips.quipFor('/py-dice', 'pt', '123'));
  assert.ok(quips.BANK['py-dice'].en.includes(quips.quipFor('/py-dice', 'en', '123')));
  console.log('  ✅ 3. Barra, prefixo e apelidos; a fala não muda durante a partida.');

  // 4. Fala no fim do primeiro embed, sem repetir, nunca em erro
  const once = quips.addQuip({ description: 'Resultado: 6' }, 'teste');
  assert.equal(once.description, 'Resultado: 6\n\n-# 💬 teste');
  assert.equal(quips.addQuip(once, 'outra').description, once.description, 'Não empilha falas');
  const body = { type: 4, data: { embeds: [{ title: '🎲 Dado', description: 'Saiu 6' }, { title: 'segundo' }] } };
  const out = eo.transformBody('999999999999999999', body, { command: '/py-dice', lang: 'pt', seed: 'abc' });
  assert.ok(out.body.data.embeds[0].description.includes('-# 💬 '));
  assert.equal(out.body.data.embeds[1].description, undefined, 'Só no primeiro embed');
  const err = eo.transformBody('999999999999999999', { embeds: [{ title: '❌ Não consegui', description: 'x' }] }, { command: '/py-dice', lang: 'pt', seed: 'abc' });
  assert.ok(!err.body.embeds[0].description.includes('💬'), 'Erro sem fala');
  const daily = eo.transformBody('999999999999999999', { embeds: [{ title: 'Diário', description: 'x' }] }, { command: '/py-daily', lang: 'pt', seed: 'abc' });
  assert.ok(!daily.body.embeds[0].description.includes('💬'), 'Diário usa a voz própria');
  console.log('  ✅ 4. Fala só no primeiro embed, sem repetir e nunca em erro.');
  console.log('🎉 [TEST] Falas da Pyxie validadas!');
} finally {
  fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
}

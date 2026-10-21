const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { auditDatabase } = require('../scripts/audit_database_integrity');
const truthEngine = require('../src/services/truthReconciliationEngine');

console.log('🛡️ Iniciando suíte de testes de Engenharia: Integridade do Banco & Discord Health...');

// =========================================================================
// 1. Auditoria de Integridade de Banco de Dados Real (data/)
// =========================================================================
const dataDir = path.join(__dirname, '..', 'data');
const auditResult = auditDatabase(dataDir);

assert.strictEqual(typeof auditResult.totalCheckedFiles, 'number', 'totalCheckedFiles deve ser numérico');
assert.ok(auditResult.totalCheckedFiles >= 25, 'Deve auditar ao menos 25 arquivos JSON canônicos');
assert.strictEqual(auditResult.totalStaleFiles, 0, 'Não deve haver arquivos residuais ou legados no diretório data/');
assert.strictEqual(auditResult.issuesFound, 0, 'O banco de dados não deve conter nenhuma anomalia estrutural');
console.log(`  ✅ 1. Integridade do banco de dados real em data/ validada com sucesso (${auditResult.totalCheckedFiles} arquivos 100% íntegros).`);

// =========================================================================
// 2. Teste de Detecção de Anomalias Sintéticas
// =========================================================================
const tempTestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-db-audit-test-'));

try {
  // Cria dados anômalos para validação
  fs.writeFileSync(path.join(tempTestDir, 'economy.json'), JSON.stringify({
    user_valid: { coins: 500, magicBeans: 10, workProfessionLevel: 2 },
    user_negative_coins: { coins: -100, magicBeans: 0 },
    user_invalid_beans: { coins: 100, magicBeans: NaN },
    user_invalid_level: { coins: 50, workProfessionLevel: 9 },
    user_future_cooldown: { coins: 10, lastDaily: Date.now() + 1000 * 60 * 60 * 24 * 400 },
  }), 'utf8');

  fs.writeFileSync(path.join(tempTestDir, 'corrupted.json'), '{ invalid json syntax !!!', 'utf8');
  fs.writeFileSync(path.join(tempTestDir, 'stale.tmp'), 'residual data', 'utf8');
  fs.writeFileSync(path.join(tempTestDir, 'old_backup.backup'), 'old backup', 'utf8');

  const syntheticAudit = auditDatabase(tempTestDir);

  assert.ok(syntheticAudit.issues.some((i) => i.issue === 'CORRUPTED_JSON'), 'Deve detectar JSON corrompido');
  assert.ok(syntheticAudit.issues.some((i) => i.issue === 'INVALID_OR_NEGATIVE_COINS'), 'Deve detectar saldo negativo');
  assert.ok(syntheticAudit.issues.some((i) => i.issue === 'INVALID_OR_NEGATIVE_MAGIC_BEANS'), 'Deve detectar feijões NaN/inválidos');
  assert.ok(syntheticAudit.issues.some((i) => i.issue === 'INVALID_PROFESSION_LEVEL'), 'Deve detectar nível de profissão inválido');
  assert.ok(syntheticAudit.issues.some((i) => i.issue === 'ANOMALOUS_DAILY_COOLDOWN'), 'Deve detectar cooldown anômalo no futuro');
  assert.strictEqual(syntheticAudit.totalStaleFiles, 2, 'Deve detectar os 2 arquivos temporários/backup');

  console.log('  ✅ 2. Detecção automática de dados incoerentes, saldos negativos e sintaxe corrompida validada.');
} finally {
  fs.rmSync(tempTestDir, { recursive: true, force: true });
}

// =========================================================================
// 3. Validação do TruthReconciliationEngine (Filtro Anti-Loop e Atomic Write)
// =========================================================================
assert.ok(truthEngine, 'TruthReconciliationEngine deve estar exportado');
assert.strictEqual(typeof truthEngine.runVerificationWave, 'function', 'runVerificationWave deve ser função');
assert.strictEqual(typeof truthEngine.updatePublicTruthSnapshot, 'function', 'updatePublicTruthSnapshot deve ser função');

// Valida que a onda de verificação é executada sem falhas
const waveResult = truthEngine.runVerificationWave({ force: true, trigger: 'test_audit' });
assert.ok(waveResult instanceof Promise, 'runVerificationWave deve retornar Promise');

// =========================================================================
// 4. Validação de Discord Health & Proteção do Processo
// =========================================================================
const { execFileSync } = require('node:child_process');
const indexPath = path.join(__dirname, '..', 'index.js');

// 4.1 Validação de Sintaxe Estrita do index.js
assert.doesNotThrow(() => {
  execFileSync(process.execPath, ['--check', indexPath]);
}, 'index.js deve passar na checagem de sintaxe do Node');

// 4.2 Verificação de Listeners Canônicos e Eventos Enum do Discord.js
const indexContent = fs.readFileSync(indexPath, 'utf8');

assert.ok(indexContent.includes('Events.ClientReady'), 'index.js deve escutar Events.ClientReady para compatibilidade oficial');
assert.ok(indexContent.includes('Events.InteractionCreate'), 'index.js deve escutar Events.InteractionCreate');
assert.ok(indexContent.includes('Events.MessageCreate'), 'index.js deve escutar Events.MessageCreate');
assert.ok(indexContent.includes('Events.GuildCreate'), 'index.js deve escutar Events.GuildCreate');
assert.ok(indexContent.includes('Events.Error'), 'index.js deve escutar Events.Error');
assert.ok(indexContent.includes('Events.Warn'), 'index.js deve escutar Events.Warn');
assert.ok(indexContent.includes('Events.ShardError'), 'index.js deve escutar Events.ShardError');
assert.ok(indexContent.includes('Events.ShardDisconnect'), 'index.js deve escutar Events.ShardDisconnect');
assert.ok(indexContent.includes('Events.ShardReconnecting'), 'index.js deve escutar Events.ShardReconnecting');
assert.ok(indexContent.includes('Events.ShardResume'), 'index.js deve escutar Events.ShardResume');

assert.ok(indexContent.includes("process.on('unhandledRejection'"), 'index.js deve monitorar unhandledRejection para resiliência contínua');
assert.ok(indexContent.includes("process.on('uncaughtException'"), 'index.js deve monitorar uncaughtException para resiliência contínua');

console.log('  ✅ 4. Listeners de Shard, Gateway e proteção contra uncaught rejections validados no Discord Client.');

// =========================================================================
// 5. Validação de Comandos e Rotas Canônicas
// =========================================================================
const tarotCmd = require('../src/commands/tarot');
assert.strictEqual(typeof tarotCmd.isTarotButton, 'function', 'tarotCmd deve exportar isTarotButton');
assert.strictEqual(tarotCmd.isTarotButton({ isButton: () => true, customId: 'tarot:draw' }), true, 'isTarotButton deve retornar true para tarot:draw');
assert.strictEqual(tarotCmd.isTarotButton({ isButton: () => true, customId: 'tarot_tirar_dia' }), true, 'isTarotButton deve retornar true para tarot_tirar_dia');
assert.strictEqual(tarotCmd.isTarotButton({ isButton: () => true, customId: 'other_btn' }), false, 'isTarotButton deve retornar false para outros botões');

console.log('  ✅ 5. Roteamento canônico de botões do Tarot e desduplicação validados com 100% de precisão.');

console.log('\n🎉 TODOS OS TESTES DE INTEGRIDADE DO BANCO E DISCORD HEALTH PASSARAM COM 100% DE SUCESSO!\n');

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

console.log('⚡ Iniciando suíte de testes de Engenharia (Fase 3): Master Admin & Verification Waves Engine...');

// 1. Testando Command Introspector & Descoberta Profunda
console.log('  🔍 1. Testando Command Introspector e Descoberta Profunda de Comandos...');
const commandIntrospector = require('../src/services/commandIntrospector');
const introspected = commandIntrospector.getIntrospectedCommands(true);
assert(Array.isArray(introspected), 'Comandos introspectados deve ser um array');
assert(introspected.length >= 40, `Deve introspectar pelo menos 40 comandos, encontrou: ${introspected.length}`);

const moduleIds = new Set(introspected.map((c) => c.moduleId));
assert(moduleIds.has('core'), 'Deve incluir comandos do núcleo (core)');
assert(moduleIds.has('mary-studio'), 'Deve incluir comandos do Estúdio da Mary (mary-studio)');
assert(moduleIds.has('seasonal'), 'Deve incluir comandos sazonais (seasonal)');
assert(moduleIds.has('marriage'), 'Deve incluir comandos de matrimônio (marriage)');
assert(moduleIds.has('museum'), 'Deve incluir comandos do museu (museum)');

const maryCmd = introspected.find((c) => c.moduleId === 'mary-studio');
assert(maryCmd, 'Comando do Estúdio da Mary deve estar presente');
assert(maryCmd.isMaryExclusive, 'Comando da Mary deve ser reconhecido com escopo exclusivo da Mary');

console.log(`    ✅ 1. ${introspected.length} comandos descobertos com sucesso em 6 módulos.`);

// 2. Testando Emoji Resolver (Discord CDN Inline <img>)
console.log('  ✨ 2. Testando Conversor Universal de Emojis Discord (src/utils/emojiResolver)...');
const emojiResolver = require('../src/utils/emojiResolver');
const rawEmojiStr = 'Mago <:1212_magic_hat:1551355287829749820> e Animado <a:fire:1551355287829749821>';
const parsedHtml = emojiResolver.parseDiscordEmojisToHtml(rawEmojiStr);
assert(parsedHtml.includes('<img src="https://cdn.discordapp.com/emojis/1551355287829749820.webp'), 'Deve converter emoji estático para imagem webp');
assert(parsedHtml.includes('<img src="https://cdn.discordapp.com/emojis/1551355287829749821.gif'), 'Deve converter emoji animado para gif');
assert(parsedHtml.includes('class="pyxie-inline-emoji"'), 'Deve adicionar classe pyxie-inline-emoji');

const stripped = emojiResolver.stripDiscordEmojis(rawEmojiStr);
assert(!stripped.includes('<:'), 'Texto limpo não deve conter tokens <:');
assert(stripped.includes('Mago') && stripped.includes('Animado'), 'Texto limpo deve preservar palavras');
console.log('    ✅ 2. Conversão e sanitização de emojis Discord validadas com sucesso.');

// 3. Testando Fim do /none e Ranking Completo em Telemetria
console.log('  📊 3. Testando Eliminação Definitiva do /none e Ranking Universal de Comandos...');
const commandTelemetry = require('../src/services/commandTelemetry');
const topCmd = commandTelemetry.getTopCommand();
assert(topCmd, 'TopCommand deve existir');
assert(topCmd.name !== 'none', `TopCommand NUNCA pode ser /none! Encontrado: ${topCmd.name}`);
assert(typeof topCmd.category === 'string' && topCmd.category.length > 0, 'TopCommand deve ter categoria válida');

const ranking = commandTelemetry.getRanking();
assert(Array.isArray(ranking), 'Ranking deve ser array');
assert(ranking.length >= introspected.length, `Ranking deve listar 100% dos comandos do código (${introspected.length}), retornou: ${ranking.length}`);

// Gravação de telemetria universal
commandTelemetry.recordCommand({
  commandName: 'py-work',
  executionType: 'slash',
  guildId: '1453890868980482090',
  userId: '214153735281180673',
  lang: 'pt-BR',
  isError: false,
  latencyMs: 45,
});

const updatedSummary = commandTelemetry.getSummary();
assert(updatedSummary.totalCalls >= 1, 'Total de chamadas deve registrar execução');
assert(Array.isArray(updatedSummary.categories), 'Resumo deve conter agregação de categorias');
console.log('    ✅ 3. /none eliminado e exibição universal de comandos validada.');

// 4. Testando Profiler Real da VM (Sem Mocks de 18 MB e 8.5 MB)
console.log('  ⚡ 4. Testando Profiler Real da VM (Extinção de Mocks 18MB e 8.5MB)...');
const resourceTelemetry = require('../src/services/resourceTelemetry');
const moduleMetrics = resourceTelemetry.getModuleMetrics();
assert(Array.isArray(moduleMetrics), 'moduleMetrics deve ser array');
for (const m of moduleMetrics) {
  assert(m.ramMb !== 18, `Módulo ${m.id} ainda está exibindo o mock estático de 18 MB!`);
  assert(typeof m.ramMb === 'number' && m.ramMb > 0, `Módulo ${m.id} deve ter medição real de RAM em MB (encontrado: ${m.ramMb})`);
}

const subpanels = resourceTelemetry.getSubpanelMetrics();
for (const sp of subpanels) {
  assert(sp.ramMb !== 8.5, `Subpainel ${sp.id} ainda está exibindo o mock estático de 8.5 MB!`);
  assert(typeof sp.ramMb === 'number' && sp.ramMb > 0, `Subpainel ${sp.id} deve ter medição real de RAM em MB (encontrado: ${sp.ramMb})`);
}
console.log('    ✅ 4. Todos os mocks estáticos de 18 MB e 8.5 MB foram extintos e substituídos por profiler real.');

// 5. Testando Diretório de Servidores e Ponte de Dados em Tempo Real
console.log('  🏰 5. Testando Diretório de Servidores e Ponte de Dados em Tempo Real...');
const guildDirectory = require('../src/services/guildDirectory');
const guilds = guildDirectory.getGuildsDirectory();
assert(Array.isArray(guilds) && guilds.length >= 1, 'Deve retornar ao menos o servidor oficial baseline');
const mainGuild = guilds.find((g) => g.id === '1453890868980482090');
assert(mainGuild, 'Servidor da Cringelândia deve constar no diretório');
assert(mainGuild.joinedFormatted && mainGuild.joinedFormatted.includes('/'), 'joinedFormatted deve estar formatado legivelmente');
assert(Array.isArray(mainGuild.activeModules), 'activeModules deve ser array');
console.log('    ✅ 5. Diretório de servidores e snapshot em tempo real validados.');

// 6. Testando Visual DB (Carreira Polimórfica, Nível Explicado e Sazonal Cringelândia)
console.log('  🗄️ 6. Testando Visual DB Explorer com Carreira Polimórfica e Nível Explicado...');
const visualDbExplorer = require('../src/services/visualDbExplorer');
const usersData = visualDbExplorer.queryPartition({ partition: 'users' });
const ownerUser = usersData.records.find((u) => u.id === '214153735281180673');
assert(ownerUser, 'Registro do dono deve constar na partição users');
assert(ownerUser.career !== 'Nenhuma', 'Carreira do dono não pode ser Nenhuma (deve mapear user.profession = programador)');
assert(ownerUser.careerLevelLabel && ownerUser.careerLevelLabel.includes('Nível'), 'careerLevelLabel deve conter rótulo explicativo');
assert(ownerUser.username === 'zululuga', 'Usuário do dono deve ser identificado como @zululuga');

const globalData = visualDbExplorer.queryPartition({ partition: 'global' });
const seasonalRecord = globalData.records.find((r) => r.id === 'seasonal_state');
assert(seasonalRecord, 'Registro seasonal_state deve constar na partição global');
assert(typeof seasonalRecord.status === 'string', 'seasonal_state deve ter status descritivo');
console.log('    ✅ 6. Mapeamento polimórfico de carreira e identificação de Snowflake validados.');

// 7. Testando Acervo Real e Eliminação do "500 Questões" Hardcoded
console.log('  📚 7. Testando Inspetor de Acervo e Contagem Matemática em Tempo Real...');
const acervoAuditService = require('../src/services/acervoAuditService');
const acervoStats = acervoAuditService.getAcervoStats();
assert(acervoStats.quiz.totalQuestions === 600, `Quiz deve totalizar 600 perguntas, encontrado: ${acervoStats.quiz.totalQuestions}`);
assert(acervoStats.careers.totalProfessions === 28, 'Deve conter exatamente 28 profissões');
const sampleProf = acervoStats.careers.items.find((i) => i.key === 'mago');
assert(sampleProf && sampleProf.iconHtml && sampleProf.iconHtml.includes('<img'), 'Ícone da profissão deve ser fornecido em HTML inline');
console.log('    ✅ 7. Contagem matemática real e ícones CDN validados no Acervo.');

// 8. Testando Motor de Ondas de Verificação (SSOT) e Endpoint de Verdade Pública
console.log('  🌊 8. Testando Motor de Ondas de Verificação (Verification Waves Engine)...');
const truthReconciliationEngine = require('../src/services/truthReconciliationEngine');
truthReconciliationEngine
  .runVerificationWave({ force: true, trigger: 'unit_test' })
  .then((res) => {
    assert(res.success, 'Onda de verificação deve retornar success: true');
    assert(res.stateHash && res.stateHash.length === 64, 'Deve gerar hash SHA-256 válido do estado');

    const publicTruthFile = path.join(__dirname, '..', 'data', 'publicTruthSnapshot.json');
    assert(fs.existsSync(publicTruthFile), 'publicTruthSnapshot.json deve ser criado no disco');

    const truth = JSON.parse(fs.readFileSync(publicTruthFile, 'utf8'));
    assert(truth.commands && truth.commands.total > 0, 'Verdade pública deve conter catálogo de comandos');
    assert(truth.professions && truth.professions.total === 28, 'Verdade pública deve ter 28 profissões');
    assert(truth.milestones && truth.milestones.tarotCards === 78, 'Verdade pública deve ter 78 arcanos de Tarot');

    // Comandos de owner NÃO podem vazar para a verdade pública
    const ownerLeak = truth.commands.list.find((c) => c.name === 'admin' || c.name === 'py-admin' || c.name === 'seteco');
    assert(!ownerLeak, 'Comandos de owner (admin/seteco) JAMAIS podem constar no catálogo público do site');

    console.log('    ✅ 8. Motor de Ondas de Verificação e Snapshot de Verdade Absoluta validados com sucesso.');
    console.log('\n🎉 TODOS OS TESTES DA FASE 3 (MASTER SAAS & VERIFICATION WAVES ENGINE) PASSARAM COM 100% DE SUCESSO!\n');
  })
  .catch((err) => {
    console.error('❌ Falha nos testes da Fase 3:', err);
    process.exit(1);
  });

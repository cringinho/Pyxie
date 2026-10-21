const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

console.log('🚀 Iniciando suíte de testes de Engenharia: Master SaaS Dashboard & Trust & Safety...');

// 1. Testando Padronização de Embeds (Task 10)
console.log('  🎨 1. Testando Padronizador de Embeds Dark Kawaii e Teto de 8 Palavras...');
const { buildStandardEmbed, formatEmbedTitle, getEmbedTheme } = require('../src/utils/embedBuilderHelper');

const theme = getEmbedTheme();
assert.strictEqual(theme.colors.primary, '#E60067', 'Cor primária deve ser Rosa Vibrante (#E60067)');
assert.strictEqual(theme.colors.secondary, '#8B5CF6', 'Cor secundária deve ser Lilás Suave (#8B5CF6)');
assert.strictEqual(theme.colors.success, '#10B981', 'Cor de sucesso deve ser #10B981');
assert.strictEqual(theme.colors.warning, '#F59E0B', 'Cor de warning deve ser #F59E0B');
assert.strictEqual(theme.colors.error, '#EF4444', 'Cor de erro deve ser #EF4444');

// Teste de truncamento de palavras no título (máximo 8 palavras)
const shortTitle = formatEmbedTitle('Relatório Financeiro do Banco Celestial', '📈');
assert(shortTitle.split(/\s+/).length <= 8, 'Título curto deve ser preservado');

const longTitle = formatEmbedTitle('Este é um título extremamente longo que ultrapassa com folga o limite de oito palavras estabelecido', '🚨');
assert(longTitle.split(/\s+/).length <= 8, `Título longo deve ser limitado a 8 palavras (atual: ${longTitle.split(/\s+/).length})`);
assert(longTitle.startsWith('🚨'), 'Título deve manter a âncora visual inicial');

// Constrói embed de teste
const testEmbed = buildStandardEmbed({
  variant: 'primary',
  title: 'Painel Central Pyxie',
  description: 'Teste de **descrição padronizada** com Dark Kawaii.',
  fields: [{ name: 'Status', value: '`OK`', inline: true }],
  footerText: 'Testes Automatizados',
});
assert.strictEqual(testEmbed.data.color, 0xE60067, 'Cor do Embed deve ser 0xE60067');
assert(testEmbed.data.title.includes('Painel Central Pyxie'), 'Título deve conter o texto formatado');
assert(testEmbed.data.footer.text.includes('Pyxie'), 'Footer deve conter o nome da aplicação');
console.log('  ✅ 1. Padronizador de Embeds Dark Kawaii validado com sucesso.');

// 2. Testando Telemetria de Comandos (Task 3)
console.log('  📊 2. Testando Telemetria e Rankings de Comandos...');
const commandTelemetry = require('../src/services/commandTelemetry');

// Registra execuções de teste
commandTelemetry.recordCommand({
  name: 'py-work',
  type: 'slash',
  guildId: '1453890868980482090',
  userId: '214153735281180673',
  lang: 'pt-BR',
  success: true,
  durationMs: 45,
  category: 'economia',
});
commandTelemetry.recordCommand({
  name: 'py-work',
  type: 'prefix',
  guildId: '1453890868980482090',
  userId: '214153735281180673',
  lang: 'pt-BR',
  success: true,
  durationMs: 30,
  category: 'economia',
});
commandTelemetry.recordCommand({
  name: 'py-tarot',
  type: 'slash',
  guildId: '1453890868980482090',
  userId: '214153735281180673',
  lang: 'en',
  success: false,
  durationMs: 80,
  category: 'tarot',
});

const topCmd = commandTelemetry.getTopCommand();
assert(topCmd && topCmd.name !== 'none', 'Top 1 Command deve retornar comando ativo');

const ranking = commandTelemetry.getRanking({ timeWindow: 'all' });
assert(Array.isArray(ranking) && ranking.length >= 2, 'Ranking deve conter comandos registrados');
assert(ranking[0].total >= ranking[1].total, 'Ranking deve ser ordenado de forma decrescente por chamadas');

const summary = commandTelemetry.getSummary();
assert(summary.totalCalls >= 3, 'Total de chamadas deve ser registrado');
assert(summary.totalSlash >= 2, 'Total de slash calls deve ser registrado');
assert(summary.totalPrefix >= 1, 'Total de prefix calls deve ser registrado');

const ts = commandTelemetry.getTimeseries({ timeWindow: '24h' });
assert(Array.isArray(ts) && ts.length === 24, 'Timeseries 24h deve conter exatamente 24 buckets horários');
console.log('  ✅ 2. Telemetria e Rankings de Comandos validados com sucesso.');

// 3. Testando Trust & Safety & Legal Compliance (Task 2)
console.log('  🛡️ 3. Testando Trust & Safety, Red Flags e Dossiê...');
const trustAndSafety = require('../src/services/trustAndSafety');

// Teste de Blacklist
const testGuildId = '999988887777';
const testUserId = '111122223333';

trustAndSafety.blacklistTarget({ type: 'guild', id: testGuildId, reason: 'Servidor malicioso de teste', bannedBy: 'test_suite' });
trustAndSafety.blacklistTarget({ type: 'user', id: testUserId, reason: 'Usuário abusivo de teste', bannedBy: 'test_suite' });

assert.strictEqual(trustAndSafety.isBlacklisted({ guildId: testGuildId }).blacklisted, true, 'Guild deve estar na Blacklist');
assert.strictEqual(trustAndSafety.isBlacklisted({ userId: testUserId }).blacklisted, true, 'User deve estar na Blacklist');
assert.strictEqual(trustAndSafety.isBlacklisted({ guildId: '123' }).blacklisted, false, 'Alvo limpo não deve estar na Blacklist');

// Detecção de Red Flags via injeção/termo malicioso
trustAndSafety.recordActivity({
  userId: '555566667777',
  guildId: '888899990000',
  success: true,
  textInput: "SELECT * FROM users WHERE id = 1; DROP TABLE guilds; --",
  context: "modal:tribunal",
});

const flags = trustAndSafety.getActiveRedFlags();
assert(Array.isArray(flags), 'Red flags deve ser um array');
const foundInjection = flags.find((f) => f.reason.includes('injeção'));
assert(foundInjection, 'Detector de anomalias deve sinalizar tentativa de injeção SQL');

// Exportação de Dossiê de Compliance
const dossier = trustAndSafety.exportComplianceDossier('guild', testGuildId);
assert(dossier.json && dossier.json.metadata.targetId === testGuildId, 'Dossiê JSON deve conter metadata correto');
assert(dossier.csv && dossier.csv.includes('TargetID'), 'Dossiê CSV deve ser gerado corretamente');

// Limpeza de blacklist de teste
trustAndSafety.unblacklistTarget({ type: 'guild', id: testGuildId });
trustAndSafety.unblacklistTarget({ type: 'user', id: testUserId });
assert.strictEqual(trustAndSafety.isBlacklisted({ guildId: testGuildId }).blacklisted, false, 'Guild desbanida deve estar limpa');
console.log('  ✅ 3. Trust & Safety, Red Flags e Dossiê validados com sucesso.');

// 4. Testando Telemetria de Recursos da VM (Task 5)
console.log('  ⚡ 4. Testando Telemetria de Recursos da VM por Módulo e Sub-Painéis...');
const resourceTelemetry = require('../src/services/resourceTelemetry');

resourceTelemetry.trackModuleExecution('marriage', 12.5, 512, 1024);
resourceTelemetry.trackModuleExecution('admin', 4.2, 256, 512);

const vmOverview = resourceTelemetry.getVmOverview();
assert(typeof vmOverview.nodeMemory.rssMb === 'number', 'RSS MB deve ser numérico');
assert(typeof vmOverview.cpus === 'number' && vmOverview.cpus >= 1, 'Contagem de CPUs deve ser >= 1');

const modulesMetrics = resourceTelemetry.getModuleMetrics();
assert(Array.isArray(modulesMetrics), 'Métricas de módulos deve ser array');
const adminModule = modulesMetrics.find((m) => m.id === 'admin');
assert(adminModule, 'O painel Admin deve constar obrigatoriamente no ranking de recursos de módulos');

const subpanels = resourceTelemetry.getSubpanelMetrics();
assert(Array.isArray(subpanels) && subpanels.length >= 5, 'Sub-painéis devem ser monitorados');
console.log('  ✅ 4. Telemetria de Recursos da VM validada com sucesso.');

// 5. Testando Banco de Dados Visual Multi-Tenant (Task 6)
console.log('  🗄️ 5. Testando Visual Database Explorer e Dicionário de Metadados...');
const visualDb = require('../src/services/visualDbExplorer');

assert(visualDb.METADATA_DICTIONARY.coins, 'Dicionário deve conter metadados de coins');
assert(visualDb.METADATA_DICTIONARY.prefix, 'Dicionário deve conter metadados de prefix');

const usersPart = visualDb.queryPartition({ partition: 'users', page: 1, limit: 10 });
assert(Array.isArray(usersPart.records), 'Partição de usuários deve retornar lista paginada');
assert(usersPart.limit === 10, 'Limite de paginação deve ser respeitado');

const guildsPart = visualDb.queryPartition({ partition: 'guilds', page: 1, limit: 10 });
assert(Array.isArray(guildsPart.records), 'Partição de servidores deve retornar lista paginada');

const globalPart = visualDb.queryPartition({ partition: 'global' });
assert(Array.isArray(globalPart.records) && globalPart.records.length >= 2, 'Partição global deve conter estados');
console.log('  ✅ 5. Visual Database Explorer validado com sucesso.');

// 6. Testando Mapeamento Interativo de Rotas Web (Task 8)
console.log('  🗺️ 6. Testando Mapeamento Interativo do Ecossistema Web e Toggles...');
const webRoutes = require('../src/services/webRoutesManager');

const map = webRoutes.getEcosystemMap();
assert(Array.isArray(map.routes) && map.routes.length >= 10, 'Mapa deve mapear todas as rotas públicas, sub-painéis e subdomínios');
const marySub = map.routes.find((r) => r.id === 'sub_mary_pwa');
assert(marySub && marySub.enabled === false, 'Diário PWA deve estar pausado/desativado por padrão');

// Testa toggle de rota em tempo de execução
const toggled = webRoutes.toggleRoute('wiki', false);
assert.strictEqual(toggled.enabled, false, 'Rota wiki deve ser pausada em runtime');
webRoutes.toggleRoute('wiki', true);
assert.strictEqual(webRoutes.getEcosystemMap().routes.find((r) => r.id === 'wiki').enabled, true, 'Rota wiki deve ser reativada');
console.log('  ✅ 6. Mapeamento Interativo do Ecossistema Web validado com sucesso.');

// 7. Testando Matriz de Escopo, Ambiente e Permissões de Comandos (Task 9)
console.log('  🎯 7. Testando Matriz de Escopo de Comandos e Simulador de Visibilidade...');
const commandScope = require('../src/services/commandScopeManager');

const allScopes = commandScope.getAllCommandScopes();
assert(Array.isArray(allScopes) && allScopes.length >= 30, 'Deve listar todos os comandos com suas 4 dimensões');

const adminScope = allScopes.find((c) => c.name === 'admin' || c.name === 'py-admin');
assert(adminScope && adminScope.ownerOnly === true, 'Comando admin deve ser estritamente ownerOnly');

// Teste do Simulador de Visibilidade
const simOwner = commandScope.simulateVisibility({ userType: 'owner', userId: '214153735281180673' });
const simMember = commandScope.simulateVisibility({ userType: 'member', userId: '999999999' });

assert(simOwner.visibleCount > simMember.visibleCount, 'Owner deve enxergar mais comandos que um membro comum');
assert(simMember.hiddenCommands.some((c) => c.name.includes('admin') || c.name.includes('seteco')), 'Membro comum deve ter comandos restritos ocultos');
console.log('  ✅ 7. Matriz de Escopo e Simulador de Visibilidade validados com sucesso.');

// 8. Testando Watchdog e Heartbeat (Task 7)
console.log('  💓 8. Testando Watchdog de Processo e Heartbeat...');
const watchdog = require('../src/services/schedulerWatchdog');

const heartbeat = watchdog.recordHeartbeat('online');
assert(typeof heartbeat.timestamp === 'number', 'Heartbeat deve registrar timestamp');
assert(typeof heartbeat.pid === 'number', 'Heartbeat deve registrar PID');

const stateFile = path.join(__dirname, '..', 'data', 'schedulerState.json');
assert(fs.existsSync(stateFile), 'Arquivo schedulerState.json deve ser gerado pelo watchdog');
console.log('  ✅ 8. Watchdog de Processo e Heartbeat validados com sucesso.');

console.log('\n🎉 TODOS OS TESTES DO MASTER SAAS DASHBOARD PASSARAM COM 100% DE SUCESSO!\n');


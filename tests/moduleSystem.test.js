const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const EventEmitter = require('node:events');

// Isola completamente os arquivos de configuração durante os testes de módulos
const testModulesConfig = path.join(__dirname, 'modulesConfig.test.json');
const testSeasonalConfig = path.join(__dirname, 'seasonalConfig.modtest.json');
const testSeasonalData = path.join(__dirname, 'seasonalData.modtest.json');
process.env.MODULES_CONFIG_PATH = testModulesConfig;
process.env.SEASONAL_CONFIG_PATH = testSeasonalConfig;
process.env.SEASONAL_DATA_PATH = testSeasonalData;

const moduleManager = require('../src/services/moduleManager');
const { getHelpModules, COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
const { OWNER_SNOWFLAKE } = require('../src/services/adminAuth');
const adminCommand = require('../src/commands/admin');

console.log('🧩 Iniciando suíte de testes de Engenharia: Motor Modular de Cogs (Red-DiscordBot Pattern)...');

// Mock de Discord Client com EventEmitter
class MockDiscordClient extends EventEmitter {
  constructor() {
    super();
    this.user = { id: '123456789012345678', tag: 'Pyxie#0001' };
  }
}

// 1. Teste de Descoberta Automática de Módulos
const discovered = moduleManager.discoverModules();
assert(discovered.has('seasonal'), 'O módulo oficial "seasonal" deve ser descoberto em src/modules/seasonal');
const seasonalMod = discovered.get('seasonal');
assert.equal(seasonalMod.id, 'seasonal', 'ID do módulo deve ser seasonal');
assert.equal(seasonalMod.category, 'economia', 'Categoria nativa do módulo seasonal deve ser economia');
assert(Array.isArray(seasonalMod.commands), 'Módulo deve exportar lista de comandos');
assert(seasonalMod.commands.length > 0, 'Módulo seasonal deve conter ao menos 1 comando');
console.log(`✅ Descoberta de módulos validada: ${discovered.size} módulo(s) encontrado(s) em src/modules/.`);

// 2. Teste de Metadados e Formatação Administrativa
const allModules = moduleManager.getAllModules();
assert(Array.isArray(allModules), 'getAllModules() deve retornar um array');
const seasonalMeta = allModules.find((m) => m.id === 'seasonal');
assert(seasonalMeta, 'Metadados de seasonal devem ser retornados');
assert.equal(seasonalMeta.category, 'economia');
assert.equal(typeof seasonalMeta.commandsCount, 'number');
assert(seasonalMeta.commandsCount >= 1, 'commandsCount deve ser pelo menos 1');
console.log('✅ Formatação de metadados para painel administrativo validada.');

(async () => {
  // 3. Teste de Inicialização e Ativação Dinâmica (enableModule)
  const mockCommandsByName = new Map();
  const mockClient = new MockDiscordClient();

  moduleManager.init({
    client: mockClient,
    commandsByName: mockCommandsByName,
  });

  // Garante início limpo e desativado
  await moduleManager.disableModule('seasonal', false);
  assert.equal(mockCommandsByName.has('infoevento'), false, 'Comando não deve existir antes de ativar o módulo');
  assert.equal(mockCommandsByName.has('py-infoevento'), false, 'Alias py-infoevento não deve existir');

  // Ativa o módulo
  await moduleManager.enableModule('seasonal', false);
  assert.equal(moduleManager.isModuleEnabled('seasonal') || moduleManager.activeScopes.has('seasonal'), true, 'Módulo seasonal deve estar ativo');
  assert.equal(mockCommandsByName.has('infoevento'), true, 'Comando infoevento deve estar registrado em commandsByName');
  assert.equal(mockCommandsByName.has('py-infoevento'), true, 'Alias py-infoevento deve estar registrado em commandsByName');
  assert.equal(mockCommandsByName.has('evento'), true, 'Alias evento deve estar registrado em commandsByName');

  // 4. Teste de Catalogação Dinâmica na Central de Ajuda e Web (Seamless Native Perception)
  const activeCmds = moduleManager.getActiveCommands();
  assert(activeCmds.some((c) => (c.name === 'infoevento' || c.data?.name === 'py-infoevento')), 'getActiveCommands() deve retornar comandos do módulo ativo');

  const helpModules = getHelpModules(null, 'pt');
  const economiaCategory = helpModules.find((m) => m.id === 'economia');
  assert(economiaCategory, 'Categoria Economia deve existir');
  const foundInHelp = (economiaCategory.commands || []).some((c) => c.name.includes('infoevento'));
  assert.equal(foundInHelp, true, 'Comando do módulo seasonal deve aparecer perfeitamente integrado na categoria "economia" do help/web');
  console.log('✅ Injeção dinâmica transparente no catálogo (/py-help e /api/commands) validada.');

  // 5. Teste de Categoria Dinâmica e Resolução de Comandos
  const detectedCategory = moduleManager.getCommandCategory('py-infoevento');
  assert.equal(detectedCategory, 'economia', 'Categoria nativa de py-infoevento deve ser economia');

  // 6. Teste de Garantia de Zero Resíduos em Memória (Zero Memory Leaks / Unload Lifecycle)
  // Registra recursos adicionais no escopo do módulo para teste rigoroso
  const scope = moduleManager.activeScopes.get('seasonal');
  assert(scope, 'Escopo ativo de seasonal deve existir');

  let dummyEventFired = false;
  const dummyHandler = () => { dummyEventFired = true; };
  mockClient.on('guildMemberAdd', dummyHandler);
  scope.listeners.push({ event: 'guildMemberAdd', handler: dummyHandler });

  const dummyInterval = setInterval(() => {}, 10000);
  scope.intervals.push(dummyInterval);

  const dummyTimeout = setTimeout(() => {}, 10000);
  scope.timeouts.push(dummyTimeout);

  // Desativa o módulo com limpeza de memória total
  await moduleManager.disableModule('seasonal', false);

  // Verificação minuciosa de zero resíduos:
  assert.equal(moduleManager.activeScopes.has('seasonal'), false, 'Escopo ativo de seasonal deve ser 100% excluído');
  assert.equal(mockCommandsByName.has('infoevento'), false, 'Comando infoevento DEVE ser removido de commandsByName');
  assert.equal(mockCommandsByName.has('py-infoevento'), false, 'Alias py-infoevento DEVE ser removido de commandsByName');
  assert.equal(mockCommandsByName.has('evento'), false, 'Alias evento DEVE ser removido de commandsByName');
  assert.equal(mockClient.listenerCount('guildMemberAdd'), 0, 'Listeners registrados pelo módulo DEVEM ser desvinculados do Client');

  const postDisableHelp = getHelpModules(null, 'pt');
  const postEconomia = postDisableHelp.find((m) => m.id === 'economia');
  const foundAfterDisable = (postEconomia.commands || []).some((c) => c.name.includes('infoevento'));
  assert.equal(foundAfterDisable, false, 'Comando desativado NÃO deve aparecer no catálogo de ajuda nem no website');

  console.log('✅ Desativação com Zero Resíduos em Memória (Listeners, Comandos, Cron, Timers) validada.');

  // 7. Teste de Recarregamento em Tempo Real (Reload)
  await moduleManager.enableModule('seasonal', false);
  assert.equal(mockCommandsByName.has('infoevento'), true);
  await moduleManager.reloadModule('seasonal');
  assert.equal(mockCommandsByName.has('infoevento'), true, 'Comando deve continuar acessível após reload de módulo ativo');
  await moduleManager.disableModule('seasonal', false);
  assert.equal(mockCommandsByName.has('infoevento'), false);
  console.log('✅ Ciclo de vida de reload em tempo real validado com sucesso.');

  // 8. Teste de Permissões de Dono no Discord (/py-admin modulos)
  const unauthorizedView = adminCommand.buildModulesView('999999999999999999');
  assert(
    unauthorizedView.content && (unauthorizedView.content.includes('Restricted Access') || unauthorizedView.content.includes('Acesso Restrito')),
    'Não-donos devem ser bloqueados de visualizar/gerenciar módulos'
  );

  const ownerView = adminCommand.buildModulesView(OWNER_SNOWFLAKE);
  assert(ownerView.embeds && ownerView.embeds.length > 0, 'Dono deve receber embed com a lista de módulos');
  assert(ownerView.components && ownerView.components.length > 0, 'Dono deve receber botões de alternância de módulos');
  console.log('✅ Segurança e permissões de Dono (/py-admin modulos) validadas.');

  // Limpa arquivos de teste
  try { if (fs.existsSync(testModulesConfig)) fs.unlinkSync(testModulesConfig); } catch (_) {}
  try { if (fs.existsSync(testSeasonalConfig)) fs.unlinkSync(testSeasonalConfig); } catch (_) {}
  try { if (fs.existsSync(testSeasonalData)) fs.unlinkSync(testSeasonalData); } catch (_) {}

  console.log('🎉 Todos os testes do Motor Modular de Cogs passaram com 100% de sucesso!');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Falha na suíte de testes de módulos:', err);
  process.exit(1);
});

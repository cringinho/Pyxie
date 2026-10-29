const assert = require('assert');
const path = require('path');

console.log('🧪 [TEST] Validando as 8 adições do comparativo Zyrox/Red...');

async function runTests() {
  // 1. Camada de configuração por escopo (scopedConfig)
  const scopedConfig = require('../src/services/scopedConfig');
  const testNs = scopedConfig.registerNamespace('test_zyrox_scope', {
    global: { limit: 5, tag: 'global' },
    guild: { limit: 5, tag: 'guild_default', enabled: true },
    channel: {},
    role: {},
    member: {},
    user: { pref: 'pt' },
  });

  const testGuild = '999888777666555444';
  const testChan = '999888777666555111';
  const testRole = '999888777666555222';
  const testUser = '999888777666555333';

  testNs.set('guild', testGuild, { limit: 10, tag: 'guild_custom' });
  testNs.set('role', testRole, { limit: 20 });
  testNs.set('channel', testChan, { limit: 30 });
  testNs.set('user', testUser, { pref: 'en' });

  const resolvedChan = testNs.resolve({
    guildId: testGuild,
    roleIds: [testRole],
    channelId: testChan,
    userId: testUser,
  });
  assert.strictEqual(resolvedChan.limit, 30, 'Escopo de canal deve vencer cargo e servidor');
  assert.strictEqual(resolvedChan.tag, 'guild_custom', 'Propriedade herdada do servidor deve permanecer');
  assert.strictEqual(resolvedChan.pref, 'en', 'Preferência de usuário deve vencer o padrão');

  testNs.set('member', testGuild, { limit: 99 }, testUser);
  const resolvedMember = testNs.resolve({
    guildId: testGuild,
    roleIds: [testRole],
    channelId: testChan,
    userId: testUser,
  });
  assert.strictEqual(resolvedMember.limit, 99, 'Escopo de membro deve vencer canal e cargo');

  console.log('  ✅ 1. Camada de configuração por escopo (scopedConfig) validada.');

  // 2. Bem-estar: Lembretes, AFK e Aniversários (wellbeingService)
  const wellbeing = require('../src/services/wellbeingService');
  const remRes = wellbeing.createReminder({
    userId: testUser,
    guildId: testGuild,
    channelId: testChan,
    text: 'Beber água e alongar',
    durationMs: 60_000,
  });
  assert.strictEqual(remRes.ok, true, 'Deve criar lembrete pessoal');
  assert.strictEqual(wellbeing.listUserReminders(testUser).length, 1);

  const afkEntry = wellbeing.setAfk(testUser, 'Pausa para o almoço @everyone https://evil.test');
  assert.ok(!afkEntry.message.includes('@everyone'), 'AFK deve higienizar menções');
  assert.ok(!afkEntry.message.includes('https://'), 'AFK deve remover links');
  assert.ok(wellbeing.getAfk(testUser), 'AFK deve estar ativo');

  const bdayBad = wellbeing.setBirthday(testUser, { day: 31, month: 2, guildId: testGuild, optInGuild: true });
  assert.strictEqual(bdayBad.ok, false, 'Deve recusar 31 de fevereiro');

  const bdayOk = wellbeing.setBirthday(testUser, { day: 15, month: 8, guildId: testGuild, optInGuild: true });
  assert.strictEqual(bdayOk.ok, true, 'Deve aceitar dia/mês válido');
  const savedBday = wellbeing.getBirthday(testUser);
  assert.strictEqual(savedBday.day, 15);
  assert.strictEqual(savedBday.month, 8);
  assert.strictEqual(savedBday.year, undefined, 'Nunca deve guardar ano de nascimento/idade');

  console.log('  ✅ 2. Pacote de bem-estar (lembretes, AFK e aniversário sem idade) validado.');

  // 3. Apagar meus dados (LGPD - privacyService)
  const privacy = require('../src/services/privacyService');
  const inspectBefore = privacy.inspectUserData(testUser);
  assert.ok(inspectBefore.totalCategories >= 1, 'Inspeção LGPD deve achar os registros do usuário');

  const eraseRes = await privacy.eraseUserData(testUser);
  assert.strictEqual(eraseRes.ok, true);
  assert.ok(eraseRes.receiptId && eraseRes.receiptId.startsWith('LGPD-'), 'Deve emitir recibo criptográfico LGPD');
  assert.strictEqual(wellbeing.listUserReminders(testUser).length, 0, 'Lembretes devem ser apagados pelo LGPD');
  assert.strictEqual(wellbeing.getAfk(testUser), null, 'AFK deve ser apagado pelo LGPD');
  assert.strictEqual(wellbeing.getBirthday(testUser), null, 'Aniversário deve ser apagado pelo LGPD');

  testNs.clear('guild', testGuild);
  testNs.clear('role', testRole);
  testNs.clear('channel', testChan);

  console.log('  ✅ 3. Exclusão completa de dados pessoais (LGPD) + recibo criptográfico validados.');

  // 4. Regras de permissão por comando + Diagnóstico de comando
  const cmdPerms = require('../src/services/commandPermissions');
  const cmdDiag = require('../src/services/commandDiagnostics');

  cmdPerms.addRule(testGuild, {
    command: 'py-tarot',
    targetType: 'role',
    targetId: testRole,
    action: 'deny',
  });
  cmdPerms.addRule(testGuild, {
    command: 'py-tarot',
    targetType: 'channel',
    targetId: testChan,
    action: 'allow',
  });

  const evalBlockedRole = cmdPerms.evaluateCommandPermissions(testGuild, 'py-tarot', {
    channelId: '111111111111111111',
    userId: testUser,
    roleIds: [testRole],
  });
  assert.strictEqual(evalBlockedRole.allowed, false, 'Cargo negado deve bloquear em canal comum');

  const evalAllowedChan = cmdPerms.evaluateCommandPermissions(testGuild, 'py-tarot', {
    channelId: testChan,
    userId: testUser,
    roleIds: [testRole],
  });
  assert.strictEqual(evalAllowedChan.allowed, true, 'Regra de canal (allow) deve vencer regra de cargo (deny)');

  const diagBlocked = cmdDiag.diagnoseCommand({
    guildId: testGuild,
    commandName: 'py-tarot',
    channelId: '111111111111111111',
    userId: testUser,
    roleIds: [testRole],
    isAdmin: false,
  });
  assert.strictEqual(diagBlocked.ok, false);
  assert.strictEqual(diagBlocked.failedStep, 'permission_rules');

  const diagAllowed = cmdDiag.diagnoseCommand({
    guildId: testGuild,
    commandName: 'py-tarot',
    channelId: testChan,
    userId: testUser,
    roleIds: [testRole],
    isAdmin: false,
  });
  assert.strictEqual(diagAllowed.ok, true);

  cmdPerms.setRules(testGuild, []);
  console.log('  ✅ 4. Regras de permissão (canal > cargo) e diagnóstico de comando validados.');

  // 5. Advertências por pontos + casos de moderação (modCasesService)
  const modCases = require('../src/services/modCasesService');
  const modGuild = `999000${Date.now().toString().slice(-12)}`;
  modCases.setGuildWarningsConfig(modGuild, {
    enabled: true,
    defaultExpireDays: 30,
    thresholds: [
      { points: 3, action: 'timeout', durationMinutes: 60 },
      { points: 5, action: 'kick', durationMinutes: 0 },
    ],
  });

  const w1 = modCases.issueWarning(modGuild, {
    userId: testUser,
    moderatorId: '214153735281180673',
    points: 2,
    reason: 'Linguagem inadequada no chat geral',
  });
  assert.strictEqual(w1.caseRecord.caseNumber, 1, 'Primeiro caso deve ser #1');
  assert.strictEqual(w1.totalPoints, 2);
  assert.strictEqual(w1.triggeredThreshold, null);

  const w2 = modCases.issueWarning(modGuild, {
    userId: testUser,
    moderatorId: '214153735281180673',
    points: 2,
    reason: 'Reincidência',
  });
  assert.strictEqual(w2.caseRecord.caseNumber, 2, 'Segundo caso deve ser #2');
  assert.strictEqual(w2.totalPoints, 4);
  assert.ok(w2.triggeredThreshold && w2.triggeredThreshold.action === 'timeout', 'Com 4 pontos deve acionar limite de 3 pontos (timeout)');

  const edited = modCases.updateCaseReason(modGuild, 1, 'Motivo atualizado pela moderação', { updatedBy: '214153735281180673' });
  assert.strictEqual(edited.ok, true);
  assert.strictEqual(edited.caseRecord.reason, 'Motivo atualizado pela moderação');

  const revoked = modCases.revokeWarningByCase(modGuild, 2, { revokedBy: '214153735281180673' });
  assert.strictEqual(revoked.ok, true);
  const activeAfterRevoke = modCases.getUserWarnings(modGuild, testUser);
  assert.strictEqual(activeAfterRevoke.totalPoints, 2, 'Pontos devem cair após revogar o caso #2');

  console.log('  ✅ 5. Advertências por pontos e casos numerados (#1, #2) validados.');

  // 6. Antinuke por limite + Modo de emergência global (serverGuard + emergencyMode)
  const guildSafety = require('../src/services/guildSafety');
  const serverGuard = require('../src/services/serverGuard');
  const emergencyMode = require('../src/services/emergencyMode');

  serverGuard.resetMemory();
  const cfg = guildSafety.saveConfig(testGuild, {
    antiNuke: {
      enabled: true,
      maxActions: 2,
      windowSeconds: 30,
      mode: 'alert',
      trustedIds: ['111222333444555666'],
    },
  });

  assert.strictEqual(serverGuard.isTrusted(cfg, '111222333444555666'), true, 'ID na lista branca deve ser confiável');

  const rogueActor = '777888999000111222';
  const a1 = serverGuard.recordAdminAction(testGuild, rogueActor, 'channelDelete', { maxActions: 2, windowSeconds: 30 });
  assert.strictEqual(a1.triggered, false);
  const a2 = serverGuard.recordAdminAction(testGuild, rogueActor, 'channelDelete', { maxActions: 2, windowSeconds: 30 });
  assert.strictEqual(a2.triggered, true, 'Deve disparar ao atingir o limite de ações na janela');

  // Mock de guild para testar snapshot e restauração do modo de emergência
  let currentOverwrite = null;
  const mockChannel = {
    id: testChan,
    name: 'geral',
    type: 0,
    manageable: true,
    isTextBased: () => true,
    isThread: () => false,
    permissionOverwrites: {
      cache: new Map([[testGuild, { allow: { bitfield: 0n }, deny: { bitfield: 0n } }]]),
      edit: async (_roleId, patch) => {
        currentOverwrite = patch;
      },
    },
  };
  const mockGuild = {
    id: testGuild,
    name: 'Servidor Teste',
    roles: { everyone: { id: testGuild } },
    members: { me: { id: 'bot' } },
    channels: {
      cache: new Map([[testChan, mockChannel]]),
    },
    disableInvites: async () => {},
  };

  const emOn = await emergencyMode.activateEmergency(mockGuild, {
    actorId: '214153735281180673',
    reason: 'Teste de invasão',
  });
  assert.strictEqual(emOn.ok, true);
  assert.strictEqual(currentOverwrite.SendMessages, false, 'Canal deve ter SendMessages bloqueado na emergência');
  assert.strictEqual(emergencyMode.getEmergencyStatus(testGuild).active, true);

  const emOff = await emergencyMode.deactivateEmergency(mockGuild, {
    actorId: '214153735281180673',
  });
  assert.strictEqual(emOff.ok, true);
  assert.strictEqual(emergencyMode.getEmergencyStatus(testGuild).active, false, 'Emergência deve desativar e limpar snapshot');

  console.log('  ✅ 6. Antinuke por limite e Modo de Emergência Global com restauração validados.');

  // 7. Cargos por botão no estúdio e verificação por botão
  const studio = require('../src/services/messageStudio');
  const preset = studio.buildRolePanelPreset({
    title: 'Escolha seus cargos',
    description: 'Clique nos botões abaixo:',
    roles: [
      { id: '123456789012345671', name: 'Artista', emoji: '🎨' },
      { id: '123456789012345672', name: 'Gamer', emoji: '🎮' },
    ],
  });
  assert.strictEqual(preset.buttons.length, 2, 'Preset deve gerar 2 botões de cargo');
  assert.strictEqual(preset.buttons[0].action.type, 'role');
  assert.strictEqual(preset.buttons[0].action.roleId, '123456789012345671');

  const guardModule = require('../src/modules/server-guard/index');
  const alerts = require('../src/services/securityAlerts');
  assert.strictEqual(typeof guardModule.handleVerificationButton, 'function');
  const verPayload = alerts.verificationPanelPayload('pt', {
    guildId: testGuild,
    serverName: 'Servidor Teste',
  });
  assert.ok(verPayload.embeds.length === 1 && verPayload.components.length === 1, 'Painel de verificação deve ter embed e botão');

  console.log('  ✅ 7. Preset de cargos no Estúdio e Verificação Acessível por Botão validados.');

  // 8. Conferência dos 8 novos comandos Discord
  const newCmdFiles = [
    'privacidade.js',
    'diagnostico.js',
    'advertencia.js',
    'casos.js',
    'emergencia.js',
    'lembrete.js',
    'afk.js',
    'aniversario.js',
  ];
  for (const file of newCmdFiles) {
    const cmd = require(path.join(__dirname, '..', 'src', 'commands', file));
    assert.ok(cmd.data && cmd.data.name, `Comando ${file} deve ter SlashCommandBuilder data`);
    assert.strictEqual(typeof cmd.executeSlash, 'function', `Comando ${file} deve ter executeSlash()`);
    assert.strictEqual(typeof cmd.executePrefix, 'function', `Comando ${file} deve ter executePrefix()`);
  }
  console.log('  ✅ 8. Todos os 8 novos comandos Discord carregam e exportam barra + prefixo.');

  // 9. Estatísticas expandidas do painel, resumo de automações e customização extra por módulo
  const guildActivity = require('../src/services/guildActivity');
  const automationStats = require('../src/services/automationStats');
  const automations = require('../src/services/automations');
  const welcomeFlow = require('../src/services/welcomeFlow');
  const periodicMessages = require('../src/services/periodicMessages');
  const campfire = require('../src/services/campfire');

  const actSum = guildActivity.summary(testGuild);
  assert.ok(actSum.month && typeof actSum.month.netMembers === 'number', 'guildActivity.summary deve trazer totais de 30d e saldo líquido');
  assert.ok(actSum.deltas && typeof actSum.deltas.messages === 'number', 'guildActivity.summary deve trazer deltas 7d vs 7d anterior');
  assert.ok(actSum.averages && actSum.averages.daily7d && actSum.averages.daily30d, 'guildActivity.summary deve trazer médias diárias 7d e 30d');
  assert.ok(actSum.peakDay && typeof actSum.peakDay.messages === 'number', 'guildActivity.summary deve trazer peakDay');

  automationStats.bump(testGuild, 'inviteFilter');
  automationStats.flush();
  const stAfterBump = automationStats.read(testGuild).inviteFilter;
  assert.ok(stAfterBump.hits >= 1 && stAfterBump.lastAt > 0, 'automationStats.bump deve gravar hits e lastAt');
  const autoSum = automationStats.summary(testGuild);
  assert.ok(autoSum.totalCount >= 30 && autoSum.totalHits >= 1 && Array.isArray(autoSum.top), 'automationStats.summary deve agregar totais e ranking');
  automationStats.reset(testGuild, 'inviteFilter');
  assert.strictEqual(automationStats.read(testGuild).inviteFilter, undefined, 'automationStats.reset deve zerar o contador da automação');

  const savedStarboard = automations.saveConfig(testGuild, 'starboard', { color: '#123ABC', selfStar: true });
  assert.strictEqual(savedStarboard.color, '#123abc', 'Campo color das automações deve normalizar hex');
  assert.strictEqual(savedStarboard.selfStar, true);

  const savedWelcome = welcomeFlow.saveConfig(testGuild, {
    dmWelcomeEnabled: true,
    dmWelcomeText: 'Bem-vindo!',
    showAvatar: false,
    customFooter: 'Rodapé custom',
    checkin: { delayHours: 36, customText: 'Oi {users}' },
  });
  assert.strictEqual(savedWelcome.dmWelcomeEnabled, true);
  assert.strictEqual(savedWelcome.showAvatar, false);
  assert.strictEqual(savedWelcome.checkin.delayHours, 36);

  const savedPeriodic = periodicMessages.saveConfig(testGuild, {
    bumpGuide: { color: '#ff00aa', customTitle: 'Apoie!' },
    tarot: { hour: 9, customGreeting: 'Bom dia místico!' },
  });
  assert.strictEqual(savedPeriodic.bumpGuide.color, '#ff00aa');
  assert.strictEqual(savedPeriodic.tarot.hour, 9);

  const savedCampfire = campfire.saveConfig(testGuild, {
    color: '#00ff88',
    customMessage: 'Chega mais na fogueira!',
    autoDeleteWhenEmpty: false,
  });
  assert.strictEqual(savedCampfire.color, '#00ff88');
  assert.strictEqual(savedCampfire.autoDeleteWhenEmpty, false);

  // Confere que todo campo de automationSchemas tem chave PT e EN no dicionário do dashboard
  const fs = require('fs');
  const i18nRaw = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'dashboard', 'i18n.js'), 'utf8');
  for (const [sKey, sDef] of Object.entries(automations.SCHEMA)) {
    for (const f of sDef.fields) {
      if (f.key === 'enabled') continue;
      const k = `auto.${sKey}.${f.key}`;
      assert.ok(i18nRaw.includes(`"${k}":`) || i18nRaw.includes(`'${k}':`), `Falta tradução para o campo ${k} em client/src/dashboard/i18n.js`);
    }
  }
  try {
    fs.rmSync(path.join(__dirname, '..', 'data', 'guilds', testGuild), { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, '..', 'data', 'guilds', modGuild), { recursive: true, force: true });
  } catch (_) {}
  console.log('  ✅ 9. Estatísticas de 30d/deltas, resumo de automações e customização extra validados.');

  console.log('🎉 [TEST] Todas as 8 adições Zyrox/Red passaram nos testes!');
}

runTests().catch((err) => {
  console.error('❌ Falha em tests/zyroxRedAdditions.test.js:', err);
  process.exit(1);
});

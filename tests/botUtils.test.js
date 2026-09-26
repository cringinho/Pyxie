const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  acquireBotLock,
  releaseBotLock,
  getCommandList,
  getPrefix,
} = require('../src/utils/botUtils');
const { buildHelpMessage, buildHelpComponents } = require('../src/commands/commandHelpers');
const { getWelcomeChannel, setWelcomeChannel } = require('../src/services/database');

const lockFile = path.join(__dirname, '..', '.botmelody.lock');
const prefixFile = path.join(__dirname, '..', 'prefix.json');
const settingsFile = path.join(__dirname, '..', 'data', 'settings.json');
const economyFile = path.join(__dirname, '..', 'data', 'economy.json');
const originalSettings = fs.existsSync(settingsFile) ? fs.readFileSync(settingsFile, 'utf8') : '{}';
const originalEconomy = fs.existsSync(economyFile) ? fs.readFileSync(economyFile, 'utf8') : '{}';

if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
}

if (fs.existsSync(prefixFile)) {
  fs.unlinkSync(prefixFile);
}

try {
  const first = acquireBotLock();
  assert.equal(first, true, 'A primeira instância deve adquirir o lock.');

  const second = acquireBotLock();
  assert.equal(second, false, 'A segunda instância não deve conseguir iniciar.');

  const help = getCommandList();
  assert.ok(Array.isArray(help), 'A lista de comandos deve existir.');
  assert.ok(help.some((item) => item.name === '/py-help' || item.name === '/help' || item.name === '/ajuda' || item.name === '/py-ajuda'), 'O comando de ajuda deve estar na lista.');

  const helpPage1 = buildHelpMessage('todos', 'user-123');
  assert.ok(helpPage1.embed, 'O embed do menu de ajuda deve ser gerado.');
  assert.ok(helpPage1.components.length > 0, 'Componentes do menu devem estar presentes.');
  
  const rawComponents = helpPage1.components[0].toJSON();
  assert.equal(rawComponents.components[0].type, 3, 'Deve conter um StringSelectMenu (tipo 3).');
  assert.ok(rawComponents.components[0].options.length >= 6, 'Deve conter opções para todos os 6 módulos temáticos.');

  const defaultPrefix = getPrefix();
  assert.equal(defaultPrefix, 'py!', 'O prefixo padrão deve ser py!.');

  const configuredChannel = setWelcomeChannel('guild-123', '123456789');
  assert.equal(configuredChannel, '123456789', 'O canal de boas-vindas deve ser salvo corretamente.');
  assert.equal(getWelcomeChannel('guild-123'), '123456789', 'O canal configurado deve ser lido do banco.');

  const mentionChannel = setWelcomeChannel('guild-mention', '<#987654321>');
  assert.equal(mentionChannel, '987654321', 'Uma menção de canal deve ser convertida para o ID real.');
  assert.equal(getWelcomeChannel('guild-mention'), '987654321', 'O canal convertido deve ser persistido e lido corretamente.');

  const urlChannel = setWelcomeChannel('guild-url', 'https://discord.com/channels/111111111111111111/222222222222222222/333333333333333333');
  assert.equal(urlChannel, '333333333333333333', 'Um link de canal deve ser convertido para o ID do canal.');
  assert.equal(getWelcomeChannel('guild-url'), '333333333333333333', 'O link convertido deve ser persistido e lido corretamente.');

  // Verificação de Internacionalização (i18n):
  const { getLanguage, setGuildLanguage, CRINGELANDIA_GUILD_ID, t, getCanvasStrings } = require('../src/utils/i18n');
  assert.equal(getLanguage(CRINGELANDIA_GUILD_ID), 'pt', 'Servidor Cringelândia deve ter Português como padrão.');
  assert.equal(getLanguage(CRINGELANDIA_GUILD_ID), 'pt', 'Servidor Cringelândia deve ter Português como padrão quando não configurado.');
  assert.equal(getLanguage('outro-servidor-qualquer'), 'en', 'Servidores externos devem ter Inglês como padrão.');
  
  setGuildLanguage(CRINGELANDIA_GUILD_ID, 'en');
  assert.equal(getLanguage(CRINGELANDIA_GUILD_ID), 'en', 'Servidor Cringelândia deve permitir mudar para Inglês.');
  assert.equal(getLanguage({ guild: { id: CRINGELANDIA_GUILD_ID } }), 'en', 'Interação no Cringelândia deve respeitar idioma Inglês salvo.');

  setGuildLanguage(CRINGELANDIA_GUILD_ID, 'pt');
  assert.equal(getLanguage(CRINGELANDIA_GUILD_ID), 'pt', 'Servidor Cringelândia deve permitir voltar para Português.');

  setGuildLanguage('servidor-customizado', 'pt');
  assert.equal(getLanguage('servidor-customizado'), 'pt', 'Servidor customizado deve salvar idioma escolhido.');

  assert.equal(
    getLanguage({ guild: { id: 'servidor-sem-config' }, locale: 'pt-BR' }),
    'en',
    'Interação com locale pt-BR em servidor externo sem config DEVE retornar en.'
  );

  assert.ok(t('vote.title', 'pt').includes('Vote na Pyxie'), 'Tradução pt deve funcionar');
  assert.ok(t('vote.title', 'en').includes('Vote for Pyxie'), 'Tradução en deve funcionar');
  assert.ok(getCanvasStrings('pt').ship.person1);
  assert.ok(getCanvasStrings('en').ship.person1);

  // Testes de renderização Canvas em múltiplos idiomas:
  const { renderShipCard } = require('../src/services/shipRenderer');
  const { renderTarotCard } = require('../src/services/tarotRenderer');

  const mockMemberA = { id: 'userA', displayName: 'Hero' };
  const mockMemberB = { id: 'userB', displayName: 'Companion' };
  const shipCardPt = renderShipCard(mockMemberA, mockMemberB, 75, 'pt');
  const shipCardEn = renderShipCard(mockMemberA, mockMemberB, 75, 'en');
  assert.ok(shipCardPt instanceof Promise);

  const mockTarotCard = {
    id: 'major_00',
    num: '0',
    name: 'O LOUCO',
    arcana: 'Arcanos Maiores',
    keywords: ['Liberdade', 'Inocência'],
    upright: 'Aja antes de ter medo.',
    reversed: 'Falta de coragem.',
  };
  const tarotCardPt = renderTarotCard(mockTarotCard, 'UPRIGHT', 'pt');
  const tarotCardEn = renderTarotCard(mockTarotCard, 'REVERSED', 'en');
  assert.ok(Buffer.isBuffer(tarotCardPt) && tarotCardPt.length > 1000);
  assert.ok(Buffer.isBuffer(tarotCardEn) && tarotCardEn.length > 1000);

  // Testes de comandos em múltiplos idiomas:
  const trabalhoCmd = require('../src/commands/trabalho');
  const tarotCmd = require('../src/commands/tarot');
  const shipCmd = require('../src/commands/ship');
  const perfilCmd = require('../src/commands/perfil');
  const trocarCmd = require('../src/commands/trocar');
  const dailyCmd = require('../src/commands/daily');
  const votarCmd = require('../src/commands/votar');
  const agendaCmd = require('../src/commands/agenda');

  // 1. Trocar
  assert.ok(trocarCmd.data.description.length <= 100, 'Descrição do slash /trocar deve ter <= 100 caracteres');
  assert.ok(t('trade.proposalTitle', 'pt').includes('Proposta de Troca'), 'Trocar PT ok');
  assert.ok(t('trade.proposalTitle', 'en').includes('Trade Proposal'), 'Trocar EN ok');

  // 2. Trabalho
  assert.ok(trabalhoCmd.data.description.length <= 100, 'Descrição do slash /trabalho deve ter <= 100 caracteres');
  assert.ok(t('workMinigame.successTitle', 'pt', { profession: 'Programador' }).includes('Concluído'), 'Trabalho PT ok');
  assert.ok(t('workMinigame.successTitle', 'en', { profession: 'Programmer' }).includes('Completed'), 'Trabalho EN ok');

  // 3. Tarot
  assert.ok(tarotCmd.data.description.length <= 100, 'Descrição do slash /tarot deve ter <= 100 caracteres');
  const tarotEmbedPt = tarotCmd.buildTarotEmbed({ card: mockTarotCard, orientation: 'UPRIGHT', paid: false }, 'pt');
  const tarotEmbedEn = tarotCmd.buildTarotEmbed({ card: mockTarotCard, orientation: 'REVERSED', paid: false }, 'en');
  assert.ok(tarotEmbedPt.data.description.includes('CARTA'), 'Tarot PT deve conter CARTA');
  assert.ok(tarotEmbedEn.data.description.includes('CARD'), 'Tarot EN deve conter CARD');

  // 4. Ship
  assert.ok(shipCmd.data.description.length <= 100, 'Descrição do slash /ship deve ter <= 100 caracteres');
  const shipEmbedPt = shipCmd.buildShipEmbed(mockMemberA, mockMemberB, 80, 'pt');
  const shipEmbedEn = shipCmd.buildShipEmbed(mockMemberA, mockMemberB, 80, 'en');
  assert.ok(shipEmbedPt.data.description.includes('NOME DO CASAL'), 'Ship PT deve conter NOME DO CASAL');
  assert.ok(shipEmbedEn.data.description.includes('COUPLE NAME'), 'Ship EN deve conter COUPLE NAME');

  // 5. Perfil
  assert.ok(perfilCmd.data.description.length <= 100, 'Descrição do slash /perfil deve ter <= 100 caracteres');
  const mockTargetUser = { id: 'test-user-1', username: 'TestUser', displayName: 'TestUser', displayAvatarURL: () => 'https://example.com/avatar.png' };
  const titlesViewPt = perfilCmd.buildTitlesView(mockTargetUser, 'viewer-1', 'pt');
  const titlesViewEn = perfilCmd.buildTitlesView(mockTargetUser, 'viewer-1', 'en');
  assert.ok(titlesViewPt.embeds[0].data.title.includes('Galeria de Títulos'), 'Títulos PT ok');
  assert.ok(titlesViewEn.embeds[0].data.title.includes('Titles Gallery'), 'Títulos EN ok');

  const themesViewPt = perfilCmd.buildThemesView(mockTargetUser, 'viewer-1', 'pt');
  const themesViewEn = perfilCmd.buildThemesView(mockTargetUser, 'viewer-1', 'en');
  assert.ok(themesViewPt.embeds[0].data.title.includes('Temas & Cores'), 'Temas PT ok');
  assert.ok(themesViewEn.embeds[0].data.title.includes('Themes & Colors'), 'Temas EN ok');

  // 6. Daily & Votar
  const dailyPt = dailyCmd.buildDailyView('test-user-1', 'pt');
  const dailyEn = dailyCmd.buildDailyView('test-user-1', 'en');
  assert.ok(dailyPt.embeds[0].data.title.length > 0);
  assert.ok(dailyEn.embeds[0].data.title.length > 0);

  const votePt = votarCmd.buildVoteView('pt');
  const voteEn = votarCmd.buildVoteView('en');
  assert.ok(votePt.embeds[0].data.title.includes('Vote na Pyxie'), 'Vote PT ok');
  assert.ok(voteEn.embeds[0].data.title.includes('Vote for Pyxie'), 'Vote EN ok');

  // 7. Agenda
  const agendaEmbedPt = agendaCmd.buildAgendaEmbed(null, Date.now(), 'pt');
  const agendaEmbedEn = agendaCmd.buildAgendaEmbed(null, Date.now(), 'en');
  assert.ok(agendaEmbedPt.data.title.includes('Agenda de Automações'), 'Agenda PT ok');
  assert.ok(agendaEmbedEn.data.title.includes('Automation Schedule'), 'Agenda EN ok');
  // 8. Loja e Inventário:
  const lojaCmd = require('../src/commands/loja');
  const inventarioCmd = require('../src/commands/inventario');

  const shopEmbedPt = lojaCmd.buildShopEmbed('bau', 'pt');
  const shopEmbedEn = lojaCmd.buildShopEmbed('bau', 'en');
  assert.ok(shopEmbedPt.data.title.includes('Lojinha'), 'Loja PT ok');
  assert.ok(shopEmbedEn.data.title.includes('Shop'), 'Loja EN ok');

  const invEmbedPt = inventarioCmd.buildInventoryEmbed('user-1', 'Aventureiro', null, 'pt');
  const invEmbedEn = inventarioCmd.buildInventoryEmbed('user-1', 'Adventurer', null, 'en');
  assert.ok(invEmbedPt.data.title.includes('Mochila'), 'Inventario PT ok');
  assert.ok(invEmbedEn.data.title.includes('Backpack'), 'Inventario EN ok');

  // 9. Emojis preview e busca:
  const emojisCmd = require('../src/commands/emojis');
  const { createEmojiOption } = require('../src/utils/serverEmojis');
  const mockEmojiObj = { id: '1548444149785694238', name: 'pinkeing', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif' };
  const optionRes = createEmojiOption(mockEmojiObj);
  assert.equal(optionRes.emoji.id, '1548444149785694238', 'Select menu option deve conter ID do emoji customizado');
  assert.equal(optionRes.emoji.animated, true, 'Select menu option deve preservar flag animated');

  const previewEmbed = emojisCmd.buildEmojiPreview(null, mockEmojiObj, 'pt');
  assert.ok(previewEmbed.data.description.includes('<a:pinkeing:1548444149785694238>'), 'Preview embed deve renderizar o emoji formatado no corpo');
  assert.equal(previewEmbed.data.thumbnail.url, mockEmojiObj.url, 'Preview embed deve definir o thumbnail com a URL do emoji');

  // 10. Teste de Configuração Dinâmica de Emojis e Resolução em Tempo Real
  const { getEmoji, reloadEmojiConfig } = require('../src/utils/appEmojis');
  const { getEconomyConfig, setEconomyConfig } = require('../src/services/database');
  
  // Custom emoji test
  const customCoin = getEmoji('COIN');
  assert.ok(customCoin && customCoin.length > 0, 'getEmoji("COIN") deve retornar representação válida do emoji');
  
  // Regra 4: Teste de proteção contra portal de Minecraft
  const portalTest = getEmoji('PORTAL');
  assert.ok(!portalTest.includes('1548444170488778954'), 'Emoji de portal não pode conter o ID banido do Minecraft');
  assert.ok(portalTest.includes('1551355962974273546') || portalTest === '✨', 'Emoji de portal deve resolver para o mapa canônico da Pyxie');

  // 11. Teste de Persistência de Economia (Mínimo e Máximo)
  const savedEco = setEconomyConfig(80, 500);
  assert.equal(savedEco.minimum, 80, 'Economia mínima deve ser persistida');
  assert.equal(savedEco.maximum, 500, 'Economia máxima deve ser persistida');
  const readEco = getEconomyConfig();
  assert.equal(readEco.minimum, 80, 'Economia mínima deve ser lida do banco');
  assert.equal(readEco.maximum, 500, 'Economia máxima deve ser lida do banco');

  // 12. Teste de Resolução de Comandos Slash e Prevenção de ReferenceError
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
  assert.ok(
    indexSource.includes('const command = commandsByName.get(interaction.commandName);'),
    'index.js deve definir a variável command a partir de commandsByName.get(interaction.commandName)'
  );
  const { commandsByName } = require('../src/commands');
  assert.ok(commandsByName.get('py-tarot'), 'commandsByName deve resolver py-tarot');
  assert.ok(commandsByName.get('py-admin'), 'commandsByName deve resolver py-admin');
  assert.ok(commandsByName.get('py-wiki'), 'commandsByName deve resolver py-wiki');

  const { execFileSync } = require('node:child_process');
  execFileSync(process.execPath, ['--check', path.join(__dirname, '..', 'server.js')]);
  execFileSync(process.execPath, ['--check', path.join(__dirname, '..', 'index.js')]);

  const { lockFilePath: exportedLockPath, isProcessAlive } = require('../src/utils/botUtils');
  assert.equal(exportedLockPath, lockFile, 'lockFilePath exportado deve apontar para .botmelody.lock');
  assert.equal(isProcessAlive(process.pid), true, 'O processo atual deve ser detectado como vivo.');
  assert.equal(isProcessAlive(-1), false, 'PID inválido deve ser detectado como não vivo.');
  assert.equal(isProcessAlive(99999999), false, 'PID inexistente deve ser detectado como não vivo.');

  releaseBotLock();
  assert.equal(fs.existsSync(lockFile), false, 'O lock deve ser removido ao encerrar.');

  console.log('Verificação do lock, banco, prefixo padrão, sintaxe do servidor, internacionalização (i18n), emojis e ajuda: OK');
} finally {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }

  if (fs.existsSync(prefixFile)) {
    fs.unlinkSync(prefixFile);
  }

  fs.writeFileSync(settingsFile, originalSettings, 'utf8');
  fs.writeFileSync(economyFile, originalEconomy, 'utf8');
}

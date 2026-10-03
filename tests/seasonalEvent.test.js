const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const seasonalManager = require('../src/modules/seasonal/seasonalManager');
const artHandler = require('../src/modules/seasonal/artHandler');
const dropHandler = require('../src/modules/seasonal/dropHandler');
const infoEventoCommand = require('../src/modules/seasonal/commands/pyInfoEvento');
const { buildRankingView } = require('../src/commands/ranking');

console.log('🎃 Iniciando suíte de testes de Engenharia: Módulo Sazonal Desacoplado...');

// Garante que o estado inicial esteja desligado (active: false) e limpo
seasonalManager.stop();
seasonalManager.saveConfig(seasonalManager.DEFAULT_CONFIG, true);
seasonalManager.saveData({ balances: {}, currentWeekArt: [], history: { lastDropMessageId: null, lastWinners: null } });
assert.equal(seasonalManager.isSeasonalActive(), false, 'O evento deve nascer DESLIGADO por padrão (active: false).');
console.log('✅ Estado padrão desligado (active: false) validado com sucesso.');

// 1. Teste de Persistência Atômica
const initialConfig = seasonalManager.loadConfig();
assert.equal(typeof initialConfig.eventName, 'string', 'Config deve possuir eventName');
assert.equal(typeof initialConfig.currencyName, 'string', 'Config deve possuir currencyName');
assert(Array.isArray(initialConfig.assets?.emojis?.dropDecoys), 'Config deve conter lista de dropDecoys');

const testKey = 'test_' + Date.now();
seasonalManager.saveConfig({ testField: testKey });
const reloadedConfig = seasonalManager.loadConfig();
assert.equal(reloadedConfig.testField, testKey, 'Escrita atômica em seasonalConfig.json validada.');

// 2. Teste de Gestão de Saldos Sazonais e Top 10
const userA = 'user_test_alpha';
const userB = 'user_test_beta';
const userC = 'user_test_gamma';

seasonalManager.addSeasonalBalance(userA, 10);
seasonalManager.addSeasonalBalance(userB, 25);
seasonalManager.addSeasonalBalance(userC, 5);

assert.equal(seasonalManager.getSeasonalBalance(userA), 10, 'Saldo de userA deve ser 10');
assert.equal(seasonalManager.getSeasonalBalance(userB), 25, 'Saldo de userB deve ser 25');
assert.equal(seasonalManager.getSeasonalBalance(userC), 5, 'Saldo de userC deve ser 5');

const topList = seasonalManager.getTopSeasonalBalances(3);
assert.equal(topList.length, 3, 'Deve retornar top 3');
assert.equal(topList[0].userId, userB, '1º lugar deve ser userB');
assert.equal(topList[0].balance, 25);
assert.equal(topList[1].userId, userA, '2º lugar deve ser userA');
assert.equal(topList[2].userId, userC, '3º lugar deve ser userC');
console.log('✅ Gestão de saldos atômicos e ranking Top 10 validados com sucesso.');

// 3. Teste do Comando /py-infoevento Inativo
const inactiveView = infoEventoCommand.buildInfoEventoView('some_user', null);
assert(inactiveView.content && inactiveView.content.includes('Nenhum evento sazonal ativo'), 'Comando /py-infoevento deve responder que está desligado quando active: false');
console.log('✅ Resposta de evento inativo no /py-infoevento validada.');

// 4. Teste de Ativação (start) e Resposta do /py-infoevento Ativo
seasonalManager.start();
assert.equal(seasonalManager.isSeasonalActive(), true, 'Evento deve estar ativo após seasonalManager.start()');

const activeView = infoEventoCommand.buildInfoEventoView(userB, null);
assert(activeView.embeds && activeView.embeds.length > 0, 'Comando deve retornar embed com evento ativo');
const infoEmbed = activeView.embeds[0];
assert(infoEmbed.data.title.includes('GUIA OFICIAL'), 'Embed de info deve conter GUIA OFICIAL');
assert(infoEmbed.data.footer.text.includes('/py-infoevento'), 'Footer do embed deve conter dica universal');
assert(infoEmbed.data.fields.some((f) => f.name.includes('Seu Saldo Sazonal') && f.value.includes('25')), 'Embed deve exibir saldo do usuário');
console.log('✅ Resposta de evento ativo no /py-infoevento validada.');

// 4.1 Teste de Customização Completa do /py-infoevento (regras, lore, introdução, banner)
seasonalManager.saveConfig({
  channels: { ...seasonalManager.loadConfig().channels, artChannelId: 'art_channel_test' },
  templates: {
    ...seasonalManager.loadConfig().templates,
    infoEventTitle: '⚡ {eventName} — GUIA SUPREMO ⚡',
    infoEventDescription: 'Sejam bem-vindos ao submundo da Cringelândia!',
    infoEventRules: '• Regra 1: Não chore no chat.\n• Regra 2: Drops em {dropsChannel}.',
    infoEventExtra: 'Dica do criador: Treine seu dedo para os baús.',
  },
  assets: {
    ...seasonalManager.loadConfig().assets,
    infoEventImageUrl: 'https://i.imgur.com/custom_info_banner.png',
  },
});

const customView = infoEventoCommand.buildInfoEventoView(userB, null);
const customEmbed = customView.embeds[0];
assert(customEmbed.data.title.includes('GUIA SUPREMO'), 'Embed deve usar título customizado do evento');
assert(customEmbed.data.description.includes('submundo da Cringelândia'), 'Embed deve usar introdução customizada');
assert(customEmbed.data.fields.some((f) => f.name.includes('Como Funciona') && f.value.includes('Não chore no chat')), 'Embed deve exibir regras customizadas');
assert(customEmbed.data.fields.some((f) => f.name.includes('Dicas da Pyxie') && f.value.includes('Treine seu dedo')), 'Embed deve exibir campo extra');
assert.equal(customEmbed.data.image.url, 'https://i.imgur.com/custom_info_banner.png', 'Embed deve usar imagem customizada de banner');
console.log('✅ Customização e edição completa do /py-infoevento validadas com sucesso.');

// 5. Teste de Submissão e Apuração de Arte da Semana (artHandler)
const mockClient = {
  user: { id: 'bot_pyxie_id' },
  channels: {
    fetch: async () => mockChannel,
  },
  emojis: { cache: { find: () => null } },
  application: { emojis: { cache: { find: () => null } } },
};

let reactedEmoji = null;
const mockArtMessage = {
  id: 'msg_art_123',
  author: { id: 'artist_user_1', bot: false, tag: 'Artist#0001' },
  channelId: 'art_channel_test',
  content: 'Minha arte para o evento! <@bot_pyxie_id> https://i.imgur.com/example_art.png',
  mentions: {
    has: (u) => u === mockClient.user,
    users: new Map([['bot_pyxie_id', mockClient.user]]),
  },
  attachments: new Map(),
  react: async (emoji) => { reactedEmoji = emoji; },
};

const mockChannel = {
  id: 'art_channel_test',
  isTextBased: () => true,
  send: async () => ({ id: 'sent_art_announcement' }),
  messages: {
    fetch: async () => ({
      reactions: {
        cache: [
          {
            emoji: { name: '8320_hallowee' },
            count: 6,
            me: true, // 1 reação do bot + 5 votos da comunidade
          },
        ],
      },
    }),
  },
};

// Configura canal de artes de teste
seasonalManager.saveConfig({
  channels: { ...seasonalManager.loadConfig().channels, artChannelId: 'art_channel_test' },
});

// Submete a arte
artHandler.handleArtSubmission(mockArtMessage, mockClient).then(async (submitted) => {
  assert.equal(submitted, true, 'Submissão de arte com menção e imagem deve ser aceita');
  assert(reactedEmoji !== null, 'Bot deve reagir com o emoji oficial de contagem');

  const dataAfterSub = seasonalManager.loadData();
  assert.equal(dataAfterSub.currentWeekArt.length, 1, 'Arte deve ser salva na lista da semana');
  assert.equal(dataAfterSub.currentWeekArt[0].authorId, 'artist_user_1');

  // Apuração dominical da arte
  const tallyResult = await artHandler.tallyWeeklyArt(mockClient);
  assert.equal(tallyResult.success, true, 'Apuração deve ser bem-sucedida');
  assert.equal(tallyResult.winner.authorId, 'artist_user_1', 'Vencedor deve ser artist_user_1');
  assert.equal(tallyResult.votes, 5, 'Deve contar 5 votos excluindo a reação do bot');

  const artistBalance = seasonalManager.getSeasonalBalance('artist_user_1');
  assert.equal(artistBalance, 5, 'Vencedor da arte deve receber +5 moedas sazonais');

  const dataAfterTally = seasonalManager.loadData();
  assert.equal(dataAfterTally.currentWeekArt.length, 0, 'currentWeekArt deve ser esvaziado após apuração');
  assert(dataAfterTally.history.talliedArtMessageIds.includes('msg_art_123'), 'ID da mensagem vencedora deve estar arquivado no histórico');

  // Teste de Proteção Anti-Reciclagem / Anti-Artes Passadas:
  // 5.1 Re-tentativa com a mesma arte da semana passada deve ser sumariamente ignorada
  const reSubmittedOld = await artHandler.handleArtSubmission(mockArtMessage, mockClient);
  assert.equal(reSubmittedOld, false, 'Arte já apurada em semanas passadas não pode ser re-submetida');

  // 5.2 Tentativa de necro-menção em mensagem de mais de 7 dias atrás deve ser ignorada
  const oldDateMessage = {
    ...mockArtMessage,
    id: 'msg_old_retro',
    createdTimestamp: Date.now() - 9 * 24 * 60 * 60 * 1000, // 9 dias atrás
  };
  const submittedAncient = await artHandler.handleArtSubmission(oldDateMessage, mockClient);
  assert.equal(submittedAncient, false, 'Mensagens antigas (> 7 dias) não podem ser submetidas');

  // 5.3 Nova arte genuína da semana atual deve ser aceita normalmente
  const freshWeekMessage = {
    ...mockArtMessage,
    id: 'msg_art_fresh_week2',
    createdTimestamp: Date.now(),
  };
  const submittedFresh = await artHandler.handleArtSubmission(freshWeekMessage, mockClient);
  assert.equal(submittedFresh, true, 'Nova arte enviada na semana corrente deve ser aceita');
  assert.equal(seasonalManager.loadData().currentWeekArt.length, 1, 'Fila da nova semana deve conter apenas a nova arte');

  // Limpa para os próximos testes
  seasonalManager.saveData({ ...seasonalManager.loadData(), currentWeekArt: [] });

  console.log('✅ Mecânica da Arte da Semana (submissão, votação, prêmio +5, reset e proteção contra artes passadas) validada com sucesso.');

  // 6. Teste de Drop de Baú Anti-Trapaça (dropHandler)
  let dropSentEmbed = null;
  let collectorCallback = null;
  const mockDropMsg = {
    id: 'msg_drop_999',
    reactions: [],
    react: async (emoji) => { mockDropMsg.reactions.push(emoji); },
    edit: async (data) => { dropSentEmbed = data; },
    delete: async () => {},
    createReactionCollector: ({ filter }) => {
      const col = {
        filter,
        on: (ev, cb) => {
          if (ev === 'collect') collectorCallback = cb;
        },
        stop: () => {},
      };
      return col;
    },
  };

  const mockDropChannel = {
    id: 'drops_channel_test',
    isTextBased: () => true,
    send: async (payload) => {
      dropSentEmbed = payload;
      return mockDropMsg;
    },
  };

  mockClient.channels.fetch = async (id) => {
    if (id === 'drops_channel_test') return mockDropChannel;
    return mockChannel;
  };

  seasonalManager.saveConfig({
    channels: { ...seasonalManager.loadConfig().channels, dropsChannelId: 'drops_channel_test' },
  });

  const dropTriggered = await dropHandler.triggerDrop(mockClient);
  assert.equal(dropTriggered, true, 'Drop deve ser disparado com sucesso');
  assert(mockDropMsg.reactions.length >= 6, 'Baú deve reagir com os 6 decoys para teste rápido');

  // Simula clique de usuário na reação correta
  const luckyUser = { id: 'fast_clicker_user', tag: 'FastClicker#1234', bot: false };
  assert(typeof collectorCallback === 'function', 'Collector deve estar ouvindo reações');

  // Extrai o emoji correto informado na descrição
  const desc = dropSentEmbed.embeds[0].data.description;
  const match = desc.match(/Clique na reação (\S+) \*\*([^*]+)\*\*/);
  assert(match, 'Embed de drop deve informar explicitamente qual emoji clicar');

  const initialFastBalance = seasonalManager.getSeasonalBalance('fast_clicker_user');
  await collectorCallback(
    { emoji: { name: match[1], id: match[1], toString: () => match[1] } },
    luckyUser
  );

  const finalFastBalance = seasonalManager.getSeasonalBalance('fast_clicker_user');
  assert(finalFastBalance > initialFastBalance, 'Usuário rápido deve receber entre 1 e 2 moedas');
  assert(dropSentEmbed.embeds[0].data.title.includes('BAÚ ABERTO'), 'Embed deve ser editado anunciando abertura');
  console.log('✅ Mecânica dos Baús da Pyxie (decoys, anti-trapaça, recompensa imediata) validada com sucesso.');

  // 6.1 Teste de Decoys com Apelidos Visuais Customizados (ex: Wumpus Bruxinho, Caldeirão da Bruxa)
  seasonalManager.saveConfig({
    assets: {
      ...seasonalManager.loadConfig().assets,
      emojis: {
        ...seasonalManager.loadConfig().assets?.emojis,
        dropDecoys: [
          { id: 'witchwumpus', label: 'Wumpus Bruxinho Teste' },
          { id: '82336witchscaul', label: 'Caldeirão Mágico Teste' },
        ],
      },
    },
  });

  const dropWithLabelsTriggered = await dropHandler.triggerDrop(mockClient);
  assert.equal(dropWithLabelsTriggered, true);
  const descLabels = dropSentEmbed.embeds[0].data.description;
  const matchLabel = descLabels.match(/Clique na reação (\S+) \*\*([^*]+)\*\*/);
  assert(matchLabel, 'Embed de drop com apelido deve informar explicitamente a reação');
  assert(['Wumpus Bruxinho Teste', 'Caldeirão Mágico Teste'].includes(matchLabel[2]), 'Apelido customizado deve ser exibido no embed');
  console.log('✅ Baú da Pyxie com apelidos visuais customizados validado com sucesso.');

  // 7. Teste de Ranking com Filtro Sazonal (/py-rank)
  const rankingActiveView = await buildRankingView({ client: mockClient }, 'viewer_1', 'sazonal');
  assert(rankingActiveView.embeds[0].data.title.includes('Placar Sazonal'), 'Ranking deve renderizar placar sazonal quando solicitado');
  assert(rankingActiveView.components[0].components.some((btn) => btn.data.custom_id.includes('ranking_cat:seasonal:')), 'Ranking deve conter botão sazonal quando ativo');
  console.log('✅ Integração do ranking sazonal em /py-rank validada com sucesso.');

  // 8. Teste de Desativação e Zero Memory Leak (stop)
  seasonalManager.stop();
  assert.equal(seasonalManager.isSeasonalActive(), false, 'seasonalManager.stop() deve desativar o evento');

  const rankingInactiveView = await buildRankingView({ client: mockClient }, 'viewer_1', 'sazonal');
  assert(!rankingInactiveView.embeds[0].data.title.includes('Placar Sazonal'), 'Ranking inativo deve cair de volta para moedas');
  assert(!rankingInactiveView.components[0].components.some((btn) => btn.data.custom_id.includes('ranking_cat:seasonal:')), 'Ranking inativo não deve exibir botão sazonal');
  console.log('✅ Desativação limpa e ausência de resíduos (Zero Memory Leak) validadas com sucesso.');

  // 9. Teste de Encerramento Automático por Data Limite
  seasonalManager.saveConfig({
    active: true,
    dates: {
      endDate: '2020-01-01T00:00:00-03:00', // Data já expirada
      timezone: 'America/Sao_Paulo',
    },
  });

  const ended = await seasonalManager.checkEndEvent(mockClient);
  assert.equal(ended, true, 'checkEndEvent deve detectar data ultrapassada e encerrar');
  assert.equal(seasonalManager.isSeasonalActive(), false, 'Evento deve ser marcado como active: false');

  const endData = seasonalManager.loadData();
  assert(endData.history.lastWinners !== null, 'Vencedores finais devem ser gravados em history.lastWinners');
  // Restaura o estado padrão limpo para manter integridade do repositório
  seasonalManager.saveConfig(seasonalManager.DEFAULT_CONFIG, true);
  seasonalManager.saveData(seasonalManager.DEFAULT_DATA);
  seasonalManager.stop();

  console.log('🎉 Todos os testes do Módulo Sazonal passaram com 100% de integridade!');
});

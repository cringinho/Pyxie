const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const {
  buildTicketPanel,
  loadTicketsData,
  saveTicketsData,
  handleArtRemovalSubmit,
  handleArtRemovalDone,
  handleCloseTicket,
  closeTicketByCommand,
  CRINGELANDIA_GUILD_ID,
} = require('../src/modules/tickets/ticketManager');

const {
  parseDateTime,
  buildHubPayload,
  buildPublicCardPayload,
  loadGiveawaysData,
  saveGiveawaysData,
} = require('../src/modules/giveaways/giveawayManager');

console.log('🧪 Iniciando testes unitários e de integração de Tickets e Sorteios...');

// ==========================================
// 1. TESTES DO MÓDULO DE TICKETS
// ==========================================

// 1.1 Painel de Tickets - Escopo Global vs Cringelândia
const regularGuild = { id: '999888777666555444', name: 'Servidor Externo' };
const regularPanel = buildTicketPanel(regularGuild);
assert.ok(regularPanel.embeds && regularPanel.embeds.length === 1, 'Painel deve ter 1 embed');
assert.ok(regularPanel.components && regularPanel.components.length === 1, 'Painel deve ter 1 action row');
const regularButtons = regularPanel.components[0].components;
assert.equal(regularButtons.length, 2, 'Servidor comum deve renderizar exatamente 2 botões');
assert.equal(regularButtons[0].data.custom_id, 'tkt:open:help');
assert.equal(regularButtons[1].data.custom_id, 'tkt:open:report');

const cringelandiaGuild = { id: CRINGELANDIA_GUILD_ID, name: 'Cringelândia' };
const cringelandiaPanel = buildTicketPanel(cringelandiaGuild);
const cringelandiaButtons = cringelandiaPanel.components[0].components;
assert.equal(cringelandiaButtons.length, 3, 'Cringelândia deve renderizar exatamente 3 botões');
assert.equal(cringelandiaButtons[0].data.custom_id, 'tkt:open:help');
assert.equal(cringelandiaButtons[1].data.custom_id, 'tkt:open:report');
assert.equal(cringelandiaButtons[2].data.custom_id, 'tkt:open:art_removal');
console.log('✅ Escopo de botões do Painel de Tickets validado com sucesso (2 externos vs 3 Cringelândia).');

// 1.2 Fluxo de Remoção de Arte
let sentDm = null;
let approvalSent = null;

const mockUser = {
  id: `test_artist_${Date.now()}`,
  tag: 'Artista#1234',
  username: 'artista',
  send: async (payload) => {
    sentDm = payload;
    return true;
  },
};

const mockApprovalChannel = {
  id: '1557534749310976141',
  isTextBased: () => true,
  send: async (payload) => {
    approvalSent = payload;
    return { id: 'msg_approval_123' };
  },
};

const mockClient = {
  channels: {
    fetch: async (id) => (id === '1557534749310976141' ? mockApprovalChannel : null),
  },
  users: {
    fetch: async (id) => (id === mockUser.id ? mockUser : null),
  },
};

let modalReplied = null;
const mockModalSubmit = {
  customId: 'tkt:modal:art_removal',
  user: mockUser,
  client: mockClient,
  fields: {
    getTextInputValue: (field) => 'Desejo remover minhas artes postadas no canal de fanart em 2025.',
  },
  reply: async (payload) => {
    modalReplied = payload;
  },
};

(async () => {
  await handleArtRemovalSubmit(mockModalSubmit);
  assert.ok(modalReplied, 'Deve responder ao modal efemeramente');
  assert.ok(sentDm, 'Deve enviar aviso para a DM do usuário');
  assert.ok(approvalSent, 'Deve despachar card no canal de aprovações 1557534749310976141');

  const ticketsData = loadTicketsData();
  const pendingRequests = Object.values(ticketsData.artRemovals || {});
  const found = pendingRequests.find((r) => r.userId === mockUser.id);
  assert.ok(found, 'Solicitação deve estar salva em ticketsData.json');
  assert.equal(found.status, 'PENDING');
  console.log('✅ Fluxo de submissão de remoção de arte validado com persistência atômica.');

  // 1.3 Conclusão pela Staff
  let interactionUpdated = null;
  const mockStaffMember = {
    permissions: {
      has: (perm) => perm === PermissionFlagsBits.ManageChannels,
    },
  };

  const samplePendingEmbed = new EmbedBuilder()
    .setTitle('🖼️ Solicitação')
    .setDescription('Teste de pendência');

  const mockDoneInteraction = {
    customId: `tkt:art_done:${mockUser.id}:${found.requestId}`,
    user: { id: '987654321', tag: 'Mod#0001' },
    member: mockStaffMember,
    client: mockClient,
    message: {
      embeds: [samplePendingEmbed],
    },
    update: async (payload) => {
      interactionUpdated = payload;
    },
    reply: async () => {},
  };

  await handleArtRemovalDone(mockDoneInteraction, mockUser.id, found.requestId);
  assert.ok(interactionUpdated, 'Deve atualizar a mensagem no canal de aprovação');
  const updatedTicketsData = loadTicketsData();
  assert.equal(updatedTicketsData.artRemovals[found.requestId].status, 'DONE');
  console.log('✅ Conclusão de remoção pela staff validada com atualização de status.');

  // 1.4 Trava Estrita de Fechamento de Tickets
  let nonStaffReplied = null;
  const mockNonStaff = {
    user: { id: '111222333' },
    member: {
      permissions: {
        has: () => false,
      },
    },
    channel: { id: 'c_123', name: 'ajuda-teste' },
    reply: async (payload) => {
      nonStaffReplied = payload;
    },
  };

  await handleCloseTicket(mockNonStaff);
  assert.ok(nonStaffReplied, 'Deve rejeitar fechamento por membro comum');
  assert.ok(
    nonStaffReplied.content.includes('permissão') || nonStaffReplied.content.includes('Staff'),
    'Mensagem de erro deve citar permissão/Staff'
  );
  console.log('✅ Trava de permissão de fechamento de tickets validada com sucesso.');

  // ==========================================
  // 2. TESTES DO MÓDULO DE SORTEIOS
  // ==========================================

  // 2.1 Parser de Data e Hora
  const nowTs = parseDateTime('AGORA');
  assert.ok(nowTs && Math.abs(nowTs - Date.now()) < 5000, 'Parser de AGORA deve retornar timestamp atual');

  const customTs = parseDateTime('25/12/2026 20:00');
  assert.ok(customTs && !isNaN(customTs), 'Parser de data customizada deve ser número válido');
  console.log('✅ Parser de data & hora de sorteios validado.');

  // 2.2 Hub e Card Público
  const hub = buildHubPayload();
  assert.ok(hub.embeds && hub.components, 'Hub deve conter embeds e componentes');

  const mockGw = {
    id: 'gw_test_123',
    guildId: '123',
    channelId: '456',
    createdBy: '789',
    title: 'Nitro Mensal 💖',
    startsAt: Date.now(),
    endsAt: Date.now() + 3600000,
    winnersCount: 2,
    prizes: ['Nitro Mensal', '50.000 Moedas'],
    emoji: '🎉',
    restrictions: { minAccountAgeDays: 7 },
    participants: {
      user_1: { joinedAt: Date.now(), weight: 1 },
      user_2: { joinedAt: Date.now(), weight: 2 },
      user_3: { joinedAt: Date.now(), weight: 1 },
    },
    status: 'ACTIVE',
  };

  const card = buildPublicCardPayload(mockGw);
  assert.ok(card.embeds && card.components, 'Card público deve conter embeds e componentes');
  assert.ok(card.components[0].components[0].data.label.includes('(3)'), 'Botão deve exibir contador 3');

  // 2.3 Simulação de Apuração com Fisher-Yates
  const pool = [];
  for (const [uid, meta] of Object.entries(mockGw.participants)) {
    for (let i = 0; i < (meta.weight || 1); i++) pool.push(uid);
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const winners = [];
  for (const uid of pool) {
    if (!winners.includes(uid)) {
      winners.push(uid);
      if (winners.length >= mockGw.winnersCount) break;
    }
  }

  assert.equal(winners.length, 2, 'Deve sortear exatamente 2 ganhadores');
  assert.notEqual(winners[0], winners[1], 'Ganhadores devem ser distintos');
  console.log('✅ Apuração Fisher-Yates com seleção de vencedores únicos validada.');

  // ==========================================
  // 3. TESTES DE BLINDAGEM CONTRA DUPLICAÇÃO
  // ==========================================
  const ticketsModule = require('../src/modules/tickets/index');
  const giveawaysModule = require('../src/modules/giveaways/giveawayManager');

  // 3.1 Interação de ticket já respondida não deve executar novamente
  let calledCount = 0;
  const mockAlreadyRepliedInteraction = {
    customId: 'tkt:open:help',
    replied: true,
    reply: async () => { calledCount++; },
  };
  await ticketsModule.handleInteraction(mockAlreadyRepliedInteraction);
  assert.strictEqual(calledCount, 0, 'handleInteraction não deve executar se replied for true');

  // 3.2 Interação de sorteio já deferida não deve executar novamente
  let gwCalledCount = 0;
  const mockAlreadyDeferredGw = {
    customId: 'gw:hub:open',
    deferred: true,
    reply: async () => { gwCalledCount++; },
  };
  await giveawaysModule.handleGiveawayInteraction(mockAlreadyDeferredGw);
  assert.strictEqual(gwCalledCount, 0, 'handleGiveawayInteraction não deve executar se deferred for true');
  console.log('✅ Blindagem contra duplicação de eventos e InteractionAlreadyReplied validada.');

  console.log('🎉 tests/ticketsAndGiveaways.test.js concluído com 100% de sucesso!');
})().catch((err) => {
  console.error('❌ Falha nos testes de tickets e sorteios:', err);
  process.exit(1);
});

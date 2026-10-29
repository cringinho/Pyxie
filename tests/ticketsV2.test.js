const assert = require('node:assert');
const { PermissionFlagsBits, ChannelType } = require('discord.js');
const tm = require('../src/modules/tickets/ticketManager');
const { getTicketConfig, setTicketConfig } = require('../src/services/guildConfigService');
const { TRANSLATIONS } = require('../src/utils/i18n');

console.log('🧪 Iniciando testes do Módulo de Tickets 2.0 (assumir, fechar, transcrição, registros e painel)...');

const TEST_GUILD = `9${Date.now()}`.slice(0, 18);
const CRING = tm.CRINGELANDIA_GUILD_ID;
const staffPerms = { has: (p) => p === PermissionFlagsBits.ManageChannels };
const memberPerms = { has: () => false };

function collection(items) {
  const map = new Map(items.map((i) => [i.id, i]));
  map.filter = (fn) => {
    const out = new Map();
    for (const [k, v] of map) if (fn(v)) out.set(k, v);
    return out;
  };
  return map;
}

function makeChannel(id, sentLog) {
  const messages = [];
  return {
    id,
    isTextBased: () => true,
    send: async (payload) => {
      sentLog.push({ channel: id, payload });
      const msg = { id: `m_${id}_${messages.length}`, createdTimestamp: Date.now(), author: { tag: 'Pyxie#0001' }, content: payload.content || '', embeds: payload.embeds || [], attachments: [] };
      messages.unshift(msg);
      return msg;
    },
    messages: {
      fetch: async () => {
        const map = new Map(messages.map((m) => [m.id, m]));
        map.size = messages.length;
        return map;
      },
      delete: async () => true,
    },
    delete: async () => { sentLog.push({ channel: id, deleted: true }); },
  };
}

(async () => {
  // 1. Paridade e conteúdo i18n do módulo
  const ptKeys = Object.keys(TRANSLATIONS.pt.tickets).sort();
  const enKeys = Object.keys(TRANSLATIONS.en.tickets).sort();
  assert.deepEqual(ptKeys, enKeys, 'Chaves tickets.* devem ser idênticas em PT e EN.');
  const allText = JSON.stringify(TRANSLATIONS.pt.tickets) + JSON.stringify(TRANSLATIONS.en.tickets);
  assert.ok(!/━|═|-{6,}/.test(allText), 'Textos de tickets não podem usar divisores ASCII.');
  console.log('  ✅ 1. Strings de tickets bilíngues e sem divisores legados.');

  // 2. Painel no idioma do servidor, com rodapé contextual
  const enPanel = tm.buildTicketPanel({ id: '999888777666555444', name: 'Outer Space' });
  assert.equal(enPanel.embeds[0].data.title, TRANSLATIONS.en.tickets.panel_title);
  assert.equal(enPanel.embeds[0].data.footer.text, 'Pyxie • Outer Space');
  const ptPanel = tm.buildTicketPanel({ id: CRING, name: 'Cringelândia' });
  assert.equal(ptPanel.embeds[0].data.title, TRANSLATIONS.pt.tickets.panel_title);
  assert.equal(ptPanel.components[0].components.length, 3);
  assert.ok(ptPanel.embeds[0].data.description.includes('\n\n'), 'Itens do painel devem ter respiro \\n\\n.');
  console.log('  ✅ 2. Painel localizado (EN externo, PT Cringelândia) com rodapé do servidor.');

  // 3. Abertura numerada, limite por membro e registro da Staff
  const sent = [];
  const LOG_ID = `${TEST_GUILD}1`;
  const CAT_ID = `${TEST_GUILD}2`;
  setTicketConfig(TEST_GUILD, { ticketCategoryId: CAT_ID, ticketLogChannelId: LOG_ID, ticketPanelChannelId: null });
  const logChannel = makeChannel(LOG_ID, sent);
  const created = [];
  const guild = {
    id: TEST_GUILD,
    name: 'Guilda de Teste',
    client: { user: { id: 'bot' }, users: { fetch: async () => ({ send: async (p) => sent.push({ dm: true, payload: p }) }) } },
    roles: { cache: collection([]) },
    channels: {
      cache: collection([{ id: CAT_ID, type: ChannelType.GuildCategory }]),
      fetch: async (id) => (id === LOG_ID ? logChannel : guild.channels.cache.get(id) || null),
      create: async (opts) => {
        const ch = makeChannel(`${TEST_GUILD}9${created.length}`, sent);
        ch.name = opts.name;
        created.push(ch);
        guild.channels.cache.set(ch.id, ch);
        return ch;
      },
    },
  };
  const user = { id: `u${TEST_GUILD}`, username: 'Membro Teste', tag: 'membro#0001' };
  const replies = [];
  const openInteraction = (type) => ({
    guild,
    guildId: guild.id,
    user,
    member: { permissions: memberPerms },
    replied: false,
    deferred: false,
    reply: async (p) => replies.push(p),
    deferReply: async function () { this.deferred = true; },
    editReply: async (p) => replies.push(p),
  });

  await tm.handleOpenTicket(openInteraction('help'), 'help');
  assert.equal(created.length, 1, 'Deve criar a primeira sala.');
  assert.match(created[0].name, /^help-0001-membroteste$/, 'Sala deve ser numerada (#0001).');
  assert.ok(sent.some((s) => s.channel === LOG_ID), 'Abertura deve ser registrada no canal de logs da Staff.');

  await tm.handleOpenTicket(openInteraction('help'), 'help');
  assert.equal(created.length, 1, 'Não pode abrir duas salas do mesmo tipo.');
  await tm.handleOpenTicket(openInteraction('report'), 'report');
  assert.equal(created.length, 2);
  assert.match(created[1].name, /-0002-/);
  console.log('  ✅ 3. Salas numeradas, bloqueio de duplicata e registro de abertura.');

  // 4. Assumir: só Staff, uma vez
  const roomId = created[0].id;
  const claimReplies = [];
  await tm.handleClaimTicket({ user, member: { permissions: memberPerms }, guild, channel: created[0], reply: async (p) => claimReplies.push(p) }, roomId);
  assert.ok(claimReplies[0].content.includes('Staff'), 'Membro comum não pode assumir.');
  let updated = null;
  await tm.handleClaimTicket({
    user: { id: 'staff1', username: 'mod' },
    member: { permissions: staffPerms, displayName: 'Mod Ana' },
    guild,
    channel: created[0],
    update: async (p) => { updated = p; },
    followUp: async () => {},
  }, roomId);
  assert.ok(updated.components[0].components[0].data.disabled, 'Botão Assumir deve ficar desativado.');
  assert.equal(tm.loadTicketsData().tickets[Object.keys(tm.loadTicketsData().tickets).find((k) => tm.loadTicketsData().tickets[k].channelId === roomId)].claimedBy, 'staff1');
  console.log('  ✅ 4. Assumir atendimento restrito à Staff e persistido.');

  // 5. Fechar: autor pode, com confirmação; transcrição para logs e DM
  let prompt = null;
  await tm.handleCloseTicket({ user, member: { permissions: memberPerms }, guild, channel: created[0], reply: async (p) => { prompt = p; } }, roomId);
  assert.ok(prompt.components[0].components[0].data.custom_id.startsWith('tkt:close_confirm:'), 'Autor recebe confirmação.');
  let confirmUpdate = null;
  await tm.handleCloseConfirm({ user, member: { permissions: memberPerms }, guild, channel: created[0], update: async (p) => { confirmUpdate = p; } }, roomId);
  assert.ok(confirmUpdate, 'Confirmação deve atualizar a mensagem.');
  const logWithFile = sent.find((s) => s.channel === LOG_ID && s.payload.files && s.payload.files.length === 1);
  assert.ok(logWithFile, 'Registro de encerramento deve anexar a transcrição.');
  assert.ok(sent.some((s) => s.dm && s.payload.files?.length === 1), 'Autor recebe a transcrição na DM.');
  const closedTicket = Object.values(tm.loadTicketsData().tickets).find((tk) => tk.channelId === roomId);
  assert.equal(closedTicket.status, 'CLOSED');
  console.log('  ✅ 5. Fechamento pelo autor com confirmação, transcrição e registro.');

  // 6. Transcrição e duração formatadas
  const transcript = tm.formatTranscript(
    [{ createdTimestamp: Date.UTC(2026, 9, 22, 15, 0), author: { tag: 'ana' }, content: 'Oi', embeds: [], attachments: [{ url: 'https://x/y.png' }] }],
    { number: 7, guildName: 'G', authorTag: 'ana', lang: 'pt' }
  );
  assert.ok(transcript.includes('#0007') && transcript.includes('ana: Oi [anexo] https://x/y.png'));
  assert.equal(tm.formatDuration(72 * 60000), '1h 12min');
  assert.equal(tm.formatDuration(26 * 3600000), '1d 2h');
  console.log('  ✅ 6. Transcrição e duração formatadas.');

  // 7. Sala apagada manualmente libera o membro
  const reportRoom = created[1];
  assert.equal(tm.markTicketChannelDeleted(reportRoom), true);
  assert.equal(Object.values(tm.loadTicketsData().tickets).find((tk) => tk.channelId === reportRoom.id).closedBy, 'channel_deleted');
  console.log('  ✅ 7. Canal apagado manualmente encerra o registro.');

  // 8. Atualização do painel no lugar, sem postar mensagem nova
  const PANEL_CH = `${TEST_GUILD}7`;
  setTicketConfig(TEST_GUILD, { ticketPanelChannelId: PANEL_CH, ticketPanelMessageId: null });
  let edited = null;
  let posted = false;
  const oldPanel = {
    id: 'old_panel_msg',
    author: { id: 'bot' },
    components: [{ components: [{ customId: 'tkt:open:help' }] }],
    edit: async (p) => { edited = p; },
  };
  const panelChannel = {
    isTextBased: () => true,
    send: async () => { posted = true; },
    messages: { fetch: async () => new Map([[oldPanel.id, oldPanel]]) },
  };
  const client = {
    user: { id: 'bot' },
    guilds: { cache: new Map([[TEST_GUILD, { id: TEST_GUILD, name: 'Guilda de Teste', channels: { fetch: async () => panelChannel } }]]) },
  };
  const originalLog = console.log;
  console.log = () => {};
  const summary = await tm.refreshTicketPanels(client);
  console.log = originalLog;
  assert.equal(summary.updated, 1);
  assert.ok(edited && !posted, 'Painel antigo deve ser editado no lugar, sem nova mensagem.');
  assert.equal(getTicketConfig(TEST_GUILD).ticketPanelMessageId, 'old_panel_msg', 'ID do painel encontrado deve ser salvo.');
  console.log('  ✅ 8. Painel existente atualizado no lugar e ID salvo.');

  // 9. Estatísticas para o painel /admin
  const stats = tm.getTicketStats(TEST_GUILD);
  assert.equal(stats.total, 2);
  assert.equal(stats.open, 0);
  assert.equal(stats.claimed, 1);
  console.log('  ✅ 9. Estatísticas de tickets expostas.');

  // 10. Opções do painel web: padrões, limites e Remoção de Conteúdo só na zona da Cringelândia
  const { normalizeTicketOptions } = require('../src/modules/tickets/ticketOptions');
  const { MUSEUM_REMOVAL_CHANNEL_ID } = require('../src/config/scopes');
  const defaults = normalizeTicketOptions(TEST_GUILD, {});
  assert.equal(defaults.maxOpenPerUser, 2, 'Padrão de 2 salas por membro (como antes).');
  assert.equal(defaults.dmTranscript, true);
  assert.ok(defaults.types.help.enabled && defaults.types.report.enabled);
  assert.equal(defaults.artRemoval, undefined, 'Servidor comum não tem Remoção de Conteúdo.');
  const clamped = normalizeTicketOptions(TEST_GUILD, { maxOpenPerUser: 99, staffRoleIds: ['x', '123456789012345678'], artRemoval: { enabled: true }, types: { help: { enabled: false }, report: { enabled: false } } });
  assert.equal(clamped.maxOpenPerUser, 5);
  assert.deepEqual(clamped.staffRoleIds, ['123456789012345678']);
  assert.equal(clamped.artRemoval, undefined, 'Pedido de fora não liga a Remoção de Conteúdo.');
  assert.equal(clamped.types.help.enabled, true, 'Painel nunca fica sem botão.');
  const cringOpts = normalizeTicketOptions(CRING, {});
  assert.deepEqual(cringOpts.artRemoval, { enabled: true, channelId: MUSEUM_REMOVAL_CHANNEL_ID }, 'Cringelândia mantém o fluxo e o canal de sempre.');

  const customPanel = tm.buildTicketPanel({ id: TEST_GUILD, name: 'G' }, { types: { report: { enabled: false }, help: { label: 'Suporte', description: 'fale com a gente' } }, panelTitle: 'Título próprio', artRemoval: { enabled: true } });
  assert.equal(customPanel.components[0].components.length, 1, 'Tipo desligado some do painel; servidor comum nunca ganha o botão do Museu.');
  assert.equal(customPanel.components[0].components[0].data.label, 'Suporte');
  assert.equal(customPanel.embeds[0].data.title, 'Título próprio');
  assert.ok(customPanel.embeds[0].data.description.includes('**🆘 Suporte:** fale com a gente'));
  const cringNoArt = tm.buildTicketPanel({ id: CRING, name: 'Cringelândia' }, { artRemoval: { enabled: false } });
  assert.equal(cringNoArt.components[0].components.length, 2, 'Cringelândia pode desligar a Remoção de Conteúdo.');
  console.log('  ✅ 10. Opções normalizadas e painel personalizado, com o Museu só na Cringelândia.');

  // 11. Bot aplica as opções: tipo desligado recusado, limite por membro e cargos da Staff
  setTicketConfig(TEST_GUILD, { ticketOptions: { maxOpenPerUser: 1, staffRoleIds: ['123456789012345678'], types: { report: { enabled: false } } } });
  const before = created.length;
  replies.length = 0;
  await tm.handleOpenTicket(openInteraction('report'), 'report');
  assert.equal(created.length, before, 'Tipo desligado não abre sala (painel antigo com o botão).');
  assert.equal(replies[0].content, TRANSLATIONS.en.tickets.type_disabled);
  const staffByRole = { permissions: memberPerms, roles: { cache: new Map([['123456789012345678', {}]]) } };
  assert.equal(tm.isStaffMember(staffByRole, TEST_GUILD), true, 'Cargo da equipe conta como Staff.');
  assert.equal(tm.isStaffMember({ permissions: memberPerms, roles: { cache: new Map() } }, TEST_GUILD), false);
  guild.roles.cache.set('123456789012345678', { id: '123456789012345678', permissions: memberPerms });
  await tm.handleOpenTicket(openInteraction('help'), 'help');
  const newRoom = created[created.length - 1];
  assert.equal(created.length, before + 1);
  replies.length = 0;
  await tm.handleOpenTicket({ ...openInteraction('help'), user: user }, 'help');
  assert.ok(replies[0].content.includes(TRANSLATIONS.en.tickets.already_open.split(':')[0]), 'Mesmo tipo já aberto.');
  console.log('  ✅ 11. Tipo desligado recusado, duplicata barrada e cargos da Staff aplicados.');

  // 12. Ponte do painel: conferência de tipo e dono dos canais/cargos, gravação e fechamento
  const bridge = require('../src/modules/tickets/dashboardBridge');
  const TXT = `${TEST_GUILD.slice(0, 17)}3`;
  const CAT2 = `${TEST_GUILD.slice(0, 17)}4`;
  guild.channels.cache.set(TXT, Object.assign(makeChannel(TXT, sent), { type: ChannelType.GuildText, name: 'suporte' }));
  guild.channels.cache.set(CAT2, { id: CAT2, type: ChannelType.GuildCategory, name: 'ATENDIMENTO' });
  const fakeClient = { user: { id: 'bot' }, guilds: { cache: new Map([[TEST_GUILD, guild]]) } };
  await assert.rejects(bridge.save(fakeClient, { guildId: TEST_GUILD, categoryId: TXT }), /invalid_category/, 'Canal de texto não serve de categoria.');
  await assert.rejects(bridge.save(fakeClient, { guildId: TEST_GUILD, logChannelId: CAT2 }), /invalid_channel/);
  await assert.rejects(bridge.save(fakeClient, { guildId: TEST_GUILD, options: { staffRoleIds: ['223456789012345678'] } }), /invalid_role/);
  const savedInfo = await bridge.save(fakeClient, { guildId: TEST_GUILD, categoryId: CAT2, logChannelId: TXT, options: { maxOpenPerUser: 3, artRemoval: { enabled: true } } });
  assert.equal(getTicketConfig(TEST_GUILD).ticketCategoryId, CAT2);
  assert.equal(savedInfo.options.maxOpenPerUser, 3);
  assert.equal(savedInfo.options.artRemoval, undefined);
  assert.equal(savedInfo.cringelandia, false);
  assert.equal(savedInfo.artRemovals, null, 'Servidor comum não vê os pedidos do Museu.');
  assert.ok(savedInfo.open.some((tk) => tk.channelId === newRoom.id), 'Lista de tickets abertos.');
  const openTicket = savedInfo.open.find((tk) => tk.channelId === newRoom.id);
  await assert.rejects(bridge.close({ ...fakeClient, guilds: { cache: new Map([['111111111111111111', { ...guild, id: '111111111111111111' }]]) } }, { guildId: '111111111111111111', ticketId: openTicket.id, by: 'x' }), /ticket_not_found/, 'Ticket de outro servidor não fecha.');
  const closedByPanel = await bridge.close(fakeClient, { guildId: TEST_GUILD, ticketId: openTicket.id, by: 'staff1' });
  assert.equal(closedByPanel.closed, true);
  assert.equal(tm.loadTicketsData().tickets[openTicket.id].closedBy, 'staff1');
  console.log('  ✅ 12. Ponte do painel confere canais, categoria e cargos, grava e fecha tickets.');

  // Limpeza dos registros de teste
  const db = tm.loadTicketsData();
  for (const [id, tk] of Object.entries(db.tickets)) if (tk.guildId === TEST_GUILD) delete db.tickets[id];
  delete db.counters[TEST_GUILD];
  tm.saveTicketsData(db);

  console.log('🎉 tests/ticketsV2.test.js concluído com 100% de sucesso!');
  setTimeout(() => process.exit(0), 50);
})().catch((err) => {
  console.error('❌ Falha nos testes de Tickets 2.0:', err);
  process.exit(1);
});

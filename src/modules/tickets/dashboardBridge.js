// Lado do bot da seção "Tickets" do painel web (/dashboard). O site só fala com o bot pela ponte:
// assim a configuração é lida e gravada no mesmo processo que atende os botões (sem cache velho).
// O site já confere que canais e cargos são do servidor; aqui o bot confere de novo, com o tipo certo.
const { ChannelType } = require('discord.js');
const tm = require('./ticketManager');
const { LIMITS, isCringelandia, normalizeTicketOptions } = require('./ticketOptions');
const { getTicketConfig, setTicketConfig, assignDedicatedChannel } = require('../../services/guildConfigService');
const { t } = require('../../utils/i18n');

const TEXT_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

function fail(code) {
  return new Error(code);
}

function getGuild(client, guildId) {
  const guild = client.guilds.cache.get(String(guildId));
  if (!guild) throw fail('guild_not_found');
  return guild;
}

function channelOk(guild, id, types) {
  const ch = id ? guild.channels.cache.get(id) : null;
  return Boolean(ch && types.includes(ch.type));
}

// Textos padrão no idioma do servidor: viram dica dos campos e a prévia da tela
function defaultTexts(guildId) {
  const type = (key) => ({ label: t(`tickets.btn_${key}`, guildId), name: t(`tickets.name_${key}`, guildId), description: t(`tickets.desc_${key}`, guildId) });
  return {
    panelTitle: t('tickets.panel_title', guildId),
    panelIntro: t('tickets.panel_intro', guildId),
    panelSection: t('tickets.panel_section', guildId),
    panelNote: t('tickets.panel_note', guildId),
    roomMessage: ['room_section', 'room_step1', 'room_step2', 'room_step3'].map((k) => t(`tickets.${k}`, guildId)).join('\n\n'),
    optArt: t('tickets.opt_art', guildId),
    btnArt: t('tickets.btn_art', guildId),
    types: { help: type('help'), report: type('report') },
  };
}

function info(client, { guildId }) {
  const guild = getGuild(client, guildId);
  const cfg = getTicketConfig(guild.id);
  const cring = isCringelandia(guild.id);
  return {
    config: {
      panelChannelId: cfg.ticketPanelChannelId || '',
      categoryId: cfg.ticketCategoryId || '',
      logChannelId: cfg.ticketLogChannelId || '',
      panelMessageId: cfg.ticketPanelMessageId || '',
    },
    // O que a configuração aponta e não existe mais no servidor
    health: {
      panelChannel: !cfg.ticketPanelChannelId || channelOk(guild, cfg.ticketPanelChannelId, TEXT_TYPES),
      category: !cfg.ticketCategoryId || channelOk(guild, cfg.ticketCategoryId, [ChannelType.GuildCategory]),
      logChannel: !cfg.ticketLogChannelId || channelOk(guild, cfg.ticketLogChannelId, TEXT_TYPES),
    },
    options: tm.getTicketOptions(guild.id),
    defaults: defaultTexts(guild.id),
    limits: LIMITS,
    stats: tm.getTicketStats(guild.id),
    open: tm.listOpenTickets(guild),
    cringelandia: cring,
    artRemovals: cring ? tm.listArtRemovals() : null,
  };
}

async function save(client, { guildId, panelChannelId, categoryId, logChannelId, options }) {
  const guild = getGuild(client, guildId);
  const panelId = String(panelChannelId || '');
  const catId = String(categoryId || '');
  const logId = String(logChannelId || '');
  const normalized = normalizeTicketOptions(guild.id, options || {});

  if (panelId && !channelOk(guild, panelId, TEXT_TYPES)) throw fail('invalid_channel');
  if (logId && !channelOk(guild, logId, TEXT_TYPES)) throw fail('invalid_channel');
  if (catId && !channelOk(guild, catId, [ChannelType.GuildCategory])) throw fail('invalid_category');
  if (normalized.artRemoval && !channelOk(guild, normalized.artRemoval.channelId, TEXT_TYPES)) throw fail('invalid_channel');
  if (normalized.staffRoleIds.some((id) => id === guild.id || !guild.roles.cache.has(id))) throw fail('invalid_role');

  const current = getTicketConfig(guild.id);
  if (panelId !== (current.ticketPanelChannelId || '')) {
    // Mesmo caminho do py!set tickets: o canal deixa de servir a outra função dedicada
    if (panelId) assignDedicatedChannel(guild.id, 'tickets', panelId);
    setTicketConfig(guild.id, { ticketPanelChannelId: panelId || null, ticketPanelMessageId: null });
  }
  setTicketConfig(guild.id, { ticketCategoryId: catId || null, ticketLogChannelId: logId || null, ticketOptions: normalized });

  // Textos e botões novos aparecem no painel já publicado, editado no lugar
  const panel = await tm.updateTicketPanel(guild).catch(() => ({ mode: 'none' }));
  return { ...info(client, { guildId }), panelUpdated: panel.mode === 'edited' };
}

async function publish(client, { guildId, repost }) {
  const guild = getGuild(client, guildId);
  const cfg = getTicketConfig(guild.id);
  if (!cfg.ticketPanelChannelId) throw fail('no_panel_channel');
  if (!channelOk(guild, cfg.ticketPanelChannelId, TEXT_TYPES)) throw fail('invalid_channel');
  if (repost) {
    const sent = await tm.publishTicketPanel(guild);
    if (!sent) throw fail('publish_failed');
    return { mode: 'posted', messageId: sent.id, channelId: cfg.ticketPanelChannelId };
  }
  const result = await tm.updateTicketPanel(guild, { postIfMissing: true });
  if (result.mode === 'none') throw fail('publish_failed');
  return result;
}

async function createCategory(client, { guildId }) {
  const guild = getGuild(client, guildId);
  const category = await tm.createTicketCategory(guild);
  return { categoryId: category.id };
}

async function close(client, { guildId, ticketId, by }) {
  const guild = getGuild(client, guildId);
  return tm.closeTicketFromPanel(guild, String(ticketId), String(by));
}

// Prévia real no canal de homologação (AGENTS.md §11): painel e recepção com as opções salvas
async function preview(client, { guildId }) {
  const { dispatchHomologationPreview } = require('../../utils/homologationPreviewDispatcher');
  const guild = getGuild(client, guildId);
  const options = tm.getTicketOptions(guild.id);
  const panel = tm.buildTicketPanel(guild);
  const room = tm.buildRoomWelcomeEmbed({ source: guild.id, number: 1, type: 'help', userId: client.user.id, guildName: guild.name, options });
  // Botões desativados: a prévia não pode abrir salas de verdade no canal de testes
  const components = panel.components.map((row) => {
    const json = row.toJSON();
    return { ...json, components: json.components.map((c) => ({ ...c, disabled: true })) };
  });
  const r = await dispatchHomologationPreview({ client, commandName: 'Tickets', context: `Painel e recepção de ${guild.name}`, embeds: [...panel.embeds, room], components });
  return { sent: !r.simulated };
}

function registerTicketBridge(registerBridgeHandler) {
  registerBridgeHandler('TICKETS_INFO', info);
  registerBridgeHandler('TICKETS_SAVE', save);
  registerBridgeHandler('TICKETS_PUBLISH', publish);
  registerBridgeHandler('TICKETS_CREATE_CATEGORY', createCategory);
  registerBridgeHandler('TICKETS_CLOSE', close);
  registerBridgeHandler('TICKETS_PREVIEW', preview);
}

module.exports = { registerTicketBridge, info, save, publish, createCategory, close, preview };

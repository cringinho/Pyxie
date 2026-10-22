const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ticketManager = require('./ticketManager');
const { getTicketConfig, setTicketConfig } = require('../../services/guildConfigService');
const { t } = require('../../utils/i18n');

const NO_PINGS = { parse: [], users: [], roles: [], repliedUser: false };

function hasManageChannels(interaction) {
  return Boolean(interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels));
}

function buildSetupResultEmbed(interaction, titleKey, descKey, replacements) {
  return new EmbedBuilder()
    .setColor('#10B981')
    .setTitle(t(titleKey, interaction))
    .setDescription(t(descKey, interaction, replacements));
}

function panelMention(interaction, cfg) {
  return cfg.ticketPanelChannelId ? `<#${cfg.ticketPanelChannelId}>` : t('tickets.setup_not_defined', interaction);
}

async function handleCreateCategory(interaction) {
  await interaction.deferReply({ flags: 64 });
  const guild = interaction.guild;
  if (!guild) return;

  try {
    const staffRoles = guild.roles.cache.filter((r) => r.permissions.has(PermissionFlagsBits.ManageChannels));
    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];
    for (const [roleId] of staffRoles) {
      permissionOverwrites.push({
        id: roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    const newCategory = await guild.channels.create({
      name: '📩・ATENDIMENTO',
      type: ChannelType.GuildCategory,
      position: 0,
      permissionOverwrites,
    });

    setTicketConfig(guild.id, { ticketCategoryId: newCategory.id });
    await ticketManager.publishTicketPanel(guild).catch(() => null);
    const cfg = getTicketConfig(guild.id);

    await interaction.editReply({
      embeds: [
        buildSetupResultEmbed(interaction, 'tickets.setup_cat_created_title', 'tickets.setup_cat_created_desc', {
          category: `<#${newCategory.id}>`,
          panel: panelMention(interaction, cfg),
        }),
      ],
      components: [],
    });
  } catch (err) {
    console.error('[TicketsModule] Erro ao criar categoria automática:', err);
    await interaction.editReply({ content: t('tickets.setup_create_error', interaction, { error: err.message }), components: [] });
  }
}

async function handleSelectCategory(interaction) {
  await interaction.deferReply({ flags: 64 });
  const guild = interaction.guild;
  if (!guild) return;

  const selectedCategoryId = interaction.values[0];
  setTicketConfig(guild.id, { ticketCategoryId: selectedCategoryId });
  await ticketManager.publishTicketPanel(guild).catch(() => null);
  const cfg = getTicketConfig(guild.id);

  await interaction.editReply({
    embeds: [
      buildSetupResultEmbed(interaction, 'tickets.setup_cat_selected_title', 'tickets.setup_cat_selected_desc', {
        category: `<#${selectedCategoryId}>`,
        panel: panelMention(interaction, cfg),
      }),
    ],
    components: [],
  });
}

async function handleSelectLogs(interaction) {
  const guild = interaction.guild;
  if (!guild) return;
  const selectedChannelId = interaction.values[0];
  setTicketConfig(guild.id, { ticketLogChannelId: selectedChannelId });

  await interaction.reply({
    embeds: [
      buildSetupResultEmbed(interaction, 'tickets.setup_logs_title', 'tickets.setup_logs_desc', {
        channel: `<#${selectedChannelId}>`,
      }),
    ],
    flags: 64,
    allowedMentions: NO_PINGS,
  });
}

async function handleTicketInteraction(interaction) {
  if (!interaction || interaction.replied || interaction.deferred) return;

  if (interaction.isButton()) {
    const customId = interaction.customId || '';
    if (!customId.startsWith('tkt:')) return;
    const [, action, arg1, arg2] = customId.split(':');

    // tkt:open:help / tkt:open:report / tkt:open:art_removal
    if (action === 'open') {
      if (arg1 === 'help' || arg1 === 'report') return ticketManager.handleOpenTicket(interaction, arg1);
      if (arg1 === 'art_removal') return ticketManager.handleArtRemovalClick(interaction);
      return;
    }
    if (action === 'claim') return ticketManager.handleClaimTicket(interaction, arg1);
    if (action === 'close') return ticketManager.handleCloseTicket(interaction, arg1);
    if (action === 'close_confirm') return ticketManager.handleCloseConfirm(interaction, arg1);
    if (action === 'close_cancel') return ticketManager.handleCloseCancel(interaction);
    // tkt:art_done:<userId>:<requestId>
    if (action === 'art_done') return ticketManager.handleArtRemovalDone(interaction, arg1, arg2);

    if (action === 'setup' && arg1 === 'create_cat') {
      if (!hasManageChannels(interaction)) {
        return interaction.reply({ content: t('tickets.setup_no_permission', interaction), flags: 64 });
      }
      return handleCreateCategory(interaction);
    }
    return;
  }

  if (interaction.isChannelSelectMenu()) {
    const customId = interaction.customId || '';
    if (customId !== 'tkt:setup:select_cat' && customId !== 'tkt:setup:select_logs') return;
    if (!hasManageChannels(interaction)) {
      return interaction.reply({ content: t('tickets.setup_no_permission', interaction), flags: 64 });
    }
    if (customId === 'tkt:setup:select_cat') return handleSelectCategory(interaction);
    return handleSelectLogs(interaction);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'tkt:modal:art_removal') {
    return ticketManager.handleArtRemovalSubmit(interaction);
  }
}

module.exports = {
  id: 'tickets',
  name: {
    'pt-BR': 'Central de Atendimento & Tickets',
    en: 'Support & Tickets Center',
  },
  description: {
    'pt-BR': 'Tickets multi-tenant com salas privadas numeradas, assumir atendimento, transcrição, registros da Staff e remoção de artes.',
    en: 'Multi-tenant tickets with numbered private rooms, claiming, transcripts, Staff logs and art removal workflow.',
  },
  category: 'moderation',
  icon: '📩',
  version: '2.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,
  handleInteraction: handleTicketInteraction,
  getStats: () => ticketManager.getTicketStats(),

  async onLoad(ctx) {
    if (!ctx.registerListener) return;
    ctx.registerListener('interactionCreate', handleTicketInteraction);
    ctx.registerListener('channelDelete', (channel) => {
      ticketManager.markTicketChannelDeleted(channel);
    });

    // Atualiza no lugar os painéis já publicados (ex.: Cringelândia) com o layout atual
    const client = ctx.client;
    if (client?.isReady?.()) {
      ticketManager.refreshTicketPanels(client).catch((err) => console.warn('[TicketsModule] refresh:', err.message));
    } else if (client) {
      client.once('clientReady', () => {
        ticketManager.refreshTicketPanels(client).catch((err) => console.warn('[TicketsModule] refresh:', err.message));
      });
    }
  },

  async onUnload() {
    // Listeners são removidos automaticamente pelo ModuleManager
  },
};

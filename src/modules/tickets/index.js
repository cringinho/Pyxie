const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const ticketManager = require('./ticketManager');
const { getTicketConfig, setTicketConfig } = require('../../services/guildConfigService');

async function handleTicketInteraction(interaction) {
  // 1. Botões e Menus de Seleção
  if (interaction.isButton()) {
    const customId = interaction.customId || '';
    if (!customId.startsWith('tkt:')) return;

    const parts = customId.split(':');
    const action = parts[1];

    // tkt:open:help / tkt:open:report / tkt:open:art_removal
    if (action === 'open') {
      const subType = parts[2];
      if (subType === 'help' || subType === 'report') {
        return ticketManager.handleOpenTicket(interaction, subType);
      }
      if (subType === 'art_removal') {
        return ticketManager.handleArtRemovalClick(interaction);
      }
    }

    // tkt:close:<channelId>
    if (action === 'close') {
      const channelId = parts[2];
      return ticketManager.handleCloseTicket(interaction, channelId);
    }

    // tkt:art_done:<userId>:<requestId>
    if (action === 'art_done') {
      const userId = parts[2];
      const requestId = parts[3];
      return ticketManager.handleArtRemovalDone(interaction, userId, requestId);
    }

    // tkt:setup:create_cat
    if (action === 'setup' && parts[2] === 'create_cat') {
      if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({
          content: '❌ Você não tem permissão para gerenciar canais e criar a categoria de atendimento.',
          flags: 64,
        });
      }

      await interaction.deferReply({ flags: 64 });
      const guild = interaction.guild;
      if (!guild) return;

      try {
        const staffRoles = guild.roles.cache.filter((r) => r.permissions.has(PermissionFlagsBits.ManageChannels));
        const permissionOverwrites = [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ];

        for (const [roleId] of staffRoles) {
          permissionOverwrites.push({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          });
        }

        const newCategory = await guild.channels.create({
          name: '📩・ATENDIMENTO',
          type: ChannelType.GuildCategory,
          position: 0,
          permissionOverwrites,
        });

        const cfg = getTicketConfig(guild.id);
        cfg.ticketCategoryId = newCategory.id;
        setTicketConfig(guild.id, cfg);

        if (cfg.ticketPanelChannelId) {
          try {
            const panelChannel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
            if (panelChannel && panelChannel.isTextBased()) {
              const panelPayload = ticketManager.buildTicketPanel(guild.id);
              await panelChannel.send(panelPayload);
            }
          } catch (_) {}
        }

        const successEmbed = new EmbedBuilder()
          .setColor('#10B981')
          .setTitle('✅ Categoria e Painel Configurados com Sucesso!')
          .setDescription(
            `A categoria **${newCategory.name}** foi criada no topo absoluto com permissões automáticas para a Staff!

` +
            `📍 **Canal do Painel:** <#${cfg.ticketPanelChannelId || 'Não definido'}>
` +
            `📁 **Categoria Criada:** <#${newCategory.id}>

` +
            '-# O painel de atendimento foi publicado e já está pronto para receber chamados.'
          );

        await interaction.editReply({
          embeds: [successEmbed],
          components: [],
        });
      } catch (err) {
        console.error('[TicketsModule] Erro ao criar categoria automática:', err);
        await interaction.editReply({
          content: `❌ Falha ao criar categoria automática: ${err.message}`,
          components: [],
        });
      }
    }
  }

  // 2. Select Menu de Categorias
  if (interaction.isChannelSelectMenu()) {
    const customId = interaction.customId || '';
    if (customId === 'tkt:setup:select_cat') {
      if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({
          content: '❌ Você não tem permissão para configurar a categoria de atendimento.',
          flags: 64,
        });
      }

      await interaction.deferReply({ flags: 64 });
      const selectedCategoryId = interaction.values[0];
      const guild = interaction.guild;
      if (!guild) return;

      const cfg = getTicketConfig(guild.id);
      cfg.ticketCategoryId = selectedCategoryId;
      setTicketConfig(guild.id, cfg);

      if (cfg.ticketPanelChannelId) {
        try {
          const panelChannel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
          if (panelChannel && panelChannel.isTextBased()) {
            const panelPayload = ticketManager.buildTicketPanel(guild.id);
            await panelChannel.send(panelPayload);
          }
        } catch (_) {}
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#10B981')
        .setTitle('✅ Categoria Configurada com Sucesso!')
        .setDescription(
          `A categoria <#${selectedCategoryId}> foi selecionada com sucesso como destino dos novos tickets!

` +
          `📍 **Canal do Painel:** <#${cfg.ticketPanelChannelId || 'Não definido'}>
` +
          `📁 **Categoria de Salas:** <#${selectedCategoryId}>

` +
          '-# O painel de atendimento foi publicado e já está pronto para receber chamados.'
        );

      await interaction.editReply({
        embeds: [successEmbed],
        components: [],
      });
    }
  }

  // 3. Submissão de Modal
  if (interaction.isModalSubmit()) {
    const customId = interaction.customId || '';
    if (customId === 'tkt:modal:art_removal') {
      return ticketManager.handleArtRemovalSubmit(interaction);
    }
  }
}

module.exports = {
  id: 'tickets',
  name: {
    'pt-BR': 'Central de Atendimento & Tickets',
    en: 'Support & Tickets Center',
  },
  description: {
    'pt-BR': 'Módulo nativo de tickets multi-tenant com canais privados e fluxo de remoção de artes.',
    en: 'Native multi-tenant ticket module with private channels and art removal workflow.',
  },
  category: 'moderation',
  icon: '📩',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,
  handleInteraction: handleTicketInteraction,

  async onLoad(ctx) {
    if (ctx.registerListener) {
      ctx.registerListener('interactionCreate', handleTicketInteraction);
    }
  },

  async onUnload(ctx) {
    // Zero memory leak
  },
};

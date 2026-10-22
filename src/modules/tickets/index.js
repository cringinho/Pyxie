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

  async onLoad(ctx) {
    if (ctx.registerListener) {
      ctx.registerListener('interactionCreate', async (interaction) => {
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

          // tkt:setup:create_cat (Botão '➕ Crie pra mim')
          if (action === 'setup' && parts[2] === 'create_cat') {
            if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
              return interaction.reply({
                content: '❌ Você precisa de permissão de Gerenciar Canais para configurar categorias.',
                flags: 64,
              });
            }

            const guild = interaction.guild;
            const staffRolesOverwrites = [];
            try {
              const rolesWithManage = guild.roles.cache.filter((r) => r.permissions.has(PermissionFlagsBits.ManageChannels));
              for (const [roleId] of rolesWithManage) {
                staffRolesOverwrites.push({
                  id: roleId,
                  allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                  ],
                });
              }
            } catch (_) {}

            try {
              await interaction.deferUpdate();

              // Cria a categoria no topo absoluto (position: 0)
              const createdCategory = await guild.channels.create({
                name: '📩・ATENDIMENTO',
                type: ChannelType.GuildCategory,
                position: 0,
                permissionOverwrites: [
                  {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                  },
                  {
                    id: guild.client.user.id,
                    allow: [
                      PermissionFlagsBits.ViewChannel,
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.ManageChannels,
                      PermissionFlagsBits.ManageMessages,
                    ],
                  },
                  ...staffRolesOverwrites,
                ],
              });

              setTicketConfig(guild.id, { ticketCategoryId: createdCategory.id });

              // Publica o painel de tickets no canal configurado
              const cfg = getTicketConfig(guild.id);
              if (cfg.ticketPanelChannelId) {
                const targetChannel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
                if (targetChannel && targetChannel.isTextBased()) {
                  const panelPayload = ticketManager.buildTicketPanel(guild.id);
                  await targetChannel.send(panelPayload);
                }
              }

              const successEmbed = new EmbedBuilder()
                .setColor('#10B981')
                .setTitle('✅  ✦  Central de Atendimento Configurada')
                .setDescription(
                  'A categoria oficial **`📩・ATENDIMENTO`** foi criada no topo do servidor e vinculada ao sistema de tickets!\n\n' +
                  `📍 **Canal do Painel:** <#${cfg.ticketPanelChannelId || 'Não definido'}>\n` +
                  `📁 **Categoria de Salas:** \`📩・ATENDIMENTO\` (<#${createdCategory.id}>)\n\n` +
                  '-# O painel de atendimento foi publicado e já está pronto para receber chamados.'
                );

              await interaction.editReply({
                embeds: [successEmbed],
                components: [],
              });
            } catch (err) {
              console.error('[ticketsModule] Erro ao criar categoria automática:', err);
              await interaction.followUp({
                content: `❌ Erro ao criar categoria automática: ${err.message}`,
                flags: 64,
              });
            }
          }
        }

        // 2. Menu de Seleção de Categoria (Scroller)
        if (interaction.isChannelSelectMenu()) {
          const customId = interaction.customId || '';
          if (customId === 'tkt:setup:select_cat') {
            if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
              return interaction.reply({
                content: '❌ Você precisa de permissão de Gerenciar Canais para configurar categorias.',
                flags: 64,
              });
            }

            const selectedCategoryId = interaction.values[0];
            const guild = interaction.guild;

            await interaction.deferUpdate();
            setTicketConfig(guild.id, { ticketCategoryId: selectedCategoryId });

            const cfg = getTicketConfig(guild.id);
            if (cfg.ticketPanelChannelId) {
              const targetChannel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
              if (targetChannel && targetChannel.isTextBased()) {
                const panelPayload = ticketManager.buildTicketPanel(guild.id);
                await targetChannel.send(panelPayload);
              }
            }

            const successEmbed = new EmbedBuilder()
              .setColor('#10B981')
              .setTitle('✅  ✦  Central de Atendimento Configurada')
              .setDescription(
                `A categoria <#${selectedCategoryId}> foi selecionada com sucesso como destino dos novos tickets!\n\n` +
                `📍 **Canal do Painel:** <#${cfg.ticketPanelChannelId || 'Não definido'}>\n` +
                `📁 **Categoria de Salas:** <#${selectedCategoryId}>\n\n` +
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
      });
    }
  },

  async onUnload(ctx) {
    // Zero memory leak
  },
};

const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { CRINGELANDIA_GUILD_ID } = require('../../config');
const { getTicketConfig } = require('../../services/guildConfigService');
const { buildStandardEmbed } = require('../../utils/embedBuilderHelper');
const { resolveEmoji } = require('../../utils/emojiResolver');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const TICKETS_DATA_FILE = path.join(DATA_DIR, 'ticketsData.json');
const TICKETS_DATA_BACKUP = `${TICKETS_DATA_FILE}.bak`;
const ART_REMOVAL_CHANNEL_ID = '1557534749310976141';

let ticketsCache = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTicketsData() {
  ensureDataDir();
  if (ticketsCache) return ticketsCache;

  if (fs.existsSync(TICKETS_DATA_FILE)) {
    try {
      ticketsCache = JSON.parse(fs.readFileSync(TICKETS_DATA_FILE, 'utf8')) || {};
      if (!ticketsCache.tickets) ticketsCache.tickets = {};
      if (!ticketsCache.artRemovals) ticketsCache.artRemovals = {};
      return ticketsCache;
    } catch (_) {
      try {
        if (fs.existsSync(TICKETS_DATA_BACKUP)) {
          ticketsCache = JSON.parse(fs.readFileSync(TICKETS_DATA_BACKUP, 'utf8')) || {};
          if (!ticketsCache.tickets) ticketsCache.tickets = {};
          if (!ticketsCache.artRemovals) ticketsCache.artRemovals = {};
          return ticketsCache;
        }
      } catch (__) {}
    }
  }

  ticketsCache = { tickets: {}, artRemovals: {} };
  return ticketsCache;
}

function saveTicketsData(data) {
  ensureDataDir();
  ticketsCache = data;
  const tmpFile = `${TICKETS_DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  const serialized = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tmpFile, serialized, 'utf8');
    if (fs.existsSync(TICKETS_DATA_FILE)) {
      try { fs.copyFileSync(TICKETS_DATA_FILE, TICKETS_DATA_BACKUP); } catch (_) {}
    }
    fs.renameSync(tmpFile, TICKETS_DATA_FILE);
  } catch (err) {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    console.error('[ticketManager] Erro ao gravar ticketsData.json:', err.message);
  }
}

/**
 * Constrói o Embed e Botões do Painel Principal de Tickets
 * @param {string|object} guildOrGuildId
 */
function buildTicketPanel(guildOrGuildId) {
  const gId = typeof guildOrGuildId === 'object' && guildOrGuildId !== null ? guildOrGuildId.id : guildOrGuildId;
  const isCringelandia = String(gId) === String(CRINGELANDIA_GUILD_ID || '1453890868980482090');

  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle('📩  ✦  Central de Atendimento & Suporte')
    .setDescription(
      'Bem-vindo(a) à central de atendimento! Selecione uma das opções abaixo para iniciar seu contato com a nossa equipe:\n\n' +

      '### 📋 Modalidades de Atendimento\n\n' +

      '🆘 **Ajuda Geral:** Dúvidas sobre o servidor, cargos, eventos e suporte da comunidade.\n\n' +
      '🚨 **Denúncia Privada:** Relate infrações de regras, assédio ou condutas inadequadas com total sigilo.\n\n' +
      (isCringelandia ? '🖼️ **Remoção de Conteúdo:** Solicite a exclusão de desenhos ou artes da nossa galeria virtual.\n\n' : '') +

      '-# 🔒 Seu atendimento será conduzido em canal seguro e exclusivo com a Staff.'
    )
    .setFooter({ text: 'Pyxie • Sistema Oficial de Atendimento e Suporte' })
    .setTimestamp();

  const row = new ActionRowBuilder();

  row.addComponents(
    new ButtonBuilder()
      .setCustomId('tkt:open:help')
      .setLabel('🆘 Ajuda')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('tkt:open:report')
      .setLabel('🚨 Denúncia')
      .setStyle(ButtonStyle.Danger)
  );

  if (isCringelandia) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('tkt:open:art_removal')
        .setLabel('🖼️ Remoção de Conteúdo')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  return { embeds: [embed], components: [row] };
}

/**
 * Abre canal de atendimento para Ajuda ou Denúncia
 */
async function handleOpenTicket(interaction, type) {
  const { guild, user } = interaction;
  if (!guild) return;

  const config = getTicketConfig(guild.id);
  const categoryId = config.ticketCategoryId;

  if (!categoryId) {
    return interaction.reply({
      content: '❌ O sistema de tickets ainda não possui uma categoria configurada neste servidor! Peça a um administrador para rodar `/py-set tickets`.',
      flags: 64,
    });
  }

  const category = guild.channels.cache.get(categoryId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({
      content: '❌ A categoria configurada para tickets não foi encontrada. Configure-a novamente via `/py-set tickets`.',
      flags: 64,
    });
  }

  const db = loadTicketsData();
  const existingTicket = Object.values(db.tickets).find(
    (t) => t.guildId === guild.id && t.userId === user.id && t.type === type && t.status === 'OPEN'
  );

  if (existingTicket && guild.channels.cache.has(existingTicket.channelId)) {
    return interaction.reply({
      content: `⚠️ Você já possui um atendimento em andamento para esta categoria: <#${existingTicket.channelId}>.`,
      flags: 64,
    });
  }

  await interaction.deferReply({ flags: 64 });

  const typeName = type === 'report' ? 'denuncia' : 'ajuda';
  const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 15) || 'user';
  const channelName = `${typeName}-${cleanUsername}`;

  // Resolução de cargos da Staff com permissão de Gerenciar Canais
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
          PermissionFlagsBits.ManageMessages,
        ],
      });
    }
  } catch (_) {}

  try {
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `Atendimento de ${typeName.toUpperCase()} para ${user.tag} (ID: ${user.id})`,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
          ],
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

    const ticketId = `tkt_${guild.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    db.tickets[ticketId] = {
      id: ticketId,
      guildId: guild.id,
      channelId: ticketChannel.id,
      userId: user.id,
      type,
      status: 'OPEN',
      createdAt: Date.now(),
    };
    saveTicketsData(db);

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle(`📩  ✦  Atendimento: ${typeName === 'report' ? 'Denúncia' : 'Ajuda'}`)
      .setDescription(
        `Olá <@${user.id}>! Sua sala de atendimento foi iniciada com sucesso.\n\n` +

        '### ✍️ Como Proceder\n\n' +

        '• Explique detalhadamente sua dúvida, pedido ou relato.\n\n' +
        '• Se aplicável, anexe prints, links ou mensagens relevantes para agilizar a análise.\n\n' +
        '• Nossa equipe foi notificada e responderá assim que possível.\n\n' +

        '-# 🔒 Apenas você e membros autorizados da Staff têm acesso a este canal.'
      )
      .setFooter({ text: 'Pyxie • Atendimento Seguro & Humanizado' })
      .setTimestamp();

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`tkt:close:${ticketChannel.id}`)
        .setLabel('🔒 Fechar Atendimento')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `<@${user.id}>`,
      embeds: [welcomeEmbed],
      components: [actionRow],
    });

    await interaction.editReply({
      content: `✅ Seu atendimento foi criado com sucesso! Acesse aqui: <#${ticketChannel.id}>`,
    });
  } catch (err) {
    console.error('[ticketManager] Erro ao criar canal de ticket:', err);
    await interaction.editReply({
      content: '❌ Ocorreu um erro ao criar o canal de atendimento. Verifique as permissões do bot no servidor.',
    });
  }
}

/**
 * Abre o Modal de Remoção de Conteúdo da Galeria Virtual
 */
async function handleArtRemovalClick(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('tkt:modal:art_removal')
    .setTitle('Remoção de Conteúdo do Museu');

  const detailsInput = new TextInputBuilder()
    .setCustomId('tkt:art_details')
    .setLabel('Artes ou Desenhos a Serem Removidos')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Descreva detalhadamente links das obras, títulos, descrição dos desenhos ou época de postagem...')
    .setRequired(true)
    .setMaxLength(1500);

  modal.addComponents(new ActionRowBuilder().addComponents(detailsInput));
  await interaction.showModal(modal);
}

/**
 * Processa a submissão do Modal de Remoção de Arte
 */
async function handleArtRemovalSubmit(interaction) {
  const { user, client } = interaction;
  const details = interaction.fields.getTextInputValue('tkt:art_details');

  const requestId = `art_rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const db = loadTicketsData();
  db.artRemovals[requestId] = {
    requestId,
    userId: user.id,
    userTag: user.tag || user.username,
    details,
    status: 'PENDING',
    createdAt: Date.now(),
  };
  saveTicketsData(db);

  // 1. Mensagem na DM do usuário com fallback efêmero
  const dmMessage =
    'Olá! Recebemos sua solicitação de remoção de conteúdo. A nossa Staff já foi contactada para realizar a exclusão em até **48 horas** e você será avisado(a) aqui na DM assim que o processo for concluído.';

  let dmSent = false;
  try {
    await user.send(dmMessage);
    dmSent = true;
  } catch (_) {}

  await interaction.reply({
    content: dmSent
      ? '✅ Solicitação enviada com sucesso! Enviamos a confirmação detalhada na sua DM.'
      : `✅ Solicitação enviada com sucesso!\n\n> *${dmMessage}*`,
    flags: 64,
  });

  // 2. Despacho no canal de aprovações 1557534749310976141
  try {
    const approvalChannel = await client.channels.fetch(ART_REMOVAL_CHANNEL_ID).catch(() => null);
    if (approvalChannel && approvalChannel.isTextBased()) {
      const pendingEmbed = new EmbedBuilder()
        .setColor('#F59E0B')
        .setTitle('🖼️  ✦  Solicitação de Remoção de Conteúdo')
        .setDescription(
          `**<@${user.id}> (${user.tag || user.username})** solicitou a exclusão de uma ou mais artes da nossa galeria de artes virtual.\n\n` +

          '### 📝 Detalhes Informados pelo Solicitante\n\n' +
          `> ${details}`
        )
        .addFields(
          { name: '👤 Solicitante', value: `<@${user.id}> (\`${user.id}\`)`, inline: true },
          { name: '🔗 Link no Museu', value: `[Filtrar Artista](https://pyxie.com.br/museu?user=${user.id})`, inline: true },
          { name: '⏳ Prazo Máximo', value: '<t:' + Math.floor((Date.now() + 48 * 3600000) / 1000) + ':R>', inline: true }
        )
        .setFooter({ text: `ID do Pedido: ${requestId} • Museu Virtual da Cringelândia` })
        .setTimestamp();

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tkt:art_done:${user.id}:${requestId}`)
          .setLabel('✅ Concluir Exclusão')
          .setStyle(ButtonStyle.Success)
      );

      const sentMsg = await approvalChannel.send({
        embeds: [pendingEmbed],
        components: [actionRow],
      });

      db.artRemovals[requestId].messageId = sentMsg?.id || 'msg_unknown';
      db.artRemovals[requestId].channelId = sentMsg?.channel?.id || approvalChannel.id;
      saveTicketsData(db);
    }
  } catch (err) {
    console.error('[ticketManager] Erro ao despachar solicitação de remoção de arte:', err);
  }
}

/**
 * Conclusão da exclusão de arte pela Staff
 */
async function handleArtRemovalDone(interaction, targetUserId, requestId) {
  if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({
      content: '❌ Você precisa de permissão de Gerenciar Canais para concluir solicitações de remoção.',
      flags: 64,
    });
  }

  const db = loadTicketsData();
  const request = db.artRemovals[requestId];

  // 1. Mensagem via DM para o usuário solicitante
  try {
    const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => null);
    if (targetUser) {
      await targetUser.send(
        'Olá! Seu pedido de remoção de conteúdo da galeria virtual do Museu foi concluído com sucesso pela nossa Staff. As artes indicadas já foram retiradas do ar. 🎨✨'
      );
    }
  } catch (_) {}

  // 2. Atualiza embed no canal de aprovações
  const completedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor('#10B981')
    .setTitle('✅  ✦  Remoção de Conteúdo Concluída')
    .addFields({
      name: '🛡️ Concluído por',
      value: `<@${interaction.user.id}> em <t:${Math.floor(Date.now() / 1000)}:f>`,
      inline: false,
    });

  await interaction.update({
    embeds: [completedEmbed],
    components: [],
  });

  if (request) {
    request.status = 'DONE';
    request.resolvedBy = interaction.user.id;
    request.resolvedAt = Date.now();
    saveTicketsData(db);
  }
}

/**
 * Encerra o ticket no canal e agenda a exclusão
 */
async function handleCloseTicket(interaction, channelId) {
  if (!interaction.member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.reply({
      content: '❌ Apenas membros da Staff com permissão de Gerenciar Canais podem encerrar este atendimento.',
      flags: 64,
    });
  }

  const channel = interaction.channel;
  if (!channel || channel.id !== channelId) {
    return interaction.reply({
      content: '❌ Canal inválido ou não sincronizado.',
      flags: 64,
    });
  }

  const db = loadTicketsData();
  const ticketEntry = Object.values(db.tickets).find((t) => t.channelId === channelId);
  if (ticketEntry) {
    ticketEntry.status = 'CLOSED';
    ticketEntry.closedBy = interaction.user.id;
    ticketEntry.closedAt = Date.now();
    saveTicketsData(db);
  }

  await interaction.reply({
    content: `🔒 Atendimento encerrado por <@${interaction.user.id}>. Este canal será excluído em **5 segundos**...`,
  });

  setTimeout(async () => {
    try {
      await channel.delete('Ticket encerrado pela equipe de atendimento.');
    } catch (_) {}
  }, 5000);
}

/**
 * Encerramento de ticket acionado via comando (py!fechar ou /py-fechar)
 */
async function closeTicketByCommand(source) {
  const member = source.member;
  const channel = source.channel;

  if (!member?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
    const errContent = '❌ Apenas membros da Staff com permissão de Gerenciar Canais podem encerrar este atendimento.';
    if (source.reply) return source.reply({ content: errContent, flags: 64 });
    return source.channel?.send(errContent);
  }

  const db = loadTicketsData();
  const ticketEntry = Object.values(db.tickets).find((t) => t.channelId === channel.id);

  if (!ticketEntry || ticketEntry.status !== 'OPEN') {
    const notTicketMsg = '⚠️ Este comando só pode ser utilizado dentro de um canal de ticket aberto!';
    if (source.reply) return source.reply({ content: notTicketMsg, flags: 64 });
    return source.channel?.send(notTicketMsg);
  }

  ticketEntry.status = 'CLOSED';
  ticketEntry.closedBy = member.id;
  ticketEntry.closedAt = Date.now();
  saveTicketsData(db);

  const replyMsg = `🔒 Atendimento encerrado por <@${member.id}>. Este canal será excluído em **5 segundos**...`;
  if (source.reply) {
    await source.reply({ content: replyMsg });
  } else {
    await source.channel?.send(replyMsg);
  }

  setTimeout(async () => {
    try {
      await channel.delete('Ticket encerrado via comando py!fechar.');
    } catch (_) {}
  }, 5000);
}

module.exports = {
  TICKETS_DATA_FILE,
  loadTicketsData,
  saveTicketsData,
  buildTicketPanel,
  handleOpenTicket,
  handleArtRemovalClick,
  handleArtRemovalSubmit,
  handleArtRemovalDone,
  handleCloseTicket,
  closeTicketByCommand,
  ART_REMOVAL_CHANNEL_ID,
  CRINGELANDIA_GUILD_ID,
};

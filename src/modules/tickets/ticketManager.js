const fs = require('node:fs');
const path = require('node:path');
const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { CRINGELANDIA_GUILD_ID, MUSEUM_REMOVAL_CHANNEL_ID } = require('../../config/scopes');
const { getTicketConfig, setTicketConfig } = require('../../services/guildConfigService');
const { t, getLanguage } = require('../../utils/i18n');
const { LIMITS, normalizeTicketOptions } = require('./ticketOptions');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const TICKETS_DATA_FILE = path.join(DATA_DIR, 'ticketsData.json');
const TICKETS_DATA_BACKUP = `${TICKETS_DATA_FILE}.bak`;
// Padrão da Cringelândia; o canal efetivo vem de ticketOptions.artRemoval.channelId
const ART_REMOVAL_CHANNEL_ID = MUSEUM_REMOVAL_CHANNEL_ID;
const CRING_ID = String(CRINGELANDIA_GUILD_ID);

const MAX_OPEN_TICKETS_PER_USER = LIMITS.maxOpenPerUser.default;
const CLOSE_DELETE_DELAY_MS = 5000;
const TRANSCRIPT_MAX_MESSAGES = 1000;
const NO_PINGS = { parse: [], users: [], roles: [], repliedUser: false };

const COLOR_PRIMARY = '#8B5CF6';
const COLOR_SUCCESS = '#10B981';
const COLOR_WARNING = '#F59E0B';
const COLOR_MUTED = '#64748B';

let ticketsCache = null;
// Trava em memória contra cliques duplos criando duas salas ao mesmo tempo
const openingLocks = new Set();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function normalizeData(data) {
  const db = data && typeof data === 'object' ? data : {};
  if (!db.tickets) db.tickets = {};
  if (!db.artRemovals) db.artRemovals = {};
  if (!db.counters) db.counters = {};
  return db;
}

function loadTicketsData() {
  ensureDataDir();
  if (ticketsCache) return ticketsCache;

  for (const file of [TICKETS_DATA_FILE, TICKETS_DATA_BACKUP]) {
    if (!fs.existsSync(file)) continue;
    try {
      ticketsCache = normalizeData(JSON.parse(fs.readFileSync(file, 'utf8')));
      return ticketsCache;
    } catch (_) {}
  }

  ticketsCache = normalizeData({});
  return ticketsCache;
}

function saveTicketsData(data) {
  ensureDataDir();
  ticketsCache = normalizeData(data);
  const tmpFile = `${TICKETS_DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  const serialized = JSON.stringify(ticketsCache, null, 2);

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

function resolveGuildId(guildOrGuildId) {
  return typeof guildOrGuildId === 'object' && guildOrGuildId !== null ? guildOrGuildId.id : guildOrGuildId;
}

function isCringelandiaGuild(guildOrGuildId) {
  return String(resolveGuildId(guildOrGuildId)) === CRING_ID;
}

function getTicketOptions(guildOrGuildId) {
  const gId = String(resolveGuildId(guildOrGuildId) || '');
  return normalizeTicketOptions(gId, getTicketConfig(gId).ticketOptions);
}

// Staff = permissão Gerenciar Canais ou um dos cargos da equipe escolhidos no painel.
function isStaffMember(member, guildOrGuildId = member?.guild) {
  if (member?.permissions?.has?.(PermissionFlagsBits.ManageChannels)) return true;
  const gId = resolveGuildId(guildOrGuildId);
  if (!gId || !member?.roles?.cache) return false;
  return getTicketOptions(gId).staffRoleIds.some((id) => member.roles.cache.has(id));
}

// Cargos que enxergam as salas: os escolhidos no painel ou, sem escolha, quem tem Gerenciar Canais.
function staffRoleIdsFor(guild) {
  const chosen = getTicketOptions(guild).staffRoleIds.filter((id) => guild.roles?.cache?.has?.(id));
  if (chosen.length) return chosen;
  try {
    return [...guild.roles.cache.filter((r) => r.permissions.has(PermissionFlagsBits.ManageChannels)).keys()];
  } catch (_) {
    return [];
  }
}

function padNumber(n) {
  return String(n).padStart(4, '0');
}

function findTicketByChannel(db, channelId) {
  return Object.values(db.tickets).find((tk) => tk.channelId === channelId) || null;
}

function nextTicketNumber(db, guildId) {
  const existing = Object.values(db.tickets).filter((tk) => tk.guildId === guildId).length;
  const next = Math.max(Number(db.counters[guildId]) || 0, existing) + 1;
  db.counters[guildId] = next;
  return next;
}

function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

// Nome do tipo: o texto personalizado no painel ou o padrão no idioma de quem lê.
function typeLabel(type, source, options = null) {
  const custom = options?.types?.[type]?.label;
  if (custom) return custom;
  return t(type === 'report' ? 'tickets.type_report' : 'tickets.type_help', source);
}

async function replyEphemeral(source, content) {
  if (typeof source.reply === 'function') {
    return source.reply({ content, flags: 64, allowedMentions: NO_PINGS });
  }
  return source.channel?.send({ content, allowedMentions: NO_PINGS });
}

// =========================================================================
// Painel público
// =========================================================================

/**
 * Constrói o embed e os botões do painel público de atendimento.
 * @param {string|object} guildOrGuildId
 */
const TYPE_STYLE = {
  help: { emoji: '🆘', style: ButtonStyle.Primary },
  report: { emoji: '🚨', style: ButtonStyle.Danger },
};

function panelTypeLine(type, gId, options) {
  const custom = options.types[type];
  if (!custom.label && !custom.description) return t(`tickets.opt_${type}`, gId);
  return t('tickets.opt_custom', gId, {
    emoji: TYPE_STYLE[type].emoji,
    label: custom.label || t(`tickets.name_${type}`, gId),
    description: custom.description || t(`tickets.desc_${type}`, gId),
  });
}

function buildTicketPanel(guildOrGuildId, optionsOverride = null) {
  const gId = String(resolveGuildId(guildOrGuildId) || '');
  const guildName = typeof guildOrGuildId === 'object' && guildOrGuildId?.name ? guildOrGuildId.name : 'Pyxie';
  const options = optionsOverride ? normalizeTicketOptions(gId, optionsOverride) : getTicketOptions(gId);
  const types = ['help', 'report'].filter((type) => options.types[type].enabled);
  // Remoção de Conteúdo: só na zona da Cringelândia e se estiver ligada lá
  const withArt = isCringelandiaGuild(gId) && Boolean(options.artRemoval?.enabled);

  const lines = [options.panelIntro || t('tickets.panel_intro', gId), t('tickets.panel_section', gId)];
  for (const type of types) lines.push(panelTypeLine(type, gId, options));
  if (withArt) lines.push(t('tickets.opt_art', gId));
  lines.push(t('tickets.panel_note', gId));

  const embed = new EmbedBuilder()
    .setColor(COLOR_PRIMARY)
    .setTitle(options.panelTitle || t('tickets.panel_title', gId))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('tickets.panel_footer', gId, { guild: guildName }) });

  const row = new ActionRowBuilder().addComponents(
    types.map((type) =>
      new ButtonBuilder()
        .setCustomId(`tkt:open:${type}`)
        .setLabel(options.types[type].label || t(`tickets.btn_${type}`, gId))
        .setEmoji(TYPE_STYLE[type].emoji)
        .setStyle(TYPE_STYLE[type].style)
    )
  );

  if (withArt) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('tkt:open:art_removal')
        .setLabel(t('tickets.btn_art', gId))
        .setEmoji('🖼️')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  return { embeds: [embed], components: [row] };
}

function isTicketPanelMessage(message, botId) {
  if (!message || message.author?.id !== botId) return false;
  return (message.components || []).some((row) =>
    (row.components || []).some((c) => String(c.customId || c.data?.custom_id || '').startsWith('tkt:open:'))
  );
}

/**
 * Publica um painel novo no canal configurado (usado pelo setup do administrador).
 */
async function publishTicketPanel(guild) {
  const cfg = getTicketConfig(guild.id);
  if (!cfg.ticketPanelChannelId) return null;

  const panelChannel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
  if (!panelChannel || !panelChannel.isTextBased()) return null;

  if (cfg.ticketPanelMessageId) {
    await panelChannel.messages.delete(cfg.ticketPanelMessageId).catch(() => null);
  }
  const sent = await panelChannel.send(buildTicketPanel(guild));
  setTicketConfig(guild.id, { ticketPanelMessageId: sent.id });
  return sent;
}

/**
 * Atualiza o painel deste servidor editando a mensagem no lugar. Sem painel publicado,
 * publica um novo só quando `postIfMissing` (botão do painel web); senão não faz nada.
 * @returns {Promise<{ mode: 'edited'|'posted'|'none', messageId?: string, channelId?: string }>}
 */
async function updateTicketPanel(guild, { postIfMissing = false } = {}) {
  const cfg = getTicketConfig(guild.id);
  if (!cfg.ticketPanelChannelId) return { mode: 'none' };
  const channel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return { mode: 'none' };

  const message = cfg.ticketPanelMessageId ? await channel.messages.fetch(cfg.ticketPanelMessageId).catch(() => null) : null;
  if (message) {
    await message.edit(buildTicketPanel(guild));
    return { mode: 'edited', messageId: message.id, channelId: channel.id };
  }
  if (!postIfMissing) return { mode: 'none' };
  const sent = await publishTicketPanel(guild);
  return sent ? { mode: 'posted', messageId: sent.id, channelId: channel.id } : { mode: 'none' };
}

/**
 * Atualiza, editando no lugar, os painéis já publicados. Nunca posta mensagens novas:
 * se o painel não for encontrado, o servidor é ignorado.
 */
async function refreshTicketPanels(client) {
  const summary = { updated: 0, skipped: 0 };
  if (!client?.guilds?.cache || !client.user) return summary;

  for (const guild of client.guilds.cache.values()) {
    const cfg = getTicketConfig(guild.id);
    if (!cfg.ticketPanelChannelId) continue;

    try {
      const channel = await guild.channels.fetch(cfg.ticketPanelChannelId).catch(() => null);
      if (!channel || !channel.isTextBased()) {
        summary.skipped++;
        continue;
      }

      let panelMessage = null;
      if (cfg.ticketPanelMessageId) {
        panelMessage = await channel.messages.fetch(cfg.ticketPanelMessageId).catch(() => null);
      }
      if (!panelMessage) {
        const recent = await channel.messages.fetch({ limit: 50 }).catch(() => null);
        panelMessage = recent ? [...recent.values()].find((m) => isTicketPanelMessage(m, client.user.id)) : null;
      }
      if (!panelMessage) {
        summary.skipped++;
        continue;
      }

      await panelMessage.edit(buildTicketPanel(guild));
      if (cfg.ticketPanelMessageId !== panelMessage.id) {
        setTicketConfig(guild.id, { ticketPanelMessageId: panelMessage.id });
      }
      summary.updated++;
    } catch (err) {
      summary.skipped++;
      console.warn(`[ticketManager] Falha ao atualizar painel em ${guild.id}:`, err.message);
    }
  }

  console.log(`[ticketManager] Painéis de tickets atualizados no lugar: ${summary.updated} (ignorados: ${summary.skipped}).`);
  return summary;
}

// =========================================================================
// Abertura de salas
// =========================================================================

function buildRoomComponents(ticket, source, claimedName = null) {
  const claimButton = new ButtonBuilder()
    .setCustomId(`tkt:claim:${ticket.channelId}`)
    .setEmoji('🙋')
    .setStyle(claimedName ? ButtonStyle.Success : ButtonStyle.Secondary)
    .setLabel(claimedName ? t('tickets.btn_claimed', source, { user: claimedName }).slice(0, 34) : t('tickets.btn_claim', source))
    .setDisabled(Boolean(claimedName));

  const closeButton = new ButtonBuilder()
    .setCustomId(`tkt:close:${ticket.channelId}`)
    .setEmoji('🔒')
    .setLabel(t('tickets.btn_close', source))
    .setStyle(ButtonStyle.Danger);

  return [new ActionRowBuilder().addComponents(claimButton, closeButton)];
}

// Recepção da sala. A mensagem personalizada do painel substitui os passos padrão.
function buildRoomWelcomeEmbed({ source, number, type, userId, guildName, options }) {
  const body = options.roomMessage
    ? [options.roomMessage]
    : [t('tickets.room_section', source), t('tickets.room_step1', source), t('tickets.room_step2', source), t('tickets.room_step3', source)];
  return new EmbedBuilder()
    .setColor(COLOR_PRIMARY)
    .setTitle(t('tickets.room_title', source, { number: padNumber(number), type: typeLabel(type, source, options) }))
    .setDescription([t('tickets.room_greeting', source, { user: `<@${userId}>` }), ...body, t('tickets.room_note', source)].join('\n\n'))
    .setFooter({ text: t('tickets.room_footer', source, { guild: guildName }) })
    .setTimestamp();
}

async function getLogChannel(guild) {
  const { ticketLogChannelId } = getTicketConfig(guild.id);
  if (!ticketLogChannelId) return null;
  const channel = await guild.channels.fetch(ticketLogChannelId).catch(() => null);
  return channel && channel.isTextBased() ? channel : null;
}

/**
 * Abre sala de atendimento para Ajuda ou Denúncia
 */
async function handleOpenTicket(interaction, type) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  const { guild, user } = interaction;
  if (!guild) return;

  const config = getTicketConfig(guild.id);
  const options = getTicketOptions(guild.id);
  // Painéis antigos ainda podem ter o botão de um tipo desligado no painel web: o bot recusa.
  if (!options.types[type]?.enabled) {
    return replyEphemeral(interaction, t('tickets.type_disabled', interaction));
  }
  if (!config.ticketCategoryId) {
    return replyEphemeral(interaction, t('tickets.no_category', interaction));
  }

  const category = guild.channels.cache.get(config.ticketCategoryId);
  if (!category || category.type !== ChannelType.GuildCategory) {
    return replyEphemeral(interaction, t('tickets.category_missing', interaction));
  }

  const lockKey = `${guild.id}:${user.id}`;
  if (openingLocks.has(lockKey)) {
    return replyEphemeral(interaction, t('tickets.opening_busy', interaction));
  }

  const db = loadTicketsData();
  const userOpen = Object.values(db.tickets).filter(
    (tk) => tk.guildId === guild.id && tk.userId === user.id && tk.status === 'OPEN'
  );

  // Salas apagadas manualmente não podem travar o membro para sempre
  let pruned = false;
  for (const tk of userOpen) {
    if (!guild.channels.cache.has(tk.channelId)) {
      tk.status = 'CLOSED';
      tk.closedBy = 'channel_missing';
      tk.closedAt = Date.now();
      pruned = true;
    }
  }
  if (pruned) saveTicketsData(db);
  const stillOpen = userOpen.filter((tk) => tk.status === 'OPEN');

  const sameType = stillOpen.find((tk) => tk.type === type);
  if (sameType) {
    return replyEphemeral(interaction, t('tickets.already_open', interaction, { channel: `<#${sameType.channelId}>` }));
  }
  if (stillOpen.length >= options.maxOpenPerUser) {
    return replyEphemeral(interaction, t('tickets.limit_reached', interaction, { limit: options.maxOpenPerUser }));
  }

  openingLocks.add(lockKey);
  try {
    await interaction.deferReply({ flags: 64 });

    const lang = getLanguage(interaction);
    const number = nextTicketNumber(db, guild.id);
    const numberLabel = padNumber(number);
    const typeSlug = type === 'report' ? (lang === 'pt' ? 'denuncia' : 'report') : (lang === 'pt' ? 'ajuda' : 'help');
    const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 15) || 'user';

    const staffRolesOverwrites = staffRoleIdsFor(guild).map((roleId) => ({
      id: roleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    }));

    const ticketChannel = await guild.channels.create({
      name: `${typeSlug}-${numberLabel}-${cleanUsername}`,
      type: ChannelType.GuildText,
      parent: category.id,
      topic: `Ticket #${numberLabel} • ${typeLabel(type, interaction, options)} • ${user.tag || user.username} (${user.id})`,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
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
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        ...staffRolesOverwrites,
      ],
    });

    const ticketId = `tkt_${guild.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const ticket = {
      id: ticketId,
      number,
      guildId: guild.id,
      channelId: ticketChannel.id,
      userId: user.id,
      userTag: user.tag || user.username,
      type,
      status: 'OPEN',
      createdAt: Date.now(),
    };
    db.tickets[ticketId] = ticket;
    saveTicketsData(db);

    const welcomeEmbed = buildRoomWelcomeEmbed({ source: interaction, number, type, userId: user.id, guildName: guild.name, options });

    const welcomeMessage = await ticketChannel.send({
      content: `<@${user.id}>`,
      embeds: [welcomeEmbed],
      components: buildRoomComponents(ticket, interaction),
      allowedMentions: { users: [user.id] },
    });
    ticket.welcomeMessageId = welcomeMessage?.id || null;
    saveTicketsData(db);

    await interaction.editReply({ content: t('tickets.created', interaction, { channel: `<#${ticketChannel.id}>` }) });

    const logChannel = await getLogChannel(guild);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setColor(type === 'report' ? COLOR_WARNING : COLOR_PRIMARY)
        .setTitle(t('tickets.log_open_title', guild.id))
        .setDescription(
          t('tickets.log_open_desc', guild.id, {
            user: `<@${user.id}>`,
            number: numberLabel,
            type: typeLabel(type, guild.id, options),
            channel: `<#${ticketChannel.id}>`,
          })
        )
        .setFooter({ text: t('tickets.room_footer', guild.id, { guild: guild.name }) })
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed], allowedMentions: NO_PINGS }).catch(() => null);
    }
  } catch (err) {
    console.error('[ticketManager] Erro ao criar canal de ticket:', err);
    await interaction.editReply({ content: t('tickets.create_error', interaction) }).catch(() => null);
  } finally {
    openingLocks.delete(lockKey);
  }
}

// =========================================================================
// Assumir atendimento
// =========================================================================

async function handleClaimTicket(interaction, channelId) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  if (!isStaffMember(interaction.member, interaction.guild)) {
    return replyEphemeral(interaction, t('tickets.claim_no_permission', interaction));
  }

  const db = loadTicketsData();
  const ticket = findTicketByChannel(db, channelId);
  if (!ticket || ticket.status !== 'OPEN' || interaction.channel?.id !== channelId) {
    return replyEphemeral(interaction, t('tickets.close_not_ticket', interaction));
  }
  if (ticket.claimedBy) {
    return replyEphemeral(interaction, t('tickets.claim_already', interaction, { user: `<@${ticket.claimedBy}>` }));
  }

  ticket.claimedBy = interaction.user.id;
  ticket.claimedAt = Date.now();
  saveTicketsData(db);

  const displayName = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;
  await interaction.update({ components: buildRoomComponents(ticket, interaction, displayName) });
  await interaction.followUp({
    content: t('tickets.claim_done', interaction, { user: `<@${interaction.user.id}>` }),
    allowedMentions: NO_PINGS,
  });
}

// =========================================================================
// Encerramento, transcrição e registros
// =========================================================================

async function fetchAllMessages(channel, max = TRANSCRIPT_MAX_MESSAGES) {
  const collected = [];
  let before;
  while (collected.length < max) {
    const batch = await channel.messages.fetch({ limit: 100, ...(before ? { before } : {}) }).catch(() => null);
    if (!batch || batch.size === 0) break;
    const values = [...batch.values()];
    collected.push(...values);
    before = values[values.length - 1].id;
    if (batch.size < 100) break;
  }
  return collected.reverse();
}

/**
 * Formata a transcrição em texto puro (do mais antigo para o mais recente).
 */
function formatTranscript(messages, { number, guildName, authorTag, lang = 'pt' }) {
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const header = t('tickets.transcript_header', lang, {
    number: padNumber(number || 0),
    guild: guildName || 'Pyxie',
    user: authorTag || '?',
  });

  const lines = [header, '='.repeat(Math.min(header.length, 80)), ''];
  for (const msg of messages) {
    const when = new Date(msg.createdTimestamp || Date.now()).toLocaleString(locale, { timeZone: 'America/Sao_Paulo' });
    const author = msg.author?.tag || msg.author?.username || 'unknown';
    const parts = [];
    if (msg.content) parts.push(msg.content);
    for (const embed of msg.embeds || []) {
      const title = embed.title || embed.data?.title;
      if (title) parts.push(`[embed] ${title}`);
    }
    const attachments = msg.attachments?.values ? [...msg.attachments.values()] : msg.attachments || [];
    for (const att of attachments) {
      if (att?.url) parts.push(`[anexo] ${att.url}`);
    }
    lines.push(`[${when}] ${author}: ${parts.join(' ') || '(sem texto)'}`);
  }
  return lines.join('\n');
}

/**
 * Fecha a sala: registra, gera transcrição, envia para registros e DM do autor e apaga o canal.
 */
async function performTicketClose({ guild, channel, ticket, closerId, reason = null }) {
  const db = loadTicketsData();
  const entry = db.tickets[ticket.id] || ticket;
  entry.status = 'CLOSED';
  entry.closedBy = closerId;
  entry.closedAt = Date.now();
  if (reason) entry.closeReason = String(reason).slice(0, 500);
  db.tickets[entry.id] = entry;
  saveTicketsData(db);

  await channel.send({
    content: t('tickets.close_announce', guild.id, { user: `<@${closerId}>` }),
    allowedMentions: NO_PINGS,
  }).catch(() => null);

  const lang = getLanguage(guild.id);
  const numberLabel = padNumber(entry.number || 0);
  let messageCount = 0;
  let transcriptBuffer = null;
  try {
    const messages = await fetchAllMessages(channel);
    messageCount = messages.length;
    transcriptBuffer = Buffer.from(
      formatTranscript(messages, { number: entry.number, guildName: guild.name, authorTag: entry.userTag, lang }),
      'utf8'
    );
  } catch (err) {
    console.warn('[ticketManager] Falha ao gerar transcrição:', err.message);
  }
  const transcriptName = `ticket-${numberLabel}.txt`;

  const logChannel = await getLogChannel(guild);
  if (logChannel) {
    const none = t('tickets.log_none', guild.id);
    const logEmbed = new EmbedBuilder()
      .setColor(COLOR_MUTED)
      .setTitle(t('tickets.log_close_title', guild.id))
      .addFields(
        { name: t('tickets.log_field_author', guild.id), value: `<@${entry.userId}>`, inline: true },
        { name: t('tickets.log_field_type', guild.id), value: `\`#${numberLabel}\` ${typeLabel(entry.type, guild.id, getTicketOptions(guild.id))}`, inline: true },
        { name: t('tickets.log_field_claimed', guild.id), value: entry.claimedBy ? `<@${entry.claimedBy}>` : none, inline: true },
        { name: t('tickets.log_field_closed', guild.id), value: `<@${closerId}>`, inline: true },
        { name: t('tickets.log_field_duration', guild.id), value: `\`${formatDuration(entry.closedAt - entry.createdAt)}\``, inline: true },
        { name: t('tickets.log_field_messages', guild.id), value: `\`${messageCount}\``, inline: true }
      )
      .setFooter({ text: t('tickets.room_footer', guild.id, { guild: guild.name }) })
      .setTimestamp();
    if (entry.closeReason) {
      logEmbed.addFields({ name: t('tickets.log_field_reason', guild.id), value: `> ${entry.closeReason}`, inline: false });
    }
    await logChannel.send({
      embeds: [logEmbed],
      files: transcriptBuffer ? [new AttachmentBuilder(transcriptBuffer, { name: transcriptName })] : [],
      allowedMentions: NO_PINGS,
    }).catch(() => null);
  }

  try {
    // A cópia na DM do autor pode ser desligada no painel
    const author = getTicketOptions(guild.id).dmTranscript ? await guild.client.users.fetch(entry.userId).catch(() => null) : null;
    if (author) {
      await author.send({
        content: t('tickets.close_dm', guild.id, { number: numberLabel, guild: guild.name }),
        files: transcriptBuffer ? [new AttachmentBuilder(transcriptBuffer, { name: transcriptName })] : [],
      });
    }
  } catch (_) {}

  setTimeout(async () => {
    try {
      await channel.delete(`Ticket #${numberLabel} encerrado.`);
    } catch (_) {}
  }, CLOSE_DELETE_DELAY_MS);

  return entry;
}

/**
 * Botão Fechar: autor ou Staff. Pede confirmação antes de apagar a sala.
 */
async function handleCloseTicket(interaction, channelId) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  const channel = interaction.channel;
  const db = loadTicketsData();
  const ticket = channel ? findTicketByChannel(db, channel.id) : null;
  const isAuthor = Boolean(ticket && ticket.userId === interaction.user?.id);

  if (!isStaffMember(interaction.member, interaction.guild) && !isAuthor) {
    return replyEphemeral(interaction, t('tickets.close_no_permission', interaction));
  }
  if (!channel || (channelId && channel.id !== channelId)) {
    return replyEphemeral(interaction, t('tickets.close_invalid_channel', interaction));
  }
  if (!ticket || ticket.status !== 'OPEN') {
    return replyEphemeral(interaction, t('tickets.close_not_ticket', interaction));
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`tkt:close_confirm:${channel.id}`)
      .setEmoji('🔒')
      .setLabel(t('tickets.btn_confirm_close', interaction))
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`tkt:close_cancel:${channel.id}`)
      .setLabel(t('tickets.btn_cancel_close', interaction))
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.reply({ content: t('tickets.close_confirm_prompt', interaction), components: [row], flags: 64 });
}

async function handleCloseConfirm(interaction, channelId) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  const channel = interaction.channel;
  const db = loadTicketsData();
  const ticket = channel ? findTicketByChannel(db, channel.id) : null;
  const isAuthor = Boolean(ticket && ticket.userId === interaction.user?.id);

  if (!isStaffMember(interaction.member, interaction.guild) && !isAuthor) {
    return replyEphemeral(interaction, t('tickets.close_no_permission', interaction));
  }
  if (!channel || channel.id !== channelId || !ticket || ticket.status !== 'OPEN') {
    return interaction.update({ content: t('tickets.close_not_ticket', interaction), components: [] });
  }

  await interaction.update({ content: t('tickets.close_announce', interaction, { user: `<@${interaction.user.id}>` }), components: [] });
  return performTicketClose({ guild: interaction.guild, channel, ticket, closerId: interaction.user.id });
}

async function handleCloseCancel(interaction) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  return interaction.update({ content: t('tickets.close_cancelled', interaction), components: [] });
}

/**
 * Encerramento via comando (py!fechar [motivo] ou /py-close). Sem confirmação: o comando já é explícito.
 */
async function closeTicketByCommand(source, reason = null) {
  const member = source.member;
  const channel = source.channel;
  const userId = source.user?.id || source.author?.id || member?.id;

  const db = loadTicketsData();
  const ticket = channel ? findTicketByChannel(db, channel.id) : null;
  const isAuthor = Boolean(ticket && ticket.userId === userId);

  if (!isStaffMember(member, source.guild) && !isAuthor) {
    return replyEphemeral(source, t('tickets.close_no_permission', source));
  }
  if (!ticket || ticket.status !== 'OPEN') {
    return replyEphemeral(source, t('tickets.close_not_ticket', source));
  }

  if (typeof source.reply === 'function' && source.isChatInputCommand?.()) {
    await source.reply({ content: t('tickets.close_announce', source, { user: `<@${userId}>` }), flags: 64 });
  }
  return performTicketClose({ guild: source.guild, channel, ticket, closerId: userId, reason });
}

/**
 * Sala apagada manualmente: encerra o registro para não travar o membro.
 */
function markTicketChannelDeleted(channel) {
  if (!channel?.id) return false;
  const db = loadTicketsData();
  const ticket = findTicketByChannel(db, channel.id);
  if (!ticket || ticket.status !== 'OPEN') return false;
  ticket.status = 'CLOSED';
  ticket.closedBy = 'channel_deleted';
  ticket.closedAt = Date.now();
  saveTicketsData(db);
  return true;
}

function getTicketStats(guildId = null) {
  const db = loadTicketsData();
  const tickets = Object.values(db.tickets).filter((tk) => !guildId || tk.guildId === guildId);
  const closed = tickets.filter((tk) => tk.status === 'CLOSED' && tk.closedAt && tk.createdAt);
  const avgResolutionMs = closed.length
    ? Math.round(closed.reduce((acc, tk) => acc + (tk.closedAt - tk.createdAt), 0) / closed.length)
    : 0;

  return {
    total: tickets.length,
    open: tickets.filter((tk) => tk.status === 'OPEN').length,
    closed: closed.length,
    claimed: tickets.filter((tk) => tk.claimedBy).length,
    byType: {
      help: tickets.filter((tk) => tk.type === 'help').length,
      report: tickets.filter((tk) => tk.type === 'report').length,
    },
    avgResolutionMs,
    // Os pedidos de remoção são todos da Cringelândia: nos outros servidores a conta é zero
    artRemovalsPending: !guildId || isCringelandiaGuild(guildId) ? Object.values(db.artRemovals).filter((r) => r.status === 'PENDING').length : 0,
  };
}

// =========================================================================
// Painel web (/dashboard): chamado pela ponte no processo do bot (dashboardBridge.js)
// =========================================================================

function listOpenTickets(guild, limit = 50) {
  const db = loadTicketsData();
  return Object.values(db.tickets)
    .filter((tk) => tk.guildId === guild.id && tk.status === 'OPEN')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((tk) => ({
      id: tk.id,
      number: tk.number || 0,
      type: tk.type,
      userId: tk.userId,
      userTag: tk.userTag || '',
      channelId: tk.channelId,
      channelName: guild.channels?.cache?.get(tk.channelId)?.name || null,
      claimedBy: tk.claimedBy || null,
      createdAt: tk.createdAt,
    }));
}

function listArtRemovals(limit = 25) {
  const db = loadTicketsData();
  return Object.values(db.artRemovals)
    .filter((r) => r.status === 'PENDING')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
    .map((r) => ({ requestId: r.requestId, userId: r.userId, userTag: r.userTag || '', details: String(r.details || '').slice(0, 300), createdAt: r.createdAt }));
}

/**
 * Cria a categoria 📩・ATENDIMENTO no topo com acesso da Staff e publica o painel (botão "Crie pra mim").
 */
async function createTicketCategory(guild) {
  const permissionOverwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: guild.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    ...staffRoleIdsFor(guild).map((roleId) => ({
      id: roleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    })),
  ];
  const category = await guild.channels.create({
    name: '📩・ATENDIMENTO',
    type: ChannelType.GuildCategory,
    position: 0,
    permissionOverwrites,
  });
  setTicketConfig(guild.id, { ticketCategoryId: category.id });
  await publishTicketPanel(guild).catch(() => null);
  return category;
}

/**
 * Fecha pelo painel web: mesmo fluxo do botão (transcrição, registros, DM), sem confirmação.
 */
async function closeTicketFromPanel(guild, ticketId, closerId) {
  const db = loadTicketsData();
  const ticket = db.tickets[ticketId];
  if (!ticket || ticket.guildId !== guild.id) throw new Error('ticket_not_found');
  if (ticket.status !== 'OPEN') throw new Error('ticket_closed');
  const channel = await guild.channels.fetch(ticket.channelId).catch(() => null);
  if (!channel) {
    ticket.status = 'CLOSED';
    ticket.closedBy = 'channel_missing';
    ticket.closedAt = Date.now();
    saveTicketsData(db);
    return { closed: true, channelMissing: true };
  }
  await performTicketClose({ guild, channel, ticket, closerId });
  return { closed: true, channelMissing: false };
}

// =========================================================================
// Remoção de conteúdo do Museu (exclusivo da Cringelândia)
// =========================================================================

async function handleArtRemovalClick(interaction) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  if (interaction.guild && !isCringelandiaGuild(interaction.guild)) return;
  if (!getTicketOptions(CRING_ID).artRemoval?.enabled) {
    return replyEphemeral(interaction, t('tickets.type_disabled', interaction));
  }

  const modal = new ModalBuilder()
    .setCustomId('tkt:modal:art_removal')
    .setTitle(t('tickets.art_modal_title', interaction));

  const detailsInput = new TextInputBuilder()
    .setCustomId('tkt:art_details')
    .setLabel(t('tickets.art_modal_label', interaction))
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(t('tickets.art_modal_placeholder', interaction))
    .setRequired(true)
    .setMaxLength(1500);

  modal.addComponents(new ActionRowBuilder().addComponents(detailsInput));
  await interaction.showModal(modal);
}

async function handleArtRemovalSubmit(interaction) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  const { user, client } = interaction;
  if (interaction.guild && !isCringelandiaGuild(interaction.guild)) return;
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

  const dmMessage = t('tickets.art_dm', interaction);
  let dmSent = false;
  try {
    await user.send(dmMessage);
    dmSent = true;
  } catch (_) {}

  await interaction.reply({
    content: dmSent ? t('tickets.art_sent_dm', interaction) : t('tickets.art_sent_inline', interaction, { message: dmMessage }),
    flags: 64,
  });

  // Cartão da Staff no canal de aprovações (sempre no idioma da Cringelândia)
  try {
    const approvalChannelId = getTicketOptions(CRING_ID).artRemoval?.channelId || ART_REMOVAL_CHANNEL_ID;
    const approvalChannel = await client.channels.fetch(approvalChannelId).catch(() => null);
    if (approvalChannel && approvalChannel.isTextBased()) {
      const pendingEmbed = new EmbedBuilder()
        .setColor(COLOR_WARNING)
        .setTitle(t('tickets.art_pending_title', CRING_ID))
        .setDescription(
          [
            t('tickets.art_pending_desc', CRING_ID, { user: `<@${user.id}>`, tag: user.tag || user.username }),
            t('tickets.art_section_details', CRING_ID),
            `> ${details.replace(/\n/g, '\n> ')}`,
          ].join('\n\n')
        )
        .addFields(
          { name: t('tickets.art_field_requester', CRING_ID), value: `<@${user.id}> (\`${user.id}\`)`, inline: true },
          {
            name: t('tickets.art_field_link', CRING_ID),
            value: `[${t('tickets.art_link_label', CRING_ID)}](https://pyxie.com.br/museu?user=${user.id})`,
            inline: true,
          },
          { name: t('tickets.art_field_deadline', CRING_ID), value: `<t:${Math.floor((Date.now() + 48 * 3600000) / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: t('tickets.art_footer', CRING_ID, { requestId }) })
        .setTimestamp();

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`tkt:art_done:${user.id}:${requestId}`)
          .setEmoji('✅')
          .setLabel(t('tickets.btn_art_done', CRING_ID))
          .setStyle(ButtonStyle.Success)
      );

      const sentMsg = await approvalChannel.send({ embeds: [pendingEmbed], components: [actionRow], allowedMentions: NO_PINGS });

      db.artRemovals[requestId].messageId = sentMsg?.id || 'msg_unknown';
      db.artRemovals[requestId].channelId = sentMsg?.channel?.id || approvalChannel.id;
      saveTicketsData(db);
    }
  } catch (err) {
    console.error('[ticketManager] Erro ao despachar solicitação de remoção de arte:', err);
  }
}

async function handleArtRemovalDone(interaction, targetUserId, requestId) {
  if (!interaction || interaction.replied || interaction.deferred) return;
  if (!isStaffMember(interaction.member, CRING_ID)) {
    return replyEphemeral(interaction, t('tickets.art_done_no_permission', CRING_ID));
  }

  const db = loadTicketsData();
  const request = db.artRemovals[requestId];
  const alreadyDone = request?.status === 'DONE';

  if (!alreadyDone) {
    try {
      const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => null);
      if (targetUser) await targetUser.send(t('tickets.art_done_dm', CRING_ID));
    } catch (_) {}
  }

  const completedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
    .setColor(COLOR_SUCCESS)
    .setTitle(t('tickets.art_done_title', CRING_ID))
    .addFields({
      name: t('tickets.art_field_done_by', CRING_ID),
      value: `<@${interaction.user.id}> • <t:${Math.floor(Date.now() / 1000)}:f>`,
      inline: false,
    });

  await interaction.update({ embeds: [completedEmbed], components: [], allowedMentions: NO_PINGS });

  if (request && !alreadyDone) {
    request.status = 'DONE';
    request.resolvedBy = interaction.user.id;
    request.resolvedAt = Date.now();
    saveTicketsData(db);
  }
}

module.exports = {
  TICKETS_DATA_FILE,
  MAX_OPEN_TICKETS_PER_USER,
  loadTicketsData,
  saveTicketsData,
  buildTicketPanel,
  publishTicketPanel,
  updateTicketPanel,
  refreshTicketPanels,
  buildRoomWelcomeEmbed,
  getTicketOptions,
  isStaffMember,
  staffRoleIdsFor,
  listOpenTickets,
  listArtRemovals,
  createTicketCategory,
  closeTicketFromPanel,
  isTicketPanelMessage,
  handleOpenTicket,
  handleClaimTicket,
  handleArtRemovalClick,
  handleArtRemovalSubmit,
  handleArtRemovalDone,
  handleCloseTicket,
  handleCloseConfirm,
  handleCloseCancel,
  closeTicketByCommand,
  performTicketClose,
  formatTranscript,
  formatDuration,
  markTicketChannelDeleted,
  getTicketStats,
  ART_REMOVAL_CHANNEL_ID,
  CRINGELANDIA_GUILD_ID,
};

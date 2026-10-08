const {
  AttachmentBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { EXPORT_MESSAGES } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');

const name = EXPORT_MESSAGES || 'py-exportar';
const aliases = ['exportar', 'py-exportar', 'export', 'py-export', 'export-messages', 'py-export-messages'];

function isManager(source) {
  return Boolean(source.member?.permissions?.has(PermissionFlagsBits.ManageGuild) || source.member?.permissions?.has(PermissionFlagsBits.Administrator));
}

function formatMessageLog(msg) {
  const ts = msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString();
  const authorTag = msg.author ? `${msg.author.tag || msg.author.username} (${msg.author.id})` : 'Desconhecido';
  const botTag = msg.author?.bot ? ' [BOT]' : '';
  const content = msg.cleanContent || msg.content || '(sem conteúdo em texto)';
  
  let attachmentsText = '';
  if (msg.attachments && (msg.attachments.size > 0 || msg.attachments.length > 0)) {
    const list = typeof msg.attachments.map === 'function'
      ? msg.attachments.map((a) => a.url)
      : Array.from(msg.attachments.values()).map((a) => a.url);
    const urls = list.filter(Boolean).join(', ');
    if (urls) {
      attachmentsText = `\n  [Anexos: ${urls}]`;
    }
  }

  let embedsText = '';
  if (msg.embeds && msg.embeds.length > 0) {
    embedsText = `\n  [Embeds: ${msg.embeds.length} embed(s)]`;
  }

  return `[${ts}] ${authorTag}${botTag}: ${content}${attachmentsText}${embedsText}`;
}

async function handleExport({ channel, guild, member, source, replyFn }) {
  if (!isManager(source)) {
    return replyFn({ content: t('admin.noPermission', source) });
  }

  if (!channel || !channel.isTextBased()) {
    return replyFn({ content: t('admin.welcomeNeedChannel', source) });
  }

  try {
    const fetched = await channel.messages.fetch({ limit: 50 });
    if (!fetched || fetched.size === 0) {
      return replyFn({ content: t('admin.exportMessagesEmpty', source) });
    }

    // Ordenar cronologicamente (da mais antiga para a mais recente das últimas 50)
    const sortedMessages = Array.from(fetched.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const header = [
      '================================================================================',
      `RELATÓRIO DE AUDITORIA DE MENSAGENS — PYXIE CORE`,
      `Servidor: ${guild?.name || 'Desconhecido'} (${guild?.id || 'N/A'})`,
      `Canal: #${channel.name || 'desconhecido'} (${channel.id})`,
      `Exportado por: ${member?.user?.tag || member?.user?.username || 'Admin'} (${member?.id || 'N/A'})`,
      `Data/Hora da Exportação: ${new Date().toISOString()}`,
      `Total de Mensagens Exportadas: ${sortedMessages.length}`,
      '================================================================================',
      '',
    ].join('\n');

    const body = sortedMessages.map((m) => formatMessageLog(m)).join('\n');
    const fullText = `${header}\n${body}\n`;

    const cleanChannelName = (channel.name || 'chat').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `historico-${cleanChannelName}-ultimas-${sortedMessages.length}.txt`;
    const attachment = new AttachmentBuilder(Buffer.from(fullText, 'utf8'), { name: fileName });

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle(t('admin.exportMessagesTitle', source, { channel: `#${channel.name || 'canal'}` }))
      .setDescription(t('admin.exportMessagesDesc', source, { count: sortedMessages.length, channel: `<#${channel.id}>` }))
      .setFooter({ text: t('admin.exportMessagesFooter', source) })
      .setTimestamp();

    return replyFn({
      embeds: [embed],
      files: [attachment],
    });
  } catch (err) {
    console.error('Erro ao buscar e exportar mensagens:', err);
    return replyFn({ content: t('common.error', source) });
  }
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  ephemeral: true,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Exports the last 50 messages from the channel into a .txt file for administration.')
    .setDescriptionLocalizations({
      'pt-BR': 'Exporta as últimas 50 mensagens do canal em um arquivo .txt para a administração.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setNameLocalizations({
          'pt-BR': 'canal',
        })
        .setDescription('Channel to export messages from (optional, defaults to current channel).')
        .setDescriptionLocalizations({
          'pt-BR': 'Canal de onde exportar as mensagens (opcional, padrão é o canal atual).',
        })
        .addChannelTypes([0, 5]) // GuildText, GuildAnnouncement
        .setRequired(false)
    ),

  async executeSlash({ interaction }) {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    await handleExport({
      channel: targetChannel,
      guild: interaction.guild,
      member: interaction.member,
      source: interaction,
      replyFn: (payload) => interaction.editReply(payload),
    });
  },

  async executePrefix({ message, args }) {
    if (!message.guild) {
      await message.reply(t('admin.onlyServer', message));
      return;
    }

    const mentionedChannel = message.mentions?.channels?.first?.() || (args && args[0] && message.guild?.channels?.cache ? message.guild.channels.cache.get(args[0]) : null);
    const targetChannel = mentionedChannel || message.channel;

    await handleExport({
      channel: targetChannel,
      guild: message.guild,
      member: message.member,
      source: message,
      replyFn: (payload) => message.reply(payload),
    });
  },
};

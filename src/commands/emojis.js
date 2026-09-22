const { AttachmentBuilder, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { serializeGuildEmojis, createEmojiOption } = require('../utils/serverEmojis');
const { EMOJIS } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');

const name = EMOJIS || 'py-emojis';
const PAGE_SIZE = 25;

function isManager(source) {
  return source.member?.permissions?.has(PermissionFlagsBits.ManageGuild);
}

function buildFile(guild, emojisList = null) {
  const emojis = emojisList || serializeGuildEmojis(guild);
  const payload = {
    guild: { id: guild.id, name: guild.name },
    exportedAt: new Date().toISOString(),
    total: emojis.length,
    animated: emojis.filter((emoji) => emoji.animated).length,
    emojis,
  };
  return {
    file: new AttachmentBuilder(Buffer.from(JSON.stringify(payload, null, 2), 'utf8'), { name: 'emojis-do-servidor.json' }),
    count: emojis.length,
    animated: payload.animated,
  };
}

function buildSummary(guild, count, animated, source = null) {
  const guildName = guild?.name || 'Servidor';
  const lang = getLanguage(source || guild);

  return new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(t('admin.emojisExportTitle', source || guild, { server: guildName }))
    .setDescription(t('admin.emojisExportDesc', source || guild, { server: guildName, count, animated }))
    .setFooter({ text: `${guildName} • ${lang === 'en' ? 'Downloadable Emoji Catalog' : 'Catálogo baixável de emojis'}` })
    .setTimestamp();
}

function buildUsage(source = null) {
  return t('admin.noPermission', source);
}

/** Build an embed that previews a single emoji */
function buildEmojiPreview(guild, emoji, source = null) {
  const isAnimated = Boolean(emoji.animated);
  const emojiFormat = emoji.format || (emoji.id ? (isAnimated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`) : '');
  const lang = getLanguage(source || guild);

  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(`${emoji.name || 'Emoji'}`)
    .setDescription(
      `${emojiFormat ? `${emojiFormat} ` : ''}**${emoji.name || 'Emoji'}**\n\n` +
      `> 🆔 **ID:** \`${emoji.id || '—'}\`\n` +
      `> ⚡ **${t('admin.emojiFieldAnimated', source || guild)}:** ${isAnimated ? '✅' : '❌'}\n` +
      `> 🔗 **URL:** [${lang === 'en' ? 'Open Image' : 'Abrir Imagem'}](${emoji.url || '#'})`
    )
    .addFields(
      { name: t('admin.emojiFieldName', source || guild), value: emoji.name || '—', inline: true },
      { name: t('admin.emojiFieldId', source || guild), value: emoji.id || '—', inline: true },
      { name: t('admin.emojiFieldAnimated', source || guild), value: isAnimated ? '✅' : '❌', inline: true },
      { name: t('admin.emojiFieldURL', source || guild), value: emoji.url || '—' }
    );

  if (emoji.url) {
    embed.setThumbnail(emoji.url);
  }

  embed.setFooter({ text: t('admin.emojiPreviewFooter', source || guild) }).setTimestamp();
  return embed;
}

/** Build a select menu for a page of emojis */
function buildSelectMenu(emojis, page = 0, source = null) {
  const start = page * PAGE_SIZE;
  const options = emojis.slice(start, start + PAGE_SIZE).map(createEmojiOption);
  return new StringSelectMenuBuilder()
    .setCustomId('emoji_select')
    .setPlaceholder(t('admin.emojiSelectLabel', source, {}))
    .addOptions(options);
}

/** Build pagination buttons */
function buildPagination(page, totalPages, source = null) {
  const prev = new ButtonBuilder()
    .setCustomId('prev_page')
    .setLabel(t('admin.paginationPrev', source, {}))
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page <= 0);
  const next = new ButtonBuilder()
    .setCustomId('next_page')
    .setLabel(t('admin.paginationNext', source, {}))
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page >= totalPages - 1);
  const exportBtn = new ButtonBuilder()
    .setCustomId('export_json')
    .setLabel('Export JSON')
    .setStyle(ButtonStyle.Success);
  return new ActionRowBuilder().addComponents(prev, next, exportBtn);
}

/** Main handler for preview UI and export */
async function handlePreviewAndExport(source, reply, searchQuery = '') {
  if (!source.guild) return reply(t('admin.onlyServer', source));
  if (!isManager(source)) return reply(buildUsage(source));

  let emojis = serializeGuildEmojis(source.guild);

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    emojis = emojis.filter((e) => e.name.toLowerCase().includes(query));
  }

  if (emojis.length === 0) {
    return reply(t('admin.emojiSearchEmpty', source, { query: searchQuery.trim() }));
  }

  const result = buildFile(source.guild, emojis);
  await reply({ embeds: [buildSummary(source.guild, result.count, result.animated, source)], files: [result.file] });

  const totalPages = Math.ceil(emojis.length / PAGE_SIZE);
  let currentPage = 0;

  const initialEmoji = emojis[0] || { name: '—', id: '—', animated: false, url: '' };
  const embed = buildEmojiPreview(source.guild, initialEmoji, source);
  const select = buildSelectMenu(emojis, currentPage, source);
  const rowSelect = new ActionRowBuilder().addComponents(select);
  const rowButtons = buildPagination(currentPage, totalPages, source);

  const message = await reply({ embeds: [embed], components: [rowSelect, rowButtons] });

  const userId = source.user?.id || source.author?.id;

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button | ComponentType.StringSelect,
    time: 5 * 60 * 1000,
    filter: (i) => i.user.id === userId,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.isStringSelect()) {
      const selectedId = interaction.values[0];
      const selectedEmoji = emojis.find((e) => e.id === selectedId);
      if (selectedEmoji) {
        const newEmbed = buildEmojiPreview(source.guild, selectedEmoji, source);
        await interaction.update({ embeds: [newEmbed] });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'prev_page' && currentPage > 0) {
        currentPage--;
      } else if (interaction.customId === 'next_page' && currentPage < totalPages - 1) {
        currentPage++;
      } else if (interaction.customId === 'export_json') {
        const fileResult = buildFile(source.guild, emojis);
        await interaction.reply({ files: [fileResult.file], ephemeral: true });
        return;
      }
      const newSelect = buildSelectMenu(emojis, currentPage, source);
      const newRowSelect = new ActionRowBuilder().addComponents(newSelect);
      const newRowButtons = buildPagination(currentPage, totalPages, source);
      await interaction.update({ components: [newRowSelect, newRowButtons] });
    }
  });
}

async function sendExport(source, reply, searchQuery = '') {
  await handlePreviewAndExport(source, reply, searchQuery);
}

module.exports = {
  name,
  aliases: ['listaemojis', 'emojis'],
  buildFile,
  serializeGuildEmojis,
  buildEmojiPreview,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Download and search this server's custom emojis.")
    .setDescriptionLocalizations({
      'pt-BR': 'Baixa e pesquisa a lista de emojis customizados deste servidor.',
    })
    .addStringOption((option) =>
      option
        .setName('search')
        .setNameLocalizations({
          'en-US': 'search',
          'en-GB': 'search',
          'pt-BR': 'busca',
        })
        .setDescription('Filter emojis by name.')
        .setDescriptionLocalizations({
          'pt-BR': 'Filtrar emojis pelo nome.',
        })
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async executePrefix({ message, args }) {
    const searchQuery = args ? args.join(' ') : '';
    await sendExport(message, (content) => message.reply(content), searchQuery);
  },
  async executeSlash({ interaction }) {
    const searchQuery = interaction.options?.getString('search') || interaction.options?.getString('busca') || '';
    await sendExport(interaction, (content) => interaction.editReply(content), searchQuery);
  },
};

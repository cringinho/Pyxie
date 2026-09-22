const { AttachmentBuilder, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { serializeGuildEmojis } = require('../utils/serverEmojis');
const { AttachmentBuilder, PermissionFlagsBits, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { serializeGuildEmojis, groupEmojisByTheme, createEmojiOption, getAnimatedEmoji, getEmojiUrl, APP_EMOJIS } = require('../utils/serverEmojis');
const { EMOJIS } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');

const name = EMOJIS || 'py-emojis';
const PAGE_SIZE = 25;

function isManager(source) {
  return source.member?.permissions?.has(PermissionFlagsBits.ManageGuild);
}

function buildFile(guild) {
  const emojis = serializeGuildEmojis(guild);
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

async function sendExport(source, reply) {
/** Build an embed that previews a single emoji */
function buildEmojiPreview(guild, emoji) {
  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(`${emoji.name}${emoji.animated ? ' ✨' : ''}`)
    .addFields(
      { name: t('admin.emojiFieldName', guild, {}), value: emoji.name || '—', inline: true },
      { name: t('admin.emojiFieldId', guild, {}), value: emoji.id || '—', inline: true },
      { name: t('admin.emojiFieldAnimated', guild, {}), value: emoji.animated ? '✅' : '❌', inline: true },
      { name: t('admin.emojiFieldURL', guild, {}), value: emoji.url || '—' }
    )
    .setImage(emoji.url)
    .setFooter({ text: t('admin.emojiPreviewFooter', guild, {}) })
    .setTimestamp();
  return embed;
}

/** Build a select menu for a page of emojis */
function buildSelectMenu(emojis, page = 0) {
  const start = page * PAGE_SIZE;
  const options = emojis.slice(start, start + PAGE_SIZE).map(createEmojiOption);
  return new StringSelectMenuBuilder()
    .setCustomId('emoji_select')
    .setPlaceholder(t('admin.emojiSelectLabel', null, {}))
    .addOptions(options);
}

/** Build pagination buttons */
function buildPagination(page, totalPages) {
  const prev = new ButtonBuilder()
    .setCustomId('prev_page')
    .setLabel(t('admin.paginationPrev', null, {}))
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page <= 0);
  const next = new ButtonBuilder()
    .setCustomId('next_page')
    .setLabel(t('admin.paginationNext', null, {}))
    .setStyle(ButtonStyle.Primary)
    .setDisabled(page >= totalPages - 1);
  const exportBtn = new ButtonBuilder()
    .setCustomId('export_json')
    .setLabel('Export JSON')
    .setStyle(ButtonStyle.Success);
  return new ActionRowBuilder().addComponents(prev, next, exportBtn);
}

/** Main handler for preview UI and export */
async function handlePreviewAndExport(source, reply) {
  if (!source.guild) return reply(t('admin.onlyServer', source));
  if (!isManager(source)) return reply(buildUsage(source));

  const result = buildFile(source.guild);
  await reply({ embeds: [buildSummary(source.guild, result.count, result.animated, source)], files: [result.file] });
  const emojis = serializeGuildEmojis(source.guild);
  const totalPages = Math.ceil(emojis.length / PAGE_SIZE);
  let currentPage = 0;

  // Initial preview uses the first emoji in the list (or a placeholder)
  const initialEmoji = emojis[0] || { name: '—', id: '—', animated: false, url: '' };
  const embed = buildEmojiPreview(source.guild, initialEmoji);
  const select = buildSelectMenu(emojis, currentPage);
  const rowSelect = new ActionRowBuilder().addComponents(select);
  const rowButtons = buildPagination(currentPage, totalPages);

  const message = await reply({ embeds: [embed], components: [rowSelect, rowButtons] });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button | ComponentType.StringSelect,
    time: 5 * 60 * 1000,
    filter: (i) => i.user.id === source.user.id,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.isStringSelect()) {
      const selectedId = interaction.values[0];
      const selectedEmoji = emojis.find((e) => e.id === selectedId);
      const newEmbed = buildEmojiPreview(source.guild, selectedEmoji);
      await interaction.update({ embeds: [newEmbed] });
    } else if (interaction.isButton()) {
      if (interaction.customId === 'prev_page' && currentPage > 0) {
        currentPage--;
      } else if (interaction.customId === 'next_page' && currentPage < totalPages - 1) {
        currentPage++;
      } else if (interaction.customId === 'export_json') {
        const result = buildFile(source.guild);
        await interaction.reply({ files: [result.file], ephemeral: true });
        return;
      }
      const newSelect = buildSelectMenu(emojis, currentPage);
      const newRowSelect = new ActionRowBuilder().addComponents(newSelect);
      const newRowButtons = buildPagination(currentPage, totalPages);
      await interaction.update({ components: [newRowSelect, newRowButtons] });
    }
  });
}

async function sendExport(source, reply) {
  // Show preview UI then allow export
  await handlePreviewAndExport(source, reply);
}

module.exports = {
  name,
  aliases: ['listaemojis', 'emojis'],
  buildFile,
  serializeGuildEmojis,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Download this server\'s custom emojis as a JSON file.')
    .setDescription("Download this server's custom emojis as a JSON file.")
    .setDescriptionLocalizations({
      'pt-BR': 'Baixa a lista de emojis customizados deste servidor em JSON.',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async executePrefix({ message }) {
    await sendExport(message, (content) => message.reply(content));
  },
  async executeSlash({ interaction }) {
    await sendExport(interaction, (content) => interaction.editReply(content));
  },
};

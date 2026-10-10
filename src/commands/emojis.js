const {
  AttachmentBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { serializeGuildEmojis, createEmojiOption } = require('../utils/serverEmojis');
const { getThemeConfig, getThemeEmojiData } = require('../utils/themeEmojis');
const { EMOJIS } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');

const name = EMOJIS || 'py-emojis';
const PAGE_SIZE = 25;

const EMBED_THEME_GROUPS = [
  {
    groupId: 'currency',
    labelPt: '🪙 Moedas & Economia (Consistentes)',
    labelEn: '🪙 Currency & Economy (Consistent)',
    keys: ['coins', 'magicBeans', 'economyCareers', 'dailyBonus'],
  },
  {
    groupId: 'tarot',
    labelPt: '🔮 Oráculo & Místicos',
    labelEn: '🔮 Oracle & Mystics',
    keys: ['tarot', 'tarotAlbum'],
  },
  {
    groupId: 'social',
    labelPt: '💍 Social & Conexões',
    labelEn: '💍 Social & Connections',
    keys: ['marriage', 'partnerships', 'userProfile', 'ship'],
  },
  {
    groupId: 'culture',
    labelPt: '🏛️ Cultura & Sazonal',
    labelEn: '🏛️ Culture & Seasonal',
    keys: ['museum', 'seasonal'],
  },
  {
    groupId: 'minigames',
    labelPt: '🎮 Minigames & Diversão',
    labelEn: '🎮 Minigames & Entertainment',
    keys: ['arcaneMath', 'tictactoe', 'minesweeper', 'dice'],
  },
  {
    groupId: 'system',
    labelPt: '⚙️ Sistema & Utilidades',
    labelEn: '⚙️ System & Utilities',
    keys: ['helpCommands', 'successCheck', 'errorAlert'],
  },
];

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
    file: new AttachmentBuilder(Buffer.from(JSON.stringify(payload, null, 2), 'utf8'), {
      name: 'emojis-do-servidor.json',
    }),
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
    .setFooter({
      text: `${guildName} • ${lang === 'en' ? 'Downloadable Emoji Catalog' : 'Catálogo baixável de emojis'}`,
    })
    .setTimestamp();
}

function buildUsage(source = null) {
  return t('admin.noPermission', source);
}

/** Build an embed that previews a single emoji from the server */
function buildEmojiPreview(guild, emoji, source = null) {
  const isAnimated = Boolean(emoji.animated);
  const emojiFormat =
    emoji.format ||
    (emoji.id ? (isAnimated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`) : '');
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

/** Build an embed previewing a Pyxie embed theme emoji */
function buildThemePreview(themeKey, source = null) {
  const config = getThemeConfig();
  const theme = config[themeKey];
  const lang = getLanguage(source);
  if (!theme) return null;

  const data = getThemeEmojiData(themeKey);
  const isAnimated = Boolean(data.animated);

  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(`${data.format} ✦ ${theme.description || themeKey}`)
    .setDescription(
      `> 🎨 **${lang === 'en' ? 'Theme Key' : 'Chave do Tema'}:** \`${themeKey}\`\n` +
        `> 🆔 **ID:** \`${data.id || '—'}\`\n` +
        `> 📛 **${t('admin.emojiFieldName', source)}:** \`${data.name || '—'}\`\n` +
        `> ⚡ **${t('admin.emojiFieldAnimated', source)}:** ${isAnimated ? '✅' : '❌'}\n` +
        `> 🔗 **URL:** [${lang === 'en' ? 'Open Image' : 'Abrir Imagem'}](${data.url || '#'})`
    );

  if (Array.isArray(theme.secondaryIds) && theme.secondaryIds.length > 0) {
    const variants = theme.secondaryIds
      .map((id, index) => {
        const vData = getThemeEmojiData(themeKey, { index: index + 1 });
        return `${vData.format} \`${id}\``;
      })
      .join(' • ');
    embed.addFields({
      name: lang === 'en' ? 'Alternative Palette Variations' : 'Variações Alternativas da Paleta',
      value: variants,
    });
  }

  if (data.url) {
    embed.setThumbnail(data.url);
  }

  embed.setFooter({
    text: `${lang === 'en' ? 'Pyxie Embed Visual Identity' : 'Identidade Visual dos Embeds da Pyxie'} • Discord Component`,
  }).setTimestamp();

  return embed;
}

/** Build the overview embed of Pyxie embed themes */
function buildEmbedsOverview(source = null, filterQuery = '') {
  const lang = getLanguage(source);
  const themes = getThemeConfig();
  const query = (filterQuery || '').toLowerCase().trim();

  let categoriesText = '';
  const filteredThemes = [];

  for (const group of EMBED_THEME_GROUPS) {
    const groupLabel = lang === 'en' ? group.labelEn : group.labelPt;
    const groupLines = [];

    for (const key of group.keys) {
      const theme = themes[key];
      if (!theme) continue;

      const desc = theme.description || key;
      if (query && !key.toLowerCase().includes(query) && !desc.toLowerCase().includes(query)) {
        continue;
      }

      const data = getThemeEmojiData(key);
      groupLines.push(`> ${data.format} **${desc}** — \`${key}\` (\`${data.id}\`)`);
      filteredThemes.push({ key, theme, data });
    }

    if (groupLines.length > 0) {
      categoriesText += `**${groupLabel}**\n${groupLines.join('\n')}\n\n`;
    }
  }

  if (!categoriesText) {
    categoriesText = `> *${lang === 'en' ? 'No embed theme found matching your search.' : 'Nenhum tema de embed encontrado com essa busca.'}*`;
  }

  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(t('admin.emojisEmbedsTitle', source))
    .setDescription(t('admin.emojisEmbedsDesc', source, { categories: categoriesText.trim() }))
    .setFooter({
      text: `Pyxie Discord Embeds • ${Object.keys(themes).length} ${lang === 'en' ? 'official themes configured' : 'temas oficiais configurados'}`,
    })
    .setTimestamp();

  return { embed, filteredThemes };
}

/** Build theme selection menu for embed themes */
function buildThemeSelectMenu(filteredThemes, source = null) {
  const lang = getLanguage(source);
  const options = filteredThemes.slice(0, 25).map(({ key, theme, data }) => ({
    label: (theme.description || key).slice(0, 50),
    value: key,
    description: `ID: ${data.id || '—'} • ${data.animated ? 'GIF' : 'PNG'}`.slice(0, 100),
    emoji: data.id ? { id: data.id, name: data.name, animated: data.animated } : undefined,
  }));

  return new StringSelectMenuBuilder()
    .setCustomId('embed_theme_select')
    .setPlaceholder(t('admin.emojisEmbedsSelect', source))
    .addOptions(options);
}

/** Build select menu for a page of server emojis */
function buildSelectMenu(emojis, page = 0, source = null) {
  const start = page * PAGE_SIZE;
  const options = emojis.slice(start, start + PAGE_SIZE).map(createEmojiOption);
  return new StringSelectMenuBuilder()
    .setCustomId('emoji_select')
    .setPlaceholder(t('admin.emojiSelectLabel', source, {}))
    .addOptions(options);
}

/** Build pagination buttons for server emojis */
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

/** Handler for viewing Pyxie embed theme emojis */
async function handleEmbedThemes(source, reply, searchQuery = '') {
  const lang = getLanguage(source);
  const { embed: overviewEmbed, filteredThemes } = buildEmbedsOverview(source, searchQuery);

  const rows = [];
  if (filteredThemes.length > 0) {
    const select = buildThemeSelectMenu(filteredThemes, source);
    rows.push(new ActionRowBuilder().addComponents(select));
  }

  const message = await reply({ embeds: [overviewEmbed], components: rows });
  if (!message || rows.length === 0) return;

  const userId = source.user?.id || source.author?.id;
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button | ComponentType.StringSelect,
    time: 5 * 60 * 1000,
    filter: (i) => i.user.id === userId,
  });

  collector.on('collect', async (interaction) => {
    if (interaction.isStringSelect() && interaction.customId === 'embed_theme_select') {
      const selectedKey = interaction.values[0];
      const preview = buildThemePreview(selectedKey, source);
      if (preview) {
        const backBtn = new ButtonBuilder()
          .setCustomId('catalog_overview')
          .setLabel(lang === 'en' ? 'Back to Catalog' : 'Voltar ao Catálogo')
          .setStyle(ButtonStyle.Secondary);
        const btnRow = new ActionRowBuilder().addComponents(backBtn);
        await interaction.update({ embeds: [preview], components: [rows[0], btnRow] });
      }
    } else if (interaction.isButton() && interaction.customId === 'catalog_overview') {
      await interaction.update({ embeds: [overviewEmbed], components: rows });
    }
  });
}

/** Handler for viewing and exporting server emojis */
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

module.exports = {
  name,
  aliases: ['listaemojis', 'emojis'],
  buildFile,
  serializeGuildEmojis,
  buildEmojiPreview,
  buildThemePreview,
  buildEmbedsOverview,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('View official Pyxie embed theme emojis or manage server emojis.')
    .setDescriptionLocalizations({
      'pt-BR': 'Visualiza os emojis temáticos de embeds da Pyxie ou gerencia emojis do servidor.',
    })
    .addStringOption((option) =>
      option
        .setName('scope')
        .setNameLocalizations({
          'en-US': 'scope',
          'en-GB': 'scope',
          'pt-BR': 'escopo',
        })
        .setDescription('Choose whether to view Pyxie embed themes or server emojis.')
        .setDescriptionLocalizations({
          'pt-BR': 'Escolha entre ver os emojis de embeds da Pyxie ou do servidor.',
        })
        .addChoices(
          { name: 'Pyxie Embeds (Official)', value: 'embeds' },
          { name: 'Server Emojis', value: 'server' }
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('search')
        .setNameLocalizations({
          'en-US': 'search',
          'en-GB': 'search',
          'pt-BR': 'busca',
        })
        .setDescription('Filter emojis or embed themes by name.')
        .setDescriptionLocalizations({
          'pt-BR': 'Filtrar emojis ou temas de embeds pelo nome.',
        })
        .setRequired(false)
    )
    .setDMPermission(true),
  async executePrefix({ message, args }) {
    const firstArg = (args && args[0] ? args[0].toLowerCase() : '');
    if (firstArg === 'server' || firstArg === 'servidor') {
      const searchQuery = args.slice(1).join(' ');
      await handlePreviewAndExport(message, (content) => message.reply(content), searchQuery);
    } else if (firstArg === 'embeds') {
      const searchQuery = args.slice(1).join(' ');
      await handleEmbedThemes(message, (content) => message.reply(content), searchQuery);
    } else {
      const searchQuery = args ? args.join(' ') : '';
      await handleEmbedThemes(message, (content) => message.reply(content), searchQuery);
    }
  },
  async executeSlash({ interaction }) {
    const scope = interaction.options?.getString('scope') || interaction.options?.getString('escopo') || 'embeds';
    const searchQuery =
      interaction.options?.getString('search') || interaction.options?.getString('busca') || '';

    if (scope === 'server') {
      await handlePreviewAndExport(interaction, (content) => interaction.editReply(content), searchQuery);
    } else {
      await handleEmbedThemes(interaction, (content) => interaction.editReply(content), searchQuery);
    }
  },
};

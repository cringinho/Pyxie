const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const {
  BRIBE_COST,
  bribeKuromi,
  drawTarot,
  getTimeUntilMidnight,
  hasActiveDraw,
} = require('../services/tarot');
const { createTarotAttachment } = require('../services/tarotRenderer');
const { formatCoins } = require('./economyHelpers');
const { getAnimatedEmoji } = require('../utils/serverEmojis');
const { getThemeEmoji } = require('../utils/themeEmojis');
const { TAROT_LOG_CHANNEL_ID } = require('../config');
const { TAROT } = require('./commandNames');
const { t } = require('../utils/i18n');

const name = TAROT || 'py-tarot';

function getDisplayCardName(card) {
  if (!card) return 'Desconhecida';
  return card.num ? `${card.num}. ${card.name}` : card.name;
}

function getDisplayOrientation(orientation, source = null) {
  return orientation === 'REVERSED'
    ? t('tarot.orientationReversed', source)
    : t('tarot.orientationUpright', source);
}

function buildBribeRow(source = null) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('tarot_subornar')
      .setLabel(t('tarot.bribeBtn', source))
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔮')
  );
}

const { recordCardDiscovery, getAlbumStats } = require('../services/tarotAlbumService');

function buildTarotEmbed(result, guildOrSource) {
  const { card, orientation, paid, discovery } = result;
  const isReversed = orientation === 'REVERSED';
  const guild = guildOrSource?.guild || (guildOrSource?.name ? guildOrSource : null);
  const guildName = guild?.name || '';
  const userId = guildOrSource?.user?.id || guildOrSource?.author?.id || result.userId || '';

  const percent = discovery
    ? Number(((discovery.totalDiscovered / 78) * 100).toFixed(1))
    : 0;

  const albumProgressLine = discovery
    ? t('tarot.albumProgress', guildOrSource, {
        discovered: discovery.totalDiscovered,
        percent,
      })
    : '';

  const newDiscoveryNotice = discovery?.isNew
    ? [
        '',
        `> **${t('tarot.newDiscoveryTitle', guildOrSource)}**`,
        `> ${t('tarot.newDiscoveryDesc', guildOrSource, {
          user: userId,
          card: card.name,
          number: String(discovery.card?.number || '').padStart(2, '0'),
        })}`,
      ].join('\n')
    : '';

  const tarotEmoji = getThemeEmoji('tarot', { variant: 'random' });
  const albumEmoji = getThemeEmoji('tarotAlbum');

  const desc = [
    `${tarotEmoji} **${t('tarot.cardLabel', guildOrSource)}:** **${card.num ? `${card.num}. ` : ''}${card.name}**  (\`${getDisplayOrientation(orientation, guildOrSource)}\`)`,
    '',
    `✨ **${t('tarot.keywords', guildOrSource)}**`,
    `> *${card.keywords.join('  •  ')}*`,
    '',
    `📜 **${t('tarot.destinyMessage', guildOrSource)}**`,
    `> "${isReversed ? card.reversed : card.upright}"`,
    '',
    `${albumEmoji} ${albumProgressLine}${newDiscoveryNotice}`,
  ].join('\n');

  const embedColor = discovery?.isNew ? '#E60067' : (isReversed ? '#f43f5e' : '#c084fc');

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${tarotEmoji}  ✦  ${t('tarot.title', guildOrSource)}${guildName ? ` — ${guildName}` : ''}`)
    .setDescription(desc)
    .setImage('attachment://tarot_pyxie.png')
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  return embed;
}

function buildAlreadyDrawnEmbed(remainingTime, guildOrSource) {
  const guild = guildOrSource?.guild || (guildOrSource?.name ? guildOrSource : null);
  const guildName = guild?.name || '';
  const tarotEmoji = getThemeEmoji('tarot');
  const desc = [
    t('tarot.alreadyDrawnTitle', guildOrSource),
    '',
    `⏳ **${t('tarot.nextFree', guildOrSource)}**`,
    `> ${t('tarot.nextFreeDesc', guildOrSource, { time: remainingTime.formatted })}`,
    '',
    `✨ **${t('tarot.bribeSection', guildOrSource)}**`,
    `> ${t('tarot.bribeSectionDesc', guildOrSource)}`,
  ].join('\n');

  return new EmbedBuilder()
    .setColor('#a855f7')
    .setTitle(`${tarotEmoji}  ✦  ${t('tarot.title', guildOrSource)}${guildName ? ` — ${guildName}` : ''}`)
    .setDescription(desc)
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();
}

async function logTarotToPublicChannel(client, { user, result, guild }) {
  try {
    const channel = await client.channels.fetch(TAROT_LOG_CHANNEL_ID).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const attachment = createTarotAttachment(result.card, result.orientation, guild);
    const isReversed = result.orientation === 'REVERSED';
    const guildName = guild?.name || '';
    const prefixHumor = result.paid
      ? t('tarot.publicHumor', guild)
      : '';

    const discovery = result.discovery;
    const isNew = discovery?.isNew;
    const totalDiscovered = discovery?.totalDiscovered || 1;
    const percent = Number(((totalDiscovered / 78) * 100).toFixed(1));

    const progressLine = t('tarot.albumProgress', guild, {
      discovered: totalDiscovered,
      percent,
    });

    const newDiscoveryLine = isNew
      ? `\n\n> **${t('tarot.newDiscoveryTitle', guild)}**\n> ${t('tarot.newDiscoveryDesc', guild, {
          user: user.id,
          card: result.card.name,
          number: String(discovery.card?.number || '').padStart(2, '0'),
        })}`
      : '';

    const publicEmbed = new EmbedBuilder()
      .setColor(isNew ? '#E60067' : (result.paid ? '#8b5cf6' : (isReversed ? '#f43f5e' : '#c084fc')))
      .setTitle(t('tarot.publicTitle', guild, { guild: guildName ? ` — ${guildName}` : '' }))
      .setDescription(
        `${t('tarot.publicDesc', guild, {
          humor: prefixHumor,
          user: user.id,
          card: result.card.name,
          orientation: getDisplayOrientation(result.orientation, guild),
        })}\n\n📖 ${progressLine}${newDiscoveryLine}`
      )
      .setImage('attachment://tarot_pyxie.png')
      .setFooter({ text: 'Pyxie' })
      .setTimestamp();

    await channel.send({
      embeds: [publicEmbed],
      files: [attachment],
      allowedMentions: { users: [] },
    });
  } catch (error) {
    console.error('Erro ao enviar log público do Tarot:', error);
  }
}

function isTarotButton(interaction) {
  if (!interaction.isButton()) return false;
  return (
    interaction.customId === 'tarot_subornar' ||
    interaction.customId === 'tarot_tirar_dia' ||
    interaction.customId === 'tarot:draw' ||
    interaction.customId.startsWith('tarot:')
  );
}

async function executeButton({ interaction, logTarotResult }) {
  const customId = interaction.customId;

  // 1. Botão de Suborno / Nova Tiragem
  if (customId === 'tarot_subornar' || customId.startsWith('tarot:bribe')) {
    const result = bribeKuromi(interaction.user.id);

    if (!result.bribed) {
      if (result.reason === 'insufficient_funds') {
        await interaction.reply({
          content: t('tarot.insufficientBribe', interaction, {
            cost: formatCoins(BRIBE_COST, interaction),
            balance: formatCoins(result.balance, interaction),
          }),
          flags: 64,
        });
        return;
      }
      await interaction.reply({
        content: t('tarot.bribeUnavailable', interaction),
        flags: 64,
      });
      return;
    }

    const discovery = recordCardDiscovery(interaction.user.id, result.card.id);
    result.discovery = discovery;
    result.userId = interaction.user.id;

    const attachment = createTarotAttachment(result.card, result.orientation, interaction);
    const embed = buildTarotEmbed(result, interaction);

    await interaction.reply({
      embeds: [embed],
      files: [attachment],
      components: [buildBribeRow(interaction)],
      flags: 64,
    });

    await logTarotToPublicChannel(interaction.client, { user: interaction.user, result, guild: interaction.guild });
    return;
  }

  // 2. Botão de Tiragem Diária
  if (customId === 'tarot_tirar_dia' || customId === 'tarot:draw') {
    await interaction.deferReply({ flags: 64 });

    const result = drawTarot(interaction.user.id);

    if (!result.drawn) {
      const remaining = getTimeUntilMidnight();
      await interaction.editReply({
        embeds: [buildAlreadyDrawnEmbed(remaining, interaction)],
        components: [buildBribeRow(interaction)],
      });
      return;
    }

    const discovery = recordCardDiscovery(interaction.user.id, result.card.id);
    result.discovery = discovery;
    result.userId = interaction.user.id;

    const attachment = createTarotAttachment(result.card, result.orientation, interaction);
    const embed = buildTarotEmbed(result, interaction);

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: [buildBribeRow(interaction)],
    });

    await logTarotToPublicChannel(interaction.client, { user: interaction.user, result, guild: interaction.guild });
  }
}

module.exports = {
  name,
  aliases: ['tarot', 'py-tarot'],
  ephemeral: true,
  isTarotButton,
  executeButton,
  buildTarotEmbed,
  buildAlreadyDrawnEmbed,
  buildBribeRow,
  getDisplayOrientation,
  getDisplayCardName,
  logTarotToPublicChannel,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Draw a daily Tarot card rendered with special artwork.')
    .setDescriptionLocalizations({
      'pt-BR': 'Receba uma tiragem privada do Tarot da Pyxie renderizada na hora.',
    }),
  async executeSlash({ interaction }) {
    const result = drawTarot(interaction.user.id);

    if (!result.drawn) {
      const remaining = getTimeUntilMidnight();
      await interaction.editReply({
        embeds: [buildAlreadyDrawnEmbed(remaining, interaction)],
        components: [buildBribeRow(interaction)],
      });
      return;
    }

    const discovery = recordCardDiscovery(interaction.user.id, result.card.id);
    result.discovery = discovery;
    result.userId = interaction.user.id;

    const attachment = createTarotAttachment(result.card, result.orientation, interaction);
    const embed = buildTarotEmbed(result, interaction);

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
      components: [buildBribeRow(interaction)],
    });

    await logTarotToPublicChannel(interaction.client, { user: interaction.user, result, guild: interaction.guild });
  },
  async executeText({ message }) {
    const result = drawTarot(message.author.id);

    if (!result.drawn) {
      const remaining = getTimeUntilMidnight();
      await message.reply({
        embeds: [buildAlreadyDrawnEmbed(remaining, message)],
        components: [buildBribeRow(message)],
      });
      return;
    }

    const discovery = recordCardDiscovery(message.author.id, result.card.id);
    result.discovery = discovery;
    result.userId = message.author.id;

    const attachment = createTarotAttachment(result.card, result.orientation, message);
    const embed = buildTarotEmbed(result, message);

    await message.reply({
      embeds: [embed],
      files: [attachment],
      components: [buildBribeRow(message)],
    });

    await logTarotToPublicChannel(message.client, { user: message.author, result, guild: message.guild });
  },
};
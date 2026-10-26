const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getVoteUrl, getUserVoteStatus, VOTE_BEANS, WEEKEND_VOTE_BEANS } = require('../services/topgg');
const { t, formatRemaining } = require('../utils/i18n');
const { VOTE } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { emojify, buttonEmojiFor } = require('../utils/emojify');
const { getEmoji } = require('../utils/appEmojis');

function beanIcon() {
  const formatted = getEmoji('MAGIC_BEAN');
  return /^<a?:\w+:\d+>$/.test(formatted || '') ? formatted : '🌱';
}

function buildVoteView(guildOrSource = null, clientOrBotId = null, userId = null) {
  const botId = clientOrBotId || '1543650200718155897';
  const voteUrl = getVoteUrl(botId);
  const bean = beanIcon();
  const withBean = (text) => emojify(text).replaceAll('🌱', bean);

  const lines = [
    t('vote.desc', guildOrSource),
    t('vote.rewardsTitle', guildOrSource),
    t('vote.rewardLine', guildOrSource, { beans: VOTE_BEANS }),
    t('vote.weekendLine', guildOrSource, { beans: WEEKEND_VOTE_BEANS }),
  ];

  if (userId) {
    const status = getUserVoteStatus(userId);
    lines.push(
      status.canVote
        ? t('vote.statusReady', guildOrSource)
        : t('vote.statusCooldown', guildOrSource, { time: formatRemaining(status.remainingMs, guildOrSource) })
    );
    if (status.voteCount > 0) {
      lines.push(t('vote.totalLine', guildOrSource, { beans: status.beansEarned, votes: status.voteCount }));
    }
  }
  lines.push(t('vote.cta', guildOrSource));

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#8b5cf6')
    .setTitle(withBean(t('vote.title', guildOrSource)))
    .setDescription(withBean(lines.join('\n\n')))
    .setFooter({ text: pyxieFooter(t('vote.footerText', guildOrSource), guildOrSource) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('vote.btnLabel', guildOrSource))
      .setEmoji(buttonEmojiFor('🗳️'))
      .setStyle(ButtonStyle.Link)
      .setURL(voteUrl)
  );

  return { embeds: [embed], components: [row] };
}

const commandName = VOTE || 'py-votar';

module.exports = {
  name: commandName,
  aliases: ['vote', 'votar', 'py-votar', 'py-vote'],
  ephemeral: false,
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Support Pyxie by voting on Top.gg.')
    .setDescriptionLocalizations({
      'pt-BR': 'Apoie o crescimento da Pyxie votando no Top.gg.',
    }),
  async executePrefix({ message, client }) {
    const view = buildVoteView(message, client?.user?.id, message.author?.id);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildVoteView(interaction, interaction.client?.user?.id, interaction.user?.id);
    await interaction.editReply(view);
  },
  buildVoteView,
};

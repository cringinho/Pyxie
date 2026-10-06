const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { getVoteUrl } = require('../services/topgg');
const { t } = require('../utils/i18n');
const { VOTE } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function buildVoteView(guildOrSource = null, clientOrBotId = null) {
  const botId = clientOrBotId || '1453888365618270331';
  const voteUrl = getVoteUrl(botId);

  const desc = [
    t('vote.desc', guildOrSource),
    '',
    t('vote.supportNote', guildOrSource),
    '',
    t('vote.cta', guildOrSource),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#8b5cf6')
    .setTitle(t('vote.title', guildOrSource))
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(t('vote.footerText', guildOrSource), guildOrSource) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('vote.btnLabel', guildOrSource))
      .setEmoji('🗳️')
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
    const view = buildVoteView(message, client?.user?.id);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildVoteView(interaction, interaction.client?.user?.id);
    await interaction.editReply(view);
  },
  buildVoteView,
};

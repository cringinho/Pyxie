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

const { createBonusSession } = require('../services/bonusTimer');

function isWeekend() {
  const now = new Date();
  const brDateStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const day = new Date(brDateStr).getDay();
  return day === 0 || day === 6;
}

function buildVoteView(guildOrSource = null, clientOrBotId = null) {
  const botId = clientOrBotId || '1453888365618270331';
  const voteUrl = getVoteUrl(botId);
  const weekend = isWeekend();
  const lang = (typeof guildOrSource?.locale === 'string' && guildOrSource.locale.startsWith('pt')) ? 'pt' : 'en';
  const userId = guildOrSource?.user?.id || guildOrSource?.author?.id || 'guest';
  const bonusSession = createBonusSession(userId, 'vote_bonus', {}, lang);

  const desc = [
    t('vote.desc', guildOrSource),
    '',
    t('vote.rewardsTitle', guildOrSource),
    t('vote.rewardCoins', guildOrSource),
    t('vote.rewardItem', guildOrSource),
    t('vote.rewardBean', guildOrSource),
    '',
    weekend ? t('vote.weekendActive', guildOrSource) : t('vote.weekendTip', guildOrSource),
    '',
    t('vote.cta', guildOrSource),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(weekend ? PYXIE_COLORS.gold || '#facc15' : PYXIE_COLORS.magenta || '#e60067')
    .setTitle(t('vote.title', guildOrSource))
    .setDescription(desc)
    .setFooter({ text: pyxieFooter(t('vote.footerText', guildOrSource), guildOrSource) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('vote.btnLabel', guildOrSource))
      .setEmoji('🗳️')
      .setStyle(ButtonStyle.Link)
      .setURL(voteUrl),
    new ButtonBuilder()
      .setLabel(t('daily.btnWebBonus', guildOrSource))
      .setEmoji('🎁')
      .setStyle(ButtonStyle.Link)
      .setURL(bonusSession.url)
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
    .setDescription('Vote for Pyxie on Top.gg to claim free Coins, Items, and Magic Beans.')
    .setDescriptionLocalizations({
      'pt-BR': 'Vote na Pyxie no Top.gg e ganhe Moedinhas, Itens e Feijões Mágicos!',
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

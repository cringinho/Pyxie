const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require('discord.js');
const { claimDaily, playDailyCups, canPlayDailyCups, getUserAccount, DAILY_CUPS_COUNT } = require('../services/economy');
const { createBonusSession } = require('../services/bonusTimer');
const { t, getLanguage, formatRemaining } = require('../utils/i18n');
const { DAILY, VOTE } = require('./commandNames');
const { getUserVoteStatus, getVoteUrl, VOTE_BEANS } = require('../services/topgg');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { getEmoji } = require('../utils/appEmojis');
const pyxieDaily = require('../data/pyxieDaily');

/**
 * Diário da Pyxie: ela entrega as moedinhas falando com a pessoa, lê a energia do dia (e reage
 * quando a pessoa diz se ela acertou) e esconde um biscoito nas Xícaras, um minigame de uma
 * jogada por diário. Cada dia seguido vale +1 moedinha; os marcos 7/30/100/365 têm fala própria
 * e as conquistas de rotina avisam sozinhas depois do comando.
 */

const coinIcon = () => getEmoji('COIN') || '🪙';
const beanIcon = () => getEmoji('MAGIC_BEAN') || '🌱';
const fmt = (n, lang) => Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');

function energyBlock(userId, lang, now) {
  const energy = pyxieDaily.getDailyEnergy(userId, now);
  return { energy, lines: [t('daily.energyHeader', lang), `> **${energy.emoji} ${energy.name[lang]}**\n> *${energy.line[lang]}*`] };
}

function dailyButtons(userId, lang, { reacted = false, cupsAvailable = true, bonusUrl = null } = {}) {
  const buttons = [];
  if (!reacted) {
    buttons.push(
      new ButtonBuilder().setCustomId(`daily:react:${userId}:right`).setLabel(t('daily.btnRight', lang)).setEmoji('🎯').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`daily:react:${userId}:wrong`).setLabel(t('daily.btnWrong', lang)).setEmoji('🙄').setStyle(ButtonStyle.Secondary)
    );
  }
  buttons.push(
    new ButtonBuilder()
      .setCustomId(`daily:cups:${userId}`)
      .setLabel(t('daily.btnCups', lang))
      .setEmoji('☕')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!cupsAvailable)
  );
  if (bonusUrl) {
    buttons.push(new ButtonBuilder().setLabel(t('daily.btnWebBonus', lang)).setStyle(ButtonStyle.Link).setURL(bonusUrl).setEmoji('🎁'));
  }
  return [new ActionRowBuilder().addComponents(...buttons)];
}

function buildDailyView(userId, guildOrSource = null, clientId = null, now = Date.now()) {
  const lang = getLanguage(guildOrSource);
  const result = claimDaily(userId, now);
  const bonusSession = createBonusSession(userId, 'item_bonus', {}, lang);
  const { lines: energyLines, energy } = energyBlock(userId, lang, now);

  if (!result.claimed) {
    const cupsAvailable = canPlayDailyCups(userId, now);
    const desc = [
      t('daily.cooldownBody', lang, { time: formatRemaining(result.remainingMs, lang) }),
      [
        ...(result.streak > 0 ? [t('daily.cooldownStreak', lang, { streak: result.streak })] : []),
        t('daily.cooldownEnergy', lang, { emoji: energy.emoji, name: energy.name[lang] }),
      ].join('\n\n'),
      t(cupsAvailable ? 'daily.cooldownCups' : 'daily.cooldownIdle', lang),
    ].join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.violet || '#8b5cf6')
      .setTitle(t('daily.titleCooldown', lang))
      .setDescription(desc)
      .setFooter({ text: t('daily.footerCooldown', lang) });

    const components = cupsAvailable
      ? dailyButtons(userId, lang, { reacted: true, cupsAvailable, bonusUrl: bonusSession.url })
      : [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel(t('daily.btnWebBonus', lang)).setStyle(ButtonStyle.Link).setURL(bonusSession.url).setEmoji('🎁'))];
    return { embeds: [embed], components };
  }

  const greeting = pyxieDaily.getGreeting(result.streak, `${userId}:${result.streak}:${pyxieDaily.brtDayKey(now)}`);
  const reward = [
    t('daily.coins', lang, { amount: fmt(result.amount, lang), coin: coinIcon() }),
    t('daily.streakBonus', lang, { bonus: fmt(result.streakBonus, lang), coin: coinIcon() }),
    ...(result.magicBeanBonus ? [t('daily.bean', lang, { total: fmt(result.magicBeans, lang), bean: beanIcon() })] : []),
    t('daily.balance', lang, { balance: fmt(result.balance, lang), coin: coinIcon() }),
  ];

  const parts = [greeting[lang]];
  if (result.streakBroken) parts.push(t('daily.streakBroken', lang, { previous: result.previousStreak }));
  if (pyxieDaily.STREAK_MILESTONES.includes(result.streak)) parts.push(t(`daily.milestone.${result.streak}`, lang));
  parts.push(t('daily.rewardHeader', lang), reward.join('\n\n'), ...energyLines, t('daily.energyAsk', lang));

  const next = pyxieDaily.getNextMilestone(result.streak);
  if (next) parts.push(t('daily.nextMilestone', lang, { left: next - result.streak, target: next }));
  if (getUserVoteStatus(userId).canVote) {
    parts.push(
      t('vote.dailyReminder', lang, { beans: VOTE_BEANS, voteCmd: `[\`/${VOTE || 'py-vote'}\`](${getVoteUrl(clientId)})` }).replace('🌱', beanIcon())
    );
  }

  const embed = new EmbedBuilder()
    .setColor(result.streak > 1 ? PYXIE_COLORS.gold || '#f59e0b' : PYXIE_COLORS.violet || '#8b5cf6')
    .setTitle(result.streak > 1 ? t('daily.titleStreak', lang, { streak: result.streak }) : t('daily.titleFirst', lang))
    .setDescription(parts.join('\n\n'))
    .setFooter({ text: t('daily.footer', lang) })
    .setTimestamp(now);

  return { embeds: [embed], components: dailyButtons(userId, lang, { bonusUrl: bonusSession.url }) };
}

function buildCupsView(userId, lang, outcome = null) {
  const embed = new EmbedBuilder().setColor(PYXIE_COLORS.purple || '#9b5de5').setTitle(t('daily.cups.title', lang));
  const cups = [];
  for (let i = 0; i < DAILY_CUPS_COUNT; i += 1) {
    let emoji = '☕';
    let style = ButtonStyle.Secondary;
    if (outcome) {
      if (i === outcome.winningCup) {
        emoji = '🍪';
        style = ButtonStyle.Success;
      } else if (i === outcome.pick) {
        style = ButtonStyle.Danger;
      }
    }
    cups.push(
      new ButtonBuilder()
        .setCustomId(`daily:cup:${userId}:${i}`)
        .setLabel(t('daily.cups.btnCup', lang, { n: i + 1 }))
        .setEmoji(emoji)
        .setStyle(style)
        .setDisabled(Boolean(outcome))
    );
  }

  if (!outcome) {
    embed.setDescription(t('daily.cups.intro', lang));
  } else {
    embed.setDescription(
      [
        outcome.win
          ? t('daily.cups.win', lang, { prize: outcome.prize, coin: coinIcon() })
          : t('daily.cups.lose', lang, { cup: outcome.winningCup + 1 }),
        t('daily.cups.balance', lang, { balance: fmt(outcome.balance, lang), coin: coinIcon() }),
      ].join('\n\n')
    );
  }
  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(...cups)] };
}

/** Atualiza só os botões do diário original (some a reação, as xícaras ficam desligadas). */
function rebuildRows(message, { removeReactions = false, disableCups = false } = {}) {
  return (message?.components || []).map((row) => {
    const rebuilt = new ActionRowBuilder();
    for (const component of row.components || []) {
      const id = component.customId || component.data?.custom_id || '';
      if (removeReactions && id.startsWith('daily:react:')) continue;
      const button = ButtonBuilder.from(component);
      if (disableCups && id.startsWith('daily:cups:')) button.setDisabled(true);
      rebuilt.addComponents(button);
    }
    return rebuilt;
  }).filter((row) => row.components.length > 0);
}

module.exports = {
  name: DAILY,
  aliases: ['daily', 'diario', 'py-diario', 'diaria', 'py-daily'],
  buildDailyView,
  buildCupsView,
  data: new SlashCommandBuilder()
    .setName(DAILY)
    .setDescription('Get your daily coins from Pyxie, keep your streak and play the cups.')
    .setDescriptionLocalizations({
      'pt-BR': 'Pegue suas moedinhas diárias com a Pyxie, mantenha a sequência e jogue as xícaras.',
    }),
  async executePrefix({ message, client }) {
    const view = buildDailyView(message.author.id, message, client?.user?.id);
    await message.reply({ ...view, allowedMentions: { repliedUser: false } });
  },
  async executeSlash({ interaction }) {
    const view = buildDailyView(interaction.user.id, interaction, interaction.client?.user?.id);
    await interaction.editReply(view);
  },

  isDailyInteraction(interaction) {
    return interaction?.isButton?.() && typeof interaction.customId === 'string' && interaction.customId.startsWith('daily:');
  },

  async handleDailyInteraction(interaction, now = Date.now()) {
    const lang = getLanguage(interaction);
    const [, action, ownerId, arg] = interaction.customId.split(':');
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: t('daily.notYours', lang), flags: MessageFlags.Ephemeral });
    }

    if (action === 'react') {
      const pool = pyxieDaily.REACTIONS[arg === 'right' ? 'right' : 'wrong'];
      const line = pyxieDaily.pickLine(pool, `${ownerId}:${pyxieDaily.brtDayKey(now)}:${arg}`)[lang];
      const embed = EmbedBuilder.from(interaction.message.embeds[0]);
      const desc = embed.data.description || '';
      embed.setDescription(`${desc}\n\n${t(arg === 'right' ? 'daily.reactionRight' : 'daily.reactionWrong', lang, { line })}`);
      return interaction.update({ embeds: [embed], components: rebuildRows(interaction.message, { removeReactions: true }) });
    }

    if (action === 'cups') {
      if (!canPlayDailyCups(ownerId, now)) {
        const reason = getUserAccount(ownerId).lastDailyAt ? 'daily.cups.already' : 'daily.cups.notClaimed';
        return interaction.reply({ content: t(reason, lang), flags: MessageFlags.Ephemeral });
      }
      await interaction.update({ components: rebuildRows(interaction.message, { disableCups: true }) });
      return interaction.followUp({ ...buildCupsView(ownerId, lang), flags: MessageFlags.Ephemeral });
    }

    if (action === 'cup') {
      const outcome = playDailyCups(ownerId, arg, now);
      if (!outcome.ok) {
        const reason = outcome.reason === 'already_played' ? 'daily.cups.already' : 'daily.cups.notClaimed';
        return interaction.reply({ content: t(reason, lang), flags: MessageFlags.Ephemeral });
      }
      return interaction.update(buildCupsView(ownerId, lang, outcome));
    }

    return interaction.reply({ content: t('common.actionErrorShort', lang), flags: MessageFlags.Ephemeral });
  },
};

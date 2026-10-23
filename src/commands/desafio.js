const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { CHALLENGE } = require('./commandNames');
const challengeService = require('../services/dailyChallengeService');
const { addCoins } = require('../services/economy');
const { loadQuizQuestions } = require('./quiz');
const { formatCoins, formatRemaining, getLanguage, t: baseT } = require('../utils/i18n');
const { emojify, buttonEmojiFor } = require('../utils/emojify');

// Todo texto do minigame passa pelo emojify: emojis do bot em vez de Unicode
const t = (key, source, replacements) => emojify(baseT(key, source, replacements));
const { msUntilNextBrtMidnight } = require('../utils/brtDate');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const LETTERS = ['A', 'B', 'C', 'D'];

function buildQuestionView(userId, lang) {
  const state = challengeService.getPlayerState(userId);
  const challenge = challengeService.pickChallenge(loadQuizQuestions(), state.dateKey, lang);
  if (!challenge) return { content: t('challenge.noQuestions', lang), embeds: [], components: [] };

  if (state.attemptedToday) return buildAlreadyView(state, lang);

  const today = challengeService.getDayStats(state.dateKey);
  const options = challenge.choices.map((c, i) => `**[${LETTERS[i]}]** ${c}`).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.cyan)
    .setTitle(t('challenge.title', lang))
    .setDescription(
      t('challenge.desc', lang, {
        question: challenge.question,
        options,
        topic: challenge.topic,
        difficulty: t(`quiz.diffTier${Math.max(1, Math.min(4, challenge.level))}`, lang),
      })
    )
    .addFields(
      { name: t('challenge.streakLabel', lang), value: t('challenge.streakValue', lang, { streak: state.streak }), inline: true },
      { name: t('challenge.rewardLabel', lang), value: t('challenge.rewardValue', lang, { reward: state.nextReward }), inline: true },
      { name: t('challenge.todayLabel', lang), value: t('challenge.todayValue', lang, today), inline: false }
    )
    .setFooter({ text: t('challenge.footer', lang) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    challenge.choices.map((_, i) =>
      new ButtonBuilder()
        .setCustomId(`dch:ans:${state.dateKey}:${userId}:${i}`)
        .setLabel(`[${LETTERS[i]}]`)
        .setStyle(ButtonStyle.Primary)
    )
  );

  return { content: '', embeds: [embed], components: [row] };
}

function buildAlreadyView(state, lang) {
  const top = challengeService.getTopStreaks(5);
  const topText = top.length
    ? top.map((row, i) => t('challenge.topLine', lang, { pos: i + 1, user: `<@${row.userId}>`, streak: row.streak })).join('\n\n')
    : t('challenge.topEmpty', lang);

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.lilac)
    .setTitle(t('challenge.alreadyTitle', lang))
    .setDescription(
      t('challenge.alreadyDesc', lang, {
        result: t(state.todayCorrect ? 'challenge.resultCorrect' : 'challenge.resultWrong', lang),
        time: formatRemaining(msUntilNextBrtMidnight(), lang),
        top: topText,
      })
    )
    .setFooter({ text: t('challenge.footer', lang) })
    .setTimestamp();

  return { content: '', embeds: [embed], components: [] };
}

function isChallengeInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('dch:');
}

async function handleChallengeInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, dateKey, ownerId, choice] = interaction.customId.split(':');

  // Botão público do prefixo: abre o desafio só para quem clicou
  if (action === 'open') {
    return interaction.reply({ ...buildQuestionView(interaction.user.id, lang), flags: 64 });
  }

  if (ownerId !== interaction.user.id) {
    return interaction.reply({ content: t('challenge.notYours', lang), flags: 64 });
  }

  const challenge = challengeService.pickChallenge(loadQuizQuestions(), dateKey, lang);
  const res = challengeService.submitAnswer(interaction.user.id, dateKey, choice, challenge?.correctIndex);

  if (res.status === 'expired') {
    return interaction.update({ content: t('challenge.expired', lang), embeds: [], components: [] });
  }
  if (res.status === 'already') {
    return interaction.update(buildAlreadyView(challengeService.getPlayerState(interaction.user.id), lang));
  }

  let embed;
  if (res.status === 'correct') {
    const balance = addCoins(interaction.user.id, res.reward);
    embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.emerald)
      .setTitle(t('challenge.correctTitle', lang))
      .setDescription(
        t('challenge.correctDesc', lang, {
          answer: challenge.correctText,
          streak: res.streak,
          reward: res.reward,
          balance: formatCoins(balance, lang),
        })
      );
  } else {
    embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.crimson)
      .setTitle(t('challenge.wrongTitle', lang))
      .setDescription(t('challenge.wrongDesc', lang, { answer: challenge.correctText }));
  }
  embed.setFooter({ text: t('challenge.footer', lang) }).setTimestamp();

  return interaction.update({ content: '', embeds: [embed], components: [] });
}

module.exports = {
  name: CHALLENGE,
  aliases: ['challenge', 'desafio', 'py-desafio', 'dailychallenge', 'desafiodiario', 'py-desafiodiario'],
  ephemeral: true,
  description: 'One secret question per day, the same for everyone. Keep your streak to earn more coins!',
  descriptionLocalizations: {
    'pt-BR': 'Uma pergunta secreta por dia, igual para todos. Mantenha a sequência para ganhar mais moedinhas!',
  },
  data: new SlashCommandBuilder()
    .setName(CHALLENGE)
    .setDescription('One secret question per day, the same for everyone. Keep your streak to earn more coins!')
    .setDescriptionLocalizations({
      'pt-BR': 'Uma pergunta secreta por dia, igual para todos. Mantenha a sequência para ganhar mais moedinhas!',
    }),
  isChallengeInteraction,
  handleChallengeInteraction,
  buildQuestionView,
  async executeSlash({ interaction }) {
    const view = buildQuestionView(interaction.user.id, getLanguage(interaction));
    await interaction.editReply(view);
  },
  async execute(interaction) {
    return this.executeSlash({ interaction });
  },
  // No prefixo a resposta seria pública: oferece um botão que abre o desafio em modo privado
  async executePrefix({ message }) {
    const lang = getLanguage(message);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dch:open')
        .setLabel(t('challenge.openButton', lang))
        .setEmoji(buttonEmojiFor('🧩'))
        .setStyle(ButtonStyle.Primary)
    );
    await message.reply({
      content: t('challenge.prefixPrompt', lang),
      components: [row],
      allowedMentions: { parse: [], repliedUser: false },
    });
  },
};

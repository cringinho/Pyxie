const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { ANIME } = require('./commandNames');
const animeService = require('../services/animeQuizService');
const { addCoins, getBalance } = require('../services/economy');
const { formatCoins, formatRemaining, getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const QUESTION_TIMEOUT_MS = 45 * 1000;
const LETTERS = ['A', 'B', 'C', 'D'];

// Corridas em andamento: userId -> { questions, index, correct, earned, lang, timer }
const activeRuns = new Map();

function endRunSession(userId) {
  const run = activeRuns.get(userId);
  if (run?.timer) clearTimeout(run.timer);
  activeRuns.delete(userId);
}

function armTimeout(userId) {
  const run = activeRuns.get(userId);
  if (!run) return;
  if (run.timer) clearTimeout(run.timer);
  run.timer = setTimeout(() => {
    const current = activeRuns.get(userId);
    if (current) {
      animeService.finishRun(userId, current.correct, current.questions.length);
      activeRuns.delete(userId);
    }
  }, QUESTION_TIMEOUT_MS);
  if (typeof run.timer.unref === 'function') run.timer.unref();
}

function buildQuestionView(userId, run, lastLine = '') {
  const lang = run.lang;
  const q = run.questions[run.index];
  const options = q.choices.map((c, i) => `**[${LETTERS[i]}]** ${c}`).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.neonPink)
    .setTitle(t('anime.title', lang, { round: run.index + 1, total: run.questions.length }))
    .setDescription(
      t('anime.questionDesc', lang, {
        lastResult: lastLine,
        question: q.question,
        options,
        topic: q.topic,
        difficulty: t(`quiz.diffTier${Math.max(1, Math.min(4, q.level))}`, lang),
        seconds: QUESTION_TIMEOUT_MS / 1000,
      })
    )
    .addFields(
      { name: t('anime.earnedLabel', lang), value: t('anime.earnedValue', lang, { amount: run.earned }), inline: true },
      { name: t('anime.perCorrectLabel', lang), value: t('anime.perCorrectValue', lang, { amount: animeService.REWARD_PER_CORRECT }), inline: true }
    )
    .setFooter({ text: t('anime.footer', lang) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    q.choices.map((_, i) =>
      new ButtonBuilder()
        .setCustomId(`anq:${userId}:${run.index}:${i}`)
        .setLabel(`[${LETTERS[i]}]`)
        .setStyle(ButtonStyle.Primary)
    )
  );

  return { content: '', embeds: [embed], components: [row] };
}

function buildFinishView(userId, run, { isPerfect, bestScore, newRecord, bonus }, wrongAnswer = null) {
  const lang = run.lang;
  const lines = [];
  if (wrongAnswer) lines.push(t('anime.wrongLine', lang, { answer: wrongAnswer }));
  lines.push(t('anime.finishScore', lang, { correct: run.correct, total: run.questions.length }));
  if (isPerfect) lines.push(t('anime.perfectLine', lang, { bonus }));
  if (newRecord) lines.push(t('anime.newRecord', lang));
  lines.push(
    t('anime.finishCoins', lang, {
      earned: run.earned,
      balance: formatCoins(getBalance(userId), lang),
    })
  );
  lines.push(t('anime.finishNote', lang, { best: bestScore }));

  const embed = new EmbedBuilder()
    .setColor(isPerfect ? PYXIE_COLORS.gold : PYXIE_COLORS.purple)
    .setTitle(t(isPerfect ? 'anime.perfectTitle' : 'anime.finishTitle', lang))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('anime.footer', lang) })
    .setTimestamp();

  return { content: '', embeds: [embed], components: [] };
}

function startRunView(user, lang) {
  if (activeRuns.has(user.id)) return { content: t('anime.alreadyRunning', lang), embeds: [], components: [] };

  const status = animeService.getRunStatus(user.id);
  if (!status.available) {
    return {
      content: t('anime.cooldown', lang, { time: formatRemaining(status.remainingMs, lang) }),
      embeds: [],
      components: [],
    };
  }

  const questions = animeService.pickRunQuestions(animeService.loadAnimeQuestions(), lang);
  if (questions.length === 0) return { content: t('anime.noQuestions', lang), embeds: [], components: [] };

  animeService.startRun(user.id);
  const run = { questions, index: 0, correct: 0, earned: 0, lang, timer: null };
  activeRuns.set(user.id, run);
  armTimeout(user.id);
  return buildQuestionView(user.id, run);
}

function isAnimeInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('anq:');
}

async function handleAnimeInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, ownerId, index, choice] = interaction.customId.split(':');

  if (ownerId === 'open') {
    return interaction.reply({ ...startRunView(interaction.user, lang), flags: 64 });
  }
  if (ownerId !== interaction.user.id) {
    return interaction.reply({ content: t('anime.notYours', lang), flags: 64 });
  }

  const run = activeRuns.get(ownerId);
  if (!run || Number(index) !== run.index) {
    return interaction.update({ content: t('anime.expired', run?.lang || lang), embeds: [], components: [] });
  }

  const q = run.questions[run.index];
  if (Number(choice) !== q.correctIndex) {
    const result = animeService.finishRun(ownerId, run.correct, run.questions.length);
    endRunSession(ownerId);
    return interaction.update(buildFinishView(ownerId, run, { ...result, bonus: 0 }, q.correctText));
  }

  run.correct += 1;
  run.earned += animeService.REWARD_PER_CORRECT;
  addCoins(ownerId, animeService.REWARD_PER_CORRECT);
  run.index += 1;

  if (run.index >= run.questions.length) {
    const result = animeService.finishRun(ownerId, run.correct, run.questions.length);
    const bonus = result.isPerfect ? animeService.PERFECT_BONUS : 0;
    if (bonus) {
      addCoins(ownerId, bonus);
      run.earned += bonus;
    }
    endRunSession(ownerId);
    return interaction.update(buildFinishView(ownerId, run, { ...result, bonus }));
  }

  armTimeout(ownerId);
  return interaction.update(buildQuestionView(ownerId, run, t('anime.correctLine', run.lang, { answer: q.correctText })));
}

module.exports = {
  name: ANIME,
  aliases: ['anime', 'otaku', 'py-otaku', 'animequiz', 'py-animequiz', 'maratona', 'py-maratona'],
  ephemeral: true,
  description: 'Otaku Marathon: 5 anime & geek questions of rising difficulty. Each right answer earns coins!',
  descriptionLocalizations: {
    'pt-BR': 'Maratona Otaku: 5 perguntas de anime e cultura geek. Cada acerto rende moedinhas!',
  },
  data: new SlashCommandBuilder()
    .setName(ANIME)
    .setDescription('Otaku Marathon: 5 anime & geek questions of rising difficulty. Each right answer earns coins!')
    .setDescriptionLocalizations({
      'pt-BR': 'Maratona Otaku: 5 perguntas de anime e cultura geek. Cada acerto rende moedinhas!',
    }),
  isAnimeInteraction,
  handleAnimeInteraction,
  startRunView,
  activeRuns,
  async executeSlash({ interaction }) {
    await interaction.editReply(startRunView(interaction.user, getLanguage(interaction)));
  },
  async execute(interaction) {
    return this.executeSlash({ interaction });
  },
  // No prefixo a resposta seria pública: oferece um botão que abre a maratona em modo privado
  async executePrefix({ message }) {
    const lang = getLanguage(message);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anq:open')
        .setLabel(t('anime.openButton', lang))
        .setEmoji('🎴')
        .setStyle(ButtonStyle.Primary)
    );
    await message.reply({
      content: t('anime.prefixPrompt', lang),
      components: [row],
      allowedMentions: { parse: [], repliedUser: false },
    });
  },
};

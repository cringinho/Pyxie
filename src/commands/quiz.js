const fs = require('fs');
const path = require('path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { QUIZ } = require('./commandNames');
const {
  getQuizStatus,
  startQuiz,
  addCoins,
  getBalance,
} = require('../services/economy');
const { formatCoins, formatRemaining, getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const QUIZ_FILE = path.join(__dirname, '../data/quiz_questions.json');
const QUIZ_TIMEOUT_MS = 60 * 1000;
const REWARD_PER_QUESTION = 10;

// Sessões em andamento: userId -> { round, streak, accumulated, currentQuestion, lang, ... }
const activeQuizSessions = new Map();

function loadQuizQuestions() {
  if (fs.existsSync(QUIZ_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (_) {}
  }
  return [];
}

function shuffleArray(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getDifficultyTierName(level, lang = 'pt') {
  const key = `quiz.diffTier${Math.max(1, Math.min(4, level))}`;
  return t(key, lang);
}

function selectQuestionForLevel(questions, level) {
  const targetLevel = Math.max(1, Math.min(4, level));
  const pool = questions.filter((q) => Number(q.level) === targetLevel);
  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return questions[Math.floor(Math.random() * questions.length)];
}

function buildQuizQuestionView(userId, session, lang) {
  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions = session.choices
    .map((c, i) => `**[${letters[i]}]** ${c.text}`)
    .join('\n\n');

  const diffLabel = getDifficultyTierName(session.level, lang);

  const desc = [
    t('quiz.roundHeader', lang, { round: session.round, difficulty: diffLabel }),
    t('quiz.accumulatedLabel', lang, { amount: session.accumulated }),
    '',
    `📌 **${session.questionText}**`,
    '',
    formattedOptions,
    '',
    t('quiz.cashoutHint', lang),
    t('quiz.timeLimit', lang),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet || '#a855f7')
    .setTitle(t('quiz.title', lang))
    .setDescription(desc)
    .setFooter({ text: 'Pyxie Quiz' })
    .setTimestamp();

  const answersRow = new ActionRowBuilder();
  session.choices.forEach((_, idx) => {
    answersRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_ans:${idx}:${userId}`)
        .setLabel(`[${letters[idx]}]`)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const actionRows = [answersRow];

  // Se o jogador já acumulou moedas nesta rodada, permite parar e resgatar
  if (session.accumulated > 0) {
    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_stop:${userId}`)
        .setLabel(t('quiz.cashoutButton', lang))
        .setEmoji('💰')
        .setStyle(ButtonStyle.Success)
    );
    actionRows.push(controlRow);
  }

  return { embeds: [embed], components: actionRows };
}

function isQuizInteraction(interaction) {
  return (
    interaction.isButton() &&
    (interaction.customId.startsWith('quiz_ans:') ||
      interaction.customId.startsWith('quiz_stop:') ||
      interaction.customId.startsWith('quiz_next:'))
  );
}

async function handleQuizInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[0];
  const sessionUserId = action === 'quiz_ans' ? parts[2] : parts[1];

  if (interaction.user.id !== sessionUserId) {
    return interaction.reply({
      content: t('quiz.otherUserSession', interaction),
      flags: 64,
    });
  }

  const session = activeQuizSessions.get(sessionUserId);
  if (!session) {
    return interaction.reply({
      content: t('quiz.expiredSession', interaction),
      flags: 64,
    });
  }

  const lang = session.lang || getLanguage(interaction);

  // Ação 1: Parar e garantir as moedas acumuladas
  if (action === 'quiz_stop') {
    activeQuizSessions.delete(sessionUserId);
    if (session.timeoutTimer) clearTimeout(session.timeoutTimer);

    const safeAmount = session.accumulated;
    let newBalance = getBalance(sessionUserId);
    if (safeAmount > 0) {
      newBalance = addCoins(sessionUserId, safeAmount);
    }

    const cashoutEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.emerald || '#10b981')
      .setTitle(t('quiz.cashoutTitle', lang))
      .setDescription(
        t('quiz.cashoutDesc', lang, {
          amount: safeAmount,
          balance: formatCoins(newBalance, lang),
        })
      )
      .setFooter({ text: 'Pyxie Quiz' })
      .setTimestamp();

    return interaction.update({ embeds: [cashoutEmbed], components: [] });
  }

  // Ação 2: Avançar para a próxima pergunta após acertar
  if (action === 'quiz_next') {
    if (session.timeoutTimer) clearTimeout(session.timeoutTimer);

    const allQuestions = loadQuizQuestions();
    const nextQ = selectQuestionForLevel(allQuestions, session.level);
    const qData = nextQ[lang] || nextQ.en || nextQ.pt;

    const rawWrongs = Array.isArray(qData.wrongs) ? qData.wrongs : [];
    const wrongs = shuffleArray(rawWrongs).slice(0, 3);
    const choices = shuffleArray([
      { text: qData.correct, correct: true },
      ...wrongs.map((w) => ({ text: w, correct: false })),
    ]);
    const correctIndex = choices.findIndex((c) => c.correct);

    session.choices = choices;
    session.correctIndex = correctIndex;
    session.correctText = qData.correct;
    session.questionText = qData.question;

    session.timeoutTimer = setTimeout(() => {
      if (activeQuizSessions.has(sessionUserId)) {
        activeQuizSessions.delete(sessionUserId);
      }
    }, QUIZ_TIMEOUT_MS);

    const nextView = buildQuizQuestionView(sessionUserId, session, lang);
    return interaction.update(nextView);
  }

  // Ação 3: Resposta enviada pelo usuário
  const selectedIdx = Number(parts[1]);
  const isCorrect = selectedIdx === session.correctIndex;

  if (session.timeoutTimer) clearTimeout(session.timeoutTimer);

  if (!isCorrect) {
    // ERROU: Perde todas as moedas acumuladas nesta partida
    const lostAmount = session.accumulated;
    activeQuizSessions.delete(sessionUserId);

    const wrongEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.crimson || '#ef4444')
      .setTitle(t('quiz.wrongTitle', lang))
      .setDescription(
        t('quiz.wrongDesc', lang, {
          lost: lostAmount,
          correct: session.correctText,
        })
      )
      .setFooter({ text: 'Pyxie Quiz' })
      .setTimestamp();

    return interaction.update({ embeds: [wrongEmbed], components: [] });
  }

  // ACERTOU: Acumula +10 moedas e sobe de nível conforme acertos seguidos
  session.streak = (session.streak || 0) + 1;
  session.accumulated += REWARD_PER_QUESTION;
  session.round += 1;

  // Sobe o nível de dificuldade a cada 2 acertos seguidos até o nível 4
  const calculatedLevel = Math.min(4, 1 + Math.floor(session.streak / 2));
  session.level = calculatedLevel;

  const diffLabel = getDifficultyTierName(session.level, lang);

  const successEmbed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.emerald || '#10b981')
    .setTitle(t('quiz.successTitle', lang))
    .setDescription(
      t('quiz.successDesc', lang, {
        reward: REWARD_PER_QUESTION,
        total: session.accumulated,
        difficulty: diffLabel,
      })
    )
    .setFooter({ text: 'Pyxie Quiz' })
    .setTimestamp();

  const nextRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`quiz_next:${sessionUserId}`)
      .setLabel(t('quiz.nextButton', lang))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('➡️'),
    new ButtonBuilder()
      .setCustomId(`quiz_stop:${sessionUserId}`)
      .setLabel(t('quiz.cashoutButton', lang))
      .setStyle(ButtonStyle.Success)
      .setEmoji('💰')
  );

  return interaction.update({ embeds: [successEmbed], components: [nextRow] });
}

async function runQuiz(source, reply) {
  const user = source.user || source.author;
  const lang = getLanguage(source);

  const status = getQuizStatus(user.id);
  if (!status.available) {
    await reply({
      content: t('quiz.cooldown', lang, { time: formatRemaining(status.remainingMs, lang) }),
      ephemeral: true,
    });
    return;
  }

  const allQuestions = loadQuizQuestions();
  if (!allQuestions || allQuestions.length === 0) {
    await reply({
      content: '⚠️ O banco de perguntas do quiz está sendo inicializado. Tente novamente em instantes!',
      ephemeral: true,
    });
    return;
  }

  // Inicia o cooldown de 3 horas no banco
  startQuiz(user.id);

  const initialLevel = 1;
  const chosenQ = selectQuestionForLevel(allQuestions, initialLevel);
  const qData = chosenQ[lang] || chosenQ.en || chosenQ.pt;

  const rawWrongs = Array.isArray(qData.wrongs) ? qData.wrongs : [];
  const wrongs = shuffleArray(rawWrongs).slice(0, 3);
  const choices = shuffleArray([
    { text: qData.correct, correct: true },
    ...wrongs.map((w) => ({ text: w, correct: false })),
  ]);
  const correctIndex = choices.findIndex((c) => c.correct);

  const session = {
    userId: user.id,
    round: 1,
    streak: 0,
    accumulated: 0,
    level: initialLevel,
    choices,
    correctIndex,
    correctText: qData.correct,
    questionText: qData.question,
    lang,
    startedAt: Date.now(),
  };

  session.timeoutTimer = setTimeout(() => {
    if (activeQuizSessions.has(user.id)) {
      activeQuizSessions.delete(user.id);
    }
  }, QUIZ_TIMEOUT_MS);

  activeQuizSessions.set(user.id, session);

  const view = buildQuizQuestionView(user.id, session, lang);
  await reply(view);
}

module.exports = {
  name: QUIZ,
  aliases: ['quiz', 'py-quiz', 'trivia', 'py-trivia', 'perguntas'],
  description: 'Answer cultural quiz questions to earn 10 coins. One wrong answer loses all!',
  descriptionLocalizations: {
    'pt-BR': 'Responda ao quiz cultural valendo 10 moedas por acerto. Um erro perde tudo!',
  },
  data: new SlashCommandBuilder()
    .setName(QUIZ)
    .setDescription('Answer cultural quiz questions to earn 10 coins. One wrong answer loses all!')
    .setDescriptionLocalizations({
      'pt-BR': 'Responda ao quiz cultural valendo 10 moedas por acerto. Um erro perde tudo!',
    }),
  isQuizInteraction,
  handleQuizInteraction,
  async executeSlash({ interaction }) {
    await runQuiz(interaction, (options) => {
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(options);
      }
      return interaction.reply(options);
    });
  },
  async execute(interaction) {
    return this.executeSlash({ interaction });
  },
  async executePrefix({ message }) {
    await runQuiz(message, (options) => message.reply(options));
  },
};

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { MATH } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const {
  getGrimoireStats,
  getDifficultyForStreak,
  getRandomQuestion,
  recordUserAnswer,
  getMathRanking,
} = require('../services/arcaneMathService');

const activeMathSessions = new Map();

function getDifficultyBadge(diff, lang = 'pt') {
  const isEn = lang === 'en';
  switch (diff) {
    case 'extremo':
      return {
        label: isEn ? '🔴 Extreme (World Math Olympiad / IMO)' : '🔴 Extremo (Olimpíada Mundial / IMO)',
        color: '#ef4444',
      };
    case 'dificil':
      return {
        label: isEn ? '🟠 Hard (Advanced Collegiate)' : '🟠 Difícil (Universitário Avançado)',
        color: '#f97316',
      };
    case 'medio':
      return {
        label: isEn ? '🟡 Medium (Algebra & Geometry)' : '🟡 Médio (Álgebra & Geometria)',
        color: '#eab308',
      };
    case 'facil':
    default:
      return {
        label: isEn ? '🟢 Easy (Runic Arithmetic)' : '🟢 Fácil (Aritmética Rúnica)',
        color: '#10b981',
      };
  }
}

function buildMathQuestionEmbed({ question, streak, lang = 'pt', username }) {
  const isEn = lang === 'en';
  const qData = isEn ? (question.en || question.pt) : question.pt;
  const diffBadge = getDifficultyBadge(question.difficulty, lang);
  const stats = getGrimoireStats();

  const letters = ['A', 'B', 'C', 'D'];
  const formattedOptions = qData.options
    .map((opt, i) => `**${letters[i]})** ${opt}`)
    .join('\n');

  const desc = [
    `👤 **${isEn ? 'Challenger' : 'Desafiante'}:** ${username}`,
    `🔥 **${isEn ? 'Current Streak' : 'Sequência Atual'}:** **${streak}** ${isEn ? 'correct answer(s)' : 'acerto(s)'}`,
    `⚡ **${isEn ? 'Difficulty Level' : 'Nível de Dificuldade'}:** **${diffBadge.label}**`,
    '',
    `**${isEn ? 'Question' : 'Desafio Arcano'}:**`,
    `> **${qData.question}**`,
    '',
    `**${isEn ? 'Options' : 'Alternativas'}:**`,
    formattedOptions,
    '',
    `📚 **${isEn ? 'Arcane Grimoire' : 'Grimório Arcano'}:** **${stats.total}** ${isEn ? 'Stored Questions' : 'Questões Armazenadas'}`,
    `> *(${stats.facil} ${isEn ? 'Easy' : 'Fáceis'} • ${stats.medio} ${isEn ? 'Medium' : 'Médias'} • ${stats.dificil} ${isEn ? 'Hard' : 'Difíceis'} • ${stats.extremo} ${isEn ? 'Extreme' : 'Extremas'})*`,
  ].join('\n');

  return new EmbedBuilder()
    .setColor(diffBadge.color)
    .setTitle(isEn ? '📐 ✦ Master of Arcane Mathematics' : '📐 ✦ Mestre da Matemática Arcana')
    .setDescription(desc)
    .setFooter({
      text: isEn
        ? 'Select an option below (45s) • Every 10 correct answers expand the database'
        : 'Selecione uma opção abaixo (45s) • A cada 10 acertos o banco de questões é expandido',
    })
    .setTimestamp();
}

function buildMathButtons(sessionId, disabled = false) {
  const letters = ['A', 'B', 'C', 'D'];
  const rows = [];

  // Botões em 4 linhas separadas para máxima legibilidade mobile
  for (let i = 0; i < 4; i++) {
    rows.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`math_ans:${sessionId}:${i}`)
          .setLabel(`Alternativa ${letters[i]}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(disabled)
      )
    );
  }

  // Linha utilitária (Desistir)
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`math_giveup:${sessionId}`)
        .setLabel('🏳️ Desistir / Encerrar')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    )
  );

  return rows;
}

function buildRankingEmbed(lang = 'pt') {
  const isEn = lang === 'en';
  const ranking = getMathRanking(10);
  const stats = getGrimoireStats();

  const lines = ranking.length
    ? ranking.map((p, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**#${i + 1}**`;
        const diffLabel = getDifficultyBadge(p.highestDifficultyReached || 'facil', lang).label;
        return `${medal} **${p.username}**\n> 🔥 ${isEn ? 'Best Streak' : 'Maior Sequência'}: **${p.highestStreak}** • 🎯 ${isEn ? 'Total Correct' : 'Total de Acertos'}: **${p.totalCorrect}** • ${diffLabel}`;
      })
    : [isEn ? '*No mathematicians recorded yet. Be the first!*' : '*Nenhum matemático registrado ainda. Seja o primeiro!*'];

  const desc = [
    isEn
      ? 'The greatest mathematical minds and Olympiad masters in the realm:'
      : 'Os maiores mestres matemáticos e campeões olímpicos do reino:',
    '',
    lines.join('\n\n'),
    '',
    `📚 **${isEn ? 'Database Status' : 'Banco de Dados'}:** **${stats.total}** ${isEn ? 'questions stored in the Grimoire' : 'questões armazenadas no Grimório'}`,
  ].join('\n');

  return new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(isEn ? '🏆 ✦ Arcane Mathematics Global Leaderboard' : '🏆 ✦ Ranking Global da Matemática Arcana')
    .setDescription(desc)
    .setFooter({ text: 'Pyxie • pyxie.com.br' })
    .setTimestamp();
}

async function startMathGame(interaction, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const userId = interaction.user ? interaction.user.id : interaction.author.id;
  const username = interaction.user ? (interaction.user.displayName || interaction.user.username) : (interaction.author.displayName || interaction.author.username);

  // Fecha sessão anterior se existir
  if (activeMathSessions.has(userId)) {
    const oldSession = activeMathSessions.get(userId);
    if (oldSession.collector) oldSession.collector.stop();
    activeMathSessions.delete(userId);
  }

  const sessionId = `m_${userId}_${Date.now()}`;
  const firstDiff = 'facil';
  const firstQuestion = getRandomQuestion(firstDiff, []);

  const session = {
    id: sessionId,
    userId,
    username,
    lang,
    streak: 0,
    currentQuestion: firstQuestion,
    answeredIds: [firstQuestion.id],
    message: null,
    collector: null,
  };

  activeMathSessions.set(userId, session);

  const embed = buildMathQuestionEmbed({
    question: firstQuestion,
    streak: 0,
    lang,
    username,
  });
  const components = buildMathButtons(sessionId, false);

  const replyOptions = { embeds: [embed], components, fetchReply: true };
  let msg;
  if (interaction.reply && !interaction.replied && !interaction.deferred) {
    msg = await interaction.reply(replyOptions);
  } else if (interaction.editReply) {
    msg = await interaction.editReply(replyOptions);
  } else if (interaction.channel) {
    msg = await interaction.channel.send(replyOptions);
  }

  session.message = msg;
  setupCollector(session);
}

function setupCollector(session) {
  if (!session.message) return;

  const collector = session.message.createMessageComponentCollector({
    filter: (i) => i.user.id === session.userId && i.customId.startsWith(`math_`),
    time: 45000,
  });

  session.collector = collector;

  collector.on('collect', async (i) => {
    const [action, sId, choiceIndexStr] = i.customId.split(':');
    if (sId !== session.id) return;

    if (action === 'math_giveup') {
      collector.stop('giveup');
      await i.deferUpdate().catch(() => {});
      return;
    }

    if (action === 'math_ans') {
      const choiceIndex = Number(choiceIndexStr);
      const isCorrect = choiceIndex === session.currentQuestion.pt.correctIndex;
      const qData = session.lang === 'en' ? (session.currentQuestion.en || session.currentQuestion.pt) : session.currentQuestion.pt;
      const letters = ['A', 'B', 'C', 'D'];

      if (isCorrect) {
        // Resposta correta!
        const result = await recordUserAnswer({
          userId: session.userId,
          username: session.username,
          isCorrect: true,
          currentStreak: session.streak,
        });

        session.streak = result.newStreak;
        const nextDiff = getDifficultyForStreak(session.streak);
        const nextQuestion = getRandomQuestion(nextDiff, session.answeredIds);
        session.answeredIds.push(nextQuestion.id);
        session.currentQuestion = nextQuestion;

        const nextEmbed = buildMathQuestionEmbed({
          question: nextQuestion,
          streak: session.streak,
          lang: session.lang,
          username: session.username,
        });
        const nextComponents = buildMathButtons(session.id, false);

        await i.update({ embeds: [nextEmbed], components: nextComponents }).catch(() => {});
        collector.resetTimer({ time: 45000 });
      } else {
        // Resposta errada!
        collector.stop('wrong');
        await recordUserAnswer({
          userId: session.userId,
          username: session.username,
          isCorrect: false,
          currentStreak: session.streak,
        });

        const correctLetter = letters[qData.correctIndex];
        const correctText = qData.options[qData.correctIndex];
        const chosenLetter = letters[choiceIndex];

        const isEn = session.lang === 'en';
        const finalEmbed = new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle(isEn ? '❌ Arcane Calculation Failed!' : '❌ Cálculo Arcano Incorreto!')
          .setDescription(
            [
              `👤 **${isEn ? 'Challenger' : 'Desafiante'}:** ${session.username}`,
              `❌ **${isEn ? 'Your Answer' : 'Sua Escolha'}:** ${chosenLetter}`,
              `✅ **${isEn ? 'Correct Answer' : 'Resposta Correta'}:** **${correctLetter}) ${correctText}**`,
              '',
              `📖 **${isEn ? 'Explanation' : 'Explicação Mágica'}:**`,
              `> ${qData.explanation}`,
              '',
              `🔥 **${isEn ? 'Final Streak' : 'Sequência Atingida'}:** **${session.streak}** ${isEn ? 'correct in a row!' : 'acerto(s) consecutivos!'}`,
            ].join('\n')
          )
          .setFooter({ text: isEn ? 'Use /py-math to try again!' : 'Use /py-math para tentar novamente!' })
          .setTimestamp();

        const retryRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`math_retry:${session.userId}`)
            .setLabel(isEn ? 'Play Again' : 'Jogar Novamente')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`math_viewrank:${session.userId}`)
            .setLabel(isEn ? 'Global Leaderboard' : 'Ranking Global')
            .setEmoji('🏆')
            .setStyle(ButtonStyle.Secondary)
        );

        await i.update({ embeds: [finalEmbed], components: [retryRow] }).catch(() => {});
      }
    }
  });

  collector.on('end', async (_collected, reason) => {
    activeMathSessions.delete(session.userId);

    if (reason === 'time') {
      const isEn = session.lang === 'en';
      const qData = session.lang === 'en' ? (session.currentQuestion.en || session.currentQuestion.pt) : session.currentQuestion.pt;
      const letters = ['A', 'B', 'C', 'D'];

      const timeEmbed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle(isEn ? '⏰ Arcane Time Expired!' : '⏰ Tempo Esgotado!')
        .setDescription(
          [
            `⌛ ${isEn ? 'The 45-second timer ran out.' : 'O tempo limite de 45 segundos expirou.'}`,
            `✅ **${isEn ? 'Correct Answer' : 'Resposta Correta'}:** **${letters[qData.correctIndex]}) ${qData.options[qData.correctIndex]}**`,
            `> ${qData.explanation}`,
            '',
            `🔥 **${isEn ? 'Final Streak' : 'Sequência Atingida'}:** **${session.streak}** ${isEn ? 'correct!' : 'acertos!'}`,
          ].join('\n')
        )
        .setFooter({ text: 'Pyxie • pyxie.com.br' });

      await session.message.edit({ embeds: [timeEmbed], components: [] }).catch(() => {});
    } else if (reason === 'giveup') {
      const isEn = session.lang === 'en';
      const giveupEmbed = new EmbedBuilder()
        .setColor('#94a3b8')
        .setTitle(isEn ? '🏳️ Challenge Concluded' : '🏳️ Desafio Encerrado')
        .setDescription(
          isEn
            ? `Challenge ended. Your streak was **${session.streak}** correct answers.`
            : `Desafio encerrado. Sua sequência foi de **${session.streak}** acerto(s).`
        )
        .setFooter({ text: 'Pyxie • pyxie.com.br' });

      await session.message.edit({ embeds: [giveupEmbed], components: [] }).catch(() => {});
    }
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName(MATH)
    .setDescription('Play the progressive Arcane Math challenge or check the global ranking!')
    .setDescriptionLocalizations({
      'pt-BR': 'Jogue o desafio progressivo de Matemática Arcana ou consulte o ranking global!',
    })
    .addStringOption((opt) =>
      opt
        .setName('acao')
        .setDescription('Choose between playing or checking the leaderboard')
        .setDescriptionLocalizations({
          'pt-BR': 'Escolha entre jogar o desafio ou consultar o ranking global',
        })
        .setRequired(false)
        .addChoices(
          { name: 'Jogar / Play', value: 'jogar' },
          { name: 'Ranking Global / Leaderboard', value: 'ranking' }
        )
    ),
  aliases: ['math', 'matematica', 'py-matematica', 'arcanemath'],
  async execute(interaction, client, source = null) {
    const action = interaction.options?.getString('acao') || 'jogar';
    const lang = getLanguage(source);

    if (action === 'ranking') {
      const embed = buildRankingEmbed(lang);
      return interaction.reply({ embeds: [embed] });
    }

    await startMathGame(interaction, source);
  },
  startMathGame,
  buildRankingEmbed,
};


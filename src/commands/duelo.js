const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { DUEL } = require('./commandNames');
const duelService = require('../services/quizDuelService');
const { getGuildConfig } = require('../services/guildConfigService');
const { addCoins } = require('../services/economy');
const { loadQuizQuestions } = require('./quiz');
const { loadAnimeQuestions } = require('../services/animeQuizService');
const { formatCoins, getLanguage, t: baseT } = require('../utils/i18n');
const { emojify, buttonEmojiFor } = require('../utils/emojify');

// Todo texto do minigame passa pelo emojify: emojis do bot em vez de Unicode
const t = (key, source, replacements) => emojify(baseT(key, source, replacements));
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const ACCEPT_TIMEOUT_MS = 60 * 1000;
const ROUND_TIMEOUT_MS = 30 * 1000;
const LETTERS = ['A', 'B', 'C', 'D'];

// Mensagem pública de cada duelo e timers de expiração (o estado do jogo vive no quizDuelService)
const duelMessages = new Map();
const duelTimers = new Map();

function mention(id) {
  return `<@${id}>`;
}

function footerFor(guild, lang) {
  return { text: `Pyxie • ${guild ? guild.name : t('duel.private', lang)}` };
}

function clearDuelTimer(duelId) {
  const timer = duelTimers.get(duelId);
  if (timer) clearTimeout(timer);
  duelTimers.delete(duelId);
}

function setDuelTimer(duelId, ms, fn) {
  clearDuelTimer(duelId);
  const timer = setTimeout(fn, ms);
  if (typeof timer.unref === 'function') timer.unref();
  duelTimers.set(duelId, timer);
}

function scoreLine(duel, lang) {
  return t('duel.scoreValue', lang, {
    challenger: mention(duel.challengerId),
    opponent: mention(duel.opponentId),
    a: duel.scores[duel.challengerId],
    b: duel.scores[duel.opponentId],
  });
}

function lastRoundLine(duel, lang) {
  const last = duel.lastRound;
  if (!last) return '';
  return last.winnerId
    ? t('duel.lastRoundWon', lang, { round: last.round, user: mention(last.winnerId), answer: last.answer })
    : t('duel.lastRoundVoid', lang, { round: last.round, answer: last.answer });
}

function buildChallengeView(duel, guild) {
  const lang = duel.lang;
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle(t('duel.title', lang))
    .setDescription(
      t('duel.challengeDesc', lang, {
        challenger: mention(duel.challengerId),
        opponent: mention(duel.opponentId),
        reward: duelService.WIN_REWARD,
        limit: duelService.DAILY_REWARD_LIMIT,
        theme: t(duel.theme === 'anime' ? 'duel.themeAnime' : 'duel.themeGeneral', lang),
      })
    )
    .setFooter(footerFor(guild, lang))
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`qd:acc:${duel.id}`)
      .setLabel(t('duel.acceptButton', lang))
      .setEmoji(buttonEmojiFor('⚔️'))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`qd:dec:${duel.id}`)
      .setLabel(t('duel.declineButton', lang))
      .setEmoji(buttonEmojiFor('🏳️'))
      .setStyle(ButtonStyle.Secondary)
  );

  return {
    content: mention(duel.opponentId),
    embeds: [embed],
    components: [row],
    allowedMentions: { parse: [], users: [duel.opponentId], roles: [], repliedUser: false },
  };
}

function buildRoundView(duel, guild) {
  const lang = duel.lang;
  const q = duel.questions[duel.round - 1];
  const options = q.choices.map((c, i) => `**[${LETTERS[i]}]** ${c}`).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet)
    .setTitle(t('duel.roundTitle', lang, { round: duel.round, total: duelService.TOTAL_ROUNDS }))
    .setDescription(
      t('duel.roundDesc', lang, {
        lastResult: lastRoundLine(duel, lang),
        question: q.question,
        options,
        topic: q.topic,
        seconds: ROUND_TIMEOUT_MS / 1000,
      })
    )
    .addFields({ name: t('duel.scoreLabel', lang), value: scoreLine(duel, lang), inline: false })
    .setFooter(footerFor(guild, lang))
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    q.choices.map((_, i) =>
      new ButtonBuilder()
        .setCustomId(`qd:ans:${duel.id}:${duel.round}:${i}`)
        .setLabel(`[${LETTERS[i]}]`)
        .setStyle(ButtonStyle.Primary)
    )
  );

  return { content: '', embeds: [embed], components: [row], allowedMentions: { parse: [] } };
}

function buildFinishView(duel, outcome, guild) {
  const lang = duel.lang;
  let description;
  if (outcome.draw) {
    description = t('duel.finishDrawDesc', lang, { lastResult: lastRoundLine(duel, lang), score: scoreLine(duel, lang) });
  } else {
    let rewardLine;
    if (outcome.reward > 0) {
      rewardLine = t('duel.rewardLine', lang, {
        reward: outcome.reward,
        winner: mention(outcome.winnerId),
        balance: formatCoins(outcome.balance, lang),
      });
    } else {
      rewardLine = t('duel.rewardLimited', lang, {
        winner: mention(outcome.winnerId),
        limit: duelService.DAILY_REWARD_LIMIT,
      });
    }
    description = t('duel.finishWinDesc', lang, {
      lastResult: lastRoundLine(duel, lang),
      winner: mention(outcome.winnerId),
      score: scoreLine(duel, lang),
      rewardLine,
    });
  }

  const statsFor = (id) => {
    const s = duelService.getPlayerStats(id);
    return t('duel.statsValue', lang, { user: mention(id), wins: s.wins, losses: s.losses, draws: s.draws });
  };

  const embed = new EmbedBuilder()
    .setColor(outcome.draw ? PYXIE_COLORS.purple : PYXIE_COLORS.gold)
    .setTitle(t('duel.finishTitle', lang))
    .setDescription(description)
    .addFields({
      name: t('duel.statsLabel', lang),
      value: `${statsFor(duel.challengerId)}\n\n${statsFor(duel.opponentId)}`,
      inline: false,
    })
    .setFooter(footerFor(guild, lang))
    .setTimestamp();

  return { content: '', embeds: [embed], components: [], allowedMentions: { parse: [] } };
}

function buildClosedView(titleKey, descKey, userId, lang, guild) {
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.lilac)
    .setTitle(t(titleKey, lang))
    .setDescription(t(descKey, lang, { user: mention(userId), opponent: mention(userId) }))
    .setFooter(footerFor(guild, lang))
    .setTimestamp();
  return { content: '', embeds: [embed], components: [], allowedMentions: { parse: [] } };
}

/** Avança a mensagem pública após uma rodada encerrada (por acerto, erro duplo ou tempo). */
function viewAfterRound(duel, step, guild) {
  if (step.finished) {
    clearDuelTimer(duel.id);
    duelMessages.delete(duel.id);
    if (step.outcome.reward > 0) step.outcome.balance = addCoins(step.outcome.winnerId, step.outcome.reward);
    return buildFinishView(duel, step.outcome, guild);
  }
  armRoundTimer(duel, guild);
  return buildRoundView(duel, guild);
}

function armRoundTimer(duel, guild) {
  const round = duel.round;
  setDuelTimer(duel.id, ROUND_TIMEOUT_MS, async () => {
    const step = duelService.timeoutRound(duel.id, round);
    if (!step) return;
    const message = duelMessages.get(duel.id);
    const view = viewAfterRound(duel, step, guild);
    if (message) await message.edit(view).catch(() => {});
  });
}

function isDuelInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('qd:');
}

async function handleDuelInteraction(interaction) {
  const [, action, duelId, round, choice] = interaction.customId.split(':');
  const duel = duelService.getDuel(duelId);
  const lang = duel?.lang || getLanguage(interaction);
  const ephemeral = (key, replacements) =>
    interaction.reply({ content: t(key, lang, replacements), flags: 64, allowedMentions: { parse: [] } });

  if (!duel) return ephemeral('duel.notFound');

  if (action === 'acc') {
    const res = duelService.acceptDuel(duelId, interaction.user.id);
    if (res.error === 'not_opponent') return ephemeral('duel.notOpponent', { opponent: mention(duel.opponentId) });
    if (res.error) return ephemeral('duel.notFound');
    duelMessages.set(duel.id, interaction.message);
    armRoundTimer(duel, interaction.guild);
    return interaction.update(buildRoundView(duel, interaction.guild));
  }

  if (action === 'dec') {
    const res = duelService.declineDuel(duelId, interaction.user.id);
    if (res.error === 'not_player') return ephemeral('duel.notPlayer');
    if (res.error) return ephemeral('duel.notFound');
    clearDuelTimer(duelId);
    duelMessages.delete(duelId);
    const view = res.cancelled
      ? buildClosedView('duel.cancelledTitle', 'duel.cancelledDesc', interaction.user.id, lang, interaction.guild)
      : buildClosedView('duel.declinedTitle', 'duel.declinedDesc', interaction.user.id, lang, interaction.guild);
    return interaction.update(view);
  }

  if (action === 'ans') {
    const res = duelService.submitAnswer(duelId, interaction.user.id, round, choice);
    if (res.error === 'not_player') return ephemeral('duel.notPlayer');
    if (res.error === 'stale_round') return ephemeral('duel.staleRound');
    if (res.error === 'locked_out') return ephemeral('duel.lockedOut');
    if (res.error) return ephemeral('duel.notFound');
    if (res.result === 'wrong') return ephemeral('duel.wrongAnswer');
    return interaction.update(viewAfterRound(duel, res, interaction.guild));
  }

  return ephemeral('duel.notFound');
}

/**
 * Cria o desafio. Retorna o payload público ou um erro (string já traduzida) para resposta privada.
 */
function prepareDuel({ challenger, opponent, guild, channelId, lang, theme = 'general' }) {
  if (!guild) return { error: t('duel.guildOnly', lang) };

  const gamesChannelId = getGuildConfig(guild.id).gamesChannelId;
  if (gamesChannelId && gamesChannelId !== channelId) {
    return { error: t('duel.wrongChannel', lang, { channel: gamesChannelId }) };
  }
  if (!opponent) return { error: t('duel.missingOpponent', lang) };
  if (opponent.id === challenger.id) return { error: t('duel.selfChallenge', lang) };
  if (opponent.bot) return { error: t('duel.botChallenge', lang) };

  const res = duelService.createDuel({
    challengerId: challenger.id,
    opponentId: opponent.id,
    lang,
    questions: theme === 'anime' ? loadAnimeQuestions() : loadQuizQuestions(),
  });
  if (res.duel) res.duel.theme = theme;
  if (res.error === 'no_questions') return { error: t('duel.noQuestions', lang) };
  if (res.error === 'challenger_busy') return { error: t('duel.busy', lang, { user: mention(challenger.id) }) };
  if (res.error === 'opponent_busy') return { error: t('duel.busy', lang, { user: mention(opponent.id) }) };

  return { duel: res.duel, payload: buildChallengeView(res.duel, guild) };
}

function armAcceptTimer(duel, guild) {
  setDuelTimer(duel.id, ACCEPT_TIMEOUT_MS, async () => {
    const expired = duelService.expirePendingDuel(duel.id);
    const message = duelMessages.get(duel.id);
    duelMessages.delete(duel.id);
    if (!expired || !message) return;
    const embed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.lilac)
      .setTitle(t('duel.expiredTitle', duel.lang))
      .setDescription(t('duel.expiredDesc', duel.lang, { opponent: mention(duel.opponentId) }))
      .setFooter(footerFor(guild, duel.lang))
      .setTimestamp();
    await message.edit({ content: '', embeds: [embed], components: [], allowedMentions: { parse: [] } }).catch(() => {});
  });
}

module.exports = {
  name: DUEL,
  aliases: ['duel', 'duelo', 'py-duelo', 'quizduel', 'py-quizduel', 'duelquiz'],
  description: 'Challenge someone to a best-of-3 quiz duel (general or anime). The winner earns a few coins!',
  descriptionLocalizations: {
    'pt-BR': 'Desafie alguém para um duelo de quiz melhor de 3 (geral ou anime). Quem vencer ganha moedinhas!',
  },
  data: new SlashCommandBuilder()
    .setName(DUEL)
    .setDescription('Challenge someone to a best-of-3 quiz duel (general or anime). The winner earns a few coins!')
    .setDescriptionLocalizations({
      'pt-BR': 'Desafie alguém para um duelo de quiz melhor de 3 (geral ou anime). Quem vencer ganha moedinhas!',
    })
    .addUserOption((option) =>
      option
        .setName('opponent')
        .setNameLocalizations({ 'pt-BR': 'oponente' })
        .setDescription('Who do you want to challenge?')
        .setDescriptionLocalizations({ 'pt-BR': 'Quem você quer desafiar?' })
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('theme')
        .setNameLocalizations({ 'pt-BR': 'tema' })
        .setDescription('Question theme (default: general knowledge).')
        .setDescriptionLocalizations({ 'pt-BR': 'Tema das perguntas (padrão: conhecimentos gerais).' })
        .addChoices(
          { name: 'General knowledge', name_localizations: { 'pt-BR': 'Conhecimentos gerais' }, value: 'general' },
          { name: 'Anime & Geek', name_localizations: { 'pt-BR': 'Anime & Geek' }, value: 'anime' }
        )
    ),
  isDuelInteraction,
  handleDuelInteraction,
  prepareDuel,
  buildRoundView,
  buildFinishView,
  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction);
    const res = prepareDuel({
      challenger: interaction.user,
      opponent: interaction.options.getUser('opponent'),
      guild: interaction.guild,
      channelId: interaction.channelId,
      lang,
      theme: interaction.options.getString('theme') === 'anime' ? 'anime' : 'general',
    });
    if (res.error) {
      await interaction.editReply({ content: res.error, allowedMentions: { parse: [] } });
      return;
    }
    const message = await interaction.editReply(res.payload);
    duelMessages.set(res.duel.id, message);
    armAcceptTimer(res.duel, interaction.guild);
  },
  async execute(interaction) {
    return this.executeSlash({ interaction });
  },
  async executePrefix({ message, args = [] }) {
    const lang = getLanguage(message);
    const wantsAnime = args.some((a) => ['anime', 'otaku', 'geek'].includes(String(a).toLowerCase()));
    const res = prepareDuel({
      challenger: message.author,
      opponent: message.mentions.users.first(),
      guild: message.guild,
      channelId: message.channelId,
      lang,
      theme: wantsAnime ? 'anime' : 'general',
    });
    if (res.error) {
      await message.reply({ content: res.error, allowedMentions: { parse: [], repliedUser: false } });
      return;
    }
    const sent = await message.reply(res.payload);
    duelMessages.set(res.duel.id, sent);
    armAcceptTimer(res.duel, message.guild);
  },
};

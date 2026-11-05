const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { JOKENPO } = require('./commandNames');
const { getBalance, spendCoins, addCoins } = require('../services/economy');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

// Armazena partidas ativas em memória com timeout automático
const activeGames = new Map();

// AGENTS §5: aposta com teto (mesmo valor do /py-coinflip).
const MIN_BET = 10;
const MAX_BET = 5000;

/**
 * Devolve as apostas guardadas (empate, recusa ou expiração). É devolução do próprio
 * dinheiro, então não conta no teto diário de ganhos.
 */
function refundEscrow(game) {
  if (!game || !game.escrow) return;
  for (const [playerId, amount] of Object.entries(game.escrow)) {
    if (amount > 0) addCoins(playerId, amount, { bypassCap: true });
  }
  game.escrow = {};
}

/** Encerra a partida (recusa/expiração) devolvendo o que estava reservado. */
function cancelJokenpoGame(gameId) {
  const game = activeGames.get(gameId);
  if (!game) return false;
  activeGames.delete(gameId);
  game.resolved = true;
  refundEscrow(game);
  return true;
}

/**
 * Q283: registra a jogada de forma atômica (sem nenhum await no meio).
 * - A aposta sai do saldo na hora da jogada (reserva). Sem saldo, a jogada é recusada.
 * - Clique duplo do mesmo jogador não cobra duas vezes (a jogada já está marcada).
 * - Quando as duas jogadas chegam, a partida sai do mapa antes de pagar: só um clique resolve.
 * - O vencedor recebe o pote guardado; em empate cada um recebe a sua aposta de volta.
 */
function commitJokenpoChoice(gameId, userId, choice) {
  const game = activeGames.get(gameId);
  if (!game || game.resolved) return { status: 'expired' };
  const isChallenger = userId === game.challengerId;
  if (!isChallenger && userId !== game.opponentId) return { status: 'not_player', game };
  if (!CHOICES[choice]) return { status: 'invalid', game };

  const choiceKey = isChallenger ? 'challengerChoice' : 'opponentChoice';
  if (game[choiceKey]) return { status: 'already_chosen', game };

  if (game.bet > 0) {
    const paid = spendCoins(userId, game.bet);
    if (!paid.spent) return { status: 'no_funds', game, balance: paid.balance };
    game.escrow = game.escrow || {};
    game.escrow[userId] = (game.escrow[userId] || 0) + game.bet;
  }
  game[choiceKey] = choice;

  if (!game.challengerChoice || !game.opponentChoice) return { status: 'waiting', game };

  game.resolved = true;
  activeGames.delete(gameId);

  if (game.challengerChoice === game.opponentChoice) {
    refundEscrow(game);
    return { status: 'tie', game };
  }

  const challengerWins = CHOICES[game.challengerChoice].beats === game.opponentChoice;
  const winnerId = challengerWins ? game.challengerId : game.opponentId;
  const loserId = challengerWins ? game.opponentId : game.challengerId;
  let prize = 0;
  if (game.bet > 0) {
    const pot = Object.values(game.escrow || {}).reduce((sum, v) => sum + v, 0);
    // Transferência entre jogadores (o pote já saiu dos dois): não é moeda nova.
    addCoins(winnerId, pot, { bypassCap: true });
    game.escrow = {};
    prize = pot - game.bet;
  }
  return { status: 'win', game, winnerId, loserId, challengerWins, prize };
}

const CHOICES = {
  pedra: {
    pt: 'Pedra',
    en: 'Rock',
    emoji: '🪨',
    beats: 'tesoura',
  },
  papel: {
    pt: 'Papel',
    en: 'Paper',
    emoji: '📄',
    beats: 'pedra',
  },
  tesoura: {
    pt: 'Tesoura',
    en: 'Scissors',
    emoji: '✂️',
    beats: 'papel',
  },
};

function getChoiceLabel(choiceKey, lang = 'pt') {
  const item = CHOICES[choiceKey];
  if (!item) return choiceKey;
  return lang === 'en' ? item.en : item.pt;
}

function buildJokenpoComponents(gameId, disabled = false, lang = 'pt') {
  const isEn = lang === 'en';
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`jkp:pedra:${gameId}`)
        .setLabel(isEn ? 'Rock' : 'Pedra')
        .setEmoji('🪨')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:papel:${gameId}`)
        .setLabel(isEn ? 'Paper' : 'Papel')
        .setEmoji('📄')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:tesoura:${gameId}`)
        .setLabel(isEn ? 'Scissors' : 'Tesoura')
        .setEmoji('✂️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:cancel:${gameId}`)
        .setLabel(isEn ? 'Decline' : 'Recusar')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled)
    ),
  ];
}

function buildJokenpoEmbed(game, lang = 'pt') {
  const isEn = lang === 'en';
  const betText = game.bet > 0
    ? (isEn ? `💰 **Bet:** ${game.bet} Coins` : `💰 **Aposta:** ${game.bet} Moedas`)
    : (isEn ? '🎮 **Friendly Match (No bet)**' : '🎮 **Partida Amistosa (Sem apostas)**');

  const title = isEn ? '⚔️ ✦ Rock-Paper-Scissors Challenge!' : '⚔️ ✦ Desafio de Jokenpô!';
  const desc = isEn
    ? `<@${game.challengerId}> challenged <@${game.opponentId}> to a magical match of Rock, Paper, Scissors!\n\n` +
      `${betText}\n\n` +
      `*Choose your moves with the buttons below. Each choice remains secret until both duelists have picked!*`
    : `<@${game.challengerId}> desafiou <@${game.opponentId}> para uma disputa mágica de Pedra, Papel e Tesoura!\n\n` +
      `${betText}\n\n` +
      `*Escolham seus movimentos nos botões abaixo. Cada jogada é secreta até ambos votarem!*`;

  const confirmedText = isEn ? '✅ Choice confirmed!' : '✅ Escolha confirmada!';
  const thinkingText = isEn ? '🤔 Thinking of a move...' : '🤔 Pensando na jogada...';

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple || '#9b5de5')
    .setTitle(title)
    .setDescription(desc)
    .addFields(
      {
        name: `<@${game.challengerId}>`,
        value: game.challengerChoice ? confirmedText : thinkingText,
        inline: true,
      },
      {
        name: `<@${game.opponentId}>`,
        value: game.opponentChoice ? confirmedText : thinkingText,
        inline: true,
      }
    )
    .setFooter({ text: isEn ? 'Time limit: 60 seconds' : 'Tempo limite: 60 segundos' })
    .setTimestamp();
}

function startJokenpoGame({ challengerId, opponentId, bet = 0, channel, lang = 'pt' }) {
  const gameId = `jkp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const game = {
    id: gameId,
    challengerId,
    opponentId,
    bet: Math.min(MAX_BET, Math.max(0, Math.floor(Number(bet) || 0))),
    escrow: {},
    resolved: false,
    challengerChoice: null,
    opponentChoice: null,
    createdAt: Date.now(),
    lang,
  };

  activeGames.set(gameId, game);

  // Timeout automático de 60 segundos para liberar memória
  setTimeout(async () => {
    cancelJokenpoGame(gameId);
  }, 60000).unref?.();

  return {
    game,
    embed: buildJokenpoEmbed(game, lang),
    components: buildJokenpoComponents(gameId, false, lang),
  };
}

function isJokenpoInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('jkp:');
}

async function handleJokenpoInteraction(interaction) {
  const [, action, gameId] = interaction.customId.split(':');
  const game = activeGames.get(gameId);
  const lang = game?.lang || getLanguage(interaction);
  const isEn = lang === 'en';

  if (!game) {
    return interaction.reply({
      content: isEn
        ? '❌ This Rock-Paper-Scissors match has expired or ended.'
        : '❌ Esta partida de Jokenpô já expirou ou foi encerrada.',
      ephemeral: true,
    });
  }

  const userId = interaction.user.id;
  const isChallenger = userId === game.challengerId;
  const isOpponent = userId === game.opponentId;

  if (!isChallenger && !isOpponent) {
    return interaction.reply({
      content: isEn
        ? '❌ You are not part of this challenge.'
        : '❌ Você não está participando deste desafio.',
      ephemeral: true,
    });
  }

  // Ação de Cancelar / Recusar
  if (action === 'cancel') {
    cancelJokenpoGame(gameId);
    const cancelEmbed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle(isEn ? '❌ Rock-Paper-Scissors Match Cancelled' : '❌ Duelo de Jokenpô Encerrado')
      .setDescription(
        isEn
          ? `<@${userId}> declined or ended the Rock-Paper-Scissors match.`
          : `<@${userId}> recusou ou encerrou a partida de Jokenpô.`
      )
      .setTimestamp();

    await interaction.update({
      embeds: [cancelEmbed],
      components: buildJokenpoComponents(gameId, true, lang),
    });
    return;
  }

  // Q283: reserva da aposta + registro da jogada + resolução, tudo sem await no meio.
  const result = commitJokenpoChoice(gameId, userId, action);

  if (result.status === 'expired') {
    return interaction.reply({
      content: isEn
        ? '❌ This Rock-Paper-Scissors match has expired or ended.'
        : '❌ Esta partida de Jokenpô já expirou ou foi encerrada.',
      ephemeral: true,
    });
  }
  if (result.status === 'already_chosen') {
    return interaction.reply({
      content: isEn ? 'You already confirmed your move!' : 'Você já confirmou sua jogada!',
      ephemeral: true,
    });
  }
  if (result.status === 'no_funds') {
    return interaction.reply({
      content: isEn
        ? `❌ You need at least **${game.bet} Coins 💰** to play this bet. Your current balance is: ${result.balance}.`
        : `❌ Você precisa de pelo menos **${game.bet} Moedas 💰** para jogar esta aposta. Seu saldo atual é: ${result.balance}.`,
      ephemeral: true,
    });
  }
  if (result.status !== 'waiting' && result.status !== 'tie' && result.status !== 'win') {
    return interaction.reply({
      content: isEn ? '❌ You are not part of this challenge.' : '❌ Você não está participando deste desafio.',
      ephemeral: true,
    });
  }

  const choiceData = CHOICES[action];
  const choiceName = getChoiceLabel(action, lang);
  await interaction.reply({
    content: isEn
      ? `✨ You chose **${choiceName} ${choiceData.emoji}**! Waiting for your opponent's move...`
      : `✨ Você escolheu **${choiceName} ${choiceData.emoji}**! Aguarde a decisão do seu oponente...`,
    ephemeral: true,
  });

  // Se ambos jogaram, revela o resultado (o pagamento já foi feito em commitJokenpoChoice)
  if (result.status === 'tie' || result.status === 'win') {
    const pickA = CHOICES[game.challengerChoice];
    const pickB = CHOICES[game.opponentChoice];
    const pickAName = getChoiceLabel(game.challengerChoice, lang);
    const pickBName = getChoiceLabel(game.opponentChoice, lang);
    const resultEmbed = new EmbedBuilder().setTimestamp();

    if (result.status === 'tie') {
      // Empate
      resultEmbed
        .setColor('#facc15')
        .setTitle(isEn ? '🤝 ✦ Cosmic Tie in Rock-Paper-Scissors!' : '🤝 ✦ Empate Cósmico no Jokenpô!')
        .setDescription(
          isEn
            ? `Both duelists chose **${pickAName} ${pickA.emoji}**!\n\n*The cosmic energies cancelled out and no coins were lost.*`
            : `Ambos os duelistas escolheram **${pickAName} ${pickA.emoji}**!\n\n*As energias se anularam e nenhuma moeda foi perdida.*`
        )
        .addFields(
          {
            name: isEn ? 'Player 1' : 'Jogador 1',
            value: `<@${game.challengerId}>\n${pickA.emoji} ${pickAName}`,
            inline: true,
          },
          {
            name: isEn ? 'Player 2' : 'Jogador 2',
            value: `<@${game.opponentId}>\n${pickB.emoji} ${pickBName}`,
            inline: true,
          }
        )
        .setFooter({ text: isEn ? 'Friendly tie' : 'Empate amigável' });
    } else {
      const { challengerWins, winnerId, loserId } = result;
      const winnerPick = challengerWins ? pickA : pickB;
      const loserPick = challengerWins ? pickB : pickA;
      const winnerPickName = challengerWins ? pickAName : pickBName;
      const loserPickName = challengerWins ? pickBName : pickAName;

      let betMsg = '';
      if (result.prize > 0) {
        betMsg = isEn
          ? `\n💰 **Prize Awarded:** <@${winnerId}> earned **+${result.prize} Coins** from <@${loserId}>!`
          : `\n💰 **Prêmio Transferido:** <@${winnerId}> faturou **+${result.prize} Moedas** de <@${loserId}>!`;
      }

      resultEmbed
        .setColor('#10b981')
        .setTitle(isEn ? '🏆 ✦ Victory in Rock-Paper-Scissors!' : '🏆 ✦ Vitória no Jokenpô!')
        .setDescription(
          isEn
            ? `🎉 Congratulations <@${winnerId}>! Your choice **${winnerPickName} ${winnerPick.emoji}** beat <@${loserId}>'s **${loserPickName} ${loserPick.emoji}**!${betMsg}`
            : `🎉 Parabéns <@${winnerId}>! Sua escolha **${winnerPickName} ${winnerPick.emoji}** superou **${loserPickName} ${loserPick.emoji}** de <@${loserId}>!${betMsg}`
        )
        .addFields(
          {
            name: isEn ? 'Winner' : 'Vencedor(a)',
            value: `<@${winnerId}>\n${winnerPick.emoji} ${winnerPickName}`,
            inline: true,
          },
          {
            name: isEn ? 'Defeated' : 'Derrotado(a)',
            value: `<@${loserId}>\n${loserPick.emoji} ${loserPickName}`,
            inline: true,
          }
        )
        .setFooter({ text: isEn ? 'Legendary duel' : 'Duelo lendário' });
    }

    await interaction.message.edit({
      embeds: [resultEmbed],
      components: buildJokenpoComponents(gameId, true, lang),
    }).catch(() => null);
  } else {
    // Atualiza a mensagem principal para sinalizar que um jogador escolheu
    await interaction.message.edit({
      embeds: [buildJokenpoEmbed(game, lang)],
      components: buildJokenpoComponents(gameId, false, lang),
    }).catch(() => null);
  }
}

module.exports = {
  name: JOKENPO,
  aliases: ['jokenpo', 'py-jokenpo', 'ppt', 'py-ppt', 'rps', 'py-rps', 'rockpaperscissors'],
  data: new SlashCommandBuilder()
    .setName(JOKENPO)
    .setDescription('Challenge another member to a Rock-Paper-Scissors match with optional coin bets.')
    .setDescriptionLocalizations({
      'pt-BR': 'Desafie outro membro para uma partida de Pedra, Papel e Tesoura com apostas opcionais.',
    })
    .addUserOption((option) =>
      option
        .setName('opponent')
        .setNameLocalizations({
          'en-US': 'opponent',
          'en-GB': 'opponent',
          'pt-BR': 'oponente',
        })
        .setDescription('The member you want to challenge.')
        .setDescriptionLocalizations({
          'pt-BR': 'O membro que você deseja desafiar.',
        })
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('bet')
        .setNameLocalizations({
          'en-US': 'bet',
          'en-GB': 'bet',
          'pt-BR': 'aposta',
        })
        .setDescription('Optional amount of coins to bet.')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade opcional de moedas para apostar.',
        })
        .setMinValue(MIN_BET)
        .setMaxValue(MAX_BET)
        .setRequired(false)
    ),
  isJokenpoInteraction,
  handleJokenpoInteraction,
  commitJokenpoChoice,
  cancelJokenpoGame,
  startJokenpoGame,
  activeGames,
  MAX_BET,
  async executePrefix({ message, args }) {
    const lang = getLanguage(message);
    const isEn = lang === 'en';

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply(
        isEn
          ? '❌ Mention a member to challenge! Example: `py!rps @friend 50`'
          : '❌ Mencione um membro para desafiar! Exemplo: `py!jokenpo @amigo 50`'
      );
    }

    const betArg = args.find((a) => /^\d+$/.test(a));
    const bet = betArg ? Number(betArg) : 0;

    if (targetUser.id === message.author.id) {
      return message.reply(
        isEn ? '❌ You cannot challenge yourself!' : '❌ Você não pode desafiar a si mesmo!'
      );
    }
    if (targetUser.bot) {
      return message.reply(
        isEn
          ? '❌ You cannot challenge a bot to Rock-Paper-Scissors.'
          : '❌ Você não pode desafiar um bot para o Jokenpô.'
      );
    }

    if (bet > MAX_BET) {
      return message.reply(t('jokenpo.betTooHigh', message, { max: MAX_BET }));
    }

    if (bet > 0) {
      const challengerBal = getBalance(message.author.id);
      const opponentBal = getBalance(targetUser.id);
      if (challengerBal < bet) {
        return message.reply(
          isEn
            ? `❌ You don't have enough coins! Your balance: **${challengerBal} Coins**.`
            : `❌ Você não tem saldo suficiente! Seu saldo: **${challengerBal} Moedas**.`
        );
      }
      if (opponentBal < bet) {
        return message.reply(
          isEn
            ? '❌ The opponent does not have enough coins for this bet!'
            : '❌ O oponente não possui moedas suficientes para essa aposta!'
        );
      }
    }

    const { embed, components } = startJokenpoGame({
      challengerId: message.author.id,
      opponentId: targetUser.id,
      bet,
      channel: message.channel,
      lang,
    });

    await message.reply({ embeds: [embed], components });
  },
  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction);
    const isEn = lang === 'en';

    const targetUser =
      interaction.options.getUser('opponent') ||
      interaction.options.getUser('oponente');
    const bet =
      interaction.options.getInteger('bet') ||
      interaction.options.getInteger('aposta') ||
      0;

    if (targetUser.id === interaction.user.id) {
      return interaction.editReply(
        isEn ? '❌ You cannot challenge yourself!' : '❌ Você não pode desafiar a si mesmo!'
      );
    }
    if (targetUser.bot) {
      return interaction.editReply(
        isEn
          ? '❌ You cannot challenge a bot to Rock-Paper-Scissors.'
          : '❌ Você não pode desafiar um bot para o Jokenpô.'
      );
    }

    if (bet > MAX_BET) {
      return interaction.editReply(t('jokenpo.betTooHigh', interaction, { max: MAX_BET }));
    }

    if (bet > 0) {
      const challengerBal = getBalance(interaction.user.id);
      const opponentBal = getBalance(targetUser.id);
      if (challengerBal < bet) {
        return interaction.editReply(
          isEn
            ? `❌ You don't have enough coins! Your balance: **${challengerBal} Coins**.`
            : `❌ Você não tem saldo suficiente! Seu saldo: **${challengerBal} Moedas**.`
        );
      }
      if (opponentBal < bet) {
        return interaction.editReply(
          isEn
            ? '❌ The opponent does not have enough coins for this bet!'
            : '❌ O oponente não possui moedas suficientes para essa aposta!'
        );
      }
    }

    const { embed, components } = startJokenpoGame({
      challengerId: interaction.user.id,
      opponentId: targetUser.id,
      bet,
      channel: interaction.channel,
      lang,
    });

    await interaction.editReply({ embeds: [embed], components });
  },
};

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { JOKENPO } = require('./commandNames');
const { getBalance, spendCoins, addCoins } = require('../services/economy');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

// Armazena partidas ativas em memória com timeout automático
const activeGames = new Map();

const CHOICES = {
  pedra: { name: 'Pedra', emoji: '🪨', beats: 'tesoura' },
  papel: { name: 'Papel', emoji: '📄', beats: 'pedra' },
  tesoura: { name: 'Tesoura', emoji: '✂️', beats: 'papel' },
};

function buildJokenpoComponents(gameId, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`jkp:pedra:${gameId}`)
        .setLabel('Pedra')
        .setEmoji('🪨')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:papel:${gameId}`)
        .setLabel('Papel')
        .setEmoji('📄')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:tesoura:${gameId}`)
        .setLabel('Tesoura')
        .setEmoji('✂️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`jkp:cancel:${gameId}`)
        .setLabel('Recusar')
        .setEmoji('✖️')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled)
    ),
  ];
}

function buildJokenpoEmbed(game) {
  const betText = game.bet > 0 ? `💰 **Aposta:** ${game.bet} Moedas` : '🎮 **Partida Amistosa (Sem apostas)**';

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle('⚔️ ✦ Desafio de Jokenpô!')
    .setDescription(
      `<@${game.challengerId}> desafiou <@${game.opponentId}> para uma disputa mágica de Pedra, Papel e Tesoura!\n\n` +
      `${betText}\n\n` +
      `*Escolham seus movimentos nos botões abaixo. Cada jogada é secreta até ambos votarem!*`
    )
    .addFields(
      {
        name: `<@${game.challengerId}>`,
        value: game.challengerChoice ? '✅ Escolha confirmada!' : '⏳ Pensando na jogada...',
        inline: true,
      },
      {
        name: `<@${game.opponentId}>`,
        value: game.opponentChoice ? '✅ Escolha confirmada!' : '⏳ Pensando na jogada...',
        inline: true,
      }
    )
    .setFooter(pyxieFooter('Tempo limite: 60 segundos'))
    .setTimestamp();
}

function startJokenpoGame({ challengerId, opponentId, bet = 0, channel }) {
  const gameId = `jkp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const game = {
    id: gameId,
    challengerId,
    opponentId,
    bet: Math.max(0, Number(bet) || 0),
    challengerChoice: null,
    opponentChoice: null,
    createdAt: Date.now(),
  };

  activeGames.set(gameId, game);

  // Timeout automático de 60 segundos para liberar memória
  setTimeout(async () => {
    const ongoing = activeGames.get(gameId);
    if (ongoing) {
      activeGames.delete(gameId);
    }
  }, 60000);

  return { game, embed: buildJokenpoEmbed(game), components: buildJokenpoComponents(gameId) };
}

function isJokenpoInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('jkp:');
}

async function handleJokenpoInteraction(interaction) {
  const [, action, gameId] = interaction.customId.split(':');
  const game = activeGames.get(gameId);

  if (!game) {
    return interaction.reply({
      content: '❌ Esta partida de Jokenpô já expirou ou foi encerrada.',
      ephemeral: true,
    });
  }

  const userId = interaction.user.id;
  const isChallenger = userId === game.challengerId;
  const isOpponent = userId === game.opponentId;

  if (!isChallenger && !isOpponent) {
    return interaction.reply({
      content: '❌ Você não está participando deste desafio.',
      ephemeral: true,
    });
  }

  // Ação de Cancelar / Recusar
  if (action === 'cancel') {
    activeGames.delete(gameId);
    const cancelEmbed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('❌ Duelo de Jokenpô Encerrado')
      .setDescription(`<@${userId}> recusou ou encerrou a partida de Jokenpô.`)
      .setTimestamp();

    await interaction.update({
      embeds: [cancelEmbed],
      components: buildJokenpoComponents(gameId, true),
    });
    return;
  }

  // Validação de saldo no momento da escolha se houver aposta
  if (game.bet > 0) {
    const currentBalance = getBalance(userId);
    if (currentBalance < game.bet) {
      return interaction.reply({
        content: `❌ Você precisa de pelo menos **${game.bet} Moedas 💰** para jogar esta aposta. Seu saldo atual é: ${currentBalance}.`,
        ephemeral: true,
      });
    }
  }

  // Registra a escolha
  if (isChallenger) {
    if (game.challengerChoice) {
      return interaction.reply({ content: 'Você já confirmou sua jogada!', ephemeral: true });
    }
    game.challengerChoice = action;
  } else {
    if (game.opponentChoice) {
      return interaction.reply({ content: 'Você já confirmou sua jogada!', ephemeral: true });
    }
    game.opponentChoice = action;
  }

  const choiceData = CHOICES[action];
  await interaction.reply({
    content: `✨ Você escolheu **${choiceData.name} ${choiceData.emoji}**! Aguarde a decisão do seu oponente...`,
    ephemeral: true,
  });

  // Se ambos jogaram, revela o resultado
  if (game.challengerChoice && game.opponentChoice) {
    activeGames.delete(gameId);

    const pickA = CHOICES[game.challengerChoice];
    const pickB = CHOICES[game.opponentChoice];
    const resultEmbed = new EmbedBuilder().setTimestamp();

    if (game.challengerChoice === game.opponentChoice) {
      // Empate
      resultEmbed
        .setColor('#facc15')
        .setTitle('🤝 ✦ Empate Cósmico no Jokenpô!')
        .setDescription(
          `Ambos os duelistas escolheram **${pickA.name} ${pickA.emoji}**!\n\n` +
          `*As energias se anularam e nenhuma moeda foi perdida.*`
        )
        .addFields(
          { name: 'Jogador 1', value: `<@${game.challengerId}>\n${pickA.emoji} ${pickA.name}`, inline: true },
          { name: 'Jogador 2', value: `<@${game.opponentId}>\n${pickB.emoji} ${pickB.name}`, inline: true }
        )
        .setFooter(pyxieFooter('Empate amigável'));
    } else {
      const challengerWins = pickA.beats === game.opponentChoice;
      const winnerId = challengerWins ? game.challengerId : game.opponentId;
      const loserId = challengerWins ? game.opponentId : game.challengerId;
      const winnerPick = challengerWins ? pickA : pickB;
      const loserPick = challengerWins ? pickB : pickA;

      let betMsg = '';
      if (game.bet > 0) {
        spendCoins(loserId, game.bet);
        addCoins(winnerId, game.bet);
        betMsg = `\n💰 **Prêmio Transferido:** <@${winnerId}> faturou **+${game.bet} Moedas** de <@${loserId}>!`;
      }

      resultEmbed
        .setColor('#10b981')
        .setTitle('🏆 ✦ Vitória no Jokenpô!')
        .setDescription(
          `🎉 Parabéns <@${winnerId}>! Sua escolha **${winnerPick.name} ${winnerPick.emoji}** superou **${loserPick.name} ${loserPick.emoji}** de <@${loserId}>!${betMsg}`
        )
        .addFields(
          { name: 'Vencedor(a)', value: `<@${winnerId}>\n${winnerPick.emoji} ${winnerPick.name}`, inline: true },
          { name: 'Derrotado(a)', value: `<@${loserId}>\n${loserPick.emoji} ${loserPick.name}`, inline: true }
        )
        .setFooter(pyxieFooter('Duelo lendário'));
    }

    await interaction.message.edit({
      embeds: [resultEmbed],
      components: buildJokenpoComponents(gameId, true),
    }).catch(() => null);
  } else {
    // Atualiza a mensagem principal para sinalizar que um jogador escolheu
    await interaction.message.edit({
      embeds: [buildJokenpoEmbed(game)],
      components: buildJokenpoComponents(gameId),
    }).catch(() => null);
  }
}

module.exports = {
  name: JOKENPO,
  aliases: ['jokenpo', 'py-jokenpo', 'ppt', 'py-ppt', 'rps', 'py-rps'],
  data: new SlashCommandBuilder()
    .setName(JOKENPO)
    .setDescription('Challenge another member to a Rock-Paper-Scissors match with optional coin bets.')
    .setDescriptionLocalizations({
      'pt-BR': 'Desafie outro membro para uma partida de Pedra, Papel e Tesoura com apostas opcionais.',
    })
    .addUserOption((option) =>
      option
        .setName('oponente')
        .setDescription('The member you want to challenge.')
        .setDescriptionLocalizations({
          'pt-BR': 'O membro que você deseja desafiar.',
        })
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('aposta')
        .setDescription('Optional amount of coins to bet.')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade opcional de moedas para apostar.',
        })
        .setMinValue(10)
        .setRequired(false)
    ),
  isJokenpoInteraction,
  handleJokenpoInteraction,
  async executePrefix({ message, args }) {
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply('❌ Mencione um membro para desafiar! Exemplo: `py!jokenpo @amigo 50`');
    }

    const betArg = args.find((a) => /^\d+$/.test(a));
    const bet = betArg ? Number(betArg) : 0;

    if (targetUser.id === message.author.id) {
      return message.reply('❌ Você não pode desafiar a si mesmo!');
    }
    if (targetUser.bot) {
      return message.reply('❌ Você não pode desafiar um bot para o Jokenpô.');
    }

    if (bet > 0) {
      const challengerBal = getBalance(message.author.id);
      const opponentBal = getBalance(targetUser.id);
      if (challengerBal < bet) {
        return message.reply(`❌ Você não tem saldo suficiente! Seu saldo: **${challengerBal} Moedas**.`);
      }
      if (opponentBal < bet) {
        return message.reply(`❌ O oponente não possui moedas suficientes para essa aposta!`);
      }
    }

    const { embed, components } = startJokenpoGame({
      challengerId: message.author.id,
      opponentId: targetUser.id,
      bet,
      channel: message.channel,
    });

    await message.reply({ embeds: [embed], components });
  },
  async executeSlash({ interaction }) {
    const targetUser = interaction.options.getUser('oponente');
    const bet = interaction.options.getInteger('aposta') || 0;

    if (targetUser.id === interaction.user.id) {
      return interaction.editReply('❌ Você não pode desafiar a si mesmo!');
    }
    if (targetUser.bot) {
      return interaction.editReply('❌ Você não pode desafiar um bot para o Jokenpô.');
    }

    if (bet > 0) {
      const challengerBal = getBalance(interaction.user.id);
      const opponentBal = getBalance(targetUser.id);
      if (challengerBal < bet) {
        return interaction.editReply(`❌ Você não tem saldo suficiente! Seu saldo: **${challengerBal} Moedas**.`);
      }
      if (opponentBal < bet) {
        return interaction.editReply(`❌ O oponente não possui moedas suficientes para essa aposta!`);
      }
    }

    const { embed, components } = startJokenpoGame({
      challengerId: interaction.user.id,
      opponentId: targetUser.id,
      bet,
      channel: interaction.channel,
    });

    await interaction.editReply({ embeds: [embed], components });
  },
};

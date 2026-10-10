const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { TICTACTOE } = require('./commandNames');
const { getLanguage } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');
const path = require('path');

const STATS_FILE = path.join(process.cwd(), 'data', 'tictactoeStats.json');
const activeGames = new Map();

const SYMBOLS = {
  X: '🌙', // Jogador 1 (Lua Arcana)
  O: '☀️', // Jogador 2 / Pyxie (Sol Dourado)
  EMPTY: '⬜',
};

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
  [0, 4, 8], [2, 4, 6],           // Diagonais
];

function getStats() {
  return readJson(STATS_FILE, { players: {} });
}

function recordGameResult(userId, username, result) {
  // result: 'win' | 'loss' | 'draw'
  const data = getStats();
  if (!data.players[userId]) {
    data.players[userId] = { userId, username, wins: 0, losses: 0, draws: 0, total: 0 };
  }
  const p = data.players[userId];
  p.username = username || p.username;
  p.total += 1;
  if (result === 'win') p.wins += 1;
  else if (result === 'loss') p.losses += 1;
  else if (result === 'draw') p.draws += 1;
  writeJsonAtomic(STATS_FILE, data);
}

function checkWinner(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'DRAW', combo: [] };
  }
  return null;
}

// IA inteligente da Pyxie
function findBestMove(board) {
  // 1. Vencer se possível
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      if (checkWinner(board)?.winner === 'O') {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 2. Bloquear vitória do jogador
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      if (checkWinner(board)?.winner === 'X') {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 3. Tomar o centro se estiver livre
  if (board[4] === null) return 4;

  // 4. Cantos estratégicos
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Qualquer espaço vazio restante
  const available = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) available.push(i);
  }
  return available[Math.floor(Math.random() * available.length)];
}

function buildBoardComponents(gameId, board, winningCombo = [], disabled = false) {
  const rows = [];
  for (let row = 0; row < 3; row++) {
    const actionRow = new ActionRowBuilder();
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const cellVal = board[idx];
      const isWinningCell = winningCombo.includes(idx);

      let label = cellVal ? SYMBOLS[cellVal] : SYMBOLS.EMPTY;
      let style = ButtonStyle.Secondary;

      if (isWinningCell) {
        style = ButtonStyle.Success;
      } else if (cellVal === 'X') {
        style = ButtonStyle.Primary;
      } else if (cellVal === 'O') {
        style = ButtonStyle.Danger;
      }

      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt:${gameId}:${idx}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(disabled || cellVal !== null)
      );
    }
    rows.push(actionRow);
  }
  return rows;
}

function buildGameEmbed(game, statusText, isEn = false) {
  const isSolo = game.isSolo;
  const p1Name = game.p1Name;
  const p2Name = isSolo ? 'Pyxie (IA)' : game.p2Name;

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.magenta || '#e60067')
    .setTitle(isEn ? '🎮 ✦ Arcane Tic-Tac-Toe' : '🎮 ✦ Jogo da Velha Arcano')
    .setDescription(
      [
        `🌙 **${p1Name}** (X)  vs  ☀️ **${p2Name}** (O)`,
        '',
        statusText,
      ].join('\n')
    )
    .setFooter({
      text: isEn
        ? 'Casual Entertainment • Zero coins, pure fun'
        : 'Entretenimento Casual • Zero moedas, diversão pura',
    })
    .setTimestamp();
}

async function startTicTacToe(interaction, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const user = interaction.user || interaction.author;
  const opponentUser = interaction.options?.getUser ? interaction.options.getUser('adversario') : null;

  if (opponentUser && opponentUser.id === user.id) {
    return interaction.reply({
      content: isEn ? '❌ You cannot play against yourself! Omit the option to face Pyxie.' : '❌ Você não pode jogar contra você mesmo! Omita o adversário para enfrentar a Pyxie.',
      ephemeral: true,
    });
  }

  if (opponentUser && opponentUser.bot) {
    return interaction.reply({
      content: isEn ? '❌ You cannot challenge other bots! Challenge a human or face Pyxie alone.' : '❌ Você não pode desafiar outros bots! Desafie um membro do servidor ou jogue contra a Pyxie.',
      ephemeral: true,
    });
  }

  const isSolo = !opponentUser;
  const gameId = `ttt_${user.id}_${Date.now()}`;

  const game = {
    id: gameId,
    p1Id: user.id,
    p1Name: user.displayName || user.username,
    p2Id: opponentUser ? opponentUser.id : 'pyxie_ai',
    p2Name: opponentUser ? (opponentUser.displayName || opponentUser.username) : 'Pyxie',
    isSolo,
    board: Array(9).fill(null),
    currentTurn: 'X', // 'X' começa
    lang,
    message: null,
  };

  activeGames.set(gameId, game);

  const initialStatus = isEn
    ? `Turn: 🌙 **${game.p1Name}**'s turn to place a Moon!`
    : `Vez de: 🌙 **${game.p1Name}** posicionar uma Lua Arcana!`;

  const embed = buildGameEmbed(game, initialStatus, isEn);
  const components = buildBoardComponents(gameId, game.board);

  const replyOptions = { embeds: [embed], components, fetchReply: true };
  let msg;
  if (interaction.reply && !interaction.replied && !interaction.deferred) {
    msg = await interaction.reply(replyOptions);
  } else if (interaction.channel) {
    msg = await interaction.channel.send(replyOptions);
  }

  game.message = msg;
  setupGameCollector(game);
}

function setupGameCollector(game) {
  if (!game.message) return;
  const isEn = game.lang === 'en';

  const collector = game.message.createMessageComponentCollector({
    filter: (i) => i.customId.startsWith(`ttt:${game.id}:`),
    time: 120000,
  });

  collector.on('collect', async (i) => {
    const [, , posStr] = i.customId.split(':');
    const pos = Number(posStr);

    const isP1 = i.user.id === game.p1Id;
    const isP2 = i.user.id === game.p2Id;

    // Checagem de permissão e turno
    if (!isP1 && !isP2) {
      return i.reply({
        content: isEn ? '❌ You are not part of this match!' : '❌ Você não está participando desta partida!',
        ephemeral: true,
      });
    }

    if (game.currentTurn === 'X' && !isP1) {
      return i.reply({
        content: isEn ? `⏳ It is **${game.p1Name}**'s turn!` : `⏳ É a vez de **${game.p1Name}** jogar!`,
        ephemeral: true,
      });
    }

    if (game.currentTurn === 'O' && !isP2) {
      return i.reply({
        content: isEn ? `⏳ It is **${game.p2Name}**'s turn!` : `⏳ É a vez de **${game.p2Name}** jogar!`,
        ephemeral: true,
      });
    }

    if (game.board[pos] !== null) {
      return i.deferUpdate().catch(() => {});
    }

    // Executa o movimento do jogador ativo
    game.board[pos] = game.currentTurn;

    // Verifica se houve vitória ou empate
    let outcome = checkWinner(game.board);

    if (outcome) {
      collector.stop('finished');
      return handleGameOver(i, game, outcome);
    }

    // Se for modo solo e a jogada foi do Jogador 1 (X), agora a Pyxie (O) joga automaticamente!
    if (game.isSolo && game.currentTurn === 'X') {
      const aiMove = findBestMove(game.board);
      if (aiMove !== undefined) {
        game.board[aiMove] = 'O';
      }

      outcome = checkWinner(game.board);
      if (outcome) {
        collector.stop('finished');
        return handleGameOver(i, game, outcome);
      }

      game.currentTurn = 'X';
      const statusText = isEn
        ? `Pyxie placed her Sun! Turn: 🌙 **${game.p1Name}**`
        : `A Pyxie posicionou seu Sol! Sua vez: 🌙 **${game.p1Name}**`;

      const embed = buildGameEmbed(game, statusText, isEn);
      const components = buildBoardComponents(game.id, game.board);
      return i.update({ embeds: [embed], components }).catch(() => {});
    }

    // Alterna o turno no modo 1v1
    game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';
    const nextPlayerName = game.currentTurn === 'X' ? game.p1Name : game.p2Name;
    const nextSymbol = game.currentTurn === 'X' ? '🌙' : '☀️';

    const statusText = isEn
      ? `Turn: ${nextSymbol} **${nextPlayerName}**'s turn!`
      : `Vez de: ${nextSymbol} **${nextPlayerName}** jogar!`;

    const embed = buildGameEmbed(game, statusText, isEn);
    const components = buildBoardComponents(game.id, game.board);
    await i.update({ embeds: [embed], components }).catch(() => {});
    collector.resetTimer({ time: 60000 });
  });

  collector.on('end', async (_collected, reason) => {
    activeGames.delete(game.id);
    if (reason === 'time') {
      const timeoutEmbed = new EmbedBuilder()
        .setColor('#94a3b8')
        .setTitle(isEn ? '⏰ Match Timed Out' : '⏰ Partida Encerrada por Inatividade')
        .setDescription(
          isEn
            ? 'The game was closed due to 2 minutes of inactivity.'
            : 'O jogo foi encerrado após 2 minutos sem novas jogadas.'
        );
      await game.message?.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    }
  });
}

async function handleGameOver(interaction, game, outcome) {
  const isEn = game.lang === 'en';
  const { winner, combo } = outcome;

  let endStatus = '';
  if (winner === 'DRAW') {
    endStatus = isEn ? '🤝 **It is a Draw!** Both wizards played equally well!' : '🤝 **Deu Velha!** Empate perfeito entre os aventureiros!';
    recordGameResult(game.p1Id, game.p1Name, 'draw');
    if (!game.isSolo) recordGameResult(game.p2Id, game.p2Name, 'draw');
  } else if (winner === 'X') {
    endStatus = isEn
      ? `🎉 🌙 **${game.p1Name}** wins the Arcane Match!`
      : `🎉 🌙 **${game.p1Name}** triunfou com a Lua Arcana!`;
    recordGameResult(game.p1Id, game.p1Name, 'win');
    if (!game.isSolo) recordGameResult(game.p2Id, game.p2Name, 'loss');
  } else if (winner === 'O') {
    const winnerName = game.isSolo ? 'Pyxie' : game.p2Name;
    endStatus = game.isSolo
      ? (isEn ? '✨ ☀️ **Pyxie** wins! "Hehe, better luck next time mortal!"' : '✨ ☀️ **Pyxie** venceu! "Haha, precisa praticar mais contra mim!"')
      : (isEn ? `🎉 ☀️ **${winnerName}** wins the Arcane Match!` : `🎉 ☀️ **${winnerName}** triunfou com o Sol Radiante!`);

    recordGameResult(game.p1Id, game.p1Name, 'loss');
    if (!game.isSolo) recordGameResult(game.p2Id, game.p2Name, 'win');
  }

  const embed = buildGameEmbed(game, endStatus, isEn);
  const components = buildBoardComponents(game.id, game.board, combo, true);

  await interaction.update({ embeds: [embed], components }).catch(() => {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName(TICTACTOE)
    .setDescription('Play Arcane Tic-Tac-Toe solo against Pyxie AI or challenge a server member!')
    .setDescriptionLocalizations({
      'pt-BR': 'Jogue Jogo da Velha Arcano solo contra a IA da Pyxie ou desafie um amigo do servidor!',
    })
    .addUserOption((opt) =>
      opt
        .setName('adversario')
        .setDescription('Optional: Mention a friend to duel 1v1. Omit to play solo against Pyxie!')
        .setDescriptionLocalizations({
          'pt-BR': 'Opcional: Mencione um amigo para duelo 1v1. Deixe em branco para jogar contra a Pyxie!',
        })
        .setRequired(false)
    ),
  aliases: ['tictactoe', 'velha', 'py-velha', 'jogodavelha', 'py-jogodavelha'],
  async execute(interaction, client, source = null) {
    await startTicTacToe(interaction, source);
  },
  startTicTacToe,
};

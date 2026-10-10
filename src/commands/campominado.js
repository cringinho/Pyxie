const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { MINESWEEPER } = require('./commandNames');
const { getLanguage } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const activeGames = new Map();

const NUM_EMOJIS = {
  0: '🟩',
  1: '1️⃣',
  2: '2️⃣',
  3: '3️⃣',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
};

function createBoard(mineCount = 5) {
  const size = 5;
  const totalCells = size * size; // 25
  const board = Array(totalCells).fill(0).map(() => ({
    isMine: false,
    revealed: false,
    adjacentMines: 0,
  }));

  // Sorteia posições das minas
  let placed = 0;
  while (placed < mineCount) {
    const idx = Math.floor(Math.random() * totalCells);
    if (!board[idx].isMine) {
      board[idx].isMine = true;
      placed += 1;
    }
  }

  // Calcula minas adjacentes
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      if (board[idx].isMine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const nIdx = nr * size + nc;
            if (board[nIdx].isMine) count += 1;
          }
        }
      }
      board[idx].adjacentMines = count;
    }
  }

  return board;
}

// Flood fill para abrir células vazias (0 minas vizinhas)
function revealEmptyNeighbors(board, startIdx) {
  const size = 5;
  const queue = [startIdx];
  const visited = new Set([startIdx]);

  while (queue.length > 0) {
    const current = queue.shift();
    board[current].revealed = true;

    if (board[current].adjacentMines === 0) {
      const r = Math.floor(current / size);
      const c = current % size;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const nIdx = nr * size + nc;
            if (!visited.has(nIdx) && !board[nIdx].isMine) {
              visited.add(nIdx);
              board[nIdx].revealed = true;
              if (board[nIdx].adjacentMines === 0) {
                queue.push(nIdx);
              }
            }
          }
        }
      }
    }
  }
}

function buildGridComponents(gameId, board, gameOver = false) {
  const rows = [];
  const size = 5;

  for (let r = 0; r < size; r++) {
    const actionRow = new ActionRowBuilder();
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      const cell = board[idx];

      let label = '🟦';
      let style = ButtonStyle.Secondary;
      let disabled = gameOver;

      if (cell.revealed) {
        disabled = true;
        if (cell.isMine) {
          label = '💥';
          style = ButtonStyle.Danger;
        } else {
          label = NUM_EMOJIS[cell.adjacentMines] || '🟩';
          style = cell.adjacentMines === 0 ? ButtonStyle.Success : ButtonStyle.Primary;
        }
      } else if (gameOver && cell.isMine) {
        // Revela as minas restantes no fim de jogo
        label = '💣';
        style = ButtonStyle.Danger;
      }

      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`ms:${gameId}:${idx}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(disabled)
      );
    }
    rows.push(actionRow);
  }

  return rows;
}

function buildStatusEmbed(game, statusMsg = null, isVictory = false, isDefeat = false) {
  const isEn = game.lang === 'en';
  const totalSafe = 25 - game.mineCount;
  const revealedSafe = game.board.filter((c) => c.revealed && !c.isMine).length;
  const remainingSafe = totalSafe - revealedSafe;

  let color = PYXIE_COLORS.purple || '#8b5cf6';
  let title = isEn ? '💎 ✦ Arcane Minesweeper (5x5)' : '💎 ✦ Campo Minado Arcano (5x5)';

  if (isVictory) {
    color = '#10b981';
    title = isEn ? '🎉 ✦ Arcane Triumph! All Safe Crystals Found!' : '🎉 ✦ Triunfo Arcano! Todos os Cristais Foram Salvos!';
  } else if (isDefeat) {
    color = '#ef4444';
    title = isEn ? '💥 ✦ Explosive Rune Triggered!' : '💥 ✦ Runa Explosiva Detonada!';
  }

  const desc = [
    `👤 **${isEn ? 'Adventurer' : 'Aventureiro'}:** ${game.username}`,
    `⚡ **${isEn ? 'Difficulty' : 'Dificuldade'}:** ${game.diffLabel}`,
    `💣 **${isEn ? 'Hidden Runes' : 'Runas Ocultas'}:** ${game.mineCount} • 💎 **${isEn ? 'Remaining Crystals' : 'Cristais Restantes'}:** **${remainingSafe}** / ${totalSafe}`,
    '',
    statusMsg || (isEn ? 'Click on crystals below to uncover mana without triggering runes!' : 'Clique nos cristais abaixo para desenterrar mana sem ativar runas explosivas!'),
  ].join('\n');

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({
      text: isEn
        ? 'Casual Entertainment • Zero coins, pure fun'
        : 'Entretenimento Casual • Zero moedas, pura diversão',
    })
    .setTimestamp();
}

async function startMinesweeper(interaction, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const user = interaction.user || interaction.author;
  const username = user.displayName || user.username;

  const diffChoice = interaction.options?.getString ? (interaction.options.getString('dificuldade') || 'adepto') : 'adepto';

  let mineCount = 5;
  let diffLabel = isEn ? '🟡 Adept (5 Runes)' : '🟡 Adepto (5 Runas)';

  if (diffChoice === 'aprendiz') {
    mineCount = 3;
    diffLabel = isEn ? '🟢 Apprentice (3 Runes)' : '🟢 Aprendiz (3 Runas)';
  } else if (diffChoice === 'arquimago') {
    mineCount = 7;
    diffLabel = isEn ? '🔴 Archmage (7 Runes)' : '🔴 Arquimago (7 Runas)';
  }

  const gameId = `ms_${user.id}_${Date.now()}`;
  const board = createBoard(mineCount);

  const game = {
    id: gameId,
    userId: user.id,
    username,
    mineCount,
    diffLabel,
    board,
    lang,
    startTime: Date.now(),
    message: null,
  };

  activeGames.set(gameId, game);

  const embed = buildStatusEmbed(game);
  const components = buildGridComponents(gameId, board, false);

  const replyOptions = { embeds: [embed], components, fetchReply: true };
  let msg;
  if (interaction.reply && !interaction.replied && !interaction.deferred) {
    msg = await interaction.reply(replyOptions);
  } else if (interaction.channel) {
    msg = await interaction.channel.send(replyOptions);
  }

  game.message = msg;
  setupMinesweeperCollector(game);
}

function setupMinesweeperCollector(game) {
  if (!game.message) return;
  const isEn = game.lang === 'en';

  const collector = game.message.createMessageComponentCollector({
    filter: (i) => i.customId.startsWith(`ms:${game.id}:`),
    time: 180000,
  });

  collector.on('collect', async (i) => {
    if (i.user.id !== game.userId) {
      return i.reply({
        content: isEn ? '❌ This is not your game!' : '❌ Esta partida pertence a outro jogador!',
        ephemeral: true,
      });
    }

    const [, , idxStr] = i.customId.split(':');
    const idx = Number(idxStr);
    const cell = game.board[idx];

    if (cell.revealed) {
      return i.deferUpdate().catch(() => {});
    }

    // Jogador pisou numa mina!
    if (cell.isMine) {
      collector.stop('defeat');
      cell.revealed = true;

      const defeatMsg = isEn
        ? '💥 **KABOOM!** You tapped an unstable explosive rune! All mines have been uncovered.'
        : '💥 **CABUM!** Você tocou em uma runa explosiva instável! Todas as minas foram reveladas.';

      const defeatEmbed = buildStatusEmbed(game, defeatMsg, false, true);
      const defeatComponents = buildGridComponents(game.id, game.board, true);
      return i.update({ embeds: [defeatEmbed], components: defeatComponents }).catch(() => {});
    }

    // Célula segura
    if (cell.adjacentMines === 0) {
      revealEmptyNeighbors(game.board, idx);
    } else {
      cell.revealed = true;
    }

    // Checa vitória
    const totalSafe = 25 - game.mineCount;
    const revealedSafe = game.board.filter((c) => c.revealed && !c.isMine).length;

    if (revealedSafe >= totalSafe) {
      collector.stop('victory');
      const elapsedSec = Math.floor((Date.now() - game.startTime) / 1000);
      const victoryMsg = isEn
        ? `🏆 Brilliant work! You cleared all ${totalSafe} mana crystals safely in **${elapsedSec}s**!`
        : `🏆 Trabalho brilhante! Você resgatou todos os ${totalSafe} cristais de mana em **${elapsedSec}s**!`;

      const victoryEmbed = buildStatusEmbed(game, victoryMsg, true, false);
      const victoryComponents = buildGridComponents(game.id, game.board, true);
      return i.update({ embeds: [victoryEmbed], components: victoryComponents }).catch(() => {});
    }

    // Jogo continua
    const updateEmbed = buildStatusEmbed(game);
    const updateComponents = buildGridComponents(game.id, game.board, false);
    await i.update({ embeds: [updateEmbed], components: updateComponents }).catch(() => {});
    collector.resetTimer({ time: 120000 });
  });

  collector.on('end', async (_collected, reason) => {
    activeGames.delete(game.id);
    if (reason === 'time') {
      const timeoutEmbed = new EmbedBuilder()
        .setColor('#94a3b8')
        .setTitle(isEn ? '⏰ Minesweeper Session Timed Out' : '⏰ Campo Minado Encerrado por Tempo')
        .setDescription(
          isEn
            ? 'The game was closed due to 3 minutes of inactivity.'
            : 'A partida foi encerrada após 3 minutos sem interação.'
        );
      await game.message?.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    }
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName(MINESWEEPER)
    .setDescription('Play the classic 5x5 Arcane Minesweeper with mana crystals!')
    .setDescriptionLocalizations({
      'pt-BR': 'Jogue o clássico Campo Minado Arcano 5x5 resgatando cristais de mana!',
    })
    .addStringOption((opt) =>
      opt
        .setName('dificuldade')
        .setDescription('Select difficulty level (rune quantity)')
        .setDescriptionLocalizations({
          'pt-BR': 'Selecione o nível de dificuldade (quantidade de runas)',
        })
        .setRequired(false)
        .addChoices(
          { name: '🟢 Aprendiz (3 Runas)', value: 'aprendiz' },
          { name: '🟡 Adepto (5 Runas)', value: 'adepto' },
          { name: '🔴 Arquimago (7 Runas)', value: 'arquimago' }
        )
    ),
  aliases: ['minesweeper', 'campominado', 'py-campominado', 'minas', 'py-minas'],
  async execute(interaction, client, source = null) {
    await startMinesweeper(interaction, source);
  },
  startMinesweeper,
};


const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const {
  getProceduralRun,
  startProceduralRun,
  movePlayer,
  retreatRun,
  panicFlee,
  getDungeonZones,
} = require('../proceduralExplorer');
const { getActiveVpet } = require('./vpetCore');
const { getLanguage } = require('../../utils/i18n');
const { buildPymonHubHeader } = require('./vpetHub');

function renderDungeonGridText(run, pet) {
  const grid = run.grid;
  const playerPos = run.playerPos;
  const exitPos = run.exitPos;

  const rows = [];
  for (let y = 0; y < run.gridH; y++) {
    const cells = [];
    for (let x = 0; x < run.gridW; x++) {
      const tile = grid[y]?.[x] || { revealed: false, visited: false, eventType: 'EMPTY' };
      const isPlayer = playerPos.x === x && playerPos.y === y;
      const isExit = exitPos.x === x && exitPos.y === y;

      if (isPlayer) {
        cells.push(pet.emoji || '🐾');
      } else if (!tile.revealed) {
        cells.push('⬛');
      } else if (isExit) {
        cells.push('🚪');
      } else if (tile.visited) {
        cells.push('▫️');
      } else {
        switch (tile.eventType) {
          case 'BATTLE':
            cells.push('⚔️');
            break;
          case 'NPC_DUEL':
            cells.push('🤺');
            break;
          case 'CHEST':
            cells.push('🎁');
            break;
          case 'TRAP':
            cells.push('⚠️');
            break;
          default:
            cells.push('▫️');
        }
      }
    }
    rows.push(cells.join(' '));
  }
  return rows.join('\n');
}

function buildDungeonTab(userId, userTag, context = null) {
  const lang = getLanguage(context);
  const headerRow = buildPymonHubHeader(userId, 'dungeon', context);
  const pet = getActiveVpet(userId);

  if (!pet) {
    const embed = new EmbedBuilder()
      .setColor('#f472b6')
      .setTitle(lang === 'pt' ? '🐾 Nenhum Pymon Encontrado' : '🐾 No Pymon Found')
      .setDescription(
        lang === 'pt'
          ? 'Você precisa ter um Pymon para explorar masmorras! Use `/py-pymons` para adotar um.'
          : 'You need a Pymon to explore dungeons! Use `/py-pymons` to adopt one.'
      );
    return { embeds: [embed], components: [headerRow], files: [] };
  }

  const run = getProceduralRun(userId);

  if (!run) {
    const zones = getDungeonZones();
    const title = lang === 'pt'
      ? `🗺️  ✦  Masmorras & Dungeons 2D — ${userTag}`
      : `🗺️  ✦  2D Procedural Dungeons — ${userTag}`;

    const desc = [
      lang === 'pt'
        ? `Prepare **${pet.name}** (${pet.emoji} Nv. ${pet.level || 1}) para explorar labirintos misteriosos em grade 2D com névoa de guerra!`
        : `Prepare **${pet.name}** (${pet.emoji} Lv. ${pet.level || 1}) to explore mysterious 2D grid dungeons with fog of war!`,
      '',
      `🐾 **${lang === 'pt' ? 'STATUS DO EXPLORADOR' : 'EXPLORER STATUS'}**`,
      `> ❤️ **HP:** ${pet.stats?.hp || 100}  •  🍖 **${lang === 'pt' ? 'Fome' : 'Hunger'}**: ${pet.hungerHearts || 4}/4 ♥`,
      '',
      `🌲 **${lang === 'pt' ? 'ZONAS DISPONÍVEIS' : 'AVAILABLE ZONES'}**`,
      zones
        .map((z) => `${z.emoji} **${z.name}** (Nv. Mín: ${z.minLevel})\n> *${z.desc}*`)
        .join('\n\n'),
    ].join('\n');

    const zoneButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`dungeon_start:bosque:${userId}`).setLabel(lang === 'pt' ? '🌲 Bosque' : '🌲 Woods').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`dungeon_start:recife:${userId}`).setLabel(lang === 'pt' ? '💧 Recife' : '💧 Reef').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`dungeon_start:colina:${userId}`).setLabel(lang === 'pt' ? '🪶 Colinas' : '🪶 Hills').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`dungeon_start:castelo:${userId}`).setLabel(lang === 'pt' ? '🏰 Castelo' : '🏰 Castle').setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setColor('#00f5d4')
      .setTitle(title)
      .setDescription(desc)
      .setFooter({ text: lang === 'pt' ? 'Selecione uma zona para iniciar a expedição' : 'Select a zone to start expedition' });

    return { embeds: [embed], components: [headerRow, zoneButtons], files: [] };
  }

  // Masmorra Ativa
  const gridText = renderDungeonGridText(run, pet);
  const title = lang === 'pt'
    ? `🗺️ Masmorra: ${run.zoneName} — Sala (${run.playerPos.x}, ${run.playerPos.y})`
    : `🗺️ Dungeon: ${run.zoneName} — Room (${run.playerPos.x}, ${run.playerPos.y})`;

  const desc = [
    `\`\`\`\n${gridText}\n\`\`\``,
    `🐾 **${pet.name}** (${pet.emoji})  •  ⚡ **${lang === 'pt' ? 'Energia' : 'Energy'}**: ${run.energy}/${run.maxEnergy}`,
    `🎒 **${lang === 'pt' ? 'Tesouros' : 'Loot'}**: ${run.loot?.length || 0} itens  •  🪙 **${lang === 'pt' ? 'Moedas' : 'Coins'}**: ${run.coinsCollected || 0}`,
    '',
    run.lastEventMessage ? `> 📢 ${run.lastEventMessage}` : (lang === 'pt' ? '> 🚶 Use o D-Pad para explorar.' : '> 🚶 Use the D-Pad to explore.'),
  ].join('\n');

  const dpadRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dungeon_move:UP:${userId}`).setLabel('⬆️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`dungeon_move:LEFT:${userId}`).setLabel('⬅️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`dungeon_move:DOWN:${userId}`).setLabel('⬇️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`dungeon_move:RIGHT:${userId}`).setLabel('➡️').setStyle(ButtonStyle.Primary)
  );

  const actionsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`dungeon_retreat:${userId}`).setLabel(lang === 'pt' ? 'Resgatar Espólios' : 'Claim Loot').setEmoji('🎒').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`dungeon_flee:${userId}`).setLabel(lang === 'pt' ? 'Fugir da Masmorra' : 'Flee Dungeon').setEmoji('💨').setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: lang === 'pt' ? 'Pymons • Masmorras em Grade 2D' : 'Pymons • 2D Grid Dungeons' });

  return { embeds: [embed], components: [headerRow, dpadRow, actionsRow], files: [] };
}

module.exports = {
  buildDungeonTab,
  renderDungeonGridText,
};


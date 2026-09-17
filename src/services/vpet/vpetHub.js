const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getIncubator, hatchIncubatorEgg, putEggInIncubator, useHourglassOnIncubator, getPetsCatalog, getUserPets } = require('../pets');
const { getActiveVpet } = require('./vpetCore');
const { getVpetSpecies, getVpetSpriteUrl } = require('./vpetSpecies');
const { getUserInventory } = require('../inventory');

/**
 * Constrói a barra de navegação superior padrão de 5 abas para todo o ecossistema Pymons.
 */
function buildPymonHubHeader(userId, activeTab = 'pet', context = null) {
  const lang = getLanguage(context);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_tab:pet:${userId}`)
      .setLabel(t('hub.pet', context))
      .setEmoji('🐾')
      .setStyle(activeTab === 'pet' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_tab:dungeon:${userId}`)
      .setLabel(t('hub.dungeon', context))
      .setEmoji('🗺️')
      .setStyle(activeTab === 'dungeon' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_tab:incubator:${userId}`)
      .setLabel(t('hub.incubator', context))
      .setEmoji('🥚')
      .setStyle(activeTab === 'incubator' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_tab:dex:${userId}`)
      .setLabel(t('hub.dex', context))
      .setEmoji('📖')
      .setStyle(activeTab === 'dex' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_tab:arena:${userId}`)
      .setLabel(t('hub.arena', context))
      .setEmoji('⚔️')
      .setStyle(activeTab === 'arena' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  return row;
}

/**
 * Constrói a aba interativa da Chocadeira de Ovos Pymons.
 */
function buildIncubatorTab(userId, userTag, context = null, notice = null) {
  const lang = getLanguage(context);
  const status = getIncubator(userId);
  const userInv = getUserInventory(userId);
  const headerRow = buildPymonHubHeader(userId, 'incubator', context);

  const isPt = lang === 'pt';
  const title = isPt
    ? `🥚  ✦  Ninho & Chocadeira Pymons — ${userTag}`
    : `🥚  ✦  Pymon Nest & Incubator — ${userTag}`;

  const lines = [
    isPt
      ? `Bem-vindo à chocadeira mágica! Aqui você choca novos ovos Pymon obtidos em masmorras e baús.`
      : `Welcome to the magical incubator! Hatch new Pymon eggs found in dungeons and treasure chests.`,
    '',
    `🪺 **${isPt ? 'STATUS DOS NINHOS' : 'NEST STATUS'}** (${status.activeCount}/${status.maxSlots} ${isPt ? 'ocupados' : 'occupied'}):`,
  ];

  const actionButtons = [];

  status.slots.forEach((slot, idx) => {
    if (slot.empty) {
      lines.push(`> 🪹 **Slot #${idx + 1}:** ${isPt ? '*Ninho Vazio*' : '*Empty Nest*'}`);
    } else if (slot.ready) {
      lines.push(`> 🐣 **Slot #${idx + 1}:** ${slot.emoji} **${slot.eggName}** — **${isPt ? '✨ PRONTO PARA CHOCAR!' : '✨ READY TO HATCH!'}**`);
      actionButtons.push(
        new ButtonBuilder()
          .setCustomId(`incubator_hatch:${idx}:${userId}`)
          .setLabel(isPt ? `Chocar Slot #${idx + 1}` : `Hatch Slot #${idx + 1}`)
          .setEmoji('🐣')
          .setStyle(ButtonStyle.Success)
      );
    } else {
      const mins = Math.ceil(slot.tempoRestanteMs / 60000);
      lines.push(`> ⏳ **Slot #${idx + 1}:** ${slot.emoji} **${slot.eggName}** — ${mins}m ${isPt ? 'restantes' : 'remaining'} (${slot.progressPercent}%)`);
      // Se usuário tem ampulheta no inventário, adiciona botão para acelerar
      const hasHourglass = (userInv.items?.ampulheta_tempo?.count || 0) > 0;
      if (hasHourglass && actionButtons.length < 4) {
        actionButtons.push(
          new ButtonBuilder()
            .setCustomId(`incubator_hourglass:${idx}:${userId}`)
            .setLabel(isPt ? `Acelerar #${idx + 1} (-2h)` : `Speed Up #${idx + 1} (-2h)`)
            .setEmoji('⌛')
            .setStyle(ButtonStyle.Primary)
        );
      }
    }
  });

  // Se houver slots livres e o usuário possuir ovos na mochila, oferece opção de colocar
  const availableEggs = Object.entries(userInv.items || {}).filter(([itemId, item]) => item.count > 0 && item.effects?.isEgg);
  if (status.freeCount > 0 && availableEggs.length > 0 && actionButtons.length < 5) {
    const [firstEggId, firstEgg] = availableEggs[0];
    const freeSlot = status.slots.find((s) => s.empty);
    if (freeSlot) {
      actionButtons.push(
        new ButtonBuilder()
          .setCustomId(`incubator_place:${firstEggId}:${freeSlot.slotIndex}:${userId}`)
          .setLabel(isPt ? `Incubar ${firstEgg.name || 'Ovo'}` : `Incubate ${firstEgg.name || 'Egg'}`)
          .setEmoji('🥚')
          .setStyle(ButtonStyle.Secondary)
      );
    }
  }

  if (notice) {
    lines.push('');
    lines.push(`> 📢 **${notice}**`);
  }

  const embed = new EmbedBuilder()
    .setColor('#f472b6')
    .setTitle(title)
    .setDescription(lines.join('\n'))
    .setFooter({ text: isPt ? 'Pyxie Pymons • Sistema de Chocadeira' : 'Pyxie Pymons • Incubator System' });

  const components = [headerRow];
  if (actionButtons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(...actionButtons.slice(0, 5)));
  }

  return { embeds: [embed], components, files: [] };
}

/**
 * Constrói a aba interativa da Arena / Coliseu de Sparring.
 */
function buildArenaTab(userId, userTag, context = null, notice = null) {
  const lang = getLanguage(context);
  const pet = getActiveVpet(userId);
  const headerRow = buildPymonHubHeader(userId, 'arena', context);
  const isPt = lang === 'pt';

  if (!pet) {
    const embed = new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle(isPt ? '⚔️  ✦  Coliseu Pymon' : '⚔️  ✦  Pymon Coliseum')
      .setDescription(isPt ? 'Você precisa de um Pymon ativo para entrar na Arena! Use `/py-pymons`.' : 'You need an active Pymon to enter the Arena! Use `/py-pymons`.');
    return { embeds: [embed], components: [headerRow], files: [] };
  }

  const spec = getVpetSpecies(pet.key);
  const battles = pet.battlesCount || 0;
  const won = pet.battlesWon || 0;
  const winRate = battles > 0 ? Math.round((won / battles) * 100) : 0;

  const title = isPt
    ? `⚔️  ✦  Coliseu & Arena Pymon — ${userTag}`
    : `⚔️  ✦  Pymon Coliseum & Arena — ${userTag}`;

  const lines = [
    isPt
      ? `Bem-vindo à Arena de Batalha! Coloque seu Pymon à prova em combates de treino (sparring) e duelos competitivos.`
      : `Welcome to the Battle Arena! Test your Pymon in sparring sessions and competitive duels.`,
    '',
    `🐾 **${isPt ? 'CAMPEÃO ATUAL' : 'ACTIVE CHAMPION'}**: **${pet.name}** (${pet.emoji} ${spec.name?.[lang] || spec.name?.pt || 'Pymon'})`,
    `> ❤️ **HP:** \`${pet.stats?.hp || 100}\`  •  ⚔️ **ATK:** \`${pet.stats?.atk || 20}\`  •  🛡️ **DEF:** \`${pet.stats?.def || 15}\`  •  ⚡ **SPD:** \`${pet.stats?.spd || 15}\``,
    `> 🏆 **${isPt ? 'Histórico' : 'Record'}**: \`${won}V / ${battles}L (${winRate}% ${isPt ? 'taxa de vitória' : 'win rate'})\`  •  🏋️ **${isPt ? 'Treinos' : 'Trains'}**: \`${pet.trainCount || 0}\``,
    '',
    isPt
      ? `💡 *Toque em **Sparring Rápido** para lutar contra um Pymon selvagem, ou use \`/py-duelo\` para desafiar outro jogador valendo moedinhas!*`
      : `💡 *Tap **Quick Sparring** to fight a wild Pymon, or use \`/py-duel\` to challenge another trainer for coins!*`,
  ];

  if (notice) {
    lines.push('');
    lines.push(`> 📢 **${notice}**`);
  }

  const spriteUrl = getVpetSpriteUrl(pet.key, 'idle', false, false);

  const embed = new EmbedBuilder()
    .setColor('#ef4444')
    .setTitle(title)
    .setDescription(lines.join('\n'))
    .setThumbnail(spriteUrl)
    .setFooter({ text: isPt ? 'Pyxie Pymons • Arena de Sparring' : 'Pyxie Pymons • Sparring Arena' });

  const actionsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`vpet_spar:${userId}`)
      .setLabel(isPt ? '🥊 Sparring Rápido' : '🥊 Quick Sparring')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`vpet_train:${userId}`)
      .setLabel(isPt ? '🏋️ Modo Treino' : '🏋️ Training Mode')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`arena_duel_info:${userId}`)
      .setLabel(isPt ? '📜 Como Duelar' : '📜 How to Duel')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [headerRow, actionsRow], files: [] };
}

module.exports = {
  buildPymonHubHeader,
  buildIncubatorTab,
  buildArenaTab,
};


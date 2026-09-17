const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const {
  getIncubator,
  hatchIncubatorEgg,
  putEggInIncubator,
  useHourglassOnIncubator,
  getUserPetRecord,
  BOX_SLOT_COSTS,
  MAX_BOX_SLOTS,
  DEFAULT_MAX_PETS,
} = require('../pets');
const { getActiveVpet } = require('./vpetCore');
const { getVpetSpecies, getVpetSpriteUrl } = require('./vpetSpecies');
const { getUserInventory } = require('../inventory');

/**
 * Constrói a barra de navegação superior padrão de 5 abas para todo o ecossistema Pymons.
 */
function buildPymonHubHeader(userId, activeTab = 'pet', context = null) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_tab:pet:${userId}`)
      .setLabel(t('hub.pet', context))
      .setEmoji('🐾')
      .setStyle(activeTab === 'pet' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`hub_tab:box:${userId}`)
      .setLabel(t('hub.box', context))
      .setEmoji('📦')
      .setStyle(activeTab === 'box' ? ButtonStyle.Primary : ButtonStyle.Secondary),
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
      .setStyle(activeTab === 'dex' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  return row;
}

/**
 * Constrói a aba interativa do PC Storage / Pymon Box
 */
function buildBoxTab(userId, userTag, context = null, notice = null) {
  const lang = getLanguage(context);
  const isPt = lang === 'pt';
  const record = getUserPetRecord(userId);
  const pets = record.pets || [];
  const maxSlots = record.maxPets || DEFAULT_MAX_PETS;
  const activePetId = record.activePetId || pets[0]?.id;
  const headerRow = buildPymonHubHeader(userId, 'box', context);

  const title = isPt
    ? `📦  ✦  Pymon Box & PC Storage — ${userTag}`
    : `📦  ✦  Pymon Box & PC Storage — ${userTag}`;

  const lines = [
    isPt
      ? `Armazenamento seguro de Pymons. Alterne seu parceiro ativo ou amplie seus slots com moedinhas!`
      : `Secure Pymon storage. Switch your active companion or expand slots with coins!`,
    '',
    `📊 **${isPt ? 'SLOTS DE ARMAZENAMENTO' : 'STORAGE SLOTS'}** (${pets.length}/${maxSlots}):`,
  ];

  for (let i = 0; i < maxSlots; i++) {
    const p = pets[i];
    if (p) {
      const isActive = p.id === activePetId;
      const tag = isActive ? (isPt ? ' 🌟 **[ ATIVO ]**' : ' 🌟 **[ ACTIVE ]**') : '';
      const wins = p.duelosVencidos || p.battlesWon || 0;
      const hp = p.stats?.hp || p.stats?.maxHp || 100;
      const atk = p.stats?.atk || 20;
      lines.push(`> **Slot #${i + 1}:** ${p.emoji || '🐾'} **${p.name}** (Nv. ${p.level || 1} ${p.species || 'Pymon'})${tag}`);
      lines.push(`> └ ❤️ HP: ${hp} • ⚔️ ATK: ${atk} • 🏆 ${wins}V`);
    } else {
      lines.push(`> 📭 **Slot #${i + 1}:** *${isPt ? 'Ninho Livre' : 'Free Slot'}*`);
    }
  }

  const nextSlot = maxSlots + 1;
  const canExpand = maxSlots < MAX_BOX_SLOTS;
  const nextCost = canExpand ? (BOX_SLOT_COSTS[nextSlot] || (nextSlot * 2500)) : null;

  if (canExpand) {
    lines.push('');
    lines.push(isPt
      ? `🔒 **Slot #${nextSlot} Bloqueado:** Disponível por **${nextCost.toLocaleString('pt-BR')} moedinhas**.`
      : `🔒 **Slot #${nextSlot} Locked:** Available for **${nextCost.toLocaleString('en-US')} coins**.`);
  }

  if (notice) {
    lines.push('');
    lines.push(`> 📢 **${notice}**`);
  }

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(title)
    .setDescription(lines.join('\n'))
    .setFooter({ text: isPt ? 'Pyxie Pymons • PC Storage Box' : 'Pyxie Pymons • PC Storage Box' });

  const components = [headerRow];

  // Menu suspenso para alternar o Pymon ativo se houver 2+ pets
  if (pets.length > 1) {
    const selectOptions = pets.slice(0, 25).map((p, idx) => ({
      label: `${p.name} (Nv. ${p.level || 1} ${p.species || ''})`.slice(0, 100),
      description: p.id === activePetId
        ? (isPt ? 'Atualmente Ativo' : 'Currently Active')
        : (isPt ? 'Clique para Ativar este Pymon' : 'Click to Activate this Pymon'),
      value: `box_set_active:${p.id}:${userId}`,
      emoji: p.emoji || '🐾',
      default: p.id === activePetId,
    }));

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`box_select_active:${userId}`)
        .setPlaceholder(isPt ? '⭐ Escolha um Pymon para ativar...' : '⭐ Select a Pymon to activate...')
        .addOptions(selectOptions)
    );
    components.push(selectRow);
  }

  // Linha de ações de gerenciamento (Desbloquear Slot, Soltar)
  const actionButtons = [];
  if (canExpand) {
    actionButtons.push(
      new ButtonBuilder()
        .setCustomId(`box_unlock_slot:${userId}`)
        .setLabel(isPt ? `Liberar Slot #${nextSlot} (${nextCost.toLocaleString('pt-BR')}🪙)` : `Unlock Slot #${nextSlot} (${nextCost.toLocaleString('en-US')}🪙)`)
        .setEmoji('🔓')
        .setStyle(ButtonStyle.Success)
    );
  }

  if (pets.length > 1) {
    actionButtons.push(
      new ButtonBuilder()
        .setCustomId(`box_release_start:${userId}`)
        .setLabel(isPt ? 'Soltar Pymon' : 'Release Pymon')
        .setEmoji('🍃')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  if (actionButtons.length > 0) {
    components.push(new ActionRowBuilder().addComponents(actionButtons));
  }

  return { embeds: [embed], components, files: [] };
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
      ? `Chocadeira mágica! Aqui você incuba e choca ovos obtidos em masmorras e baús.`
      : `Magical incubator! Incubate and hatch eggs collected in dungeons and chests.`,
    '',
    `🪺 **${isPt ? 'STATUS DOS NINHOS' : 'NEST STATUS'}** (${status.activeCount}/${status.maxSlots} ${isPt ? 'ocupados' : 'occupied'}):`,
  ];

  const actionButtons = [];

  status.slots.forEach((slot, idx) => {
    if (slot.empty) {
      lines.push(`> 🪹 **Slot #${idx + 1}:** ${isPt ? '*Ninho Vazio*' : '*Empty Nest*'}`);
    } else if (slot.ready) {
      lines.push(`> 🐣 **Slot #${idx + 1}:** ${slot.emoji} **${slot.eggName}** — **${isPt ? '✨ PRONTO!' : '✨ READY!'}**`);
      actionButtons.push(
        new ButtonBuilder()
          .setCustomId(`incubator_hatch:${idx}:${userId}`)
          .setLabel(isPt ? `Chocar #${idx + 1}` : `Hatch #${idx + 1}`)
          .setEmoji('🐣')
          .setStyle(ButtonStyle.Success)
      );
    } else {
      const mins = Math.ceil(slot.tempoRestanteMs / 60000);
      lines.push(`> ⏳ **Slot #${idx + 1}:** ${slot.emoji} **${slot.eggName}** — ${mins}m (${slot.progressPercent}%)`);
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
      ? `Arena de Batalha! Enfrente monstros selvagens em combates de sparring ou desafie outros treinadores.`
      : `Battle Arena! Fight wild monsters in sparring matches or challenge other trainers.`,
    '',
    `🐾 **${isPt ? 'CAMPEÃO ATUAL' : 'ACTIVE CHAMPION'}**: **${pet.name}** (${pet.emoji} ${spec.name?.[lang] || spec.name?.pt || 'Pymon'})`,
    `> ❤️ **HP:** \`${pet.stats?.hp || 100}\` • ⚔️ **ATK:** \`${pet.stats?.atk || 20}\` • 🛡️ **DEF:** \`${pet.stats?.def || 15}\` • ⚡ **SPD:** \`${pet.stats?.spd || 15}\``,
    `> 🏆 **${isPt ? 'Histórico' : 'Record'}**: \`${won}V / ${battles}L (${winRate}%)\` • 🏋️ **${isPt ? 'Treinos' : 'Trains'}**: \`${pet.trainCount || 0}\``,
    '',
    isPt
      ? `💡 *Cada vitória de Sparring rende **+60 moedas** e **+35 XP**!*`
      : `💡 *Each Sparring victory awards **+60 coins** and **+35 XP**!*`,
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
      .setLabel(isPt ? '🏋️ Treinar' : '🏋️ Train')
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
  buildBoxTab,
  buildIncubatorTab,
  buildArenaTab,
};

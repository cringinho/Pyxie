const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getUserInventory, getItemDefinition, sellItem, openChest, formatItemEffects } = require('../services/inventory');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { formatCoins, t } = require('../utils/i18n');
const { INVENTORY } = require('./commandNames');

function buildInventoryEmbed(userId, userTag, selectedItemId = null, source = null) {
  const inv = getUserInventory(userId);
  const entries = Object.entries(inv).filter(([, count]) => count > 0);

  const itemLines = entries.length === 0
    ? [t('inventory.emptyBackpack', source)]
    : entries.map(([itemId, count]) => {
        const item = getItemDefinition(itemId);
        if (!item) return `> • \`${itemId}\`: **${count}x**`;
        const isSelected = item.id === selectedItemId;
        const pointer = isSelected ? '👉 ' : '';
        const fxText = formatItemEffects(item);
        const fxLine = fxText ? `\n> 📊 **${t('inventory.effect', source)}:** ${fxText}` : '';
        return `**${pointer}${item.emoji} ${item.name}** (x${count})\n> *${item.description}*${fxLine}\n> 🏷️ ${t('inventory.category', source)}: \`${item.category}\`  •  🪙 ${t('inventory.sellPrice', source)}: **${formatCoins(item.sellPrice || 0, source)}**`;
      });

  const desc = [
    t('inventory.storedItemsHeader', source),
    '',
    itemLines.join('\n\n'),
    '',
    t('inventory.tipSelect', source),
  ].join('\n');

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.magenta || '#e60067')
    .setTitle(t('inventory.backpackTitle', source, { user: userTag }))
    .setDescription(desc)
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();
}

function buildInventoryComponents(userId, selectedItemId = null, source = null) {
  const inv = getUserInventory(userId);
  const entries = Object.entries(inv).filter(([, count]) => count > 0);

  if (entries.length === 0) {
    const emptyRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`hub_tab:shop:${userId}`)
        .setLabel(t('inventory.btnVisitShop', source))
        .setEmoji('🛒')
        .setStyle(ButtonStyle.Primary)
    );

    return [emptyRow];
  }

  const selectOptions = entries.slice(0, 25).map(([itemId, count]) => {
    const item = getItemDefinition(itemId);
    return {
      label: `${item ? item.name : itemId} (x${count})`,
      value: itemId,
      description: item ? item.description.slice(0, 50) : `Quantidade: ${count}`,
      emoji: item ? item.emoji : '📦',
      default: itemId === selectedItemId,
    };
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`inv_item_select:${userId}`)
    .setPlaceholder(t('inventory.selectPlaceholder', source))
    .addOptions(selectOptions);

  const actionRow = new ActionRowBuilder();

  if (selectedItemId) {
    const item = getItemDefinition(selectedItemId);
    const count = inv[selectedItemId] || 0;

    if (item && count > 0) {
      if (item.effects && item.effects.isChest) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`inv_open_chest:${selectedItemId}:${userId}`)
            .setLabel(t('inventory.openChest', source, { name: item.name }))
            .setEmoji('🔓')
            .setStyle(ButtonStyle.Success)
        );
      }

      if (item.sellPrice) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`inv_sell_item:${selectedItemId}:${userId}`)
            .setLabel(t('inventory.sellOne', source, { coins: formatCoins(item.sellPrice, source) }))
            .setEmoji('🪙')
            .setStyle(ButtonStyle.Secondary)
        );
      }
    }
  } else {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`inv_hint:${userId}`)
        .setLabel(t('inventory.hintSelect', source))
        .setEmoji('☝️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
  }

  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_tab:shop:${userId}`)
      .setLabel(t('inventory.btnVisitShop', source))
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Primary)
  );

  return [new ActionRowBuilder().addComponents(selectMenu), actionRow];
}

function isInventoryInteraction(interaction) {
  if (!interaction.customId) return false;
  return (
    interaction.customId.startsWith('inv_item_select') ||
    interaction.customId.startsWith('inv_open_chest') ||
    interaction.customId.startsWith('inv_sell_item')
  );
}

async function handleInventoryInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[0];
  const targetUserId = parts[parts.length - 1];

  if (targetUserId && targetUserId !== interaction.user.id) {
    return interaction.reply({
      content: t('inventory.otherUserBackpack', interaction),
      flags: 64,
    });
  }

  const userId = interaction.user.id;
  const userTag = interaction.user.displayName || interaction.user.username;

  // 1. Selecionar Item no menu
  if (action === 'inv_item_select') {
    const selectedItemId = interaction.values[0];
    const embed = buildInventoryEmbed(userId, userTag, selectedItemId, interaction);
    const components = buildInventoryComponents(userId, selectedItemId, interaction);
    return interaction.update({ embeds: [embed], components });
  }

  // 2. Abrir Baú
  if (action === 'inv_open_chest') {
    const chestId = parts[1];
    const openRes = openChest(userId, chestId);

    if (!openRes.success) {
      return interaction.reply({
        content: t('common.error', interaction),
        flags: 64,
      });
    }

    const embed = buildInventoryEmbed(userId, userTag, null, interaction);
    const components = buildInventoryComponents(userId, null, interaction);
    const itemsWonStr = openRes.itemsWon.length > 0 ? ` + itens: ${openRes.itemsWon.join(', ')}` : '';

    return interaction.update({
      content: t('inventory.chestOpened', interaction, { coins: formatCoins(openRes.coinsWon, interaction), items: itemsWonStr }),
      embeds: [embed],
      components,
    });
  }

  // 3. Vender Item
  if (action === 'inv_sell_item') {
    const itemId = parts[1];
    const sellRes = sellItem(userId, itemId, 1);

    if (!sellRes.success) {
      return interaction.reply({
        content: `❌ ${sellRes.message || t('common.error', interaction)}`,
        flags: 64,
      });
    }

    const embed = buildInventoryEmbed(userId, userTag, null, interaction);
    const components = buildInventoryComponents(userId, null, interaction);

    return interaction.update({
      content: t('inventory.soldSuccess', interaction, { item: sellRes.item.name, coins: formatCoins(sellRes.totalCoins, interaction) }),
      embeds: [embed],
      components,
    });
  }
}

module.exports = {
  name: INVENTORY,
  aliases: ['inventory', 'inventario', 'py-inventory', 'py-inventario', 'mochila'],
  buildInventoryEmbed,
  buildInventoryComponents,
  isInventoryInteraction,
  handleInventoryInteraction,
  data: new SlashCommandBuilder()
    .setName(INVENTORY)
    .setDescription('Open your backpack to view and manage stored items.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre sua mochila para visualizar e gerenciar itens guardados.',
    }),
  async executePrefix({ message }) {
    const embed = buildInventoryEmbed(message.author.id, message.author.displayName || message.author.username, null, message);
    const components = buildInventoryComponents(message.author.id, null, message);
    await message.reply({ embeds: [embed], components });
  },
  async executeSlash({ interaction }) {
    const embed = buildInventoryEmbed(interaction.user.id, interaction.user.displayName || interaction.user.username, null, interaction);
    const components = buildInventoryComponents(interaction.user.id, null, interaction);
    await interaction.editReply({ embeds: [embed], components });
  },
};

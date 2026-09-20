const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getUserInventory, getItemDefinition, sellItem, openChest, formatItemEffects } = require('../services/inventory');
const { getGloomUser, RELICS } = require('../services/gloomRealm');
const { getEmoji } = require('../utils/appEmojis');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { formatCoins, getLanguage, t } = require('../utils/i18n');
const { INVENTORY } = require('./commandNames');

function buildInventoryEmbed(userId, userTag, selectedItemId = null, source = null, currentTab = 'todos') {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const inv = getUserInventory(userId);
  const gUser = getGloomUser(userId);

  const socialEntries = Object.entries(inv).filter(([, count]) => count > 0);
  const relicEntries = Object.entries(gUser.inventory || {}).filter(([, count]) => count > 0);

  const descSections = [];

  // Tab: Bosque & Relíquias
  if (currentTab === 'bosque' || currentTab === 'todos') {
    const relicLines = [];
    if (relicEntries.length === 0) {
      relicLines.push(t('inventory.emptyRelics', source));
    } else {
      for (let tier = 1; tier <= 5; tier++) {
        const tierItems = relicEntries.filter(([id]) => (RELICS[id]?.tier || 1) === tier);
        if (tierItems.length > 0) {
          relicLines.push(`**⭐ Tier ${tier}:**`);
          for (const [relicId, count] of tierItems) {
            const rDef = RELICS[relicId];
            const rName = rDef ? (isEn ? rDef.name.en : rDef.name.pt) : relicId;
            const rDesc = rDef ? (isEn ? rDef.desc.en : rDef.desc.pt) : '';
            relicLines.push(`> • 🏺 **${rName}** (x${count})\n>   *« ${rDesc} »*`);
          }
        }
      }
    }

    descSections.push([
      t('inventory.relicsHeader', source),
      t('inventory.phantomCoinsLabel', source, { coins: gUser.phantomCoins || 0 }),
      '',
      relicLines.join('\n'),
    ].join('\n'));
  }

  // Tab: Social & Baús
  if (currentTab === 'social' || currentTab === 'todos') {
    const socialLines = socialEntries.length === 0
      ? [t('inventory.emptyBackpack', source)]
      : socialEntries.map(([itemId, count]) => {
          const item = getItemDefinition(itemId);
          if (!item) return `> • \`${itemId}\`: **${count}x**`;
          const isSelected = item.id === selectedItemId;
          const pointer = isSelected ? '👉 ' : '';
          const fxText = formatItemEffects(item);
          const fxLine = fxText ? `\n> 📊 **${t('inventory.effect', source)}:** ${fxText}` : '';
          return `**${pointer}${item.emoji} ${item.name}** (x${count})\n> *${item.description}*${fxLine}\n> 🏷️ ${t('inventory.category', source)}: \`${item.category}\`  •  🪙 ${t('inventory.sellPrice', source)}: **${formatCoins(item.sellPrice || 0, source)}**`;
        });

    descSections.push([
      t('inventory.storedItemsHeader', source),
      '',
      socialLines.join('\n\n'),
    ].join('\n'));
  }

  if (currentTab !== 'bosque') {
    descSections.push(t('inventory.tipSelect', source));
  }

  return new EmbedBuilder()
    .setColor(currentTab === 'bosque' ? (PYXIE_COLORS.purple || '#8b5cf6') : (PYXIE_COLORS.magenta || '#e60067'))
    .setTitle(t('inventory.backpackTitle', source, { user: userTag }))
    .setDescription(descSections.join('\n\n───────────────\n\n'))
    .setFooter({ text: 'Pyxie • Mochila Modular' })
    .setTimestamp();
}

function buildInventoryComponents(userId, selectedItemId = null, source = null, currentTab = 'todos') {
  const inv = getUserInventory(userId);
  const socialEntries = Object.entries(inv).filter(([, count]) => count > 0);

  // Linha 1: Abas Modulares de Filtragem
  const tabRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`inv_tab:todos:${userId}`)
      .setLabel(t('inventory.tabTodos', source))
      .setEmoji('🎒')
      .setStyle(currentTab === 'todos' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`inv_tab:bosque:${userId}`)
      .setLabel(t('inventory.tabBosque', source))
      .setEmoji(getEmoji('TREE'))
      .setStyle(currentTab === 'bosque' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`inv_tab:social:${userId}`)
      .setLabel(t('inventory.tabSocial', source))
      .setEmoji(getEmoji('CHEST'))
      .setStyle(currentTab === 'social' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );

  const components = [tabRow];

  // Se estiver na aba Bosque: botões para ir à exploração ou ao Engenheiro
  if (currentTab === 'bosque') {
    const gloomRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`gloom:view:${userId}`)
        .setLabel(getLanguage(source) === 'en' ? 'Explore Gloom Realm' : 'Explorar Bosque')
        .setEmoji(getEmoji('PORTAL'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`hub_tab:shop:${userId}`)
        .setLabel(t('inventory.btnVisitShop', source))
        .setEmoji('🛒')
        .setStyle(ButtonStyle.Secondary)
    );
    components.push(gloomRow);
    return components;
  }

  // Abas Social & Todos: Menu de seleção de itens sociais (baús, vendas)
  if (socialEntries.length === 0) {
    const emptyRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`hub_tab:shop:${userId}`)
        .setLabel(t('inventory.btnVisitShop', source))
        .setEmoji('🛒')
        .setStyle(ButtonStyle.Primary)
    );
    components.push(emptyRow);
    return components;
  }

  const selectOptions = socialEntries.slice(0, 25).map(([itemId, count]) => {
    const item = getItemDefinition(itemId);
    return {
      label: `${item ? item.name : itemId} (x${count})`,
      value: `${itemId}:${currentTab}`,
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
            .setCustomId(`inv_open_chest:${selectedItemId}:${currentTab}:${userId}`)
            .setLabel(t('inventory.openChest', source, { name: item.name }))
            .setEmoji('🔓')
            .setStyle(ButtonStyle.Success)
        );
      }

      if (item.sellPrice) {
        actionRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`inv_sell_item:${selectedItemId}:${currentTab}:${userId}`)
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

  components.push(new ActionRowBuilder().addComponents(selectMenu), actionRow);
  return components;
}

function isInventoryInteraction(interaction) {
  if (!interaction.customId) return false;
  return (
    interaction.customId.startsWith('inv_tab') ||
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

  // 1. Alternar Aba Modular
  if (action === 'inv_tab') {
    const selectedTab = parts[1] || 'todos';
    const embed = buildInventoryEmbed(userId, userTag, null, interaction, selectedTab);
    const components = buildInventoryComponents(userId, null, interaction, selectedTab);
    return interaction.update({ embeds: [embed], components });
  }

  // 2. Selecionar Item no menu
  if (action === 'inv_item_select') {
    const rawVal = interaction.values[0];
    const [selectedItemId, tabFromVal] = rawVal.split(':');
    const currentTab = tabFromVal || 'todos';
    const embed = buildInventoryEmbed(userId, userTag, selectedItemId, interaction, currentTab);
    const components = buildInventoryComponents(userId, selectedItemId, interaction, currentTab);
    return interaction.update({ embeds: [embed], components });
  }

  // 3. Abrir Baú
  if (action === 'inv_open_chest') {
    const chestId = parts[1];
    const currentTab = parts[2] || 'todos';
    const openRes = openChest(userId, chestId);

    if (!openRes.success) {
      return interaction.reply({
        content: t('common.error', interaction),
        flags: 64,
      });
    }

    const embed = buildInventoryEmbed(userId, userTag, null, interaction, currentTab);
    const components = buildInventoryComponents(userId, null, interaction, currentTab);
    const itemsWonStr = openRes.itemsWon.length > 0 ? ` + itens: ${openRes.itemsWon.join(', ')}` : '';

    return interaction.update({
      content: t('inventory.chestOpened', interaction, { coins: formatCoins(openRes.coinsWon, interaction), items: itemsWonStr }),
      embeds: [embed],
      components,
    });
  }

  // 4. Vender Item
  if (action === 'inv_sell_item') {
    const itemId = parts[1];
    const currentTab = parts[2] || 'todos';
    const sellRes = sellItem(userId, itemId, 1);

    if (!sellRes.success) {
      return interaction.reply({
        content: `❌ ${sellRes.message || t('common.error', interaction)}`,
        flags: 64,
      });
    }

    const embed = buildInventoryEmbed(userId, userTag, null, interaction, currentTab);
    const components = buildInventoryComponents(userId, null, interaction, currentTab);

    return interaction.update({
      content: t('inventory.soldSuccess', interaction, { item: sellRes.item.name, coins: formatCoins(sellRes.totalCoins, interaction) }),
      embeds: [embed],
      components,
    });
  }
}

module.exports = {
  name: INVENTORY,
  aliases: ['inventory', 'inventario', 'py-inventory', 'py-inventario', 'mochila', 'py-mochila'],
  buildInventoryEmbed,
  buildInventoryComponents,
  isInventoryInteraction,
  handleInventoryInteraction,
  data: new SlashCommandBuilder()
    .setName(INVENTORY)
    .setDescription('Open your modular backpack to filter items, relics, and chests.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre sua mochila modular para filtrar itens, relíquias e baús.',
    }),
  async executePrefix({ message }) {
    const embed = buildInventoryEmbed(message.author.id, message.author.displayName || message.author.username, null, message, 'todos');
    const components = buildInventoryComponents(message.author.id, null, message, 'todos');
    await message.reply({ embeds: [embed], components });
  },
  async executeSlash({ interaction }) {
    const embed = buildInventoryEmbed(interaction.user.id, interaction.user.displayName || interaction.user.username, null, interaction, 'todos');
    const components = buildInventoryComponents(interaction.user.id, null, interaction, 'todos');
    await interaction.editReply({ embeds: [embed], components });
  },
};

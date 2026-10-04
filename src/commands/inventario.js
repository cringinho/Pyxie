const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getUserInventory, getItemDefinition, sellItem, openChest, formatItemEffects } = require('../services/inventory');
const { getEmoji } = require('../utils/appEmojis');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { formatCoins, getLanguage, t } = require('../utils/i18n');
const { INVENTORY } = require('./commandNames');

function buildInventoryEmbed(userId, userTag, selectedItemId = null, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';
  const inv = getUserInventory(userId);

  const entries = Object.entries(inv).filter(([, count]) => count > 0);
  const descSections = [];

  const itemsLines = entries.length === 0
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

  descSections.push([
    t('inventory.storedItemsHeader', source),
    '',
    itemsLines.join('\n\n'),
  ].join('\n'));

  if (entries.length > 0) {
    descSections.push(t('inventory.tipSelect', source));
  }

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.magenta || '#e60067')
    .setTitle(t('inventory.backpackTitle', source, { user: userTag }))
    .setDescription(descSections.join('\n\n───────────────\n\n'))
    .setFooter({ text: isEn ? 'Pyxie • Backpack' : 'Pyxie • Mochila' })
    .setTimestamp();
}

function buildInventoryComponents(userId, selectedItemId = null, source = null) {
  const inv = getUserInventory(userId);
  const entries = Object.entries(inv).filter(([, count]) => count > 0);
  const components = [];

  if (entries.length > 0) {
    const options = entries.slice(0, 25).map(([itemId, count]) => {
      const item = getItemDefinition(itemId);
      const name = item ? item.name : itemId;
      const desc = item ? item.description : '';
      return {
        label: `${name} (x${count})`.slice(0, 100),
        value: `${itemId}:item`,
        description: desc.slice(0, 100) || undefined,
        emoji: item?.emoji || '📦',
        default: itemId === selectedItemId,
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`inv_select:${userId}`)
      .setPlaceholder(t('inventory.selectItemPlaceholder', source))
      .addOptions(options);

    components.push(new ActionRowBuilder().addComponents(selectMenu));
  }

  const selectedDef = selectedItemId ? getItemDefinition(selectedItemId) : null;
  const isChest = selectedDef?.effects?.isChest;
  const canSell = selectedDef && (selectedDef.sellPrice || 0) > 0;

  const actionRow = new ActionRowBuilder();

  if (isChest) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`inv_open_chest:${selectedItemId}:${userId}`)
        .setLabel(t('inventory.btnOpenChest', source))
        .setEmoji(getEmoji('CHEST'))
        .setStyle(ButtonStyle.Success)
    );
  }

  if (canSell) {
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`inv_sell_item:${selectedItemId}:${userId}`)
        .setLabel(t('inventory.btnSellOne', source))
        .setEmoji(getEmoji('COIN'))
        .setStyle(ButtonStyle.Danger)
    );
  }

  actionRow.addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_tab:shop:${userId}`)
      .setLabel(t('inventory.btnVisitShop', source))
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Secondary)
  );

  components.push(actionRow);
  return components;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName(INVENTORY)
    .setDescription('View and manage your backpack items, chests, and rewards')
    .setDescriptionLocalizations({
      'pt-BR': 'Veja e gerencie sua mochila, baús e recompensas',
    }),
  name: INVENTORY,
  aliases: ['inventario', 'py-inventario', 'mochila', 'py-mochila', 'inv', 'py-inv'],
  description: 'View and manage your backpack items, chests, and rewards',
  category: 'loja',
  buildInventoryEmbed,
  buildInventoryComponents,

  async executeSlash({ interaction }) {
    return this.execute(interaction);
  },

  async execute(interaction) {
    const userId = interaction.user.id;
    const userTag = interaction.user.username;

    const embed = buildInventoryEmbed(userId, userTag, null, interaction);
    const components = buildInventoryComponents(userId, null, interaction);

    const message = (interaction.deferred || interaction.replied)
      ? await interaction.editReply({ embeds: [embed], components })
      : await interaction.reply({
          embeds: [embed],
          components,
          fetchReply: true,
        });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 120000,
    });

    collector.on('collect', async (i) => {
      try {
        if (i.customId.startsWith('inv_select:')) {
          const rawValue = i.values[0];
          const [itemId] = rawValue.split(':');
          const updatedEmbed = buildInventoryEmbed(userId, userTag, itemId, i);
          const updatedComponents = buildInventoryComponents(userId, itemId, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          return;
        }

        if (i.customId.startsWith('inv_open_chest:')) {
          const [, chestId] = i.customId.split(':');
          const result = openChest(userId, chestId);
          if (!result.success) {
            await i.reply({ content: t('inventory.errorOpenChest', i), ephemeral: true });
            return;
          }

          let rewardMsg = t('inventory.chestOpenedSuccess', i, {
            chest: result.chest.name,
            coins: formatCoins(result.coinsAwarded, i),
          });
          if (result.droppedItem) {
            rewardMsg += `\n🎁 ${t('inventory.bonusItemFound', i, { item: `${result.droppedItem.emoji} ${result.droppedItem.name}` })}`;
          }

          const updatedEmbed = buildInventoryEmbed(userId, userTag, null, i);
          const updatedComponents = buildInventoryComponents(userId, null, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          await i.followUp({ content: rewardMsg, ephemeral: true });
          return;
        }

        if (i.customId.startsWith('inv_sell_item:')) {
          const [, itemId] = i.customId.split(':');
          const result = sellItem(userId, itemId, 1);
          if (!result.success) {
            await i.reply({ content: t('inventory.errorSellItem', i), ephemeral: true });
            return;
          }

          const updatedEmbed = buildInventoryEmbed(userId, userTag, null, i);
          const updatedComponents = buildInventoryComponents(userId, null, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          await i.followUp({
            content: t('inventory.itemSoldSuccess', i, {
              item: result.item.name,
              coins: formatCoins(result.earned, i),
            }),
            ephemeral: true,
          });
          return;
        }

        if (i.customId.startsWith('hub_tab:shop:')) {
          await i.reply({
            content: `🛒 ${t('inventory.shopHint', i)}: </py-shop:0>`,
            ephemeral: true,
          });
          return;
        }
      } catch (err) {
        console.error('[Inventory Interaction Error]', err);
      }
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (_) {}
    });
  },

  async runPrefix(message, args) {
    const userId = message.author.id;
    const userTag = message.author.username;

    const embed = buildInventoryEmbed(userId, userTag, null, message);
    const components = buildInventoryComponents(userId, null, message);

    const msg = await message.reply({ embeds: [embed], components });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 120000,
    });

    collector.on('collect', async (i) => {
      try {
        if (i.customId.startsWith('inv_select:')) {
          const rawValue = i.values[0];
          const [itemId] = rawValue.split(':');
          const updatedEmbed = buildInventoryEmbed(userId, userTag, itemId, i);
          const updatedComponents = buildInventoryComponents(userId, itemId, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          return;
        }

        if (i.customId.startsWith('inv_open_chest:')) {
          const [, chestId] = i.customId.split(':');
          const result = openChest(userId, chestId);
          if (!result.success) {
            await i.reply({ content: t('inventory.errorOpenChest', i), ephemeral: true });
            return;
          }

          let rewardMsg = t('inventory.chestOpenedSuccess', i, {
            chest: result.chest.name,
            coins: formatCoins(result.coinsAwarded, i),
          });
          if (result.droppedItem) {
            rewardMsg += `\n🎁 ${t('inventory.bonusItemFound', i, { item: `${result.droppedItem.emoji} ${result.droppedItem.name}` })}`;
          }

          const updatedEmbed = buildInventoryEmbed(userId, userTag, null, i);
          const updatedComponents = buildInventoryComponents(userId, null, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          await i.followUp({ content: rewardMsg, ephemeral: true });
          return;
        }

        if (i.customId.startsWith('inv_sell_item:')) {
          const [, itemId] = i.customId.split(':');
          const result = sellItem(userId, itemId, 1);
          if (!result.success) {
            await i.reply({ content: t('inventory.errorSellItem', i), ephemeral: true });
            return;
          }

          const updatedEmbed = buildInventoryEmbed(userId, userTag, null, i);
          const updatedComponents = buildInventoryComponents(userId, null, i);
          await i.update({ embeds: [updatedEmbed], components: updatedComponents });
          await i.followUp({
            content: t('inventory.itemSoldSuccess', i, {
              item: result.item.name,
              coins: formatCoins(result.earned, i),
            }),
            ephemeral: true,
          });
          return;
        }

        if (i.customId.startsWith('hub_tab:shop:')) {
          await i.reply({
            content: `🛒 ${t('inventory.shopHint', i)}: py!loja`,
            ephemeral: true,
          });
          return;
        }
      } catch (err) {
        console.error('[Inventory Interaction Error]', err);
      }
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] });
      } catch (_) {}
    });
  },
};

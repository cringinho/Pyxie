const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getItemsByCategory, getItemDefinition, buyItem, formatItemEffects } = require('../services/inventory');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { formatCoins } = require('./economyHelpers');
const { SHOP } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');

const CATEGORY_KEYS = [
  { key: 'bau', emoji: '📦' },
  { key: 'joia', emoji: '💎' },
];

function getCategories(source = null) {
  return CATEGORY_KEYS.map((cat) => ({
    value: cat.key,
    emoji: cat.emoji,
    label: t(`shop.categories.${cat.key}.label`, source),
    desc: t(`shop.categories.${cat.key}.desc`, source),
  }));
}

function buildShopEmbed(category = 'bau', source = null) {
  const isEn = getLanguage(source) === 'en';
  const categories = getCategories(source);
  const items = getItemsByCategory(category);
  const catInfo = categories.find((c) => c.value === category) || categories[0];

  const itemLines = items.length === 0
    ? [t('shop.empty', source)]
    : items.map((item) => {
        const priceTag = item.buyPrice
          ? `🪙 **${formatCoins(item.buyPrice, source)}**`
          : (isEn ? '*Special item*' : '*Item especial*');
        const fxText = formatItemEffects(item);
        const effectLabel = isEn ? 'Effect' : 'Efeito';
        const fxLine = fxText ? `\n> 📊 **${effectLabel}:** ${fxText}` : '';
        return `**${item.emoji} ${item.name}** — ${priceTag}\n> *${item.description}*${fxLine}\n> 🏷️ *ID:* \`${item.id}\``;
      });

  const desc = [
    `*« ${catInfo.desc} »*`,
    '',
    t('shop.catalogHeader', source),
    '',
    itemLines.join('\n\n'),
    '',
    t('shop.tip', source),
  ].join('\n');

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold || '#f6c343')
    .setTitle(t('shop.title', source, { emoji: catInfo.emoji, label: catInfo.label }))
    .setDescription(desc)
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();
}

function buildShopComponents(currentCategory = 'bau', userId = '', source = null) {
  const categories = getCategories(source);
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`shop_category_select:${userId}`)
    .setPlaceholder(t('shop.selectCatPlaceholder', source))
    .addOptions(
      categories.map((cat) => ({
        label: cat.label,
        value: cat.value,
        description: cat.desc,
        emoji: cat.emoji,
        default: cat.value === currentCategory,
      }))
    );

  const items = getItemsByCategory(currentCategory).filter((i) => i.buyPrice);
  const components = [new ActionRowBuilder().addComponents(selectMenu)];

  if (items.length > 0) {
    const buyMenu = new StringSelectMenuBuilder()
      .setCustomId(`shop_buy_select:${userId}`)
      .setPlaceholder(t('shop.buySelectPlaceholder', source))
      .addOptions(
        items.map((i) => ({
          label: `${i.name} (${formatCoins(i.buyPrice, source)})`,
          description: (i.description || '').slice(0, 45),
          value: i.id,
          emoji: i.emoji,
        }))
      );
    components.push(new ActionRowBuilder().addComponents(buyMenu));
  }

  const buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hub_tab:inventory:${userId}`)
      .setLabel(t('shop.btnBackpack', source))
      .setEmoji('🎒')
      .setStyle(ButtonStyle.Primary)
  );

  components.push(buttonsRow);

  return components;
}

function isShopInteraction(interaction) {
  if (!interaction.customId) return false;
  return (
    interaction.customId.startsWith('shop_category_select') ||
    interaction.customId.startsWith('shop_buy_select')
  );
}

async function handleShopInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[0];
  const targetUserId = parts[1];

  if (targetUserId && targetUserId !== interaction.user.id) {
    return interaction.reply({
      content: t('common.onlyOwner', interaction),
      flags: 64,
    });
  }

  const userId = interaction.user.id;

  if (action === 'shop_category_select') {
    const chosenCat = interaction.values[0];
    const embed = buildShopEmbed(chosenCat, interaction);
    const components = buildShopComponents(chosenCat, userId, interaction);
    return interaction.update({ embeds: [embed], components });
  }

  if (action === 'shop_buy_select') {
    const itemId = interaction.values[0];
    const res = buyItem(userId, itemId, 1);

    if (!res.success) {
      if (res.reason === 'insufficient_funds') {
        return interaction.reply({
          content: t('shop.insufficientCoins', interaction, {
            needed: formatCoins(res.cost, interaction),
            current: formatCoins(res.balance, interaction),
          }),
          flags: 64,
        });
      }
      return interaction.reply({
        content: `❌ ${res.message || t('common.error', interaction)}`,
        flags: 64,
      });
    }

    const item = getItemDefinition(itemId);
    return interaction.reply({
      content: t('shop.buySuccess', interaction, {
        emoji: item ? item.emoji : '📦',
        name: item ? item.name : itemId,
        cost: formatCoins(res.cost, interaction),
        balance: formatCoins(res.newBalance, interaction),
      }),
      flags: 64,
    });
  }
}

module.exports = {
  name: SHOP,
  aliases: ['shop', 'loja', 'py-shop', 'py-loja', 'mercado', 'comprar'],
  buildShopEmbed,
  buildShopComponents,
  isShopInteraction,
  handleShopInteraction,
  data: new SlashCommandBuilder()
    .setName(SHOP)
    .setDescription('Open the store to buy mystery chests and precious gems.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abre a lojinha para comprar baús misteriosos e gemas preciosas.',
    })
    .addStringOption((opt) =>
      opt
        .setName('category')
        .setNameLocalizations({
          'en-US': 'category',
          'en-GB': 'category',
          'pt-BR': 'categoria',
        })
        .setDescription('Initial category to open')
        .setDescriptionLocalizations({
          'pt-BR': 'Categoria inicial da lojinha',
        })
        .setRequired(false)
        .addChoices(
          { name: '📦 Mystery Chests', nameLocalizations: { 'pt-BR': '📦 Baús Misteriosos' }, value: 'bau' },
          { name: '💎 Precious Gems & Jewels', nameLocalizations: { 'pt-BR': '💎 Joias & Gemas Preciosas' }, value: 'joia' }
        )
    ),
  async executePrefix({ message, args }) {
    const requestedCat = args[0]?.toLowerCase() || 'bau';
    const validCategory = ['bau', 'joia'].includes(requestedCat)
      ? requestedCat
      : 'bau';
    const embed = buildShopEmbed(validCategory, message);
    const components = buildShopComponents(validCategory, message.author.id, message);
    await message.reply({ embeds: [embed], components });
  },
  async executeSlash({ interaction }) {
    const category = interaction.options.getString('category') || interaction.options.getString('categoria') || 'bau';
    const embed = buildShopEmbed(category, interaction);
    const components = buildShopComponents(category, interaction.user.id, interaction);
    await interaction.editReply({ embeds: [embed], components });
  },
};

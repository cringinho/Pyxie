const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const { getEmoji } = require('../../../utils/appEmojis');
const { BLANK, columns, decorate, emojify, field, buttonEmoji } = require('../../../utils/embedLayout');
const crafting = require('../../../services/crafting');
const { getItem, itemName, rarityInfo } = require('../homeCatalog');
const { renderShelf } = require('../homeRenderer');

/**
 * Oficina (/py-craft): materiais do /py-work viram móveis que só existem por artesanato.
 * customId: craft:<ação>:<dona>[:item]  (pick = menu de receitas, make = fazer, back = voltar)
 */

const name = 'py-craft';
const aliases = ['craft', 'criar', 'py-criar', 'oficina', 'py-oficina', 'artesanato', 'py-artesanato', 'workshop', 'py-workshop'];
const COLOR = '#b45309';

const coinIcon = () => getEmoji('COIN') || '🪙';

/** Materiais em duas colunas (metade de cada lado). */
function materialsColumns(userId, lang) {
  const materials = crafting.getMaterials(userId);
  const lines = Object.keys(crafting.MATERIALS).map((key) => t('craft.materialLine', lang, { label: crafting.materialLabel(key, lang), qty: materials[key] }));
  const half = Math.ceil(lines.length / 2);
  return columns([t('craft.materialsHeader', lang), lines.slice(0, half).join('\n')], [BLANK, lines.slice(half).join('\n') || BLANK]);
}

function recipeMenu(ownerId, lang, selected = null) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`craft:pick:${ownerId}`)
      .setPlaceholder(t('craft.pick', lang))
      .addOptions(
        crafting.RECIPES.map((recipe) => {
          const entry = getItem(recipe.itemId);
          const needs = Object.entries(recipe.materials).map(([key, qty]) => `${qty} ${crafting.MATERIALS[key][lang === 'en' ? 'en' : 'pt']}`).join(', ');
          return {
            label: itemName(entry, lang).slice(0, 100),
            description: `${rarityInfo(entry.rarity)[lang === 'en' ? 'en' : 'pt']} • ${needs} • ${recipe.coins}`.slice(0, 100),
            value: recipe.itemId,
            emoji: '🛠️',
            default: recipe.itemId === selected,
          };
        })
      )
  );
}

async function shelfFile(itemIds, lang, title) {
  try {
    const png = await renderShelf(itemIds.map((itemId) => ({ itemId })), { title, lang, columns: Math.min(4, itemIds.length) });
    return new AttachmentBuilder(png, { name: 'oficina.png' });
  } catch (_) {
    return null;
  }
}

async function buildWorkshopView({ owner, source, notice = null }) {
  const lang = getLanguage(source);
  const embed = decorate(
    new EmbedBuilder()
      .setColor(COLOR)
      .setTitle(t('craft.title', lang))
      .setDescription([notice ? `> ${notice}` : null, t('craft.intro', lang)].filter(Boolean).join('\n\n'))
      .addFields(...materialsColumns(owner.id, lang), field(t('craft.recipesHeader', lang), t('craft.recipesHint', lang)))
      .setFooter({ text: t('craft.footer', lang) })
  );
  const file = await shelfFile(crafting.RECIPES.map((r) => r.itemId), lang, t('craft.title', lang).replace(/^\S+\s/, ''));
  if (file) embed.setImage('attachment://oficina.png');
  return { content: '', embeds: [embed], components: [recipeMenu(owner.id, lang)], files: file ? [file] : [], attachments: [], allowedMentions: { parse: [] } };
}

async function buildRecipeView({ owner, source, itemId, notice = null }) {
  const lang = getLanguage(source);
  const recipe = crafting.getRecipe(itemId);
  const entry = getItem(itemId);
  const materials = crafting.getMaterials(owner.id);
  const ready = Object.entries(recipe.materials).every(([key, qty]) => materials[key] >= qty);
  const needs = Object.entries(recipe.materials).map(([key, qty]) => t('craft.recipeLine', lang, { label: crafting.materialLabel(key, lang), need: qty, have: materials[key] }));
  const embed = decorate(
    new EmbedBuilder()
      .setColor(rarityInfo(entry.rarity).color || COLOR)
      .setTitle(t('craft.recipeTitle', lang, { item: itemName(entry, lang) }))
      .addFields(
        ...columns(
          [t('craft.recipeNeeds', lang), needs.join('\n')],
          [t('craft.costName', lang), [t('craft.recipeCoins', lang, { coins: recipe.coins, coin: coinIcon() }), t(ready ? 'craft.recipeReady' : 'craft.recipeMissing', lang)].join('\n')]
        )
      )
      .setFooter({ text: t('craft.footer', lang) })
  );
  if (notice) embed.setDescription(emojify(`> ${notice}`));
  const file = await shelfFile([itemId], lang, itemName(entry, lang));
  if (file) embed.setImage('attachment://oficina.png');
  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`craft:make:${owner.id}:${itemId}`).setLabel(t('craft.btnCraft', lang)).setEmoji(buttonEmoji('🔨')).setStyle(ButtonStyle.Success).setDisabled(!ready),
    new ButtonBuilder().setCustomId(`craft:back:${owner.id}`).setLabel(t('craft.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [recipeMenu(owner.id, lang, itemId), buttons], files: file ? [file] : [], attachments: [], allowedMentions: { parse: [] } };
}

function isCraftInteraction(interaction) {
  return (interaction.isButton?.() || interaction.isStringSelectMenu?.()) && String(interaction.customId || '').startsWith('craft:');
}

async function handleCraftInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, ownerId, arg] = interaction.customId.split(':');
  if (interaction.user.id !== ownerId) {
    return interaction.reply({ content: t('craft.notYours', lang), flags: MessageFlags.Ephemeral });
  }
  const owner = { id: ownerId };
  if (action === 'pick') return interaction.update(await buildRecipeView({ owner, source: interaction, itemId: interaction.values?.[0] }));
  if (action === 'back') return interaction.update(await buildWorkshopView({ owner, source: interaction }));
  if (action === 'make') {
    const result = crafting.craft(ownerId, arg);
    let notice;
    if (result.ok) {
      notice = t('craft.crafted', lang, { item: itemName(getItem(arg), lang) });
    } else if (result.reason === 'materials') {
      notice = t('craft.missing', lang, { list: Object.entries(result.missing).map(([key, qty]) => `${qty} ${crafting.materialLabel(key, lang)}`).join(', ') });
    } else if (result.reason === 'coins') {
      notice = t('craft.coins', lang, { price: result.price, balance: result.balance });
    } else {
      notice = t('craft.error', lang);
    }
    await interaction.update(await buildRecipeView({ owner, source: interaction, itemId: arg, notice }));
    if (result.ok) {
      try {
        await require('../../../services/achievements').notifyNewAchievements(interaction);
      } catch (_) {}
    }
    return null;
  }
  return interaction.reply({ content: t('craft.error', lang), flags: MessageFlags.Ephemeral });
}

/** Primeira mensagem: sem os campos que só existem em edições. */
function forSend(payload) {
  const { attachments, ...rest } = payload;
  return rest;
}

module.exports = {
  name,
  // Parte do Mundo Pyxie: some no modo clássico do servidor (/py-setup)
  mmo: true,
  aliases,
  category: 'economia',
  isCraftInteraction,
  handleCraftInteraction,
  buildWorkshopView,
  buildRecipeView,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Workshop: turn materials from your job into furniture you cannot buy.')
    .setDescriptionLocalizations({ 'pt-BR': 'Oficina: transforme materiais do trabalho em móveis que não vendem na loja.' }),
  async executeSlash({ interaction }) {
    return interaction.editReply(await buildWorkshopView({ owner: interaction.user, source: interaction }));
  },
  async executePrefix({ message }) {
    return message.reply({ ...forSend(await buildWorkshopView({ owner: message.author, source: message })), allowedMentions: { parse: [], repliedUser: false } });
  },
};

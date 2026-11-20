const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const { getEmoji } = require('../../../utils/appEmojis');
const economy = require('../../../services/economy');
const store = require('../homeStore');

/**
 * py!loja: todo o catálogo da Casinha à venda por moedinhas, sem raridade e sem rotação diária.
 * Os itens vão para o cofre (itemVault) e são colocados pelo /py-home.
 */
const name = 'py-loja';
const aliases = ['loja', 'shop', 'py-shop', 'store', 'py-store'];
const PREFIX = 'loja';
const PAGE_SIZE = 25;
const COLOR = '#a855f7';
const KIND_EMOJI = { floor: '🛋️', wall: '🖼️', rug: '🧶', pet: '🐾', wallpaper: '🎨', flooring: '🪵' };

function coinIcon() {
  const formatted = getEmoji('COIN');
  return /^<a?:\w+:\d+>$/.test(formatted || '') ? formatted : '🪙';
}

function isLojaInteraction(interaction) {
  return (interaction.isButton?.() || interaction.isStringSelectMenu?.())
    && String(interaction.customId || '').startsWith(`${PREFIX}:`);
}

/** Tela da loja para um tipo e página. */
function buildStoreView({ userId, source, kind = 'floor', page = 0, notice = null }) {
  const lang = getLanguage(source) === 'en' ? 'en' : 'pt';
  const safeKind = store.STORE_KINDS.includes(kind) ? kind : 'floor';
  const items = store.storeItems(safeKind, lang);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, Number(page) || 0), pages - 1);
  const slice = items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const coin = coinIcon();

  const list = slice.map(({ entry, price }) => `- ${entry.name[lang]} · \`${price}\` ${coin}`).join('\n');
  const lines = [
    notice ? `> ${notice}` : null,
    t('loja.intro', lang),
    `### ${KIND_EMOJI[safeKind]} ${t(`loja.kinds.${safeKind}`, lang)}`,
    list,
  ].filter(Boolean);

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('loja.title', lang))
    .setDescription(lines.join('\n\n'))
    .setFooter({
      text: t('loja.footer', lang, { page: current + 1, pages, balance: economy.getBalance(userId) }),
    });

  const kindMenu = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:k:${userId}`)
    .setPlaceholder(t('loja.pickKind', lang))
    .addOptions(store.STORE_KINDS.map((k) => ({
      label: t(`loja.kinds.${k}`, lang),
      value: k,
      emoji: KIND_EMOJI[k],
      default: k === safeKind,
    })));

  const buyMenu = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:b:${userId}:${safeKind}:${current}`)
    .setPlaceholder(t('loja.pickItem', lang))
    .addOptions(slice.map(({ entry, price }) => ({
      label: String(entry.name[lang]).slice(0, 100),
      description: t('loja.optionPrice', lang, { price }).slice(0, 100),
      value: entry.id,
    })));

  const nav = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PREFIX}:p:${userId}:${safeKind}:${current - 1}`)
      .setLabel(t('loja.prev', lang))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current <= 0),
    new ButtonBuilder()
      .setCustomId(`${PREFIX}:p:${userId}:${safeKind}:${current + 1}`)
      .setLabel(t('loja.next', lang))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current >= pages - 1),
  );

  return {
    content: null,
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(kindMenu),
      new ActionRowBuilder().addComponents(buyMenu),
      nav,
    ],
    allowedMentions: { parse: [] },
  };
}

function reasonText(result, lang) {
  if (result.reason === 'coins') return t('loja.reasons.coins', lang, { price: result.price, balance: result.balance });
  if (result.reason === 'full') return t('loja.reasons.full', lang);
  if (result.reason === 'sold_out') return t('loja.reasons.soldOut', lang);
  return t('loja.reasons.generic', lang);
}

async function handleLojaInteraction(interaction) {
  const [, action, ownerId, kind, page] = String(interaction.customId).split(':');
  const lang = getLanguage(interaction) === 'en' ? 'en' : 'pt';
  if (ownerId !== interaction.user.id) {
    return interaction.reply({ content: t('loja.notYours', lang), flags: MessageFlags.Ephemeral });
  }
  if (action === 'k') {
    return interaction.update(buildStoreView({ userId: ownerId, source: interaction, kind: interaction.values?.[0], page: 0 }));
  }
  if (action === 'p') {
    return interaction.update(buildStoreView({ userId: ownerId, source: interaction, kind, page: Number(page) }));
  }
  if (action === 'b') {
    const itemId = interaction.values?.[0];
    const result = store.buyFromStore(ownerId, itemId);
    const notice = result.ok
      ? t('loja.bought', lang, { item: result.entry.name[lang], price: result.price, balance: result.balance })
      : reasonText(result, lang);
    return interaction.update(buildStoreView({ userId: ownerId, source: interaction, kind, page: Number(page), notice }));
  }
  return null;
}

async function executeSlash({ interaction }) {
  return interaction.editReply(buildStoreView({ userId: interaction.user.id, source: interaction }));
}

async function executePrefix({ message }) {
  return message.reply(buildStoreView({ userId: message.author.id, source: message }));
}

const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription('Pyxie shop: buy any furniture, pet or decoration for your home with coins.')
  .setDescriptionLocalizations({ 'pt-BR': 'Loja da Pyxie: compre qualquer móvel, pet ou decoração da casinha com moedinhas.' });

module.exports = {
  name,
  // Parte do Mundo Pyxie: some no modo clássico do servidor (/py-setup), como a casinha
  mmo: true,
  aliases,
  category: 'economia',
  data,
  PREFIX,
  PAGE_SIZE,
  isLojaInteraction,
  handleLojaInteraction,
  buildStoreView,
  executeSlash,
  executePrefix,
};

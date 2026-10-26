const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const market = require('../../services/market');
const { getItem, itemName, rarityInfo } = require('../home/homeCatalog');

/**
 * Telas do Mercado (/py-market). customId: mkt:<ação>:<quem vê>[:arg]
 *   home/page (vitrine), pick (anúncio), buy, cancel, mine, sell/selitem/mitem (item),
 *   sellmat/selmat/mmat (material). Os modais pedem preço, quantidade e a pessoa (opcional).
 */

const PREFIX = 'mkt';
const PAGE_SIZE = 10;
const COLOR = '#0f766e';

const coinIcon = () => getEmoji('COIN') || '🪙';
const id = (action, viewerId, arg = null) => [PREFIX, action, viewerId, arg].filter((p) => p !== null && p !== undefined).join(':');

function listingName(listing, lang) {
  if (listing.kind === 'material') return market.resourceLabel(listing.material, lang);
  const entry = getItem(listing.itemId);
  const serial = listing.instance?.serial ? ` #${listing.instance.serial}` : '';
  return `${itemName(entry, lang)}${serial}`;
}

function footer(lang) {
  return { text: t('market.footer', lang) };
}

async function shelfFile(itemIds, lang) {
  if (!itemIds.length) return null;
  try {
    const { renderShelf } = require('../home/homeRenderer');
    const png = await renderShelf(itemIds.map((itemId) => ({ itemId })), { lang, columns: Math.min(5, itemIds.length) });
    return new AttachmentBuilder(png, { name: 'mercado.png' });
  } catch (_) {
    return null;
  }
}

function withImage(embed, file) {
  if (file) embed.setImage('attachment://mercado.png');
  return file ? [file] : [];
}

async function buildMarketView({ viewerId, source, page = 0, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  market.expireListings(now);
  const all = market.browse({ viewerId, now });
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  const slice = all.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const lines = slice.map((l) =>
    t('market.line', lang, {
      id: l.id,
      name: listingName(l, lang),
      qty: l.qty,
      price: l.price,
      coin: coinIcon(),
      seller: `<@${l.sellerId}>`,
      private: l.buyerId ? t('market.privateTag', lang) : '',
    })
  );
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('market.title', lang))
    .setDescription(
      [notice ? `> ${notice}` : null, t('market.intro', lang), t('market.shelfHeader', lang), lines.length ? lines.join('\n\n') : t('market.empty', lang), t('market.page', lang, { page: current + 1, pages })]
        .filter(Boolean)
        .join('\n\n')
    )
    .setFooter(footer(lang));
  const files = withImage(embed, await shelfFile(slice.filter((l) => l.kind === 'item').map((l) => l.itemId), lang));

  const components = [];
  if (slice.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(id('pick', viewerId))
          .setPlaceholder(t('market.pick', lang))
          .addOptions(slice.map((l) => ({ label: `${listingName(l, lang)} ×${l.qty}`.slice(0, 100), description: `${l.price} • ${l.id}`, value: l.id })))
      )
    );
  }
  components.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(id('page', viewerId, current - 1)).setLabel(t('market.btnPrev', lang)).setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(current === 0),
      new ButtonBuilder().setCustomId(id('page', viewerId, current + 1)).setLabel(t('market.btnNext', lang)).setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(current >= pages - 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(id('sell', viewerId)).setLabel(t('market.btnSellItem', lang)).setEmoji('💰').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(id('sellmat', viewerId)).setLabel(t('market.btnSellMaterial', lang)).setEmoji('🧺').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(id('mine', viewerId)).setLabel(t('market.btnMine', lang)).setEmoji('📦').setStyle(ButtonStyle.Secondary)
    )
  );
  return { content: '', embeds: [embed], components, files, attachments: [], allowedMentions: { parse: [] } };
}

async function buildListingView({ viewerId, source, listingId, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const listing = market.getListing(listingId);
  if (!listing) return buildMarketView({ viewerId, source, notice: t('market.reasons.missing', lang), now });
  const summary = market.priceSummary(market.keyOf(listing), { now });
  const unit = Math.round((listing.price / listing.qty) * 100) / 100;
  const lines = [
    notice ? `> ${notice}` : null,
    t('market.detailPrice', lang, { price: listing.price, unit, coin: coinIcon() }),
    t('market.detailSeller', lang, { seller: `<@${listing.sellerId}>` }),
    listing.instance?.serial ? t('market.detailSerial', lang, { serial: listing.instance.serial }) : null,
    listing.buyerId ? t('market.detailPrivate', lang, { buyer: `<@${listing.buyerId}>` }) : null,
    t('market.detailExpires', lang, { time: `<t:${Math.floor(listing.expiresAt / 1000)}:R>` }),
    t('market.historyHeader', lang),
    summary.totalSales ? t('market.historyLine', lang, { last: summary.last, avg: summary.avg ?? summary.last, count: summary.count, coin: coinIcon() }) : t('market.historyNone', lang),
  ].filter(Boolean);
  const entry = listing.kind === 'item' ? getItem(listing.itemId) : null;
  const embed = new EmbedBuilder()
    .setColor(entry ? rarityInfo(entry.rarity).color || COLOR : COLOR)
    .setTitle(t('market.detailTitle', lang, { name: listingName(listing, lang) }))
    .setDescription(lines.join('\n\n'))
    .setFooter(footer(lang));
  const files = withImage(embed, entry ? await shelfFile([entry.id], lang) : null);
  const own = listing.sellerId === String(viewerId);
  const row = new ActionRowBuilder().addComponents(
    own
      ? new ButtonBuilder().setCustomId(id('cancel', viewerId, listing.id)).setLabel(t('market.btnCancel', lang)).setEmoji('🗑️').setStyle(ButtonStyle.Danger)
      : new ButtonBuilder().setCustomId(id('buy', viewerId, listing.id)).setLabel(t('market.btnBuy', lang, { price: listing.price })).setEmoji('🛒').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('market.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [row], files, attachments: [], allowedMentions: { parse: [] } };
}

function backRow(viewerId, lang) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('market.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
}

function buildSellItemView({ viewerId, source, notice = null }) {
  const lang = getLanguage(source);
  let available = [];
  try {
    available = require('../home/homeStore').getAvailableInstances(viewerId);
  } catch (_) {
    available = require('../../services/itemVault').listInstances(viewerId);
  }
  const tradable = available.filter((it) => getItem(it.itemId)?.tradable !== false).slice(0, 25);
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('market.sellItemTitle', lang))
    .setDescription([notice ? `> ${notice}` : null, t('market.sellItemBody', lang), tradable.length ? null : t('market.sellItemNone', lang)].filter(Boolean).join('\n\n'))
    .setFooter(footer(lang));
  const components = [];
  if (tradable.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(id('selitem', viewerId))
          .setPlaceholder(t('market.sellItemPick', lang))
          .addOptions(
            tradable.map((it) => {
              const entry = getItem(it.itemId);
              return {
                label: `${itemName(entry, lang)}${it.serial ? ` #${it.serial}` : ''}`.slice(0, 100),
                description: rarityInfo(entry.rarity)[lang === 'en' ? 'en' : 'pt'],
                value: it.uid,
              };
            })
          )
      )
    );
  }
  components.push(backRow(viewerId, lang));
  return { content: '', embeds: [embed], components, files: [], attachments: [], allowedMentions: { parse: [] } };
}

function buildSellMaterialView({ viewerId, source, notice = null }) {
  const lang = getLanguage(source);
  const owned = Object.entries(market.resourceBalances(viewerId)).filter(([, qty]) => qty > 0);
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('market.sellMatTitle', lang))
    .setDescription([notice ? `> ${notice}` : null, t('market.sellMatBody', lang), owned.length ? null : t('market.reasons.not_enough', lang)].filter(Boolean).join('\n\n'))
    .setFooter(footer(lang));
  const components = [];
  if (owned.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(id('selmat', viewerId))
          .setPlaceholder(t('market.sellMatPick', lang))
          .addOptions(owned.map(([key, qty]) => {
            const [emoji, ...words] = market.resourceLabel(key, lang).split(' ');
            return { label: `${words.join(' ')} (${qty})`, value: key, emoji };
          }))
      )
    );
  }
  components.push(backRow(viewerId, lang));
  return { content: '', embeds: [embed], components, files: [], attachments: [], allowedMentions: { parse: [] } };
}

function buildMineView({ viewerId, source, notice = null }) {
  const lang = getLanguage(source);
  const mine = market.myListings(viewerId);
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('market.mineTitle', lang))
    .setDescription(
      [
        notice ? `> ${notice}` : null,
        mine.length
          ? mine.map((l) => t('market.mineLine', lang, { id: l.id, name: listingName(l, lang), qty: l.qty, price: l.price, coin: coinIcon(), time: `<t:${Math.floor(l.expiresAt / 1000)}:R>` })).join('\n\n')
          : t('market.mineEmpty', lang),
      ].filter(Boolean).join('\n\n')
    )
    .setFooter(footer(lang));
  const components = [];
  if (mine.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(id('pick', viewerId))
          .setPlaceholder(t('market.pick', lang))
          .addOptions(mine.map((l) => ({ label: `${listingName(l, lang)} ×${l.qty}`.slice(0, 100), description: `${l.price} • ${l.id}`, value: l.id })))
      )
    );
  }
  components.push(backRow(viewerId, lang));
  return { content: '', embeds: [embed], components, files: [], attachments: [], allowedMentions: { parse: [] } };
}

/** Modal de preço (e quantidade, para materiais). */
function buildSellModal({ viewerId, source, kind, arg }) {
  const lang = getLanguage(source);
  const modal = new ModalBuilder().setCustomId(id(kind === 'material' ? 'mmat' : 'mitem', viewerId, arg)).setTitle(t('market.modalTitle', lang));
  const rows = [];
  if (kind === 'material') {
    rows.push(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('qty').setLabel(t('market.modalQty', lang)).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(6)));
  }
  rows.push(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('price').setLabel(t('market.modalPrice', lang)).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(7)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('buyer').setLabel(t('market.modalBuyer', lang)).setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(40))
  );
  return modal.addComponents(...rows);
}

module.exports = {
  PREFIX,
  listingName,
  buildMarketView,
  buildListingView,
  buildSellItemView,
  buildSellMaterialView,
  buildMineView,
  buildSellModal,
};

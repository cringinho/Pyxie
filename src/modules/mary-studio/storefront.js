/**
 * Vitrine da lojinha no Discord: painel com a lista de pacotes e a compra em dois toques.
 *
 * O painel é publicado pelo painel web (`POST /api/dashboard/guilds/:id/store/panel`), que
 * envia a mensagem com o token do bot. Aqui ficam as peças sem interação — painel, ficha do
 * produto, compra e recibos — para poderem ser testadas sem um cliente do Discord.
 *
 * Quem baixa o estoque é `storeProducts.deliver` (lock + escrita atômica). Nada aqui grava
 * arquivo por conta própria.
 */
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const storeProducts = require('../../services/storeProducts');
const payments = require('../../services/planPayments');
const { t } = require('../../utils/i18n');

const PANEL_ID = 'storefront:pick';
const BACK_ID = 'storefront:back';
const BUY_PREFIX = 'storefront:buy:';
// Uma compra do mesmo pacote pela mesma pessoa em menos de 30 s é clique repetido.
const REPEAT_WINDOW_MS = 30 * 1000;
const MAX_OPTIONS = 25;

const brl = (cents) => `R$ ${(Math.max(0, Number(cents) || 0) / 100).toFixed(2).replace('.', ',')}`;
const robux = (n) => Number(n || 0).toLocaleString('pt-BR');
const clip = (value, max) => String(value ?? '').trim().slice(0, max);

const isBuy = (customId) => String(customId || '').startsWith(BUY_PREFIX);
const productIdOf = (customId) => String(customId || '').slice(BUY_PREFIX.length);

/** Catálogo seguro para o Discord (sem códigos e sem custo). */
function catalog(guildId) {
  return storeProducts.publicCatalog(guildId);
}

function optionFor(product, lang) {
  const stock = product.delivery === 'code' ? Number(product.inStock) || 0 : null;
  const desc =
    stock === null
      ? t('storeOps.selectDescNoStock', lang, { price: brl(product.priceCents), robux: robux(product.robux) })
      : t('storeOps.selectDesc', lang, { price: brl(product.priceCents), robux: robux(product.robux), stock });
  return {
    label: clip(product.name, 100),
    value: product.id,
    description: clip(desc, 100),
  };
}

/** Painel público da lojinha (embed + menu). `available` já removeu o que esgotou. */
function buildPanel(guildId, { lang = 'pt', guildName = '', storeName = '' } = {}) {
  const items = catalog(guildId).filter((p) => p.available);
  const label = clip(storeName || guildName || 'Pyxie', 80);
  const embed = new EmbedBuilder()
    .setColor(0xec4899)
    .setTitle(t('storeOps.panelTitle', lang))
    .setDescription(t(items.length ? 'storeOps.panelIntro' : 'storeOps.panelEmpty', lang))
    .setFooter({ text: t('storeOps.panelFooter', lang, { server: label }) });

  const components = [];
  if (items.length) {
    components.push(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(PANEL_ID)
          .setPlaceholder(t('storeOps.selectPlaceholder', lang))
          .addOptions(items.slice(0, MAX_OPTIONS).map((p) => optionFor(p, lang)))
      )
    );
  }
  return { embeds: [embed], components };
}


/** Ficha do pacote escolhido, com o botão de comprar. */
function buildProduct(guildId, productId, { lang = 'pt' } = {}) {
  const product = storeProducts.getProduct(guildId, productId);
  if (!product || !product.active) return null;
  const stock = product.stock.length;
  const note = product.deliveryNote || product.description || '';
  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle(t('storeOps.productTitle', lang, { product: clip(product.name, 80) }))
    .setDescription(
      t('storeOps.productBody', lang, {
        product: clip(product.name, 80),
        price: brl(product.priceCents),
        note: note || '—',
      })
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${BUY_PREFIX}${product.id}`)
      .setLabel(t('storeOps.buy', lang))
      .setEmoji('🛍️')
      .setStyle(ButtonStyle.Success)
      .setDisabled(product.delivery === 'code' && stock === 0),
    new ButtonBuilder()
      .setCustomId(BACK_ID)
      .setLabel(t('storeOps.back', lang))
      .setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

/**
 * Registra a compra. Devolve o motivo em `reason` quando não sai:
 * `repeat`, `sold_out`, `not_found`, `inactive`, `invalid_buyer` ou `error`.
 */
function purchase(guildId, productId, { buyerId = '', now = Date.now() } = {}) {
  const recent = storeProducts
    .listOrders(guildId, { buyerId, limit: 10 })
    .find((o) => o.productId === String(productId) && now - Number(o.createdAt || 0) < REPEAT_WINDOW_MS);
  if (recent) return { ok: false, reason: 'repeat' };

  const result = storeProducts.deliver(guildId, productId, { buyerId, now });
  if (!result.ok) {
    const reason = ['out_of_stock', 'code'].includes(result.reason) ? 'sold_out' : result.reason || 'error';
    return { ok: false, reason };
  }
  return { ok: true, order: result.order, stockCount: result.stockCount, lowStock: result.lowStock === true };
}

/** Recibo para quem comprou (o código aparece uma única vez). */
function receipt(order, { lang = 'pt' } = {}) {
  const embed = new EmbedBuilder().setColor(0x10b981).setTitle(t('storeOps.receiptTitle', lang));
  if (order.delivery === 'manual') {
    embed.setDescription(
      t('storeOps.receiptPending', lang, { order: order.id, product: clip(order.productName, 80) })
    );
  } else if (order.delivery === 'message') {
    embed.setDescription(t('storeOps.receiptLink', lang, { link: order.payload, order: order.id }));
  } else {
    embed.setDescription(t('storeOps.receiptCode', lang, { code: order.payload, order: order.id }));
  }
  return embed;
}

/** Aviso para o dono da loja: pedido manual precisa de confirmação no painel. */
function ownerNotice(order, { lang = 'pt', guildId = '', buyer = '' } = {}) {
  const link = `${payments.publicUrl()}/dashboard#/guild/${guildId || order.guildId}/maryStore`;
  return new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(t('storeOps.ownerTitle', lang))
    .setDescription(
      t('storeOps.ownerBody', lang, {
        product: clip(order.productName, 80),
        buyer: clip(buyer || order.buyerId, 80),
        price: brl(order.priceCents),
        order: order.id,
        link,
      })
    )
    .setTimestamp();
}

/** Embed de estoque baixo (alerta da DM ao dono). */
function lowStockEmbed(guildId, { lang = 'pt', guildName = '', storeName = '' } = {}) {
  const report = storeProducts.stockReport(guildId);
  if (!report.needsAttention) return null;
  const lines = report.low
    .map((p) => t('storeOps.lowLine', lang, { product: clip(p.name, 80), stock: p.stockCount, min: p.minStock }))
    .join('\n\n');
  const embed = new EmbedBuilder()
    .setColor(0xef4444)
    .setTitle(t('storeOps.lowTitle', lang))
    .setDescription(`${t('storeOps.lowIntro', lang)}\n\n${lines}`)
    .setFooter({ text: t('storeOps.lowFooter', lang, { server: clip(storeName || guildName || 'Pyxie', 80) }) })
    .setTimestamp();
  return { report, embed };
}

module.exports = {
  PANEL_ID,
  BACK_ID,
  BUY_PREFIX,
  REPEAT_WINDOW_MS,
  isBuy,
  productIdOf,
  catalog,
  buildPanel,
  buildProduct,
  purchase,
  receipt,
  ownerNotice,
  lowStockEmbed,
  brl,
};


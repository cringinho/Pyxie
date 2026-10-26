const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const market = require('../../../services/market');
const views = require('../marketViews');

const name = 'py-market';
const aliases = ['market', 'mercado', 'py-mercado', 'feira', 'py-feira', 'trade', 'py-trade', 'negociar', 'py-negociar'];

function isMarketInteraction(interaction) {
  return (interaction.isButton?.() || interaction.isStringSelectMenu?.() || interaction.isModalSubmit?.())
    && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

/** Pessoa da oferta particular: menção <@id> ou o ID puro. */
function parseBuyer(text) {
  const match = /(\d{17,20})/.exec(String(text || ''));
  return match ? match[1] : null;
}

function reasonText(result, lang) {
  return t(`market.reasons.${result.reason}`, lang, { price: result.price ?? '', balance: result.balance ?? '' });
}

/** Avisa quem vendeu por DM (sem DM aberta, a pessoa vê o dinheiro na carteira). */
async function notifySeller(client, result, lang) {
  try {
    const user = await client.users.fetch(result.listing.sellerId);
    await user.send({
      content: t('market.soldDm', lang, { name: views.listingName(result.listing, lang), qty: result.listing.qty, price: result.listing.price, gets: result.sellerGets, tax: result.tax }),
      allowedMentions: { parse: [] },
    });
  } catch (_) {}
}

async function handleMarketInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, viewerId, arg] = interaction.customId.split(':');
  if (interaction.user.id !== viewerId) {
    return interaction.reply({ content: t('market.notYours', lang), flags: MessageFlags.Ephemeral });
  }
  const base = { viewerId, source: interaction };
  const show = async (payload) => (interaction.isModalSubmit?.() && !interaction.isFromMessage?.() ? interaction.reply({ ...payload, flags: MessageFlags.Ephemeral }) : interaction.update(await payload));

  switch (action) {
    case 'home':
      return show(await views.buildMarketView(base));
    case 'page':
      return show(await views.buildMarketView({ ...base, page: Number(arg) || 0 }));
    case 'pick':
      return show(await views.buildListingView({ ...base, listingId: interaction.values?.[0] }));
    case 'buy': {
      const result = market.buy(viewerId, arg);
      if (!result.ok) return show(await views.buildListingView({ ...base, listingId: arg, notice: reasonText(result, lang) }));
      await show(await views.buildMarketView({ ...base, notice: t('market.bought', lang, { name: views.listingName(result.listing, lang), price: result.listing.price }) }));
      await notifySeller(interaction.client, result, lang);
      try {
        await require('../../../services/achievements').notifyNewAchievements(interaction);
      } catch (_) {}
      return null;
    }
    case 'cancel': {
      const result = market.cancel(viewerId, arg);
      return show(views.buildMineView({ ...base, notice: result.ok ? t('market.cancelled', lang) : reasonText(result, lang) }));
    }
    case 'mine':
      return show(views.buildMineView(base));
    case 'sell':
      return show(views.buildSellItemView(base));
    case 'sellmat':
      return show(views.buildSellMaterialView(base));
    case 'selitem':
      return interaction.showModal(views.buildSellModal({ ...base, kind: 'item', arg: interaction.values?.[0] }));
    case 'selmat':
      return interaction.showModal(views.buildSellModal({ ...base, kind: 'material', arg: interaction.values?.[0] }));
    case 'mitem':
    case 'mmat': {
      const price = interaction.fields.getTextInputValue('price');
      const buyerId = parseBuyer(interaction.fields.getTextInputValue('buyer'));
      const result = action === 'mitem'
        ? market.listItem(viewerId, arg, price, { buyerId })
        : market.listMaterial(viewerId, arg, interaction.fields.getTextInputValue('qty'), price, { buyerId });
      if (!result.ok) {
        const view = action === 'mitem' ? views.buildSellItemView({ ...base, notice: reasonText(result, lang) }) : views.buildSellMaterialView({ ...base, notice: reasonText(result, lang) });
        return show(view);
      }
      return show(await views.buildMarketView({ ...base, notice: t('market.listed', lang, { id: result.listing.id, price: result.listing.price }) }));
    }
    default:
      return interaction.reply({ content: t('market.reasons.save', lang), flags: MessageFlags.Ephemeral });
  }
}

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
  // A vitrine é de cada pessoa: o index.js abre o deferReply em modo privado
  ephemeral: true,
  isMarketInteraction,
  handleMarketInteraction,
  parseBuyer,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Player market: buy and sell items and materials safely, with price history.')
    .setDescriptionLocalizations({ 'pt-BR': 'Mercado entre jogadores: compre e venda itens e materiais com segurança e histórico de preços.' }),
  async executeSlash({ interaction }) {
    return interaction.editReply(await views.buildMarketView({ viewerId: interaction.user.id, source: interaction }));
  },
  async executePrefix({ message }) {
    return message.reply({ ...forSend(await views.buildMarketView({ viewerId: message.author.id, source: message })), allowedMentions: { parse: [], repliedUser: false } });
  },
};

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const festival = require('../../../services/festival');
const views = require('../festivalViews');

const name = 'py-festival';
const aliases = ['festival', 'festa', 'py-festa', 'temporada', 'py-temporada', 'season', 'py-season', 'fagulhas', 'py-fagulhas', 'sparks', 'py-sparks'];

function isFestivalInteraction(interaction) {
  return interaction.isButton?.() && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

function reasonText(result, lang) {
  return t(`festival.reasons.${result.reason}`, lang, {
    price: result.price ?? '',
    balance: result.balance ?? '',
    limit: result.limit ?? '',
    currency: festival.currencyLabel(lang, 2),
  });
}

async function handleFestivalInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, viewerId, arg] = interaction.customId.split(':');
  if (interaction.user.id !== viewerId) {
    return interaction.reply({ content: t('festival.notYours', lang), flags: MessageFlags.Ephemeral });
  }
  const base = { viewerId, source: interaction };
  if (action === 'home') return interaction.update(await views.buildFestivalView(base));
  if (action === 'odds') {
    const view = views.buildOddsView(base);
    return interaction.update(view || (await views.buildFestivalView(base)));
  }
  if (action === 'open') {
    const result = festival.openBox(viewerId, arg);
    if (!result.ok) return interaction.update(await views.buildFestivalView({ ...base, notice: reasonText(result, lang) }));
    await interaction.update(await views.buildPrizeView({ ...base, result }));
    try {
      await require('../../../services/achievements').notifyNewAchievements(interaction);
    } catch (_) {}
    return null;
  }
  return interaction.reply({ content: t('festival.reasons.save', lang), flags: MessageFlags.Ephemeral });
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
  isFestivalInteraction,
  handleFestivalInteraction,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Seasonal festival: Sparks, themed boxes and limited items.')
    .setDescriptionLocalizations({ 'pt-BR': 'Festival da temporada: Fagulhas, caixas temáticas e itens por tempo limitado.' }),
  async executeSlash({ interaction }) {
    return interaction.editReply(await views.buildFestivalView({ viewerId: interaction.user.id, source: interaction }));
  },
  async executePrefix({ message }) {
    return message.reply({ ...forSend(await views.buildFestivalView({ viewerId: message.author.id, source: message })), allowedMentions: { parse: [], repliedUser: false } });
  },
};

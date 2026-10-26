const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { columns, decorate, field, section, buttonEmoji } = require('../../utils/embedLayout');
const festival = require('../../services/festival');
const { itemName, rarityInfo } = require('../home/homeCatalog');
const { renderShelf } = require('../home/homeRenderer');

/**
 * Telas do Festival (/py-festival). customId: fest:<ação>:<quem vê>[:arg]
 * home = vitrine da temporada · open = abrir caixa (sparks|coins) · odds = chances e prêmios
 */

const PREFIX = 'fest';
const COLOR = '#a855f7';
const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

const coinIcon = () => getEmoji('COIN') || '🪙';
const id = (action, viewerId, arg = null) => [PREFIX, action, viewerId, arg].filter((p) => p !== null && p !== undefined).join(':');
const ts = (ms, style) => `<t:${Math.floor(ms / 1000)}:${style}>`;

function footer(lang) {
  return { text: t('festival.footer', lang) };
}

async function shelfFile(itemIds, lang, title) {
  if (!itemIds.length) return null;
  try {
    const png = await renderShelf(itemIds.map((itemId) => ({ itemId })), { title, lang, columns: Math.min(5, itemIds.length) });
    return new AttachmentBuilder(png, { name: 'festival.png' });
  } catch (_) {
    return null;
  }
}

/** Destaques da vitrine: os itens mais raros da temporada primeiro (até 10). */
function highlights(seasonId) {
  return festival
    .seasonPool(seasonId)
    .slice()
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
    .slice(0, 10)
    .map((entry) => entry.id);
}

function boxButtons(viewerId, lang, status) {
  const { sparks, coins } = festival.BOXES;
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(id('open', viewerId, 'sparks'))
      .setLabel(t('festival.btnSparks', lang, { price: sparks.price.sparks }))
      .setEmoji(buttonEmoji(festival.CURRENCY.emoji))
      .setStyle(ButtonStyle.Success)
      .setDisabled(status.sparks < sparks.price.sparks),
    new ButtonBuilder()
      .setCustomId(id('open', viewerId, 'coins'))
      .setLabel(t('festival.btnCoins', lang, { price: coins.price.coins }))
      .setEmoji(buttonEmoji('🧰'))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(status.coinBoxesLeft <= 0),
    new ButtonBuilder().setCustomId(id('odds', viewerId)).setLabel(t('festival.btnOdds', lang)).setEmoji(buttonEmoji('📜')).setStyle(ButtonStyle.Secondary)
  );
}

function walletLine(status, lang) {
  return t('festival.wallet', lang, { sparks: status.sparks, currency: festival.currencyLabel(lang, status.sparks) });
}

async function buildFestivalView({ viewerId, source, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = festival.getBoxStatus(viewerId, now);
  const season = status.season;

  if (!season) {
    const next = festival.getNextSeason(now);
    const embed = decorate(
      new EmbedBuilder()
        .setColor(COLOR)
        .setTitle(t('festival.closedTitle', lang))
        .setDescription([notice ? `> ${notice}` : null, t('festival.closedBody', lang), walletLine(status, lang)].filter(Boolean).join('\n\n'))
        .addFields(
          ...(next ? [field(...section(t('festival.next', lang, { season: festival.seasonName(next, lang), date: ts(next.start, 'D'), relative: ts(next.start, 'R') })))] : []),
          field(t('festival.howHeader', lang), t('festival.howMarket', lang))
        )
        .setFooter(footer(lang))
    );
    return { content: '', embeds: [embed], components: [], files: [], attachments: [], allowedMentions: { parse: [] } };
  }

  const { sparks, coins } = festival.BOXES;
  const key = lang === 'en' ? 'en' : 'pt';
  const lines = [
    notice ? `> ${notice}` : null,
    t(`festival.intro.${season.id}`, lang),
    t('festival.ends', lang, { date: ts(season.end, 'f'), relative: ts(season.end, 'R') }),
    walletLine(status, lang),
  ];
  const embed = decorate(
    new EmbedBuilder()
      .setColor(season.color || COLOR)
      .setTitle(t('festival.title', lang, { season: festival.seasonName(season, lang) }))
      .setDescription(lines.filter(Boolean).join('\n\n'))
      .addFields(
        ...columns(
          [t('festival.sparksBoxName', lang), t('festival.sparksBoxValue', lang, { price: sparks.price.sparks, currency: festival.currencyLabel(lang, 2), left: status.pitySparksLeft, rarity: rarityInfo(sparks.pity.rarity)[key] })],
          [t('festival.coinsBoxName', lang), t('festival.coinsBoxValue', lang, { price: coins.price.coins, coin: coinIcon(), left: status.pityCoinsLeft, rarity: rarityInfo(coins.pity.rarity)[key], today: status.coinBoxesLeft, limit: coins.dailyLimit })]
        ),
        field(
          t('festival.howHeader', lang),
          [
            t('festival.howDungeon', lang, { chance: Math.round(festival.RUN_CHANCE * 100) }),
            t('festival.howWork', lang, { chance: Math.round(festival.WORK_CHANCE * 100) }),
            t('festival.howMarket', lang),
          ].join('\n')
        )
      )
      .setFooter(footer(lang))
  );
  const file = await shelfFile(highlights(season.id), lang, t('festival.shelfTitle', lang));
  if (file) embed.setImage('attachment://festival.png');
  return { content: '', embeds: [embed], components: [boxButtons(viewerId, lang, status)], files: file ? [file] : [], attachments: [], allowedMentions: { parse: [] } };
}

/** Chances públicas e lista completa de prêmios da temporada (transparência das caixas). */
function buildOddsView({ viewerId, source, now = Date.now() }) {
  const lang = getLanguage(source);
  const season = festival.getActiveSeason(now);
  if (!season) return null;
  const pool = festival.seasonPool(season.id);
  const oddsLine = (kind) =>
    Object.entries(festival.effectiveOdds(kind, season.id))
      .map(([rarity, pct]) => `${rarityInfo(rarity)[lang === 'en' ? 'en' : 'pt']} \`${pct}%\``)
      .join(' • ');
  const prizes = RARITY_ORDER.filter((rarity) => pool.some((entry) => entry.rarity === rarity)).map((rarity) =>
    t('festival.prizeLine', lang, {
      rarity: rarityInfo(rarity)[lang === 'en' ? 'en' : 'pt'],
      items: pool.filter((entry) => entry.rarity === rarity).map((entry) => itemName(entry, lang)).join(', '),
    })
  );
  const { sparks, coins } = festival.BOXES;
  const embed = decorate(
    new EmbedBuilder()
      .setColor(season.color || COLOR)
      .setTitle(t('festival.oddsTitle', lang))
      .setDescription(t('festival.oddsNote', lang))
      .addFields(
        ...columns(
          section(t('festival.oddsSparks', lang, { odds: oddsLine('sparks').replaceAll(' • ', '\n'), every: sparks.pity.every, rarity: rarityInfo(sparks.pity.rarity)[lang === 'en' ? 'en' : 'pt'] })),
          section(t('festival.oddsCoins', lang, { odds: oddsLine('coins').replaceAll(' • ', '\n'), every: coins.pity.every, rarity: rarityInfo(coins.pity.rarity)[lang === 'en' ? 'en' : 'pt'] }))
        ),
        field(t('festival.prizesHeader', lang), prizes.join('\n\n'))
      )
      .setFooter(footer(lang))
  );
  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('festival.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [back], files: [], attachments: [], allowedMentions: { parse: [] } };
}

/** Resultado de uma caixa aberta. */
async function buildPrizeView({ viewerId, source, result }) {
  const lang = getLanguage(source);
  const entry = result.item;
  const rarity = rarityInfo(entry.rarity);
  const serial = result.instance?.serial ? ` \`#${result.instance.serial}\`` : '';
  const status = result.status;
  const embed = decorate(
    new EmbedBuilder()
      .setColor(rarity.color || COLOR)
      .setTitle(t('festival.prizeTitle', lang))
      .setDescription(
        [
          t('festival.prize', lang, { item: itemName(entry, lang), serial, rarity: rarity[lang === 'en' ? 'en' : 'pt'] }),
          result.pityHit ? t('festival.pityHit', lang) : null,
          entry.kind === 'pet' ? t('festival.prizePet', lang) : t('festival.prizeItem', lang),
          walletLine(status, lang),
        ].filter(Boolean).join('\n\n')
      )
      .setFooter(footer(lang))
  );
  const file = await shelfFile([entry.id], lang, itemName(entry, lang));
  if (file) embed.setImage('attachment://festival.png');
  const rows = [boxButtons(viewerId, lang, status)];
  rows[0].addComponents(new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('festival.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary));
  return { content: '', embeds: [embed], components: rows, files: file ? [file] : [], attachments: [], allowedMentions: { parse: [] } };
}

module.exports = {
  PREFIX,
  buildFestivalView,
  buildOddsView,
  buildPrizeView,
};

const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const battlePass = require('../../services/battlePass');
const payments = require('../../services/passPayments');
const { getItem, itemName, rarityInfo } = require('../home/homeCatalog');
const { renderShelf } = require('../home/homeRenderer');

/**
 * Telas do Passe da Pyxie (/py-pass). customId: bp:<ação>:<quem vê>[:arg]
 * home = resumo · page = níveis (1-10, 11-20…) · claim = resgatar tudo
 */

const PREFIX = 'bp';
const COLOR = '#7c3aed';
const PAGE_SIZE = 10;
const BAR = 12;

const coinIcon = () => getEmoji('COIN') || '🪙';
const beanIcon = () => getEmoji('MAGIC_BEAN') || '🌱';
const id = (action, viewerId, arg = null) => [PREFIX, action, viewerId, arg].filter((p) => p !== null && p !== undefined).join(':');
const ts = (ms, style) => `<t:${Math.floor(ms / 1000)}:${style}>`;

function footer(lang) {
  return { text: t('pass.footer', lang) };
}

/** Texto curto de uma recompensa. */
function rewardLabel(reward, lang) {
  switch (reward.type) {
    case 'coins':
      return `\`${reward.qty}\` ${coinIcon()}`;
    case 'beans':
      return `\`${reward.qty}\` ${beanIcon()}`;
    case 'echoes':
      return t('pass.rewards.echoes', lang, { qty: reward.qty });
    case 'material':
      return `\`${reward.qty}\` ${require('../../services/crafting').materialLabel(reward.material, lang)}`;
    case 'sparks':
      return `\`${reward.qty}\` ${require('../../services/festival').currencyLabel(lang, reward.qty)}`;
    case 'item':
    case 'pet': {
      const entry = getItem(reward.itemId);
      const label = `**${itemName(entry, lang)}** (${rarityInfo(entry?.rarity)[lang === 'en' ? 'en' : 'pt']})`;
      if (!reward.title) return label;
      const title = require('../../services/economy').getTitleDefinition(reward.title, lang);
      return t('pass.rewards.petAndTitle', lang, { pet: label, title: title ? title.display : reward.title });
    }
    default:
      return reward.type;
  }
}

function progressBar(status) {
  const filled = status.level >= battlePass.MAX_LEVEL ? BAR : Math.round((status.intoLevel / battlePass.XP_PER_LEVEL) * BAR);
  return `${'▰'.repeat(filled)}${'▱'.repeat(BAR - filled)}`;
}

function monthLabel(month, lang) {
  const theme = battlePass.themeFor(month);
  return `${theme.months[lang === 'en' ? 'en' : 'pt']} ${month.slice(0, 4)}`;
}

async function shelfFile(month, lang) {
  const track = battlePass.getTrack(month);
  const finale = track[track.length - 1];
  const ids = [finale.premium.itemId, finale.free.itemId, ...track.filter((row) => row.level % 10 === 0 && row.level < 50).map((row) => row.free.itemId)];
  try {
    const png = await renderShelf(ids.map((itemId) => ({ itemId })), { title: t('pass.shelfTitle', lang, { month: monthLabel(month, lang) }), lang, columns: Math.min(6, ids.length) });
    return new AttachmentBuilder(png, { name: 'passe.png' });
  } catch (_) {
    return null;
  }
}

function claimButton(viewerId, lang, status) {
  return new ButtonBuilder()
    .setCustomId(id('claim', viewerId))
    .setLabel(t('pass.btnClaim', lang, { count: status.claimable }))
    .setEmoji('🎁')
    .setStyle(ButtonStyle.Success)
    .setDisabled(status.claimable <= 0);
}

function premiumButton(viewerId, lang, status) {
  if (status.premium) return null;
  return new ButtonBuilder().setLabel(t('pass.btnPremium', lang)).setEmoji('💎').setStyle(ButtonStyle.Link).setURL(payments.passUrl(viewerId, { lang }));
}

async function buildPassView({ viewerId, source, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = battlePass.getStatus(viewerId, now);
  const next = status.track.find((row) => row.level > status.level) || status.track[status.track.length - 1];
  const finale = status.track[status.track.length - 1];
  const lines = [
    notice ? `> ${notice}` : null,
    t('pass.intro', lang, { month: monthLabel(status.month, lang), date: ts(status.endsAt, 'f'), relative: ts(status.endsAt, 'R') }),
    t('pass.levelLine', lang, { level: status.level, max: battlePass.MAX_LEVEL, bar: progressBar(status), into: status.intoLevel, need: battlePass.XP_PER_LEVEL }),
    status.premium ? t('pass.premiumOn', lang) : t('pass.premiumOff', lang, { brl: battlePass.PRICE.BRL, usd: battlePass.PRICE.USD }),
    t('pass.nextHeader', lang, { level: next.level }),
    t('pass.freeLine', lang, { reward: rewardLabel(next.free, lang) }),
    t('pass.premiumLine', lang, { reward: rewardLabel(next.premium, lang), lock: status.premium ? '' : ' 🔒' }),
    t('pass.finaleHeader', lang),
    t('pass.premiumLine', lang, { reward: rewardLabel(finale.premium, lang), lock: status.premium ? '' : ' 🔒' }),
    t('pass.xpHeader', lang),
    t('pass.xpSources', lang, { ...battlePass.XP_SOURCES }),
  ];
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('pass.title', lang, { month: monthLabel(status.month, lang) }))
    .setDescription(lines.filter(Boolean).join('\n\n'))
    .setFooter(footer(lang));
  const file = await shelfFile(status.month, lang);
  if (file) embed.setImage('attachment://passe.png');
  const row = new ActionRowBuilder().addComponents(
    claimButton(viewerId, lang, status),
    new ButtonBuilder().setCustomId(id('page', viewerId, Math.floor(Math.max(0, status.level - 1) / PAGE_SIZE))).setLabel(t('pass.btnLevels', lang)).setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );
  const premium = premiumButton(viewerId, lang, status);
  if (premium) row.addComponents(premium);
  return { content: '', embeds: [embed], components: [row], files: file ? [file] : [], attachments: [], allowedMentions: { parse: [] } };
}

/** Lista de 10 níveis com as duas trilhas e o que já foi resgatado. */
function buildLevelsView({ viewerId, source, page = 0, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = battlePass.getStatus(viewerId, now);
  const pages = Math.ceil(battlePass.MAX_LEVEL / PAGE_SIZE);
  const current = Math.max(0, Math.min(pages - 1, Number(page) || 0));
  const mark = (row, trackName) => {
    if (row.level > status.level) return '▫️';
    if (trackName === 'premium' && !status.premium) return '🔒';
    return status.claimed[trackName].includes(row.level) ? '✅' : '🎁';
  };
  const rows = status.track.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE).map((row) =>
    t('pass.levelRow', lang, {
      level: row.level,
      free: rewardLabel(row.free, lang),
      freeMark: mark(row, 'free'),
      premium: rewardLabel(row.premium, lang),
      premiumMark: mark(row, 'premium'),
    })
  );
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('pass.levelsTitle', lang, { from: current * PAGE_SIZE + 1, to: (current + 1) * PAGE_SIZE }))
    .setDescription([t('pass.legend', lang), ...rows].join('\n\n'))
    .setFooter(footer(lang));
  const nav = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(id('page', viewerId, current - 1)).setEmoji('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(current === 0),
    new ButtonBuilder().setCustomId(id('page', viewerId, current + 1)).setEmoji('➡️').setStyle(ButtonStyle.Secondary).setDisabled(current >= pages - 1),
    claimButton(viewerId, lang, status),
    new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('pass.btnBack', lang)).setEmoji('↩️').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [nav], files: [], attachments: [], allowedMentions: { parse: [] } };
}

/** Texto do resgate: o que chegou e se algo ficou para depois. */
function claimNotice(result, lang) {
  if (!result.delivered.length) return t(result.blocked ? 'pass.claimFull' : 'pass.claimNothing', lang);
  const items = result.delivered.map((d) => rewardLabel(d.reward, lang));
  const shown = items.slice(0, 8).join(' • ');
  const more = items.length > 8 ? t('pass.claimMore', lang, { count: items.length - 8 }) : '';
  return [t('pass.claimed', lang, { list: `${shown}${more}` }), result.blocked ? t('pass.claimFull', lang) : null].filter(Boolean).join('\n> ');
}

module.exports = {
  PREFIX,
  rewardLabel,
  claimNotice,
  buildPassView,
  buildLevelsView,
};

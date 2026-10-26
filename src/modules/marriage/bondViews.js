const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const bond = require('./coupleBond');
const { getItem, itemName } = require('../home/homeCatalog');

/**
 * Tela da Força do Laço (/py-marriage bond). customId: bond:<ação>:<quem vê>[:gesto]
 * home = atualizar · g = fazer o gesto do dia
 */

const PREFIX = 'bond';
const COLOR = '#e60067';
const BAR = 10;

const id = (action, viewerId, arg = null) => [PREFIX, action, viewerId, arg].filter((p) => p !== null && p !== undefined).join(':');
const ts = (ms, style) => `<t:${Math.floor(ms / 1000)}:${style}>`;

function bar(value, max) {
  const filled = max > 0 ? Math.max(0, Math.min(BAR, Math.round((value / max) * BAR))) : BAR;
  return `${'💗'.repeat(filled)}${'🤍'.repeat(BAR - filled)}`;
}

function gestureLabel(gesture, lang) {
  return `${bond.GESTURES[gesture].emoji} ${t(`bond.gestures.${gesture}.label`, lang)}`;
}

/** Texto do resultado de um gesto (mostrado no topo da tela). */
function gestureNotice(result, lang) {
  if (!result.ok) return t(`bond.reasons.${result.reason}`, lang, { gesture: result.gesture ? gestureLabel(result.gesture, lang) : '' });
  const lines = [t(`bond.gestures.${result.gesture}.done`, lang, { spouse: result.spouseId ? `<@${result.spouseId}>` : '' })];
  if (result.synced) lines.push(t('bond.synced', lang, { streak: result.streak }));
  for (const level of result.levelUps || []) lines.push(t('bond.levelUp', lang, { level, name: bond.LEVEL_NAMES[level - 1][lang === 'en' ? 'en' : 'pt'] }));
  if (result.weekly?.completed) lines.push(t('bond.weekCompleted', lang, { item: itemName(getItem(result.weekly.keepsake), lang) }));
  return lines.join('\n> ');
}

function buildBondView({ viewerId, source, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = bond.getBondStatus(viewerId, now);
  if (!status) {
    const embed = new EmbedBuilder().setColor(COLOR).setTitle(t('bond.title', lang)).setDescription(t('bond.reasons.not_married', lang)).setFooter({ text: t('bond.footer', lang) });
    return { content: '', embeds: [embed], components: [], allowedMentions: { parse: [] } };
  }
  const spouse = status.spouseId ? `<@${status.spouseId}>` : '???';
  const key = lang === 'en' ? 'en' : 'pt';
  const week = status.week;
  const keepsake = itemName(getItem(week.keepsake), lang);
  const lines = [
    notice ? `> ${notice}` : null,
    status.days !== null ? t('bond.together', lang, { spouse, days: status.days }) : t('bond.togetherUnknown', lang, { spouse }),
    t('bond.levelHeader', lang, { level: status.level, name: status.levelName[key] }),
    status.nextLevelXp !== null
      ? t('bond.levelBar', lang, { bar: bar(status.xp - status.levelStart, status.nextLevelXp - status.levelStart), into: status.xp - status.levelStart, need: status.nextLevelXp - status.levelStart })
      : t('bond.levelMax', lang, { bar: bar(1, 1) }),
    t('bond.love', lang, { love: status.love }),
    t('bond.streak', lang, { streak: status.streak, best: status.bestStreak }),
    t('bond.todayHeader', lang),
    t('bond.me', lang, { gesture: status.mine ? gestureLabel(status.mine, lang) : t('bond.pending', lang) }),
    t('bond.spouse', lang, { spouse, gesture: status.theirs ? gestureLabel(status.theirs, lang) : t('bond.pending', lang) }),
    t('bond.syncHint', lang, { xp: bond.SYNC_XP }),
    t('bond.weekHeader', lang),
    `> ${t(`bond.quests.${week.quest}`, lang, { target: week.target })}`,
    t('bond.weekBar', lang, { bar: bar(week.progress, week.target), progress: week.progress, target: week.target, relative: ts(week.endsAt, 'R') }),
    week.done ? t('bond.weekDone', lang, { item: keepsake }) : t('bond.weekReward', lang, { xp: bond.WEEKLY_XP, item: keepsake }),
  ];
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('bond.title', lang))
    .setDescription(lines.filter(Boolean).join('\n\n'))
    .setFooter({ text: t('bond.footer', lang) })
    .setTimestamp(now);
  const row = new ActionRowBuilder().addComponents(
    ...Object.keys(bond.GESTURES).map((gesture) =>
      new ButtonBuilder()
        .setCustomId(id('g', viewerId, gesture))
        .setLabel(t(`bond.gestures.${gesture}.label`, lang))
        .setEmoji(bond.GESTURES[gesture].emoji)
        .setStyle(status.mine === gesture ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(Boolean(status.mine))
    ),
    new ButtonBuilder().setCustomId(id('home', viewerId)).setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [row], allowedMentions: { parse: [] } };
}

/** Botão do painel do casamento que abre a Força do Laço. */
function bondButtonRow(viewerId, lang) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(id('home', viewerId)).setLabel(t('bond.btnOpen', lang)).setEmoji('💞').setStyle(ButtonStyle.Primary)
  );
}

function isBondInteraction(interaction) {
  return interaction.isButton?.() && String(interaction.customId || '').startsWith(`${PREFIX}:`);
}

async function handleBondInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, viewerId, arg] = interaction.customId.split(':');
  if (interaction.user.id !== viewerId) {
    return interaction.reply({ content: t('bond.reasons.not_yours', lang), flags: 64 });
  }
  if (action === 'g') {
    const result = bond.doGesture(viewerId, arg);
    await interaction.update(buildBondView({ viewerId, source: interaction, notice: gestureNotice(result, lang) }));
    if (result.ok && result.levelUps?.length) {
      try {
        await require('../../services/achievements').notifyNewAchievements(interaction);
      } catch (_) {}
    }
    return null;
  }
  return interaction.update(buildBondView({ viewerId, source: interaction }));
}

module.exports = {
  PREFIX,
  gestureNotice,
  buildBondView,
  bondButtonRow,
  isBondInteraction,
  handleBondInteraction,
};

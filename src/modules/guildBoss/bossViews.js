const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { ENEMIES, localized } = require('../dungeon/dungeonData');
const { BOSSES, STANCES, INTENTS } = require('./bossData');
const store = require('./bossStore');

/**
 * Painel do chefe semanal (/py-boss). A mensagem é pública e serve o servidor inteiro: o que é
 * de cada pessoa (ataques restantes, recompensa) vai em resposta privada.
 * customId: boss:hit:<postura> · boss:view
 */

const PREFIX = 'boss';
const BAR_SIZE = 12;

function bossEnemy(bossId) {
  const boss = BOSSES.find((b) => b.id === bossId) || BOSSES[0];
  return ENEMIES[boss.enemy];
}

function bossName(bossId, lang) {
  return localized(bossEnemy(bossId)?.name, lang) || bossId;
}

/** URL da arte do chefe (Application Emoji do bot na CDN), para a miniatura do embed. */
function bossImage(bossId) {
  const formatted = getEmoji(bossEnemy(bossId)?.sprite || '');
  const match = /^<(a?):\w+:(\d+)>$/.exec(formatted || '');
  return match ? `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] ? 'gif' : 'png'}` : null;
}

function hpBar(hp, max) {
  const filled = max > 0 ? Math.round((hp / max) * BAR_SIZE) : 0;
  return '▰'.repeat(filled) + '▱'.repeat(BAR_SIZE - filled);
}

function coinIcon() {
  return getEmoji('COIN') || '🪙';
}

function buildBossView({ guildId, userId, source, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = store.getStatus(guildId, userId, now);
  const intent = INTENTS[status.intent];
  const lines = [];
  if (notice) lines.push(`> ${notice}`);
  lines.push(t('boss.intro', lang), t('boss.hpLine', lang, { bar: hpBar(status.hp, status.maxHp), hp: status.hp, max: status.maxHp }));
  if (status.fighters) lines.push(t('boss.fighters', lang, { count: status.fighters }));

  if (status.defeatedAt) {
    const first = status.rewards?.[0];
    lines.push(
      t('boss.defeatedHeader', lang),
      t('boss.defeatedBy', lang, { user: `<@${status.killerId}>` }),
      t('boss.rewardLine', lang, { coins: store.SETTINGS.participantCoins, coin: coinIcon(), echoes: store.SETTINGS.participantEchoes }),
      t('boss.podiumLine', lang)
    );
    if (first) lines.push(t('boss.rankLine', lang, { pos: 1, user: `<@${first.userId}>`, damage: first.damage }));
  } else {
    lines.push(t('boss.intentHeader', lang, { emoji: intent.emoji, intent: intent.name[lang] }), `> *${intent.hint[lang]}*`);
  }

  lines.push(t('boss.rankHeader', lang));
  const top = status.ranking.slice(0, 5).map((row, index) => t('boss.rankLine', lang, { pos: index + 1, user: `<@${row.userId}>`, damage: row.damage }));
  lines.push(top.length ? top.join('\n\n') : t('boss.rankEmpty', lang));
  lines.push(t('boss.attacksInfo', lang, { n: store.SETTINGS.attacksPerDay }));
  if (status.lastWeek) {
    const key = status.lastWeek.defeated ? 'boss.lastWeekWin' : 'boss.lastWeekLose';
    const topUser = status.lastWeek.top?.[0]?.userId;
    lines.push(t(key, lang, { boss: bossName(status.lastWeek.bossId, lang), user: topUser ? `<@${topUser}>` : '—' }));
  }

  const embed = new EmbedBuilder()
    .setColor(status.defeatedAt ? '#f59e0b' : '#7f1d1d')
    .setTitle(`👹 ${bossName(status.bossId, lang)}`)
    .setDescription(lines.join('\n\n').slice(0, 4000))
    .setFooter({ text: t('boss.footer', lang) });
  const image = bossImage(status.bossId);
  if (image) embed.setThumbnail(image);

  const disabled = Boolean(status.defeatedAt);
  const row = new ActionRowBuilder().addComponents(
    ...Object.entries(STANCES).map(([stance, def]) =>
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:hit:${stance}`)
        .setLabel(t(`boss.btn${stance === 'strike' ? 'Strike' : stance === 'guard' ? 'Guard' : 'Spell'}`, lang))
        .setEmoji(def.emoji)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled)
    ),
    new ButtonBuilder().setCustomId(`${PREFIX}:view`).setLabel(t('boss.btnRefresh', lang)).setEmoji('🔄').setStyle(ButtonStyle.Secondary)
  );
  return { content: '', embeds: [embed], components: [row], allowedMentions: { parse: [] } };
}

/** Linha pública do golpe que acabou de acontecer. */
function hitNotice(result, userId, stance, lang) {
  let extra = '';
  if (result.counter) extra += t('boss.extraCounter', lang);
  if (result.weak) extra += t('boss.extraWeak', lang);
  if (result.crit) extra += t('boss.extraCrit', lang);
  return t('boss.hitNotice', lang, { emoji: STANCES[stance].emoji, user: `<@${userId}>`, damage: result.damage, extra });
}

module.exports = { PREFIX, buildBossView, hitNotice, bossName, hpBar };

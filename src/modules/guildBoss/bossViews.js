const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { BLANK, columns, decorate, field, buttonEmoji } = require('../../utils/embedLayout');
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

/** Cena da Nyx no trono de Nyxiel (assets/dungeon/nyx_banner.jpg, servido pelo site em /assets). */
function nyxBannerUrl() {
  const base = (process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
  return `${base}/assets/dungeon/nyx_banner.jpg`;
}

function hpBar(hp, max) {
  const filled = max > 0 ? Math.round((hp / max) * BAR_SIZE) : 0;
  return '▰'.repeat(filled) + '▱'.repeat(BAR_SIZE - filled);
}

function coinIcon() {
  return getEmoji('COIN') || '🪙';
}

/** O próprio sprite do chefe no título (emoji do bot); sem ele, o 👹 de sempre. */
function bossTitleEmoji(bossId) {
  const formatted = getEmoji(bossEnemy(bossId)?.sprite || '');
  return /^<a?:\w+:\d+>$/.test(formatted || '') ? formatted : '👹';
}

function stanceButtonKey(stance) {
  return `btn${stance === 'strike' ? 'Strike' : stance === 'guard' ? 'Guard' : 'Spell'}`;
}

function buildBossView({ guildId, userId, source, notice = null, now = Date.now() }) {
  const lang = getLanguage(source);
  const status = store.getStatus(guildId, userId, now);
  const intent = INTENTS[status.intent];
  const lines = [];
  if (notice) lines.push(`> ${notice}`);
  lines.push(t('boss.intro', lang), t('boss.hpLine', lang, { bar: hpBar(status.hp, status.maxHp), hp: status.hp, max: status.maxHp }));
  if (status.fighters) lines.push(t('boss.fighters', lang, { count: status.fighters }));

  const top = status.ranking.slice(0, 5).map((row, index) => t('boss.rankLine', lang, { pos: index + 1, user: `<@${row.userId}>`, damage: row.damage }));
  const ranking = top.length ? top.join('\n') : t('boss.rankEmpty', lang);
  const fields = [];
  if (status.defeatedAt) {
    fields.push(
      ...columns(
        [t('boss.defeatedHeader', lang), t('boss.defeatedBy', lang, { user: `<@${status.killerId}>` })],
        [t('boss.rewardsName', lang), [t('boss.rewardLine', lang, { coins: store.SETTINGS.participantCoins, coin: coinIcon(), echoes: store.SETTINGS.participantEchoes }), t('boss.podiumLine', lang)].join('\n')]
      ),
      field(t('boss.rankHeader', lang), ranking)
    );
  } else {
    const stances = Object.entries(STANCES).map(([stance, def]) =>
      t('boss.stanceLine', lang, { emoji: def.emoji, stance: t(`boss.${stanceButtonKey(stance)}`, lang), intent: INTENTS[def.beats].name[lang] })
    );
    fields.push(
      field(t('boss.intentHeader', lang, { emoji: intent.emoji, intent: intent.name[lang] }), `> *${intent.hint[lang]}*`),
      ...columns([t('boss.rankHeader', lang), ranking], [t('boss.stancesName', lang), [...stances, t('boss.attacksInfo', lang, { n: store.SETTINGS.attacksPerDay })].join('\n')])
    );
  }
  if (status.lastWeek) {
    const key = status.lastWeek.defeated ? 'boss.lastWeekWin' : 'boss.lastWeekLose';
    const topUser = status.lastWeek.top?.[0]?.userId;
    fields.push(field(BLANK, t(key, lang, { boss: bossName(status.lastWeek.bossId, lang), user: topUser ? `<@${topUser}>` : '—' })));
  }

  const embed = decorate(
    new EmbedBuilder()
      .setColor(status.defeatedAt ? '#f59e0b' : '#7f1d1d')
      .setTitle(`${bossTitleEmoji(status.bossId)} ${bossName(status.bossId, lang)}`)
      .setDescription(lines.join('\n\n').slice(0, 4000))
      .addFields(...fields)
      .setFooter({ text: t('boss.footer', lang) })
  );
  const image = bossImage(status.bossId);
  if (image) embed.setThumbnail(image);
  if (status.bossId === 'nyx' && !status.defeatedAt) embed.setImage(nyxBannerUrl());

  const disabled = Boolean(status.defeatedAt);
  const row = new ActionRowBuilder().addComponents(
    ...Object.entries(STANCES).map(([stance, def]) =>
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:hit:${stance}`)
        .setLabel(t(`boss.${stanceButtonKey(stance)}`, lang))
        .setEmoji(buttonEmoji(def.emoji))
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

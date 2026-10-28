// Mensagens do escudo de links e do guardião do servidor. Tom de segurança (AGENTS.md §12):
// caloroso e direto, sem ironia. Embeds no padrão do §9; menções nunca notificam ninguém.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t } = require('../utils/i18n');
const guard = require('./serverGuard');

const COLORS = { danger: 0xef4444, warn: 0xf59e0b, ok: 0x10b981 };
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function brandName(lang, domain) {
  return domain ? `\`${domain}\`` : t('linkShield.brandUnknown', lang);
}

function footer(embed, lang, serverName) {
  return embed.setFooter({ text: t('securityAlerts.footer', lang, { server: serverName }) }).setTimestamp();
}

// Aviso curto no canal onde o link apareceu.
function linkChannelNotice(lang, { userId, imitates, deleted }) {
  const key = deleted ? 'linkShield.channelDeleted' : 'linkShield.channelWarned';
  return { content: t(key, lang, { user: `<@${userId}>`, brand: imitates ? `**${imitates}**` : t('linkShield.brandUnknown', lang) }), allowedMentions: NO_PING };
}

// DM para quem mandou: pode ser conta invadida.
function linkAuthorDm(lang, { serverName, imitates, host }) {
  return {
    content: t('linkShield.dm', lang, { server: serverName, brand: imitates ? `**${imitates}**` : t('linkShield.brandUnknown', lang), domain: `\`${host}\`` }),
    allowedMentions: NO_PING,
  };
}

function linkStaffLog(lang, { serverName, userId, channelId, hit, deleted }) {
  const embed = new EmbedBuilder()
    .setColor(deleted ? COLORS.danger : COLORS.warn)
    .setTitle(t(deleted ? 'linkShield.logTitleDeleted' : 'linkShield.logTitleWarned', lang))
    .setDescription(
      [
        t('linkShield.logWho', lang, { user: `\`<@${userId}>\``, channel: `<#${channelId}>` }),
        t('linkShield.logDomain', lang, { domain: shownHost(hit) }),
        t('linkShield.logImitates', lang, { brand: brandName(lang, hit.imitates) }),
        t('linkShield.logReason', lang, { reason: t(`linkShield.reason.${hit.reason}`, lang) }),
        `-# ${t(deleted ? 'linkShield.logDeletedNote' : 'linkShield.logWarnedNote', lang)}`,
      ].join('\n\n')
    );
  return { embeds: [footer(embed, lang, serverName)], allowedMentions: NO_PING };
}

// Como a pessoa vê o endereço e, se for diferente, a forma técnica (xn--...).
function shownHost(hit) {
  const unicode = hit.unicodeHost || hit.host;
  return unicode !== hit.host ? `\`${unicode}\` (\`${hit.host}\`)` : `\`${hit.host}\``;
}

function whoText(lang, executorId) {
  return executorId ? `\`<@${executorId}>\`` : t('serverGuard.whoUnknown', lang);
}

function permList(lang, names) {
  return names.map((n) => `\`${t(`serverGuard.perm.${n}`, lang)}\``).join(', ');
}

// Alerta de cargo com permissão perigosa. reverted = a Pyxie já desfez sozinha (modo automático).
function roleAlert(lang, { guildId, serverName, roleId, roleName, names, executorId, reverted, viaDm, panelUrl }) {
  const lines = [
    t('serverGuard.roleWhat', lang, { role: `**${roleName}**`, id: `\`${roleId}\`` }),
    t('serverGuard.roleGained', lang, { perms: permList(lang, names) }),
    t('serverGuard.who', lang, { who: whoText(lang, executorId) }),
    reverted ? `> ${t('serverGuard.roleReverted', lang)}` : `> ${t('serverGuard.roleAsk', lang)}`,
  ];
  if (viaDm) lines.push(`-# ${t('serverGuard.dmNote', lang, { server: serverName, panel: `[${t('serverGuard.panel', lang)}](${panelUrl})` })}`);
  const embed = new EmbedBuilder().setColor(reverted ? COLORS.ok : COLORS.danger).setTitle(t('serverGuard.roleTitle', lang)).setDescription(lines.join('\n\n'));
  const components = reverted
    ? []
    : [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(guard.ids.revert(guildId, roleId, names)).setLabel(t('serverGuard.btnRevert', lang)).setEmoji('↩️').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(guard.ids.keep(guildId)).setLabel(t('serverGuard.btnKeep', lang)).setStyle(ButtonStyle.Secondary)
        ),
      ];
  return { embeds: [footer(embed, lang, serverName)], components, allowedMentions: NO_PING };
}

// Alerta de canal que ficou aberto dentro de categoria fechada.
function channelAlert(lang, { guildId, serverName, channelId, categoryName, executorId, locked, viaDm, panelUrl }) {
  const lines = [
    t('serverGuard.channelWhat', lang, { channel: `<#${channelId}>`, category: `**${categoryName}**` }),
    t('serverGuard.who', lang, { who: whoText(lang, executorId) }),
    locked ? `> ${t('serverGuard.channelLocked', lang)}` : `> ${t('serverGuard.channelAsk', lang)}`,
  ];
  if (viaDm) lines.push(`-# ${t('serverGuard.dmNote', lang, { server: serverName, panel: `[${t('serverGuard.panel', lang)}](${panelUrl})` })}`);
  const embed = new EmbedBuilder().setColor(locked ? COLORS.ok : COLORS.warn).setTitle(t('serverGuard.channelTitle', lang)).setDescription(lines.join('\n\n'));
  const components = locked
    ? []
    : [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(guard.ids.lock(guildId, channelId)).setLabel(t('serverGuard.btnLock', lang)).setEmoji('🔒').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(guard.ids.keep(guildId)).setLabel(t('serverGuard.btnKeep', lang)).setStyle(ButtonStyle.Secondary)
        ),
      ];
  return { embeds: [footer(embed, lang, serverName)], components, allowedMentions: NO_PING };
}

module.exports = { linkChannelNotice, linkAuthorDm, linkStaffLog, roleAlert, channelAlert, NO_PING };

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

// Canal de alertas da staff; sem ele, DM para o dono do servidor.
async function resolveDestination(guild, config) {
  if (config.staffLogChannelId) {
    const channel = guild.channels.cache.get(config.staffLogChannelId) || (await guild.channels.fetch(config.staffLogChannelId).catch(() => null));
    if (channel?.isTextBased?.()) return { target: channel, viaDm: false };
  }
  const owner = await guild.fetchOwner().catch(() => null);
  return owner ? { target: owner, viaDm: true } : null;
}

// Alerta de entrada em massa. paused = a pausa nativa de convites e DMs foi aplicada.
function raidAlert(lang, { guildId, serverName, total, young, seconds, paused, until, viaDm, panelUrl }) {
  const lines = [
    t('antiRaid.what', lang, { total: `\`${total}\``, seconds: `\`${seconds}s\``, young: `\`${young}\`` }),
    paused ? `> ${t('antiRaid.paused', lang, { until: `<t:${Math.floor(until / 1000)}:t>` })}` : `> ${t('antiRaid.failed', lang)}`,
  ];
  if (viaDm) lines.push(`-# ${t('serverGuard.dmNote', lang, { server: serverName, panel: `[${t('serverGuard.panel', lang)}](${panelUrl})` })}`);
  const embed = new EmbedBuilder().setColor(paused ? COLORS.warn : COLORS.danger).setTitle(t('antiRaid.title', lang)).setDescription(lines.join('\n\n'));
  const components = paused
    ? [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`ar:end:${guildId}`).setLabel(t('antiRaid.btnEnd', lang)).setEmoji('🔓').setStyle(ButtonStyle.Secondary))]
    : [];
  return { embeds: [footer(embed, lang, serverName)], components, allowedMentions: NO_PING };
}

// Escudo de arquivos: aviso no canal, DM para quem mandou (conta pode estar invadida) e registro.
function fileChannelNotice(lang, { userId, reason, deleted }) {
  const key = deleted ? `fileShield.channelDeleted.${reason}` : `fileShield.channelWarned.${reason}`;
  return { content: t(key, lang, { user: `<@${userId}>` }), allowedMentions: NO_PING };
}

function fileAuthorDm(lang, { serverName }) {
  return { content: t('fileShield.dm', lang, { server: serverName }), allowedMentions: NO_PING };
}

function fileStaffLog(lang, { serverName, userId, channelId, fileName, reason, deleted }) {
  const embed = new EmbedBuilder()
    .setColor(deleted ? COLORS.danger : COLORS.warn)
    .setTitle(t(deleted ? 'fileShield.logTitleDeleted' : 'fileShield.logTitleWarned', lang))
    .setDescription(
      [
        t('linkShield.logWho', lang, { user: `\`<@${userId}>\``, channel: `<#${channelId}>` }),
        t('fileShield.logFile', lang, { file: `\`${String(fileName).replace(/`/g, '').slice(0, 80)}\`` }),
        t('linkShield.logReason', lang, { reason: t(`fileShield.reason.${reason}`, lang) }),
      ].join('\n\n')
    );
  return { embeds: [footer(embed, lang, serverName)], allowedMentions: NO_PING };
}

// Webhook mandando coisa suspeita: botão para apagar o webhook (corta o acesso de quem o vazou).
function webhookAlert(lang, { guildId, serverName, webhookId, webhookName, channelId, reason, removed, viaDm, panelUrl }) {
  const lines = [
    t('serverGuard.webhookWhat', lang, { name: `**${String(webhookName || 'webhook').replace(/[*_`]/g, '')}**`, id: `\`${webhookId}\``, channel: `<#${channelId}>` }),
    t('linkShield.logReason', lang, { reason: t(`serverGuard.webhookReason.${reason}`, lang) }),
    removed ? `> ${t('serverGuard.webhookRemoved', lang)}` : `> ${t('serverGuard.webhookAsk', lang)}`,
  ];
  if (viaDm) lines.push(`-# ${t('serverGuard.dmNote', lang, { server: serverName, panel: `[${t('serverGuard.panel', lang)}](${panelUrl})` })}`);
  const embed = new EmbedBuilder().setColor(removed ? COLORS.ok : COLORS.danger).setTitle(t('serverGuard.webhookTitle', lang)).setDescription(lines.join('\n\n'));
  const components = removed
    ? []
    : [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`sg:hook:${guildId}:${webhookId}`).setLabel(t('serverGuard.btnDeleteWebhook', lang)).setEmoji('🪝').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(guard.ids.keep(guildId)).setLabel(t('serverGuard.btnKeep', lang)).setStyle(ButtonStyle.Secondary)
        ),
      ];
  return { embeds: [footer(embed, lang, serverName)], components, allowedMentions: NO_PING };
}

module.exports = {
  fileChannelNotice,
  fileAuthorDm,
  fileStaffLog,
  webhookAlert,
  resolveDestination,
  raidAlert, linkChannelNotice, linkAuthorDm, linkStaffLog, roleAlert, channelAlert, NO_PING };

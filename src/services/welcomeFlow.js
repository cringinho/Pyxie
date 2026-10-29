// Acolhimento inicial por servidor: mensagem de boas-vindas (dois formatos) e o acolhimento de 24h.
// O texto, a cor, a imagem, as reações e o cargo automático continuam em guildConfigs.json
// (py!set welcome edita os mesmos campos). O resto fica em data/guilds/<id>/welcome.json
// (escrita atômica). A Cringelândia nasce com os canais e cargos que eram fixos no código.
const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { t } = require('../utils/i18n');

const ID_RE = /^\d{17,20}$/;
const LAYOUTS = ['guide', 'custom'];
const CRINGE_GIF = 'https://cdn.discordapp.com/attachments/1533657882862686218/1541908904487690321/dhj7hfn-842bcc59-b41f-4ef3-888b-dbfc210f4a5c.gif';
const CRINGE_SILENT_ROLE_ID = '1455923442560925929';
const HEARTS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🖤', '🤍', '🤎'];
const id = (v) => (ID_RE.test(String(v || '')) ? String(v) : '');
const isCringe = (guildId) => String(guildId) === config.CRINGELANDIA_GUILD_ID;

function defaultsFor(guildId) {
  if (isCringe(guildId)) {
    return {
      enabled: true,
      layout: 'guide',
      pingRoleId: config.WELCOME_ROLE_ID,
      rulesChannelId: config.RULES_CHANNEL_ID,
      guidesChannelId: config.GUIDES_CHANNEL_ID,
      rolesChannelId: config.COLORS_CHANNEL_ID,
      guideImageUrl: CRINGE_GIF,
      dmWelcomeEnabled: false,
      dmWelcomeText: '',
      showAvatar: true,
      showMemberCount: true,
      customFooter: '',
      checkin: { enabled: true, channelId: config.WELCOME_CHANNEL_ID, silentRoleId: CRINGE_SILENT_ROLE_ID, delayHours: 24, customText: '' },
    };
  }
  return {
    enabled: true,
    layout: 'custom',
    pingRoleId: '',
    rulesChannelId: '',
    guidesChannelId: '',
    rolesChannelId: '',
    guideImageUrl: '',
    dmWelcomeEnabled: false,
    dmWelcomeText: '',
    showAvatar: true,
    showMemberCount: true,
    customFooter: '',
    checkin: { enabled: false, channelId: '', silentRoleId: '', delayHours: 24, customText: '' },
  };
}

function normalize(raw = {}, guildId) {
  const d = defaultsFor(guildId);
  const m = { ...d, ...raw, checkin: { ...d.checkin, ...(raw.checkin || {}) } };
  const delayHours = Number.isFinite(Number(m.checkin.delayHours)) ? Math.min(72, Math.max(1, Math.round(Number(m.checkin.delayHours)))) : 24;
  return {
    enabled: m.enabled !== false,
    layout: LAYOUTS.includes(m.layout) ? m.layout : d.layout,
    pingRoleId: id(m.pingRoleId),
    rulesChannelId: id(m.rulesChannelId),
    guidesChannelId: id(m.guidesChannelId),
    rolesChannelId: id(m.rolesChannelId),
    guideImageUrl: /^https:\/\/\S{1,500}$/.test(String(m.guideImageUrl || '')) ? String(m.guideImageUrl) : '',
    dmWelcomeEnabled: m.dmWelcomeEnabled === true,
    dmWelcomeText: String(m.dmWelcomeText || '').slice(0, 1000),
    showAvatar: m.showAvatar !== false,
    showMemberCount: m.showMemberCount !== false,
    customFooter: String(m.customFooter || '').slice(0, 120),
    checkin: {
      enabled: m.checkin.enabled === true,
      channelId: id(m.checkin.channelId),
      silentRoleId: id(m.checkin.silentRoleId),
      delayHours,
      customText: String(m.checkin.customText || '').slice(0, 500),
    },
  };
}

const fileFor = (guildId) => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'welcome.json');

function getConfig(guildId) {
  let raw = {};
  try {
    raw = JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')) || {};
  } catch (_) {}
  return normalize(raw, guildId);
}

function saveConfig(guildId, input = {}) {
  const current = getConfig(guildId);
  const next = normalize({ ...current, ...input, checkin: { ...current.checkin, ...(input.checkin || {}) } }, guildId);
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(next, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return next;
}

// Canal das boas-vindas. A Cringelândia mantém a ordem antiga (settings.json, global, canal fixo).
function welcomeChannelId(guildId) {
  const gcs = require('./guildConfigService');
  const own = gcs.getWelcomeConfig(guildId)?.channelId || '';
  if (!isCringe(guildId)) return own ? String(own) : '';
  const { getWelcomeChannel } = require('./database');
  return String(getWelcomeChannel(guildId) || own || getWelcomeChannel('global') || config.WELCOME_CHANNEL_ID);
}

// Tudo o que a tela mostra, das duas fontes.
function getView(guildId) {
  const gcs = require('./guildConfigService');
  // Sem nada salvo pelo py!set welcome, o texto padrão sai no idioma do servidor.
  const saved = gcs.getGuildConfig(guildId).welcomeConfig;
  const wc = gcs.getWelcomeConfig(guildId);
  return {
    ...getConfig(guildId),
    channelId: welcomeChannelId(guildId),
    title: saved?.title || '',
    description: saved?.description || '',
    color: /^#[0-9a-f]{6}$/i.test(wc.color || '') ? wc.color : '#8b5cf6',
    imageUrl: wc.imageUrl || '',
    autoReactions: Array.isArray(wc.autoReactions) ? wc.autoReactions : [],
    autoRoleId: wc.autoRoleId || '',
  };
}

const fill = (text, vars) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

// Mensagem que sai quando alguém entra. `view` vem de getView (ou da prévia do painel).
function buildWelcomeMessage(member, view) {
  const guild = member.guild;
  const server = guild?.name || t('periodic.bump.fallbackServer', guild);
  const vars = { server, user: `${member}`, username: member.user?.username || '', memberCount: `${guild?.memberCount || 0}` };
  const mentions = { parse: [], users: [member.id], roles: view.pingRoleId ? [view.pingRoleId] : [] };
  if (view.layout === 'custom') {
    const footerText = view.customFooter?.trim()
      ? fill(view.customFooter, vars)
      : view.showMemberCount === false
        ? server
        : t('welcomeFlow.customFooter', guild, { server, count: vars.memberCount });
    const embed = new EmbedBuilder()
      .setColor(view.color || '#8b5cf6')
      .setTitle(fill(view.title || t('welcomeFlow.customTitle', guild), vars).slice(0, 256))
      .setDescription(fill(view.description || t('welcomeFlow.customDescription', guild), vars).slice(0, 4000))
      .setFooter({ text: footerText })
      .setTimestamp();
    if (view.showAvatar !== false) embed.setThumbnail(member.user?.displayAvatarURL?.({ size: 256 }) || null);
    if (view.imageUrl) embed.setImage(view.imageUrl);
    const content = view.pingRoleId ? t('welcomeFlow.contentRole', guild, { user: vars.user, role: `<@&${view.pingRoleId}>` }) : t('welcomeFlow.customContent', guild, { user: vars.user, server });
    return { content, embeds: [embed], allowedMentions: mentions };
  }
  const { getAnimatedEmoji } = require('../utils/serverEmojis');
  const parts = [t('welcomeFlow.guideIntro', guild, { name: member.displayName || vars.username, server })];
  if (view.rulesChannelId) parts.push(`### ${t('welcomeFlow.rulesTitle', guild)}\n\n${t('welcomeFlow.rulesText', guild, { channel: `<#${view.rulesChannelId}>` })}`);
  if (view.guidesChannelId) parts.push(`### ${t('welcomeFlow.guidesTitle', guild)}\n\n${t('welcomeFlow.guidesText', guild, { channel: `<#${view.guidesChannelId}>` })}`);
  if (view.rolesChannelId) parts.push(`### ${t('welcomeFlow.rolesTitle', guild)}\n\n${t('welcomeFlow.rolesText', guild, { channel: `<#${view.rolesChannelId}>` })}`);
  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(`${getAnimatedEmoji(guild, ['heart', 'welcome', 'love'], '🎉')} ${t('welcomeFlow.guideTitle', guild)}`)
    .setDescription(parts.join('\n\n'))
    .setThumbnail(member.user?.displayAvatarURL?.({ size: 256 }) || null)
    .setFooter({ text: t('welcomeFlow.guideFooter', guild, { server }) })
    .setTimestamp();
  if (view.guideImageUrl) embed.setImage(view.guideImageUrl);
  const content = view.pingRoleId ? t('welcomeFlow.contentRole', guild, { user: vars.user, role: `<@&${view.pingRoleId}>` }) : t('welcomeFlow.content', guild, { user: vars.user });
  return { content, embeds: [embed], allowedMentions: mentions };
}

// Reações na mensagem: no formato guia, um coração sorteado; no personalizado, as escolhidas.
function reactionsFor(view) {
  if (view.layout === 'guide') return [HEARTS[Math.floor(Math.random() * HEARTS.length)]];
  return (view.autoReactions || []).slice(0, 5);
}

module.exports = { LAYOUTS, CRINGE_SILENT_ROLE_ID, defaultsFor, normalize, getConfig, saveConfig, welcomeChannelId, getView, buildWelcomeMessage, reactionsFor };

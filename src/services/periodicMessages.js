// Mensagens periódicas por servidor: guia de apoio (bump) e anúncio diário do tarot.
// data/guilds/<id>/periodic.json (painel grava; escrita atômica). O canal do tarot continua em
// guildConfigs.json (py!set tarot), para não ter duas fontes. A Cringelândia nasce com os valores
// que antes eram fixos em src/config.js; qualquer servidor pode mudar os seus no painel.
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { t } = require('../utils/i18n');

const ID_RE = /^\d{17,20}$/;
const HOUR = 3600000;
const DAY = 24 * HOUR;
const BRT = 3 * HOUR;
const SITES = ['disboard', 'canudinho', 'discadia', 'topgg', 'review'];
const clamp = (n, min, max, d) => (Number.isFinite(Number(n)) ? Math.min(max, Math.max(min, Math.round(Number(n)))) : d);
const id = (v) => (ID_RE.test(String(v || '')) ? String(v) : '');

function defaultsFor(guildId) {
  if (String(guildId) === config.CRINGELANDIA_GUILD_ID) {
    return {
      bumpGuide: {
        enabled: true,
        channelId: config.BUMP_GUIDE_CHANNEL_ID,
        intervalHours: config.BUMP_GUIDE_INTERVAL_MS / HOUR,
        sites: [...SITES],
        color: '#E60067',
        customTitle: '',
        customIntro: '',
        customFooter: '',
        pingRoleId: '',
      },
      tarot: { enabled: true, roleId: config.TAROT_ROLE_ID, hour: 0, customGreeting: '', credit: false },
    };
  }
  return {
    bumpGuide: {
      enabled: false,
      channelId: '',
      intervalHours: 12,
      sites: ['disboard', 'discadia', 'review'],
      color: '#E60067',
      customTitle: '',
      customIntro: '',
      customFooter: '',
      pingRoleId: '',
    },
    // Quem já tinha canal do tarot (py!set tarot) continua recebendo o anúncio.
    tarot: { enabled: true, roleId: '', hour: 0, customGreeting: '', credit: true },
  };
}

function normalize(raw = {}, guildId) {
  const d = defaultsFor(guildId);
  const b = { ...d.bumpGuide, ...(raw.bumpGuide || {}) };
  const tr = { ...d.tarot, ...(raw.tarot || {}) };
  const sites = Array.isArray(b.sites) ? [...new Set(b.sites.map(String).filter((s) => SITES.includes(s)))] : d.bumpGuide.sites;
  const color = /^#[0-9a-f]{6}$/i.test(String(b.color || '')) ? String(b.color) : '#E60067';
  return {
    bumpGuide: {
      enabled: b.enabled === true,
      channelId: id(b.channelId),
      intervalHours: clamp(b.intervalHours, 2, 72, 12),
      sites,
      color,
      customTitle: String(b.customTitle || '').slice(0, 120),
      customIntro: String(b.customIntro || '').slice(0, 600),
      customFooter: String(b.customFooter || '').slice(0, 120),
      pingRoleId: id(b.pingRoleId),
    },
    // O crédito "criado por Cringelândia" é fixo: só a Cringelândia aparece sem ele.
    tarot: {
      enabled: tr.enabled !== false,
      roleId: id(tr.roleId),
      hour: clamp(tr.hour, 0, 23, 0),
      customGreeting: String(tr.customGreeting || '').slice(0, 300),
      credit: d.tarot.credit,
    },
  };
}

function dataDir() {
  return process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data');
}
const fileFor = (guildId, name = 'periodic.json') => path.join(dataDir(), 'guilds', String(guildId), name);

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return data;
}

function getConfig(guildId) {
  return normalize(readJson(fileFor(guildId)), guildId);
}

function saveConfig(guildId, input = {}) {
  const current = getConfig(guildId);
  const next = normalize({ bumpGuide: { ...current.bumpGuide, ...(input.bumpGuide || {}) }, tarot: { ...current.tarot, ...(input.tarot || {}) } }, guildId);
  return writeJson(fileFor(guildId), next);
}

// Estado do bot (quando o guia saiu por último). Só o processo do bot grava.
const readState = (guildId) => readJson(fileFor(guildId, 'periodicState.json'));
const writeState = (guildId, data) => writeJson(fileFor(guildId, 'periodicState.json'), data);

// Canal do anúncio do tarot: o de py!set tarot; a Cringelândia cai no canal histórico.
function tarotChannelId(guildId) {
  const set = require('./guildConfigService').getTarotChannelId(guildId);
  if (set) return String(set);
  return String(guildId) === config.CRINGELANDIA_GUILD_ID ? config.TAROT_CHANNEL_ID : '';
}

// Servidores que recebem o anúncio diário: canal definido e anúncio ligado.
function tarotTargets(guildIds) {
  const ids = new Set([config.CRINGELANDIA_GUILD_ID, ...guildIds, ...require('./guildConfigService').getAllTarotGuildConfigs().map((c) => c.guildId)]);
  const out = [];
  for (const guildId of ids) {
    const cfg = getConfig(guildId);
    const channelId = tarotChannelId(guildId);
    if (cfg.tarot.enabled && channelId) out.push({ guildId, channelId, roleId: cfg.tarot.roleId, credit: cfg.tarot.credit });
  }
  return out;
}

// Próxima meia-noite de Brasília.
function nextBrtMidnight(now = Date.now()) {
  const d = new Date(now - BRT);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) + BRT;
}

function bumpGuideDue(guildId, now = Date.now()) {
  const cfg = getConfig(guildId).bumpGuide;
  if (!cfg.enabled || !cfg.channelId) return false;
  const last = Number(readState(guildId).bumpGuideAt) || 0;
  return now - last >= cfg.intervalHours * HOUR;
}

function bumpGuideNextAt(guildId, now = Date.now()) {
  const cfg = getConfig(guildId).bumpGuide;
  const last = Number(readState(guildId).bumpGuideAt) || 0;
  return last ? Math.max(now, last + cfg.intervalHours * HOUR) : now;
}

function siteLinks(guildId) {
  const review = String(guildId) === config.CRINGELANDIA_GUILD_ID ? config.SERVER_REVIEW_URL : `https://disboard.org/review/create/${guildId}`;
  return { review, disboard: `https://disboard.org/server/${guildId}` };
}

function buildBumpGuide(guild, cfg = getConfig(guild.id).bumpGuide) {
  const server = guild?.name || t('periodic.bump.fallbackServer', guild);
  const sections = cfg.sites.map((s) => `### ${t(`periodic.bump.site.${s}.title`, guild)}\n\n${t(`periodic.bump.site.${s}.text`, guild)}`);
  const introText = cfg.customIntro?.trim() ? cfg.customIntro.trim() : t('periodic.bump.intro', guild);
  const titleText = cfg.customTitle?.trim() ? cfg.customTitle.trim() : t('periodic.bump.title', guild, { server });
  const footerText = cfg.customFooter?.trim() ? cfg.customFooter.trim() : t('periodic.bump.footer', guild, { server });
  const embed = new EmbedBuilder()
    .setColor(cfg.color || '#E60067')
    .setTitle(titleText)
    .setDescription([introText, ...sections].join('\n\n'))
    .setFooter({ text: footerText })
    .setTimestamp();
  const links = siteLinks(guild.id);
  const buttons = [];
  if (cfg.sites.includes('review')) buttons.push(new ButtonBuilder().setLabel(t('periodic.bump.btnReview', guild)).setStyle(ButtonStyle.Link).setURL(links.review));
  if (cfg.sites.includes('disboard')) buttons.push(new ButtonBuilder().setLabel(t('periodic.bump.btnDisboard', guild)).setStyle(ButtonStyle.Link).setURL(links.disboard));
  const payload = {
    embeds: [embed],
    components: buttons.length ? [new ActionRowBuilder().addComponents(...buttons)] : [],
    allowedMentions: cfg.pingRoleId ? { parse: [], users: [], roles: [cfg.pingRoleId] } : { parse: [] },
  };
  if (cfg.pingRoleId) payload.content = `<@&${cfg.pingRoleId}>`;
  return payload;
}

module.exports = {
  SITES,
  DAY,
  defaultsFor,
  normalize,
  getConfig,
  saveConfig,
  readState,
  writeState,
  tarotChannelId,
  tarotTargets,
  nextBrtMidnight,
  bumpGuideDue,
  bumpGuideNextAt,
  buildBumpGuide,
};

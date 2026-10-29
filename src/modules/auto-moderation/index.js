// Automações de moderação: registro de moderação, modo lento pelo ritmo da conversa, aviso de cargo
// com cor difícil de ler e limpeza de canais. Tudo desligado por padrão; cada uma liga em
// /dashboard → Automações. Regras em src/services/autoRules.js.
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const rules = require('../../services/autoRules');
const { embed, staffAlert, NO_PING } = require('../../services/autoAlerts');
const { shouldAlert } = require('../../services/serverGuard');
const { t, getLanguage } = require('../../utils/i18n');

const EPHEMERAL = 64;
const MINUTE = 60000;
const flow = rules.createRateCounter();

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};
const quote = (text) =>
  String(text || '')
    .slice(0, 900)
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');

// ---------- Registro de moderação ----------
async function log(guild, type, lines, color = 'info') {
  const cfg = on(guild.id, 'modLog');
  if (!cfg || !cfg.channelId || !cfg.events.includes(type)) return null;
  const channel = guild.channels.cache.get(cfg.channelId);
  if (!channel?.isTextBased?.()) return null;
  const lang = getLanguage(guild.id);
  stats.bump(guild.id, 'modLog', 'hits');
  return channel.send({ embeds: [embed(lang, { title: t(`autos.modLog.${type}`, lang), lines, color })], allowedMentions: NO_PING }).catch(() => null);
}

function logDelete(message) {
  if (!message.guild) return null;
  const cfg = on(message.guild.id, 'modLog');
  if (!cfg || message.channelId === cfg.channelId || (cfg.exemptChannelIds || []).includes(message.channelId)) return null;
  if (cfg.ignoreBots !== false && message.author?.bot) return null;
  const lang = getLanguage(message.guild.id);
  return log(
    message.guild,
    'delete',
    [
      message.author && t('autos.modLog.who', lang, { user: `<@${message.author.id}>` }),
      t('autos.modLog.where', lang, { channel: `<#${message.channelId}>` }),
      message.partial || message.content == null ? t('autos.modLog.uncached', lang) : message.content && quote(message.content),
    ],
    'danger'
  );
}

function logEdit(before, after) {
  // Sem horário de edição é só a prévia de link carregando, não uma edição de verdade.
  if (!after.guild || after.partial || !after.editedTimestamp) return null;
  const cfg = on(after.guild.id, 'modLog');
  if (!cfg || (cfg.exemptChannelIds || []).includes(after.channelId)) return null;
  if (cfg.ignoreBots !== false && after.author?.bot) return null;
  if (before?.content === after.content) return null;
  const lang = getLanguage(after.guild.id);
  return log(after.guild, 'edit', [
    t('autos.modLog.who', lang, { user: `<@${after.author.id}>` }),
    t('autos.modLog.where', lang, { channel: `<#${after.channelId}>` }),
    `${t('autos.modLog.before', lang)}\n${before?.partial || before?.content == null ? t('autos.modLog.uncached', lang) : quote(before.content)}`,
    `${t('autos.modLog.after', lang)}\n${quote(after.content)}`,
    `[${t('autos.modLog.jump', lang)}](${after.url})`,
  ]);
}

function logJoin(member) {
  const lang = getLanguage(member.guild.id);
  return log(
    member.guild,
    'join',
    [t('autos.modLog.who', lang, { user: `<@${member.id}>` }), t('autos.modLog.created', lang, { when: `<t:${Math.floor((member.user?.createdTimestamp || Date.now()) / 1000)}:R>` })],
    'ok'
  );
}

function logLeave(member) {
  const lang = getLanguage(member.guild.id);
  return log(member.guild, 'leave', [t('autos.modLog.who', lang, { user: `<@${member.id}>` })], 'warn');
}

function logMemberUpdate(before, after) {
  const lang = getLanguage(after.guild.id);
  const who = t('autos.modLog.who', lang, { user: `<@${after.id}>` });
  const jobs = [];
  if (!before.partial && before.nickname !== after.nickname) {
    jobs.push(log(after.guild, 'nick', [who, `${t('autos.modLog.before', lang)} \`${before.nickname || before.user?.username || '-'}\``, `${t('autos.modLog.after', lang)} \`${after.nickname || after.user?.username || '-'}\``]));
  }
  if (!before.partial && before.roles?.cache && after.roles?.cache) {
    const added = [...after.roles.cache.keys()].filter((id) => !before.roles.cache.has(id));
    const removed = [...before.roles.cache.keys()].filter((id) => !after.roles.cache.has(id));
    if (added.length || removed.length) {
      jobs.push(
        log(after.guild, 'roles', [
          who,
          added.length && t('autos.modLog.added', lang, { roles: added.map((id) => `<@&${id}>`).join(' ') }),
          removed.length && t('autos.modLog.removed', lang, { roles: removed.map((id) => `<@&${id}>`).join(' ') }),
        ])
      );
    }
  }
  return Promise.all(jobs);
}

// ---------- Modo lento pelo ritmo ----------
function slowFile(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guilds', String(guildId), 'autoSlowmode.json');
}
function readSlow(guildId) {
  try {
    return JSON.parse(fs.readFileSync(slowFile(guildId), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}
function writeSlow(guildId, data) {
  const file = slowFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(data));
  fs.renameSync(`${file}.tmp`, file);
}

async function onFlow(message, now = Date.now()) {
  const cfg = on(message.guild.id, 'autoSlowmode');
  if (!cfg || !cfg.channelIds.includes(message.channel.id)) return null;
  const count = flow.hit(message.channel.id, now, MINUTE);
  if (count < cfg.perMinute) return null;
  const state = readSlow(message.guild.id);
  if (state[message.channel.id]) return null;
  const previous = message.channel.rateLimitPerUser || 0;
  if (previous >= cfg.seconds) return null;
  const ok = await message.channel.setRateLimitPerUser(cfg.seconds, 'Pyxie: fast chat').then(() => true).catch(() => false);
  if (!ok) return null;
  writeSlow(message.guild.id, { ...state, [message.channel.id]: { previous, since: now } });
  stats.bump(message.guild.id, 'autoSlowmode', 'hits');
  const lang = getLanguage(message.guild.id);
  if (!cfg.silent) {
    await message.channel.send({ content: t('autos.slowmode.notice', lang, { seconds: `\`${cfg.seconds}\`` }), allowedMentions: NO_PING }).catch(() => null);
  }
  return cfg.seconds;
}

// Volta ao valor anterior depois de cooldownMinutes (padrão 5 min), quando o ritmo cai para menos de um terço do limite.
async function relaxSlowmode(client, now = Date.now()) {
  for (const guild of client.guilds.cache.values()) {
    const state = readSlow(guild.id);
    const ids = Object.keys(state);
    if (!ids.length) continue;
    const cfg = auto.getConfig(guild.id, 'autoSlowmode');
    const waitMinutes = Number(cfg.cooldownMinutes) || 5;
    let changed = false;
    for (const id of ids) {
      const calm = !cfg.enabled || flow.count(id, now, MINUTE) < cfg.perMinute / 3;
      if (now - state[id].since < waitMinutes * MINUTE || !calm) continue;
      await guild.channels.cache.get(id)?.setRateLimitPerUser?.(state[id].previous, 'Pyxie: chat calmed down').catch(() => null);
      delete state[id];
      changed = true;
    }
    if (changed) writeSlow(guild.id, state);
  }
}

// ---------- Contraste de cor ----------
async function checkContrast(role, before = null) {
  const cfg = on(role.guild.id, 'roleContrast');
  if (!cfg || !role.color || (before && before.color === role.color)) return null;
  const hex = role.color.toString(16).padStart(6, '0');
  const min = Number(cfg.minRatio);
  const ratio = rules.contrast(hex, rules.BACKGROUNDS.dark);
  if (ratio >= min || !shouldAlert(`contrast:${role.id}`)) return null;
  const suggestion = rules.suggestColor(hex, min);
  const lang = getLanguage(role.guild.id);
  stats.bump(role.guild.id, 'roleContrast', 'hits');
  await staffAlert(role.guild, {
    title: t('autos.contrast.title', lang),
    color: parseInt(suggestion, 16),
    lines: [
      t('autos.contrast.body', lang, { role: `<@&${role.id}>`, hex, ratio: ratio.toFixed(1), min }),
      `> ${t('autos.contrast.suggest', lang, { hex: suggestion, ratio: rules.contrast(suggestion, rules.BACKGROUNDS.dark).toFixed(1) })}`,
    ],
    components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`aut:color:${role.guild.id}:${role.id}:${suggestion}`).setLabel(t('autos.contrast.apply', lang)).setEmoji('🎨').setStyle(ButtonStyle.Secondary))],
  });
  return suggestion;
}

async function handleInteraction(interaction, client) {
  const id = interaction.customId || '';
  if (!id.startsWith('aut:color:')) return;
  const [, , guildId, roleId, hex] = id.split(':');
  const guild = client.guilds.cache.get(guildId);
  const member = guild && (await guild.members.fetch(interaction.user.id).catch(() => null));
  if (!guild || !member?.permissions?.has(PermissionFlagsBits.ManageRoles) || !/^[0-9a-f]{6}$/.test(hex || '')) {
    return interaction.reply({ content: t('autos.contrast.staffOnly', interaction), flags: EPHEMERAL });
  }
  await guild.roles.cache.get(roleId)?.setColor?.(parseInt(hex, 16), 'Pyxie: readable role color').catch(() => null);
  return interaction.reply({ content: t('autos.contrast.applied', interaction, { hex }), flags: EPHEMERAL });
}

// ---------- Limpeza de canais ----------
async function cleanup(client, now = Date.now()) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = on(guild.id, 'channelCleanup');
    if (!cfg) continue;
    for (const channelId of cfg.channelIds) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel?.messages?.fetch) continue;
      const batch = await channel.messages.fetch({ limit: 100 }).catch(() => null);
      if (!batch) continue;
      const old = [...batch.values()].filter(
        (m) =>
          now - m.createdTimestamp > cfg.hours * 3600000 &&
          !(cfg.keepPinned && m.pinned) &&
          !(cfg.skipMedia && (m.attachments?.size || 0) > 0) &&
          !(cfg.skipBots && m.author?.bot)
      );
      const recent = old.filter((m) => now - m.createdTimestamp < 13.5 * 86400000).map((m) => m.id);
      if (recent.length > 1) await channel.bulkDelete(recent, true).catch(() => null);
      else if (recent.length === 1) await channel.messages.delete(recent[0]).catch(() => null);
      // Mais velhas que 14 dias não entram no apagar em lote: poucas por vez, para não travar.
      for (const m of old.filter((x) => !recent.includes(x.id)).slice(0, 10)) await m.delete().catch(() => null);
      if (old.length) stats.bump(guild.id, 'channelCleanup', 'hits', old.length);
    }
  }
}

module.exports = {
  id: 'auto-moderation',
  name: { 'pt-BR': 'Automações de Moderação', en: 'Moderation Automations' },
  description: {
    'pt-BR': 'Registro de moderação, modo lento pelo ritmo da conversa, aviso de cargo com cor difícil de ler e limpeza de canais. Tudo desligado por padrão.',
    en: 'Moderation log, slow mode driven by chat pace, hard-to-read role color warnings and channel cleanup. All off by default.',
  },
  icon: '🧹',
  defaultEnabled: true,
  logDelete,
  logEdit,
  logJoin,
  logLeave,
  logMemberUpdate,
  onFlow,
  relaxSlowmode,
  checkContrast,
  cleanup,
  handleInteraction,
  _reset: () => flow.reset(),

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoModeration] ${label}:`, err));
    ctx.registerListener('messageDelete', safe('apagada', logDelete));
    ctx.registerListener('messageUpdate', safe('editada', logEdit));
    ctx.registerListener('guildMemberAdd', safe('entrada', logJoin));
    ctx.registerListener('guildMemberRemove', safe('saída', logLeave));
    ctx.registerListener('guildMemberUpdate', safe('membro', logMemberUpdate));
    ctx.registerListener(
      'messageCreate',
      safe('ritmo', (message) => {
        if (message.guild && !message.author?.bot) return onFlow(message);
        return null;
      })
    );
    ctx.registerListener('roleCreate', safe('cargo novo', (role) => checkContrast(role)));
    ctx.registerListener('roleUpdate', safe('cargo', (before, after) => checkContrast(after, before)));
    ctx.registerListener('interactionCreate', safe('botão', (interaction) => handleInteraction(interaction, ctx.client)));
    ctx.registerInterval(safe('modo lento', () => relaxSlowmode(ctx.client)), MINUTE);
    ctx.registerInterval(safe('limpeza', () => cleanup(ctx.client)), 15 * MINUTE);
  },
};

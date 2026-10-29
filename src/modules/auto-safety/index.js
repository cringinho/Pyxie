// Automações de segurança: conta nova em quarentena, nome limpo, imitação da staff, mesma mensagem
// em vários canais, menções em massa, convites de fora e alarme de moderação fora do normal.
// Tudo desligado por padrão; cada uma liga em /dashboard → Automações. Regras em src/services/autoRules.js.
const { ActionRowBuilder, AuditLogEvent, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const rules = require('../../services/autoRules');
const { staffAlert, NO_PING } = require('../../services/autoAlerts');
const { shouldAlert } = require('../../services/serverGuard');
const { t, getLanguage } = require('../../utils/i18n');

const DAY = 86400000;
const EPHEMERAL = 64;
const MOD_PERMS = ['Administrator', 'BanMembers', 'KickMembers', 'ModerateMembers', 'ManageRoles', 'ManageGuild'];

const spam = rules.createSpamTracker(60000);
const modActions = rules.createRateCounter();
const inviteCache = new Map(); // código -> { guildId, at }

const on = (guildId, key) => {
  const cfg = auto.getConfig(guildId, key);
  return cfg.enabled ? cfg : null;
};
const isStaff = (member) => Boolean(member?.permissions?.has?.(PermissionFlagsBits.ManageMessages));
const display = (member) => member?.nickname || member?.user?.globalName || member?.user?.username || '';

function ageText(lang, ms) {
  const days = Math.floor(ms / DAY);
  if (days >= 1) return `\`${days}\` ${lang === 'en' ? (days === 1 ? 'day' : 'days') : days === 1 ? 'dia' : 'dias'}`;
  const hours = Math.max(1, Math.floor(ms / 3600000));
  return `\`${hours}\` h`;
}

// ---------- Entrada e nome ----------
async function checkNewAccount(member, now = Date.now()) {
  const cfg = on(member.guild.id, 'newAccountGate');
  if (!cfg || member.user?.bot) return null;
  const age = now - (member.user?.createdTimestamp || now);
  if (age >= cfg.minAgeDays * DAY) return null;
  const lang = getLanguage(member.guild.id);
  if (cfg.dmNotice !== false) {
    member.send?.({ content: t('autos.newAccount.dm', lang, { server: member.guild.name, days: `\`${cfg.minAgeDays}\`` }), allowedMentions: NO_PING }).catch(() => null);
  }
  let added = false;
  let kicked = false;
  if (cfg.action === 'kick') {
    kicked = await member.kick?.('Pyxie: newAccountGate')?.then?.(() => true)?.catch?.(() => false) || false;
  } else if (cfg.action !== 'alertOnly' && cfg.roleId) {
    added = await member.roles.add(cfg.roleId).then(() => true).catch(() => false);
  }
  stats.bump(member.guild.id, 'newAccountGate', 'hits');
  if (cfg.alert) {
    await staffAlert(member.guild, {
      title: t('autos.newAccount.title', lang),
      color: 'warn',
      lines: [t('autos.newAccount.body', lang, { user: `<@${member.id}>`, age: ageText(lang, age) }), `> ${added ? t('autos.newAccount.quarantined', lang, { role: `<@&${cfg.roleId}>` }) : t('autos.newAccount.noRole', lang)}`],
    });
  }
  return kicked ? { quarantined: added, kicked } : { quarantined: added };
}

async function checkName(member) {
  const cfg = on(member.guild.id, 'nameSanitizer');
  if (!cfg || member.user?.bot || member.manageable === false) return null;
  if ((cfg.exemptRoleIds || []).some((id) => member.roles?.cache?.has(id))) return null;
  const fallback = cfg.fallbackName?.trim() || (getLanguage(member.guild.id) === 'en' ? 'Member' : 'Pessoa');
  const clean = rules.cleanName(display(member), cfg, fallback);
  if (!clean) return null;
  const ok = await member.setNickname(clean).then(() => true).catch(() => false);
  if (ok) stats.bump(member.guild.id, 'nameSanitizer', 'hits');
  return ok ? clean : null;
}

async function checkImpersonation(member) {
  const cfg = on(member.guild.id, 'staffImpersonation');
  if (!cfg || !cfg.staffRoleIds.length || member.user?.bot) return null;
  if (cfg.staffRoleIds.some((id) => member.roles?.cache?.has(id))) return null;
  const name = display(member);
  for (const roleId of cfg.staffRoleIds) {
    const role = member.guild.roles.cache.get(roleId);
    for (const staff of role?.members?.values?.() || []) {
      if (staff.id === member.id) continue;
      if (![display(staff), staff.user?.username].some((n) => rules.imitates(name, n))) continue;
      if (!shouldAlert(`imp:${member.guild.id}:${member.id}`)) return null;
      const lang = getLanguage(member.guild.id);
      if (cfg.action === 'resetNick') await member.setNickname?.(lang === 'en' ? 'Member' : 'Pessoa')?.catch?.(() => null);
      else if (cfg.action === 'timeout') await timeout(member, 60, 'Pyxie: staff impersonation');
      stats.bump(member.guild.id, 'staffImpersonation', 'hits');
      await staffAlert(member.guild, {
        title: t('autos.impersonation.title', lang),
        color: 'danger',
        lines: [t('autos.impersonation.body', lang, { user: `<@${member.id}>`, name: name.replace(/[*_`~|]/g, ''), staff: `<@${staff.id}>` }), `> ${t('autos.impersonation.hint', lang)}`],
      });
      return staff.id;
    }
  }
  return null;
}

// ---------- Mensagens ----------
async function timeout(member, minutes, reason) {
  if (!minutes || !member?.moderatable) return false;
  return member.timeout(minutes * 60000, reason).then(() => true).catch(() => false);
}

async function checkSpam(message) {
  const cfg = on(message.guild.id, 'crossChannelSpam');
  if (!cfg) return null;
  if ((cfg.exemptChannelIds || []).includes(message.channel.id)) return null;
  if ((cfg.exemptRoleIds || []).some((id) => message.member?.roles?.cache?.has(id))) return null;
  const hit = spam.add(
    { guildId: message.guild.id, userId: message.author.id, channelId: message.channel.id, messageId: message.id, content: message.content, at: message.createdTimestamp || Date.now() },
    cfg.channels
  );
  if (!hit) return null;
  spam.clear(message.guild.id, message.author.id);
  for (const e of hit) {
    const ch = message.guild.channels.cache.get(e.channelId);
    await ch?.messages?.delete(e.messageId).catch(() => null);
  }
  const lang = getLanguage(message.guild.id);
  const timedOut = await timeout(message.member, cfg.timeoutMinutes, 'Pyxie: cross-channel spam');
  message.author.send?.({ content: t('autos.spam.dm', lang, { server: message.guild.name }), allowedMentions: NO_PING }).catch(() => null);
  stats.bump(message.guild.id, 'crossChannelSpam', 'hits');
  await staffAlert(message.guild, {
    title: t('autos.spam.title', lang),
    color: 'danger',
    lines: [t('autos.spam.body', lang, { user: `<@${message.author.id}>`, count: `\`${new Set(hit.map((e) => e.channelId)).size}\`` }), timedOut && `> ${t('autos.spam.timeout', lang, { minutes: `\`${cfg.timeoutMinutes}\`` })}`],
  });
  return hit.length;
}

async function checkMentions(message) {
  const cfg = on(message.guild.id, 'massMention');
  if (!cfg) return null;
  if ((cfg.exemptChannelIds || []).includes(message.channel.id)) return null;
  if ((cfg.exemptRoleIds || []).some((id) => message.member?.roles?.cache?.has(id))) return null;
  const users = new Set([...(message.mentions?.users?.keys?.() || [])].filter((id) => id !== message.author.id));
  const roleMentions = cfg.countRoleMentions === false ? 0 : message.mentions?.roles?.size || 0;
  const count = users.size + roleMentions;
  if (count < cfg.maxMentions) return null;
  await message.delete().catch(() => null);
  const lang = getLanguage(message.guild.id);
  const timedOut = await timeout(message.member, cfg.timeoutMinutes, 'Pyxie: mass mention');
  stats.bump(message.guild.id, 'massMention', 'hits');
  await staffAlert(message.guild, {
    title: t('autos.mentions.title', lang),
    color: 'warn',
    lines: [t('autos.mentions.body', lang, { user: `<@${message.author.id}>`, count: `\`${count}\``, channel: `<#${message.channel.id}>` }), timedOut && `> ${t('autos.spam.timeout', lang, { minutes: `\`${cfg.timeoutMinutes}\`` })}`],
  });
  return count;
}

async function inviteGuildId(client, code) {
  const hit = inviteCache.get(code);
  if (hit && Date.now() - hit.at < 3600000) return hit.guildId;
  const invite = await client.fetchInvite(code).catch(() => null);
  const guildId = invite?.guild?.id || null;
  inviteCache.set(code, { guildId, at: Date.now() });
  if (inviteCache.size > 2000) inviteCache.delete(inviteCache.keys().next().value);
  return guildId;
}

async function checkInvites(message, client) {
  const cfg = on(message.guild.id, 'inviteFilter');
  if (!cfg || cfg.exemptChannelIds.includes(message.channel.id)) return null;
  if (cfg.exemptRoleIds.some((id) => message.member?.roles?.cache?.has(id))) return null;
  const codes = rules.inviteCodes(message.content).filter((c) => c !== message.guild.vanityURLCode);
  if (!codes.length) return null;
  for (const code of codes) {
    // Convite inválido ou expirado também sai: não leva a lugar nenhum e costuma ser golpe.
    if ((await inviteGuildId(client, code)) === message.guild.id) continue;
    if (cfg.action !== 'warn') await message.delete().catch(() => null);
    if (cfg.action === 'timeout' && cfg.timeoutMinutes > 0) await timeout(message.member, cfg.timeoutMinutes, 'Pyxie: outside invite');
    stats.bump(message.guild.id, 'inviteFilter', 'hits');
    const lang = getLanguage(message.guild.id);
    const notice = await message.channel.send({ content: t('autos.invite.notice', lang, { user: `<@${message.author.id}>` }), allowedMentions: NO_PING }).catch(() => null);
    if (notice) setTimeout(() => notice.delete().catch(() => null), 10000).unref?.();
    return code;
  }
  return null;
}

async function onMessage(message, client) {
  if (!message.guild || message.author?.bot || message.webhookId || isStaff(message.member)) return;
  if (await checkSpam(message)) return;
  if (await checkMentions(message)) return;
  await checkInvites(message, client);
}

// ---------- Alarme de moderação ----------
const COUNTED = new Set([AuditLogEvent.MemberBanAdd, AuditLogEvent.MemberKick, AuditLogEvent.MemberPrune]);
function isModAction(entry, cfg = {}) {
  if (COUNTED.has(entry.action)) return true;
  if (cfg.includeChannelDeletes !== false && (entry.action === AuditLogEvent.ChannelDelete || entry.action === AuditLogEvent.RoleDelete)) return true;
  return entry.action === AuditLogEvent.MemberUpdate && (entry.changes || []).some((c) => c.key === 'communication_disabled_until' && c.new);
}

async function stripModRoles(guild, userId) {
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return 0;
  const top = guild.members.me?.roles?.highest?.position ?? 0;
  const roles = [...member.roles.cache.values()].filter((r) => r.position < top && !r.managed && MOD_PERMS.some((p) => r.permissions.has(PermissionFlagsBits[p])));
  for (const r of roles) await member.roles.remove(r.id, 'Pyxie: unusual moderation').catch(() => null);
  return roles.length;
}

async function onAuditLog(entry, guild, client, now = Date.now()) {
  const cfg = on(guild.id, 'modCanary');
  if (!cfg || !isModAction(entry, cfg) || !entry.executorId) return null;
  if (entry.executorId === client?.user?.id || entry.executorId === guild.ownerId) return null;
  const execMember = guild.members?.cache?.get?.(entry.executorId);
  if ((cfg.exemptRoleIds || []).some((id) => execMember?.roles?.cache?.has?.(id))) return null;
  const count = modActions.hit(`${guild.id}:${entry.executorId}`, now, cfg.windowMinutes * 60000);
  if (count < cfg.maxActions || !shouldAlert(`canary:${guild.id}:${entry.executorId}`, now)) return null;
  const lang = getLanguage(guild.id);
  const stripped = cfg.action === 'strip' ? await stripModRoles(guild, entry.executorId) : 0;
  stats.bump(guild.id, 'modCanary', 'hits');
  const components = stripped
    ? []
    : [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`aut:strip:${guild.id}:${entry.executorId}`).setLabel(t('autos.canary.strip', lang)).setEmoji('🛑').setStyle(ButtonStyle.Danger))];
  await staffAlert(guild, {
    title: t('autos.canary.title', lang),
    color: 'danger',
    lines: [t('autos.canary.body', lang, { user: `<@${entry.executorId}>`, count: `\`${count}\``, minutes: `\`${cfg.windowMinutes}\`` }), `> ${stripped ? t('autos.canary.stripped', lang) : t('autos.canary.alertOnly', lang)}`],
    components,
  });
  return { count, stripped };
}

async function handleInteraction(interaction, client) {
  const id = interaction.customId || '';
  if (!id.startsWith('aut:strip:')) return;
  const [, , guildId, userId] = id.split(':');
  const guild = client.guilds.cache.get(guildId);
  const member = guild && (await guild.members.fetch(interaction.user.id).catch(() => null));
  if (!guild || !member?.permissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: t('autos.canary.adminOnly', interaction), flags: EPHEMERAL });
  }
  await stripModRoles(guild, userId);
  return interaction.reply({ content: t('autos.canary.stripDone', interaction, { user: `<@${userId}>` }), flags: EPHEMERAL, allowedMentions: NO_PING });
}

module.exports = {
  id: 'auto-safety',
  name: { 'pt-BR': 'Automações de Segurança', en: 'Safety Automations' },
  description: {
    'pt-BR': 'Conta nova em quarentena, nome limpo, imitação da staff, spam em vários canais, menções em massa, convites de fora, filtros prontos do AutoMod e alarme de moderação. Tudo desligado por padrão.',
    en: 'New-account quarantine, name cleanup, staff impersonation, cross-channel spam, mass mentions, outside invites, AutoMod presets and unusual-moderation alarm. All off by default.',
  },
  icon: '🛡️',
  defaultEnabled: true,
  checkNewAccount,
  checkName,
  checkImpersonation,
  checkSpam,
  checkMentions,
  checkInvites,
  onMessage,
  onAuditLog,
  handleInteraction,
  _reset: () => {
    spam.reset();
    modActions.reset();
    inviteCache.clear();
  },

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = (label, fn) => (...args) => Promise.resolve(fn(...args)).catch((err) => console.error(`[AutoSafety] ${label}:`, err));
    ctx.registerListener(
      'guildMemberAdd',
      safe('entrada', async (member) => {
        await checkNewAccount(member);
        await checkName(member);
        await checkImpersonation(member);
      })
    );
    ctx.registerListener(
      'guildMemberUpdate',
      safe('apelido', async (before, after) => {
        if (display(before) === display(after)) return;
        await checkName(after);
        await checkImpersonation(after);
      })
    );
    ctx.registerListener('messageCreate', safe('mensagem', (message) => onMessage(message, ctx.client)));
    ctx.registerListener('guildAuditLogEntryCreate', safe('auditoria', (entry, guild) => onAuditLog(entry, guild, ctx.client)));
    ctx.registerListener('interactionCreate', safe('botão', (interaction) => handleInteraction(interaction, ctx.client)));
  },
};

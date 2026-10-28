// Apelação de banimento: quem foi banido entra no painel com o Discord, vê o motivo e pede
// para voltar. A staff decide no canal de apelações (Desbanir / Recusar) e a pessoa vê a
// resposta no painel. Desligado por padrão; cada servidor liga em /dashboard → Segurança.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const appeals = require('../../services/banAppeals');
const safety = require('../../services/guildSafety');
const { registerBridgeHandler } = require('../../services/botBridgeHandlers');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };
let active = false;

const quote = (text) => String(text || '').split('\n').map((l) => `> ${l}`).join('\n');
const noMentions = (text) => String(text || '').replace(/@(everyone|here)/g, '@​$1').replace(/<@[!&]?(\d+)>/g, '`<@$1>`');

function staffMessage(guild, appeal, { decided = null } = {}) {
  const lines = [
    t('appeals.staffWho', guild, { user: `\`<@${appeal.userId}>\``, name: `**${noMentions(appeal.username)}**`, id: `\`${appeal.userId}\`` }),
    t('appeals.staffReason', guild, { reason: appeal.banReason ? `\`${noMentions(appeal.banReason).slice(0, 300)}\`` : t('appeals.noReason', guild) }),
    `### ${t('appeals.staffText', guild)}`,
    quote(noMentions(appeal.text)),
  ];
  if (decided) lines.push(`-# ${decided}`);
  const embed = new EmbedBuilder()
    .setColor(decided ? 0x6b7280 : 0x8b5cf6)
    .setTitle(t('appeals.staffTitle', guild))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Pyxie · ${guild.name}` })
    .setTimestamp(appeal.createdAt);
  const components = decided
    ? []
    : [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`appeal:yes:${guild.id}:${appeal.id}`).setLabel(t('appeals.btnApprove', guild)).setEmoji('🕊️').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`appeal:no:${guild.id}:${appeal.id}`).setLabel(t('appeals.btnReject', guild)).setStyle(ButtonStyle.Secondary)
        ),
      ];
  return { embeds: [embed], components, allowedMentions: NO_PING };
}

async function fetchBan(guild, userId) {
  if (!guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) return null;
  return guild.bans.fetch({ user: String(userId), force: true }).catch(() => null);
}

// Servidores onde a pessoa está banida e que aceitam apelação (ou onde já teve resposta).
async function listForUser(client, { userId }) {
  if (!active) return [];
  const out = [];
  for (const guild of client.guilds.cache.values()) {
    const cfg = safety.getConfig(guild.id).appeals;
    if (!cfg.enabled || !cfg.channelId) continue;
    const latest = appeals.latestFor(guild.id, userId);
    const ban = await fetchBan(guild, userId);
    if (!ban && !latest) continue;
    out.push({
      guildId: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 64 }) || null,
      banned: Boolean(ban),
      banReason: ban?.reason || '',
      appeal: appeals.publicView(latest),
      canAppeal: Boolean(ban) && appeals.canAppeal(guild.id, userId).ok,
      cooldownUntil: appeals.canAppeal(guild.id, userId).until || null,
    });
  }
  return out;
}

async function submit(client, { guildId, userId, username, text }) {
  const guild = client.guilds.cache.get(String(guildId));
  const cfg = guild && safety.getConfig(guild.id).appeals;
  if (!active || !guild || !cfg.enabled || !cfg.channelId) throw new Error('appeals_off');
  const ban = await fetchBan(guild, userId);
  if (!ban) throw new Error('not_banned');
  const result = appeals.create(guild.id, { userId, username, text, banReason: ban.reason });
  if (!result.ok) throw new Error(result.reason);
  const channel = guild.channels.cache.get(cfg.channelId) || (await guild.channels.fetch(cfg.channelId).catch(() => null));
  const sent = channel?.isTextBased?.() ? await channel.send(staffMessage(guild, result.appeal)).catch(() => null) : null;
  if (sent) appeals.setMessage(guild.id, result.appeal.id, sent.id, channel.id);
  return appeals.publicView(result.appeal);
}

async function handleInteraction(interaction, client) {
  if (!interaction.isButton?.() || !String(interaction.customId).startsWith('appeal:')) return;
  const [, choice, guildId, appealId] = interaction.customId.split(':');
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return interaction.reply({ content: t('appeals.failed', interaction), flags: EPHEMERAL });
  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  if (!(guild.ownerId === interaction.user.id || member?.permissions.has(PermissionFlagsBits.BanMembers))) {
    return interaction.reply({ content: t('appeals.noPermission', guild), flags: EPHEMERAL });
  }
  const approved = choice === 'yes';
  const pending = appeals.read(guild.id).find((a) => a.id === appealId);
  if (approved && pending?.status === 'pending') {
    const ok = await guild.bans.remove(pending.userId, `Apelação aceita por ${interaction.user.tag}`).then(() => true).catch(() => false);
    if (!ok) return interaction.reply({ content: t('appeals.failed', guild), flags: EPHEMERAL });
  }
  const result = appeals.decide(guild.id, appealId, { approved, by: interaction.user.id });
  if (!result.ok) return interaction.reply({ content: t('appeals.alreadyDecided', guild), flags: EPHEMERAL });
  const note = t(approved ? 'appeals.decidedApproved' : 'appeals.decidedRejected', guild, { user: `\`<@${interaction.user.id}>\`` });
  await interaction.update(staffMessage(guild, result.appeal, { decided: note }));
  // Aviso por DM (pode falhar se a pessoa não divide servidor com a Pyxie; o painel mostra a resposta).
  const user = await client.users.fetch(result.appeal.userId).catch(() => null);
  await user?.send({ content: t(approved ? 'appeals.dmApproved' : 'appeals.dmRejected', guild, { server: guild.name }), allowedMentions: NO_PING }).catch(() => null);
  return null;
}

module.exports = {
  id: 'ban-appeals',
  name: { 'pt-BR': 'Apelação de Banimento', en: 'Ban Appeals' },
  description: {
    'pt-BR': 'Quem foi banido pede para voltar pelo painel, com login do Discord. A staff decide no canal de apelações e a pessoa vê a resposta.',
    en: 'Banned people ask to come back through the dashboard with Discord login. Staff decides in the appeals channel and the person sees the answer.',
  },
  icon: '🕊️',
  defaultEnabled: true,
  staffMessage,
  listForUser,
  submit,
  handleInteraction,
  _setActive: (v) => {
    active = v;
  },

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    active = true;
    registerBridgeHandler('APPEAL_LIST', listForUser);
    registerBridgeHandler('APPEAL_SUBMIT', submit);
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction, ctx.client).catch((err) => console.error('[BanAppeals] Erro no botão:', err));
    });
  },

  async onUnload() {
    active = false;
  },
};

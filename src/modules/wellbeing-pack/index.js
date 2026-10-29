// Módulo de Bem-Estar e Convivência (wellbeing-pack) — AGENTS.md §3 e §12.
// - Agendador (somente em ctx.isBotProcess) para disparar lembretes vencidos e parabenizar aniversariantes opt-in.
// - Listener de messageCreate para limpar AFK automaticamente quando a pessoa volta a falar
//   e avisar de forma gentil e sem ping quando alguém menciona quem está AFK.
const { EmbedBuilder } = require('discord.js');
const wellbeing = require('../../services/wellbeingService');
const { t } = require('../../utils/i18n');

const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };
const AFK_NOTICE_COOLDOWN_MS = 30 * 1000;
const recentAfkNotices = new Map(); // channelId:targetId -> timestamp

async function deliverDueReminders(client) {
  if (!client) return 0;
  const due = wellbeing.popDueReminders(Date.now());
  let delivered = 0;

  for (const rem of due) {
    const guild = rem.guildId ? client.guilds?.cache?.get(rem.guildId) : null;
    const langSource = guild || 'pt';
    const embed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(t('wellbeing.reminderDueTitle', langSource))
      .setDescription(
        [
          t('wellbeing.reminderDueBody', langSource, { user: `<@${rem.userId}>`, text: rem.text }),
          `-# ${t('wellbeing.reminderDueCreated', langSource, { time: `<t:${Math.floor(rem.createdAt / 1000)}:R>` })}`,
        ].join('\n\n')
      )
      .setFooter({ text: t('wellbeing.footer', langSource, { server: guild?.name || 'Pyxie' }) })
      .setTimestamp();

    let sent = false;
    // Tenta mandar por DM primeiro para privacidade; se falhar, manda no canal onde pediu.
    const user = await client.users?.fetch?.(rem.userId).catch(() => null);
    if (user) {
      sent = await user.send({ embeds: [embed], allowedMentions: NO_PING }).then(() => true).catch(() => false);
    }
    if (!sent && rem.channelId) {
      const channel = client.channels?.cache?.get(rem.channelId) || (await client.channels?.fetch?.(rem.channelId).catch(() => null));
      if (channel?.isTextBased?.()) {
        sent = await channel
          .send({ content: `<@${rem.userId}>`, embeds: [embed], allowedMentions: { users: [rem.userId], roles: [], parse: [] } })
          .then(() => true)
          .catch(() => false);
      }
    }
    if (sent) delivered += 1;
  }

  return delivered;
}

async function announceDailyBirthdays(client, now = new Date()) {
  if (!client?.guilds?.cache) return 0;
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(now);
  const month = Number(parts.find((p) => p.type === 'month')?.value || now.getUTCMonth() + 1);
  const day = Number(parts.find((p) => p.type === 'day')?.value || now.getUTCDate());
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  let announcedGuilds = 0;

  for (const guild of client.guilds.cache.values()) {
    const cfg = wellbeing.getWellbeingGuildConfig(guild.id);
    if (!cfg.enabled || !cfg.birthdaysEnabled || !cfg.birthdayChannelId) continue;
    if (cfg.lastBirthdayAnnounceDate === dateKey) continue;

    const list = wellbeing.getGuildBirthdaysForDate(guild.id, day, month);
    wellbeing.setWellbeingGuildConfig(guild.id, { lastBirthdayAnnounceDate: dateKey });
    if (!list.length) continue;

    const channel = guild.channels.cache.get(cfg.birthdayChannelId) || (await guild.channels.fetch(cfg.birthdayChannelId).catch(() => null));
    if (!channel?.isTextBased?.()) continue;

    const mentions = list.map((b) => `\`<@${b.userId}>\``).join(', ');
    const embed = new EmbedBuilder()
      .setColor(0xf472b6)
      .setTitle(t('wellbeing.birthdayAnnounceTitle', guild))
      .setDescription(
        [
          t('wellbeing.birthdayAnnounceBody', guild, { users: mentions, date: `\`${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}\`` }),
          `-# ${t('wellbeing.birthdayPrivacyHint', guild)}`,
        ].join('\n\n')
      )
      .setFooter({ text: t('wellbeing.footer', guild, { server: guild.name }) })
      .setTimestamp();

    await channel.send({ embeds: [embed], allowedMentions: NO_PING }).catch(() => null);
    announcedGuilds += 1;
  }

  return announcedGuilds;
}

async function onMessageCreate(message) {
  if (!message?.guild || message.author?.bot || message.webhookId) return;
  const cfg = wellbeing.getWellbeingGuildConfig(message.guild.id);
  if (!cfg.enabled || !cfg.afkEnabled) return;

  // Ignora quando a própria mensagem é o comando de ativar AFK
  const lower = String(message.content || '').trim().toLowerCase();
  if (/^py!(afk|ausente|voltoja)\b/.test(lower)) return;

  // 1. Se quem enviou estava AFK, limpa e dá boas-vindas de volta
  const ownAfk = wellbeing.clearAfk(message.author.id);
  if (ownAfk) {
    await message
      .reply({
        content: t('wellbeing.afkCleared', message.guild, { user: `<@${message.author.id}>` }),
        allowedMentions: NO_PING,
      })
      .catch(() => null);
  }

  // 2. Se mencionou alguém que está AFK, avisa gentilmente sem ping
  const mentionedUsers = message.mentions?.users ? [...message.mentions.users.values()] : [];
  for (const target of mentionedUsers) {
    if (target.bot || target.id === message.author.id) continue;
    const targetAfk = wellbeing.getAfk(target.id);
    if (!targetAfk) continue;

    const cdKey = `${message.channel.id}:${target.id}`;
    const lastAt = recentAfkNotices.get(cdKey) || 0;
    if (Date.now() - lastAt < AFK_NOTICE_COOLDOWN_MS) continue;
    recentAfkNotices.set(cdKey, Date.now());

    const sinceRel = `<t:${Math.floor(targetAfk.since / 1000)}:R>`;
    const text = targetAfk.message
      ? t('wellbeing.afkMentionedWithReason', message.guild, {
          user: `**${target.displayName || target.username}**`,
          since: sinceRel,
          reason: targetAfk.message,
        })
      : t('wellbeing.afkMentionedNoReason', message.guild, {
          user: `**${target.displayName || target.username}**`,
          since: sinceRel,
        });

    await message.reply({ content: text, allowedMentions: NO_PING }).catch(() => null);
  }
}

module.exports = {
  id: 'wellbeing-pack',
  name: { 'pt-BR': 'Bem-Estar & Convivência', en: 'Wellbeing & Coexistence' },
  description: {
    'pt-BR': 'Lembretes pessoais gentis, aviso de ausência (AFK) sem exposição e aniversários opcionais sem guardar idade.',
    en: 'Gentle personal reminders, low-pressure AFK status without exposure, and opt-in birthdays without storing age.',
  },
  icon: '🌱',
  defaultEnabled: true,
  deliverDueReminders,
  announceDailyBirthdays,
  onMessageCreate,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerInterval(() => {
      deliverDueReminders(ctx.client).catch((err) => console.error('[WellbeingPack] Erro em lembretes:', err));
      announceDailyBirthdays(ctx.client).catch((err) => console.error('[WellbeingPack] Erro em aniversários:', err));
    }, 30000);
    ctx.registerListener('messageCreate', (message) => {
      onMessageCreate(message).catch((err) => console.error('[WellbeingPack] Erro no AFK:', err));
    });
  },

  async onUnload() {
    recentAfkNotices.clear();
  },
};


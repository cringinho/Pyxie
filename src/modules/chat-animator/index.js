// Animador de chat: quando um canal vivo fica quieto, a Pyxie solta uma pergunta leve, um
// "este ou aquele", uma enquete, um desafio criativo, uma curiosidade ou uma palavra embaralhada.
// Nunca interrompe conversa, nunca marca ninguém, respeita horário e limite, e espera mais quando
// ninguém responde. Desligado por padrão; tudo em /dashboard → Automações → Animador de chat.
const fs = require('node:fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const animator = require('../../services/animator');
const auto = require('../../services/automations');
const stats = require('../../services/automationStats');
const { getVentChannelId } = require('../../services/guildConfigService');
const { t, getLanguage } = require('../../utils/i18n');

const KEY = 'animator';
const TICK_MS = 5 * 60000;
const SCRAMBLE_MS = 10 * 60000;
const EPHEMERAL = 64;
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

const channels = new Map(); // channelId -> estado em memória
const guildLast = new Map(); // guildId -> último post
const votes = new Map(); // postKey -> Map(userId -> 'a'|'b')

function stateFile(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'guilds', String(guildId), 'animator.json');
}

// Só o que precisa sobreviver a um reinício: pausas, limite do dia e tentativas sem resposta.
function loadPersisted(guildId) {
  try {
    return JSON.parse(fs.readFileSync(stateFile(guildId), 'utf8')).channels || {};
  } catch (_) {
    return {};
  }
}

function persist(guildId) {
  const out = {};
  for (const [id, ch] of channels) if (ch.guildId === guildId) out[id] = { failures: ch.failures, pausedUntil: ch.pausedUntil, postsDay: ch.postsDay, postsToday: ch.postsToday };
  const file = stateFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ channels: out }));
  fs.renameSync(`${file}.tmp`, file);
}

function channelState(guildId, channelId) {
  if (!channels.has(channelId)) {
    const saved = loadPersisted(guildId)[channelId] || {};
    channels.set(channelId, { guildId, lastHumanAt: 0, stamps: [], lastWasBot: false, failures: saved.failures || 0, pausedUntil: saved.pausedUntil || 0, postsDay: saved.postsDay || '', postsToday: saved.postsToday || 0, active: null });
  }
  return channels.get(channelId);
}

const pauseRow = (lang, guildId, channelId) =>
  new ButtonBuilder().setCustomId(`anim:pause:${guildId}:${channelId}`).setLabel(t('animator.pause', lang)).setEmoji('⏸️').setStyle(ButtonStyle.Secondary);

function voteRow(lang, postKey, content, counts = { a: 0, b: 0 }) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`anim:vote:${postKey}:a`).setLabel(`${content.a} · ${counts.a}`).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`anim:vote:${postKey}:b`).setLabel(`${content.b} · ${counts.b}`).setStyle(ButtonStyle.Primary)
  );
}

// Monta a mensagem. O tom muda só a abertura; o rodapé lembra que a staff pode pausar.
function buildPost(lang, cfg, content, { guildId, channelId, postKey }) {
  const intro = t(`animator.tone.${cfg.tone}`, lang);
  const footer = `-# ${t('animator.footer', lang)}`;
  const pause = pauseRow(lang, guildId, channelId);
  const rolePrefix = cfg.pingRoleId ? `<@&${cfg.pingRoleId}> ` : '';
  const allowedMentions = cfg.pingRoleId ? { parse: [], users: [], roles: [cfg.pingRoleId], repliedUser: false } : NO_PING;
  if (content.type === 'poll') {
    return {
      content: `${rolePrefix}${intro}\n${footer}`,
      poll: { question: { text: content.text.slice(0, 300) }, answers: content.answers.map((a) => ({ text: a.slice(0, 55) })), duration: 4, allowMultiselect: false },
      components: [new ActionRowBuilder().addComponents(pause)],
      allowedMentions,
    };
  }
  if (content.type === 'thisOrThat') {
    return {
      content: `${rolePrefix}${intro}\n### ${content.a} ${t('animator.or', lang)} ${content.b}?\n${footer}`,
      components: [voteRow(lang, postKey, content), new ActionRowBuilder().addComponents(pause)],
      allowedMentions,
    };
  }
  const body = content.type === 'scramble' ? t('animator.scramble', lang, { word: `\`${content.text}\`` }) : content.text;
  if (cfg.useEmbed) {
    const colorHex = /^#[0-9a-f]{6}$/i.test(cfg.color || '') ? cfg.color : '#ec4899';
    const card = new EmbedBuilder()
      .setColor(colorHex)
      .setTitle(t(`animator.type.${content.type}`, lang))
      .setDescription(`${intro}\n\n> ${body}`)
      .setFooter({ text: t('animator.footer', lang) });
    return {
      ...(rolePrefix ? { content: rolePrefix.trim() } : {}),
      embeds: [card],
      components: [new ActionRowBuilder().addComponents(pause)],
      allowedMentions,
    };
  }
  return {
    content: `${rolePrefix}${intro}\n### ${t(`animator.type.${content.type}`, lang)}\n> ${body}\n${footer}`,
    components: [new ActionRowBuilder().addComponents(pause)],
    allowedMentions,
  };
}

function onMessage(message, client) {
  if (!message.guild) return null;
  const cfg = auto.getConfig(message.guild.id, KEY);
  if (!cfg.enabled || !cfg.channelIds.includes(message.channel.id)) return null;
  const ch = channelState(message.guild.id, message.channel.id);
  const now = message.createdTimestamp || Date.now();
  if (message.author?.bot) {
    ch.lastWasBot = message.author.id === client?.user?.id;
    return null;
  }
  ch.lastWasBot = false;
  ch.lastHumanAt = now;
  ch.stamps = [...ch.stamps.filter((s) => now - s < 24 * 3600000), now].slice(-200);
  const active = ch.active;
  if (active && !active.answered && now - active.at < animator.ANSWER_WINDOW_MS) {
    active.answered = true;
    ch.failures = 0;
    stats.bump(message.guild.id, KEY, 'answered');
    persist(message.guild.id);
  }
  if (active?.answer && now - active.at < SCRAMBLE_MS && animator.normalizeAnswer(message.content) === animator.normalizeAnswer(active.answer)) {
    active.answer = null;
    message.reply({ content: t('animator.scrambleWin', message.guild, { user: `<@${message.author.id}>`, word: `**${active.word}**` }), allowedMentions: NO_PING }).catch(() => null);
  }
  return null;
}

// Canal bloqueado agora? (desabafo, pausa de raid, modo blindagem)
function blocked(guild, channelId) {
  if (channelId === getVentChannelId(guild.id)) return true;
  if (require('../../services/raidWatch').isActive(guild.id)) return true;
  try {
    if (require('../../services/shieldMode').getShield(guild.id).enabled) return true;
  } catch (_) {}
  return false;
}

async function tick(client, now = Date.now(), rng = Math.random) {
  for (const guild of client.guilds.cache.values()) {
    const cfg = auto.getConfig(guild.id, KEY);
    if (!cfg.enabled) continue;
    const lang = getLanguage(guild.id);
    for (const channelId of cfg.channelIds) {
      const ch = channelState(guild.id, channelId);
      const channel = guild.channels.cache.get(channelId);
      // Post anterior: conta como "sem resposta" depois de 30 min e some sozinho se configurado.
      if (ch.active && !ch.active.answered) {
        if (!ch.active.counted && now - ch.active.at > animator.ANSWER_WINDOW_MS) {
          ch.active.counted = true;
          ch.failures += 1;
          persist(guild.id);
        }
        if (cfg.autoDeleteMinutes && now - ch.active.at > cfg.autoDeleteMinutes * 60000 && !ch.active.deleted) {
          ch.active.deleted = true;
          await channel?.messages?.delete(ch.active.messageId).catch(() => null);
        }
      }
      const decision = animator.shouldPost({
        now,
        cfg,
        ch: { lastHumanAt: ch.lastHumanAt, recent24h: ch.stamps.filter((s) => now - s < 24 * 3600000).length, lastWasBot: ch.lastWasBot, failures: ch.failures, pausedUntil: ch.pausedUntil, postsToday: ch.postsToday, postsDay: ch.postsDay },
        guildLastPostAt: guildLast.get(guild.id) || 0,
        blocked: blocked(guild, channelId),
      });
      if (decision !== 'post' || !channel?.isTextBased?.()) continue;
      // Sem permissão de enquete, pula esse tipo em vez de falhar no envio.
      const canPoll = channel.permissionsFor?.(guild.members.me)?.has(PermissionFlagsBits.SendPolls) !== false;
      const types = canPoll ? cfg.types : cfg.types.filter((x) => x !== 'poll');
      const content = animator.pickContent({ types, lang, houseLines: cfg.houseLines }, rng);
      if (!content) continue;
      const postKey = `${channelId.slice(-6)}${now.toString(36)}`;
      const sent = await channel.send(buildPost(lang, cfg, content, { guildId: guild.id, channelId, postKey })).catch(() => null);
      if (!sent) continue;
      const day = animator.brtDay(now);
      Object.assign(ch, { postsToday: ch.postsDay === day ? ch.postsToday + 1 : 1, postsDay: day, lastWasBot: true });
      ch.active = { messageId: sent.id, at: now, type: content.type, answered: false, answer: content.type === 'scramble' ? content.answer : null, word: content.answer, postKey, content };
      guildLast.set(guild.id, now);
      stats.bump(guild.id, KEY, 'posts');
      persist(guild.id);
    }
  }
}

async function handleInteraction(interaction) {
  const id = interaction.customId || '';
  if (!id.startsWith('anim:') || !interaction.guild) return;
  const [, kind, a, b, choice] = id.split(':');
  if (kind === 'pause') {
    if (!interaction.member?.permissionsIn?.(interaction.channel)?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: t('animator.pauseStaff', interaction), flags: EPHEMERAL });
    }
    const ch = channelState(a, b);
    ch.pausedUntil = Date.now() + 24 * 3600000;
    persist(a);
    return interaction.reply({ content: t('animator.paused', interaction), flags: EPHEMERAL });
  }
  if (kind === 'vote') {
    const postKey = a;
    const pick = b;
    const map = votes.get(postKey) || new Map();
    map.set(interaction.user.id, pick);
    votes.set(postKey, map);
    if (votes.size > 200) votes.delete(votes.keys().next().value);
    const counts = { a: 0, b: 0 };
    for (const v of map.values()) counts[v] += 1;
    const active = [...channels.values()].find((c) => c.active?.postKey === postKey)?.active;
    if (!active) return interaction.reply({ content: t('animator.voteClosed', interaction), flags: EPHEMERAL });
    const rows = interaction.message.components.map((row) => row);
    rows[0] = voteRow(getLanguage(interaction.guild.id), postKey, active.content, counts);
    return interaction.update({ components: rows });
  }
  return choice;
}

module.exports = {
  id: 'chat-animator',
  name: { 'pt-BR': 'Animador de Chat', en: 'Chat Animator' },
  description: {
    'pt-BR': 'Quando um canal vivo fica quieto, solta uma pergunta leve, enquete ou brincadeira. Nunca interrompe conversa, não marca ninguém e respeita horário e limite. Desligado por padrão.',
    en: 'When a lively channel goes quiet, drops a light question, poll or game. Never interrupts, never pings, respects hours and limits. Off by default.',
  },
  icon: '🎉',
  defaultEnabled: true,
  onMessage,
  tick,
  buildPost,
  handleInteraction,
  _channels: channels,
  _guildLast: guildLast,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('messageCreate', (message) => {
      try {
        onMessage(message, ctx.client);
      } catch (err) {
        console.error('[Animator] Erro ao contar mensagem:', err);
      }
    });
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction).catch((err) => console.error('[Animator] Erro no botão:', err));
    });
    ctx.registerInterval(() => tick(ctx.client).catch((err) => console.error('[Animator] Erro:', err)), TICK_MS);
  },

  async onUnload() {
    channels.clear();
    votes.clear();
  },
};

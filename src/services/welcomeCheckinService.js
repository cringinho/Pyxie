const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { CRINGELANDIA_GUILD_ID } = require('../config');
const { t, getLanguage } = require('../utils/i18n');
const welcomeFlow = require('./welcomeFlow');

// Acolhimento de 24h: um dia depois da entrada, quem ainda não puxou conversa (menos de 3
// mensagens) recebe um abraço em lote, sem cobrança. Por servidor: canal, cargo de quem não
// quer ser marcado e liga/desliga no painel (→ Acolhimento). Só o processo do bot grava o estado.
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'welcomeCheckinState.json');
const STATE_BACKUP = `${STATE_FILE}.bak`;

// Valores históricos da Cringelândia (agora são o padrão dela em src/services/welcomeFlow.js).
const TARGET_GUILD_ID = CRINGELANDIA_GUILD_ID || '1453890868980482090';
const SILENT_ROLE_ID = welcomeFlow.CRINGE_SILENT_ROLE_ID;
const CHECKIN_CHANNEL_ID = '1453890870288973825'; // #💬┃chati
const TUTORIAL_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1533657882862686218/1541908904487690321/dhj7hfn-842bcc59-b41f-4ef3-888b-dbfc210f4a5c.gif';

const BATCH_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h entre envios de lote (por servidor)
const USER_MIN_AGE_MS = 24 * 60 * 60 * 1000;   // Mínimo de 24h desde a entrada
const MAX_MESSAGES_THRESHOLD = 3;             // Apenas quem enviou < 3 mensagens
const MAX_PER_BATCH = 40;                     // Um lote não vira parede de menções

/**
 * 10 Modelos Distintos e Neuroafirmativos de Acolhimento ({server} = nome do servidor)
 */
const WELCOME_TEMPLATES = [
  {
    color: '#8b5cf6',
    pt: { title: '🌸  ✦  Pouso Suave na {server}', description: 'Passando para deixar um abraço bem quentinho! Lembramos com carinho que aqui você **não tem obrigação nenhuma de puxar assunto ou interagir**: sinta-se à vontade para apenas ler no seu tempo e curtir os cantinhos do servidor sem nenhuma pressão.' },
    en: { title: '🌸  ✦  A Soft Landing in {server}', description: 'Just stopping by to leave you a warm hug! A gentle reminder that here you **have no obligation at all to start a conversation or interact**: feel free to simply read at your own pace and enjoy the corners of the server with no pressure.' },
  },
  {
    color: '#10b981',
    pt: { title: '🌿  ✦  Aconchego & Respeito ao seu Tempo', description: 'Você já faz parte da nossa comunidade há pelo menos um dia! Queremos reforçar que você é muito bem-vindo(a), seja para conversar bastante ou apenas descansar nos canais silenciosos. Cada ritmo é sagrado por aqui.' },
    en: { title: '🌿  ✦  Comfort & Respect for Your Time', description: 'You have been part of our community for at least a day now! We want you to know you are truly welcome, whether you want to chat a lot or just rest in the quiet channels. Every pace is respected here.' },
  },
  {
    color: '#ec4899',
    pt: { title: '🍵  ✦  Chá da Tarde & Espaço Seguro', description: 'Um lembrete gentil de que nosso espaço é neuroafirmativo e respeita o ritmo de todo mundo. Não precisa ter vergonha de nada nem receio de errar: você é acolhido(a) exatamente do seu jeitinho.' },
    en: { title: '🍵  ✦  Afternoon Tea & a Safe Space', description: 'A gentle reminder that our space is neuro-affirming and respects everyone\'s pace. No need to feel embarrassed or afraid of getting things wrong: you are welcome exactly as you are.' },
  },
  {
    color: '#a855f7',
    pt: { title: '✨  ✦  Visita Afetuosa da Pyxie', description: 'Voei até aqui só para te lembrar que a {server} é um refúgio seguro. Fique à vontade para observar, desfrutar dos tópicos e aparecer no chat quando sua bateria social se sentir pronta e descansada.' },
    en: { title: '✨  ✦  A Warm Visit from Pyxie', description: 'I flew over just to remind you that {server} is a safe haven. Feel free to look around, enjoy the topics and show up in chat whenever your social battery feels rested and ready.' },
  },
  {
    color: '#f59e0b',
    pt: { title: '🧸  ✦  Boas Energias sem Cobranças', description: 'Sem cobranças, sem metas sociais e sem expectativas! Queríamos apenas registrar nossa alegria por ter sua presença iluminando o servidor. Sinta-se em casa.' },
    en: { title: '🧸  ✦  Good Vibes, No Pressure', description: 'No pressure, no social goals and no expectations! We just wanted to say how happy we are to have you brightening up the server. Make yourself at home.' },
  },
  {
    color: '#6366f1',
    pt: { title: '🌙  ✦  Recanto Tranquilo no seu Próprio Fluxo', description: 'Cada pessoa tem sua própria bateria social e necessidades de repouso, e nós honramos isso com todo o coração! Seja no silêncio ou na prosa, este espaço também pertence a você.' },
    en: { title: '🌙  ✦  A Quiet Corner at Your Own Pace', description: 'Everyone has their own social battery and need for rest, and we honor that with all our heart! Whether in silence or in conversation, this space belongs to you too.' },
  },
  {
    color: '#06b6d4',
    pt: { title: '🎨  ✦  Cores, Hobbies e Acolhimento Mútuo', description: 'Esperamos que suas primeiras 24 horas tenham sido confortáveis! Nossos canais de arte, jogos e desabafos estão sempre de portas abertas quando você quiser explorar com calma.' },
    en: { title: '🎨  ✦  Colors, Hobbies and Mutual Care', description: 'We hope your first 24 hours have been comfortable! Our art, games and support channels are always open whenever you feel like exploring calmly.' },
  },
  {
    color: '#14b8a6',
    pt: { title: '🕊️  ✦  Um Gesto de Carinho sem Exigência de Resposta', description: 'Não se preocupe em responder esta mensagem: este é apenas um gesto de carinho para você saber que sua chegada foi notada e que torcemos pelo seu bem-estar.' },
    en: { title: '🕊️  ✦  A Kind Gesture, No Reply Needed', description: 'Don\'t worry about replying to this message: it is just a kind gesture so you know your arrival was noticed and that we are rooting for your well-being.' },
  },
  {
    color: '#7c3aed',
    pt: { title: '🔮  ✦  Luz Suave no Reino da Penumbra', description: 'Que as fadas tragam leveza para o seu dia! Lembre-se de que cada dia tem seu próprio fluxo e você pode interagir nos canais sempre que bater vontade, no seu momento.' },
    en: { title: '🔮  ✦  A Soft Light in the Twilight Realm', description: 'May the fairies bring lightness to your day! Remember that every day has its own flow and you can join the channels whenever you feel like it, in your own time.' },
  },
  {
    color: '#f43f5e',
    pt: { title: '💖  ✦  Comunidade Neuroafirmativa & Cuidado', description: 'Respeito, acolhimento e escuta sem julgamentos são nossos pilares fundamentais. Muito obrigado por fazer parte da {server}, no seu ritmo e com a sua autenticidade.' },
    en: { title: '💖  ✦  A Neuro-Affirming, Caring Community', description: 'Respect, warmth and listening without judgment are our core pillars. Thank you so much for being part of {server}, at your own pace and with your own authenticity.' },
  },
];

// Estado em memória O(1). Chaves `${guildId}:${userId}`.
const lastBatchByGuild = new Map(); // guildId -> timestamp
let lastTemplateIndex = -1;
const pendingNewcomers = new Map(); // guildId:userId -> { joinedAt: number, msgCount: number }
const welcomedOnceSet = new Set();  // Set<guildId:userId>

// O estado antigo (só Cringelândia) guardava o ID puro: vira `${Cringelândia}:${id}`.
const keyOf = (guildId, userId) => (String(userId).includes(':') ? String(userId) : `${guildId}:${userId}`);

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadState() {
  ensureStorage();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      lastBatchByGuild.clear();
      if (data.lastBatchByGuild && typeof data.lastBatchByGuild === 'object') {
        for (const [g, at] of Object.entries(data.lastBatchByGuild)) lastBatchByGuild.set(g, Number(at) || 0);
      } else if (data.lastBatchSentAt) {
        lastBatchByGuild.set(TARGET_GUILD_ID, Number(data.lastBatchSentAt) || 0);
      }
      lastTemplateIndex = Number.isFinite(Number(data.lastTemplateIndex)) ? Number(data.lastTemplateIndex) : -1;

      pendingNewcomers.clear();
      if (data.pendingNewcomers && typeof data.pendingNewcomers === 'object') {
        for (const [id, entry] of Object.entries(data.pendingNewcomers)) {
          if (entry && entry.joinedAt) {
            pendingNewcomers.set(keyOf(TARGET_GUILD_ID, id), {
              joinedAt: Number(entry.joinedAt) || Date.now(),
              msgCount: Number(entry.msgCount) || 0,
            });
          }
        }
      }

      welcomedOnceSet.clear();
      if (Array.isArray(data.welcomedOnceUsers)) {
        for (const id of data.welcomedOnceUsers) {
          welcomedOnceSet.add(keyOf(TARGET_GUILD_ID, id));
        }
      }
    }
  } catch (err) {
    console.warn('[welcomeCheckin] Falha ao carregar welcomeCheckinState.json:', err.message);
  }
}

function saveState() {
  ensureStorage();
  const tmpFile = `${STATE_FILE}.${process.pid}.${Date.now()}.tmp`;
  const payload = {
    lastBatchByGuild: Object.fromEntries(lastBatchByGuild),
    lastTemplateIndex,
    pendingNewcomers: Object.fromEntries(pendingNewcomers),
    welcomedOnceUsers: Array.from(welcomedOnceSet),
    updatedAt: Date.now(),
  };

  try {
    fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
    if (fs.existsSync(STATE_FILE)) {
      try { fs.copyFileSync(STATE_FILE, STATE_BACKUP); } catch (_) {}
    }
    fs.renameSync(tmpFile, STATE_FILE);
  } catch (err) {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
    console.error('[welcomeCheckin] Erro ao salvar estado de acolhimento:', err.message);
  }
}

// Inicializa o estado
loadState();

/**
 * Evento O(1): Novo membro entra num servidor com o acolhimento de 24h ligado
 */
function onGuildMemberAdd(member) {
  if (!member || member.user?.bot || !member.guild) return;
  const cfg = welcomeFlow.getConfig(member.guild.id).checkin;
  if (!cfg.enabled) return;

  const key = keyOf(member.guild.id, member.id);

  // 1. Já recebeu acolhimento ou já é veterano? Ignora para sempre.
  if (welcomedOnceSet.has(key)) return;

  // 2. Possui o cargo de quem não quer ser marcado? NUNCA marca.
  if (cfg.silentRoleId && member.roles?.cache?.has(cfg.silentRoleId)) return;

  // 3. Adiciona na fila de acompanhamento de 24h
  if (!pendingNewcomers.has(key)) {
    pendingNewcomers.set(key, {
      joinedAt: member.joinedTimestamp || Date.now(),
      msgCount: 0,
    });
    saveState();
  }
}

/**
 * Evento O(1): Mensagem enviada no chat
 * Se o membro já enviou 3+ mensagens, remove do lote e marca como acolhido (já está interagindo sozinho!).
 */
function onMessageCreate(message) {
  if (!message || message.author?.bot) return;
  const guildId = message.guildId || message.guild?.id;
  if (!guildId) return;
  const key = keyOf(guildId, message.author.id);

  if (pendingNewcomers.has(key)) {
    const entry = pendingNewcomers.get(key);
    entry.msgCount = (entry.msgCount || 0) + 1;

    if (entry.msgCount >= MAX_MESSAGES_THRESHOLD) {
      pendingNewcomers.delete(key);
      welcomedOnceSet.add(key);
      saveState();
    }
  }
}

/**
 * Constrói o Embed e Componentes de um lote de acolhimento
 */
function buildCheckinPayload({ userIds = [], templateIndex = 0, guild = null, channelId = CHECKIN_CHANNEL_ID }) {
  const g = guild || { id: TARGET_GUILD_ID, name: 'Cringelândia' };
  const lang = getLanguage(String(g.id)) === 'en' ? 'en' : 'pt';
  const template = WELCOME_TEMPLATES[templateIndex % WELCOME_TEMPLATES.length];
  const server = g.name || t('periodic.bump.fallbackServer', lang);
  const fill = (s) => s.replaceAll('{server}', server);

  const mentionsText = userIds.map((id) => `<@${id}>`).join(' ');

  const embed = new EmbedBuilder()
    .setColor(template.color)
    .setTitle(fill(template[lang].title))
    .setDescription(
      `${fill(template[lang].description)}\n\n` +
      `### ${t('welcomeFlow.checkinRolesTitle', lang)}\n\n` +
      `${t('welcomeFlow.checkinRolesText', lang)}\n\n` +
      `-# ${t('welcomeFlow.checkinNote', lang)}`
    )
    .setImage(TUTORIAL_IMAGE_URL)
    .setFooter({ text: t('welcomeFlow.checkinFooter', lang, { server }) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('welcomeFlow.checkinButton', lang))
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${g.id}/${channelId}`)
  );

  return {
    content: mentionsText ? t('welcomeFlow.checkinContent', lang, { users: mentionsText }) : undefined,
    embeds: [embed],
    components: [row],
    allowedMentions: {
      parse: [],
      users: userIds,
      roles: [],
      repliedUser: false,
    },
  };
}

// Um servidor: confere a fila dele e manda o lote se já passou o tempo.
async function dispatchGuild(guild, cfg, { force = false, now = Date.now() } = {}) {
  if (!force && now - (lastBatchByGuild.get(guild.id) || 0) < BATCH_COOLDOWN_MS) {
    return { dispatched: false, reason: 'COOLDOWN_ACTIVE' };
  }

  // Elegíveis: >= 24h no servidor, < 3 mensagens, sem o cargo de quem não quer ser marcado
  const eligibleUserIds = [];
  const prefix = `${guild.id}:`;

  for (const [key, entry] of pendingNewcomers.entries()) {
    if (!key.startsWith(prefix) || eligibleUserIds.length >= MAX_PER_BATCH) continue;
    const userId = key.slice(prefix.length);
    if (!force && now - entry.joinedAt < USER_MIN_AGE_MS) continue;
    if ((entry.msgCount || 0) >= MAX_MESSAGES_THRESHOLD) {
      // Já mandou 3+ mensagens
      pendingNewcomers.delete(key);
      welcomedOnceSet.add(key);
      continue;
    }
    const member = guild.members.cache.get(userId) || (await guild.members.fetch(userId).catch(() => null));
    if (!member) {
      // Já saiu do servidor
      pendingNewcomers.delete(key);
    } else if (cfg.silentRoleId && member.roles.cache.has(cfg.silentRoleId)) {
      // Pegou o cargo de silêncio: arquiva e remove
      pendingNewcomers.delete(key);
      welcomedOnceSet.add(key);
    } else {
      eligibleUserIds.push(userId);
    }
  }

  if (eligibleUserIds.length === 0) {
    return { dispatched: false, reason: 'NO_ELIGIBLE_USERS' };
  }

  const channel = guild.channels?.cache?.get(cfg.channelId) || (await guild.channels.fetch(cfg.channelId).catch(() => null));
  if (!channel || !channel.isTextBased()) {
    console.warn(`[welcomeCheckin] Canal de acolhimento ${cfg.channelId} não encontrado em ${guild.id}.`);
    return { dispatched: false, reason: 'CHANNEL_NOT_FOUND' };
  }

  // Modelo rotativo sem repetir o anterior
  lastTemplateIndex = (lastTemplateIndex + 1) % WELCOME_TEMPLATES.length;
  const payload = buildCheckinPayload({ userIds: eligibleUserIds, templateIndex: lastTemplateIndex, guild, channelId: cfg.channelId });

  try {
    const sentMsg = await channel.send(payload);
    lastBatchByGuild.set(guild.id, now);
    for (const uid of eligibleUserIds) {
      pendingNewcomers.delete(`${prefix}${uid}`);
      welcomedOnceSet.add(`${prefix}${uid}`);
    }
    saveState();
    console.log(`[welcomeCheckin] ✅ Lote de acolhimento enviado em ${guild.id} para ${eligibleUserIds.length} membros (Msg ID: ${sentMsg.id})`);
    return { dispatched: true, userCount: eligibleUserIds.length, messageId: sentMsg.id };
  } catch (err) {
    console.error('[welcomeCheckin] Falha ao enviar lote de acolhimento:', err.message);
    return { dispatched: false, error: err.message };
  }
}

/**
 * Confere e dispara o lote de 24h em cada servidor com o acolhimento ligado.
 */
async function checkAndDispatchBatch(client, { force = false, guildId = null, now = Date.now() } = {}) {
  const results = {};
  for (const guild of client.guilds?.cache?.values?.() || []) {
    if (guildId && guild.id !== guildId) continue;
    const cfg = welcomeFlow.getConfig(guild.id).checkin;
    if (!cfg.enabled || !cfg.channelId) continue;
    results[guild.id] = await dispatchGuild(guild, cfg, { force, now });
  }
  return results;
}

// Quando o próximo lote pode sair (para a agenda). Lê do arquivo: o painel roda em outro processo.
function nextBatchAt(guildId, now = Date.now()) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) || {};
  } catch (_) {}
  const last = Number(data.lastBatchByGuild?.[guildId] ?? (String(guildId) === TARGET_GUILD_ID ? data.lastBatchSentAt : 0)) || 0;
  let earliest = null;
  for (const [id, entry] of Object.entries(data.pendingNewcomers || {})) {
    if (keyOf(TARGET_GUILD_ID, id).split(':')[0] !== String(guildId) || !entry?.joinedAt) continue;
    const at = Number(entry.joinedAt) + USER_MIN_AGE_MS;
    if (earliest === null || at < earliest) earliest = at;
  }
  if (earliest === null) return null;
  return Math.max(now, earliest, last + BATCH_COOLDOWN_MS);
}

/**
 * Status para monitoramento (de um servidor quando guildId vem)
 */
function getStatus(guildId = null) {
  const count = (keys) => (guildId ? [...keys].filter((k) => k.startsWith(`${guildId}:`)).length : [...keys].length);
  return {
    lastBatchSentAt: guildId ? lastBatchByGuild.get(String(guildId)) || 0 : Math.max(0, ...lastBatchByGuild.values()),
    lastTemplateIndex,
    pendingCount: count(pendingNewcomers.keys()),
    welcomedCount: count(welcomedOnceSet),
    templatesCount: WELCOME_TEMPLATES.length,
  };
}

module.exports = {
  TARGET_GUILD_ID,
  SILENT_ROLE_ID,
  CHECKIN_CHANNEL_ID,
  WELCOME_TEMPLATES,
  keyOf,
  onGuildMemberAdd,
  onMessageCreate,
  buildCheckinPayload,
  checkAndDispatchBatch,
  nextBatchAt,
  getStatus,
  // Para testes
  _pendingNewcomers: pendingNewcomers,
  _welcomedOnceSet: welcomedOnceSet,
};

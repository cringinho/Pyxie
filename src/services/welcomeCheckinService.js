const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { STARTUP_CHANNEL_ID, CRINGELANDIA_GUILD_ID } = require('../config');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STATE_FILE = path.join(DATA_DIR, 'welcomeCheckinState.json');
const STATE_BACKUP = `${STATE_FILE}.bak`;

const TARGET_GUILD_ID = CRINGELANDIA_GUILD_ID || '1453890868980482090';
const SILENT_ROLE_ID = '1455923442560925929';
const CHECKIN_CHANNEL_ID = '1453890870288973825'; // #💬┃chati
const PRESENTATIONS_URL = `https://discord.com/channels/${TARGET_GUILD_ID}/${CHECKIN_CHANNEL_ID}`;
const TUTORIAL_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1533657882862686218/1541908904487690321/dhj7hfn-842bcc59-b41f-4ef3-888b-dbfc210f4a5c.gif';

const BATCH_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h entre envios de lote
const USER_MIN_AGE_MS = 24 * 60 * 60 * 1000;   // Mínimo de 24h desde a entrada
const MAX_MESSAGES_THRESHOLD = 3;             // Apenas quem enviou < 3 mensagens

/**
 * 10 Modelos Distintos e Neuroafirmativos de Acolhimento
 */
const WELCOME_TEMPLATES = [
  {
    title: '🌸  ✦  Pouso Suave na Cringelândia',
    description: 'Passando para deixar um abraço bem quentinho! Lembramos com carinho que aqui você **não tem obrigação nenhuma de puxar assunto ou interagir**: sinta-se à vontade para apenas ler no seu tempo e curtir os cantinhos do servidor sem nenhuma pressão.',
    color: '#8b5cf6',
  },
  {
    title: '🌿  ✦  Aconchego & Respeito ao seu Tempo',
    description: 'Você já faz parte da nossa comunidade há pelo menos um dia! Queremos reforçar que você é muito bem-vindo(a), seja para conversar bastante ou apenas descansar nos canais silenciosos. Cada ritmo é sagrado por aqui.',
    color: '#10b981',
  },
  {
    title: '🍵  ✦  Chá da Tarde & Espaço Seguro',
    description: 'Um lembrete gentil de que nosso espaço é neuroafirmativo e respeita o ritmo de todo mundo. Não precisa ter vergonha de nada nem receio de errar: você é acolhido(a) exatamente do seu jeitinho.',
    color: '#ec4899',
  },
  {
    title: '✨  ✦  Visita Afetuosa da Pyxie',
    description: 'Voei até aqui só para te lembrar que a Cringelândia é um refúgio seguro. Fique à vontade para observar, desfrutar dos tópicos e aparecer no chat quando sua bateria social se sentir pronta e descansada.',
    color: '#a855f7',
  },
  {
    title: '🧸  ✦  Boas Energias sem Cobranças',
    description: 'Sem cobranças, sem metas sociais e sem expectativas! Queríamos apenas registrar nossa alegria por ter sua presença iluminando o servidor. Sinta-se em casa.',
    color: '#f59e0b',
  },
  {
    title: '🌙  ✦  Recanto Tranquilo no seu Próprio Fluxo',
    description: 'Cada pessoa tem sua própria bateria social e necessidades de repouso, e nós honramos isso com todo o coração! Seja no silêncio ou na prosa, este espaço também pertence a você.',
    color: '#6366f1',
  },
  {
    title: '🎨  ✦  Cores, Hobbies e Acolhimento Mútuo',
    description: 'Esperamos que suas primeiras 24 horas tenham sido confortáveis! Nossos canais de arte, jogos e desabafos estão sempre de portas abertas quando você quiser explorar com calma.',
    color: '#06b6d4',
  },
  {
    title: '🕊️  ✦  Um Gesto de Carinho sem Exigência de Resposta',
    description: 'Não se preocupe em responder esta mensagem: este é apenas um gesto de carinho para você saber que sua chegada foi notada e que torcemos pelo seu bem-estar.',
    color: '#14b8a6',
  },
  {
    title: '🔮  ✦  Luz Suave no Reino da Penumbra',
    description: 'Que as fadas tragam leveza para o seu dia! Lembre-se de que cada dia tem seu próprio fluxo e você pode interagir nos canais sempre que bater vontade, no seu momento.',
    color: '#7c3aed',
  },
  {
    title: '💖  ✦  Comunidade Neuroafirmativa & Cuidado',
    description: 'Respeito, acolhimento e escuta sem julgamentos são nossos pilares fundamentais. Muito obrigado por fazer parte da Cringelândia, no seu ritmo e com a sua autenticidade.',
    color: '#f43f5e',
  },
];

// Estado em memória O(1)
let lastBatchSentAt = 0;
let lastTemplateIndex = -1;
const pendingNewcomers = new Map(); // userId -> { joinedAt: number, msgCount: number }
const welcomedOnceSet = new Set();  // Set<userId>

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadState() {
  ensureStorage();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      const data = JSON.parse(raw);
      lastBatchSentAt = Number(data.lastBatchSentAt) || 0;
      lastTemplateIndex = Number(data.lastTemplateIndex) ?? -1;

      pendingNewcomers.clear();
      if (data.pendingNewcomers && typeof data.pendingNewcomers === 'object') {
        for (const [id, entry] of Object.entries(data.pendingNewcomers)) {
          if (entry && entry.joinedAt) {
            pendingNewcomers.set(id, {
              joinedAt: Number(entry.joinedAt) || Date.now(),
              msgCount: Number(entry.msgCount) || 0,
            });
          }
        }
      }

      welcomedOnceSet.clear();
      if (Array.isArray(data.welcomedOnceUsers)) {
        for (const id of data.welcomedOnceUsers) {
          welcomedOnceSet.add(String(id));
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
  const plainNewcomers = {};
  for (const [id, entry] of pendingNewcomers.entries()) {
    plainNewcomers[id] = entry;
  }

  const payload = {
    lastBatchSentAt,
    lastTemplateIndex,
    pendingNewcomers: plainNewcomers,
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
 * Evento O(1): Novo membro entra na Cringelândia
 */
function onGuildMemberAdd(member) {
  if (!member || member.user?.bot) return;
  if (member.guild.id !== TARGET_GUILD_ID) return;

  const userId = member.id;

  // 1. Já recebeu acolhimento ou já é veterano? Ignora para sempre.
  if (welcomedOnceSet.has(userId)) return;

  // 2. Possui o cargo de silêncio estrito 1455923442560925929? NUNCA marca.
  if (member.roles?.cache?.has(SILENT_ROLE_ID)) return;

  // 3. Adiciona na fila de acompanhamento de 24h
  if (!pendingNewcomers.has(userId)) {
    pendingNewcomers.set(userId, {
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
  const authorId = message.author.id;

  if (pendingNewcomers.has(authorId)) {
    const entry = pendingNewcomers.get(authorId);
    entry.msgCount = (entry.msgCount || 0) + 1;

    if (entry.msgCount >= MAX_MESSAGES_THRESHOLD) {
      pendingNewcomers.delete(authorId);
      welcomedOnceSet.add(authorId);
      saveState();
    }
  }
}

/**
 * Constrói o Embed e Componentes de um lote de acolhimento
 */
function buildCheckinPayload({ userIds = [], templateIndex = 0 }) {
  const template = WELCOME_TEMPLATES[templateIndex % WELCOME_TEMPLATES.length];

  const mentionsText = userIds.map((id) => `<@${id}>`).join(' ');

  const embed = new EmbedBuilder()
    .setColor(template.color)
    .setTitle(template.title)
    .setDescription(
      `${template.description}\n\n` +
      `💡 **Guia Didático: Canais e Cargos**\n` +
      `No topo da lista de canais, clique na opção **Canais e Cargos** (<id:customize>) para escolher pronomes, cores e ativar notificações de eventos sem receber pings indesejados!`
    )
    .setImage(TUTORIAL_IMAGE_URL)
    .setFooter({ text: 'Cringelândia • Acolhimento 100% Neuroafirmativo & Gentil' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('👋 Ir para Apresentações')
      .setStyle(ButtonStyle.Link)
      .setURL(PRESENTATIONS_URL)
  );

  return {
    content: mentionsText ? `🌸 Um abraço afetuoso aos nossos novos amigos: ${mentionsText}` : undefined,
    embeds: [embed],
    components: [row],
    allowedMentions: {
      users: userIds,
      roles: [],
      repliedUser: false,
    },
  };
}

/**
 * Verifica e dispara o lote de 24h para novatos tímidos
 */
async function checkAndDispatchBatch(client, { force = false } = {}) {
  const now = Date.now();

  // 1. Trava estrita de 24h entre lotes
  if (!force && (now - lastBatchSentAt < BATCH_COOLDOWN_MS)) {
    return { dispatched: false, reason: 'COOLDOWN_ACTIVE' };
  }

  const guild = client.guilds?.cache?.get(TARGET_GUILD_ID);
  if (!guild) {
    return { dispatched: false, reason: 'GUILD_NOT_FOUND' };
  }

  // 2. Filtra membros elegíveis: >= 24h no servidor, < 3 mensagens, sem cargo de silêncio
  const eligibleUserIds = [];

  for (const [userId, entry] of pendingNewcomers.entries()) {
    if (force || (now - entry.joinedAt >= USER_MIN_AGE_MS)) {
      if ((entry.msgCount || 0) < MAX_MESSAGES_THRESHOLD) {
        const member = guild.members.cache.get(userId) || (await guild.members.fetch(userId).catch(() => null));
        if (member) {
          // Exclusão estrita por cargo
          if (!member.roles.cache.has(SILENT_ROLE_ID)) {
            eligibleUserIds.push(userId);
          } else {
            // Se adquiriu o cargo de silêncio, arquiva e remove
            pendingNewcomers.delete(userId);
            welcomedOnceSet.add(userId);
          }
        } else {
          // Membro já saiu da guilda
          pendingNewcomers.delete(userId);
        }
      } else {
        // Já mandou 3+ mensagens
        pendingNewcomers.delete(userId);
        welcomedOnceSet.add(userId);
      }
    }
  }

  if (eligibleUserIds.length === 0) {
    return { dispatched: false, reason: 'NO_ELIGIBLE_USERS' };
  }

  // 3. Seleciona modelo rotativo sem repetir o anterior
  let nextIndex = (lastTemplateIndex + 1) % WELCOME_TEMPLATES.length;
  if (nextIndex === lastTemplateIndex && WELCOME_TEMPLATES.length > 1) {
    nextIndex = (nextIndex + 1) % WELCOME_TEMPLATES.length;
  }
  lastTemplateIndex = nextIndex;

  const channel = guild.channels?.cache?.get(CHECKIN_CHANNEL_ID) || (await guild.channels.fetch(CHECKIN_CHANNEL_ID).catch(() => null));
  if (!channel || !channel.isTextBased()) {
    console.warn(`[welcomeCheckin] Canal de acolhimento ${CHECKIN_CHANNEL_ID} não encontrado.`);
    return { dispatched: false, reason: 'CHANNEL_NOT_FOUND' };
  }

  const payload = buildCheckinPayload({ userIds: eligibleUserIds, templateIndex: nextIndex });

  try {
    const sentMsg = await channel.send(payload);

    // 4. Marca todos como acolhidos e atualiza timestamps
    lastBatchSentAt = now;
    for (const uid of eligibleUserIds) {
      pendingNewcomers.delete(uid);
      welcomedOnceSet.add(uid);
    }
    saveState();

    console.log(`[welcomeCheckin] ✅ Lote de acolhimento enviado com sucesso para ${eligibleUserIds.length} membros (Msg ID: ${sentMsg.id})`);
    return { dispatched: true, userCount: eligibleUserIds.length, messageId: sentMsg.id };
  } catch (err) {
    console.error('[welcomeCheckin] Falha ao enviar lote de acolhimento:', err.message);
    return { dispatched: false, error: err.message };
  }
}

/**
 * Retorna status para monitoramento no /admin
 */
function getStatus() {
  return {
    lastBatchSentAt,
    lastTemplateIndex,
    pendingCount: pendingNewcomers.size,
    welcomedCount: welcomedOnceSet.size,
    templatesCount: WELCOME_TEMPLATES.length,
  };
}

module.exports = {
  TARGET_GUILD_ID,
  SILENT_ROLE_ID,
  CHECKIN_CHANNEL_ID,
  WELCOME_TEMPLATES,
  onGuildMemberAdd,
  onMessageCreate,
  buildCheckinPayload,
  checkAndDispatchBatch,
  getStatus,
  // Para testes
  _pendingNewcomers: pendingNewcomers,
  _welcomedOnceSet: welcomedOnceSet,
};


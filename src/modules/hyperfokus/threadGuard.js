const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');
const { getCommunityConfig } = require('../../services/communityConfig');
const { getLanguage, t } = require('../../utils/i18n');
const draftStore = require('./draftStore');
const articleStore = require('./articleStore');
const { markdownToHtml } = require('./markdown');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';
const SENSITIVE_TAG_KEYWORDS = [
  'saúde mental',
  'mental health',
  'autismo',
  'autism',
  'sensorial',
  'sensory',
  'crise',
  'crisis',
  'luto',
  'grief',
  'depressão',
  'ansiedade',
];

// Debounce map por thread: threadId -> timer
const stickyTimers = new Map();
// Rate limit de apagar mensagens por thread: threadId -> { count, windowStart }
const deleteRateLimits = new Map();

function isForumTracked(thread) {
  if (!thread || !thread.guildId || thread.guildId !== CRINGELANDIA_GUILD_ID) return false;
  if (!thread.isThread()) return false;
  const cfg = getCommunityConfig(thread.guildId).hyperfocus;
  if (!cfg || !Array.isArray(cfg.forumIds)) return false;
  return cfg.forumIds.includes(thread.parentId);
}

function hasSensitiveTags(thread) {
  try {
    const available = thread.parent?.availableTags || [];
    const applied = thread.appliedTags || [];
    const tagNames = available
      .filter((t) => applied.includes(t.id))
      .map((t) => t.name.toLowerCase());
    return tagNames.some((name) =>
      SENSITIVE_TAG_KEYWORDS.some((kw) => name.includes(kw))
    );
  } catch (_) {
    return false;
  }
}

function buildStickyPayload(thread, lang = 'pt') {
  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(t('hyperfokus.stickyTitle', lang))
    .setDescription(t('hyperfokus.stickyDesc', lang))
    .setFooter({ text: 'Pyxie Hyperfokus • Rascunho Editorial' })
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId(`hyperfokus_conclude:${thread.id}`)
    .setLabel(t('hyperfokus.stickyBtnConclude', lang))
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);
  return { embeds: [embed], components: [row] };
}

async function sendOrRefreshSticky(thread, client) {
  if (!thread || !thread.id) return;
  const draft = draftStore.getDraft(thread.id);
  if (!draft || draft.status !== 'DRAFT') return;

  const lang = getLanguage(thread.guildId);
  const payload = buildStickyPayload(thread, lang);

  // Remove sticky anterior se existir
  if (draft.stickyMessageId) {
    try {
      const oldMsg = await thread.messages.fetch(draft.stickyMessageId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    } catch (_) {}
  }

  try {
    const newMsg = await thread.send(payload);
    draftStore.setStickyMessageId(thread.id, newMsg.id);
  } catch (err) {
    console.error(`[ThreadGuard] Erro ao enviar sticky na thread ${thread.id}:`, err.message);
  }
}

function scheduleStickyDebounce(thread, client) {
  if (!thread || !thread.id) return;
  if (stickyTimers.has(thread.id)) {
    clearTimeout(stickyTimers.get(thread.id));
  }
  const timer = setTimeout(() => {
    stickyTimers.delete(thread.id);
    sendOrRefreshSticky(thread, client).catch(() => {});
  }, 3000); // 3 segundos de debounce
  stickyTimers.set(thread.id, timer);
}

async function onThreadCreate(thread, newlyCreated, client) {
  if (!newlyCreated || !isForumTracked(thread)) return false;

  const draft = draftStore.createOrUpdateDraft(thread.id, {
    guildId: thread.guildId,
    ownerId: thread.ownerId,
    status: 'DRAFT',
  });

  // Envia sticky inicial
  scheduleStickyDebounce(thread, client);
  return true;
}

async function onMessageCreate(message, client) {
  if (!message || !message.channel || !message.channel.isThread()) return false;
  if (message.guildId !== CRINGELANDIA_GUILD_ID) return false;

  const thread = message.channel;
  const draft = draftStore.getDraft(thread.id);
  if (!draft || draft.status !== 'DRAFT') return false;

  // Se a própria Pyxie ou qualquer outro bot postar, não trata como intrusão
  if (message.author.bot) return false;

  // Isenção da staff (quem tem ManageThreads ou ManageMessages pode moderar/ajudar)
  const member = message.member || (await message.guild?.members?.fetch(message.author.id).catch(() => null));
  const isStaff = member?.permissions?.has(PermissionsBitField.Flags.ManageThreads) ||
                  member?.permissions?.has(PermissionsBitField.Flags.ManageMessages);
  if (isStaff) return false;

  // Checa se quem digitou é autor ou coautor
  const isAuthorized = draftStore.isAuthorOrCollaborator(thread.id, message.author.id);
  if (isAuthorized) {
    // Autor/coautor postou conteúdo do artigo -> reagenda o sticky no final
    scheduleStickyDebounce(thread, client);
    return false;
  }

  // Não é autor/coautor -> INTRUSÃO DETECTADA: Apaga a mensagem
  try {
    await message.delete().catch(() => {});
  } catch (_) {}

  // Rate limit de aviso contra flood de trolls (máx 5 avisos a cada 10s por thread)
  const now = Date.now();
  const rl = deleteRateLimits.get(thread.id) || { count: 0, windowStart: now };
  if (now - rl.windowStart > 10000) {
    rl.count = 1;
    rl.windowStart = now;
  } else {
    rl.count++;
  }
  deleteRateLimits.set(thread.id, rl);
  if (rl.count > 5) return true; // Ignora notificações adicionais durante flood

  // Determina tom acolhedor vs tsundere
  const sensitive = hasSensitiveTags(thread);
  const lang = getLanguage(message.guildId);
  const noticeText = sensitive
    ? t('hyperfokus.draftNoticeSensitive', lang)
    : t('hyperfokus.draftNotice', lang);

  // Tenta enviar por DM primeiro
  let dmSent = false;
  try {
    await message.author.send(`**Pyxie Hyperfokus:** ${noticeText}`);
    dmSent = true;
  } catch (_) {
    dmSent = false;
  }

  // Se a DM falhou, envia no chat e apaga em 8 segundos
  if (!dmSent) {
    try {
      const tempMsg = await thread.send({
        content: `${message.author.toString()} 🌸 ${noticeText}`,
        allowedMentions: { users: [message.author.id] },
      });
      setTimeout(() => {
        tempMsg.delete().catch(() => {});
      }, 8000);
    } catch (_) {}
  }

  return true;
}

async function concludeDraft({ thread, user, interaction, client }) {
  if (!thread || !thread.id) return { success: false, error: 'thread_not_found' };
  const draft = draftStore.getDraft(thread.id);
  if (!draft) return { success: false, error: 'draft_not_found' };
  if (draft.status !== 'DRAFT') {
    return { success: false, error: 'already_concluded' };
  }

  const userId = String(user.id);
  if (!draftStore.isAuthorOrCollaborator(thread.id, userId)) {
    return { success: false, error: 'not_author_or_collab' };
  }

  // 1. Atualiza status no draftStore
  draftStore.updateStatus(thread.id, 'PENDING_REVIEW');

  // 2. Remove o sticky anterior
  if (draft.stickyMessageId) {
    try {
      const oldMsg = await thread.messages.fetch(draft.stickyMessageId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});
    } catch (_) {}
    draftStore.setStickyMessageId(thread.id, null);
  }

  // 3. Coleta mensagens do tópico para compor o artigo
  let starterContent = '';
  let starterAttachments = [];
  try {
    const starter = await thread.fetchStarterMessage().catch(() => null);
    if (starter) {
      starterContent = starter.content || '';
      starterAttachments = [...starter.attachments.values()].map((a) => a.url);
    }
  } catch (_) {}

  // Busca mensagens adicionais do autor e coautores
  const fetchedMsgs = await thread.messages.fetch({ limit: 100 }).catch(() => null);
  const authorsSet = new Set([draft.ownerId, ...draft.collaborators]);
  const messagesList = fetchedMsgs ? [...fetchedMsgs.values()].reverse() : [];

  const articleParagraphs = [starterContent];
  const allMediaUrls = [...starterAttachments];

  for (const m of messagesList) {
    if (authorsSet.has(m.author.id) && !m.author.bot) {
      if (m.content && m.content.trim() && m.content !== starterContent) {
        articleParagraphs.push(m.content);
      }
      if (m.attachments && m.attachments.size > 0) {
        for (const a of m.attachments.values()) {
          allMediaUrls.push(a.url);
        }
      }
    }
  }

  const fullMarkdown = articleParagraphs.filter(Boolean).join('\n\n');
  const fullHtml = markdownToHtml(fullMarkdown);

  // Extrai tags
  const availableTags = thread.parent?.availableTags || [];
  const appliedTagIds = thread.appliedTags || [];
  const categoryTags = availableTags
    .filter((t) => appliedTagIds.includes(t.id))
    .map((t) => t.name);

  // Monta lista de autores
  const authorsList = [];
  const ownerMember = await thread.guild.members.fetch(draft.ownerId).catch(() => null);
  authorsList.push({
    userId: draft.ownerId,
    username: ownerMember?.user?.username || ownerMember?.displayName || 'Autor',
    globalName: ownerMember?.user?.globalName || null,
    cachedAvatarWebp: ownerMember?.user?.displayAvatarURL({ extension: 'webp' }) || null,
    role: 'AUTHOR',
  });

  for (const collabId of draft.collaborators) {
    const collabMember = await thread.guild.members.fetch(collabId).catch(() => null);
    authorsList.push({
      userId: collabId,
      username: collabMember?.user?.username || collabMember?.displayName || 'Coautor',
      globalName: collabMember?.user?.globalName || null,
      cachedAvatarWebp: collabMember?.user?.displayAvatarURL({ extension: 'webp' }) || null,
      role: 'COLLABORATOR',
    });
  }

  const slug = thread.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `artigo-${thread.id}`;

  const articleId = `art_${thread.id}`;
  const savedArticle = await articleStore.saveArticle({
    id: articleId,
    slug,
    discordThreadId: thread.id,
    title: thread.name,
    contentMarkdown: fullMarkdown,
    contentHtml: fullHtml,
    coverImage: allMediaUrls[0] || null,
    categoryTags,
    status: 'PENDING_REVIEW',
    metadata: {
      mediaUrls: allMediaUrls,
      concludedAt: Date.now(),
      concludedBy: userId,
    },
  }, authorsList);

  // 4. Envia embed de confirmação no tópico aberto
  const lang = getLanguage(thread.guildId);
  const confirmEmbed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle('🎉  ✦  Rascunho Concluído com Sucesso!')
    .setDescription(
      `### 📨 Enviado para Revisão Editorial\n\n` +
      `O artigo **${thread.name}** foi montado e enviado para a fila editorial da Pyxie!\n\n` +
      `• **Status:** \`PENDING_REVIEW\` (Em análise da equipe)\n\n` +
      `• **Fórum Aberto:** O tópico agora está aberto para comentários de toda a comunidade!\n\n` +
      `-# Assim que for aprovado no painel, o link oficial do portal será celebrado aqui.`
    )
    .setFooter({ text: 'Pyxie Hyperfokus • Revisão Editorial' })
    .setTimestamp();

  await thread.send({ embeds: [confirmEmbed] }).catch(() => {});

  return { success: true, article: savedArticle };
}

async function onInteractionCreate(interaction, client) {
  if (!interaction.isButton()) return false;
  if (!interaction.customId.startsWith('hyperfokus_conclude:')) return false;

  const threadId = interaction.customId.split(':')[1];
  const thread = interaction.channel;
  if (!thread || thread.id !== threadId) return false;

  const draft = draftStore.getDraft(threadId);
  if (!draft) {
    await interaction.reply({ content: 'Rascunho não encontrado.', ephemeral: true }).catch(() => {});
    return true;
  }

  const userId = String(interaction.user.id);
  if (!draftStore.isAuthorOrCollaborator(threadId, userId)) {
    const lang = getLanguage(interaction.guildId);
    await interaction.reply({
      content: t('hyperfokus.concluirOnlyAuthor', lang),
      ephemeral: true,
    }).catch(() => {});
    return true;
  }

  await interaction.deferReply({ ephemeral: true }).catch(() => {});
  const result = await concludeDraft({ thread, user: interaction.user, interaction, client });
  if (result.success) {
    await interaction.editReply({ content: '✅ Rascunho concluído e enviado para validação!' }).catch(() => {});
  } else {
    await interaction.editReply({ content: `Erro ao concluir: ${result.error}` }).catch(() => {});
  }
  return true;
}

module.exports = {
  isForumTracked,
  hasSensitiveTags,
  buildStickyPayload,
  sendOrRefreshSticky,
  scheduleStickyDebounce,
  onThreadCreate,
  onMessageCreate,
  concludeDraft,
  onInteractionCreate,
};

// Comunidade (plano 5.9): fórum de hiperfocos e radar de notícias com aprovação da staff.
const fs = require('node:fs');
const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { getCommunityConfig } = require('../../services/communityConfig');
const radar = require('../../services/newsRadar');
const economy = require('../../services/economy');
const { getVentChannelId } = require('../../services/guildConfigService');
const { CRINGELANDIA_GUILD_ID } = require('../../config/scopes');
const { t, TRANSLATIONS } = require('../../utils/i18n');

const EPHEMERAL = 64;
const RADAR_EVERY_MS = 2 * 60 * 60 * 1000;
const noPing = { parse: [] };

// ---------- Fórum de hiperfocos ----------

function pendingFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data'), 'hyperfocusPending.json');
}

function loadPending() {
  try {
    return JSON.parse(fs.readFileSync(pendingFile(), 'utf8')) || { threads: {}, rewarded: {} };
  } catch (_) {
    return { threads: {}, rewarded: {} };
  }
}

function savePending(state) {
  fs.mkdirSync(path.dirname(pendingFile()), { recursive: true });
  fs.writeFileSync(`${pendingFile()}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${pendingFile()}.tmp`, pendingFile());
}

const brtDay = (now) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(now));

function onThreadCreate(thread, newlyCreated) {
  if (!newlyCreated || thread.guildId !== CRINGELANDIA_GUILD_ID) return false;
  const cfg = getCommunityConfig(thread.guildId).hyperfocus;
  // Nunca em fóruns de desabafo, mesmo que alguém configure por engano.
  if (!cfg.forumIds.includes(thread.parentId) || thread.parentId === getVentChannelId(thread.guildId)) return false;
  const state = loadPending();
  state.threads[thread.id] = { guildId: thread.guildId, ownerId: thread.ownerId, createdAt: Date.now() };
  savePending(state);
  return true;
}

function pickComment(lang, vars) {
  const bank = TRANSLATIONS[lang]?.hyperfocus?.comments || TRANSLATIONS.pt.hyperfocus.comments;
  const keys = Object.keys(bank);
  return t(`hyperfocus.comments.${keys[Math.floor(Math.random() * keys.length)]}`, lang, vars);
}

// Tópicos com mais de X minutos sem resposta de outra pessoa ganham o primeiro comentário da Pyxie.
async function processHyperfocus(client, now = Date.now()) {
  const state = loadPending();
  const day = brtDay(now);
  if (state.rewardedDay !== day) {
    state.rewardedDay = day;
    state.rewarded = {};
  }
  for (const [threadId, entry] of Object.entries(state.threads)) {
    const cfg = getCommunityConfig(entry.guildId).hyperfocus;
    if (now - entry.createdAt < cfg.waitMinutes * 60000) continue;
    delete state.threads[threadId];
    const thread = await client.channels.fetch(threadId).catch(() => null);
    if (!thread?.messages) continue;
    const msgs = await thread.messages.fetch({ limit: 20 }).catch(() => null);
    const list = msgs ? [...msgs.values()] : [];
    if (list.some((m) => m.author.id !== entry.ownerId && !m.author.bot)) continue;
    const starter = await thread.fetchStarterMessage().catch(() => null);
    const owner = await thread.guild.members.fetch(entry.ownerId).catch(() => null);
    const lang = 'pt';
    const tags = (thread.parent?.availableTags || []).filter((tg) => thread.appliedTags?.includes(tg.id)).map((tg) => tg.name);
    let text = pickComment(lang, { name: owner?.displayName || '', topic: tags[0] || t('hyperfocus.genericTopic', lang) });
    // Recompensa: texto mínimo no post original (sem contar edições) e uma vez por dia por pessoa.
    const original = starter?.editedTimestamp ? '' : starter?.content || '';
    if (cfg.rewardCoins > 0 && original.length >= cfg.minChars && !state.rewarded[entry.ownerId]) {
      economy.addCoins(entry.ownerId, cfg.rewardCoins);
      state.rewarded[entry.ownerId] = true;
      text += `\n\n${t('hyperfocus.reward', lang, { coins: cfg.rewardCoins })}`;
    }
    await thread.send({ content: text, allowedMentions: noPing }).catch(() => null);
  }
  savePending(state);
}

// ---------- Radar ----------

async function runRadar(client, now = Date.now()) {
  if (now - radar.lastRunAt() < RADAR_EVERY_MS) return [];
  const cfg = getCommunityConfig(CRINGELANDIA_GUILD_ID).radar;
  if (!cfg.feeds.length || !cfg.staffChannelId || !cfg.publishChannelId) return [];
  const created = await radar.collect(cfg.feeds, { now });
  const staff = await client.channels.fetch(cfg.staffChannelId).catch(() => null);
  for (const item of created) {
    await staff
      ?.send({
        embeds: [
          {
            color: 0x8b5cf6,
            title: `📡 ${item.title}`.slice(0, 256),
            url: item.link,
            description: [item.summary || t(item.reddit ? 'radar.redditNoSummary' : 'radar.noSummary', 'pt'), `-# ${t('radar.reviewHint', 'pt')}`].join('\n\n'),
          },
        ],
        components: [
          {
            type: 1,
            components: [
              { type: 2, style: 3, label: t('radar.approve', 'pt'), custom_id: `radar:ok:${item.id}` },
              { type: 2, style: 4, label: t('radar.discard', 'pt'), custom_id: `radar:no:${item.id}` },
            ],
          },
        ],
        allowedMentions: noPing,
      })
      .catch(() => null);
  }
  return created;
}

async function handleInteraction(interaction) {
  if (!interaction.isButton?.() || !interaction.customId.startsWith('radar:')) return;
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    return interaction.reply({ content: t('radar.staffOnly', interaction), flags: EPHEMERAL });
  }
  const [, action, id] = interaction.customId.split(':');
  const item = radar.takePending(id);
  if (!item) return interaction.update({ components: [] });
  if (action === 'ok') {
    const cfg = getCommunityConfig(interaction.guildId).radar;
    const channel = await interaction.client.channels.fetch(cfg.publishChannelId).catch(() => null);
    await channel
      ?.send({
        embeds: [
          {
            color: 0x8b5cf6,
            title: `📡 ${item.title}`.slice(0, 256),
            description: [item.summary || '', `🔗 [${t('radar.source', 'pt')}](${item.link})`, `-# ${t('radar.disclaimer', 'pt')}`].filter(Boolean).join('\n\n'),
            timestamp: new Date().toISOString(),
          },
        ],
        allowedMentions: noPing,
      })
      .catch(() => null);
  }
  return interaction.update({ content: t(action === 'ok' ? 'radar.published' : 'radar.discarded', 'pt', { user: `<@${interaction.user.id}>` }), components: [], allowedMentions: noPing });
}

module.exports = {
  id: 'community',
  name: { 'pt-BR': 'Comunidade', en: 'Community' },
  description: {
    'pt-BR': 'Fórum de hiperfocos (a Pyxie comenta tópicos sem resposta) e radar de notícias e direitos com aprovação da staff.',
    en: 'Hyperfocus forum (Pyxie comments on posts nobody answered) and a news and rights radar approved by the staff.',
  },
  icon: '🌱',
  // Exclusivo do servidor oficial (plano 5.9).
  guildScope: [CRINGELANDIA_GUILD_ID],
  defaultEnabled: true,
  onThreadCreate,
  processHyperfocus,
  runRadar,
  handleInteraction,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('threadCreate', (thread, newlyCreated) => {
      try {
        onThreadCreate(thread, newlyCreated);
      } catch (err) {
        console.error('[Community] Erro no fórum de hiperfocos:', err);
      }
    });
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction).catch((err) => console.error('[Community] Erro no radar:', err));
    });
    ctx.registerInterval(() => {
      processHyperfocus(ctx.client).catch((err) => console.error('[Community] Erro no fórum:', err));
      runRadar(ctx.client).catch((err) => console.error('[Community] Erro no radar:', err));
    }, 60000);
  },
};

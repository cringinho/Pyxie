const { emojify } = require('../../utils/emojify');
const { GUILD_ID, COLORS, CATEGORIES } = require('./realmBlueprint');
const { LAWS, SUPPORT, STATUS } = require('./realmContent');

/**
 * Módulo do servidor oficial Pyxie's Realm (só age na guild oficial):
 * - botões "Ler em Português / Leer en Español" das leis (resposta efêmera);
 * - tópicos "Just Listening" do #support-pods: a Pyxie deixa linhas de apoio e só o autor escreve.
 * A estrutura do servidor é criada por scripts/realm/provision.js e as mensagens fixas por
 * scripts/realm/publish.js.
 */

const PREFIX = 'realm';
const PODS_NAME = CATEGORIES.flatMap((c) => c.channels).find((c) => c.key === 'pods').name;
const LISTEN_TAG = 'Just Listening';

/** Boas-vindas, lore e leis no idioma pedido; em EN vêm com os botões de tradução. */
function buildLawsMessage(lang = 'en') {
  const text = LAWS[lang] || LAWS.en;
  const embed = (title, description, color) => ({ title: emojify(title), description: emojify(description), color });
  const payload = {
    embeds: [
      embed(text.welcomeTitle, text.welcomeBody, COLORS.pyxie),
      embed(text.loreTitle, text.loreBody, COLORS.violet),
      embed(text.rulesTitle, `${text.rules.map((rule, i) => `\`${i + 1}.\` ${rule}`).join('\n\n')}\n\n${text.rulesFooter}`, COLORS.deepPurple),
    ],
  };
  if (lang === 'en') {
    payload.components = [
      {
        type: 1,
        components: [
          { type: 2, style: 2, custom_id: `${PREFIX}:laws:pt`, label: LAWS.en.readPt, emoji: { name: '🇧🇷' } },
          { type: 2, style: 2, custom_id: `${PREFIX}:laws:es`, label: LAWS.en.readEs, emoji: { name: '🇪🇸' } },
        ],
      },
    ];
  }
  return payload;
}

function buildSupportMessage() {
  return {
    embeds: [{ title: emojify(SUPPORT.title), description: emojify(`${SUPPORT.body}\n\n${SUPPORT.lines.join('\n')}\n\n${SUPPORT.footer}`), color: COLORS.softPink }],
  };
}

/** O tópico é um "Just Listening" do #support-pods do servidor oficial? */
function isListeningThread(thread) {
  if (!thread || thread.guildId !== GUILD_ID || !thread.parent || thread.parent.name !== PODS_NAME) return false;
  const tag = (thread.parent.availableTags || []).find((t) => t.name === LISTEN_TAG);
  return Boolean(tag && (thread.appliedTags || []).includes(tag.id));
}

/**
 * Manda cada comando pro canal dele (rotas do blueprint), achando os canais pelo nome. Fora do canal
 * certo, a porta central (guildFeatures.checkCommandAccess) responde em privado onde o comando mora.
 */
function applyCommandRoutes(client) {
  const guild = client?.guilds?.cache?.get(GUILD_ID);
  if (!guild) return null;
  const routes = {};
  for (const def of CATEGORIES.flatMap((c) => c.channels)) {
    if (!def.commands) continue;
    const channel = guild.channels.cache.find((c) => c.name === def.name);
    if (!channel) continue;
    for (const name of def.commands) routes[name] = [...(routes[name] || []), channel.id];
  }
  require('../../services/guildFeatures').setCommandChannels(GUILD_ID, routes);
  return routes;
}

const STATUS_NAME = CATEGORIES.flatMap((c) => c.channels).find((c) => c.key === 'status').name;
const fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));

/** Painel do #realm-status: chefe da semana, temporada e as histórias de roleplay mais recentes. */
function buildStatusEmbed(guildId = GUILD_ID, now = Date.now()) {
  const fields = [];
  try {
    const bossStore = require('../guildBoss/bossStore');
    const { bossName, hpBar } = require('../guildBoss/bossViews');
    const status = bossStore.getStatus(guildId, null, now);
    const boss = bossName(status.bossId, 'en');
    fields.push({ name: STATUS.bossName, value: status.defeatedAt ? fill(STATUS.bossDown, { boss }) : fill(STATUS.bossAlive, { boss, bar: hpBar(status.hp, status.maxHp), hp: status.hp, max: status.maxHp }), inline: true });
  } catch (_) {}
  try {
    const festival = require('../../services/festival');
    const season = festival.getActiveSeason(now);
    fields.push({ name: STATUS.seasonName, value: season ? fill(STATUS.seasonOn, { season: festival.seasonName(season, 'en') }) : STATUS.seasonOff, inline: true });
  } catch (_) {}
  const rp = require('../roleplay/characterStore');
  const week = now - 7 * 24 * 60 * 60 * 1000;
  const scenes = rp.listScenes().filter((s) => s.guildId === guildId && s.summary);
  const recent = scenes.sort((a, b) => (b.lastNarratedAt || 0) - (a.lastNarratedAt || 0)).slice(0, 3);
  const tales = recent.map((s) => fill(STATUS.taleLine, { thread: s.id, summary: s.summary.slice(0, 220) }));
  tales.push(fill(STATUS.talesCount, { active: scenes.filter((s) => (s.lastNarratedAt || 0) >= week).length, characters: rp.countCharacters() }));
  fields.push({ name: STATUS.talesName, value: (recent.length ? tales.join('\n\n') : `${STATUS.talesEmpty}\n\n${tales[tales.length - 1]}`).slice(0, 1024), inline: false });
  return {
    title: emojify(STATUS.title),
    color: COLORS.violet,
    fields: fields.map((f) => ({ ...f, name: emojify(f.name), value: emojify(f.value) })),
    footer: { text: STATUS.footer },
    timestamp: new Date(now).toISOString(),
  };
}

/** Edita o painel já publicado pelo bot (ou publica um novo) no #realm-status. */
async function publishStatus(client) {
  const guild = client?.guilds?.cache?.get(GUILD_ID);
  const channel = guild?.channels.cache.find((c) => c.name === STATUS_NAME);
  if (!channel?.isTextBased?.()) return null;
  const embed = buildStatusEmbed(GUILD_ID);
  const recent = await channel.messages.fetch({ limit: 20 }).catch(() => null);
  const mine = recent?.find((m) => m.author.id === client.user.id && m.embeds[0]?.footer?.text === STATUS.footer);
  return mine ? mine.edit({ embeds: [embed] }) : channel.send({ embeds: [embed] });
}

async function onLawsButton(interaction) {
  const [, , lang] = interaction.customId.split(':');
  await interaction.reply({ ...buildLawsMessage(lang === 'es' ? 'es' : 'pt'), flags: 64 });
}

async function onThreadCreate(thread, newlyCreated) {
  if (!newlyCreated || !isListeningThread(thread)) return;
  // O fórum só aceita mensagens depois que o post inicial existe
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await thread.send(buildSupportMessage());
}

async function onMessage(message) {
  if (message.author?.bot || !message.channel?.isThread?.()) return;
  const thread = message.channel;
  if (message.author.id === thread.ownerId || !isListeningThread(thread)) return;
  await message.delete().catch(() => null);
  await message.author.send(emojify(SUPPORT.removed)).catch(() => null);
}

module.exports = {
  id: 'realm',
  name: {
    'pt-BR': "Pyxie's Realm",
    en: "Pyxie's Realm",
  },
  description: {
    'pt-BR': 'Servidor oficial: leis traduzidas por botão e proteção dos desabafos "Just Listening".',
    en: 'Official server: laws translated by button and protection for "Just Listening" vents.',
  },
  category: 'comunidade',
  icon: '🌸',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,
  guildScope: [GUILD_ID],

  commands: [],

  async onLoad(ctx) {
    if (!ctx.client) return;
    const routeNow = () => {
      try {
        const routes = applyCommandRoutes(ctx.client);
        if (routes) console.log(`[realm] Rotas de comandos aplicadas: ${Object.keys(routes).length} comando(s).`);
      } catch (err) {
        console.error('[realm] Erro ao aplicar rotas de comandos:', err.message);
      }
    };
    const statusNow = () => publishStatus(ctx.client).catch((err) => console.error('[realm] Erro no painel de status:', err.message));
    if (ctx.client.isReady?.()) {
      routeNow();
      statusNow();
    } else {
      ctx.client.once('clientReady', () => {
        routeNow();
        statusNow();
      });
    }
    ctx.registerCron('*/30 * * * *', statusNow);
    ctx.registerListener('interactionCreate', async (interaction) => {
      if (!interaction.isButton?.() || !String(interaction.customId || '').startsWith(`${PREFIX}:laws:`)) return;
      try {
        await onLawsButton(interaction);
      } catch (err) {
        console.error('[realm] Erro no botão das leis:', err);
      }
    });
    ctx.registerListener('threadCreate', (thread, newlyCreated) => onThreadCreate(thread, newlyCreated).catch((err) => console.error('[realm] threadCreate:', err.message)));
    ctx.registerListener('messageCreate', (message) => onMessage(message).catch((err) => console.error('[realm] messageCreate:', err.message)));
  },

  PREFIX,
  applyCommandRoutes,
  buildStatusEmbed,
  publishStatus,
  buildLawsMessage,
  buildSupportMessage,
  isListeningThread,
};

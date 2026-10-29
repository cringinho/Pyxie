const readline = require('node:readline');
const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  Options,
  Events,
  Partials,
} = require('discord.js');
const { acquireBotLock, releaseBotLock, getPrefix } = require('./src/utils/botUtils');
const { normalizeChannelValue } = require('./src/services/database');
const { commandsByName, slashCommands } = require('./src/commands');
const moduleManager = require('./src/services/moduleManager');
const seasonalManager = require('./src/modules/seasonal/seasonalManager');

// Inicializa o gerenciador de módulos modulares com os despachantes em memória do bot
moduleManager.init({
  commandsByName,
  slashCommands,
});
const tarotCommand = require('./src/commands/tarot');
const helpCommand = require('./src/commands/help');
const setupCommand = require('./src/commands/setup');
const profileCommand = require('./src/commands/perfil');
const workCommand = require('./src/commands/trabalho');
const dailyCommand = require('./src/commands/daily');
const rankingCommand = require('./src/commands/ranking');
const idiomaCommand = require('./src/commands/idioma');
const jokenpoCommand = require('./src/commands/jokenpo');
const likelyCommand = require('./src/commands/provavel');
const quizCommand = require('./src/commands/quiz');
const { syncApplicationEmojis } = require('./src/utils/appEmojis');
const periodicMessages = require('./src/services/periodicMessages');
const welcomeFlow = require('./src/services/welcomeFlow');
const { startPresenceRotator } = require('./src/services/presenceRotator');
const {
  DISCORD_TOKEN,
  STARTUP_CHANNEL_ID,
  STATUS_IMAGE_URL,
  TAROT_LOG_CHANNEL_ID,
  KUROMI_STARTUP_EMOJI,
} = require('./src/config');
const { incrementCommand, incrementMessages, recordUniqueUser, updateStats, flushSync } = require('./src/services/logging');
const { t } = require('./src/utils/i18n');
const { flushInventorySync } = require('./src/services/inventory');
const { getBrasiliaDate, resetDailyDraws, readState, wasAnnouncedToday, markAnnouncedToday } = require('./src/services/tarot');
const { getAnimatedEmoji } = require('./src/utils/serverEmojis');
const { recordCommand, flushSync: flushTelemetrySync } = require('./src/services/commandTelemetry');
const { isBlacklisted, recordActivity, forceLeaveGuild } = require('./src/services/trustAndSafety');
const { checkPostCrash, attachProcessWatchdog } = require('./src/services/schedulerWatchdog');
const { updateGuildsSnapshot } = require('./src/services/guildDirectory');
const growthFunnel = require('./src/services/growthFunnel');
const { sendGuildWelcome, isWelcomeLanguageButton, handleWelcomeLanguageButton } = require('./src/services/guildOnboarding');
const { startBotListStats } = require('./src/services/botListStats');
const achievements = require('./src/services/achievements');
const guildFeatures = require('./src/services/guildFeatures');
const achievementsCommand = require('./src/commands/conquistas');
const {
  onGuildMemberAdd: onCheckinMemberAdd,
  onMessageCreate: onCheckinMessageCreate,
  checkAndDispatchBatch,
} = require('./src/services/welcomeCheckinService');
const {
  onMessageCreate: onVentMessageCreate,
  handleVentInteraction,
} = require('./src/services/ventService');
const {
  handleWelcomeInteraction,
} = require('./src/commands/set');

const CRINGE_PHRASE_COOLDOWN_MS = 60 * 1000;
const CRINGE_CHANNEL_COOLDOWN_MS = 30 * 1000;
const cringePhraseCooldowns = new Map();
const cringeChannelCooldowns = new Map();
const processedCringeMessageIds = new Set();
let cringeInFlight = false;
const sapatonaPhraseCooldowns = new Map();
const sapatonaChannelCooldowns = new Map();
const processedSapatonaMessageIds = new Set();
let sapatonaInFlight = false;
const recentWelcomes = new Map();
const processedMessageIds = new Map();
const processedInteractionIds = new Map();

// Protege o bot contra duas instâncias rodando ao mesmo tempo.
const lockAcquired = acquireBotLock();
if (!lockAcquired) {
  console.error('Outra instância de Pyxie já está em execução. Ela não divide o palco. Encerrando este processo...');
  process.exit(1);
}

const client = new Client({
  // Permissões mínimas para o bot funcionar com guildas, mensagens e membros.
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    // Fogueira de voz: só contagem de quem está em cada call (intent leve, não privilegiado).
    GatewayIntentBits.GuildVoiceStates,
    // Automações: alarme de conta de moderação (eventos do registro de auditoria).
    GatewayIntentBits.GuildModeration,
  ],
  // Automações: mural de destaques e registro de moderação também em mensagens fora do cache.
  partials: [Partials.Message, Partials.Reaction],
  // Otimização de memória e cache para execução em nuvem (Oracle Cloud / PM2)
  makeCache: Options.cacheWithLimits({
    MessageManager: 25, // Mantém apenas 25 mensagens recentes por canal
    StageInstanceManager: 0,
    AutoModerationRuleManager: 0,
    GuildScheduledEventManager: 0,
    ThreadMemberManager: 0,
    PresenceManager: 0,
    ReactionManager: 25,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3600, // Limpeza a cada 1 hora
      lifetime: 1800, // Remove mensagens mais antigas que 30 min da RAM
    },
    users: {
      interval: 3600,
      filter: () => (user) => user.id !== client.user?.id,
    },
  },
  rest: {
    timeout: 20000,
    retries: 3,
  },
});

// Embeds personalizados pelo dono no painel (cor, textos, imagens, emojis do app), aplicados no envio.
require('./src/services/embedOverrides').install(client);

// Envia uma mensagem de inicialização para o canal de alerta do servidor.
async function sendStartupAnnouncement() {
  const channel = await client.channels.fetch(STARTUP_CHANNEL_ID).catch(() => null);

  if (!channel || !channel.isTextBased()) {
    console.warn(`Canal de startup não encontrado ou inválido: ${STARTUP_CHANNEL_ID}`);
    return;
  }

  // Limpeza automática de avisos de inicialização anteriores do bot para evitar duplicações e mensagens obsoletas
  try {
    const recentMessages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
    if (recentMessages) {
      const oldStartupMessages = recentMessages.filter(
        (m) => m.author.id === client.user?.id && m.embeds.some((e) => e.title?.includes('Pyxie Entrou em Cena'))
      );
      for (const oldMsg of oldStartupMessages.values()) {
        await oldMsg.delete().catch(() => null);
      }
    }
  } catch (_) {}

  const panelUrl = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';

  const startupEmbed = new EmbedBuilder()
    .setColor('#5E2B8C')
    .setTitle(`🧚  ✦  Pyxie Entrou em Cena`)
    .setDescription('Estou online, monitorando o reino encantado de Cringelândia e pronta para novas aventuras!')
    .addFields(
      { name: '📍 Servidor', value: channel.guild?.name || 'Comunidade', inline: true },
      { name: '✅ Status', value: '100% Operacional', inline: true },
      {
        name: '📚 Comandos em Destaque',
        value: [
          '> 🔮 **/py-tarot** — Tire cartas de tarot com artes exclusivas',
          '> 📖 **/py-album** — Colecione 78 arcanos e conquistas do baralho',
          '> 💼 **/py-work** — Cumpra expedientes diários e suba na carreira',
          '> 👤 **/py-profile** — Customize títulos, temas e biografia',
          '> 🎲 **/py-coinflip** — Dispute cara ou coroa com apostas de moedinhas',
          '> 🪙 **/py-daily** — Resgate moedas diárias e bônus patrocinado',
          '> 💍 **/py-marriage** — Construa sua família e cultive a Árvore da Vida',
          '> ❓ **/py-help** — Menu interativo com todos os comandos',
        ].join('\n'),
        inline: false,
      }
    )
    .setImage(STATUS_IMAGE_URL)
    .setTimestamp()
    .setFooter({ text: 'Reino Encantado • Pyxie operacional' });

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setEmoji('🔗')
      .setLabel('Painel Web de Controle')
      .setURL(panelUrl)
      .setStyle(ButtonStyle.Link)
  );

  await channel.send({
    embeds: [startupEmbed],
    components: [actionRow],
    flags: [MessageFlags.SuppressNotifications],
  }).catch((error) => {
    console.error('Erro ao enviar aviso de inicialização:', error);
  });
}

function buildTarotDailyEmbed(guild, isExternal = false) {
  const guildName = guild?.name || '';
  let description =
    'Uma carta por dia para iluminar seus caminhos. A leitura é privada e renderizada especialmente para você!\n\n' +
    'Clique no botão abaixo ou use `/py-tarot` (ou `py!tarot`) para receber a sua tiragem de hoje.';

  if (isExternal) {
    description += '\n\n-# 🔮 Criado e disponibilizado por: [Cringelândia](<https://pyxie.com.br/cringelandia>)';
  }

  return new EmbedBuilder()
    .setColor('#c084fc')
    .setTitle(`${getAnimatedEmoji(guild, ['moon', 'tarot', 'magic'], '🌙')}  ✦  Tarot Diário${guildName ? ` — ${guildName}` : ''}  ✦`)
    .setDescription(description)
    .setFooter({ text: 'Tarot Diário • Pyxie supervisiona • Conecte-se com as energias do dia' })
    .setTimestamp();
}

function buildTarotDailyComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tarot:draw')
        .setLabel('🔮 Tirar Tarot do Dia')
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

async function postTarotDailyAnnouncement(now = Date.now(), { force = false } = {}) {
  const currentCycle = getBrasiliaDate(now);

  // Guarda estrita anti-duplicação: não publica mais de uma vez por ciclo diário a menos que seja forçado via admin
  if (!force && wasAnnouncedToday(now)) {
    console.log(`[TarotScheduler] Anúncio de Tarot do ciclo ${currentCycle} já foi publicado. Ignorando disparo duplicado.`);
    return;
  }

  // Apenas reseta o estado de tiragens dos usuários se o ciclo do banco ainda for de um dia anterior
  const state = readState();
  if (state.cycle !== currentCycle) {
    resetDailyDraws(now);
  }

  // Cada servidor com canal do tarot e anúncio ligado (painel → Mensagens periódicas).
  // A Cringelândia usa o canal e o cargo que antes eram fixos; os outros levam o crédito.
  const targets = periodicMessages.tarotTargets([...client.guilds.cache.keys()]);
  for (const item of targets) {
    try {
      const channel = await client.channels.fetch(item.channelId).catch(() => null);
      if (!channel || !channel.isTextBased() || channel.guild?.id !== item.guildId) continue;
      await channel.send({
        content: item.roleId ? `<@&${item.roleId}>` : undefined,
        embeds: [buildTarotDailyEmbed(channel.guild, item.credit)],
        components: buildTarotDailyComponents(),
        allowedMentions: { parse: [], roles: item.roleId ? [item.roleId] : [] },
      });
    } catch (err) {
      console.warn(`[TarotScheduler] Falha ao enviar tarot na guilda ${item.guildId}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 500)); // Espaçamento de 500ms para rate limit
  }

  markAnnouncedToday(now);
  console.log(`[TarotScheduler] Anúncio do Tarot publicado com sucesso para o ciclo ${currentCycle}.`);
}

function startTarotScheduler() {
  const currentCycle = getBrasiliaDate();

  // Só dispara na inicialização se o anúncio do ciclo atual AINDA NÃO tiver sido postado
  if (!wasAnnouncedToday()) {
    console.log(`[TarotScheduler] Anúncio diário pendente para o ciclo (${currentCycle}). Disparando anúncio do Tarot...`);
    postTarotDailyAnnouncement().catch((error) => console.error('Erro no anúncio diário do Tarot:', error));
  } else {
    console.log(`[TarotScheduler] Anúncio diário já publicado para o ciclo (${currentCycle}). Próximo disparo agendado para 00:00 BRT.`);
  }

  const nextMidnightUtc = Date.parse(`${currentCycle}T03:00:00.000Z`) + 24 * 60 * 60 * 1000;
  const delay = Math.max(1000, nextMidnightUtc - Date.now());


  setTimeout(() => {
    postTarotDailyAnnouncement().catch((error) => console.error('Erro no anúncio diário do Tarot:', error));
    setInterval(() => {
      postTarotDailyAnnouncement().catch((error) => console.error('Erro no anúncio diário do Tarot:', error));
    }, 24 * 60 * 60 * 1000);
  }, delay);
}

async function handleCringePhrase(message) {
  if (!/\bviadinho\s+fofinho\b/i.test(message.content)) return false;

  // Deduplicação estrita: a mesma mensagem nunca é processada duas vezes
  if (processedCringeMessageIds.has(message.id)) {
    return true;
  }
  processedCringeMessageIds.add(message.id);
  if (processedCringeMessageIds.size > 500) {
    const ids = Array.from(processedCringeMessageIds).slice(0, 200);
    ids.forEach((id) => processedCringeMessageIds.delete(id));
  }

  // Previne execução simultânea se múltiplas chamadas assíncronas chegarem juntas
  if (cringeInFlight) return true;

  const now = Date.now();
  const channelId = message.channel?.id || message.channelId;
  const lastChannelTrigger = cringeChannelCooldowns.get(channelId) || 0;
  const lastAuthorTrigger = cringePhraseCooldowns.get(message.author.id) || 0;

  // Se o canal ou o usuário estiverem em cooldown, aplica reação sem disparar novo GIF
  if (now - lastChannelTrigger < CRINGE_CHANNEL_COOLDOWN_MS || now - lastAuthorTrigger < CRINGE_PHRASE_COOLDOWN_MS) {
    if (now - lastAuthorTrigger > 4000) {
      await message.react('🍅').catch(() => null);
    }
    return true;
  }

  cringeInFlight = true;
  cringePhraseCooldowns.set(message.author.id, now);
  if (channelId) cringeChannelCooldowns.set(channelId, now);

  try {
    await message.react('🌈').catch(() => null);
    
    const localGifPath = path.join(__dirname, 'assets', 'cringe_small.gif');
    if (fs.existsSync(localGifPath)) {
      await message.reply({
        files: [new AttachmentBuilder(localGifPath, { name: 'gacha_boy.gif' })]
      }).catch(() => null);
    } else {
      await message.reply('https://klipy.com/gifs/gacha-life-gacha-boy').catch(() => null);
    }
  } finally {
    cringeInFlight = false;
  }
  return true;
}

async function handleSapatonaPhrase(message) {
  if (!/\bsapatonas?\b/i.test(message.content)) return false;

  // Deduplicação estrita: a mesma mensagem nunca é processada duas vezes
  if (processedSapatonaMessageIds.has(message.id)) {
    return true;
  }
  processedSapatonaMessageIds.add(message.id);
  if (processedSapatonaMessageIds.size > 500) {
    const ids = Array.from(processedSapatonaMessageIds).slice(0, 200);
    ids.forEach((id) => processedSapatonaMessageIds.delete(id));
  }

  // Previne execução simultânea se múltiplas chamadas assíncronas chegarem juntas
  if (sapatonaInFlight) return true;

  const now = Date.now();
  const channelId = message.channel?.id || message.channelId;
  const lastChannelTrigger = sapatonaChannelCooldowns.get(channelId) || 0;
  const lastAuthorTrigger = sapatonaPhraseCooldowns.get(message.author.id) || 0;

  // Se o canal ou o usuário estiverem em cooldown, aplica reação sem disparar novo GIF
  if (now - lastChannelTrigger < CRINGE_CHANNEL_COOLDOWN_MS || now - lastAuthorTrigger < CRINGE_PHRASE_COOLDOWN_MS) {
    if (now - lastAuthorTrigger > 4000) {
      await message.react('🍅').catch(() => null);
    }
    return true;
  }

  sapatonaInFlight = true;
  sapatonaPhraseCooldowns.set(message.author.id, now);
  if (channelId) sapatonaChannelCooldowns.set(channelId, now);

  try {
    await message.react('🌈').catch(() => null);

    const localGifPath = path.join(__dirname, 'assets', 'sapatona_small.gif');
    if (fs.existsSync(localGifPath)) {
      await message.reply({
        files: [new AttachmentBuilder(localGifPath, { name: 'sapatona.gif' })]
      }).catch(() => null);
    } else {
      await message.reply('https://static2.klipy.com/ii/4493325008d34b7bf8cd6813cd5c1619/94/1b/tAZCIkR3Ydv1.gif').catch(() => null);
    }
  } finally {
    sapatonaInFlight = false;
  }
  return true;
}

function updateLiveStats() {
  try {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const guildsCount = client.guilds.cache.size;
    updateStats({ totalMembers, guildsCount });
    updateGuildsSnapshot(client);
  } catch (_) {}
}

client.once(Events.ClientReady, async () => {
  console.log(`Pyxie conectada como ${client.user.tag}`);

  startPresenceRotator(client);

  updateLiveStats();
  growthFunnel.backfillGuilds(client.guilds.cache.values());
  client.application?.commands.fetch().catch(() => null);
  startBotListStats(client);
  attachProcessWatchdog(client);
  try {
    const truthEngine = require('./src/services/truthReconciliationEngine');
    truthEngine.startCycle(client, null);
  } catch (_) {}
  await checkPostCrash(client, {
    reconcileTasks: async () => {
      if (!wasAnnouncedToday()) {
        console.log('[schedulerWatchdog] Conciliação pós-queda: Anúncio do Tarot ainda pendente para o dia. Publicando...');
        await postTarotDailyAnnouncement().catch(() => null);
      } else {
        console.log('[schedulerWatchdog] Conciliação pós-queda: Anúncio do Tarot já havia sido publicado hoje. Nenhuma ação necessária.');
      }
    },
  });
  await sendStartupAnnouncement();
  await syncApplicationEmojis(client).catch(() => null);
  startTarotScheduler();
  setInterval(() => {
    checkAndDispatchBatch(client).catch((err) => console.error('[welcomeCheckin] Erro no agendador:', err.message));
  }, 15 * 60 * 1000);
  seasonalManager.init(client, null);
  moduleManager.init({
    client,
    commandsByName,
    slashCommands,
  });

  // Watcher ativo para sincronização de módulos em data/modulesConfig.json
  try {
    const modulesConfigPath = path.join(__dirname, 'data', 'modulesConfig.json');
    let modulesDebounceTimer = null;
    fs.watchFile(modulesConfigPath, { interval: 2000 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        if (modulesDebounceTimer) clearTimeout(modulesDebounceTimer);
        modulesDebounceTimer = setTimeout(() => {
          try {
            const cfg = moduleManager.loadConfig();
            for (const [id, modData] of Object.entries(cfg.modules || {})) {
              const shouldBeActive = Boolean(modData.enabled);
              const isCurrentlyActive = moduleManager.activeScopes.has(id);
              if (shouldBeActive && !isCurrentlyActive) {
                console.log(`[ModuleManager:Watcher] Ativando módulo '${id}' detectado no disco...`);
                moduleManager.enableModule(id, false).catch(() => null);
              } else if (!shouldBeActive && isCurrentlyActive) {
                console.log(`[ModuleManager:Watcher] Desativando módulo '${id}' detectado no disco...`);
                moduleManager.disableModule(id, false).catch(() => null);
              }
            }
          } catch (err) {
            console.error('[ModuleManager:Watcher] Erro ao sincronizar modulesConfig:', err.message);
          }
        }, 500);
      }
    });
  } catch (_) {}

  // Watcher ativo para sincronização automática de alterações em seasonalConfig.json
  try {
    const cringelandiaConfigPath = path.join(__dirname, 'data', 'cringelandia', 'seasonalConfig.json');
    const legacyConfigPath = path.join(__dirname, 'data', 'seasonalConfig.json');
    const seasonalConfigPath = process.env.SEASONAL_CONFIG_PATH || (fs.existsSync(cringelandiaConfigPath) ? cringelandiaConfigPath : legacyConfigPath);
    let seasonalDebounceTimer = null;
    fs.watchFile(seasonalConfigPath, { interval: 2000 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        if (seasonalDebounceTimer) clearTimeout(seasonalDebounceTimer);
        seasonalDebounceTimer = setTimeout(() => {
          try {
            const cfg = seasonalManager.loadConfig();
            const isCurrentlyActive = seasonalManager.isSeasonalActive();
            if (cfg.active && !isCurrentlyActive) {
              console.log('[Seasonal:Watcher] Alteração detectada no disco: ativando evento sazonal...');
              seasonalManager.start();
            } else if (!cfg.active && isCurrentlyActive) {
              console.log('[Seasonal:Watcher] Alteração detectada no disco: desativando evento sazonal...');
              seasonalManager.stop();
            } else if (cfg.active) {
              console.log('[Seasonal:Watcher] Alteração detectada no disco: recarregando evento sazonal...');
              seasonalManager.reload();
            }
          } catch (err) {
            console.error('[Seasonal:Watcher] Erro ao sincronizar seasonalConfig:', err.message);
          }
        }, 500);
      }
    });
  } catch (_) {}

  // Watcher ativo para sincronização automática de alterações em emojis.json
  try {
    const emojisPath = path.join(__dirname, 'src', 'data', 'emojis.json');
    let emojiDebounceTimer = null;
    fs.watchFile(emojisPath, { interval: 2000 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        if (emojiDebounceTimer) clearTimeout(emojiDebounceTimer);
        emojiDebounceTimer = setTimeout(() => {
          try {
            const { reloadEmojiConfig } = require('./src/utils/appEmojis');
            reloadEmojiConfig();
            console.log('[Emojis:Watcher] Arquivo emojis.json atualizado no disco. Emojis recarregados.');
          } catch (_) {}
        }, 500);
      }
    });
  } catch (_) {}
});

// Atualização automática de catálogo de emojis quando novos emojis forem adicionados/editados/removidos
client.on(Events.GuildEmojiCreate, () => syncApplicationEmojis(client));
client.on(Events.GuildEmojiDelete, () => syncApplicationEmojis(client));
client.on(Events.GuildEmojiUpdate, () => syncApplicationEmojis(client));

// Atualizações dinâmicas de contagem de membros e servidores
client.on(Events.GuildCreate, async (guild) => {
  const bl = isBlacklisted({ guildId: guild.id });
  if (bl.blacklisted) {
    console.warn(`[Trust&Safety] Servidor banido tentou adicionar Pyxie: ${guild.name} (${guild.id}). Forçando saída.`);
    await guild.leave().catch(() => null);
    return;
  }

  updateLiveStats();
  growthFunnel.recordGuildJoin(guild);

  // Idioma inicial pelo idioma preferido do servidor + boas-vindas com botões de idioma
  await sendGuildWelcome(guild, client).catch((error) => {
    console.error(`[Onboarding] Falha ao enviar boas-vindas em ${guild.id}:`, error.message);
  });
});
client.on(Events.GuildDelete, (guild) => {
  growthFunnel.recordGuildLeave(guild);
  updateLiveStats();
});
client.on(Events.GuildUpdate, () => updateLiveStats());
client.on(Events.GuildMemberRemove, () => updateLiveStats());

// Mensagem de boas-vindas ao entrar no servidor.
client.on(Events.GuildMemberAdd, async (member) => {
  updateLiveStats();

  // Não processa boas-vindas para bots
  if (member.user?.bot) return;

  // Deduplicação de boas-vindas: ignora re-disparos do gateway em até 5 minutos
  const welcomeKey = `${member.guild?.id || 'unknown'}:${member.id}`;
  const lastWelcomedAt = recentWelcomes.get(welcomeKey) || 0;
  if (Date.now() - lastWelcomedAt < 5 * 60 * 1000) {
    console.log(`[guildMemberAdd] Ignorando evento duplicado de boas-vindas para ${member.user?.tag || member.id}`);
    return;
  }
  recentWelcomes.set(welcomeKey, Date.now());

  if (recentWelcomes.size > 500) {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [k, time] of recentWelcomes.entries()) {
      if (time < cutoff) recentWelcomes.delete(k);
    }
  }

  // Acolhimento de 24h (cada servidor liga no painel → Acolhimento).
  onCheckinMemberAdd(member);

  // Boas-vindas: formato guia ou personalizado, canal e cargos de cada servidor
  // (src/services/welcomeFlow.js; a Cringelândia usa os valores que eram fixos aqui).
  const view = welcomeFlow.getView(member.guild.id);
  if (!view.enabled || !view.channelId) return;
  const welcomeChannel =
    member.guild.channels.cache.get(view.channelId) ||
    (await member.guild.channels.fetch(view.channelId).catch(() => null));
  if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

  try {
    const welcomeMessage = await welcomeChannel.send(welcomeFlow.buildWelcomeMessage(member, view));
    for (const emoji of welcomeFlow.reactionsFor(view)) {
      await welcomeMessage.react(emoji).catch(() => null);
    }
  } catch (err) {
    console.warn(`[Welcome] Falha ao enviar boas-vindas na guilda ${member.guild.id}: ${err.message}`);
  }

  // Cargo automático com proteção de hierarquia
  if (view.autoRoleId) {
    await member.roles.add(view.autoRoleId).catch((err) => {
      console.warn(`[AutoRole] Falha ao atribuir cargo automático em ${member.guild.id}: ${err.message}`);
    });
  }
});

// Procura o comando na pasta commands e mantém o index focado na infraestrutura.
client.on(Events.MessageCreate, async (message) => {
  if (message.author?.bot) return;

  const bl = isBlacklisted({ guildId: message.guildId, userId: message.author?.id });
  if (bl.blacklisted) return;

  // Deduplicação de eventos de mensagem do Discord Gateway
  if (processedMessageIds.has(message.id)) return;
  processedMessageIds.set(message.id, Date.now());
  if (processedMessageIds.size > 1000) {
    const cutoff = Date.now() - 60 * 1000;
    for (const [id, ts] of processedMessageIds.entries()) {
      if (ts < cutoff) processedMessageIds.delete(id);
    }
  }

  incrementMessages();
  recordUniqueUser(message.author.id);

  if (await handleCringePhrase(message)) {
    return;
  }

  if (await handleSapatonaPhrase(message)) {
    return;
  }

  // Monitoramento de interação para novatos tímidos e desabafos (Sticky)
  onCheckinMessageCreate(message);
  await onVentMessageCreate(message).catch(() => null);

  const prefix = getPrefix();
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  const command = commandsByName.get(cmd);
  if (!command || typeof command.executePrefix !== 'function') return;

  // Guarda de Escopo de Guilda (Zona B - Cringelândia Lab)
  if (Array.isArray(command.guildScope) && command.guildScope.length > 0) {
    if (!message.guildId || !command.guildScope.includes(message.guildId)) {
      return;
    }
  }

  // Recursos por servidor (/py-setup): modo clássico, módulo desligado ou canal não liberado
  const access = guildFeatures.checkCommandAccess({ guildId: message.guildId, channel: message.channel, command });
  if (!access.allowed) {
    await message.reply(setupCommand.handleAccessDenied(access, message, message.member)).catch(() => null);
    return;
  }

  incrementCommand();
  const startTime = Date.now();
  let success = true;
  let cmdErr = null;
  try {
    await command.executePrefix({ message, args, prefix });
    if (command !== achievementsCommand) {
      // Conquistas alcançadas pelo comando (limite de uma verificação a cada 15s por pessoa)
      achievements.notifyForMessage(message).catch(() => null);
    }
  } catch (error) {
    success = false;
    cmdErr = error;
    console.error(`Erro ao executar prefix command ${prefix}${cmd}:`, error);
    await message.reply(t('common.actionError', message)).catch(() => null);
  } finally {
    const durationMs = Date.now() - startTime;
    recordCommand({
      name: cmd,
      type: 'prefix',
      guildId: message.guildId,
      userId: message.author?.id,
      lang: message.guildId ? 'pt-BR' : 'en',
      success,
      durationMs,
      error: cmdErr ? cmdErr.message : null,
      category: command.category,
    });
    recordActivity({
      userId: message.author?.id,
      guildId: message.guildId,
      success,
      textInput: message.content,
      context: `prefix:${cmd}`,
    });
  }
});

// O registro compartilhado também encaminha cada slash command ao próprio arquivo.
client.on(Events.InteractionCreate, async (interaction) => {
  const bl = isBlacklisted({ guildId: interaction.guildId, userId: interaction.user?.id });
  if (bl.blacklisted) {
    if (interaction.isRepliable()) {
      return interaction.reply({ content: t('common.blacklisted', interaction), flags: MessageFlags.Ephemeral }).catch(() => null);
    }
    return;
  }

  // Autocompletar das opções de slash (ex.: /py-profession com mais de 25 profissões)
  if (interaction.isAutocomplete()) {
    const command = commandsByName.get(interaction.commandName);
    if (typeof command?.autocomplete === 'function') await command.autocomplete(interaction).catch(() => null);
    return;
  }

  if (interaction.isModalSubmit()) {
    for (const row of interaction.components || []) {
      for (const comp of row.components || []) {
        if (comp.value) {
          recordActivity({
            userId: interaction.user?.id,
            guildId: interaction.guildId,
            success: true,
            textInput: comp.value,
            context: `modal:${interaction.customId}:${comp.customId}`,
          });
        }
      }
    }
  }

  // Deduplicação de eventos de interação do Discord Gateway
  if (processedInteractionIds.has(interaction.id)) return;
  processedInteractionIds.set(interaction.id, Date.now());
  if (processedInteractionIds.size > 1000) {
    const cutoff = Date.now() - 60 * 1000;
    for (const [id, ts] of processedInteractionIds.entries()) {
      if (ts < cutoff) processedInteractionIds.delete(id);
    }
  }

  try {
    // Interações de gerenciamento de módulos exclusivos do Dono
    if (interaction.isButton() && (interaction.customId.startsWith('admin_modules_view') || interaction.customId.startsWith('admin_seasonal_view') || interaction.customId.startsWith('admin_mod_toggle:'))) {
      const adminCmd = require('./src/commands/admin');
      const { OWNER_SNOWFLAKE } = require('./src/services/adminAuth');
      if (interaction.user.id !== OWNER_SNOWFLAKE) {
        return interaction.reply({ content: t('common.ownerPanelOnly', interaction), flags: MessageFlags.Ephemeral });
      }
      if (interaction.customId.startsWith('admin_modules_view')) {
        const view = adminCmd.buildModulesView(interaction.user.id, interaction);
        return interaction.reply(view);
      }
      if (interaction.customId.startsWith('admin_seasonal_view')) {
        const view = adminCmd.buildSeasonalRestrictionsView(interaction.user.id, interaction);
        return interaction.reply(view);
      }
      if (interaction.customId.startsWith('admin_mod_toggle:')) {
        const parts = interaction.customId.split(':');
        const moduleId = parts[1];
        await moduleManager.toggleModule(moduleId);
        const view = adminCmd.buildModulesView(interaction.user.id, interaction);
        if (interaction.deferred || interaction.replied) {
          return interaction.editReply(view);
        }
        return interaction.update(view);
      }
    }

    if (achievementsCommand.isAchievementsInteraction(interaction)) {
      await achievementsCommand.handleAchievementsInteraction(interaction);
      return;
    }

    if (interaction.isButton() && isWelcomeLanguageButton(interaction.customId)) {
      await handleWelcomeLanguageButton(interaction);
      return;
    }

    if (interaction.isButton() && (interaction.customId.startsWith('seasonal_art_') || interaction.customId.startsWith('seasonal_multi_art_'))) {
      const artHandler = require('./src/modules/seasonal/artHandler');
      await artHandler.handleButtonInteraction(interaction);
      return;
    }

    // Interações modulares da Central de Parcerias (botões, seletores e modais)
    if (interaction.customId && (interaction.customId.startsWith('part:') || interaction.customId.startsWith('part_staff:'))) {
      const partnershipManager = require('./src/modules/partnerships/partnershipManager');
      await partnershipManager.handleInteraction(interaction);
      return;
    }

    // Interações do Sistema de Desabafos (Sticky, Autoajuda, Anônimo e Preferências)
    if (interaction.customId && (interaction.customId.startsWith('vent:') || interaction.customId.startsWith('vent_pref:') || interaction.customId === 'vent_modal_submit')) {
      const handled = await handleVentInteraction(interaction);
      if (handled) return;
    }

    // Interações de Boas-Vindas Premium (Preview, Modais e Auto-Role)
    if (interaction.customId && (interaction.customId.startsWith('welcome_preview:') || interaction.customId.startsWith('welcome_edit_') || interaction.customId.startsWith('welcome_modal_') || interaction.customId.startsWith('welcome_autorole_select:'))) {
      const handled = await handleWelcomeInteraction(interaction);
      if (handled) return;
    }

    if (tarotCommand.isTarotButton(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await tarotCommand.executeButton({ interaction });
      return;
    }

    if (typeof helpCommand?.isHelpButton === 'function' && helpCommand.isHelpButton(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await helpCommand.executeButton({ interaction });
      return;
    }

    if (typeof setupCommand?.isSetupInteraction === 'function' && setupCommand.isSetupInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await setupCommand.handleSetupInteraction(interaction);
      return;
    }

    if (typeof profileCommand?.isProfileInteraction === 'function' && profileCommand.isProfileInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await profileCommand.handleProfileInteraction(interaction);
      return;
    }

    if (typeof dailyCommand?.isDailyInteraction === 'function' && dailyCommand.isDailyInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await dailyCommand.handleDailyInteraction(interaction);
      return;
    }

    if (typeof rankingCommand?.isRankingInteraction === 'function' && rankingCommand.isRankingInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await rankingCommand.handleRankingInteraction(interaction);
      return;
    }

    if (typeof idiomaCommand?.isLanguageInteraction === 'function' && idiomaCommand.isLanguageInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await idiomaCommand.handleLanguageInteraction(interaction);
      return;
    }

    if (typeof workCommand?.isWorkInteraction === 'function' && workCommand.isWorkInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await workCommand.handleWorkInteraction(interaction);
      return;
    }

    if (typeof quizCommand?.isQuizInteraction === 'function' && quizCommand.isQuizInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await quizCommand.handleQuizInteraction(interaction);
      return;
    }

    const duelCommand = commandsByName.get('py-duel');
    if (typeof duelCommand?.isDuelInteraction === 'function' && duelCommand.isDuelInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await duelCommand.handleDuelInteraction(interaction);
      return;
    }

    const challengeCommand = commandsByName.get('py-challenge');
    if (typeof challengeCommand?.isChallengeInteraction === 'function' && challengeCommand.isChallengeInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await challengeCommand.handleChallengeInteraction(interaction);
      return;
    }

    const animeCommand = commandsByName.get('py-anime');
    if (typeof animeCommand?.isAnimeInteraction === 'function' && animeCommand.isAnimeInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await animeCommand.handleAnimeInteraction(interaction);
      return;
    }

    if (typeof jokenpoCommand?.isJokenpoInteraction === 'function' && jokenpoCommand.isJokenpoInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await jokenpoCommand.handleJokenpoInteraction(interaction);
      return;
    }

    if (typeof likelyCommand?.isLikelyInteraction === 'function' && likelyCommand.isLikelyInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await likelyCommand.handleLikelyInteraction(interaction);
      return;
    }


    const wikiCommand = commandsByName.get('py-wiki');
    if (typeof wikiCommand?.isWikiInteraction === 'function' && wikiCommand.isWikiInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await wikiCommand.handleWikiInteraction(interaction);
      return;
    }

    const albumCommand = commandsByName.get('py-album') || commandsByName.get('album');
    if (typeof albumCommand?.isAlbumInteraction === 'function' && albumCommand.isAlbumInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await albumCommand.handleAlbumInteraction(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    incrementCommand();
    recordUniqueUser(interaction.user.id);

    const command = commandsByName.get(interaction.commandName);

    const ephemeralCommands = new Set([
      'tarot', 'py-tarot',
      'ajuda', 'help', 'py-help',
      'inventario', 'inventory', 'py-inventory',
      'admin', 'py-admin',
      'bonus', 'py-bonus',
      'biscoito', 'cookie', 'py-cookie',
    ]);

    if (command) {
      const access = guildFeatures.checkCommandAccess({
        guildId: interaction.guildId,
        channel: interaction.channel || { id: interaction.channelId },
        command,
      });
      if (!access.allowed) {
        await interaction.reply({ ...setupCommand.handleAccessDenied(access, interaction, interaction.member), flags: MessageFlags.Ephemeral });
        return;
      }
    }

    const isEphemeral = Boolean(
      command?.ephemeral ||
      ephemeralCommands.has(command?.name) ||
      ephemeralCommands.has(interaction.commandName)
    );
    await interaction.deferReply({ flags: isEphemeral ? MessageFlags.Ephemeral : undefined });
    if (!command) {
      await interaction.editReply({ content: t('common.commandUnavailable', interaction) });
      return;
    }

    // Guarda de Escopo de Guilda (Zona B - Cringelândia Lab)
    if (Array.isArray(command.guildScope) && command.guildScope.length > 0) {
      if (!interaction.guildId || !command.guildScope.includes(interaction.guildId)) {
        await interaction.editReply({ content: t('common.guildScopeOnly', interaction) });
        return;
      }
    }

    const startTime = Date.now();
    let success = true;
    let cmdErr = null;
    try {
      if (typeof command.executeSlash === 'function') {
        await command.executeSlash({ interaction });
      } else if (typeof command.execute === 'function') {
        await command.execute(interaction);
      } else {
        await interaction.editReply({ content: t('common.commandUnavailable', interaction) });
        return;
      }
    } catch (cmdError) {
      success = false;
      cmdErr = cmdError;
      throw cmdError;
    } finally {
      const durationMs = Date.now() - startTime;
      if (interaction.guild) growthFunnel.recordGuildCommand(interaction.guildId);
      recordCommand({
        name: interaction.commandName,
        type: 'slash',
        guildId: interaction.guildId,
        userId: interaction.user?.id,
        lang: interaction.locale || 'pt-BR',
        success,
        durationMs,
        error: cmdErr ? cmdErr.message : null,
        category: command?.category,
      });
      recordActivity({
        userId: interaction.user?.id,
        guildId: interaction.guildId,
        success,
        context: `slash:${interaction.commandName}`,
      });
    }
  } catch (error) {
    console.error(`Erro ao processar interaction (${interaction.commandName || interaction.customId}):`, error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: t('common.actionError', interaction) }).catch(() => null);
    } else {
      await interaction.reply({ content: t('common.actionErrorShort', interaction), flags: MessageFlags.Ephemeral }).catch(() => null);
    }
  }
});

// Conquistas: depois de cada comando ou clique (inclusive dos módulos), verifica com limite de
// uma vez a cada 15s por pessoa e avisa em mensagem privada. O atraso deixa o comando terminar.
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;
  if (interaction.isChatInputCommand() && interaction.commandName === achievementsCommand.name) return;
  const timer = setTimeout(() => {
    achievements.notifyNewAchievements(interaction).catch(() => null);
  }, 2500);
  if (typeof timer.unref === 'function') timer.unref();
});

client.on(Events.Error, (error) => {
  console.error('[Discord:Client] Erro:', error);
});

client.on(Events.Warn, (info) => {
  console.warn('[Discord:Client] Aviso:', info);
});

client.on(Events.ShardError, (error, shardId) => {
  console.error(`[Discord:Shard ${shardId}] Erro de conexão:`, error);
});

client.on(Events.ShardDisconnect, (event, shardId) => {
  console.warn(`[Discord:Shard ${shardId}] Desconectado (código ${event?.code || 'desconhecido'})`);
});

client.on(Events.ShardReconnecting, (shardId) => {
  console.log(`[Discord:Shard ${shardId}] Reconectando ao Discord Gateway...`);
});

client.on(Events.ShardResume, (shardId, replayedEvents) => {
  console.log(`[Discord:Shard ${shardId}] Conexão restabelecida (${replayedEvents} eventos reprocessados).`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Runtime:UnhandledRejection] Rejeição assíncrona não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Runtime:UncaughtException] Exceção crítica capturada:', error);
});

function handleAppShutdown() {
  flushSync();
  flushInventorySync();
  flushTelemetrySync();
  releaseBotLock();
}

process.on('SIGINT', () => {
  handleAppShutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  handleAppShutdown();
  process.exit(0);
});

process.on('exit', () => {
  handleAppShutdown();
});

async function handleSendEmbedCommand(data) {
  const { channelId, title, description, color, fields } = data || {};
  try {
    const normalizedChannelId = normalizeChannelValue(channelId);
    const channel = await client.channels.fetch(normalizedChannelId).catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.error(`[IPC] Canal inválido ou não encontrado para envio de embed: ${channelId}`);
      return;
    }

    let embedColor = '#E60067';
    if (color) {
      const cleanColor = String(color).replace('#', '').trim();
      if (/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
        embedColor = `#${cleanColor}`;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(embedColor)
      .setTimestamp()
      .setFooter({ text: 'Cringelândia • Seu lugar de ser você' });

    if (description && String(description).trim()) {
      embed.setDescription(String(description).trim());
    }

    if (Array.isArray(fields) && fields.length > 0) {
      fields.forEach((f) => {
        if (f && f.name && f.value) {
          embed.addFields({
            name: String(f.name),
            value: String(f.value),
            inline: !!f.inline,
          });
        }
      });
    }

    await channel.send({ embeds: [embed] });
    console.log(`[IPC] Embed enviado com sucesso para o canal ${normalizedChannelId}`);
  } catch (error) {
    console.error('[IPC] Erro ao enviar embed via painel web:', error);
  }
}

if (process.stdin) {
  process.stdin.resume();
  if (typeof process.stdin.setEncoding === 'function') {
    process.stdin.setEncoding('utf8');
  }

  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  rl.on('line', (line) => {
    try {
      const trimmed = line.trim();
      if (!trimmed) return;
      const data = JSON.parse(trimmed);
      if (data && data.type) {
        switch (data.type) {
          case 'BRIDGE_REQUEST':
            require('./src/services/botBridgeHandlers').handleBridgeRequest(client, data);
            break;
          case 'SEND_EMBED':
            handleSendEmbedCommand(data);
            break;
          case 'SEASONAL_START':
            console.log('[IPC:Bot] Comando SEASONAL_START recebido do supervisor.');
            seasonalManager.start(Boolean(data.broadcast));
            break;
          case 'SEASONAL_STOP':
            console.log('[IPC:Bot] Comando SEASONAL_STOP recebido do supervisor.');
            seasonalManager.stop();
            break;
          case 'SEASONAL_RELOAD':
            console.log('[IPC:Bot] Comando SEASONAL_RELOAD recebido do supervisor.');
            seasonalManager.reload();
            break;
          case 'SEASONAL_TRIGGER_DROP': {
            console.log('[IPC:Bot] Comando SEASONAL_TRIGGER_DROP recebido do supervisor.');
            const dropHandler = require('./src/modules/seasonal/dropHandler');
            dropHandler.triggerDrop(client, true).then((ok) => {
              console.log(`[Seasonal:Drop] Disparo manual: ${ok ? 'SUCESSO (Baú enviado ao Discord)' : 'FALHOU (verifique canal ou permissões)'}`);
            }).catch((err) => {
              console.error('[IPC:Bot] Erro ao disparar drop:', err);
            });
            break;
          }
          case 'SEASONAL_TRIGGER_ART': {
            console.log('[IPC:Bot] Comando SEASONAL_TRIGGER_ART recebido do supervisor.');
            const artHandler = require('./src/modules/seasonal/artHandler');
            artHandler.tallyWeeklyArt(client).then((res) => {
              console.log(`[Seasonal:Art] Apuração manual executada: ${res?.message || 'Sucesso'}`);
            }).catch((err) => {
              console.error('[IPC:Bot] Erro ao apurar arte:', err);
            });
            break;
          }
          case 'RELOAD_EMOJIS': {
            console.log('[IPC:Bot] Comando RELOAD_EMOJIS recebido do supervisor.');
            const { reloadEmojiConfig } = require('./src/utils/appEmojis');
            reloadEmojiConfig();
            break;
          }
          case 'MODULE_TOGGLE': {
            console.log(`[IPC:Bot] Comando MODULE_TOGGLE recebido para '${data.moduleId}' (enabled=${data.enabled}).`);
            moduleManager.toggleModule(data.moduleId, Boolean(data.enabled)).catch((err) => {
              console.error(`[IPC:Bot] Erro ao alternar módulo '${data.moduleId}':`, err);
            });
            break;
          }
          case 'MODULE_RELOAD': {
            console.log(`[IPC:Bot] Comando MODULE_RELOAD recebido para '${data.moduleId}'.`);
            moduleManager.reloadModule(data.moduleId).catch((err) => {
              console.error(`[IPC:Bot] Erro ao recarregar módulo '${data.moduleId}':`, err);
            });
            break;
          }
          case 'MUSEUM_HARVEST_TRIGGER': {
            console.log(`[IPC:Bot] Comando MUSEUM_HARVEST_TRIGGER recebido (limit=${data.limit || 50}).`);
            const museumManager = require('./src/modules/museum/museumManager');
            museumManager.harvestBatch(parseInt(data.limit, 10) || 50).then((res) => {
              console.log(`[Museum:Harvester] Disparo manual via IPC concluído: ${res?.message || 'Sucesso'}`);
            }).catch((err) => {
              console.error('[IPC:Bot] Erro ao executar colheita do museu:', err);
            });
            break;
          }
          case 'PARTNERSHIP_POST_PANEL': {
            console.log('[IPC:Bot] Comando PARTNERSHIP_POST_PANEL recebido do supervisor.');
            const partnershipManager = require('./src/modules/partnerships/partnershipManager');
            partnershipManager.postPanel().then((res) => {
              console.log(`[Partnerships:Panel] Postagem do painel via IPC: ${res.ok ? 'SUCESSO no canal ' + res.channelId : 'FALHOU: ' + res.message}`);
            }).catch((err) => {
              console.error('[IPC:Bot] Erro ao postar painel de parcerias:', err);
            });
            break;
          }
          case 'TAROT_DAILY_TRIGGER': {
            console.log('[IPC:Bot] Comando TAROT_DAILY_TRIGGER recebido do supervisor.');
            postTarotDailyAnnouncement().then(() => {
              console.log('[Tarot:Daily] Anúncio diário postado com sucesso via IPC.');
            }).catch((err) => {
              console.error('[Tarot:Daily] Erro ao postar anúncio diário via IPC:', err);
            });
            break;
          }
          case 'FORCE_LEAVE_GUILD': {
            console.log(`[IPC:Bot] Comando FORCE_LEAVE_GUILD recebido para '${data.guildId}'.`);
            forceLeaveGuild(client, data.guildId)
              .then(() => updateLiveStats())
              .catch((err) => console.error('[IPC:Bot] Erro ao forçar saída do servidor:', err.message));
            break;
          }
          case 'SYNC_GUILDS': {
            console.log('[IPC:Bot] Comando SYNC_GUILDS recebido.');
            updateLiveStats();
            break;
          }
        }
      }
    } catch (error) {
      // Ignora linhas que não sejam comandos JSON válidos
    }
  });
}

function handleBotShutdown() {
  try { releaseBotLock(); } catch (_) {}
  try { flushSync(); } catch (_) {}
  try { flushInventorySync(); } catch (_) {}
  try { flushTelemetrySync(); } catch (_) {}
  try { growthFunnel.flushGuildState(); } catch (_) {}
  try {
    if (client && typeof client.destroy === 'function') {
      client.destroy();
    }
  } catch (_) {}
}

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM. Encerrando Pyxie com segurança...');
  handleBotShutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT. Encerrando Pyxie com segurança...');
  handleBotShutdown();
  process.exit(0);
});

process.on('exit', () => {
  handleBotShutdown();
});

if (require.main === module) {
  client.login(DISCORD_TOKEN).catch((error) => {
    console.error('Falha ao conectar com o Discord:', error.message);
    releaseBotLock();
    process.exit(1);
  });
}

module.exports = {
  client,
  slashCommands,
};

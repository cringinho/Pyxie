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
} = require('discord.js');
const { acquireBotLock, releaseBotLock, getPrefix } = require('./src/utils/botUtils');
const { getWelcomeChannel, normalizeChannelValue } = require('./src/services/database');
const { commandsByName, slashCommands } = require('./src/commands');
const marriageCommand = require('./src/commands/casamento');
const tarotCommand = require('./src/commands/tarot');
const helpCommand = require('./src/commands/help');
const shopCommand = require('./src/commands/loja');
const inventoryCommand = require('./src/commands/inventario');
const profileCommand = require('./src/commands/perfil');
const workCommand = require('./src/commands/trabalho');
const dailyCommand = require('./src/commands/daily');
const tradeCommand = require('./src/commands/trocar');
const rankingCommand = require('./src/commands/ranking');
const idiomaCommand = require('./src/commands/idioma');
const jokenpoCommand = require('./src/commands/jokenpo');
const likelyCommand = require('./src/commands/provavel');
const exploreCommand = require('./src/commands/explore');
const { syncApplicationEmojis } = require('./src/utils/appEmojis');
const { registerAutomation, updateAutomation } = require('./src/services/automationSchedule');
const {
  DISCORD_TOKEN,
  STARTUP_CHANNEL_ID,
  STATUS_IMAGE_URL,
  BUMP_GUIDE_CHANNEL_ID,
  BUMP_GUIDE_INTERVAL_MS,
  SERVER_REVIEW_URL,
  WELCOME_ROLE_ID,
  WELCOME_CHANNEL_ID,
  RULES_CHANNEL_ID,
  GUIDES_CHANNEL_ID,
  COLORS_CHANNEL_ID,
  TAROT_CHANNEL_ID,
  TAROT_LOG_CHANNEL_ID,
  TAROT_ROLE_ID,
  KUROMI_STARTUP_EMOJI,
} = require('./src/config');
const { incrementCommand, incrementMessages, recordUniqueUser, updateStats, flushSync } = require('./src/services/logging');
const { setGuildLanguage } = require('./src/utils/i18n');
const { flushInventorySync } = require('./src/services/inventory');
const { getBrasiliaDate, resetDailyDraws } = require('./src/services/tarot');
const { getAnimatedEmoji } = require('./src/utils/serverEmojis');

const welcomeHeartReactions = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🩵', '🖤', '🤍', '🤎'];
const CRINGE_PHRASE_COOLDOWN_MS = 60 * 1000;
const cringePhraseCooldowns = new Map();
const processedCringeMessageIds = new Set();
const recentWelcomes = new Map();
const processedMessageIds = new Map();
const processedInteractionIds = new Map();

function getRandomWelcomeHeart() {
  return welcomeHeartReactions[Math.floor(Math.random() * welcomeHeartReactions.length)];
}

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
  ],
  // Otimização de memória e cache para execução em nuvem (Oracle Cloud / PM2)
  makeCache: Options.cacheWithLimits({
    MessageManager: 25, // Mantém apenas 25 mensagens recentes por canal
    StageInstanceManager: 0,
    VoiceStateManager: 0,
    AutoModerationRuleManager: 0,
    GuildScheduledEventManager: 0,
    ThreadMemberManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
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

  const panelUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';

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
          '> 🌲 **/py-explore** — Aventure-se pelo Bosque Encantado e capture espíritos',
          '> 📖 **/py-grimoire** — Gerencie familiares, auras e caldeirão de fusão',
          '> 💼 **/py-work** — Cumpra expedientes diários e suba na carreira',
          '> 👤 **/py-profile** — Customize títulos, temas e biografia',
          '> 🔮 **/py-tarot** — Tire cartas de tarot com artes exclusivas',
          '> 🤝 **/py-trade** — Negocie itens e moedas com outros membros',
          '> 🪙 **/py-daily** — Resgate moedas diárias e bônus patrocinado',
          '> 🎒 **/py-inventory** — Visualize sua mochila, baús e relíquias',
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

function buildBumpGuideEmbed(guild) {
  const guildName = guild?.name || 'nosso servidor';
  return new EmbedBuilder()
    .setColor('#E60067')
    .setTitle(`${getAnimatedEmoji(guild, ['rocket', 'boost', 'star'], '🚀')}  ✦  Como apoiar ${guildName}`)
    .setDescription(
      'Cada interação aumenta a visibilidade do servidor e ajuda novos membros a encontrarem nossa comunidade. Escolha uma forma de ajudar:'
    )
    .addFields(
      {
        name: '📌 DISBOARD — `/bump`',
        value: 'Use **/bump** quando o DISBOARD permitir para impulsionar o servidor na lista.',
      },
      {
        name: '🐢 Canudinho — `/bump`',
        value: 'Execute **/bump** com o bot Canudinho para registrar o apoio da comunidade.',
      },
      {
        name: '💜 Discadia — `/bump`',
        value: 'No Discadia, execute **/bump** para manter o servidor em destaque.',
      },
      {
        name: '🗳️ Top.gg — `/votar`',
        value: 'Use o comando **/votar** para abrir a página oficial e confirmar seu voto diário.',
      },
      {
        name: '⭐ Review no DISBOARD',
        value: 'Deixe uma avaliação sincera contando como tem sido sua experiência conosco.',
      }
    )
    .setFooter({ text: `${guildName} • Obrigado pelo seu apoio!` })
    .setTimestamp();
}

function buildBumpGuideComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Deixar review')
        .setStyle(ButtonStyle.Link)
        .setURL(SERVER_REVIEW_URL),
      new ButtonBuilder()
        .setLabel('Abrir DISBOARD')
        .setStyle(ButtonStyle.Link)
        .setURL('https://disboard.org/pt-br/server/1453890868980482090')
    ),
  ];
}

async function postBumpGuide() {
  const channel = await client.channels.fetch(BUMP_GUIDE_CHANNEL_ID).catch(() => null);

  if (!channel || !channel.isTextBased()) {
    console.warn(`Canal do guia de bump não encontrado ou inválido: ${BUMP_GUIDE_CHANNEL_ID}`);
    return;
  }

  const recentMessages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  const lastGuide = recentMessages?.find(
    (message) =>
      message.author.id === client.user.id &&
      message.embeds.some(
        (embed) =>
          embed.title?.includes('Como apoiar') ||
          embed.title?.includes('Como ajudar')
      )
  );

  if (lastGuide && Date.now() - lastGuide.createdTimestamp < BUMP_GUIDE_INTERVAL_MS) {
    console.log('Guia de bump já foi publicado recentemente. Ignorando reenvio na inicialização.');
    return;
  }

  await channel.send({
    embeds: [buildBumpGuideEmbed(channel.guild)],
    components: buildBumpGuideComponents(),
    allowedMentions: { parse: [] },
  });
  console.log('Guia de bump publicado com sucesso.');
}

function startBumpGuideScheduler() {
  registerAutomation({
    id: 'bump-guide',
    emoji: '🚀',
    name: 'Guia de apoio / bump',
    action: 'verificação',
    nextAt: Date.now() + BUMP_GUIDE_INTERVAL_MS,
    channelId: BUMP_GUIDE_CHANNEL_ID,
    frequency: 'a cada 12 horas',
  });

  postBumpGuide().catch((error) => {
    console.error('Erro ao publicar o guia de bump:', error);
  });

  setInterval(() => {
    updateAutomation('bump-guide', { nextAt: Date.now() + BUMP_GUIDE_INTERVAL_MS });
    postBumpGuide().catch((error) => {
      console.error('Erro ao publicar o guia de bump:', error);
    });
  }, BUMP_GUIDE_INTERVAL_MS);
}

function buildTarotDailyEmbed(guild) {
  const guildName = guild?.name || '';
  return new EmbedBuilder()
    .setColor('#c084fc')
    .setTitle(`${getAnimatedEmoji(guild, ['moon', 'tarot', 'magic'], '🌙')}  ✦  Tarot Diário${guildName ? ` — ${guildName}` : ''}  ✦`)
    .setDescription(
      'Uma carta por dia para iluminar seus caminhos. A leitura é privada e renderizada especialmente para você!\n\n' +
      'Clique no botão abaixo ou use `/py-tarot` (ou `py!tarot`) para receber a sua tiragem de hoje.'
    )
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

async function postTarotDailyAnnouncement(now = Date.now()) {
  resetDailyDraws(now);
  const channel = await client.channels.fetch(TAROT_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    console.warn(`Canal do Tarot não encontrado ou inválido: ${TAROT_CHANNEL_ID}`);
    return;
  }

  await channel.send({
    content: `<@&${TAROT_ROLE_ID}>`,
    embeds: [buildTarotDailyEmbed(channel.guild)],
    components: buildTarotDailyComponents(),
    allowedMentions: { roles: [TAROT_ROLE_ID] },
  });
}

function startTarotScheduler() {
  const currentCycle = getBrasiliaDate();
  const nextMidnightUtc = Date.parse(`${currentCycle}T03:00:00.000Z`) + 24 * 60 * 60 * 1000;
  const delay = Math.max(1000, nextMidnightUtc - Date.now());

  registerAutomation({
    id: 'tarot-daily',
    emoji: '🌙',
    name: 'Tarot Diário',
    action: 'disparo',
    nextAt: Date.now() + delay,
    channelId: TAROT_CHANNEL_ID,
    frequency: 'diário, à 00:00 BRT',
  });

  setTimeout(() => {
    updateAutomation('tarot-daily', { nextAt: Date.now() + 24 * 60 * 60 * 1000 });
    postTarotDailyAnnouncement().catch((error) => console.error('Erro no anúncio diário do Tarot:', error));
    setInterval(() => {
      updateAutomation('tarot-daily', { nextAt: Date.now() + 24 * 60 * 60 * 1000 });
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

  const now = Date.now();
  const lastTriggeredAt = cringePhraseCooldowns.get(message.author.id) || 0;
  if (now - lastTriggeredAt < CRINGE_PHRASE_COOLDOWN_MS) {
    await message.react('🍅').catch(() => null);
    return true;
  }

  // Registra o cooldown imediatamente para prevenir race conditions com mensagens simultâneas
  cringePhraseCooldowns.set(message.author.id, now);

  await message.react('🌈').catch(() => null);
  
  const localGifPath = path.join(__dirname, 'assets', 'cringe_small.gif');
  if (fs.existsSync(localGifPath)) {
    await message.reply({
      files: [new AttachmentBuilder(localGifPath, { name: 'gacha_boy.gif' })]
    }).catch(() => null);
  } else {
    await message.reply('https://klipy.com/gifs/gacha-life-gacha-boy').catch(() => null);
  }
  return true;
}

function updateLiveStats() {
  try {
    const totalMembers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
    const guildsCount = client.guilds.cache.size;
    updateStats({ totalMembers, guildsCount });
  } catch (_) {}
}

client.once('ready', async () => {
  console.log(`Pyxie conectada como ${client.user.tag}`);

  client.user.setPresence({
    activities: [{ name: 'Bosque da Pyxie • /py-help', type: ActivityType.Playing }],
    status: 'online',
  });

  updateLiveStats();
  await sendStartupAnnouncement();
  await syncApplicationEmojis(client).catch(() => null);
  startBumpGuideScheduler();
  startTarotScheduler();
});

// Atualização automática de catálogo de emojis quando novos emojis forem adicionados/editados/removidos
client.on('emojiCreate', () => syncApplicationEmojis(client));
client.on('emojiDelete', () => syncApplicationEmojis(client));
client.on('emojiUpdate', () => syncApplicationEmojis(client));

// Atualizações dinâmicas de contagem de membros e servidores
client.on('guildCreate', async (guild) => {
  updateLiveStats();

  // Em servidores externos, define explicitamente o idioma padrão como inglês
  if (guild.id !== '1453890868980482090') {
    setGuildLanguage(guild.id, 'en');
  }

  // Envia mensagem introdutória oficial no canal padrão do servidor
  const targetChannel =
    guild.systemChannel ||
    guild.channels.cache.find(
      (c) =>
        c.isTextBased() &&
        c.permissionsFor(guild.members.me || client.user)?.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])
    );

  if (targetChannel) {
    const isEn = guild.id !== '1453890868980482090';
    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle(isEn ? '🧚  ✦  Hello! I am Pyxie!' : '🧚  ✦  Olá! Eu sou a Pyxie!')
      .setDescription(
        isEn
          ? `Thank you for inviting me to **${guild.name}**!\n\n` +
            `🌐 **Default Language:** \`English\`.\n` +
            `You can change the server language anytime with </py-language:0> (or \`py!language\`).\n\n` +
            `✨ **Get Started:**\n` +
            `> 🌲 </py-explore:0> — Adventure in **Pyxie's Grove**, negotiate with 14 spirits & battle the World Boss\n` +
            `> 💼 </py-work:0> — Choose from 10 professions and solve job shift minigames\n` +
            `> 🪙 </py-daily:0> — Claim your daily coins\n` +
            `> 🔮 </py-tarot:0> — Draw your illustrated daily Tarot card\n` +
            `> 📖 </py-help:0> — Browse the full interactive command guide`
          : `Obrigada por me adicionar a **${guild.name}**!\n\n` +
            `🌐 **Idioma do Servidor:** \`Português (pt-BR)\`.\n` +
            `Altere a qualquer momento com </py-language:0>.\n\n` +
            `✨ **Comece agora:**\n` +
            `> 🌲 </py-explore:0> — Explore o **Bosque da Pyxie**, negocie com espíritos e enfrente o Chefão\n` +
            `> 💼 </py-work:0> — Escolha uma profissão e trabalhe nos turnos\n` +
            `> 🪙 </py-daily:0> — Colete suas moedinhas diárias\n` +
            `> 🔮 </py-tarot:0> — Tire sua carta do Tarot\n` +
            `> 📖 </py-help:0> — Veja a lista completa de comandos`
      )
      .setFooter({ text: isEn ? 'Pyxie • Ready for adventure!' : 'Pyxie • Pronta para novas aventuras!' })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] }).catch(() => null);
  }
});
client.on('guildDelete', () => updateLiveStats());
client.on('guildMemberRemove', () => updateLiveStats());

// Mensagem de boas-vindas ao entrar no servidor.
client.on('guildMemberAdd', async (member) => {
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

  const isCringelandia = member.guild.id === '1453890868980482090';
  const configuredWelcomeChannelId = getWelcomeChannel(member.guild.id);

  // Servidores externos só recebem boas-vindas se configuraram um canal explicitamente com /py-welcome
  if (!isCringelandia && !configuredWelcomeChannelId) {
    return;
  }

  const targetChannelId =
    configuredWelcomeChannelId ||
    (isCringelandia ? (getWelcomeChannel('global') || WELCOME_CHANNEL_ID) : null);

  let welcomeChannel = null;
  if (targetChannelId) {
    welcomeChannel =
      member.guild.channels.cache.get(targetChannelId) ||
      (await member.guild.channels.fetch(targetChannelId).catch(() => null));
  }

  if (!welcomeChannel && isCringelandia) {
    welcomeChannel =
      member.guild.systemChannelId ||
      member.guild.channels.cache.find(
        (channel) =>
          channel.isTextBased() &&
          ['welcome', 'bem-vindos', 'entrada', 'chat-geral'].includes(channel.name)
      );
  }

  if (!welcomeChannel) return;

  const guildName = member.guild?.name || 'nosso servidor';
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(`${getAnimatedEmoji(member.guild, ['heart', 'welcome', 'love'], '🎉')}  ✦  Uma nova pessoa chegou`)
    .setDescription(`Que bom ter você aqui, **${member.displayName}**! Seja muito bem-vindo(a) a **${guildName}**!`)
    .addFields(
      {
        name: '📜 Regras do Servidor',
        value: `Consulte <#${RULES_CHANNEL_ID}> para conhecer nossas diretrizes e manter um ambiente acolhedor.`,
      },
      {
        name: '🧭 Explore o Servidor',
        value: `Veja tutoriais e canais importantes em <#${GUIDES_CHANNEL_ID}>.`,
      },
      {
        name: '🎨 Personalize sua Experiência',
        value: `Escolha suas cores e cargos em <#${COLORS_CHANNEL_ID}>.`,
      }
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setImage('https://cdn.discordapp.com/attachments/1533657882862686218/1541908904487690321/dhj7hfn-842bcc59-b41f-4ef3-888b-dbfc210f4a5c.gif?ex=6a9b2b92&is=6a99da12&hm=7a41318a2f477b04a295a5b209c43de9517cfa47ac6ecf15e351c045aa104714&')
    .setFooter({ text: `${guildName} • Desejamos ótimos momentos na comunidade!` })
    .setTimestamp();

  try {
    const welcomeMessage = await welcomeChannel.send({
      content: isCringelandia
        ? `${member} chegou! <@&${WELCOME_ROLE_ID}>, recebam nossa nova pessoa com carinho 💗`
        : `Welcome ${member} to **${guildName}**! ✨`,
      embeds: isCringelandia ? [welcomeEmbed] : [],
      allowedMentions: {
        users: [member.id],
        roles: isCringelandia ? [WELCOME_ROLE_ID] : [],
      },
    });

    if (isCringelandia) {
      await welcomeMessage.react(getRandomWelcomeHeart()).catch((error) => {
        console.warn('Não foi possível reagir à mensagem de boas-vindas:', error.message);
      });
    }
  } catch (err) {
    console.warn('Falha ao enviar mensagem de boas-vindas:', err.message);
  }
});

// Procura o comando na pasta commands e mantém o index focado na infraestrutura.
client.on('messageCreate', async (message) => {
  if (message.author?.bot) return;

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

  const prefix = getPrefix();
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  const command = commandsByName.get(cmd);
  if (!command || typeof command.executePrefix !== 'function') return;

  incrementCommand();
  try {
    await command.executePrefix({ message, args, prefix });
  } catch (error) {
    console.error(`Erro ao executar prefix command ${prefix}${cmd}:`, error);
    await message.reply('❌ Ocorreu um erro ao executar este comando. Tente novamente mais tarde.').catch(() => null);
  }
});

// O registro compartilhado também encaminha cada slash command ao próprio arquivo.
client.on('interactionCreate', async (interaction) => {
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
    if (tarotCommand.isTarotButton(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await tarotCommand.executeButton({ interaction });
      return;
    }

    if (interaction.isButton() && interaction.customId === 'tarot:draw') {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await interaction.deferReply({ ephemeral: true });
      await tarotCommand.executeSlash({ interaction });
      return;
    }

    if (typeof marriageCommand?.isMarriageButton === 'function' && marriageCommand.isMarriageButton(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await marriageCommand.executeButton({ interaction });
      return;
    }

    if (typeof helpCommand?.isHelpButton === 'function' && helpCommand.isHelpButton(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await helpCommand.executeButton({ interaction });
      return;
    }

    if (typeof shopCommand?.isShopInteraction === 'function' && shopCommand.isShopInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await shopCommand.handleShopInteraction(interaction);
      return;
    }

    if (typeof inventoryCommand?.isInventoryInteraction === 'function' && inventoryCommand.isInventoryInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await inventoryCommand.handleInventoryInteraction(interaction);
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

    if (typeof tradeCommand?.isTradeInteraction === 'function' && tradeCommand.isTradeInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await tradeCommand.handleTradeInteraction(interaction);
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

    if (typeof exploreCommand?.isGloomInteraction === 'function' && exploreCommand.isGloomInteraction(interaction)) {
      incrementCommand();
      recordUniqueUser(interaction.user.id);
      await exploreCommand.handleGloomInteraction(interaction);
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
    const isEphemeral = Boolean(
      command?.ephemeral ||
      command?.name === 'tarot' ||
      command?.name === 'ajuda' ||
      command?.name === 'inventario'
      ['tarot', 'py-tarot', 'ajuda', 'help', 'py-help', 'inventario', 'inventory', 'py-inventory'].includes(command?.name)
    );
    await interaction.deferReply({ flags: isEphemeral ? MessageFlags.Ephemeral : undefined });
    if (!command || typeof command.executeSlash !== 'function') {
      await interaction.editReply({ content: 'Esse comando ainda não está disponível. Não olhe para mim assim; eu também estou investigando.' });
      return;
    }

    await command.executeSlash({ interaction });
  } catch (error) {
    console.error(`Erro ao processar interaction (${interaction.commandName || interaction.customId}):`, error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: '❌ Ocorreu um erro ao processar esta ação. Tente novamente mais tarde.' }).catch(() => null);
    } else {
      await interaction.reply({ content: '❌ Ocorreu um erro ao processar esta ação.', flags: MessageFlags.Ephemeral }).catch(() => null);
    }
  }
});

client.on('error', (error) => {
  console.error('Erro do cliente Discord:', error);
});

function handleAppShutdown() {
  flushSync();
  flushInventorySync();
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
      if (data && data.type === 'SEND_EMBED') {
        handleSendEmbedCommand(data);
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

client.login(DISCORD_TOKEN).catch((error) => {
  console.error('Falha ao conectar com o Discord:', error.message);
  releaseBotLock();
  process.exit(1);
});

module.exports = {
  client,
  slashCommands,
};

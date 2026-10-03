const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');

const CONFIG_PATH = process.env.SEASONAL_CONFIG_PATH || path.join(__dirname, '..', '..', '..', 'data', 'seasonalConfig.json');
const DATA_PATH = process.env.SEASONAL_DATA_PATH || path.join(__dirname, '..', '..', '..', 'data', 'seasonalData.json');

const DEFAULT_CONFIG = {
  active: false,
  eventName: 'Halloween da Cringelândia',
  currencyName: 'Abóboras',
  channels: {
    artChannelId: '',
    dropsChannelId: '',
    announcementsChannelId: '',
  },
  dates: {
    endDate: '2026-11-02T23:59:59-03:00',
    timezone: 'America/Sao_Paulo',
  },
  prizes: {
    firstPlace: '1 Mês de Discord Nitro + Cargo de Bruxo Supremo',
    secondPlace: '5.000 Moedinhas + Cargo de Zumbi da Cringelândia',
    thirdPlace: '2.000 Moedinhas',
  },
  assets: {
    chestImageUrl: 'https://i.imgur.com/link_do_bau_halloween.png',
    emojis: {
      currency: '1548443994902757427', // halloweenabobora
      dropDecoys: [
        { id: '82336witchscaul', label: 'Caldeirão da Bruxa' },
        { id: '1551355578066931763', label: 'Hello Kitty Aboborada' },
        { id: '1548443801515720719', label: 'Zumbicord' },
        { id: '1548444196074033242', label: 'Balinha' },
        { id: '1551356387475595375', label: 'Gatinho Trevinhas' },
        { id: '1548444308401684530', label: 'Wumpus Bruxinho' },
      ],
      artOfWeek: [
        '1548443988745261086', // halloween3gif55
        '1548443994902757427', // halloweenabobora
      ],
    },
  },
  templates: {
    announcementText: '🕸️ **O CIRCO DOS HORRORES COMEÇOU NA CRINGELÂNDIA!** 🕸️\n\nAcharam que iam passar o mês sem serem humilhados? O evento **{eventName}** tá liberado!\n\nJuntem **{currencyName}** nos drops do baú e na Arte da Semana. Quem terminar no topo ganha **{firstPrize}**. Quem perder, só passa vergonha mesmo.\n\nUse `/py-infoevento` pra entender antes de chorar no chat geral.',
    dropEmbedFooter: 'Dica: Use /py-infoevento para entender a pontuação e prazos!',
    artOfWeekWinner: '🎨 **ARTE DA SEMANA DEFINIDA!**\n\nOlha só, parece que temos alguém talentoso no meio de tantos rabiscos. Parabéns {author}, sua arte foi a mais votada e você garantiu **+5 {currencyName}**!\n\nConfiram a obra de arte abaixo:',
    infoEventTitle: '🕸️ {eventName} — GUIA OFICIAL 🕸️',
    infoEventDescription: 'Bem-vindo(a) ao evento temático oficial da Cringelândia! Acumule **{currencyName}** participando das atividades e dispute o topo do placar.',
    infoEventRules: '• **Baú da Pyxie (Drops):** Surgem de surpresa em {dropsChannel} (3x/dia na semana e 6x/dia nos fins de semana). Seja o primeiro a clicar na reação certa!\n• **Arte da Semana:** Poste sua arte em {artChannel} marcando a Pyxie (@Pyxie). A arte mais votada aos domingos (10:00 BRT) ganha **+5 {currencyName}**!',
    infoEventExtra: '> Use **/py-rank** para conferir o placar dos membros mais dedicados!\n> Dúvidas ou choro? Procure a moderação antes de passar vergonha no chat geral.',
  },
};

const DEFAULT_DATA = {
  balances: {},
  userProfiles: {},
  currentWeekArt: [],
  history: {
    lastDropMessageId: null,
    lastWinners: null,
    lastArtTallyAt: null,
    talliedArtMessageIds: [],
  },
};

// Referências em tempo de execução
let clientRef = null;
let appRef = null;
let sendIpcRef = null;
let scheduledJobs = [];
let artMessageHandler = null;

// Escrita Atômica Segura
function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`[Seasonal] Erro na escrita atômica em ${filePath}:`, err);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (_) {}
    return false;
  }
}

function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      atomicWriteJson(CONFIG_PATH, DEFAULT_CONFIG);
      return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.error('[Seasonal] Falha ao ler seasonalConfig.json, usando padrão:', err);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function saveConfig(updates, overwrite = false) {
  if (overwrite) {
    atomicWriteJson(CONFIG_PATH, updates);
    return updates;
  }
  const current = loadConfig();
  const merged = {
    ...current,
    ...updates,
    channels: { ...(current.channels || {}), ...(updates.channels || {}) },
    dates: { ...(current.dates || {}), ...(updates.dates || {}) },
    prizes: { ...(current.prizes || {}), ...(updates.prizes || {}) },
    assets: {
      ...(current.assets || {}),
      ...(updates.assets || {}),
      emojis: {
        ...(current.assets?.emojis || {}),
        ...(updates.assets?.emojis || {}),
        ...(Array.isArray(updates.assets?.emojis?.dropDecoys) ? { dropDecoys: updates.assets.emojis.dropDecoys } : {}),
        ...(Array.isArray(updates.assets?.emojis?.artOfWeek) ? { artOfWeek: updates.assets.emojis.artOfWeek } : {}),
      },
    },
    templates: { ...(current.templates || {}), ...(updates.templates || {}) },
  };
  atomicWriteJson(CONFIG_PATH, merged);
  return merged;
}

function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      atomicWriteJson(DATA_PATH, DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch (err) {
    console.error('[Seasonal] Falha ao ler seasonalData.json, usando padrão:', err);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveData(updates) {
  const current = loadData();
  const merged = { ...current, ...updates };
  atomicWriteJson(DATA_PATH, merged);
  return merged;
}

function isSeasonalActive() {
  const cfg = loadConfig();
  return Boolean(cfg.active);
}

// Catálogo em memória de Application Emojis da Pyxie (1.182 emojis)
const appEmojisMapByName = new Map();
const appEmojisMapById = new Map();
let simplifiedAppEmojisCache = null;

function getSimplifiedAppEmojis() {
  if (simplifiedAppEmojisCache) return simplifiedAppEmojisCache;
  try {
    const catalogPath = path.join(__dirname, '..', '..', 'data', 'discordAppEmojis.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (parsed.items || []);
      simplifiedAppEmojisCache = list.map((e) => ({
        id: String(e.id),
        name: e.name,
        animated: Boolean(e.animated),
        url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`,
      }));
      for (const e of simplifiedAppEmojisCache) {
        appEmojisMapByName.set(e.name.toLowerCase(), e);
        appEmojisMapById.set(String(e.id), e);
      }
      return simplifiedAppEmojisCache;
    }
  } catch (err) {
    console.warn('[Seasonal] Falha ao carregar discordAppEmojis.json:', err.message);
  }
  simplifiedAppEmojisCache = [];
  return simplifiedAppEmojisCache;
}

// Inicializa catálogo imediatamente
getSimplifiedAppEmojis();

// Resolução de objeto completo de emoji para Drops, Embeds e Reações
function resolveSeasonalEmojiObject(client, emojiKeyOrId, fallback = '🎃') {
  getSimplifiedAppEmojis();

  if (!emojiKeyOrId) {
    return {
      id: null,
      name: 'padrao',
      animated: false,
      formatted: fallback,
      reactable: fallback,
      url: null,
      isUnicode: true,
    };
  }

  const str = String(emojiKeyOrId).trim();

  // 1. Emoji Unicode direto
  if (/\p{Extended_Pictographic}/u.test(str)) {
    return {
      id: null,
      name: str,
      animated: false,
      formatted: str,
      reactable: str,
      url: null,
      isUnicode: true,
    };
  }

  // 2. Busca por Snowflake ID no catálogo de Application Emojis da Pyxie
  if (appEmojisMapById.has(str)) {
    const item = appEmojisMapById.get(str);
    return {
      id: item.id,
      name: item.name,
      animated: item.animated,
      formatted: item.animated ? `<a:${item.name}:${item.id}>` : `<:${item.name}:${item.id}>`,
      reactable: item.id,
      url: item.url,
      isUnicode: false,
    };
  }

  // 3. Busca por Nome ou Alias no catálogo de Application Emojis da Pyxie
  const lower = str.toLowerCase();
  const aliasNameMap = {
    '4124hellokit': '4124hellokittypumpkin',
    'ardiscordzomb': 'ardiscordzombie',
    '5479_kindergarten': '5479_kindergarten2_pumpkin',
    '82336witchscaul': '82336witchscauldron',
  };
  const targetName = aliasNameMap[lower] || lower;
  if (appEmojisMapByName.has(targetName)) {
    const item = appEmojisMapByName.get(targetName);
    return {
      id: item.id,
      name: item.name,
      animated: item.animated,
      formatted: item.animated ? `<a:${item.name}:${item.id}>` : `<:${item.name}:${item.id}>`,
      reactable: item.id,
      url: item.url,
      isUnicode: false,
    };
  }

  // 4. Busca no cache da Guild ou do Bot
  if (client) {
    const found =
      client.emojis?.cache?.find((e) => e.name === str || e.id === str || e.name?.toLowerCase() === lower) ||
      client.application?.emojis?.cache?.find((e) => e.name === str || e.id === str || e.name?.toLowerCase() === lower);

    if (found) {
      return {
        id: String(found.id),
        name: found.name,
        animated: Boolean(found.animated),
        formatted: found.toString(),
        reactable: String(found.id),
        url: found.url || `https://cdn.discordapp.com/emojis/${found.id}.${found.animated ? 'gif' : 'png'}`,
        isUnicode: false,
      };
    }
  }

  // 5. Fallbacks temáticos canônicos caso emoji não esteja no catálogo
  const knownFallbacks = {
    '5479_kindergarten': '🎃',
    'ardiscordzomb': '🧟',
    'ardiscordzombie': '🧟',
    'purplecandy': '🍬',
    'halloweenabobora': '🎃',
    'kuromiwitch': '🧙',
    'witchwumpus': '🧙',
    '82336witchscaul': '🍲',
    '4124hellokit': '🐱',
    '31772purpleween': '🎃',
    '8320_hallowee': '🎨',
    '36577halloween': '🖼️',
    'halloweenpokemon': '🦇',
    'halloweentot8': '👻',
    'halloweentot83': '👻',
    'halloween3gif55': '🕸️',
    'cafehalloweenbat': '🦇',
    'halloween47': '🕯️',
  };

  const fb = knownFallbacks[lower] || fallback;
  return {
    id: null,
    name: str,
    animated: false,
    formatted: fb,
    reactable: fb,
    url: null,
    isUnicode: true,
  };
}

// Resolução inteligente de emojis para Discord e Web (retorna string formatada para embeds)
function resolveSeasonalEmoji(client, emojiKeyOrId, fallback = '🎃') {
  const obj = resolveSeasonalEmojiObject(client, emojiKeyOrId, fallback);
  return obj.formatted;
}

// Manipulação atômica de moedas sazonais
function addSeasonalBalance(userId, amount) {
  if (!userId || typeof amount !== 'number') return 0;
  const data = loadData();
  const current = Number(data.balances[userId] || 0);
  const updated = Math.max(0, current + amount);
  data.balances[userId] = updated;
  saveData(data);
  return updated;
}

function getSeasonalBalance(userId) {
  if (!userId) return 0;
  const data = loadData();
  return Number(data.balances[userId] || 0);
}

function getTopSeasonalBalances(limit = 10) {
  const data = loadData();
  return Object.entries(data.balances || {})
    .map(([userId, balance]) => ({ userId, balance: Number(balance) }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}

function updateUserProfile(userId, profile) {
  if (!userId || !profile) return;
  const data = loadData();
  data.userProfiles = data.userProfiles || {};
  data.userProfiles[String(userId)] = {
    ...(data.userProfiles[String(userId)] || {}),
    ...profile,
    updatedAt: Date.now(),
  };
  saveData(data);
}

function getSeasonalLeaderboard(limit = 50) {
  const data = loadData();
  const balances = data.balances || {};
  const profiles = data.userProfiles || {};
  const entries = Object.entries(balances)
    .map(([userId, balance]) => {
      const prof = profiles[userId] || {};
      const shortId = String(userId).slice(-4);
      return {
        userId,
        balance: Number(balance) || 0,
        username: prof.username || `Aventureiro#${shortId}`,
        displayName: prof.displayName || prof.username || `Aventureiro (${shortId})`,
        avatarUrl: prof.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${(Number(shortId) || 0) % 5}.png`,
      };
    })
    .filter((e) => e.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  return entries.slice(0, limit).map((e, idx) => ({
    rank: idx + 1,
    ...e,
  }));
}

async function syncTopUserProfiles(client) {
  if (!client || !client.users) return;
  try {
    const data = loadData();
    data.userProfiles = data.userProfiles || {};
    let changed = false;
    const userIds = Object.keys(data.balances || {});
    for (const id of userIds) {
      if (!data.userProfiles[id] || !data.userProfiles[id].avatarUrl) {
        try {
          const u = await client.users.fetch(id).catch(() => null);
          if (u) {
            data.userProfiles[id] = {
              username: u.username,
              displayName: u.displayName || u.username,
              avatarUrl: u.displayAvatarURL ? u.displayAvatarURL({ extension: 'png', size: 128 }) : null,
              updatedAt: Date.now(),
            };
            changed = true;
          }
        } catch (_) {}
      }
    }
    if (changed) {
      saveData(data);
    }
  } catch (err) {
    console.warn('[Seasonal] Falha ao sincronizar perfis de usuários:', err.message);
  }
}

// Verificação de Encerramento e Premiação
async function checkEndEvent(client = clientRef) {
  const config = loadConfig();
  if (!config.active) return false;

  const endTimestamp = Date.parse(config.dates.endDate);
  if (isNaN(endTimestamp)) return false;

  const now = Date.now();
  if (now >= endTimestamp) {
    console.log('[Seasonal] Data limite atingida! Encerrando evento sazonal automaticamente...');
    await finalizeAndRewardEvent(client, 'Data limite de evento atingida.');
    return true;
  }
  return false;
}

async function finalizeAndRewardEvent(client = clientRef, reason = 'Fim do período do evento') {
  const config = loadConfig();
  const data = loadData();

  // 1. Desliga o evento
  config.active = false;
  saveConfig({ active: false });

  // 2. Apura os 3 primeiros colocados
  const topWinners = getTopSeasonalBalances(3);
  data.history.lastWinners = {
    date: new Date().toISOString(),
    reason,
    winners: topWinners,
  };
  saveData(data);

  // 3. Publica embed de encerramento se canal de anúncios configurado
  if (client && config.channels.announcementsChannelId) {
    try {
      const channel = await client.channels.fetch(config.channels.announcementsChannelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const currencyEmoji = resolveSeasonalEmoji(client, config.assets?.emojis?.currency, '🎃');
        const winnerLines = topWinners.length
          ? topWinners.map((w, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              const prize = idx === 0 ? config.prizes.firstPlace : idx === 1 ? config.prizes.secondPlace : config.prizes.thirdPlace;
              return `${medal} <@${w.userId}> — **${w.balance}** ${currencyEmoji} ${config.currencyName}\n> 🎁 *Prêmio:* ${prize || 'Honra e Glória'}`;
            }).join('\n\n')
          : 'Ninguém teve coragem de juntar moedas suficientes. Que vexame.';

        const endEmbed = new EmbedBuilder()
          .setColor('#7c3aed')
          .setTitle(`🕸️ ${config.eventName.toUpperCase()} — EVENTO ENCERRADO! 🕸️`)
          .setDescription(
            `Chegou ao fim o circo dos horrores! A Pyxie agradece (ou não) a todos que tentaram não passar vergonha.\n\n` +
            `🏆 **VENCEDORES OFICIAIS:**\n\n${winnerLines}\n\n` +
            `*Os prêmios serão entregues pela moderação. Quem perdeu, chore na fila do pão!*`
          )
          .setFooter({ text: config.templates.dropEmbedFooter || 'Dica: Use /py-infoevento para entender a pontuação e prazos!' })
          .setTimestamp();

        await channel.send({ embeds: [endEmbed] }).catch(() => null);
      }
    } catch (err) {
      console.error('[Seasonal] Erro ao enviar anúncio de encerramento:', err);
    }
  }

  // 4. Libera 100% da memória
  stop();
}

// Inicialização e Ciclo de Vida do Plugin
function init(client, app, sendIpc = null) {
  if (sendIpc) {
    sendIpcRef = sendIpc;
  }

  if (app) {
    appRef = app;
    setupWebRoutes(app);
  }

  if (client) {
    clientRef = client;
    const config = loadConfig();
    if (config.active) {
      start();
    } else {
      stop();
    }
  }
}

function reload() {
  const config = loadConfig();
  if (config.active) {
    stopJobsAndListeners();
    if (clientRef) {
      const artHandler = require('./artHandler');
      const dropHandler = require('./dropHandler');
      artHandler.start(clientRef);
      dropHandler.start(clientRef);

      artMessageHandler = (message) => {
        artHandler.handleArtSubmission(message, clientRef).catch((err) => {
          console.error('[Seasonal] Erro ao processar submissão de arte:', err);
        });
      };
      clientRef.on('messageCreate', artMessageHandler);
    }
  } else {
    stop();
  }
}

function start(broadcastAnnouncement = false) {
  const config = loadConfig();
  saveConfig({ active: true });

  // Limpa agendamentos anteriores para evitar duplicações
  stopJobsAndListeners();

  const artHandler = require('./artHandler');
  const dropHandler = require('./dropHandler');

  // Inicia crons dos submódulos
  artHandler.start(clientRef);
  dropHandler.start(clientRef);

  // Listener para submissão de artes da semana no canal designado
  if (clientRef) {
    artMessageHandler = (message) => {
      artHandler.handleArtSubmission(message, clientRef).catch((err) => {
        console.error('[Seasonal] Erro ao processar submissão de arte:', err);
      });
    };
    clientRef.on('messageCreate', artMessageHandler);
  }

  // Cron diário às 23:59 BRT para verificação pontual do término (zero memory leak)
  const endCheckJob = cron.schedule(
    '59 23 * * *',
    () => {
      checkEndEvent(clientRef).catch((err) => console.error('[Seasonal] Erro na checagem diária de encerramento:', err));
    },
    { timezone: config.dates.timezone || 'America/Sao_Paulo' }
  );
  scheduledJobs.push(endCheckJob);

  // Checagem imediata ao iniciar
  checkEndEvent(clientRef).catch(() => null);

  // Anúncio público oficial se solicitado
  if (broadcastAnnouncement && clientRef && config.channels.announcementsChannelId) {
    sendStartAnnouncement(clientRef, config).catch((err) => console.error('[Seasonal] Falha ao enviar anúncio de início:', err));
  }

  console.log('[Seasonal] Módulo sazonal ativado e agendado com sucesso!');
}

function stop() {
  saveConfig({ active: false });
  stopJobsAndListeners();
  console.log('[Seasonal] Módulo sazonal desativado e memória limpa.');
}

function stopJobsAndListeners() {
  // Para submódulos
  try {
    const artHandler = require('./artHandler');
    artHandler.stop();
  } catch (_) {}

  try {
    const dropHandler = require('./dropHandler');
    dropHandler.stop();
  } catch (_) {}

  // Cancela crons do orquestrador
  for (const job of scheduledJobs) {
    try {
      job.stop();
    } catch (_) {}
  }
  scheduledJobs = [];

  // Remove listener do bot se estiver ativo
  if (clientRef && artMessageHandler) {
    clientRef.removeListener('messageCreate', artMessageHandler);
    artMessageHandler = null;
  }
}

async function sendStartAnnouncement(client, config) {
  if (!config.channels.announcementsChannelId) return;
  const channel = await client.channels.fetch(config.channels.announcementsChannelId).catch(() => null);
  if (!channel || !channel.isTextBased()) return;

  const rawText = config.templates.announcementText || DEFAULT_CONFIG.templates.announcementText;
  const replaced = rawText
    .replace(/{eventName}/g, config.eventName)
    .replace(/{currencyName}/g, config.currencyName)
    .replace(/{firstPrize}/g, config.prizes.firstPlace || 'prêmio misterioso');

  const startEmbed = new EmbedBuilder()
    .setColor('#a855f7')
    .setTitle(`🕸️ ${config.eventName.toUpperCase()} 🕸️`)
    .setDescription(replaced)
    .setImage(config.assets?.chestImageUrl || DEFAULT_CONFIG.assets.chestImageUrl)
    .setFooter({ text: config.templates.dropEmbedFooter || DEFAULT_CONFIG.templates.dropEmbedFooter })
    .setTimestamp();

  await channel.send({ embeds: [startEmbed] }).catch(() => null);
}

// Configuração das rotas web administrativas desacopladas
function setupWebRoutes(app) {
  // Evita re-registrar rotas caso init seja chamado múltiplas vezes
  if (app._seasonalRoutesRegistered) return;
  app._seasonalRoutesRegistered = true;

  const { requireAdminAuth } = require('../../services/adminAuth');
  const cardRenderer = require('./cardRenderer');

  // 0. Rotas públicas do Ranking ao Vivo (com isolamento estrito por módulo)
  app.get(['/evento', '/ranking', '/evento/ranking', '/ranking-sazonal'], (req, res) => {
    if (!isSeasonalActive()) {
      return res.status(404).redirect('/');
    }

    const config = loadConfig();
    const data = loadData();
    const leaderboard = getSeasonalLeaderboard(50);
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const currencyEmojiObj = resolveSeasonalEmojiObject(clientRef, config.assets?.emojis?.currency, '🎃');

    res.render(path.join(__dirname, 'views', 'rankingSazonal.ejs'), {
      config,
      data,
      leaderboard,
      lang,
      currencyEmojiUrl: currencyEmojiObj.url || 'https://cdn.discordapp.com/emojis/1551355734577381447.png',
      currencyEmojiFormatted: currencyEmojiObj.formatted,
      active: true,
    });
  });

  app.get(['/api/sazonal/ranking', '/api/seasonal/ranking'], (req, res) => {
    if (!isSeasonalActive()) {
      return res.json({
        success: false,
        active: false,
        leaderboard: [],
        message: 'Nenhum evento sazonal ativo no momento.',
      });
    }

    const config = loadConfig();
    const data = loadData();
    const leaderboard = getSeasonalLeaderboard(50);
    const currencyEmojiObj = resolveSeasonalEmojiObject(clientRef, config.assets?.emojis?.currency, '🎃');

    let totalPumpkins = 0;
    for (const b of Object.values(data.balances || {})) {
      totalPumpkins += Number(b) || 0;
    }

    return res.json({
      success: true,
      active: true,
      eventName: config.eventName,
      currencyName: config.currencyName,
      currencyEmojiUrl: currencyEmojiObj.url || 'https://cdn.discordapp.com/emojis/1551355734577381447.png',
      currencyEmojiFormatted: currencyEmojiObj.formatted,
      endDate: config.dates?.endDate,
      timezone: config.dates?.timezone || 'America/Sao_Paulo',
      prizes: config.prizes,
      assets: config.assets,
      stats: {
        totalPumpkins,
        totalParticipants: Object.keys(data.balances || {}).length,
        totalArtSubmissions: (data.currentWeekArt || []).length,
      },
      leaderboard,
      currentWeekArt: (data.currentWeekArt || []).map((a) => ({
        messageId: a.messageId,
        authorId: a.authorId,
        authorName: data.userProfiles?.[a.authorId]?.displayName || a.authorName || 'Artista da Cringelândia',
        authorAvatar: data.userProfiles?.[a.authorId]?.avatarUrl || a.authorAvatar || `https://cdn.discordapp.com/embed/avatars/${Number(String(a.authorId).slice(-2)) % 5}.png`,
        imageUrl: a.imageUrl,
        submittedAt: a.submittedAt,
      })),
      updatedAt: Date.now(),
    });
  });

  // Card de Imagem Viral para Redes Sociais & OpenGraph / Twitter Cards
  app.get(['/api/sazonal/card.png', '/api/sazonal/ranking-card.png', '/evento/card.png'], async (req, res) => {
    if (!isSeasonalActive()) {
      return res.status(404).send('Evento sazonal inativo');
    }
    try {
      const config = loadConfig();
      const leaderboard = getSeasonalLeaderboard(5);
      const lang = req.query.lang === 'en' ? 'en' : 'pt';
      const force = req.query.force === 'true';

      const pngBuffer = await cardRenderer.renderLeaderboardCard(leaderboard, config, { lang, force });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=30');
      if (req.query.download === 'true') {
        res.setHeader('Content-Disposition', 'attachment; filename="ranking-cringelandia.png"');
      }
      return res.send(pngBuffer);
    } catch (err) {
      console.error('[Seasonal:Card] Erro ao gerar imagem do ranking:', err);
      return res.status(500).send('Erro ao renderizar imagem do ranking');
    }
  });

  // Proxy seguro de avatar com CORS habilitado
  app.get('/api/sazonal/avatar-proxy', async (req, res) => {
    const avatarUrl = req.query.url;
    if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.startsWith('http')) {
      return res.status(400).send('URL de avatar inválida');
    }
    try {
      const fetchRes = await fetch(avatarUrl);
      if (!fetchRes.ok) return res.status(fetchRes.status).send('Erro ao buscar avatar');
      const buffer = Buffer.from(await fetchRes.arrayBuffer());
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });

  // Rota de visualização da página administrativa (/admin/sazonal)
  app.get('/admin/sazonal', (req, res) => {
    const cookieHeader = req.headers.cookie;
    const sessionCookie = cookieHeader ? (cookieHeader.match(/(?:^|;\s*)pyxie_admin_session=([^;]*)/)?.[1] || null) : null;
    const { isValidAdminSession, isIpAllowed } = require('../../services/adminAuth');
    const isAuthed = (sessionCookie && isValidAdminSession(sessionCookie)) || isIpAllowed(req);

    if (!isAuthed) {
      return res.redirect('/admin');
    }

    const config = loadConfig();
    const data = loadData();
    res.render(path.join(__dirname, 'views', 'adminSazonal.ejs'), {
      config,
      data,
      active: config.active,
      appEmojis: getSimplifiedAppEmojis(),
    });
  });

  // APIs do Painel Sazonal
  app.get('/api/admin/sazonal/emojis', requireAdminAuth, (req, res) => {
    res.json({
      success: true,
      emojis: getSimplifiedAppEmojis(),
    });
  });

  app.get('/api/admin/sazonal/config', requireAdminAuth, (req, res) => {
    res.json({
      success: true,
      config: loadConfig(),
      data: loadData(),
    });
  });

  app.post('/api/admin/sazonal/config', requireAdminAuth, (req, res) => {
    try {
      const updates = req.body || {};
      const saved = saveConfig(updates);
      if (clientRef) {
        reload();
      }
      if (sendIpcRef) {
        sendIpcRef({ type: 'SEASONAL_RELOAD' });
      }
      res.json({ success: true, config: saved });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/sazonal/toggle', requireAdminAuth, (req, res) => {
    try {
      const { active, broadcast } = req.body || {};
      const shouldActive = Boolean(active);
      const saved = saveConfig({ active: shouldActive });

      if (clientRef) {
        if (shouldActive) {
          start(Boolean(broadcast));
        } else {
          stop();
        }
      }

      if (sendIpcRef) {
        sendIpcRef({
          type: shouldActive ? 'SEASONAL_START' : 'SEASONAL_STOP',
          broadcast: Boolean(broadcast),
        });
      }

      res.json({ success: true, active: isSeasonalActive() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/sazonal/trigger-drop', requireAdminAuth, async (req, res) => {
    try {
      const config = loadConfig();
      if (!config.channels?.dropsChannelId) {
        return res.status(400).json({
          success: false,
          error: 'Canal de drops não configurado! Preencha o ID do canal em "Canais da Cringelândia" e salve as alterações antes de testar.',
        });
      }

      if (clientRef) {
        const dropHandler = require('./dropHandler');
        const result = await dropHandler.triggerDrop(clientRef, true);
        return res.json({ success: Boolean(result), message: result ? 'Drop disparado com sucesso no Discord!' : 'Falha ao disparar drop no canal.' });
      }

      if (sendIpcRef) {
        const sent = sendIpcRef({ type: 'SEASONAL_TRIGGER_DROP', force: true });
        if (sent) {
          return res.json({ success: true, message: 'Baú de teste disparado com sucesso no canal do Discord!' });
        }
      }

      return res.status(400).json({ success: false, error: 'Bot Discord não está online para disparar o drop.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/sazonal/trigger-art', requireAdminAuth, async (req, res) => {
    try {
      const config = loadConfig();
      if (!config.channels?.artChannelId) {
        return res.status(400).json({
          success: false,
          error: 'Canal de artes não configurado! Preencha o ID do canal em "Canais da Cringelândia" e salve as alterações antes de testar.',
        });
      }

      if (clientRef) {
        const artHandler = require('./artHandler');
        const result = await artHandler.tallyWeeklyArt(clientRef);
        return res.json({ success: Boolean(result), message: result?.message || 'Apuração realizada com sucesso!' });
      }

      if (sendIpcRef) {
        const sent = sendIpcRef({ type: 'SEASONAL_TRIGGER_ART' });
        if (sent) {
          return res.json({ success: true, message: 'Comando de apuração enviado ao bot Discord!' });
        }
      }

      return res.status(400).json({ success: false, error: 'Bot Discord não está online para apurar arte.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}

module.exports = {
  init,
  start,
  stop,
  reload,
  setupWebRoutes,
  isSeasonalActive,
  loadConfig,
  saveConfig,
  loadData,
  saveData,
  addSeasonalBalance,
  getSeasonalBalance,
  getTopSeasonalBalances,
  getSeasonalLeaderboard,
  updateUserProfile,
  syncTopUserProfiles,
  resolveSeasonalEmoji,
  resolveSeasonalEmojiObject,
  getSimplifiedAppEmojis,
  checkEndEvent,
  finalizeAndRewardEvent,
  DEFAULT_CONFIG,
  DEFAULT_DATA,
};

require('dotenv').config();
const express = require('express');
const compression = require('compression');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

try {
  const sharp = require('sharp');
  sharp.cache({ files: 50, memory: 64 });
} catch (_) {}
const { spawn, execFile } = require('node:child_process');
const { setWelcomeChannel, getWelcomeChannel, normalizeChannelValue, getEconomyConfig, setEconomyConfig } = require('./src/services/database');
const { addLog: savePersistentLog, getLogs, getStats, updateStats, resetStats, clearLogs, flushSync } = require('./src/services/logging');
const { lockFilePath, isProcessAlive } = require('./src/utils/botUtils');
const { reloadEmojiConfig } = require('./src/utils/appEmojis');
const shopeeManager = require('./src/services/shopeeManager');
const workSeederService = require('./src/services/workSeederService');
const quizSeederService = require('./src/services/quizSeederService');
const seasonalManager = require('./src/modules/seasonal/seasonalManager');
const moduleManager = require('./src/services/moduleManager');
const { serveLocalizedPage } = require('./src/utils/seoRenderer');
const { renderTarotCard } = require('./src/services/tarotRenderer');
const tarotCardsList = require('./src/data/tarot.json');
const { generateRssXml, generateAtomXml, generateJsonFeed, generatePinterestRssXml, getDailyTarotCard } = require('./src/services/feedGenerator');
const { autoSubmitAllUrls } = require('./src/services/indexNowService');
const { getUserAccount } = require('./src/services/economy');
const tarotAlbumService = require('./src/services/tarotAlbumService');
const marriageManager = require('./src/modules/marriage/marriageManager');
const { TAROT_ACHIEVEMENTS } = require('./src/data/tarotAchievements');
const embedRegistry = require('./src/utils/embedRegistry');
const acervoAuditService = require('./src/services/acervoAuditService');
const { createAdminMasterRouter } = require('./src/routes/adminMasterRoutes');
const { createExpressTelemetryMiddleware } = require('./src/services/resourceTelemetry');
const { createRouteGateMiddleware } = require('./src/services/webRoutesManager');
const cringelandiaService = require('./src/services/cringelandiaService');

const app = express();
app.set('view engine', 'ejs');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const appRoot = __dirname;
const publicDir = path.join(__dirname, 'public');

let botProcess = null;
let botLogs = [];
let botStartTime = null;

function sendIpcToBot(payload) {
  if (botProcess && !botProcess.killed && botProcess.exitCode === null && botProcess.stdin) {
    try {
      botProcess.stdin.write(JSON.stringify(payload) + '\n');
      return true;
    } catch (err) {
      console.error('[Supervisor] Erro ao enviar comando IPC para o bot:', err.message);
      return false;
    }
  }
  return false;
}

function cleanupOrphanBotProcess() {
  try {
    if (fs.existsSync(lockFilePath)) {
      const existingPid = Number(fs.readFileSync(lockFilePath, 'utf8').trim());
      if (Number.isInteger(existingPid) && existingPid > 0 && existingPid !== process.pid) {
        if (isProcessAlive(existingPid)) {
          console.log(`[Supervisor] Encerrando processo anterior da Pyxie (PID ${existingPid})...`);
          try { process.kill(existingPid, 'SIGTERM'); } catch (_) {}
          try { process.kill(existingPid, 'SIGKILL'); } catch (_) {}
        }
      }
      try { fs.unlinkSync(lockFilePath); } catch (_) {}
    }
  } catch (_) {}
}

function addLog(message) {
  if (!message || typeof message !== 'string') return;
  if (message.includes('Emojis:Matcher') || message.includes('[Matcher]') || message.includes('Matcher:') || message.includes('readJsonFile')) {
    return;
  }
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  botLogs.push(`[${timestamp}] ${message}`);
  savePersistentLog(message);

  if (botLogs.length > 200) {
    botLogs = botLogs.slice(-200);
  }
}

function getBotStatus() {
  const running = !!botProcess && !botProcess.killed && botProcess.exitCode === null;
  const stats = getStats();
  const uptime = botStartTime ? Date.now() - botStartTime : 0;

  return {
    running,
    pid: botProcess ? botProcess.pid : null,
    logs: botLogs.slice(-50),
    welcomeChannelId: getWelcomeChannel('global') || null,
    uptime,
    stats,
  };
}

function startBot() {
  if (botProcess && !botProcess.killed && botProcess.exitCode === null) {
    return { running: true, message: 'O bot já está em execução.' };
  }

  cleanupOrphanBotProcess();

  botStartTime = Date.now();
  addLog('Iniciando bot Pyxie...');
  botProcess = spawn('node', ['--max-old-space-size=768', 'index.js'], {
    cwd: appRoot,
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });

  botProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    text.split(/\r?\n/).filter(Boolean).forEach((line) => addLog(line));
  });

  botProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    text.split(/\r?\n/).filter(Boolean).forEach((line) => addLog(line));
  });

  botProcess.on('exit', (code, signal) => {
    addLog(`Bot encerrado com code=${code} signal=${signal ?? 'none'}`);
    botStartTime = null;
    botProcess = null;
  });

  return { running: true, message: 'Bot iniciado com sucesso.' };
}

async function stopBot() {
  if (!botProcess || botProcess.killed || botProcess.exitCode !== null) {
    botProcess = null;
    botStartTime = null;
    cleanupOrphanBotProcess();
    return { running: false, message: 'O bot já está offline.' };
  }

  addLog('Encerrando bot Pyxie...');
  botProcess.kill('SIGTERM');
  try {
    botProcess.kill('SIGTERM');
  } catch (_) {}

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (botProcess && !botProcess.killed) {
        try { botProcess.kill('SIGKILL'); } catch (_) {}
      }
      botProcess = null;
      botStartTime = null;
      cleanupOrphanBotProcess();
      resolve({ running: false, message: 'Bot parado com sucesso.' });
    }, 3000);

    botProcess.once('exit', () => {
      clearTimeout(timeout);
      botProcess = null;
      botStartTime = null;
      cleanupOrphanBotProcess();
      resolve({ running: false, message: 'Bot parado com sucesso.' });
    });
  });
}

async function restartBot() {
  await stopBot();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return startBot();
}

function registerSlashCommands() {
  return new Promise((resolve, reject) => {
    execFile('node', ['src/registerSlashCommands.js', '--force'], { cwd: appRoot }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();

      if (error) {
        addLog(`Registro falhou: ${error.message}`);
        resolve({ ok: false, output: output || error.message });
        return;
      }

      addLog('Slash commands registrados com sucesso.');
      resolve({ ok: true, output: output || 'Registro concluído.' });
    });
  });
}

const { processTopggVote, verifyWebhookAuth, getVoteUrl } = require('./src/services/topgg');
const growthFunnel = require('./src/services/growthFunnel');
const tarotCardPages = require('./src/services/tarotCardPages');
const { getCardById, localizeCard } = require('./src/data/tarotCardsCatalog');
const { buildGuildInviteUrl, buildUserInstallUrl, resolvePreset } = require('./src/services/inviteLinks');
const { getBotListStatus } = require('./src/services/botListStats');
const { verifyAndClaimBonus } = require('./src/services/bonusTimer');
const {
  OWNER_SNOWFLAKE,
  isIpAllowed,
  verifyMagicToken,
  isValidAdminSession,
  isMasterSecretValid,
  createMasterAdminSession,
} = require('./src/services/adminAuth');
const { getHelpModules } = require('./src/commands/commandHelpers');

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const queryToken = req.query.token || req.headers['x-api-key'];
  const sessionCookie = getCookie(req, 'pyxie_admin_session');

  if (bearerToken && isMasterSecretValid(bearerToken)) return next();
  if (queryToken && isMasterSecretValid(queryToken)) return next();
  if (sessionCookie && isValidAdminSession(sessionCookie)) return next();
  if (bearerToken && isValidAdminSession(bearerToken)) return next();

  const secret = process.env.API_SECRET_TOKEN || process.env.PANEL_SECRET;
  if (!secret && isIpAllowed(req)) {
    return next();
  }

  const token = bearerToken || queryToken;
  if (secret && token === secret) {
    return next();
  }

  return res.status(401).json({ error: 'Acesso administrativo não autorizado.' });
}

app.disable('x-powered-by');

// Compressão HTTP Gzip/Deflate para otimização extrema de performance e Core Web Vitals
app.use(compression({
  filter: (req, res) => {
    if (req.headers.accept && req.headers.accept.includes('text/event-stream')) {
      return false; // Não comprimir fluxos contínuos SSE
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
}));

// Telemetria de recursos da VM e roteador de rotas ativadas/pausadas
app.use(createExpressTelemetryMiddleware());
app.use(createRouteGateMiddleware());

// Security & Hardening Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://region1.google-analytics.com https://pagead2.googlesyndication.com; frame-src 'self' https://www.googletagmanager.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; object-src 'none'; base-uri 'self';"
  );
  next();
});

// Lightweight In-Memory Sliding Window Rate Limiter
function createRateLimiter({ windowMs = 60 * 1000, max = 120, message = 'Muitas requisições. Tente novamente em instantes.' } = {}) {
  const store = new Map();
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.startTime > windowMs) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now - record.startTime > windowMs) {
      store.set(ip, { count: 1, startTime: now });
      return next();
    }

    record.count++;
    if (record.count > max) {
      const retryAfterSec = Math.ceil((windowMs - (now - record.startTime)) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({ error: message });
    }

    next();
  };
}

const publicApiLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120 });
const sensitiveRouteLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, message: 'Limite de tentativas atingido. Aguarde 1 minuto.' });

app.use('/api/', publicApiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API Master SaaS Dashboard
app.use('/', createAdminMasterRouter({ requireAdminAuth, sendIpcToBot }));

// Tratamento gracioso de payloads JSON malformados
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Payload JSON malformado.' });
  }
  next(err);
});

// Server-Sent Events (SSE) para sincronização instantânea em tempo real Web-Bot
const sseClients = new Set();
function broadcastLiveEvent(type, payload = {}) {
  const message = `event: ${type}\ndata: ${JSON.stringify({ ...payload, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}
global.broadcastLiveEvent = broadcastLiveEvent;

app.get('/api/events/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (_) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// Inicializa rotas web do módulo sazonal com body parsers e canal IPC ativo
seasonalManager.init(null, app, sendIpcToBot);
moduleManager.init({ app, sendIpc: sendIpcToBot });

// Entrega de arquivos estáticos com caching de alta performance para assets e imutabilidade
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.includes('dist') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    } else if (/\.(png|jpe?g|gif|svg|webp|woff2?|ttf|eot|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '7d',
  immutable: true,
}));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets'), {
  maxAge: '7d',
  immutable: true,
}));

const OFFICIAL_APP_EMOJIS = {
  wings: { name: 'pinkeing', id: '1548444149785694238', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif' },
  wings_purple: { name: '9194purplewing', id: '1551356206684307556', animated: false, url: 'https://cdn.discordapp.com/emojis/1551356206684307556.png' },
  butterfly: { name: '5056purplebutterfly', id: '1551355688612143134', animated: true, url: 'https://cdn.discordapp.com/emojis/1551355688612143134.gif' },
  fairy: { name: 'fairy', id: '1548443951596306552', animated: false, url: 'https://cdn.discordapp.com/emojis/1548443951596306552.png' },
  tree: { name: 'emojitree38', id: '1548443941144109181', animated: true, url: 'https://cdn.discordapp.com/emojis/1548443941144109181.gif' },
  portal: { name: 'mapa', id: '1551355962974273546', animated: false, url: 'https://cdn.discordapp.com/emojis/1551355962974273546.png' },
  ghost: { name: 'pinkghost', id: '1548444152549867620', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444152549867620.gif' },
  coin: { name: 'shineygoldcoinsi', id: '1548444230588956683', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444230588956683.gif' },
  coin_purple: { name: 'gifggpurplecoin5', id: '1548443977429028955', animated: true, url: 'https://cdn.discordapp.com/emojis/1548443977429028955.gif' },
  magic_bean: { name: 'peakmagicbean', id: '1548444140532928642', animated: false, url: 'https://cdn.discordapp.com/emojis/1548444140532928642.png' },
  chest: { name: 'rarecrate', id: '1548444209328033913', animated: false, url: 'https://cdn.discordapp.com/emojis/1548444209328033913.png' },
  moon: { name: 'pixdreamsmooncha', id: '1548444158245736481', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444158245736481.gif' },
  controller: { name: 'ykawaiicontrolle', id: '1548444319730499664', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444319730499664.gif' },
  heart: { name: 'purpleheartdrip2', id: '1548444199970545756', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444199970545756.gif' },
  sparkles: { name: 'purplesparkles', id: '1548444202621214840', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444202621214840.gif' },
  rocket: { name: 'slrocket', id: '1548444237442322432', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444237442322432.gif' },
  trophy: { name: 'win', id: '1548444305507487754', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444305507487754.gif' },
  book: { name: '6449spellbook', id: '1551355882447704124', animated: true, url: 'https://cdn.discordapp.com/emojis/1551355882447704124.gif' },
  backpack: { name: 'a1backpack', id: '1548443778359103579', animated: false, url: 'https://cdn.discordapp.com/emojis/1548443778359103579.png' },
  witch: { name: 'witchwumpus', id: '1548444308401684530', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444308401684530.gif' },
  skull: { name: 'kikskull', id: '1548444054071804056', animated: false, url: 'https://cdn.discordapp.com/emojis/1548444054071804056.png' },
  shield: { name: 'shieldsuccess22', id: '1548444229007835206', animated: false, url: 'https://cdn.discordapp.com/emojis/1548444229007835206.png' },
  zap: { name: 'zap65', id: '1548444326621741096', animated: false, url: 'https://cdn.discordapp.com/emojis/1548444326621741096.png' },
  coding: { name: 'coding41', id: '1548443878615547904', animated: false, url: 'https://cdn.discordapp.com/emojis/1548443878615547904.png' },
  gift: { name: 'qbgifts48', id: '1548444204202459136', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444204202459136.gif' },
  crown: { name: 'Crown', id: '1548443887025266739', animated: true, url: 'https://cdn.discordapp.com/emojis/1548443887025266739.gif' },
  melody: { name: '6735mymelodycuteeyes', id: '1551355930157781184', animated: true, url: 'https://cdn.discordapp.com/emojis/1551355930157781184.gif' },
  kuromi: { name: '9733kuromiheart', id: '1551356277194625224', animated: true, url: 'https://cdn.discordapp.com/emojis/1551356277194625224.gif' },
  arrow: { name: '2353arrowrightglow', id: '1551355397208805446', animated: true, url: 'https://cdn.discordapp.com/emojis/1551355397208805446.gif' },
};

const SLOT_METADATA = {
  // 💰 Economia & Loja
  coins: { title: 'Moedas Gerais da Pyxie', fallback: '🪙', category: 'economy', themeKey: 'coins' },
  magic_bean: { title: 'Feijões Mágicos (Bônus & Loja)', fallback: '🌱', category: 'economy', themeKey: 'dailyBonus' },
  daily_bonus: { title: 'Bônus Diário & Recompensa Web', fallback: '🎁', category: 'economy', themeKey: 'dailyBonus' },
  weekend_bonus: { title: 'Bônus de Fim de Semana (2X)', fallback: '🔥', category: 'economy', themeKey: 'weekendBonus' },
  work_career: { title: 'Trabalho & Expedientes', fallback: '💼', category: 'economy', themeKey: 'economyCareers' },

  // 🔮 Místico & Tarot
  tarot_card: { title: 'Carta de Tarot (Místico)', fallback: '🔮', category: 'tarot', themeKey: 'tarot' },
  tarotAlbum: { title: 'Álbum de Tarot & Coleção', fallback: '📖', category: 'tarot', themeKey: 'tarotAlbum' },
  grimorio: { title: 'Grimório & Alquimia', fallback: '📖', category: 'tarot', themeKey: 'grimorio' },

  // 💑 Social & Romance
  ship_heart: { title: 'Calculadora de Afinidade & Ship', fallback: '💖', category: 'social', themeKey: 'ship' },
  marriage_ring: { title: 'Casamentos & Cerimônias', fallback: '💍', category: 'social', themeKey: null },
  divorce: { title: 'Divórcio & Separação', fallback: '💔', category: 'social', themeKey: null },

  // 🎲 Jogos & Sorte
  fortune_cookie: { title: 'Biscoito da Sorte', fallback: '🥠', category: 'minigames', themeKey: null },
  dice: { title: 'Dado & Minigames de Sorte', fallback: '🎲', category: 'minigames', themeKey: 'dice' },
  jokenpo: { title: 'Jokenpô / Pedra-Papel-Tesoura', fallback: '✂️', category: 'minigames', themeKey: null },
  coinflip: { title: 'Cara ou Coroa', fallback: '🪙', category: 'minigames', themeKey: null },
  likely: { title: 'Jogo do Mais Provável', fallback: '❓', category: 'minigames', themeKey: null },

  // ⚙️ Sistema & Utilidades
  userProfile: { title: 'Badge de Perfil do Usuário', fallback: '👤', category: 'system', themeKey: 'userProfile' },
  websiteHome: { title: 'Logo & Ícone Home do Site', fallback: '🦋', category: 'system', themeKey: 'websiteHome' },
  websiteSocial: { title: 'Aba Social do Website', fallback: '💑', category: 'system', themeKey: 'websiteSocial' },
  helpCommands: { title: 'Ajuda & Comandos do Site', fallback: '📖', category: 'system', themeKey: 'helpCommands' },
  ranking: { title: 'Top Ranking & Placar', fallback: '🏆', category: 'system', themeKey: null },
  agenda: { title: 'Agenda de Automações', fallback: '📅', category: 'system', themeKey: null },
  status_success: { title: 'Indicador de Sucesso (OK)', fallback: '✅', category: 'system', themeKey: null },
  status_fail: { title: 'Indicador de Erro / Falha', fallback: '❌', category: 'system', themeKey: null }
};

// 0. Redirecionamentos amigáveis oficiais da Pyxie
// /invite?ref=topgg&perms=basic|full|admin → convite com permissões mínimas e origem contabilizada no funil
app.get('/invite', (req, res) => {
  const preset = resolvePreset(req.query.perms);
  try { growthFunnel.recordInviteClick(req.query.ref, 'guild', { visitorKey: req.ip }); } catch (_) {}
  res.redirect(buildGuildInviteUrl(preset));
});

// /install?ref=site → instala a Pyxie na conta do usuário (User App)
app.get('/install', (req, res) => {
  try { growthFunnel.recordInviteClick(req.query.ref, 'user', { visitorKey: req.ip }); } catch (_) {}
  res.redirect(buildUserInstallUrl());
});

app.get('/discord', (req, res) => {
  res.redirect('https://discord.gg/b3uZK3ssfX');
});

app.get('/vote', (req, res) => {
  res.redirect(getVoteUrl());
});

app.get('/', serveLocalizedPage('index', publicDir));

app.get('/tarot', serveLocalizedPage('tarot', publicDir));

// Páginas de significado das 78 cartas (HTML completo no servidor; idioma só pela URL: ?lang=en)
app.get('/tarot/cartas', (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'pt';
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(tarotCardPages.renderHubPage(lang));
});

app.get('/tarot/carta/:slug', (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'pt';
  const resolved = tarotCardPages.resolveCardRequest(req.params.slug);
  if (resolved.redirect) return res.redirect(301, resolved.redirect);
  if (!resolved.card) return res.status(404).sendFile(path.join(publicDir, '404.html'));
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(tarotCardPages.renderCardPage(resolved.card, lang));
});

app.get('/wiki', serveLocalizedPage('wiki', publicDir));

app.get(['/parcerias', '/partnerships'], serveLocalizedPage('partnerships', publicDir));

app.get(['/museu', '/museum'], serveLocalizedPage('museum', publicDir));

app.get(['/termos', '/terms'], serveLocalizedPage('terms', publicDir));

app.get(['/privacidade', '/privacy'], serveLocalizedPage('privacy', publicDir));

app.get('/cringelandia', serveLocalizedPage('cringelandia', publicDir));

// Mercado entre jogadores: página pública de preços e a API que ela lê (data/market.json)
app.get(['/mercado', '/market'], serveLocalizedPage('market', publicDir));
app.get('/api/market/prices', (req, res) => {
  try {
    const market = require('./src/services/market');
    const { getItem, itemName } = require('./src/modules/home/homeCatalog');
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const stats = market.getMarketStats();
    const items = market.topTraded({ days: 30, limit: 24 }).map((row) => ({
      key: row.key,
      name: row.key.startsWith('mat:') ? market.resourceLabel(row.key.slice(4), lang) : itemName(getItem(row.key), lang),
      last: row.last,
      avg: row.avg,
      sales: row.sales,
      history: row.history,
    }));
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ stats: { activeListings: stats.activeListings, sales7d: stats.sales7d, coinsRemovedByFee: stats.taxCollected }, items });
  } catch (err) {
    res.status(500).json({ error: 'market_unavailable' });
  }
});

// Passe da Pyxie: página /passe, pagamento do Premium (Mercado Pago / PayPal) e avisos de pagamento
app.get(['/passe', '/pass'], serveLocalizedPage('pass', publicDir));
app.get('/api/pass/info', publicApiLimiter, (req, res) => {
  try {
    const battlePass = require('./src/services/battlePass');
    const payments = require('./src/services/passPayments');
    const { getItem, itemName } = require('./src/modules/home/homeCatalog');
    const economy = require('./src/services/economy');
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const month = battlePass.monthKey();
    const track = battlePass.getTrack(month);
    const finale = track[track.length - 1];
    const theme = battlePass.themeFor(month);
    const session = req.query.token ? payments.verifyPassToken(req.query.token) : null;
    let user = null;
    if (session) {
      const status = battlePass.getStatus(session.userId);
      user = { level: status.level, xp: status.xp, premium: status.premium, sameMonth: session.month === month };
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      month,
      monthLabel: `${theme.months[lang]} ${month.slice(0, 4)}`,
      endsAt: battlePass.monthBounds(month).end,
      maxLevel: battlePass.MAX_LEVEL,
      xpPerLevel: battlePass.XP_PER_LEVEL,
      xpSources: battlePass.XP_SOURCES,
      price: battlePass.PRICE,
      providers: payments.providers(),
      finale: {
        pet: itemName(getItem(finale.premium.itemId), lang),
        title: economy.getTitleDefinition(finale.premium.title, lang)?.display || '',
        freeItem: itemName(getItem(finale.free.itemId), lang),
      },
      highlights: track
        .filter((row) => row.premium.type === 'item' || row.free.type === 'item')
        .map((row) => ({ level: row.level, free: row.free.itemId ? itemName(getItem(row.free.itemId), lang) : null, premium: row.premium.itemId ? itemName(getItem(row.premium.itemId), lang) : null })),
      user,
      tokenValid: Boolean(session),
    });
  } catch (err) {
    res.status(500).json({ error: 'pass_unavailable' });
  }
});
app.post('/api/pass/checkout', sensitiveRouteLimiter, async (req, res) => {
  try {
    const payments = require('./src/services/passPayments');
    const { provider, token } = req.body || {};
    const result = await payments.createCheckout(String(provider || ''), String(token || ''));
    if (!result.ok) return res.status(result.reason === 'unavailable' ? 503 : 400).json({ error: result.reason });
    return res.json({ url: result.url });
  } catch (err) {
    console.error('[pass] Falha ao abrir pagamento:', err.message);
    return res.status(502).json({ error: 'provider' });
  }
});
/**
 * Avisa a pessoa por DM quando o Premium é liberado. O site roda no supervisor (sem gateway), então
 * a DM vai pela REST do Discord; sem DM aberta, ela vê o Premium no /py-pass.
 */
async function notifyPassPremium(result) {
  if (!result?.ok || result.duplicate || !result.userId || !process.env.DISCORD_TOKEN) return;
  try {
    const { REST, Routes } = require('discord.js');
    const { t } = require('./src/utils/i18n');
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const dm = await rest.post(Routes.userChannels(), { body: { recipient_id: String(result.userId) } });
    const content = `${t('pass.premiumDm', 'pt')}\n\n${t('pass.premiumDm', 'en')}`;
    await rest.post(Routes.channelMessages(dm.id), { body: { content, allowed_mentions: { parse: [] } } });
  } catch (_) {}
}
app.post('/api/pass/webhook/mercadopago', async (req, res) => {
  try {
    const payments = require('./src/services/passPayments');
    const result = await payments.handleMercadoPagoWebhook({ body: req.body || {}, query: req.query || {}, headers: req.headers || {} });
    if (!result.ok && result.reason === 'signature') return res.status(401).json({ error: 'signature' });
    // Falha do lado do Mercado Pago: 502 faz o aviso ser reenviado
    if (!result.ok && result.reason === 'provider') return res.status(502).json({ error: 'provider' });
    res.status(200).json({ received: true });
    return notifyPassPremium(result);
  } catch (err) {
    console.error('[pass] Falha no aviso do Mercado Pago:', err.message);
    return res.status(500).json({ error: 'webhook' });
  }
});
app.get('/api/pass/paypal/return', sensitiveRouteLimiter, async (req, res) => {
  const lang = req.query.lang === 'en' ? '&lang=en' : '';
  try {
    const payments = require('./src/services/passPayments');
    const result = await payments.capturePayPalOrder(String(req.query.token || ''));
    notifyPassPremium(result);
    return res.redirect(`/passe?status=${result.ok ? 'ok' : 'fail'}${lang}`);
  } catch (err) {
    console.error('[pass] Falha ao capturar PayPal:', err.message);
    return res.redirect(`/passe?status=fail${lang}`);
  }
});

app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(publicDir, 'ads.txt'));
});
 
// Perfil público & Vitrine do Álbum de Tarot na Web
app.get('/u/:userId', (req, res) => {
  const userId = String(req.params.userId || '').trim();
  const uHtmlPath = path.join(publicDir, 'u.html');
  if (!fs.existsSync(uHtmlPath)) {
    return res.status(404).sendFile(path.join(publicDir, '404.html'));
  }

  let html = fs.readFileSync(uHtmlPath, 'utf8');
  try {
    const account = getUserAccount(userId);
    const album = tarotAlbumService.getUserAlbum(userId);
    const discoveredCount = album?.discoveredCards?.length || 0;
    const profession = account?.profession
      ? (account.profession.charAt(0).toUpperCase() + account.profession.slice(1).replace(/_/g, ' '))
      : 'Aventureiro Místico';
    const name = account?.username || `Membro (${userId.slice(-4)})`;
    const title = `Perfil de ${name} • Universo Pyxie`;
    const desc = `Colecionou ${discoveredCount}/78 Arcanos de Tarot e atua como ${profession} no Discord!`;
    const canonical = `https://pyxie.com.br/u/${userId}`;

    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
      .replace(/(<link\s+rel=["']canonical["']\s+href=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${canonical}$2`)
      .replace(/(<meta\s+property=["']og:title["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${title}$2`)
      .replace(/(<meta\s+property=["']og:description["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${desc}$2`)
      .replace(/(<meta\s+property=["']og:url["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${canonical}$2`)
      .replace(/(<meta\s+name=["']twitter:title["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${title}$2`)
      .replace(/(<meta\s+name=["']twitter:description["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, `$1${desc}$2`);
  } catch (err) {
    console.error('[Profile OpenGraph] Erro ao injetar metadados:', err.message);
  }

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(html);
});

// API de Perfil Público e Álbum de Tarot
app.get('/api/profile/:userId', (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim();
    if (!/^\d{15,25}$/.test(userId)) {
      return res.status(400).json({ success: false, error: 'ID de usuário inválido.' });
    }
    const account = getUserAccount(userId);
    const album = tarotAlbumService.getUserAlbum(userId);
    const marriage = marriageManager.getMarriage(userId);

    const cards = album.discoveredCards || [];
    const achievements = TAROT_ACHIEVEMENTS.map((ach) => {
      const isClaimed = (album.claimedAchievements || []).includes(ach.id);
      const prog = typeof ach.check === 'function' ? ach.check(cards) : { current: 0, target: 1 };
      return {
        id: ach.id,
        namePt: ach.namePt,
        nameEn: ach.nameEn,
        descPt: ach.descPt,
        descEn: ach.descEn,
        rewardCoins: ach.rewardCoins,
        isClaimed,
        current: prog.current,
        target: prog.target,
        completed: prog.current >= prog.target,
      };
    });

    return res.json({
      success: true,
      userId,
      account: {
        balance: account.balance || 0,
        magicBeans: account.magicBeans || 0,
        profession: account.profession || null,
        activeTitle: account.activeTitle || null,
        dailyStreak: account.dailyStreak || 0,
      },
      marriage: marriage ? {
        isMarried: true,
        spouses: marriage.spouses,
        love: marriage.love ?? 100,
        treeLevel: marriage.treeLevel || 0,
        vaultCoins: marriage.vault?.coins || 0,
      } : { isMarried: false },
      tarot: {
        discoveredCards: album.discoveredCards || [],
        totalCards: 78,
        discoveredCount: (album.discoveredCards || []).length,
        firstDiscoveryDates: album.firstDiscoveryDates || {},
      },
      achievements,
    });
  } catch (err) {
    console.error('[API Profile] Erro ao carregar perfil:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Feeds RSS / Atom / JSON Feed para captação externa e automação (Pinterest, Zapier, IFTTT, Google Discover)
app.get(['/rss.xml', '/feed.xml'], (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'pt';
  res.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateRssXml(lang));
});

app.get('/atom.xml', (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'pt';
  res.setHeader('Content-Type', 'application/atom+xml; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateAtomXml(lang));
});

app.get('/feed.json', (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'pt';
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(generateJsonFeed(lang));
});

// Feed RSS dedicado para o Pinterest com as artes do museu e watermark persistente
app.get(['/rss-pinterest.xml', '/pinterest.xml', '/feed-pinterest.xml', '/museu/rss.xml'], (req, res) => {
  const lang = (req.query.lang === 'en') ? 'en' : 'pt';
  res.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(generatePinterestRssXml(lang));
});

// APIs do Oráculo de Tarot & Imagens Renderizadas para Pinterest e Redes Sociais
// Cada carta traz o slug da página de significado e a versão em inglês (en)
app.get('/api/tarot/cards', (req, res) => {
  const cards = tarotCardsList.map((card) => {
    const catalogCard = getCardById(card.id);
    const english = localizeCard(card, 'en');
    return {
      ...card,
      slug: catalogCard?.slug || null,
      en: { name: english.name, keywords: english.keywords, upright: english.upright, reversed: english.reversed },
    };
  });
  res.json({ success: true, count: cards.length, cards });
});

app.get('/api/tarot/card-image', (req, res) => {
  const cardId = req.query.id || 'major_00';
  const orientation = (req.query.pos === 'reversed' || req.query.orientation === 'REVERSED') ? 'REVERSED' : 'UPRIGHT';
  const lang = (req.query.lang === 'en') ? 'en' : 'pt';
  const card = tarotCardsList.find(c => c.id === cardId) || tarotCardsList[0];
  try {
    const buffer = renderTarotCard(card, orientation, lang);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.send(buffer);
  } catch (err) {
    console.error('[API Tarot Image] Erro ao renderizar imagem:', err.message);
    res.status(500).send('Erro ao gerar imagem de tarot');
  }
});

// Widget embutível para blogs, sites e parceiros (gera backlinks e autoridade de domínio)
app.get('/widget/card', (req, res) => {
  res.sendFile(path.join(publicDir, 'widget.html'));
});

// 1. Healthcheck e status público
app.get('/api/status', (req, res) => {
  res.json(getBotStatus());
});

app.get('/api/modules/status', (req, res) => {
  try {
    const all = moduleManager.getAllModules();
    const modulesMap = {};
    for (const m of all) {
      modulesMap[m.id] = { enabled: m.enabled, active: m.active };
    }
    res.json({ success: true, modules: modulesMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1.1 Emojis oficiais da aplicação (Discord Dev Portal com resolução dinâmica em tempo real)
app.get('/api/emojis', (req, res) => {
  const { getCustomEmojiConfig } = require('./src/utils/appEmojis');
  const customConfig = getCustomEmojiConfig();
  const currencies = embedRegistry.getCurrenciesConfig();

  const dynamicEmojis = { ...OFFICIAL_APP_EMOJIS };
  if (customConfig.magic_bean && currencies.magicBeans) {
    dynamicEmojis.magic_bean = {
      name: currencies.magicBeans.currentName || 'peakmagicbean',
      id: currencies.magicBeans.currentEmojiId,
      animated: currencies.magicBeans.isAnimated,
      url: currencies.magicBeans.currentUrl,
    };
  }
  if (customConfig.coins && currencies.coins) {
    dynamicEmojis.coin = {
      name: currencies.coins.currentName || 'shineygoldcoinsi',
      id: currencies.coins.currentEmojiId,
      animated: currencies.coins.isAnimated,
      url: currencies.coins.currentUrl,
    };
  }

  res.json({
    success: true,
    emojis: dynamicEmojis,
    currencies,
    customConfig,
  });
});

// 2. Catálogo Dinâmico de Comandos da Pyxie (Sincronizado diretamente com help.js)
app.get('/api/commands', (req, res) => {
  const lang = req.query.lang === 'en' ? 'en' : 'pt';
  const sessionCookie = getCookie(req, 'pyxie_admin_session');
  const isOwner = (sessionCookie && isValidAdminSession(sessionCookie)) ||
    (req.query.token && isMasterSecretValid(req.query.token));
  const modules = getHelpModules(null, { lang, isOwner: !!isOwner });
  res.json({
    success: true,
    lang,
    modules,
  });
});

// 2b. Vitrine Nativa de Achadinhos da Pyxie (Monetização contextual, anti-adblock e rotação dinâmica)
app.get(['/api/showcase', '/api/shopee/showcase'], (req, res) => {
  try {
    const items = shopeeManager.getActiveItems({ shuffle: true, limit: 12 });
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, items });
  } catch (err) {
    console.error('Erro ao ler vitrine Shopee:', err.message);
    return res.status(500).json({ success: false, error: 'Falha ao carregar vitrine' });
  }
});

// 2c. Rotação Horária de Lojas Parceiras e Links de Promoção (Shopee Oficial)
app.get(['/promo', '/api/promo', '/shopee/loja'], (req, res) => {
  try {
    const promo = shopeeManager.getHourlyStorePromo();
    const targetUrl = promo && promo.link ? promo.link : 'https://s.shopee.com.br/BU6Bod6Sw';
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.redirect(302, targetUrl);
  } catch (err) {
    console.error('Erro no redirect de promo horária:', err.message);
    return res.redirect(302, 'https://s.shopee.com.br/BU6Bod6Sw');
  }
});

// 2c. Endpoint Público Unificado de Verdade Absoluta (Seção 3)
app.get('/api/public/system-truth', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  const truthFile = path.join(__dirname, 'data', 'publicTruthSnapshot.json');
  const fallbackFile = path.join(__dirname, 'data', 'publicTruthFallback.json');

  try {
    if (fs.existsSync(truthFile)) {
      const data = JSON.parse(fs.readFileSync(truthFile, 'utf8'));
      return res.json({ success: true, ...data });
    }

    const truthEngine = require('./src/services/truthReconciliationEngine');
    await truthEngine.runVerificationWave({ force: true, trigger: 'public_api_init' });

    if (fs.existsSync(truthFile)) {
      const data = JSON.parse(fs.readFileSync(truthFile, 'utf8'));
      return res.json({ success: true, ...data });
    }

    if (fs.existsSync(fallbackFile)) {
      const data = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
      return res.json({ success: true, ...data });
    }

    return res.status(503).json({ success: false, error: 'Snapshot de verdade pública em inicialização.' });
  } catch (err) {
    if (fs.existsSync(fallbackFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
        return res.json({ success: true, ...data });
      } catch (_) {}
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/shopee/hourly-promo', (req, res) => {
  try {
    const promo = shopeeManager.getHourlyStorePromo();
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, promo });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2d. Portal da Cringelândia & Acolhimento Neurodivergente
app.get('/api/cringelandia/impact', (req, res) => {
  try {
    const count = cringelandiaService.getImpactCount();
    res.setHeader('Cache-Control', 'public, max-age=10');
    return res.json({ success: true, count });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cringelandia/track-help-click', (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');
    const result = cringelandiaService.trackHelpClick(ip);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cringelandia/ciptea-states', (req, res) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.json({ success: true, states: cringelandiaService.CIPTEA_STATES });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

let liveGuildCache = { data: null, fetchedAt: 0 };
app.get('/api/cringelandia/live-guild', async (req, res) => {
  const now = Date.now();
  if (liveGuildCache.data && (now - liveGuildCache.fetchedAt < 60000)) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, guild: liveGuildCache.data });
  }
  try {
    const response = await fetch('https://discord.com/api/guilds/1453890868980482090/widget.json', {
      headers: { 'User-Agent': 'Pyxie-Bot/1.0 (+https://pyxie.com.br)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Discord widget HTTP ${response.status}`);
    }
    const data = await response.json();
    liveGuildCache = { data, fetchedAt: now };
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ success: true, guild: data });
  } catch (err) {
    if (liveGuildCache.data) {
      return res.json({ success: true, guild: liveGuildCache.data, stale: true });
    }
    return res.json({
      success: true,
      guild: {
        id: '1453890868980482090',
        name: 'Cringelândia 🌸 Comunidade & Acolhimento',
        instant_invite: 'https://discord.gg/cringelandia',
        presence_count: 50,
        members: []
      },
      fallback: true
    });
  }
});

app.get('/api/cringelandia/art-samples', (req, res) => {
  try {
    let arts = [];
    const museumPath = path.join(__dirname, 'data', 'museumData.json');
    if (fs.existsSync(museumPath)) {
      const parsed = JSON.parse(fs.readFileSync(museumPath, 'utf8'));
      if (parsed && Array.isArray(parsed.arts)) {
        arts = parsed.arts;
      }
    }
    let formatted = arts.slice(0, 16).map((art) => ({
      id: art.id,
      author: art.cachedAuthor || art.authorUsername || 'Membro da Cringelândia',
      url: `/api/museum/art-image/${encodeURIComponent(art.id)}.jpg`,
      description: art.description || 'Arte da Comunidade Cringelândia'
    }));

    if (formatted.length === 0) {
      formatted = [
        { id: 'sample_1', author: 'Comunidade Cringelândia', url: '/assets/pyxie/pyxie_mascot.png', description: 'Mascote Pyxie' },
        { id: 'sample_2', author: 'Cantinho Criativo', url: '/assets/pyxie/pyxie_pixelart_face.png', description: 'Pixel Art Pyxie' }
      ];
    }
    res.setHeader('Cache-Control', 'public, max-age=120');
    return res.json({ success: true, arts: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Painel Administrativo do Proprietário (Restrito ao Snowflake 214153735281180673 e Chave Mestra)
app.get('/admin', (req, res) => {
  // Ignora crawlers de redes sociais (Discordbot, etc.) para não queimar tokens ou quebrar visualização
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (/discordbot|twitterbot|facebookexternalhit|whatsapp|telegrambot/.test(ua)) {
    return res.send(`<!DOCTYPE html><html><head><title>Pyxie Console • Painel do Dono</title><meta property="og:title" content="Pyxie Console • Área do Proprietário"/><meta property="og:description" content="Painel confidencial exclusivo do criador da Pyxie."/><link rel="icon" href="https://cdn.discordapp.com/emojis/1548444149785694238.gif"/></head><body style="background:#07040e;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h3>Pyxie Console</h3></body></html>`);
  }

  const tokenParam = req.query.token;
  if (tokenParam) {
    const verifyResult = verifyMagicToken(tokenParam);
    if (verifyResult.valid) {
      res.setHeader('Set-Cookie', `pyxie_admin_session=${verifyResult.sessionToken}; HttpOnly; SameSite=Lax; Max-Age=43200; Path=/`);
      return res.redirect('/admin');
    }
  }

  const sessionCookie = getCookie(req, 'pyxie_admin_session');
  const hasValidSession = (sessionCookie && isValidAdminSession(sessionCookie)) || isIpAllowed(req);

  if (!hasValidSession) {
    return res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
  }

  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Autenticação direta por Senha Mestra (PANEL_SECRET)
app.post('/api/admin/login', sensitiveRouteLimiter, (req, res) => {
  const { password, secret } = req.body || {};
  const token = password || secret;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, error: 'Chave mestra é obrigatória.' });
  }

  if (isMasterSecretValid(token.trim())) {
    const sessionToken = createMasterAdminSession();
    res.setHeader('Set-Cookie', `pyxie_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=43200; Path=/`);
    return res.json({ success: true, sessionToken });
  }

  return res.status(401).json({ success: false, error: 'Chave mestra incorreta.' });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'pyxie_admin_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/');
  return res.json({ success: true });
});

// APIs de Controle e Gestão da Shopee para o Dono
app.get('/api/admin/shopee', requireAdminAuth, (req, res) => {
  try {
    const items = shopeeManager.getAllItems();
    const stats = shopeeManager.getSummaryStats();
    return res.json({ success: true, items, stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/toggle', requireAdminAuth, (req, res) => {
  try {
    const { id, active } = req.body || {};
    const result = shopeeManager.toggleItemActive(id, active);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/check', requireAdminAuth, async (req, res) => {
  try {
    const { id, checkAll } = req.body || {};
    if (checkAll) {
      const results = await shopeeManager.checkAllItems();
      return res.json({ success: true, checked: results.length, results, stats: shopeeManager.getSummaryStats() });
    }
    const result = await shopeeManager.checkItemStatus(id);
    return res.json({ success: true, result, stats: shopeeManager.getSummaryStats() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/add', requireAdminAuth, async (req, res) => {
  try {
    const result = await shopeeManager.addItem(req.body || {});
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/sync-image', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ success: false, error: 'ID do anúncio obrigatório' });
    const result = await shopeeManager.syncItemImage(id);
    return res.json({ ...result, stats: shopeeManager.getSummaryStats() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/sync-all-images', requireAdminAuth, async (req, res) => {
  try {
    const { force } = req.body || {};
    const result = await shopeeManager.syncAllItemImages({ force: !!force });
    return res.json({ ...result, stats: shopeeManager.getSummaryStats(), items: shopeeManager.getAllItems() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/shopee/preview-link', requireAdminAuth, async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'URL obrigatória' });
    const meta = await shopeeManager.extractShopeeMetadata(url);
    if (!meta) {
      return res.json({ success: false, message: 'Não foi possível extrair prévia automática do link' });
    }
    return res.json({ success: true, ...meta });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/shopee/:id', requireAdminAuth, (req, res) => {
  try {
    const result = shopeeManager.deleteItem(req.params.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// APIs do Seeder Autônomo de Carreiras da Groq AI
app.get('/api/admin/work-seeder/status', requireAdminAuth, (req, res) => {
  try {
    return res.json({ success: true, ...workSeederService.getStatus() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/work-seeder/trigger', requireAdminAuth, async (req, res) => {
  try {
    const count = parseInt(req.body?.count, 10) || 1;
    workSeederService.generateBatch({ countPerProfession: count }).catch((e) => {
      console.error('[Groq Seeder] Erro no lote disparado manualmente:', e.message);
    });
    return res.json({ success: true, message: 'Lote de geração iniciado em background!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// APIs do Seeder de Perguntas de Quiz
app.get('/api/admin/quiz-seeder/status', requireAdminAuth, (req, res) => {
  try {
    return res.json({ success: true, ...quizSeederService.getStatus() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/quiz-seeder/trigger', requireAdminAuth, async (req, res) => {
  try {
    const count = parseInt(req.body?.count, 10) || 4;
    quizSeederService.generateBatch({ count }).catch((e) => {
      console.error('[Quiz Seeder] Erro no lote disparado manualmente:', e.message);
    });
    return res.json({ success: true, message: 'Lote de perguntas do quiz iniciado em background!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Rota Visual de Mapeamento de Emojis (/admin/emojis)
app.get('/admin/emojis', async (req, res) => {
  const token = req.query.token;
  const secret = process.env.API_SECRET_TOKEN || process.env.PANEL_SECRET;
  const sessionCookie = getCookie(req, 'pyxie_admin_session');

  const isAuth =
    isIpAllowed(req) ||
    (sessionCookie && isValidAdminSession(sessionCookie)) ||
    (token && ((secret && token === secret) || isMasterSecretValid(token) || isValidAdminSession(token) || verifyMagicToken(token).valid));

  if (!isAuth) {
    return res.status(401).send('401 Unauthorized');
  }

  const emojisPath = path.join(__dirname, 'src/data/emojis.json');
  let currentConfig = {};
  try {
    if (fs.existsSync(emojisPath)) {
      currentConfig = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));
    }
  } catch (_) {}

  const themePath = path.join(__dirname, 'src/data/themeEmojis.json');
  let currentThemeConfig = {};
  try {
    if (fs.existsSync(themePath)) {
      const parsed = JSON.parse(fs.readFileSync(themePath, 'utf8'));
      currentThemeConfig = parsed.themes || {};
    }
  } catch (_) {}

  let appEmojis = [];
  try {
    const catalogPath = path.join(__dirname, 'src/data/discordAppEmojis.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const parsed = JSON.parse(raw);
      appEmojis = Array.isArray(parsed) ? parsed : (parsed.items || []);
    }
  } catch (_) {}

  const simplifiedAppEmojis = appEmojis.map(e => ({
    id: String(e.id),
    name: e.name || 'emoji',
    animated: Boolean(e.animated),
    url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`
  }));

  const isSaved = req.query.saved === 'true';

  let rowsHtml = '';
  for (const [slot, meta] of Object.entries(SLOT_METADATA)) {
    const fallback = meta.fallback || '✨';
    let selectedId = currentConfig[slot] || '';
    if (!selectedId && meta.themeKey && currentThemeConfig[meta.themeKey]) {
      selectedId = currentThemeConfig[meta.themeKey].primaryId || '';
    }

    const selectedEmojiObj = simplifiedAppEmojis.find(e => String(e.id) === String(selectedId));
    let previewHtml = `<span style="font-size:26px;">${fallback}</span>`;
    let statusBadge = '<span class="badge badge-fallback">Unicode</span>';
    let currentLabel = `Padrão (Unicode: ${fallback})`;

    if (selectedId && selectedEmojiObj) {
      previewHtml = `<img src="${selectedEmojiObj.url}" alt="${slot}" style="width:34px;height:34px;vertical-align:middle;object-fit:contain;" onerror="this.onerror=null;this.src='https://cdn.discordapp.com/emojis/${selectedId}.png';" />`;
      statusBadge = selectedEmojiObj.animated
        ? '<span class="badge badge-animated">GIF Animado</span>'
        : '<span class="badge badge-static">PNG Estático</span>';
      currentLabel = `${selectedEmojiObj.animated ? '✨ ' : ''}${selectedEmojiObj.name} (${selectedId})`;
    } else if (selectedId) {
      const fallbackUrl = `https://cdn.discordapp.com/emojis/${selectedId}.png`;
      previewHtml = `<img src="${fallbackUrl}" alt="${slot}" style="width:34px;height:34px;vertical-align:middle;object-fit:contain;" />`;
      statusBadge = '<span class="badge badge-static">Customizado</span>';
      currentLabel = `ID: ${selectedId}`;
    }

    rowsHtml += `
      <div class="slot-card" data-slot="${slot}" data-category="${meta.category}" style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:18px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;transition:all 0.2s ease;">
        <div style="display:flex;align-items:center;gap:16px;min-width:260px;">
          <div id="box-${slot}" class="preview-box" onclick="openPicker('${slot}')" title="Clique para trocar emoji visualmente" style="width:52px;height:52px;background:rgba(0,0,0,0.5);border:1px solid rgba(236,72,153,0.4);border-radius:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s, border-color 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
            ${previewHtml}
          </div>
          <div>
            <div style="font-weight:700;color:#ec4899;font-size:16px;font-family:'Fredoka',sans-serif;display:flex;align-items:center;gap:8px;">
              <span>${meta.title}</span>
              <span id="badge-${slot}">${statusBadge}</span>
            </div>
            <div style="font-size:12px;color:#c084fc;font-family:monospace;margin-top:2px;">Slot: <strong>${slot}</strong></div>
            <div id="label-${slot}" style="font-size:12px;color:#94a3b8;margin-top:3px;">${currentLabel}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <input type="hidden" name="${slot}" id="input-${slot}" value="${selectedId}" />
          <button type="button" class="btn-picker-trigger" onclick="openPicker('${slot}')" style="background:linear-gradient(135deg, rgba(139,92,246,0.35), rgba(236,72,153,0.35));border:1px solid rgba(236,72,153,0.5);color:#fff;border-radius:10px;padding:10px 16px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;">
            🎨 Escolher Emoji
          </button>
          <button type="button" onclick="clearSlot('${slot}')" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:10px;padding:10px 14px;font-weight:600;font-size:13px;cursor:pointer;transition:all 0.2s;">
            ❌ Resetar
          </button>
        </div>
      </div>
    `;
  }

  const queryTokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
  const alertHtml = isSaved ? `
    <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#10b981;padding:14px 18px;border-radius:12px;margin-bottom:20px;font-weight:600;display:flex;align-items:center;gap:10px;box-shadow:0 4px 15px rgba(16,185,129,0.2);">
      ✨ Configuração de emojis salva e sincronizada com sucesso em toda a aplicação!
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel Visual de Emojis • Pyxie Admin</title>
  <link rel="icon" href="https://cdn.discordapp.com/emojis/1548444149785694238.gif" />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { background: #090514; color: #ffffff; font-family: 'Quicksand', sans-serif; margin: 0; padding: 24px; padding-bottom: 100px; min-height: 100vh; }
    .container { max-width: 960px; margin: 0 auto; background: rgba(19, 11, 36, 0.95); border: 1px solid rgba(139,92,246,0.3); border-radius: 24px; padding: 32px; box-shadow: 0 15px 50px rgba(0,0,0,0.6); }
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    h1 { margin: 0; color: #ec4899; font-family: 'Fredoka', sans-serif; font-size: 26px; display: flex; align-items: center; gap: 10px; }
    p.subtitle { color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
    
    .badge { font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase; font-family: 'Quicksand', sans-serif; }
    .badge-animated { background: rgba(236,72,153,0.2); border: 1px solid rgba(236,72,153,0.5); color: #f472b6; }
    .badge-static { background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.5); color: #38bdf8; }
    .badge-fallback { background: rgba(148,163,184,0.15); border: 1px solid rgba(148,163,184,0.3); color: #94a3b8; }

    /* Controls Row */
    .controls-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
    .search-input { flex: 1; min-width: 220px; background: rgba(0,0,0,0.4); border: 1px solid rgba(139,92,246,0.35); border-radius: 12px; padding: 12px 16px; color: #fff; outline: none; font-family: 'Quicksand', sans-serif; font-size: 14px; }
    .search-input:focus { border-color: #ec4899; box-shadow: 0 0 15px rgba(236,72,153,0.3); }

    .cat-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 12px; padding: 10px 16px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
    .cat-btn.active, .cat-btn:hover { background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3)); border-color: #ec4899; color: #fff; }

    .btn-picker-trigger:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(236,72,153,0.4); }
    .preview-box:hover { transform: scale(1.05); border-color: #ec4899 !important; }

    /* Sticky Bottom Bar */
    .sticky-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(12, 7, 27, 0.96);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(236,72,153,0.4);
      padding: 16px 32px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
      flex-wrap: wrap;
    }
    .sticky-info { color: #cbd5e1; font-size: 14px; font-weight: 600; }
    .btn-save { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: #fff; border: none; padding: 14px 28px; font-size: 16px; font-weight: 700; border-radius: 12px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 20px rgba(236,72,153,0.4); font-family: 'Fredoka', sans-serif; }
    .btn-save:hover { opacity: 0.95; transform: translateY(-2px); box-shadow: 0 6px 25px rgba(236,72,153,0.6); }

    .btn-back { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); }
    .btn-back:hover { color: #fff; background: rgba(255,255,255,0.1); }

    /* Pagination */
    .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(139,92,246,0.2); border-radius: 14px; padding: 12px 18px; }
    .page-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 10px; padding: 8px 16px; font-weight: 700; cursor: pointer; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Picker Filter Buttons */
    .picker-filter-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .picker-filter-btn.active { background: #ec4899; color: #fff; border-color: #ec4899; }

    /* Emoji Grid Card */
    .emoji-grid-card { background: rgba(0,0,0,0.5); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s; position: relative; }
    .emoji-grid-card:hover { transform: scale(1.1); border-color: #ec4899; background: rgba(236,72,153,0.15); box-shadow: 0 4px 15px rgba(236,72,153,0.3); }
    .emoji-grid-card img { width: 36px; height: 36px; object-fit: contain; }
    .emoji-grid-card .emoji-name-text { font-size: 10px; color: #cbd5e1; font-family: monospace; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .emoji-grid-card .anim-badge { position: absolute; top: 3px; right: 3px; font-size: 8px; background: rgba(236,72,153,0.8); color: #fff; padding: 1px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <h1>🔮 Mapeamento Visual de Emojis</h1>
      <a href="/admin" class="btn-back">⬅️ Console do Dono</a>
    </div>
    <p class="subtitle">Selecione e pré-visualize visualmente os emojis registrados na sua aplicação Discord. Clique em qualquer caixa ou botão para abrir a galeria visual em grade.</p>
    
    ${alertHtml}

    <!-- Controls Row -->
    <div class="controls-row">
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Filtrar slots por nome (ex: coin, tarot, relic, ship)..." />
      <button class="cat-btn active" data-cat="all">Todos os Slots</button>
      <button class="cat-btn" data-cat="economy">💰 Economia & Loja</button>
      <button class="cat-btn" data-cat="tarot">🔮 Tarot & Místico</button>
      <button class="cat-btn" data-cat="social">💑 Social & Romance</button>
      <button class="cat-btn" data-cat="minigames">🎲 Jogos & Sorte</button>
      <button class="cat-btn" data-cat="system">⚙️ Sistema & Status</button>
    </div>

    <form method="POST" action="/admin/emojis${queryTokenParam}" id="emojisForm">
      <div id="slotsContainer">
        ${rowsHtml}
      </div>

      <!-- Pagination -->
      <div class="pagination-bar">
        <button type="button" id="prevPageBtn" class="page-btn">◀ Anterior</button>
        <div id="pageIndicator" style="font-weight: 700; color: #c084fc;">Página 1 de 1</div>
        <button type="button" id="nextPageBtn" class="page-btn">Próximo ▶</button>
      </div>

      <!-- Sticky Bottom Save Bar -->
      <div class="sticky-bar">
        <div class="sticky-info" id="stickySummary">
          📊 Carregando estatísticas...
        </div>
        <button type="submit" class="btn-save">💾 Salvar Configurações de Emojis</button>
      </div>
    </form>
  </div>

  <!-- WhatsApp / Discord Style Visual Emoji Picker Modal -->
  <div id="emojiPickerModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.82); backdrop-filter:blur(10px); z-index:2000; align-items:center; justify-content:center; padding:16px;">
    <div style="max-width:720px; width:100%; max-height:85vh; background:#120b24; border:1px solid rgba(236,72,153,0.5); border-radius:20px; display:flex; flex-direction:column; box-shadow:0 25px 70px rgba(0,0,0,0.9); overflow:hidden;">
      <!-- Modal Header -->
      <div style="padding:18px 24px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(139,92,246,0.2); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:18px; color:#ec4899; font-family:'Fredoka',sans-serif;">✨ Galeria Visual de Emojis do Discord</h2>
          <div style="font-size:13px; color:#94a3b8; margin-top:2px;">Mapeando para: <strong id="modalSlotTitle" style="color:#c084fc;">-</strong></div>
        </div>
        <button type="button" onclick="closePicker()" style="background:none; border:none; color:#94a3b8; font-size:28px; cursor:pointer; padding:0 8px; line-height:1;">&times;</button>
      </div>
      <!-- Modal Controls -->
      <div style="padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <input type="text" id="pickerSearch" placeholder="🔍 Pesquisar emoji pelo nome (ex: coin, heart, kuromi)..." style="flex:1; min-width:200px; background:rgba(0,0,0,0.5); border:1px solid rgba(139,92,246,0.4); border-radius:10px; padding:10px 14px; color:#fff; font-size:14px; outline:none;" />
        <button type="button" class="picker-filter-btn active" data-type="all">Todos (<span id="countAll">0</span>)</button>
        <button type="button" class="picker-filter-btn" data-type="animated">Animados ✨ (<span id="countAnim">0</span>)</button>
        <button type="button" class="picker-filter-btn" data-type="static">Estáticos 📄 (<span id="countStatic">0</span>)</button>
      </div>
      <!-- Modal Grid -->
      <div id="pickerGrid" style="flex:1; overflow-y:auto; padding:20px; display:grid; grid-template-columns:repeat(auto-fill, minmax(76px, 1fr)); gap:10px;">
      </div>
      <!-- Modal Footer -->
      <div style="padding:14px 20px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center;">
        <button type="button" onclick="selectEmojiForSlot('')" style="background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; border-radius:10px; padding:8px 16px; font-weight:700; cursor:pointer;">🚫 Resetar para Padrão Unicode</button>
        <button type="button" onclick="closePicker()" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:10px; padding:8px 16px; font-weight:600; cursor:pointer;">Fechar</button>
      </div>
    </div>
  </div>

  <script>
    const ALL_DISCORD_EMOJIS = ${JSON.stringify(simplifiedAppEmojis)};
    const SLOT_METADATA = ${JSON.stringify(SLOT_METADATA)};

    const PAGE_SIZE = 8;
    let currentPage = 1;
    let visibleCards = [];
    let currentSlotForPicker = null;
    let activePickerFilter = 'all';

    const searchInput = document.getElementById('searchInput');
    const catBtns = document.querySelectorAll('.cat-btn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const pickerSearch = document.getElementById('pickerSearch');
    const pickerFilterBtns = document.querySelectorAll('.picker-filter-btn');

    function init() {
      filterSlots();
      updateStickySummary();
      setupEventListeners();
    }

    function setupEventListeners() {
      searchInput.addEventListener('input', () => { currentPage = 1; filterSlots(); });

      catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          catBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentPage = 1;
          filterSlots();
        });
      });

      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage();
        }
      });

      nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(visibleCards.length / PAGE_SIZE) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderPage();
        }
      });

      pickerSearch.addEventListener('input', renderPickerGrid);

      pickerFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          pickerFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activePickerFilter = btn.getAttribute('data-type');
          renderPickerGrid();
        });
      });
    }

    function filterSlots() {
      const q = searchInput.value.toLowerCase().trim();
      const activeCat = document.querySelector('.cat-btn.active')?.getAttribute('data-cat') || 'all';
      const allCards = Array.from(document.querySelectorAll('.slot-card'));

      visibleCards = allCards.filter(card => {
        const slot = card.getAttribute('data-slot').toLowerCase();
        const cat = card.getAttribute('data-category');
        const meta = SLOT_METADATA[slot] || {};
        const title = (meta.title || '').toLowerCase();

        const matchesQuery = !q || slot.includes(q) || title.includes(q);
        const matchesCat = activeCat === 'all' || cat === activeCat;
        return matchesQuery && matchesCat;
      });

      renderPage();
    }

    function renderPage() {
      const allCards = document.querySelectorAll('.slot-card');
      allCards.forEach(c => c.style.display = 'none');

      const totalPages = Math.ceil(visibleCards.length / PAGE_SIZE) || 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = visibleCards.slice(start, start + PAGE_SIZE);

      pageItems.forEach(card => card.style.display = 'flex');

      pageIndicator.textContent = 'Página ' + currentPage + ' de ' + totalPages + ' (' + visibleCards.length + ' slots)';
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
    }

    function openPicker(slot) {
      currentSlotForPicker = slot;
      const meta = SLOT_METADATA[slot] || { title: slot, fallback: '✨' };
      document.getElementById('modalSlotTitle').textContent = meta.title + ' (' + slot + ')';
      pickerSearch.value = '';
      activePickerFilter = 'all';
      pickerFilterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === 'all'));
      renderPickerGrid();
      document.getElementById('emojiPickerModal').style.display = 'flex';
    }

    function closePicker() {
      document.getElementById('emojiPickerModal').style.display = 'none';
      currentSlotForPicker = null;
    }

    function renderPickerGrid() {
      const q = pickerSearch.value.toLowerCase().trim();
      const grid = document.getElementById('pickerGrid');
      grid.innerHTML = '';

      let items = ALL_DISCORD_EMOJIS;
      if (activePickerFilter === 'animated') items = items.filter(e => e.animated);
      else if (activePickerFilter === 'static') items = items.filter(e => !e.animated);

      if (q) items = items.filter(e => e.name.toLowerCase().includes(q) || String(e.id).includes(q));

      document.getElementById('countAll').textContent = ALL_DISCORD_EMOJIS.length;
      document.getElementById('countAnim').textContent = ALL_DISCORD_EMOJIS.filter(e => e.animated).length;
      document.getElementById('countStatic').textContent = ALL_DISCORD_EMOJIS.filter(e => !e.animated).length;

      if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#94a3b8;">Nenhum emoji encontrado para "' + q + '".</div>';
        return;
      }

      items.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'emoji-grid-card';
        card.title = emoji.name + ' (' + emoji.id + ')';
        card.onclick = () => selectEmojiForSlot(emoji.id);

        const img = document.createElement('img');
        img.src = emoji.url;
        img.alt = emoji.name;
        img.onerror = () => { img.src = 'https://cdn.discordapp.com/emojis/' + emoji.id + '.png'; };

        const nameDiv = document.createElement('div');
        nameDiv.className = 'emoji-name-text';
        nameDiv.textContent = emoji.name;

        if (emoji.animated) {
          const animBadge = document.createElement('span');
          animBadge.className = 'anim-badge';
          animBadge.textContent = 'GIF';
          card.appendChild(animBadge);
        }

        card.appendChild(img);
        card.appendChild(nameDiv);
        grid.appendChild(card);
      });
    }

    function selectEmojiForSlot(emojiId) {
      if (!currentSlotForPicker) return;
      const slot = currentSlotForPicker;
      document.getElementById('input-' + slot).value = emojiId;
      updateSlotCardUI(slot, emojiId);
      closePicker();
      updateStickySummary();
    }

    function clearSlot(slot) {
      document.getElementById('input-' + slot).value = '';
      updateSlotCardUI(slot, '');
      updateStickySummary();
    }

    function updateSlotCardUI(slot, emojiId) {
      const box = document.getElementById('box-' + slot);
      const badge = document.getElementById('badge-' + slot);
      const label = document.getElementById('label-' + slot);
      const meta = SLOT_METADATA[slot] || { fallback: '✨' };

      const emojiObj = ALL_DISCORD_EMOJIS.find(e => String(e.id) === String(emojiId));

      if (!emojiId) {
        box.innerHTML = '<span style="font-size:26px;">' + meta.fallback + '</span>';
        badge.innerHTML = '<span class="badge badge-fallback">Unicode</span>';
        label.textContent = 'Padrão (Unicode: ' + meta.fallback + ')';
      } else if (emojiObj) {
        box.innerHTML = '<img src="' + emojiObj.url + '" alt="' + slot + '" style="width:34px;height:34px;vertical-align:middle;object-fit:contain;" />';
        badge.innerHTML = emojiObj.animated
          ? '<span class="badge badge-animated">GIF Animado</span>'
          : '<span class="badge badge-static">PNG Estático</span>';
        label.textContent = (emojiObj.animated ? '✨ ' : '') + emojiObj.name + ' (' + emojiId + ')';
      } else {
        const fallbackUrl = 'https://cdn.discordapp.com/emojis/' + emojiId + '.png';
        box.innerHTML = '<img src="' + fallbackUrl + '" alt="' + slot + '" style="width:34px;height:34px;vertical-align:middle;object-fit:contain;" />';
        badge.innerHTML = '<span class="badge badge-static">Customizado</span>';
        label.textContent = 'ID: ' + emojiId;
      }
    }

    function updateStickySummary() {
      const inputs = document.querySelectorAll('input[type="hidden"]');
      let customCount = 0;
      let fallbackCount = 0;

      inputs.forEach(inp => {
        if (inp.value && inp.value.trim()) customCount++;
        else fallbackCount++;
      });

      document.getElementById('stickySummary').innerHTML =
        '📊 <strong>' + customCount + '</strong> Customizados • <strong>' + fallbackCount + '</strong> Unicode Fallback';
    }

    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;

  return res.send(html);
});

app.post('/admin/emojis', (req, res) => {
  const token = req.query.token;
  const secret = process.env.API_SECRET_TOKEN || process.env.PANEL_SECRET;
  const sessionCookie = getCookie(req, 'pyxie_admin_session');

  const isAuth =
    isIpAllowed(req) ||
    (sessionCookie && isValidAdminSession(sessionCookie)) ||
    (token && ((secret && token === secret) || isMasterSecretValid(token) || isValidAdminSession(token) || verifyMagicToken(token).valid));

  if (!isAuth) {
    return res.status(401).send('401 Unauthorized');
  }

  const emojisData = {};
  for (const slot of Object.keys(req.body || {})) {
    emojisData[slot] = req.body[slot] ? String(req.body[slot]).trim() : '';
  }

  // 1. Save src/data/emojis.json
  const dataPath = path.join(__dirname, 'src/data/emojis.json');
  fs.writeFileSync(dataPath, JSON.stringify(emojisData, null, 2), 'utf8');

  // 2. Sync with src/data/themeEmojis.json
  try {
    const themePath = path.join(__dirname, 'src/data/themeEmojis.json');
    if (fs.existsSync(themePath)) {
      const themeContent = JSON.parse(fs.readFileSync(themePath, 'utf8'));
      if (themeContent && themeContent.themes) {
        for (const [slot, meta] of Object.entries(SLOT_METADATA)) {
          if (meta.themeKey && themeContent.themes[meta.themeKey] && emojisData[slot]) {
            themeContent.themes[meta.themeKey].primaryId = emojisData[slot];
          }
        }
        fs.writeFileSync(themePath, JSON.stringify(themeContent, null, 2), 'utf8');
      }
    }
    reloadEmojiConfig();
    sendIpcToBot({ type: 'RELOAD_EMOJIS' });
  } catch (err) {
    console.error('Error syncing themeEmojis.json:', err);
  }

  const redirectToken = token ? `?token=${encodeURIComponent(token)}&saved=true` : '?saved=true';
  return res.redirect(`/admin/emojis${redirectToken}`);
});

// API de Leitura dos Emojis para o Console Administrativo
app.get('/api/admin/emojis', requireAdminAuth, (req, res) => {
  try {
    const emojisPath = path.join(__dirname, 'src/data/emojis.json');
    let currentConfig = {};
    if (fs.existsSync(emojisPath)) {
      currentConfig = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));
    }

    const themePath = path.join(__dirname, 'src/data/themeEmojis.json');
    let currentThemeConfig = {};
    if (fs.existsSync(themePath)) {
      const parsed = JSON.parse(fs.readFileSync(themePath, 'utf8'));
      currentThemeConfig = parsed.themes || {};
    }

    let appEmojis = [];
    const catalogPath = path.join(__dirname, 'src/data/discordAppEmojis.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const parsed = JSON.parse(raw);
      appEmojis = Array.isArray(parsed) ? parsed : (parsed.items || []);
    }

    const simplifiedAppEmojis = appEmojis.map((e) => ({
      id: String(e.id),
      name: e.name || 'emoji',
      animated: Boolean(e.animated),
      url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`,
    }));

    return res.json({
      success: true,
      currentConfig,
      themeConfig: currentThemeConfig,
      appEmojis: simplifiedAppEmojis,
      slots: SLOT_METADATA,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Salvamento dos Emojis (Totalmente Dinâmica e Atômica)
app.post('/api/admin/emojis', requireAdminAuth, (req, res) => {
  try {
    const incoming = req.body?.emojis || req.body || {};
    const dataPath = path.join(__dirname, 'src/data/emojis.json');
    let currentData = {};
    if (fs.existsSync(dataPath)) {
      try {
        currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8')) || {};
      } catch (_) {}
    }

    // Merge dinâmico preservando slots customizados e chaves novas
    for (const [key, rawVal] of Object.entries(incoming)) {
      let val = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';
      // Regra Mandatória 4: Proibição estrita do portal de Minecraft
      if (val === '1548444170488778954') {
        val = '1551355962974273546';
      }
      currentData[key] = val;
    }

    // 1. Gravação Atômica em src/data/emojis.json
    const tempFile = `${dataPath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(currentData, null, 2), 'utf8');
    fs.renameSync(tempFile, dataPath);

    // 2. Sincroniza com src/data/themeEmojis.json
    try {
      const themePath = path.join(__dirname, 'src/data/themeEmojis.json');
      if (fs.existsSync(themePath)) {
        const themeContent = JSON.parse(fs.readFileSync(themePath, 'utf8'));
        if (themeContent && themeContent.themes) {
          for (const [slot, meta] of Object.entries(SLOT_METADATA)) {
            if (meta.themeKey && themeContent.themes[meta.themeKey] && currentData[slot]) {
              themeContent.themes[meta.themeKey].primaryId = currentData[slot];
            }
          }
          const themeTemp = `${themePath}.${Date.now()}.tmp`;
          fs.writeFileSync(themeTemp, JSON.stringify(themeContent, null, 2), 'utf8');
          fs.renameSync(themeTemp, themePath);
        }
      }
    } catch (syncErr) {
      console.error('Erro ao sincronizar themeEmojis.json:', syncErr.message);
    }

    // 3. Atualiza cache em memória do bot imediatamente via IPC
    reloadEmojiConfig();
    embedRegistry.reloadRegistryCache();
    sendIpcToBot({ type: 'RELOAD_EMOJIS' });
    broadcastLiveEvent('RELOAD_EMOJIS', { emojis: currentData });

    return res.json({
      success: true,
      count: Object.keys(currentData).length,
      message: 'Configurações de emojis salvas e aplicadas em tempo real com sucesso!',
      emojis: currentData,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Listagem Central de Embeds & Slots Visuais Registrados
app.get('/api/admin/embeds', requireAdminAuth, (req, res) => {
  try {
    const embeds = embedRegistry.getAllEmbedsWithResolvedSlots();

    let appEmojis = [];
    const catalogPath = path.join(__dirname, 'src/data/discordAppEmojis.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const parsed = JSON.parse(raw);
      appEmojis = Array.isArray(parsed) ? parsed : (parsed.items || []);
    }

    const simplifiedAppEmojis = appEmojis.map((e) => ({
      id: String(e.id),
      name: e.name || 'emoji',
      animated: Boolean(e.animated),
      url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}`,
    }));

    return res.json({
      success: true,
      embeds,
      appEmojis: simplifiedAppEmojis,
      count: embeds.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API para Salvar Slot de Embed Individualmente com Atualização Atômica
app.post('/api/admin/embeds/slot', requireAdminAuth, (req, res) => {
  try {
    const { embedId, slotKey, emojiId } = req.body || {};
    if (!embedId || !slotKey) {
      return res.status(400).json({ success: false, error: 'embedId e slotKey são obrigatórios.' });
    }

    const saved = embedRegistry.saveEmbedSlotEmoji(embedId, slotKey, emojiId);
    sendIpcToBot({ type: 'RELOAD_EMOJIS' });
    broadcastLiveEvent('RELOAD_EMOJIS', { embedId, slotKey, emojiId });

    return res.json({
      success: true,
      message: `Slot '${slotKey}' do embed '${embedId}' atualizado com sucesso!`,
      result: saved,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Consulta das Currencies Globais (coins & magicBeans)
app.get('/api/admin/currencies', requireAdminAuth, (req, res) => {
  try {
    const currencies = embedRegistry.getCurrenciesConfig();
    return res.json({ success: true, currencies });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Salvamento de Currency Global (Atualização Atômica & Sincronização em Tempo Real)
app.post('/api/admin/currencies', requireAdminAuth, (req, res) => {
  try {
    const { currencyKey, emojiId, currencies } = req.body || {};

    if (currencies && typeof currencies === 'object') {
      for (const [key, id] of Object.entries(currencies)) {
        embedRegistry.saveCurrencyEmoji(key, id);
      }
    } else if (currencyKey) {
      embedRegistry.saveCurrencyEmoji(currencyKey, emojiId);
    } else {
      return res.status(400).json({ success: false, error: 'currencyKey ou currencies é obrigatório.' });
    }

    sendIpcToBot({ type: 'RELOAD_EMOJIS' });
    const updated = embedRegistry.getCurrenciesConfig();
    broadcastLiveEvent('RELOAD_EMOJIS', { currencies: updated });

    return res.json({
      success: true,
      message: 'Currencies globais atualizadas e sincronizadas com sucesso!',
      currencies: updated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Introspecção em Tempo Real do Processo do Bot
app.get('/api/admin/introspect', requireAdminAuth, (req, res) => {
  try {
    const modules = moduleManager.getAllModules();
    const embeds = embedRegistry.getAllEmbedsWithResolvedSlots();
    const acervo = acervoAuditService.getAcervoStats();
    const currencies = embedRegistry.getCurrenciesConfig();

    return res.json({
      success: true,
      timestamp: Date.now(),
      bot: {
        running: !!botProcess && !botProcess.killed && botProcess.exitCode === null,
        pid: botProcess ? botProcess.pid : null,
        uptime: botStartTime ? Date.now() - botStartTime : 0,
        stats: getStats(),
      },
      modules,
      embeds,
      currencies,
      acervo,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Auditoria Real de Acervo (Carreiras & Quiz)
app.get('/api/admin/acervo/stats', requireAdminAuth, (req, res) => {
  try {
    const stats = acervoAuditService.getAcervoStats();
    return res.json({ success: true, ...stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API de Simulação de Sorteio de Minigame ao Vivo
app.post('/api/admin/acervo/test-draw', requireAdminAuth, (req, res) => {
  try {
    const { type, profession, level, userLevel, lang } = req.body || {};
    const result = acervoAuditService.simulateDraw(type || 'career', {
      profession,
      level: level !== undefined ? level : userLevel,
      lang: lang || 'pt',
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/modules', requireAdminAuth, (req, res) => {
  try {
    const modules = moduleManager.getAllModules();
    return res.json({ success: true, modules });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/modules/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body || {};
    const shouldEnable = active !== undefined ? Boolean(active) : !moduleManager.isModuleEnabled(id);
    moduleManager.setModuleConfigState(id, shouldEnable);
    sendIpcToBot({ type: 'MODULE_TOGGLE', moduleId: id, enabled: shouldEnable });
    broadcastLiveEvent('MODULE_TOGGLE', { moduleId: id, enabled: shouldEnable });
    return res.json({ success: true, moduleId: id, enabled: shouldEnable });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/modules/:id/reload', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await moduleManager.reloadModule(id);
    sendIpcToBot({ type: 'MODULE_RELOAD', moduleId: id });
    broadcastLiveEvent('MODULE_TOGGLE', { moduleId: id });
    return res.json({ success: true, moduleId: id, message: `Módulo '${id}' recarregado com sucesso!` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/modules/:id/config', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'partnerships') {
      const pm = require('./src/modules/partnerships/partnershipManager');
      return res.json({ success: true, config: pm.getConfig() });
    }
    if (id === 'museum') {
      const mm = require('./src/modules/museum/museumManager');
      return res.json({ success: true, config: mm.getConfig(), harvester: mm.getHarvesterStatus() });
    }
    if (id === 'dungeon') {
      const ds = require('./src/modules/dungeon/dungeonStore');
      return res.json({ success: true, config: ds.getSettings(), defaults: ds.DEFAULT_SETTINGS, bounds: ds.SETTINGS_BOUNDS, stats: ds.getDungeonStats() });
    }
    if (id === 'battlePass') {
      const bp = require('./src/services/battlePass');
      return res.json({ success: true, config: {}, stats: bp.getPassStats(), providers: require('./src/services/passPayments').providers(), month: bp.monthKey() });
    }
    return res.status(404).json({ success: false, error: `Módulo '${id}' não possui configuração customizada.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/modules/:id/config', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'partnerships') {
      const pm = require('./src/modules/partnerships/partnershipManager');
      const saved = pm.saveConfig(req.body || {});
      sendIpcToBot({ type: 'MODULE_RELOAD', moduleId: id });
      return res.json({ success: true, config: saved, message: 'Configurações de parcerias salvas com sucesso!' });
    }
    if (id === 'museum') {
      const mm = require('./src/modules/museum/museumManager');
      const saved = mm.saveConfig(req.body || {});
      sendIpcToBot({ type: 'MODULE_RELOAD', moduleId: id });
      return res.json({ success: true, config: saved, harvester: mm.getHarvesterStatus(), message: 'Configurações do museu salvas com sucesso!' });
    }
    if (id === 'dungeon') {
      // Os ajustes valem na hora: o bot relê modulesConfig.json a cada descida
      const ds = require('./src/modules/dungeon/dungeonStore');
      const cfg = moduleManager.loadConfig();
      if (!cfg.modules) cfg.modules = {};
      const current = cfg.modules.dungeon || { enabled: true };
      cfg.modules.dungeon = { ...current, data: { ...(current.data || {}), ...ds.sanitizeSettings(req.body || {}) }, updatedAt: Date.now() };
      moduleManager.saveConfig(cfg);
      return res.json({ success: true, config: ds.getSettings(), stats: ds.getDungeonStats(), message: 'Configurações das Catacumbas salvas com sucesso!' });
    }
    if (id === 'battlePass') {
      // Liberação manual do Premium (ex.: Pix direto na conta Nubank, conferido pelo Criador)
      const bp = require('./src/services/battlePass');
      const { grantUserId, grantMonth, amount, currency } = req.body || {};
      if (!/^\d{17,20}$/.test(String(grantUserId || ''))) return res.status(400).json({ success: false, error: 'ID de usuário inválido.' });
      const month = /^\d{4}-\d{2}$/.test(String(grantMonth || '')) ? String(grantMonth) : bp.monthKey();
      const result = bp.activatePremium(String(grantUserId), month, { paymentId: `manual:${Date.now()}:${grantUserId}`, provider: 'manual', amount: Number(amount) || 0, currency: currency === 'USD' ? 'USD' : 'BRL' });
      if (!result.ok) return res.status(400).json({ success: false, error: result.reason });
      notifyPassPremium({ ...result, userId: String(grantUserId) });
      return res.json({ success: true, stats: bp.getPassStats(), message: result.already ? `Premium de ${month} já estava ativo.` : `Premium de ${month} liberado para ${grantUserId}.` });
    }
    return res.status(404).json({ success: false, error: `Módulo '${id}' não possui configuração customizada.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/verify', (req, res) => {
  const { token, secret } = req.body || {};
  if (token) {
    const magic = verifyMagicToken(token);
    if (magic.valid) {
      res.setHeader('Set-Cookie', `pyxie_admin_session=${magic.sessionToken}; HttpOnly; SameSite=Lax; Max-Age=43200; Path=/`);
      return res.json({ success: true, sessionToken: magic.sessionToken });
    }
    return res.status(401).json({ success: false, message: magic.error });
  }

  if (secret && isMasterSecretValid(secret)) {
    const sessionToken = createMasterAdminSession();
    res.setHeader('Set-Cookie', `pyxie_admin_session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=43200; Path=/`);
    return res.json({ success: true, sessionToken });
  }

  const sessionCookie = getCookie(req, 'pyxie_admin_session');
  if (sessionCookie && isValidAdminSession(sessionCookie)) {
    return res.json({ success: true, sessionToken: sessionCookie });
  }

  if (!isIpAllowed(req)) {
    return res.status(403).json({ success: false, message: 'IP não autorizado.' });
  }

  return res.status(401).json({ success: false, message: 'Credenciais inválidas ou sessão expirada.' });
});

// 4. Webhook do Top.gg (Votos e Recompensas a cada 12h)
app.post('/api/topgg/webhook', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!verifyWebhookAuth(authHeader)) {
    addLog('[Top.gg Webhook] Falha de autenticação no webhook.');
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const result = processTopggVote(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({ status: 'success', data: result });
});

// 3. Rotas administrativas protegidas
// 3. Sistema de Bônus de Recompensas (Página de Espera 10s da Pyxie)
// 5. Sistema de Bônus de Recompensas (Página de Espera 10s da Pyxie)
app.get('/bonus', serveLocalizedPage('bonus', publicDir));

app.post('/api/bonus/claim', sensitiveRouteLimiter, (req, res) => {
  const { token } = req.body || {};
  const result = verifyAndClaimBonus(token);
  if (!result.success) {
    addLog(`[Bônus] Tentativa de resgate rejeitada: ${result.error}`);
    return res.status(400).json(result);
  }

  addLog(`[Bônus] Resgate concluído para o usuário ${result.userId} (Ação: ${result.action})`);
  return res.json(result);
});

// 4. Rotas administrativas protegidas
app.post('/api/start', requireAdminAuth, (req, res) => {
  res.json(startBot());
});

app.post('/api/stop', requireAdminAuth, async (req, res) => {
  const result = await stopBot();
  res.json(result);
});

app.post('/api/restart', requireAdminAuth, async (req, res) => {
  const result = await restartBot();
  res.json(result);
});

app.post('/api/register', requireAdminAuth, async (req, res) => {
  const response = await registerSlashCommands();
  res.json(response);
});

app.get('/api/config', requireAdminAuth, (req, res) => {
  res.json({
    welcomeChannelId: getWelcomeChannel('global') || null,
    economy: getEconomyConfig(),
  });
});

app.post('/api/config/welcome-channel', requireAdminAuth, (req, res) => {
  const { channelId } = req.body || {};
  const normalized = String(channelId || '').trim();
  const result = setWelcomeChannel('global', normalized);
  res.json({ success: true, welcomeChannelId: result });
});

app.post('/api/config/economy', requireAdminAuth, (req, res) => {
  const minimum = Number(req.body?.minimum);
  const maximum = Number(req.body?.maximum);

  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 0 || maximum < minimum) {
    return res.status(400).json({ success: false, message: 'Informe valores inteiros válidos.' });
  }

  res.json({ success: true, economy: setEconomyConfig(minimum, maximum) });
});

function getSystemTelemetry() {
  const mem = process.memoryUsage();
  const stats = getStats();
  const uptime = botStartTime ? Date.now() - botStartTime : 0;
  const cpus = os.cpus() || [];
  const loadAvg = typeof os.loadavg === 'function' ? os.loadavg() : [0, 0, 0];

  return {
    pid: process.pid,
    botPid: botProcess ? botProcess.pid : null,
    nodeVersion: process.version,
    platform: `${os.platform()} (${os.arch()})`,
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Standard CPU',
    loadAvg: loadAvg.map((l) => +(l.toFixed(2))),
    totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
    freeMemMb: Math.round(os.freemem() / 1024 / 1024),
    processMemRssMb: +(mem.rss / 1024 / 1024).toFixed(1),
    heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(1),
    heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(1),
    serverUptimeSec: Math.floor(process.uptime()),
    botUptimeSec: Math.floor(uptime / 1000),
    botRunning: !!botProcess && !botProcess.killed && botProcess.exitCode === null,
    stats: {
      commands: stats.commandsExecuted || 0,
      messages: stats.messagesProcessed || 0,
      users: stats.usersEngaged || 0,
      uniqueUsersCount: stats.uniqueUsers ? stats.uniqueUsers.split(',').filter(Boolean).length : 0,
    },
  };
}

app.get('/api/logs', requireAdminAuth, (req, res) => {
  const limit = parseInt(req.query.limit || '150', 10);
  const category = req.query.category || req.query.tab || 'ALL';
  const rawLogs = getLogs(limit, category);
  res.json({
    success: true,
    logs: rawLogs,
    count: rawLogs.length,
    telemetry: getSystemTelemetry(),
  });
});

app.post('/api/admin/terminal/exec', requireAdminAuth, async (req, res) => {
  const cmd = String(req.body?.command || '').trim();
  if (!cmd) return res.json({ success: false, output: 'Comando vazio.' });

  const parts = cmd.split(/\s+/);
  const action = parts[0].toLowerCase();
  const args = parts.slice(1);

  try {
    if (action === 'help') {
      return res.json({
        success: true,
        output: [
          '⚡ Pyxie Administrative CLI v2.0',
          '====================================================',
          '  help             - Exibe este manual com comandos disponíveis',
          '  status           - Telemetria de memória, CPU, PID e Uptime',
          '  stats            - Estatísticas de uso da Pyxie (comandos, usuários)',
          '  ping             - Testa latência e tempo de resposta do servidor',
          '  shopee           - Resumo e diagnóstico dos links de afiliados',
          '  eco              - Parâmetros vigentes da economia do bot',
          '  test-log <msg>   - Dispara uma linha de log para teste do terminal',
          '  reload-emojis    - Recarrega mapeamentos de emojis em tempo real',
          '  clear            - Limpa o visor do terminal',
          '  restart          - Reinicia o processo da Pyxie',
          '====================================================',
        ].join('\n'),
      });
    }

    if (action === 'status') {
      const t = getSystemTelemetry();
      const ramPercent = Math.min(100, Math.round((t.processMemRssMb / 160) * 100));
      return res.json({
        success: true,
        output: [
          `🤖 Status da Pyxie • ${t.platform} [Node ${t.nodeVersion}]`,
          `├─ Servidor Web: PID ${t.pid} | Uptime: ${Math.floor(t.serverUptimeSec / 3600)}h ${Math.floor((t.serverUptimeSec % 3600) / 60)}m ${t.serverUptimeSec % 60}s`,
          `├─ Bot Discord: ${t.botRunning ? '🟢 ONLINE' : '🔴 OFFLINE'} (PID ${t.botPid || 'PM2 gerenciado'}) | Uptime: ${Math.floor(t.botUptimeSec / 3600)}h ${Math.floor((t.botUptimeSec % 3600) / 60)}m`,
          `├─ RAM do Processo (RSS): ${t.processMemRssMb} MB / 160 MB (${ramPercent}%) | Heap: ${t.heapUsedMb} MB / ${t.heapTotalMb} MB`,
          `├─ Memória do Sistema: ${t.freeMemMb} MB livres de ${t.totalMemMb} MB totais`,
          `└─ Atividade: ${t.stats.commands} comandos executados | ${t.stats.messages} msgs | ${t.stats.uniqueUsersCount} usuários ativos`,
        ].join('\n'),
      });
    }

    if (action === 'stats') {
      const s = getStats();
      return res.json({
        success: true,
        output: JSON.stringify(s, null, 2),
      });
    }

    if (action === 'ping') {
      const mem = process.memoryUsage();
      return res.json({
        success: true,
        output: `🏓 Pong! Latência interna do servidor: < 1ms | RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB | Loop de eventos operacional.`,
      });
    }

    if (action === 'shopee') {
      const items = shopeeManager.getAllItems();
      const active = items.filter((i) => i.active !== false).length;
      return res.json({
        success: true,
        output: [
          `🛍️ Afiliados Shopee • ${active}/${items.length} ativos`,
          `├─ Produtos cadastrados: ${items.length}`,
          `├─ Produtos ativos no bot e web: ${active}`,
          `└─ Link canônico: https://s.shopee.com.br/BU6Bod6Sw`,
        ].join('\n'),
      });
    }

    if (action === 'clear') {
      return res.json({
        success: true,
        clear: true,
        output: 'Terminal limpo.',
      });
    }

    if (action === 'eco') {
      const eco = getEconomyConfig();
      return res.json({
        success: true,
        output: [
          `🪙 Configuração de Economia`,
          `├─ Bônus Mínimo: ${eco.minimum} moedinhas`,
          `├─ Bônus Máximo: ${eco.maximum} moedinhas`,
          `└─ Cooldown Diário: 24 horas`,
        ].join('\n'),
      });
    }

    if (action === 'test-log') {
      const msg = args.join(' ') || 'Log de teste disparado manualmente pelo console administrativo.';
      addLog(`[DIAGNOSTIC] ${msg}`);
      return res.json({
        success: true,
        output: `✅ Log de teste registrado: "${msg}"`,
      });
    }

    if (action === 'reload-emojis') {
      reloadEmojiConfig();
      sendIpcToBot({ type: 'RELOAD_EMOJIS' });
      return res.json({
        success: true,
        output: '✨ Configuração de emojis recarregada em tempo real com sucesso!',
      });
    }

    if (action === 'setup-ssh' || action === 'sync-ssh') {
      const resSsh = ensureSshKeys();
      return res.json({
        success: resSsh.success,
        output: resSsh.message,
      });
    }

    if (action === 'restart') {
      setTimeout(async () => {
        await restartBot();
      }, 500);
      return res.json({
        success: true,
        output: '🔄 Sinal de reinício enviado para o bot Pyxie.',
      });
    }

    return res.json({
      success: false,
      output: `Comando desconhecido: "${action}". Digite "help" para ver a lista de comandos disponíveis.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, output: `Erro ao executar comando: ${err.message}` });
  }
});

app.get('/api/stats', (req, res) => {
  const stats = getStats();
  const uptime = botStartTime ? Date.now() - botStartTime : 0;
  res.json({ ...stats, uptime });
});

app.post('/api/stats/reset', requireAdminAuth, (req, res) => {
  const newStats = resetStats();
  res.json({ success: true, stats: newStats });
});

app.post('/api/logs/clear', requireAdminAuth, (req, res) => {
  botLogs = [];
  clearLogs();
  res.json({ success: true, message: 'Logs limpos com sucesso.' });
});

app.post('/api/admin/tarot/post-daily', requireAdminAuth, (req, res) => {
  const sent = sendIpcToBot({ type: 'TAROT_DAILY_TRIGGER' });
  if (sent) {
    return res.json({ success: true, message: 'Comando de postagem do Tarot enviado ao bot via IPC.' });
  }
  return res.status(503).json({ success: false, error: 'Bot offline ou IPC indisponível.' });
});

app.post('/api/embed/send', requireAdminAuth, (req, res) => {
  const { channelId, title, description, color, fields } = req.body || {};
  
  if (!botProcess || botProcess.killed || botProcess.exitCode !== null) {
    return res.status(400).json({ success: false, message: 'Bot não está online.' });
  }
  
  if (!channelId || !title) {
    return res.status(400).json({ success: false, message: 'channelId e title são obrigatórios.' });
  }

  const normalizedChannelId = normalizeChannelValue(channelId);

  const message = JSON.stringify({ type: 'SEND_EMBED', channelId: normalizedChannelId, title, description, color, fields: fields || [] });
  botProcess.stdin?.write(message + '\n');
  
  addLog(`Tentativa de enviar embed para canal ${normalizedChannelId}`);
  res.json({ success: true, message: 'Embed enviado.' });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }

  serveLocalizedPage('index', publicDir)(req, res);
});

function ensureSshKeys() {
  try {
    const homeDir = process.env.HOME || '/home/ubuntu';
    const sshDir = path.join(homeDir, '.ssh');
    if (!fs.existsSync(sshDir)) {
      fs.mkdirSync(sshDir, { recursive: true, mode: 0o700 });
    }
    const authKeysPath = path.join(sshDir, 'authorized_keys');
    const existing = fs.existsSync(authKeysPath) ? fs.readFileSync(authKeysPath, 'utf8') : '';

    const keys = [
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJJnIAYrpK6GLnX47iEq2srrH14lhOhsfSIdjPcHEUol leandrosdclh',
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCgeXeZaXN+E9qvDiRFWYynEPdtQT5Te8Qe727IaN2vis1kLVmIfJLPFspwgq+Bmia7TwwoIv5zHqhZrFKlE32Htjr1MqUNEpyj9Qb2dYrpJiA7vE+MW7YAfHYNeWK5uy+TnnoBbdYZBdqg/fgmAAuSKfXrZua2xMQdrqIH/B4DvomzU8OrirFeJ6M15ywLtkQHKVIDcQenclvi9Sf8/+B58xUFayAMGjep6daFbKeuEjCmnWt3IiQTQw1PhpOdfVdvhAwA9qxcKLDV0pmvUalrEf6/xFnbjFOVLjitJO4OW/YVoqmJlzHVjrDS7iHjfG6HGwQcIwErvmSnG9Jje0wXk4lg7ZOcRzIc92YlBCn4fzfN3TMa3+JEXTvECOqvs5o2knKq0hdgIpr48M9pXqjOOAcKEyvg9JdRFeVXtFJhXmyeAHH748KxZHhHTY4/4SIYjL1vIhpWXjad7gNwRKIGiiR6UxqPBni/VgESswltGuLZZF1LXR+XBqDt+tzXntvM/FBtYj4I/uYb0VboAnatDAvbdKwoZIbYdoZW/KkBqIx3HXNhfdyl0Y4OqYu4NvEMjNsVv86j0xRPC08xW3/a4AVQO0xDk5mfMKK3ll9gZT9QkK1qX/erdUgwwb42c1TaGo1LOobp+Aiht88lNIAX+H/zQjx+n4qgcYCvgcImDQ== user@DESKTOP-RQ7J9NH',
      'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC9xsX55FfgfDGEUPN7wEWs7t19YCEagkISzDejGwDKcjM3sinEmWLH/6DYaQEBkjQQEx3ZECMncfRSGOvSa8DJsp5voD5NqYvHp8o8qg5eorD92U9VArba5nFfcuY+PuiEJv+JuLcl0zfjWnKmTYPniCnD9w5E6qhogljvopGLXtdEwEAOuaNHpZEkJ7iXstyydTCdpNFU3Pmj8veNy7nfzGeMs6LF2AFTE8n4+MMMGayEUDhzgNHesRBMTVXt+M1jXpgAuGQBrxtIWmoxNWCWYwTO6r5wY3gu7cwHpl0QXI7B0LDD2fUO0KfTWLSqQOVGDVmpNFhVJ4AZlR/AY6oj ssh-key-2026-09-29',
    ];

    let content = existing;
    let added = 0;
    for (const key of keys) {
      const keyBody = key.split(' ')[1];
      if (!content.includes(keyBody)) {
        content += (content.endsWith('\n') || !content ? '' : '\n') + key + '\n';
        added++;
      }
    }

    if (added > 0 || !fs.existsSync(authKeysPath)) {
      fs.writeFileSync(authKeysPath, content, { mode: 0o600 });
      try { fs.chmodSync(authKeysPath, 0o600); } catch (_) {}
    }
    return {
      success: true,
      added,
      total: keys.length,
      path: authKeysPath,
      message: `🔑 ${added > 0 ? `${added} nova(s) chave(s) adicionada(s)` : 'Chaves já sincronizadas'}. Total autorizadas: ${keys.length} em ${authKeysPath}`,
    };
  } catch (err) {
    return {
      success: false,
      message: `❌ Erro ao sincronizar chaves SSH: ${err.message}`,
    };
  }
}

// Handler para páginas não encontradas (404)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint não encontrado.' });
  }
  const file404 = path.join(publicDir, '404.html');
  if (fs.existsSync(file404)) {
    return res.status(404).sendFile(file404);
  }
  return res.status(404).send('404 Not Found');
});

// Handler para erros internos do servidor (500)
app.use((err, req, res, next) => {
  console.error('[Internal Error]', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
  const file500 = path.join(publicDir, '500.html');
  if (fs.existsSync(file500)) {
    return res.status(500).sendFile(file500);
  }
  return res.status(500).send('500 Internal Server Error');
});

const server = app.listen(PORT, HOST, () => {
  const publicUrl = process.env.PANEL_PUBLIC_URL || 'http://pyxie.duckdns.org';
  addLog(`Painel web da Pyxie iniciado em ${publicUrl}`);
  console.log(`Painel da Pyxie rodando em ${publicUrl}`);
  ensureSshKeys();
  startBot();
  workSeederService.startScheduler();
  quizSeederService.startScheduler();

  // Motor de Ondas de Verificação Contínua (SSOT: VM <-> Painel <-> Site)
  try {
    const truthEngine = require('./src/services/truthReconciliationEngine');
    truthEngine.startCycle(null, app);
  } catch (err) {
    console.warn('[TruthReconciliationEngine] Falha ao iniciar ciclo:', err.message);
  }

  // Submissão autônoma ao protocolo IndexNow (Bing, Yandex, Seznam, Naver) após o boot
  setTimeout(() => {
    autoSubmitAllUrls(publicDir).then((res) => {
      console.log(`[IndexNow] Submissão autônoma concluída: ${res.message} (${res.count} URLs)`);
    }).catch((err) => {
      console.error('[IndexNow] Erro na submissão de inicialização:', err.message);
    });
  }, 10000);
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return socket.destroy();
  }
  socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

function handleServerShutdown() {
  workSeederService.stopScheduler();
  quizSeederService.stopScheduler();
  flushSync();
  if (botProcess && !botProcess.killed) {
    try { botProcess.kill('SIGTERM'); } catch (_) {}
    try { botProcess.kill('SIGKILL'); } catch (_) {}
  }
  cleanupOrphanBotProcess();
  process.exit(0);
}

process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);
process.on('exit', () => { flushSync(); });
process.on('exit', () => {
  flushSync();
  if (botProcess && !botProcess.killed) {
    try { botProcess.kill('SIGKILL'); } catch (_) {}
  }
  cleanupOrphanBotProcess();
});

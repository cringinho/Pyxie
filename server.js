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
const voiceSeederService = require('./src/services/voiceSeederService');
const seasonalManager = require('./src/modules/seasonal/seasonalManager');
const moduleManager = require('./src/services/moduleManager');
const { serveLocalizedPage, SEO_CONFIG, languageLinks } = require('./src/utils/seoRenderer');
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
const { createDashboardRouter } = require('./src/routes/dashboardRoutes');
const { createHyperfokusRouter } = require('./src/routes/hyperfokusRoutes');
const { createAccountRouter } = require('./src/routes/accountRoutes');
const { createBotBridge } = require('./src/services/botBridge');
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

const botBridge = createBotBridge({ send: sendIpcToBot });

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

  let stdoutBuffer = '';
  botProcess.stdout.on('data', (chunk) => {
    // Respostas da ponte podem chegar quebradas em vários pedaços: só processa linhas completas.
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop();
    lines.filter(Boolean).forEach((line) => {
      if (!botBridge.handleLine(line)) addLog(line);
    });
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

const { processTopggVote, verifyWebhookRequest, getVoteUrl } = require('./src/services/topgg');
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
  hasOwnerPanelSession,
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

  if (hasOwnerPanelSession(req)) return next();
  if (bearerToken && isMasterSecretValid(bearerToken)) return next();
  if (queryToken && isMasterSecretValid(queryToken)) return next();
  if (sessionCookie && isValidAdminSession(sessionCookie)) return next();
  if (bearerToken && isValidAdminSession(bearerToken)) return next();

  return res.status(401).json({ error: 'Acesso administrativo não autorizado.' });
}

app.disable('x-powered-by');
// O Caddy roda na mesma máquina: só ele pode informar o IP real via X-Forwarded-For.
app.set('trust proxy', 'loopback');

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
    const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
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

// O webhook v1 do Top.gg assina o corpo bruto: guarda os bytes antes do parse só nessa rota
app.use(express.json({
  verify: (req, _res, buf) => {
    if (req.originalUrl.startsWith('/api/topgg/webhook')) req.rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({ extended: true }));

// Rotas da API Master SaaS Dashboard
app.use('/', createAdminMasterRouter({ requireAdminAuth, sendIpcToBot }));
app.use(
  '/',
  createDashboardRouter({
    bridge: botBridge,
    sendIpcToBot,
    moduleManager,
    getWebStatus: () => {
      const { running, pid } = getBotStatus();
      return { botProcessRunning: running, botPid: pid };
    },
  })
);

app.use('/', createAccountRouter());
app.use('/', createHyperfokusRouter({ publicDir }));

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
// Editor de texto do Hyperfokus (site e painel): Quill e Turndown servidos daqui, sem CDN (a CSP só aceita 'self').
app.get('/vendor/quill.js', (req, res) => res.sendFile(require.resolve('quill/dist/quill.js'), { maxAge: '7d' }));
app.get('/vendor/quill.snow.css', (req, res) => res.sendFile(require.resolve('quill/dist/quill.snow.css'), { maxAge: '7d' }));
app.get('/vendor/turndown.js', (req, res) => res.sendFile(require.resolve('turndown/dist/turndown.js'), { maxAge: '7d' }));
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

// /discord?ref=site → convite vivo da Cringelândia (os códigos fixos expiravam)
app.get('/discord', async (req, res) => {
  try { growthFunnel.recordInviteClick(req.query.ref, 'community', { visitorKey: req.ip }); } catch (_) {}
  const url = await require('./src/services/cringelandiaInvite').getInviteUrl().catch(() => null);
  res.redirect(url || '/cringelandia#comunidade');
});

app.get('/vote', (req, res) => {
  res.redirect(getVoteUrl());
});

// ---------- Idioma por URL (AGENTS §8): PT na raiz, EN em /en/... ----------
// Cada página tem uma URL por idioma; `?lang=` de links antigos vira 301 dentro do serveLocalizedPage.
app.get('/', serveLocalizedPage('index', publicDir));

app.get('/tarot', serveLocalizedPage('tarot', publicDir));

// Páginas de significado das 78 cartas (HTML completo no servidor; idioma pela URL).
const tarotHub = (lang) => (req, res) => {
  if (req.query.lang) return res.redirect(301, lang === 'en' ? '/en/tarot/cartas' : '/tarot/cartas');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Content-Language', lang === 'en' ? 'en' : 'pt-BR');
  return res.send(tarotCardPages.renderHubPage(lang));
};
app.get('/tarot/cartas', tarotHub('pt'));
app.get('/en/tarot/cartas', tarotHub('en'));

const tarotCardPage = (lang) => (req, res) => {
  const asked = String(req.query.lang || '').toLowerCase();
  const resolved = tarotCardPages.resolveCardRequest(req.params.slug);
  if (resolved.redirect) return res.redirect(301, resolved.redirect);
  if (!resolved.card) return res.status(404).sendFile(path.join(publicDir, '404.html'));
  const wanted = asked === 'en' ? 'en' : asked === 'pt' ? 'pt' : lang;
  if (wanted !== lang) {
    return res.redirect(301, `${wanted === 'en' ? '/en' : ''}/tarot/carta/${resolved.card.slug}`);
  }
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Content-Language', lang === 'en' ? 'en' : 'pt-BR');
  return res.send(tarotCardPages.renderCardPage(resolved.card, lang));
};
app.get('/tarot/carta/:slug', tarotCardPage('pt'));
app.get('/en/tarot/carta/:slug', tarotCardPage('en'));

// Aliases antigos: 301 permanente para a URL canônica, já no idioma pedido (sem duplicata no índice).
const aliasPage = (from, pageKey) =>
  app.get(from, (req, res) => {
    const lang = String(req.query.lang || '').toLowerCase() === 'en' ? 'en' : 'pt';
    const target = new URL(languageLinks(pageKey).urls[lang]);
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === 'lang' || value === undefined) continue;
      target.searchParams.set(key, String(value));
    }
    return res.redirect(301, `${target.pathname}${target.search}`);
  });

app.get('/wiki', serveLocalizedPage('wiki', publicDir));

app.get('/parcerias', serveLocalizedPage('partnerships', publicDir));

app.get('/museu', serveLocalizedPage('museum', publicDir));

app.get('/termos', serveLocalizedPage('terms', publicDir));

app.get('/privacidade', serveLocalizedPage('privacy', publicDir));

app.get('/cringelandia', serveLocalizedPage('cringelandia', publicDir));
app.get('/pais-e-profissionais', serveLocalizedPage('parents', publicDir));
app.get('/transparencia', serveLocalizedPage('transparency', publicDir));

aliasPage('/partnerships', 'partnerships');
aliasPage('/museum', 'museum');
aliasPage('/terms', 'terms');
aliasPage('/privacy', 'privacy');
aliasPage('/parents', 'parents');
aliasPage('/transparency', 'transparency');

// Versões em inglês com URL própria (uma página = uma URL por idioma).
for (const pageKey of Object.keys(SEO_CONFIG)) {
  if (pageKey === 'index') continue;
  const links = languageLinks(pageKey);
  if (!links) continue;
  const enPath = new URL(links.urls.en).pathname;
  const alreadyRouted = enPath === '/en/tarot/cartas' || enPath.startsWith('/en/tarot/carta');
  if (!alreadyRouted) app.get(enPath, serveLocalizedPage(pageKey, publicDir));
}
app.get(/^\/en$/, (req, res) => res.redirect(301, '/en/'));
app.get('/en/', serveLocalizedPage('index', publicDir));
// Registro público das doações (src/data/transparency.json, versionado com os comprovantes).
app.get('/api/public/transparency', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'transparency.json'), 'utf8'));
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json({ success: true, donations: Array.isArray(data.donations) ? data.donations : [] });
  } catch (_) {
    return res.json({ success: true, donations: [] });
  }
});

// Mercado entre jogadores: página pública de preços e a API que ela lê (data/market.json)
app.get('/mercado', serveLocalizedPage('market', publicDir));
aliasPage('/market', 'market');
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

// Passe da Pyxie: página /passe, pagamento do Premium (Mercado Pago) e avisos de pagamento
app.get('/passe', serveLocalizedPage('pass', publicDir));
aliasPage('/pass', 'pass');
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
      support: require('./src/config/support'),
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

// Assinatura mensal do servidor (Básico/Premium): Pix avulso e cartão recorrente.
app.post('/api/plans/webhook/mercadopago', async (req, res) => {
  try {
    const payments = require('./src/services/planPayments');
    const result = await payments.handleWebhook({ body: req.body || {}, query: req.query || {}, headers: req.headers || {} });
    if (!result.ok && result.reason === 'signature') return res.status(401).json({ error: 'signature' });
    if (!result.ok && result.reason === 'provider') return res.status(502).json({ error: 'provider' });
    if (result.ok && !result.ignored && !result.pending && !result.duplicate) {
      console.log(`[plans] Plano ativado: ${result.guildId} → ${result.plan} até ${new Date(result.paidUntil || Date.now()).toISOString()}`);
      // Aviso imediato ao dono do servidor (o módulo plans também manda os lembretes).
      require('./src/modules/plans').notifyActivated(result.guildId, result.plan).catch(() => null);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[plans] Falha no aviso do Mercado Pago:', err.message);
    return res.status(500).json({ error: 'webhook' });
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
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
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

app.get('/api/cringelandia/live-guild', async (req, res) => {
  const guild = await require('./src/services/cringelandiaInvite').getLiveGuild().catch(() => null);
  res.setHeader('Cache-Control', 'public, max-age=60');
  if (!guild) return res.json({ success: false });
  return res.json({ success: true, guild });
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
    // Sem arte no museu, a galeria do site fica escondida (nada de imagem da Pyxie fingindo ser arte)
    const formatted = arts.slice(0, 16).map((art) => ({
      id: art.id,
      author: art.cachedAuthor || art.authorUsername || 'Membro da Cringelândia',
      url: `/api/museum/art-image/${encodeURIComponent(art.id)}.jpg`,
      description: art.description || 'Arte da Comunidade Cringelândia'
    }));

    res.setHeader('Cache-Control', 'public, max-age=120');
    return res.json({ success: true, arts: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Painel Administrativo do Proprietário (Restrito ao Snowflake 214153735281180673 e Chave Mestra)
// O painel antigo mudou para o /dashboard (área global do dono). As APIs /api/admin/* continuam.
app.get('/admin', (req, res) => res.redirect('/dashboard#/global/health'));

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

// Rota Visual de Mapeamento de Emojis (/admin/emojis)
// O mapeador de emojis mudou para o painel novo (/dashboard → Pyxie global → Emojis).
app.get('/admin/emojis', (req, res) => res.redirect('/dashboard#/global/emojis'));

app.post('/admin/emojis', (req, res) => {
  const token = req.query.token;
  const sessionCookie = getCookie(req, 'pyxie_admin_session');

  const isAuth =
    hasOwnerPanelSession(req) ||
    isIpAllowed(req) ||
    (sessionCookie && isValidAdminSession(sessionCookie)) ||
    (token && (isMasterSecretValid(token) || isValidAdminSession(token) || verifyMagicToken(token).valid));

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

// API de Auditoria Real de Acervo (Carreiras & Quiz)
app.get('/api/admin/acervo/stats', requireAdminAuth, (req, res) => {
  try {
    const stats = acervoAuditService.getAcervoStats();
    return res.json({ success: true, ...stats });
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

// 4. Webhook do Top.gg (Votos e Recompensas a cada 12h)
app.post('/api/topgg/webhook', (req, res) => {
  if (!verifyWebhookRequest(req.headers, req.rawBody)) {
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

  // Fim das rotas conhecidas: 404 de verdade (antes a home respondia 200 aqui, o que
  // gerava "soft 404" no Search Console).
  const file404 = path.join(publicDir, '404.html');
  if (fs.existsSync(file404)) return res.status(404).sendFile(file404);
  return res.status(404).send('404 Not Found');
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
  const publicUrl = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';
  addLog(`Painel web da Pyxie iniciado em ${publicUrl}`);
  console.log(`Painel da Pyxie rodando em ${publicUrl}`);
  ensureSshKeys();
  startBot();
  workSeederService.startScheduler();
  quizSeederService.startScheduler();
  voiceSeederService.startScheduler();

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
  voiceSeederService.stopScheduler();
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

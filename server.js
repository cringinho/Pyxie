const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { spawn, execFile } = require('node:child_process');
const { setWelcomeChannel, getWelcomeChannel, normalizeChannelValue, getEconomyConfig, setEconomyConfig } = require('./src/services/database');
const { addLog: savePersistentLog, getLogs, getStats, updateStats, resetStats, clearLogs, flushSync } = require('./src/services/logging');
const { lockFilePath, isProcessAlive } = require('./src/utils/botUtils');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const appRoot = __dirname;

let botProcess = null;
let botLogs = [];
let botStartTime = null;

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
  botProcess = spawn('node', ['--max-old-space-size=192', 'index.js'], {
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
    execFile('node', ['src/registerSlashCommands.js'], { cwd: appRoot }, (error, stdout, stderr) => {
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

const { processTopggVote, verifyWebhookAuth } = require('./src/services/topgg');
const { verifyAndClaimBonus } = require('./src/services/bonusTimer');
const {
  OWNER_SNOWFLAKE,
  isIpAllowed,
  verifyMagicToken,
  isValidAdminSession,
  isMasterSecretValid,
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1d',
}));

const OFFICIAL_APP_EMOJIS = {
  wings: { name: 'pinkeing', id: '1548444149785694238', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444149785694238.gif' },
  wings_purple: { name: '9194purplewing', id: '1551356206684307556', animated: false, url: 'https://cdn.discordapp.com/emojis/1551356206684307556.png' },
  butterfly: { name: '5056purplebutterfly', id: '1551355688612143134', animated: true, url: 'https://cdn.discordapp.com/emojis/1551355688612143134.gif' },
  fairy: { name: 'fairy', id: '1548443951596306552', animated: false, url: 'https://cdn.discordapp.com/emojis/1548443951596306552.png' },
  tree: { name: 'emojitree38', id: '1548443941144109181', animated: true, url: 'https://cdn.discordapp.com/emojis/1548443941144109181.gif' },
  portal: { name: 'portalframe98', id: '1548444170488778954', animated: true, url: 'https://cdn.discordapp.com/emojis/1548444170488778954.gif' },
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

// 0. Redirecionamentos amigáveis oficiais da Pyxie
app.get('/invite', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID || '1543650200718155897';
  res.redirect(`https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`);
});

app.get('/discord', (req, res) => {
  res.redirect('https://discord.gg/b3uZK3ssfX');
});

app.get('/vote', (req, res) => {
  const botId = process.env.TOPGG_BOT_ID || '1453888365618270331';
  res.redirect(`https://top.gg/bot/${botId}/vote`);
});

app.get('/wiki', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wiki.html'));
});

// 1. Healthcheck e status público
app.get('/api/status', (req, res) => {
  res.json(getBotStatus());
});

// 1.1 Emojis oficiais da aplicação (Discord Dev Portal)
app.get('/api/emojis', (req, res) => {
  res.json({
    success: true,
    emojis: OFFICIAL_APP_EMOJIS,
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

// 3. Painel Administrativo do Proprietário (Restrito a IP Allowlist e Snowflake 214153735281180673)
app.get('/admin', (req, res) => {
  const tokenParam = req.query.token;
  if (tokenParam) {
    const verifyResult = verifyMagicToken(tokenParam);
    if (verifyResult.valid) {
      res.setHeader('Set-Cookie', `pyxie_admin_session=${verifyResult.sessionToken}; HttpOnly; SameSite=Lax; Max-Age=43200; Path=/`);
      return res.redirect('/admin');
    }
  }

  const sessionCookie = getCookie(req, 'pyxie_admin_session');
  const hasValidSession = sessionCookie && isValidAdminSession(sessionCookie);

  if (!hasValidSession && !isIpAllowed(req)) {
    return res.status(403).send(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden • Pyxie</title>
  </head>
  <body style="background:#090514;color:#ef4444;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;">
    <div style="text-align:center;max-width:440px;padding:32px;border:1px solid rgba(239,68,68,0.3);border-radius:20px;background:#130b24;box-shadow:0 10px 40px rgba(0,0,0,0.6);">
      <div style="font-size:48px;margin-bottom:12px;">🛡️</div>
      <h1 style="font-size:24px;margin-bottom:8px;color:#ffffff;">403 Forbidden</h1>
      <p style="color:#cbd5e1;font-size:14px;line-height:1.5;">Acesso restrito exclusivamente ao proprietário autorizado da Pyxie.</p>
    </div>
  </body>
</html>`);
  }

  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
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

  const SLOT_METADATA = {
    phantom_coin: { title: 'Phantom Coins', fallback: '👻', category: 'economy', themeKey: 'coins' },
    coins: { title: 'Moedas Gerais da Pyxie', fallback: '🪙', category: 'economy', themeKey: 'coins' },
    magic_bean: { title: 'Feijões Mágicos (Bônus & Loja)', fallback: '🌱', category: 'economy', themeKey: 'dailyBonus' },
    vigor_energy: { title: 'Energia & Stamina (Penumbra)', fallback: '⚡', category: 'gloom', themeKey: null },
    tarot_card: { title: 'Carta de Tarot (Místico)', fallback: '🔮', category: 'gloom', themeKey: 'tarot' },
    tarotAlbum: { title: 'Álbum de Tarot (Coleção)', fallback: '📖', category: 'gloom', themeKey: 'tarotAlbum' },
    ship_heart: { title: 'Coração de Ship & Romance', fallback: '💖', category: 'gloom', themeKey: 'ship' },
    grimorio: { title: 'Grimório & Alquimia', fallback: '📖', category: 'gloom', themeKey: 'grimorio' },
    relic_t1: { title: 'Relíquia Tier 1 (Comum)', fallback: '🪨', category: 'gloom', themeKey: null },
    relic_t2: { title: 'Relíquia Tier 2 (Incomum)', fallback: '🌿', category: 'gloom', themeKey: null },
    relic_t3: { title: 'Relíquia Tier 3 (Rara)', fallback: '💎', category: 'gloom', themeKey: null },
    relic_t4: { title: 'Relíquia Tier 4 (Épica)', fallback: '🔮', category: 'gloom', themeKey: null },
    relic_t5: { title: 'Relíquia Tier 5 (Lendária)', fallback: '👑', category: 'gloom', themeKey: null },
    userProfile: { title: 'Badge de Perfil do Usuário', fallback: '👤', category: 'system', themeKey: 'userProfile' },
    websiteHome: { title: 'Logo & Ícone Home do Site', fallback: '🦋', category: 'system', themeKey: 'websiteHome' },
    helpCommands: { title: 'Ajuda & Comandos do Site', fallback: '📖', category: 'system', themeKey: 'helpCommands' },
    dice: { title: 'Dado & Minigames de Sorte', fallback: '🎲', category: 'system', themeKey: 'dice' },
    status_success: { title: 'Indicador de Sucesso (OK)', fallback: '✅', category: 'system', themeKey: null },
    status_fail: { title: 'Indicador de Erro / Falha', fallback: '❌', category: 'system', themeKey: null }
  };

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
      <input type="text" id="searchInput" class="search-input" placeholder="🔍 Filtrar slots por nome (ex: coin, tarot, relic)..." />
      <button class="cat-btn active" data-cat="all">Todos os Slots</button>
      <button class="cat-btn" data-cat="economy">💰 Economia</button>
      <button class="cat-btn" data-cat="gloom">🔮 Santuário / RPG</button>
      <button class="cat-btn" data-cat="system">⚙️ Sistema</button>
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

  const SLOT_METADATA = {
    phantom_coin: { themeKey: 'coins' },
    coins: { themeKey: 'coins' },
    magic_bean: { themeKey: 'dailyBonus' },
    tarot_card: { themeKey: 'tarot' },
    tarotAlbum: { themeKey: 'tarotAlbum' },
    ship_heart: { themeKey: 'ship' },
    grimorio: { themeKey: 'grimorio' },
    userProfile: { themeKey: 'userProfile' },
    websiteHome: { themeKey: 'websiteHome' },
    helpCommands: { themeKey: 'helpCommands' },
    dice: { themeKey: 'dice' },
  };

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
  } catch (err) {
    console.error('Error syncing themeEmojis.json:', err);
  }

  const redirectToken = token ? `?token=${encodeURIComponent(token)}&saved=true` : '?saved=true';
  return res.redirect(`/admin/emojis${redirectToken}`);
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
    const crypto = require('node:crypto');
    const sessionToken = crypto.randomBytes(32).toString('hex');
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
app.get('/bonus', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bonus.html'));
});

app.post('/api/bonus/claim', (req, res) => {
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

app.get('/api/logs', requireAdminAuth, (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  res.json({ logs: getLogs(limit) });
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

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(PORT, HOST, () => {
  const publicUrl = process.env.PANEL_PUBLIC_URL || `http://pyxie.duckdns.org:${PORT}`;
  addLog(`Painel web da Pyxie iniciado em ${publicUrl}`);
  console.log(`Painel da Pyxie rodando em ${publicUrl}`);
  startBot();
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return socket.destroy();
  }
  socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

function handleServerShutdown() {
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

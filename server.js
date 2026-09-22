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

  const { FALLBACKS } = require('./src/utils/emojiResolver');
  const emojisPath = path.join(__dirname, 'src/data/emojis.json');
  let currentConfig = {};
  try {
    if (fs.existsSync(emojisPath)) {
      currentConfig = JSON.parse(fs.readFileSync(emojisPath, 'utf8'));
    }
  } catch (_) {}

  // Carregar catálogo de emojis da aplicação (JSON local ou Discord client)
  let appEmojis = [];
  try {
    const catalogPath = path.join(__dirname, 'src/data/discordAppEmojis.json');
    if (fs.existsSync(catalogPath)) {
      const raw = fs.readFileSync(catalogPath, 'utf8');
      const parsed = JSON.parse(raw);
      appEmojis = Array.isArray(parsed) ? parsed : (parsed.items || []);
    }
  } catch (_) {}

  const slots = Object.keys(FALLBACKS);
  const isSaved = req.query.saved === 'true';

  let rowsHtml = '';
  for (const slot of slots) {
    const fallback = FALLBACKS[slot] || '✨';
    const selectedId = currentConfig[slot] || '';

    const selectedEmojiObj = appEmojis.find(e => String(e.id) === String(selectedId));
    let previewHtml = `<span style="font-size:24px;">${fallback}</span>`;
    if (selectedId) {
      const ext = selectedEmojiObj?.animated ? 'gif' : 'png';
      const imgUrl = `https://cdn.discordapp.com/emojis/${selectedId}.${ext}`;
      previewHtml = `<img src="${imgUrl}" alt="${slot}" style="width:28px;height:28px;vertical-align:middle;" onerror="this.onerror=null;this.src='https://cdn.discordapp.com/emojis/${selectedId}.png';" />`;
    }

    let optionsHtml = `<option value="">Padrão (Unicode: ${fallback})</option>`;
    for (const e of appEmojis) {
      const isSelected = String(e.id) === String(selectedId) ? 'selected' : '';
      optionsHtml += `<option value="${e.id}" ${isSelected}>${e.name} (${e.id})</option>`;
    }

    rowsHtml += `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:12px;min-width:220px;">
          <div style="width:40px;height:40px;background:rgba(0,0,0,0.3);border-radius:8px;display:flex;align-items:center;justify-content:center;">
            ${previewHtml}
          </div>
          <div>
            <div style="font-weight:700;color:#8b5cf6;font-family:monospace;font-size:15px;">${slot}</div>
            <div style="font-size:12px;color:#94a3b8;">Fallback: ${fallback}</div>
          </div>
        </div>
        <div style="flex:1;min-width:240px;">
          <select name="${slot}" style="width:100%;background:#090514;color:#ffffff;border:1px solid rgba(139,92,246,0.4);border-radius:8px;padding:10px;font-size:14px;outline:none;">
            ${optionsHtml}
          </select>
        </div>
      </div>
    `;
  }

  const queryTokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
  const alertHtml = isSaved ? `
    <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#10b981;padding:12px 16px;border-radius:10px;margin-bottom:20px;font-weight:600;">
      ✅ Configuração de emojis salva com sucesso!
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel de Emojis • Pyxie Admin</title>
  <style>
    body { background: #1a1a1a; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; }
    .container { max-width: 800px; margin: 0 auto; background: #130b24; border: 1px solid rgba(139,92,246,0.3); border-radius: 16px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; color: #e60067; font-size: 24px; display: flex; align-items: center; gap: 10px; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 24px; }
    .btn-save { background: linear-gradient(135deg, #8b5cf6, #e60067); color: #fff; border: none; padding: 14px 28px; font-size: 16px; font-weight: 700; border-radius: 10px; cursor: pointer; width: 100%; margin-top: 16px; transition: transform 0.1s; }
    .btn-save:hover { opacity: 0.95; transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔮 Painel Visual de Mapeamento de Emojis</h1>
    <p>Vincule os slots visuais do bot Pyxie aos Application Emojis oficiais da sua aplicação Discord.</p>
    ${alertHtml}
    <form method="POST" action="/admin/emojis${queryTokenParam}">
      ${rowsHtml}
      <button type="submit" class="btn-save">💾 Salvar Configuração</button>
    </form>
  </div>
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

  const { FALLBACKS } = require('./src/utils/emojiResolver');
  const validSlots = Object.keys(FALLBACKS);
  const emojisData = {};

  for (const slot of validSlots) {
    emojisData[slot] = req.body && req.body[slot] ? String(req.body[slot]).trim() : '';
  }

  const dataPath = path.join(__dirname, 'src/data/emojis.json');
  fs.writeFileSync(dataPath, JSON.stringify(emojisData, null, 2), 'utf8');

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

const fs = require('node:fs');
const path = require('node:path');

const CONFIG_FILE = path.join(__dirname, '..', '..', 'data', 'webRoutesConfig.json');

const INITIAL_ROUTES = [
  // Páginas Públicas
  { id: 'home', path: '/', name: 'Página Inicial (Portal)', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'wiki', path: '/wiki', name: 'Grimório & Wiki', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'museu', path: '/museu', name: 'Museu Comunitário', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'parcerias', path: '/parcerias', name: 'Portal de Parcerias', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'bonus', path: '/bonus', name: 'Portal de Bônus Diário', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'evento', path: '/evento', name: 'Página de Evento Sazonal', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'cringelandia', path: '/cringelandia', name: 'Cringelândia Hub', type: 'public', enabled: true, httpStatus: 200 },
  { id: 'termos', path: '/termos', name: 'Termos de Serviço', type: 'legal', enabled: true, httpStatus: 200 },
  { id: 'privacidade', path: '/privacidade', name: 'Política de Privacidade', type: 'legal', enabled: true, httpStatus: 200 },

  { id: 'tarot_cards', path: '/tarot/cartas', name: 'Significado das 78 Cartas (índice)', type: 'public', enabled: true, httpStatus: 200 },

  // Redirecionamentos do funil de crescimento (contam a origem ?ref= em data/growthInvites.json)
  { id: 'invite', path: '/invite', name: 'Convite para Servidor (permissões mínimas)', type: 'public', enabled: true, httpStatus: 302 },
  { id: 'install', path: '/install', name: 'Instalação na Conta (User App)', type: 'public', enabled: true, httpStatus: 302 },
  { id: 'vote', path: '/vote', name: 'Voto no Top.gg (+feijão)', type: 'public', enabled: true, httpStatus: 302 },

  // Sub-Painéis Administrativos
  { id: 'admin_dashboard', path: '/admin', name: 'Console Master Admin', type: 'admin', enabled: true, httpStatus: 200 },
  { id: 'admin_emojis', path: '/admin/emojis', name: 'Mapeador Visual de Emojis', type: 'admin', enabled: true, httpStatus: 200 },
  { id: 'admin_shopee', path: '/api/admin/shopee', name: 'Gestor de Afiliados Shopee', type: 'admin', enabled: true, httpStatus: 200 },
  { id: 'admin_modules', path: '/api/admin/modules', name: 'Gestor de Módulos Dinâmicos', type: 'admin', enabled: true, httpStatus: 200 },

  // Subdomínios Externos / Pausados
  { id: 'sub_mary_pwa', path: 'mary.pyxie.com.br', name: 'Diário PWA (Mary)', type: 'subdomain', enabled: false, httpStatus: 503 },
];

let routeConfigState = {};
const routeHits = new Map();

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[webRoutesManager] Erro ao gravar webRoutesConfig.json:', err.message);
  }
}

function loadConfig() {
  routeConfigState = {};
  for (const r of INITIAL_ROUTES) {
    routeConfigState[r.id] = { ...r };
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (saved && typeof saved === 'object') {
        for (const [id, r] of Object.entries(saved)) {
          if (routeConfigState[id]) {
            routeConfigState[id].enabled = Boolean(r.enabled);
          } else {
            routeConfigState[id] = r;
          }
        }
      }
    }
  } catch (err) {
    console.warn('[webRoutesManager] Falha ao carregar configuração de rotas:', err.message);
  }
}

loadConfig();

/**
 * Retorna todos os nós de rotas e subdomínios para o mapa interativo
 */
function getEcosystemMap() {
  const routes = Object.values(routeConfigState).map((r) => {
    const hits = routeHits.get(r.id) || 0;
    return {
      ...r,
      hits,
      statusLabel: r.enabled ? 'Ativada 🟢' : 'Desativada/Pausada 🔴',
    };
  });

  return {
    routes,
    totalTracked: routes.length,
    activeCount: routes.filter((r) => r.enabled).length,
    pausedCount: routes.filter((r) => !r.enabled).length,
  };
}

/**
 * Alterna em tempo de execução o status de uma rota sem reiniciar a VM
 */
function toggleRoute(routeId, enabled) {
  if (!routeConfigState[routeId]) {
    throw new Error(`Rota ou subdomínio '${routeId}' não encontrado.`);
  }

  routeConfigState[routeId].enabled = Boolean(enabled);
  routeConfigState[routeId].httpStatus = enabled ? 200 : 503;
  safeAtomicWrite(CONFIG_FILE, routeConfigState);
  return routeConfigState[routeId];
}

/**
 * Registra visita a uma rota
 */
function recordRouteHit(routeId) {
  routeHits.set(routeId, (routeHits.get(routeId) || 0) + 1);
}

/**
 * Middleware Express para interceptar rotas e bloquear páginas pausadas
 */
function createRouteGateMiddleware() {
  return (req, res, next) => {
    const host = req.headers.host || '';
    const urlPath = req.path;

    // 1. Checa subdomínio mary.pyxie.com.br
    if (host.startsWith('mary.')) {
      const maryConfig = routeConfigState.sub_mary_pwa;
      if (!maryConfig || !maryConfig.enabled) {
        return res.status(503).send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="utf-8">
            <title>503 • Projeto Temporariamente Pausado</title>
            <style>
              body { background:#07040e; color:#fff; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; text-align:center; }
              .card { background:rgba(18,10,34,0.95); border:1px solid #8b5cf6; padding:30px; border-radius:18px; max-width:400px; }
              a { color:#ec4899; text-decoration:none; font-weight:bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>⏸️ Projeto Temporariamente Pausado</h2>
              <p>O Diário PWA está pausado para economia de recursos da VM.</p>
              <p><a href="https://pyxie.com.br">Ir para Pyxie Principal ➔</a></p>
            </div>
          </body>
          </html>
        `);
      }
    }

    // 2. Checa rotas públicas de pyxie.com.br
    for (const route of Object.values(routeConfigState)) {
      if (route.type === 'public' || route.type === 'legal') {
        if (urlPath === route.path) {
          recordRouteHit(route.id);
          if (!route.enabled) {
            return res.status(503).send(`
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="utf-8">
                <title>503 • Página Temporariamente Pausada</title>
                <style>
                  body { background:#07040e; color:#fff; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; text-align:center; }
                  .card { background:rgba(18,10,34,0.95); border:1px solid #f43f5e; padding:30px; border-radius:18px; max-width:440px; }
                  a { color:#8b5cf6; text-decoration:none; font-weight:bold; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h2>⏸️ Página em Manutenção</h2>
                  <p>A página <strong>${route.name}</strong> está temporariamente desativada pelo administrador.</p>
                  <p><a href="/">Voltar ao Início ➔</a></p>
                </div>
              </body>
              </html>
            `);
          }
        }
      }
    }

    next();
  };
}

module.exports = {
  getEcosystemMap,
  toggleRoute,
  createRouteGateMiddleware,
  recordRouteHit,
};


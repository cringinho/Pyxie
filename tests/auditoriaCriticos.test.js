// Testes dos itens críticos da auditoria (docs/auditoria): senha, XSS e cancelamento de plano.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-audit-'));
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-access-token';
delete process.env.MERCADOPAGO_WEBHOOK_SECRET;

console.log('🛡️ Testes dos críticos da auditoria (senha, XSS e plano)...');

const { escapeHtml, replaceKeep } = require('../src/utils/htmlEscape');

(async () => {
  // 1. Escape de HTML e troca segura (sem padrões "$1" vindos do usuário)
  assert.equal(escapeHtml(`"><script>alert('x')</script>&`), '&quot;&gt;&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;&amp;');
  assert.equal(
    replaceKeep('<meta property="og:title" content="old">', /(<meta\s+property=["']og:title["']\s+content=["'])[\s\S]*?(["']\s*\/?>)/i, '$1$&'),
    '<meta property="og:title" content="$1$&">',
  );
  console.log('  ✅ 1. escapeHtml e replaceKeep seguros.');

  // 2. "Esqueci a senha" não devolve o código e a troca derruba as sessões (Q261)
  const express = require('express');
  const accountStore = require('../src/modules/accounts/accountStore');
  const accountSessions = require('../src/services/accountSessions');
  const { createAccountRouter } = require('../src/routes/accountRoutes');
  const account = accountStore.createAccount({ email: 'vitima@example.com', password: 'senha-antiga-123' });
  const accountId = account.id || account.account?.id;
  assert.ok(accountId, 'Conta de teste criada');
  const oldCookie = accountSessions.createSession(accountId);
  accountSessions.createSession(accountId);
  assert.ok(accountSessions.readSession(oldCookie), 'Sessão existe antes da troca');

  const app = express();
  app.use(express.json());
  app.use('/', createAccountRouter());
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const forgot = await fetch(`${base}/api/auth/forgot-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'vitima@example.com' }),
    });
    const forgotBody = await forgot.json();
    assert.equal(forgotBody.success, true);
    assert.equal('token' in forgotBody, false, 'O código de redefinição nunca volta na resposta');
    assert.ok(!JSON.stringify(forgotBody).match(/[a-f0-9]{32,}/i), 'Nenhum código longo vaza na resposta');

    const token = accountStore.createPasswordResetToken('vitima@example.com');
    const reset = await fetch(`${base}/api/auth/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: 'senha-nova-456' }),
    });
    assert.equal(reset.status, 200);
    assert.equal(accountSessions.readSession(oldCookie), null, 'Sessões antigas caem depois da troca de senha');
  } finally {
    server.close();
  }
  console.log('  ✅ 2. Esqueci a senha sem código na resposta e sessões derrubadas.');

  // 3. Museu: texto da obra entra escapado no HTML (Q222/Q099)
  const { serveLocalizedPage } = require('../src/utils/seoRenderer');
  const evil = '</title><script>alert(1)</script>$1';
  fs.writeFileSync(
    path.join(process.env.PYXIE_DATA_DIR, 'museumData.json'),
    JSON.stringify({ arts: [{ id: 'art-x', description: evil, authorUsername: '"><img src=x onerror=alert(2)>' }] }),
  );
  const pub = path.join(__dirname, '..', 'public');
  const museumApp = express();
  museumApp.get('/museu', serveLocalizedPage('museum', pub));
  const mServer = await new Promise((resolve) => { const s = museumApp.listen(0, () => resolve(s)); });
  try {
    const html = await (await fetch(`http://127.0.0.1:${mServer.address().port}/museu?art=art-x`)).text();
    assert.ok(!html.includes('<script>alert(1)</script>'), 'Script da descrição não entra cru');
    assert.ok(!html.includes('<img src=x onerror=alert(2)>'), 'Autor não entra cru');
    assert.ok(html.includes('&lt;/title&gt;&lt;script&gt;'), 'Descrição aparece escapada no título');
  } finally {
    mServer.close();
  }
  console.log('  ✅ 3. Obra do Museu escapada no HTML.');

  // 4. /u/:userId aceita só ID numérico e escapa o que coloca no HTML (Q033/Q221)
  const serverSrc = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const uRoute = serverSrc.slice(serverSrc.indexOf("app.get('/u/:userId'"), serverSrc.indexOf("app.get('/api/profile/:userId'"));
  assert.ok(/\^\\d\{15,25\}\$/.test(uRoute), '/u/ valida o formato do ID antes de montar a página');
  assert.ok(uRoute.includes('escapeHtml(title)') && uRoute.includes('escapeHtml(canonical)'), '/u/ escapa título e canonical');
  assert.ok(!/`\$1\$\{/.test(uRoute), '/u/ não usa "$1${...}" com dado de usuário');
  console.log('  ✅ 4. /u/ só aceita ID numérico e escapa o HTML.');

  // 5. Cancelar só para a renovação do cartão DESTE servidor; tempo pago fica (Q143/Q242)
  const plans = require('../src/services/guildPlans');
  const payments = require('../src/services/planPayments');
  const G = '1453890868980482090';
  const OTHER = '1557399041443111025';
  const calls = [];
  payments.setFetch(async (url, opts = {}) => {
    calls.push({ url: String(url), opts });
    if (String(url).endsWith('/preapproval')) {
      const ref = JSON.parse(opts.body).external_reference;
      const id = ref.includes(OTHER) ? 'pre-other' : 'pre-mine';
      return { ok: true, status: 200, text: async () => JSON.stringify({ id, init_point: 'https://mp/x', status: 'pending' }) };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  });
  plans.grantPlan(G, 'premium', { months: 1, source: 'test' });
  const paidUntil = plans.getPlan(G).paidUntil;
  assert.equal(payments.activeCardSubscription(G), null, 'Sem cartão, nada para cancelar');
  await payments.createCardSubscription({ guildId: OTHER, plan: 'basic' });
  assert.equal(payments.activeCardSubscription(G), null, 'Cartão de outro servidor nunca aparece aqui');
  await payments.createCardSubscription({ guildId: G, plan: 'premium' });
  const mine = payments.activeCardSubscription(G);
  assert.equal(mine.id, 'pre-mine');
  assert.equal(payments.guildPlanInfo(G).canCancelRenewal, true);
  const canceled = await payments.cancelCardSubscription(mine.id);
  assert.equal(canceled.ok, true);
  assert.equal(JSON.parse(calls.at(-1).opts.body).status, 'cancelled', 'Status que o Mercado Pago entende');
  assert.equal(payments.activeCardSubscription(G), null, 'Depois de cancelar não há renovação');
  assert.equal(plans.getPlan(G).active, true, 'Plano continua ativo até o fim do tempo pago');
  assert.equal(plans.getPlan(G).paidUntil, paidUntil, 'Cancelar não zera os dias pagos');
  assert.ok(payments.activeCardSubscription(OTHER), 'O outro servidor não foi afetado');

  const routesSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'dashboardRoutes.js'), 'utf8');
  const cancelRoute = routesSrc.slice(routesSrc.indexOf("'/api/dashboard/guilds/:guildId/plan/cancel'"));
  const cancelBody = cancelRoute.slice(0, cancelRoute.indexOf('router.', 10));
  assert.ok(cancelBody.includes("'guild_owner_only'"), 'Só o dono do servidor cancela');
  assert.ok(cancelBody.includes("'plan_lifetime'"), 'Vitalício é recusado');
  assert.ok(!cancelBody.includes('revokePlan'), 'Cancelar não apaga o plano pago');
  assert.ok(!cancelBody.includes('req.body?.preapprovalId'), 'Não aceita id de assinatura vindo do navegador');
  console.log('  ✅ 5. Cancelamento só para a renovação, do próprio servidor, sem apagar o pago.');

  // 6. Rotas antigas do dono: sem IP liberado, sem formulário escondido (Q263/Q267)
  process.env.PANEL_SECRET = 'panel-test-secret-only-for-ci';
  const panelSessions = require('../src/services/panelSessions');
  const { requireAdminAuth } = require('../src/services/adminAuth');
  const { OWNER_SNOWFLAKE } = require('../src/config/scopes');
  const ownerCookie = `${panelSessions.COOKIE_NAME}=${encodeURIComponent(panelSessions.createSession({ user: { id: OWNER_SNOWFLAKE, username: 'dono' }, guilds: [] }).cookieValue)}`;
  const otherCookie = `${panelSessions.COOKIE_NAME}=${encodeURIComponent(panelSessions.createSession({ user: { id: '700000000000000001', username: 'outra' }, guilds: [] }).cookieValue)}`;
  const adminApp = express();
  adminApp.use(express.urlencoded({ extended: true }));
  adminApp.use(express.json());
  adminApp.get('/api/admin/x', requireAdminAuth, (req, res) => res.json({ success: true }));
  adminApp.post('/api/admin/x', requireAdminAuth, (req, res) => res.json({ success: true }));
  const aServer = await new Promise((resolve) => { const srv = adminApp.listen(0, '127.0.0.1', () => resolve(srv)); });
  const aBase = `http://127.0.0.1:${aServer.address().port}`;
  try {
    // Pedido vindo de 127.0.0.1 (IP que antes liberava tudo) sem login: recusado.
    assert.equal((await fetch(`${aBase}/api/admin/x`, { method: 'POST' })).status, 401, 'IP local sozinho não entra');
    assert.equal((await fetch(`${aBase}/api/admin/x?token=panel-test-secret-only-for-ci`)).status, 401, 'Chave mestra na URL é recusada');
    // Formulário escondido de outro site: leva o cookie, mas não consegue mandar X-Pyxie-Panel.
    const csrf = await fetch(`${aBase}/api/admin/x`, {
      method: 'POST',
      headers: { Cookie: ownerCookie, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'enabled=false',
    });
    assert.equal(csrf.status, 403, 'Formulário sem o cabeçalho do painel é recusado');
    const ok = await fetch(`${aBase}/api/admin/x`, { method: 'POST', headers: { Cookie: ownerCookie, 'X-Pyxie-Panel': '1' } });
    assert.equal(ok.status, 200, 'Dono logado no painel com o cabeçalho entra');
    assert.equal((await fetch(`${aBase}/api/admin/x`, { headers: { Cookie: ownerCookie } })).status, 200, 'Leitura do dono não precisa do cabeçalho');
    assert.equal((await fetch(`${aBase}/api/admin/x`, { headers: { Cookie: otherCookie } })).status, 401, 'Outra pessoa logada não é dono');
    assert.equal((await fetch(`${aBase}/api/admin/x`, { method: 'POST', headers: { Authorization: 'Bearer panel-test-secret-only-for-ci' } })).status, 200, 'Máquina com a chave no cabeçalho entra');
  } finally {
    aServer.close();
  }
  const serverSrc2 = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const emojiRoute = serverSrc2.slice(serverSrc2.indexOf("app.post('/admin/emojis'"), serverSrc2.indexOf("app.post('/admin/emojis'") + 200);
  assert.ok(emojiRoute.includes('requireAdminAuth'), 'POST /admin/emojis usa a mesma proteção');
  assert.ok(!/isIpAllowed|req\.query\.token && isMasterSecretValid/.test(serverSrc2), 'server.js não libera por IP nem por chave na URL');
  const museumSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'modules', 'museum', 'museumManager.js'), 'utf8');
  assert.ok(!museumSrc.includes("req.headers['x-admin-token']"), 'Museu não aceita a chave mestra do navegador');
  const museumPage = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'pages', 'Museum.jsx'), 'utf8');
  assert.ok(!museumPage.includes("getItem('pyxie_admin_token')") && museumPage.includes("'X-Pyxie-Panel': '1'"), 'Página do Museu usa a sessão do painel');
  console.log('  ✅ 6. Rotas do dono exigem a sessão do painel e o cabeçalho anti-CSRF (sem IP nem chave na URL).');

  // 7. Cadastro não devolve o código de verificação do e-mail (Q262)
  const regApp = express();
  regApp.use(express.json());
  regApp.use('/', createAccountRouter());
  const rServer = await new Promise((resolve) => { const srv = regApp.listen(0, () => resolve(srv)); });
  try {
    const reg = await fetch(`http://127.0.0.1:${rServer.address().port}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'outra-pessoa@example.com', password: 'senha-forte-123' }),
    });
    const regBody = await reg.json();
    assert.equal(regBody.success, true);
    assert.equal('verifyToken' in regBody, false, 'Código de verificação não volta na resposta');
  } finally {
    rServer.close();
  }
  console.log('  ✅ 7. Cadastro sem o código de verificação na resposta.');

  // 8. Widget embutível e vitrine Shopee escapada (Q277/Q269)
  const widgetRoute = serverSrc2.slice(serverSrc2.indexOf("app.get('/widget/card'"), serverSrc2.indexOf("app.get('/widget/card'") + 400);
  assert.ok(widgetRoute.includes("removeHeader('X-Frame-Options')") && widgetRoute.includes('frame-ancestors *'), 'Só o widget pode ser embutido');
  const cringe = fs.readFileSync(path.join(__dirname, '..', 'public', 'cringelandia.html'), 'utf8');
  const shopee = cringe.slice(cringe.indexOf('async function loadShopeeShowcase'), cringe.indexOf('async function loadShopeeShowcase') + 2600);
  assert.ok(shopee.includes('const title = esc(') && shopee.includes('const link = safeUrl(') && shopee.includes('const img = safeUrl('), 'Cards da Shopee escapam título e aceitam só https');
  console.log('  ✅ 8. Widget embutível e vitrine Shopee escapada.');

  // 9. Reembolso pelo painel só para o dono da Pyxie (Q245)
  const refundRoute = routesSrc.slice(routesSrc.indexOf("'/api/dashboard/global/payments/refund'"), routesSrc.indexOf("'/api/dashboard/global/payments/refund'") + 200);
  assert.ok(refundRoute.includes('requireSession, requireOwner'), 'Reembolso exige sessão e dono');
  console.log('  ✅ 9. Reembolso pelo painel exclusivo do dono.');

  console.log('🛡️ Críticos da auditoria: tudo certo.');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

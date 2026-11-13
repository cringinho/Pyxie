// A Pyxie saiu do público: nada é cobrado, servidores existentes ganham acesso vitalício,
// as chaves dão vitalício a quem o dono escolher e a Cringelândia é a página inicial.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🔑 Testes do acesso vitalício, sem cobrança e com a Cringelândia na página inicial...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-open-'));
delete process.env.PYXIE_PAYMENTS;
process.env.MERCADOPAGO_ACCESS_TOKEN = 'TEST-nao-liga-sozinho';

const root = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const plans = require('../src/services/guildPlans');
const addons = require('../src/services/guildAddons');
const planPayments = require('../src/services/planPayments');
const passPayments = require('../src/services/passPayments');
const legacy = require('../src/services/legacyLifetime');
const plansModule = require('../src/modules/plans');
const { SEO_CONFIG, getLocalizedHtml } = require('../src/utils/seoRenderer');

(async () => {
  // 1. Cobrança desligada: credencial sozinha não liga nada
  assert.equal(planPayments.paymentsEnabled(), false);
  assert.deepEqual(planPayments.providers(), { pix: false, card: false });
  assert.deepEqual(passPayments.providers(), { mercadopago: false });
  assert.equal((await planPayments.createPixCharge({ guildId: '700000000000000001', plan: 'premium' })).reason, 'unavailable');
  assert.equal((await planPayments.createCardSubscription({ guildId: '700000000000000001', plan: 'premium' })).reason, 'unavailable');
  const routes = read('src', 'routes', 'dashboardRoutes.js');
  assert.equal((routes.match(/error: 'payments_disabled'/g) || []).length, 2, 'checkout de plano e de extra respondem 410');
  console.log('  ✅ 1. Cobrança desligada (plano, extra e Passe).');

  // 2. Servidores existentes ganham vitalício uma única vez, sem sobrescrever o que já existe
  const A = '700000000000000011';
  const B = '700000000000000012';
  const KEEP = '700000000000000013';
  plans.grantPlan(KEEP, 'premium', { lifetime: true, source: 'owner' });
  const first = legacy.run([A, B, KEEP, 'lixo'], { now: 1_000 });
  assert.deepEqual(first.granted.sort(), [A, B, KEEP].sort());
  for (const id of [A, B]) {
    const p = plans.getPlan(id);
    assert.equal(p.active && p.lifetime, true, 'vitalício ativo');
    assert.equal(p.source, 'legacy');
    assert.equal(addons.isActive(id, 'lojinha'), true, 'Estúdio de Loja incluso');
  }
  assert.equal(plans.getPlan(KEEP).plan, 'premium', 'plano existente não é rebaixado');
  assert.equal(plans.getPlan(KEEP).source, 'owner');
  assert.equal(legacy.run(['700000000000000099'], { now: 2_000 }).skipped, true, 'só roda uma vez');
  assert.equal(plans.getPlan('700000000000000099').active, false, 'servidor novo depois da migração precisa de chave');
  console.log('  ✅ 2. Migração única: vitalício para quem já tinha a Pyxie.');

  // 3. O módulo só migra com o gateway pronto
  const notReady = { isReady: () => false, guilds: { cache: new Map([['700000000000000021', {}]]) } };
  assert.equal(plansModule.migrateLegacy(notReady), null);
  console.log('  ✅ 3. Migração espera o cliente do Discord ficar pronto.');

  // 4. Site: Cringelândia na raiz, sem páginas de plano/Passe, sem convite do bot
  assert.equal(SEO_CONFIG.index.file, 'cringelandia.html');
  assert.equal(SEO_CONFIG.index.canonical, 'https://pyxie.com.br/');
  for (const gone of ['plans', 'pass', 'cringelandia']) assert.equal(SEO_CONFIG[gone], undefined, `${gone} saiu do SEO_CONFIG`);
  for (const file of ['planos.html', 'planos.en.html', 'passe.html', 'index.html']) {
    assert.equal(fs.existsSync(path.join(root, 'public', file)), false, `${file} removido`);
  }
  const server = read('server.js');
  assert.ok(server.includes("app.get(['/invite', '/install', '/vote'], goHome)"), 'convite do bot só redireciona');
  assert.ok(server.includes("'/planos', '/passe', '/pass', '/plans'"), 'planos e Passe redirecionam');
  assert.ok(server.includes("app.get('/', serveLocalizedPage('index', publicDir))"));
  const sitemap = read('public', 'sitemap.xml');
  for (const gone of ['/planos', '/passe', '/en/plans', '/en/pass', '/cringelandia']) {
    assert.ok(!sitemap.includes(`<loc>https://pyxie.com.br${gone}</loc>`), `sitemap sem ${gone}`);
  }
  console.log('  ✅ 4. Cringelândia na raiz; planos, Passe e convite do bot fora do site.');

  // 5. Links importantes na página inicial, nos dois idiomas
  const pt = getLocalizedHtml('index', 'pt', path.join(root, 'public'));
  const en = getLocalizedHtml('index', 'en', path.join(root, 'public'));
  for (const href of ['/discord?ref=cringelandia-links', 'https://www.roblox.com/share/g/35473881', '/promo', '/hyperfokus', '/wiki', '/museu', '/tarot', '/bonus', '/mercado', '/parcerias', '/pais-e-profissionais', '/transparencia', '/termos', '/privacidade', 'mailto:cringe.support@gmail.com']) {
    assert.ok(pt.includes(`href="${href}"`), `link importante ${href}`);
  }
  assert.ok(/id="links"/.test(pt) && /id="links"/.test(en));
  const dict = (lang) => pt.split(`${lang}: {`)[1] || '';
  for (const key of ['links.title', 'links.discord.t', 'links.roblox.d', 'links.shopee.t', 'nav.links']) {
    const matches = pt.match(new RegExp(`'${key.replace(/\./g, '\\.')}':`, 'g')) || [];
    assert.equal(matches.length, 2, `${key} existe em PT e EN`);
  }
  assert.ok(dict('pt').length > 0);
  assert.ok(!/\/(install|invite)\?/.test(pt), 'sem convite do bot na página');
  assert.ok(!/R\$\s*\d/.test(pt.replace(/<script[\s\S]*?<\/script>/gi, '')), 'sem preço na página');
  console.log('  ✅ 5. Links importantes (Discord, Roblox, Shopee, blog, site e contato) em PT/EN.');

  console.log('🔑 Acesso vitalício: tudo certo.');
})().catch((err) => {
  console.error('❌ Falha nos testes do acesso vitalício:', err);
  process.exit(1);
});

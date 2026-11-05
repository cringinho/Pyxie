// Auditoria do site (grupo A1: Home, páginas institucionais e Wiki).
// Cobre os itens de lógica e segurança: status público sem dados pessoais, catálogo com
// recarga/permissão reais, utilitários do catálogo e idioma por URL, e as páginas
// institucionais (comando de exclusão certo, consentimento antes do Google, linhas de ajuda).
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

(async () => {
  // Q020: /api/status e /api/stats só devolvem agregados (nunca a lista de IDs).
  const { buildPublicStatus, buildPublicStatsBody } = require('../src/services/publicStats');
  const ids = '214153735281180673,123456789012345678,987654321098765432';
  const input = {
    running: true,
    startTime: 1000,
    now: 61000,
    stats: { commandsExecuted: 5, messagesProcessed: 9, usersEngaged: 3, totalMembers: 7, uniqueUsers: ids },
  };
  const pub = buildPublicStatus(input);
  const body = buildPublicStatsBody(input);
  for (const out of [pub, body]) {
    const json = JSON.stringify(out);
    assert.ok(!json.includes('214153735281180673'), 'status público não pode expor IDs do Discord');
    assert.ok(!('uniqueUsers' in out) && !('uniqueUsers' in (out.stats || {})), 'sem o campo uniqueUsers');
    assert.ok(!('logs' in out) && !('pid' in out) && !('welcomeChannelId' in out), 'sem logs, PID ou canais');
  }
  assert.strictEqual(pub.stats.uniqueUsersCount, 3);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.online, true);
  assert.strictEqual(body.uptime, 60000);
  assert.strictEqual(buildPublicStatus({ running: false, startTime: 1000, stats: {} }).uptime, 0, 'fora do ar não conta tempo no ar');
  const serverSrc = read('server.js');
  assert.ok(/app\.get\('\/api\/status'[\s\S]{0,80}buildPublicStatus\(/.test(serverSrc), '/api/status usa a versão pública');
  assert.ok(/app\.get\('\/api\/stats'[\s\S]{0,160}buildPublicStatsBody\(/.test(serverSrc), '/api/stats usa a versão pública');
  console.log('✅ Q020: /api/status e /api/stats públicos só com números agregados (sem IDs, logs ou PID).');

  // Q041/Q047: o catálogo envia desc, recarga real (só quando o comando declara) e permissão.
  const { getHelpModules } = require('../src/commands/commandHelpers');
  const all = getHelpModules(null, { lang: 'pt' }).flatMap((m) => m.commands || []);
  const byName = (n) => all.find((c) => c.name === n);
  assert.ok(all.length > 0 && all.every((c) => typeof c.desc === 'string' && c.desc.length > 0), 'todo comando tem desc');
  assert.strictEqual(byName('/py-daily').cooldownSeconds, 24 * 3600, 'daily recarrega em 24 h');
  assert.strictEqual(byName('/py-work').cooldownSeconds, 3 * 3600, 'work recarrega em 3 h');
  assert.strictEqual(byName('/py-ping').cooldownSeconds, null, 'sem recarga declarada: null (o site esconde)');
  assert.strictEqual(byName('/py-warn').permission, 'staff', 'comando com permissão do servidor aparece como staff');
  assert.strictEqual(byName('/py-daily').permission, 'everyone');
  console.log('✅ Q041/Q047: /api/commands com desc, recarga real e permissão de cada comando.');

  // Q043/Q044/Q049/Q050: utilitários do catálogo no site.
  const cmdUtils = await import(pathToFileURL(path.join(ROOT, 'client/src/utils/commands.js')).href);
  const daily = { name: '/py-daily', desc: 'Resgate seu bônus diário de moedas', aliases: ['daily', 'diario', 'py-diario', 'diaria', 'py-daily'], category: 'economia' };
  const ping = { name: '/py-ping', desc: 'Latência', aliases: ['ping'], category: 'utilidades' };
  assert.deepStrictEqual(cmdUtils.cleanAliases(daily), ['daily', 'diario', 'diaria'], 'apelidos sem py- e sem repetição');
  assert.ok(cmdUtils.matchesAnchor(ping, 'py-ping') && cmdUtils.matchesAnchor(ping, '#ping'), 'link direto abre /py-ping');
  assert.ok(!cmdUtils.matchesAnchor(ping, 'py-daily'));
  assert.ok(cmdUtils.matchesQuery(daily, 'diário'), 'busca ignora acentos');
  assert.ok(cmdUtils.matchesQuery(daily, 'moedas'), 'busca lê a descrição');
  assert.ok(cmdUtils.matchesQuery(daily, 'carreiras', 'Economia & Carreiras'), 'busca lê o rótulo da categoria');
  console.log('✅ Q043/Q044/Q049/Q050: busca, apelidos e links diretos do catálogo corretos.');

  // Q010: idioma pela URL e links já no caminho final.
  const loc = await import(pathToFileURL(path.join(ROOT, 'client/src/utils/localePath.js')).href);
  assert.strictEqual(loc.langFromPath('/en/wiki'), 'en');
  assert.strictEqual(loc.langFromPath('/wiki'), 'pt');
  assert.strictEqual(loc.langFromPath('/u/123'), null);
  assert.strictEqual(loc.localeHref('/museu', 'en'), '/en/museum');
  assert.strictEqual(loc.localeHref('/#pilares', 'en'), '/en/#pilares');
  assert.strictEqual(loc.localeHref('/cringelandia', 'pt'), '/cringelandia');
  assert.strictEqual(loc.localeHref('/hyperfokus', 'en'), '/hyperfokus?lang=en');
  assert.strictEqual(loc.switchLangHref({ pathname: '/en/terms', search: '?lang=en&x=1', hash: '#a' }, 'pt'), '/termos?x=1#a');
  console.log('✅ Q010: idioma da Home lido pela URL (/en/) e links direto para o caminho do idioma.');

  // Q006/Q048/Q058: nada de dado inventado no Museu, na prévia e na wiki.
  const museum = read('client/src/components/3d/MuseumScene.jsx');
  for (const fake of ['Pyxie Core', 'Melody Labs', 'Pixel Guild', 'defaultArts']) {
    assert.ok(!museum.includes(fake), `Museu sem artista inventado (${fake})`);
  }
  const preview = read('client/src/components/wiki/DiscordEmbedPreview.jsx');
  assert.ok(!preview.includes('+100 moedas') && !preview.includes('14:32'), 'prévia sem recompensa/horário inventados');
  const wiki = read('client/src/pages/Wiki.jsx');
  for (const bad of ['/py-suborno', '/py-casamento •', '/py-filho', '/py-divorcio', '/py-carteira', '37 comandos', '22 Vocações', '16 Vocações']) {
    assert.ok(!wiki.includes(bad), `wiki sem comando/número que não existe (${bad})`);
  }
  console.log('✅ Q006/Q048/Q057/Q058: Museu, prévia e wiki sem artistas, valores, números ou comandos inventados.');

  // Q024/Q026/Q034: Privacidade.
  const privacy = read('public/privacy.html');
  assert.ok(!privacy.includes('py-reseteco'), 'a Privacidade não manda usar o comando do dono');
  assert.ok((privacy.match(/\/py-privacy/g) || []).length >= 3, '/py-privacy no HTML e nos dois idiomas');
  const p3 = [...privacy.matchAll(/'sec3\.p3': '([^\n]*)',/g)].map((m) => m[1]);
  assert.strictEqual(p3.length, 2);
  for (const txt of p3) assert.ok(txt.includes('google.com/settings/ads') && txt.includes('aboutads.info'), 'links do Google nos dois idiomas');
  const gPages = ['index', 'wiki', 'bonus', 'tarot', 'museum', 'partnerships', 'cringelandia', 'u', 'privacy', 'terms', 'transparencia', 'pais-e-profissionais'];
  for (const name of gPages) {
    const html = read(`public/${name}.html`);
    const c = html.indexOf('/js/consent.js');
    assert.ok(c > 0, `${name}.html carrega o aviso de consentimento`);
    for (const g of ['googletagmanager.com/gtm.js', 'gtag/js', 'adsbygoogle.js']) {
      const at = html.indexOf(g);
      if (at >= 0) assert.ok(c < at, `${name}.html: consentimento antes de ${g}`);
    }
  }
  const consent = read('public/js/consent.js');
  assert.ok(/gtag\('consent', 'default'/.test(consent) && consent.includes("'denied'"), 'Consent Mode nega tudo por padrão');
  console.log('✅ Q024/Q026/Q034: Privacidade com /py-privacy, links do Google e consentimento antes do Analytics/AdSense.');

  // Q022/Q029/Q030/Q031/Q036: Termos e Para pais.
  const terms = read('public/terms.html');
  assert.ok(!terms.includes('cargos verificados') && !terms.includes('verified adults'), 'Termos não sugerem verificação de idade');
  assert.ok(terms.includes('mailto:contato@pyxie.com.br') && !terms.includes('ouvidoria oficial'), 'Termos com e-mail clicável');
  assert.ok(terms.includes('tel:188') && terms.includes('tel:+351213544545') && terms.includes('tel:100') && terms.includes('tel:180'), 'linhas de ajuda com um toque');
  assert.ok(/class="terms-toc"/.test(terms) && terms.includes('href="#secao-3"'), 'Termos com índice');
  assert.ok(terms.includes('datetime="2026-11-05"') && privacy.includes('datetime="2026-11-05"'), 'data de atualização nas duas páginas');
  const pais = read('public/pais-e-profissionais.html');
  assert.ok(pais.includes('tel:188') && pais.includes('https://cvv.org.br'), 'Para pais com CVV clicável');
  for (const name of ['terms', 'privacy', 'transparencia', 'pais-e-profissionais']) {
    const html = read(`public/${name}.html`);
    assert.ok(html.includes('/js/pageLang.js') && html.includes('PyxiePageLang'), `${name}.html usa a regra única de idioma`);
  }
  console.log('✅ Q022/Q025/Q027/Q029/Q030/Q031/Q036: Termos e Para pais honestos, com índice, data, contato e idioma por URL.');

  // Q023: 404/500 respeitam "reduzir movimento" e param com a aba escondida.
  for (const name of ['404', '500']) {
    const html = read(`public/${name}.html`);
    assert.ok(html.includes('prefers-reduced-motion') && html.includes('visibilitychange'), `${name}.html respeita reduzir movimento`);
  }
  assert.ok(!read('public/500.html').includes('já foram notificados'), '500 sem promessa de aviso que não existe');
  console.log('✅ Q023/Q038: páginas de erro com menos movimento e texto honesto.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

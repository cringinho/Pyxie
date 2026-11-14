// Portal (/), Pyxie Devs (/devs em EN, ES e PT) e a trava de escrita do Hyperfokus para membros da Cringelândia.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const { getLocalizedHtml, applyStaticI18n } = require('../src/utils/seoRenderer');
const { renderDevsPage, langFromPath, LANGS, COPY } = require('../src/site/devsPage');
const { linkFor, currentLinks } = require('../src/routes/siteRoutes');
const membership = require('../src/services/cringelandiaMembership');
const renderer = require('../src/modules/hyperfokus/renderer');

(async () => {
  console.log('🧭 [TEST] Portal, Pyxie Devs e trava de escrita do Hyperfokus...');

  // 1. Portal: tradução no servidor, sem dicionário vazando para o navegador
  const pt = getLocalizedHtml('index', 'pt', publicDir);
  const en = getLocalizedHtml('index', 'en', publicDir);
  assert.ok(!pt.includes('page-i18n') && !en.includes('page-i18n'), 'Dicionário embutido não vai para o navegador');
  assert.ok(pt.includes('Duas casas, <em>uma fada</em> de plantão.'), 'PT mantém o texto do arquivo');
  assert.ok(en.includes('Two homes, <em>one fairy</em> on duty.'), 'EN troca o título no servidor');
  assert.ok(en.includes('href="/devs"') && pt.includes('href="/devs/pt"'), 'Porta da Pyxie Devs no idioma certo');
  assert.ok(en.includes('href="/en/cringelandia"'), 'EN aponta para a Cringelândia em inglês');
  assert.ok(/data-lang="en"[^>]*aria-current="true"|aria-current="true"[^>]*data-lang="en"/.test(en), 'Seletor marca EN na página em inglês');
  assert.ok(!/\/install|\/invite/.test(pt), 'Portal não oferece instalar o bot (é privado)');
  assert.ok(pt.includes('188'), 'Portal mostra o CVV junto da comunidade de autoajuda');

  // Toda chave EN usada no HTML existe no dicionário
  const raw = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  const dict = JSON.parse(raw.match(/id="page-i18n">([\s\S]*?)<\/script>/)[1]).en;
  const keys = [...raw.matchAll(/data-i18n(?:-alt|-aria)?="([\w.-]+)"/g)].map((m) => m[1]);
  keys.forEach((k) => assert.ok(Object.prototype.hasOwnProperty.call(dict, k), `Chave EN faltando no portal: ${k}`));
  assert.equal(applyStaticI18n('<p>sem dicionário</p>', 'en'), '<p>sem dicionário</p>', 'Página sem dicionário passa intacta');
  console.log('  ✅ 1. Portal PT/EN traduzido no servidor.');

  // 2. Pyxie Devs: inglês primeiro, espanhol e português, sem comunidades brasileiras
  assert.equal(langFromPath('/devs'), 'en');
  assert.equal(langFromPath('/devs/es'), 'es');
  assert.equal(langFromPath('/devs/pt/'), 'pt');
  const ptKeys = Object.keys(COPY.pt).sort().join();
  ['en', 'es'].forEach((l) => assert.equal(Object.keys(COPY[l]).sort().join(), ptKeys, `Mesmas chaves em ${l}`));
  for (const lang of Object.keys(LANGS)) {
    const html = renderDevsPage({ lang, links: {} });
    assert.ok(html.includes(`<html lang="${LANGS[lang].htmlLang}">`), `${lang}: lang do html`);
    assert.ok(html.includes(`<link rel="canonical" href="https://pyxie.com.br${LANGS[lang].path}" />`), `${lang}: canonical`);
    ['en', 'es', 'pt-BR', 'x-default'].forEach((h) => assert.ok(html.includes(`hreflang="${h}"`), `${lang}: hreflang ${h}`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${lang}: um h1`);
    (html.match(/<img\s[^>]*>/g) || []).forEach((tag) => assert.ok(/alt="[^"]+"/.test(tag), `${lang}: img sem alt ${tag}`));
    assert.ok(/application\/ld\+json/.test(html), `${lang}: JSON-LD`);
    assert.ok(!/cringel|hyperfokus|brasil|brazil|cvv|\/discord\?ref/i.test(html), `${lang}: nada das comunidades brasileiras`);
    assert.ok(html.includes('aria-disabled="true"'), `${lang}: sem link configurado, botão fica "em breve"`);
  }
  const withLinks = renderDevsPage({ lang: 'es', links: { discord: 'https://discord.gg/x', roblox: 'https://www.roblox.com/communities/1' } });
  assert.ok(withLinks.includes('href="/devs/discord?from=es"') && withLinks.includes('href="/devs/roblox?from=es"'), 'Com links, botões apontam para as saídas');
  console.log('  ✅ 2. Pyxie Devs em EN/ES/PT, separada da Cringelândia.');

  // 3. Saídas só para o domínio certo
  assert.equal(linkFor('discord', { PYXIE_DEVS_DISCORD_INVITE: 'https://discord.gg/abc' }), 'https://discord.gg/abc');
  assert.equal(linkFor('discord', { PYXIE_DEVS_DISCORD_INVITE: 'https://evil.example/discord.gg' }), null);
  assert.equal(linkFor('discord', { PYXIE_DEVS_DISCORD_INVITE: 'http://discord.gg/abc' }), null);
  assert.equal(linkFor('roblox', { PYXIE_DEVS_ROBLOX_URL: 'https://www.roblox.com/communities/123/pyxie-devs' }), 'https://www.roblox.com/communities/123/pyxie-devs');
  assert.equal(linkFor('roblox', { PYXIE_DEVS_ROBLOX_URL: 'javascript:alert(1)' }), null);
  assert.deepEqual(currentLinks({}), { discord: null, roblox: null });
  console.log('  ✅ 3. Links da Pyxie Devs validados por domínio.');

  // 4. Hyperfokus: só membro da Cringelândia escreve
  membership.clearCache();
  const member = { discordUserId: '123456789012345678' };
  const calls = [];
  const bridge = (answer) => ({ request: async (type, payload) => { calls.push([type, payload]); if (answer instanceof Error) throw answer; return answer; } });

  assert.deepEqual(await membership.checkWriter({ email: 'a@b.c' }, bridge({ inGuild: true })), { ok: false, reason: 'discord_not_linked' });
  assert.deepEqual(await membership.checkWriter(member, bridge({ inGuild: true, botInGuild: true })), { ok: true });
  assert.equal(calls[0][0], 'MEMBER_ACCESS');
  assert.equal(calls[0][1].guildId, membership.CRINGELANDIA_GUILD_ID);
  // Resposta fica em cache: a segunda pergunta não vai ao bot
  await membership.checkWriter(member, bridge({ inGuild: false, botInGuild: true }));
  assert.equal(calls.length, 1, 'Membro confirmado fica em cache');

  membership.clearCache();
  assert.deepEqual(await membership.checkWriter(member, bridge({ inGuild: false, botInGuild: true })), { ok: false, reason: 'not_member' });
  membership.clearCache();
  assert.deepEqual(await membership.checkWriter(member, bridge(new Error('bridge_offline'))), { ok: false, reason: 'membership_unavailable' });
  assert.deepEqual(await membership.checkWriter(member, null), { ok: false, reason: 'membership_unavailable' });
  assert.deepEqual(await membership.checkWriter(member, bridge({ inGuild: false, botInGuild: false })), { ok: false, reason: 'membership_unavailable' });

  // Middleware devolve 403 com o motivo
  membership.clearCache();
  const mw = membership.requireCringelandiaWriter(bridge({ inGuild: false, botInGuild: true }));
  let status = 0; let body = null; let nextCalled = false;
  await mw({ account: member }, { status(s) { status = s; return this; }, json(b) { body = b; return this; } }, () => { nextCalled = true; });
  assert.equal(status, 403); assert.equal(body.error, 'not_member'); assert.equal(nextCalled, false);
  membership.clearCache();
  const mwOk = membership.requireCringelandiaWriter(bridge({ inGuild: true, botInGuild: true }));
  await mwOk({ account: member }, {}, () => { nextCalled = true; });
  assert.ok(nextCalled, 'Membro passa pela trava');

  // Portão do editor, nos dois idiomas
  for (const lang of ['pt', 'en']) {
    for (const reason of ['discord_not_linked', 'not_member', 'membership_unavailable']) {
      const html = renderer.renderWriterGatePage({ reason, lang });
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `Portão ${reason}/${lang}: um h1`);
      assert.ok(html.includes('noindex'), 'Portão fora dos buscadores');
    }
  }
  assert.ok(renderer.renderWriterGatePage({ reason: 'not_member' }).includes('/discord?ref=blog'), 'Portão leva para a Cringelândia');
  assert.ok(renderer.renderWriterGatePage({ reason: 'discord_not_linked', lang: 'en' }).includes('/auth/discord?next='), 'Portão pede login com Discord');

  // As rotas de escrita usam a trava
  const accountSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'routes', 'accountRoutes.js'), 'utf8');
  ["router.post('/api/hyperfokus/web-drafts', requireAuth, requireWriter", "router.put('/api/hyperfokus/web-drafts/:id', requireAuth, requireWriter", "router.post('/api/hyperfokus/web-drafts/:id/submit', requireAuth, requireWriter"]
    .forEach((sig) => assert.ok(accountSrc.includes(sig), `Rota de escrita sem trava: ${sig}`));
  console.log('  ✅ 4. Escrita no Hyperfokus só para membros da Cringelândia.');

  console.log('✅ Portal, Pyxie Devs e Hyperfokus: OK');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

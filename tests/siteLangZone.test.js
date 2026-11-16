const assert = require('node:assert');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  console.log('Verificando idioma padrão por zona do site...');
  const { resolveInitialLang, defaultLangFor } = await import(pathToFileURL(path.join(__dirname, '../client/src/utils/zone.js')).href);
  const store = (v) => ({ getItem: () => v });
  const loc = (pathname, search = '') => ({ pathname, search });

  // Portal Pyxie: inglês por padrão. Ecossistema Cringelândia: PT-BR por padrão.
  for (const p of ['/', '/wiki', '/bonus', '/en/wiki']) assert.strictEqual(defaultLangFor(p), 'en', p);
  for (const p of ['/cringelandia', '/museu', '/parcerias', '/hyperfokus/post', '/mercado', '/passe', '/en/museum']) {
    assert.strictEqual(defaultLangFor(p), 'pt', p);
  }
  // Prioridade: ?lang > prefixo /en > escolha salva > zona.
  assert.strictEqual(resolveInitialLang(loc('/', '?lang=pt'), store('en')), 'pt');
  assert.strictEqual(resolveInitialLang(loc('/en/museu'), store('pt')), 'en');
  assert.strictEqual(resolveInitialLang(loc('/wiki'), store('pt')), 'pt');
  assert.strictEqual(resolveInitialLang(loc('/wiki'), store(null)), 'en');
  assert.strictEqual(resolveInitialLang(loc('/museu'), store(null)), 'pt');
  assert.strictEqual(resolveInitialLang(loc('/wiki'), { getItem: () => { throw new Error('bloqueado'); } }), 'en');
  console.log('✔ Idioma por zona ok.');
})().catch((e) => { console.error(e); process.exit(1); });

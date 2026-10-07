const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🧪 [TEST] Museu & Parcerias...');

// Isola a persistência (managers usam process.cwd()/data)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-mp-'));
const repo = path.join(__dirname, '..');
process.chdir(tmp);

const { CATEGORY_SCHEMAS, pick } = require(path.join(repo, 'src/modules/partnerships/formSchemas'));
const partnershipManager = require(path.join(repo, 'src/modules/partnerships/partnershipManager'));
const museumManager = require(path.join(repo, 'src/modules/museum/museumManager'));
const museumModule = require(path.join(repo, 'src/modules/museum'));
const partnershipsModule = require(path.join(repo, 'src/modules/partnerships'));
const { COMMAND_CATEGORY_MAP } = require(path.join(repo, 'src/commands/commandHelpers'));

(async () => {
  // 1. Esquemas: 9 categorias, limites do Discord, pares PT/EN
  assert.equal(Object.keys(CATEGORY_SCHEMAS).length, 9);
  for (const [key, s] of Object.entries(CATEGORY_SCHEMAS)) {
    assert.ok(s.fields.length >= 1 && s.fields.length <= 5, `${key}: máx. 5 campos por modal`);
    for (const lang of ['pt', 'en']) {
      assert.ok(pick(s.title, lang) && pick(s.title, lang).length <= 45, `${key}: título ${lang} <= 45`);
      assert.ok(pick(s.label, lang), `${key}: label ${lang}`);
      for (const f of s.fields) {
        assert.ok(pick(f.label, lang).length <= 45, `${key}.${f.id}: label ${lang} <= 45 (${pick(f.label, lang).length})`);
        assert.ok(pick(f.placeholder, lang).length <= 100, `${key}.${f.id}: placeholder ${lang} <= 100`);
      }
    }
  }
  console.log('  ✅ 1. Esquemas bilíngues dentro dos limites do Discord.');

  // 2. Módulos e comandos: localização, aliases PT/EN e catalogação
  for (const mod of [museumModule, partnershipsModule]) {
    assert.ok(mod.id && mod.name['pt-BR'] && mod.name.en && mod.description['pt-BR'] && mod.description.en);
    for (const cmd of mod.commands) {
      const json = cmd.data.toJSON();
      assert.ok(json.description && json.description_localizations?.['pt-BR'], `${json.name}: descrição pt-BR`);
      for (const opt of json.options || []) assert.ok(opt.description_localizations?.['pt-BR'], `${json.name}.${opt.name}: opção pt-BR`);
      for (const n of [json.name, ...cmd.aliases]) assert.equal(COMMAND_CATEGORY_MAP[n], 'social', `${n} fora de COMMAND_CATEGORY_MAP`);
    }
  }
  const parceria = partnershipsModule.commands[0];
  assert.ok(parceria.aliases.includes('parceria') && parceria.aliases.includes('partner'));
  assert.ok(museumModule.commands[0].aliases.includes('museu') && museumModule.commands[0].aliases.includes('museum'));
  console.log('  ✅ 2. Comandos localizados, com aliases PT/EN e catalogados.');

  // 3. Museu: persistência, filtro e remoção
  museumManager.refresh();
  museumManager.data.arts.unshift({ id: 'art_1', messageId: '1', channelId: '2', userId: '123456789012345678', cachedAuthor: 'Ana', originalAttachmentUrl: 'https://cdn.discordapp.com/x.png', description: 'x', createdAt: 1 });
  museumManager.saveData();
  assert.equal(museumManager.getCount(), 1);
  assert.equal(museumManager.editDescription('art_1', 'nova'), true);
  assert.equal(museumManager.deleteArt('art_1'), true);
  assert.equal(museumManager.deleteArt('art_1'), false);
  console.log('  ✅ 3. Museu: persistência atômica, edição e remoção.');

  // 4. Parcerias: bump com cooldown de 24h e catálogo sem dados privados
  partnershipManager.refresh();
  const now = Date.now();
  partnershipManager.data.approvedPartners.push(
    { id: 'p_old', userId: '999', categoryKey: 'youtube', macroCategory: 'creator', projectName: 'Canal', accessLink: 'https://y.tv', imageUrl: 'https://i/x.png', publicDesc: 'd', answers: { secret: 1 }, approvedAt: 1, lastBumpedAt: now - 25 * 3600 * 1000, bumpCount: 0 },
    { id: 'p_new', userId: '998', categoryKey: 'ong', macroCategory: 'ong', projectName: 'ONG', accessLink: 'https://o.org', imageUrl: 'https://i/y.png', publicDesc: 'd', approvedAt: 1, lastBumpedAt: now, bumpCount: 0 }
  );
  partnershipManager.saveData();

  const first = await partnershipManager.applyBump('p_old', 'en');
  assert.equal(first.success, true);
  const second = await partnershipManager.applyBump('p_old', 'pt');
  assert.equal(second.success, false);
  assert.equal(second.status, 429);
  assert.match(second.message, /Aguarde/);
  assert.equal((await partnershipManager.applyBump('nope', 'en')).status, 404);

  const cat = partnershipManager.getPartnershipCatalog();
  assert.equal(cat.catalog.length, 2);
  assert.ok(cat.mosaic.creator && cat.mosaic.ong);
  assert.equal(JSON.stringify(cat).includes('secret'), false, 'catálogo público não pode vazar respostas privadas');
  assert.equal(JSON.stringify(cat).includes('"userId"'), false, 'catálogo público não pode expor userId');
  console.log('  ✅ 4. Parcerias: bump 24h, localização da API e catálogo sanitizado.');

  // 5. Rate limit por IP (10 / 15 min)
  let blocked = false;
  for (let i = 0; i < 11; i++) blocked = partnershipManager.rateLimited('1.2.3.4');
  assert.equal(blocked, true);
  assert.equal(partnershipManager.rateLimited('5.6.7.8'), false);
  console.log('  ✅ 5. Rate limit por IP validado.');

  console.log('🎉 [TEST] Museu & Parcerias passaram com 100% de sucesso!');
  process.chdir(repo);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});


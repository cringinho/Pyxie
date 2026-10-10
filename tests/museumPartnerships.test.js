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

  // 6. Configuração Administrativa Modular (getConfig e saveConfig)
  partnershipManager.saveConfig({
    channels: {
      requestChannelId: 'req_123',
      modReviewChannelId: 'mod_123',
      publishedChannelId: 'pub_123',
    },
    roles: {
      adminRoleIds: ['role_1', 'role_2'],
    },
  });
  const partCfg = partnershipManager.getConfig();
  assert.equal(partCfg.channels.requestChannelId, 'req_123');
  assert.equal(partCfg.channels.modReviewChannelId, 'mod_123');
  assert.equal(partCfg.channels.publishedChannelId, 'pub_123');
  assert.deepEqual(partCfg.roles.adminRoleIds, ['role_1', 'role_2']);
  assert.equal(partnershipManager.isConfigured(), true);

  museumManager.saveConfig({
    artChannelId: 'art_chan_999',
    adminRoleIds: ['art_role_1'],
  });
  const musCfg = museumManager.getConfig();
  assert.equal(musCfg.artChannelId, 'art_chan_999');
  // 7. Harvester Histórico do Museu (Raspagem em Lotes Suaves)
  const fakeMessages = new Map([
    ['msg_100', { id: 'msg_100', channelId: 'art_chan_999', author: { id: 'user_1', bot: false, username: 'Alice' }, attachments: [{ url: 'https://cdn.discordapp.com/art1.png', contentType: 'image/png' }], createdTimestamp: 1000 }],
    ['msg_90', { id: 'msg_90', channelId: 'art_chan_999', author: { id: 'user_bot', bot: true, username: 'Bot' }, attachments: [{ url: 'https://cdn.discordapp.com/bot.png', contentType: 'image/png' }], createdTimestamp: 900 }],
    ['msg_80', { id: 'msg_80', channelId: 'art_chan_999', author: { id: 'user_2', bot: false, username: 'Bob' }, attachments: [{ url: 'https://cdn.discordapp.com/text.txt', contentType: 'text/plain' }], createdTimestamp: 800 }],
    ['msg_70', { id: 'msg_70', channelId: 'art_chan_999', author: { id: 'user_3', bot: false, username: 'Carol' }, attachments: [{ url: 'https://cdn.discordapp.com/art2.jpg', contentType: 'image/jpeg' }], createdTimestamp: 700 }],
  ]);

  let lastFetchOptions = null;
  museumManager.client = {
    channels: {
      async fetch(id) {
        if (id !== 'art_chan_999') return null;
        return {
          id,
          isTextBased: () => true,
          messages: {
            async fetch(options) {
              lastFetchOptions = options;
              return fakeMessages;
            },
          },
        };
      },
    },
  };

  const harvestRes1 = await museumManager.harvestBatch(10);
  assert.equal(harvestRes1.success, true);
  assert.equal(harvestRes1.added, 2); // Somente msg_100 e msg_70 (ignora bot e não-imagem)
  assert.equal(harvestRes1.completed, true); // Retornou menos do que safeLimit (10)

  const hStatus = museumManager.getHarvesterStatus();
  assert.equal(hStatus.completed, true);
  assert.equal(hStatus.totalScraped, 2);
  assert.equal(hStatus.oldestScrapedMessageId, 'msg_70');

  // Segunda chamada com completed = true não refaz busca
  const harvestRes2 = await museumManager.harvestBatch(10);
  assert.equal(harvestRes2.success, true);
  assert.equal(harvestRes2.added, 0);
  assert.equal(harvestRes2.completed, true);

  // 8. Exclusão de Parcerias por ID (Painel Administrativo)
  partnershipManager.data.approvedPartners.push({
    id: 'partner_to_delete',
    projectName: 'Projeto Teste Delete',
    categoryKey: 'bot',
    imageUrl: 'https://cdn.discordapp.com/x.png',
  });
  partnershipManager.saveData();

  assert.equal(partnershipManager.getApprovedPartners().some(p => p.id === 'partner_to_delete'), true);
  const deletedOk = partnershipManager.deleteApprovedPartner('partner_to_delete');
  assert.equal(deletedOk, true);
  assert.equal(partnershipManager.getApprovedPartners().some(p => p.id === 'partner_to_delete'), false);
  assert.equal(partnershipManager.deleteApprovedPartner('partner_to_delete'), false);
  console.log('  ✅ 8. Exclusão de parcerias por ID no painel administrativo validada.');

  // 9. Embed de Parceria com referência ao Mural Web e Contagem de Impulsos/Bumps
  const testPartner = {
    categoryKey: 'community',
    projectName: 'Comunidade Alpha',
    accessLink: 'https://discord.gg/alpha',
    publicDesc: 'Uma comunidade muito legal.',
    imageUrl: 'https://cdn.discordapp.com/banner.png',
    bumpCount: 7,
  };
  const ptEmbed = partnershipManager.buildPublicPartnerEmbed(testPartner, 'pt');
  const enEmbed = partnershipManager.buildPublicPartnerEmbed(testPartner, 'en');

  assert.ok(ptEmbed.data.description.includes('/parcerias'), 'Embed PT deve referenciar a aba pública /parcerias');
  assert.ok(ptEmbed.data.description.includes('7'), 'Embed PT deve exibir a contagem de impulsos');
  assert.ok(ptEmbed.data.description.includes('**Impulsos no Site:** 7'), 'Embed PT deve formatar os impulsos corretamente');
  assert.ok(enEmbed.data.description.includes('/parcerias'), 'Embed EN deve referenciar a aba pública /parcerias');
  assert.ok(enEmbed.data.description.includes('**Website Bumps:** 7'), 'Embed EN deve formatar os bumps corretamente');
  console.log('  ✅ 9. Embed de parcerias com link do mural web e streak de bumps validado.');

  // 10. Obrigatoriedade de README.md em todos os módulos
  const modulesDir = path.join(repo, 'src/modules');
  const moduleFolders = fs.readdirSync(modulesDir).filter((f) => fs.statSync(path.join(modulesDir, f)).isDirectory());
  for (const modFolder of moduleFolders) {
    const readmePath = path.join(modulesDir, modFolder, 'README.md');
    assert.ok(fs.existsSync(readmePath), `Módulo '${modFolder}' DEVE possuir um arquivo README.md`);
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    assert.ok(readmeContent.length > 50, `README.md de '${modFolder}' não pode estar vazio`);
  }
  console.log('  ✅ 10. Obrigatoriedade de README.md em 100% dos módulos validada.');

  // 11. Validação do Honeypot de Marca d'Água do Museu com Sharp
  const sampleArt = {
    id: 'test_art_honeypot_01',
    channelId: '123456789',
    messageId: '987654321',
    userId: '111222333',
    originalAttachmentUrl: '/assets/pyxie/pyxie_mascot.png',
  };
  const watermarked = await museumManager.getWatermarkedImage(sampleArt);
  assert.ok(watermarked, 'Watermarked image não pode ser nulo');
  assert.ok(watermarked.buffer instanceof Buffer, 'Watermarked buffer deve ser uma instância de Buffer');
  assert.ok(watermarked.buffer.length > 500, 'Watermarked buffer deve possuir tamanho plausível');
  assert.strictEqual(watermarked.contentType, 'image/webp', 'Formato final deve ser WebP de alta eficiência');
  assert.ok(museumManager.watermarkCache.has(sampleArt.id), 'Arte deve ser salva no cache de marca d\'água');

  // Valida retorno instantâneo do cache
  const cachedWatermark = await museumManager.getWatermarkedImage(sampleArt);
  assert.strictEqual(cachedWatermark.buffer, watermarked.buffer, 'Segunda chamada deve recuperar o buffer idêntico em memória');
  console.log('  ✅ 11. Honeypot de Marca d\'Água com Sharp e Cache LRU validados com sucesso.');

  console.log('🎉 [TEST] Museu & Parcerias passaram com 100% de sucesso!');
  process.chdir(repo);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});


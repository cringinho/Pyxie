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
const { generatePinterestRssXml, sanitizeDiscordText } = require(path.join(repo, 'src/services/feedGenerator'));

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

  // 8. Edição e Exclusão de Parcerias por ID (Painel Administrativo)
  partnershipManager.data.approvedPartners.push({
    id: 'partner_to_delete',
    projectName: 'Projeto Teste Delete',
    categoryKey: 'discord_community',
    macroCategory: 'community',
    accessLink: 'https://discord.gg/teste',
    publicDesc: 'Desc original',
    imageUrl: 'https://imgur.com/a/PWijFHG',
    publishedChannelId: 'pub_ch_1',
    publishedMessageId: 'pub_msg_1',
  });
  partnershipManager.saveData();

  let editedDiscordEmbed = null;
  partnershipManager.client = {
    channels: {
      async fetch(chId) {
        if (chId !== 'pub_ch_1') return null;
        return {
          messages: {
            async fetch(msgId) {
              if (msgId !== 'pub_msg_1') return null;
              return {
                async edit(payload) {
                  editedDiscordEmbed = payload.embeds?.[0] || null;
                },
              };
            },
          },
        };
      },
    },
  };

  const updRes = await partnershipManager.updateApprovedPartner('partner_to_delete', {
    imageUrl: 'https://i.imgur.com/zPJm4mt.jpeg',
    projectName: 'NYSS Atualizada',
  });
  assert.equal(updRes.ok, true);
  assert.equal(updRes.discordSynced, true);
  assert.equal(updRes.partner.imageUrl, 'https://i.imgur.com/zPJm4mt.jpeg');
  assert.equal(updRes.partner.projectName, 'NYSS Atualizada');
  assert.ok(editedDiscordEmbed, 'Deve editar o embed publicado no Discord quando atualizado pelo admin');
  assert.equal(editedDiscordEmbed.data.image.url, 'https://i.imgur.com/zPJm4mt.jpeg');

  const badImgRes = await partnershipManager.updateApprovedPartner('partner_to_delete', {
    imageUrl: 'not-a-valid-url',
  });
  assert.equal(badImgRes.ok, false);
  assert.equal(badImgRes.status, 400);
  partnershipManager.client = null;

  assert.equal(partnershipManager.getApprovedPartners().some(p => p.id === 'partner_to_delete'), true);
  const deletedOk = partnershipManager.deleteApprovedPartner('partner_to_delete');
  assert.equal(deletedOk, true);
  assert.equal(partnershipManager.getApprovedPartners().some(p => p.id === 'partner_to_delete'), false);
  assert.equal(partnershipManager.deleteApprovedPartner('partner_to_delete'), false);
  console.log('  ✅ 8. Edição (com sincronização no Discord) e exclusão de parcerias por ID no painel administrativo validadas.');


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

  // 11. Validação do Honeypot de Marca d'Água do Museu com Sharp e Persistência em Disco
  const sampleArt = {
    id: 'test_art_honeypot_01',
    channelId: '123456789',
    messageId: '987654321',
    userId: '111222333',
    originalAttachmentUrl: '/assets/pyxie/pyxie_mascot.png',
    description: 'Ilustração mágica da Pyxie <:star:123> <@111>',
  };
  const watermarkedJpg = await museumManager.getWatermarkedImage(sampleArt, 'jpg');
  assert.ok(watermarkedJpg, 'Watermarked image JPG não pode ser nulo');
  assert.ok(watermarkedJpg.buffer instanceof Buffer, 'Watermarked buffer deve ser uma instância de Buffer');
  assert.ok(watermarkedJpg.buffer.length > 500, 'Watermarked buffer deve possuir tamanho plausível');
  assert.strictEqual(watermarkedJpg.contentType, 'image/jpeg', 'Formato final padrão deve ser JPEG universal para Tumblr/dlvr.it');
  assert.ok(museumManager.watermarkCache.has(`${sampleArt.id}_jpg`), 'Arte deve ser salva no cache de marca d\'água');

  const diskWatermarkJpgPath = path.join(process.cwd(), 'data', 'museumWatermarks', `${sampleArt.id}.jpg`);
  assert.ok(fs.existsSync(diskWatermarkJpgPath), 'Imagem JPG com watermark deve ser persistida fisicamente no disco em data/museumWatermarks');
  assert.strictEqual(fs.readFileSync(diskWatermarkJpgPath).length, watermarkedJpg.buffer.length, 'Tamanho do arquivo JPG em disco deve bater com o buffer');

  // Suporte a WebP quando explicitamente solicitado
  const watermarkedWebp = await museumManager.getWatermarkedImage(sampleArt, 'webp');
  assert.ok(watermarkedWebp, 'Watermarked WebP não pode ser nulo');
  assert.strictEqual(watermarkedWebp.contentType, 'image/webp', 'Formato solicitado deve ser WebP');
  const diskWatermarkWebpPath = path.join(process.cwd(), 'data', 'museumWatermarks', `${sampleArt.id}.webp`);
  assert.ok(fs.existsSync(diskWatermarkWebpPath), 'Imagem WebP deve ser persistida fisicamente');

  // Valida recuperação do disco após limpar o cache em memória RAM
  museumManager.watermarkCache.clear();
  const diskReloaded = await museumManager.getWatermarkedImage(sampleArt, 'jpg');
  assert.ok(diskReloaded && diskReloaded.buffer, 'Deve recarregar instantaneamente do disco');
  assert.strictEqual(diskReloaded.buffer.length, watermarkedJpg.buffer.length, 'Buffer recarregado do disco deve ser idêntico');
  console.log('  ✅ 11. Honeypot de Marca d\'Água com Sharp (JPG/WebP), Cache LRU e Persistência em Disco validados com sucesso.');

  // 12. Listagem de Artes do Museu (listArts e getAllArts)
  museumManager.refresh();
  museumManager.data.arts.unshift(sampleArt);
  museumManager.saveData();

  const listRes = museumManager.listArts(1, 10);
  assert.ok(listRes && Array.isArray(listRes.arts), 'listArts deve retornar lista');
  assert.ok(listRes.arts.length >= 1, 'Deve conter pelo menos 1 arte');
  assert.ok(listRes.arts[0].imageUrl.endsWith('.webp'), 'imageUrl deve ter extensão .webp');

  const allArtsRes = museumManager.getAllArts(10);
  assert.ok(Array.isArray(allArtsRes) && allArtsRes.length >= 1, 'getAllArts deve retornar array');
  assert.strictEqual(allArtsRes[0].id, sampleArt.id);
  console.log('  ✅ 12. Métodos de listagem síncrona listArts e getAllArts validados.');

  // 13. Feed RSS Dedicado para o Pinterest & Tumblr (PT-BR e EN) com JPG Universal
  const cleanSample = sanitizeDiscordText('Arte linda!! <:star:123> <@111222> confira <#333>');
  assert.strictEqual(cleanSample, 'Arte linda!! confira', 'sanitizeDiscordText deve limpar emojis e menções');

  const ptPinterestRss = generatePinterestRssXml('pt');
  assert.ok(ptPinterestRss.includes('<rss version="2.0"'), 'Deve ser RSS 2.0 válido');
  assert.ok(ptPinterestRss.includes('xmlns:media="http://search.yahoo.com/mrss/"'), 'Deve conter namespace Yahoo Media');
  assert.ok(ptPinterestRss.includes('xmlns:content="http://purl.org/rss/1.0/modules/content/"'), 'Deve conter namespace Content');
  assert.ok(ptPinterestRss.includes('<language>pt-BR</language>'), 'Idioma PT deve ser pt-BR');
  assert.ok(ptPinterestRss.includes('<enclosure url="https://pyxie.com.br/api/museum/art-image/test_art_honeypot_01.jpg" type="image/jpeg"'), 'Deve conter enclosure com .jpg e tipo image/jpeg');
  assert.ok(ptPinterestRss.includes('<media:content url="https://pyxie.com.br/api/museum/art-image/test_art_honeypot_01.jpg" medium="image" type="image/jpeg"'), 'Deve conter media:content');
  assert.ok(ptPinterestRss.includes('<content:encoded>'), 'Deve conter content:encoded');
  assert.ok(ptPinterestRss.includes('✦ Pyxie • Galeria Oficial da Comunidade'), 'Deve conter branding oficial no corpo do item');

  const enPinterestRss = generatePinterestRssXml('en');
  assert.ok(enPinterestRss.includes('<language>en-US</language>'), 'Idioma EN deve ser en-US');
  assert.ok(enPinterestRss.includes('Community Art Museum'), 'Título em inglês deve estar presente');
  assert.ok(enPinterestRss.includes('https://pyxie.com.br/api/museum/art-image/test_art_honeypot_01.jpg'), 'URL da imagem deve estar presente no feed em inglês');

  // Validação do OpenGraph Dinâmico do Museu (evita fallback na mascote padrão em scrapers)
  const { serveLocalizedPage } = require('../src/utils/seoRenderer');
  let capturedOgHtml = '';
  const fakeReq = { query: { art: sampleArt.id }, headers: {} };
  const fakeRes = {
    setHeader() {},
    send(h) { capturedOgHtml = h; },
  };
  serveLocalizedPage('museum', path.join(repo, 'public'))(fakeReq, fakeRes);
  assert.ok(capturedOgHtml.includes(`https://pyxie.com.br/api/museum/art-image/${sampleArt.id}.jpg`), 'OpenGraph deve conter URL direta de imagem JPG com watermark');
  console.log('  ✅ 13. Feed RSS Universal (.jpg), OpenGraph Dinâmico e Paridade Bilíngue validados com sucesso.');

  // 14. Remoção de arte limpa arquivos de watermark em disco (todos os formatos)
  const deleted = museumManager.deleteArt(sampleArt.id);
  assert.strictEqual(deleted, true, 'deleteArt deve retornar true');
  assert.ok(!fs.existsSync(diskWatermarkJpgPath), 'deleteArt deve remover o arquivo .jpg do disco em data/museumWatermarks');
  assert.ok(!fs.existsSync(diskWatermarkWebpPath), 'deleteArt deve remover o arquivo .webp do disco em data/museumWatermarks');
  // 15. Curadoria Visual Administrativa (getAdminArtList, editArt e busca)
  museumManager.refresh();
  const artA = {
    id: 'test_curation_01',
    channelId: '123',
    messageId: '456',
    userId: '789',
    originalAttachmentUrl: '/assets/pyxie/pyxie_mascot.png',
    description: 'Ilustração mágica da Lua',
    cachedAuthor: 'Artista Lunar',
  };
  const artB = {
    id: 'test_curation_02',
    channelId: '123',
    messageId: '457',
    userId: '790',
    originalAttachmentUrl: '/assets/pyxie/pyxie_mascot.png',
    description: 'Desenho do Sol radiante',
    cachedAuthor: 'Artista Solar',
  };
  museumManager.data.arts.push(artA, artB);
  museumManager.saveData();

  const adminList = museumManager.getAdminArtList({ page: 1, limit: 10 });
  assert.ok(adminList && Array.isArray(adminList.arts));
  assert.ok(adminList.total >= 2);
  assert.ok(adminList.uniqueAuthorsCount >= 2);

  // Busca por autor
  const searchAuthor = museumManager.getAdminArtList({ search: 'Lunar' });
  assert.strictEqual(searchAuthor.arts.length, 1);
  assert.strictEqual(searchAuthor.arts[0].id, 'test_curation_01');

  // Busca por descrição
  const searchDesc = museumManager.getAdminArtList({ search: 'radiante' });
  assert.strictEqual(searchDesc.arts.length, 1);
  assert.strictEqual(searchDesc.arts[0].id, 'test_curation_02');

  // Edição de descrição e autor (editArt)
  const edited = museumManager.editArt('test_curation_01', {
    author: 'Gica Master',
    description: 'Nova legenda estelar',
  });
  assert.strictEqual(edited, true);
  const refreshedArt = museumManager.data.arts.find((a) => a.id === 'test_curation_01');
  assert.strictEqual(refreshedArt.cachedAuthor, 'Gica Master');
  assert.strictEqual(refreshedArt.description, 'Nova legenda estelar');

  // Limpeza
  museumManager.deleteArt('test_curation_01');
  museumManager.deleteArt('test_curation_02');
  console.log('  ✅ 15. Curadoria Visual do Museu (getAdminArtList, busca textual e editArt) validada com sucesso.');

  console.log('🎉 [TEST] Museu & Parcerias passaram com 100% de sucesso!');
  process.chdir(repo);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});


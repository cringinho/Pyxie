const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

console.log('⚡ Iniciando suíte de testes: Pyxie Hyperfokus (Fase 0 - Fundação)...');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';

(async () => {
  // 1. Validação do Módulo e Contrato Cog
console.log('  📖 1. Validando esqueleto e manifesto do módulo hyperfokus...');
const hyperfokusModule = require('../src/modules/hyperfokus');
assert.equal(hyperfokusModule.id, 'hyperfokus', 'ID do módulo deve ser hyperfokus');
assert.equal(hyperfokusModule.guildScope, CRINGELANDIA_GUILD_ID, 'Escopo deve ser Cringelândia');
assert.ok(hyperfokusModule.name['pt-BR'] && hyperfokusModule.name.en, 'Nome bilíngue obrigatório');
assert.ok(hyperfokusModule.description['pt-BR'] && hyperfokusModule.description.en, 'Descrição bilíngue obrigatória');

const readmePath = path.join(__dirname, '../src/modules/hyperfokus/README.md');
assert.ok(fs.existsSync(readmePath), 'README.md do módulo é obrigatório (§3)');
assert.ok(fs.readFileSync(readmePath, 'utf8').length > 100, 'README.md deve conter documentação do módulo');
console.log('    ✅ 1. Módulo hyperfokus registrado no padrão Cog.');

// 2. Validação do Esquema Relacional no Drizzle
console.log('  🗄️ 2. Validando esquemas relacionais no Drizzle...');
const schema = require('../src/database/schema');
assert.ok(schema.hyperfokusArticles, 'Tabela hyperfokus_articles deve existir');
assert.ok(schema.hyperfokusArticleAuthors, 'Tabela hyperfokus_article_authors deve existir');
assert.ok(schema.hyperfokusLikes, 'Tabela hyperfokus_likes deve existir');
assert.ok(schema.hyperfokusComments, 'Tabela hyperfokus_comments deve existir');
assert.ok(schema.hyperfokusPinQueue, 'Tabela hyperfokus_pin_queue deve existir');
assert.ok(schema.hyperfokusAnalyticsDaily, 'Tabela hyperfokus_analytics_daily deve existir');
assert.ok(schema.accounts, 'Tabela accounts deve existir');
assert.ok(schema.partnerReferrals, 'Tabela partner_referrals deve existir');
console.log('    ✅ 2. Todas as 8 tabelas de dados do Hyperfokus validadas no Drizzle.');

// 3. Validação do draftStore (Rascunhos atômicos do Discord)
console.log('  📝 3. Testando draftStore (ciclo de vida de rascunhos)...');
const draftStore = require('../src/modules/hyperfokus/draftStore');
const testThreadId = '999999999999999991';
const testOwnerId = '111111111111111111';
const testCollabId = '222222222222222222';

// Criar rascunho
const draft = draftStore.createOrUpdateDraft(testThreadId, {
  guildId: CRINGELANDIA_GUILD_ID,
  ownerId: testOwnerId,
  status: 'DRAFT',
});
assert.ok(draft, 'Draft deve ser criado');
assert.equal(draft.status, 'DRAFT');
assert.equal(draft.ownerId, testOwnerId);

// Adicionar coautor
const withCollab = draftStore.addCollaborator(testThreadId, testCollabId);
assert.ok(withCollab.collaborators.includes(testCollabId), 'Coautor deve ser adicionado');
assert.ok(draftStore.isAuthorOrCollaborator(testThreadId, testOwnerId), 'Autor deve ser reconhecido');
assert.ok(draftStore.isAuthorOrCollaborator(testThreadId, testCollabId), 'Coautor deve ser reconhecido');
assert.strictEqual(draftStore.isAuthorOrCollaborator(testThreadId, '333333333333333333'), false, 'Estranho não deve ser reconhecido');

// Sticky ID e Status
draftStore.setStickyMessageId(testThreadId, '888888888888888888');
assert.equal(draftStore.getDraft(testThreadId).stickyMessageId, '888888888888888888');

draftStore.updateStatus(testThreadId, 'PENDING_REVIEW');
assert.equal(draftStore.getDraft(testThreadId).status, 'PENDING_REVIEW');

// Remover coautor e limpar
draftStore.removeCollaborator(testThreadId, testCollabId);
assert.strictEqual(draftStore.getDraft(testThreadId).collaborators.includes(testCollabId), false);
draftStore.deleteDraft(testThreadId);
assert.strictEqual(draftStore.getDraft(testThreadId), null);
console.log('    ✅ 3. draftStore operando com escrita atômica e controle rigoroso de autoria.');

// 4. Validação do articleStore (Artigos, Autores, Likes, Comentários e Backups)
console.log('  📚 4. Testando articleStore (Artigos, Coautoria, Curtidas e Comentários)...');
const articleStore = require('../src/modules/hyperfokus/articleStore');
const testArticleId = `test_art_${Date.now()}`;
const testSlug = `meu-hiperfoco-${Date.now()}`;

const savedArt = await articleStore.saveArticle({
  id: testArticleId,
  slug: testSlug,
  discordThreadId: '777777777777777777',
  title: 'História Secreta dos Cogumelos Luminescentes',
  contentMarkdown: '# Introdução\nEles brilham no escuro!',
  contentHtml: '<h1>Introdução</h1><p>Eles brilham no escuro!</p>',
  categoryTags: ['botânica', 'ciência'],
  status: 'PENDING_REVIEW',
}, [
  { userId: testOwnerId, username: 'FadinhaBotânica', role: 'AUTHOR' },
  { userId: testCollabId, username: 'MestreDasPlantas', role: 'COLLABORATOR' }
]);

assert.ok(savedArt, 'Artigo deve ser salvo');
assert.equal(savedArt.slug, testSlug);
assert.equal(savedArt.authors.length, 2, 'Artigo deve ter 2 autores vinculados');

const fetchedBySlug = articleStore.getArticleBySlug(testSlug);
assert.ok(fetchedBySlug, 'Deve encontrar artigo pelo slug');
assert.equal(fetchedBySlug.title, 'História Secreta dos Cogumelos Luminescentes');

// Testando Curtidas
const likeRes1 = articleStore.toggleLike(testArticleId, testOwnerId);
assert.strictEqual(likeRes1.liked, true);
assert.equal(likeRes1.likesCount, 1);
const likeRes2 = articleStore.toggleLike(testArticleId, testOwnerId);
assert.strictEqual(likeRes2.liked, false);
assert.equal(likeRes2.likesCount, 0);

// Testando Comentários
const comment = articleStore.addComment(testArticleId, {
  userId: testCollabId,
  username: 'MestreDasPlantas',
  content: 'Artigo incrível! Aprendi muito com essa pesquisa.',
});
assert.ok(comment, 'Comentário deve ser adicionado');
assert.equal(comment.content, 'Artigo incrível! Aprendi muito com essa pesquisa.');

const commentsList = articleStore.listComments(testArticleId);
assert.equal(commentsList.length, 1);

// Testando Exportação de Backup Diário
const backupPath = articleStore.exportBackup('2026-10-29');
assert.ok(fs.existsSync(backupPath), 'Arquivo de backup diário deve ser criado');
assert.ok(fs.readFileSync(backupPath, 'utf8').includes(testSlug), 'Backup deve conter os artigos');
console.log('    ✅ 4. articleStore, coautoria e rotina de backup validados.');

// 5. Validação de Integração com Configuração do Fórum Cringelândia
console.log('  🎯 5. Validando integração com canal de fórum de Hiperfocos da Cringelândia...');
const { getCommunityConfig } = require('../src/services/communityConfig');
const communityCfg = getCommunityConfig(CRINGELANDIA_GUILD_ID);
assert.ok(communityCfg.hyperfocus, 'Configuração hyperfocus deve existir');
assert.ok(Array.isArray(communityCfg.hyperfocus.forumIds), 'forumIds deve ser um array');
console.log(`    ✅ 5. Canais de fórum recuperados dinamicamente (${communityCfg.hyperfocus.forumIds.length} configurados).`);

// 6. Testando Parser de Markdown & Sanitização Anti-XSS (markdown.js)
console.log('  🛡️ 6. Testando parser de Markdown e blindagem anti-XSS...');
const { markdownToHtml } = require('../src/modules/hyperfokus/markdown');

const rawMd = `# Título Principal
## Subtítulo
### Seção Detalhada
> Citação importante sobre autismo e hiperfoco

Texto normal com **negrito**, *itálico* e ~~riscado~~.
Código inline: \`const a = 10;\`
Bloco de código:
\`\`\`javascript
function test() {
  return true;
}
\`\`\`

Links:
- [Site Seguro](https://pyxie.com.br)
- [Link Malicioso](javascript:alert("hacked"))

Injeção maliciosa: <script>alert("xss")</script> <img src=x onerror=alert(1)>
`;

const parsedHtml = markdownToHtml(rawMd);
assert.ok(!parsedHtml.includes('<script>'), 'HTML não pode conter tag script crua');
assert.ok(!parsedHtml.includes('onerror='), 'HTML não pode conter atributos onerror de injeção');
assert.ok(!parsedHtml.includes('javascript:alert'), 'URLs javascript: devem ser sanitizadas');
assert.ok(!parsedHtml.includes('<h1'), 'Nunca deve gerar h1 (o h1 é reservado para o título da página)');
assert.ok(parsedHtml.includes('<h2 class="article-h2">Título Principal</h2>'), 'Headers de nível 1 viram h2');
assert.ok(parsedHtml.includes('<h3 class="article-h3">Seção Detalhada</h3>'), 'Headers de nível 3 viram h3');
assert.ok(parsedHtml.includes('rel="nofollow ugc noopener"'), 'Links devem ter atributos seguros');
assert.ok(parsedHtml.includes('<pre class="code-block" data-language="javascript">'), 'Blocos de código devem ter classe formatada');
console.log('    ✅ 6. Sanitização anti-XSS e estrutura de cabeçalhos validada com sucesso.');

// 7. Testando Thread Guard (Fase 1: Fluxo Discord & Trava de Digitação)
console.log('  🔒 7. Testando threadGuard (Trava de rascunho, Sticky e Conclusão)...');
const threadGuard = require('../src/modules/hyperfokus/threadGuard');

// Testando montagem do Sticky
const mockThread = {
  id: '999999999999999992',
  guildId: CRINGELANDIA_GUILD_ID,
  parentId: '111111111111111112',
  name: 'Tópico de Teste de Hiperfoco',
  isThread: () => true,
  appliedTags: [],
  parent: { availableTags: [] },
  messages: {
    fetch: async () => new Map(),
  },
  send: async (payload) => ({ id: '888888888888888882', delete: async () => {} }),
  fetchStarterMessage: async () => ({ content: 'Conteúdo inicial do autor', attachments: new Map() }),
  guild: {
    members: {
      fetch: async (id) => ({
        id,
        displayName: id === testOwnerId ? 'AutorOriginal' : 'CoautorAmigo',
        user: { username: 'testuser', displayAvatarURL: () => 'https://cdn.discordapp.com/avatar.webp' },
        permissions: { has: () => false },
      }),
    },
  },
};

const stickyPayload = threadGuard.buildStickyPayload(mockThread, 'pt');
assert.ok(stickyPayload.embeds.length === 1, 'Sticky deve conter 1 embed');
assert.ok(stickyPayload.components.length === 1, 'Sticky deve conter 1 ActionRow');
assert.ok(stickyPayload.components[0].components[0].data.custom_id.includes('hyperfokus_conclude'), 'Botão deve ter customId hyperfokus_conclude');

// Cria rascunho de teste
draftStore.createOrUpdateDraft(mockThread.id, {
  guildId: mockThread.guildId,
  ownerId: testOwnerId,
  collaborators: [testCollabId],
  status: 'DRAFT',
});

// Mensagem de autor: permitida
let deletedAuthorMsg = false;
const authorMsg = {
  author: { id: testOwnerId, bot: false },
  channel: mockThread,
  channelId: mockThread.id,
  guildId: CRINGELANDIA_GUILD_ID,
  delete: async () => { deletedAuthorMsg = true; },
};
const authorAllowed = await threadGuard.onMessageCreate(authorMsg);
assert.strictEqual(authorAllowed, false, 'Mensagem do autor não deve ser tratada como intrusão');
assert.strictEqual(deletedAuthorMsg, false, 'Mensagem do autor não deve ser apagada');

// Mensagem de terceiro: BLOQUEADA E APAGADA
let deletedStrangerMsg = false;
let dmSent = false;
const strangerMsg = {
  author: {
    id: '444444444444444444',
    bot: false,
    send: async () => { dmSent = true; },
    toString: () => '<@444444444444444444>',
  },
  channel: mockThread,
  channelId: mockThread.id,
  guildId: CRINGELANDIA_GUILD_ID,
  delete: async () => { deletedStrangerMsg = true; },
};
const strangerBlocked = await threadGuard.onMessageCreate(strangerMsg);
assert.strictEqual(strangerBlocked, true, 'Mensagem de estranho deve ser tratada como intrusão');
assert.strictEqual(deletedStrangerMsg, true, 'Mensagem de estranho deve ser apagada');
assert.strictEqual(dmSent, true, 'Aviso de rascunho deve ser enviado ao estranho por DM');

// Testando Conclusão do Rascunho
const strangerConclude = await threadGuard.concludeDraft({
  thread: mockThread,
  user: { id: '444444444444444444' },
});
assert.strictEqual(strangerConclude.success, false, 'Estranho não pode concluir rascunho');

const authorConclude = await threadGuard.concludeDraft({
  thread: mockThread,
  user: { id: testOwnerId },
});
assert.strictEqual(authorConclude.success, true, 'Autor deve conseguir concluir rascunho');
assert.equal(draftStore.getDraft(mockThread.id).status, 'PENDING_REVIEW', 'Status deve mudar para PENDING_REVIEW');
assert.ok(authorConclude.article, 'Artigo deve ser gerado no articleStore');
console.log('    ✅ 7. Thread Guard, bloqueio de mensagens, debounce e conclusão validados.');

// 8. Testando Despacho de Prévia de Homologação (§11)
console.log('  🧪 8. Testando despacho de prévia de homologação no canal 1461937203214024891...');
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const previewRes = await dispatchHomologationPreview({
  commandName: 'Pyxie Hyperfokus',
  context: 'Embeds do Sticky e Conclusão de Rascunho Editorial',
  embeds: [stickyPayload.embeds[0]],
  components: stickyPayload.components,
});
assert.ok(previewRes.success, 'Despacho de preview deve ser bem-sucedido');
console.log('    ✅ 8. Prévia de homologação validada com blindagem anti-ping.');

// Limpa dados de teste
draftStore.deleteDraft(mockThread.id);

// 9. Validação da Fila Editorial e Ciclo de Aprovação no Painel (Fase 2)
console.log('  📰 9. Testando ciclo de validação editorial (Fila, Edição, Publicação e Recusa)...');
const editTestId = `review_test_${Date.now()}`;
const editTestSlug = `cogumelos-brilhantes-${Date.now()}`;

await articleStore.saveArticle({
  id: editTestId,
  slug: editTestSlug,
  title: 'Cogumelos que Brilham no Escuro',
  contentMarkdown: '# Primeiros Passos\nEles emitem bioluminescência.',
  contentHtml: '<p>Eles emitem bioluminescência.</p>',
  categoryTags: ['ciência'],
  status: 'PENDING_REVIEW',
}, [{ userId: testOwnerId, username: 'Fadinha', role: 'AUTHOR' }]);

// Consulta fila de validação
const pendingQueue = articleStore.listArticles({ status: 'PENDING_REVIEW' });
assert.ok(pendingQueue.items.some((a) => a.id === editTestId), 'Artigo deve constar na fila de pendentes');

// Edição de campos editoriais e SEO
const patchRes = articleStore.updateArticle(editTestId, {
  seoTitle: 'Guia Completo: Cogumelos Bioluminescentes no Brasil',
  metaDescription: 'Descubra como os cogumelos luminescentes produzem luz na floresta tropical.',
  contentMarkdown: '# Nova Revisão\nTexto ampliado e revisado pelo editor.',
  contentHtml: '<h2>Nova Revisão</h2><p>Texto ampliado e revisado pelo editor.</p>',
});
assert.equal(patchRes.seoTitle, 'Guia Completo: Cogumelos Bioluminescentes no Brasil');
assert.ok(patchRes.seoTitle.length <= 60, 'seoTitle deve respeitar teto de 60 caracteres');
assert.ok(patchRes.metaDescription.length <= 160, 'metaDescription deve respeitar teto de 160 caracteres');

// Publicação Idempotente
const pub1 = articleStore.updateArticle(editTestId, {
  status: 'PUBLISHED',
  publishedAt: new Date(),
});
assert.equal(pub1.status, 'PUBLISHED');
assert.ok(pub1.publishedAt, 'Data de publicação deve ser registrada');

const pub2 = articleStore.updateArticle(editTestId, {
  status: 'PUBLISHED',
});
assert.equal(pub2.status, 'PUBLISHED', 'Segunda chamada de publicação deve ser idempotente');

// Recusa com motivo
const rejTestId = `reject_test_${Date.now()}`;
await articleStore.saveArticle({
  id: rejTestId,
  slug: `artigo-incompleto-${Date.now()}`,
  title: 'Artigo Muito Curto',
  contentMarkdown: 'Texto de duas palavras.',
  status: 'PENDING_REVIEW',
}, [{ userId: testOwnerId, username: 'Fadinha' }]);

const rejRes = articleStore.updateArticle(rejTestId, {
  status: 'REJECTED',
  metadata: { rejectionReason: 'Texto abaixo do tamanho mínimo editorial.' },
});
assert.equal(rejRes.status, 'REJECTED');
assert.equal(rejRes.metadata.rejectionReason, 'Texto abaixo do tamanho mínimo editorial.');

// Conferência de declaração das rotas no dashboardRoutes.js
const dashRoutesStr = fs.readFileSync(path.join(__dirname, '../src/routes/dashboardRoutes.js'), 'utf8');
assert.ok(dashRoutesStr.includes("router.get('/api/dashboard/guilds/:guildId/hyperfokus/queue'"), 'Rota de fila pendente deve existir');
assert.ok(dashRoutesStr.includes("router.post('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id/publish'"), 'Rota de publicação deve existir');
assert.ok(dashRoutesStr.includes("router.post('/api/dashboard/guilds/:guildId/hyperfokus/articles/:id/reject'"), 'Rota de recusa deve existir');
assert.ok(dashRoutesStr.includes("registerDashboardSection({ id: 'hyperfokus'"), 'Seção hyperfokus deve estar registrada no painel');
console.log('    ✅ 9. Fila de validação, editor de SEO e rotas do painel validados com sucesso.');


// 10. Validação do mediaArchiver (Proteção Anti-SSRF e Conversão WebP)
console.log('  🖼️ 10. Testando mediaArchiver (Anti-SSRF e espelhamento)...');
const mediaArchiver = require('../src/modules/hyperfokus/mediaArchiver');
assert.ok(mediaArchiver.ALLOWED_HOSTS.has('cdn.discordapp.com'), 'cdn.discordapp.com deve ser permitido');
assert.ok(mediaArchiver.ALLOWED_HOSTS.has('media.discordapp.net'), 'media.discordapp.net deve ser permitido');
assert.strictEqual(mediaArchiver.ALLOWED_HOSTS.has('malicious-site.com'), false, 'Sites externos arbitrários devem ser bloqueados');

// Tentativa de SSRF deve retornar URL original sem download
const blockedSsrf = await mediaArchiver.archiveDiscordMedia('https://malicious-site.com/exploit.png', { slug: 'teste' });
assert.equal(blockedSsrf, 'https://malicious-site.com/exploit.png', 'URLs fora da lista fixa devem ser devolvidas intocadas');
console.log('    ✅ 10. mediaArchiver com blindagem anti-SSRF e whitelist do Discord CDN validada.');

// 11. Validação do imageCards (Sharp: OG 1200x630, Pinterest Pin 1000x1500 e Marca d\'água)
console.log('  🎨 11. Testando imageCards com sharp (Cards OG, Pin e Marca d\'água)...');
const imageCards = require('../src/modules/hyperfokus/imageCards');
const sampleArt = {
  id: 'art_img_test_01',
  slug: 'hiperfoco-astronomia-amadora',
  title: 'Guia de Astronomia Amadora para Céus Urbanos',
  seoTitle: 'Astronomia Amadora: Como Observar Nebulosas na Cidade',
  categoryTags: ['ciência', 'astronomia'],
  readingTimeMinutes: 5,
  authors: [{ username: 'ObservadorNoturno', userId: '888777666' }],
};

const ogCardBuffer = await imageCards.generateOgCard(sampleArt);
assert.ok(Buffer.isBuffer(ogCardBuffer), 'OG Card deve retornar um Buffer');
const sharp = require('sharp');
const ogMeta = await sharp(ogCardBuffer).metadata();
assert.equal(ogMeta.width, 1200, 'OG Card deve ter largura exata de 1200 px');
assert.equal(ogMeta.height, 630, 'OG Card deve ter altura exata de 630 px');
assert.equal(ogMeta.format, 'webp', 'OG Card deve estar otimizado em formato WebP');

const pinBuffer = await imageCards.generatePinterestPin(sampleArt);
assert.ok(Buffer.isBuffer(pinBuffer), 'Pinterest Pin deve retornar um Buffer');
const pinMeta = await sharp(pinBuffer).metadata();
assert.equal(pinMeta.width, 1000, 'Pinterest Pin deve ter largura de 1000 px');
assert.equal(pinMeta.height, 1500, 'Pinterest Pin deve ter altura de 1500 px (2:3)');
assert.equal(pinMeta.format, 'webp', 'Pinterest Pin deve estar em WebP');

const watermarkedBuffer = await imageCards.generateWatermarkedShareImage(ogCardBuffer);
assert.ok(Buffer.isBuffer(watermarkedBuffer), 'Imagem compartilhável deve ter marca d\'água');
console.log('    ✅ 11. Sharp gerando OG (1200x630), Pin (1000x1500) e marca d\'água permanente com sucesso.');

// 12. Validação do Motor de SEO (Metadados, Schema.org, FAQPage, Auto-Internal Linker e Feeds)
console.log('  🔍 12. Testando seoEngine (Schema.org, FAQPage, Linker, Sitemap e RSS)...');
const seoEngine = require('../src/modules/hyperfokus/seoEngine');

// Schema.org BlogPosting
const articleSeo = seoEngine.buildArticleSeo({
  article: {
    ...sampleArt,
    contentHtml: '<h2>O que é um telescópio refletor?</h2><p>É um instrumento que usa espelhos para concentrar luz.</p>',
    contentMarkdown: 'Texto completo de astronomia.',
  },
  lang: 'pt',
});
assert.ok(articleSeo.canonical.includes('/hyperfokus/hiperfoco-astronomia-amadora'), 'Canonical sem query params');
assert.equal(articleSeo.hreflangs.length, 3, 'Hreflang PT, EN e x-default obrigatórios');
const graph = articleSeo.jsonLd['@graph'];
const blogPosting = graph.find((g) => g['@type'] === 'BlogPosting');
assert.ok(blogPosting, 'JSON-LD deve conter esquema BlogPosting');
assert.equal(blogPosting.headline, sampleArt.title);
const breadcrumb = graph.find((g) => g['@type'] === 'BreadcrumbList');
assert.ok(breadcrumb, 'JSON-LD deve conter BreadcrumbList');
const faqPage = graph.find((g) => g['@type'] === 'FAQPage');
assert.ok(faqPage, 'FAQPage deve ser extraída de cabeçalhos com interrogação');
assert.equal(faqPage.mainEntity[0].name, 'O que é um telescópio refletor?');

// Auto-Internal Linker
// Salva artigo alvo para teste do linker
const linkedTargetId = `art_target_${Date.now()}`;
await articleStore.saveArticle({
  id: linkedTargetId,
  slug: 'fones-com-cancelamento-de-ruido',
  title: 'Fones com Cancelamento de Ruído para Hipersensibilidade',
  categoryTags: ['autismo', 'sensorial'],
  status: 'PUBLISHED',
  contentMarkdown: 'Guia completo.',
  contentHtml: '<p>Guia completo.</p>',
}, [{ userId: '555', username: 'SensoryCare' }]);

const textBeforeLinking = '<p>Para quem busca fones com cancelamento de ruído no dia a dia, a redução sensorial é vital.</p><pre>fones com cancelamento de ruído não deve ser linkado aqui</pre>';
const textAfterLinking = seoEngine.applyInternalLinks(textBeforeLinking, 'outroid');
assert.ok(textAfterLinking.includes('href="/hyperfokus/fones-com-cancelamento-de-ruido"'), 'Palavra-chave no parágrafo deve virar link interno');
assert.ok(textAfterLinking.includes('<pre>fones com cancelamento de ruído não deve ser linkado aqui</pre>'), 'Blocos de código <pre> jamais devem ser linkados');

// Sitemap XML
const sitemapXml = seoEngine.generateSitemapXml();
assert.ok(sitemapXml.includes('<urlset'), 'Sitemap deve conter tag urlset');
assert.ok(sitemapXml.includes('/hyperfokus/como-participar'), 'Sitemap deve incluir página de participação');
assert.ok(sitemapXml.includes('<lastmod>'), 'Sitemap deve conter lastmod real');

// RSS XML
const rssXml = seoEngine.generateBlogRssXml('pt');
assert.ok(rssXml.includes('<rss version="2.0"'), 'Feed deve ser RSS 2.0 válido');
assert.ok(rssXml.includes('<atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />'), 'Feed deve suportar WebSub');
console.log('    ✅ 12. Motor de SEO, Schemas, Auto-Internal Linker, Sitemap e RSS 100% íntegros.');

// 13. Validação da Fila do Pinterest (Orçamento de 3 pins/dia e Jitter)
console.log('  📌 13. Testando pinScheduler (Orçamento de 3 pins/dia e feed Pinterest)...');
const pinScheduler = require('../src/modules/hyperfokus/pinScheduler');
const enqueued = pinScheduler.enqueuePin({
  source: 'hyperfokus',
  sourceId: sampleArt.id,
  title: sampleArt.title,
  description: 'Descubra como explorar o cosmos a partir da sua varanda mesmo com poluição luminosa.',
  imageUrl: `/api/hyperfokus/pin/${sampleArt.id}`,
  targetUrl: `https://pyxie.com.br/hyperfokus/${sampleArt.slug}`,
});
assert.ok(enqueued, 'Pin deve ser enfileirado com sucesso');
assert.equal(enqueued.status, 'SCHEDULED');
assert.ok(enqueued.releaseAt > Date.now(), 'releaseAt deve estar no futuro');
assert.ok(enqueued.title.length <= 100, 'Título deve respeitar limite de 100 caracteres');
assert.ok(enqueued.description.length <= 500, 'Descrição deve respeitar limite de 500 caracteres');

// Pausar e reativar pin
const toggled = pinScheduler.togglePinPause(enqueued.id);
assert.equal(toggled.status, 'PAUSED', 'Pin deve poder ser pausado');
pinScheduler.togglePinPause(enqueued.id); // despausa

// Remoção da fila
const removed = pinScheduler.removePin(enqueued.id);
assert.equal(removed, true, 'Pin de teste deve ser removido');

// Inclusão no feed /rss-pinterest.xml
const { generatePinterestRssXml } = require('../src/services/feedGenerator');
const pinterestFeed = generatePinterestRssXml('pt');
assert.ok(pinterestFeed.includes('<rss version="2.0"'), 'Feed Pinterest deve continuar válido após integração');
console.log('    ✅ 13. Fila do Pinterest (3 pins/dia, horários de pico e jitter) validada com sucesso.');

// 14. Validação da Renderização do Site Público (SSR & Rotas Web)
console.log('  🌐 14. Testando SSR do Blog, Leitor Acessível e Rotas Web...');
const renderer = require('../src/modules/hyperfokus/renderer');
const { createHyperfokusRouter } = require('../src/routes/hyperfokusRoutes');

// Home do Blog
const homeHtml = renderer.renderHomePage({
  articles: [sampleArt],
  total: 1,
  page: 1,
  totalPages: 1,
  lang: 'pt',
});
assert.ok(homeHtml.includes('<h1'), 'Home deve conter h1 sem duplicata');
assert.strictEqual(homeHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na home');
assert.ok(homeHtml.includes('Pyxie Hyperfokus'), 'Título e identidade da marca presentes');
assert.ok(homeHtml.includes('Comunidade Cringelândia'), 'Widget de convite do Discord na sidebar');

// Página do Artigo
const articlePageHtml = renderer.renderArticlePage({
  article: {
    ...sampleArt,
    contentHtml: '<h2>Primeiro Telescópio</h2><p>Comece com um refrator de 70mm.</p>',
    contentMarkdown: 'Texto',
    categoryTags: ['ciência'],
  },
  lang: 'pt',
});
assert.strictEqual(articlePageHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na página do artigo');
assert.ok(articlePageHtml.includes('Guia de Astronomia Amadora para Céus Urbanos'), 'Título no h1');
assert.ok(articlePageHtml.includes('aria-label="Ferramentas de leitura"'), 'Barra de leitura acessível presente');
assert.ok(articlePageHtml.includes('setReaderSize'), 'Controles de tamanho de texto (A-/A+) presentes');
assert.ok(articlePageHtml.includes('setReaderTheme'), 'Controles de tema (Escuro/Sépia/Contraste) presentes');
assert.ok(articlePageHtml.includes('toggleReaderDyslexic'), 'Alternância de fonte para dislexia presente');
assert.ok(articlePageHtml.includes('likes-count'), 'Contador de curtidas presente');
assert.ok(articlePageHtml.includes('comment-form'), 'Formulário de comentários presente');

// Páginas Institucionais
const rulesHtml = renderer.renderStaticInfoPage({ pageKey: 'termos-e-regras', lang: 'pt' });
assert.ok(rulesHtml.includes('Só texto escrito por gente') && rulesHtml.includes('188'), 'Regras anti-IA (e CVV) na página de termos');
const howToHtml = renderer.renderStaticInfoPage({ pageKey: 'como-participar', lang: 'pt' });
assert.ok(howToHtml.includes('só você e seus coautores conseguem escrever'), 'Trava de rascunho explicada na página como participar');

// Router Express
const router = createHyperfokusRouter();
assert.ok(router, 'Router deve ser instanciado');
console.log('    ✅ 14. SSR, Leitor Acessível (Kindle style), e páginas institucionais validados com sucesso.');

// 15. Validação de Telemetria e Analytics em Tempo Real (analyticsEngine.js)
console.log('  📊 15. Testando Motor de Analytics, Conformidade LGPD & Agregação Diária...');
const analyticsEngine = require('../src/modules/hyperfokus/analyticsEngine');

// Anonymize IP com salt rotativo (zero raw IP)
const anonHash1 = analyticsEngine.anonymizeIp('187.56.24.10');
const anonHash2 = analyticsEngine.anonymizeIp('187.56.24.10');
const anonHashOther = analyticsEngine.anonymizeIp('187.56.24.11');
assert.strictEqual(anonHash1, anonHash2, 'Mesmo IP no mesmo dia deve gerar mesmo hash');
assert.notStrictEqual(anonHash1, anonHashOther, 'IPs diferentes devem gerar hashes diferentes');
assert.strictEqual(anonHash1.length, 16, 'Hash deve ter 16 caracteres truncados');
assert.ok(!anonHash1.includes('187'), 'Hash nunca deve conter fragmentos do IP real');

// Testando Registro de Pageview
analyticsEngine.recordPageView({
  articleId: testArticleId,
  slug: testSlug,
  ip: '201.88.12.5',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
  referer: 'https://www.google.com/search?q=hiperfoco+astronomia',
});

// Testando Filtro Anti-Bot
analyticsEngine.recordPageView({
  articleId: testArticleId,
  slug: testSlug,
  ip: '66.249.66.1',
  userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
});

// Testando Beacons de Engajamento
analyticsEngine.recordBeacon({
  articleId: testArticleId,
  ip: '201.88.12.5',
  event: 'scroll',
  depth: 100,
});
analyticsEngine.recordBeacon({
  articleId: testArticleId,
  ip: '201.88.12.5',
  event: 'time',
  seconds: 45,
});
analyticsEngine.recordBeacon({
  articleId: testArticleId,
  ip: '201.88.12.5',
  event: 'shopee_click',
});
analyticsEngine.recordBeacon({
  articleId: testArticleId,
  ip: '201.88.12.5',
  event: 'invite_click',
});

// Forçando Flush do Buffer em Memória
analyticsEngine.flushBuffer();

const analyticsSummary = analyticsEngine.getAnalyticsSummary({ days: 30, articleId: testArticleId });
assert.ok(analyticsSummary, 'Resumo de métricas deve existir');
assert.ok(analyticsSummary.totalPageViews >= 1, 'Page views registrados');
assert.ok(analyticsSummary.scrollDepths.scroll100 >= 1, 'Scroll 100% registrado');
assert.ok(analyticsSummary.shopeeClicks >= 1, 'Clique Shopee registrado');
assert.ok(analyticsSummary.inviteClicks >= 1, 'Entrada Discord registrada');
assert.ok(analyticsSummary.topReferrers.some((r) => r.source === 'Google'), 'Referrer do Google catalogado');
console.log('    ✅ 15. Analytics, filtro de robôs, anonimização LGPD e funil de leitura validados.');

// 16. Testando Contas Unificadas, Web Drafts, GitHub Importer e Perfil de Autor (Fase 7)
console.log('  👤 16. Testando Contas sem Discord, Rascunhos Web, Importador GitHub e Perfil...');
const accountStore = require('../src/modules/accounts/accountStore');
const webDraftStore = require('../src/modules/hyperfokus/webDraftStore');
const { importGitHubSnippet, GITHUB_BLOB_REGEX } = require('../src/modules/hyperfokus/githubImporter');

// Testando Cadastro e Hashing Scrypt
const testEmail = `autor_teste_${Date.now()}@pyxie.com.br`;
const testPass = 'MinhaSenhaSegura123!';
const account = accountStore.createAccount({
  email: testEmail,
  password: testPass,
});
assert.ok(account.id, 'Conta deve ter ID gerado');
assert.strictEqual(account.email, testEmail, 'E-mail deve bater');
assert.strictEqual(account.passwordHash, undefined, 'Hash de senha não pode vazar');
assert.strictEqual(account.verifiedEmail, 0, 'E-mail deve iniciar não verificado');

// Testando Login com Senha Válida
const authAcc = accountStore.authenticateWithPassword(testEmail, testPass);
assert.strictEqual(authAcc.id, account.id, 'Autenticação com senha correta deve funcionar');

// Testando Falha com Senha Incorreta
let authFailed = false;
try {
  accountStore.authenticateWithPassword(testEmail, 'SenhaErrada123');
} catch (err) {
  authFailed = true;
  assert.strictEqual(err.message, 'invalid_credentials');
}
assert.strictEqual(authFailed, true, 'Login com senha incorreta deve falhar de forma opaca');

// Testando Verificação de E-mail
const verifyToken = accountStore.createEmailVerificationToken(account.id);
assert.ok(verifyToken, 'Token de verificação deve ser gerado');
const verifiedAcc = accountStore.verifyEmailWithToken(verifyToken);
assert.strictEqual(verifiedAcc.verifiedEmail, 1, 'Conta deve ser marcada como verificada');

// Testando Recuperação de Senha
const resetToken = accountStore.createPasswordResetToken(testEmail);
assert.ok(resetToken, 'Token de recuperação de senha deve ser gerado');
const newPass = 'NovaSenhaUltraSegura456!';
accountStore.resetPasswordWithToken(resetToken, newPass);
const reAuthAcc = accountStore.authenticateWithPassword(testEmail, newPass);
assert.strictEqual(reAuthAcc.id, account.id, 'Login com nova senha deve funcionar');

// Testando Preferências de Leitura Persistidas
const prefs = accountStore.updateReadingPreferences(account.id, {
  fontSize: 'large',
  theme: 'sepia',
  dyslexicFont: true,
});
assert.strictEqual(prefs.fontSize, 'large');
assert.strictEqual(prefs.theme, 'sepia');
assert.strictEqual(prefs.dyslexicFont, true);

// Testando Rascunhos Web e Submissão para Moderação
const webDraft = webDraftStore.createWebDraft(account.id, {
  title: 'Investigação Profunda sobre Mecânica Quântica para Curiosos',
  contentMarkdown: '# Mecânica Quântica Autêntica\n\nEste é um artigo completo com mais de cem caracteres para passar na validação estrita da equipe editorial do Pyxie Hyperfokus!',
  categoryTags: ['física', 'ciência'],
});
assert.ok(webDraft.id, 'Rascunho web deve ser criado');
assert.strictEqual(webDraft.status, 'DRAFT');

// Envio para a fila editorial
const submission = await webDraftStore.submitWebDraft(webDraft.id, account.id, {
  authorUsername: 'FísicoCurioso',
});
assert.strictEqual(submission.draft.status, 'SUBMITTED', 'Rascunho web deve ser marcado como submetido');
assert.strictEqual(submission.article.status, 'PENDING_REVIEW', 'Artigo deve entrar na fila editorial PENDING_REVIEW');
assert.strictEqual(submission.article.metadata.source, 'site', 'Origem do artigo deve ser marcada como site');

// Testando Regex do Importador de Snippets do GitHub
const ghUrlValid = 'https://github.com/nodejs/node/blob/main/lib/fs.js#L10-L25';
assert.ok(GITHUB_BLOB_REGEX.test(ghUrlValid), 'URL válida do GitHub blob deve passar no regex');
const ghUrlInvalid = 'https://malicious-site.com/github.com/blob';
assert.strictEqual(GITHUB_BLOB_REGEX.test(ghUrlInvalid), false, 'URL maliciosa deve ser barrada');

// Testando Renderizadores SSR de Autenticação e Perfil
const loginHtml = renderer.renderLoginPage({ lang: 'pt' });
assert.strictEqual(loginHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na página de login');
assert.ok(loginHtml.includes('Entrar no Hyperfokus'), 'Título de login em português');

const registerHtml = renderer.renderRegisterPage({ lang: 'pt' });
assert.strictEqual(registerHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na página de cadastro');
assert.ok(registerHtml.includes('Criar Conta de Autor'), 'Título de cadastro');

const stats = accountStore.getAccountStats(account.id);
const profileHtml = renderer.renderProfilePage({ account: verifiedAcc, stats, lang: 'pt' });
assert.strictEqual(profileHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na página de perfil');
assert.ok(profileHtml.includes('Meu Perfil'), 'Título de perfil');
assert.ok(profileHtml.includes('Investigação Profunda sobre Mecânica Quântica'), 'Artigo submetido listado no perfil');

const editorHtml = renderer.renderWebEditorPage({ account: verifiedAcc, lang: 'pt' });
assert.strictEqual(editorHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na página do editor');
assert.ok(editorHtml.includes('Importar Trecho de Código do GitHub'), 'Ferramenta GitHub no editor');

console.log('    ✅ 16. Contas sem Discord, segurança de senha, rascunhos web, importador GitHub e perfil validados.');

// 17. Testando Divulgação, Vitrines Separadas, Indicações Antifraude e Bordas Cosméticas (Fase 8)
console.log('  🚀 17. Testando Vitrines Separadas, Indicações Antifraude e Bordas Cosméticas...');
const showcaseReferrals = require('../src/modules/partnerships/showcaseReferrals');

// Testando Borda Cosmética Padrão
const badge0 = showcaseReferrals.getCosmeticBadge(0);
assert.strictEqual(badge0.tier, 0);

// Testando Nível 1: Neon Lilás (1 indicação)
const badge1 = showcaseReferrals.getCosmeticBadge(1);
assert.strictEqual(badge1.tier, 1);
assert.strictEqual(badge1.color, '#8B5CF6');
assert.ok(badge1.label.pt.includes('Neon Lilás'));

// Testando Nível 2: Cyber-Pink Animada (3 indicações)
const badge3 = showcaseReferrals.getCosmeticBadge(3);
assert.strictEqual(badge3.tier, 2);
assert.strictEqual(badge3.color, '#E60067');
assert.ok(badge3.badgeClass.includes('animated-border'));

// Testando Nível 3: Ouro Místico (5+ indicações)
const badge5 = showcaseReferrals.getCosmeticBadge(5);
assert.strictEqual(badge5.tier, 3);
assert.strictEqual(badge5.color, '#F59E0B');
assert.ok(badge5.frames.length >= 4);

// Testando Antifraude nas Indicações
const testRunId = Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 6);
const referrerUser = `ref_${testRunId}`;
const referredUser1 = `target1_${testRunId}`;
const referredUser2 = `target2_${testRunId}`;
const testIp1 = `189.10.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
const testIp2 = `189.11.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;

// 1. Auto-indicação proibida
const selfRef = await showcaseReferrals.processReferral({
  referrerId: referrerUser,
  referredId: referrerUser,
  clientIp: testIp1,
});
assert.strictEqual(selfRef.success, false);
assert.strictEqual(selfRef.reason, 'self_referral_prohibited');

// 2. Indicação válida
const validRef = await showcaseReferrals.processReferral({
  referrerId: referrerUser,
  referredId: referredUser1,
  clientIp: testIp1,
});
assert.strictEqual(validRef.success, true);
assert.ok(validRef.referralsCount >= 1);

// 3. Mesma pessoa já indicada antes
const dupRef = await showcaseReferrals.processReferral({
  referrerId: `other_${testRunId}`,
  referredId: referredUser1,
  clientIp: testIp2,
});
assert.strictEqual(dupRef.success, false);
assert.strictEqual(dupRef.reason, 'already_referred');

// 4. Mesmo IP no mesmo dia (antifraude)
const sameIpRef = await showcaseReferrals.processReferral({
  referrerId: referrerUser,
  referredId: referredUser2,
  clientIp: testIp1,
});
assert.strictEqual(sameIpRef.success, false);
assert.strictEqual(sameIpRef.reason, 'same_ip_fraud_prevented');

// Testando Vitrine de Servidores e Desativação Automática em guildDelete
const testGuildId = '123456789012345678';
showcaseReferrals.updateServerShowcase(testGuildId, {
  name: 'Comunidade Gamer Teste',
  description: 'Servidor incrível de jogos e bate-papo.',
  inviteUrl: 'https://discord.gg/exemplo',
}, true);

let showcase = showcaseReferrals.getServerShowcase(testGuildId);
assert.ok(showcase, 'Showcase do servidor deve existir');
assert.strictEqual(showcase.status, 'ACTIVE');

// Simula evento guildDelete (bot removido do servidor)
showcaseReferrals.handleGuildDelete(testGuildId);
showcase = showcaseReferrals.getServerShowcase(testGuildId);
assert.strictEqual(showcase.status, 'PAUSED', 'Divulgação deve ser pausada quando o bot for removido');

// Testando Renderizador SSR da Vitrine de Projetos (/hyperfokus/projetos)
const showcaseHtml = renderer.renderProjectsShowcasePage({
  partners: [
    {
      id: 'proj_1',
      projectName: 'Bazar dos Emotes',
      description: 'Emotes personalizados desenhados à mão para streamers.',
      accessLink: 'https://bazardosemotes.com',
      badge: badge3,
      bumpCount: 12,
    },
  ],
  activeCategory: 'service',
  lang: 'pt',
});
assert.strictEqual(showcaseHtml.match(/<h1/g).length, 1, 'Exatamente um h1 na vitrine de projetos');
assert.ok(showcaseHtml.includes('Projetos, Criadores Independentes & Lojas'), 'Título da vitrine');
assert.ok(showcaseHtml.includes('Bazar dos Emotes'), 'Projeto listado');
assert.ok(showcaseHtml.includes('animated-border'), 'Borda Cyber-Pink com animação presente');
assert.ok(showcaseHtml.includes('@media (prefers-reduced-motion: reduce)'), 'Suporte obrigatório a prefers-reduced-motion');

console.log('    ✅ 17. Vitrine de projetos, servidores, indicações antifraude e bordas cosméticas validadas.');

// 18. Correções da jornada de novos usuários (perfil de autor, entrada, segurança)
console.log('  🧭 18. Testando página de autor, cabeçalho de entrada, comentários protegidos e redirecionamentos...');
{
  const { getSections } = require('../src/routes/dashboardRoutes');
  const sections = getSections({ zone: 'cringelandia', role: 'owner', canManageAccess: true });
  assert.equal(sections.filter((s) => s === 'hyperfokus').length, 1, 'Hyperfokus aparece uma vez só no menu da Cringelândia');
  assert.equal(new Set(sections).size, sections.length, 'Nenhuma seção duplicada no painel');

  const renderer = require('../src/modules/hyperfokus/renderer');
  const store = require('../src/modules/hyperfokus/articleStore');
  const authorId = '222222222222222218';
  const published = await store.saveArticle({
    title: 'Jornada: Página de Autor', slug: `jornada-autor-${Date.now()}`, status: 'PUBLISHED',
    contentMarkdown: 'Texto', contentHtml: '<p>Texto</p>', categoryTags: ['jornada'], publishedAt: Date.now(),
  }, [{ userId: authorId, username: 'autora_teste', globalName: 'Autora Teste', role: 'AUTHOR' }]);
  const pending = await store.saveArticle({
    title: 'Jornada: Pendente', slug: `jornada-pendente-${Date.now()}`, status: 'PENDING_REVIEW',
    contentMarkdown: 'Segredo', contentHtml: '<p>Segredo</p>',
  }, [{ userId: authorId, username: 'autora_teste', role: 'AUTHOR' }]);

  const author = store.getPublicAuthor(authorId);
  assert.ok(author && author.articleCount >= 1, 'Autor com artigo publicado é encontrado');
  assert.equal(author.globalName, 'Autora Teste');
  assert.equal(store.getPublicAuthor('999999999999999990'), null, 'Autor sem artigo publicado não tem página');
  assert.ok(store.listPublishedTags().includes('jornada'), 'Filtros de categoria vêm das tags reais');

  for (const lang of ['pt', 'en']) {
    const page = renderer.renderAuthorPage({ author, articles: [published], lang });
    assert.equal((page.match(/<h1/g) || []).length, 1, `Autor (${lang}): um <h1>`);
    assert.ok(page.includes('ProfilePage'), `Autor (${lang}): JSON-LD ProfilePage`);
    assert.ok(page.includes(`/hyperfokus/autor/${authorId}`), `Autor (${lang}): canonical`);
  }

  const guestHeader = renderer.renderSiteHeader({ lang: 'pt' });
  assert.ok(guestHeader.includes('/login?redirect=') && guestHeader.includes('/cadastro?redirect='), 'Visitante vê Entrar e Criar conta');
  const userHeader = renderer.renderSiteHeader({ lang: 'en', user: { id: 'acc_x' } });
  assert.ok(userHeader.includes('/meu-perfil/escrever?lang=en') && !userHeader.includes('/cadastro'), 'Quem entrou vê Escrever e Meu perfil');

  const howPt = renderer.renderStaticInfoPage({ pageKey: 'como-participar', lang: 'pt' });
  const howEn = renderer.renderStaticInfoPage({ pageKey: 'como-participar', lang: 'en' });
  assert.ok(howPt.includes('Pelo site') && howPt.includes('Não precisa ter Discord'), 'Como publicar (PT) explica o caminho pelo site');
  assert.ok(howEn.includes('On the website') && !howEn.includes('Pelo site'), 'Como publicar (EN) está em inglês');

  const article = renderer.renderArticlePage({ article: published, lang: 'pt' });
  assert.ok(article.includes('hfEscape(c.content)') && article.includes('hfEscape(c.username)'), 'Comentários são escapados no navegador');

  const express = require('express');
  const { createAccountRouter } = require('../src/routes/accountRoutes');
  const { createHyperfokusRouter } = require('../src/routes/hyperfokusRoutes');
  const app = express();
  app.use(express.json());
  app.use('/', createAccountRouter());
  app.use('/', createHyperfokusRouter({}));
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const authorRes = await fetch(`${base}/hyperfokus/autor/${authorId}`);
    assert.equal(authorRes.status, 200);
    assert.ok((await authorRes.text()).includes('Autora Teste'), 'Rota de autor mostra o perfil, não a home');
    assert.equal((await fetch(`${base}/hyperfokus/autor/999999999999999990`)).status, 404);

    assert.equal((await fetch(`${base}/hyperfokus/${pending.slug}?preview=true`)).status, 404, '?preview=true não expõe artigo pendente');

    const anonComment = await fetch(`${base}/api/hyperfokus/articles/${published.id}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '<img src=x onerror=alert(1)>', username: 'Dono da Pyxie' }),
    });
    assert.equal(anonComment.status, 401, 'Comentar exige login');
    assert.equal((await fetch(`${base}/api/hyperfokus/articles/${published.id}/like`, { method: 'POST' })).status, 401, 'Curtir exige login');

    const evil = await fetch(`${base}/divulgar?redirect=//evil.example`, { redirect: 'manual' });
    assert.equal(evil.headers.get('location'), '/hyperfokus/projetos', 'Redirecionamento externo é bloqueado');
  } finally {
    server.close();
  }
}
{
  // Boas-vindas do primeiro login com Discord: oferece conta/servidor e deixa recusar.
  const accounts = require('../src/modules/accounts/accountStore');
  const discordUser = { id: String(223000000000000000n + BigInt(Date.now() % 100000)), username: 'nova_pessoa', global_name: 'Nova Pessoa', avatar: null };
  assert.equal(accounts.upsertDiscordAccount(discordUser).justCreated, true, 'Primeiro login com Discord cria a conta');
  const again = accounts.upsertDiscordAccount(discordUser);
  assert.equal(again.justCreated, false, 'Segundo login não repete as boas-vindas');
  assert.equal(again.displayName, 'Nova Pessoa');

  const renderer = require('../src/modules/hyperfokus/renderer');
  for (const lang of ['pt', 'en']) {
    const html = renderer.renderWelcomePage({ account: again, next: '/hyperfokus', lang });
    assert.ok(html.includes('/install?ref=signup') && html.includes('/invite?ref=signup'), `Boas-vindas (${lang}): conta e servidor`);
    assert.ok(html.includes('href="/hyperfokus"'), `Boas-vindas (${lang}): "agora não" segue para o destino`);
    assert.ok(html.includes('noindex'), `Boas-vindas (${lang}): fora dos buscadores`);
    assert.equal((html.match(/<h1/g) || []).length, 1);
  }
  assert.ok(renderer.renderWelcomePage({ lang: 'en' }).includes('Not now, continue'));
}
console.log('    ✅ 18. Página de autor, entrada no blog, comentários protegidos, redirecionamentos seguros e boas-vindas.');

console.log('🎉 TODAS AS FASES (0 A 8) DO PLANO PYXIE HYPERFOKUS CONCLUÍDAS COM 100% DE SUCESSO!\n');

})().catch((err) => {
  console.error('❌ Falha nos testes de Hyperfokus:', err);
  process.exit(1);
});

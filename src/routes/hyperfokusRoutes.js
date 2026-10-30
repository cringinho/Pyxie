const express = require('express');
const path = require('node:path');
const articleStore = require('../modules/hyperfokus/articleStore');
const analyticsEngine = require('../modules/hyperfokus/analyticsEngine');
const accountStore = require('../modules/accounts/accountStore');
const webDraftStore = require('../modules/hyperfokus/webDraftStore');
const accountSessions = require('../services/accountSessions');
const {
  renderHomePage,
  renderArticlePage,
  renderStaticInfoPage,
  renderLoginPage,
  renderRegisterPage,
  renderProfilePage,
  renderWebEditorPage,
  renderProjectsShowcasePage,
} = require('../modules/hyperfokus/renderer');
const partnershipManager = require('../modules/partnerships/partnershipManager');
const showcaseReferrals = require('../modules/partnerships/showcaseReferrals');
const { generateBlogRssXml, generateSitemapXml } = require('../modules/hyperfokus/seoEngine');
const { generateOgCard, generatePinterestPin, generateWatermarkedShareImage } = require('../modules/hyperfokus/imageCards');

function createHyperfokusRouter({ publicDir } = {}) {
  const router = express.Router();
  const fallback404 = publicDir ? path.join(publicDir, '404.html') : null;

  // 1. RSS / Atom Feed do Blog
  router.get('/hyperfokus/rss.xml', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.send(generateBlogRssXml(lang));
  });

  // 2. Sitemap dedicado do Hyperfokus
  router.get(['/sitemap-hyperfokus.xml', '/hyperfokus/sitemap.xml'], (req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(generateSitemapXml());
  });

  // 3. Páginas Institucionais
  router.get('/hyperfokus/como-participar', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(renderStaticInfoPage({ pageKey: 'como-participar', lang }));
  });

  router.get('/hyperfokus/termos-e-regras', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(renderStaticInfoPage({ pageKey: 'termos-e-regras', lang }));
  });

  // 4. Imagens Dinâmicas (OG 1200x630, Pinterest Pin 1000x1500 e Share Watermark)
  router.get('/api/hyperfokus/og/:id', async (req, res) => {
    try {
      const art = articleStore.getArticleById(req.params.id) || articleStore.getArticleBySlug(req.params.id);
      if (!art) return res.status(404).send('Not found');
      const buffer = await generateOgCard(art);
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(buffer);
    } catch (err) {
      console.error('[API Hyperfokus OG] Erro:', err.message);
      return res.status(500).send('Erro ao renderizar imagem');
    }
  });

  router.get('/api/hyperfokus/pin/:id', async (req, res) => {
    try {
      const art = articleStore.getArticleById(req.params.id) || articleStore.getArticleBySlug(req.params.id);
      if (!art) return res.status(404).send('Not found');
      const buffer = await generatePinterestPin(art);
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(buffer);
    } catch (err) {
      console.error('[API Hyperfokus Pin] Erro:', err.message);
      return res.status(500).send('Erro ao renderizar pin');
    }
  });

  router.get('/api/hyperfokus/share-image/:id', async (req, res) => {
    try {
      const art = articleStore.getArticleById(req.params.id) || articleStore.getArticleBySlug(req.params.id);
      if (!art) return res.status(404).send('Not found');
      const ogBuffer = await generateOgCard(art);
      const watermarked = await generateWatermarkedShareImage(ogBuffer);
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(watermarked);
    } catch (err) {
      console.error('[API Hyperfokus Share Image] Erro:', err.message);
      return res.status(500).send('Erro ao gerar card compartilhado');
    }
  });

  // 5. Interações (Like e Comentários)
  router.post('/api/hyperfokus/articles/:id/like', (req, res) => {
    const userId = req.session?.userId || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'guest';
    const result = articleStore.toggleLike(req.params.id, userId);
    return res.json({ success: true, ...result });
  });

  // Beacon de Analytics (scroll, tempo ativo, cliques em afiliados e convite)
  router.post('/api/hyperfokus/beacon', express.json(), express.text({ type: '*/*' }), (req, res) => {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    analyticsEngine.recordBeacon({
      articleId: payload.articleId,
      ip,
      event: payload.event,
      depth: payload.depth,
      seconds: payload.seconds,
      target: payload.target,
    });
    return res.status(204).end();
  });

  router.get('/api/hyperfokus/articles/:id/comments', (req, res) => {
    const comments = articleStore.listComments(req.params.id);
    return res.json({ success: true, comments });
  });

  router.post('/api/hyperfokus/articles/:id/comments', (req, res) => {
    const { content, username } = req.body || {};
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: 'empty_content' });
    }

    const userId = req.session?.userId || req.headers['x-forwarded-for'] || 'guest';
    const authorName = username || req.session?.username || 'Leitor Autêntico';

    const comment = articleStore.addComment(req.params.id, {
      userId,
      username: authorName,
      content,
    });

    return res.json({ success: true, comment });
  });

  // 6. Home do Blog (/hyperfokus)
  router.get('/hyperfokus', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const tag = req.query.tag || null;
    const sort = req.query.sort || 'recent';
    const page = Math.max(1, Number(req.query.page) || 1);

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    analyticsEngine.recordPageView({
      articleId: 'global',
      ip: clientIp,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      utmSource: req.query.utm_source,
      searchTerm: tag || req.query.q,
    });

    const { items: articles, total, totalPages } = articleStore.listArticles({
      status: 'PUBLISHED',
      tag,
      sort,
      page,
      limit: 12,
    });

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(renderHomePage({
      articles,
      total,
      page,
      totalPages,
      activeTab: sort,
      activeTag: tag,
      lang,
    }));
  });

  // 7. Página de Categoria (/hyperfokus/categoria/:slug)
  router.get('/hyperfokus/categoria/:slug', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const tag = req.params.slug;
    const { items: articles, total, totalPages } = articleStore.listArticles({
      status: 'PUBLISHED',
      tag,
      page: 1,
      limit: 20,
    });

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(renderHomePage({
      articles,
      total,
      page: 1,
      totalPages,
      activeTag: tag,
      lang,
    }));
  });

  // 8. Página de Autor (/hyperfokus/autor/:userId)
  router.get('/hyperfokus/autor/:userId', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const userId = req.params.userId;
    const { items: articles, total, totalPages } = articleStore.listArticles({
      status: 'PUBLISHED',
      authorId: userId,
      page: 1,
      limit: 20,
    });

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(renderHomePage({
      articles,
      total,
      page: 1,
      totalPages,
      activeTag: null,
      lang,
    }));
  });

  // 9. Artigo Completo (/hyperfokus/:slug)
  router.get('/hyperfokus/:slug', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const slug = req.params.slug;
    const article = articleStore.getArticleBySlug(slug) || articleStore.getArticleById(slug);

    if (!article) {
      if (fallback404) return res.status(404).sendFile(fallback404);
      return res.status(404).send('Artigo não encontrado');
    }

    // Apenas artigos publicados são públicos (a menos que seja o dono em modo preview)
    const isOwner = req.session?.userId === '214153735281180673';
    if (article.status !== 'PUBLISHED' && !isOwner && req.query.preview !== 'true') {
      if (fallback404) return res.status(404).sendFile(fallback404);
      return res.status(404).send('Artigo não disponível');
    }

    // Incrementa contagem de visualizações
    articleStore.updateArticle(article.id, {
      viewsCount: (article.viewsCount || 0) + 1,
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    analyticsEngine.recordPageView({
      articleId: article.id,
      ip: clientIp,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      utmSource: req.query.utm_source,
    });

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(renderArticlePage({
      article,
      lang,
      user: req.session || null,
    }));
  });

  // 10. Páginas de Autenticação e Perfil de Autor (Fase 7)
  router.get('/login', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const redirect = req.query.redirect || '/meu-perfil';
    const cookie = accountSessions.getCookie(req);
    const session = accountSessions.readSession(cookie);
    if (session && session.accountId) {
      return res.redirect(redirect);
    }
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    return res.send(renderLoginPage({ lang, redirect }));
  });

  router.get('/cadastro', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const redirect = req.query.redirect || '/meu-perfil';
    const cookie = accountSessions.getCookie(req);
    const session = accountSessions.readSession(cookie);
    if (session && session.accountId) {
      return res.redirect(redirect);
    }
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    return res.send(renderRegisterPage({ lang, redirect }));
  });

  router.get('/meu-perfil', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const cookie = accountSessions.getCookie(req);
    const session = accountSessions.readSession(cookie);
    if (!session || !session.accountId) {
      return res.redirect(`/login?redirect=${encodeURIComponent('/meu-perfil')}${lang === 'en' ? '&lang=en' : ''}`);
    }

    const account = accountStore.getAccountById(session.accountId);
    if (!account) {
      accountSessions.clearCookie(res);
      return res.redirect('/login');
    }

    const stats = accountStore.getAccountStats(account.id);
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'private, no-cache');
    return res.send(renderProfilePage({ account, stats, lang }));
  });

  router.get('/meu-perfil/escrever', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const cookie = accountSessions.getCookie(req);
    const session = accountSessions.readSession(cookie);
    if (!session || !session.accountId) {
      return res.redirect(`/login?redirect=${encodeURIComponent('/meu-perfil/escrever')}${lang === 'en' ? '&lang=en' : ''}`);
    }

    const account = accountStore.getAccountById(session.accountId);
    if (!account) {
      accountSessions.clearCookie(res);
      return res.redirect('/login');
    }

    let draft = null;
    if (req.query.draftId) {
      draft = webDraftStore.getWebDraft(req.query.draftId, account.id);
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'private, no-cache');
    return res.send(renderWebEditorPage({ account, draft, lang }));
  });

  // 11. Vitrine de Projetos & Criadores (Fase 8)
  router.get('/hyperfokus/projetos', (req, res) => {
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    const category = req.query.category || 'all';

    const partnersCatalog = partnershipManager.getPartnershipCatalog(category !== 'all' ? category : null);
    const partnersList = (partnersCatalog.partners || []).map((p) => {
      const stats = showcaseReferrals.getReferralStats(p.ownerId || p.id);
      return {
        ...p,
        badge: stats.badge,
        referralsCount: stats.count,
      };
    });

    // Ordenação: badges com maior prioridade vêm primeiro (Cyber-Pink, Gold)
    partnersList.sort((a, b) => (b.badge?.priority || 0) - (a.badge?.priority || 0));

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.send(renderProjectsShowcasePage({
      partners: partnersList,
      activeCategory: category,
      lang,
    }));
  });

  // 12. Rota de Indicação com Cookie Antifraude (/divulgar?ref={snowflake})
  router.get(['/divulgar', '/invite-ref'], (req, res) => {
    const ref = req.query.ref;
    if (ref && typeof ref === 'string' && /^\d{17,20}$/.test(ref.trim())) {
      res.setHeader('Set-Cookie', `pyxie_referrer=${encodeURIComponent(ref.trim())}; Path=/; Max-Age=2592000; SameSite=Lax`);
    }
    const redirectUrl = req.query.redirect || '/hyperfokus/projetos';
    return res.redirect(redirectUrl);
  });

  return router;
}

module.exports = {
  createHyperfokusRouter,
};


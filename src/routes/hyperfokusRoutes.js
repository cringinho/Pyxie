const express = require('express');
const path = require('node:path');
const articleStore = require('../modules/hyperfokus/articleStore');
const { renderHomePage, renderArticlePage, renderStaticInfoPage } = require('../modules/hyperfokus/renderer');
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

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(renderArticlePage({
      article,
      lang,
      user: req.session || null,
    }));
  });

  return router;
}

module.exports = {
  createHyperfokusRouter,
};

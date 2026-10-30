const path = require('node:path');
const fs = require('node:fs');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const schema = require('../../database/schema');

function getArticlesJsonFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'hyperfokus', 'articles.json');
}

function loadJsonStore() {
  return readJson(getArticlesJsonFile(), {
    articles: {},
    authors: {},
    likes: {},
    comments: {},
    pins: {},
    analytics: {},
  });
}

function saveJsonStore(store) {
  return writeJsonAtomic(getArticlesJsonFile(), store);
}

function getDb() {
  try {
    const { db } = require('../../database');
    return db || null;
  } catch (_) {
    return null;
  }
}

/**
 * Cria ou atualiza um artigo com seus autores.
 */
async function saveArticle(articleData, authors = []) {
  const now = new Date();
  const id = articleData.id || `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const slug = articleData.slug || id;

  const articleRecord = {
    id,
    slug,
    discordThreadId: articleData.discordThreadId || null,
    title: articleData.title || 'Sem título',
    seoTitle: articleData.seoTitle || null,
    metaDescription: articleData.metaDescription || null,
    contentMarkdown: articleData.contentMarkdown || '',
    contentHtml: articleData.contentHtml || '',
    coverImage: articleData.coverImage || null,
    categoryTags: Array.isArray(articleData.categoryTags) ? articleData.categoryTags : [],
    status: articleData.status || 'PENDING_REVIEW',
    viewsCount: Number(articleData.viewsCount || 0),
    likesCount: Number(articleData.likesCount || 0),
    commentsCount: Number(articleData.commentsCount || 0),
    readingTimeMinutes: Number(articleData.readingTimeMinutes || 1),
    featured: Number(articleData.featured ? 1 : 0),
    publishedAt: articleData.publishedAt ? new Date(articleData.publishedAt) : null,
    updatedAt: now,
    createdAt: articleData.createdAt ? new Date(articleData.createdAt) : now,
    editedBy: articleData.editedBy || null,
    metadata: articleData.metadata || {},
  };

  // 1. Persistência primária JSON (garante integridade mesmo sem Postgres ativo)
  const store = loadJsonStore();
  store.articles[id] = { ...articleRecord, updatedAt: Date.now(), createdAt: articleRecord.createdAt.getTime() };
  
  store.authors[id] = (authors || []).map((a, idx) => ({
    id: `${id}:${a.userId}`,
    articleId: id,
    userId: String(a.userId),
    username: a.username || 'Autor',
    globalName: a.globalName || null,
    cachedAvatarWebp: a.cachedAvatarWebp || null,
    role: a.role || (idx === 0 ? 'AUTHOR' : 'COLLABORATOR'),
    orderIndex: idx,
    createdAt: Date.now(),
  }));
  saveJsonStore(store);

  // 2. Persistência Drizzle / Postgres (quando disponível)
  const db = getDb();
  if (db) {
    try {
      await db.insert(schema.hyperfokusArticles).values(articleRecord).onConflictDoUpdate({
        target: schema.hyperfokusArticles.id,
        set: articleRecord,
      });
      for (const author of store.authors[id]) {
        await db.insert(schema.hyperfokusArticleAuthors).values(author).onConflictDoUpdate({
          target: schema.hyperfokusArticleAuthors.id,
          set: author,
        });
      }
    } catch (err) {
      // Postgres pode não estar rodando em ambiente local/CI
    }
  }

  return { ...articleRecord, authors: store.authors[id] };
}

function getArticleById(id) {
  if (!id) return null;
  const store = loadJsonStore();
  const art = store.articles[String(id)];
  if (!art) return null;
  return { ...art, authors: store.authors[String(id)] || [] };
}

function getArticleBySlug(slug) {
  if (!slug) return null;
  const store = loadJsonStore();
  const target = Object.values(store.articles).find((a) => a.slug === slug);
  if (!target) return null;
  return { ...target, authors: store.authors[target.id] || [] };
}

function getArticleByThreadId(threadId) {
  if (!threadId) return null;
  const store = loadJsonStore();
  const target = Object.values(store.articles).find((a) => a.discordThreadId === String(threadId));
  if (!target) return null;
  return { ...target, authors: store.authors[target.id] || [] };
}

function listArticles({ status = null, tag = null, authorId = null, page = 1, limit = 20, sort = 'recent' } = {}) {
  const store = loadJsonStore();
  let list = Object.values(store.articles);

  if (status) {
    list = list.filter((a) => a.status === status);
  }
  if (tag) {
    list = list.filter((a) => a.categoryTags && a.categoryTags.includes(tag));
  }
  if (authorId) {
    const aid = String(authorId);
    list = list.filter((a) => {
      const authors = store.authors[a.id] || [];
      return authors.some((aut) => aut.userId === aid);
    });
  }

  // Ordenação
  if (sort === 'likes') {
    list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  } else if (sort === 'comments') {
    list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
  } else {
    // recent
    list.sort((a, b) => (b.publishedAt || b.createdAt || 0) - (a.publishedAt || a.createdAt || 0));
  }

  const total = list.length;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(50, Math.max(1, Number(limit) || 20));
  const offset = (p - 1) * l;
  const items = list.slice(offset, offset + l).map((a) => ({
    ...a,
    authors: store.authors[a.id] || [],
  }));

  return {
    items,
    total,
    page: p,
    totalPages: Math.ceil(total / l) || 1,
  };
}

// Tags dos artigos publicados, mais usadas primeiro (filtros da home e das categorias).
function listPublishedTags(limit = 12) {
  const store = loadJsonStore();
  const counts = new Map();
  Object.values(store.articles)
    .filter((a) => a.status === 'PUBLISHED')
    .forEach((a) => (a.categoryTags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

// Dados públicos de um autor: o registro mais recente dele entre os artigos publicados
// (últimos dados conhecidos, mesmo se a conta do Discord sumir) e os totais.
function getPublicAuthor(userId) {
  const aid = String(userId || '');
  if (!/^[\w-]{1,40}$/.test(aid)) return null;
  const store = loadJsonStore();
  let latest = null;
  let latestAt = -1;
  let articleCount = 0;
  let likes = 0;
  for (const art of Object.values(store.articles)) {
    if (art.status !== 'PUBLISHED') continue;
    const entry = (store.authors[art.id] || []).find((a) => a.userId === aid);
    if (!entry) continue;
    articleCount += 1;
    likes += art.likesCount || 0;
    const at = Number(new Date(art.publishedAt || art.createdAt || 0));
    if (at > latestAt) { latestAt = at; latest = entry; }
  }
  if (!latest) return null;
  return {
    userId: aid,
    username: latest.username,
    globalName: latest.globalName || null,
    cachedAvatarWebp: latest.cachedAvatarWebp || null,
    articleCount,
    likes,
  };
}

function updateArticle(id, updates = {}) {
  const store = loadJsonStore();
  const existing = store.articles[String(id)];
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: Date.now(),
  };
  store.articles[String(id)] = updated;
  saveJsonStore(store);
  return { ...updated, authors: store.authors[String(id)] || [] };
}

function hasLiked(articleId, userId) {
  if (!articleId || !userId) return false;
  const store = loadJsonStore();
  return Boolean(store.likes[`${articleId}:${userId}`]);
}

function toggleLike(articleId, userId) {
  if (!articleId || !userId) return { liked: false, likesCount: 0 };
  const store = loadJsonStore();
  const art = store.articles[String(articleId)];
  if (!art) return { liked: false, likesCount: 0 };

  const likeKey = `${articleId}:${userId}`;
  let liked = false;
  if (store.likes[likeKey]) {
    delete store.likes[likeKey];
    art.likesCount = Math.max(0, (art.likesCount || 0) - 1);
    liked = false;
  } else {
    store.likes[likeKey] = { articleId, userId, createdAt: Date.now() };
    art.likesCount = (art.likesCount || 0) + 1;
    liked = true;
  }
  saveJsonStore(store);
  return { liked, likesCount: art.likesCount };
}

function addComment(articleId, { userId, username, cachedAvatarWebp, content }) {
  if (!articleId || !userId || !content) return null;
  const store = loadJsonStore();
  const art = store.articles[String(articleId)];
  if (!art) return null;

  const id = `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const comment = {
    id,
    articleId: String(articleId),
    userId: String(userId),
    username: String(username || 'Membro'),
    cachedAvatarWebp: cachedAvatarWebp || null,
    content: String(content).slice(0, 1000),
    hidden: 0,
    createdAt: Date.now(),
  };

  if (!store.comments[String(articleId)]) store.comments[String(articleId)] = [];
  store.comments[String(articleId)].unshift(comment);
  art.commentsCount = (art.commentsCount || 0) + 1;
  saveJsonStore(store);
  return comment;
}

function listComments(articleId) {
  const store = loadJsonStore();
  const list = store.comments[String(articleId)] || [];
  return list.filter((c) => !c.hidden);
}

function exportBackup(dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())) {
  const store = loadJsonStore();
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  const backupDir = path.join(baseDir, 'backups', 'hyperfokus');
  fs.mkdirSync(backupDir, { recursive: true });

  const backupFile = path.join(backupDir, `backup_${dateStr}.json`);
  writeJsonAtomic(backupFile, store);

  // Limpeza de backups antigos (mantém os últimos 30)
  try {
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.startsWith('backup_') && f.endsWith('.json'))
      .sort();
    if (files.length > 30) {
      const toRemove = files.slice(0, files.length - 30);
      for (const rem of toRemove) {
        fs.unlinkSync(path.join(backupDir, rem));
      }
    }
  } catch (_) {}

  return backupFile;
}

module.exports = {
  listPublishedTags,
  getPublicAuthor,
  getArticlesJsonFile,
  loadJsonStore,
  saveJsonStore,
  saveArticle,
  getArticleById,
  getArticleBySlug,
  getArticleByThreadId,
  listArticles,
  updateArticle,
  hasLiked,
  toggleLike,
  addComment,
  listComments,
  exportBackup,
};

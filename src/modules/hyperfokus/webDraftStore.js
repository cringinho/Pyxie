const crypto = require('node:crypto');
const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const articleStore = require('./articleStore');
const { markdownToHtml } = require('./markdown');

function getWebDraftsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'hyperfokus', 'web_drafts.json');
}

function loadWebDraftsStore() {
  return readJson(getWebDraftsFile(), { drafts: {} });
}

function saveWebDraftsStore(store) {
  return writeJsonAtomic(getWebDraftsFile(), store);
}

function createWebDraft(accountId, { title = '', contentMarkdown = '', categoryTags = [], coverImage = '' } = {}) {
  if (!accountId) throw new Error('missing_account_id');
  const store = loadWebDraftsStore();

  const id = `wdraft_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();

  const draft = {
    id,
    accountId,
    title: String(title || '').slice(0, 200),
    contentMarkdown: String(contentMarkdown || ''),
    categoryTags: Array.isArray(categoryTags) ? categoryTags.slice(0, 5) : [],
    coverImage: coverImage ? String(coverImage).slice(0, 500) : null,
    status: 'DRAFT', // 'DRAFT' | 'SUBMITTED'
    articleId: null,
    createdAt: now,
    updatedAt: now,
  };

  store.drafts[id] = draft;
  saveWebDraftsStore(store);
  return draft;
}

function getWebDraft(draftId, accountId = null) {
  if (!draftId) return null;
  const store = loadWebDraftsStore();
  const draft = store.drafts[draftId];
  if (!draft) return null;
  if (accountId && draft.accountId !== accountId) return null;
  return draft;
}

function listUserDrafts(accountId) {
  if (!accountId) return [];
  const store = loadWebDraftsStore();
  return Object.values(store.drafts)
    .filter((d) => d.accountId === accountId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function updateWebDraft(draftId, accountId, patch = {}) {
  const store = loadWebDraftsStore();
  const draft = store.drafts[draftId];
  if (!draft) throw new Error('draft_not_found');
  if (draft.accountId !== accountId) throw new Error('permission_denied');

  if (patch.title !== undefined) draft.title = String(patch.title).slice(0, 200);
  if (patch.contentMarkdown !== undefined) draft.contentMarkdown = String(patch.contentMarkdown);
  if (patch.categoryTags !== undefined && Array.isArray(patch.categoryTags)) {
    draft.categoryTags = patch.categoryTags.slice(0, 5);
  }
  if (patch.coverImage !== undefined) {
    draft.coverImage = patch.coverImage ? String(patch.coverImage).slice(0, 500) : null;
  }

  draft.updatedAt = new Date().toISOString();
  saveWebDraftsStore(store);
  return draft;
}

function deleteWebDraft(draftId, accountId) {
  const store = loadWebDraftsStore();
  const draft = store.drafts[draftId];
  if (!draft) return false;
  if (draft.accountId !== accountId) throw new Error('permission_denied');

  delete store.drafts[draftId];
  saveWebDraftsStore(store);
  return true;
}

/**
 * Envia o rascunho web para a fila de moderação editorial do painel (/dashboard).
 */
async function submitWebDraft(draftId, accountId, { authorUsername = 'Autor Web', authorAvatar = null, discordUserId = null } = {}) {
  const store = loadWebDraftsStore();
  const draft = store.drafts[draftId];
  if (!draft) throw new Error('draft_not_found');
  if (draft.accountId !== accountId) throw new Error('permission_denied');

  if (!draft.title || draft.title.trim().length < 5) {
    throw new Error('title_too_short');
  }
  if (!draft.contentMarkdown || draft.contentMarkdown.trim().length < 100) {
    throw new Error('content_too_short');
  }

  // Gera HTML inicial sanitizado a partir do Markdown
  const contentHtml = markdownToHtml(draft.contentMarkdown);

  const authors = [
    {
      userId: discordUserId || `web_${accountId.slice(0, 12)}`,
      username: authorUsername,
      cachedAvatarWebp: authorAvatar || '/assets/pyxie/sticker/sticker_smile.png',
      role: 'AUTHOR',
    },
  ];

  // Cria artigo na fila editorial com status PENDING_REVIEW e source 'site'
  const article = await articleStore.saveArticle({
    title: draft.title,
    contentMarkdown: draft.contentMarkdown,
    contentHtml,
    coverImage: draft.coverImage,
    categoryTags: draft.categoryTags,
    status: 'PENDING_REVIEW',
    discordThreadId: null, // Submetido via web, sem thread no Discord
    metadata: {
      source: 'site',
      accountId,
      webDraftId: draft.id,
      submittedAt: new Date().toISOString(),
    },
  }, authors);

  draft.status = 'SUBMITTED';
  draft.articleId = article.id;
  draft.updatedAt = new Date().toISOString();
  saveWebDraftsStore(store);

  return { article, draft };
}

module.exports = {
  createWebDraft,
  getWebDraft,
  listUserDrafts,
  updateWebDraft,
  deleteWebDraft,
  submitWebDraft,
  loadWebDraftsStore,
  saveWebDraftsStore,
};

const path = require('node:path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');

function getDraftsFile() {
  const baseDir = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
  return path.join(baseDir, 'hyperfokus', 'drafts.json');
}

function loadAllDrafts() {
  return readJson(getDraftsFile(), {});
}

function saveAllDrafts(drafts) {
  return writeJsonAtomic(getDraftsFile(), drafts);
}

function getDraft(threadId) {
  if (!threadId) return null;
  const drafts = loadAllDrafts();
  return drafts[String(threadId)] || null;
}

function createOrUpdateDraft(threadId, data = {}) {
  if (!threadId) return null;
  const drafts = loadAllDrafts();
  const idStr = String(threadId);
  const now = Date.now();
  const existing = drafts[idStr] || {
    threadId: idStr,
    guildId: data.guildId || null,
    ownerId: data.ownerId || null,
    collaborators: [],
    status: 'DRAFT', // 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'
    stickyMessageId: null,
    tags: [],
    createdAt: now,
  };

  const updated = {
    ...existing,
    ...data,
    threadId: idStr,
    collaborators: Array.isArray(data.collaborators)
      ? [...new Set(data.collaborators.map(String))]
      : existing.collaborators,
    updatedAt: now,
  };

  drafts[idStr] = updated;
  saveAllDrafts(drafts);
  return updated;
}

function addCollaborator(threadId, userId) {
  if (!threadId || !userId) return null;
  const draft = getDraft(threadId);
  if (!draft) return null;
  const uId = String(userId);
  if (draft.ownerId === uId) return draft; // Dono já é o autor principal
  if (!draft.collaborators.includes(uId)) {
    draft.collaborators.push(uId);
    draft.updatedAt = Date.now();
    const drafts = loadAllDrafts();
    drafts[String(threadId)] = draft;
    saveAllDrafts(drafts);
  }
  return draft;
}

function removeCollaborator(threadId, userId) {
  if (!threadId || !userId) return null;
  const draft = getDraft(threadId);
  if (!draft) return null;
  const uId = String(userId);
  draft.collaborators = draft.collaborators.filter((id) => id !== uId);
  draft.updatedAt = Date.now();
  const drafts = loadAllDrafts();
  drafts[String(threadId)] = draft;
  saveAllDrafts(drafts);
  return draft;
}

function isAuthorOrCollaborator(threadId, userId) {
  if (!threadId || !userId) return false;
  const draft = getDraft(threadId);
  if (!draft) return false;
  const uId = String(userId);
  return draft.ownerId === uId || draft.collaborators.includes(uId);
}

function setStickyMessageId(threadId, messageId) {
  if (!threadId) return null;
  const drafts = loadAllDrafts();
  const draft = drafts[String(threadId)];
  if (!draft) return null;
  draft.stickyMessageId = messageId ? String(messageId) : null;
  draft.updatedAt = Date.now();
  saveAllDrafts(drafts);
  return draft;
}

function updateStatus(threadId, status) {
  if (!threadId || !status) return null;
  const drafts = loadAllDrafts();
  const draft = drafts[String(threadId)];
  if (!draft) return null;
  draft.status = status;
  draft.updatedAt = Date.now();
  saveAllDrafts(drafts);
  return draft;
}

function deleteDraft(threadId) {
  if (!threadId) return false;
  const drafts = loadAllDrafts();
  const idStr = String(threadId);
  if (!drafts[idStr]) return false;
  delete drafts[idStr];
  return saveAllDrafts(drafts);
}

module.exports = {
  getDraftsFile,
  loadAllDrafts,
  saveAllDrafts,
  getDraft,
  createOrUpdateDraft,
  addCollaborator,
  removeCollaborator,
  isAuthorOrCollaborator,
  setStickyMessageId,
  updateStatus,
  deleteDraft,
};


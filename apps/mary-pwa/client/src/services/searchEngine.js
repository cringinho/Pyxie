import MiniSearch from 'minisearch';
import { get, set } from 'idb-keyval';

const CACHE_KEY = 'mary_cached_memories_v1';

let miniSearchInstance = null;

export function initSearchEngine(memories = []) {
  miniSearchInstance = new MiniSearch({
    fields: ['title', 'content', 'tagsStr', 'location', 'authorName', 'mood'],
    storeFields: ['id', 'title', 'memoryDate', 'authorName'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 2.5, tagsStr: 2, content: 1 }
    }
  });

  const docs = memories.map((m) => ({
    id: m.id,
    title: m.title || '',
    content: m.content || '',
    tagsStr: Array.isArray(m.tags) ? m.tags.join(' ') : (m.tags || ''),
    location: m.location || '',
    authorName: m.author?.nickname || m.author?.displayName || '',
    mood: m.mood || '',
    memoryDate: m.memoryDate
  }));

  miniSearchInstance.addAll(docs);
  return miniSearchInstance;
}

export function searchMemories(query, memories = []) {
  if (!query || !query.trim()) {
    return memories;
  }

  if (!miniSearchInstance) {
    initSearchEngine(memories);
  }

  const results = miniSearchInstance.search(query.trim());
  const matchedIds = new Set(results.map(r => r.id));

  return memories.filter(m => matchedIds.has(m.id));
}

export async function persistMemoriesToCache(memories) {
  try {
    await set(CACHE_KEY, memories);
  } catch (err) {
    console.warn('[SearchEngine] Falha ao persistir no IndexedDB:', err);
  }
}

export async function loadMemoriesFromCache() {
  try {
    const cached = await get(CACHE_KEY);
    return Array.isArray(cached) ? cached : null;
  } catch (err) {
    console.warn('[SearchEngine] Falha ao carregar do IndexedDB:', err);
    return null;
  }
}

import { get, set } from 'idb-keyval';

const OFFLINE_QUEUE_KEY = 'mary_offline_memories_queue_v1';

export async function getOfflineQueue() {
  try {
    const queue = await get(OFFLINE_QUEUE_KEY);
    return Array.isArray(queue) ? queue : [];
  } catch (err) {
    return [];
  }
}

export async function enqueueOfflineMemory(memoryPayload) {
  const queue = await getOfflineQueue();
  const queueItem = {
    ...memoryPayload,
    queueId: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    queuedAt: new Date().toISOString()
  };
  queue.push(queueItem);
  await set(OFFLINE_QUEUE_KEY, queue);
  return queueItem;
}

export async function removeOfflineMemory(queueId) {
  const queue = await getOfflineQueue();
  const updated = queue.filter(item => item.queueId !== queueId);
  await set(OFFLINE_QUEUE_KEY, updated);
  return updated;
}

/**
 * Tenta enviar todas as memórias da fila offline para o servidor
 */
export async function syncOfflineQueue(onItemSynced) {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { synced: 0 };

  let syncedCount = 0;

  for (const item of queue) {
    try {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('content', item.content);
      formData.append('memoryDate', item.memoryDate);
      if (item.mood) formData.append('mood', item.mood);
      if (item.location) formData.append('location', item.location);
      if (item.tags) formData.append('tags', JSON.stringify(item.tags));

      const res = await fetch('/api/memories', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        await removeOfflineMemory(item.queueId);
        syncedCount++;
        if (onItemSynced) onItemSynced(data.memory);
      }
    } catch (err) {
      console.warn('[OfflineSync] Falha ao sincronizar item da fila:', err);
      break; // Interrompe para tentar novamente quando a conexão estiver firme
    }
  }

  return { synced: syncedCount };
}

/**
 * Registra ouvinte global para reconexão automática
 */
export function initOfflineSync(onItemSynced) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    console.log('🌐 [OfflineSync] Conexão restabelecida! Sincronizando fila...');
    syncOfflineQueue(onItemSynced);
  });
}

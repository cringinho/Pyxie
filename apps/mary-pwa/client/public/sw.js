const CACHE_NAME = 'mary-leh-universo-v1';
const STATIC_CACHE = 'mary-leh-static-v1';
const MEDIA_CACHE = 'mary-leh-media-v1';
const API_CACHE = 'mary-leh-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/badge-72.png'
];

// Instalação do Service Worker & Pre-cache dos ativos vitais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, MEDIA_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições com Estratégias Híbridas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outros esquemas (como chrome-extension) ou métodos não-GET
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Fontes Google e Ativos Estáticos do Bundle: CACHE-FIRST
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Mídias e Imagens de Uploads: STALE-WHILE-REVALIDATE
  if (url.pathname.startsWith('/api/uploads/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. APIs de Leitura (/api/memories, /api/gallery, /api/graph/data): NETWORK-FIRST COM FALLBACK
  if (
    url.pathname === '/api/memories' ||
    url.pathname === '/api/gallery' ||
    url.pathname === '/api/graph/data' ||
    url.pathname === '/api/couple'
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(JSON.stringify({ offline: true, error: 'Sem conexão no momento.' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 4. Páginas e Navegação SPA: Network com Fallback no index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }
});

// Evento de Notificação Push (Web Push API)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Nosso Universo — Mary & Leh ✨',
    body: 'Você recebeu uma novidade no app!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: '/?tab=feed' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique na Notificação Push: Abre ou foca a aba correspondente
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

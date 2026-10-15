import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import { coupleSettings, users } from './db/schema.js';
import { eq, ne } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@pyxie.com.br';

// Se não houver chaves configuradas no .env, gera automaticamente
if (!vapidPublicKey || !vapidPrivateKey) {
  try {
    const generated = webpush.generateVAPIDKeys();
    vapidPublicKey = generated.publicKey;
    vapidPrivateKey = generated.privateKey;
    process.env.VAPID_PUBLIC_KEY = vapidPublicKey;
    process.env.VAPID_PRIVATE_KEY = vapidPrivateKey;

    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/VAPID_PUBLIC_KEY=.*/, `VAPID_PUBLIC_KEY=${vapidPublicKey}`);
      envContent = envContent.replace(/VAPID_PRIVATE_KEY=.*/, `VAPID_PRIVATE_KEY=${vapidPrivateKey}`);
      if (!envContent.includes('VAPID_PUBLIC_KEY=')) {
        envContent += `\nVAPID_PUBLIC_KEY=${vapidPublicKey}\nVAPID_PRIVATE_KEY=${vapidPrivateKey}\n`;
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('🔑 [Push] Chaves VAPID geradas e salvas com sucesso no .env!');
    }
  } catch (err) {
    console.warn('[Push] Aviso ao salvar chaves VAPID no .env:', err.message);
  }
}

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (vapidErr) {
  console.warn('[Push] Aviso ao inicializar VAPID:', vapidErr.message);
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}

/**
 * Lê todas as assinaturas salvas
 */
export function getStoredSubscriptions() {
  try {
    const settings = db.select().from(coupleSettings).get();
    if (settings?.pushSubscriptionsJson) {
      return JSON.parse(settings.pushSubscriptionsJson);
    }
  } catch (e) {
    console.warn('[Push] Erro ao ler assinaturas:', e);
  }
  return [];
}

/**
 * Salva uma nova assinatura de push
 */
export function saveSubscription(userId, subscription) {
  if (!subscription || !subscription.endpoint) return;

  const list = getStoredSubscriptions();
  // Remove assinatura duplicada com o mesmo endpoint
  const filtered = list.filter(item => item.subscription?.endpoint !== subscription.endpoint);

  filtered.push({
    userId,
    subscription,
    createdAt: new Date().toISOString()
  });

  const updatedJson = JSON.stringify(filtered);
  const existing = db.select().from(coupleSettings).get();

  if (existing) {
    db.update(coupleSettings)
      .set({ pushSubscriptionsJson: updatedJson })
      .where(eq(coupleSettings.id, existing.id))
      .run();
  } else {
    db.insert(coupleSettings).values({
      anniversaryDate: '2026-01-30',
      pushSubscriptionsJson: updatedJson
    }).run();
  }

  console.log(`📱 [Push] Nova assinatura registrada para o usuário #${userId}`);
}

/**
 * Remove uma assinatura quando o usuário desativa ou o token expira
 */
export function removeSubscriptionByEndpoint(endpoint) {
  const list = getStoredSubscriptions();
  const filtered = list.filter(item => item.subscription?.endpoint !== endpoint);
  const updatedJson = JSON.stringify(filtered);

  const existing = db.select().from(coupleSettings).get();
  if (existing) {
    db.update(coupleSettings)
      .set({ pushSubscriptionsJson: updatedJson })
      .where(eq(coupleSettings.id, existing.id))
      .run();
  }
}

/**
 * Envia notificação push para o parceiro
 */
export async function sendPushToPartner(senderUserId, payload) {
  const list = getStoredSubscriptions();
  const partnerSubs = list.filter(item => item.userId !== senderUserId);

  if (partnerSubs.length === 0) {
    console.log('[Push] O parceiro ainda não possui dispositivos inscritos para push.');
    return { sent: 0 };
  }

  const payloadString = JSON.stringify({
    title: payload.title || 'Nosso Universo ✨',
    body: payload.body || 'Você tem uma novidade no app!',
    icon: payload.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: payload.url || '/'
    }
  });

  let sent = 0;
  for (const item of partnerSubs) {
    try {
      await webpush.sendNotification(item.subscription, payloadString);
      sent++;
    } catch (err) {
      console.warn(`[Push] Falha ao enviar para endpoint (${err.statusCode}):`, err.message);
      // Se endpoint não for mais válido (410 Gone / 404 Not Found), limpa do banco
      if (err.statusCode === 410 || err.statusCode === 404) {
        removeSubscriptionByEndpoint(item.subscription?.endpoint);
      }
    }
  }

  return { sent };
}

/**
 * Envia notificação de teste para o próprio usuário
 */
export async function sendPushToSelf(userId, payload) {
  const list = getStoredSubscriptions();
  const userSubs = list.filter(item => item.userId === userId);

  const payloadString = JSON.stringify({
    title: payload.title || 'Teste de Push ✨',
    body: payload.body || 'Notificações push funcionando 100%!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: payload.url || '/' }
  });

  let sent = 0;
  for (const item of userSubs) {
    try {
      await webpush.sendNotification(item.subscription, payloadString);
      sent++;
    } catch (err) {
      console.warn(`[Push] Falha no teste para o usuário #${userId}:`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        removeSubscriptionByEndpoint(item.subscription?.endpoint);
      }
    }
  }

  return { sent };
}

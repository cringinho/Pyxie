import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  getVapidPublicKey,
  saveSubscription,
  removeSubscriptionByEndpoint,
  sendPushToPartner,
  sendPushToSelf
} from '../pushService.js';

const router = express.Router();

/**
 * GET /api/push/vapid-public-key
 * Retorna a chave pública VAPID para registro no Service Worker
 */
router.get('/vapid-public-key', (req, res) => {
  const key = getVapidPublicKey();
  return res.json({ publicKey: key });
});

/**
 * POST /api/push/subscribe
 * Registra a assinatura do dispositivo do usuário
 */
router.post('/subscribe', requireAuth, (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Dados da assinatura inválidos.' });
    }

    saveSubscription(req.user.id, subscription);
    return res.json({ success: true, message: 'Dispositivo cadastrado para notificações push.' });
  } catch (err) {
    console.error('[Push:Subscribe] Erro:', err);
    return res.status(500).json({ error: 'Falha ao registrar assinatura push.' });
  }
});

/**
 * POST /api/push/unsubscribe
 * Cancela a assinatura do dispositivo
 */
router.post('/unsubscribe', requireAuth, (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      removeSubscriptionByEndpoint(endpoint);
    }
    return res.json({ success: true, message: 'Assinatura push removida.' });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao remover assinatura.' });
  }
});

/**
 * POST /api/push/test
 * Dispara notificação de teste para o próprio usuário
 */
router.post('/test', requireAuth, async (req, res) => {
  try {
    const result = await sendPushToSelf(req.user.id, {
      title: '✨ Teste de Notificação Push',
      body: `Oi ${req.user.nickname || req.user.displayName}, o sistema de push do Nosso Universo está 100% ativo!`,
      url: '/?tab=feed'
    });
    return res.json({
      success: true,
      sentCount: result.sent,
      message: result.sent > 0 ? 'Notificação enviada para o seu dispositivo!' : 'Nenhum dispositivo push ativo encontrado neste usuário.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao enviar notificação de teste.' });
  }
});

/**
 * POST /api/push/thinking-of-you
 * Envia um "Pensando em você" imediato para o celular do parceiro
 */
router.post('/thinking-of-you', requireAuth, async (req, res) => {
  try {
    const senderName = req.user.nickname || req.user.displayName;
    const result = await sendPushToPartner(req.user.id, {
      title: '💭 Pensando em você...',
      body: `${senderName} está pensando em você com muito carinho agora mesmo! 💖`,
      url: '/?tab=feed'
    });

    return res.json({
      success: true,
      sentCount: result.sent,
      message: 'Notificação de carinho enviada com sucesso!'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao enviar notificação para o parceiro.' });
  }
});

export default router;

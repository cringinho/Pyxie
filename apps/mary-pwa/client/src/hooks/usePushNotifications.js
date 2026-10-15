import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setIsSupported(false);
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch (err) {
      console.warn('[PushHook] Erro ao checar inscrição:', err);
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    setLoading(true);
    setStatusMessage(null);
    try {
      // 1. Solicita permissão do navegador
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        throw new Error('Permissão de notificações não concedida no navegador.');
      }

      // 2. Busca chave pública VAPID do servidor
      const keyRes = await fetch('/api/push/vapid-public-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        throw new Error('Chave VAPID não encontrada no servidor.');
      }

      const reg = await navigator.serviceWorker.ready;
      const convertedKey = urlBase64ToUint8Array(publicKey);

      // 3. Inscreve no PushManager
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      // 4. Envia para o backend salvar no SQLite
      const saveRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: sub.toJSON() })
      });

      if (!saveRes.ok) {
        throw new Error('Falha ao registrar inscrição no servidor.');
      }

      setIsSubscribed(true);
      setStatusMessage({ type: 'success', text: 'Notificações push ativadas com sucesso neste aparelho!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao ativar push' });
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    setStatusMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
      }
      setIsSubscribed(false);
      setStatusMessage({ type: 'success', text: 'Notificações desativadas para este aparelho.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao desativar push' });
    } finally {
      setLoading(false);
    }
  }

  async function sendThinkingOfYou() {
    setStatusMessage(null);
    try {
      const res = await fetch('/api/push/thinking-of-you', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: 'Mensagem de carinho enviada com sucesso ao celular do outro! 💭' };
      }
      throw new Error(data.error || 'Falha ao enviar notificação');
    } catch (err) {
      return { success: false, message: err.message || 'Falha ao enviar' };
    }
  }

  async function sendTestPush() {
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    statusMessage,
    subscribe,
    unsubscribe,
    sendThinkingOfYou,
    sendTestPush
  };
}

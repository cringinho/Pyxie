const https = require('node:https');
const url = require('node:url');
const { getDailyTarotCard } = require('./feedGenerator');

const SITE_URL = 'https://pyxie.com.br';

/**
 * Envia payload para um Webhook HTTP externo (Discord, IFTTT, Zapier, Make, n8n)
 */
function postToWebhook(webhookUrl, payload) {
  return new Promise((resolve) => {
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
      return resolve({ success: false, message: 'URL de webhook inválida ou não configurada' });
    }

    try {
      const parsedUrl = new url.URL(webhookUrl);
      const data = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'Pyxie-Social-Broadcaster/1.0',
        },
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          const isOk = res.statusCode >= 200 && res.statusCode < 300;
          resolve({
            success: isOk,
            status: res.statusCode,
            response: responseBody,
          });
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, message: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, message: 'Timeout na chamada do webhook' });
      });

      req.write(data);
      req.end();
    } catch (err) {
      resolve({ success: false, message: err.message });
    }
  });
}

/**
 * Transmite a Carta do Dia para Webhook externo (pronta para republicação em Pinterest, Telegram, Twitter)
 */
async function broadcastDailyTarot(webhookUrl = process.env.SOCIAL_WEBHOOK_URL, lang = 'pt') {
  if (!webhookUrl) {
    return { success: false, message: 'SOCIAL_WEBHOOK_URL não configurado' };
  }

  const isEn = lang === 'en';
  const daily = getDailyTarotCard();
  const card = daily.card;
  const isReversed = daily.orientation === 'REVERSED';
  const posLabel = isReversed ? (isEn ? 'Reversed' : 'Invertida') : (isEn ? 'Upright' : 'Em Pé');
  const cardDesc = isReversed ? card.reversed : card.upright;

  const cardWebUrl = `${SITE_URL}/tarot?id=${card.id}&pos=${isReversed ? 'reversed' : 'upright'}&utm_source=social_webhook&lang=${lang}`;
  const cardImageUrl = `${SITE_URL}/api/tarot/card-image?id=${card.id}&pos=${isReversed ? 'reversed' : 'upright'}&lang=${lang}`;

  // Formato compatível com Discord Webhook e Zapier/IFTTT/Make
  const payload = {
    username: 'Pyxie Oracle',
    avatar_url: `${SITE_URL}/assets/pyxie/pyxie_mascot.png`,
    content: isEn
      ? `✨ **Daily Tarot Oracle**: Draw your card and reveal your daily destiny at ${cardWebUrl}`
      : `✨ **Oráculo da Pyxie**: Tire sua carta e veja seu destino diário em ${cardWebUrl}`,
    embeds: [
      {
        title: isEn
          ? `🔮 ${card.name} (${posLabel}) • ${card.arcana}`
          : `🔮 ${card.name} (${posLabel}) • ${card.arcana}`,
        url: cardWebUrl,
        description: `**${isEn ? 'Keywords' : 'Palavras-chave'}**: ${(card.keywords || []).map(k => `\`#${k}\``).join(' ')}\n\n${cardDesc}`,
        color: 0xec4899,
        image: {
          url: cardImageUrl,
        },
        footer: {
          text: isEn ? 'Pin this reading on Pinterest or draw online at pyxie.com.br/tarot' : 'Salve no Pinterest ou tire sua carta em pyxie.com.br/tarot',
          icon_url: `${SITE_URL}/assets/pyxie/pyxie_pixelart_face.png`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return await postToWebhook(webhookUrl, payload);
}

module.exports = {
  postToWebhook,
  broadcastDailyTarot,
};

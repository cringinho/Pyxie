const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'pyxie_indexnow_8f73b612c0914e9e';
const INDEXNOW_HOST = 'pyxie.com.br';
const KEY_FILE_NAME = `${INDEXNOW_KEY}.txt`;

/**
 * Garante que o arquivo de validação de chave exista na pasta public
 */
function ensureKeyFile(publicDir = path.join(__dirname, '..', '..', 'public')) {
  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const keyFilePath = path.join(publicDir, KEY_FILE_NAME);
    if (!fs.existsSync(keyFilePath) || fs.readFileSync(keyFilePath, 'utf8').trim() !== INDEXNOW_KEY) {
      fs.writeFileSync(keyFilePath, INDEXNOW_KEY, 'utf8');
    }
    return true;
  } catch (err) {
    console.error('[IndexNow] Erro ao criar arquivo de chave:', err.message);
    return false;
  }
}

/**
 * Submete uma lista de URLs ao protocolo IndexNow (Bing, Yandex, Seznam, Naver)
 * @param {string[]} urls
 * @returns {Promise<{success: boolean, status: number, message: string}>}
 */
function submitIndexNowUrls(urls = []) {
  return new Promise((resolve) => {
    if (!urls || urls.length === 0) {
      return resolve({ success: true, status: 200, message: 'Nenhuma URL informada' });
    }

    const payload = JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${KEY_FILE_NAME}`,
      urlList: urls,
    });

    const options = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Pyxie-IndexNow-Bot/1.0',
      },
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const isOk = res.statusCode >= 200 && res.statusCode < 300;
        resolve({
          success: isOk,
          status: res.statusCode || 200,
          message: isOk ? 'URLs enviadas com sucesso ao IndexNow' : `IndexNow retornou status ${res.statusCode}: ${data}`,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        status: 0,
        message: `Falha na requisição IndexNow: ${err.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 408,
        message: 'Timeout ao conectar com api.indexnow.org',
      });
    });

    req.write(payload);
    req.end();
  });
}

function getDefaultUrlList() {
  return [
    `https://${INDEXNOW_HOST}/`,
    `https://${INDEXNOW_HOST}/?lang=en`,
    `https://${INDEXNOW_HOST}/tarot`,
    `https://${INDEXNOW_HOST}/tarot?lang=en`,
    `https://${INDEXNOW_HOST}/wiki`,
    `https://${INDEXNOW_HOST}/wiki?lang=en`,
    `https://${INDEXNOW_HOST}/parcerias`,
    `https://${INDEXNOW_HOST}/parcerias?lang=en`,
    `https://${INDEXNOW_HOST}/museu`,
    `https://${INDEXNOW_HOST}/museu?lang=en`,
    `https://${INDEXNOW_HOST}/bonus`,
    `https://${INDEXNOW_HOST}/bonus?lang=en`,
    `https://${INDEXNOW_HOST}/rss.xml`,
  ];
}

/**
 * Submissão automática completa de todas as rotas públicas
 */
async function autoSubmitAllUrls(publicDir) {
  ensureKeyFile(publicDir);
  const urls = getDefaultUrlList();
  const res = await submitIndexNowUrls(urls);
  return { ...res, count: urls.length };
}

module.exports = {
  INDEXNOW_KEY,
  INDEXNOW_HOST,
  KEY_FILE_NAME,
  ensureKeyFile,
  submitIndexNowUrls,
  getDefaultUrlList,
  autoSubmitAllUrls,
};

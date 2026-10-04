const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../../public/uploads/seasonal-art');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Baixa uma imagem de uma URL externa e a salva localmente no disco
 * Retorna o caminho relativo para ser servido estaticamente (ex: /uploads/seasonal-art/123.png)
 * @param {string} url - URL da imagem
 * @param {string} messageId - ID da mensagem da arte
 * @returns {Promise<string|null>} - Caminho relativo local ou null se falhar
 */
async function cacheArtImage(url, messageId) {
  if (!url || !messageId) return null;
  ensureUploadsDir();

  // Determina extensão
  let ext = 'png';
  try {
    const cleanUrl = url.split('?')[0];
    const match = cleanUrl.match(/\.(png|jpe?g|gif|webp)$/i);
    if (match) ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
  } catch (_) {}

  const filename = `${messageId}.${ext}`;
  const localPath = path.join(UPLOADS_DIR, filename);
  const publicUrl = `/uploads/seasonal-art/${filename}`;

  // Se já existe e tem tamanho > 0, retorna direto
  if (fs.existsSync(localPath)) {
    try {
      const stats = fs.statSync(localPath);
      if (stats.size > 100) return publicUrl;
    } catch (_) {}
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PyxieBot/1.0',
      },
      signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
    });

    if (!response.ok) {
      console.warn(`[Seasonal:Image] Falha ao baixar imagem de ${url}: Status ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(localPath, buffer);
    console.log(`[Seasonal:Image] Imagem da arte ${messageId} salva com sucesso em disco (${buffer.length} bytes).`);
    return publicUrl;
  } catch (err) {
    console.error(`[Seasonal:Image] Erro ao salvar imagem da arte ${messageId}:`, err.message);
    return null;
  }
}

/**
 * Retorna o caminho local em disco de uma imagem se existir
 * @param {string} messageId 
 * @returns {string|null}
 */
function getCachedImagePath(messageId) {
  ensureUploadsDir();
  const extensions = ['png', 'jpg', 'webp', 'gif'];
  for (const ext of extensions) {
    const p = path.join(UPLOADS_DIR, `${messageId}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

module.exports = {
  cacheArtImage,
  getCachedImagePath,
  UPLOADS_DIR,
};

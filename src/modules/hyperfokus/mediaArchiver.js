const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ALLOWED_HOSTS = new Set([
  'cdn.discordapp.com',
  'media.discordapp.net',
]);

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const DOWNLOAD_TIMEOUT_MS = 10000; // 10s

function getUploadsDir() {
  const dir = path.join(__dirname, '..', '..', '..', 'public', 'uploads', 'hyperfokus');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Baixa e espelha mídia do Discord CDN em WebP local com proteção SSRF e teto de 15 MB.
 * @param {string} url - URL do anexo Discord
 * @param {object} opts - { slug: string, index: number }
 * @returns {Promise<string>} Caminho relativo /uploads/hyperfokus/... ou URL original se falhar
 */
async function archiveDiscordMedia(url, { slug = 'artigo', index = 0 } = {}) {
  if (!url || typeof url !== 'string') return url;

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (_) {
    return url;
  }

  // Proteção estrita contra SSRF: apenas CDNs oficiais do Discord
  if (!ALLOWED_HOSTS.has(parsedUrl.hostname.toLowerCase())) {
    return url;
  }

  const safeSlug = String(slug).replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'artigo';
  const fileName = `${safeSlug}-${String(index).padStart(2, '0')}.webp`;
  const targetDir = getUploadsDir();
  const targetPath = path.join(targetDir, fileName);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Pyxie-Bot/14.0 (Hyperfokus Media Archiver)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return url;
    }

    const contentLength = Number(res.headers.get('content-length') || 0);
    if (contentLength > MAX_SIZE_BYTES) {
      return url;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_SIZE_BYTES) {
      return url;
    }

    // Validação estrita via sharp (evita arquivos maliciosos disfarçados de imagem)
    const metadata = await sharp(buffer).metadata();
    if (!metadata || !['jpeg', 'png', 'webp', 'gif', 'avif'].includes(metadata.format)) {
      return url;
    }

    // Conversão otimizada para WebP
    await sharp(buffer)
      .webp({ quality: 82, effort: 4 })
      .toFile(targetPath);

    return `/uploads/hyperfokus/${fileName}`;
  } catch (err) {
    console.warn(`[Hyperfokus:MediaArchiver] Falha ao espelhar ${url}:`, err.message);
    return url;
  }
}

module.exports = {
  archiveDiscordMedia,
  ALLOWED_HOSTS,
  MAX_SIZE_BYTES,
};


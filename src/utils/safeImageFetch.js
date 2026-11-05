/**
 * Busca de imagem externa à prova de SSRF (proxy de imagens das Parcerias).
 *
 * - Só http/https, só porta padrão.
 * - O IP é checado DEPOIS da resolução de DNS e a conexão usa exatamente esse IP
 *   (lookup próprio): domínio que aponta para rede interna é recusado, e não há janela
 *   para trocar o DNS entre a checagem e a conexão.
 * - Redirecionamentos são seguidos à mão (no máximo 3), cada salto checado de novo.
 * - Só tipos raster (png, jpeg, gif, webp, avif): SVG pode carregar script e fica de fora.
 * - Tamanho máximo e tempo máximo por pedido.
 */
const dns = require('node:dns');
const net = require('node:net');
const http = require('node:http');
const https = require('node:https');

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const blocked = new net.BlockList();
for (const [ip, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blocked.addSubnet(ip, prefix, 'ipv4');
for (const [ip, prefix] of [
  ['::', 128], ['::1', 128], ['100::', 64], ['2001:db8::', 32],
  ['2002::', 16], ['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8],
]) blocked.addSubnet(ip, prefix, 'ipv6');

/** O endereço é público (roteável na internet)? */
function isPublicIp(address) {
  const ip = String(address || '').replace(/^\[|\]$/g, '');
  if (net.isIPv4(ip)) return !blocked.check(ip, 'ipv4');
  if (net.isIPv6(ip)) {
    const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    if (mapped) return isPublicIp(mapped[1]);
    // NAT64 (64:ff9b::/96) pode embutir um IPv4 interno: fora. (Não vai na BlockList porque
    // ela compara IPv4 com regras IPv6 e acabaria bloqueando endereço público.)
    if (/^64:ff9b:/i.test(ip)) return false;
    return !blocked.check(ip, 'ipv6');
  }
  return false;
}

function blockedError(code = 'blocked_address') {
  const err = new Error(code);
  err.code = code;
  return err;
}

/** `lookup` para http(s): resolve e só deixa conectar em IP público. */
function safeLookup(hostname, options, callback) {
  const opts = typeof options === 'object' && options ? options : {};
  dns.lookup(hostname, { family: opts.family || 0, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = Array.isArray(addresses) ? addresses : [];
    if (!list.length || list.some((a) => !isPublicIp(a.address))) return callback(blockedError());
    if (opts.all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
}

function isAllowedImageType(contentType) {
  const base = String(contentType || '').split(';')[0].trim().toLowerCase();
  return ALLOWED_TYPES.has(base) ? base : null;
}

/** Valida a URL antes de qualquer conexão. Devolve o objeto URL ou lança. */
function checkUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || ''));
  } catch (_) {
    throw blockedError('invalid_url');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw blockedError('invalid_protocol');
  if (parsed.username || parsed.password) throw blockedError('invalid_url');
  if (parsed.port && !['80', '443'].includes(parsed.port)) throw blockedError('blocked_port');
  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw blockedError();
  }
  if (net.isIP(host) && !isPublicIp(host)) throw blockedError();
  return parsed;
}

function requestOnce(url, { timeoutMs }) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(
      url,
      {
        lookup: safeLookup,
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PyxieImageProxy/1.0; +https://pyxie.com.br)',
          Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif;q=0.9',
        },
      },
      (res) => resolve(res)
    );
    req.on('timeout', () => req.destroy(blockedError('timeout')));
    req.on('error', reject);
  });
}

/**
 * Baixa uma imagem externa com as travas acima.
 * @returns {Promise<{ contentType: string, buffer: Buffer }>}
 */
async function fetchImageSafely(rawUrl, { timeoutMs = 12000, maxBytes = MAX_BYTES } = {}) {
  let url = checkUrl(rawUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const res = await requestOnce(url, { timeoutMs });
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      res.resume();
      url = checkUrl(new URL(res.headers.location, url).toString());
      continue;
    }
    if (res.statusCode !== 200) {
      res.resume();
      throw blockedError('upstream_error');
    }
    const contentType = isAllowedImageType(res.headers['content-type']);
    if (!contentType) {
      res.resume();
      throw blockedError('not_image');
    }
    if (Number(res.headers['content-length'] || 0) > maxBytes) {
      res.resume();
      throw blockedError('too_large');
    }
    const chunks = [];
    let size = 0;
    await new Promise((resolve, reject) => {
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
          res.destroy(blockedError('too_large'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', resolve);
      res.on('error', reject);
      res.on('close', () => (size > maxBytes ? reject(blockedError('too_large')) : null));
    });
    return { contentType, buffer: Buffer.concat(chunks) };
  }
  throw blockedError('too_many_redirects');
}

module.exports = { fetchImageSafely, isPublicIp, isAllowedImageType, checkUrl, safeLookup };

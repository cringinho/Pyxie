// Escudo de arquivos: reconhece scripts que roubam token/senha e executáveis enviados no chat.
// Conservador para não pegar código legítimo: um script só é marcado com DUAS pistas juntas
// (pasta de dados do navegador/Discord, envio para fora, regex de token do Discord).
const SCRIPT_EXT = new Set(['txt', 'js', 'mjs', 'cjs', 'py', 'pyw', 'bat', 'cmd', 'ps1', 'psm1', 'vbs', 'sh', 'lua', 'rb', 'php']);
const EXEC_EXT = new Set(['exe', 'scr', 'msi', 'lnk', 'com', 'pif', 'hta', 'cpl', 'msc']);
const MAX_BYTES = 256 * 1024;

const STORAGE = /Local Storage[\\/]+leveldb|Login Data|User Data[\\/]+(Default|Profile)|[\\/]tdata[\\/]?|wallet\.dat|Exodus[\\/]|discord(canary|ptb)?[\\/]+Local Storage|Cookies[\\/]+|\\AppData\\Roaming\\discord/i;
const EXFIL = /discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+|api\.telegram\.org\/bot|transfer\.sh|anonfiles|gofile\.io\/(?:uploadFile|api)|pastebin\.com\/api|ngrok\.io/i;
const TOKEN_REGEX = /\[\\w-\]\{24|\[a-zA-Z0-9_-\]\{24\}|mfa\\\.\[\\w-\]\{84|[\w-]{24,26}\.[\w-]{6}\.[\w-]{27,38}/;

function extOf(name) {
  const m = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,5})$/);
  return m ? m[1] : '';
}

// O que fazer com um anexo, só pelo nome e tamanho: 'scan' (baixar e ler), 'exec' ou null.
function triage(attachment) {
  const ext = extOf(attachment.name);
  if (EXEC_EXT.has(ext)) return 'exec';
  if (SCRIPT_EXT.has(ext) && (attachment.size || 0) <= MAX_BYTES) return 'scan';
  return null;
}

// Lê o texto de um script e devolve o motivo ('grabber') ou null.
function scanText(text) {
  const s = String(text || '');
  const hits = [STORAGE.test(s), EXFIL.test(s), TOKEN_REGEX.test(s)].filter(Boolean).length;
  return hits >= 2 ? 'grabber' : null;
}

async function fetchText(url, fetchImpl = fetch) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) return '';
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.subarray(0, MAX_BYTES).toString('utf8');
  } catch (_) {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

// Analisa os anexos de uma mensagem. Devolve { name, reason: 'grabber'|'exec' } ou null.
async function inspectAttachments(attachments, { blockExecutables = true, fetchImpl } = {}) {
  for (const a of [...(attachments || [])].slice(0, 5)) {
    const kind = triage(a);
    if (kind === 'exec' && blockExecutables) return { name: a.name, reason: 'exec' };
    if (kind === 'scan' && scanText(await fetchText(a.url, fetchImpl))) return { name: a.name, reason: 'grabber' };
  }
  return null;
}

module.exports = { triage, scanText, inspectAttachments, extOf, MAX_BYTES };

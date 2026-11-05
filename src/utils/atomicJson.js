const fs = require('fs');
const path = require('path');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (err) {
    console.error(`[atomicJson] Falha ao ler ${path.basename(file)}:`, err.message);
    return fallback;
  }
}

/** Gravação atômica (tmp + rename): bot e web compartilham os mesmos arquivos em data/. */
function writeJsonAtomic(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, file);
    return true;
  } catch (err) {
    console.error(`[atomicJson] Falha ao gravar ${path.basename(file)}:`, err.message);
    return false;
  }
}

/**
 * Leitura protegida (auditoria Q288), igual à de economy.json: se o arquivo estiver
 * corrompido, ele é guardado como `<arquivo>.corrupt-<ts>` (nunca é sobrescrito) e a
 * leitura cai para `<arquivo>.bak`. Só devolve o vazio se não houver backup legível.
 */
function readJsonProtected(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    if (!raw.trim()) throw new Error('arquivo vazio');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    throw new Error('conteúdo não é um objeto');
  } catch (err) {
    console.error(`[atomicJson] ${path.basename(file)} ilegível:`, err.message);
    try {
      fs.renameSync(file, `${file}.corrupt-${Date.now()}`);
    } catch (_) {}
    const backup = `${file}.bak`;
    if (fs.existsSync(backup)) {
      try {
        const restored = JSON.parse(fs.readFileSync(backup, 'utf8'));
        if (restored && typeof restored === 'object') {
          console.error(`[atomicJson] ${path.basename(file)} restaurado a partir do .bak.`);
          return restored;
        }
      } catch (backupErr) {
        console.error(`[atomicJson] Backup de ${path.basename(file)} também ilegível:`, backupErr.message);
      }
    }
    return fallback;
  }
}

const lastBackupAt = new Map();
const BACKUP_INTERVAL_MS = 60 * 1000;

/** Gravação atômica (tmp + rename) que mantém um `<arquivo>.bak` rotativo (no máximo 1 cópia por minuto). */
function writeJsonAtomicWithBackup(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    const now = Date.now();
    if (now - (lastBackupAt.get(file) || 0) >= BACKUP_INTERVAL_MS && fs.existsSync(file)) {
      try {
        fs.copyFileSync(file, `${file}.bak`);
        lastBackupAt.set(file, now);
      } catch (_) {}
    }
    fs.renameSync(tmp, file);
    return true;
  } catch (err) {
    console.error(`[atomicJson] Falha ao gravar ${path.basename(file)}:`, err.message);
    return false;
  }
}

function isHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {
  readJson,
  readJsonSafe: readJson,
  readJsonProtected,
  writeJsonAtomic,
  writeAtomic: writeJsonAtomic,
  writeJsonAtomicWithBackup,
  isHttpUrl,
};


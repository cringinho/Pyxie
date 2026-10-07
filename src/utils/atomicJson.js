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

function isHttpUrl(value) {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { readJson, writeJsonAtomic, isHttpUrl };


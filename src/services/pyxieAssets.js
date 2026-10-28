// Registro das artes da Pyxie (plano 5.9, "arte humana no lugar da IA").
// Lista os arquivos reais de public/assets/pyxie e guarda, para cada um, a origem (ia / humana /
// desconhecida) e o crédito do artista. O dono marca no painel; o site e os embeds leem o crédito.
// Registro em src/data/pyxieAssets.json (versionado: é parte do acervo, não dado de usuário).
const fs = require('node:fs');
const path = require('node:path');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'public', 'assets', 'pyxie');
const REGISTRY = path.join(__dirname, '..', 'data', 'pyxieAssets.json');
const ORIGINS = ['ai', 'human', 'unknown'];
const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg)$/i;

function readRegistry() {
  try {
    const raw = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    return raw && typeof raw.assets === 'object' ? raw : { assets: {} };
  } catch (_) {
    return { assets: {} };
  }
}

function writeRegistry(state) {
  fs.writeFileSync(`${REGISTRY}.tmp`, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(`${REGISTRY}.tmp`, REGISTRY);
}

function walk(dir, base = '') {
  let out = [];
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out = out.concat(walk(path.join(dir, e.name), rel));
    else if (IMAGE_RE.test(e.name)) out.push(rel);
  }
  return out;
}

// Arquivos reais em disco + o que já foi marcado. Arquivo novo entra como "unknown".
function listAssets() {
  const registry = readRegistry().assets;
  return walk(ASSETS_DIR)
    .sort()
    .map((file) => ({
      file,
      url: `/assets/pyxie/${file}`,
      origin: ORIGINS.includes(registry[file]?.origin) ? registry[file].origin : 'unknown',
      artist: registry[file]?.artist || '',
      artistUrl: registry[file]?.artistUrl || '',
    }));
}

function updateAsset(file, { origin, artist, artistUrl }) {
  if (!walk(ASSETS_DIR).includes(file)) throw Object.assign(new Error('asset_not_found'), { code: 'asset_not_found' });
  const state = readRegistry();
  const current = state.assets[file] || {};
  state.assets[file] = {
    origin: ORIGINS.includes(origin) ? origin : current.origin || 'unknown',
    artist: artist !== undefined ? String(artist).slice(0, 60) : current.artist || '',
    artistUrl: artistUrl !== undefined && /^https:\/\/\S+$/.test(artistUrl) ? artistUrl : artistUrl === '' ? '' : current.artistUrl || '',
  };
  writeRegistry(state);
  return { file, ...state.assets[file] };
}

function summary() {
  const list = listAssets();
  const count = (o) => list.filter((a) => a.origin === o).length;
  return { total: list.length, ai: count('ai'), human: count('human'), unknown: count('unknown') };
}

// Texto de crédito para rodapés de embeds e para o site ("Arte: Fulana").
function creditFor(urlOrFile) {
  const file = String(urlOrFile || '').replace(/^.*\/assets\/pyxie\//, '');
  const entry = readRegistry().assets[file];
  return entry?.origin === 'human' && entry.artist ? entry.artist : '';
}

module.exports = { listAssets, updateAsset, summary, creditFor, ORIGINS };

#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { cleanPngBuffer } = require('../src/utils/spriteCleanup');

/**
 * Corrige o recorte dos PNGs transparentes da Pyxie e do Astaroth: remove o halo claro que sobrou
 * da remoção de fundo e as ilhas soltas, e reconstrói uma borda antisserrilhada (suave).
 * O resultado vai para assets/pyxie/emojis (bot) e para a cópia do site em public/assets/pyxie/emojis.
 *
 * A borda suave tem alfa parcial, então limpar de novo um arquivo já limpo o corroeria. Por isso
 * cada arquivo tratado fica registrado (sha256) em assets/pyxie/emojis/.cleanup-manifest.json e é
 * pulado nas próximas execuções; se a arte for trocada, o hash muda e ela é limpa outra vez.
 *
 * Ficam de fora os stickers (a borda branca grossa é proposital) e os emojis brancos,
 * em que a limpeza comeria o próprio desenho.
 * Uso: node scripts/clean_pyxie_assets.js [--write]
 */

const ROOT = path.join(__dirname, '..');
const BOT_DIR = path.join(ROOT, 'assets', 'pyxie', 'emojis');
const SITE_DIR = path.join(ROOT, 'public', 'assets', 'pyxie', 'emojis');
const MANIFEST = path.join(BOT_DIR, '.cleanup-manifest.json');
const SKIP = new Set(['pyxie_black_white_logo.png', 'pyxie_flush.png', 'pyxie_smile_emoji.png', 'pyxie_cat_angel_bat.png']);

function isTarget(file) {
  if (!file.endsWith('.png') || SKIP.has(file) || file.includes('_sticker')) return false;
  return file.startsWith('astaroth_') || file.startsWith('pyxie_');
}

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

async function main() {
  const write = process.argv.includes('--write');
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  let changed = 0;
  for (const file of fs.readdirSync(BOT_DIR).filter(isTarget).sort()) {
    const botFile = path.join(BOT_DIR, file);
    const current = fs.readFileSync(botFile);
    if (manifest[file] === sha256(current)) continue;
    const cleaned = await cleanPngBuffer(current);
    changed++;
    console.log(`${write ? '✅ limpo' : '🔎 limparia'} ${file}`);
    if (!write) continue;
    fs.writeFileSync(botFile, cleaned);
    const siteFile = path.join(SITE_DIR, file);
    if (fs.existsSync(siteFile)) fs.writeFileSync(siteFile, cleaned);
    manifest[file] = sha256(cleaned);
  }
  if (write && changed > 0) fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(changed === 0 ? 'Nada a limpar: os assets já estão corrigidos.' : `${changed} arquivo(s) ${write ? 'corrigidos' : 'a corrigir (use --write)'}.`);
}

main().catch((err) => {
  console.error('[clean_pyxie_assets] Erro:', err);
  process.exit(1);
});

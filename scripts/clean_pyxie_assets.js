#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { cleanPngBuffer } = require('../src/utils/spriteCleanup');

/**
 * Corrige o recorte dos PNGs transparentes da Pyxie e do Astaroth: remove o halo claro
 * semitransparente que sobrou da remoção de fundo e as ilhas soltas do fundo antigo.
 * Limpa as duas cópias (assets/ do bot e public/assets/ do site). É idempotente.
 *
 * Ficam de fora os stickers (a borda branca grossa é proposital) e os emojis brancos,
 * em que a limpeza comeria o próprio desenho.
 * Uso: node scripts/clean_pyxie_assets.js [--write]
 */

const ROOT = path.join(__dirname, '..');
const DIRS = ['assets/pyxie/emojis', 'public/assets/pyxie/emojis'];
const SKIP = new Set([
  'pyxie_black_white_logo.png',
  'pyxie_flush.png',
  'pyxie_smile_emoji.png',
  'pyxie_cat_angel_bat.png',
  'custom_coin.png',
  'custom_magic_bean.png',
]);

function isTarget(file) {
  if (!file.endsWith('.png') || SKIP.has(file)) return false;
  if (file.includes('_sticker')) return false;
  return file.startsWith('astaroth_') || file.startsWith('pyxie_');
}

async function main() {
  const write = process.argv.includes('--write');
  let changed = 0;
  for (const rel of DIRS) {
    const dir = path.join(ROOT, rel);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(isTarget)) {
      const full = path.join(dir, file);
      const original = fs.readFileSync(full);
      const cleaned = await cleanPngBuffer(original);
      const sharp = require('sharp');
      const before = await sharp(original).ensureAlpha().raw().toBuffer();
      const after = await sharp(cleaned).ensureAlpha().raw().toBuffer();
      let diff = 0;
      for (let i = 3; i < before.length; i += 4) if (before[i] !== after[i]) diff++;
      if (diff === 0) continue;
      changed++;
      console.log(`${write ? '✅ limpo' : '🔎 limparia'} ${rel}/${file} (${diff} px de borda)`);
      if (write) fs.writeFileSync(full, cleaned);
    }
  }
  console.log(changed === 0 ? 'Nada a limpar: os assets já estão corrigidos.' : `${changed} arquivo(s) ${write ? 'corrigidos' : 'com halo (use --write para corrigir)'}.`);
}

main().catch((err) => {
  console.error('[clean_pyxie_assets] Erro:', err);
  process.exit(1);
});

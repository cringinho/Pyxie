#!/usr/bin/env node
/**
 * Gera os ícones do site a partir de um asset quadrado da Pyxie (AGENTS.md §8).
 * O Google só mostra favicon que seja do próprio domínio, quadrado e múltiplo de 48 px;
 * antes o site apontava para um .webp no CDN do Discord e /favicon.ico caía numa página HTML.
 * Uso: node scripts/generate_favicons.js
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const SOURCE = path.join(__dirname, '..', 'public', 'assets', 'pyxie', 'sticker', 'sticker_smile.png');
const OUT = path.join(__dirname, '..', 'public');
const BACKGROUND = '#1c1333';

const png = (size, opts = {}) => {
  const img = sharp(SOURCE).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' });
  return (opts.flatten ? img.flatten({ background: BACKGROUND }) : img).png({ compressionLevel: 9 }).toBuffer();
};

/** .ico com PNGs dentro (aceito por todos os navegadores e pelo Google). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  const ico = [];
  for (const size of [16, 32, 48]) ico.push({ size, data: await png(size) });
  fs.writeFileSync(path.join(OUT, 'favicon.ico'), buildIco(ico));
  for (const size of [48, 96, 192, 512]) fs.writeFileSync(path.join(OUT, `favicon-${size}x${size}.png`), await png(size));
  fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), await png(180, { flatten: true }));
  const manifest = {
    name: 'Pyxie',
    short_name: 'Pyxie',
    icons: [192, 512].map((size) => ({ src: `/favicon-${size}x${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
    theme_color: '#7c3aed',
    background_color: BACKGROUND,
    display: 'browser',
  };
  fs.writeFileSync(path.join(OUT, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('Ícones gerados em public/: favicon.ico, favicon-48/96/192/512, apple-touch-icon.png, site.webmanifest');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

const path = require('node:path');
const fs = require('node:fs');
const sharp = require('sharp');

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Quebra texto em linhas com limite aproximado de caracteres para caber no card.
 */
function wrapText(text, maxCharsPerLine = 32, maxLines = 3) {
  const words = String(text || '').trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  if (lines.length === maxLines && words.length > lines.join(' ').split(/\s+/).length) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxCharsPerLine - 3) + '...';
  }
  return lines;
}

/**
 * Gera imagem de OpenGraph (1200 x 630 px) para redes sociais e links do Discord/WhatsApp.
 */
async function generateOgCard(article) {
  const width = 1200;
  const height = 630;
  const title = article.seoTitle || article.title || 'Pyxie Hyperfokus';
  const authorName = article.authors && article.authors[0] ? article.authors[0].username : 'Comunidade Pyxie';
  const tag = article.categoryTags && article.categoryTags[0] ? article.categoryTags[0].toUpperCase() : 'HIPERFOCO';
  const readingTime = `${article.readingTimeMinutes || 3} min de leitura`;

  const lines = wrapText(title, 28, 3);
  const titleSvgSpans = lines.map((line, idx) => 
    `<tspan x="80" dy="${idx === 0 ? 0 : 64}">${escapeXml(line)}</tspan>`
  ).join('');

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0414" />
          <stop offset="50%" stop-color="#120824" />
          <stop offset="100%" stop-color="#05020a" />
        </linearGradient>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#E60067" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)" />

      <!-- Border decorativa com glow suave -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="none" stroke="rgba(230, 0, 103, 0.35)" stroke-width="2" />
      <rect x="22" y="22" width="${width - 44}" height="${height - 44}" rx="22" fill="none" stroke="rgba(139, 92, 246, 0.2)" stroke-width="1" />

      <!-- Tag Badge -->
      <g transform="translate(80, 80)">
        <rect x="0" y="0" width="${Math.max(120, tag.length * 14 + 32)}" height="38" rx="19" fill="#E60067" />
        <text x="${Math.max(120, tag.length * 14 + 32) / 2}" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">
          ${escapeXml(tag)}
        </text>
      </g>

      <!-- Badge de Tempo de Leitura -->
      <text x="1120" y="106" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#a78bfa" text-anchor="end">
        ⏳ ${escapeXml(readingTime)}
      </text>

      <!-- Título do Artigo (Contraste estrito > 4.5:1 branco sobre fundo escuro) -->
      <text x="80" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" fill="#ffffff">
        ${titleSvgSpans}
      </text>

      <!-- Rodapé do Card: Autor e Pyxie Branding -->
      <g transform="translate(80, ${height - 110})">
        <!-- Linha divisória -->
        <line x1="0" y1="0" x2="${width - 160}" y2="0" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" />

        <!-- Autor -->
        <text x="0" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#f1f5f9">
          ✍️ ${escapeXml(authorName)}
        </text>

        <!-- Brand / Portal -->
        <text x="${width - 160}" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#ec4899" text-anchor="end">
          pyxie.com.br/hyperfokus
        </text>
      </g>
    </svg>
  `;

  return sharp(Buffer.from(svgOverlay))
    .webp({ quality: 85 })
    .toBuffer();
}

/**
 * Gera imagem vertical para o Pinterest (1000 x 1500 px, proporção 2:3).
 */
async function generatePinterestPin(article) {
  const width = 1000;
  const height = 1500;
  const title = article.seoTitle || article.title || 'Hiperfoco Inacreditável';
  const authorName = article.authors && article.authors[0] ? article.authors[0].username : 'Comunidade Pyxie';
  const tag = article.categoryTags && article.categoryTags[0] ? article.categoryTags[0].toUpperCase() : 'HIPERFOCO';

  const lines = wrapText(title, 22, 5);
  const titleSvgSpans = lines.map((line, idx) => 
    `<tspan x="80" dy="${idx === 0 ? 0 : 80}">${escapeXml(line)}</tspan>`
  ).join('');

  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pinBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080312" />
          <stop offset="35%" stop-color="#140628" />
          <stop offset="100%" stop-color="#05020a" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#pinBg)" />

      <!-- Borda sutil -->
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="36" fill="none" stroke="rgba(230, 0, 103, 0.4)" stroke-width="3" />

      <!-- Top Header Tag -->
      <g transform="translate(80, 100)">
        <rect x="0" y="0" width="${Math.max(140, tag.length * 16 + 40)}" height="48" rx="24" fill="#E60067" />
        <text x="${Math.max(140, tag.length * 16 + 40) / 2}" y="31" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          ${escapeXml(tag)}
        </text>
      </g>

      <!-- Portal Pill -->
      <text x="920" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="#a78bfa" text-anchor="end">
        Pyxie Hyperfokus
      </text>

      <!-- Título Impactante -->
      <text x="80" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="#ffffff">
        ${titleSvgSpans}
      </text>

      <!-- Snippet / Curiosidade -->
      <g transform="translate(80, 880)">
        <rect x="0" y="0" width="840" height="320" rx="24" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
        <text x="40" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#f43f5e">
          💡 RELATO AUTÊNTICO DA COMUNIDADE
        </text>
        <text x="40" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#e2e8f0">
          "Escrito por quem vive o tema. Sem IA."
        </text>
        <text x="40" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#cbd5e1">
          Por ${escapeXml(authorName)}
        </text>
      </g>

      <!-- Footer Branding Watermark -->
      <g transform="translate(80, ${height - 120})">
        <rect x="0" y="0" width="840" height="60" rx="30" fill="#E60067" />
        <text x="420" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          LEIA O ARTIGO COMPLETO EM PYXIE.COM.BR
        </text>
      </g>
    </svg>
  `;

  return sharp(Buffer.from(svgOverlay))
    .webp({ quality: 85 })
    .toBuffer();
}

/**
 * Adiciona a barra Pyxie Hyperfokus na base de uma imagem (para download e compartilhamento).
 */
async function generateWatermarkedShareImage(imageBufferOrPath) {
  const image = sharp(imageBufferOrPath);
  const metadata = await image.metadata();
  const width = metadata.width || 1200;
  const barHeight = Math.max(50, Math.round(metadata.height * 0.08));

  const watermarkSvg = `
    <svg width="${width}" height="${barHeight}" viewBox="0 0 ${width} ${barHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="rgba(8, 4, 16, 0.88)" />
      <line x1="0" y1="0" x2="${width}" y2="0" stroke="#E60067" stroke-width="3" />
      <text x="32" y="${Math.round(barHeight * 0.65)}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(barHeight * 0.38)}" font-weight="900" fill="#ffffff">
        Pyxie Hyperfokus
      </text>
      <text x="${width - 32}" y="${Math.round(barHeight * 0.65)}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(barHeight * 0.35)}" font-weight="700" fill="#f43f5e" text-anchor="end">
        pyxie.com.br/hyperfokus
      </text>
    </svg>
  `;

  return sharp(imageBufferOrPath)
    .composite([{
      input: Buffer.from(watermarkSvg),
      gravity: 'south',
    }])
    .webp({ quality: 85 })
    .toBuffer();
}

module.exports = {
  generateOgCard,
  generatePinterestPin,
  generateWatermarkedShareImage,
};

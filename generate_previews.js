const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { renderTarotCard } = require('./src/services/tarotRenderer');
const { TAROT_CATALOG, getCardAssetPath } = require('./src/data/tarotCardsCatalog');

/**
 * Quebra texto em múltiplas linhas respeitando largura máxima
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Desenha cantoneiras celestiais com filigrana dourada
 */
function drawCelestialCorners(ctx, width, height, margin = 44) {
  const corners = [
    { x: margin, y: margin, angle: 0 },
    { x: width - margin, y: margin, angle: Math.PI / 2 },
    { x: width - margin, y: height - margin, angle: Math.PI },
    { x: margin, y: height - margin, angle: -Math.PI / 2 }
  ];

  ctx.save();
  for (const c of corners) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(0, 16);
    ctx.arcTo(0, 0, 16, 0, 16);
    ctx.lineTo(48, 0);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(0, 24);
    ctx.arcTo(0, 0, 24, 0, 24);
    ctx.lineTo(60, 0);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', 12, 12);

    ctx.restore();
  }
  ctx.restore();
}

/**
 * Renderiza fundo celestial cósmico e partículas estelares
 */
function drawCosmicBackground(ctx, width, height, cx, cy) {
  const bgGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, height * 0.7);
  bgGrad.addColorStop(0, '#220b38');
  bgGrad.addColorStop(0.35, '#130424');
  bgGrad.addColorStop(0.7, '#080112');
  bgGrad.addColorStop(1, '#030007');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Nebulosa sutil rosa/violeta
  const nebGrad = ctx.createRadialGradient(cx - 150, cy - 200, 20, cx - 150, cy - 200, 450);
  nebGrad.addColorStop(0, 'rgba(244, 114, 182, 0.12)');
  nebGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(0, 0, width, height);

  // Partículas estelares nítidas
  for (let i = 0; i < 90; i++) {
    const rx = (Math.sin(i * 19.3) * 0.5 + 0.5) * width;
    const ry = (Math.cos(i * 13.7) * 0.5 + 0.5) * height;
    const alpha = (i % 5 === 0) ? 0.75 : 0.35;
    const r = (i % 7 === 0) ? 2.5 : ((i % 3 === 0) ? 1.8 : 1.2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Moldura Dourada Nobre de Colecionador
 */
function drawGoldenBorder(ctx, width, height) {
  // Borda Externa Fina
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Borda Principal Dupla Dourada
  const goldGrad = ctx.createLinearGradient(0, 0, width, height);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.25, '#ca8a04');
  goldGrad.addColorStop(0.5, '#facc15');
  goldGrad.addColorStop(0.75, '#eab308');
  goldGrad.addColorStop(1, '#a16207');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Borda Interna Violeta Mística
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Cantoneiras celestes
  drawCelestialCorners(ctx, width, height, 46);
}

/**
 * Desenha o Selo Oficial inferior obrigatório: "Pyxie's Tarot by cringinho"
 */
function drawFooterSeal(ctx, width, y) {
  // Divisor decorativo
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, y - 26);
  ctx.lineTo(width / 2 - 40, y - 26);
  ctx.moveTo(width / 2 + 40, y - 26);
  ctx.lineTo(width / 2 + 280, y - 26);
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.font = '20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✧', width / 2, y - 26);

  // Texto canônico obrigatório
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 24px serif';
  ctx.letterSpacing = '3px';
  ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
  ctx.shadowBlur = 10;
  ctx.fillText("Pyxie's Tarot by cringinho", width / 2, y);
  ctx.shadowBlur = 0;
}

async function main() {
  const sampleCard = TAROT_CATALOG[0]; // 1. O Mago

  // 1. Gera o Canvas Atual (Legacy Kuromi) para comparativo
  const legacyBuf = renderTarotCard(sampleCard, 'UPRIGHT', 'pt');
  fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_legacy.png'), legacyBuf);

  // =========================================================================
  // DESIGN A (2x HD: 1200 x 2048): "Pyxie Mascot Sanctuary"
  // Utiliza a arte original em alta resolução pyxie_mascot.png (576x1024)
  // em um portal celestial magnífico sem esticar pequenos ícones.
  // =========================================================================
  {
    const W = 1200;
    const H = 2048;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const cx = W / 2;
    const cy = 720;

    // Fundo Cósmico
    drawCosmicBackground(ctx, W, H, cx, cy);

    // Moldura Dourada Externa
    drawGoldenBorder(ctx, W, H);

    // Cabeçalho Numeral Romano & Categoria
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I', cx, 130);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ARCANOS MAIORES  •  NAIPE ASTRAL', cx, 185);

    // Divisor fino abaixo do cabeçalho
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 240, 215);
    ctx.lineTo(cx + 240, 215);
    ctx.stroke();

    // Portal Celestial Oval / Arredondado para a Pyxie Mascot HD
    const portalW = 680;
    const portalH = 920;
    const portalX = cx - portalW / 2;
    const portalY = 250;

    // Resplendor Cósmico ao redor do portal
    const glowGrad = ctx.createRadialGradient(cx, portalY + portalH / 2, 200, cx, portalY + portalH / 2, 540);
    glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    glowGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.18)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - 500, portalY - 50, 1000, portalH + 100);

    // Fundo do Portal
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(portalX, portalY, portalW, portalH, 36);
    const innerGrad = ctx.createRadialGradient(cx, portalY + portalH / 2, 50, cx, portalY + portalH / 2, 450);
    innerGrad.addColorStop(0, '#2d0f50');
    innerGrad.addColorStop(0.7, '#140528');
    innerGrad.addColorStop(1, '#0a0215');
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Borda Dourada do Portal
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Insere Pyxie Mascot em Alta Resolução (576x1024 nativo)
    const mascotPath = path.join(__dirname, 'assets/pyxie/pyxie_mascot.png');
    if (fs.existsSync(mascotPath)) {
      const mascotImg = await loadImage(fs.readFileSync(mascotPath));
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(portalX + 4, portalY + 4, portalW - 8, portalH - 8, 34);
      ctx.clip();

      // Ajusta proporção para caber majesticamente no portal
      const imgTargetH = portalH + 40;
      const imgTargetW = (mascotImg.width / mascotImg.height) * imgTargetH;
      ctx.drawImage(mascotImg, cx - imgTargetW / 2, portalY - 10, imgTargetW, imgTargetH);
      ctx.restore();
    }

    // Badge de Orientação (Posição Normal)
    const badgeW = 520;
    const badgeH = 64;
    const badgeY = 1210;
    const badgeX = cx - badgeW / 2;

    ctx.fillStyle = 'rgba(15, 10, 25, 0.85)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px sans-serif';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fillText('✦  POSIÇÃO NORMAL  ✦', cx, badgeY + badgeH / 2 + 1);
    ctx.shadowBlur = 0;

    // Nome da Carta
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px serif';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 18;
    ctx.fillText('O Mago', cx, 1340);
    ctx.shadowBlur = 0;

    // Palavras-chave
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 28px sans-serif';
    ctx.fillText('Poder  •  Habilidade  •  Concentração  •  Ação', cx, 1405);

    // Divisor ornamental central
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 300, 1450);
    ctx.lineTo(cx + 300, 1450);
    ctx.stroke();
    ctx.fillStyle = '#f472b6';
    ctx.font = '22px sans-serif';
    ctx.fillText('✧', cx, 1450);

    // Caixa de Mensagem do Destino
    const boxW = W - 180;
    const boxH = 310;
    const boxX = cx - boxW / 2;
    const boxY = 1490;

    ctx.fillStyle = 'rgba(10, 5, 20, 0.65)';
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Citação sem duplicação de aspas
    const quoteRaw = sampleCard.upright; // "Você possui todas as ferramentas para manifestar sua vontade no plano material."
    const cleanQuote = quoteRaw.replace(/^["“”']+|["“”']+$/g, '');
    const wrappedQuote = wrapText(ctx, `“${cleanQuote}”`, boxW - 80);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = 46;
    const totalHeight = wrappedQuote.length * lineHeight;
    const startQuoteY = boxY + (boxH - totalHeight) / 2 + (lineHeight / 2);

    wrappedQuote.forEach((line, idx) => {
      ctx.fillText(line, cx, startQuoteY + idx * lineHeight);
    });

    // Rodapé Obrigatório
    drawFooterSeal(ctx, W, 1950);

    fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_design_a_pyxie.png'), canvas.toBuffer('image/png'));
  }

  // =========================================================================
  // DESIGN B (2x HD: 1200 x 2048): "Authentic 78-Card Grand Deck"
  // Incorpora a pintura original em alta resolução (600x1024) com moldura
  // dourada cósmica de museu / colecionador e acabamento premium.
  // =========================================================================
  {
    const W = 1200;
    const H = 2048;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const cx = W / 2;
    const cy = 680;

    // Fundo Cósmico
    drawCosmicBackground(ctx, W, H, cx, cy);

    // Moldura Dourada Externa
    drawGoldenBorder(ctx, W, H);

    // Cabeçalho
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px serif';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 22;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I  •  O MAGO', cx, 130);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ARCANOS MAIORES  •  NAIPE ASTRAL', cx, 185);

    // Card Oficial em Alta Definição (card_01.webp - 600x1024 nativo)
    const cardImgPath = getCardAssetPath(1);
    if (fs.existsSync(cardImgPath)) {
      const cardImg = await loadImage(fs.readFileSync(cardImgPath));
      const cardW = 640;
      const cardH = 1040;
      const cardX = cx - cardW / 2;
      const cardY = 240;

      // Sombra projetada dourada e violeta
      ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 30);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Desenho da imagem com bordas chanfradas
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 30);
      ctx.clip();
      ctx.drawImage(cardImg, cardX, cardY, cardW, cardH);
      ctx.restore();

      // Moldura Dourada da Pintura
      const frameGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      frameGrad.addColorStop(0, '#fef08a');
      frameGrad.addColorStop(0.5, '#eab308');
      frameGrad.addColorStop(1, '#a16207');
      ctx.strokeStyle = frameGrad;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 30);
      ctx.stroke();

      // Cantos ornamentais da carta interna
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 22px serif';
      ctx.fillText('✦', cardX + 22, cardY + 22);
      ctx.fillText('✦', cardX + cardW - 22, cardY + 22);
      ctx.fillText('✦', cardX + 22, cardY + cardH - 22);
      ctx.fillText('✦', cardX + cardW - 22, cardY + cardH - 22);
    }

    // Badge de Orientação
    const badgeW = 520;
    const badgeH = 64;
    const badgeY = 1330;
    const badgeX = cx - badgeW / 2;

    ctx.fillStyle = 'rgba(15, 10, 25, 0.88)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px sans-serif';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fillText('✦  POSIÇÃO NORMAL  ✦', cx, badgeY + badgeH / 2 + 1);
    ctx.shadowBlur = 0;

    // Palavras-chave
    ctx.fillStyle = '#facc15';
    ctx.font = 'italic 28px sans-serif';
    ctx.fillText('Poder  •  Habilidade  •  Concentração  •  Ação', cx, 1440);

    // Divisor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 300, 1485);
    ctx.lineTo(cx + 300, 1485);
    ctx.stroke();
    ctx.fillStyle = '#f472b6';
    ctx.font = '22px sans-serif';
    ctx.fillText('✧', cx, 1485);

    // Caixa de Mensagem do Destino
    const boxW = W - 180;
    const boxH = 280;
    const boxX = cx - boxW / 2;
    const boxY = 1530;

    ctx.fillStyle = 'rgba(10, 5, 20, 0.65)';
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Citação sem duplicação de aspas
    const quoteRaw = sampleCard.upright;
    const cleanQuote = quoteRaw.replace(/^["“”']+|["“”']+$/g, '');
    const wrappedQuote = wrapText(ctx, `“${cleanQuote}”`, boxW - 80);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = 46;
    const totalHeight = wrappedQuote.length * lineHeight;
    const startQuoteY = boxY + (boxH - totalHeight) / 2 + (lineHeight / 2);

    wrappedQuote.forEach((line, idx) => {
      ctx.fillText(line, cx, startQuoteY + idx * lineHeight);
    });

    // Rodapé Obrigatório
    drawFooterSeal(ctx, W, 1950);

    fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_design_b_authentic.png'), canvas.toBuffer('image/png'));
  }

  console.log('✅ Ambos os designs de Canvas HD (1200x2048) foram gerados com sucesso!');
}

main().catch(console.error);

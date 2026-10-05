const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { TAROT_CATALOG } = require('./src/data/tarotCardsCatalog');

// Registra fontes da identidade oficial da Pyxie (docs/Pyxie-IDENTIDADE.md)
GlobalFonts.registerFromPath(path.join(__dirname, 'assets/fonts/Fredoka-Bold.ttf'), 'Fredoka');
GlobalFonts.registerFromPath(path.join(__dirname, 'assets/fonts/Quicksand-Bold.ttf'), 'Quicksand');
GlobalFonts.registerFromPath(path.join(__dirname, 'assets/fonts/Cinzel-700.ttf'), 'Cinzel');

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

async function renderCardTemplate1() {
  const cleanImg = await loadImage(path.join(__dirname, 'public/assets/preview/clean_template_1.png'));
  const canvas = createCanvas(cleanImg.width, cleanImg.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cleanImg, 0, 0);

  const cx = canvas.width / 2;

  // 1. Cabeçalho Romano (Fredoka / Cinzel) com Rosa Pyxie (#E60067)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Fredoka';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#e60067';
  ctx.shadowBlur = 16;
  ctx.fillText('I • O MAGO', cx, 98);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 15px Quicksand';
  ctx.fillText('[ARCANOS MAIORES]', cx, 126);

  // 2. Status da Carta
  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 16px Quicksand';
  ctx.fillText('✦ POSIÇÃO NORMAL ✦', cx, 706);

  // 3. Nome da Carta em Destaque
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Fredoka';
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 18;
  ctx.fillText('O Mago', cx, 764);
  ctx.shadowBlur = 0;

  // 4. Palavras-chave
  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 16px Quicksand';
  ctx.fillText('Poder • Habilidade • Concentração • Ação', cx, 804);

  // 5. Citação do Destino na Caixa Mística (sem aspas duplicadas)
  const boxW = 520;
  const rawQuote = 'Você possui todas as ferramentas para manifestar sua vontade no plano material.';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 19px Quicksand';
  ctx.textAlign = 'center';

  const lines = wrapText(ctx, `“${rawQuote}”`, boxW);
  const startY = lines.length > 1 ? 945 : 960;
  lines.forEach((line, idx) => {
    ctx.fillText(line, cx, startY + idx * 30);
  });

  // 6. Rodapé Canônico Obrigatório (docs/Pyxie-IDENTIDADE.md)
  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 14px Quicksand';
  ctx.fillText('TAROT • ORÁCULO DA PYXIE', cx, 1104);

  ctx.fillStyle = 'rgba(255, 143, 179, 0.75)';
  ctx.font = '12px Quicksand';
  ctx.fillText("Pyxie's Tarot by cringinho • Cringelândia", cx, 1134);

  const outPath = path.join(__dirname, 'public/assets/preview/tarot_pyxie_neon_bat.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('✅ tarot_pyxie_neon_bat.png gerado com sucesso!');
}

async function renderCardTemplate2() {
  const cleanImg = await loadImage(path.join(__dirname, 'public/assets/preview/clean_template_2.png'));
  const canvas = createCanvas(cleanImg.width, cleanImg.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cleanImg, 0, 0);

  const cx = canvas.width / 2;

  // 1. Topo: Numeral Romano
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Fredoka';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#e60067';
  ctx.shadowBlur = 18;
  ctx.fillText('I', cx, 105);
  ctx.shadowBlur = 0;

  // 2. Nome da Carta em Destaque
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Fredoka';
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 18;
  ctx.fillText('O MAGO', cx, 742);
  ctx.shadowBlur = 0;

  // 3. Palavras-chave
  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 16px Quicksand';
  ctx.fillText('[PODER] • [HABILIDADE] • [CONCENTRAÇÃO] • [AÇÃO]', cx, 788);

  // 4. Sabedoria do Destino na Caixa
  const rawQuote = 'Você possui todas as ferramentas para manifestar sua vontade no plano material.';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px Quicksand';
  ctx.textAlign = 'center';

  const lines = wrapText(ctx, `“${rawQuote}”`, 560);
  lines.forEach((line, idx) => {
    ctx.fillText(line, cx, 845 + idx * 28);
  });

  // 5. Rodapé Canônico Obrigatório (docs/Pyxie-IDENTIDADE.md)
  ctx.fillStyle = '#ff8fb3';
  ctx.font = 'bold 14px Quicksand';
  ctx.fillText('TAROT • ORÁCULO DA PYXIE', cx, 946);

  ctx.fillStyle = 'rgba(255, 143, 179, 0.75)';
  ctx.font = '12px Quicksand';
  ctx.fillText("Pyxie's Tarot by cringinho • Cringelândia", cx, 970);

  const outPath = path.join(__dirname, 'public/assets/preview/tarot_pyxie_celestial.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('✅ tarot_pyxie_celestial.png gerado com sucesso!');
}

async function main() {
  await renderCardTemplate1();
  await renderCardTemplate2();
}

main().catch(console.error);

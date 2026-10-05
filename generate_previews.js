const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { renderTarotCard } = require('./src/services/tarotRenderer');
const { TAROT_CATALOG, getCardAssetPath } = require('./src/data/tarotCardsCatalog');

async function main() {
  const sampleCard = TAROT_CATALOG[0]; // 1. O Mago
  const card10 = TAROT_CATALOG[9];     // 10. A Roda da Fortuna

  // 1. Gera o Canvas Atual (Legacy Kuromi)
  const legacyBuf = renderTarotCard(sampleCard, 'UPRIGHT', 'pt');
  fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_legacy.png'), legacyBuf);

  // 2. Cria Design Proposto A: Pyxie & Astaroth Astral
  const width = 600;
  const height = 1024;
  const canvasA = createCanvas(width, height);
  const ctxA = canvasA.getContext('2d');

  // Fundo cósmico
  const portalCx = 300;
  const portalCy = 390;
  const bgGrad = ctxA.createRadialGradient(portalCx, portalCy, 30, portalCx, portalCy, 530);
  bgGrad.addColorStop(0, '#2d1054');
  bgGrad.addColorStop(0.5, '#16052b');
  bgGrad.addColorStop(1, '#090114');
  ctxA.fillStyle = bgGrad;
  ctxA.fillRect(0, 0, width, height);

  // Partículas estelares
  ctxA.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 40; i++) {
    const rx = (Math.sin(i * 12.3) * 0.5 + 0.5) * width;
    const ry = (Math.cos(i * 7.7) * 0.5 + 0.5) * height;
    ctxA.beginPath();
    ctxA.arc(rx, ry, (i % 3 === 0) ? 2 : 1, 0, Math.PI * 2);
    ctxA.fill();
  }

  // Borda gótica dupla
  ctxA.strokeStyle = '#c084fc';
  ctxA.lineWidth = 3;
  ctxA.strokeRect(18, 18, width - 36, height - 36);
  ctxA.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctxA.lineWidth = 1;
  ctxA.strokeRect(26, 26, width - 52, height - 52);

  // Cantos mágicos ✦
  ctxA.fillStyle = '#f472b6';
  ctxA.font = 'bold 22px sans-serif';
  ctxA.textAlign = 'center';
  ctxA.textBaseline = 'middle';
  ctxA.fillText('✦', 26, 26);
  ctxA.fillText('✦', width - 26, 26);
  ctxA.fillText('✦', 26, height - 26);
  ctxA.fillText('✦', width - 26, height - 26);

  // Numeral Romano & Categoria
  ctxA.fillStyle = '#ffffff';
  ctxA.shadowColor = '#c084fc';
  ctxA.shadowBlur = 14;
  ctxA.font = 'bold 32px serif';
  ctxA.fillText('I', 300, 68);
  ctxA.shadowBlur = 0;

  ctxA.fillStyle = '#c084fc';
  ctxA.font = 'bold 13px sans-serif';
  ctxA.fillText('ARCANOS MAIORES', 300, 98);

  // Portal Místico Central
  const portalR = 150;
  const pGrad = ctxA.createRadialGradient(portalCx, portalCy, 10, portalCx, portalCy, portalR);
  pGrad.addColorStop(0, '#3b0764');
  pGrad.addColorStop(0.7, '#1e0538');
  pGrad.addColorStop(1, '#581c87');
  ctxA.fillStyle = pGrad;
  ctxA.shadowColor = 'rgba(192, 132, 252, 0.5)';
  ctxA.shadowBlur = 25;
  ctxA.beginPath();
  ctxA.arc(portalCx, portalCy, portalR, 0, Math.PI * 2);
  ctxA.fill();
  ctxA.shadowBlur = 0;

  // Anéis e marcadores zodiacais
  ctxA.strokeStyle = '#c084fc';
  ctxA.lineWidth = 3;
  ctxA.stroke();
  ctxA.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctxA.lineWidth = 1.2;
  ctxA.beginPath();
  ctxA.arc(portalCx, portalCy, portalR - 10, 0, Math.PI * 2);
  ctxA.stroke();

  // Marcadores celestes
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const dotX = portalCx + Math.cos(angle) * (portalR - 5);
    const dotY = portalCy + Math.sin(angle) * (portalR - 5);
    ctxA.fillStyle = i % 3 === 0 ? '#f472b6' : '#ffffff';
    ctxA.beginPath();
    ctxA.arc(dotX, dotY, i % 3 === 0 ? 4 : 2, 0, Math.PI * 2);
    ctxA.fill();
  }

  // Estrela octagrama de fundo
  ctxA.save();
  ctxA.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? portalR - 18 : 55;
    const x = portalCx + Math.cos(angle) * r;
    const y = portalCy + Math.sin(angle) * r;
    if (i === 0) ctxA.moveTo(x, y);
    else ctxA.lineTo(x, y);
  }
  ctxA.closePath();
  ctxA.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctxA.stroke();
  ctxA.restore();

  // Imagem da Pyxie Conjurando com o Astaroth no Portal
  const pyxieImgPath = path.join(__dirname, 'assets/pyxie/emojis/pyxie_casting_with_pet_astaroth.png');
  if (fs.existsSync(pyxieImgPath)) {
    const pyxieImg = await loadImage(fs.readFileSync(pyxieImgPath));
    const pSize = 220;
    ctxA.save();
    // Clip circular dentro do portal
    ctxA.beginPath();
    ctxA.arc(portalCx, portalCy, portalR - 12, 0, Math.PI * 2);
    ctxA.clip();
    ctxA.drawImage(pyxieImg, portalCx - pSize / 2, portalCy - pSize / 2 + 10, pSize, pSize);
    ctxA.restore();
  }

  // Badge de Orientação
  const badgeY = 578;
  const badgeW = 270;
  const badgeH = 34;
  const badgeX = 300 - badgeW / 2;
  ctxA.fillStyle = 'rgba(192, 132, 252, 0.18)';
  ctxA.strokeStyle = '#c084fc';
  ctxA.lineWidth = 1.5;
  ctxA.beginPath();
  ctxA.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
  ctxA.fill();
  ctxA.stroke();

  ctxA.fillStyle = '#ffffff';
  ctxA.font = 'bold 13px sans-serif';
  ctxA.shadowColor = '#c084fc';
  ctxA.shadowBlur = 6;
  ctxA.fillText('✦  POSIÇÃO NORMAL  ✦', 300, badgeY + badgeH / 2 + 1);
  ctxA.shadowBlur = 0;

  // Nome da Carta
  ctxA.fillStyle = '#ffffff';
  ctxA.font = 'bold 28px serif';
  ctxA.shadowColor = '#c084fc';
  ctxA.shadowBlur = 10;
  ctxA.fillText('O Mago', 300, 650);
  ctxA.shadowBlur = 0;

  // Palavras-chave
  ctxA.fillStyle = '#c084fc';
  ctxA.font = 'italic 15px sans-serif';
  ctxA.fillText('Poder  •  Habilidade  •  Concentração  •  Ação', 300, 686);

  // Divisor ornamental
  ctxA.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctxA.lineWidth = 1;
  ctxA.beginPath();
  ctxA.moveTo(140, 712);
  ctxA.lineTo(460, 712);
  ctxA.stroke();
  ctxA.fillStyle = '#c084fc';
  ctxA.font = '14px sans-serif';
  ctxA.fillText('✧', 300, 712);

  // Mensagem do Destino
  ctxA.fillStyle = '#e2e8f0';
  ctxA.font = '16px serif';
  ctxA.fillText('"Você possui todas as ferramentas para manifestar"', 300, 760);
  ctxA.fillText('"sua vontade no plano material."', 300, 785);

  // Rodapé com o Selo da Pyxie & Astaroth
  ctxA.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctxA.font = '12px sans-serif';
  ctxA.fillText('✦  PYXIE & ASTAROTH ASTRAL TAROT  ✦', 300, 970);

  fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_design_a_pyxie.png'), canvasA.toBuffer('image/png'));

  // 3. Cria Design Proposto B: Arte Autêntica da Carta + Moldura Cósmica
  const canvasB = createCanvas(width, height);
  const ctxB = canvasB.getContext('2d');

  // Fundo Cósmico Profundo
  const bgGradB = ctxB.createRadialGradient(300, 420, 50, 300, 420, 550);
  bgGradB.addColorStop(0, '#1c0733');
  bgGradB.addColorStop(0.6, '#0d0219');
  bgGradB.addColorStop(1, '#05000a');
  ctxB.fillStyle = bgGradB;
  ctxB.fillRect(0, 0, width, height);

  // Borda Dourada Estelar
  ctxB.strokeStyle = '#eab308';
  ctxB.lineWidth = 2.5;
  ctxB.strokeRect(18, 18, width - 36, height - 36);
  ctxB.strokeStyle = 'rgba(192, 132, 252, 0.4)';
  ctxB.lineWidth = 1;
  ctxB.strokeRect(26, 26, width - 52, height - 52);

  // Cantos Dourados
  ctxB.fillStyle = '#facc15';
  ctxB.font = 'bold 22px sans-serif';
  ctxB.fillText('✦', 26, 26);
  ctxB.fillText('✦', width - 26, 26);
  ctxB.fillText('✦', 26, height - 26);
  ctxB.fillText('✦', width - 26, height - 26);

  // Cabeçalho
  ctxB.fillStyle = '#ffffff';
  ctxB.font = 'bold 28px serif';
  ctxB.shadowColor = '#eab308';
  ctxB.shadowBlur = 12;
  ctxB.fillText('I  •  O MAGO', 300, 68);
  ctxB.shadowBlur = 0;

  ctxB.fillStyle = '#c084fc';
  ctxB.font = 'bold 12px sans-serif';
  ctxB.fillText('ARCANOS MAIORES  •  NAIPE ASTRAL', 300, 96);

  // Carrega e desenha a arte oficial da carta (card_01.webp) com recorte elegante
  const cardImgPath = getCardAssetPath(1);
  if (fs.existsSync(cardImgPath)) {
    const rawCardImg = await loadImage(fs.readFileSync(cardImgPath));
    const cardW = 320;
    const cardH = 540;
    const cardX = (width - cardW) / 2;
    const cardY = 120;

    // Sombra projetada
    ctxB.shadowColor = 'rgba(192, 132, 252, 0.6)';
    ctxB.shadowBlur = 30;
    ctxB.fillStyle = '#000000';
    ctxB.roundRect(cardX, cardY, cardW, cardH, 16);
    ctxB.fill();
    ctxB.shadowBlur = 0;

    // Desenha a imagem recortada com cantos arredondados
    ctxB.save();
    ctxB.beginPath();
    ctxB.roundRect(cardX, cardY, cardW, cardH, 16);
    ctxB.clip();
    ctxB.drawImage(rawCardImg, cardX, cardY, cardW, cardH);
    ctxB.restore();

    // Moldura Dourada da Imagem
    ctxB.strokeStyle = '#eab308';
    ctxB.lineWidth = 3;
    ctxB.beginPath();
    ctxB.roundRect(cardX, cardY, cardW, cardH, 16);
    ctxB.stroke();
  }

  // Badge de Orientação
  ctxB.fillStyle = 'rgba(234, 179, 8, 0.18)';
  ctxB.strokeStyle = '#eab308';
  ctxB.lineWidth = 1.5;
  ctxB.beginPath();
  ctxB.roundRect(165, 685, 270, 34, 17);
  ctxB.fill();
  ctxB.stroke();

  ctxB.fillStyle = '#ffffff';
  ctxB.font = 'bold 13px sans-serif';
  ctxB.fillText('✦  POSIÇÃO NORMAL  ✦', 300, 702);

  // Palavras-chave
  ctxB.fillStyle = '#facc15';
  ctxB.font = 'italic 16px sans-serif';
  ctxB.fillText('Poder  •  Habilidade  •  Concentração  •  Ação', 300, 745);

  // Mensagem do Destino
  ctxB.fillStyle = '#e2e8f0';
  ctxB.font = '16px serif';
  ctxB.fillText('"Você possui todas as ferramentas para manifestar"', 300, 790);
  ctxB.fillText('"sua vontade no plano material."', 300, 815);

  // Rodapé Místico
  ctxB.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctxB.font = '12px sans-serif';
  ctxB.fillText('✦  COLEÇÃO OFICIAL DE 78 CARTAS DA PYXIE  ✦', 300, 970);

  fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_design_b_authentic.png'), canvasB.toBuffer('image/png'));

  console.log('✅ Todos os 3 designs de Canvas foram gerados com sucesso em public/assets/preview/');
}

main().catch(console.error);

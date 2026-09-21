const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');
const cards = require('../src/data/tarot.json');
const { renderTarotCard } = require('../src/services/tarotRenderer');

const dirCards = path.join(__dirname, '..', 'assets', 'tarot', 'cards');
const dirUi = path.join(__dirname, '..', 'assets', 'tarot', 'ui');

fs.mkdirSync(dirCards, { recursive: true });
fs.mkdirSync(dirUi, { recursive: true });

const WIDTH = 600;
const HEIGHT = 1024;

console.log('--- Iniciando geração dos assets estáticos em WebP do Tarot ---');

// 1. Gera as 78 cartas em WebP de alta qualidade
async function generateAllCards() {
  const { loadImage } = require('@napi-rs/canvas');
  for (let idx = 0; idx < cards.length; idx++) {
    const card = cards[idx];
    const num = idx + 1;
    const pad = String(num).padStart(2, '0');
    const targetPath = path.join(dirCards, `card_${pad}.webp`);

    const pngBuffer = renderTarotCard(card, 'UPRIGHT', 'pt');
    const img = await loadImage(pngBuffer);
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const webpBuffer = canvas.toBuffer('image/webp');
    fs.writeFileSync(targetPath, webpBuffer);
  }
  console.log('✅ 78 cartas WebP geradas em assets/tarot/cards/');
}

// 2. Gera card_locked.webp
function generateLockedCard() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Fundo cósmico escuro
  const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bgGrad.addColorStop(0, '#0a0514');
  bgGrad.addColorStop(0.5, '#160b29');
  bgGrad.addColorStop(1, '#07030e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Moldura externa lilás
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);

  // Canto ornamental
  ctx.fillStyle = '#c084fc';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦', 36, 42);
  ctx.fillText('✦', WIDTH - 36, 42);
  ctx.fillText('✦', 36, HEIGHT - 32);
  ctx.fillText('✦', WIDTH - 36, HEIGHT - 32);

  // Cabeçalho
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('🔮  PYXIE TAROT  🔮', WIDTH / 2, 70);

  // Portal Místico de Bloqueio (Círculo com brilho)
  const cx = WIDTH / 2;
  const cy = 370;
  const portalR = 170;

  const pGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, portalR);
  pGrad.addColorStop(0, 'rgba(147, 51, 234, 0.35)');
  pGrad.addColorStop(0.7, 'rgba(88, 28, 135, 0.5)');
  pGrad.addColorStop(1, 'rgba(15, 7, 26, 0.9)');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, portalR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ícone de Cadeado Místico & Ponto de Interrogação
  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 96px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', cx, cy - 10);

  ctx.fillStyle = '#c084fc';
  ctx.font = '36px sans-serif';
  ctx.fillText('🔒', cx, cy + 85);

  // Título do Arcano Oculto
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('??? [ARCANO OCULTO]', cx, 630);

  ctx.fillStyle = '#c084fc';
  ctx.font = 'italic 16px sans-serif';
  ctx.fillText('✦  Carta Não Descoberta  ✦', cx, 665);

  // Divisória
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 695);
  ctx.lineTo(460, 695);
  ctx.stroke();

  // Caixa de Instruções
  const boxX = 48;
  const boxY = 725;
  const boxW = WIDTH - 96;
  const boxH = 190;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  const descLines = [
    '"Esta página ainda repousa em mistério."',
    '',
    'Realize tiragens diárias no comando /py-tarot',
    'para revelar esta carta e expandir',
    'sua coleção mágica no Álbum da Pyxie!'
  ];
  descLines.forEach((l, i) => {
    ctx.fillText(l, cx, boxY + 38 + i * 26);
  });

  // Rodapé
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('• Álbum de Tarot da Pyxie •', cx, 978);

  const lockedPath = path.join(dirUi, 'card_locked.webp');
  fs.writeFileSync(lockedPath, canvas.toBuffer('image/webp'));
  console.log('✅ assets/tarot/ui/card_locked.webp gerado com sucesso.');
}

// 3. Gera album_cover.webp
function generateAlbumCover() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bgGrad.addColorStop(0, '#15082a');
  bgGrad.addColorStop(0.5, '#2e1055');
  bgGrad.addColorStop(1, '#0c0418');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Moldura Dourada / Lilás
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

  ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);

  const cx = WIDTH / 2;

  // Cabeçalho
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦  COLEÇÃO OFICIAL DA PYXIE  ✦', cx, 70);

  // Círculo central com arte de capa
  const cy = 370;
  const pGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
  pGrad.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
  pGrad.addColorStop(0.6, 'rgba(147, 51, 234, 0.6)');
  pGrad.addColorStop(1, 'rgba(15, 7, 26, 0.95)');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Emblema Central
  ctx.fillStyle = '#ffffff';
  ctx.font = '80px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔮', cx, cy - 20);

  ctx.fillStyle = '#f472b6';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('🪽 ✨ 🪽', cx, cy + 70);

  // Título Principal
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('ÁLBUM DE TAROT', cx, 620);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('PYXIE TAROT • 78 ARCANOS', cx, 660);

  // Divisória
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(120, 690);
  ctx.lineTo(480, 690);
  ctx.stroke();

  // Caixa de Informações
  const boxX = 48;
  const boxY = 720;
  const boxW = WIDTH - 96;
  const boxH = 200;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px sans-serif';
  const coverLines = [
    'Colecione as 78 cartas lendárias da Pyxie!',
    '',
    '• 22 Arcanos Maiores — Os Grandes Mistérios do Destino',
    '• 56 Arcanos Menores — Naipes de Paus, Copas, Espadas e Ouros',
    '• 7 Conquistas Místicas para os Mestres do Oráculo',
    '',
    'Use /py-album para folhear seu acervo.'
  ];
  coverLines.forEach((l, i) => {
    ctx.fillText(l, cx, boxY + 32 + i * 24);
  });

  // Rodapé
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('• Pyxie • O Seu Guia Místico de Tarot & Coleção •', cx, 978);

  const coverPath = path.join(dirUi, 'album_cover.webp');
  fs.writeFileSync(coverPath, canvas.toBuffer('image/webp'));
  console.log('✅ assets/tarot/ui/album_cover.webp gerado com sucesso.');
}

(async () => {
  await generateAllCards();
  generateLockedCard();
  generateAlbumCover();
  console.log('--- Processo concluído com 100% de sucesso! ---');
})();



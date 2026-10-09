const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

function drawVectorStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function generateOgBanner() {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background deep cosmic dark
  ctx.fillStyle = '#0a0512';
  ctx.fillRect(0, 0, width, height);

  // Background artwork if available
  const bgPath = path.join(__dirname, '../public/assets/pyxie/pyxie_space_banner.jpg');
  if (fs.existsSync(bgPath)) {
    const bg = await loadImage(bgPath);
    ctx.drawImage(bg, 0, 0, width, height);
  }

  // Cinematic dark overlay gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(10, 5, 18, 0.90)');
  grad.addColorStop(0.5, 'rgba(16, 7, 32, 0.78)');
  grad.addColorStop(1, 'rgba(7, 3, 14, 0.94)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Glowing neon frame
  ctx.strokeStyle = 'rgba(230, 0, 103, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Decorative inner line
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Right side: HD mascot
  const mascotPath = path.join(__dirname, '../public/assets/pyxie/pyxie_mascot.png');
  if (fs.existsSync(mascotPath)) {
    const mascot = await loadImage(mascotPath);
    const mHeight = 540;
    const mWidth = Math.round((576 / 1024) * mHeight); // ~304px
    const mX = width - mWidth - 80;
    const mY = Math.round((height - mHeight) / 2) + 10;

    // Ambient halo
    const glowGrad = ctx.createRadialGradient(
      mX + mWidth / 2,
      mY + mHeight / 2,
      30,
      mX + mWidth / 2,
      mY + mHeight / 2,
      mWidth * 0.9
    );
    glowGrad.addColorStop(0, 'rgba(230, 0, 103, 0.35)');
    glowGrad.addColorStop(0.6, 'rgba(139, 92, 246, 0.2)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(mX + mWidth / 2, mY + mHeight / 2, mWidth * 0.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(mascot, mX, mY, mWidth, mHeight);
  }

  // Left Content
  // Pill badge
  ctx.fillStyle = 'rgba(230, 0, 103, 0.18)';
  ctx.strokeStyle = 'rgba(230, 0, 103, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(70, 65, 275, 38, 19);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ff75b5';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('DISCORD BOT & COMUNIDADE', 86, 89);

  // Brand Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px sans-serif';
  ctx.shadowColor = 'rgba(230, 0, 103, 0.7)';
  ctx.shadowBlur = 20;
  ctx.fillText('PYXIE', 70, 175);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#e60067';
  ctx.fillText(' • DISCORD', 300, 175);

  // Subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 22px sans-serif';
  ctx.fillText('Economia Viva • 16 Carreiras • 78 Arcanos de Tarot', 70, 225);

  // Slogan box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(70, 260, 660, 150, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'italic 21px sans-serif';
  ctx.fillText('“O acolhimento de pessoas que sofrem.', 100, 310);
  ctx.fillText('Um lugar seguro para quem acha que o mundo', 100, 345);
  ctx.fillText('é barulhento demais.”', 100, 380);

  // Catchy pills below slogan with vector spark stars (100% immune to OS font missing glyphs)
  const pills = [
    { text: '16 Profissões & Minigames', width: 220, x: 70 },
    { text: '78 Cartas de Tarot', width: 175, x: 305 },
    { text: 'Economia Viva & Cofre', width: 195, x: 495 }
  ];

  ctx.font = 'bold 14px sans-serif';
  pills.forEach(p => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(p.x, 435, p.width, 36, 18);
    ctx.fill();
    ctx.stroke();

    // Geometric vector star sparkle drawn directly via 2D canvas paths
    drawVectorStar(ctx, p.x + 18, 453, 4, 6, 2.5, '#f472b6');

    // Clean text label without raw emojis
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(p.text, p.x + 32, 458);
  });

  // Footer Tagline
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('pyxie.com.br   •   Cringelândia Community', 70, 560);

  const outPath = path.join(__dirname, '../public/assets/pyxie/og_banner_hd.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Generated HD OG banner with vector stars at:', outPath, 'Bytes:', buffer.length);
}

generateOgBanner().catch(console.error);

const path = require('node:path');
const fs = require('node:fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

// Cores temáticas da Pyxie & Cringelândia (referência: pyxieVoice.js)
const PALETTE = {
  bgTop: '#0c0617',
  bgBottom: '#18082a',
  glowViolet: 'rgba(139, 92, 246, 0.32)',
  glowPink: 'rgba(255, 20, 147, 0.28)',
  glowOrange: 'rgba(255, 123, 0, 0.25)',
  gold: '#fbbf24',
  silver: '#cbd5e1',
  bronze: '#f59e0b',
  pumpkin: '#ff7b00',
  purpleMain: '#8b5cf6',
  purpleLight: '#c084fc',
  neonPink: '#ff1493',
  cyan: '#00f5d4',
  textMain: '#ffffff',
  textMuted: '#cbd5e1',
  textDim: '#94a3b8',
  cardBg: 'rgba(26, 16, 46, 0.75)',
  cardBorder: 'rgba(168, 85, 247, 0.35)',
};

const WIDTH = 1080;
const HEIGHT = 1080;

// Cache em memória de curta duração para evitar sobrecarga em requisições concorrentes
let cachedCard = {
  buffer: null,
  lang: null,
  generatedAt: 0,
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, alpha = 0.8) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCrown(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  const w = size;
  const h = size * 0.62;
  const left = cx - w / 2;
  const bottom = cy;
  const top = cy - h;

  ctx.moveTo(left, bottom);
  ctx.lineTo(left + w, bottom);
  ctx.lineTo(left + w, top + h * 0.2);
  ctx.lineTo(left + w * 0.78, top + h * 0.48);
  ctx.lineTo(left + w * 0.5, top);
  ctx.lineTo(left + w * 0.22, top + h * 0.48);
  ctx.lineTo(left, top + h * 0.2);
  ctx.closePath();
  ctx.fill();

  // Pérolas nos 3 picos da coroa
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(left, top + h * 0.2, size * 0.08, 0, Math.PI * 2);
  ctx.arc(left + w * 0.5, top, size * 0.1, 0, Math.PI * 2);
  ctx.arc(left + w, top + h * 0.2, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDiscordLogo(ctx, cx, cy, size) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.translate(cx - size / 2, cy - size / 2);
  const s = size / 24; // escala baseada em viewbox 24x24
  ctx.beginPath();
  // Silhueta estilizada do gamepad / Discord
  ctx.roundRect(1 * s, 4 * s, 22 * s, 16 * s, 6 * s);
  ctx.fill();

  // Olhos vazados
  ctx.fillStyle = '#5865f2';
  ctx.beginPath();
  ctx.arc(8 * s, 12 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(16 * s, 12 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function sanitizeName(str) {
  if (!str) return 'Aventureiro';
  // Remove caracteres fora de faixas seguras para evitar quadrados em fontes do sistema
  let cleaned = str.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '').trim();
  cleaned = cleaned.replace(/[:\-_]+$/, '').trim();
  return cleaned || 'Aventureiro';
}

async function loadSafeImage(source) {
  if (!source) return null;
  try {
    return await loadImage(source);
  } catch (_) {
    return null;
  }
}

/**
 * Renderiza o Card de Compartilhamento Viral da Cringelândia & Pyxie
 * @param {Array} leaderboard - Lista ordenada de aventureiros
 * @param {Object} config - Configuração do evento sazonal
 * @param {Object} options - { lang: 'pt' | 'en' }
 */
async function renderLeaderboardCard(leaderboard = [], config = {}, options = {}) {
  const isEn = options.lang === 'en';
  const langKey = isEn ? 'en' : 'pt';

  // Verifica cache rápido (15 segundos) se não houver forçamento
  if (
    !options.force &&
    cachedCard.buffer &&
    cachedCard.lang === langKey &&
    Date.now() - cachedCard.generatedAt < 15000
  ) {
    return cachedCard.buffer;
  }

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Textos localizados sem símbolos que causem caracteres não mapeados (tofu)
  const T = {
    serverTag: isEn ? 'OFFICIAL DISCORD SERVER' : 'SERVIDOR OFICIAL DO DISCORD',
    communityName: 'CRINGELÂNDIA',
    subtitle: isEn
      ? `LEADERBOARD • ${String(config.eventName || 'HALLOWEEN EVENT').toUpperCase()}`
      : `PLACAR OFICIAL • ${String(config.eventName || 'HALLOWEEN DA CRINGELÂNDIA').toUpperCase()}`,
    firstPlace: isEn ? '1ST PLACE' : '1º LUGAR',
    secondPlace: isEn ? '2ND PLACE' : '2º LUGAR',
    thirdPlace: isEn ? '3RD PLACE' : '3º LUGAR',
    openSlot: isEn ? 'Open Slot!' : 'Vaga Aberta!',
    joinNow: isEn ? 'Claim Here!' : 'Dispute Aqui!',
    currency: config.currencyName || (isEn ? 'Pumpkins' : 'Abóboras'),
    inviteTitle: isEn ? 'JOIN OUR COMMUNITY' : 'VENHA JOGAR NA CRINGELÂNDIA',
    inviteSub: isEn
      ? 'Animes, RPG, live chat drops & real Gift Card prizes!'
      : 'Animes, RPG, drops ao vivo no chat & prêmios em Gift Cards!',
    inviteLink: 'discord.gg/b3uZK3ssfX',
    botCredit: 'Pyxie • pyxie.duckdns.org',
    botDesc: isEn ? 'Official RPG Fairy Bot' : 'Mascote & Bot Oficial',
  };

  // 1. Fundo Gradiente Cósmico
  const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  bgGrad.addColorStop(0, PALETTE.bgTop);
  bgGrad.addColorStop(1, PALETTE.bgBottom);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 1.1 Auras de Luz & Nebulosas (Glow Orbs)
  const drawGlow = (x, y, radius, color) => {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawGlow(200, 150, 380, PALETTE.glowViolet);
  drawGlow(900, 200, 360, PALETTE.glowPink);
  drawGlow(540, 520, 420, PALETTE.glowOrange);
  drawGlow(150, 950, 320, 'rgba(0, 245, 212, 0.15)');

  // 1.2 Brilhos e Estrelinhas Cósmicas Decorativas
  const sparkles = [
    { x: 80, y: 90, r1: 8, r2: 3, c: PALETTE.gold, a: 0.9 },
    { x: 740, y: 70, r1: 12, r2: 4, c: PALETTE.purpleLight, a: 0.8 },
    { x: 120, y: 220, r1: 6, r2: 2, c: '#fff', a: 0.7 },
    { x: 980, y: 480, r1: 10, r2: 3, c: PALETTE.neonPink, a: 0.85 },
    { x: 60, y: 640, r1: 7, r2: 2.5, c: PALETTE.cyan, a: 0.75 },
    { x: 1020, y: 780, r1: 9, r2: 3, c: PALETTE.gold, a: 0.8 },
    { x: 380, y: 270, r1: 5, r2: 2, c: '#fff', a: 0.6 },
    { x: 680, y: 260, r1: 6, r2: 2, c: PALETTE.purpleLight, a: 0.7 },
  ];
  for (const s of sparkles) {
    drawStar(ctx, s.x, s.y, 4, s.r1, s.r2, s.c, s.a);
  }

  // 1.3 Borda Moldura de Vidro Externa
  ctx.save();
  ctx.strokeStyle = PALETTE.cardBorder;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 24, 24, WIDTH - 48, HEIGHT - 48, 36);
  ctx.stroke();
  ctx.restore();

  // 2. Carregamento dos Assets
  const preferredMascotPaths = [
    path.join(__dirname, '../../../public/assets/pyxie/pyxie_halloweenCosplay.png'),
    path.join(__dirname, '../../../public/assets/pyxie/pyxie_fullart_hd.png'),
    path.join(__dirname, '../../../public/assets/pyxie/pyxie_mascot.png'),
  ];
  let mascotImg = null;
  for (const mPath of preferredMascotPaths) {
    if (fs.existsSync(mPath)) {
      mascotImg = await loadSafeImage(mPath);
      if (mascotImg) break;
    }
  }
  const pumpkinImg = await loadSafeImage('https://cdn.discordapp.com/emojis/1551355734577381447.png');

  // 3. Top Header: Tag de Servidor Oficial & Nome CRINGELÂNDIA
  // 3.1 Tag Pill
  ctx.save();
  ctx.font = 'bold 15px sans-serif';
  const tagMetrics = ctx.measureText(T.serverTag);
  const tagW = tagMetrics.width + 36;
  const tagH = 34;
  const tagX = 70;
  const tagY = 55;

  ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, tagX, tagY, tagW, tagH, 17);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PALETTE.purpleLight;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(T.serverTag, tagX + 18, tagY + tagH / 2);
  ctx.restore();

  // 3.2 Título da Comunidade: CRINGELÂNDIA (Gigante & Escancarado)
  ctx.save();
  ctx.font = '900 50px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
  ctx.shadowBlur = 25;
  ctx.fillText(T.communityName, 70, 142);

  // 3.3 Subtítulo do Evento
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = PALETTE.gold;
  ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
  ctx.shadowBlur = 12;
  ctx.fillText(T.subtitle, 70, 182);
  ctx.restore();

  // 4. Mascote Pyxie Escancarada em Alta Definição (Top Right)
  if (mascotImg) {
    ctx.save();
    // Brilho místico ao redor da mascote
    ctx.shadowColor = 'rgba(255, 20, 147, 0.65)';
    ctx.shadowBlur = 28;

    const mw = 210;
    const mh = (mascotImg.height / mascotImg.width) * mw;
    const mx = WIDTH - mw - 35;
    const my = 22;
    ctx.drawImage(mascotImg, mx, my, mw, Math.min(mh, 245));
    ctx.restore();

    // Balão de fala charmoso e perfeitamente posicionado da Pyxie
    ctx.save();
    const balloonW = 182;
    const balloonH = 42;
    const balloonX = mx - balloonW - 14;
    const balloonY = 56;

    ctx.fillStyle = 'rgba(18, 10, 32, 0.94)';
    ctx.strokeStyle = 'rgba(255, 20, 147, 0.65)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, balloonX, balloonY, balloonW, balloonH, 14);
    ctx.fill();
    ctx.stroke();

    // Rabicho do balão apontando para a Pyxie
    ctx.beginPath();
    ctx.moveTo(balloonX + balloonW - 2, balloonY + 16);
    ctx.lineTo(balloonX + balloonW + 12, balloonY + 22);
    ctx.lineTo(balloonX + balloonW - 2, balloonY + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#fce7f3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isEn ? 'Who will lead?' : 'Quem lidera o topo?', balloonX + balloonW / 2, balloonY + balloonH / 2);
    ctx.restore();
  }

  // 5. Pódio Top 3 (Centro)
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  const avatarTop1 = top1?.avatarUrl ? await loadSafeImage(top1.avatarUrl) : null;
  const avatarTop2 = top2?.avatarUrl ? await loadSafeImage(top2.avatarUrl) : null;
  const avatarTop3 = top3?.avatarUrl ? await loadSafeImage(top3.avatarUrl) : null;

  // Função para desenhar slot do pódio com coroa vetorial e ícone de abóbora
  const drawPodiumSlot = (entry, avatar, cx, cy, radius, rankNumber, crownColor, isLeader = false) => {
    ctx.save();

    // 1. Coroa Vetorial no Topo
    const crownSize = isLeader ? 46 : 34;
    drawCrown(ctx, cx, cy - radius - 10, crownSize, crownColor);

    // 2. Aura do avatar
    ctx.shadowColor = crownColor;
    ctx.shadowBlur = isLeader ? 35 : 22;
    ctx.strokeStyle = crownColor;
    ctx.lineWidth = isLeader ? 6 : 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Fundo do círculo
    ctx.fillStyle = 'rgba(26, 16, 46, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 4. Avatar ou Placeholder
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    if (avatar) {
      const scale = Math.max((radius * 2) / avatar.width, (radius * 2) / avatar.height);
      const w = avatar.width * scale;
      const h = avatar.height * scale;
      ctx.drawImage(avatar, cx - w / 2, cy - h / 2, w, h);
    } else {
      ctx.font = `bold ${radius * 0.75}px sans-serif`;
      ctx.fillStyle = crownColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy);
    }
    ctx.restore();

    // 5. Badge de Posição
    const badgeW = isLeader ? 130 : 110;
    const badgeH = isLeader ? 32 : 28;
    const badgeY = cy + radius - 14;

    ctx.fillStyle = crownColor;
    drawRoundedRect(ctx, cx - badgeW / 2, badgeY, badgeW, badgeH, 14);
    ctx.fill();

    ctx.font = `bold ${isLeader ? 14 : 12}px sans-serif`;
    ctx.fillStyle = '#0a0514';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rankLabel = rankNumber === 1 ? T.firstPlace : rankNumber === 2 ? T.secondPlace : T.thirdPlace;
    ctx.fillText(rankLabel, cx, badgeY + badgeH / 2);

    // 6. Nome do Jogador (Sanitizado de caracteres que gerem retângulos vazios)
    const nameY = badgeY + badgeH + 18;
    ctx.font = `bold ${isLeader ? 20 : 16}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let rawName = entry ? (entry.displayName || entry.username || `User#${String(entry.userId).slice(-4)}`) : T.openSlot;
    let cleanName = sanitizeName(rawName);
    if (cleanName.length > 15) cleanName = cleanName.slice(0, 14) + '…';
    ctx.fillText(cleanName, cx, nameY);

    // 7. Pontuação / Abóboras com Imagem Oficial
    const scoreY = nameY + 26;
    const scoreBoxW = isLeader ? 160 : 135;
    const scoreBoxH = 32;

    ctx.fillStyle = 'rgba(255, 123, 0, 0.2)';
    ctx.strokeStyle = 'rgba(255, 123, 0, 0.5)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, cx - scoreBoxW / 2, scoreY - scoreBoxH / 2, scoreBoxW, scoreBoxH, 12);
    ctx.fill();
    ctx.stroke();

    // Desenha mini ícone de abóbora
    const iconSize = 22;
    const iconX = cx - scoreBoxW / 2 + 10;
    const iconY = scoreY - iconSize / 2;
    if (pumpkinImg) {
      ctx.drawImage(pumpkinImg, iconX, iconY, iconSize, iconSize);
    }

    ctx.font = `bold ${isLeader ? 14 : 12}px sans-serif`;
    ctx.fillStyle = PALETTE.gold;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const scoreText = entry ? `${entry.balance} ${T.currency}` : T.joinNow;
    ctx.fillText(scoreText, cx + 12, scoreY);

    ctx.restore();
  };

  drawPodiumSlot(top2, avatarTop2, 230, 395, 46, 2, PALETTE.silver, false);
  drawPodiumSlot(top1, avatarTop1, 510, 350, 58, 1, PALETTE.gold, true);
  drawPodiumSlot(top3, avatarTop3, 790, 405, 46, 3, PALETTE.bronze, false);

  // 6. Linhas de Ranking #4 e #5 (Abaixo do Pódio)
  const renderRow = async (entry, rankNum, yPos) => {
    ctx.save();
    const rowX = 80;
    const rowW = WIDTH - 160;
    const rowH = 68;

    // Fundo da barra
    ctx.fillStyle = PALETTE.cardBg;
    ctx.strokeStyle = PALETTE.cardBorder;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, rowX, yPos, rowW, rowH, 18);
    ctx.fill();
    ctx.stroke();

    // Badge do Rank (#4, #5)
    ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
    drawRoundedRect(ctx, rowX + 16, yPos + 14, 48, 40, 12);
    ctx.fill();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = PALETTE.purpleLight;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${rankNum}`, rowX + 40, yPos + 34);

    if (entry) {
      const rowAvatar = entry.avatarUrl ? await loadSafeImage(entry.avatarUrl) : null;
      const avR = 20;
      const avCx = rowX + 90;
      const avCy = yPos + 34;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avCx, avCy, avR, 0, Math.PI * 2);
      ctx.clip();
      if (rowAvatar) {
        ctx.drawImage(rowAvatar, avCx - avR, avCy - avR, avR * 2, avR * 2);
      } else {
        ctx.fillStyle = '#3b1d5a';
        ctx.fill();
      }
      ctx.restore();

      // Nome limpo
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      let rName = sanitizeName(entry.displayName || entry.username || `User#${String(entry.userId).slice(-4)}`);
      if (rName.length > 20) rName = rName.slice(0, 19) + '…';
      ctx.fillText(rName, rowX + 125, yPos + 34);

      // Ícone e Pontuação na direita
      const rIconSize = 24;
      const rIconX = rowX + rowW - 160;
      const rIconY = yPos + 34 - rIconSize / 2;
      if (pumpkinImg) {
        ctx.drawImage(pumpkinImg, rIconX, rIconY, rIconSize, rIconSize);
      }
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = PALETTE.gold;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${entry.balance} ${T.currency}`, rIconX + 30, yPos + 34);
    } else {
      ctx.font = 'italic 16px sans-serif';
      ctx.fillStyle = PALETTE.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        isEn
          ? 'Open slot! Join the server and be the first to score!'
          : 'Vaga aberta! Entre no servidor e seja o proximo a pontuar!',
        rowX + 80,
        yPos + 34
      );

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = PALETTE.cyan;
      ctx.textAlign = 'right';
      ctx.fillText(isEn ? '+100 Coins Bonus' : '+Bônus na Entrada', rowX + rowW - 24, yPos + 34);
    }

    ctx.restore();
  };

  await renderRow(leaderboard[3] || null, 4, 570);
  await renderRow(leaderboard[4] || null, 5, 655);

  // 7. Rodapé Escancarado de Divulgação da Comunidade & Link Permanente
  const footX = 70;
  const footY = 755;
  const footW = WIDTH - 140;
  const footH = 265;

  ctx.save();
  const footGrad = ctx.createLinearGradient(footX, footY, footX + footW, footY + footH);
  footGrad.addColorStop(0, 'rgba(94, 43, 140, 0.7)');
  footGrad.addColorStop(0.5, 'rgba(38, 14, 62, 0.85)');
  footGrad.addColorStop(1, 'rgba(230, 0, 103, 0.45)');
  ctx.fillStyle = footGrad;
  ctx.strokeStyle = 'rgba(255, 20, 147, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(255, 20, 147, 0.4)';
  ctx.shadowBlur = 20;
  drawRoundedRect(ctx, footX, footY, footW, footH, 28);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 7.1 Lado Esquerdo do Rodapé: Título do Convite & Descrição
  ctx.font = '900 28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(T.inviteTitle, footX + 36, footY + 28);

  ctx.font = '500 16px sans-serif';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText(T.inviteSub, footX + 36, footY + 70);

  // 7.2 Botão / Banner do Convite Permanente (discord.gg/b3uZK3ssfX)
  const btnX = footX + 36;
  const btnY = footY + 115;
  const btnW = 540;
  const btnH = 68;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
  btnGrad.addColorStop(0, '#5865f2'); // Discord Blurple
  btnGrad.addColorStop(1, '#8b5cf6'); // Pyxie Violet
  ctx.fillStyle = btnGrad;
  ctx.shadowColor = 'rgba(88, 101, 242, 0.65)';
  ctx.shadowBlur = 20;
  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 18);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Borda brilhante
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 18);
  ctx.stroke();

  // Logo estilizada do Discord no botão
  drawDiscordLogo(ctx, btnX + 34, btnY + btnH / 2, 28);

  // Texto do Convite
  ctx.font = '900 24px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(T.inviteLink, btnX + 60, btnY + btnH / 2);

  // Badge "ENTRE JÁ" dentro do botão
  const tagEnterW = 120;
  const tagEnterH = 34;
  const tagEnterX = btnX + btnW - tagEnterW - 16;
  const tagEnterY = btnY + (btnH - tagEnterH) / 2;
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, tagEnterX, tagEnterY, tagEnterW, tagEnterH, 12);
  ctx.fill();

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#5865f2';
  ctx.textAlign = 'center';
  ctx.fillText(isEn ? 'JOIN NOW' : 'ENTRE JÁ', tagEnterX + tagEnterW / 2, tagEnterY + tagEnterH / 2);

  // Texto auxiliar de benefícios
  ctx.font = '600 13px sans-serif';
  ctx.fillStyle = PALETTE.cyan;
  ctx.textAlign = 'left';
  ctx.fillText(
    isEn
      ? 'Voice Calls • Weekly Events • Giveaways • Cozy Community'
      : 'Calls Ativas • Eventos Semanais • Sorteios • Comunidade Acolhedora',
    btnX + 4,
    btnY + btnH + 24
  );

  // 7.3 Lado Direito do Rodapé: Selo Oficial Pyxie Bot
  const rightX = footX + footW - 270;
  const rightY = footY + 45;

  ctx.fillStyle = 'rgba(18, 10, 32, 0.7)';
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, rightX, rightY, 235, 175, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('Pyxie Bot', rightX + 117, rightY + 36);

  ctx.font = '500 13px sans-serif';
  ctx.fillStyle = PALETTE.purpleLight;
  ctx.fillText(T.botDesc, rightX + 117, rightY + 68);

  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('pyxie.com.br', rightX + 117, rightY + 105);

  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('© 2026 Cringelândia', rightX + 117, rightY + 140);

  ctx.restore();

  const buffer = canvas.toBuffer('image/png');
  cachedCard = {
    buffer,
    lang: langKey,
    generatedAt: Date.now(),
  };

  return buffer;
}

module.exports = {
  renderLeaderboardCard,
  PALETTE,
  WIDTH,
  HEIGHT,
};

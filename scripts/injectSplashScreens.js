const fs = require('fs');
const path = require('path');

const SPLASH_CSS = `    /* Splash Screen Mística / Preloader da Pyxie */
    .pyxie-splash-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #07040D;
      color: #ffffff;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: auto;
    }
    .pyxie-splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
      max-width: 480px;
    }
    .pyxie-splash-aura {
      position: relative;
      width: 104px;
      height: 104px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
    }
    .pyxie-splash-glow {
      position: absolute;
      inset: -14px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(230, 0, 103, 0.45) 0%, rgba(139, 92, 246, 0.25) 55%, transparent 80%);
      filter: blur(16px);
      animation: splashGlowPulse 2.2s ease-in-out infinite alternate;
    }
    .pyxie-splash-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: #e60067;
      border-right-color: #8b5cf6;
      animation: splashSpin 1.4s linear infinite;
    }
    .pyxie-splash-icon {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      object-fit: contain;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 4px 18px rgba(230, 0, 103, 0.55));
      animation: splashFloat 2.6s ease-in-out infinite alternate;
    }
    .pyxie-splash-title {
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 10px;
      background: linear-gradient(135deg, #ffffff 40%, #e60067 80%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .pyxie-splash-subtitle {
      font-size: 0.92rem;
      color: rgba(203, 213, 225, 0.8);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pyxie-splash-dots {
      display: inline-flex;
      gap: 4px;
    }
    .pyxie-splash-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #e60067;
      animation: splashDotFade 1.2s infinite ease-in-out;
    }
    .pyxie-splash-dot:nth-child(2) { animation-delay: 0.2s; background: #c084fc; }
    .pyxie-splash-dot:nth-child(3) { animation-delay: 0.4s; background: #f43f5e; }

    @keyframes splashGlowPulse {
      0% { transform: scale(0.88); opacity: 0.4; }
      100% { transform: scale(1.2); opacity: 0.95; }
    }
    @keyframes splashSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes splashFloat {
      0% { transform: translateY(0); }
      100% { transform: translateY(-5px); }
    }
    @keyframes splashDotFade {
      0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.2); }
    }
  </style>`;

function getSplashMarkup(subtitle) {
  return `\n    <!-- Splash Screen Mística / Preloader da Pyxie -->
    <div class="pyxie-splash-screen" id="pyxieSplashScreen" role="status" aria-live="polite">
      <div class="pyxie-splash-content">
        <div class="pyxie-splash-aura">
          <div class="pyxie-splash-glow"></div>
          <div class="pyxie-splash-ring"></div>
          <img src="/assets/pyxie/pyxie_pixelart_face.png" alt="Pyxie Mascot" class="pyxie-splash-icon" width="64" height="64" />
        </div>
        <div class="pyxie-splash-title">Pyxie</div>
        <p class="pyxie-splash-subtitle">
          <span>${subtitle}</span>
          <span class="pyxie-splash-dots">
            <span class="pyxie-splash-dot"></span>
            <span class="pyxie-splash-dot"></span>
            <span class="pyxie-splash-dot"></span>
          </span>
        </p>
      </div>
    </div>\n`;
}

const TARGETS = [
  { file: 'public/index.html', subtitle: 'Conjurando Universo Pyxie' },
  { file: 'public/museum.html', subtitle: 'Carregando Galeria e Obras de Arte 3D' },
  { file: 'public/wiki.html', subtitle: 'Carregando Enciclopédia e Documentação' },
  { file: 'public/bonus.html', subtitle: 'Sintonizando Portal de Bônus e Recompensas' },
  { file: 'public/u.html', subtitle: 'Sintonizando Perfil e Cartas de Tarot' },
  { file: 'public/partnerships.html', subtitle: 'Sintonizando Mural de Alianças e Parcerias' },
];

for (const t of TARGETS) {
  const filePath = path.resolve(__dirname, '..', t.file);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');

  // Adiciona CSS da Splash se não estiver presente
  if (!html.includes('.pyxie-splash-screen')) {
    html = html.replace('</style>', `${SPLASH_CSS}`);
  }

  // Adiciona elemento HTML da Splash logo após <div id="pyxie-app">
  if (!html.includes('id="pyxieSplashScreen"')) {
    const appTag = '<div id="pyxie-app">';
    const idx = html.indexOf(appTag);
    if (idx !== -1) {
      const splashHtml = getSplashMarkup(t.subtitle);
      html = html.substring(0, idx + appTag.length) + splashHtml + html.substring(idx + appTag.length);
    }
  }

  // Adiciona CSS compilado do React se não estiver presente
  if (!html.includes('/dist/assets/index.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/dist/assets/index.css" />\n</head>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Splash Screen injetada em: ${t.file}`);
}


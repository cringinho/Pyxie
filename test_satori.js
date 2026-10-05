const fs = require('node:fs');
const path = require('node:path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { TAROT_CATALOG, getCardAssetPath } = require('./src/data/tarotCardsCatalog');

/**
 * Converte qualquer imagem (WebP/JPG) para buffer PNG em memória super rápido
 */
async function toPngDataUri(filePath) {
  const img = await loadImage(filePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const pngBuf = canvas.toBuffer('image/png');
  return `data:image/png;base64,${pngBuf.toString('base64')}`;
}

/**
 * Gera constelação e estrelas celestes de fundo em SVG
 */
function generateStarsBackgroundSvg(width, height) {
  let stars = '';
  // Partículas estelares suaves
  for (let i = 0; i < 90; i++) {
    const cx = (Math.sin(i * 19.3) * 0.5 + 0.5) * width;
    const cy = (Math.cos(i * 13.7) * 0.5 + 0.5) * height;
    const r = i % 7 === 0 ? 3.0 : (i % 3 === 0 ? 2.0 : 1.2);
    const opacity = i % 4 === 0 ? 0.9 : 0.45;
    const fill = i % 5 === 0 ? '#fef08a' : (i % 2 === 0 ? '#ffffff' : '#c084fc');
    stars += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
  }

  // Estrelas de 4 pontas / Cruzes Astrais
  const crosses = [
    { x: 90, y: 120, s: 12 },
    { x: 590, y: 130, s: 14 },
    { x: 75, y: 550, s: 10 },
    { x: 605, y: 600, s: 11 },
    { x: 90, y: 1040, s: 13 },
    { x: 590, y: 1050, s: 12 },
    { x: 340, y: 80, s: 8 },
    { x: 340, y: 1100, s: 8 }
  ];
  for (const c of crosses) {
    stars += `<path d="M${c.x} ${c.y - c.s} L${c.x} ${c.y + c.s} M${c.x - c.s} ${c.y} L${c.x + c.s} ${c.y}" stroke="#facc15" stroke-width="2" opacity="0.85"/>`;
    stars += `<circle cx="${c.x}" cy="${c.y}" r="2" fill="#fff" opacity="0.95"/>`;
  }

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${encodeURIComponent(stars)}</svg>`;
}

async function renderCardWithSatori() {
  const cinzelData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Cinzel-700.ttf'));
  const cormorantData = fs.readFileSync(path.join(__dirname, 'assets/fonts/CormorantGaramond-600.ttf'));
  
  const sampleCard = TAROT_CATALOG[0]; // 1. O Mago
  const cardImgPath = getCardAssetPath(1);
  
  // Converte a arte oficial para PNG Data URI nativo (garante decodificação 100% pelo Rust Resvg)
  const cardPngUri = await toPngDataUri(cardImgPath);
  const starsUri = generateStarsBackgroundSvg(680, 1160);

  const t0 = Date.now();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: '38px 30px',
          backgroundColor: '#07020d',
          backgroundImage: 'radial-gradient(circle at 50% 34%, #280744 0%, #110321 55%, #030006 100%)',
          border: '4px solid #eab308',
          boxSizing: 'border-box',
          fontFamily: 'Cinzel',
          color: '#ffffff',
          position: 'relative',
        },
        children: [
          // Camada de Estrelas Celestes e Constelações de Fundo
          {
            type: 'img',
            props: {
              src: starsUri,
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '680px',
                height: '1160px',
              },
            },
          },

          // Cabeçalho da Carta
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '38px',
                      fontWeight: 'bold',
                      color: '#fef08a',
                      textShadow: '0 0 20px rgba(234, 179, 8, 0.75)',
                    },
                    children: 'I  •  O MAGO',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '15px',
                      color: '#c084fc',
                      marginTop: '4px',
                      letterSpacing: '3px',
                    },
                    children: 'ARCANOS MAIORES  •  NAIPE ASTRAL',
                  },
                },
              ],
            },
          },

          // Arte da Carta de Tarot Original com Moldura Dourada Entalhada
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #fef08a, #ca8a04, #facc15, #a16207)',
                boxShadow: '0 0 40px rgba(250, 204, 21, 0.45)',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: cardPngUri,
                    style: {
                      width: '360px',
                      height: '614px',
                      borderRadius: '16px',
                    },
                  },
                },
              ],
            },
          },

          // Bloco de Informações & Significado
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              },
              children: [
                // Badge Posição Normal
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '7px 26px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(234, 179, 8, 0.22)',
                      border: '1.5px solid #facc15',
                      fontSize: '15px',
                      color: '#fef08a',
                      marginBottom: '12px',
                    },
                    children: '✦  POSIÇÃO NORMAL  ✦',
                  },
                },
                // Palavras-chave
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      fontFamily: 'Cormorant Garamond',
                      color: '#facc15',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                    },
                    children: 'Poder  •  Habilidade  •  Concentração  •  Ação',
                  },
                },
                // Citação
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '12px 20px',
                      backgroundColor: 'rgba(8, 3, 16, 0.75)',
                      border: '1px solid rgba(250, 204, 21, 0.35)',
                      borderRadius: '12px',
                      fontSize: '19px',
                      fontFamily: 'Cormorant Garamond',
                      color: '#f1f5f9',
                      width: '90%',
                    },
                    children: '“Você possui todas as ferramentas para manifestar sua vontade no plano material.”',
                  },
                },
              ],
            },
          },

          // Selo Oficial Inferior Obrigatório
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '17px',
                letterSpacing: '3px',
                color: '#fef08a',
                borderTop: '1px solid rgba(250, 204, 21, 0.35)',
                paddingTop: '14px',
                width: '80%',
                textShadow: '0 0 10px rgba(250, 204, 21, 0.5)',
              },
              children: "Pyxie's Tarot by cringinho",
            },
          },
        ],
      },
    },
    {
      width: 680,
      height: 1160,
      fonts: [
        { name: 'Cinzel', data: cinzelData, weight: 700, style: 'normal' },
        { name: 'Cormorant Garamond', data: cormorantData, weight: 600, style: 'normal' },
      ],
    }
  );

  // Renderiza com supersampling 2x Retina para ultra-nitidez via Rust Resvg (1360 x 2320)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: 2 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const elapsed = Date.now() - t0;

  fs.writeFileSync(path.join(__dirname, 'public/assets/preview/tarot_satori_demo.png'), pngBuffer);
  console.log(`✅ Satori + Resvg renderizou carta com sucesso em ${elapsed}ms! Resolução: ${pngData.width}x${pngData.height} (${pngBuffer.length} bytes)`);
}

renderCardWithSatori().catch(console.error);

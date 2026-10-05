const fs = require('node:fs');
const path = require('node:path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function buildVectorCard() {
  const fredokaData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Fredoka-Bold.ttf'));
  const quicksandData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Quicksand-Bold.ttf'));

  // Carrega mascote oficial da Pyxie e converte para PNG base64
  const mascotImg = await loadImage(path.join(__dirname, 'assets/pyxie/sticker/sticker_smile.png'));
  const mCanvas = createCanvas(mascotImg.width, mascotImg.height);
  const mCtx = mCanvas.getContext('2d');
  mCtx.drawImage(mascotImg, 0, 0);
  const mascotDataUri = `data:image/png;base64,${mCanvas.toBuffer('image/png').toString('base64')}`;

  // SVG puro dos Morceguinhos estilizados
  const batSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32" viewBox="0 0 48 32"><path d="M24 18 C18 10 8 8 2 14 C6 22 14 26 22 23 C23 25 25 25 26 23 C34 26 42 22 46 14 C40 8 30 10 24 18 Z M19 12 L21 7 L23 11 Z M29 12 L27 7 L25 11 Z" fill="%23e60067" stroke="%23ff8fb3" stroke-width="1.5"/></svg>`;

  // SVG puro do Círculo Mágico Rúnico com Estrela Octagrama
  function getMagicCircleSvg(size) {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 12;

    // Anéis concêntricos
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="%23e60067" stroke-width="3"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="%23ff8fb3" stroke-width="1.5" stroke-dasharray="6,4"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r - 32}" fill="none" stroke="%238b5cf6" stroke-width="2"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r - 46}" fill="none" stroke="%23e60067" stroke-width="1.2"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r - 80}" fill="none" stroke="%23ff8fb3" stroke-width="1.5"/>`;

    // Estrela Octagrama (8 pontas)
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 - Math.PI / 2;
      const rad = i % 2 === 0 ? r - 46 : r - 95;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="%23e60067" stroke-width="2"/>`;

    // 12 Marcadores Astrais / Glifos Cósmicos
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const dotX = cx + Math.cos(angle) * (r - 23);
      const dotY = cy + Math.sin(angle) * (r - 23);
      const fill = i % 3 === 0 ? '%23ff8fb3' : '%23e60067';
      svg += `<circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="3" fill="${fill}"/>`;
    }

    svg += `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const magicCircleDataUri = getMagicCircleSvg(480);

  // Geração do SVG via SATORI (Arquitetura moderna HTML5 + CSS)
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
          backgroundColor: '#0a0114',
          backgroundImage: 'radial-gradient(circle at 50% 38%, #2d043d 0%, #150221 55%, #08000f 100%)',
          boxSizing: 'border-box',
          padding: '28px 24px',
          border: '3px solid #e60067',
          borderRadius: '28px',
          boxShadow: '0 0 35px rgba(230, 0, 103, 0.45)',
          position: 'relative',
        },
        children: [
          // Borda Interna Violeta com Cantos Chanfrados
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                bottom: '12px',
                border: '1.5px solid #8b5cf6',
                borderRadius: '20px',
                pointerEvents: 'none',
              },
            },
          },

          // 4 Morcegos Astrais nos Cantos (Vetoriais)
          {
            type: 'img',
            props: {
              src: batSvg,
              style: { position: 'absolute', top: '24px', left: '24px', width: '40px', height: '26px' },
            },
          },
          {
            type: 'img',
            props: {
              src: batSvg,
              style: { position: 'absolute', top: '24px', right: '24px', width: '40px', height: '26px' },
            },
          },
          {
            type: 'img',
            props: {
              src: batSvg,
              style: { position: 'absolute', bottom: '24px', left: '24px', width: '40px', height: '26px' },
            },
          },
          {
            type: 'img',
            props: {
              src: batSvg,
              style: { position: 'absolute', bottom: '24px', right: '24px', width: '40px', height: '26px' },
            },
          },

          // 1. Cabeçalho: Numeral Romano & Arcano
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '10px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '34px',
                      fontFamily: 'Fredoka',
                      color: '#ffffff',
                      textShadow: '0 0 16px #e60067',
                    },
                    children: 'I',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '14px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#ff8fb3',
                      letterSpacing: '3px',
                      marginTop: '2px',
                    },
                    children: '[ARCANOS MAIORES]',
                  },
                },
              ],
            },
          },

          // 2. Círculo Mágico Rúnico com Mascote Pyxie no Centro
          {
            type: 'div',
            props: {
              style: {
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '460px',
                height: '460px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: magicCircleDataUri,
                    style: { width: '460px', height: '460px' },
                  },
                },
                // Núcleo com a Mascote Oficial em Alta Definição
                {
                  type: 'div',
                  props: {
                    style: {
                      position: 'absolute',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(10, 1, 20, 0.9)',
                      border: '2px solid #ff8fb3',
                      boxShadow: '0 0 25px rgba(230, 0, 103, 0.8)',
                    },
                    children: [
                      {
                        type: 'img',
                        props: {
                          src: mascotDataUri,
                          style: { width: '130px', height: '130px', objectFit: 'contain' },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // 3. Status da Carta
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 22px',
                borderRadius: '16px',
                backgroundColor: 'rgba(230, 0, 103, 0.18)',
                border: '1.5px solid #e60067',
                fontSize: '14px',
                fontFamily: 'Quicksand',
                fontWeight: 'bold',
                color: '#ff8fb3',
                letterSpacing: '1px',
              },
              children: '✦  POSIÇÃO NORMAL  ✦',
            },
          },

          // 4. Nome da Carta em Destaque & Palavras-chave
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
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '36px',
                      fontFamily: 'Fredoka',
                      color: '#ffffff',
                      textShadow: '0 0 16px #8b5cf6',
                    },
                    children: 'O Mago',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '15px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#ff8fb3',
                      letterSpacing: '1px',
                      marginTop: '4px',
                    },
                    children: '[Poder] • [Habilidade] • [Concentração] • [Ação]',
                  },
                },
              ],
            },
          },

          // 5. Caixa Translúcida da Mensagem do Oráculo
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px 22px',
                width: '90%',
                backgroundColor: 'rgba(20, 4, 32, 0.75)',
                border: '1.5px solid rgba(230, 0, 103, 0.5)',
                borderRadius: '16px',
                boxShadow: 'inset 0 0 15px rgba(230, 0, 103, 0.2)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '17px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#f8fafc',
                      lineHeight: '1.4',
                    },
                    children: '“Você possui todas as ferramentas para manifestar sua vontade no plano material.”',
                  },
                },
              ],
            },
          },

          // 6. Rodapé Oficial da Pyxie
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: '1px solid rgba(230, 0, 103, 0.35)',
                paddingTop: '10px',
                width: '84%',
                marginBottom: '6px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '13px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#ff8fb3',
                      letterSpacing: '2px',
                    },
                    children: 'TAROT • ORÁCULO DA PYXIE',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '12px',
                      fontFamily: 'Quicksand',
                      color: 'rgba(255, 143, 179, 0.7)',
                      marginTop: '2px',
                    },
                    children: "Pyxie's Tarot by cringinho • Cringelândia",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 650,
      height: 1050,
      fonts: [
        { name: 'Fredoka', data: fredokaData, weight: 700, style: 'normal' },
        { name: 'Quicksand', data: quicksandData, weight: 700, style: 'normal' },
      ],
    }
  );

  // Renderiza via Resvg em 2x supersampling (1300 x 2100) ultra-nítido
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: 2 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = path.join(__dirname, 'public/assets/preview/tarot_pyxie_neon_bat.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✅ Carta vetorial pura gerada com Satori + Resvg! Resolução: ${pngData.width}x${pngData.height} (${pngBuffer.length} bytes)`);
}

buildVectorCard().catch(console.error);

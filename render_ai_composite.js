const fs = require('node:fs');
const path = require('node:path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function renderAuthenticPyxieCard() {
  const fredokaData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Fredoka-Bold.ttf'));
  const quicksandData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Quicksand-Bold.ttf'));

  // Carrega a nova arte oficial da Pyxie como O Mago
  const rawArt = await loadImage(path.join(__dirname, 'assets/tarot/templates/ai_pyxie_magician_raw.jpg'));
  const aCanvas = createCanvas(rawArt.width, rawArt.height);
  const aCtx = aCanvas.getContext('2d');
  aCtx.drawImage(rawArt, 0, 0);
  const artDataUri = `data:image/jpeg;base64,${aCanvas.toBuffer('image/jpeg').toString('base64')}`;

  const W = 768;
  const H = 1376;

  // Monta a composição com Satori e paleta oficial da Pyxie (Rosa Pyxie #E60067 e Violeta #8B5CF6)
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
          boxSizing: 'border-box',
          position: 'relative',
          padding: '24px 20px',
          borderRadius: '32px',
          border: '4px solid #e60067',
          boxShadow: '0 0 40px rgba(230, 0, 103, 0.65)',
          overflow: 'hidden',
          backgroundColor: '#0a0114',
        },
        children: [
          // 1. Arte da Pyxie Autêntica no Fundo
          {
            type: 'img',
            props: {
              src: artDataUri,
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${W}px`,
                height: `${H}px`,
                objectFit: 'cover',
              },
            },
          },

          // 2. Vinheta Superior Sutil para Legibilidade
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '190px',
                backgroundImage: 'linear-gradient(to bottom, rgba(10, 1, 20, 0.95) 0%, rgba(10, 1, 20, 0.72) 65%, rgba(10, 1, 20, 0) 100%)',
              },
            },
          },

          // 3. Vinheta Inferior para a Caixa de Oráculo
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '430px',
                backgroundImage: 'linear-gradient(to top, rgba(10, 1, 20, 0.98) 0%, rgba(10, 1, 20, 0.88) 65%, rgba(10, 1, 20, 0) 100%)',
              },
            },
          },

          // 4. Cabeçalho Superior: Numeral Romano & Categoria
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
                      fontSize: '38px',
                      fontFamily: 'Fredoka',
                      color: '#ffffff',
                      textShadow: '0 0 16px #e60067, 0 0 30px #8b5cf6',
                    },
                    children: 'I  •  O MAGO',
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
                    children: 'ARCANOS MAIORES  •  NAIPE ASTRAL',
                  },
                },
              ],
            },
          },

          // 5. Bloco Inferior: Status, Palavras-chave, Oráculo e Rodapé
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
                // Badge de Orientação
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 24px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(230, 0, 103, 0.35)',
                      border: '1.5px solid #ff8fb3',
                      boxShadow: '0 0 15px rgba(230, 0, 103, 0.6)',
                      fontSize: '14px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      letterSpacing: '1px',
                      marginBottom: '10px',
                    },
                    children: '✦  POSIÇÃO NORMAL  ✦',
                  },
                },

                // Palavras-chave
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '17px',
                      fontFamily: 'Quicksand',
                      fontWeight: 'bold',
                      color: '#ff8fb3',
                      letterSpacing: '1px',
                      marginBottom: '10px',
                      textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                    },
                    children: '[Poder]  •  [Habilidade]  •  [Concentração]  •  [Ação]',
                  },
                },

                // Caixa de Mensagem do Oráculo
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '16px 24px',
                      width: '92%',
                      backgroundColor: 'rgba(15, 3, 24, 0.85)',
                      border: '1.5px solid rgba(230, 0, 103, 0.6)',
                      borderRadius: '16px',
                      boxShadow: '0 0 20px rgba(230, 0, 103, 0.3)',
                      marginBottom: '12px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '18px',
                            fontFamily: 'Quicksand',
                            fontWeight: 'bold',
                            color: '#f8fafc',
                            lineHeight: '1.45',
                          },
                          children: '“Você possui todas as ferramentas para manifestar sua vontade no plano material.”',
                        },
                      },
                    ],
                  },
                },

                // Rodapé Oficial Canônico
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(230, 0, 103, 0.4)',
                      paddingTop: '8px',
                      width: '88%',
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
                            color: 'rgba(255, 143, 179, 0.8)',
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
        ],
      },
    },
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Fredoka', data: fredokaData, weight: 700, style: 'normal' },
        { name: 'Quicksand', data: quicksandData, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: 1.5 } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = path.join(__dirname, 'public/assets/preview/tarot_ai_magician_render.png');
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✅ Carta Autêntica da Pyxie gerada com sucesso! Resolução: ${pngData.width}x${pngData.height} (${pngBuffer.length} bytes)`);
}

renderAuthenticPyxieCard().catch(console.error);

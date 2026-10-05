const fs = require('node:fs');
const path = require('node:path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { TAROT_CATALOG, getCardAssetPath } = require('./src/data/tarotCardsCatalog');

async function renderCardWithSatori() {
  const cinzelData = fs.readFileSync(path.join(__dirname, 'assets/fonts/Cinzel-700.ttf'));
  const cormorantData = fs.readFileSync(path.join(__dirname, 'assets/fonts/CormorantGaramond-600.ttf'));
  
  const sampleCard = TAROT_CATALOG[0]; // 1. O Mago
  const cardImgPath = getCardAssetPath(1);
  const cardImgBuffer = fs.readFileSync(cardImgPath);
  const cardBase64 = `data:image/webp;base64,${cardImgBuffer.toString('base64')}`;

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
          padding: '44px 36px',
          backgroundColor: '#07020d',
          backgroundImage: 'radial-gradient(circle at 50% 32%, #290847 0%, #110321 55%, #040008 100%)',
          border: '4px solid #eab308',
          boxSizing: 'border-box',
          fontFamily: 'Cinzel',
          color: '#ffffff',
        },
        children: [
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
                      fontSize: '40px',
                      fontWeight: 'bold',
                      color: '#fef08a',
                      textShadow: '0 0 20px rgba(234, 179, 8, 0.6)',
                    },
                    children: 'I  •  O MAGO',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '16px',
                      color: '#c084fc',
                      marginTop: '6px',
                      letterSpacing: '3px',
                    },
                    children: 'ARCANOS MAIORES  •  NAIPE ASTRAL',
                  },
                },
              ],
            },
          },

          // Ilustração da Carta com Moldura Dourada Reluzente
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
                boxShadow: '0 0 35px rgba(250, 204, 21, 0.4)',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: cardBase64,
                    style: {
                      width: '360px',
                      height: '610px',
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
                      padding: '7px 24px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(234, 179, 8, 0.18)',
                      border: '1.5px solid #facc15',
                      fontSize: '16px',
                      color: '#fef08a',
                      marginBottom: '14px',
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
                      marginBottom: '14px',
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
                      padding: '14px 22px',
                      backgroundColor: 'rgba(0, 0, 0, 0.55)',
                      border: '1px solid rgba(250, 204, 21, 0.3)',
                      borderRadius: '12px',
                      fontSize: '19px',
                      fontFamily: 'Cormorant Garamond',
                      color: '#e2e8f0',
                      width: '88%',
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
                paddingTop: '16px',
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

  // Renderiza com supersampling 2x Retina para ultra-nitidez via Rust Resvg
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

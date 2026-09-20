const fs = require('node:fs');
const path = require('node:path');

const srcFile = path.join(__dirname, '..', 'src', 'data', 'encounters.json');
const dataFile = path.join(__dirname, '..', 'data', 'encounters.json');

const raw = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

// Mapa de fases detalhadas para os 24 encontros
const ENCOUNTER_PHASES_DATA = {
  enc_t1_espectro_baixo_astral: [
    {
      phase: 1,
      question: {
        pt: "A existência é um fardo pesado... Você também acha tudo sem sentido?",
        en: "Existence is heavy... Do you also find it meaningless?"
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🖤 O vazio dói, mas me acostumei com a dor.", en: "🖤 The void aches, but I got used to it." },
          tone: "rational"
        },
        {
          id: "p1_opt_2",
          text: { pt: "🎧 Coloque uma música triste e esqueça o mundo.", en: "🎧 Play a sad track and forget the world." },
          tone: "submissive"
        },
        {
          id: "p1_opt_3",
          text: { pt: "💀 Para de drama e passa logo suas moedas!", en: "💀 Stop the drama and hand over coins!" },
          tone: "arrogant"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Se eu te acompanhar nas sombras, você vai me forçar a ser produtivo ou me deixará definhar em paz?",
        en: "If I accompany you through the shadows, will you force me to be productive or let me languish in peace?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "🛋️ Cada um no seu canto, sem cobranças fúteis.", en: "🛋️ To each their own space, no shallow demands." },
          tone: "empathetic"
        },
        {
          id: "p2_opt_2",
          text: { pt: "⚡ Aqui no bando todo mundo trabalha duro!", en: "⚡ In this squad everyone hustles hard!" },
          tone: "arrogant"
        },
        {
          id: "p2_opt_3",
          text: { pt: "☕ Um café frio e silêncio absoluto bastam.", en: "☕ Cold coffee and absolute silence are plenty." },
          tone: "rational"
        }
      ]
    }
  ],
  enc_t1_gargula_procrastinador: [
    {
      phase: 1,
      question: {
        pt: "Eu deveria te espantar... mas fingir que sou pedra dá bem menos trabalho. O que você quer?",
        en: "I should chase you away... but pretending to be stone is far less work. What do you want?"
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🪨 Só uma pausa rápida para esticar as pernas.", en: "🪨 Just a quick break to stretch my legs." },
          tone: "chaotic"
        },
        {
          id: "p1_opt_2",
          text: { pt: "👑 Ó grande guardião, sua postura é admirável!", en: "👑 O great guardian, your posture is admirable!" },
          tone: "flattery"
        },
        {
          id: "p1_opt_3",
          text: { pt: "⏰ Acorda, gárgula preguiçoso! A hora passa!", en: "⏰ Wake up, lazy gargoyle! Time is ticking!" },
          tone: "rational"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Se você me convencer a levantar, o que eu ganho além de dor nas costas de calcário?",
        en: "If you convince me to get up, what do I get besides limestone backaches?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "💤 A garantia de que você pode dormir 20 horas por dia.", en: "💤 The guarantee that you can sleep 20 hours a day." },
          tone: "chaotic"
        },
        {
          id: "p2_opt_2",
          text: { pt: "💰 Muitas moedas e riquezas para acumular.", en: "💰 Plenty of coins and riches to hoard." },
          tone: "pragmatic"
        },
        {
          id: "p2_opt_3",
          text: { pt: "🦴 Disciplina militar e treino diário!", en: "🦴 Military discipline and daily drills!" },
          tone: "arrogant"
        }
      ]
    }
  ],
  enc_t1_fada_desencantada: [
    {
      phase: 1,
      question: {
        pt: "Achou que ia ver glitter e pozinho mágico? Meu rímel tá borrado e meu humor pior ainda.",
        en: "Thought you'd see glitter and fairy dust? My mascara is smeared and my mood is worse."
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🖤 Rímel borrado e estética gótica dão de dez em fada fofa.", en: "🖤 Smeared mascara and gothic aesthetic beat cute fairies any day." },
          tone: "arrogant"
        },
        {
          id: "p1_opt_2",
          text: { pt: "✨ Você é tão linda e perfeita, fadinha das trevas!", en: "✨ You are so lovely and flawless, dark fairy!" },
          tone: "flattery"
        },
        {
          id: "p1_opt_3",
          text: { pt: "🧚‍♀️ Fada de verdade não usa preto nem chora.", en: "🧚‍♀️ Real fairies do not wear black nor weep." },
          tone: "rational"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Se eu me juntar a você, não espere que eu realize seus desejos fúteis de mortal. Entendido?",
        en: "If I join you, do not expect me to grant your shallow mortal wishes. Understood?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "🦇 Só quero sua acidez para afastar gente chata.", en: "🦇 I only want your acidity to keep annoying folks away." },
          tone: "arrogant"
        },
        {
          id: "p2_opt_2",
          text: { pt: "🙇 Sim, senhora! Farei tudo o que você mandar!", en: "🙇 Yes, mistress! I will obey your every command!" },
          tone: "submissive"
        },
        {
          id: "p2_opt_3",
          text: { pt: "🎲 Cada um faz o que quiser na hora que quiser.", en: "🎲 Everyone does as they please whenever they want." },
          tone: "chaotic"
        }
      ]
    }
  ],
  enc_t1_morcego_shoegaze: [
    {
      phase: 1,
      question: {
        pt: "As cavernas ressoam uma frequência em ré menor... Você sente a vibração ou só ouve barulho?",
        en: "The caves resonate in D-minor frequency... Do you feel the vibration or just noise?"
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🎵 A melancolia do eco acalma a mente cansada.", en: "🎵 The melancholy of the echo calms a weary mind." },
          tone: "rational"
        },
        {
          id: "p1_opt_2",
          text: { pt: "🦇 Guie meus passos através dessas frequências.", en: "🦇 Guide my footsteps through these frequencies." },
          tone: "empathetic"
        },
        {
          id: "p1_opt_3",
          text: { pt: "🔊 Que barulheira insuportável de morcego!", en: "🔊 What an insufferable bat screech!" },
          tone: "arrogant"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Quando o silêncio finalmente cai, o que você escuta no fundo do seu peito?",
        en: "When the silence finally falls, what do you hear deep in your chest?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "🌌 O eco distante de memórias que nunca vivi.", en: "🌌 The distant echo of memories I never lived." },
          tone: "empathetic"
        },
        {
          id: "p2_opt_2",
          text: { pt: "💸 O tilintar das moedas que ainda vou acumular.", en: "💸 The clinking of coins I have yet to hoard." },
          tone: "pragmatic"
        },
        {
          id: "p2_opt_3",
          text: { pt: "🎧 Distorção pesada e pedais de guitarra.", en: "🎧 Heavy fuzz distortion and guitar pedals." },
          tone: "chaotic"
        }
      ]
    }
  ],
  enc_t1_fadinha_lampiao: [
    {
      phase: 1,
      question: {
        pt: "Meu lampião brilha roxo para espantar os chatos. Você é chato?",
        en: "My lantern glows purple to keep bores away. Are you a bore?"
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🎲 Chato nunca, imprevisível e meio doido sempre.", en: "🎲 Never boring, always unpredictable and a bit crazy." },
          tone: "chaotic"
        },
        {
          id: "p1_opt_2",
          text: { pt: "📜 Depende da sua definição empírica de tédio.", en: "📜 Depends on your empirical definition of boredom." },
          tone: "rational"
        },
        {
          id: "p1_opt_3",
          text: { pt: "👑 Eu sou a criatura mais incrível que você já viu!", en: "👑 I am the most amazing creature you have ever seen!" },
          tone: "arrogant"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Se eu te mostrar um atalho secreto, você jura que vai pisar em todas as poças de lama?",
        en: "If I show you a secret shortcut, do you swear to stomp on every puddle of mud?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "💦 Vou espirrar lama roxa em todo mundo!", en: "💦 I will splash purple mud on everyone!" },
          tone: "chaotic"
        },
        {
          id: "p2_opt_2",
          text: { pt: "👞 Minhas botas de couro custaram caro demais.", en: "👞 My leather boots were far too expensive." },
          tone: "pragmatic"
        },
        {
          id: "p2_opt_3",
          text: { pt: "🙇 Farei exatamente o que sua majestade ordenar!", en: "🙇 I will do exactly what your highness commands!" },
          tone: "flattery"
        }
      ]
    }
  ],
  enc_t1_demonio_cera: [
    {
      phase: 1,
      question: {
        pt: "A cera quente pinga... Cada gota é uma alma que tentou me pechinchar. Quanto você acha que vale a minha chama?",
        en: "Hot wax drips... Each drop is a soul that tried to haggle with me. How much is my flame worth?"
      },
      options: [
        {
          id: "p1_opt_1",
          text: { pt: "🪙 Vale o que o mercado arcano estiver disposto a pagar.", en: "🪙 Worth whatever the arcane market is willing to pay." },
          tone: "pragmatic"
        },
        {
          id: "p1_opt_2",
          text: { pt: "🕯️ Sua chama ilumina a própria escuridão eterna!", en: "🕯️ Your flame illuminates the very eternal darkness!" },
          tone: "flattery"
        },
        {
          id: "p1_opt_3",
          text: { pt: "💨 Um sopro meu apaga essa velinha de bolo.", en: "💨 A single puff of mine puts out that birthday candle." },
          tone: "arrogant"
        }
      ]
    },
    {
      phase: 2,
      question: {
        pt: "Negócios são negócios. Se fecharmos o pacto, o que eu levo em troca além de cera derretida?",
        en: "Business is business. If we seal the pact, what do I get besides melted wax?"
      },
      options: [
        {
          id: "p2_opt_1",
          text: { pt: "💰 Participação justa em todos os saques da tumba.", en: "💰 Fair percentage in all tomb scavenges." },
          tone: "pragmatic"
        },
        {
          id: "p2_opt_2",
          text: { pt: "🔥 Fogo descontrolado e caos por onde passarmos!", en: "🔥 Wild uncontrolled fire and chaos wherever we tread!" },
          tone: "chaotic"
        },
        {
          id: "p2_opt_3",
          text: { pt: "🖤 Apenas minha profunda gratidão de alma.", en: "🖤 Just my deepest soul gratitude." },
          tone: "empathetic"
        }
      ]
    }
  ]
};

// Gerador sistemático para os 24 encontros mantendo coerência estrita
const ALL_ENCOUNTERS = raw.encounters;

for (const enc of ALL_ENCOUNTERS) {
  const tier = enc.tier || 1;
  const temp = enc.temperament || 'caotico';
  const targetRounds = tier === 1 ? 2 : (tier <= 3 ? 3 : 4);

  if (ENCOUNTER_PHASES_DATA[enc.id]) {
    enc.phases = ENCOUNTER_PHASES_DATA[enc.id];
  } else {
    // Gerar dinamicamente 2, 3 ou 4 fases coerentes com base na criatura
    const phases = [];
    const baseQ = enc.monster_dialogue?.pt || "O que você busca nas sombras?";
    const baseQEn = enc.monster_dialogue?.en || "What do you seek in the shadows?";

    // Fase 1: Pergunta inicial do encontro
    phases.push({
      phase: 1,
      question: { pt: baseQ, en: baseQEn },
      options: enc.options || [
        { id: "p1_o1", text: { pt: "Analisar a situação com prudência e calma.", en: "Analyze situation with prudence and calm." }, tone: "rational" },
        { id: "p1_o2", text: { pt: "Não tenho medo de sombras nem de monstros!", en: "I fear neither shadows nor monsters!" }, tone: "arrogant" },
        { id: "p1_o3", text: { pt: "Vamos ver o circo pegar fogo e rir de tudo.", en: "Let the world burn while we laugh at it." }, tone: "chaotic" }
      ]
    });

    // Fase 2: Teste de Filosofia / Resolução
    phases.push({
      phase: 2,
      question: {
        pt: temp === 'orgulhoso'
          ? "Você ousa me encarar como um igual? Diga-me qual é a sua real ambição diante de mim!"
          : (temp === 'sadico'
            ? "Ver você suar frio me diverte... mas quero ver se sua língua é tão afiada quanto sua coragem."
            : (temp === 'pragmatico'
              ? "Palavras bonitas não compram relíquias. Mostre-me qual é o seu plano de sobrevivência."
              : "O vento sopra cinzas antigas... Você sabe o que realmente significa perder tudo?")),
        en: temp === 'orgulhoso'
          ? "You dare look upon me as an equal? State your true ambition before my presence!"
          : (temp === 'sadico'
            ? "Watching you squirm is amusing... but tell me if your tongue is as sharp as your spine."
            : (temp === 'pragmatico'
              ? "Pretty words do not buy relics. Show me your tangible plan for survival."
              : "The wind scatters ancient ashes... Do you truly comprehend the weight of loss?"))
      },
      options: [
        {
          id: "p2_o1",
          text: {
            pt: temp === 'orgulhoso' || temp === 'sadico'
              ? "Não sou servo de ninguém, mas sei reconhecer poder genuíno."
              : "Calculo cada passo friamente antes de dar o próximo movimento.",
            en: temp === 'orgulhoso' || temp === 'sadico'
              ? "I am no servant to anyone, yet I recognize genuine power."
              : "I calculate every step cold-bloodedly before making my move."
          },
          tone: "rational"
        },
        {
          id: "p2_o2",
          text: {
            pt: temp === 'caotico'
              ? "Viver no limite do abismo é a única forma divertida de existir!"
              : "Seja o que for, eu tomo à força se for necessário.",
            en: temp === 'caotico'
              ? "Living on the brink of the abyss is the only fun way to exist!"
              : "Whatever it is, I shall take it by force if necessary."
          },
          tone: temp === 'caotico' ? "chaotic" : "arrogant"
        },
        {
          id: "p2_o3",
          text: {
            pt: "Oh, vossa grandeza é absoluta! Me prostro diante de sua soberania!",
            en: "Oh, your greatness is absolute! I bow before your supreme sovereignty!"
          },
          tone: "flattery"
        }
      ]
    });

    // Fase 3 (para Tier >= 2)
    if (targetRounds >= 3) {
      phases.push({
        phase: 3,
        question: {
          pt: temp === 'ganancioso' || temp === 'pragmatico'
            ? "Chegamos ao cerne do pacto. Se encontrarmos um tesouro ancestral, qual será a divisão exata?"
            : (temp === 'orgulhoso'
              ? "Sua determinação quase me impressiona. Mas você juraria lealdade sem hesitar quando o reino desabar?"
              : "A névoa está se fechando... Você está pronto para aceitar o peso das escolhas que faremos juntos?"),
          en: temp === 'ganancioso' || temp === 'pragmatico'
            ? "We arrive at the core of the pact. If we find an ancient hoard, what is the exact split?"
            : (temp === 'orgulhoso'
              ? "Your resolve almost impresses me. But would you swear unyielding allegiance when the realm falls?"
              : "The mist is closing in... Are you prepared to bear the weight of the choices we shall make together?")
        },
        options: [
          {
            id: "p3_o1",
            text: {
              pt: "Metade para quem encontrar, metade para quem mantiver ambos vivos.",
              en: "Half to whoever finds it, half to whoever keeps us both alive."
            },
            tone: "pragmatic"
          },
          {
            id: "p3_o2",
            text: {
              pt: "Não faço juramentos vazios; minhas ações na batalha falarão por mim.",
              en: "I make no empty oaths; my deeds in battle shall speak for me."
            },
            tone: "rational"
          },
          {
            id: "p3_o3",
            text: {
              pt: "Vou ficar com tudo e dar risada na sua cara!",
              en: "I will keep everything and laugh straight in your face!"
            },
            tone: "chaotic"
          }
        ]
      });
    }

    // Fase 4 (para Tier >= 4)
    if (targetRounds >= 4) {
      phases.push({
        phase: 4,
        question: {
          pt: tier === 5
            ? "Você atingiu o limiar definitivo. Para selar este vínculo soberano com Kuromi, você sacrificaria sua própria essência mortal?"
            : "Diante dos portões do infinito, este é o último teste da sua mente. Qual é a sua verdade final?",
          en: tier === 5
            ? "You have reached the ultimate threshold. To seal this sovereign bond with Kuromi, would you surrender your mortal essence?"
            : "Before the gates of infinity, this is the final trial of your intellect. What is your definitive truth?"
        },
        options: [
          {
            id: "p4_o1",
            text: {
              pt: "Minha essência é a própria penumbra; o pacto apenas formaliza o que já sou.",
              en: "My essence is the gloom itself; the pact merely formalizes what I already am."
            },
            tone: "rational"
          },
          {
            id: "p4_o2",
            text: {
              pt: "Eu conquistei o direito de estar aqui pelo meu próprio mérito e coragem!",
              en: "I conquered the right to stand here through my own merit and courage!"
            },
            tone: "arrogant"
          },
          {
            id: "p4_o3",
            text: {
              pt: "Por favor, tenha piedade de mim, sou apenas um pobre mortal insignificante!",
              en: "Please have mercy on me, I am merely an insignificant mortal!"
            },
            tone: "submissive"
          }
        ]
      });
    }

    enc.phases = phases;
  }
}

// Salvar nos 2 arquivos JSON
fs.writeFileSync(srcFile, JSON.stringify(raw, null, 2), 'utf8');
fs.writeFileSync(dataFile, JSON.stringify(raw, null, 2), 'utf8');
console.log('Successfully updated encounters.json with multi-phase unpredictable negotiation data!');

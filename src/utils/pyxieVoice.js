const PYXIE_COLORS = {
  lilac: '#5e2b8c',
  violet: '#8a2be2',
  purple: '#9b5de5',
  crimson: '#ef4444',
  emerald: '#10b981',
  neonPink: '#ff1493',
  magenta: '#e60067',
  gold: '#f59e0b',
  cyan: '#00f5d4',
  darkBg: '#0e0717',
  ink: '#120b1f',
  red: '#ef4444',
  green: '#22c55e',
};

const PYXIE_FOOTER = 'Pyxie';

const ROTATING_TIPS = {
  pt: [
    '🎀 Psst: Pega logo o /py-daily antes que eu cobre taxa por você respirar no meu chat!',
    '🎀 Psst: Vai bater ponto em /py-work! Não tolero subordinado passando fome e pedindo esmola.',
    '🎀 Psst: Ajeita essa vergonha de perfil no /py-profile antes que alguém printe!',
    '🎀 Psst: Cadê as 78 cartas do seu /py-album? Até uma toupeira coleciona mais rápido.',
    '🎀 Psst: Tira um /py-tarot agora! Não que eu me importe, mas adoro ver o destino aprontar.',
    '🎀 Psst: Quebra logo o /py-cookie... e se vier frase cafona, nem ouse ler em voz alta!',
    '🎀 Psst: Passa no /py-ship com seu rolinho! Se a química for um desastre, eu aviso logo!',
    '🎀 Psst: Cansou de errar sozinho? O /py-help mostra os comandos, vai ler o manual!',
  ],
  en: [
    '🎀 Psst: Grab your /py-daily right now before I charge rent for you breathing in my chat!',
    '🎀 Psst: Clock in at /py-work! I won\'t have my subordinates begging for spare coins.',
    '🎀 Psst: Fix that embarrassing card in /py-profile before someone screenshots it!',
    '🎀 Psst: Where are the 78 cards in your /py-album? Even a mole collects faster than you.',
    '🎀 Psst: Pull a /py-tarot card right now! Not that I care, but I love seeing fate cause chaos.',
    '🎀 Psst: Crack open a /py-cookie... and if you get cheesy advice, don\'t tell me!',
    '🎀 Psst: Test your crush with /py-ship! If your chemistry is a disaster, I\'ll be the first to laugh.',
    '🎀 Psst: Tired of messing up? /py-help has the commands, go read the manual!',
  ],
};

function getRandomTip(source = null) {
  let lang = 'pt';
  try {
    const { getLanguage } = require('./i18n');
    lang = getLanguage(source);
  } catch (e) {
    lang = 'pt';
  }
  const list = ROTATING_TIPS[lang] || ROTATING_TIPS.pt;
  return list[Math.floor(Math.random() * list.length)];
}

function pyxieFooter(baseText = null, source = null) {
  const tip = getRandomTip(source);
  if (baseText && typeof baseText === 'string') {
    return `${baseText} • ${tip}`;
  }
  return `Pyxie • ${tip}`;
}

const PYXIE_PHRASES = {
  welcome: [
    'Olha só quem resolveu dar as caras. Mais um pra minha lista de subordinados... Espero que traga doces ou moedas!',
    'Quem autorizou esse novato a entrar?! Brincadeira... Digo, entra logo e não fica parado na porta passando vergonha!',
    'Atenção, súditos! Chegou novato no pedaço. Se você quebrar alguma coisa no servidor, anoto seu nome no meu caderninho preto!',
    'Mais um desocupado no servidor... Sorte sua que eu sou uma líder magnânima e deixo você ficar por perto.',
    'Entrou? Ótimo. Já vai lendo as regras e não me faz passar vergonha no chat!',
  ],
  leisure: [
    'Que tédio mortal... Se ninguém puxar uma fofoca boa em dois minutos, eu mesma invento um boato!',
    'Quem não arrisca uma moeda na sorte nem devia estar acordado agora. Anda, cadê a coragem?',
    'Tsc, chat parado parece velório de samambaia. Mexam esses dedos antes que eu passe um sermão!',
  ],
};

function getRandomPhrase(category = 'welcome') {
  const list = PYXIE_PHRASES[category] || PYXIE_PHRASES.welcome;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  PYXIE_COLORS,
  PYXIE_FOOTER,
  ROTATING_TIPS,
  getRandomTip,
  pyxieFooter,
  PYXIE_PHRASES,
  getRandomPhrase,
  // Compatibilidade durante migração
  KUROMI_COLORS: PYXIE_COLORS,
  KUROMI_FOOTER: PYXIE_FOOTER,
  kuromiFooter: pyxieFooter,
};

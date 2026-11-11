const deck = require('./phraseDeck');

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

// Dicas do rodapé: aberturas diferentes de propósito (o sorteio sem repetição fica no phraseDeck).
const ROTATING_TIPS = {
  pt: [
    '🎀 Já pegou o /py-daily hoje? Moeda não se coleta sozinha.',
    '💼 O /py-work paga em moedinha e em material pra oficina.',
    '🃏 Uma carta por dia no /py-tarot. O destino não espera.',
    '📒 Faltam cartas no seu /py-album. Eu contei.',
    '🍪 Biscoito da sorte no /py-cookie. Frase cafona garantida.',
    '💘 Testa a química com alguém no /py-ship. Eu fico de fofoca.',
    '🧭 Se perdeu? O /py-help lista tudo, até pra quem pula manual.',
    '🪪 Seu cartão no /py-profile tá pedindo um título novo.',
    '🏆 Quer subir no /py-rank? Diário e trabalho todo dia, sem desculpa.',
    '🎲 Decide no /py-coinflip. A moeda nunca fica em dúvida.',
    '🧠 Desafia alguém no /py-quiz. Perder também conta como diversão.',
    '🔮 O /py-likely rende fofoca saudável no grupo. Usa com sabedoria.',
    '🌙 Volta amanhã. Eu guardo o seu lugar. Não que eu queira.',
    '📊 Cadê suas conquistas? O /py-achievements tem a lista inteira.',
    '🗳️ Votar na Pyxie no Top.gg rende feijão mágico. Só dizendo.',
    '🧮 O /py-math puxa pelo cérebro sem cobrar moeda nenhuma.',
  ],
  en: [
    '🎀 Got your /py-daily today? Coins don\'t collect themselves.',
    '💼 /py-work pays in coins and workshop materials.',
    '🃏 One card a day with /py-tarot. Fate doesn\'t wait.',
    '📒 Your /py-album is missing cards. I counted.',
    '🍪 Fortune cookie at /py-cookie. Cheesy line guaranteed.',
    '💘 Test the chemistry with someone at /py-ship. I\'ll gossip.',
    '🧭 Lost? /py-help lists everything, even for people who skip manuals.',
    '🪪 Your /py-profile card is begging for a new title.',
    '🏆 Want to climb /py-rank? Daily and work, every day, no excuses.',
    '🎲 Decide it with /py-coinflip. The coin is never unsure.',
    '🧠 Challenge someone at /py-quiz. Losing counts as fun too.',
    '🔮 /py-likely makes healthy group gossip. Use it wisely.',
    '🌙 Come back tomorrow. I\'ll save your seat. Not that I want to.',
    '📊 Where are your achievements? /py-achievements has the full list.',
    '🗳️ Voting for Pyxie on Top.gg earns magic beans. Just saying.',
    '🧮 /py-math works your brain without costing a single coin.',
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
  const code = ROTATING_TIPS[lang] ? lang : 'pt';
  return deck.pick(ROTATING_TIPS[code], { key: `tip:${code}` });
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
  const name = PYXIE_PHRASES[category] ? category : 'welcome';
  return deck.pick(PYXIE_PHRASES[name], { key: `phrase:${name}` });
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

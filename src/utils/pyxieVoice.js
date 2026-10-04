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
    '💡 Dica: Use /py-daily todos os dias para acumular moedas e feijões mágicos.',
    '💡 Dica: Vote na Cringelândia no Top.gg para ganhar bônus extras de moedas e feijões mágicos.',
    '💡 Dica: Você pode personalizar títulos e temas no seu /py-profile.',
    '💡 Dica: Complete seu álbum de 78 cartas de Tarot e resgate conquistas em /py-album.',
    '💡 Dica: Experimente o Tarot diário (/py-tarot) para prever seu dia.',
    '💡 Dica: Quebre o biscoito da sorte diário em /py-cookie para ganhar moedas.',
    '💡 Dica: Trabalhe diariamente em /py-work para subir na carreira.',
    '💡 Dica: Calcule sua afinidade amorosa com seu par usando /py-ship.',
  ],
  en: [
    '💡 Tip: Use /py-daily every day to accumulate coins and magic beans.',
    '💡 Tip: Vote for Cringelândia on Top.gg to earn extra coins and magic beans bonus.',
    '💡 Tip: Customize your titles and visual themes in /py-profile.',
    '💡 Tip: Complete your 78-card Tarot album and claim achievements in /py-album.',
    '💡 Tip: Draw a daily Tarot reading (/py-tarot) to foresee your fortune.',
    '💡 Tip: Crack open your daily fortune cookie in /py-cookie for coins.',
    '💡 Tip: Complete shifts in /py-work to advance your professional career.',
    '💡 Tip: Check your romance affinity with your special someone using /py-ship.',
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
    'Ora, ora... quem é esse que entrou?',
    'Olha só quem resolveu dar as caras. Espero que traga doces ou dinheiro com ele...',
    'Boas-vindas ao incrível e mágico recanto da Pyxie!',
    'Mais um aventureiro pronto para acumular moedinhas, ler cartas e curtir a comunidade!',
    'Que o seu dia seja repleto de boas risadas!',
  ],
  leisure: [
    'Uma pausa para o café e uma boa partida entre amigos!',
    'Quem não arrisca uma moeda na sorte não conhece a verdadeira diversão.',
    'A magia de Pyxie está no ar, iluminando cada cantinho do servidor!',
  ],
};

function getRandomPhrase(category = 'welcome') {
  const list = PYXIE_PHRASES[category] || PYXIE_PHRASES.welcome;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  PYXIE_COLORS,
  PYXIE_FOOTER,
  pyxieFooter,
  PYXIE_PHRASES,
  getRandomPhrase,
  // Compatibilidade durante migração
  KUROMI_COLORS: PYXIE_COLORS,
  KUROMI_FOOTER: PYXIE_FOOTER,
  kuromiFooter: pyxieFooter,
};


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
    '💡 Dica: Negocie relíquias raras com outros jogadores usando /py-trade.',
    '💡 Dica: Você pode personalizar títulos e temas no seu /py-profile.',
    '💡 Dica: No Bosque (/py-explore), espíritos recrutados concedem auras passivas.',
    '💡 Dica: Experimente o Tarot diário (/py-tarot) para prever seu dia.',
    '💡 Dica: Quebre o biscoito da sorte diário em /py-cookie para ganhar moedas.',
    '💡 Dica: Trabalhe diariamente em /py-work para subir na carreira.',
    '💡 Dica: Relíquias não podem ser vendidas na loja, apenas trocadas.',
  ],
  en: [
    '💡 Tip: Use /py-daily every day to accumulate coins and magic beans.',
    '💡 Tip: Trade rare relics with other players using /py-trade.',
    '💡 Tip: Customize your titles and visual themes in /py-profile.',
    '💡 Tip: In the Grove (/py-explore), recruited spirits grant unique passive auras.',
    '💡 Tip: Draw a daily Tarot reading (/py-tarot) to foresee your fortune.',
    '💡 Tip: Crack open your daily fortune cookie in /py-cookie for coins.',
    '💡 Tip: Complete shifts in /py-work to advance your professional career.',
    '💡 Tip: Relics cannot be sold in the shop, only traded.',
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
    'Ora, ora... quem deixou esse mortal entrar no meu reino de travessuras?',
    'Olha só quem resolveu dar as caras. Espero que traga doces ou moedas de ouro.',
    'Boas-vindas ao incrível e mágico recanto da Pyxie!',
    'Mais um aventureiro pronto para acumular moedinhas, ler cartas e curtir a comunidade!',
    'Que o seu dia seja repleto de riquezas e boas risadas!',
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


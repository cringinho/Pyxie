const PYXIE_COLORS = {
  lilac: '#5e2b8c',
  violet: '#8a2be2',
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

function pyxieFooter() {
  return PYXIE_FOOTER;
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


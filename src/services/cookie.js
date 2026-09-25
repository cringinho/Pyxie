const { getUserAccount, updateUserAccount, addCoins } = require('./economy');

const COOKIE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas

const FORTUNES_PT = [
  // 25 Fortunas Positivas (+15 Moedas)
  { text: 'Um sopro de ventura dourada cruzou seu caminho. As estrelas abençoaram sua jornada!', type: 'positive' },
  { text: 'Sua generosidade silenciosa finalmente foi notada pelos espíritos guardiões do bosque.', type: 'positive' },
  { text: 'A Pyxie encontrou uma sacola esquecida de moedas e decidiu que você merecia!', type: 'positive' },
  { text: 'A névoa se abriu revelando um tesouro cintilante sob o luar encantado.', type: 'positive' },
  { text: 'Um feitiço de prosperidade repousou suavemente sobre seus ombros hoje.', type: 'positive' },
  { text: 'Sua intuição aguçada guiou seus passos até uma fonte mágica de pura abundância.', type: 'positive' },
  { text: 'A sorte favorece quem caminha com o coração leve e um sorriso acolhedor.', type: 'positive' },
  { text: 'Um corvo mensageiro trouxe moedas perdidas de um viajante das estrelas para você.', type: 'positive' },
  { text: 'As flores da penumbra desabrocharam em homenagem à sua dedicação e paciência.', type: 'positive' },
  { text: 'Mesmo nas trilhas mais escuras, a luz da Pyxie ilumina seu caminho com riquezas.', type: 'positive' },
  { text: 'Você emanou tanta energia positiva que o universo retribuiu na mesma moeda.', type: 'positive' },
  { text: 'Um antigo enigma foi decifrado em seus sonhos, revelando moedas escondidas.', type: 'positive' },
  { text: 'A deusa do destino sorriu para o seu esforço diário. Colha os frutos da perseverança.', type: 'positive' },
  { text: 'Uma brisa cálida soprou para longe todas as suas preocupações financeiras hoje.', type: 'positive' },
  { text: 'Sua lealdade aos amigos encantou as fadas, que deixaram um mimo especial.', type: 'positive' },
  { text: 'Hoje qualquer projeto que você iniciar terá bênçãos cósmicas e ventos a favor.', type: 'positive' },
  { text: 'A Pyxie adorou sua presença aqui hoje e depositou um agrado brilhante no seu cofre!', type: 'positive' },
  { text: 'Você descobriu uma fenda no tecido da realidade repleta de brilho dourado.', type: 'positive' },
  { text: 'O orvalho da manhã tocou seu rosto como uma promessa de dias muito mais prósperos.', type: 'positive' },
  { text: 'Sua criatividade inspirou seres ancestrais que recompensaram sua visão luminosa.', type: 'positive' },
  { text: 'Um vislumbre de sabedoria te poupará de dores de cabeça e trará abundância.', type: 'positive' },
  { text: 'Quem compartilha boas vibrações recebe o triplo em alegria e prosperidade.', type: 'positive' },
  { text: 'O portal da bonança se abriu por breves instantes e você aproveitou a bênção!', type: 'positive' },
  { text: 'Um encontro inesperado trará risadas sinceras e boas oportunidades de ouro.', type: 'positive' },
  { text: 'A constelação da Fada Radiante está alinhada diretamente com sua carteira!', type: 'positive' },

  // 25 Fortunas Negativas (-15 Moedas)
  { text: 'Um duende trapaceiro passou correndo e afanou algumas moedas do seu bolso!', type: 'negative' },
  { text: 'A Pyxie cobrou uma taxa surpresa de pedágio mágico por você pisar nas flores dela.', type: 'negative' },
  { text: 'Você tropeçou numa raiz encantada e algumas moedinhas rolaram ribanceira abaixo.', type: 'negative' },
  { text: 'Um corvo atrevido bicou sua carteira e voou gargalhando com um punhado de moedas.', type: 'negative' },
  { text: 'A sorte hoje decidiu tirar uma soneca profunda. Cuidado onde pisa!', type: 'negative' },
  { text: 'Uma chuva ácida de mau humor atingiu seus pertences, desgastando suas reservas.', type: 'negative' },
  { text: 'Você comprou uma poção mágica vencida de um goblin charlatão. Que prejuízo!', type: 'negative' },
  { text: 'A Pyxie exigiu um tributo de travessura para não pregar chiclete no seu cabelo.', type: 'negative' },
  { text: 'Um fantasma zombeteiro passou voando e derrubou sua bolsinha de moedas no bueiro.', type: 'negative' },
  { text: 'O café esfriou, o pão caiu com a manteiga para baixo e suas moedas sumiram.', type: 'negative' },
  { text: 'Hoje não é o melhor dia para apostas arriscadas. O universo pediu prudência.', type: 'negative' },
  { text: 'Um feitiço de confusão fez você pagar a conta de um estranho no bar mágico.', type: 'negative' },
  { text: 'Cuidado com sussurros lisonjeiros: alguém tentou passar a perna nas suas economias.', type: 'negative' },
  { text: 'As fadas da noite cobraram impostos arcanos pelo ar encantado que você respirou.', type: 'negative' },
  { text: 'Você esqueceu de saudar os gnomos da floresta e recebeu uma multa kármica.', type: 'negative' },
  { text: 'Um vento zombeteiro soprou suas notas mágicas para dentro de um poço escuro.', type: 'negative' },
  { text: 'A Pyxie confiscou moedinhas para financiar a reforma da lojinha secreta.', type: 'negative' },
  { text: 'Mau agouro no horizonte: uma borboleta cinzenta pousou sobre sua bolsa de moedas.', type: 'negative' },
  { text: 'Sua distração te custou caro. Olhe melhor para os cantos antes de avançar!', type: 'negative' },
  { text: 'Um gato preto fantasma cruzou seu caminho e cobrou uma taxa de superstição.', type: 'negative' },
  { text: 'Uma maré de azar temporária drenou um pouquinho do seu brilho financeiro.', type: 'negative' },
  { text: 'Você comprou um mapa do tesouro que era só um rabisco de giz de uma criança fada.', type: 'negative' },
  { text: 'A energia cósmica hoje está pesada. Respire fundo e aceite a pequena perda.', type: 'negative' },
  { text: 'Cuidado com promessas fáceis: o barato pode sair caro antes do anoitecer.', type: 'negative' },
  { text: 'Uma travessura cósmica tirou algumas moedas de você, mas a lição foi valiosa.', type: 'negative' },
];

const FORTUNES_EN = [
  // 25 Positive Fortunes (+15 Coins)
  { text: 'A golden breeze of fortune crossed your path. The stars have blessed your journey!', type: 'positive' },
  { text: 'Your silent kindness has finally been noticed by the guardian woodland spirits.', type: 'positive' },
  { text: 'Pyxie found a forgotten pouch of coins and decided you earned it!', type: 'positive' },
  { text: 'The mist parted to reveal a shimmering hoard beneath enchanted moonlight.', type: 'positive' },
  { text: 'A charm of prosperity has settled gently upon your shoulders today.', type: 'positive' },
  { text: 'Your keen intuition guided your steps straight to an oasis of abundance.', type: 'positive' },
  { text: 'Fortune smiles upon those who wander with a light heart and an honest grin.', type: 'positive' },
  { text: 'A messenger raven brought lost celestial coins and dropped them in your hands.', type: 'positive' },
  { text: 'Gloom blooms blossomed today in honor of your dedication and patience.', type: 'positive' },
  { text: 'Even on the dimmest trails, Pyxie\'s lantern illuminates your steps with riches.', type: 'positive' },
  { text: 'You radiated so much positive aura that the cosmos returned it in kind.', type: 'positive' },
  { text: 'An ancient riddle was unraveled in your dreams, revealing hidden treasure.', type: 'positive' },
  { text: 'The goddess of destiny smiled at your persistence. Reap the golden harvest!', type: 'positive' },
  { text: 'A gentle breeze blew away all your financial worries for today.', type: 'positive' },
  { text: 'Your loyalty to companions touched the fairies, who left a generous gift.', type: 'positive' },
  { text: 'Whatever enterprise you embark upon today carries the blessing of favorable winds.', type: 'positive' },
  { text: 'Pyxie loved your company today and tucked a sparkling bonus into your purse!', type: 'positive' },
  { text: 'You spotted a rift in the fabric of reality overflowing with golden gleam.', type: 'positive' },
  { text: 'Morning dewdrops kissed your face as a herald of far more prosperous days.', type: 'positive' },
  { text: 'Your creativity inspired ancient spirits who rewarded your brilliant vision.', type: 'positive' },
  { text: 'A glimpse of cosmic wisdom will spare you trouble and usher in abundance.', type: 'positive' },
  { text: 'Those who share warmth harvest threefold in joy and wealth.', type: 'positive' },
  { text: 'The gateway of bounty opened for a brief second and you caught its blessing!', type: 'positive' },
  { text: 'An unexpected encounter will bring genuine laughter and fruitful opportunities.', type: 'positive' },
  { text: 'The constellation of the Radiant Pixie is aligned directly over your coin pouch!', type: 'positive' },

  // 25 Negative Fortunes (-15 Coins)
  { text: 'A trickster goblin darted past and snatched a few coins right out of your pocket!', type: 'negative' },
  { text: 'Pyxie charged a surprise fairy toll because you stepped on her favorite mushrooms.', type: 'negative' },
  { text: 'You tripped over an enchanted root and a handful of coins tumbled down the hill.', type: 'negative' },
  { text: 'A cheeky raven pecked your wallet and flew away laughing with some shiny coins.', type: 'negative' },
  { text: 'Good fortune decided to take a heavy nap today. Watch your step carefully!', type: 'negative' },
  { text: 'A sour rain of gloom drizzled over your belongings, eroding some of your savings.', type: 'negative' },
  { text: 'You purchased an expired potion from a charlatan goblin. What a waste of coins!', type: 'negative' },
  { text: 'Pyxie demanded a mischief tribute so she wouldn\'t tangle your hair in your sleep.', type: 'negative' },
  { text: 'A mocking specter swooped through and dropped your coin pouch down a grate.', type: 'negative' },
  { text: 'The coffee went cold, the pastry hit the floor, and a few coins slipped away.', type: 'negative' },
  { text: 'Today is not the day for reckless wagers. The cosmos urges deep caution.', type: 'negative' },
  { text: 'A bewilderment charm caused you to pay for a stranger\'s drink at the arcane tavern.', type: 'negative' },
  { text: 'Beware of sweet flatterers: someone just picked a few coins from your purse.', type: 'negative' },
  { text: 'Night fae collected arcane municipal taxes for the enchanted air you breathed.', type: 'negative' },
  { text: 'You neglected to greet the garden gnomes and were slapped with a karmic fine.', type: 'negative' },
  { text: 'A mocking gale whisked your shiny coins straight down into an abyss.', type: 'negative' },
  { text: 'Pyxie confiscated coins to fund her secret boutique remodeling.', type: 'negative' },
  { text: 'An ill omen loomed: an ashen moth fluttered over your coin pouch.', type: 'negative' },
  { text: 'Carelessness cost you dearly. Check your footing before leaping forward!', type: 'negative' },
  { text: 'A phantom black cat crossed your path and charged a superstition fee.', type: 'negative' },
  { text: 'A temporary tide of misfortune drained a small splash of your financial shine.', type: 'negative' },
  { text: 'You bought a treasure map that turned out to be a toddler fairy\'s crayon doodle.', type: 'negative' },
  { text: 'Cosmic vibrations feel heavy today. Breathe deeply and accept the small setback.', type: 'negative' },
  { text: 'Beware easy shortcuts: cheap promises end up costing dear before nightfall.', type: 'negative' },
  { text: 'Cosmic mischief taxed a few coins from you, but the wisdom gained is priceless.', type: 'negative' },
];

const COOKIE_WISDOMS_PT = FORTUNES_PT.map((f) => f.text);
const COOKIE_WISDOMS_EN = FORTUNES_EN.map((f) => f.text);
const COOKIE_WISDOMS = COOKIE_WISDOMS_PT;
COOKIE_WISDOMS.pt = COOKIE_WISDOMS_PT;
COOKIE_WISDOMS.en = COOKIE_WISDOMS_EN;

function generateLuckyNumbers(count = 6, max = 60) {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return [...numbers].sort((a, b) => a - b);
}

function getCookieStatus(userId) {
  const account = getUserAccount(userId);
  const lastCookieAt = account.lastCookieAt || 0;
  const extraCookies = Number(account.extraCookies) || 0;
  const elapsed = Date.now() - lastCookieAt;
  const canOpen = extraCookies > 0 || elapsed >= COOKIE_COOLDOWN_MS;
  const timeRemainingMs = canOpen ? 0 : Math.max(0, COOKIE_COOLDOWN_MS - elapsed);

  return {
    canOpen,
    timeRemainingMs,
    extraCookies,
    lastCookieAt,
  };
}

function claimCookie(userId, lang = 'pt') {
  const status = getCookieStatus(userId);
  if (!status.canOpen) {
    return {
      success: false,
      timeRemainingMs: status.timeRemainingMs,
      error: 'cooldown',
    };
  }

  // Consome extraCookie ou atualiza lastCookieAt
  updateUserAccount(userId, (acc) => {
    if (acc.extraCookies && acc.extraCookies > 0) {
      acc.extraCookies -= 1;
    } else {
      acc.lastCookieAt = Date.now();
    }
  });

  const pool = lang === 'en' ? FORTUNES_EN : FORTUNES_PT;
  const fortuneIndex = Math.floor(Math.random() * pool.length);
  const picked = pool[fortuneIndex];
  const wisdom = picked.text;
  const fortuneType = picked.type;
  let coinsChange = 0;

  if (fortuneType === 'positive') {
    coinsChange = 15;
    addCoins(userId, 15);
  } else {
    coinsChange = -15;
    updateUserAccount(userId, (acc) => {
      acc.coins = Math.max(0, (acc.coins || 0) - 15);
    });
  }

  const luckyNumbers = generateLuckyNumbers();

  return {
    success: true,
    wisdom,
    fortuneType,
    coinsChange,
    luckyNumbers,
    hasPrize: fortuneType === 'positive',
    rewardCoins: fortuneType === 'positive' ? 15 : 0,
    remainingExtra: Math.max(0, (status.extraCookies || 0) - 1),
  };
}

function grantExtraCookie(userId) {
  const updated = updateUserAccount(userId, (acc) => {
    acc.extraCookies = (Number(acc.extraCookies) || 0) + 1;
  });
  return updated.extraCookies;
}

module.exports = {
  COOKIE_COOLDOWN_MS,
  FORTUNES_PT,
  FORTUNES_EN,
  COOKIE_WISDOMS,
  COOKIE_WISDOMS_PT,
  COOKIE_WISDOMS_EN,
  generateLuckyNumbers,
  getCookieStatus,
  claimCookie,
  grantExtraCookie,
};

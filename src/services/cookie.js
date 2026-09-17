const { getUserAccount, updateUserAccount, addCoins } = require('./economy');

const COOKIE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas

const COOKIE_WISDOMS = [
  'A magia não está nas respostas que você procura, mas na coragem de fazer perguntas.',
  'Hoje um Pymon selvagem pode cruzar o seu caminho trazendo boas notícias. Fique atento!',
  'Mesmo a menor das fadas pode causar uma grande tempestade no momento certo.',
  'Sua sorte está brilhando como um feijão mágico sob a luz da lua.',
  'Seja como o Cinna: doce por fora, mas com fogo no coração quando a batalha começa.',
  'Grandes jornadas no reino encantado começam com um único passo corajoso.',
  'A paciência é uma poção amarga, mas os seus frutos são os mais doces do mundo.',
  'Alguém no servidor está pensando com carinho em você agora mesmo.',
  'Não economize carinhos nem sorrisos; ambos se multiplicam quando compartilhados.',
  'Um ovo dourado traz prosperidade, mas a verdadeira riqueza são os amigos ao seu lado.',
  'O universo conspira a favor de quem não desiste após o primeiro tropeço.',
  'Um pequeno mistério será revelado em breve. Abra seu coração para o inesperado.',
  'Se as coisas parecerem confusas, respire fundo e coma um doce quentinho.',
  'Seu charme natural tem 99% de afinidade com o sucesso hoje.',
  'Nunca subestime o poder de uma boa xícara de chá e 10 minutos de silêncio.',
  'O destino adora quem ousa rir na cara do perigo (e dos bugs).',
  'Uma mensagem inesperada trará um sorriso ao seu rosto antes que o sol se ponha.',
  'Até as noites mais escuras terminam com o brilho da aurora estelar.',
  'A verdadeira força não vem dos músculos, mas da bondade que você espalha.',
  'Você é mais forte do que imagina e muito mais incrível do que pensa.',
  'Boas energias atraem oportunidades douradas. Mantenha a cabeça erguida!',
  'O segredo da felicidade é saber apreciar até as pequenas pedrinhas do caminho.',
  'Se você encontrar uma encruzilhada hoje, siga o caminho que tiver mais flores.',
  'Um conselho de amigo valerá mais do que cem moedas de ouro esta semana.',
  'Não tenha medo de recomeçar; cada novo amanhecer é uma página mágica em branco.',
  'Sua aura está radiante! Use essa luz para iluminar o dia de alguém próximo.',
  'Um café quentinho e pensamentos positivos resolvem 90% dos problemas.',
  'A sorte favorece os audaciosos... e aqueles que alimentam seus mascotes todos os dias!',
  'Em meio à tempestade, lembre-se: até os dragões mais fortes pousam para descansar.',
  'Grandes surpresas vêm em embalagens pequenas e modestas.',
  'Confie no processo. A lagarta precisou de tempo antes de virar borboleta encantada.',
  'Se a vida te der limões, faça uma limonada mágica e venda na loja por 50 moedas.',
  'Quem planta carinho na comunidade, colhe lealdade e boas risadas.',
  'A sua criatividade está no ápice hoje. Crie algo novo e surpreenda a todos!',
  'O passado é história, o futuro é mistério, mas o presente é uma dádiva mágica.',
  'Um gesto generoso feito em segredo voltará multiplicado para você.',
  'Cuidado com quem promete atalhos fáceis nas masmorras da vida.',
  'Sorria! Seu sorriso tem o poder de quebrar maldições de mau humor.',
  'A intuição de quem tem bom coração raramente falha. Ouça sua voz interior.',
  'Um momento de descanso hoje evitará um cansaço amanhã. Respeite seu tempo.',
  'A amizade verdadeira é como uma poção rara: inestimável e eterna.',
  'Você nasceu para brilhar, não para se esconder nas sombras dos outros.',
  'Não compare o seu capítulo 1 com o capítulo 20 de outra pessoa.',
  'O reino da Pyxie celebra a sua presença aqui hoje! Sinta-se especial.',
  'Quando você compartilha a sua luz, o mundo inteiro fica mais brilhante.',
  'Mesmo nos dias nublados, o sol continua brilhando acima das nuvens.',
  'Uma vitória que parecia impossível está mais perto do que você imagina.',
  'Abrace as suas peculiaridades; são elas que tornam você inesquecível.',
  'Dê mais valor aos momentos simples do que às aparências luxuosas.',
  'Hoje é um excelente dia para tentar algo que você sempre teve curiosidade.',
  'A vida é curta demais para não mandar um meme fofo para quem você gosta.',
  'Você tem a bênção dos espíritos da floresta hoje. Que a sorte te acompanhe!'
];

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

function claimCookie(userId) {
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

  // Escolhe frase mística aleatória
  const wisdom = COOKIE_WISDOMS[Math.floor(Math.random() * COOKIE_WISDOMS.length)];
  const luckyNumbers = generateLuckyNumbers();

  // 15% de chance de achar um bilhete premiado de moedas
  const hasPrize = Math.random() < 0.15;
  let rewardCoins = 0;
  if (hasPrize) {
    rewardCoins = Math.floor(Math.random() * 201) + 100; // 100 a 300 moedas
    addCoins(userId, rewardCoins);
  }

  return {
    success: true,
    wisdom,
    luckyNumbers,
    hasPrize,
    rewardCoins,
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
  COOKIE_WISDOMS,
  generateLuckyNumbers,
  getCookieStatus,
  claimCookie,
  grantExtraCookie,
};

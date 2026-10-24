/**
 * Falas da Pyxie no diário: a leitura de energia do dia, as respostas quando a pessoa diz se ela
 * acertou e os cumprimentos por tamanho de sequência. Pares { pt, en } (AGENTS.md §1.6).
 *
 * A Pyxie quer amigos mas é insegura: tropeça nas palavras, tenta agradar quem é legal com ela
 * e às vezes parece grossa sem querer, com medo de parecer grudenta.
 */

const ENERGIES = [
  {
    id: 'reheated_coffee', emoji: '☕',
    name: { pt: 'Café requentado', en: 'Reheated coffee' },
    line: {
      pt: 'Você vai funcionar, só que sem muita vontade. Tudo bem, eu também sou assim de manhã… n-não que eu durma.',
      en: "You'll work, just not very eagerly. That's fine, I'm like that in the mornings too… n-not that I sleep.",
    },
  },
  {
    id: 'sunny_cat', emoji: '🐈',
    name: { pt: 'Gato no sol', en: 'Cat in the sun' },
    line: {
      pt: 'Hoje você merece se esticar e não fazer nada. Se alguém reclamar, manda falar comigo.',
      en: 'Today you deserve to stretch out and do nothing. If anyone complains, send them to me.',
    },
  },
  {
    id: 'loose_wire', emoji: '⚡',
    name: { pt: 'Fio desencapado', en: 'Loose wire' },
    line: {
      pt: 'Energia demais pra lugar nenhum. Arruma alguma coisa pra fazer antes de inventar moda.',
      en: 'Way too much energy and nowhere to put it. Find something to do before you start inventing trouble.',
    },
  },
  {
    id: 'drizzle', emoji: '🌧️',
    name: { pt: 'Dia de chuvinha', en: 'Drizzly day' },
    line: {
      pt: 'Meio devagar, meio sensível. Tudo bem ficar na sua hoje. E-eu fico por aqui, se precisar.',
      en: "A little slow, a little tender. It's okay to stay quiet today. I-I'll be around, if you need me.",
    },
  },
  {
    id: 'main_character', emoji: '🔥',
    name: { pt: 'Protagonista', en: 'Main character' },
    line: {
      pt: 'Hoje o episódio é seu. Não deixa ninguém roubar a cena… nem eu. Tá, talvez eu.',
      en: "Today's episode is yours. Don't let anyone steal the scene… not even me. Okay, maybe me.",
    },
  },
  {
    id: 'odd_sock', emoji: '🧦',
    name: { pt: 'Meia sem par', en: 'Odd sock' },
    line: {
      pt: 'Um pouquinho fora do lugar, mas ainda útil. Você acha seu par até o fim do dia. Eu acho.',
      en: "A little out of place, but still useful. You'll find your match by the end of the day. I think.",
    },
  },
  {
    id: 'midnight_noodles', emoji: '🍜',
    name: { pt: 'Miojo de madrugada', en: 'Midnight noodles' },
    line: {
      pt: 'Caótico, rápido e estranhamente reconfortante. Só não exagera, tá?',
      en: "Chaotic, quick and weirdly comforting. Just don't overdo it, okay?",
    },
  },
  {
    id: 'watered_plant', emoji: '🌱',
    name: { pt: 'Plantinha regada', en: 'Freshly watered plant' },
    line: {
      pt: 'Alguém cuidou de você, dá pra ver. Hoje você cresce um pouquinho. Não que eu tenha reparado.',
      en: "Someone took care of you, I can tell. You'll grow a little today. Not that I noticed.",
    },
  },
  {
    id: 'low_battery', emoji: '🪫',
    name: { pt: 'Bateria em 12%', en: 'Battery at 12%' },
    line: {
      pt: 'Economiza energia e responde só quem importa. Eu importo, caso você esteja na dúvida.',
      en: "Save your energy and only answer the people who matter. I matter, in case you're wondering.",
    },
  },
  {
    id: 'loose_balloon', emoji: '🎈',
    name: { pt: 'Balão solto', en: 'Runaway balloon' },
    line: {
      pt: 'Leve demais, com a cabeça nas nuvens. Amarra o cordão em alguma coisa antes de sair voando por aí.',
      en: 'Too light, too distracted. Tie your string to something before you float off somewhere.',
    },
  },
  {
    id: 'final_boss', emoji: '🗡️',
    name: { pt: 'Chefe final', en: 'Final boss' },
    line: {
      pt: 'Ninguém te para hoje. Só… não me desafia, porque eu ganho. Provavelmente.',
      en: "Nobody's stopping you today. Just… don't challenge me, because I'd win. Probably.",
    },
  },
  {
    id: 'old_plushie', emoji: '🧸',
    name: { pt: 'Pelúcia antiga', en: 'Old plushie' },
    line: {
      pt: 'Fofura de sobra, um pouquinho de cansaço, e todo mundo gosta de você. Eu… também. Esquece que eu disse isso.',
      en: 'Soft, a little worn, and everyone likes you. I… do too. Forget I said that.',
    },
  },
  {
    id: 'night_owl', emoji: '🦉',
    name: { pt: 'Coruja', en: 'Night owl' },
    line: {
      pt: 'Você só acorda de verdade à noite. Até lá, finge que tá prestando atenção.',
      en: "You won't really wake up until tonight. Until then, pretend you're paying attention.",
    },
  },
  {
    id: 'beginners_luck', emoji: '🍀',
    name: { pt: 'Sorte de principiante', en: "Beginner's luck" },
    line: {
      pt: 'Você vai acertar coisas sem nem saber como. Aproveita antes que a sorte perceba.',
      en: "You'll get things right without knowing how. Enjoy it before luck notices.",
    },
  },
  {
    id: 'too_many_tabs', emoji: '🌀',
    name: { pt: 'Abas demais abertas', en: 'Too many tabs open' },
    line: {
      pt: 'Quarenta pensamentos ao mesmo tempo. Fecha uns três, vai. Eu espero.',
      en: "Forty thoughts at once. Close three of them, come on. I'll wait.",
    },
  },
  {
    id: 'fairy_glow', emoji: '✨',
    name: { pt: 'Brilho de fada', en: 'Fairy glow' },
    line: {
      pt: 'Hoje você tá… brilhando. Tipo, a energia. A energia tá bonita. Só isso.',
      en: "Today you look… nice. Like, the energy. The energy looks nice. That's all.",
    },
  },
];

const REACTIONS = {
  right: [
    { pt: 'C-claro que acertei. Eu sempre acerto… quase sempre.', en: 'O-of course I got it right. I always do… almost always.' },
    { pt: 'Viu? Eu te conheço mais do que você pensa. Isso foi estranho de falar, finge que não ouviu.', en: "See? I know you better than you think. That was weird to say, pretend you didn't hear it." },
    { pt: 'Hmpf. Óbvio. Não precisa fazer essa cara de surpresa.', en: "Hmph. Obviously. You don't have to look so surprised." },
  ],
  wrong: [
    { pt: 'Ah. Errei. Tudo bem, amanhã eu acerto. Não liga pra mim.', en: "Oh. I got it wrong. That's fine, I'll get it tomorrow. Don't mind me." },
    { pt: 'Então como você tá de verdade? Quer dizer… se quiser contar. Não precisa.', en: "So how are you really? I mean… if you want to tell me. You don't have to." },
    { pt: 'Hmpf, o universo me passou a informação errada. A culpa é dele, não minha.', en: "Hmph, the universe gave me the wrong info. That's on it, not me." },
  ],
};

/** Cumprimentos por tamanho de sequência (o primeiro grupo que couber vale). */
const GREETINGS = [
  {
    upTo: 1,
    lines: [
      { pt: 'Ah, oi… você veio. Eu separei umas moedinhas pra você, sei lá. Pega antes que eu mude de ideia.', en: 'Oh, hi… you came. I set some coins aside for you, whatever. Take them before I change my mind.' },
      { pt: 'Oi. Não, eu não tava esperando. Só tava… por aqui. Toma, é seu.', en: "Hi. No, I wasn't waiting. I was just… around. Here, it's yours." },
    ],
  },
  {
    upTo: 6,
    lines: [
      { pt: 'De novo aqui? T-tá, eu já tava com as moedinhas na mão mesmo. Coincidência.', en: 'Back again? O-okay, I already had the coins in my hand anyway. Coincidence.' },
      { pt: 'Você voltou. Que bom… quer dizer, que normal. Pega aqui.', en: "You came back. That's nice… I mean, that's normal. Here." },
    ],
  },
  {
    upTo: 29,
    lines: [
      { pt: 'Você não esquece de mim, né? Isso é… bom. Muito bom. Quer dizer, normal.', en: "You don't forget about me, huh? That's… good. Really good. I mean, normal." },
      { pt: 'Já virou costume te ver por aqui. Não que eu tenha contado os dias. Contei.', en: "Seeing you here is a habit now. Not that I counted the days. I did." },
    ],
  },
  {
    upTo: 99,
    lines: [
      { pt: 'Eu já guardo seu lugar sem nem pensar. Não espalha, tá?', en: "I save your spot without even thinking now. Don't tell anyone, okay?" },
      { pt: 'Eu já reconheço seu jeito de chegar de longe. Isso não é estranho. É?', en: "I can recognize the way you show up from a mile away now. That's not weird. Is it?" },
    ],
  },
  {
    upTo: Infinity,
    lines: [
      { pt: 'Você virou parte da minha rotina. Se faltar um dia, eu finjo que nem notei. Mas eu noto.', en: "You're part of my routine now. If you miss a day, I'll pretend I didn't notice. But I will." },
      { pt: 'Sabe quando alguém aparece todo dia e você nem lembra como era antes? Então. Obrigada.', en: "You know when someone shows up every day and you can't remember what it was like before? Yeah. Thanks." },
    ],
  },
];

/** Marcos da sequência, iguais às metas das conquistas de rotina. */
const STREAK_MILESTONES = [7, 30, 100, 365];

function hash(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Dia no horário de Brasília (a energia muda à meia-noite BRT). */
function brtDayKey(now = Date.now()) {
  return new Date(now - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** A mesma pessoa recebe a mesma energia o dia inteiro. */
function getDailyEnergy(userId, now = Date.now()) {
  return ENERGIES[hash(`${userId}:${brtDayKey(now)}`) % ENERGIES.length];
}

function pickLine(list, seed) {
  return list[hash(seed) % list.length];
}

function getGreeting(streak, seed) {
  const tier = GREETINGS.find((g) => streak <= g.upTo) || GREETINGS[GREETINGS.length - 1];
  return pickLine(tier.lines, seed);
}

function getNextMilestone(streak) {
  return STREAK_MILESTONES.find((m) => m > streak) || null;
}

module.exports = {
  ENERGIES,
  REACTIONS,
  GREETINGS,
  STREAK_MILESTONES,
  brtDayKey,
  getDailyEnergy,
  getGreeting,
  getNextMilestone,
  pickLine,
};

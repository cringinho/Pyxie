const DIALOGUES = {
  slime: {
    idle: {
      pt: [
        'Bloop bloop! Tutor, estou dando pulinhos aqui!',
        'Que dia gostoso para se espalhar pelo chão~',
        'Bloop? Você tem um carinho para me dar?',
        'Minha gelatina está brilhando hoje!',
      ],
      en: [
        'Bloop bloop! Tamer, I am hopping around!',
        'Such a nice day to squish around~',
        'Bloop? Do you have some headpats for me?',
        'My jelly is extra shiny today!',
      ],
    },
    hungry: {
      pt: ['Bloop... minha barriguinha de gosma está roncando!', 'Preciso de um pedaço de carne quentinha! Bloop!'],
      en: ['Bloop... my jelly tummy is rumbling!', 'Need a warm piece of meat, please! Bloop!'],
    },
    sick: {
      pt: ['Bloop... estou meio desbotado... me ajuda, tutor...', 'Minha gosma perdeu o brilho... preciso de remédio...'],
      en: ['Bloop... feeling faded and soft... help me, tamer...', 'Lost my squishy shine... need medicine...'],
    },
    sleepy: {
      pt: ['Zzz... bloop... ronc... (sonhando com geleia)', 'A mimir... apaga a luz, tutor... Zzz...'],
      en: ['Zzz... bloop... snore... (dreaming of jelly)', 'Sleepy time... turn off the light... Zzz...'],
    },
    dirty: {
      pt: ['Eca bloop! Tem sujeira por aqui, vamos limpar!', 'Tutor, não gosto de ficar sujinho, limpa por favor!'],
      en: ['Eww bloop! Mess everywhere, let us clean up!', 'Tamer, I dislike being dirty, please sweep!'],
    },
    happy: {
      pt: ['Bloop! Delícia! Minha energia tá no máximo!', 'Yaaay! O melhor tutor do mundo todo!'],
      en: ['Bloop! So delicious! Full of bouncy energy!', 'Yaaay! The greatest tamer in the world!'],
    },
  },
  mushroom: {
    idle: {
      pt: [
        'Saltei lá do canteiro de Henesys até aqui!',
        'Espalhando esporos mágicos de alegria pelo chat!',
        'Você já viu meu chapéu manchado? É puro estilo!',
        'Se eu pular bem alto, será que toco nas nuvens?',
      ],
      en: [
        'Hopped all the way from Henesys to here!',
        'Spreading magical spores of joy across the chat!',
        'Have you seen my spotted cap? Pure style!',
        'If I hop super high, will I reach the clouds?',
      ],
    },
    hungry: {
      pt: ['Meu chapéu tá murchando de fome! Manda uma carne aí!', 'Fome, fome! Cogumelos também precisam de sustância!'],
      en: ['My mushroom cap is wilting from hunger! Meat please!', 'Hungry, hungry! Spores need nourishment too!'],
    },
    sick: {
      pt: ['Meus esporos estão cinzas... ai ai ai... preciso de injeção...', 'Tutor, tô tonto... não consigo nem quicar direito...'],
      en: ['My spores turned gray... ouch... need a syringe shot...', 'Tamer, so dizzy... cannot even bounce straight...'],
    },
    sleepy: {
      pt: ['Zzz... esporos dorminhocos... Zzz...', 'Hora do descanso do cogumelo... apaga a luz!'],
      en: ['Zzz... sleepy spores floating... Zzz...', 'Mushroom bedtime... lights out please!'],
    },
    dirty: {
      pt: ['Quem deixou essa bagunça aqui? Cogumelo limpinho não curte!', 'Usa a vassoura, tutor! A sujeira tá me sufocando!'],
      en: ['Who left this mess? Clean mushrooms hate dirt!', 'Use the broom, tamer! The grime is choking me!'],
    },
    happy: {
      pt: ['*Quica três vezes no ar de felicidade*', 'Adorei! Me sinto forte como um cogumelo lendário!'],
      en: ['*Bounces three times in the air with joy*', 'Loved it! I feel sturdy as a legendary mushroom!'],
    },
  },
  dino: {
    idle: {
      pt: [
        'Rawr! Estou pronto para o próximo desafio!',
        'Afiei minhas garras nas pedras do bosque!',
        'Tutor, quando vamos treinar? Meus músculos querem ação!',
        'Um dia serei o monstro mais forte de todos!',
      ],
      en: [
        'Rawr! Ready for the next big challenge!',
        'Sharpened my claws on the forest stones!',
        'Tamer, when are we training? Muscles itch for action!',
        'One day I will be the strongest monster around!',
      ],
    },
    hungry: {
      pt: ['Rawr! Meu estômago tá rugindo mais que eu! Dá comida!', 'Carne suculenta, por favor! Preciso de proteína!'],
      en: ['Rawr! My stomach is roaring louder than me! Feed me!', 'Juicy meat, please! Need raw protein!'],
    },
    sick: {
      pt: ['Grrr... fraqueza horrível... cadê a injeção?', 'Não consigo ficar de pé direito... ajuda, tutor...'],
      en: ['Grrr... terrible weakness... where is the shot?', 'Cannot stand properly... help me, tamer...'],
    },
    sleepy: {
      pt: ['Zzz... ronc... caçando presas gigantes em sonhos... Zzz...', 'Sono de dinossauro... apaga a luz aí...'],
      en: ['Zzz... snore... hunting giant prey in dreams... Zzz...', 'Dino sleep... please turn off the lights...'],
    },
    dirty: {
      pt: ['Grrr! Tem cocô na minha arena de treino! Limpa isso!', 'Higiene é disciplina militar de guerreiro, tutor! Limpa!'],
      en: ['Grrr! Poop on my training ring! Clean it up!', 'Hygiene is warrior discipline, tamer! Sweep it!'],
    },
    happy: {
      pt: ['RAWR! Sinto a energia pulsando em minhas presas!', 'Excelente, parceiro! Estamos cada vez mais fortes!'],
      en: ['RAWR! Energy pulsing through my claws and jaws!', 'Awesome, partner! Growing stronger every day!'],
    },
  },
  reptile: {
    idle: {
      pt: [
        'Minha lâmina segue afiada e honrada.',
        'A disciplina é o único caminho para a grandeza.',
        'Pronto para o sparring a qualquer momento, tutor.',
        'A linhagem nobre não aceita hesitação.',
      ],
      en: [
        'My blade remains sharp and honorable.',
        'Discipline is the only true path to greatness.',
        'Standing ready for sparring at your command, tamer.',
        'A noble lineage tolerates no hesitation.',
      ],
    },
    hungry: {
      pt: ['Um guerreiro faminto perde o foco no corte. Alimento!', 'Preciso de carne para manter minha estamina em combate.'],
      en: ['A famished warrior loses edge in battle. Nourishment!', 'Require meat to sustain my combat stamina.'],
    },
    sick: {
      pt: ['Uma maleita nefasta tomou meu corpo... traga o antídoto...', 'Meus reflexos falham... preciso de tratamento médico...'],
      en: ['A foul affliction grips my frame... bring the antidote...', 'My reflexes waver... require medical care...'],
    },
    sleepy: {
      pt: ['Bainha na espada... hora da meditação do sono. Zzz...', 'Apague as tochas. O repouso do guerreiro começou.'],
      en: ['Sheathe the blade... time for meditative sleep. Zzz...', 'Extinguish the torches. The warrior rest begins.'],
    },
    dirty: {
      pt: ['A sujeira desonra este santuário de treino. Limpe!', 'Condições deploráveis enfraquecem o espírito. Varra!'],
      en: ['Filth dishonors this training ground. Clean it!', 'Deplorable conditions weaken the spirit. Sweep!'],
    },
    happy: {
      pt: ['Um banquete digno! Meu espírito guerreiro agradece.', 'Honrado pelo seu cuidado exemplar, tutor.'],
      en: ['A feast worthy of champions! My blade spirit thanks you.', 'Honored by your exemplary care, tamer.'],
    },
  },
  dragon: {
    idle: {
      pt: [
        'O fogo ancestral queima em meu peito.',
        'Do topo deste pico, contemplo todas as eras.',
        'Juntos alcançamos o pináculo da evolução máxima!',
        'Nenhum desafio em Cringelândia escapa ao meu poder.',
      ],
      en: [
        'Ancient dragonflame burns fiercely in my chest.',
        'From this peak, I behold all the ages.',
        'Together we reached the pinnacle of ultimate evolution!',
        'No challenge in the realm stands against our might.',
      ],
    },
    hungry: {
      pt: ['As chamas de dragão exigem combustível voraz! Alimente-me!', 'Traga carne! Meu estômago é uma forja incandescente!'],
      en: ['Dragon flames demand voracious fuel! Feed me!', 'Bring roast! My belly is an incandescent forge!'],
    },
    sick: {
      pt: ['As cinzas esfriam... a doença enfraquece até dragões...', 'Tutor... cure minhas asas antes que a chama se apague...'],
      en: ['The ashes cool... sickness weakens even dragonkind...', 'Tamer... heal my wings before the flame dims...'],
    },
    sleepy: {
      pt: ['Zzz... roooar... descansando sobre montes de ouro... Zzz...', 'A noite cai sobre o ninho do dragão. Luz apagada.'],
      en: ['Zzz... roooar... resting atop mountains of gold... Zzz...', 'Night falls upon the dragon aerie. Lights out.'],
    },
    dirty: {
      pt: ['Cinzas e sujeira acumuladas não são dignas de realeza! Limpe!', 'Varra o covil imediatamente, tutor!'],
      en: ['Accumulated grime is unworthy of dragon royalty! Clean it!', 'Sweep the lair at once, tamer!'],
    },
    happy: {
      pt: ['ROAAAR! Uma torrente de labaredas comemora este cuidado!', 'Magnífico! Você é verdadeiramente o mestre supremo!'],
      en: ['ROAAAR! A torrent of flame celebrates your devotion!', 'Magnificent! You are truly the supreme master!'],
    },
  },
};

const GENERIC_DIALOGUES = {
  idle: {
    pt: [
      'Estou me sentindo ótimo hoje, tutor!',
      'Olhando em volta... o que faremos agora?',
      'Prontinho para brincar ou treinar!',
      'Gosto muito de estar ao seu lado!',
    ],
    en: [
      'Feeling fantastic today, tamer!',
      'Looking around... what are we doing next?',
      'Ready to play or do some training!',
      'I truly enjoy being by your side!',
    ],
  },
  hungry: {
    pt: ['Tutor, minha barriga tá roncando! Quero carne!', 'Fome, fome! Um lanchinho agora cairia super bem!'],
    en: ['Tamer, my tummy is growling! Want meat!', 'Hungry, hungry! A snack right now would hit the spot!'],
  },
  sick: {
    pt: ['Ai ai ai... tô com dor de barriga e febre... Remédio pfv!', 'Me sinto fraco... cuida de mim, tutor...'],
    en: ['Ouch... feeling feverish and dizzy... Medicine please!', 'Feeling weak... take good care of me, tamer...'],
  },
  sleepy: {
    pt: ['Zzz... ronc... soninho gostoso... Zzz...', 'Apaga a luz, tutor... meus olhinhos tão pesando... Zzz...'],
    en: ['Zzz... snore... sweet dreams... Zzz...', 'Turn off the lights, tamer... heavy eyes closing... Zzz...'],
  },
  dirty: {
    pt: ['Eita, juntou sujeira por aqui! Uma vassourada resolve!', 'Que cheirinho estranho... limpa aí, por favor!'],
    en: ['Whoops, dirt piled up around here! Time for a sweep!', 'What is that smell... please clean it up!'],
  },
  happy: {
    pt: ['Yaaay! Muito obrigado, tutor! Ficou perfeito!', 'Adorei! Meu carinho por você só aumenta!'],
    en: ['Yaaay! Thank you so much, tamer! Perfect!', 'Loved it! My affection for you keeps growing!'],
  },
};

function getVpetDialogue(speciesKey, state, lang = 'pt') {
  const speciesData = DIALOGUES[speciesKey] || GENERIC_DIALOGUES;
  const statePool = speciesData[state] || GENERIC_DIALOGUES[state] || GENERIC_DIALOGUES.idle;
  const langPool = statePool[lang] || statePool.pt || statePool.en;
  const idx = Math.floor(Math.random() * langPool.length);
  return langPool[idx];
}

module.exports = {
  getVpetDialogue,
};


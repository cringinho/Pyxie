const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const professions = require('../services/professions');
const {
  finishWork,
  getUserAccount,
  getWorkStatus,
  startWork,
} = require('../services/economy');
const {
  formatCoins,
  formatRemaining,
  getLanguage,
  t,
} = require('../utils/i18n');
const { WORK } = require('./commandNames');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const WORK_MINIMUM = 20;
const WORK_MAXIMUM = 65;
const WORK_TIMEOUT_MS = 45 * 1000;

// Sessões ativas de minigames em RAM
const activeWorkSessions = new Map();

const PROFESSION_MINIGAMES = {
  programador: [
    {
      scenario: '💻 **Bug Crítico em Produção!**\nO log disparou: `TypeError: Cannot read properties of undefined (reading "map")`. Qual a correção adequada?',
      correct: 'Aplicar Optional Chaining (?.map) ou validação de array',
      scenario: '💻 **Salvando o Projeto!**\nVocê acabou de programar uma nova funcionalidade no computador. O que você deve fazer antes de desligar?',
      correct: 'Salvar o arquivo e fazer backup do código',
      wrongs: [
        'Reiniciar o servidor em looping',
        'Deletar a tabela no banco de dados',
        'Ignorar os logs com um try/catch vazio',
        'Desligar o computador direto na tomada',
        'Apagar todo o código para liberar memória',
        'Jogar água no teclado',
      ],
      pt: {
        scenario: '💻 **Bug Crítico em Produção!**\nO log do servidor acusou: `TypeError: Cannot read properties of undefined (reading "map")`. Qual a solução mais segura?',
        correct: 'Aplicar Optional Chaining (?.map) e verificar se o dado é um array válido',
        wrongs: [
          'Reiniciar o servidor em loop contínuo',
          'Apagar o banco de dados para zerar os erros',
          'Engolir o erro silenciosamente com um try/catch vazio',
        ],
      },
      en: {
        scenario: '💻 **Critical Production Bug!**\nThe server log showed: `TypeError: Cannot read properties of undefined (reading "map")`. What is the safest fix?',
        correct: 'Apply Optional Chaining (?.map) and validate that the data is an array',
        wrongs: [
          'Restart the server in an infinite reboot loop',
          'Drop the database to clear all error logs',
          'Silently swallow the error with an empty try/catch block',
        ],
      },
    },
    {
      scenario: '⚡ **Otimização de Performance!**\nUma consulta de dados em masmorras está levando 5 segundos. O que fazer para acelerar?',
      correct: 'Criar índices adequados nas colunas mais filtradas',
      scenario: '🐛 **Erro de Digitação no Código!**\nO programa avisou que faltou fechar uma letra no comando. Como você resolve?',
      correct: 'Abrir o código e corrigir a digitação',
      wrongs: [
        'Adicionar um setTimeout de 10 segundos',
        'Substituir tudo por loops síncronos aninhados',
        'Diminuir a memória RAM do servidor',
        'Chutar o monitor com força',
        'Trocar de mouse',
        'Formatar o computador inteiro',
      ],
      pt: {
        scenario: '⚡ **Otimização de Performance!**\nUma consulta de dados em masmorras está levando mais de 5 segundos para retornar. O que fazer para acelerar?',
        correct: 'Criar índices adequados nas colunas mais consultadas e otimizar queries',
        wrongs: [
          'Adicionar um delay forçado de 10 segundos antes da resposta',
          'Substituir o banco por um arquivo de texto desordenado',
          'Reduzir a memória RAM do servidor para cortar custos',
        ],
      },
      en: {
        scenario: '⚡ **Database Performance Optimization!**\nA dungeon data query is taking over 5 seconds to complete. How do you speed it up?',
        correct: 'Add proper indexes on frequently filtered columns and optimize queries',
        wrongs: [
          'Add a forced 10-second delay before returning results',
          'Replace the database with an unsorted flat text file',
          'Downgrade server RAM to cut cloud costs',
        ],
      },
    },
    {
      scenario: '🛡️ **Falha de Integração no Deploy!**\nA pipeline acusou módulo ausente após nova feature. Qual o procedimento padrão?',
      correct: 'Atualizar dependências no package.json e rodar clean install',
      scenario: '🌐 **Botão no Site!**\nUm cliente pediu para colocar um botão clicável na página dele. O que você faz?',
      correct: 'Adicionar a linha do botão no código do site',
      wrongs: [
        'Apagar o repositório Git',
        'Desativar o firewall do servidor',
        'Remover todos os testes unitários',
        'Desenhar um botão com canetinha na tela',
        'Furar o monitor com uma furadeira',
        'Colar um pedaço de fita adesiva na tela',
      ],
      pt: {
        scenario: '🛡️ **Falha de Integração no Deploy!**\nA esteira de deploy acusou módulo ausente após nova feature. Qual o procedimento padrão?',
        correct: 'Verificar o package.json, travar versões no lockfile e rodar clean install',
        wrongs: [
          'Apagar o repositório Git e fingir que nada aconteceu',
          'Desativar o firewall do servidor e os testes de segurança',
          'Remover todos os testes unitários para a pipeline passar',
        ],
      },
      en: {
        scenario: '🛡️ **Deployment Dependency Failure!**\nThe CI/CD pipeline failed reporting a missing package after a new feature. What is the standard procedure?',
        correct: 'Check package.json, lock dependency versions, and run a clean install',
        wrongs: [
          'Delete the Git repository and pretend nothing happened',
          'Disable the server firewall and security testing',
          'Remove all unit tests so the build succeeds blindly',
        ],
      },
    },
  ],

  cozinheiro: [
    {
      scenario: '🍳 **Risoto Alquímico de Cogumelos!**\nO prato está quase pronto. Qual o segredo para finalizar com cremosidade perfeita (*Mantecatura*)?',
      correct: 'Adicionar manteiga gelada e queijo ralado fora do fogo',
      scenario: '🍳 **Fritando um Ovo!**\nA frigideira está no fogo e você vai fritar um ovo. O que você coloca para não grudar?',
      correct: 'Um pouco de óleo ou manteiga',
      wrongs: [
        'Despejar 500ml de vinagre puro',
        'Ferver em fogo alto por mais 40 minutos',
        'Adicionar açúcar cristal e mexer com garfo',
        'Sabão em pó',
        'Suco de uva fervente',
        'Areia da praia',
      ],
      pt: {
        scenario: '🍳 **Risoto Alquímico de Cogumelos!**\nO arroz está no ponto ideal de cozimento (*al dente*). Qual o segredo da cremosidade perfeita (*Mantecatura*)?',
        correct: 'Adicionar manteiga gelada e queijo ralado vigorosamente fora do fogo',
        wrongs: [
          'Despejar 500ml de vinagre puro para dar consistência',
          'Ferver em fogo alto por mais 40 minutos seguidos',
          'Colocar cubos de gelo e bater no liquidificador',
        ],
      },
      en: {
        scenario: '🍳 **Alchemical Mushroom Risotto!**\nThe risotto rice is cooked to perfection (*al dente*). What is the culinary secret for the creamiest finish (*Mantecatura*)?',
        correct: 'Vigorously incorporate cold butter and grated cheese off the heat',
        wrongs: [
          'Pour in 500ml of pure vinegar for texture',
          'Boil on high heat for another 40 minutes non-stop',
          'Drop in ice cubes and puree in a blender',
        ],
      },
    },
    {
      scenario: '🍲 **Molho de Tomate Rústico!**\nO molho artesanal ficou com acidez acentuada. Qual o truque clássico da culinária?',
      correct: 'Uma pitada de bicarbonato ou um toque sutil de doçura',
      scenario: '🍲 **Sopa Fervendo!**\nA panela de sopa acabou de sair do fogão muito quente. O que fazer antes de provar?',
      correct: 'Esperar esfriar um pouco ou assoprar com cuidado',
      wrongs: [
        'Espremer dois limões inteiros',
        'Adicionar meio copo de água fria',
        'Colocar sal grosso em excesso',
        'Engolir tudo de uma vez sem mastigar',
        'Jogar pedras de carvão dentro da sopa',
        'Comer com a mão direto na panela pelando',
      ],
      pt: {
        scenario: '🍲 **Molho de Tomate Rústico!**\nO molho artesanal ficou com acidez excessiva após cozinhar. Qual o truque clássico da culinária?',
        correct: 'Adicionar uma pitada de bicarbonato ou um toque sutil de doçura',
        wrongs: [
          'Espremer o suco de dois limões bem ácidos',
          'Despejar meio litro de água fria da torneira',
          'Acrescentar uma xícara cheia de sal grosso',
        ],
      },
      en: {
        scenario: '🍲 **Rustic Tomato Sauce!**\nThe homemade tomato sauce turned out overly acidic after simmering. What is the classic kitchen trick?',
        correct: 'Add a pinch of baking soda or a subtle touch of sweetness',
        wrongs: [
          'Squeeze the juice of two very sour lemons',
          'Pour in half a liter of cold tap water',
          'Dump a whole cup of rock salt into the pot',
        ],
      },
    },
    {
      scenario: '🥘 **Ponto da Carne no Banquete!**\nO cliente exigente pediu carne suculenta ao ponto. O que fazer após retirá-la da grelha?',
      correct: 'Deixar a carne descansar 2 minutos para redistribuir os sucos',
      scenario: '🍰 **Bolo Fofinho no Forno!**\nQual ingrediente clássico ajuda a massa do bolo a crescer e ficar macia?',
      correct: 'Fermento em pó',
      wrongs: [
        'Cortar imediatamente em fatias finas na frigideira',
        'Lavar a carne na água da pia',
        'Colocar no congelador por 10 minutos',
        'Vinagre puro',
        'Sal grosso em excesso',
        'Pimenta malagueta',
      ],
      pt: {
        scenario: '🥩 **Ponto da Carne no Banquete Real!**\nO corte nobre acabou de sair da grelha bem suculento e quente. O que fazer antes de fatiar?',
        correct: 'Deixar a carne descansar alguns minutos para redistribuir os sucos',
        wrongs: [
          'Fatiar imediatamente em tiras finas na frigideira pelando',
          'Lavar a carne na pia sob água corrente fria',
          'Colocar a carne no congelador por 15 minutos',
        ],
      },
      en: {
        scenario: '🥩 **The Royal Banquet Steak!**\nThe prime steak just came off the flaming grill juicy and sizzling. What must you do before slicing?',
        correct: 'Let the meat rest for a few minutes so internal juices redistribute',
        wrongs: [
          'Slice it immediately into thin strips while scorching in the pan',
          'Rinse the hot steak in the sink with cold running water',
          'Toss the steak into the freezer for 15 minutes',
        ],
      },
    },
  ],

  agricultor: [
    {
      scenario: '🌾 **Alerta de Pragas na Lavoura!**\nUma colônia de pulgões apareceu nos brotos de feijão. Qual o tratamento orgânico recomendado?',
      correct: 'Aplicar calda de óleo de nim com água em horário fresco',
      scenario: '🌱 **Plantação com Sede!**\nO sol forte da tarde deixou a terra da horta bem seca. O que as plantas precisam?',
      correct: 'Água fresca através da rega',
      wrongs: [
        'Lançar água fervente sobre toda a plantação',
        'Espalhar salmoura concentrada na terra',
        'Queimar as folhas infectadas com maçarico',
        'Refrigerante de cola gelado',
        'Óleo de motor usado',
        'Tinta guache colorida',
      ],
      pt: {
        scenario: '🌾 **Alerta de Pragas na Lavoura!**\nUma colônia de pulgões e lagartas atacou as hortaliças da estufa. Qual o tratamento orgânico recomendado?',
        correct: 'Aplicar calda de óleo de nim ou controle biológico em horários frescos',
        wrongs: [
          'Lançar água fervente sobre toda a plantação',
          'Espalhar salmoura concentrada na terra das plantas',
          'Queimar os canteiros infectados com maçarico',
        ],
      },
      en: {
        scenario: '🌾 **Crop Pest Alert!**\nA colony of aphids and caterpillars invaded the greenhouse vegetables. What is the recommended organic remedy?',
        correct: 'Apply neem oil solution or biological controls during cooler hours',
        wrongs: [
          'Pour boiling water all over the crops',
          'Spread concentrated saltwater onto the soil',
          'Torch the infected garden beds with a flamethrower',
        ],
      },
    },
    {
      scenario: '🌱 **Preparo do Solo para Plantio!**\nA terra está compactada e com baixa retenção de nutrientes. Qual a melhor intervenção?',
      correct: 'Aeracionar o solo e incorporar matéria orgânica curtida',
      scenario: '🍅 **Hora da Colheita!**\nOs tomates na horta estão bem vermelhos, maduros e cheirosos. O que você faz?',
      correct: 'Colher com cuidado e guardar na cesta',
      wrongs: [
        'Adicionar pedra brita e cascalho grosso',
        'Cobrir tudo com lona plástica fechada',
        'Compactar com rolo compressor',
        'Deixar apodrecer no chão',
        'Enterrar os tomates no fundo da terra',
        'Jogar pedras na plantação',
      ],
      pt: {
        scenario: '🌱 **Preparo do Solo para Plantio!**\nA terra está compactada, dura e com baixa retenção de nutrientes. Como revitalizar o canteiro?',
        correct: 'Aeracionar o solo e incorporar matéria orgânica curtida e compostagem',
        wrongs: [
          'Adicionar pedra brita e cascalho grosso sobre a terra',
          'Compactar a superfície com um rolo compressor',
          'Cobrir tudo com lona plástica e nunca mais regar',
        ],
      },
      en: {
        scenario: '🌱 **Soil Preparation for Sowing!**\nThe soil is compacted, stiff, and low on nutrients. How do you revitalize the planting bed?',
        correct: 'Aerate the soil and incorporate well-aged compost and organic matter',
        wrongs: [
          'Dump coarse gravel and crushed stones over the topsoil',
          'Flatten the ground even harder with a heavy steamroller',
          'Seal everything under plastic tarps and never water again',
        ],
      },
    },
    {
      scenario: '🚜 **Irrigação em Dias de Calor Extremo!**\nO sol está escaldante ao meio-dia. Qual o horário ideal para a rega?',
      correct: 'No início da manhã ou no final da tarde',
      scenario: '🥕 **Novo Canteiro!**\nO que é essencial colocar na terra adubada para nascer uma nova plantinha?',
      correct: 'Sementes ou mudas saudáveis',
      wrongs: [
        'Exatamente ao meio-dia sob o sol a pino',
        'Nunca regar durante o verão',
        'Apenas uma vez a cada duas semanas',
        'Parafusos enferrujados',
        'Pilhas velhas',
        'Pedaços de plástico',
      ],
      pt: {
        scenario: '🚜 **Irrigação em Dias de Calor Extremo!**\nO sol está escaldante e o clima muito seco. Qual a rotina ideal de rega para evitar evaporação excessiva?',
        correct: 'Irrigar no início da manhã ou no entardecer com gotejamento eficiente',
        wrongs: [
          'Molhar as folhas exatamente ao meio-dia sob sol a pino',
          'Suspender toda a irrigação até o final do verão',
          'Regar os canteiros com óleo mineral',
        ],
      },
      en: {
        scenario: '🚜 **Extreme Heat Irrigation!**\nThe sun is scorching and the weather is dry. What is the ideal watering schedule to prevent excessive evaporation?',
        correct: 'Irrigate in early morning or late evening using efficient drip lines',
        wrongs: [
          'Soak foliage directly at noon under blazing direct sunlight',
          'Halt all irrigation until summer ends completely',
          'Water garden beds with mineral motor oil',
        ],
      },
    },
  ],

  medico: [
    {
      scenario: '🩺 **Primeiros Socorros na Enfermaria!**\nUm aventureiro chega com sangramento ativo no braço após emboscada. Qual a conduta inicial?',
      correct: 'Fazer compressão direta com gaze limpa e elevar o membro',
      scenario: '🩺 **Paciente com Febre!**\nUma pessoa chega dizendo que está com o corpo muito quente. O que você usa para medir a temperatura?',
      correct: 'Termômetro',
      wrongs: [
        'Fazer o paciente correr para aquecer o sangue',
        'Oferecer refeição pesada imediatamente',
        'Aplicar gelo seco não protegido direto na ferida',
        'Régua escolar de plástico',
        'Balança de cozinha',
        'Cronômetro de corrida',
      ],
      pt: {
        scenario: '🩺 **Primeiros Socorros na Enfermaria!**\nUm aventureiro chega com sangramento contínuo no antebraço após emboscada. Qual a conduta inicial?',
        correct: 'Fazer compressão direta com gaze limpa e manter o membro elevado',
        wrongs: [
          'Fazer o paciente correr para estimular a circulação',
          'Oferecer uma refeição pesada e gordurosa imediatamente',
          'Aplicar gelo seco desprotegido direto na ferida aberta',
        ],
      },
      en: {
        scenario: '🩺 **Infirmary First Aid!**\nAn adventurer arrives with active bleeding on their forearm after an ambush. What is the primary initial step?',
        correct: 'Apply direct pressure with sterile gauze and elevate the limb',
        wrongs: [
          'Make the patient run laps to boost blood flow',
          'Feed the patient a heavy, greasy feast immediately',
          'Apply bare dry ice directly into the open wound',
        ],
      },
    },
    {
      scenario: '💧 **Desidratação e Exaustão!**\nO paciente apresenta tontura, boca seca e fraqueza após cruzar a dungeon. O que prescrever?',
      correct: 'Reposição hidroeletrolítica com soro oral e repouso',
      scenario: '🩹 **Arranhão no Joelho!**\nUm aventureiro ralou o joelho no chão. Qual o primeiro passo do curativo?',
      correct: 'Lavar o machucado com água limpa e sabão neutro',
      wrongs: [
        'Bebida ultra açucarada e exercício físico intenso',
        'Jejum absoluto de líquidos por 24 horas',
        'Banho de sauna quente prolongado',
        'Passar terra por cima para tampar',
        'Esfregar com uma esponja de aço',
        'Cobrir com papelão sujo',
      ],
      pt: {
        scenario: '💧 **Desidratação Severa e Exaustão!**\nO paciente apresenta tontura, mucosas ressecadas e fraqueza após cruzar a dungeon. O que prescrever?',
        correct: 'Reposição hidroeletrolítica com soro balanceado e repouso',
        wrongs: [
          'Bebida energética ultra açucarada e exercícios intensos',
          'Jejum absoluto de qualquer líquido por 24 horas',
          'Sessão prolongada em sauna quente e sem ventilação',
        ],
      },
      en: {
        scenario: '💧 **Severe Dehydration & Exhaustion!**\nThe patient suffers from dizziness, dry mouth, and weakness after clearing a dungeon. What do you prescribe?',
        correct: 'Oral or IV electrolyte rehydration with balanced fluids and rest',
        wrongs: [
          'Super sugary energy drinks and high-intensity calisthenics',
          'Absolute fasting from any liquids for 24 hours',
          'A prolonged stay in an unventilated hot sauna',
        ],
      },
    },
    {
      scenario: '🩹 **Suspeita de Entorse no Tornozelo!**\nO paciente pisou em falso numa armadilha. Qual o protocolo padrão RICE/GELO?',
      correct: 'Repouso, gelo protegido, compressão e elevação do membro',
      scenario: '💧 **Muita Sede no Calor!**\nO paciente caminhou bastante no sol e está com sede e cansaço. O que ele deve beber?',
      correct: 'Bastante água fresca',
      wrongs: [
        'Puxar o pé com força para estalar',
        'Massagear vigorosamente o local inchado',
        'Continuar andando normalmente sem imobilizar',
        'Óleo de cozinha',
        'Vinagre puro',
        'Água do mar com sal',
      ],
      pt: {
        scenario: '🩹 **Suspeita de Entorse no Tornozelo!**\nO paciente pisou em falso numa armadilha de pedra. Qual o protocolo padrão de socorro inicial (RICE)?',
        correct: 'Repouso, gelo protegido, compressão moderada e elevação do membro',
        wrongs: [
          'Puxar o pé com força máxima para tentar estalar o osso',
          'Massagear com fricção intensa o local inchado e quente',
          'Continuar marchando normalmente sem qualquer imobilização',
        ],
      },
      en: {
        scenario: '🩹 **Suspected Ankle Sprain!**\nThe patient stepped into an ancient stone trap. What is the standard initial care protocol (RICE)?',
        correct: 'Rest, protected ice application, gentle compression, and limb elevation',
        wrongs: [
          'Violently jerk the foot to pop the joint back in',
          'Deeply massage the inflamed, swollen area with hot balm',
          'Keep marching at full speed without any stabilization',
        ],
      },
    },
  ],

  musico: [
    {
      scenario: '🎵 **Harmonia & Resolução Musical!**\nA música está em tonalidade de Dó Maior (C). Qual acorde cria a tensão perfeita para voltar à tônica?',
      correct: 'Acorde de Sol Maior (G7 - Dominante)',
      scenario: '🎸 **Preparando o Violão!**\nO que você deve fazer antes de começar a tocar para o som sair bonito e afinado?',
      correct: 'Afinar as cordas no tom correto',
      wrongs: [
        'Acorde de Ré Sustenido Diminuto',
        'Acorde de Fá Menor com Nona',
        'Desafinar a corda mais grave',
        'Cortar todas as cordas com alicate',
        'Passar cola branca nas cordas',
        'Mergulhar o violão num balde de água',
      ],
      pt: {
        scenario: '🎵 **Harmonia & Resolução Musical!**\nA música está em tonalidade de Dó Maior (C). Qual acorde cria a tensão harmônica clássica para resolver na tônica?',
        correct: 'Acorde de Sol com Sétima (G7 - Dominante)',
        wrongs: [
          'Acorde de Ré Sustenido Diminuto (D#dim)',
          'Acorde de Fá Menor com Nona (Fm9)',
          'Desafinar a corda mais grave do violão',
        ],
      },
      en: {
        scenario: '🎵 **Harmony & Resolution!**\nThe song is in the key of C Major. Which chord creates the classic harmonic tension to resolve back to tonic?',
        correct: 'G7 chord (Dominant Seventh)',
        wrongs: [
          'D# diminished chord (D#dim)',
          'F minor ninth chord (Fm9)',
          'Detune the lowest bass string completely',
        ],
      },
    },
    {
      scenario: '🎸 **Afinação de Cordas!**\nVocê vai tocar uma balada acústica na afinação padrão (EADGBE). Qual a 3ª corda?',
      correct: 'Corda Sol (G)',
      scenario: '🥁 **Ritmo da Música!**\nVocê está tocando bateria com a banda. Qual é o seu papel principal?',
      correct: 'Manter o ritmo e o tempo da música',
      wrongs: [
        'Corda Fá (F)',
        'Corda Dó (C)',
        'Corda Si (B)',
        'Tocar o mais desgovernado e fora do tempo possível',
        'Parar de tocar de repente no meio da música',
        'Jogar as baquetas no público com raiva',
      ],
      pt: {
        scenario: '🎸 **Afinação Padrão de Cordas!**\nVocê vai afinar seu instrumento de cordas na afinação padrão (E-A-D-G-B-e). Qual nota corresponde à terceira corda (contando de baixo)?',
        correct: 'Corda Sol (G)',
        wrongs: [
          'Corda Dó (C)',
          'Corda Fá (F)',
          'Corda Ré (D)',
        ],
      },
      en: {
        scenario: '🎸 **Standard Instrument Tuning!**\nYou are tuning your stringed instrument to standard tuning (E-A-D-G-B-e). Which note corresponds to the 3rd string from the bottom?',
        correct: 'G string',
        wrongs: [
          'C string',
          'F string',
          'D string',
        ],
      },
    },
    {
      scenario: '🥁 **Controle de Andamento!**\nO arranjo pede uma execução lenta e solene (Andante / Adagio). Qual a faixa de BPM indicada?',
      correct: 'Entre 60 e 80 BPM',
      scenario: '🎤 **Cuidando da Voz!**\nO cantor vai se apresentar hoje à noite. O que ele deve fazer para cuidar da voz?',
      correct: 'Beber água e aquecer a voz antes de cantar',
      wrongs: [
        '220 BPM em ritmo de Speed Metal',
        '0 BPM sem tocar notas',
        '500 BPM acelerado',
        'Gritar até ficar rouco antes do show',
        'Chupar pedras de gelo sem parar',
        'Comer areia',
      ],
      pt: {
        scenario: '🥁 **Controle de Andamento e Ritmo!**\nA partitura pede uma execução solene e calma (Andante / Adagio). Qual faixa de BPM é a indicada?',
        correct: 'Entre 60 e 80 Batidas Por Minuto (BPM)',
        wrongs: [
          'Mais de 220 BPM em velocidade extrema de Speed Metal',
          '0 BPM sem tocar qualquer nota no compasso',
          '500 BPM acelerado fora de controle',
        ],
      },
      en: {
        scenario: '🥁 **Tempo & Pacing Control!**\nThe musical sheet asks for a solemn, relaxed pace (Andante / Adagio). What BPM range is appropriate?',
        correct: 'Between 60 and 80 Beats Per Minute (BPM)',
        wrongs: [
          'Over 220 BPM in an extreme Speed Metal rush',
          '0 BPM without playing any notes across bars',
          '500 BPM frantically rushing ahead of the band',
        ],
      },
    },
  ],

  professor: [
    {
      scenario: '📚 **Gramática & Ortografia!**\nQual das alternativas apresenta todas as palavras grafadas corretamente segundo a norma culta?',
      correct: 'Exceção, Privilégio, Beneficente',
      scenario: '📚 **Início da Aula!**\nOs alunos acabaram de entrar na sala. O que o professor faz para saber quem veio?',
      correct: 'Fazer a chamada dos alunos presentes',
      wrongs: [
        'Excessão, Previlégio, Beneficiente',
        'Exceção, Previlégio, Beneficente',
        'Excessão, Privilégio, Beneficiente',
        'Apagar a luz e ir embora dormir',
        'Mandar todo mundo correr sem rumo',
        'Esconder os cadernos de todos',
      ],
      pt: {
        scenario: '📚 **Gramática & Ortografia!**\nQual das alternativas apresenta todas as palavras grafadas corretamente segundo o padrão culto?',
        correct: 'Exceção, Privilégio, Beneficente',
        wrongs: [
          'Excessão, Previlégio, Beneficiente',
          'Exceção, Previlégio, Beneficente',
          'Excessão, Privilégio, Beneficiente',
        ],
      },
      en: {
        scenario: '📚 **Grammar & Vocabulary Mastery!**\nWhich of the following options contains all words correctly spelled according to standard English?',
        correct: 'Accommodate, Definitely, Privilege',
        wrongs: [
          'Acommodate, Definately, Priviledge',
          'Accomodate, Definitely, Priviledge',
          'Accommodate, Definately, Previlige',
        ],
      },
    },
    {
      scenario: '📐 **Desafio Matemático da Turma!**\nSe uma jornada de 120 km é feita a uma velocidade média de 60 km/h, quanto tempo dura o trajeto?',
      correct: '2 horas',
      scenario: '✏️ **Explicando a Lição!**\nO professor quer escrever uma explicação para a turma toda acompanhar. Onde ele escreve?',
      correct: 'Na lousa / quadro da sala de aula',
      wrongs: [
        '3 horas e meia',
        '1 hora e 15 minutos',
        '45 minutos',
        'No chão da entrada',
        'Nas roupas dos alunos',
        'Na parede do banheiro',
      ],
      pt: {
        scenario: '📐 **Desafio Matemático da Turma!**\nUma caravana percorreu 180 km a uma velocidade constante de 60 km/h. Quanto tempo durou a viagem?',
        correct: '3 horas',
        wrongs: [
          '4 horas e 30 minutos',
          '1 hora e 45 minutos',
          '45 minutos',
        ],
      },
      en: {
        scenario: '📐 **Classroom Math Challenge!**\nA caravan traveled a distance of 180 km at a steady speed of 60 km/h. How long did the trip take?',
        correct: '3 hours',
        wrongs: [
          '4 hours and 30 minutes',
          '1 hour and 45 minutes',
          '45 minutes',
        ],
      },
    },
    {
      scenario: '🔬 **Conhecimentos Científicos!**\nQual organela celular vegetal é responsável por realizar a fotossíntese?',
      correct: 'Cloroplasto',
      scenario: '📖 **Dúvida na Lição!**\nUm aluno levantou a mão porque não entendeu um exercício. Como agir?',
      correct: 'Explicar com calma de um jeito fácil de entender',
      wrongs: [
        'Lisossomo',
        'Centríolo',
        'Complexo Golgiense',
        'Rir do aluno e passar o dobro de lição',
        'Fingir que não ouviu e sair da sala',
        'Tirar todos os pontos da turma',
      ],
      pt: {
        scenario: '🔬 **Conhecimentos de Biologia!**\nQual organela celular vegetal é a responsável direta pela realização da fotossíntese?',
        correct: 'Cloroplasto',
        wrongs: [
          'Lisossomo',
          'Centríolo',
          'Complexo de Golgi',
        ],
      },
      en: {
        scenario: '🔬 **Biological Science Quiz!**\nWhich plant cell organelle is directly responsible for carrying out photosynthesis?',
        correct: 'Chloroplast',
        wrongs: [
          'Lysosome',
          'Centriole',
          'Golgi Apparatus',
        ],
      },
    },
  ],

  fotografo: [
    {
      scenario: '📸 **Fotografia de Ação em Movimento!**\nVocê quer congelar o salto de um Pymon sem borrões. Como ajustar o obturador?',
      correct: 'Velocidade alta (1/1000s ou mais rápida)',
      scenario: '📸 **Ambiente Escuro!**\nVocê vai tirar uma foto num quarto escuro e quase não dá para enxergar nada. O que você usa?',
      correct: 'O flash da câmera ou acender as luzes',
      wrongs: [
        'Longa exposição de 10 segundos',
        'Desligar o foco automático e tampar a lente',
        'Diminuir a velocidade para 1/2s',
        'Tampar a lente com a mão',
        'Apagar a única lâmpada acesa',
        'Fechar os olhos bem forte',
      ],
      pt: {
        scenario: '📸 **Fotografia de Ação em Movimento!**\nVocê quer congelar o salto veloz de um Pymon sem nenhum borrão de movimento. Como regular o obturador?',
        correct: 'Velocidade alta do obturador (1/1000s ou mais rápida)',
        wrongs: [
          'Longa exposição noturna de 15 segundos',
          'Desacelerar a velocidade para 1/2s',
          'Tampar a lente com a mão durante o disparo',
        ],
      },
      en: {
        scenario: '📸 **High-Speed Action Photography!**\nYou want to freeze the agile leap of a Pymon with crisp sharpness and no motion blur. How do you set the shutter speed?',
        correct: 'Fast shutter speed (1/1000s or faster)',
        wrongs: [
          '15-second long night exposure',
          'Slow down the shutter speed to 1/2s',
          'Cover the lens with your hand while clicking',
        ],
      },
    },
    {
      scenario: '✨ **Retrato com Fundo Desfocado (*Bokeh*)!**\nPara isolar o sujeito com desfoque estético suave no fundo, qual abertura de diafragma utilizar?',
      correct: 'Abertura ampla com número f baixo (f/1.4 ou f/1.8)',
      scenario: '🖼️ **Foto Embaçada!**\nA foto ficou toda borrada e fora de foco. O que você ajusta na câmera?',
      correct: 'O foco na pessoa ou objeto que quer fotografar',
      wrongs: [
        'Abertura mínima com número f alto (f/22 ou f/32)',
        'Usar flash direto no olho do modelo',
        'Colocar a câmera no modo paisagem fechado',
        'Chacoalhar a câmera com força ao apertar o botão',
        'Passar lixa na lente da câmera',
        'Tirar a foto correndo de costas',
      ],
      pt: {
        scenario: '✨ **Retrato com Fundo Desfocado (*Bokeh*)!**\nPara isolar o modelo com desfoque estético suave e artístico no fundo, qual abertura de diafragma utilizar?',
        correct: 'Grande abertura com número f baixo (como f/1.4 ou f/1.8)',
        wrongs: [
          'Abertura mínima com número f alto (como f/22 ou f/32)',
          'Disparar flash direto no olho do modelo a 10cm',
          'Bloquear o foco no infinito em modo paisagem',
        ],
      },
      en: {
        scenario: '✨ **Portrait with Cinematic Bokeh!**\nTo isolate your subject with a creamy, aesthetically blurred background, which lens aperture should you use?',
        correct: 'Wide aperture with a low f-number (such as f/1.4 or f/1.8)',
        wrongs: [
          'Narrow aperture with a high f-number (such as f/22 or f/32)',
          'Point-blank direct flash straight into the subject’s eyes',
          'Lock focus to landscape infinity mode',
        ],
      },
    },
    {
      scenario: '🌅 **Fotografia na Hora de Ouro (*Golden Hour*)!**\nO sol está se pondo com luz quente e suave. Qual equilíbrio de branco (WB) realça o tom?',
      correct: 'Luz do Dia / Sombra (Daylight / Cloudy) para tons dourados',
      scenario: '🔋 **Bateria da Câmera!**\nVocê tem um ensaio fotográfico amanhã cedo. O que precisa fazer hoje à noite?',
      correct: 'Colocar a bateria da câmera para carregar',
      wrongs: [
        'Fluorescente fria esverdeada',
        'Tungstênio azulado congelante',
        'Preto e branco sem contraste',
        'Deixar a câmera ligada no chão a noite toda',
        'Molhar a bateria na pia',
        'Jogar a câmera no lixo',
      ],
      pt: {
        scenario: '🌅 **Fotografia na Hora Dourada (*Golden Hour*)!**\nO sol está se pondo com uma luz quente e difusa. Qual equilíbrio de branco (WB) realça esses tons dourados?',
        correct: 'Luz do Dia ou Nublado (Daylight / Cloudy) para realçar tons quentes',
        wrongs: [
          'Fluorescente fria com dominante esverdeada',
          'Tungstênio azulado que esfria toda a imagem',
          'Preto e branco sem qualquer contraste tonal',
        ],
      },
      en: {
        scenario: '🌅 **Golden Hour Photography!**\nThe sun is setting with warm, ambient glow. Which White Balance (WB) preset best enhances these golden hues?',
        correct: 'Daylight or Cloudy to bring out rich, warm tones',
        wrongs: [
          'Fluorescent cold preset with a greenish tint',
          'Tungsten deep blue which cancels out all warmth',
          'Flat monochrome with zero contrast',
        ],
      },
    },
  ],

  mecanico: [
    {
      scenario: '🔧 **Diagnóstico de Ruído no Freio!**\nO veículo emite um som agudo de atrito metálico toda vez que o pedal de freio é acionado. Qual o diagnóstico?',
      correct: 'Pastilhas de freio gastas atingindo o indicador de desgaste',
      scenario: '🚗 **Pneu Furado!**\nO carro pegou um prego e o pneu murchou. Qual ferramenta você usa para erguer o carro e trocar a roda?',
      correct: 'O macaco mecânico / hidráulico',
      wrongs: [
        'Pneu dianteiro com excesso de ar',
        'Vela de ignição encharcada',
        'Retrovisor lateral desalinhado',
        'Um pedaço de graveto fino',
        'Um secador de cabelo',
        'Um martelo de plástico de brinquedo',
      ],
      pt: {
        scenario: '🔧 **Diagnóstico de Ruído no Freio!**\nO veículo emite um som agudo de atrito metálico toda vez que o pedal de freio é acionado. Qual o diagnóstico provável?',
        correct: 'Pastilhas de freio gastas raspando no indicador metálico',
        wrongs: [
          'Pneu dianteiro com excesso de calibragem de ar',
          'Velas de ignição encharcadas de óleo',
          'Palhetas do limpador de para-brisa desgastadas',
        ],
      },
      en: {
        scenario: '🔧 **Brake Noise Diagnosis!**\nA vehicle makes a sharp high-pitched metallic screeching sound whenever the brake pedal is pressed. What is the likely cause?',
        correct: 'Worn brake pads rubbing against their metal wear indicator',
        wrongs: [
          'Front tire having slightly too much air pressure',
          'Spark plugs soaked in motor oil',
          'Worn windshield wiper blades',
        ],
      },
    },
    {
      scenario: '🌡️ **Superaquecimento do Motor!**\nO ponteiro de temperatura subiu para a faixa vermelha em subida de serra. O que verificar?',
      correct: 'Vazamento no radiador / funcionamento da ventoinha',
      scenario: '🛢️ **Nível de Óleo!**\nVocê vai conferir se o motor tem óleo suficiente. Qual item você usa para checar?',
      correct: 'A vareta medidora de óleo do motor',
      wrongs: [
        'Calibragem do estepe no porta-malas',
        'Trocar as palhetas do limpador de para-brisa',
        'Ligar o rádio no volume máximo',
        'Um palito de dente',
        'Uma colher de sopa',
        'Um canudo de refrigerante',
      ],
      pt: {
        scenario: '🌡️ **Superaquecimento do Motor!**\nO ponteiro de temperatura subiu para a faixa vermelha durante uma subida íngreme. O que verificar primeiro?',
        correct: 'Nível do líquido de arrefecimento, vazamentos no radiador e ventoinha',
        wrongs: [
          'Calibragem do estepe guardado no porta-malas',
          'Trocar as lâmpadas da lanterna traseira',
          'Ligar o rádio no volume máximo para resfriar',
        ],
      },
      en: {
        scenario: '🌡️ **Engine Overheating Alert!**\nThe temperature needle spikes into the red danger zone while climbing a steep hill. What should you check first?',
        correct: 'Coolant level, radiator leaks, and cooling fan operation',
        wrongs: [
          'Tire pressure on the spare wheel inside the trunk',
          'Replace the rear tail light bulbs immediately',
          'Turn the car radio to maximum volume to cool it down',
        ],
      },
    },
    {
      scenario: '🔋 **Falha na Partida Matinal!**\nAo girar a chave, o motor de arranque gira pesado e as luzes do painel piscam fracas. Qual a causa?',
      correct: 'Bateria com carga baixa ou com fim de vida útil',
      scenario: '🛑 **Farol Queimado!**\nO motorista avisa que um dos faróis dianteiros não está acendendo à noite. O que deve ser trocado?',
      correct: 'A lâmpada do farol',
      wrongs: [
        'Tanque com excesso de combustível',
        'Escapamento esportivo entupido',
        'Bancos desregulados',
        'O volante do carro',
        'O tapete do porta-malas',
        'A antena do rádio',
      ],
      pt: {
        scenario: '🔋 **Falha na Partida Matinal!**\nAo girar a chave, o motor de arranque gira pesado e lento, e as luzes do painel piscam apagando. Qual a causa?',
        correct: 'Bateria descarregada, polos oxidados ou fim de vida útil',
        wrongs: [
          'Tanque de combustível com gasolina demais',
          'Ponteira do escapamento esportivo cromada',
          'Espelhos retrovisores levemente embaçados',
        ],
      },
      en: {
        scenario: '🔋 **Morning Ignition Failure!**\nWhen turning the key, the starter motor cranks sluggishly and dashboard lights dim and flicker. What is the cause?',
        correct: 'Discharged battery, corroded battery terminals, or end of battery lifespan',
        wrongs: [
          'Having too much gasoline in the fuel tank',
          'Polished chrome exhaust pipe tip',
          'Side view mirrors being slightly foggy',
        ],
      },
    },
  ],

  vendedor: [
    {
      scenario: '💼 **Objeção de Preço do Cliente!**\nO cliente diz: "Gostei muito do item, mas achei o valor um pouco alto". Qual a resposta consultiva ideal?',
      correct: 'Demonstrar o valor agregado, durabilidade e benefícios exclusivos',
      scenario: '🤝 **Cliente Chegando na Loja!**\nUma pessoa acabou de entrar na sua loja. Qual a atitude mais educada?',
      correct: 'Cumprimentar com simpatia e perguntar como pode ajudar',
      wrongs: [
        'Dizer que se ele não tem dinheiro não deveria estar na loja',
        'Ficar em silêncio e virar as costas',
        'Aumentar o preço para ver se ele compra mais rápido',
        'Ignorar a pessoa e ficar mexendo no celular',
        'Dizer para ela não encostar em nada',
        'Mandar a pessoa ir embora da loja',
      ],
      pt: {
        scenario: '💼 **Objeção de Preço do Cliente!**\nO cliente diz: "Gostei muito do produto, mas achei o valor um pouco alto". Qual a conduta consultiva ideal?',
        correct: 'Demonstrar o valor agregado, retorno, durabilidade e benefícios exclusivos',
        wrongs: [
          'Dizer com arrogância que ele deveria procurar uma loja mais barata',
          'Aumentar o preço na hora para ver se ele compra com medo',
          'Ficar em silêncio e virar as costas para o cliente',
        ],
      },
      en: {
        scenario: '💼 **Customer Price Objection!**\nA customer says: "I really like this product, but the price seems a bit steep." What is the best consultative response?',
        correct: 'Demonstrate value, durability, ROI, and exclusive benefits that justify the cost',
        wrongs: [
          'Rudely tell them to go find a discount dollar store instead',
          'Raise the price on the spot to induce panic buying',
          'Turn your back and give the customer the silent treatment',
        ],
      },
    },
    {
      scenario: '🤝 **Abordagem a um Cliente Indeciso!**\nO cliente está olhando vários produtos sem saber qual escolher. Como agir?',
      correct: 'Fazer perguntas abertas para entender a necessidade real dele',
      scenario: '💰 **Dando o Troco!**\nO item custa 15 moedas e o cliente pagou com uma nota de 20 moedas. Qual o troco?',
      correct: '5 moedas',
      wrongs: [
        'Empurrar o produto mais caro sem dar explicações',
        'Dizer que todos os produtos são ruins',
        'Pressionar para ele passar o cartão imediatamente',
        '100 moedas',
        'Ficar com o dinheiro e não dar nada de troco',
        '50 moedas',
      ],
      pt: {
        scenario: '🤝 **Abordagem a Cliente Indeciso!**\nO cliente está examinando diversos modelos na vitrine sem saber qual atende suas necessidades. Como agir?',
        correct: 'Fazer perguntas abertas para entender a real necessidade e orientar a melhor escolha',
        wrongs: [
          'Empurrar o produto mais caro do estoque sem dar explicações',
          'Dizer que todas as opções da loja são ruins e não duram',
          'Pressionar o cliente para passar o cartão imediatamente sem pensar',
        ],
      },
      en: {
        scenario: '🤝 **Assisting an Indecisive Shopper!**\nA customer is looking back and forth between several models unsure which one fits best. How do you help?',
        correct: 'Ask open-ended questions to uncover their true needs and guide their choice',
        wrongs: [
          'Push the most expensive item in the warehouse without explaining why',
          'Tell them that every product on the shelves is poorly made',
          'Aggressively badger them to swipe their credit card immediately',
        ],
      },
    },
    {
      scenario: '📦 **Fidelização e Pós-Venda!**\nApós fechar a venda de um equipamento valioso, qual a melhor atitude para reter o cliente?',
      correct: 'Oferecer suporte, canais de atendimento e garantia clara',
      scenario: '🏷️ **Promoção Especial!**\nA loja vai fazer uma queima de estoque. O que colocar nos produtos para destacar o preço baixo?',
      correct: 'Etiquetas chamativas com o desconto da promoção',
      wrongs: [
        'Bloquear o número do cliente após o pagamento',
        'Cobrar taxa extra de pós-venda surpresa',
        'Não emitir comprovante',
        'Esconder os produtos no armário trancado',
        'Colocar uma placa dizendo "loja fechada"',
        'Apagar as luzes da loja',
      ],
      pt: {
        scenario: '📦 **Fidelização e Pós-Venda!**\nApós concluir a venda de um item de alto valor, qual a melhor prática para fidelizar o cliente?',
        correct: 'Oferecer suporte ágil, canais de atendimento, garantia clara e acompanhar a satisfação',
        wrongs: [
          'Bloquear o contato do comprador imediatamente após o pagamento',
          'Cobrar uma taxa extra surpresa de atendimento pós-venda',
          'Recusar-se a emitir nota fiscal ou termo de garantia',
        ],
      },
      en: {
        scenario: '📦 **After-Sales Support & Loyalty!**\nAfter closing a high-value equipment sale, what is the best practice to retain the customer long-term?',
        correct: 'Provide dedicated support channels, clear warranty terms, and follow-up satisfaction checks',
        wrongs: [
          'Block the buyer’s contact info as soon as their payment clears',
          'Surprise the customer with an unannounced after-sales fee',
          'Refuse to issue a receipt or provide warranty paperwork',
        ],
      },
    },
  ],

  artista: [
    {
      scenario: '🎨 **Mistura e Teoria das Cores!**\nVocê precisa compor um tom de Violeta Profundo para o manto de um mago. Quais cores misturar?',
      correct: 'Azul e Vermelho',
      scenario: '🎨 **Mistura de Cores!**\nVocê está pintando uma árvore e acabou a tinta verde. Quais cores misturar para criar verde?',
      correct: 'Azul e Amarelo',
      wrongs: [
        'Amarelo e Verde',
        'Laranja e Marrom',
        'Preto e Amarelo',
        'Vermelho e Preto',
        'Branco e Roxo',
        'Rosa e Marrom',
      ],
      pt: {
        scenario: '🎨 **Mistura e Teoria das Cores!**\nVocê precisa compor um tom de Violeta Profundo para o manto de um mago. Quais cores primárias misturar?',
        correct: 'Azul e Vermelho',
        wrongs: [
          'Amarelo e Verde',
          'Laranja e Marrom',
          'Preto e Amarelo',
        ],
      },
      en: {
        scenario: '🎨 **Color Theory & Pigment Mixing!**\nYou need to mix a rich Violet tone for a wizard’s mystical robe. Which primary colors do you combine?',
        correct: 'Blue and Red',
        wrongs: [
          'Yellow and Green',
          'Orange and Brown',
          'Black and Yellow',
        ],
      },
    },
    {
      scenario: '🖌️ **Profundidade em Paisagem!**\nComo criar a sensação de que as montanhas ao fundo estão muito distantes?',
      correct: 'Usar tons mais claros, azulados e com menos contraste (Perspectiva Atmosférica)',
      scenario: '🖌️ **Cuidando dos Pincéis!**\nDepois de pintar um quadro colorido, o que fazer com os pincéis para as cerdas não estragarem?',
      correct: 'Lavar bem com água e secar com cuidado',
      wrongs: [
        'Pintar as montanhas com preto sólido e traços grossos',
        'Colocar detalhes minuciosos nas folhas mais distantes',
        'Apagar o céu completamente',
        'Deixar secar sujo com tinta dura',
        'Cortar os pelos do pincel com tesoura',
        'Queimar as cerdas no fogo',
      ],
      pt: {
        scenario: '🖌️ **Profundidade em Paisagem!**\nComo criar a sensação realista de que as montanhas ao fundo estão a quilômetros de distância?',
        correct: 'Usar tons mais claros, azulados e com menor contraste (Perspectiva Atmosférica)',
        wrongs: [
          'Pintar as montanhas distantes com preto sólido e contornos grossos',
          'Desenhar detalhes minuciosos e brilhantes nas pedras mais distantes',
          'Apagar o céu completamente deixando um vazio branco',
        ],
      },
      en: {
        scenario: '🖌️ **Atmospheric Depth in Landscape Art!**\nHow do you realistically depict distant mountains that are miles away from the viewer?',
        correct: 'Use lighter values, cooler bluish tones, and lower contrast (Atmospheric Perspective)',
        wrongs: [
          'Paint distant peaks with jet black solid ink and thick sharp outlines',
          'Render hyper-detailed tiny sparkles on the furthest background rocks',
          'Completely erase the sky leaving a flat blank white void',
        ],
      },
    },
    {
      scenario: '💡 **Ponto Focal e Contraste!**\nPara fazer o olhar do observador ir direto ao personagem principal da tela, qual elemento usar?',
      correct: 'Alto contraste de luz e sombra direcionado ao personagem (Chiaroscuro)',
      scenario: '🖼️ **Onde Pintar a Tela!**\nO pintor vai começar um quadro novo com tinta a óleo. Onde ele apoia a tela de pintura?',
      correct: 'Em um cavalete de pintura',
      wrongs: [
        'Deixar a tela inteira em tons médios idênticos',
        'Borrar a tela toda igualmente',
        'Pintar tudo de cinza neutro',
        'Na janela de vidro do vizinho',
        'No chão do banheiro molhado',
        'No pneu do carro',
      ],
      pt: {
        scenario: '💡 **Ponto Focal e Iluminação!**\nPara atrair instantaneamente o olhar do observador para o personagem principal na tela, qual recurso aplicar?',
        correct: 'Alto contraste de luz e sombra direcionado ao ponto de interesse (Chiaroscuro)',
        wrongs: [
          'Deixar a tela inteira com iluminação acinzentada e homogênea',
          'Borrar todos os elementos do quadro com a mesma intensidade',
          'Pintar tudo de cinza monocromático sem nenhum destaque',
        ],
      },
      en: {
        scenario: '💡 **Focal Point & Contrast Mastery!**\nTo immediately draw the viewer’s eye toward the central protagonist on the canvas, which technique should you employ?',
        correct: 'High contrast of targeted light and shadow directed at the subject (Chiaroscuro)',
        wrongs: [
          'Keep the entire canvas in flat, muddy, identical mid-tones',
          'Blur every single element on the canvas with equal strength',
          'Paint the entire piece in flat grey without any highlights or shadows',
        ],
      },
    },
  ],
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isWorkInteraction(interaction) {
  return typeof interaction.customId === 'string' && interaction.customId.startsWith('work_ans:');
}

async function handleWorkInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const selectedIdx = Number(parts[1]);
  const sessionUserId = parts[2];

  if (interaction.user.id !== sessionUserId) {
    return interaction.reply({
      content: t('workMinigame.otherUserSession', interaction),
      flags: 64,
    });
  }

  const session = activeWorkSessions.get(sessionUserId);
  if (!session) {
    return interaction.reply({
      content: t('workMinigame.expiredSession', interaction),
      flags: 64,
    });
  }

  activeWorkSessions.delete(sessionUserId);

  const lang = session.lang || getLanguage(interaction);
  const isCorrect = selectedIdx === session.correctIndex;
  const isCriticalBonus = isCorrect && Math.random() < 0.02; // 2% de chance de bônus de Feijão Mágico em acertos

  const result = finishWork(sessionUserId, isCorrect, session.salary, isCriticalBonus);

  if (!isCorrect) {
    const desc = [
      t('workMinigame.wrongMistake', lang),
      '',
      t('workMinigame.correctAnswerLabel', lang),
      `> *${session.correctText}*`,
      '',
      t('workMinigame.nextShiftLabel', lang),
      t('workMinigame.noSalaryText', lang),
    ].join('\n');

    const errorEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.crimson || '#ef4444')
      .setTitle(t('workMinigame.wrongTitle', lang, { profession: session.professionLabel }))
      .setDescription(desc)
      .setFooter({ text: 'Pyxie' })
      .setTimestamp();

    return interaction.update({ embeds: [errorEmbed], components: [] });
  }

  const desc = [
    t('workMinigame.successDedication', lang),
    '',
    t('workMinigame.salaryHeader', lang),
    t('workMinigame.salaryLine', lang, { amount: formatCoins(result.amount, lang) }),
    t('workMinigame.balanceLine', lang, { balance: formatCoins(result.balance, lang) }),
    '',
    t('workMinigame.careerHeader', lang),
    t('workMinigame.workCountLine', lang, { count: getUserAccount(sessionUserId).workCount }),
  ];

  if (result.bonusBean) {
    desc.push(
      '',
      t('workMinigame.epicBeanBonus', lang),
      t('workMinigame.epicBeanDesc', lang, { beans: result.magicBeans })
    );
  }

  const successEmbed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.emerald || '#10b981')
    .setTitle(t('workMinigame.successTitle', lang, { profession: session.professionLabel }))
    .setDescription(desc.join('\n'))
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  return interaction.update({ embeds: [successEmbed], components: [] });
}

async function runWork(source, reply) {
  const user = source.user || source.author;
  const lang = getLanguage(source);
  const account = getUserAccount(user.id);

  if (!account.profession || !professions[account.profession]) {
    await reply({
      content: t('workMinigame.noProfession', lang),
      ephemeral: true,
    });
    return;
  }

  const status = getWorkStatus(user.id);
  if (!status.available) {
    await reply({
      content: t('workMinigame.cooldown', lang, { time: formatRemaining(status.remainingMs, lang) }),
      ephemeral: true,
    });
    return;
  }

  const professionKey = account.profession;
  const profDef = professions[professionKey];
  const professionLabel = t(`profession.labels.${professionKey}`, lang) || profDef?.label || professionKey;

  const minigames = PROFESSION_MINIGAMES[professionKey] || PROFESSION_MINIGAMES.programador;
  const chosenGame = minigames[Math.floor(Math.random() * minigames.length)];
  const gameData = chosenGame[lang] || chosenGame.en || chosenGame.pt;

  const allChoices = [
    { text: gameData.correct, correct: true },
    ...gameData.wrongs.map((w) => ({ text: w, correct: false })),
  ];

  const shuffledChoices = shuffleArray(allChoices);
  const correctIndex = shuffledChoices.findIndex((c) => c.correct);

  const salary = Math.floor(Math.random() * (WORK_MAXIMUM - WORK_MINIMUM + 1)) + WORK_MINIMUM;

  // Inicia o cooldown e registra o trabalho
  startWork(user.id, { profession: professionKey, salary });

  activeWorkSessions.set(user.id, {
    correctIndex,
    correctText: gameData.correct,
    salary,
    professionKey,
    professionLabel,
    lang,
    startedAt: Date.now(),
  });

  // Timeout automático da sessão
  setTimeout(() => {
    if (activeWorkSessions.has(user.id)) {
      activeWorkSessions.delete(user.id);
    }
  }, WORK_TIMEOUT_MS);

  const questionDesc = [
    gameData.scenario,
    '',
    t('workMinigame.timeLimit', lang),
  ].join('\n');

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet || '#a855f7')
    .setTitle(t('workMinigame.minigameTitle', lang, { profession: professionLabel }))
    .setDescription(questionDesc)
    .setFooter({ text: 'Pyxie' })
    .setTimestamp();

  const buttonRow = new ActionRowBuilder();
  const labelLetters = ['A', 'B', 'C', 'D'];
  shuffledChoices.forEach((choice, idx) => {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`work_ans:${idx}:${user.id}`)
        .setLabel(`[${labelLetters[idx]}] ${choice.text}`.slice(0, 80))
        .setStyle(ButtonStyle.Primary)
    );
  });

  await reply({ embeds: [embed], components: [buttonRow] });
}

module.exports = {
  name: WORK,
  aliases: ['work', 'trabalho', 'py-trabalho', 'py-work', 'trampo', 'job'],
  isWorkInteraction,
  handleWorkInteraction,
  PROFESSION_MINIGAMES,
  data: new SlashCommandBuilder()
    .setName(WORK)
    .setDescription('Start a career shift minigame to earn coins and magic beans.')
    .setDescriptionLocalizations({
      'pt-BR': 'Inicia um minigame interativo da sua profissão para receber moedas e Feijões Mágicos.',
    }),
  async executePrefix({ message }) {
    await runWork(message, (payload) => message.reply(payload));
  },
  async executeSlash({ interaction }) {
    await runWork(interaction, (payload) => interaction.editReply(payload));
  },
};
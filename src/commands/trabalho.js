const fs = require('fs');
const path = require('path');
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
  getRoleTitle,
  calculateSalaryForLevel,
  filterMinigamesByLevel,
} = require('../services/careerHierarchy');
const {
  formatCoins,
  formatRemaining,
  getLanguage,
  t,
} = require('../utils/i18n');
const { WORK } = require('./commandNames');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');

const GENERATED_FILE = path.join(__dirname, '../data/generated_work_minigames.json');

function loadGeneratedMinigames() {
  if (fs.existsSync(GENERATED_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(GENERATED_FILE, 'utf8'));
    } catch (_) {}
  }
  return {};
}

const WORK_MINIMUM = 15;
const WORK_MAXIMUM = 40;
const WORK_TIMEOUT_MS = 90 * 1000;

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
      scenario: '📸 **Fotografia de Ação em Movimento!**\nVocê quer congelar o salto de um gato veloz sem borrões. Como ajustar o obturador?',
      correct: 'Velocidade alta (1/1000s ou mais rápida)',
      wrongs: [
        'Longa exposição de 10 segundos',
        'Desligar o foco automático e tampar a lente',
        'Diminuir a velocidade para 1/2s',
      ],
      pt: {
        scenario: '📸 **Fotografia de Ação em Movimento!**\nVocê quer congelar o salto veloz de um gato sem nenhum borrão de movimento. Como regular o obturador?',
        correct: 'Velocidade alta do obturador (1/1000s ou mais rápida)',
        wrongs: [
          'Longa exposição noturna de 15 segundos',
          'Desacelerar a velocidade para 1/2s',
          'Tampar a lente com a mão durante o disparo',
        ],
      },
      en: {
        scenario: '📸 **High-Speed Action Photography!**\nYou want to freeze the agile leap of a swift cat with crisp sharpness and no motion blur. How do you set the shutter speed?',
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

  dublador: [
    {
      level: 1,
      pt: {
        scenario: '🎙️ **Sincronia Labial no Estúdio!**\nO personagem na tela abre a boca dizendo uma frase curta e expressiva. O que o dublador deve sincronizar com exatidão?',
        correct: 'A abertura da boca e o tempo de fala do personagem na tela',
        wrongs: [
          'O volume dos autofalantes da sala de espera',
          'A iluminação da cabine de áudio',
          'A velocidade do ar-condicionado',
        ],
      },
      en: {
        scenario: '🎙️ **Studio Lip-Sync Timing!**\nThe on-screen character opens their mouth with an expressive line. What must the voice actor sync precisely?',
        correct: 'The mouth flap timing and character dialogue duration',
        wrongs: [
          'The waiting room loudspeaker volume',
          'The studio booth ambient light levels',
          'The air conditioning fan speed',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🎧 **Uso do Pop Filter no Microfone!**\nDurante a gravação de falas com muitas consoantes oclusivas (P e B), por que o pop filter é indispensável?',
        correct: 'Para atenuar os picos de ar que causam estalos e distorção na cápsula',
        wrongs: [
          'Para mudar o idioma da gravação automaticamente',
          'Para aumentar o eco na sala',
          'Para diminuir o volume da música de fundo',
        ],
      },
      en: {
        scenario: '🎧 **Microphone Pop Filter!**\nWhen recording dialogue with heavy plosive consonants (P and B sounds), why is a pop filter essential?',
        correct: 'To disperse bursts of air that cause plosive thumps and capsule distortion',
        wrongs: [
          'To translate spoken words into subtitles in real-time',
          'To inject artificial reverberation into the booth',
          'To reduce the volume of the background soundtrack',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🎭 **Interpretação e Subtexto!**\nO roteiro indica que o herói está disfarçando o medo para proteger seus aliados. Qual a melhor nuance vocal?',
        correct: 'Voz firme na superfície com respiração sutilmente trêmula nos finais de frase',
        wrongs: [
          'Gritar comicamente sem conexão com o drama',
          'Falar em tom monótono robótico e sem emoção',
          'Sussurrar tão baixo que o microfone não capta nada',
        ],
      },
      en: {
        scenario: '🎭 **Dramatic Subtext in Voice Acting!**\nThe script notes reveal the hero is masking dread to keep allies hopeful. What is the best vocal nuance?',
        correct: 'A confident outward delivery with subtle breath trembles at sentence endings',
        wrongs: [
          'A cartoonish scream detached from scene drama',
          'A flat emotionless monotonic drone',
          'An inaudible mumble that the preamp cannot pick up',
        ],
      },
    },
  ],

  desenvolvedor_jogos: [
    {
      level: 1,
      pt: {
        scenario: '🕹️ **Detecção de Colisão!**\nO herói está atravessando o chão de pedra e caindo no vazio. Qual componente essencial está faltando na malha do piso?',
        correct: 'Um componente de Colisor (Collider)',
        wrongs: [
          'Um arquivo de áudio MP3',
          'Uma textura 4K de alta resolução',
          'Uma luz de holofote virtual',
        ],
      },
      en: {
        scenario: '🕹️ **Collision Detection!**\nThe protagonist falls straight through the stone floor into the void. Which essential engine component is missing on the mesh?',
        correct: 'A Collider component',
        wrongs: [
          'An ambient MP3 sound effect',
          'A high-resolution 4K diffuse texture',
          'A directional spot light source',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '⚡ **Game Feel e Impacto (Juice)!**\nO golpe do machado parece sem peso e sem impacto para os jogadores no playtest. O que adicionar para melhorar a sensação do golpe?',
        correct: 'Freeze-frame de 2 frames (hitstop), leve tremor de tela e partículas de faísca',
        wrongs: [
          'Apagar o personagem principal do código',
          'Tirar todo o som do jogo',
          'Aumentar o tempo de carregamento da fase',
        ],
      },
      en: {
        scenario: '⚡ **Game Feel & Combat Juice!**\nPlayer feedback says weapon strikes feel weightless and floaty during combat. How do you enhance the impact feel?',
        correct: 'Add hitstop (2-frame pause), subtle screen shake, and spark particles',
        wrongs: [
          'Remove the player character model completely',
          'Mute all game audio tracks permanently',
          'Artificially increase level loading times',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '👾 **Inteligência Artificial de Inimigos!**\nQual padrão de arquitetura simples e eficiente é ideal para organizar estados de patrulha, perseguição e ataque dos monstros?',
        correct: 'Máquina de Estados Finitos (Finite State Machine - FSM)',
        wrongs: [
          'Um único if/else aninhado com 500 linhas desordenadas',
          'Um gerador de números aleatórios sem lógica',
          'Desligar a física do jogo',
        ],
      },
      en: {
        scenario: '👾 **Enemy AI Behavior!**\nWhich architectural pattern is industry-standard for cleanly managing enemy states like Patrol, Chase, and Attack?',
        correct: 'Finite State Machine (FSM)',
        wrongs: [
          'A 500-line chaotic nested if/else block',
          'A random number generator with zero behavioral logic',
          'Disabling the game physics engine',
        ],
      },
    },
  ],

  psicologo: [
    {
      level: 1,
      pt: {
        scenario: '🛋️ **Primeira Sessão de Acolhimento!**\nO paciente chega à consulta demonstrando nervosismo e receio de ser julgado. Qual a postura inicial fundamental?',
        correct: 'Escuta ativa e empática, criando um ambiente seguro e sem julgamentos',
        wrongs: [
          'Criticar as decisões pessoais do paciente imediatamente',
          'Interromper a fala a cada 10 segundos para dar sermões',
          'Ficar olhando o relógio com cara de tédio',
        ],
      },
      en: {
        scenario: '🛋️ **Intake Therapy Session!**\nA client arrives visibly anxious and fearful of being judged. What is the foundational psychological posture?',
        correct: 'Active empathetic listening in a safe, non-judgmental holding space',
        wrongs: [
          'Immediately criticize the client’s lifestyle choices',
          'Interrupt every 10 seconds to lecture them',
          'Constantly check your wristwatch with bored expressions',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🌬️ **Manejo de Crise de Ansiedade!**\nO paciente relata hiperventilação e aceleração cardíaca súbita no consultório. Qual intervenção somática auxilia na regulação?',
        correct: 'Guiar respiração diafragmática pausada (técnica 4-7-8) e ancoragem sensorial',
        wrongs: [
          'Mandar o paciente correr escadas acima para desabafar',
          'Oferecer três copos de café expresso puro',
          'Dizer para ele prender a respiração por 3 minutos',
        ],
      },
      en: {
        scenario: '🌬️ **Panic De-escalation Technique!**\nA patient exhibits hyperventilation and acute somatic anxiety during consultation. Which technique assists rapid nervous regulation?',
        correct: 'Guide slow diaphragmatic breathing (4-7-8 method) and 5-4-3-2-1 sensory grounding',
        wrongs: [
          'Urge the patient to sprint up flights of stairs',
          'Serve three cups of concentrated caffeinated espresso',
          'Instruct them to hold their breath for 3 minutes',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🔒 **Sigilo Profissional e Ética!**\nUm familiar do paciente liga solicitando informações confidenciais sobre o que foi dito na terapia. Como agir eticamente?',
        correct: 'Explicar com respeito que o sigilo profissional é protegido por lei e pelo código de ética',
        wrongs: [
          'Ler todas as anotações do prontuário em voz alta',
          'Cobrar uma taxa extra para revelar os segredos',
          'Encaminhar o áudio gravado da sessão por mensagem',
        ],
      },
      en: {
        scenario: '🔒 **Professional Confidentiality & Ethics!**\nA patient’s relative calls demanding details about topics discussed in therapy sessions. What is the ethical response?',
        correct: 'Politely explain that confidentiality is legally protected by the code of ethics and cannot be breached',
        wrongs: [
          'Read all clinical notes aloud over the phone',
          'Charge a cash fee to disclose therapy details',
          'Forward audio recordings of the session via text message',
        ],
      },
    },
  ],

  telemarketing: [
    {
      level: 1,
      pt: {
        scenario: '📞 **Atendimento Inicial com Cordialidade!**\nAo atender uma chamada receptiva de um cliente na fila, qual a saudação profissional padrão?',
        correct: 'Cumprimentar educadamente, identificar a empresa e seu nome, e perguntar como pode ajudar',
        wrongs: [
          'Ficar em silêncio absoluto esperando o cliente falar primeiro',
          'Dizer "fala rápido que estou com pressa"',
          'Transferir a ligação para o ramal errado imediatamente',
        ],
      },
      en: {
        scenario: '📞 **Inbound Greeting Standards!**\nWhen answering an inbound customer queue call, what is the standard professional opening?',
        correct: 'Warm greeting, state your company and name, and ask how you may assist them',
        wrongs: [
          'Remain completely silent waiting for the caller to speak first',
          'Say "make it fast, I have no time"',
          'Blindly transfer the customer to a random dead line',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🛡️ **Cliente Exaltado no SAC!**\nO cliente liga indignado devido a um atraso em uma entrega. Qual a técnica recomendada de desescalada?',
        correct: 'Ouvir atentamente sem interromper, acolher a queixa com empatia e focar na solução imediata',
        wrongs: [
          'Gritar de volta no mesmo tom para mostrar autoridade',
          'Desligar o telefone na cara do cliente de propósito',
          'Dizer com deboche que a culpa foi exclusivamente dele',
        ],
      },
      en: {
        scenario: '🛡️ **De-escalating Angry Customers!**\nA customer calls furious about an urgent delivery delay. What is the proven de-escalation protocol?',
        correct: 'Listen without interruption, validate their frustration with empathy, and focus on immediate resolution',
        wrongs: [
          'Yell back aggressively to assert authority',
          'Hang up the phone call deliberately in their face',
          'Sarcastically tell them the problem is 100% their own fault',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '📊 **Tabulação e Histórico de Protocolo!**\nApós finalizar a ligação e combinar um reenvio com o cliente, qual procedimento no CRM é essencial?',
        correct: 'Registrar o protocolo detalhado no chamado e classificar o motivo correto da tabulação',
        wrongs: [
          'Fechar o sistema sem salvar nenhuma informação',
          'Apagar o cadastro do cliente para zerar o ticket',
          'Anotar um bilhete em guardanapo de papel e jogar fora',
        ],
      },
      en: {
        scenario: '📊 **CRM Ticket Documentation!**\nAfter wrapping up the call and scheduling a product replacement, which CRM step is critical?',
        correct: 'Record comprehensive ticket notes and tag the accurate contact disposition code',
        wrongs: [
          'Force close the browser without saving changes',
          'Delete the client profile from the company database',
          'Write a note on a paper napkin and discard it',
        ],
      },
    },
  ],

  animador_festa: [
    {
      level: 1,
      pt: {
        scenario: '🎈 **Quebrando o Gelo no Aniversário!**\nAs crianças acabaram de chegar ao salão e muitas estão tímidas nos cantos. Qual a brincadeira ideal para integrar a turma?',
        correct: 'Uma dinâmica musical simples e divertida como Dança das Cadeiras ou Estátua',
        wrongs: [
          'Fazer uma prova de matemática avançada com nota',
          'Mandar todas as crianças ficarem em silêncio sentadas',
          'Apagar as luzes e fingir ser um monstro assustador',
        ],
      },
      en: {
        scenario: '🎈 **Party Icebreaker Games!**\nChildren have just arrived at the venue and many are shy and clinging to parents. What is the best icebreaker game?',
        correct: 'An upbeat musical group game like Musical Statues or Freeze Dance',
        wrongs: [
          'Hand out advanced math tests for grading',
          'Command all children to sit in complete silent isolation',
          'Turn off all lights and pretend to be a terrifying monster',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🎨 **Pintura Facial e Higiene!**\nVocê está fazendo maquiagem artística de borboletas e super-heróis nas crianças. Qual cuidado sanitário é obrigatório?',
        correct: 'Usar tintas atóxicas dermatologicamente testadas e higienizar esponjas e pincéis',
        wrongs: [
          'Usar tinta guache de parede não regulamentada',
          'Usar caneta permanente que não sai com água',
          'Passar graxa de sapato nas bochechas',
        ],
      },
      en: {
        scenario: '🎨 **Face Painting Safety!**\nYou are painting superhero and butterfly art on kids’ faces. What hygiene rule is strictly mandatory?',
        correct: 'Use non-toxic dermatologically approved face paints and sanitize brushes between children',
        wrongs: [
          'Use industrial wall paints that lack cosmetics approval',
          'Use permanent markers that cannot wash off skin',
          'Apply dark shoe polish onto cheeks',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🎂 **O Momento Mágico do Parabéns!**\nChegou a hora principal de cantar os Parabéns ao redor do bolo. Como o animador deve reger o momento?',
        correct: 'Reunir toda a família e convidados, animar o coro com palmas e celebrar o aniversariante com entusiasmo',
        wrongs: [
          'Comer o primeiro pedaço do bolo antes do aniversariante',
          'Soprar as velinhas no lugar do aniversariante',
          'Iniciar uma discussão sobre o sabor do recheio',
        ],
      },
      en: {
        scenario: '🎂 **Conducting the Birthday Song!**\nIt is time for the main event: singing Happy Birthday around the cake. How should the entertainer lead the crowd?',
        correct: 'Gather family and guests around, lead synchronized clapping, and spotlight the birthday child joyfully',
        wrongs: [
          'Snatch and eat the first slice of cake before the child',
          'Blow out all birthday candles before the child gets a chance',
          'Start an argument with the caterer over cake flavors',
        ],
      },
    },
  ],

  advogada: [
    {
      level: 1,
      pt: {
        scenario: '⚖️ **Contagem de Prazos Processuais!**\nVocê recebeu uma intimação publicada na sexta-feira no Diário de Justiça Eletrônico (DJe). Como deve ser contagem do prazo no CPC?',
        correct: 'Considera-se publicado no primeiro dia útil seguinte e o prazo inicia no próximo dia útil subsequente',
        wrongs: [
          'O prazo começa a correr imediatamente no sábado às 00:00',
          'Conta-se corridamente incluindo sábados e domingos sem interrupção',
          'Ignora-se o Diário de Justiça e espera-se carta com aviso de recebimento',
        ],
      },
      en: {
        scenario: '⚖️ **Statutory Deadline Calculation!**\nA court electronic notice was published on Friday. Under procedural law, how do you compute the filing deadline?',
        correct: 'Deem published on next business day, with limitation countdown starting the day after',
        wrongs: [
          'Start counting continuously over the weekend from midnight Saturday',
          'Ignore court electronic notice until physical postal mail arrives',
          'File immediately without checking working day computation rules',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🏛️ **Audiência de Instrução e Julgamento!**\nDurante a oitiva de uma testemunha chave, a parte contrária faz uma pergunta capciosa e indutiva. Qual a atitude do(a) advogado(a)?',
        correct: 'Pela ordem, formular imediata impugnação requerendo que o magistrado indefira a pergunta',
        wrongs: [
          'Interromper a testemunha com gritos desproporcionais e bater na mesa',
          'Aguardar o julgamento da apelação sem registrar protesto em ata',
          'Sair da sala de audiência em sinal de protesto sem autorização',
        ],
      },
      en: {
        scenario: '🏛️ **Witness Examination Objection!**\nDuring direct examination in court, opposing counsel asks an improper leading question. What is your legal action?',
        correct: 'Raise an immediate objection for the record and request the judge strike or disallow the question',
        wrongs: [
          'Scream loudly at the witness and bang on the counsel table',
          'Say nothing and hope to bring it up in the appeals court without objection',
          'Storm out of the courtroom abruptly without judicial permission',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '📜 **Tutela de Urgência em Saúde!**\nUm cliente grave necessita de medicamento de alto custo não fornecido pelo plano. Qual medida jurídica emergencial deve ser impetrada?',
        correct: 'Ação com pedido de Tutela de Urgência Cautelar ou Antecipada demonstrando fumus boni iuris e periculum in mora',
        wrongs: [
          'Esperar o trânsito em julgado de uma ação ordinária de cobrança',
          'Encaminhar um e-mail informal de reclamação para o SAC do hospital',
          'Protocolar um recurso administrativo sem efeitos suspensivos na ANS',
        ],
      },
      en: {
        scenario: '📜 **Emergency Injunction for Healthcare!**\nA critical patient requires vital medical coverage denied by their insurer. What expedited relief must you seek?',
        correct: 'File an emergency preliminary injunction showing prima facie entitlement and imminent peril of harm',
        wrongs: [
          'Wait for a final unappealable declaratory judgment after standard trial',
          'Send an informal email complaint to the hospital reception desk',
          'Lodge a non-binding administrative memo with no stay order',
        ],
      },
    },
  ],

  alquimista: [
    {
      level: 1,
      pt: {
        scenario: '⚗️ **Destilação de Éter Volátil!**\nDurante a destilação de uma infusão de pétalas estelares, a temperatura no alambique subiu abruptamente. O que fazer?',
        correct: 'Reduzir a chama do atanor e ajustar o resfriamento por água na serpentina',
        wrongs: [
          'Tapar hermeticamente o topo da retorta sob pressão máxima',
          'Jogar enxofre em pó diretamente dentro da caldeira fervente',
          'Agitar o balão de vidro com as mãos desprotegidas',
        ],
      },
      en: {
        scenario: '⚗️ **Volatile Aether Distillation!**\nDuring the distillation of celestial petals, temperature in the alembic rises drastically. What is the immediate action?',
        correct: 'Reduce the athanor flame and increase condensing water flow through the coil',
        wrongs: [
          'Hermetically seal the retort neck under peak vapor pressure',
          'Toss raw powdered brimstone straight into the boiling chamber',
          'Vigorously shake the fragile glass flask with bare hands',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🧪 **Estabilização de Elixir Hermético!**\nO elixir de vitalidade começou a coagular prematuramente antes da adição da tintura dourada. Qual reagente neutraliza o precipitado?',
        correct: 'Adicionar gotas de menstruo destilado de orvalho matinal em banho-maria brando',
        wrongs: [
          'Aquecer com fogo grego até a solução evaporar por completo',
          'Misturar pó de chumbo oxidado para forçar a sedimentação',
          'Despejar vinagre comercial impuro para quebrar o frasco',
        ],
      },
      en: {
        scenario: '🧪 **Hermetic Elixir Stabilization!**\nThe elixir of vitality begins coagulating prematurely before adding the gold tincture. Which reagent stabilizes the precipitate?',
        correct: 'Incorporate drops of distilled morning dew menstruum in a gentle water bath',
        wrongs: [
          'Ignite with Greek fire until all sacred solvent evaporates',
          'Mix oxidized raw lead dust to force toxic sludge settling',
          'Pour unpurified vinegar to shatter the alchemical flask',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '✨ **Transmutação Elemental Metálica!**\nVocê está purificando mercúrio hermético para convertê-lo em prata solar. Qual a ordem correta das cores na grande obra?',
        correct: 'Nigredo (decomposição negra), Albedo (purificação branca) e Citrinitas (maturação amarela)',
        wrongs: [
          'Começar pelo Rubedo vermelho e terminar em cinzas escuras sem queima',
          'Ferver tudo sem separação até que os metais derretam a bigorna',
          'Pular a fase de albedo e despejar óleo fervente em cadinho de barro',
        ],
      },
      en: {
        scenario: '✨ **Elemental Metal Transmutation!**\nYou are purifying hermetic quicksilver to transmute into solar silver. What is the correct sequence of stages in the Great Work?',
        correct: 'Nigredo (black decay), Albedo (white cleansing), and Citrinitas (yellow ripening)',
        wrongs: [
          'Start immediately with red Rubedo and reduce all to dark ash',
          'Boil blindly without separation until molten ore melts the bench',
          'Skip the albedo stage and dump scalding pitch onto earthen clay',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '💎 **A Pedra Filosofal & Opus Magnum!**\nNa fase final do Rubedo, a quintessência atinge o clímax no atanor sagrado. Qual o passo decisivo para selar a Pedra Filosofal?',
        correct: 'Fixar o espírito mercurial com o ouroboros hermético na proporção áurea de calor constante',
        wrongs: [
          'Quebrar o frasco hermético com um martelo antes da coagulação',
          'Apagar o fogo com água salgada gelada e descartar os cristais',
          'Expor a matéria vermelha diretamente ao ar poluído das forjas comuns',
        ],
      },
      en: {
        scenario: '💎 **The Philosopher\'s Stone & Opus Magnum!**\nIn the final Rubedo stage, quintessence reaches climax in the athanor. What is the decisive step to crystallize the Philosopher\'s Stone?',
        correct: 'Fix the volatile mercurial spirit using hermetic ouroboros under constant golden-ratio heat',
        wrongs: [
          'Shatter the sealed vessel with a hammer before crystallization',
          'Douse sacred flame with iced salt water and discard the rubies',
          'Expose divine red stone directly to corrosive mundane furnace soot',
        ],
      },
    },
  ],

  mago: [
    {
      level: 1,
      pt: {
        scenario: '🔮 **Canalização de Mana Inicial!**\nAo entoar o primeiro cântico no círculo rúnico, seu fluxo de mana oscila descontrolado. Como manter o foco estável?',
        correct: 'Aterrar a mana através do cajado e regular a respiração rítmica com a runa central',
        wrongs: [
          'Liberar todo o reservatório de mana de uma só vez sem foco',
          'Romper a linha de sal e giz do círculo protetor com os pés',
          'Olhar diretamente para o vórtice arcano sem fechar os filtros',
        ],
      },
      en: {
        scenario: '🔮 **Initial Mana Channeling!**\nWhile chanting the first ritual verse within the runic circle, your mana stream wavers wildly. How do you stabilize focus?',
        correct: 'Ground stray mana through your staff and synchronize rhythmic breathing with the central rune',
        wrongs: [
          'Release your entire arcane reservoir all at once with zero anchor',
          'Kick away the chalk boundary and step outside the warding ring',
          'Stare directly into the astral vortex without psychic shielding',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '⚡ **Invocação dos Quatro Elementos!**\nUm elemental de fogo instável ameaça consumir o santuário durante o ritual. Qual feitiço de abjuração neutraliza as labaredas sem criar explosão de vapor?',
        correct: 'Conjurar um vácuo de ar supressor combinado com barreira de gelo perene',
        wrongs: [
          'Lançar uma rajada de vento forte para espalhar as fagulhas',
          'Alimentar o fogo com pergaminhos arcanos e madeira seca',
          'Inundar o salão com petróleo destilado sob alta pressão',
        ],
      },
      en: {
        scenario: '⚡ **Elemental Evocation Crisis!**\nAn erratic fire elemental threatens to incinerate the sanctuary. Which abjuration ward suppresses the inferno without steam blast?',
        correct: 'Weave an air-suppressing vacuum sphere laced with an enduring permafrost barrier',
        wrongs: [
          'Cast a hurricane gale that scatters white-hot embers everywhere',
          'Feed the flames with arcane scrolls and flammable dry spruce',
          'Flood the sanctum with highly pressurized distilled lamp oil',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🌌 **Fissura do Vazio Cósmico!**\nUm portal para o éter sideral abriu uma fenda no espaço-tempo. Como conter a atração gravitacional sem ser sugado?',
        correct: 'Ancorar sigilos de geometria sagrada nos quatro cantos e tecer um feitiço de estase temporal',
        wrongs: [
          'Pular de cabeça dentro da fenda para tentar fechar por dentro',
          'Tentar tapar o buraco negro dimensional com uma pedra comum',
          'Canalizar magia de ilusão para fingir que a fenda não existe',
        ],
      },
      en: {
        scenario: '🌌 **Cosmic Void Rift!**\nA portal to deep astral ether tears open local space-time. How do you contain its gravitational singularity without getting pulled in?',
        correct: 'Anchor sacred geometry sigils at four corners and weave a targeted chronomantic stasis field',
        wrongs: [
          'Leap headfirst into the singularity to push it shut from inside',
          'Stuff a mundane granite boulder into the micro black hole',
          'Cast minor illusion glamour pretending the tear does not exist',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '🌟 **Arquimagia Suprema & Domínio do Éter!**\nPara conjurar a Supernova Arcana sem esgotar a própria alma, qual técnica milenar os arquimagos empregam?',
        correct: 'Sintonizar a centelha da alma com o fluxo cósmico das constelações primordiais como bateria externa',
        wrongs: [
          'Consumir a própria força vital até a parada cardiorrespiratória',
          'Assinar um pacto cego com qualquer entidade astral desconhecida',
          'Romper todos os canais de mana do corpo de forma irreversível',
        ],
      },
      en: {
        scenario: '🌟 **Supreme Archmagic & Aether Mastery!**\nTo cast an Arcane Supernova without draining your mortal soul, what ancient technique must a supreme archmage employ?',
        correct: 'Harmonize your soul spark with celestial constellation currents to act as an external mana reservoir',
        wrongs: [
          'Burn your own vital life essence straight into cardiac arrest',
          'Blindly sign away your eternal soul to unknown astral demons',
          'Shatter all internal mana meridians irreversibly for quick surge',
        ],
      },
    },
  ],

  ferreiro: [
    {
      level: 1,
      pt: {
        scenario: '⚒️ **Têmpera de Lâmina Medieval!**\nVocê está forjando uma espada de aço carbono da Alta Idade Média. No momento da têmpera, qual a cor ideal da lâmina ao sair da forja antes do banho de óleo?',
        correct: 'Vermelho-cereja brilhante (aprox. 800°C), garantindo dureza sem fragilidade',
        wrongs: [
          'Branco incandescente derretendo e soltando faíscas destrutivas',
          'Preto totalmente frio e sem aquecimento uniforme',
          'Amarelo brilhante prestes a virar poça de metal líquido',
        ],
      },
      en: {
        scenario: '⚒️ **Medieval Blade Quenching!**\nYou are crafting a high-carbon steel longsword in the High Middle Ages. What is the ideal incandescent glow before plunging into oil?',
        correct: 'Bright cherry red (around 800°C), ensuring maximum hardness without brittleness',
        wrongs: [
          'Incandescent blinding white sparking violently and burning the edge',
          'Completely black and cold with zero uniform thermal retention',
          'Blistering pale yellow on the verge of collapsing into molten slag',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🐉 **Forjando com Escamas de Dragão!**\nUm cavaleiro trouxe escamas de dragão vermelho para forjar um peitoral resistente a fogo. Qual o segredo para moldar matéria draconiana na bigorna?',
        correct: 'Aquecer a bigorna com brasa encantada e entrelaçar rebites de ferro frio sob martelada rítmica',
        wrongs: [
          'Bater com marreta enferrujada até esmagar as escamas em pó',
          'Jogar água gelada diretamente nas escamas quentes para quebrar a couraça',
          'Colar as escamas na armadura usando resina de pinheiro comum',
        ],
      },
      en: {
        scenario: '🐉 **Forging with Dragon Scales!**\nA champion brings red dragon scales to forge a fireproof breastplate. How do you shape draconian plates on the anvil without shattering them?',
        correct: 'Preheat anvil with enchanted embers and bind cold-forged iron rivets under synchronized hammering',
        wrongs: [
          'Smash blindly with a rusted sledgehammer until scales turn to powder',
          'Douse white-hot dragon scales with freezing well water to crack them',
          'Glue scales onto mundane armor plates using ordinary tree sap',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🌌 **Forja de Mythril & Aço Místico!**\nVocê foi incumbido de forjar uma lança rúnica inspirada na lendária Gungnir. O Mythril resiste ao fogo comum do carvão. O que usar para atingir o ponto de fusão?',
        correct: 'Acionar os foles duplos com carvão de carvalho sagrado e alimentar a chama com fagulhas de meteorito',
        wrongs: [
          'Soprar na brasa com a boca até ficar sem fôlego',
          'Misturar areia de praia comum para esfriar a forja',
          'Substituir o mythril por latão pintado de prateado',
        ],
      },
      en: {
        scenario: '🌌 **Mythril & Mystic Steel Forging!**\nYou are tasked with forging a runic spear inspired by legendary Gungnir. Mythril resists normal coal fires. How do you reach working temperature?',
        correct: 'Operate dual bellows stoked with sacred oak charcoal and feed embers with meteorite spark dust',
        wrongs: [
          'Blow lightly onto cold coals with your mouth until out of breath',
          'Throw coarse beach sand into the crucible to choke furnace heat',
          'Scam the customer by swapping mythril with cheap silver-painted brass',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '🗡️ **A Forja de Relíquias Mitológicas (Excalibur / Mjölnir)!**\nVocê está forjando uma relíquia divina inquebrável capaz de canalizar trovões e cortar pedras. Qual o ritual supremo de acabamento e têmpera?',
        correct: 'Dobrar o núcleo de aço mil vezes com runas arcanas e temperar em lágrimas celestes com bênção divina',
        wrongs: [
          'Polir com cera de chão comum e deixar secar no sereno',
          'Bater a lâmina com pedregulho até que o gume fique torto',
          'Deixar a espada esquecida na chuva para enferrujar propositalmente',
        ],
      },
      en: {
        scenario: '🗡️ **Forging Mythological Relics (Excalibur / Mjölnir)!**\nYou are forging an unbreakable divine artifact capable of splitting bedrock and channeling lightning. What is the ultimate finishing rite?',
        correct: 'Fold the steel core a thousand times etched with ancient runes and quench in blessed celestial water',
        wrongs: [
          'Buff with mundane shoe polish and leave exposed in the damp fog',
          'Pound the master blade with a river rock until edges warp crooked',
          'Leave the legendary blade out in the acid rain to intentionally rust',
        ],
      },
    },
  ],

  rei_rainha: [
    {
      level: 1,
      pt: {
        scenario: '🌾 **Crise de Seca & Gestão de Celeiros no Império Romano!**\nA colheita de trigo falhou em três províncias e a plebe protesta nas ruas de Roma. Qual decreto imperial resolve a crise sem falir o tesouro?',
        correct: 'Abrir os celeiros públicos da Anona imperial, tabelar o preço do pão e importar grãos do Egito',
        wrongs: [
          'Ordenar que a guarda imperial confisque os últimos grãos das famílias pobres',
          'Fugir da capital em segredo e passar as férias numa ilha isolada',
          'Aumentar os impostos sobre a farinha em 400% durante a fome',
        ],
      },
      en: {
        scenario: '🌾 **Drought & Granary Crisis in the Roman Empire!**\nWheat crops failed across three provinces and crowds gather in Roman streets. What imperial decree stabilizes the realm without bankrupting the treasury?',
        correct: 'Release reserve grain from the imperial Annona, cap bread prices, and fast-track shipments from Egypt',
        wrongs: [
          'Dispatch praetorian guards to seize the final crumbs from peasant homes',
          'Flee the imperial palace in secret to vacation on a secluded resort island',
          'Quadruple flour taxes by 400% while citizens starve in the forums',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '👑 **Diplomacia & Alianças Dinásticas no Império Persa e Bizâncio!**\nDois reinos vizinhos ameaçam formar uma coalizão hostil contra suas fronteiras. Como o soberano assegura a paz duradoura?',
        correct: 'Propor um tratado de comércio bilateral nas rotas de seda, selado com casamento dinástico e isenção alfandegária',
        wrongs: [
          'Executar os embaixadores estrangeiros e pendurar seus elmos nas muralhas',
          'Declarar guerra imediata a ambos os impérios sem convocar o exército',
          'Entregar metade das terras do seu próprio reino como suborno desesperado',
        ],
      },
      en: {
        scenario: '👑 **Diplomacy & Dynastic Treaties in Byzantine & Persian Realms!**\nTwo neighboring kingdoms threaten a hostile coalition on your borders. How does a wise sovereign secure enduring peace?',
        correct: 'Offer a bilateral Silk Road trade treaty cemented by dynastic marriage and mutual customs exemptions',
        wrongs: [
          'Execute the foreign envoys and hang their diplomatic banners in disgrace',
          'Declare immediate offensive two-front war without mobilizing soldiers',
          'Surrender half your homeland provinces unconditionally as frantic bribe',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🛡️ **Cerco Militar & Logística na Dinastia Han!**\nUma horda invasora montada cerca a fortaleza da fronteira e corta a linha de água potável. Qual a estratégia militar vitoriosa do monarca?',
        correct: 'Construir contra-trincheiras internas, cavar poços artesianos no pátio e lançar contra-ataque noturno de cavalaria leve',
        wrongs: [
          'Abrir os portões da fortaleza e render todo o exército sem lutar',
          'Beber a água envenenada do fosso externo para economizar tempo',
          'Ordenar que os arqueiros disparem todas as flechas contra o céu vazio',
        ],
      },
      en: {
        scenario: '🛡️ **Siege Warfare & Logistics under the Han Dynasty!**\nA nomadic steppe host besieges your border fortress, cutting off the aqueduct supply. What victorious strategy saves the garrison?',
        correct: 'Build inner defensive counter-trenches, sink courtyard artesian wells, and launch a night cavalry sally',
        wrongs: [
          'Swing open the citadel iron gates and surrender the army unconditionally',
          'Command troops to drink stagnant poisoned moat water to save time',
          'Order archers to waste their remaining quiver arrows firing blindly into the sky',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '🏛️ **A Idade de Ouro & Edito da Soberania Universal!**\nApós décadas de guerras, o império atinge a paz total. Qual medida consagra o seu reinado na história como um monarca lendário?',
        correct: 'Promulgar um código de leis justas, fundar bibliotecas imperiais, financiar artes e garantir previdência aos veteranos',
        wrongs: [
          'Construir estátuas de ouro maciço de si mesmo e proibir que o povo leia livros',
          'Dissolver todas as escolas e transformar as academias em prisões privadas',
          'Gastar todo o tesouro imperial em fogos de artifício em uma única noite',
        ],
      },
      en: {
        scenario: '🏛️ **The Golden Age & Decree of Universal Sovereignty!**\nFollowing decades of triumph, peace reigns across all borders. What imperial enactment enshrines your legacy as an immortal ruler?',
        correct: 'Codify equitable civil laws, establish grand academies, patronize arts, and guarantee veteran pensions',
        wrongs: [
          'Melt the state reserve into gigantic self-portraits and ban public literacy',
          'Abolish scientific libraries and convert scholastic halls into dungeons',
          'Squander every single coin in the treasury on single-night fireworks display',
        ],
      },
    },
  ],

  domador_feras: [
    {
      level: 1,
      pt: {
        scenario: '🐺 **Pacificação de Lobos-cinzentos & Ursos Selvagens!**\nUma alcatéia de lobos-cinzentos cerca seu acampamento na floresta nevada. Qual a conduta etológica correta para evitar o ataque e iniciar a aproximação?',
        correct: 'Manter postura ereta sem encarar nos olhos, emitir sinais de calma com baixa energia e ofertar carne fresca à distância',
        wrongs: [
          'Sair correndo de costas aos gritos agitando os braços desordenadamente',
          'Pular em cima do lobo alfa e tentar morder o focinho dele',
          'Fingir de morto deitado no chão com bifes amarrados no pescoço',
        ],
      },
      en: {
        scenario: '🐺 **Calming Wild Gray Wolves & Grizzly Bears!**\nA pack of wild gray wolves corners your outpost in a snowy forest. What sound ethological conduct prevents attack and earns trust?',
        correct: 'Stand upright without aggressive direct eye lock, project calm grounding energy, and offer fresh meat at distance',
        wrongs: [
          'Turn your back, scream frantically, and run flailing into the dark trees',
          'Pounce onto the alpha wolf and attempt to bite its snout in dominance',
          'Lie flat on the snow pretending to be dead with raw steaks tied to your collar',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🌊 **Domando o Kelpie Céltico & Criaturas Marinhas!**\nNas margens de um lago escocês enevoado, um corcel negro aquático (Kelpie) tenta seduzi-lo para montá-lo e afogá-lo. Como domá-lo segundo o mito céltico?',
        correct: 'Lançar um freio e cabeçada gravados com cruz e prata antes de subir, anulando a magia de metamorfose',
        wrongs: [
          'Montar no pelo molhado dele imediatamente e pedir para ele nadar no fundo',
          'Oferecer capim seco envenenado enquanto mergulha sem fôlego no lago',
          'Tentar puxar o rabo do cavalo d\'água com as duas mãos desprotegidas',
        ],
      },
      en: {
        scenario: '🌊 **Taming the Celtic Kelpie & Marine Beasts!**\nBy a foggy Scottish loch, a sleek water horse (Kelpie) lures travelers to mount its sticky back and drown. How do you tame it per Celtic lore?',
        correct: 'Cast a silver-inlaid bridle bearing protective marks over its head before mounting, mastering its shape-shifting curse',
        wrongs: [
          'Hop bareback onto its dripping flank and urge it to dive deep underwater',
          'Feed it rotten straw while holding your breath at the muddy bottom of the loch',
          'Grab the water demon horse by the tail with bare hands and try to drag it',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🔥 **Confronto com Feras Nórdicas & Gregas (Cérbero e Fenrir)!**\nVocê está diante do cão tricéfalo Cérbero guardando o portal infernal. Como passar por ele e acalmá-lo como os heróis mitológicos fizeram?',
        correct: 'Tocar música suave com lira mágica para adormecer as três cabeças e ofertar bolo de mel aromatizado',
        wrongs: [
          'Chutar as três cabeças ao mesmo tempo pulando com botas de ferro',
          'Gritar ordens em latim enquanto joga pedras nas mandíbulas em chamas',
          'Colocar uma coleira de gato com guizo no pescoço central de Cérbero',
        ],
      },
      en: {
        scenario: '🔥 **Greek & Norse Legend Taming (Cerberus & Fenrir)!**\nYou stand before three-headed hound Cerberus guarding the gate of Tartarus. How do you pacify all three heads as mythological heroes did?',
        correct: 'Play sweet lulling melodies on an enchanted lyre to put the heads to sleep, offering soporific honey cakes',
        wrongs: [
          'Try to kick all three snapping jaws simultaneously in heavy steel boots',
          'Scream Latin commands while chucking pebbles into the beast\'s flaming throats',
          'Fasten an ordinary kitten collar with a jingling bell around Cerberus\'s neck',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '🐉 **Vínculo Sagrado com Dragões Arcanos & Leviatã Primordial!**\nNo topo da montanha dos ventos, um colossal dragão ancião desperta. Como o mestre dos domadores sela o pacto eterno de companheirismo?',
        correct: 'Harmonizar os batimentos cardíacos com a pulsação draconiana através do olhar de respeito mútuo e troca de sopro',
        wrongs: [
          'Acertar o olho do dragão com uma flecha de brinquedo para chamar atenção',
          'Tentar puxar as asas gigantes do dragão com uma corda de varal comum',
          'Usar um spray de pimenta caseiro para irritar as ventas de fogo do dragão',
        ],
      },
      en: {
        scenario: '🐉 **Sacred Pact with Primordial Dragons & Sea Leviathans!**\nAtop the peak of storms, an ancient winged dragon awakens. How does a grand beastmaster forge an eternal bond of companionship?',
        correct: 'Harmonize your soul rhythm with the dragon\'s core pulse through shared breath and unflinching mutual sovereign respect',
        wrongs: [
          'Shoot the colossal wyrm in the eye with a toy suction cup arrow to get its attention',
          'Try to tie down the dragon\'s massive wings using an ordinary backyard clothesline',
          'Spray household pepper spray directly into the nostrils of an ancient fire breather',
        ],
      },
    },
  ],

  aniquilador_vegetais: [
    {
      level: 1,
      pt: {
        scenario: '🥦 **Anatomia Vegetal & O Ódio à Clorofila!**\nVocê está planejando sabotar uma horta inteira de brócolis e alfaces. Qual estrutura celular vegetal é responsável pela fotossíntese que você tanto detesta?',
        correct: 'Os cloroplastos ricos em clorofila, que captam luz solar nos tecidos foliares',
        wrongs: [
          'As mitocôndrias presentes nas células musculares animais',
          'O sangue venoso que circula pelas artérias dos tubérculos',
          'O cérebro pensante que planeja os ataques das folhas de alface',
        ],
      },
      en: {
        scenario: '🥦 **Plant Anatomy & The Deep Hatred of Chlorophyll!**\nYou plan to obliterate an entire plot of foul broccoli and lettuce. Which cellular organelle produces the photosynthesis you despise so much?',
        correct: 'Chloroplasts packed with green chlorophyll pigments capturing photons in leaf mesophyll',
        wrongs: [
          'Mitochondria found inside active animal muscle tissues',
          'The venous bloodstream flowing through tuber arteries',
          'The conscious thinking brain that schemes malicious lettuce plots',
        ],
      },
    },
    {
      level: 2,
      pt: {
        scenario: '🥔 **Solanáceas Tóxicas & Alcaloides Perigosos!**\nUm fazendeiro tentou esconder batatas no subsolo. Como o exterminador botânico identifica que um tubérculo criou a perigosa toxina solanina?',
        correct: 'Casca esverdeada pelo contato com a luz e brotação ativa rica em alcaloides tóxicos',
        wrongs: [
          'A batata começa a latir alto quando você se aproxima da despensa',
          'Ela fica transparente como água cristalina e derrete ao sol',
          'A batata ganha asas e sai voando pelo telhado da cozinha',
        ],
      },
      en: {
        scenario: '🥔 **Toxic Solanaceae & Deadly Alkaloids!**\nA peasant tried hoarding underground potatoes. How does a botanical destroyer confirm the tuber has concentrated dangerous solanine toxin?',
        correct: 'Greenish skin discoloration from light exposure paired with active sprout eyes high in glycoalkaloids',
        wrongs: [
          'The potato starts barking loudly whenever you approach the pantry',
          'It turns completely translucent like clear spring water and evaporates',
          'The raw potato sprouts feathered wings and flies away through the chimney',
        ],
      },
    },
    {
      level: 3,
      pt: {
        scenario: '🌾 **Xilema, Floema & Ceifa Implacável de Raízes!**\nPara erradicar um campo rebelde de cenouras e beterrabas de raiz pivotante profunda, qual tecido condutor vegetal deve ser cortado para interromper a seiva elaborada?',
        correct: 'O floema, que transporta açúcares e nutrientes fotossintéticos das folhas para a raiz',
        wrongs: [
          'O cordão umbilical que liga o legume à terra',
          'O nervo ciático que comanda os movimentos da couve-flor',
          'As escamas externas que protegem a cenoura de mordidas de tubarão',
        ],
      },
      en: {
        scenario: '🌾 **Xylem, Phloem & Relentless Root Decimation!**\nTo wipe out a deep taproot crop of stubborn carrots and beets, which vascular plant tissue must be severed to starve the roots of sugars?',
        correct: 'The phloem, which translocates photosynthesized sugars and nutrients downward from leaves',
        wrongs: [
          'The umbilical cord that attaches the turnip directly to planet core',
          'The sciatic nerve that governs voluntary cauliflower reflexes',
          'The dorsal shark scales protecting baby carrots from aquatic bites',
        ],
      },
    },
    {
      level: 4,
      pt: {
        scenario: '🔥 **O Golpe de Misericórdia nos Vegetais do Planeta!**\nVocê está prestes a purificar uma floresta de vegetais com sua prensa trituradora e dessecação total. O que torna a celulose e a lignina tão resistentes e como aniquilá-las?',
        correct: 'Polímeros estruturais de glicose e anéis aromáticos complexos, quebrados por hidrólise enzimática extrema e calor intenso',
        wrongs: [
          'Elas são feitas de aço inoxidável importado e só quebram com dinamite atômica',
          'Vegetais não têm celulose, são compostos puramente de gelatina e algodão',
          'Basta pedir com educação para os vegetais irem embora da galáxia',
        ],
      },
      en: {
        scenario: '🔥 **The Final Cleansing of Earth\'s Plant Kingdom!**\nYou are about to unleash total mechanical shredding and desiccation upon every leafy fiend. What makes cellulose and lignin tough, and how do you destroy them?',
        correct: 'Complex glucose polymers and cross-linked aromatic matrices, disintegrated by extreme thermochemical hydrolysis',
        wrongs: [
          'Vegetables are forged from hardened titanium and only explode under antimatter',
          'Plants contain zero cellulose and consist strictly of cotton candy fluff',
          'You just have to ask the vegetables politely to leave the solar system',
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
    const correctLetterPrefix = session.correctLetter ? `**[${session.correctLetter}]** ` : '';
    const desc = [
      t('workMinigame.wrongMistake', lang),
      '',
      t('workMinigame.correctAnswerLabel', lang),
      `> ${correctLetterPrefix}*${session.correctText}*`,
      '',
      t('workMinigame.nextShiftLabel', lang),
      t('workMinigame.noSalaryText', lang),
    ];

    if (result.demoted) {
      const newRoleTitle = getRoleTitle(session.professionKey, result.careerLevel, lang);
      desc.push(
        '',
        t('workMinigame.demotedTitle', lang),
        t('workMinigame.demotedDesc', lang, { role: newRoleTitle })
      );
    } else if (result.careerMistakes > 1) {
      desc.push(
        '',
        t('workMinigame.mistakeStatus', lang, { streak: result.careerMistakes })
      );
    }

    const errorEmbed = new EmbedBuilder()
      .setColor(PYXIE_COLORS.crimson || '#ef4444')
      .setTitle(t('workMinigame.wrongTitle', lang, { profession: session.professionLabel }))
      .setDescription(desc.join('\n'))
      .setFooter({ text: 'Pyxie' })
      .setTimestamp();

    return interaction.update({ embeds: [errorEmbed], components: [] });
  }

  const currentRoleTitle = getRoleTitle(session.professionKey, result.careerLevel, lang);
  const desc = [
    t('workMinigame.successDedication', lang),
    '',
    t('workMinigame.salaryHeader', lang),
    t('workMinigame.salaryLine', lang, { amount: formatCoins(result.amount, lang) }),
    t('workMinigame.balanceLine', lang, { balance: formatCoins(result.balance, lang) }),
    '',
    t('workMinigame.careerHeader', lang),
    t('workMinigame.roleLabel', lang, { role: currentRoleTitle }),
    t('workMinigame.workCountLine', lang, { count: getUserAccount(sessionUserId).workCount }),
  ];

  if (result.promoted) {
    desc.push(
      '',
      t('workMinigame.promotedTitle', lang),
      t('workMinigame.promotedDesc', lang, { role: currentRoleTitle })
    );
  } else if (result.careerStreak > 1) {
    desc.push(
      t('workMinigame.streakStatus', lang, { streak: result.careerStreak })
    );
  }

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

  const userLevel = Math.max(1, Math.min(4, Number(account.careerLevel) || 1));
  const roleTitle = getRoleTitle(professionKey, userLevel, lang);

  const generatedMinigames = loadGeneratedMinigames();
  const defaultList = PROFESSION_MINIGAMES[professionKey] || PROFESSION_MINIGAMES.programador;
  const generatedList = (generatedMinigames && generatedMinigames[professionKey]) || [];
  const minigames = [...defaultList, ...generatedList];

  const levelMinigames = filterMinigamesByLevel(minigames, userLevel);
  const chosenGame = levelMinigames[Math.floor(Math.random() * levelMinigames.length)];
  const gameData = chosenGame[lang] || chosenGame.en || chosenGame.pt;

  const wrongsPool = Array.isArray(gameData.wrongs) ? gameData.wrongs : [];
  const sampledWrongs = shuffleArray(wrongsPool).slice(0, 3);

  const allChoices = [
    { text: gameData.correct, correct: true },
    ...sampledWrongs.map((w) => ({ text: w, correct: false })),
  ];

  const shuffledChoices = shuffleArray(allChoices);
  const correctIndex = shuffledChoices.findIndex((c) => c.correct);

  const labelLetters = ['A', 'B', 'C', 'D'];
  const salary = calculateSalaryForLevel(userLevel);

  // Inicia o cooldown e registra o trabalho
  startWork(user.id, { profession: professionKey, salary, level: userLevel });

  activeWorkSessions.set(user.id, {
    correctIndex,
    correctLetter: labelLetters[correctIndex],
    correctText: gameData.correct,
    salary,
    professionKey,
    professionLabel,
    userLevel,
    roleTitle,
    lang,
    startedAt: Date.now(),
  });

  // Timeout automático da sessão
  setTimeout(() => {
    if (activeWorkSessions.has(user.id)) {
      activeWorkSessions.delete(user.id);
    }
  }, WORK_TIMEOUT_MS);

  const formattedOptions = shuffledChoices
    .map((choice, idx) => `**[${labelLetters[idx]}]** ${choice.text}`)
    .join('\n\n');

  const questionDesc = [
    t('workMinigame.roleLabel', lang, { role: roleTitle }),
    '',
    gameData.scenario,
    '',
    formattedOptions,
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
  shuffledChoices.forEach((choice, idx) => {
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`work_ans:${idx}:${user.id}`)
        .setLabel(`[${labelLetters[idx]}]`)
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
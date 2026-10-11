const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'src', 'data', 'generated_work_minigames.json');
const currentData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

// Cenários de alta fidelidade para as 6 profissões mágicas (Níveis 1 a 4)
const MAGIC_CAREERS = {
  alquimista: [
    // Nível 1: Alquimista Aprendiz
    {
      level: 1,
      scenario: '🧪 **O Ponto de Ebulição do Solvente!**\nNo laboratório, o alambique começou a superaquecer durante a purificação de orvalho lunar. Qual o procedimento correto?',
      correct: 'Reduzir a chama do atanor e aumentar o fluxo de resfriamento do condensador',
      wrongs: ['Jogar água fria diretamente no vidro de quartzo aquecido', 'Tampar a saída de vapor com rolha de chumbo', 'Adicionar enxofre em pó na mistura borbulhante'],
      pt: {
        scenario: '🧪 **O Ponto de Ebulição do Solvente!**\nNo laboratório, o alambique começou a superaquecer durante a purificação de orvalho lunar. Qual o procedimento correto?',
        correct: 'Reduzir a chama do atanor e aumentar o fluxo de resfriamento do condensador',
        wrongs: ['Jogar água fria diretamente no vidro de quartzo aquecido', 'Tampar a saída de vapor com rolha de chumbo', 'Adicionar enxofre em pó na mistura borbulhante'],
      },
      en: {
        scenario: '🧪 **Solvent Boiling Crisis!**\nIn the lab, the alembic starts overheating while purifying lunar dew. What is the correct procedure?',
        correct: 'Reduce the athanor flame and increase cooling flow in the condenser',
        wrongs: ['Pour cold water directly on heated quartz glass', 'Plug the vapor outlet with a lead stopper', 'Dump powdered sulfur into the bubbling broth'],
      },
    },
    {
      level: 1,
      scenario: '⚗️ **Precipitado Turvo na Tintura!**\nA tintura de mandrágora formou uma borra escura no fundo da proveta. Como decantar sem perder os princípios ativos?',
      correct: 'Filtrar por papel de celulose porosa sob pressão suave',
      wrongs: ['Agitar violentamente até dissolver à força', 'Ferver até secar completamente', 'Adicionar vinagre concentrado para corroer o sedimento'],
      pt: {
        scenario: '⚗️ **Precipitado Turvo na Tintura!**\nA tintura de mandrágora formou uma borra escura no fundo da proveta. Como decantar sem perder os princípios ativos?',
        correct: 'Filtrar por papel de celulose porosa sob pressão suave',
        wrongs: ['Agitar violentamente até dissolver à força', 'Ferver até secar completamente', 'Adicionar vinagre concentrado para corroer o sedimento'],
      },
      en: {
        scenario: '⚗️ **Cloudy Tincture Precipitate!**\nMandrake tincture formed dark sludge at the bottom of the flask. How to decant without losing actives?',
        correct: 'Filter through porous cellulose paper under gentle pressure',
        wrongs: ['Violently shake until dissolved by brute force', 'Boil until completely dry', 'Add concentrated vinegar to dissolve sediments'],
      },
    },
    // Nível 2: Manipulador de Poções & Éter
    {
      level: 2,
      scenario: '✨ **Estabilização de Éter Volátil!**\nO frasco de éter celeste está emitindo faíscas violetas e perdendo densidade. Qual reagente neutraliza a carga sem anular a magia?',
      correct: 'Adicionar cristais moídos de salitre lunar sob banho-maria',
      wrongs: ['Cobrir o frasco com manta de ferro magnetizado', 'Injetar ar comprimido na câmara hermética', 'Misturar álcool de cereais sem destilar'],
      pt: {
        scenario: '✨ **Estabilização de Éter Volátil!**\nO frasco de éter celeste está emitindo faíscas violetas e perdendo densidade. Qual reagente neutraliza a carga sem anular a magia?',
        correct: 'Adicionar cristais moídos de salitre lunar sob banho-maria',
        wrongs: ['Cobrir o frasco com manta de ferro magnetizado', 'Injetar ar comprimido na câmara hermética', 'Misturar álcool de cereais sem destilar'],
      },
      en: {
        scenario: '✨ **Volatile Aether Stabilization!**\nThe vial of celestial aether is sparking violet and losing density. Which reagent neutralizes the charge without voiding magic?',
        correct: 'Add powdered lunar saltpeter crystals in a water bath',
        wrongs: ['Wrap the flask in a magnetized iron blanket', 'Pump compressed air into the airtight chamber', 'Mix unrefined grain alcohol'],
      },
    },
    // Nível 3: Mestre da Transmutação Elemental
    {
      level: 3,
      scenario: '🔮 **O Estágio de Albedo do Opus Magnum!**\nA matéria primordial passou da putrefação (nigredo) mas a coloração branca recusa-se a cristalizar. Como fixar a pureza?',
      correct: 'Submeter o composto ao vapor de mercúrio filosófico a temperatura constante',
      wrongs: ['Aumentar o fogo ao máximo até oxidar', 'Expor a mistura aos raios solares diretos do meio-dia', 'Adicionar cinzas de carvalho impuras'],
      pt: {
        scenario: '🔮 **O Estágio de Albedo do Opus Magnum!**\nA matéria primordial passou da putrefação (nigredo) mas a coloração branca recusa-se a cristalizar. Como fixar a pureza?',
        correct: 'Submeter o composto ao vapor de mercúrio filosófico a temperatura constante',
        wrongs: ['Aumentar o fogo ao máximo até oxidar', 'Expor a mistura aos raios solares diretos do meio-dia', 'Adicionar cinzas de carvalho impuras'],
      },
      en: {
        scenario: '🔮 **The Albedo Stage of the Great Work!**\nThe prime matter passed putrefaction (nigredo) but the white hue refuses to crystallize. How to fix the purity?',
        correct: 'Subject the compound to philosophical mercury vapor at constant temperature',
        wrongs: ['Raise heat to maximum until it oxidizes', 'Expose the mixture to direct midday sun rays', 'Add impure oak ashes'],
      },
    },
    // Nível 4: Grão-Alquimista da Pedra Filosofal
    {
      level: 4,
      scenario: '🪐 **A Transmutação Final: Rubedo Solar!**\nNo ápice do selamento hermético, a pedra emite um brilho carmesim pulsante que ameaça romper o cadinho de diamante. O que fazer?',
      correct: 'Canalizar o excesso de radiação transmuta para ouro fino monoatômico',
      wrongs: ['Abrir o selo hermético do cadinho com tenaz', 'Resfriar o cadinho em nitrogênio líquido', 'Despejar ácido sulfúrico concentrado'],
      pt: {
        scenario: '🪐 **A Transmutação Final: Rubedo Solar!**\nNo ápice do selamento hermético, a pedra emite um brilho carmesim pulsante que ameaça romper o cadinho de diamante. O que fazer?',
        correct: 'Canalizar o excesso de radiação transmuta para ouro fino monoatômico',
        wrongs: ['Abrir o selo hermético do cadinho com tenaz', 'Resfriar o cadinho em nitrogênio líquido', 'Despejar ácido sulfúrico concentrado'],
      },
      en: {
        scenario: '🪐 **Final Transmutation: Solar Rubedo!**\nAt the peak of hermetic sealing, the stone pulses with crimson light threatening to crack the diamond crucible. What to do?',
        correct: 'Channel the excess transmutation radiation into monoatomic fine gold',
        wrongs: ['Pry open the hermetic seal with tongs', 'Quench the crucible in liquid nitrogen', 'Pour concentrated sulfuric acid on it'],
      },
    },
  ],

  mago: [
    // Nível 1: Mago Aprendiz de Rituais
    {
      level: 1,
      scenario: '📖 **Ruptura de Círculo de Proteção!**\nDurante a canalização de um feitiço de luz, o sal do círculo rúnico foi espalhado por uma rajada de vento. Como evitar invasão astral?',
      correct: 'Cravar a varinha no centro e projetar uma cúpula de mana pura',
      wrongs: ['Correr para fora do aposento gritando', 'Assoprar mais sal em todas as direções', 'Apagar as velas do ritual com água'],
      pt: {
        scenario: '📖 **Ruptura de Círculo de Proteção!**\nDurante a canalização de um feitiço de luz, o sal do círculo rúnico foi espalhado por uma rajada de vento. Como evitar invasão astral?',
        correct: 'Cravar a varinha no centro e projetar uma cúpula de mana pura',
        wrongs: ['Correr para fora do aposento gritando', 'Assoprar mais sal em todas as direções', 'Apagar as velas do ritual com água'],
      },
      en: {
        scenario: '📖 **Breached Protection Circle!**\nDuring a light channeling spell, a wind gust blew away salt from the runic circle. How to stop astral intrusion?',
        correct: 'Plant your wand at the center and project a pure mana dome',
        wrongs: ['Run out of the chamber screaming', 'Blow more salt randomly in all directions', 'Douse the ritual candles with water'],
      },
    },
    // Nível 2: Invocador Elemental
    {
      level: 2,
      scenario: '🔥 **Elemento Fogo Descontrolado!**\nO elemental de chamas invocado recusou o pacto e está incendiando as cortinas de veludo. Qual o contra-feitiço ideal?',
      correct: 'Conjurar um vácuo de ar abafando o oxigênio ao redor da entidade',
      wrongs: ['Atirar flechas de madeira', 'Conjurar óleo para saciar a sede de calor', 'Rezar para o elemental acalmar-se'],
      pt: {
        scenario: '🔥 **Elemento Fogo Descontrolado!**\nO elemental de chamas invocado recusou o pacto e está incendiando as cortinas de veludo. Qual o contra-feitiço ideal?',
        correct: 'Conjurar um vácuo de ar abafando o oxigênio ao redor da entidade',
        wrongs: ['Atirar flechas de madeira', 'Conjurar óleo para saciar a sede de calor', 'Rezar para o elemental acalmar-se'],
      },
      en: {
        scenario: '🔥 **Uncontrolled Fire Elemental!**\nThe summoned flame spirit refused the pact and is setting the velvet drapes ablaze. Which counterspell works best?',
        correct: 'Conjure an air vacuum suppressing oxygen around the entity',
        wrongs: ['Shoot wooden arrows at it', 'Pour oil to appease its thirst for heat', 'Pray for the elemental to calm down'],
      },
    },
    // Nível 3: Conjurador do Vazio Cósmico
    {
      level: 3,
      scenario: '🌌 **Fissura Dimensional Aberta!**\nUma fenda entre dimensões começou a sugar o ar e os pergaminhos da torre de magia. Como selar a fenda com segurança?',
      correct: 'Inverter os polos rúnicos do cajado e colapsar a matriz de sustentação',
      wrongs: ['Tapar a fenda com tapetes pesados', 'Atirar mais magia destrutiva na abertura', 'Acelerar o fluxo para ver o outro lado'],
      pt: {
        scenario: '🌌 **Fissura Dimensional Aberta!**\nUma fenda entre dimensões começou a sugar o ar e os pergaminhos da torre de magia. Como selar a fenda com segurança?',
        correct: 'Inverter os polos rúnicos do cajado e colapsar a matriz de sustentação',
        wrongs: ['Tapar a fenda com tapetes pesados', 'Atirar mais magia destrutiva na abertura', 'Acelerar o fluxo para ver o outro lado'],
      },
      en: {
        scenario: '🌌 **Open Dimensional Rift!**\nA planar tear began sucking air and scrolls into the void. How to safely seal the rift?',
        correct: 'Invert the runic polarity of the staff and collapse the stabilizing matrix',
        wrongs: ['Plug the tear with heavy carpets', 'Blast destructive spells into the opening', 'Accelerate flow to peek at the other side'],
      },
    },
    // Nível 4: Arquimago Supremo do Éter
    {
      level: 4,
      scenario: '⚡ **Sobrecarga de Mana Astral!**\nO nexo cósmico sob a cidadela entrou em ressonância destrutiva. O que o Arquimago deve executar para estabilizar as linhas de ley?',
      correct: 'Entrelaçar a própria aura com o núcleo e redistribuir o fluxo pelas constelações',
      wrongs: ['Cortar as linhas de ley com um machado comum', 'Fugir para outra dimensão abandonando a cidadela', 'Descarregar todo o poder contra o solo'],
      pt: {
        scenario: '⚡ **Sobrecarga de Mana Astral!**\nO nexo cósmico sob a cidadela entrou em ressonância destrutiva. O que o Arquimago deve executar para estabilizar as linhas de ley?',
        correct: 'Entrelaçar a própria aura com o núcleo e redistribuir o fluxo pelas constelações',
        wrongs: ['Cortar as linhas de ley com um machado comum', 'Fugir para outra dimensão abandonando a cidadela', 'Descarregar todo o poder contra o solo'],
      },
      en: {
        scenario: '⚡ **Astral Mana Overload!**\nThe cosmic nexus beneath the citadel entered destructive resonance. What must the Archmage perform to stabilize ley lines?',
        correct: 'Weave your aura into the core and redistribute flow across astral constellations',
        wrongs: ['Chop ley lines with a regular axe', 'Flee to another plane abandoning the citadel', 'Discharge all raw power into the ground'],
      },
    },
  ],

  ferreiro: [
    // Nível 1: Ferreiro Aprendiz de Forja
    {
      level: 1,
      scenario: '🔨 **Trinca Térmica no Desbaste!**\nA lâmina de ferro recém-aquecida começou a apresentar microfissuras após o martelamento. O que causou o problema?',
      correct: 'Temperatura de forja abaixo do ponto de rubro e martelamento excessivo no frio',
      wrongs: ['Usar carvão de qualidade excessiva', 'Bater na bigorna com força insuficiente', 'Resfriar a lâmina em óleo morno'],
      pt: {
        scenario: '🔨 **Trinca Térmica no Desbaste!**\nA lâmina de ferro recém-aquecida começou a apresentar microfissuras após o martelamento. O que causou o problema?',
        correct: 'Temperatura de forja abaixo do ponto de rubro e martelamento excessivo no frio',
        wrongs: ['Usar carvão de qualidade excessiva', 'Bater na bigorna com força insuficiente', 'Resfriar a lâmina em óleo morno'],
      },
      en: {
        scenario: '🔨 **Thermal Cracking During Forging!**\nA freshly heated iron blade showed microfractures after hammering. What caused the defect?',
        correct: 'Forging temperature dropped below cherry red with excessive cold hammering',
        wrongs: ['Using too high grade of charcoal', 'Hitting the anvil with insufficient power', 'Quenching the blade in lukewarm oil'],
      },
    },
    // Nível 2: Armeiro de Lâminas Medievais
    {
      level: 2,
      scenario: '⚔️ **Empenamento na Têmpera!**\nAo mergulhar a espada longa na tina de têmpera, a ponta curvou para o lado esquerdo. Como corrigir o alinhamento?',
      correct: 'Reaquecer ao calor de revenimento (cor palha) e alinhar com cunhas de bronze',
      wrongs: ['Bater a frio com marreta pesada até estalar', 'Entortar para o outro lado com as mãos', 'Mergulhar imediatamente em água gelada'],
      pt: {
        scenario: '⚔️ **Empenamento na Têmpera!**\nAo mergulhar a espada longa na tina de têmpera, a ponta curvou para o lado esquerdo. Como corrigir o alinhamento?',
        correct: 'Reaquecer ao calor de revenimento (cor palha) e alinhar com cunhas de bronze',
        wrongs: ['Bater a frio com marreta pesada até estalar', 'Entortar para o outro lado com as mãos', 'Mergulhar imediatamente em água gelada'],
      },
      en: {
        scenario: '⚔️ **Warping During Quench!**\nSubmerging the longsword into the quenching tank made the tip bend left. How to fix the alignment?',
        correct: 'Reheat to tempering color (straw yellow) and straighten with bronze wedges',
        wrongs: ['Cold hit with a sledgehammer until it snaps', 'Bend it opposite way with bare hands', 'Instantly quench in ice water'],
      },
    },
    // Nível 3: Artífice de Mythril & Aço Místico
    {
      level: 3,
      scenario: '🛡️ **Fusão de Lingote de Mythril!**\nO minério de mythril recusa-se a fundir na forja de carvão convencional. O que é necessário para atingir o ponto de fusão arcano?',
      correct: 'Injetar ar enriquecido com fole duplo e usar cadinho de grafite revestido de quartzo',
      wrongs: ['Misturar terra comum ao cadinho', 'Usar um maçarico culinário', 'Molhar o minério antes de queimar'],
      pt: {
        scenario: '🛡️ **Fusão de Lingote de Mythril!**\nO minério de mythril recusa-se a fundir na forja de carvão convencional. O que é necessário para atingir o ponto de fusão arcano?',
        correct: 'Injetar ar enriquecido com fole duplo e usar cadinho de grafite revestido de quartzo',
        wrongs: ['Misturar terra comum ao cadinho', 'Usar um maçarico culinário', 'Molhar o minério antes de queimar'],
      },
      en: {
        scenario: '🛡️ **Melting Mythril Ingot!**\nMythril ore refuses to melt in a standard charcoal forge. What is required to reach arcane melting point?',
        correct: 'Feed enriched air with double bellows and use quartz-lined graphite crucible',
        wrongs: ['Mix regular dirt into the crucible', 'Use a culinary butane torch', 'Soak the ore in water before firing'],
      },
    },
    // Nível 4: Mestre Forjador de Armas Mitológicas
    {
      level: 4,
      scenario: '🌟 **Encantamento de Aço Estelar com Runas de Dragão!**\nDurante a forja de uma relíquia divina, a lâmina rejeitou a gravação rúnica de fogo. Como harmonizar a liga com a runa?',
      correct: 'Banhar a lâmina em sangue de dragão no exato instante da última martelada mística',
      wrongs: ['Colar adesivo de fogo na lâmina', 'Pintar a runa com tinta a óleo comum', 'Esquentar até derreter todo o trabalho anterior'],
      pt: {
        scenario: '🌟 **Encantamento de Aço Estelar com Runas de Dragão!**\nDurante a forja de uma relíquia divina, a lâmina rejeitou a gravação rúnica de fogo. Como harmonizar a liga com a runa?',
        correct: 'Banhar a lâmina em sangue de dragão no exato instante da última martelada mística',
        wrongs: ['Colar adesivo de fogo na lâmina', 'Pintar a runa com tinta a óleo comum', 'Esquentar até derreter todo o trabalho anterior'],
      },
      en: {
        scenario: '🌟 **Star-Steel Forging with Dragon Runes!**\nForging a divine relic, the star-steel rejected fire rune engraving. How to harmonize the alloy with the rune?',
        correct: 'Quench the blade in dragon blood at the exact strike of the final mystic hammer blow',
        wrongs: ['Stick a flame sticker onto the blade', 'Paint runes with regular oil paint', 'Melt down all prior work'],
      },
    },
  ],

  rei_rainha: [
    // Nível 1: Herdeiro da Coroa & Regente
    {
      level: 1,
      scenario: '👑 **Crise de Seca nos Celeiros Reais!**\nAs províncias do sul relatam que a safra de trigo caiu pela metade. Os comerciantes querem triplicar os preços. Qual a decisão monárquica sábia?',
      correct: 'Abrir os celeiros reais de reserva estratégica e tabelar o preço máximo do pão',
      wrongs: ['Aumentar os impostos sobre a farinha para lucrar', 'Mandar prender todos os camponeses famintos', 'Ignorar os relatórios e organizar um banquete suntuoso'],
      pt: {
        scenario: '👑 **Crise de Seca nos Celeiros Reais!**\nAs províncias do sul relatam que a safra de trigo caiu pela metade. Os comerciantes querem triplicar os preços. Qual a decisão monárquica sábia?',
        correct: 'Abrir os celeiros reais de reserva estratégica e tabelar o preço máximo do pão',
        wrongs: ['Aumentar os impostos sobre a farinha para lucrar', 'Mandar prender todos os camponeses famintos', 'Ignorar os relatórios e organizar um banquete suntuoso'],
      },
      en: {
        scenario: '👑 **Drought Crisis in Royal Granaries!**\nSouthern provinces report wheat harvest dropped by half. Merchants want to triple bread prices. What is the wise royal decree?',
        correct: 'Open strategic royal granary reserves and cap maximum bread price',
        wrongs: ['Increase flour taxes to profit from scarcity', 'Arrest all hungry peasants', 'Ignore reports and host a lavish feast'],
      },
    },
    // Nível 2: Monarca da Paz & Colheitas
    {
      level: 2,
      scenario: '📜 **Disputa Territorial Entre Barões!**\nDois nobres influentes ameaçam deflagrar guerra civil por uma floresta rica em caça e madeira. Como mediar?',
      correct: 'Transformar a floresta em reserva real comum e dividir a renda madeireira entre os feudos',
      wrongs: ['Entregar o bosque ao nobre que tiver mais cavalos', 'Destruir a floresta com fogo para ninguém ficar com ela', 'Declarar guerra aos dois barões simultaneamente'],
      pt: {
        scenario: '📜 **Disputa Territorial Entre Barões!**\nDois nobres influentes ameaçam deflagrar guerra civil por uma floresta rica em caça e madeira. Como mediar?',
        correct: 'Transformar a floresta em reserva real comum e dividir a renda madeireira entre os feudos',
        wrongs: ['Entregar o bosque ao nobre que tiver mais cavalos', 'Destruir a floresta com fogo para ninguém ficar com ela', 'Declarar guerra aos dois barões simultaneamente'],
      },
      en: {
        scenario: '📜 **Border Dispute Between Barons!**\nTwo influential nobles threaten civil war over a timber-rich forest. How to mediate?',
        correct: 'Designate the forest as a royal commons and split timber revenues between both fiefs',
        wrongs: ['Grant the forest to whichever noble owns more horses', 'Burn down the forest so nobody gets it', 'Declare war on both barons at once'],
      },
    },
    // Nível 3: Rei/Rainha das Grandes Conquistas
    {
      level: 3,
      scenario: '🛡️ **Ultimato do Império Vizinho!**\nEmbaixadores rivais exigem tributo anual exorbitante sob ameaça de invasão na primavera. Qual a resposta geopolítica?',
      correct: 'Firmar aliança defensiva com reinos costeiros e fortificar passos de montanha',
      wrongs: ['Rendição incondicional imediata entregando a coroa', 'Executar os embaixadores quebrando leis diplomáticas', 'Pagar o dobro do valor exigido'],
      pt: {
        scenario: '🛡️ **Ultimato do Império Vizinho!**\nEmbaixadores rivais exigem tributo anual exorbitante sob ameaça de invasão na primavera. Qual a resposta geopolítica?',
        correct: 'Firmar aliança defensiva com reinos costeiros e fortificar passos de montanha',
        wrongs: ['Rendição incondicional imediata entregando a coroa', 'Executar os embaixadores quebrando leis diplomáticas', 'Pagar o dobro do valor exigido'],
      },
      en: {
        scenario: '🛡️ **Neighboring Empire Ultimatum!**\nRival envoys demand exorbitant tribute under threat of spring invasion. What is the geopolitical countermove?',
        correct: 'Forge a defensive alliance with coastal realms and fortify mountain passes',
        wrongs: ['Unconditionally surrender and hand over the crown', 'Execute ambassadors breaking diplomatic law', 'Pay double the demanded amount'],
      },
    },
    // Nível 4: Imperador Eterno dos Reinos
    {
      level: 4,
      scenario: '🏛️ **A Promulgação do Código Imperial Unificado!**\nDez nações conquistadas possuem moedas e leis conflitantes gerando atrito comercial. Como consolidar a paz duradoura?',
      correct: 'Instituir moeda padronizada com lastro em ouro e código de leis universais respeitando tradições locais',
      wrongs: ['Proibir todos os idiomas nativos sob pena de morte', 'Extorquir os povos conquistados até a exaustão', 'Fechar todas as fronteiras e proibir comércio'],
      pt: {
        scenario: '🏛️ **A Promulgação do Código Imperial Unificado!**\nDez nações conquistadas possuem moedas e leis conflitantes gerando atrito comercial. Como consolidar a paz duradoura?',
        correct: 'Instituir moeda padronizada com lastro em ouro e código de leis universais respeitando tradições locais',
        wrongs: ['Proibir todos os idiomas nativos sob pena de morte', 'Extorquir os povos conquistados até a exaustão', 'Fechar todas as fronteiras e proibir comércio'],
      },
      en: {
        scenario: '🏛️ **Enacting the Unified Imperial Code!**\nTen conquered realms have conflicting currencies and laws stalling trade. How to consolidate lasting peace?',
        correct: 'Institute a gold-backed unified currency and universal legal code respecting local customs',
        wrongs: ['Ban all native tongues under penalty of death', 'Extort conquered provinces to total exhaustion', 'Seal all borders and forbid commerce'],
      },
    },
  ],

  domador_feras: [
    // Nível 1: Rastreador de Criaturas Selvagens
    {
      level: 1,
      scenario: '🐾 **Identificação de Pegadas de Predador!**\nNo bosque, você encontra marcas de garras profundas em troncos a 3 metros de altura e pelos azulados. Que criatura é essa?',
      correct: 'Lobo Místico da Penumbra marcando território de caça',
      wrongs: ['Coelho silvestre filhote', 'Esquilo comedor de nozes', 'Ovelha desgarrada do pasto'],
      pt: {
        scenario: '🐾 **Identificação de Pegadas de Predador!**\nNo bosque, você encontra marcas de garras profundas em troncos a 3 metros de altura e pelos azulados. Que criatura é essa?',
        correct: 'Lobo Místico da Penumbra marcando território de caça',
        wrongs: ['Coelho silvestre filhote', 'Esquilo comedor de nozes', 'Ovelha desgarrada do pasto'],
      },
      en: {
        scenario: '🐾 **Wild Predator Tracking!**\nIn the woods, you spot deep claw marks 3 meters up tree trunks with bluish fur. What creature is this?',
        correct: 'Mystic Penumbra Wolf marking its hunting territory',
        wrongs: ['Infant woodland rabbit', 'Nut-eating chipmunk', 'Stray pasture sheep'],
      },
    },
    // Nível 2: Domador de Feras Míticas
    {
      level: 2,
      scenario: '🦅 **Aproximação de Grifo Ferido!**\nUm jovem grifo caiu em um desfiladeiro com a asa presa em galhos pontiagudos. Ele rosna e bate o bico agressivamente. Como abordá-lo?',
      correct: 'Abaixar os olhos, oferecer carne fresca sem movimentos bruscos e emitir assobio suave',
      wrongs: ['Gritar batendo panelas para assustá-lo', 'Pular nas costas dele com uma rede', 'Jogar pedras até ele cansar'],
      pt: {
        scenario: '🦅 **Aproximação de Grifo Ferido!**\nUm jovem grifo caiu em um desfiladeiro com a asa presa em galhos pontiagudos. Ele rosna e bate o bico agressivamente. Como abordá-lo?',
        correct: 'Abaixar os olhos, oferecer carne fresca sem movimentos bruscos e emitir assobio suave',
        wrongs: ['Gritar batendo panelas para assustá-lo', 'Pular nas costas dele com uma rede', 'Jogar pedras até ele cansar'],
      },
      en: {
        scenario: '🦅 **Approaching an Injured Gryphon!**\nA young gryphon crashed in a ravine with its wing entangled in thorns. It snaps its beak aggressively. How to approach?',
        correct: 'Lower your gaze, offer fresh meat without sudden moves, and emit a soft whistle',
        wrongs: ['Bang pots and yell to scare it', 'Jump onto its back with a net', 'Throw rocks until it gets tired'],
      },
    },
    // Nível 3: Guardião de Dragões & Bestas Antigas
    {
      level: 3,
      scenario: '🐉 **O Voo do Dragão Vermelho Jovem!**\nDurante o primeiro treino de montaria aérea, o dragão entrou em parafuso e recusa os comandos de rédea arcana. O que fazer?',
      correct: 'Sintonizar o batimento cardíaco com a fera através do arreio e estabilizar o leme caudal',
      wrongs: ['Pular da sela sem paraquedas', 'Dar socos na cabeça do dragão', 'Puxar as rédeas com tanta força a ponto de enforcá-lo'],
      pt: {
        scenario: '🐉 **O Voo do Dragão Vermelho Jovem!**\nDurante o primeiro treino de montaria aérea, o dragão entrou em parafuso e recusa os comandos de rédea arcana. O que fazer?',
        correct: 'Sintonizar o batimento cardíaco com a fera através do arreio e estabilizar o leme caudal',
        wrongs: ['Pular da sela sem paraquedas', 'Dar socos na cabeça do dragão', 'Puxar as rédeas com tanta força a ponto de enforcá-lo'],
      },
      en: {
        scenario: '🐉 **Young Red Dragon Flight Drill!**\nDuring aerial mount training, the dragon entered a tailspin ignoring reins. What to do?',
        correct: 'Sync your heartbeat with the beast through arcane harness and stabilize tail rudder',
        wrongs: ['Bail out of saddle with no parachute', 'Punch the dragon in the head', 'Pull reins so hard you choke it'],
      },
    },
    // Nível 4: Soberano Primordial das Feras Lendárias
    {
      level: 4,
      scenario: '🌌 **O Chamado do Beemote Titânico!**\nUma besta colossal milenar despertou sob a montanha e avança em fúria cega. Qual o comando mestre para apaziguá-la?',
      correct: 'Emanar o rugido primordial de soberania que harmoniza a mente da besta com a terra',
      wrongs: ['Atirar flechas comuns no couro impenetrável', 'Tentar alimentar a criatura com um saco de grãos', 'Construir uma cerca de madeira'],
      pt: {
        scenario: '🌌 **O Chamado do Beemote Titânico!**\nUma besta colossal milenar despertou sob a montanha e avança em fúria cega. Qual o comando mestre para apaziguá-la?',
        correct: 'Emanar o rugido primordial de soberania que harmoniza a mente da besta com a terra',
        wrongs: ['Atirar flechas comuns no couro impenetrável', 'Tentar alimentar a criatura com um saco de grãos', 'Construir uma cerca de madeira'],
      },
      en: {
        scenario: '🌌 **Call of the Titanic Behemoth!**\nAn ancient colossal beast awakened beneath the mountain in blind fury. What master command calms it?',
        correct: 'Emit the primordial sovereign roar harmonizing the beast mind with the earth',
        wrongs: ['Shoot regular wooden arrows at impervious hide', 'Try feeding it a sack of grain', 'Build a wooden fence'],
      },
    },
  ],

  aniquilador_vegetais: [
    // Nível 1: Desbravador Anti-Clorofila
    {
      level: 1,
      scenario: '🥦 **Emboscada de Brócolis Gigantes!**\nNo canteiro amaldiçoado, floretes mutantes de brócolis cuspidor de vapor verde cercaram o caminho. Qual a tática de erradicação?',
      correct: 'Cortar a base do talo lenhoso com facão serrilhado e queimar as folhas com tocha',
      wrongs: ['Tentar conversar diplomaticamente com o brócolis', 'Regar o brócolis com água mineral e adubo', 'Comer cru sem lavar'],
      pt: {
        scenario: '🥦 **Emboscada de Brócolis Gigantes!**\nNo canteiro amaldiçoado, floretes mutantes de brócolis cuspidor de vapor verde cercaram o caminho. Qual a tática de erradicação?',
        correct: 'Cortar a base do talo lenhoso com facão serrilhado e queimar as folhas com tocha',
        wrongs: ['Tentar conversar diplomaticamente com o brócolis', 'Regar o brócolis com água mineral e adubo', 'Comer cru sem lavar'],
      },
      en: {
        scenario: '🥦 **Giant Broccoli Ambush!**\nIn the cursed plot, mutant steam-spewing broccoli florets surround the trail. What is the eradication tactic?',
        correct: 'Sever woody stalk base with a serrated machete and scorch leaves with a torch',
        wrongs: ['Try diplomatic negotiations with the broccoli', 'Water the broccoli with mineral water and fertilizer', 'Eat it raw unwashed'],
      },
    },
    // Nível 2: Ceifador de Raízes & Tubérculos
    {
      level: 2,
      scenario: '🥔 **Invasão de Batatas Raivosas!**\nTubérculos venenosos subterrâneos estão cavando túneis e destruindo a despensa. Como erradicá-los pela raiz?',
      correct: 'Injetar salmoura concentrada nos túneis e triturar os bulbos com arado mecânico',
      wrongs: ['Enterrar mais batatas para fazer amizade', 'Cobrir com terra fofa para elas crescerem mais', 'Jogar água doce morna'],
      pt: {
        scenario: '🥔 **Invasão de Batatas Raivosas!**\nTubérculos venenosos subterrâneos estão cavando túneis e destruindo a despensa. Como erradicá-los pela raiz?',
        correct: 'Injetar salmoura concentrada nos túneis e triturar os bulbos com arado mecânico',
        wrongs: ['Enterrar mais batatas para fazer amizade', 'Cobrir com terra fofa para elas crescerem mais', 'Jogar água doce morna'],
      },
      en: {
        scenario: '🥔 **Raging Potato Infestation!**\nPoisonous underground tubers are burrowing tunnels under the pantry. How to eradicate them at the root?',
        correct: 'Pump concentrated brine into tunnels and pulverize bulbs with a mechanical plow',
        wrongs: ['Bury more potatoes to make friends', 'Cover with soft soil so they grow bigger', 'Pour lukewarm sweet water'],
      },
    },
    // Nível 3: Exterminador Botânico Implacável
    {
      level: 3,
      scenario: '🍆 **A Berinjela Carnívora de Tentáculos!**\nUma berinjela mutante colossal usou suas gavinhas roxas para capturar as ferramentas do depósito. Como derrotá-la?',
      correct: 'Neutralizar os vasos condutores de floema com herbicida cáustico e cortar o ápice floral',
      wrongs: ['Fazer uma salada gourmet no meio da luta', 'Deixar a berinjela comer o resto dos equipamentos', 'Polvilhar açúcar nos tentáculos'],
      pt: {
        scenario: '🍆 **A Berinjela Carnívora de Tentáculos!**\nUma berinjela mutante colossal usou suas gavinhas roxas para capturar as ferramentas do depósito. Como derrotá-la?',
        correct: 'Neutralizar os vasos condutores de floema com herbicida cáustico e cortar o ápice floral',
        wrongs: ['Fazer uma salada gourmet no meio da luta', 'Deixar a berinjela comer o resto dos equipamentos', 'Polvilhar açúcar nos tentáculos'],
      },
      en: {
        scenario: '🍆 **Tentacled Carnivorous Eggplant!**\nA colossal mutant eggplant grabbed depot tools with purple tendrils. How to take it down?',
        correct: 'Dissolve phloem vessels with caustic herbicide and cleave the floral apex',
        wrongs: ['Toss a gourmet salad in mid-battle', 'Let the eggplant eat the rest of the machinery', 'Dust sugar on the tendrils'],
      },
    },
    // Nível 4: Flagelo Supremo dos Reinos Vegetais
    {
      level: 4,
      scenario: '🌲 **O Coração da Floresta Descontrolada!**\nA Árvore Parasita Primordial está espalhando esporos de clorofila agressiva que petrificam construções em madeira podre. Qual o golpe final?',
      correct: 'Desencadear a Onda Anti-Clorofila Zero que seca a seiva primordial e pulveriza as raízes em cinzas',
      wrongs: ['Abraçar a árvore para absorver sua energia', 'Regar as raízes com adubo orgânico premium', 'Plantar mais sementes ao redor'],
      pt: {
        scenario: '🌲 **O Coração da Floresta Descontrolada!**\nA Árvore Parasita Primordial está espalhando esporos de clorofila agressiva que petrificam construções em madeira podre. Qual o golpe final?',
        correct: 'Desencadear a Onda Anti-Clorofila Zero que seca a seiva primordial e pulveriza as raízes em cinzas',
        wrongs: ['Abraçar a árvore para absorver sua energia', 'Regar as raízes com adubo orgânico premium', 'Plantar mais sementes ao redor'],
      },
      en: {
        scenario: '🌲 **Heart of the Unchecked Forest!**\nThe Primordial Parasite Tree spreads aggressive chlorophyll spores petrifying buildings. What is the ultimate strike?',
        correct: 'Unleash the Zero-Chlorophyll Wave desiccating primordial sap and crumbling roots into ash',
        wrongs: ['Hug the tree to absorb its energy', 'Water roots with premium organic fertilizer', 'Plant more seeds nearby'],
      },
    },
  ],
};

// Adiciona as 6 carreiras ao arquivo de cenários
for (const [prof, items] of Object.entries(MAGIC_CAREERS)) {
  if (!currentData[prof]) {
    currentData[prof] = [];
  }
  // Adiciona os cenários
  for (const item of items) {
    currentData[prof].push(item);
  }
}

fs.writeFileSync(FILE_PATH, JSON.stringify(currentData, null, 2), 'utf8');
console.log('✅ 6 profissões mágicas integradas com sucesso ao banco de minigames!');

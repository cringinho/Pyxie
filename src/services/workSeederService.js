const fs = require('fs');
const path = require('path');

// Tenta carregar variáveis de ambiente caso tenha dotenv instalado
try {
  require('dotenv').config();
} catch (_) {}

const API_KEY = process.env.GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DATA_FILE = path.join(__dirname, '../data/generated_work_minigames.json');

const TARGET_PER_PROFESSION = 100;
const PROFESSIONS = [
  'programador',
  'cozinheiro',
  'agricultor',
  'medico',
  'musico',
  'professor',
  'fotografo',
  'mecanico',
  'vendedor',
  'artista',
  'dublador',
  'desenvolvedor_jogos',
  'psicologo',
  'telemarketing',
  'animador_festa',
  'advogada',
  'alquimista',
  'mago',
  'ferreiro',
  'rei_rainha',
  'domador_feras',
  'aniquilador_vegetais',
];

// Matriz temática para garantir máxima variedade e zero repetição de situações
const PROFESSION_SUBTHEMES = {
  programador: [
    'Arquitetura de Microsserviços, Mensageria e Filas (Kafka/RabbitMQ)',
    'Otimização de Queries SQL, Índices Compostos e Lock de Transações',
    'Vazamentos de Memória, Profiling de Heap e Garbage Collector no Node.js/V8',
    'Concorrência, Race Conditions e Mutex em Ambientes Assíncronos',
    'Segurança de Aplicação Web, Injeção SQL, XSS, CSRF e Sanitização',
    'Containers, Kubernetes, Autoscaling e Orquestração de Clusters',
    'Frontend Moderno, Re-renders desnecessários e Otimização de Bundle/DOM',
    'Resiliência de Rede, Circuit Breaker, Retries com Exponential Backoff',
    'Estruturas de Dados Avançadas, Árvores Binárias e Complexidade Big-O',
    'CI/CD Pipelines, Rollbacks Automáticos e Tratamento de Falhas de Dependências',
  ],
  cozinheiro: [
    'Emulsões Complexas e Molhos Clássicos da Alta Gastronomia',
    'Fermentação Natural, Levain, Hidratação de Massas e Ponto de Glúten',
    'Cocção a Vácuo (Sous-Vide), Controle Térmico Rigoroso e Texturas',
    'Confeitaria de Precisão, Cristalização de Chocolate e Termodinâmica de Açúcares',
    'Gastronomia Molecular, Esferificação Reversa e Estabilizantes Naturais',
    'Segurança Alimentar Crítica, Controle de Temperatura e Cadeia de Frio',
    'Preparo, Limpeza e Ponto Térmico de Frutos do Mar e Pescados Nobres',
    'Reação de Maillard, Caramelização Controlada e Selagem Térmica',
    'Reduções de Caldos Concentrados, Glazes e Clarificação de Consommés',
    'Substituições Químicas de Ingredientes em Dietas Especiais sem Perda de Estrutura',
  ],
  agricultor: [
    'Manejo Integrado de Pragas (MIP) e Controle Biológico de Lagartas',
    'Correção Físico-Química de Solo, Calagem, Gessagem e Equilíbrio NPK',
    'Sistemas de Rotação de Culturas e Fixação Biológica de Nitrogênio',
    'Manejo Hídrico, Fertirrigação por Gotejamento e Drenagem de Solos Argilosos',
    'Técnicas de Plantio Direto na Palha, Curvas de Nível e Prevenção de Erosão',
    'Diagnóstico de Fitopatologias Fúngicas e Bacterianas em Lavouras de Alto Rendimento',
    'Poda Fisiológica de Produção e Enxertia em Fruticultura Comercial',
    'Armazenamento Hermético de Grãos, Aeração de Silos e Combate a Carunchos',
    'Agricultura de Precisão, Mapeamento por Satélite e Taxa Variável de Adubação',
    'Manejo de Estufas Hidropônicas, Condutividade Elétrica e pH da Solução Nutritiva',
  ],
  medico: [
    'Atendimento Inicial ao Politraumatizado e Protocolo de Via Aérea Difícil (ATLS)',
    'Suporte Avançado de Vida em Cardiologia (ACLS), Taquiarritmias e Desfibrilação',
    'Reconhecimento Precoce de Choque Séptico, Ressuscitação Volêmica e Vasopressores',
    'Farmacologia de Urgência, Interações Medicamentosas Graves e Ajuste de Clearance Renal',
    'Interpretação Rápida de Gasometria Arterial e Correção de Distúrbios Ácido-Base',
    'Manejo de Emergências Neurológicas, Escala NIHSS e Janela Trombolítica no AVC',
    'Emergências Pediátricas, Cálculo Ponderal de Doses e Manejo de Crise Convulsiva',
    'Insuficiência Respiratória Aguda, Parâmetros Ventilatórios e PEEP Protetora',
    'Distúrbios Hidroeletrolíticos Críticos (Hipo/Hipercalemia, Hipo/Hipernatremia)',
    'Protocolo de Síndrome Coronariana Aguda, Supradesnivelamento de ST e Terapia Antiplaquetária',
  ],
  musico: [
    'Harmonia Funcional Avançada, Acordes com Notas Alteradas e Empréstimo Modal',
    'Engenharia de Gravação, Padrões Polares de Microfones e Cancelamento de Fase',
    'Mixagem em Estúdio: Compressão Multibanda, EQ Cirúrgico e Roteamento de Efeitos',
    'Síntese Subtrativa e FM: Modulação de Envelopes ADSR, Filtros e LFO',
    'Condução de Vozes e Prevenção de Quintas e Oitavas Paralelas em Arranjos',
    'Acústica Arquitetônica de Estúdios, Modos de Sala e Tratamento de Graves',
    'Masterização Digital: Limiting True Peak, Medição de LUFS e Margem Dinâmica',
    'Rítmicas Complexas, Polirritmia 3:4 e Métricas Ímpares em Performance',
    'Técnicas Orquestrais: Transposição de Instrumentos e Equilíbrio Tímbrico',
    'Afinação Microtonal, Sistemas Just Intonation e Temperamento Igual',
  ],
  professor: [
    'Metodologias Ativas de Ensino e Aprendizagem Baseada em Problemas (PBL)',
    'Elaboração de Instrumentos de Avaliação Formativa e Critérios de Rubrica',
    'Neurociência Aplicada à Educação: Retenção, Atenção e Curva de Esquecimento',
    'Plano Educacional Individualizado (PEI) e Adaptações Curriculares Inclusivas',
    'Mediação de Conflitos em Sala de Aula e Comunicação Não-Violenta',
    'Aplicação da Taxonomia de Bloom na Estruturação de Metas Cognitivas',
    'Gamificação Educacional: Mecânicas de Recompensa sem Prejudicar a Motivação Intrínseca',
    'Integração Pedagógica de Ferramentas Digitais e Letramento Crítico de Mídia',
    'Mediação de Debates Conceituais Complexos e Estímulo ao Pensamento Crítico',
    'Gestão de Turmas Heterogêneas e Diferenciação Instrucional',
  ],
  fotografo: [
    'Triângulo de Exposição em Condições Críticas de Iluminação e Alta Relação de Contraste',
    'Aberração Cromática, Distorção de Lentes Asféricas e Difração em Pequenas Aberturas',
    'Gerenciamento de Cores: Perfis ICC, Espaço de Cor ProPhoto/AdobeRGB e Calibração',
    'Iluminação com Flashes: Lei do Inverso do Quadrado e Proporção entre Luz Principal e Preenchimento',
    'Modificadores de Luz Especializados: Beauty Dish, Snoot e Difusão Direcional com Grid',
    'Distância Hiperfocal e Cálculo de Círculo de Confusão em Paisagens',
    'Leitura Técnica de Histograma e Fotometria Pontual para Prevenção de Clipping',
    'Tratamento RAW: Correção de Curvas de Tom, Mascaramento Luminance e Color Grading',
    'Composição Visual: Linhas de Tensão, Perspectiva Aérea e Equilíbrio de Massas',
    'Uso de Filtros ND de Alta Densidade e Polarizadores Circulares sem Vinheta',
  ],
  mecanico: [
    'Diagnóstico de Injeção Eletrônica: Sinais de Sonda Lambda Pré e Pós Catalisador e Sensores MAF/MAP',
    'Sincronismo de Correia Dentada, Comando de Válvulas Variável (VVT) e Verificação de Ponto',
    'Transmissão Automática: Pressão de Linha, Falha de Solenoides e Contaminação de Fluido ATF',
    'Sistemas de Freios ABS/ESP: Diagnóstico de Falha em Sensores de Roda e Módulo Eletro-Hidráulico',
    'Sistema de Arrefecimento: Diagnóstico de Termostato Travado e Teste de Pressurização de Cabeçote',
    'Turbocompressores: Folga Axial em Rotor, Calibração de Atuador de Wastegate e Pressão de Boost',
    'Alinhamento e Geometria: Correção de Caster, Ângulo de Camber e Divergência em Curva',
    'Diagnóstico de Ignição e Injeção Primária/Secundária com Osciloscópio Automotivo',
    'Diferencial e Trem de Força: Medição de Folga de Dente (Backlash) e Pré-Carga de Rolamento',
    'Multiplexagem Elétrica: Diagnóstico de Queda de Linha em Redes de Comunicação CAN-Bus',
  ],
  vendedor: [
    'Metodologia SPIN Selling: Mapeamento de Implicações e Necessidades de Solução em Ciclos Longos',
    'Superação de Objeções Críticas de Preço com Ancoragem de ROI e TCO',
    'Qualificação de Oportunidades com Metodologias BANT e MEDDIC em Vendas Complexas',
    'Estratégias de Expansão de Contas (Upsell/Cross-sell) e Redução Proativa de Churn',
    'Gestão de Funil B2B e Identificação de Gargalos de Conversão entre Etapas',
    'Gatilhos Mentais Éticos de Escassez e Reciprocidade em Negociações com Comitê de Compras',
    'Pós-Venda Consultivo, Onboarding Eficiente e Garantia de Sucesso do Cliente (Customer Success)',
    'Negociação Estratégica Baseada em Interesses (Método de Harvard) vs Posições Rígidas',
    'Construção de Cadências de Prospecção Outbound Omnichannel e Cold Outreach Personalizado',
    'Alinhamento Operacional de SLA entre Marketing e Vendas para Conversão de MQLs em SQLs',
  ],
  artista: [
    'Harmonia Cromática Avançada, Relação de Temperatura de Cores e Valor Tonal em Pintura',
    'Perspectiva Cônica com Múltiplos Pontos de Fuga e Deformação Angular',
    'Anatomia Estrutural: Relações Ósseas, Tensão Muscular e Dinâmica de Gestos',
    'Composição Visual: Linhas de Força, Ritmo Visual e Distribuição de Peso em Tela',
    'Renderização de Iluminação: Luz Direta, Luz de Rebatimento, Sombra Própria e Oclusão Ambiente',
    'Arte Conceitual Digital: Pintura com Pincéis Texturizados e Mascaramento Não Destrutivo',
    'Design de Personagens: Silhueta Reconhecível, Linguagem de Formas e Apelo Visual',
    'Pintura de Ambientes e Cenários: Criação de Profundidade com Perspectiva Atmosférica',
    'Teoria da Gestalt Aplicada à Ilustração: Fechamento, Continuidade e Relação Figura-Fundo',
    'Técnicas Mistas Tradicionais: Integração de Aquarela, Tinta Nanquim e Meios Secos sem Rachaduras',
  ],
  dublador: [
    'Sincronia Labial (Lip Sync) e Adaptação de Frases em Versão Brasileira',
    'Técnicas de Microfonismo em Cabine, Controle de Pop e Efeito de Proximidade',
    'Voz Caricata e Modulação Tímbrica em Animação Infantil vs Live-Action',
    'Casting, Interpretação Dramática e Transição de Emoções em Takes Contínuos',
    'Saúde Vocal e Fonoaudiologia: Aquecimento, Desaquecimento e Prevenção de Fendas',
    'Dublagem de Jogos e Games: Localização sem Referência Visual Direta',
    'Locução Comercial e Institucional: Ritmo, Empatia e Dicção Precisa',
    'Redublagem de Clássicos, Remoção de Ruído de Fita e Equalização de Faixas',
    'Direção de Dublagem: Marcação de Pausas, Respirações e Reações Físicas',
    'Manutenção de Registro em Sessões Longas de Gritos e Batalhas em Animes',
  ],
  desenvolvedor_jogos: [
    'Arquitetura de Game Loop, Delta Time e Resolução de Deslocamento de Física',
    'Otimização de Draw Calls, Batching Estático/Dinâmico e GPU Instancing',
    'Inteligência Artificial de NPCs: Árvores de Comportamento (Behavior Trees) e NavMesh',
    'Detecção e Resolução de Colisão: Hitboxes AABB, SAT e Raycasting Contínuo',
    'Otimização de Shaders, Overdraw de Partículas e Profiling de Renderização',
    'Sistemas de Iluminação: Baked Lightmaps, Sondas de Luz e Cascaded Shadow Maps',
    'Arquitetura de Estado: Finite State Machines (FSM) para Personagens e Inimigos',
    'Sincronização Multiplayer: Client Prediction, Server Reconciliation e Lag Compensation',
    'Gerenciamento de Memória de Assets: Addressables, Texture Streaming e Garbage Collection',
    'Game Feel e Juice: Screenshake, Curvas de Animação e Interpolação de Câmera',
  ],
  psicologo: [
    'Manejo de Transferência e Contratransferência na Relação Terapêutica',
    'Intervenção em Crise e Avaliação de Risco: Protocolos de Suporte e Acolhimento',
    'Terapia Cognitivo-Comportamental: Reestruturação Cognitiva e Registro de Pensamentos Disfuncionais',
    'Psicanálise Clínica: Associação Livre, Interpretação de Sonhos e Análise de Resistências',
    'Elaboração de Laudos, Pareceres e Relatórios Psicológicos Conforme Resoluções do CFP',
    'Sigilo Profissional e Dilemas Éticos em Contextos Jurídicos e Multidisciplinares',
    'Abordagem Humanista e Fenomenológica: Escuta Empática e Aceitação Incondicional',
    'Manejo de Sintomas de Transtornos de Ansiedade e Pânico: Técnicas de Aterramento e Respiração',
    'Psicopatologia e Diagnóstico Diferencial Baseado no DSM-5-TR e CID-11',
    'Mediação de Conflitos em Terapia de Casal e Familiar Sistêmica',
  ],
  telemarketing: [
    'Manejo de Chamadas de Alta Tensão: Desescalada Verbal e Empatia Assertiva',
    'Gestão de Métricas Operacionais: Otimização de TMA sem Comprometer o FCR e NPS',
    'Técnicas de Retenção de Clientes e Apresentação de Contrapropostas Estratégicas',
    'Adequação às Normas Legais do SAC, Decretos de Teleatendimento e Código de Defesa do Consumidor',
    'Auditoria e Monitoria de Qualidade: Aderência a Scripts com Comunicação Humanizada',
    'Segurança da Informação e LGPD: Validação Rigorosa de Titularidade e Dados Sensíveis',
    'Gestão de Filas de Espera, Discadores Preditivos e Redução de Taxa de Abandono',
    'Contorno Rápido de Objeções em Vendas Ativas com Foco em Benefícios Tangíveis',
    'Registro e Tabulação Precisa de Protocolos em Sistemas CRM Multicanais',
    'Técnicas de Modulação Vocal, Dicção e Cordialidade Sob Pressão Contínua',
  ],
  animador_festa: [
    'Dinâmica de Grupo e Gestão de Energia: Ritmo da Festa do Início aos Parabéns',
    'Recreação Infantil Segura: Adaptação de Brincadeiras por Faixas Etárias Heterogêneas',
    'Técnicas de Escultura em Balões: Criação Rápida de Formas sob Alta Demanda',
    'Pintura Facial Artística: Materiais Antialérgicos, Higienização e Agilidade no Traço',
    'Improvisação Teatral e Personificação: Mantendo o Personagem Perante Perguntas Inusitadas',
    'Manejo de Crianças Tímidas ou Desafiadoras: Inclusão Cuidadosa sem Constrangimento',
    'Truques de Mágica Cômica: Ilusionismo Visual e Participação Ativa do Público',
    'Animação de Pista e Coreografias: Conexão e Engajamento de Pais e Crianças',
    'Gestão do Momento do Parabéns: Posicionamento, Clímax Emocional e Entusiasmo Coletivo',
    'Segurança e Primeiros Socorros em Brinquedos Infláveis e Gincanas Físicas',
  ],
  advogada: [
    'Tutelas Provisórias de Urgência: Demonstração de Probabilidade do Direito e Perigo de Dano',
    'Estratégia Recursal: Prequestionamento e Recursos Especial e Extraordinário aos Tribunais Superiores',
    'Sustentação Oral Perante Órgãos Colegiados: Retórica Forense e Síntese Persuasiva',
    'Elaboração e Negociação Contratual B2B: Alocação de Riscos, Cláusulas Penais e Limite de Responsabilidade',
    'Audiência de Instrução e Julgamento: Técnica de Inquirição de Testemunhas e Impugnações Imediatas',
    'Direito Penal e Processual Penal: Cadeia de Custódia de Provas e Garantias Fundamentais',
    'Direito Trabalhista Empresarial: Conformidade com Precedentes Vinculantes e Redução de Passivo',
    'Cumprimento de Sentença e Execução: Desconsideração da Personalidade Jurídica e Penhora de Bens',
    'Conformidade Regulatória e LGPD: Adequação de Bases Legais e Gestão de Incidentes de Segurança',
    'Resolução Adequada de Disputas: Mediação, Arbitragem e Acordos Extrajudiciais Estruturados',
  ],
  alquimista: [
    'Destilação Fracionada de Solventes Voláteis e Éter Hermético',
    'Estabilização Térmica de Elixires e Prevenção de Explosão de Atanor',
    'Transmutação Metálica: Chumbo, Mercúrio e Precipitação de Prata',
    'Cálculo de Proporções na Espargiria e Extração de Sais Minerais',
    'Manipulação de Ácidos Minerais (Vitriolo, Salitre) e Água-Régia',
    'Decantação e Clarificação de Poções com Catalisadores Orgânicos',
    'Fases da Grande Obra (Magnum Opus): Nigredo, Albedo, Citrinitas e Rubedo',
    'Sublimação de Enxofre Hermético e Purificação de Cinábrio',
    'Criação e Preservação de Tinturas Curativas e Panaceias Universais',
    'Síntese da Pedra Filosofal e Manipulação da Matriz Elemental Primordial',
  ],
  mago: [
    'Canalização Segura de Mana e Prevenção de Sobrecarga Arcana no Conjurador',
    'Desenho e Estabilização de Círculos Rúnicos de Invocação Elemental',
    'Manipulação de Feitiços de Abjuração: Barreiras e Escudos de Dispersão',
    'Geometria Arcana: Pentagramas, Hexagramas e Ressonância de Foco de Cristal',
    'Conjurando o Vazio Cósmico: Fissuras Dimensionais e Contenção Gravitacional',
    'Encantamento de Grimórios e Armazenamento de Feitiços de Alto Nível',
    'Equilíbrio dos Quatro Elementos (Fogo, Água, Terra, Ar) em Rituais Complexos',
    'Contrafeitiços Instantâneos e Dissipação de Maldições Antigas',
    'Transcendência Astral e Navegação pelo Éter Celestial sem Perda de Alma',
    'Arquimagia Suprema: Feixes Estelares e Manipulação Temporal Localizada',
  ],
  ferreiro: [
    'Têmpera Diferencial de Espadas Medievais e Controle Térmico em Óleo e Salmoura',
    'Forja de Aço Damasco: Solda Caldeada e Dobras de Múltiplas Camadas na Alta Idade Média',
    'Trabalho com Metais Místicos: Fusão de Mythril, Oricalco e Adamante',
    'Armaduras de Placas Renascentistas: Articulação de Manoplas, Elmos e Tratamento de Chapas',
    'Armas Mitológicas: Recriação das Lâminas Lendárias (Excalibur, Caliburn e Durandal)',
    'Forja de Armas de Arremesso e Lanças Divinas (Gungnir nórdica e Lança de Longinus)',
    'Técnicas de Bigorna e Encantamento Rúnico em Martelos de Guerra (Mjölnir e Gram)',
    'Forjamento com Componentes de Criaturas Mágicas: Escamas de Dragão e Presas de Beemote',
    'Metalurgia Oriental Medieval: Tratamento Térmico de Katanas e Nodachis (Escola Muramasa)',
    'Revestimento com Fogo de Dragão e Resfriamento em Águas Astrais para Lâminas Inquebráveis',
  ],
  rei_rainha: [
    'Crise de Abastecimento e Seca Extrema no Império Romano: Gestão dos Silos da Anona',
    'Estratégia de Defesa e Táticas de Cerco nas Muralhas de Constantinopla (Império Bizantino)',
    'Diplomacia Dinástica e Alianças de Casamento entre Casas Feudais Européias',
    'Reforma Tributária e Cobrança Equitativa de Impostos no Império Persa Aquemênida',
    'Logística Militar e Suprimentos de Grãos para Falanges e Cavalaria na Dinastia Han',
    'Gestão de Cheias do Rio Nilo, Armazenamento de Grãos e Prevenção de Fome no Egito Antigo',
    'Mediação de Conflitos Internos entre a Nobreza Baronesa e o Parlamento em Tempo de Paz',
    'Táticas de Terra Arrasada vs Batalha Campal Aberta contra Invasões das Estepes',
    'Pacto de Paz e Tratados de Navegação Comercial nas Rotas da Seda e Califados',
    'Decretos de Soberania Imperial, Reforma Judiciária e Anistia em Tempos de Reconstrução',
  ],
  domador_feras: [
    'Etologia de Grandes Predadores: Comportamento de Alcatéias de Lobos-cinzentos e Ursos-pardos',
    'Manejo e Domagem de Felinos de Grande Porte (Tigres-siberianos, Leões, Leopardos e Onças-pintadas)',
    'Falcoaria Real: Adestramento de Águias-reais, Falcões-peregrinos e Corujas-das-torres',
    'Contenção Segura de Répteis Gigantes: Crocodilos-do-nilo, Sucuris e Dragões-de-komodo',
    'Manejo Comportamental de Mega-herbívoros: Elefantes-africanos, Bisões e Rinocerontes',
    'Feras Marinhas e Cetáceos: Lógica de Interação com Orcas, Tubarões-brancos e Polvos-gigantes',
    'Bestas Mitológicas Célticas: Domando o Kelpie aquático e o Cù-Sìth com seus tabus canônicos',
    'Criaturas Nórdicas Ancestrais: Apaziguamento de Fenrir e Condução do Corcel de Oito Patas Sleipnir',
    'Mitologia Grega e Monstros Clássicos: Estratégias contra a Quimera, Cérbero e Pégaso',
    'Bestas Marinhas e Colossais: Leviatã, Kraken e o Vínculo Arcano com Dragões Primordiais',
  ],
  aniquilador_vegetais: [
    'Anatomia Vegetal Inimiga: Identificação do Sistema Vascular (Xilema e Floema) para Bloqueio de Seiva',
    'Fotossíntese Sob Ataque: Inibição de Clorofila, Cloroplastos e Fechamento Forçado de Estômatos',
    'Solanáceas Tóxicas vs Comestíveis: Detecção de Solanina em Batatas e Tomates Verdes vs Beladona',
    'Erradicação de Raízes Profundas, Rizomas Invasivos e Tubérculos Resistentes na Terra',
    'Alcaloides Mortais e Defesas Químicas: Neutralização de Cicuta, Estricnina e Rícino nas Plantas',
    'Técnicas de Ceifa e Dessecação Mecânica: Foices de Alta Precisão e Queima Controlada de Celulose',
    'Diferenciação Botânica Precisa: Plantas Comestíveis (Brócolis, Cenoura, Alface) e o Ódio por Cada Uma Delas',
    'Fisiologia da Colheita: Métodos para Destruir Plantações de Legumes Antes da Maturação',
    'Espécies Invasoras e Ervas Daninhas: Desfolhação Química e Extirpação do Meristema Apical',
    'O Ataque Final à Parede Celular: Hidrólise Ácida da Lignina e Eliminação Completa da Flora Comestível',
  ],
};

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

let selectedModel = null;
let schedulerTimer = null;
let isJobRunning = false;
let lastRunTimestamp = null;
let nextRunTimestamp = null;

// Intervalo padrão de execução automática: a cada 3 horas
const DEFAULT_INTERVAL_MS = 3 * 60 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadDatabase() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {}
  }
  return {};
}

function saveDatabase(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function detectWorkingModel() {
  if (selectedModel) return selectedModel;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (res.ok) {
      const data = await res.json();
      const available = new Set((data.data || []).map((m) => m.id));
      for (const m of CANDIDATE_MODELS) {
        if (available.has(m)) {
          selectedModel = m;
          return selectedModel;
        }
      }
    }
  } catch (_) {}

  selectedModel = 'qwen/qwen3.8-27b';
  return selectedModel;
}

/**
 * Gera 1 cenário individual para a profissão focando em um subtema específico.
 */
async function fetchSingleScenario(profession, subtheme, attempt = 1) {
  if (!API_KEY) return null;
  const model = await detectWorkingModel();
  const prompt = `Você é um gerador de banco de dados para minigames de carreiras em um bot de RPG no Discord.
Gere estritamente um objeto JSON com exatamente 1 cenário técnico e desafiador para a profissão "${profession}".
FOCO TEMÁTICO OBRIGATÓRIO DESTE CENÁRIO: "${subtheme}".

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o JSON puro. Não use preâmbulos, explicações ou blocos de markdown.
2. Paridade bilíngue completa com blocos "pt" e "en".
3. Crie 1 alternativa "correct" e exatamente 5 alternativas "wrongs" (incorretas).
4. As alternativas erradas DEVEM ser erros técnicos plausíveis, armadilhas conceituais ou práticas ultrapassadas da área. É TERMINANTEMENTE PROIBIDO criar piadas óbvias, bobagens infantis ou respostas absurdas.
5. O texto de cada alternativa deve ter no máximo 75 caracteres para caber nos botões do Discord.

ESTRUTURA DO JSON:
{
  "pt": {
    "scenario": "Descrição do problema técnico abordando ${subtheme}...",
    "correct": "Solução técnica correta",
    "wrongs": [
      "Erro plausível 1",
      "Erro plausível 2",
      "Erro plausível 3",
      "Erro plausível 4",
      "Erro plausível 5"
    ]
  },
  "en": {
    "scenario": "Technical issue description focusing on ${subtheme}...",
    "correct": "Correct technical solution",
    "wrongs": [
      "Plausible mistake 1",
      "Plausible mistake 2",
      "Plausible mistake 3",
      "Plausible mistake 4",
      "Plausible mistake 5"
    ]
  }
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 550,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a professional JSON generator assistant. Always output valid JSON strictly matching the user schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (response.status === 429) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error?.message || '';
      const waitMatch = msg.match(/try again in (\d+(\.\d+)?)s/i);
      const waitSec = waitMatch ? Math.ceil(parseFloat(waitMatch[1])) + 2 : 12 * attempt;
      console.log(`[Groq Seeder] Rate limit 429 detectado. Pausando ${waitSec}s para liberar tokens...`);
      await sleep(waitSec * 1000);
      if (attempt <= 4) {
        return fetchSingleScenario(profession, subtheme, attempt + 1);
      }
      return null;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Groq Seeder] Erro HTTP ${response.status}: ${errText.slice(0, 120)}`);
      return null;
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const item = parsed.scenarios ? parsed.scenarios[0] : parsed;

    if (!item || !item.pt || !item.en) return null;
    if (!item.pt.scenario || !item.pt.correct || !Array.isArray(item.pt.wrongs)) return null;
    if (!item.en.scenario || !item.en.correct || !Array.isArray(item.en.wrongs)) return null;

    return {
      subtheme,
      scenario: item.pt.scenario,
      correct: item.pt.correct,
      wrongs: item.pt.wrongs.slice(0, 5),
      pt: {
        scenario: item.pt.scenario,
        correct: item.pt.correct,
        wrongs: item.pt.wrongs.slice(0, 5),
      },
      en: {
        scenario: item.en.scenario,
        correct: item.en.correct,
        wrongs: item.en.wrongs.slice(0, 5),
      },
    };
  } catch (err) {
    if (attempt <= 2) {
      await sleep(3000 * attempt);
      return fetchSingleScenario(profession, subtheme, attempt + 1);
    }
    return null;
  }
}

/**
 * Executa uma rodada suave de geração gerando `countPerProfession` cenários para cada
 * carreira que ainda não atingiu a meta de 100.
 */
async function generateBatch({ countPerProfession = 1 } = {}) {
  if (isJobRunning) {
    return { success: false, message: 'Um lote de geração já está em andamento.' };
  }

  isJobRunning = true;
  lastRunTimestamp = Date.now();

  try {
    const db = loadDatabase();
    let totalGeneratedThisRound = 0;

    for (const prof of PROFESSIONS) {
      if (!db[prof]) db[prof] = [];

      // Se já atingiu 100, não gera mais nada para esta profissão
      if (db[prof].length >= TARGET_PER_PROFESSION) {
        continue;
      }

      const needed = Math.min(countPerProfession, TARGET_PER_PROFESSION - db[prof].length);
      const subthemes = PROFESSION_SUBTHEMES[prof] || ['Fundamentos Técnicos da Profissão'];

      for (let i = 0; i < needed; i++) {
        // Rotaciona os subtemas com base na contagem atual para cobrir todos os 10 tópicos
        const themeIndex = db[prof].length % subthemes.length;
        const currentTheme = subthemes[themeIndex];

        const scenario = await fetchSingleScenario(prof, currentTheme);
        if (scenario) {
          const isDup = db[prof].some(
            (s) => s.scenario === scenario.scenario || s.pt?.scenario === scenario.pt?.scenario
          );
          if (!isDup) {
            db[prof].push(scenario);
            saveDatabase(db);
            totalGeneratedThisRound++;
          }
        }

        // Intervalo de segurança de 12 segundos entre chamadas para ficar com folga abaixo de 1000 OTPM
        await sleep(12000);
      }
    }

    const currentTotal = Object.values(db).reduce((acc, list) => acc + (list?.length || 0), 0);
    const isCompleted = isTargetReached(db);

    console.log(
      `[Groq Seeder] Lote finalizado: +${totalGeneratedThisRound} cenários adicionados. Total acumulado: ${currentTotal}/${TARGET_PER_PROFESSION * PROFESSIONS.length}`
    );

    if (isCompleted) {
      console.log(`🎉 [Groq Seeder] META ATINGIDA: 100 cenários em todas as ${PROFESSIONS.length} profissões (${TARGET_PER_PROFESSION * PROFESSIONS.length}/${TARGET_PER_PROFESSION * PROFESSIONS.length}). Gerador desativado.`);
      stopScheduler();
    }

    return {
      success: true,
      added: totalGeneratedThisRound,
      currentTotal,
      isCompleted,
    };
  } finally {
    isJobRunning = false;
  }
}

function isTargetReached(db) {
  return PROFESSIONS.every((p) => Array.isArray(db[p]) && db[p].length >= TARGET_PER_PROFESSION);
}

function getStatus() {
  const db = loadDatabase();
  const perProfession = {};
  let currentTotal = 0;

  for (const prof of PROFESSIONS) {
    const count = Array.isArray(db[prof]) ? db[prof].length : 0;
    perProfession[prof] = count;
    currentTotal += count;
  }

  const isCompleted = isTargetReached(db);
  const targetTotal = TARGET_PER_PROFESSION * PROFESSIONS.length;

  return {
    targetPerProfession: TARGET_PER_PROFESSION,
    targetTotal,
    currentTotal,
    progressPercentage: Math.min(100, parseFloat(((currentTotal / targetTotal) * 100).toFixed(1))),
    perProfession,
    isCompleted,
    isJobRunning,
    lastRunTimestamp,
    nextRunTimestamp,
    selectedModel: selectedModel || 'qwen/qwen3.8-27b',
  };
}

function startScheduler(intervalMs = DEFAULT_INTERVAL_MS) {
  if (schedulerTimer) return;

  const db = loadDatabase();
  const targetTotal = TARGET_PER_PROFESSION * PROFESSIONS.length;
  if (isTargetReached(db)) {
    console.log(`[Groq Seeder] Meta de ${targetTotal} cenários já atingida. Agendador não será iniciado.`);
    return;
  }

  nextRunTimestamp = Date.now() + 60 * 1000; // Primeira rodada de aquecimento em 1 minuto

  // Inicia após 1 minuto de inicialização do servidor
  setTimeout(async () => {
    if (!isTargetReached(loadDatabase())) {
      console.log('[Groq Seeder] Disparando lote inicial automático em background...');
      await generateBatch({ countPerProfession: 1 });
    }
  }, 60 * 1000);

  // Agenda execuções recorrentes a cada intervalo (ex: a cada 3h)
  schedulerTimer = setInterval(async () => {
    nextRunTimestamp = Date.now() + intervalMs;
    const currentDb = loadDatabase();
    if (isTargetReached(currentDb)) {
      stopScheduler();
      return;
    }
    console.log('[Groq Seeder] Executando lote programado a cada 3 horas...');
    await generateBatch({ countPerProfession: 1 });
  }, intervalMs);

  console.log(`[Groq Seeder] Agendador automático ativado (Ciclo: a cada ${intervalMs / (1000 * 60 * 60)}h até atingir 1000 cenários).`);
}

function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    nextRunTimestamp = null;
    console.log('[Groq Seeder] Agendador automático finalizado.');
  }
}

module.exports = {
  PROFESSIONS,
  TARGET_PER_PROFESSION,
  generateBatch,
  getStatus,
  startScheduler,
  stopScheduler,
  loadDatabase,
};

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
      console.log('🎉 [Groq Seeder] META ATINGIDA: 100 cenários em todas as 10 profissões (1000/1000). Gerador desativado.');
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
  if (isTargetReached(db)) {
    console.log('[Groq Seeder] Meta de 1000 cenários já atingida. Agendador não será iniciado.');
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

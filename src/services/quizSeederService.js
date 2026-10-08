const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (_) {}

const API_KEY = process.env.GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DATA_FILE = path.join(__dirname, '../data/quiz_questions.json');

const TARGET_TOTAL = 500;
const QUESTIONS_PER_LEVEL = 125; // 4 níveis x 125 = 500 questões

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

const QUIZ_TOPICS = [
  'Ciência Geral & Astronomia',
  'História Mundial & Civilizações Antigas',
  'Geografia Global & Capitais',
  'Cultura Pop, Cinema & Quadrinhos',
  'Jogos, Videogames & E-Sports',
  'Tecnologia, Internet & Computação',
  'Literatura Clássica & Mitologia',
  'Música, Arte & Instrumentos',
  'Biologia, Animais & Natureza',
  'Química, Física & Elementos',
  'Culinária Mundial & Gastronomia',
  'Lógica, Charadas & Raciocínio Matemático',
];

let selectedModel = null;
let schedulerTimer = null;
let isJobRunning = false;
let lastRunTimestamp = null;
let nextRunTimestamp = null;

const DEFAULT_INTERVAL_MS = 3 * 60 * 60 * 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadDatabase() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    } catch (_) {}
  }
  return [];
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

  if (!API_KEY) {
    selectedModel = 'qwen/qwen3.8-27b';
    return selectedModel;
  }

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
 * Gera 1 pergunta de quiz via Groq AI com paridade bilíngue completa.
 */
async function fetchSingleQuestion(level = 1, topic = 'Ciência Geral', attempt = 1) {
  if (!API_KEY) return null;

  const model = await detectWorkingModel();
  const difficultyName = level === 1 ? 'Iniciante' : level === 2 ? 'Intermediário' : level === 3 ? 'Avançado' : 'Mestre Supremo';
  const prompt = `Você é um gerador de banco de perguntas para um minigame de Quiz cultural e nerd no Discord.
Gere estritamente um objeto JSON com exatamente 1 pergunta desafiadora de quiz sobre "${topic}" com dificuldade nível ${level} (${difficultyName}).

REGRAS OBRIGATÓRIAS:
1. Retorne APENAS o JSON puro. Não use preâmbulos, explicações ou blocos de markdown.
2. Paridade bilíngue completa com blocos "pt" e "en".
3. Crie 1 resposta "correct" e exatamente 3 alternativas "wrongs" (incorretas).
4. As alternativas erradas DEVEM ser plausíveis e enganosas (sem absurdos cômicos).
5. O texto de cada alternativa deve ter no máximo 70 caracteres.
6. Inclua "level": ${level} e "topic": "${topic}".

ESTRUTURA DO JSON:
{
  "level": ${level},
  "topic": "${topic}",
  "question": "Pergunta em português...",
  "correct": "Resposta correta",
  "wrongs": ["Alternativa errada 1", "Alternativa errada 2", "Alternativa errada 3"],
  "pt": {
    "question": "Pergunta em português...",
    "correct": "Resposta correta",
    "wrongs": ["Alternativa errada 1", "Alternativa errada 2", "Alternativa errada 3"]
  },
  "en": {
    "question": "Question in English...",
    "correct": "Correct answer",
    "wrongs": ["Wrong choice 1", "Wrong choice 2", "Wrong choice 3"]
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
        max_tokens: 500,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a professional trivia and quiz JSON generator assistant. Always output valid JSON strictly matching the user schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (response.status === 429) {
      const waitSec = 10 * attempt;
      console.log(`[Quiz Seeder] Rate limit 429. Aguardando ${waitSec}s...`);
      await sleep(waitSec * 1000);
      if (attempt <= 3) {
        return fetchSingleQuestion(level, topic, attempt + 1);
      }
      return null;
    }

    if (!response.ok) return null;

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const item = parsed.question ? parsed : parsed.questions ? parsed.questions[0] : null;

    if (!item || !item.pt || !item.en) return null;
    if (!item.pt.question || !item.pt.correct || !Array.isArray(item.pt.wrongs)) return null;
    if (!item.en.question || !item.en.correct || !Array.isArray(item.en.wrongs)) return null;

    return {
      id: `quiz_ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      level: Number(item.level) || level,
      topic: item.topic || topic,
      question: item.pt.question,
      correct: item.pt.correct,
      wrongs: item.pt.wrongs.slice(0, 3),
      pt: {
        question: item.pt.question,
        correct: item.pt.correct,
        wrongs: item.pt.wrongs.slice(0, 3),
      },
      en: {
        question: item.en.question,
        correct: item.en.correct,
        wrongs: item.en.wrongs.slice(0, 3),
      },
    };
  } catch (err) {
    if (attempt <= 2) {
      await sleep(2000 * attempt);
      return fetchSingleQuestion(level, topic, attempt + 1);
    }
    return null;
  }
}

/**
 * Executa lote de geração para enriquecer o banco de quiz.
 */
async function generateBatch({ count = 5 } = {}) {
  if (isJobRunning) {
    return { success: false, message: 'Um lote de geração de quiz já está em andamento.' };
  }

  isJobRunning = true;
  lastRunTimestamp = Date.now();

  try {
    const list = loadDatabase();
    if (list.length >= TARGET_TOTAL && !API_KEY) {
      return { success: true, message: 'Meta de 500 perguntas já atingida.', total: list.length };
    }

    let added = 0;
    for (let i = 0; i < count; i++) {
      const level = (i % 4) + 1;
      const topic = QUIZ_TOPICS[Math.floor(Math.random() * QUIZ_TOPICS.length)];
      const question = await fetchSingleQuestion(level, topic);
      if (question) {
        list.push(question);
        added++;
        saveDatabase(list);
        await sleep(1500);
      }
    }

    return {
      success: true,
      added,
      total: list.length,
      isCompleted: list.length >= TARGET_TOTAL,
    };
  } finally {
    isJobRunning = false;
  }
}

function getStatus() {
  const list = loadDatabase();
  const perLevel = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of list) {
    const lvl = Number(q.level) || 1;
    if (perLevel[lvl] !== undefined) perLevel[lvl]++;
  }

  return {
    targetTotal: TARGET_TOTAL,
    currentTotal: list.length,
    progressPercentage: Math.min(100, parseFloat(((list.length / TARGET_TOTAL) * 100).toFixed(1))),
    perLevel,
    isCompleted: list.length >= TARGET_TOTAL,
    isJobRunning,
    lastRunTimestamp,
    nextRunTimestamp,
    selectedModel: selectedModel || 'qwen/qwen3.8-27b',
  };
}

function startScheduler(intervalMs = DEFAULT_INTERVAL_MS) {
  if (schedulerTimer) return;

  const list = loadDatabase();
  if (list.length >= TARGET_TOTAL) {
    return;
  }

  nextRunTimestamp = Date.now() + 60 * 1000;

  setTimeout(async () => {
    if (loadDatabase().length < TARGET_TOTAL && API_KEY) {
      console.log('[Quiz Seeder] Disparando lote inicial de quiz em background...');
      await generateBatch({ count: 4 });
    }
  }, 60 * 1000);

  schedulerTimer = setInterval(async () => {
    nextRunTimestamp = Date.now() + intervalMs;
    const currentList = loadDatabase();
    if (currentList.length >= TARGET_TOTAL || !API_KEY) {
      stopScheduler();
      return;
    }
    console.log('[Quiz Seeder] Executando lote programado de quiz a cada 3 horas...');
    await generateBatch({ count: 4 });
  }, intervalMs);
}

function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    nextRunTimestamp = null;
    console.log('[Quiz Seeder] Agendador de quiz finalizado.');
  }
}

module.exports = {
  TARGET_TOTAL,
  QUESTIONS_PER_LEVEL,
  QUIZ_TOPICS,
  loadDatabase,
  saveDatabase,
  generateBatch,
  getStatus,
  startScheduler,
  stopScheduler,
};


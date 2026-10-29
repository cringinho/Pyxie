const fs = require('node:fs');
const path = require('node:path');
const groqClient = require('./groqClient');
const { cleanLine } = require('./pyxieVoice');
const { readJson, writeJsonAtomic } = require('../utils/atomicJson');

try {
  require('dotenv').config();
} catch (_) {}

function getApiKey() {
  return process.env.GROQ_API_KEY;
}
const SCHEDULER_KEY = 'voice_seeder_last_run';
const DEFAULT_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 horas
const TARGET_TOTAL = 500;
const MAX_BATCH_SIZE = 8;

const CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

const CATEGORIES = ['daily', 'work', 'tarot', 'quip', 'animator'];

const CATEGORY_PROMPTS = {
  daily: 'Falas para o comando /py-daily (resgate de moedas diário, comemoração de streak ou bronca em quem tenta resgatar antes do cooldown de 24h).',
  work: 'Falas para o comando /py-work (salário do expediente profissional, zoação com erro de turno, ou dar bronca mandando render mais amanhã).',
  tarot: 'Falas para o comando /py-tarot (reações dramáticas ao tirar carta trágica como A Torre, empolgação e pânico tsundere com Os Enamorados, ou tédio com carta repetida).',
  quip: 'Comentários curtos e ácidos de rodapé para minigames como /py-ship (afinidade amorosa), /py-dice (dados) ou /py-cookie (biscoito da sorte).',
  animator: 'Provocações para quebrar o silêncio quando o chat do Discord fica parado e com tédio mortal.',
};

const BASELINE_LINES = [
  // daily
  {
    category: 'daily',
    pt: 'Toma logo essas moedas antes que eu me arrependa e cobre pedágio pela sua existência aqui! E nem vem me agradecer!',
    en: 'Take these coins before I change my mind and charge you rent for existing here! And don\'t you dare thank me!',
  },
  {
    category: 'daily',
    pt: 'Olha só... Doze moedinhas. Dá até vergonha alheia! Fecha essa carteira antes que a miséria seja contagiosa!',
    en: 'Look at that... Twelve coins. It\'s giving second-hand embarrassment! Close that wallet before the broke energy spreads!',
  },
  {
    category: 'daily',
    pt: 'Mas de novo aqui?! Vai ver a luz do sol! Se clicar nesse botão antes de 3 horas, eu desconto por danos morais!',
    en: 'Here again?! Go see sunlight! Click this button within 3 hours and I\'ll fine you for moral damages!',
  },
  {
    category: 'daily',
    pt: 'Moedinhas caindo do céu. Gaste antes que eu invente um imposto sobre a sua preguiça!',
    en: 'Coins raining down. Spend them before I invent a tax on your laziness!',
  },
  // work
  {
    category: 'work',
    pt: 'Olha só, o cérebro funcionou! Não fez mais que a obrigação, mas toma seu pagamento antes que eu desista.',
    en: 'Look at that, the brain actually worked! Just did your duty, but take your pay before I change my mind.',
  },
  {
    category: 'work',
    pt: 'MAS O QUE FOI QUE VOCÊ FEZ?! Quem te ensinou a resolver crise assim, uma toupeira com febre?! Fica sem pagamento!',
    en: 'WHAT DID YOU JUST DO?! Who taught you crisis management, a feverish mole?! Zero pay for you!',
  },
  {
    category: 'work',
    pt: 'Turno concluído. Se gabar disso é proibido, você só sobreviveu ao expediente por pura sorte minha.',
    en: 'Shift over. Bragging is forbidden, you only survived the workday thanks to my sheer luck.',
  },
  {
    category: 'work',
    pt: 'Trabalhou direitinho. Agora não vai gastar o salário todo em besteira na primeira esquina, tá avisado!',
    en: 'Worked properly. Now don\'t blow your entire paycheck on nonsense at the first corner, you\'ve been warned!',
  },
  // tarot
  {
    category: 'tarot',
    pt: 'EITA! Ih... Não é por nada não, mas se eu fosse você nem saía da cama. Caiu A Torre! Se vira, o problema é seu!',
    en: 'WHOA! Yikes... Not to alarm you, but stay in bed today. The Tower fell! Good luck, you\'re on your own!',
  },
  {
    category: 'tarot',
    pt: 'MENTIRA! Não acredito, Os Enamorados?! Será que... *COF, COF!* Quer dizer... Grande coisa! Ilusões do cérebro!',
    en: 'NO WAY! The Lovers?! Could it be that... *COUGH!* I mean... Big deal! Just brain chemicals, don\'t get excited!',
  },
  {
    category: 'tarot',
    pt: 'Essa carta de novo?! Eu tenho cara de máquina de duplicata agora? Guarda ela na gaveta e reclama com o destino!',
    en: 'This card again?! Do I look like a photocopy machine? Shove it in a drawer and complain to fate!',
  },
  {
    category: 'tarot',
    pt: 'O baralho sussurrou seu destino. Se for uma tragédia cômica, me avisa pra eu assistir de camarote!',
    en: 'The deck whispered your fate. If it\'s a comedic tragedy, let me know so I can grab the front row seat!',
  },
  // quip
  {
    category: 'quip',
    pt: 'Isso aqui não é um ship, é uma declaração de guerra mútua! Fiquem longe um do outro pelo bem do servidor!',
    en: 'This isn\'t a ship, it\'s a mutual declaration of war! Stay far away from each other for the server\'s sake!',
  },
  {
    category: 'quip',
    pt: 'Noventa e oito por cento?! Ai que brega... que nojento... digo! Casem logo e me mandem o maior pedaço de bolo!',
    en: 'Ninety-eight percent?! Ugh, so cheesy... so gross... I mean! Just get married already and save me a slice of cake!',
  },
  {
    category: 'quip',
    pt: 'Tsc... Jogou o dado parecendo que tava com medo. Cadê a audácia de líder? Tenta de novo se tiver coragem!',
    en: 'Tsk... Rolled that die like you were terrified. Where\'s your nerve? Try again if you dare!',
  },
  {
    category: 'quip',
    pt: 'Perdeu tudo no minigame? Hahaha! Vou anotar essa derrota histórica na página principal do meu caderninho preto!',
    en: 'Lost it all in the minigame? Hahaha! Inscribing this historic defeat on page one of my little black book!',
  },
  // animator
  {
    category: 'animator',
    pt: 'Que silêncio de necrotério é esse aqui? Se ninguém puxar uma fofoca boa em 2 minutos, eu mesma invento um boato!',
    en: 'What is this graveyard silence? If nobody drops juicy gossip in 2 minutes, I\'m inventing a scandalous rumor myself!',
  },
  {
    category: 'animator',
    pt: 'Chat morreu e esqueceram de enterrar. Vão lavar uma louça ou falem algo antes que eu entre em colapso de tédio!',
    en: 'Chat died and nobody bothered burying it. Go do dishes or say something before I collapse from pure boredom!',
  },
];

function dataFile() {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'voiceBank.json');
}

let cachedBank = null;
let selectedModel = null;
let isJobRunning = false;
let lastRunTimestamp = 0;
let nextRunTimestamp = null;
let schedulerTimer = null;
let firstRunTimer = null;

function loadDatabase() {
  if (cachedBank) return cachedBank;
  const raw = readJson(dataFile(), null);
  if (raw && Array.isArray(raw.lines) && raw.lines.length > 0) {
    cachedBank = raw;
    return cachedBank;
  }
  // Cria com o baseline
  const initial = {
    version: 1,
    lastGeneratedAt: Date.now(),
    lines: BASELINE_LINES.map((item, idx) => ({
      id: `voice_baseline_${idx + 1}`,
      category: item.category,
      pt: item.pt,
      en: item.en,
      active: true,
      source: 'baseline',
      createdAt: Date.now(),
    })),
  };
  saveDatabase(initial);
  cachedBank = initial;
  return cachedBank;
}

function saveDatabase(data) {
  cachedBank = data;
  return writeJsonAtomic(dataFile(), data);
}

async function detectWorkingModel() {
  if (!selectedModel) {
    selectedModel = await groqClient.resolveModel(CANDIDATE_MODELS, 'qwen/qwen3.8-27b');
  }
  return selectedModel;
}

/**
 * Gera 1 fala em par bilíngue para uma categoria específica.
 */
async function generateSingleLine(category = 'daily') {
  if (!getApiKey()) return null;
  const model = await detectWorkingModel();
  const catDesc = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.daily;

  const prompt = `Você é o motor de diálogos da PYXIE, uma fada punk/dark-kawaii tsundere inspirada na Kuromi (Sanrio).
Sua missão é gerar exatamente UMA fala bilíngue curta e cômica para a seguinte situação:
Contexto: "${catDesc}"

REGRAS INEGOCIÁVEIS:
1. Arquétipo Kuromi: Marra teatral, acha que os usuários são seus subordinados incompetentes, guarda rancores no caderninho negro de vinganças, cuida na base da bronca (ajudar bufando) e tem pânico tsundere se deixar escapar algo fofo ou romântico.
2. PROIBIDO soar como assistente virtual ("Claro!", "Aqui está", "Olá!", "Com certeza").
3. PROIBIDO vilão arcaico ("mero mortal", "humano tolo", "ora, ora", "mwahaha").
4. Proibido: política, religião, sexualidade, ofensas à pessoa (aparência, saúde, deficiência). Zoar a situação, a preguiça ou o resultado.
5. Limite estrito de tamanho: CADA texto (pt e en) DEVE ter no máximo 140 caracteres.
6. Retorne ESTREITAMENTE um JSON com as chaves "category", "pt" e "en". Sem markdown.

SCHEMA JSON:
{
  "category": "${category}",
  "pt": "Texto em português, afiado, debochado, estilo Kuromi tsundere.",
  "en": "Matching English translation with the same theatrical tsundere energy."
}`;

  try {
    const res = await groqClient.chatCompletion(
      {
        model,
        max_tokens: 300,
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are the official dialogue engine for Pyxie, a Kuromi-inspired tsundere dark-kawaii Discord fairy. Always output valid JSON strictly matching the requested schema.',
          },
          { role: 'user', content: prompt },
        ],
      },
      { label: 'Voice Seeder' }
    );

    if (res.rateLimited) return { error: 'rate_limit' };
    if (!res.ok) return null;

    const content = res.data?.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const item = parsed.line || parsed.dialogue || (parsed.pt && parsed.en ? parsed : null);
    if (!item?.pt || !item?.en) return null;

    const ptClean = cleanLine(item.pt);
    const enClean = cleanLine(item.en);
    if (!ptClean || !enClean) return null;

    return {
      id: `voice_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: CATEGORIES.includes(item.category) ? item.category : category,
      pt: ptClean,
      en: enClean,
      active: true,
      source: 'groq',
      createdAt: Date.now(),
    };
  } catch (_) {
    return null;
  }
}

/**
 * Gera um lote de falas para enriquecer o voiceBank.
 */
async function generateBatch({ count = 4, category = null } = {}) {
  if (isJobRunning) return { running: true, added: 0 };
  isJobRunning = true;
  lastRunTimestamp = Date.now();

  const bank = loadDatabase();
  const safeCount = Math.min(MAX_BATCH_SIZE, Math.max(1, count));
  let added = 0;

  try {
    for (let i = 0; i < safeCount; i++) {
      if (bank.lines.length >= TARGET_TOTAL) break;
      const cat = category || CATEGORIES[(bank.lines.length + i) % CATEGORIES.length];
      const entry = await generateSingleLine(cat);
      if (entry && !entry.error) {
        const isDupe = bank.lines.some((l) => l.pt.toLowerCase() === entry.pt.toLowerCase());
        if (!isDupe) {
          bank.lines.push(entry);
          added++;
        }
      }
    }

    if (added > 0) {
      bank.lastGeneratedAt = Date.now();
      saveDatabase(bank);
      groqClient.markRun(SCHEDULER_KEY, Date.now());
      console.log(`[Voice Seeder] Lote concluído: +${added} falas adicionadas ao VoiceBank (Total: ${bank.lines.length}).`);
    }
    return { success: true, added, total: bank.lines.length };
  } finally {
    isJobRunning = false;
  }
}

function getRandomLine(category, lang = 'pt') {
  const bank = loadDatabase();
  const list = bank.lines.filter((l) => l.active && (!category || l.category === category));
  if (!list.length) {
    if (category) {
      const fallbackList = bank.lines.filter((l) => l.active);
      if (!fallbackList.length) return null;
      const picked = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      return lang === 'en' ? picked.en : picked.pt;
    }
    return null;
  }
  const picked = list[Math.floor(Math.random() * list.length)];
  return lang === 'en' ? picked.en : picked.pt;
}

function toggleLine(id, active) {
  const bank = loadDatabase();
  const item = bank.lines.find((l) => l.id === id);
  if (!item) return false;
  item.active = typeof active === 'boolean' ? active : !item.active;
  saveDatabase(bank);
  return item;
}

function editLine(id, { pt, en, category }) {
  const bank = loadDatabase();
  const item = bank.lines.find((l) => l.id === id);
  if (!item) return null;
  if (pt) item.pt = cleanLine(pt) || item.pt;
  if (en) item.en = cleanLine(en) || item.en;
  if (category && CATEGORIES.includes(category)) item.category = category;
  saveDatabase(bank);
  return item;
}

function deleteLine(id) {
  const bank = loadDatabase();
  const idx = bank.lines.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  bank.lines.splice(idx, 1);
  saveDatabase(bank);
  return true;
}

function getStatus() {
  const bank = loadDatabase();
  const perCategory = {};
  for (const cat of CATEGORIES) perCategory[cat] = 0;
  let activeCount = 0;
  for (const l of bank.lines) {
    if (perCategory[l.category] !== undefined) perCategory[l.category]++;
    if (l.active) activeCount++;
  }

  return {
    targetTotal: TARGET_TOTAL,
    currentTotal: bank.lines.length,
    totalLines: bank.lines.length,
    activeCount,
    perCategory,
    isCompleted: bank.lines.length >= TARGET_TOTAL,
    isJobRunning,
    lastRunTimestamp,
    nextRunTimestamp,
    selectedModel: selectedModel || 'qwen/qwen3.8-27b',
    model: selectedModel || 'qwen/qwen3.8-27b',
    schedulerRunning: Boolean(schedulerTimer || firstRunTimer),
    lastGeneratedAt: bank.lastGeneratedAt || 0,
  };
}

function startScheduler(intervalMs = DEFAULT_INTERVAL_MS) {
  if (schedulerTimer || firstRunTimer) return;
  const bank = loadDatabase();
  if (bank.lines.length >= TARGET_TOTAL || !getApiKey()) return;

  const runScheduled = async () => {
    nextRunTimestamp = Date.now() + intervalMs;
    if (loadDatabase().lines.length >= TARGET_TOTAL) {
      stopScheduler();
      return;
    }
    console.log('[Voice Seeder] Executando lote programado de voz (ciclo ocioso)...');
    await generateBatch({ count: 4 });
  };

  const firstDelay = groqClient.computeFirstRunDelay(groqClient.getLastRun(SCHEDULER_KEY), intervalMs);
  nextRunTimestamp = Date.now() + firstDelay;
  firstRunTimer = setTimeout(() => {
    firstRunTimer = null;
    schedulerTimer = setInterval(runScheduled, intervalMs);
    runScheduled();
  }, firstDelay);
}

function stopScheduler() {
  if (firstRunTimer) {
    clearTimeout(firstRunTimer);
    firstRunTimer = null;
    nextRunTimestamp = null;
  }
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    nextRunTimestamp = null;
    console.log('[Voice Seeder] Agendador de voz finalizado.');
  }
}

module.exports = {
  CATEGORIES,
  TARGET_TOTAL,
  loadDatabase,
  saveDatabase,
  generateSingleLine,
  generateBatch,
  getRandomLine,
  toggleLine,
  editLine,
  deleteLine,
  getStatus,
  cleanLine,
  startScheduler,
  stopScheduler,
};

const fs = require('fs');
const path = require('path');
const professions = require('./professions');
const { getRoleTitle, calculateSalaryForLevel, filterMinigamesByLevel } = require('./careerHierarchy');

const CAREERS_FILE = path.join(__dirname, '..', 'data', 'generated_work_minigames.json');
const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz_questions.json');

function loadCareersData() {
  try {
    if (fs.existsSync(CAREERS_FILE)) {
      return JSON.parse(fs.readFileSync(CAREERS_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function loadQuizData() {
  try {
    if (fs.existsSync(QUIZ_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return [];
}

function shuffleArray(array) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

/**
 * Retorna auditoria e estatísticas 100% reais do acervo em disco
 */
function getAcervoStats() {
  const careersData = loadCareersData();
  const quizData = loadQuizData();

  // 1. Auditoria de Carreiras
  const careersList = [];
  let totalCareerQuestions = 0;

  for (const [key, profDef] of Object.entries(professions)) {
    const items = Array.isArray(careersData[key]) ? careersData[key] : [];
    const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0, unassigned: 0 };

    for (const item of items) {
      const lvl = item.level ? Number(item.level) : null;
      if (lvl && levelCounts[lvl] !== undefined) {
        levelCounts[lvl]++;
      } else {
        levelCounts.unassigned++;
      }
    }

    totalCareerQuestions += items.length;
    careersList.push({
      key,
      label: profDef.label || key,
      isMagic: Boolean(profDef.isMagic),
      beanCost: profDef.beanCost || 0,
      totalQuestions: items.length,
      levelCounts,
      hasBilingual: items.every((i) => i.pt && i.en),
    });
  }

  // 2. Auditoria do Quiz
  const quizLevelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const quizTopics = {};

  for (const q of quizData) {
    const lvl = Number(q.level) || 1;
    if (quizLevelCounts[lvl] !== undefined) {
      quizLevelCounts[lvl]++;
    }
    const topic = q.topic || q.category || 'Geral';
    quizTopics[topic] = (quizTopics[topic] || 0) + 1;
  }

  return {
    careers: {
      totalProfessions: Object.keys(professions).length,
      totalQuestions: totalCareerQuestions,
      items: careersList,
    },
    quiz: {
      totalQuestions: quizData.length,
      levelCounts: quizLevelCounts,
      topics: quizTopics,
    },
  };
}

/**
 * Simula um sorteio de minigame exatamente com a mesma lógica do bot
 * @param {'career'|'quiz'} type
 * @param {Object} params
 */
function simulateDraw(type, params = {}) {
  const lang = params.lang === 'en' ? 'en' : 'pt';

  if (type === 'career') {
    const professionKey = params.profession || 'programador';
    const profDef = professions[professionKey] || professions.programador;
    const userLevel = Math.max(1, Math.min(4, Number(params.level) || 1));
    const roleTitle = getRoleTitle(professionKey, userLevel, lang);

    const careersData = loadCareersData();
    const list = Array.isArray(careersData[professionKey]) ? careersData[professionKey] : [];
    const eligiblePool = filterMinigamesByLevel(list, userLevel);

    if (eligiblePool.length === 0) {
      return {
        success: false,
        error: `Nenhuma pergunta cadastrada para ${profDef.label} no nível ${userLevel}.`,
      };
    }

    const chosen = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
    const localized = chosen[lang] || chosen.pt || chosen.en || chosen;
    const wrongs = Array.isArray(localized.wrongs) ? localized.wrongs : [];
    const sampledWrongs = shuffleArray(wrongs).slice(0, 3);

    const allChoices = [
      { text: localized.correct, isCorrect: true },
      ...sampledWrongs.map((w) => ({ text: w, isCorrect: false })),
    ];
    const shuffledChoices = shuffleArray(allChoices);
    const salary = calculateSalaryForLevel(userLevel);

    return {
      success: true,
      type: 'career',
      professionKey,
      professionLabel: profDef.label,
      userLevel,
      roleTitle,
      salary,
      poolSize: eligiblePool.length,
      totalInProfession: list.length,
      scenario: localized.scenario,
      correctAnswer: localized.correct,
      choices: shuffledChoices,
    };
  }

  if (type === 'quiz') {
    const quizData = loadQuizData();
    const level = Math.max(1, Math.min(4, Number(params.level) || 1));
    const eligiblePool = quizData.filter((q) => Number(q.level) === level);
    const pool = eligiblePool.length > 0 ? eligiblePool : quizData;

    if (pool.length === 0) {
      return { success: false, error: 'Banco de perguntas do quiz vazio.' };
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const localized = chosen[lang] || chosen.pt || chosen.en || chosen;
    const wrongs = Array.isArray(localized.wrongs) ? localized.wrongs : [];
    const allChoices = [
      { text: localized.correct, isCorrect: true },
      ...wrongs.map((w) => ({ text: w, isCorrect: false })),
    ];
    const shuffledChoices = shuffleArray(allChoices);

    return {
      success: true,
      type: 'quiz',
      level,
      topic: chosen.topic || 'Conhecimentos Gerais',
      poolSize: pool.length,
      totalInQuiz: quizData.length,
      question: localized.question || localized.scenario,
      correctAnswer: localized.correct,
      choices: shuffledChoices,
    };
  }

  return { success: false, error: 'Tipo de simulação inválido.' };
}

module.exports = {
  getAcervoStats,
  simulateDraw,
};


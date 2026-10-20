const fs = require('fs');
const path = require('path');
const professions = require('./professions');
const { getRoleTitle, calculateSalaryForLevel, filterMinigamesByLevel } = require('./careerHierarchy');

let PROFESSION_SUBTHEMES = {};
try {
  const ws = require('./workSeederService');
  if (ws && ws.PROFESSION_SUBTHEMES) {
    PROFESSION_SUBTHEMES = ws.PROFESSION_SUBTHEMES;
  }
} catch (_) {}

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
 * 1. Auditoria de Distribuição de Questões por Nível nas 22 Profissões
 */
function auditLevelDistribution({ targetPerLevel = 10 } = {}) {
  const careersData = loadCareersData();
  const professionKeys = Object.keys(professions);
  const underTargetProfessions = [];
  let totalDeficit = 0;
  const totalLevelSlots = professionKeys.length * 4;
  let metLevelSlots = 0;

  for (const key of professionKeys) {
    const profDef = professions[key] || {};
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

    const deficits = {};
    let profDeficit = 0;
    for (let lvl = 1; lvl <= 4; lvl++) {
      const count = levelCounts[lvl] || 0;
      if (count < targetPerLevel) {
        const diff = targetPerLevel - count;
        deficits[lvl] = { current: count, target: targetPerLevel, deficit: diff };
        profDeficit += diff;
      } else {
        metLevelSlots++;
      }
    }

    if (profDeficit > 0) {
      totalDeficit += profDeficit;
      const subthemes = PROFESSION_SUBTHEMES[key] || ['Conhecimentos e Boas Práticas da Profissão'];
      underTargetProfessions.push({
        professionKey: key,
        label: profDef.label || key,
        emoji: profDef.emoji || '💼',
        isMagic: Boolean(profDef.isMagic),
        totalQuestions: items.length,
        levelCounts,
        deficits,
        totalDeficit: profDeficit,
        recommendedSubthemes: subthemes.slice(0, 3),
      });
    }
  }

  // Ordena pela prioridade de geração (maior déficit primeiro)
  underTargetProfessions.sort((a, b) => b.totalDeficit - a.totalDeficit);

  const complianceRate = Math.round((metLevelSlots / totalLevelSlots) * 100);

  return {
    targetPerLevel,
    totalProfessions: professionKeys.length,
    compliantProfessionsCount: professionKeys.length - underTargetProfessions.length,
    underTargetCount: underTargetProfessions.length,
    totalDeficit,
    complianceRate,
    underTargetProfessions,
  };
}

/**
 * 2. Validador de "Viés de Tamanho de Resposta" (Answer Length Bias)
 * Identifica questões onde a resposta correta é mais de 35% mais longa que a média das alternativas incorretas.
 */
function auditAnswerLengthBias({ biasThreshold = 0.35, minLengthDiff = 8 } = {}) {
  const careersData = loadCareersData();
  const quizData = loadQuizData();

  let careerAudited = 0;
  let careerBiased = 0;
  const careerBiasedItems = [];

  for (const [profKey, list] of Object.entries(careersData)) {
    if (!Array.isArray(list)) continue;
    const profDef = professions[profKey] || {};

    list.forEach((item) => {
      careerAudited++;
      const correctStr = String(item.pt?.correct || item.correct || '').trim();
      const wrongs = Array.isArray(item.pt?.wrongs) ? item.pt.wrongs : (Array.isArray(item.wrongs) ? item.wrongs : []);

      if (wrongs.length > 0 && correctStr.length > 0) {
        const avgWrongsLen = wrongs.reduce((sum, w) => sum + String(w).trim().length, 0) / wrongs.length;
        const ratio = avgWrongsLen > 0 ? (correctStr.length / avgWrongsLen) : 1;
        const diff = correctStr.length - avgWrongsLen;

        if (ratio > (1 + biasThreshold) && diff >= minLengthDiff) {
          careerBiased++;
          careerBiasedItems.push({
            type: 'career',
            profession: profKey,
            professionLabel: profDef.label || profKey,
            level: item.level || 1,
            scenarioSnippet: String(item.pt?.scenario || item.scenario || '').slice(0, 70),
            correctLength: correctStr.length,
            avgWrongsLength: Math.round(avgWrongsLen),
            ratio: Number(ratio.toFixed(2)),
            excessPercent: Math.round((ratio - 1) * 100),
          });
        }
      }
    });
  }

  let quizAudited = 0;
  let quizBiased = 0;
  const quizBiasedItems = [];

  quizData.forEach((q) => {
    quizAudited++;
    const correctStr = String(q.pt?.correct || q.correct || '').trim();
    const wrongs = Array.isArray(q.pt?.wrongs) ? q.pt.wrongs : (Array.isArray(q.wrongs) ? q.wrongs : []);

    if (wrongs.length > 0 && correctStr.length > 0) {
      const avgWrongsLen = wrongs.reduce((sum, w) => sum + String(w).trim().length, 0) / wrongs.length;
      const ratio = avgWrongsLen > 0 ? (correctStr.length / avgWrongsLen) : 1;
      const diff = correctStr.length - avgWrongsLen;

      if (ratio > (1 + biasThreshold) && diff >= minLengthDiff) {
        quizBiased++;
        quizBiasedItems.push({
          type: 'quiz',
          id: q.id,
          level: q.level || 1,
          topic: q.topic || 'Geral',
          questionSnippet: String(q.pt?.question || q.question || '').slice(0, 70),
          correctLength: correctStr.length,
          avgWrongsLength: Math.round(avgWrongsLen),
          ratio: Number(ratio.toFixed(2)),
          excessPercent: Math.round((ratio - 1) * 100),
        });
      }
    }
  });

  const totalAudited = careerAudited + quizAudited;
  const totalBiased = careerBiased + quizBiased;
  const overallBiasRate = totalAudited > 0 ? Math.round((totalBiased / totalAudited) * 100) : 0;
  const careerBiasRate = careerAudited > 0 ? Math.round((careerBiased / careerAudited) * 100) : 0;
  const quizBiasRate = quizAudited > 0 ? Math.round((quizBiased / quizAudited) * 100) : 0;

  careerBiasedItems.sort((a, b) => b.ratio - a.ratio);
  quizBiasedItems.sort((a, b) => b.ratio - a.ratio);

  return {
    biasThreshold,
    totalAudited,
    totalBiased,
    overallBiasRate,
    careers: {
      audited: careerAudited,
      biased: careerBiased,
      biasRate: careerBiasRate,
      topDiscrepant: careerBiasedItems.slice(0, 10),
    },
    quiz: {
      audited: quizAudited,
      biased: quizBiased,
      biasRate: quizBiasRate,
      topDiscrepant: quizBiasedItems.slice(0, 10),
    },
  };
}

/**
 * Formata o resumo legível para comando administrativo ou log do sistema
 */
function formatAuditSummary({ healthScore, distribution, bias, recommendations }) {
  const lines = [
    '📊 **RELATÓRIO DE AUDITORIA ERGONÔMICA DO ACERVO**',
    `> **Health Score Geral:** \`${healthScore}/100\` ${healthScore >= 80 ? '🟢 Ótimo' : healthScore >= 60 ? '🟡 Bom' : '🔴 Atenção'}`,
    '',
    `💼 **Distribuição por Níveis (Meta: ${distribution.targetPerLevel}/nível)**`,
    `> • Cobertura de Níveis: **${distribution.complianceRate}%** (${distribution.compliantProfessionsCount}/${distribution.totalProfessions} profissões completas)`,
    `> • Profissões com Déficit: **${distribution.underTargetCount}** (Faltam ${distribution.totalDeficit} questões no total)`,
  ];

  if (distribution.underTargetProfessions.length > 0) {
    lines.push('', '⚠️ **Profissões Prioritárias para Geração no Seeder:**');
    distribution.underTargetProfessions.slice(0, 6).forEach((p) => {
      const deficitStr = Object.entries(p.deficits).map(([lvl, d]) => `N${lvl}: -${d.deficit}`).join(', ');
      lines.push(`> • ${p.emoji} **${p.label}**: Déficit de ${p.totalDeficit} (${deficitStr})`);
    });
  }

  lines.push(
    '',
    `📏 **Viés de Tamanho de Resposta (Threshold > +${Math.round(bias.biasThreshold * 100)}%)**`,
    `> • Carreiras: **${bias.careers.biasRate}%** com resposta correta mais longa (${bias.careers.biased}/${bias.careers.audited})`,
    `> • Quiz: **${bias.quiz.biasRate}%** com resposta correta mais longa (${bias.quiz.biased}/${bias.quiz.audited})`,
    `> • Índice Global de Viés: **${bias.overallBiasRate}%** (${bias.totalBiased}/${bias.totalAudited} questões)`,
    '',
    '💡 **Recomendações:**'
  );

  recommendations.forEach((rec) => {
    lines.push(`> ➡️ ${rec}`);
  });

  return lines.join('\n');
}

/**
 * 3. Exporta Relatório Resumido para Consumo Administrativo ou Log de Inicialização
 */
function generateAuditReport({ targetPerLevel = 10, biasThreshold = 0.35 } = {}) {
  const distribution = auditLevelDistribution({ targetPerLevel });
  const bias = auditAnswerLengthBias({ biasThreshold });

  // Health Score Ergonômico Geral (0 a 100)
  const distributionScore = (distribution.complianceRate / 100) * 50;
  const biasScore = ((100 - bias.overallBiasRate) / 100) * 50;
  const healthScore = Math.max(0, Math.min(100, Math.round(distributionScore + biasScore)));

  const recommendations = [];
  if (distribution.underTargetCount > 0) {
    recommendations.push(
      `Priorizar geração no workSeederService para ${distribution.underTargetCount} profissão(ões) com déficit de ${distribution.totalDeficit} questão(ões) no total.`
    );
  }
  if (bias.careers.biasRate > 30) {
    recommendations.push(
      `Balancear o comprimento das alternativas incorretas nos minigames de carreira (${bias.careers.biasRate}% com alternativas corretas excessivamente longas).`
    );
  }
  if (bias.quiz.biasRate > 20) {
    recommendations.push(
      `Revisar ${bias.quiz.biased} questões no banco de Quiz onde a alternativa correta é > 35% mais longa.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push('Acervo em equilíbrio ergonômico ideal!');
  }

  const summaryMarkdown = formatAuditSummary({
    healthScore,
    distribution,
    bias,
    recommendations,
  });

  return {
    timestamp: new Date().toISOString(),
    healthScore,
    targetPerLevel,
    biasThreshold,
    distribution,
    bias,
    recommendations,
    summaryMarkdown,
  };
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
    const emoji = profDef.emoji || '💼';
    careersList.push({
      key,
      id: key,
      label: profDef.label || key,
      name: profDef.label || key,
      icon: emoji,
      emoji,
      isMagic: Boolean(profDef.isMagic),
      beanCost: profDef.beanCost || 0,
      totalQuestions: items.length,
      levelCounts,
      levels: levelCounts,
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

  // 3. Auditoria Ergonômica de Qualidade e Viés
  const ergonomics = generateAuditReport({ targetPerLevel: 10, biasThreshold: 0.35 });

  return {
    careers: {
      totalProfessions: Object.keys(professions).length,
      totalQuestions: totalCareerQuestions,
      items: careersList,
      professions: careersList,
    },
    quiz: {
      totalQuestions: quizData.length,
      levelCounts: quizLevelCounts,
      levels: {
        1: { name: 'Fácil (Iniciante)', count: quizLevelCounts[1] || 0, icon: '🌱' },
        2: { name: 'Médio (Intermediário)', count: quizLevelCounts[2] || 0, icon: '⚡' },
        3: { name: 'Difícil (Avançado)', count: quizLevelCounts[3] || 0, icon: '🔥' },
        4: { name: 'Mestre (Extremo)', count: quizLevelCounts[4] || 0, icon: '👑' },
      },
      topics: quizTopics,
    },
    ergonomics,
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
      profession: professionKey,
      professionLabel: profDef.label,
      userLevel,
      level: userLevel,
      roleTitle,
      salary,
      poolSize: eligiblePool.length,
      totalInProfession: list.length,
      scenario: localized.scenario,
      correctAnswer: localized.correct,
      choices: shuffledChoices,
      options: shuffledChoices.map((c) => c.text),
      item: {
        title: `${profDef.emoji || '💼'} ${profDef.label} - ${roleTitle}`,
        scenario: localized.scenario,
        options: shuffledChoices.map((c) => c.text),
        reactions: ['🇦', '🇧', '🇨', '🇩'],
      },
      lang,
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
      options: shuffledChoices.map((c) => c.text),
      correctIndex: shuffledChoices.findIndex((c) => c.isCorrect),
      item: {
        question: localized.question || localized.scenario,
        options: shuffledChoices.map((c) => c.text),
        correctIndex: shuffledChoices.findIndex((c) => c.isCorrect),
      },
      lang,
    };
  }

  return { success: false, error: 'Tipo de simulação inválido.' };
}

module.exports = {
  getAcervoStats,
  simulateDraw,
  auditLevelDistribution,
  auditAnswerLengthBias,
  generateAuditReport,
  formatAuditSummary,
};

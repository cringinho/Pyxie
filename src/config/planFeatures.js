/**
 * Catálogo de recursos por plano — fonte única para bot, painel e site.
 *
 * Cada recurso declara o plano mínimo. O painel usa isso para mostrar o cadeado
 * com a cor do plano (como o Probot faz) e o backend usa para RECUSAR de verdade:
 * esconder na tela não basta (AGENTS §10).
 *
 * `kind`: 'command' (comando do bot) | 'section' (tela do painel) | 'module' (módulo inteiro).
 */
const TIERS = ['free', 'basic', 'premium'];
const RANK = { free: 0, basic: 1, premium: 2, founder: 3 };

const FEATURES = [
  // Painel — o que o servidor ganha ao subir de plano.
  { id: 'theme_custom', kind: 'section', plan: 'basic', pt: 'Cores e temas do painel', en: 'Panel colors and themes' },
  // Perfil da Pyxie no servidor (apelido, foto, banner e bio): completo a partir do Básico.
  { id: 'maryProfile', kind: 'section', plan: 'basic', pt: 'Perfil da Pyxie no servidor', en: 'Pyxie profile in the server' },
  { id: 'embeds', kind: 'section', plan: 'premium', pt: 'Mensagens personalizadas', en: 'Custom embeds' },
  { id: 'community', kind: 'section', plan: 'premium', pt: 'Comunidade e eventos', en: 'Community and events' },
  { id: 'seasonal', kind: 'section', plan: 'premium', pt: 'Eventos sazonais', en: 'Seasonal events' },
  // Status da lojinha (online, fila, fechada) no próprio servidor: só no Premium.
  { id: 'storeStatus', kind: 'command', plan: 'premium', pt: 'Status da lojinha no servidor', en: 'Store status in the server' },
  // Comandos
  { id: 'oracle_ai', kind: 'command', plan: 'premium', pt: 'Oráculo com IA', en: 'AI Oracle' },
  { id: 'quiz_ai', kind: 'command', plan: 'premium', pt: 'Quiz gerado por IA', en: 'AI quiz' },
  // Módulos
  { id: 'hyperfokus', kind: 'module', plan: 'premium', pt: 'Blog Hyperfokus', en: 'Hyperfokus blog' },
];

// Tetos numéricos por plano (não são recursos liga/desliga): fonte única para painel, bot e site.
// `periodicMessages` = quantas mensagens cíclicas o servidor pode manter ativas.
const LIMITS = {
  periodicMessages: { free: 1, basic: 1, founder: 4, premium: 10 },
};


const byId = new Map(FEATURES.map((f) => [f.id, f]));

/** Peso do plano (founder conta como o topo). */
function rankOf(plan) {
  return RANK[String(plan || 'free')] ?? 0;
}

function planFor(featureId) {
  return byId.get(String(featureId || ''))?.plan || 'free';
}

function feature(featureId) {
  return byId.get(String(featureId || '')) || null;
}

/** O plano atual alcança o recurso? */
function canUse(plan, featureId) {
  const need = planFor(featureId);
  return rankOf(plan) >= rankOf(need);
}

/** Tudo que o plano libera (para a tela de Planos). */
function featuresFor(plan, { kind = null } = {}) {
  return FEATURES.filter((f) => (!kind || f.kind === kind) && canUse(plan, f.id));
}

/** Tudo que o plano ainda não libera, com o plano exigido. */
function lockedFor(plan, ids = null) {
  const list = ids ? FEATURES.filter((f) => ids.includes(f.id)) : FEATURES;
  return list
    .filter((f) => !canUse(plan, f.id))
    .map((f) => ({ id: f.id, kind: f.kind, plan: f.plan, pt: f.pt, en: f.en }));
}

/** Teto numérico de um plano (0 quando o teto não existe). */
function limitFor(plan, key) {
  const row = LIMITS[String(key || '')];
  if (!row) return 0;
  const value = row[String(plan || 'free')];
  return Number.isFinite(value) ? value : Number(row.free) || 0;
}

/** Menor plano que comporta `count` de um teto (paywall aponta o plano certo). */
function planForLimit(key, count) {
  const wanted = Number(count) || 0;
  for (const tier of TIERS) if (limitFor(tier, key) >= wanted) return tier;
  return 'premium';
}

/** Catálogo completo para o painel montar os cadeados sem lista fixa no HTML. */
function catalog() {
  return {
    tiers: TIERS,
    features: FEATURES.map((f) => ({ ...f, rank: rankOf(f.plan) })),
    limits: Object.fromEntries(Object.entries(LIMITS).map(([key, row]) => [key, { ...row }])),
  };
}

module.exports = {
  TIERS,
  RANK,
  FEATURES,
  LIMITS,
  rankOf,
  planFor,
  feature,
  canUse,
  limitFor,
  planForLimit,
  featuresFor,
  lockedFor,
  catalog,
};

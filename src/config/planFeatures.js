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
  { id: 'embeds', kind: 'section', plan: 'premium', pt: 'Mensagens personalizadas', en: 'Custom embeds' },
  { id: 'community', kind: 'section', plan: 'premium', pt: 'Comunidade e eventos', en: 'Community and events' },
  { id: 'seasonal', kind: 'section', plan: 'premium', pt: 'Eventos sazonais', en: 'Seasonal events' },
  // Comandos
  { id: 'oracle_ai', kind: 'command', plan: 'premium', pt: 'Oráculo com IA', en: 'AI Oracle' },
  { id: 'quiz_ai', kind: 'command', plan: 'premium', pt: 'Quiz gerado por IA', en: 'AI quiz' },
  // Módulos
  { id: 'hyperfokus', kind: 'module', plan: 'premium', pt: 'Blog Hyperfokus', en: 'Hyperfokus blog' },
];

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

/** Catálogo completo para o painel montar os cadeados sem lista fixa no HTML. */
function catalog() {
  return {
    tiers: TIERS,
    features: FEATURES.map((f) => ({ ...f, rank: rankOf(f.plan) })),
  };
}

module.exports = { TIERS, RANK, FEATURES, rankOf, planFor, feature, canUse, featuresFor, lockedFor, catalog };

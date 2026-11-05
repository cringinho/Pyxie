// Utilitários do catálogo de comandos (dados de /api/commands, fonte única — AGENTS.md §4).
// A API envia: name ('/py-daily'), desc, aliases, category, emoji, cooldownSeconds, permission.

/** Minúsculas e sem acentos (diário = diario). */
export function fold(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Nome sem a barra: '/py-daily' -> 'py-daily'. */
export function cleanName(cmd) {
  return String(cmd?.name || '').replace(/^\/+/, '');
}

/**
 * Apelidos de prefixo prontos para mostrar com "py!": sem o "py-" do começo e sem repetição.
 * Ex.: ['daily','diario','py-diario','diaria','py-daily'] -> ['daily','diario','diaria'].
 */
export function cleanAliases(cmd) {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(cmd?.aliases) ? cmd.aliases : []) {
    const alias = String(raw || '').trim().replace(/^py[-!]/i, '');
    const key = alias.toLowerCase();
    if (!alias || seen.has(key)) continue;
    seen.add(key);
    out.push(alias);
  }
  return out;
}

/** O comando bate com a âncora do link (#py-daily, #daily, #diario)? */
export function matchesAnchor(cmd, anchor) {
  const h = fold(String(anchor || '').replace(/^#/, '')).replace(/^\/+/, '');
  if (!h) return false;
  const name = fold(cleanName(cmd));
  const bare = name.replace(/^py-/, '');
  if (h === name || h === bare || h === `py-${bare}`) return true;
  return cleanAliases(cmd).some((a) => {
    const fa = fold(a);
    return fa === h || `py-${fa}` === h;
  });
}

/** Busca por nome, apelido, descrição e categoria (id e rótulo), ignorando acentos. */
export function matchesQuery(cmd, query, categoryLabel = '') {
  const q = fold(query);
  if (!q) return true;
  return (
    fold(cmd?.name).includes(q) ||
    fold(cmd?.desc).includes(q) ||
    cleanAliases(cmd).some((a) => fold(a).includes(q)) ||
    fold(cmd?.category).includes(q) ||
    fold(categoryLabel).includes(q)
  );
}

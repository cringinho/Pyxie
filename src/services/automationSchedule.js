const automations = new Map();

/**
 * Registra ou substitui uma automação na agenda.
 * @param {Object} automation - Objeto com id, name, emoji, action, nextAt, channelId, frequency, scope (opcional)
 */
function registerAutomation(automation) {
  if (!automation || !automation.id) return;
  const entry = {
    scope: 'global',
    frequency: 'sob demanda',
    ...automation,
  };
  automations.set(entry.id, entry);
}

/**
 * Remove uma automação da agenda (prevenção de memory leaks em unloads de módulos).
 * @param {string} id - Identificador da automação
 */
function unregisterAutomation(id) {
  return automations.delete(id);
}

/**
 * Atualiza campos de uma automação existente.
 * @param {string} id - Identificador da automação
 * @param {Object} updates - Campos a atualizar
 */
function updateAutomation(id, updates) {
  const current = automations.get(id);
  if (current) {
    automations.set(id, { ...current, ...updates });
  }
}

/**
 * Retorna o cronograma ordenado de automações com tempo restante.
 * @param {number} [now=Date.now()] - Timestamp de referência
 * @param {string|null} [filterScope=null] - Filtrar por escopo ('global', 'cringelandia', etc.)
 * @returns {Array<Object>}
 */
function getAutomationSchedule(now = Date.now(), filterScope = null) {
  return [...automations.values()]
    .filter((auto) => !filterScope || auto.scope === filterScope || auto.scope === 'global')
    .map((automation) => ({
      ...automation,
      remainingMs: Math.max(0, automation.nextAt - now),
    }))
    .sort((left, right) => left.nextAt - right.nextAt);
}

/**
 * Limpa todas as automações em memória (útil para testes unitários).
 */
function clearAutomations() {
  automations.clear();
}

module.exports = {
  clearAutomations,
  getAutomationSchedule,
  registerAutomation,
  unregisterAutomation,
  updateAutomation,
};


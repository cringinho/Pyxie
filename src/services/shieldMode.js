// Modo blindagem (plano 5.7): segurar mensagens antes de aparecerem só é possível com o AutoMod nativo.
// A Pyxie cria e liga/desliga UMA regra de palavras-chave dela por servidor, com mensagem própria e
// canais isentos. Configuração em data/guilds/<guildId>/shield.json (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');

const RULE_NAME = 'Pyxie • Modo blindagem';
const MAX_TERMS = 1000; // limite do Discord para keyword_filter
const MAX_EXEMPT = 50;

function fileFor(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'shield.json');
}

function normalize(raw = {}) {
  const terms = [...new Set((Array.isArray(raw.terms) ? raw.terms : String(raw.terms || '').split(/[\n,]/))
    .map((t) => String(t).trim().toLowerCase().slice(0, 60))
    .filter(Boolean))].slice(0, MAX_TERMS);
  return {
    enabled: Boolean(raw.enabled),
    terms,
    exemptChannelIds: [...new Set((raw.exemptChannelIds || []).map(String).filter((id) => /^\d{17,20}$/.test(id)))].slice(0, MAX_EXEMPT),
    customMessage: String(raw.customMessage || '').slice(0, 150),
    ruleId: /^\d{17,20}$/.test(String(raw.ruleId || '')) ? String(raw.ruleId) : null,
    updatedAt: Number(raw.updatedAt) || 0,
  };
}

function getShield(guildId) {
  try {
    return normalize(JSON.parse(fs.readFileSync(fileFor(guildId), 'utf8')));
  } catch (_) {
    return normalize({});
  }
}

function saveShield(guildId, cfg) {
  const file = fileFor(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(cfg, null, 2));
  fs.renameSync(`${file}.tmp`, file);
  return cfg;
}

function buildRuleBody(cfg, defaultMessage) {
  return {
    name: RULE_NAME,
    event_type: 1, // MESSAGE_SEND
    trigger_type: 1, // KEYWORD
    trigger_metadata: { keyword_filter: cfg.terms.length ? cfg.terms : ['pyxie-blindagem-sem-termos'] },
    actions: [{ type: 1, metadata: { custom_message: cfg.customMessage || defaultMessage } }], // BLOCK_MESSAGE
    enabled: cfg.enabled && cfg.terms.length > 0,
    exempt_channels: cfg.exemptChannelIds,
  };
}

/**
 * Salva a configuração e sincroniza a regra no Discord (precisa de Gerenciar Servidor).
 * discord(method, route, body) é o cliente REST (messageStudioStore.discord) — injetável nos testes.
 */
async function applyShield(guildId, input, { discord, defaultMessage }) {
  const current = getShield(guildId);
  const cfg = normalize({ ...current, ...input, ruleId: current.ruleId, updatedAt: Date.now() });
  const body = buildRuleBody(cfg, defaultMessage);
  let rule = null;
  if (cfg.ruleId) {
    rule = await discord('PATCH', `/guilds/${guildId}/auto-moderation/rules/${cfg.ruleId}`, body).catch((err) => {
      if (err.status === 404) return null;
      throw err;
    });
  }
  if (!rule) {
    // Regra apagada à mão ou primeira vez: procura pelo nome antes de criar outra.
    const rules = await discord('GET', `/guilds/${guildId}/auto-moderation/rules`);
    const existing = (rules || []).find((r) => r.name === RULE_NAME);
    rule = existing
      ? await discord('PATCH', `/guilds/${guildId}/auto-moderation/rules/${existing.id}`, body)
      : await discord('POST', `/guilds/${guildId}/auto-moderation/rules`, body);
  }
  cfg.ruleId = rule.id;
  return saveShield(guildId, cfg);
}

module.exports = { RULE_NAME, getShield, applyShield, buildRuleBody, normalize };

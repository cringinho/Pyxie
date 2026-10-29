// Opções de personalização dos tickets por servidor (guardadas em guildConfigs.json, campo `ticketOptions`).
// Fonte única dos padrões e limites: o painel, a ponte com o bot e o próprio módulo passam por aqui.
// Campos ausentes valem o padrão, então servidores configurados antes continuam iguais.
const { CRINGELANDIA_GUILD_ID, MUSEUM_REMOVAL_CHANNEL_ID } = require('../../config/scopes');

const TICKET_TYPES = ['help', 'report'];
const SNOWFLAKE_RE = /^\d{17,20}$/;

const LIMITS = {
  maxOpenPerUser: { min: 1, max: 5, default: 2 },
  staffRoles: 10,
  label: 40,
  description: 200,
  panelTitle: 200,
  panelIntro: 1500,
  panelFooter: 120,
  roomMessage: 1500,
};
const VALID_STYLES = ['primary', 'secondary', 'success', 'danger'];

function isCringelandia(guildId) {
  return String(guildId) === String(CRINGELANDIA_GUILD_ID);
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : '';
}

function clampInt(value, { min, max, default: def }) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

function cleanIds(list, max) {
  return [...new Set((Array.isArray(list) ? list : []).map(String).filter((id) => SNOWFLAKE_RE.test(id)))].slice(0, max);
}

/**
 * Normaliza as opções de um servidor. A Remoção de Conteúdo do Museu só existe na Cringelândia:
 * em qualquer outro servidor ela some do resultado, mesmo que venha no pedido.
 */
function normalizeTicketOptions(guildId, input = {}) {
  const src = input && typeof input === 'object' ? input : {};
  const types = {};
  const defaultStyle = { help: 'primary', report: 'danger' };
  const defaultEmoji = { help: '🆘', report: '🚨' };
  for (const type of TICKET_TYPES) {
    const raw = src.types?.[type] || {};
    types[type] = {
      enabled: raw.enabled !== false,
      label: cleanText(raw.label, LIMITS.label),
      description: cleanText(raw.description, LIMITS.description),
      style: VALID_STYLES.includes(raw.style) ? raw.style : defaultStyle[type],
      emoji: cleanText(raw.emoji, 32) || defaultEmoji[type],
    };
  }
  const hex = String(src.panelColor || '#8b5cf6').trim().toLowerCase();
  const options = {
    maxOpenPerUser: clampInt(src.maxOpenPerUser, LIMITS.maxOpenPerUser),
    staffRoleIds: cleanIds(src.staffRoleIds, LIMITS.staffRoles),
    dmTranscript: src.dmTranscript !== false,
    pingStaffOnOpen: src.pingStaffOnOpen === true,
    closeConfirmation: src.closeConfirmation !== false,
    panelColor: /^#[0-9a-f]{6}$/.test(hex) ? hex : '#8b5cf6',
    panelTitle: cleanText(src.panelTitle, LIMITS.panelTitle),
    panelIntro: cleanText(src.panelIntro, LIMITS.panelIntro),
    panelFooter: cleanText(src.panelFooter, LIMITS.panelFooter),
    roomMessage: cleanText(src.roomMessage, LIMITS.roomMessage),
    types,
  };

  if (isCringelandia(guildId)) {
    const art = src.artRemoval || {};
    const channelId = String(art.channelId || '');
    options.artRemoval = {
      enabled: art.enabled !== false,
      channelId: SNOWFLAKE_RE.test(channelId) ? channelId : MUSEUM_REMOVAL_CHANNEL_ID,
    };
  }

  // O painel precisa de pelo menos um botão
  const anyType = TICKET_TYPES.some((type) => options.types[type].enabled);
  if (!anyType && !options.artRemoval?.enabled) options.types.help.enabled = true;
  return options;
}

module.exports = {
  TICKET_TYPES,
  LIMITS,
  isCringelandia,
  normalizeTicketOptions,
};

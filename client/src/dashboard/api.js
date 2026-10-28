// Chamadas à API do painel. Pedidos que mudam algo levam o cabeçalho X-Pyxie-Panel (proteção CSRF).
export class ApiError extends Error {
  constructor(code, status, data = {}) {
    super(code);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { 'X-Pyxie-Panel': '1' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok || data.success === false) throw new ApiError(data.error || `http_${res.status}`, res.status, data);
  return data;
}

export const api = {
  appeals: () => request('/api/dashboard/appeals'),
  sendAppeal: (guildId, text) => request(`/api/dashboard/appeals/${guildId}`, { method: 'POST', body: { text } }),
  me: () => request('/api/dashboard/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  guild: (id) => request(`/api/dashboard/guilds/${id}`),
  channels: (id) => request(`/api/dashboard/guilds/${id}/channels`),
  roles: (id) => request(`/api/dashboard/guilds/${id}/roles`),
  features: (id) => request(`/api/dashboard/guilds/${id}/features`),
  saveFeatures: (id, body) => request(`/api/dashboard/guilds/${id}/features`, { method: 'PUT', body }),
  access: (id) => request(`/api/dashboard/guilds/${id}/access`),
  saveAccess: (id, body) => request(`/api/dashboard/guilds/${id}/access`, { method: 'PUT', body }),
  studioList: (id) => request(`/api/dashboard/guilds/${id}/studio`),
  studioEmojis: (id) => request(`/api/dashboard/guilds/${id}/studio-emojis`),
  studioGet: (id, msg) => request(`/api/dashboard/guilds/${id}/studio/${msg}`),
  studioSave: (id, msg, body) => request(`/api/dashboard/guilds/${id}/studio/${msg}`, { method: 'PUT', body }),
  studioDelete: (id, msg) => request(`/api/dashboard/guilds/${id}/studio/${msg}`, { method: 'DELETE' }),
  studioRestore: (id, msg, index) => request(`/api/dashboard/guilds/${id}/studio/${msg}/restore`, { method: 'POST', body: { index } }),
  studioSend: (id, msg, channelId) => request(`/api/dashboard/guilds/${id}/studio/${msg}/send`, { method: 'POST', body: { channelId } }),
  studioUpdateSent: (id, msg) => request(`/api/dashboard/guilds/${id}/studio/${msg}/update-sent`, { method: 'POST', body: {} }),
  studioPreview: (id, msg) => request(`/api/dashboard/guilds/${id}/studio/${msg}/preview`, { method: 'POST', body: {} }),
  partnershipDm: (id) => request(`/api/dashboard/guilds/${id}/partnership-dm`),
  savePartnershipDm: (id, body) => request(`/api/dashboard/guilds/${id}/partnership-dm`, { method: 'PUT', body }),
  activity: (id) => request(`/api/dashboard/guilds/${id}/activity`),
  botPermissions: (id) => request(`/api/dashboard/guilds/${id}/bot-permissions`),
  security: (id) => request(`/api/dashboard/guilds/${id}/security`),
  saveSecurity: (id, body) => request(`/api/dashboard/guilds/${id}/security`, { method: 'PUT', body }),
  moderation: (id) => request(`/api/dashboard/guilds/${id}/moderation`),
  saveShield: (id, body) => request(`/api/dashboard/guilds/${id}/moderation/shield`, { method: 'PUT', body }),
  saveConflict: (id, body) => request(`/api/dashboard/guilds/${id}/moderation/conflict`, { method: 'PUT', body }),
  links: () => request('/api/dashboard/global/links'),
  addLink: (body) => request('/api/dashboard/global/links', { method: 'POST', body }),
  removeLink: (id) => request(`/api/dashboard/global/links/${id}`, { method: 'DELETE' }),
  testLink: (id) => request(`/api/dashboard/global/links/${id}/test`, { method: 'POST', body: {} }),
  community: (id) => request(`/api/dashboard/guilds/${id}/community`),
  saveCommunity: (id, body) => request(`/api/dashboard/guilds/${id}/community`, { method: 'PUT', body }),
  assets: () => request('/api/dashboard/global/assets'),
  saveAsset: (body) => request('/api/dashboard/global/assets', { method: 'PUT', body }),
  embeds: (id) => request(`/api/dashboard/guilds/${id}/embeds`),
  saveEmbedsGlobal: (id, emojiSwaps) => request(`/api/dashboard/guilds/${id}/embeds-global`, { method: 'PUT', body: { emojiSwaps } }),
  embed: (id, key) => request(`/api/dashboard/guilds/${id}/embeds/${key}`),
  previewEmbed: (id, key, override) => request(`/api/dashboard/guilds/${id}/embeds/${key}/preview`, { method: 'POST', body: { override } }),
  saveEmbed: (id, key, override) => request(`/api/dashboard/guilds/${id}/embeds/${key}`, { method: 'PUT', body: { override } }),
  resetEmbed: (id, key) => request(`/api/dashboard/guilds/${id}/embeds/${key}`, { method: 'DELETE' }),
  updateSentEmbed: (id, key) => request(`/api/dashboard/guilds/${id}/embeds/${key}/update-sent`, { method: 'POST', body: {} }),
  publishColors:(id, channelId) => request(`/api/dashboard/guilds/${id}/colors/publish`, { method: 'POST', body: { channelId } }),
  servers: () => request('/api/dashboard/global/servers'),
  shopee: () => request('/api/admin/shopee'),
  shopeeAdd: (body) => request('/api/admin/shopee/add', { method: 'POST', body }),
  shopeePreview: (url) => request('/api/admin/shopee/preview-link', { method: 'POST', body: { url } }),
  shopeeToggle: (id, active) => request('/api/admin/shopee/toggle', { method: 'POST', body: { id, active } }),
  shopeeCheckAll: () => request('/api/admin/shopee/check', { method: 'POST', body: { checkAll: true } }),
  shopeeSyncImages: () => request('/api/admin/shopee/sync-all-images', { method: 'POST', body: {} }),
  shopeeSyncImage: (id) => request('/api/admin/shopee/sync-image', { method: 'POST', body: { id } }),
  shopeeDelete: (id) => request(`/api/admin/shopee/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  embedSlots: () => request('/api/admin/embeds'),
  saveEmbedSlot: (embedId, slotKey, emojiId) => request('/api/admin/embeds/slot', { method: 'POST', body: { embedId, slotKey, emojiId } }),
  seasonalConfig: () => request('/api/admin/sazonal/config'),
  saveSeasonalConfig: (body) => request('/api/admin/sazonal/config', { method: 'POST', body }),
  seasonalDrops: () => request('/api/admin/sazonal/drops-info'),
  seasonalToggle: (active, broadcast) => request('/api/admin/sazonal/toggle', { method: 'POST', body: { active, broadcast } }),
  seasonalTrigger: (kind, body = {}) => request(`/api/admin/sazonal/trigger-${kind}`, { method: 'POST', body }),
  seasonalRestrictions: () => request('/api/admin/sazonal/restrictions'),
  seasonalRestrict: (action, body) => request(`/api/admin/sazonal/restrictions/${action}`, { method: 'POST', body }),
  seasonalReset: (userId) => request('/api/admin/sazonal/reset-user', { method: 'POST', body: { userId } }),
  partnershipConfig: () => request('/api/admin/modules/partnerships/config'),
  savePartnershipConfig: (body) => request('/api/admin/modules/partnerships/config', { method: 'POST', body }),
  partnerPostPanel: () => request('/api/admin/modules/partnerships/post-panel', { method: 'POST', body: {} }),
  partnerItems: () => request('/api/admin/modules/partnerships/items'),
  updatePartner: (id, body) => request(`/api/admin/modules/partnerships/items/${encodeURIComponent(id)}`, { method: 'PUT', body }),
  deletePartner: (id) => request(`/api/admin/modules/partnerships/items/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  blacklist: () => request('/api/admin/trust/blacklist'),
  redFlags: () => request('/api/admin/trust/red-flags'),
  blockTarget: (body) => request('/api/admin/trust/blacklist', { method: 'POST', body }),
  unblockTarget: (body) => request('/api/admin/trust/unblacklist', { method: 'POST', body }),
  botConfig: () => request('/api/config'),
  saveEconomy: (minimum, maximum) => request('/api/config/economy', { method: 'POST', body: { minimum, maximum } }),
  museumArts: (page, q) => request(`/api/admin/modules/museum/arts?page=${page}&limit=24&q=${encodeURIComponent(q || '')}`),
  museumEdit: (id, body) => request(`/api/admin/modules/museum/art/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
  museumDelete: (id) => request(`/api/admin/modules/museum/art/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  museumHarvest: (limit) => request('/api/admin/modules/museum/harvester/trigger', { method: 'POST', body: { limit } }),
  health: () => request('/api/dashboard/global/health'),
  errors: (window) => request(`/api/dashboard/global/errors?window=${window}`),
  modules: () => request('/api/dashboard/global/modules'),
  moduleConfig: (id) => request(`/api/admin/modules/${encodeURIComponent(id)}/config`),
  saveModuleConfig: (id, body) => request(`/api/admin/modules/${encodeURIComponent(id)}/config`, { method: 'POST', body }),
  toggleModule: (id, enabled) => request(`/api/dashboard/global/modules/${id}/toggle`, { method: 'POST', body: { enabled } }),
};

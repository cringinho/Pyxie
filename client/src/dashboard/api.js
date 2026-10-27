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
  health: () => request('/api/dashboard/global/health'),
  errors: (window) => request(`/api/dashboard/global/errors?window=${window}`),
  modules: () => request('/api/dashboard/global/modules'),
  toggleModule: (id, enabled) => request(`/api/dashboard/global/modules/${id}/toggle`, { method: 'POST', body: { enabled } }),
};

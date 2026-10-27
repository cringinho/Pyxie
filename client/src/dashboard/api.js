// Chamadas à API do painel. Pedidos que mudam algo levam o cabeçalho X-Pyxie-Panel (proteção CSRF).
export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
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
  if (!res.ok || data.success === false) throw new ApiError(data.error || `http_${res.status}`, res.status);
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
  health: () => request('/api/dashboard/global/health'),
  errors: (window) => request(`/api/dashboard/global/errors?window=${window}`),
  modules: () => request('/api/dashboard/global/modules'),
  toggleModule: (id, enabled) => request(`/api/dashboard/global/modules/${id}/toggle`, { method: 'POST', body: { enabled } }),
};

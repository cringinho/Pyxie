// Login com Discord (OAuth2, authorization code). Escopos: identify guilds. Nunca pede email.
const { DISCORD_CLIENT_ID } = require('../config');

const API = 'https://discord.com/api/v10';
const SCOPES = 'identify guilds';

function getPublicUrl() {
  return (process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
}

function getRedirectUri() {
  return `${getPublicUrl()}/auth/discord/callback`;
}

function isConfigured() {
  return Boolean(process.env.DISCORD_CLIENT_SECRET && (process.env.PANEL_SECRET || process.env.API_SECRET_TOKEN));
}

function buildAuthorizeUrl(state) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    state,
    prompt: 'none',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// fetchImpl é injetável para os testes.
async function exchangeCode(code, fetchImpl = fetch) {
  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  });
  const res = await fetchImpl(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`oauth_token_${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error('oauth_token_missing');
  return data.access_token;
}

async function fetchProfile(accessToken, fetchImpl = fetch) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const [userRes, guildsRes] = await Promise.all([
    fetchImpl(`${API}/users/@me`, { headers }),
    fetchImpl(`${API}/users/@me/guilds`, { headers }),
  ]);
  if (!userRes.ok) throw new Error(`oauth_user_${userRes.status}`);
  if (!guildsRes.ok) throw new Error(`oauth_guilds_${guildsRes.status}`);
  return { user: await userRes.json(), guilds: await guildsRes.json() };
}

// Revoga o token logo depois de ler o perfil: ele não é guardado em lugar nenhum.
async function revokeToken(accessToken, fetchImpl = fetch) {
  try {
    await fetchImpl(`${API}/oauth2/token/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        token: accessToken,
        token_type_hint: 'access_token',
      }),
    });
  } catch (_) {}
}

module.exports = { getRedirectUri, getPublicUrl, isConfigured, buildAuthorizeUrl, exchangeCode, fetchProfile, revokeToken };

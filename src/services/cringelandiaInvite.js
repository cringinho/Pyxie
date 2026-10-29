/**
 * Convite e dados ao vivo da Cringelândia para o site (/discord, /api/cringelandia/live-guild).
 *
 * Convites fixos no código expiram (discord.gg/b3uZK3ssfX e discord.gg/cringelandia morreram),
 * então o convite vem do widget do servidor, que o Discord renova sozinho. Se existir
 * CRINGELANDIA_INVITE_URL (um convite permanente criado no servidor), ele tem prioridade.
 * Os detalhes do convite trazem ícone e contagem de membros, que o widget não manda.
 */

const GUILD_ID = '1453890868980482090';
const CACHE_MS = 60 * 1000;
const UA = { 'User-Agent': 'Pyxie-Bot/1.0 (+https://pyxie.com.br)' };

let fetchImpl = (...args) => fetch(...args);
let cache = { data: null, fetchedAt: 0 };

/** Para os testes trocarem a rede por respostas prontas. */
function setFetch(fn) {
  fetchImpl = fn || ((...args) => fetch(...args));
  cache = { data: null, fetchedAt: 0 };
}

async function getJson(url) {
  const res = await fetchImpl(url, { headers: UA, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
  return res.json();
}

function inviteCode(url) {
  const match = String(url || '').match(/(?:discord\.gg|discord(?:app)?\.com\/invite)\/([\w-]+)/i);
  return match ? match[1] : null;
}

/** Widget + detalhes do convite, em cache por 1 minuto. Sem rede, devolve o último que deu certo. */
async function getLiveGuild(now = Date.now()) {
  if (cache.data && now - cache.fetchedAt < CACHE_MS) return cache.data;
  try {
    const widget = await getJson(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);
    const inviteUrl = process.env.CRINGELANDIA_INVITE_URL || widget.instant_invite || null;
    const code = inviteCode(inviteUrl);
    const invite = code ? await getJson(`https://discord.com/api/v10/invites/${code}?with_counts=true`).catch(() => null) : null;
    const icon = invite?.guild?.icon;
    const data = {
      id: GUILD_ID,
      name: invite?.guild?.name || widget.name,
      instant_invite: inviteUrl,
      presence_count: invite?.approximate_presence_count ?? widget.presence_count ?? null,
      member_count: invite?.approximate_member_count ?? null,
      icon_url: icon ? `https://cdn.discordapp.com/icons/${GUILD_ID}/${icon}.${icon.startsWith('a_') ? 'gif' : 'png'}?size=256` : null,
      members: Array.isArray(widget.members) ? widget.members : [],
    };
    cache = { data, fetchedAt: now };
    return data;
  } catch (_) {
    if (cache.data) return { ...cache.data, stale: true };
    return null;
  }
}

/** Para onde o /discord manda: convite vivo; sem nenhum, a página da Cringelândia. */
async function getInviteUrl(now = Date.now()) {
  if (process.env.CRINGELANDIA_INVITE_URL) return process.env.CRINGELANDIA_INVITE_URL;
  const guild = await getLiveGuild(now);
  return guild?.instant_invite || null;
}

module.exports = { GUILD_ID, setFetch, inviteCode, getLiveGuild, getInviteUrl };

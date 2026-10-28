// Cargos de cor (plano 5.13): substitui o Dyno e o Carl no canal de cores com 75 cores.
// - Catálogo em src/data/colorRoles.json (n, nome, hex). Os cargos que já existem são reaproveitados
//   (pelo mapa salvo, pelo número antigo "NN Nome" ou pelo nome) e renomeados para o nome sem número;
//   os que faltam são criados logo abaixo deles.
// - Mapa número → cargo em data/guilds/<guildId>/colorRoles.json.
// - Painel: 3 embeds em duas colunas com menus de 25 cores (limite do Discord por menu) e um botão
//   para tirar a cor. Publicar de novo edita o painel que já está no canal.
const fs = require('node:fs');
const path = require('node:path');
const { t } = require('../utils/i18n');

const GROUP_SIZE = 25;
const CATALOG = require('../data/colorRoles.json').colors;

function mapFile(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'colorRoles.json');
}

function loadMap(guildId) {
  try {
    return JSON.parse(fs.readFileSync(mapFile(guildId), 'utf8')).roles || {};
  } catch (_) {
    return {};
  }
}

function saveMap(guildId, roles) {
  const file = mapFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ roles }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

const hexToInt = (hex) => parseInt(hex.replace('#', ''), 16);

// O Discord limita edições em sequência: espera e tenta de novo quando recebe 429.
async function withRetry(call, tries = 5) {
  for (let i = 0; ; i++) {
    try {
      return await call();
    } catch (err) {
      if (err.status !== 429 || i >= tries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
}

/**
 * Garante os 75 cargos com o nome do catálogo (sem número). discord(method, route, body) é o cliente
 * REST (messageStudioStore.discord). Devolve { created, reused, renamed, roles }.
 */
async function syncRoles(guildId, discord) {
  const existing = await discord('GET', `/guilds/${guildId}/roles`);
  const byId = new Map(existing.map((r) => [r.id, r]));
  const byNumber = new Map();
  const byName = new Map();
  for (const r of existing) {
    const m = r.name.match(/^(\d{1,2})\s/);
    if (m && !byNumber.has(Number(m[1]))) byNumber.set(Number(m[1]), r);
    if (!byName.has(r.name)) byName.set(r.name, r);
  }
  const saved = loadMap(guildId);
  const map = {};
  const created = [];
  const anchors = [];
  let reused = 0;
  let renamed = 0;
  for (const c of CATALOG) {
    const found = byId.get(saved[c.n]) || byNumber.get(c.n) || byName.get(c.name);
    if (found) {
      map[c.n] = found.id;
      anchors.push(found.position);
      reused++;
      if (found.name !== c.name) {
        await withRetry(() => discord('PATCH', `/guilds/${guildId}/roles/${found.id}`, { name: c.name }));
        renamed++;
      }
      continue;
    }
    const role = await withRetry(() => discord('POST', `/guilds/${guildId}/roles`, { name: c.name, color: hexToInt(c.hex), hoist: false, mentionable: false, permissions: '0' }));
    map[c.n] = role.id;
    created.push(role);
  }
  // Os novos vão logo abaixo da última cor antiga: a cor de um cargo só aparece se ele estiver acima
  // dos outros cargos coloridos da pessoa.
  if (created.length) {
    const base = anchors.length ? Math.min(...anchors) : 1;
    const positions = created.map((role, i) => ({ id: role.id, position: Math.max(1, base - 1 - i) }));
    await discord('PATCH', `/guilds/${guildId}/roles`, positions).catch(() => null);
  }
  saveMap(guildId, map);
  return { created: created.length, reused, renamed, roles: map };
}

// Mensagens do painel (API JSON pronta para POST). lang 'pt' ou 'en'.
function buildPanel(guildId, lang = 'pt') {
  const map = loadMap(guildId);
  const messages = [];
  const total = Math.ceil(CATALOG.length / GROUP_SIZE);
  for (let g = 0; g < total; g++) {
    const group = CATALOG.slice(g * GROUP_SIZE, (g + 1) * GROUP_SIZE);
    // Duas colunas em ordem crescente (de cima para baixo, depois a da direita), uma cor por linha.
    const line = (c) => (map[c.n] ? `<@&${map[c.n]}>` : c.name);
    const half = Math.ceil(group.length / 2);
    const columns = [group.slice(0, half), group.slice(half)].filter((col) => col.length);
    messages.push({
      embeds: [
        {
          color: hexToInt(group[Math.floor(group.length / 2)].hex),
          title: t('colors.groupTitle', lang, { part: g + 1, total }),
          // Painel fixo: a pixel art da Pyxie decora só o primeiro bloco.
          ...(g === 0 ? { description: t('colors.intro', lang), thumbnail: { url: require('./embedOverrides').THUMBS.pixel } } : {}),
          fields: columns.map((col) => ({ name: '​', value: col.map(line).join('\n'), inline: true })),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: `colors:pick:${g}`,
              placeholder: t('colors.placeholder', lang, { part: g + 1, total }),
              min_values: 1,
              max_values: 1,
              options: group.map((c) => ({ label: c.name.slice(0, 100), value: String(c.n) })),
            },
          ],
        },
      ],
      allowed_mentions: { parse: [] },
    });
  }
  messages.push({
    embeds: [{ color: 0x8b5cf6, title: t('colors.removeTitle', lang), description: t('colors.removeDesc', lang) }],
    components: [{ type: 1, components: [{ type: 2, style: 2, label: t('colors.removeButton', lang), emoji: { name: '🧽' }, custom_id: 'colors:clear' }] }],
    allowed_mentions: { parse: [] },
  });
  return messages;
}

const isPanelMessage = (m) => m.author?.bot && (m.components || []).some((row) => (row.components || []).some((c) => String(c.custom_id || '').startsWith('colors:')));

/**
 * Publica o painel. Se o painel completo já estiver entre as últimas mensagens do canal, edita no lugar
 * (mesmos links e mesma posição); senão, envia um novo. Devolve { messages, edited }.
 */
async function publishPanel(guildId, channelId, discord, lang = 'pt') {
  const panel = buildPanel(guildId, lang);
  const recent = await discord('GET', `/channels/${channelId}/messages?limit=50`).catch(() => []);
  const current = (Array.isArray(recent) ? recent : []).filter(isPanelMessage).sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
  const edited = current.length === panel.length;
  for (const [i, message] of panel.entries()) {
    if (edited) await withRetry(() => discord('PATCH', `/channels/${channelId}/messages/${current[i].id}`, message));
    else await withRetry(() => discord('POST', `/channels/${channelId}/messages`, message));
  }
  return { messages: panel.length, edited };
}

function colorRoleIds(guildId) {
  return Object.values(loadMap(guildId));
}

function catalogEntry(n) {
  return CATALOG.find((c) => c.n === Number(n)) || null;
}

module.exports = { CATALOG, GROUP_SIZE, syncRoles, buildPanel, publishPanel, loadMap, colorRoleIds, catalogEntry };

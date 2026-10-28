// Cargos de cor (plano 5.13): substitui o Dyno e o Carl no canal de cores com 75 cores.
// - Catálogo em src/data/colorRoles.json (n, nome, hex). Os cargos 1–51 que já existem no servidor
//   ("NN Nome") são reaproveitados pelo número; os que faltam são criados logo abaixo deles.
// - Mapa número → cargo em data/guilds/<guildId>/colorRoles.json.
// - Painel: 3 embeds com menus de 25 cores (limite do Discord por menu) e um botão para tirar a cor.
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

const pad = (n) => String(n).padStart(2, '0');
const hexToInt = (hex) => parseInt(hex.replace('#', ''), 16);

/**
 * Garante os 75 cargos. discord(method, route, body) é o cliente REST (messageStudioStore.discord).
 * Devolve { created, reused, roles }.
 */
async function syncRoles(guildId, discord) {
  const existing = await discord('GET', `/guilds/${guildId}/roles`);
  const byNumber = new Map();
  for (const r of existing) {
    const m = r.name.match(/^(\d{1,2})\s/);
    if (m && !byNumber.has(Number(m[1]))) byNumber.set(Number(m[1]), r);
  }
  const map = {};
  const created = [];
  let reused = 0;
  for (const c of CATALOG) {
    const found = byNumber.get(c.n);
    if (found) {
      map[c.n] = found.id;
      reused++;
      continue;
    }
    const role = await discord('POST', `/guilds/${guildId}/roles`, { name: `${c.n} ${c.name}`, color: hexToInt(c.hex), hoist: false, mentionable: false, permissions: '0' });
    map[c.n] = role.id;
    created.push(role);
  }
  // Os novos vão logo abaixo da última cor antiga: a cor de um cargo só aparece se ele estiver acima
  // dos outros cargos coloridos da pessoa.
  if (created.length) {
    const anchors = CATALOG.filter((c) => byNumber.has(c.n)).map((c) => byNumber.get(c.n).position);
    const base = anchors.length ? Math.min(...anchors) : 1;
    const positions = created.map((role, i) => ({ id: role.id, position: Math.max(1, base - 1 - i) }));
    await discord('PATCH', `/guilds/${guildId}/roles`, positions).catch(() => null);
  }
  saveMap(guildId, map);
  return { created: created.length, reused, roles: map };
}

// Mensagens do painel (API JSON pronta para POST). lang 'pt' ou 'en'.
function buildPanel(guildId, lang = 'pt') {
  const map = loadMap(guildId);
  const messages = [];
  for (let g = 0; g * GROUP_SIZE < CATALOG.length; g++) {
    const group = CATALOG.slice(g * GROUP_SIZE, (g + 1) * GROUP_SIZE);
    // Blocos de 5 por parágrafo: legível no celular sem virar uma lista de 25 linhas.
    const blocks = [];
    for (let i = 0; i < group.length; i += 5) {
      blocks.push(group.slice(i, i + 5).map((c) => `\`${pad(c.n)}\` ${map[c.n] ? `<@&${map[c.n]}>` : c.name}`).join('  ·  '));
    }
    const first = group[0].n;
    const last = group[group.length - 1].n;
    messages.push({
      embeds: [
        {
          color: hexToInt(group[Math.floor(group.length / 2)].hex),
          title: t('colors.groupTitle', lang, { from: pad(first), to: pad(last) }),
          description: [g === 0 ? t('colors.intro', lang) : null, ...blocks].filter(Boolean).join('\n\n'),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: `colors:pick:${g}`,
              placeholder: t('colors.placeholder', lang, { from: pad(first), to: pad(last) }),
              min_values: 1,
              max_values: 1,
              options: group.map((c) => ({ label: `${pad(c.n)} ${c.name}`.slice(0, 100), value: String(c.n) })),
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

function colorRoleIds(guildId) {
  return Object.values(loadMap(guildId));
}

function catalogEntry(n) {
  return CATALOG.find((c) => c.n === Number(n)) || null;
}

module.exports = { CATALOG, GROUP_SIZE, syncRoles, buildPanel, loadMap, colorRoleIds, catalogEntry };

const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { getThemeEmojiData } = require('./themeEmojis');
const { getEmoji, reloadEmojiConfig } = require('./appEmojis');
const { getLanguage } = require('./i18n');
const { emojify } = require('./emojify');

const EMOJIS_FILE = path.join(__dirname, '..', 'data', 'emojis.json');
const DISCORD_APP_EMOJIS_FILE = path.join(__dirname, '..', 'data', 'discordAppEmojis.json');

// Catálogo em memória dos Application Emojis da CDN
let appEmojiMap = new Map();
function loadAppEmojisCatalog() {
  try {
    if (fs.existsSync(DISCORD_APP_EMOJIS_FILE)) {
      const raw = fs.readFileSync(DISCORD_APP_EMOJIS_FILE, 'utf8');
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : (data.items || []);
      appEmojiMap.clear();
      for (const item of items) {
        if (item.id && item.name) {
          appEmojiMap.set(String(item.id), {
            id: String(item.id),
            name: item.name,
            animated: Boolean(item.animated),
            format: item.animated ? `<a:${item.name}:${item.id}>` : `<:${item.name}:${item.id}>`,
            url: `https://cdn.discordapp.com/emojis/${item.id}.${item.animated ? 'gif' : 'png'}`,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[embedRegistry] Aviso ao carregar catálogo de emojis da aplicação:', err.message);
  }
}
loadAppEmojisCatalog();

// Cache em memória das customizações salvas pelo Dono
let customEmojisCache = {};
function loadCustomEmojis() {
  try {
    if (fs.existsSync(EMOJIS_FILE)) {
      customEmojisCache = JSON.parse(fs.readFileSync(EMOJIS_FILE, 'utf8')) || {};
    } else {
      customEmojisCache = {};
    }
  } catch (_) {
    customEmojisCache = {};
  }
}
loadCustomEmojis();

/**
 * Registro central de schemas de embeds da Pyxie
 */
const EMBED_REGISTRY = new Map();

/**
 * Registra um schema de embed
 * @param {Object} schema
 */
function registerEmbed(schema) {
  if (!schema || !schema.id) {
    throw new Error('Embed schema inválido: propriedade "id" é obrigatória.');
  }
  EMBED_REGISTRY.set(schema.id, {
    id: schema.id,
    name: schema.name || schema.id,
    category: schema.category || 'system',
    description: schema.description || '',
    defaultColor: schema.defaultColor || '#e60067',
    slots: Array.isArray(schema.slots) ? schema.slots : [],
    previewTitle: schema.previewTitle || schema.name || schema.id,
    previewDesc: schema.previewDesc || '',
    previewFields: Array.isArray(schema.previewFields) ? schema.previewFields : [],
  });
}

/**
 * Resolve o emoji configurado para um slot específico
 * @param {string} embedId
 * @param {Object} slotDef
 * @returns {{ id: string|null, format: string, url: string|null, name: string, animated: boolean }}
 */
function resolveSlotEmoji(embedId, slotDef) {
  const slotKey = slotDef.key;
  const specificKey = `${embedId}.${slotKey}`;
  const defaultKey = slotDef.defaultEmojiKey || slotKey;

  // 1. Busca customização específica do embed ou chave global
  let emojiId = customEmojisCache[specificKey] || customEmojisCache[slotKey] || customEmojisCache[defaultKey];

  // Regra Mandatória 4: Proibição estrita do portal de Minecraft
  if (emojiId === '1548444170488778954') {
    emojiId = '1551355962974273546';
  }

  // 2. Se achou emoji personalizado no catálogo oficial
  if (emojiId && appEmojiMap.has(String(emojiId))) {
    return appEmojiMap.get(String(emojiId));
  }

  if (emojiId) {
    return {
      id: String(emojiId),
      name: `emoji_${emojiId}`,
      animated: false,
      format: `<:emoji_${emojiId}:${emojiId}>`,
      url: `https://cdn.discordapp.com/emojis/${emojiId}.png`,
    };
  }

  // 3. Fallback para getThemeEmojiData / getEmoji
  if (slotDef.themeKey) {
    const themeData = getThemeEmojiData(slotDef.themeKey);
    if (themeData && themeData.id) return themeData;
  }

  const appFormat = getEmoji(defaultKey);
  const fallbackChar = slotDef.fallback || '✨';
  return {
    id: null,
    name: defaultKey,
    animated: false,
    format: appFormat && appFormat !== '✨' ? appFormat : fallbackChar,
    url: null,
  };
}

/**
 * Construtor reativo de EmbedBuilder
 * Substitui os slots e constrói o embed oficial da Pyxie pronto para envio
 * @param {string} embedId - ID registrado no schema
 * @param {Object} options - Dados dinâmicos do embed
 * @param {any} [source=null] - Mensagem ou interação para localização
 * @returns {EmbedBuilder & { resolvedEmojis: Record<string, string> }}
 */
function buildEmbed(embedId, options = {}, source = null) {
  const schema = EMBED_REGISTRY.get(embedId) || {
    id: embedId,
    defaultColor: '#e60067',
    slots: [],
  };

  const resolvedEmojis = {};
  const resolvedEmojiObjects = {};

  for (const slot of (schema.slots || [])) {
    const resolved = resolveSlotEmoji(embedId, slot);
    resolvedEmojis[slot.key] = resolved.format;
    resolvedEmojiObjects[slot.key] = resolved;
  }

  // Permite override de slots via options.slots
  if (options.slots) {
    for (const [key, val] of Object.entries(options.slots)) {
      resolvedEmojis[key] = val;
    }
  }

  // Constrói o EmbedBuilder
  const embed = new EmbedBuilder();
  const color = options.color || schema.defaultColor || '#e60067';
  embed.setColor(color);

  // Substitui placeholders nos textos
  const replaceSlots = (text) => {
    if (!text || typeof text !== 'string') return text;
    let res = text;
    for (const [k, v] of Object.entries(resolvedEmojis)) {
      res = res.replaceAll(`{${k}}`, v);
      res = res.replaceAll(`{${k}_emoji}`, v);
    }
    return res;
  };

  if (options.title) {
    embed.setTitle(replaceSlots(options.title));
  } else if (schema.previewTitle && options.useSchemaTitle) {
    embed.setTitle(replaceSlots(schema.previewTitle));
  }

  if (options.description) {
    embed.setDescription(replaceSlots(options.description));
  }

  if (Array.isArray(options.fields) && options.fields.length > 0) {
    embed.addFields(
      options.fields.map((f) => ({
        name: replaceSlots(f.name),
        value: replaceSlots(f.value),
        inline: Boolean(f.inline),
      }))
    );
  }

  if (options.footer) {
    if (typeof options.footer === 'string') {
      embed.setFooter({ text: replaceSlots(options.footer) });
    } else if (typeof options.footer === 'object' && options.footer.text) {
      embed.setFooter({
        text: replaceSlots(options.footer.text),
        iconURL: options.footer.iconURL || undefined,
      });
    }
  }

  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.url) embed.setURL(options.url);
  if (options.timestamp !== false) embed.setTimestamp();

  // Expõe os emojis resolvidos no próprio objeto
  embed.resolvedEmojis = resolvedEmojis;
  embed.resolvedEmojiObjects = resolvedEmojiObjects;

  return embed;
}

/**
 * Retorna todos os schemas cadastrados e com seus slots resolvidos para exibição no painel
 */
function getAllEmbedsWithResolvedSlots() {
  loadCustomEmojis();
  const list = [];
  for (const [id, schema] of EMBED_REGISTRY) {
    const slots = (schema.slots || []).map((s) => {
      const resolved = resolveSlotEmoji(id, s);
      const specificKey = `${id}.${s.key}`;
      const isCustomized = Boolean(customEmojisCache[specificKey] || customEmojisCache[s.key]);
      return {
        key: s.key,
        label: s.label || s.key,
        description: s.description || '',
        fallback: s.fallback || '✨',
        defaultEmojiKey: s.defaultEmojiKey || s.key,
        currentEmojiId: resolved.id,
        currentFormat: resolved.format,
        currentUrl: resolved.url,
        currentName: resolved.name,
        isCustomized,
      };
    });

    list.push({
      id: schema.id,
      name: schema.name,
      category: schema.category,
      description: schema.description,
      defaultColor: schema.defaultColor,
      slots,
      previewTitle: schema.previewTitle,
      previewDesc: schema.previewDesc,
      previewFields: schema.previewFields || [],
    });
  }
  return list;
}

/**
 * Retorna as configurações das moedas globais (coins e magicBeans)
 */
function getCurrenciesConfig() {
  loadCustomEmojis();
  const THEME_FILE = path.join(__dirname, '..', 'data', 'themeEmojis.json');
  let themeConfig = {};
  try {
    if (fs.existsSync(THEME_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(THEME_FILE, 'utf8'));
      themeConfig = parsed && parsed.themes ? parsed.themes : {};
    }
  } catch (_) {}

  const coinsId = customEmojisCache['coins'] || (themeConfig.coins && themeConfig.coins.primaryId) || '1548443880066777098';
  const beansId = customEmojisCache['magic_bean'] || (themeConfig.magicBeans && themeConfig.magicBeans.primaryId) || '1548444140532928642';

  const resolveItem = (key, name, desc, emojiId, defaultId, fallback) => {
    let resolved = null;
    if (emojiId && appEmojiMap.has(String(emojiId))) {
      resolved = appEmojiMap.get(String(emojiId));
    } else if (emojiId) {
      resolved = {
        id: String(emojiId),
        name: `emoji_${emojiId}`,
        animated: false,
        url: `https://cdn.discordapp.com/emojis/${emojiId}.png`,
        format: `<:emoji_${emojiId}:${emojiId}>`,
      };
    }
    return {
      key,
      name,
      description: desc,
      currentEmojiId: emojiId || defaultId,
      currentUrl: resolved ? resolved.url : `https://cdn.discordapp.com/emojis/${defaultId}.png`,
      currentName: resolved ? resolved.name : name,
      isAnimated: resolved ? resolved.animated : false,
      fallback,
      defaultId,
      isCustomized: Boolean(customEmojisCache[key === 'magicBeans' ? 'magic_bean' : 'coins']),
    };
  };

  return {
    coins: resolveItem('coins', 'Moedinhas da Pyxie', 'Moeda principal do bot para trabalho, daily, rankings e loja.', coinsId, '1548443880066777098', '🪙'),
    magicBeans: resolveItem('magicBeans', 'Feijões Mágicos', 'Recurso arcano raro obtido em bônus diários e eventos para rituais especiais.', beansId, '1548444140532928642', '🌱'),
  };
}

/**
 * Salva a alteração de emoji de uma currency global
 */
function saveCurrencyEmoji(currencyKey, emojiId) {
  loadCustomEmojis();
  let cleanId = emojiId ? String(emojiId).trim() : '';
  if (cleanId === '1548444170488778954') {
    cleanId = '1551355962974273546';
  }

  const THEME_FILE = path.join(__dirname, '..', 'data', 'themeEmojis.json');
  let themeJson = { themes: {} };
  try {
    if (fs.existsSync(THEME_FILE)) {
      themeJson = JSON.parse(fs.readFileSync(THEME_FILE, 'utf8'));
    }
  } catch (_) {}

  if (currencyKey === 'coins') {
    if (cleanId) customEmojisCache['coins'] = cleanId;
    else delete customEmojisCache['coins'];
    if (themeJson.themes && themeJson.themes.coins) {
      themeJson.themes.coins.primaryId = cleanId || '1548443880066777098';
    }
  } else if (currencyKey === 'magicBeans' || currencyKey === 'magic_bean' || currencyKey === 'beans') {
    if (cleanId) customEmojisCache['magic_bean'] = cleanId;
    else delete customEmojisCache['magic_bean'];
    if (themeJson.themes && themeJson.themes.magicBeans) {
      themeJson.themes.magicBeans.primaryId = cleanId || '1548444140532928642';
    }
  }

  // Grava ambos os arquivos de forma atômica
  const tmpEmojis = `${EMOJIS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpEmojis, JSON.stringify(customEmojisCache, null, 2), 'utf8');
  fs.renameSync(tmpEmojis, EMOJIS_FILE);

  if (themeJson.themes) {
    const tmpTheme = `${THEME_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpTheme, JSON.stringify(themeJson, null, 2), 'utf8');
    fs.renameSync(tmpTheme, THEME_FILE);
  }

  reloadRegistryCache();
  return { success: true, currencyKey, emojiId: cleanId };
}

/**
 * Salva a alteração de um slot de embed
 */
function saveEmbedSlotEmoji(embedId, slotKey, emojiId) {
  loadCustomEmojis();
  const key = `${embedId}.${slotKey}`;
  let cleanId = emojiId ? String(emojiId).trim() : '';
  if (cleanId === '1548444170488778954') {
    cleanId = '1551355962974273546';
  }

  if (cleanId) {
    customEmojisCache[key] = cleanId;
  } else {
    delete customEmojisCache[key];
  }

  const tmpEmojis = `${EMOJIS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpEmojis, JSON.stringify(customEmojisCache, null, 2), 'utf8');
  fs.renameSync(tmpEmojis, EMOJIS_FILE);
  reloadEmojiConfig();
  return { success: true, embedId, slotKey, emojiId: cleanId };
}

/**
 * Recarrega todos os caches em memória
 */
function reloadRegistryCache() {
  loadAppEmojisCatalog();
  loadCustomEmojis();
  reloadEmojiConfig();
}

/* ==========================================================================
   REGISTRO OFICIAL DOS SCHEMAS DE EMBEDS DA PYXIE
   ========================================================================== */

registerEmbed({
  id: 'work_crisis',
  name: '💼 Trabalho & Expediente (Crise)',
  category: 'economy',
  description: 'Embed principal do comando /py-work exibindo cenários técnicos, desafios e opções.',
  defaultColor: '#f43f5e',
  previewTitle: '{header} Expediente Técnico: Engenharia de Software',
  previewDesc: 'Um incidente crítico em produção exige sua tomada de decisão imediata!\nO pipeline de deploy quebrou e clientes estão enfrentando erros 502.',
  previewFields: [
    { name: '📋 Incidente Técnico', value: 'Falha no pod principal de autenticação durante atualização.', inline: false },
    { name: '💰 Remuneração Prevista', value: '35 {coins}', inline: true },
    { name: '⏱️ Tempo Limite', value: '90 segundos {timer}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '💼', defaultEmojiKey: 'work_career', description: 'Exibido no título da crise' },
    { key: 'coins', label: 'Moeda do Salário', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Ícone da moeda ganha ao acertar' },
    { key: 'timer', label: 'Ampulheta de Tempo', fallback: '⏰', defaultEmojiKey: 'CLOCK', description: 'Ícone indicando o tempo limite' },
    { key: 'success', label: 'Ícone de Sucesso', fallback: '✅', defaultEmojiKey: 'CHECK', description: 'Ícone quando o jogador acerta a questão' },
    { key: 'fail', label: 'Ícone de Falha', fallback: '❌', defaultEmojiKey: 'CROSS', description: 'Ícone quando o jogador erra' },
  ],
});

registerEmbed({
  id: 'quiz_question',
  name: '🎯 Quiz Cultural & Místico',
  category: 'minigames',
  description: 'Embed de perguntas do minigame /py-quiz com acúmulo de streak e prêmios.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Quiz Cultural da Pyxie (Rodada 3)',
  previewDesc: 'Responda corretamente para acumular moedas no cofre da guilda!\nQual elemento astrológico rege os signos de Câncer, Escorpião e Peixes?',
  previewFields: [
    { name: '🎯 Opções', value: '1️⃣ Fogo\n2️⃣ Água\n3️⃣ Ar\n4️⃣ Terra', inline: false },
    { name: '💰 Prêmio do Cofre', value: '10 {coins}', inline: true },
    { name: '⏱️ Tempo Restante', value: '30s {timer}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🎯', defaultEmojiKey: 'CONTROLLER', description: 'Exibido no título do quiz' },
    { key: 'coins', label: 'Moedas de Prêmio', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Ícone das moedas acumuladas' },
    { key: 'timer', label: 'Tempo Limite', fallback: '⏰', defaultEmojiKey: 'CLOCK', description: 'Tempo restante para responder' },
    { key: 'sparkles', label: 'Brilho Místico', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Efeito visual de streak e vitória' },
  ],
});

/**
 * Schemas dos minigames de quiz: textos de preview com os emojis do bot em vez de Unicode
 * (o mesmo critério dos embeds reais, via src/utils/emojify.js).
 */
function emojifySchema(schema) {
  return {
    ...schema,
    name: emojify(schema.name),
    previewTitle: emojify(schema.previewTitle),
    previewDesc: emojify(schema.previewDesc),
    previewFields: (schema.previewFields || []).map((f) => ({ ...f, name: emojify(f.name), value: emojify(f.value) })),
  };
}

registerEmbed(emojifySchema({
  id: 'quiz_duel',
  name: '⚔️ Duelo de Quiz',
  category: 'minigames',
  description: 'Embed do /py-duel: desafio PvP melhor de 3, rodadas e resultado final com prêmio limitado.',
  defaultColor: '#9b5de5',
  previewTitle: '{header} Duelo de Quiz: Rodada 2/3',
  previewDesc: '> ✅ **Rodada 1:** `<@111>` acertou! Resposta: **Kurama**\n\n### ❓ Qual é o princípio fundamental da alquimia em Fullmetal Alchemist?\n\n**[A]** Pedra Filosofal\n\n**[B]** Troca Equivalente\n\n**[C]** Portão da Verdade\n\n**[D]** Transmutação Humana',
  previewFields: [
    { name: '📊 Placar', value: '`<@111>` `1` x `0` `<@222>`', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '⚔️', defaultEmojiKey: '54416purplepixelknife', description: 'Exibido no título do duelo' },
    { key: 'coins', label: 'Moedas do Prêmio', fallback: '🪙', defaultEmojiKey: 'COIN', description: 'Prêmio do vencedor' },
  ],
}));

registerEmbed(emojifySchema({
  id: 'daily_challenge',
  name: '🧩 Desafio do Dia',
  category: 'minigames',
  description: 'Embed privado do /py-challenge: pergunta diária igual para todos, sequência e prêmio crescente.',
  defaultColor: '#00f5d4',
  previewTitle: '{header} Desafio do Dia',
  previewDesc: 'Uma pergunta por dia, a mesma para todo mundo. Você tem **uma única tentativa**!\n\n### ❓ Qual lua de Júpiter tem a atividade vulcânica mais intensa?\n\n**[A]** Europa\n\n**[B]** Io\n\n**[C]** Calisto\n\n**[D]** Ganimedes',
  previewFields: [
    { name: '🔥 Sequência', value: '`3` dia(s)', inline: true },
    { name: '🪙 Prêmio se acertar', value: '`5` {coins}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🧩', defaultEmojiKey: '47995starryquestions', description: 'Exibido no título do desafio' },
    { key: 'coins', label: 'Moedas do Prêmio', fallback: '🪙', defaultEmojiKey: 'COIN', description: 'Prêmio por acerto' },
  ],
}));

registerEmbed(emojifySchema({
  id: 'anime_marathon',
  name: '🎴 Maratona Otaku',
  category: 'minigames',
  description: 'Embed privado do /py-anime: 5 perguntas de anime e cultura geek com dificuldade crescente.',
  defaultColor: '#ff1493',
  previewTitle: '{header} Maratona Otaku: Pergunta 3/5',
  previewDesc: '> ✅ Acertou! Resposta: **Gomu Gomu no Mi**\n\n### ❓ Qual é a técnica ocular do clã Hyuga?\n\n**[A]** Sharingan\n\n**[B]** Rinnegan\n\n**[C]** Byakugan\n\n**[D]** Mangekyō Sharingan',
  previewFields: [
    { name: '🪙 Ganho nesta maratona', value: '`2` {coins}', inline: true },
    { name: '✨ Por acerto', value: '`+1` {coins}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🎴', defaultEmojiKey: '9070magiccards', description: 'Exibido no título da maratona' },
    { key: 'coins', label: 'Moedas por Acerto', fallback: '🪙', defaultEmojiKey: 'COIN', description: 'Moedas ganhas' },
  ],
}));

registerEmbed({
  id: 'home_room',
  name: '🏡 Casinha da Pyxie',
  category: 'minigames',
  description: 'Tela principal do /py-home: quarto em pixel art, Charme, conjuntos ativos, curtidas e visitas.',
  defaultColor: '#a855f7',
  previewTitle: '{header} Casinha de Zulu',
  previewDesc: 'N-não é como se eu tivesse arrumado tudo esperando você voltar... Mas a casinha é sua.\n\n### {charm} Charme da casinha\n\n• **Charme:** `396` (recorde: `400`)\n\n• **Conjuntos ativos:** **Sonho Lilás** `9` · **Salão Real** `8`\n\n• **Curtidas:** `7` · **Visitas:** `12`',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Casinha', fallback: '🏡', defaultEmojiKey: '73584mushroomhouses', description: 'Ícone no título da casinha' },
    { key: 'charm', label: 'Charme', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Seção de Charme' },
  ],
});

registerEmbed({
  id: 'home_shop',
  name: '🛍️ Loja do Dia da Casinha',
  category: 'economy',
  description: 'Vitrine do dia: 8 itens por moedinhas e 2 premium por feijões, girando à meia-noite de Brasília.',
  defaultColor: '#f59e0b',
  previewTitle: '{header} Loja do dia',
  previewDesc: 'A vitrine muda todo dia à meia-noite.\n\n• **Seu saldo:** {coins} `230` · {beans} `3`\n\n• **1. Cadeira Lilás** · Raro · {coins} `320`\n\n• **2. Cama dos Sonhos Lilás** · Épico · {beans} `4`',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Loja', fallback: '🛍️', defaultEmojiKey: 'Pink_bag', description: 'Ícone no título da loja' },
    { key: 'coins', label: 'Moedinhas', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Preço em moedinhas' },
    { key: 'beans', label: 'Feijões Mágicos', fallback: '🌱', defaultEmojiKey: 'magic_bean', description: 'Preço premium' },
  ],
});

registerEmbed({
  id: 'achievements_view',
  name: '🏆 Conquistas',
  category: 'economy',
  description: 'Tela do /py-achievements: progresso real por categoria, recompensas e títulos especiais das míticas.',
  defaultColor: '#f472b6',
  previewTitle: '{header} Conquistas de Zulu',
  previewDesc: '• **Conquistadas:** `12/36` · **Míticas:** `1/9`\n\n### 🕯️ Catacumbas\n\n🥉 **Primeira Descida** · `1/1` ✅\n-# Termine uma descida nas Catacumbas de Veludo.\n\n🌌 **Eclipse da Nyx** · `0/1`\n-# Derrote a Nyx · 🎁 Trono da Nyx · ☾ 𝕰𝖈𝖑𝖎𝖕𝖘𝖊 𝖉𝖆 𝕹𝖞𝖝 ☽',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Troféu', fallback: '🏆', defaultEmojiKey: 'win', description: 'Ícone no título' },
  ],
});

registerEmbed({
  id: 'achievement_unlock',
  name: '🏆 Conquista Desbloqueada',
  category: 'economy',
  description: 'Aviso privado que aparece depois de qualquer comando quando uma conquista é alcançada, já com as recompensas entregues.',
  defaultColor: '#fbbf24',
  previewTitle: '{header} Conquista desbloqueada!',
  previewDesc: '### 🌌 Eclipse da Nyx\n\n> *Derrote a Nyx, a Mariposa Devora-Luz.*\n\n• **Item para a Casinha:** Trono da Nyx #1\n\n• **Título especial:** ☾ 𝕰𝖈𝖑𝖎𝖕𝖘𝖊 𝖉𝖆 𝕹𝖞𝖝 ☽',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Troféu', fallback: '🏆', defaultEmojiKey: 'win', description: 'Ícone no título' },
  ],
});

registerEmbed({
  id: 'setup_hub',
  name: '⚙️ Central do Servidor (/py-setup)',
  category: 'system',
  description: 'Painel privado de quem administra: idioma, modo do Mundo Pyxie, canais permitidos, módulos e canais de boas-vindas, desabafos, tarot e tickets.',
  defaultColor: '#8a2be2',
  previewTitle: '{header} Painel de Configuração da Pyxie',
  previewDesc: 'E-eu juntei tudo do **Servidor** aqui… escolhe uma seção no menu.\n\n### 🗺️ Mundo Pyxie\n\n**Ligado.** Catacumbas, Casinha, itens raros e conquistas funcionando aqui.\n\n### 📍 Canais permitidos\n\n• **Mundo Pyxie:** todos os canais\n\n-# 🔒 Só quem administra o servidor vê este painel.',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Engrenagem', fallback: '⚙️', defaultEmojiKey: 'helpCommands', description: 'Ícone no título' },
  ],
});

registerEmbed({
  id: 'setup_mmo_pitch',
  name: '🗺️ Vitrine do Mundo Pyxie (modo clássico)',
  category: 'system',
  description: 'Mostrada só para quem administra quando o servidor está no modo clássico: o que o Mundo Pyxie oferece, o teste de 7 dias e a procura dos membros.',
  defaultColor: '#8a2be2',
  previewTitle: '{header} Mundo Pyxie neste servidor',
  previewDesc: '**Modo clássico.** Aqui só tem moedinhas pelo trabalho e o perfil padrão.\n\n### O que vem no Mundo Pyxie\n\n• **Catacumbas de Veludo:** dungeon roguelike em pixel art.\n\n• **Casinha:** quartinho em pixel art com mais de 180 móveis e pets.\n\n-# 🔔 **4** pessoa(s) tentaram jogar o Mundo Pyxie aqui nos últimos 7 dias.',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Mapa', fallback: '🗺️', defaultEmojiKey: 'MAP', description: 'Ícone no título' },
  ],
});

registerEmbed({
  id: 'dungeon_lobby',
  name: '🕯️ Catacumbas de Veludo: Menu',
  category: 'minigames',
  description: 'Menu público do /py-dungeon: regras do ticket, descidas do dia, tetos de pagamento, Ecos e recorde.',
  defaultColor: '#8a2be2',
  previewTitle: '{header} Catacumbas de Veludo',
  previewDesc: 'Sob a sua torre dorme um labirinto de velas tortas, ossos floridos e tesouros esquecidos.\n\n### 🎟️ Regras da Descida\n\n• **Ticket:** `50` moedinhas por descida.\n\n• **Descidas hoje:** `3/3` restantes.\n\n• **Teto:** até `500` por descida e mais `600` hoje.',
  previewFields: [
    { name: '🪙 Saldo', value: '`230` {coins}', inline: true },
    { name: '🌙 Ecos', value: '`12` {echoes}', inline: true },
    { name: '🏆 Recorde', value: 'Andar `3`', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🕯️', defaultEmojiKey: 'DUNGEON_CANDLE', description: 'Vela animada no título do menu' },
    { key: 'coins', label: 'Moedinhas', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Saldo e ticket' },
    { key: 'echoes', label: 'Ecos', fallback: '🌙', defaultEmojiKey: 'DUNGEON_MOON', description: 'Moeda de talentos (não conversível)' },
  ],
});

registerEmbed({
  id: 'dungeon_explore',
  name: '🗺️ Catacumbas de Veludo: Exploração',
  category: 'minigames',
  description: 'Tela de exploração com mapa pixel art, névoa de guerra, luz de vela e status do run.',
  defaultColor: '#8a2be2',
  previewTitle: '{map} Andar 2 • Biblioteca Sussurrante',
  previewDesc: '🗺️ Você chega ao **Andar 2: Biblioteca Sussurrante**.\n\n> *Prateleiras infinitas cochicham segredos. Os livros daqui mordem.*\n\n-# Use as setas para andar. Cada sala gasta `6` de luz.',
  previewFields: [
    { name: '❤️ Vida', value: '`27/33`', inline: true },
    { name: '🕯️ Luz', value: '`88/100`', inline: true },
    { name: '💰 Ouro', value: '`48` {gold}', inline: true },
  ],
  slots: [
    { key: 'map', label: 'Mapa', fallback: '🗺️', defaultEmojiKey: 'MAP', description: 'Navegação entre salas' },
    { key: 'gold', label: 'Ouro do Run', fallback: '🪙', defaultEmojiKey: 'DUNGEON_GOLD', description: 'Ouro acumulado na descida' },
  ],
});

registerEmbed({
  id: 'dungeon_combat',
  name: '⚔️ Catacumbas de Veludo: Combate',
  category: 'minigames',
  description: 'Combate por turnos com intenção telegrafada do inimigo, brilho, patada do Astaroth e poções.',
  defaultColor: '#ef4444',
  previewTitle: '{enemy} Guardião: Vovó Aranha',
  previewDesc: '### 🕷️ Vovó Aranha\n\n❤️ `22/30` • 🛡️ Escudo `6`\n\n### 🔮 Próxima ação do inimigo\n\n💥 **GOLPE PESADO:** `9` de dano!\n\n-# 🛡️ Defender bloqueia `5` • 🔮 Raio Lunar custa `2` ✨ • {pet} Patada custa `1` ✨',
  previewFields: [
    { name: '❤️ Vida', value: '`17/24`', inline: true },
    { name: '🕯️ Luz', value: '`61/100`', inline: true },
    { name: '💰 Ouro', value: '`32`', inline: true },
  ],
  slots: [
    { key: 'enemy', label: 'Ícone do Inimigo', fallback: '💀', defaultEmojiKey: 'DUNGEON_SKULL', description: 'Exibido no título do combate' },
    { key: 'pet', label: 'Astaroth', fallback: '🐈‍⬛', defaultEmojiKey: 'ASTAROTH', description: 'Habilidade do pet' },
  ],
});

registerEmbed({
  id: 'dungeon_end',
  name: '👑 Catacumbas de Veludo: Fim da Descida',
  category: 'minigames',
  description: 'Liquidação do run: ouro coletado, Taxa da Lanterna, tetos, moedinhas recebidas, Ecos e recorde.',
  defaultColor: '#f59e0b',
  previewTitle: '{header} Fuga com o Tesouro',
  previewDesc: 'Você escapou do **Andar 3** com o saco de ouro!\n\n### 💰 Ouro coletado: `182`\n\n🪙 **Moedinhas recebidas:** `+163`\n\n-# 🏮 Taxa da Lanterna: `10%` por fugir cedo.\n\n🌙 **Ecos ganhos:** `+6` (use em Talentos)',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Ícone de Resultado', fallback: '💰', defaultEmojiKey: 'DUNGEON_GOLD', description: 'Exibido no título da liquidação' },
    { key: 'pet', label: 'Astaroth', fallback: '🐈‍⬛', defaultEmojiKey: 'ASTAROTH_LAUGH', description: 'Reação do pet ao resultado' },
  ],
});

registerEmbed({
  id: 'tarot_draw',
  name: '🔮 Tiragem Diária de Tarot',
  category: 'tarot',
  description: 'Embed do comando /py-tarot com leitura arcana e conselho místico.',
  defaultColor: '#7c3aed',
  previewTitle: '{moon} Revelação Arcana: O Louco (0)',
  previewDesc: '> "Novos começos, inocência, espontaneidade e a coragem de dar o salto da fé."\n\n✨ **Conselho dos Astros:** Siga sua intuição e confie no universo.',
  previewFields: [
    { name: '🔮 Orientação Arcana', value: 'Posição Reta (Upright)', inline: true },
    { name: '✨ Sintonia Cósmica', value: 'Alta Vibração', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🔮', defaultEmojiKey: 'tarot_card', description: 'Ícone de abertura do Tarot' },
    { key: 'moon', label: 'Lua Arcana', fallback: '🌙', defaultEmojiKey: 'MOON', description: 'Exibido ao lado do nome do arcano' },
    { key: 'sparkles', label: 'Brilhos Celestes', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Indicador de revelação mágica' },
  ],
});

registerEmbed({
  id: 'tarot_album',
  name: '🎴 Álbum & Coleção de Tarot',
  category: 'tarot',
  description: 'Embed do comando /py-album com progresso de arcanos e cartas brilhantes.',
  defaultColor: '#c084fc',
  previewTitle: '{header} Álbum Celestial de Arcanos (18/22)',
  previewDesc: 'Coleção completa de arcanos maiores da Pyxie. Cartas douradas concedem bônus diário!',
  previewFields: [
    { name: '⭐ Cartas Desbloqueadas', value: '18 / 22 Arcanos', inline: true },
    { name: '💎 Bônus Diário Acumulado', value: '+45% {gem}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Álbum', fallback: '🎴', defaultEmojiKey: 'tarotAlbum', description: 'Ícone no topo do catálogo de cartas' },
    { key: 'star', label: 'Estrela Cósmica', fallback: '⭐', defaultEmojiKey: 'STAR', description: 'Indicador de raridade da carta' },
    { key: 'gem', label: 'Joia Preciosa', fallback: '💎', defaultEmojiKey: 'DIAMOND', description: 'Indicador de bônus especial' },
  ],
});

registerEmbed({
  id: 'daily_reward',
  name: '🎁 Bônus Diário & Web',
  category: 'economy',
  description: 'Embed do comando /py-daily e do portal de resgate web.',
  defaultColor: '#10b981',
  previewTitle: '{header} Recompensa Diária Coletada!',
  previewDesc: 'Você resgatou com sucesso seu bônus diário e manteve a chama viva!',
  previewFields: [
    { name: '💰 Moedinhas Recebidas', value: '+100 {coins}', inline: true },
    { name: '🌱 Feijões Mágicos', value: '+1 {beans}', inline: true },
    { name: '🔥 Streak Ativo', value: '7 dias consecutivos {streak}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Presente', fallback: '🎁', defaultEmojiKey: 'daily_bonus', description: 'Ícone no título do bônus' },
    { key: 'coins', label: 'Moedas Gerais', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Moedas creditadas' },
    { key: 'beans', label: 'Feijões Mágicos', fallback: '🌱', defaultEmojiKey: 'magic_bean', description: 'Feijões mágicos obtidos' },
    { key: 'streak', label: 'Fogo de Streak', fallback: '🔥', defaultEmojiKey: 'PURPLE_FLAME', description: 'Indicador de dias seguidos' },
  ],
});

registerEmbed({
  id: 'topgg_vote',
  name: '🗳️ Voto no Top.gg',
  category: 'economy',
  description: 'Embed do /py-vote: recompensa em feijões mágicos por voto, bônus de fim de semana e status do próximo voto.',
  defaultColor: '#9b5de5',
  previewTitle: '{header} Vote na Pyxie no Top.gg',
  previewDesc: 'Cada voto no **Top.gg** ajuda a Pyxie a ser encontrada por novos servidores.\n\n### {beans} Recompensa por voto\n\n• **Por voto:** `1` feijão mágico, a cada `12h`.\n\n• **Fim de semana:** `2` feijões por voto (sexta a domingo).\n\n> ✅ **Seu voto está liberado agora!**',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Ícone de Voto', fallback: '🗳️', defaultEmojiKey: '5707lightpurplecheck', description: 'Ícone no título do voto' },
    { key: 'beans', label: 'Feijões Mágicos', fallback: '🌱', defaultEmojiKey: 'magic_bean', description: 'Recompensa por voto' },
  ],
});

registerEmbed({
  id: 'guild_welcome',
  name: '🧚 Boas-vindas ao Entrar num Servidor',
  category: 'system',
  description: 'Primeira mensagem da Pyxie num servidor novo (guildCreate): comandos de início, idioma com botões e links.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Oi! Eu sou a Pyxie',
  previewDesc: 'Obrigada por me chamar para **Servidor**. N-não que eu estivesse esperando o convite… mas já que estou aqui, vamos começar direito.\n\n### ✨ Comece por aqui\n\n• **Moedinhas diárias:** {coins} `/py-daily` entrega seu bônus todo dia, e a sequência rende mais.\n\n• **Tarot ilustrado:** {tarot} `/py-tarot` tira a sua carta do dia e guarda no álbum.\n\n• **Catacumbas de Veludo:** {dungeon} `/py-dungeon` é um roguelike difícil com ticket de `50` moedinhas.\n\n### {globe} Idioma\n\nEstou falando **Português** aqui.',
  previewFields: [],
  slots: [
    { key: 'header', label: 'Fada da Pyxie', fallback: '🧚', defaultEmojiKey: 'fairy', description: 'Âncora visual do título' },
    { key: 'coins', label: 'Moedinhas', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Linha do /py-daily' },
    { key: 'tarot', label: 'Tarot', fallback: '🔮', defaultEmojiKey: 'TAROT', description: 'Linha do /py-tarot' },
    { key: 'dungeon', label: 'Catacumbas', fallback: '🕯️', defaultEmojiKey: 'DUNGEON', description: 'Linha do /py-dungeon' },
    { key: 'globe', label: 'Idioma', fallback: '🌐', defaultEmojiKey: '16017pinkearth', description: 'Seção de idioma' },
  ],
});

registerEmbed({
  id: 'weekend_bonus',
  name: '🔥 Bônus de Fim de Semana (2X)',
  category: 'economy',
  description: 'Embed de notificação de bônus dobrado aos sábados e domingos.',
  defaultColor: '#f59e0b',
  previewTitle: '{header} Fim de Semana Mágico Ativado!',
  previewDesc: 'Todas as atividades econômicas e trabalhos estão rendendo em dobro até domingo às 23:59!',
  previewFields: [
    { name: '💰 Multiplicador Ativo', value: '2X {coins} em tudo!', inline: true },
    { name: '⏳ Duração', value: 'Até Domingo às 23:59', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Fogo/Evento', fallback: '🔥', defaultEmojiKey: 'weekend_bonus', description: 'Ícone do evento no título' },
    { key: 'coins', label: 'Moedas Turbinadas', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Moedas dobradas' },
  ],
});

registerEmbed({
  id: 'user_profile',
  name: '👤 Perfil & Identidade Arcana',
  category: 'social',
  description: 'Embed gerado pelo comando /py-perfil com status, casamento e saldos.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Identidade Arcana • @PyxieDev',
  previewDesc: 'Membro místico da comunidade da Cringelândia desde 2024.',
  previewFields: [
    { name: '💰 Saldo em Moedas', value: '1.450 {coins}', inline: true },
    { name: '🌱 Feijões Mágicos', value: '12 {beans}', inline: true },
    { name: '💍 Vínculo Matrimonial', value: 'Casado(a) com @Luna {marriage}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Badge de Usuário', fallback: '👤', defaultEmojiKey: 'userProfile', description: 'Ícone de identificação de perfil' },
    { key: 'coins', label: 'Moedas da Carteira', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Saldo de moedas' },
    { key: 'beans', label: 'Feijões Mágicos', fallback: '🌱', defaultEmojiKey: 'magic_bean', description: 'Saldo de feijões' },
    { key: 'marriage', label: 'Aliança Matrimonial', fallback: '💍', defaultEmojiKey: 'marriage_ring', description: 'Ícone do vínculo amoroso' },
  ],
});

registerEmbed({
  id: 'marriage_profile',
  name: '💍 Matrimônio & Família',
  category: 'social',
  description: 'Embed de casamento, árvore da vida e cofre familiar do comando /py-marriage.',
  defaultColor: '#ec4899',
  previewTitle: '{header} Santuário do Amor • Alex & Taylor',
  previewDesc: 'União celebrada sob as bênçãos místicas e perpétuas da Pyxie.',
  previewFields: [
    { name: '💖 Sintonia do Amor', value: '100% de afinidade {heart}', inline: true },
    { name: '🌳 Árvore da Vida', value: 'Nível 3 (Frondosa) {tree}', inline: true },
    { name: '💰 Cofre Conjunto', value: '1.250 {coins}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Aliança de Casamento', fallback: '💍', defaultEmojiKey: 'marriage_ring', description: 'Ícone principal do casamento' },
    { key: 'heart', label: 'Coração de Afinidade', fallback: '💖', defaultEmojiKey: 'HEART', description: 'Barra do Amor e data nights' },
    { key: 'tree', label: 'Árvore da Vida', fallback: '🌳', defaultEmojiKey: 'TREE', description: 'Bênção da Árvore Sagrada' },
    { key: 'coins', label: 'Moedas do Cofre', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Moedas depositadas no cofre do amor' },
  ],
});

registerEmbed({
  id: 'museum_art',
  name: '🏛️ Museu Comunitário',
  category: 'community',
  description: 'Embed de obras de arte e desenhos postados no mural e no comando /py-museu.',
  defaultColor: '#a855f7',
  previewTitle: '{header} Galeria Comunitária • Floresta Violeta',
  previewDesc: 'Obra artística criada por membro e catalogada no museu comunitário.',
  previewFields: [
    { name: '🎨 Artista', value: '@AriaMística', inline: true },
    { name: '✨ Curtidas da Galeria', value: '24 curtidas {sparkles}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Museu', fallback: '🏛️', defaultEmojiKey: 'museum', description: 'Ícone no topo do mural' },
    { key: 'sparkles', label: 'Brilho de Destaque', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Destaque visual da obra' },
  ],
});

registerEmbed({
  id: 'partnerships_card',
  name: '🤝 Parcerias & Comunidade',
  category: 'community',
  description: 'Embed de divulgação de servidores parceiros e bumps via /py-parcerias.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Comunidade Parceira: Vila Geek',
  previewDesc: 'Conheça nossos aliados e faça parte desta comunidade incrível!',
  previewFields: [
    { name: '🦋 Membros Ativos', value: '1.250 membros {butterfly}', inline: true },
    { name: '🔥 Streak de Parceria', value: '5 dias sem interrupção', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Parceria', fallback: '🤝', defaultEmojiKey: 'partnerships', description: 'Ícone no topo do embed' },
    { key: 'butterfly', label: 'Borboleta Violeta', fallback: '🦋', defaultEmojiKey: 'BUTTERFLY', description: 'Símbolo comunitário da Pyxie' },
  ],
});

registerEmbed({
  id: 'economy_ranking',
  name: '🏆 Placar dos Mais Ricos',
  category: 'economy',
  description: 'Embed do comando /py-ranking listando as maiores fortunas do servidor.',
  defaultColor: '#fbbf24',
  previewTitle: '{header} Placar Imperial de Riqueza',
  previewDesc: 'Os aventureiros e feiticeiros mais afortunados do reino da Cringelândia.',
  previewFields: [
    { name: '👑 1º Lugar', value: '@ReiDoOuro (15.420 {coins})', inline: false },
    { name: '🥈 2º Lugar', value: '@MagoPrateado (12.300 {coins})', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Troféu do Ranking', fallback: '🏆', defaultEmojiKey: 'ranking', description: 'Ícone do topo do ranking' },
    { key: 'crown', label: 'Coroa do 1º Lugar', fallback: '👑', defaultEmojiKey: 'CROWN', description: 'Ícone do primeiro colocado' },
    { key: 'coins', label: 'Moedas dos Membros', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Ícone ao lado do saldo de cada usuário' },
  ],
});

registerEmbed({
  id: 'fortune_cookie',
  name: '🥠 Biscoito da Sorte',
  category: 'minigames',
  description: 'Embed do comando /py-cookie com sabedorias e números da sorte.',
  defaultColor: '#f97316',
  previewTitle: '{header} Mensagem do Biscoito da Sorte',
  previewDesc: '> "A paciência é a chave cósmica para abrir as portas da abundância."',
  previewFields: [
    { name: '🍀 Números da Sorte', value: '07 • 14 • 21 • 35 • 42 {sparkles}', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Biscoito da Sorte', fallback: '🥠', defaultEmojiKey: 'fortune_cookie', description: 'Ícone do título do biscoito' },
    { key: 'sparkles', label: 'Brilho Astral', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Ícone decorativo da mensagem' },
  ],
});

registerEmbed({
  id: 'arcane_math',
  name: '🧮 Mestre da Matemática Arcana',
  category: 'minigames',
  description: 'Embed do desafio de matemática /py-math com progressão de dificuldade.',
  defaultColor: '#0ea5e9',
  previewTitle: '{header} Grimório Matemático (Nível Médio)',
  previewDesc: 'Calcule a expressão arcana para quebrar o selo rúnico da torre!',
  previewFields: [
    { name: '📐 Expressão Arcana', value: '2x + 10 = 30. Qual o valor de x?', inline: false },
    { name: '⏱️ Tempo Limite', value: '30s', inline: true },
    { name: '✅ Recompensa', value: 'Streak +1 {correct}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Livro de Cálculos', fallback: '🧮', defaultEmojiKey: 'arcaneMath', description: 'Ícone no cabeçalho do desafio' },
    { key: 'correct', label: 'Acerto de Cálculo', fallback: '✅', defaultEmojiKey: 'CHECK', description: 'Feedback de resposta correta' },
    { key: 'wrong', label: 'Erro de Cálculo', fallback: '❌', defaultEmojiKey: 'CROSS', description: 'Feedback de resposta errada' },
  ],
});

registerEmbed({
  id: 'tictactoe_game',
  name: '🌙 Jogo da Velha Arcano',
  category: 'minigames',
  description: 'Embed de tabuleiro do comando /py-velha para duelos entre membros.',
  defaultColor: '#a855f7',
  previewTitle: '{header} Jogo da Velha • Duelo Arcano',
  previewDesc: 'Partida de estratégia e raciocínio na arena mística.',
  previewFields: [
    { name: '❌ Jogador 1', value: '@Arthur {x_mark}', inline: true },
    { name: '⭕ Jogador 2', value: '@Beatriz {o_mark}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Duelo', fallback: '🌙', defaultEmojiKey: 'tictactoe', description: 'Ícone do cabeçalho da partida' },
    { key: 'x_mark', label: 'Símbolo X', fallback: '❌', defaultEmojiKey: 'CROSS', description: 'Marcação do Jogador 1' },
    { key: 'o_mark', label: 'Símbolo O', fallback: '⭕', defaultEmojiKey: 'CHECK', description: 'Marcação do Jogador 2' },
  ],
});

registerEmbed({
  id: 'minesweeper_game',
  name: '💥 Campo Minado Arcano',
  category: 'minigames',
  description: 'Embed do minigame /py-minas na Masmorra 5x5.',
  defaultColor: '#ef4444',
  previewTitle: '{header} Desarme na Masmorra (5x5)',
  previewDesc: 'Encontre todas as runas seguras sem acionar poções explosivas!',
  previewFields: [
    { name: '💣 Minas Ocultas', value: '3 minas {bomb}', inline: true },
    { name: '💎 Gemas Seguras', value: '8 reveladas {gem}', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Masmorra', fallback: '💥', defaultEmojiKey: 'minesweeper', description: 'Ícone no título do campo minado' },
    { key: 'bomb', label: 'Runa Explosiva', fallback: '💣', defaultEmojiKey: 'BOMB', description: 'Ícone ao detonar uma mina' },
    { key: 'gem', label: 'Gema Segura', fallback: '💎', defaultEmojiKey: 'DIAMOND', description: 'Ícone ao revelar casa segura' },
  ],
});

registerEmbed({
  id: 'dice_roll',
  name: '🎲 Dados Arcanos D20',
  category: 'minigames',
  description: 'Embed do comando /py-dado com rolagens de atributos.',
  defaultColor: '#ec4899',
  previewTitle: '{header} Rolagem de D20 • Teste de Destino',
  previewDesc: 'Você jogou o dado poliédrico de atributos arcanos!',
  previewFields: [
    { name: '🎲 Resultado Final', value: '**18** (Sucesso Decisivo)', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Dado D20', fallback: '🎲', defaultEmojiKey: 'dice', description: 'Ícone do dado no título' },
  ],
});

registerEmbed({
  id: 'ship_love',
  name: '💖 Medidor de Afinidade (Ship)',
  category: 'social',
  description: 'Embed do comando /py-ship medindo a compatibilidade amorosa.',
  defaultColor: '#f43f5e',
  previewTitle: '{header} Calculadora de Amor • Lucas & Sofia',
  previewDesc: 'Compatibilidade sentimental avaliada pelos astros da Pyxie.',
  previewFields: [
    { name: '💖 Compatibilidade', value: '**88%** • Sintonia Quase Perfeita {sparkles}', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Coração de Afinidade', fallback: '💖', defaultEmojiKey: 'ship_heart', description: 'Ícone do título do ship' },
    { key: 'sparkles', label: 'Brilhos de Paixão', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Indicador visual de romance' },
  ],
});

registerEmbed({
  id: 'help_menu',
  name: '📖 Central de Ajuda & Módulos',
  category: 'system',
  description: 'Embed do comando /py-help com navegação por categorias.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Central de Comandos da Pyxie',
  previewDesc: 'Explore todas as funcionalidades e comandos mágicos da Pyxie!',
  previewFields: [
    { name: '📖 Instruções de Uso', value: 'Selecione uma categoria no menu suspenso abaixo para ver detalhes.', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Grimório de Ajuda', fallback: '📖', defaultEmojiKey: 'helpCommands', description: 'Ícone no topo da ajuda' },
  ],
});


registerEmbed({
  id: 'tickets_main_panel',
  name: '📩 Painel Geral de Atendimento (Tickets)',
  category: 'system',
  description: 'Embed principal com botões para abertura de chamados e denúncias.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Central de Atendimento ao Membro',
  previewDesc: 'Selecione abaixo a categoria adequada para falar diretamente com a moderação.',
  previewFields: [
    { name: '🆘 Suporte Geral', value: 'Dúvidas, bugs ou auxílio técnico.', inline: true },
    { name: '🚨 Denúncias', value: 'Canal seguro e confidencial para reports.', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Atendimento', fallback: '📩', defaultEmojiKey: 'helpCommands', description: 'Ícone no título do painel' },
  ],
});

registerEmbed({
  id: 'tickets_art_removal_pending',
  name: '🖼️ Solicitação de Remoção de Conteúdo',
  category: 'community',
  description: 'Embed enviado no canal de aprovações para análise de remoção de artes do museu.',
  defaultColor: '#f59e0b',
  previewTitle: '{header} Pedido de Exclusão de Obra do Museu',
  previewDesc: 'Um artista solicitou a remoção formal de suas obras da galeria virtual.',
  previewFields: [
    { name: '👤 Solicitante', value: '@Artista (ID: 123456789)', inline: true },
    { name: '🔗 Link da Galeria', value: '/museu?user=123456789', inline: true },
    { name: '📝 Motivo / Descrição', value: 'Desejo retirar meus desenhos postados em 2025.', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Remoção', fallback: '🖼️', defaultEmojiKey: 'museum', description: 'Ícone do cabeçalho da pendência' },
  ],
});

registerEmbed({
  id: 'tickets_room_welcome',
  name: '🔒 Sala Privada de Ticket (Recepção)',
  category: 'system',
  description: 'Embed fixado no topo da sala criada para orientar o membro e a staff.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Atendimento Iniciado • Suporte Pyxie',
  previewDesc: 'Olá! Descreva o motivo do seu contato com detalhes e prints para agilizar o suporte.',
  previewFields: [
    { name: '🙋 Assumir', value: 'A Staff assume o chamado com um toque.', inline: true },
    { name: '🔒 Fechamento', value: 'Autor ou Staff, com transcrição na DM.', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone da Sala', fallback: '📩', defaultEmojiKey: 'helpCommands', description: 'Ícone de boas-vindas da sala' },
  ],
});

registerEmbed({
  id: 'profile_studio',
  name: '🎛️ Estúdio do Perfil',
  category: 'economy',
  description: 'Personalização gratuita do card de perfil com prévia ao vivo (estilo, moldura, destaques e sticker).',
  defaultColor: '#ff3d8b',
  previewTitle: '{header} Estúdio do Perfil',
  previewDesc: 'Monte o visual do seu cartão. Cada escolha atualiza a prévia na hora, sem custo.',
  previewFields: [
    { name: '🪟 Estilo', value: 'Vidro, Neon ou Minimalista', inline: true },
    { name: '💫 Moldura', value: 'Círculo, Quadrado suave ou Halo', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Estúdio', fallback: '🎛️', defaultEmojiKey: 'helpCommands', description: 'Ícone do título do estúdio' },
  ],
});

registerEmbed({
  id: 'tickets_close_log',
  name: '📁 Registro de Atendimento Encerrado',
  category: 'system',
  description: 'Registro enviado ao canal de logs da Staff com resumo e transcrição .txt do atendimento.',
  defaultColor: '#64748b',
  previewTitle: '{header} Atendimento Encerrado',
  previewDesc: 'Resumo do atendimento com a transcrição completa anexada.',
  previewFields: [
    { name: '👤 Aberto por', value: '`<@123456789>`', inline: true },
    { name: '🏷️ Tipo', value: '`#0004` Ajuda', inline: true },
    { name: '⏱️ Duração', value: '`1h 12min`', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Registro', fallback: '📁', defaultEmojiKey: 'helpCommands', description: 'Ícone do registro de encerramento' },
  ],
});

registerEmbed({
  id: 'giveaway_admin_hub',
  name: '🎉 Central Administrativa de Sorteios',
  category: 'system',
  description: 'Hub do comando /py-sorteio para criação e gerenciamento de sorteios.',
  defaultColor: '#ec4899',
  previewTitle: '{header} Central de Sorteios Pyxie',
  previewDesc: 'Painel de controle para criação guiada, agendamento e cancelamento de sorteios.',
  previewFields: [
    { name: '➕ Criar Sorteio', value: 'Wizard interativo com regras de cargos e bônus.', inline: true },
    { name: '🗑️ Cancelar Sorteio', value: 'Encerramento antecipado de sorteios ativos.', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone do Sorteio', fallback: '🎉', defaultEmojiKey: 'tada', description: 'Ícone no título da central' },
  ],
});

registerEmbed({
  id: 'giveaway_public_card',
  name: '🎁 Card Público de Sorteio',
  category: 'community',
  description: 'Card interativo publicado no canal de texto com botão de participação e regras.',
  defaultColor: '#ec4899',
  previewTitle: '{header} Sorteio Oficial da Comunidade',
  previewDesc: 'Clique no botão abaixo para garantir sua participação e concorrer!',
  previewFields: [
    { name: '🏆 Prêmio(s)', value: 'Discord Nitro Mensal 💖', inline: true },
    { name: '👥 Ganhadores', value: '1 Vencedor', inline: true },
    { name: '⏳ Encerramento', value: 'Hoje às 20:00 (em 2 horas)', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Emoji do Card', fallback: '🎉', defaultEmojiKey: 'tada', description: 'Emoji de destaque no título do sorteio' },
  ],
});

registerEmbed({
  id: 'venting_sticky_panel',
  name: '💌 Painel Sticky de Desabafos',
  category: 'community',
  description: 'Embed fixado automaticamente no canal de desabafos com botão de envio anônimo.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Espaço de Acolhimento & Desabafos',
  previewDesc: 'Um ambiente seguro para expressar sentimentos, pedir conselhos e desabafar sem julgamentos.',
  previewFields: [
    { name: '🕊️ Desabafo Anônimo', value: 'Sua identidade é 100% protegida e preservada.', inline: true },
    { name: '🤝 Respeito & Apoio', value: 'Comentários com carinho e acolhimento mútuo.', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Acolhimento', fallback: '💌', defaultEmojiKey: 'HEART', description: 'Ícone no cabeçalho do desabafo' },
  ],
});

registerEmbed({
  id: 'venting_autohelp_card',
  name: '🌷 Cartão de Autoajuda & Apoio 24h',
  category: 'community',
  description: 'Embed disparado com canais de apoio emocional (CVV 188) em mensagens sensíveis.',
  defaultColor: '#f43f5e',
  previewTitle: '{header} Você não está sozinho(a) 💖',
  previewDesc: 'Se estiver passando por um momento difícil, lembre-se de que existem pessoas prontas para te ouvir.',
  previewFields: [
    { name: '📞 CVV (Centro de Valorização da Vida)', value: 'Ligue **188** (Ligação Gratuita 24h) ou acesse [cvv.org.br](https://www.cvv.org.br).', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Apoio', fallback: '🌷', defaultEmojiKey: 'HEART', description: 'Ícone de acolhimento emocional' },
  ],
});

registerEmbed({
  id: 'welcome_panel',
  name: '👋 Painel de Boas-Vindas',
  category: 'system',
  description: 'Embed de recepção enviado no canal de boas-vindas aos novos membros.',
  defaultColor: '#8b5cf6',
  previewTitle: '{header} Bem-vindo(a) ao Servidor!',
  previewDesc: 'Ficamos muito felizes em ter você aqui conosco! Sinta-se em casa.',
  previewFields: [
    { name: '📜 Regras', value: 'Leia as diretrizes no canal de regras.', inline: true },
    { name: '💬 Bate-papo', value: 'Comece a conversar no chat geral!', inline: true },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Recepção', fallback: '👋', defaultEmojiKey: 'SPARKLES', description: 'Ícone no título de boas-vindas' },
  ],
});

registerEmbed({
  id: 'welcome_checkin_card',
  name: '✨ Cartão de Check-in de Boas-Vindas',
  category: 'system',
  description: 'Embed interativo com botão de check-in para atribuição automática de cargo (Auto-Role).',
  defaultColor: '#10b981',
  previewTitle: '{header} Confirmação de Entrada • Auto-Role',
  previewDesc: 'Clique no botão abaixo para confirmar sua leitura e liberar acesso aos canais.',
  previewFields: [
    { name: '🛡️ Verificação Rápida', value: 'Clique em Check-in para receber seu cargo.', inline: false },
  ],
  slots: [
    { key: 'header', label: 'Ícone de Verificação', fallback: '✨', defaultEmojiKey: 'status_success', description: 'Ícone de validação de entrada' },
  ],
});

module.exports = {
  registerEmbed,
  getEmbedSchema: (id) => EMBED_REGISTRY.get(id),
  getAllEmbedsWithResolvedSlots,
  resolveSlotEmoji,
  buildEmbed,
  saveEmbedSlotEmoji,
  getCurrenciesConfig,
  saveCurrencyEmoji,
  reloadRegistryCache,
  EMBED_REGISTRY,
};


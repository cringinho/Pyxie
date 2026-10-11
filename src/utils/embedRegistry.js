const fs = require('node:fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');
const { getThemeEmojiData } = require('./themeEmojis');
const { getEmoji, reloadEmojiConfig } = require('./appEmojis');
const { getLanguage } = require('./i18n');

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
    });
  }
  return list;
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

  fs.writeFileSync(EMOJIS_FILE, JSON.stringify(customEmojisCache, null, 2), 'utf8');
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
  previewTitle: '{header} Expediente Técnico: {role}',
  previewDesc: 'Um incidente em produção exige sua tomada de decisão imediata!\nSalário previsto: 15-40 {coins}\nTempo limite: 90s {timer}',
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
  previewTitle: '{header} Quiz Cultural da Pyxie (Rodada {round})',
  previewDesc: 'Responda corretamente para acumular moedas no cofre!\nPrêmio acumulado: 10 {coins} • Dificuldade: Normal',
  slots: [
    { key: 'header', label: 'Ícone de Cabeçalho', fallback: '🎯', defaultEmojiKey: 'CONTROLLER', description: 'Exibido no título do quiz' },
    { key: 'coins', label: 'Moedas de Prêmio', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Ícone das moedas acumuladas' },
    { key: 'timer', label: 'Tempo Limite', fallback: '⏰', defaultEmojiKey: 'CLOCK', description: 'Tempo restante para responder' },
    { key: 'sparkles', label: 'Brilho Místico', fallback: '✨', defaultEmojiKey: 'SPARKLES', description: 'Efeito visual de streak e vitória' },
  ],
});

registerEmbed({
  id: 'tarot_draw',
  name: '🔮 Tiragem Diária de Tarot',
  category: 'tarot',
  description: 'Embed do comando /py-tarot com leitura arcana e conselho místico.',
  defaultColor: '#7c3aed',
  previewTitle: '{moon} Revelação Arcana: {card_name}',
  previewDesc: '> {quote}\n\n✨ **Conselho dos Astros:** Siga sua intuição e confie no universo.',
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
  previewTitle: '{header} Álbum Celestial de Arcanos ({collected}/{total})',
  previewDesc: 'Coleção completa de arcanos maiores da Pyxie. Cartas douradas concedem bônus diário!',
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
  previewDesc: 'Você recebeu **100** {coins} e **1** {beans}!\nVolte amanhã para manter seu streak ativo.',
  slots: [
    { key: 'header', label: 'Ícone de Presente', fallback: '🎁', defaultEmojiKey: 'daily_bonus', description: 'Ícone no título do bônus' },
    { key: 'coins', label: 'Moedas Gerais', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Moedas creditadas' },
    { key: 'beans', label: 'Feijões Mágicos', fallback: '🌱', defaultEmojiKey: 'magic_bean', description: 'Feijões mágicos obtidos' },
    { key: 'streak', label: 'Fogo de Streak', fallback: '🔥', defaultEmojiKey: 'PURPLE_FLAME', description: 'Indicador de dias seguidos' },
  ],
});

registerEmbed({
  id: 'weekend_bonus',
  name: '🔥 Bônus de Fim de Semana (2X)',
  category: 'economy',
  description: 'Embed de notificação de bônus dobrado aos sábados e domingos.',
  defaultColor: '#f59e0b',
  previewTitle: '{header} Fim de Semana Mágico Ativado (2X Moedas)',
  previewDesc: 'Todas as atividades econômicas estão rendendo em dobro até domingo às 23:59!',
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
  previewTitle: '{header} Identidade Arcana • {username}',
  previewDesc: 'Carteira: {coins} Moedas • {beans} Feijões Mágicos\n💍 Estado Civil: Casado(a)',
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
  description: 'Embed de casamento, árvore da vida e cofre familiar do comando /py-casamento.',
  defaultColor: '#ec4899',
  previewTitle: '{header} Santuário do Amor • {p1} & {p2}',
  previewDesc: '❤️ Amor: 100% • 🌳 Árvore: Nível 3 • 👶 Filhos: 1\nCofre Conjunto: 1.250 {coins}',
  slots: [
    { key: 'header', label: 'Aliança de Casamento', fallback: '💍', defaultEmojiKey: 'marriage_ring', description: 'Ícone principal do casamento' },
    { key: 'heart', label: 'Coração de Afinidade', fallback: '💖', defaultEmojiKey: 'HEART', description: 'Barra do Amor e data nights' },
    { key: 'tree', label: 'Árvore da Vida', fallback: '🌳', defaultEmojiKey: 'TREE', description: 'Bênção da Árvore Sagrada' },
    { key: 'coins', label: 'Moedas do Cofre', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Moedas depositadas no cofre do amor' },
  ],
});

registerEmbed({
  id: 'shop_catalog',
  name: '🛍️ Lojinha Arcana & Baús',
  category: 'economy',
  description: 'Embed do comando /py-loja para compra de cosméticos, baús e poções.',
  defaultColor: '#38bdf8',
  previewTitle: '{header} Vitrine da Lojinha da Pyxie',
  previewDesc: 'Itens arcanos, baús misteriosos e poções especiais à venda!',
  slots: [
    { key: 'header', label: 'Ícone da Loja/Baú', fallback: '📦', defaultEmojiKey: 'shop_chest', description: 'Ícone no título da loja' },
    { key: 'gem', label: 'Joias & Cosméticos', fallback: '💎', defaultEmojiKey: 'shop_gem', description: 'Ícone de itens raros' },
    { key: 'coins', label: 'Moedas de Compra', fallback: '🪙', defaultEmojiKey: 'coins', description: 'Custo em moedas' },
  ],
});

registerEmbed({
  id: 'museum_art',
  name: '🏛️ Museu Comunitário',
  category: 'community',
  description: 'Embed de obras de arte e desenhos postados no mural e no comando /py-museu.',
  defaultColor: '#a855f7',
  previewTitle: '{header} Obra em Exposição • {art_title}',
  previewDesc: 'Artista: {artist} • Curtidas: 14 ✨\nCadastrado pelo Harvester Comunitário.',
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
  previewTitle: '{header} Comunidade Parceira: {server_name}',
  previewDesc: 'Streak de bumps: 5 dias consecutivos!\nVisite e faça parte da nossa aliança.',
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
  previewDesc: '1º Lugar: {top1} (15.420 {coins})\n2º Lugar: {top2} (12.300 {coins})',
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
  previewDesc: '> "{wisdom}"\n\n🍀 Seus Números da Sorte: 07, 14, 21, 35, 42',
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
  previewTitle: '{header} Grimório Matemático (Nível {level})',
  previewDesc: 'Calcule a expressão arcana para quebrar o selo rúnico!\nTempo limite: 30s ⏰',
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
  previewTitle: '{header} Jogo da Velha • {p1} vs {p2}',
  previewDesc: 'Turno atual: {current_turn}\nEscolha uma casa livre no tabuleiro!',
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
  previewTitle: '{header} Desarme na Masmorra (Minas: {mines_count})',
  previewDesc: 'Encontre todas as runas seguras sem acionar poções explosivas!',
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
  previewTitle: '{header} Rolagem de D20: Resultado [{value}]',
  previewDesc: 'O destino decidiu seu resultado! Sucesso Crítico ✨',
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
  previewTitle: '{header} Calculadora de Amor • {p1} & {p2}',
  previewDesc: 'Compatibilidade: **88%** ❤️\n"Vocês formam uma combinação mágica quase perfeita!"',
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
  previewDesc: 'Selecione uma categoria abaixo para explorar todas as funcionalidades.',
  slots: [
    { key: 'header', label: 'Grimório de Ajuda', fallback: '📖', defaultEmojiKey: 'helpCommands', description: 'Ícone no topo da ajuda' },
  ],
});

module.exports = {
  registerEmbed,
  getEmbedSchema: (id) => EMBED_REGISTRY.get(id),
  getAllEmbedsWithResolvedSlots,
  resolveSlotEmoji,
  buildEmbed,
  saveEmbedSlotEmoji,
  reloadRegistryCache,
  EMBED_REGISTRY,
};


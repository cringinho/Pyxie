const shopeeManager = require('../../services/shopeeManager');

const TAG_KEYWORD_MAP = {
  autismo: ['sensorial', 'fidget', 'abafador', 'mordedor', 'rotina', 'luminaria', 'ponderado'],
  sensorial: ['abafador', 'fidget', 'luminaria', 'ruido', 'textura'],
  saude: ['cha', 'garrafa', 'almofada', 'postura', 'massagem'],
  tecnologia: ['teclado', 'mouse', 'fone', 'suporte', 'cabo', 'hub', 'led'],
  programacao: ['teclado', 'mecanico', 'mouse', 'monitor', 'suporte', 'cafe'],
  setup: ['deskpad', 'led', 'suporte', 'teclado', 'mouse', 'organizador'],
  games: ['headset', 'controle', 'mousepad', 'suporte', 'jogo', 'figura'],
  livros: ['marcador', 'luminaria', 'estante', 'aparador', 'capa'],
  papelaria: ['caderno', 'caneta', 'planner', 'adesivo', 'post-it'],
  botanica: ['vaso', 'planta', 'regador', 'semente', 'jardim'],
  musica: ['fone', 'headphone', 'palheta', 'suporte', 'microfone'],
};

/**
 * Retorna produtos Shopee contextualizados para o artigo, com rel="sponsored nofollow".
 */
function getContextualProducts(tags = [], limit = 3) {
  try {
    const allActive = shopeeManager.getActiveItems({ shuffle: true, limit: 30 });
    if (!allActive || allActive.length === 0) return [];

    const lowerTags = (tags || []).map((t) => String(t).toLowerCase());
    const expandedKeywords = new Set(lowerTags);

    for (const tag of lowerTags) {
      if (TAG_KEYWORD_MAP[tag]) {
        for (const kw of TAG_KEYWORD_MAP[tag]) {
          expandedKeywords.add(kw);
        }
      }
    }

    const scored = allActive.map((item) => {
      const itemText = `${item.titulo || ''} ${item.categoria || ''} ${item.descricao || ''}`.toLowerCase();
      let score = 0;
      for (const kw of expandedKeywords) {
        if (itemText.includes(kw)) score += 2;
      }
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Se houver matches relevantes, pegue-os; caso contrário, faça fallback para os mais populares
    const selected = scored.slice(0, limit).map((s) => s.item);
    return selected.map((item) => ({
      id: item.id,
      titulo: item.titulo,
      preco: item.preco || 'Confira na loja',
      imagem: item.imagem || '/assets/pyxie/sticker/sticker_star.png',
      link: item.link || item.productLink || 'https://s.shopee.com.br/BU6Bod6Sw',
      rel: 'sponsored nofollow',
    }));
  } catch (err) {
    console.warn('[Hyperfokus:ShopeeContext] Erro ao carregar itens contextuais:', err.message);
    return [];
  }
}

module.exports = {
  getContextualProducts,
  TAG_KEYWORD_MAP,
};

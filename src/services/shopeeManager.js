const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const SHOPEE_FILE_PATH = path.join(__dirname, '..', 'data', 'shopee.json');

/**
 * Lê todos os produtos do arquivo JSON com fallback seguro.
 */
function getAllItems() {
  try {
    if (!fs.existsSync(SHOPEE_FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(SHOPEE_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler src/data/shopee.json:', err.message);
    return [];
  }
}

/**
 * Salva a lista de produtos atomicamente no arquivo JSON.
 */
function saveItems(items) {
  try {
    const tempPath = `${SHOPEE_FILE_PATH}.tmp_${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf8');
    fs.renameSync(tempPath, SHOPEE_FILE_PATH);
    return true;
  } catch (err) {
    console.error('Erro ao salvar src/data/shopee.json:', err.message);
    return false;
  }
}

/**
 * Embaralha um array usando algoritmo de Fisher-Yates (cópia sem mutação externa).
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Retorna um item pelo seu ID.
 */
function getItemById(id) {
  const items = getAllItems();
  return items.find((i) => String(i.id) === String(id)) || null;
}

/**
 * Retorna apenas produtos ativos e em estoque, com rotação dinâmica (variação).
 */
function getActiveItems({ shuffle = true, limit = null } = {}) {
  const items = getAllItems();
  const activeItems = items.filter(
    (item) => item.active !== false && item.status !== 'out_of_stock' && item.status !== 'inactive'
  );

  let result = shuffle ? shuffleArray(activeItems) : activeItems;
  if (limit && typeof limit === 'number' && limit > 0) {
    result = result.slice(0, limit);
  }
  return result;
}

/**
 * Verifica se um link/produto da Shopee continua ativo via requisição HTTP com timeout.
 */
function checkItemStatus(itemOrId) {
  return new Promise((resolve) => {
    const items = getAllItems();
    const item = typeof itemOrId === 'object' ? itemOrId : items.find((i) => i.id === String(itemOrId));

    if (!item) {
      return resolve({ success: false, error: 'Produto não encontrado' });
    }

    const targetUrl = item.link || item.productLink;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      item.status = 'inactive';
      item.lastChecked = Date.now();
      saveItems(items);
      return resolve({ id: item.id, status: 'inactive', active: item.active, lastChecked: item.lastChecked });
    }

    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      targetUrl,
      {
        method: 'HEAD',
        timeout: 4500,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      },
      (res) => {
        const statusCode = res.statusCode || 200;
        let newStatus = 'active';

        // Códigos 404, 410 indicam produto deletado ou esgotado
        if (statusCode === 404 || statusCode === 410) {
          newStatus = 'out_of_stock';
        } else if (statusCode >= 500) {
          // Erro de servidor momentâneo: mantém o status anterior
          newStatus = item.status || 'active';
        } else if (statusCode >= 200 && statusCode < 400) {
          newStatus = 'active';
        }

        item.status = newStatus;
        item.lastChecked = Date.now();
        saveItems(items);

        resolve({
          id: item.id,
          status: newStatus,
          active: item.active,
          statusCode,
          lastChecked: item.lastChecked,
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      // Em timeout de rede, não desativa agressivamente para evitar falsos positivos
      item.lastChecked = Date.now();
      saveItems(items);
      resolve({ id: item.id, status: item.status || 'active', active: item.active, timeout: true });
    });

    req.on('error', () => {
      item.lastChecked = Date.now();
      saveItems(items);
      resolve({ id: item.id, status: item.status || 'active', active: item.active, error: true });
    });

    req.end();
  });
}

/**
 * Executa verificação em lote dos anúncios com controle de concorrência.
 */
async function checkAllItems(concurrency = 4) {
  const items = getAllItems();
  const results = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map((item) => checkItemStatus(item)));
    results.push(...chunkResults);
    // Pequena pausa para evitar bloqueios de taxa pela Shopee
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

/**
 * Ativa ou pausa um anúncio manualmente.
 */
function toggleItemActive(id, activeState) {
  const items = getAllItems();
  const item = items.find((i) => i.id === String(id));
  if (!item) return { success: false, error: 'Item não encontrado' };

  item.active = typeof activeState === 'boolean' ? activeState : !item.active;
  saveItems(items);
  return { success: true, item };
}

/**
 * Adiciona um novo anúncio customizado à vitrine.
 */
function addItem(data) {
  const items = getAllItems();
  const newItem = {
    id: data.id ? String(data.id) : String(Date.now()),
    titulo: data.titulo || 'Achadinho Pyxie',
    titulo_en: data.titulo_en || data.titulo || 'Pyxie Find',
    preco: data.preco || 'R$ 29,90',
    preco_en: data.preco_en || '$5.50',
    tag: data.tag || 'Achadinho',
    tag_en: data.tag_en || 'Featured',
    vendas: data.vendas || '0',
    loja: data.loja || 'Shopee',
    taxa_comissao: data.taxa_comissao || '10%',
    comissao: data.comissao || 'R$ 3,00',
    productLink: data.productLink || '',
    link: data.link || data.offerLink || '',
    imagem: data.imagem || 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=400',
    active: true,
    status: 'active',
    lastChecked: Date.now(),
  };

  items.unshift(newItem);
  saveItems(items);
  return { success: true, item: newItem };
}

/**
 * Remove um anúncio da vitrine.
 */
function deleteItem(id) {
  const items = getAllItems();
  const filtered = items.filter((i) => i.id !== String(id));
  if (filtered.length === items.length) {
    return { success: false, error: 'Item não encontrado' };
  }
  saveItems(filtered);
  return { success: true };
}

/**
 * Retorna estatísticas consolidadas para o painel administrativo.
 */
function getSummaryStats() {
  const items = getAllItems();
  const total = items.length;
  const activeCount = items.filter((i) => i.active !== false && i.status === 'active').length;
  const pausedCount = items.filter((i) => i.active === false).length;
  const outOfStockCount = items.filter((i) => i.status === 'out_of_stock' || i.status === 'inactive').length;

  let maxComm = 0;
  let maxCommFormatted = 'R$ 0,00';
  let sumRates = 0;

  for (const item of items) {
    if (item.comissao) {
      const num = parseFloat(item.comissao.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
      if (num > maxComm) {
        maxComm = num;
        maxCommFormatted = item.comissao;
      }
    }
    if (item.taxa_comissao) {
      const rate = parseFloat(item.taxa_comissao.replace('%', '')) || 0;
      sumRates += rate;
    }
  }

  const avgRate = total > 0 ? (sumRates / total).toFixed(1) + '%' : '0%';

  return {
    total,
    activeCount,
    pausedCount,
    outOfStockCount,
    maxCommission: maxCommFormatted,
    avgCommissionRate: avgRate,
  };
}

module.exports = {
  getAllItems,
  getItemById,
  getActiveItems,
  checkItemStatus,
  checkAllItems,
  toggleItemActive,
  addItem,
  deleteItem,
  getSummaryStats,
};

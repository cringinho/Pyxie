/**
 * Auxiliares de Lojinha de Robux & Pagamento PIX para o Estúdio da Mary
 */

/**
 * Calcula quantos Robux o cliente deve colocar na Gamepass para que o comprador/vendedor
 * receba a quantia líquida desejada após o desconto de 30% da taxa do Roblox.
 * Fórmula canônica: ceil(robuxLiquido / 0.70)
 */
function calcRobuxGamepass(robuxReceive) {
  const amount = Number(robuxReceive) || 0;
  if (amount <= 0) return 0;
  return Math.ceil(amount / 0.7);
}

/**
 * Calcula quanto Robux líquido a pessoa recebe se a gamepass for vendida pelo preço bruto X.
 * Fórmula: floor(grossRobux * 0.70)
 */
function calcLiquidFromGamepass(grossRobux) {
  const amount = Number(grossRobux) || 0;
  if (amount <= 0) return 0;
  return Math.floor(amount * 0.7);
}

/**
 * Calcula o preço em Reais (BRL) baseado na cotação de 1.000 Robux e cupom opcional
 */
function calcPriceBRL(robuxReceive, ratePer1k = 37.0, discountPercent = 0) {
  const robux = Number(robuxReceive) || 0;
  const rate = Number(ratePer1k) || 37.0;
  const discount = Math.max(0, Math.min(100, Number(discountPercent) || 0));

  const basePrice = (robux / 1000) * rate;
  const finalPrice = basePrice * (1 - discount / 100);
  return Number(Math.max(0, finalPrice).toFixed(2));
}

/**
 * Calcula quantos Robux o cliente pode comprar com um valor em Reais (BRL)
 */
function calcReverseRobux(brlAmount, ratePer1k = 37.0) {
  const brl = Number(brlAmount) || 0;
  const rate = Number(ratePer1k) || 37.0;
  if (brl <= 0 || rate <= 0) return 0;
  return Math.floor((brl / rate) * 1000);
}

/**
 * Extrai o ID numérico da Gamepass a partir de uma URL ou string numérica
 */
function extractGamepassId(input) {
  if (!input) return null;
  const str = String(input).trim();
  const urlMatch = str.match(/(?:game-pass(?:es)?|gamepass)\/(\d+)/i) || str.match(/[?&]id=(\d+)/i);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  const numMatch = str.match(/\b(\d{5,15})\b/);
  return numMatch ? numMatch[1] : null;
}

/**
 * Consulta a API oficial do Roblox para obter detalhes completos de uma Gamepass
 */
async function fetchRobloxGamepass(gamePassIdOrUrl) {
  const gamePassId = extractGamepassId(gamePassIdOrUrl);
  if (!gamePassId) {
    return { success: false, error: 'Link ou ID numérico de Gamepass inválido.' };
  }

  try {
    const res = await fetch(`https://apis.roblox.com/game-passes/v1/game-passes/${gamePassId}/product-info`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 404) return { success: false, error: 'Gamepass não encontrada no Roblox.' };
      return { success: false, error: `Erro na API do Roblox (${res.status})` };
    }

    const data = await res.json();
    if (!data || !data.TargetId) {
      return { success: false, error: 'Dados da Gamepass não disponíveis.' };
    }

    const price = Number(data.PriceInRobux) || 0;
    const isForSale = Boolean(data.IsForSale);
    const liquidRobux = isForSale && price > 0 ? Math.floor(price * 0.7) : 0;

    let iconUrl = null;
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/game-passes?gamePassIds=${gamePassId}&size=150x150&format=Png`
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        if (thumbData?.data?.[0]?.imageUrl) {
          iconUrl = thumbData.data[0].imageUrl;
        }
      }
    } catch (_) {}

    return {
      success: true,
      id: String(data.TargetId),
      name: data.Name || 'Gamepass Sem Nome',
      description: data.Description || '',
      creatorName: data.Creator?.Name || 'Desconhecido',
      creatorId: data.Creator?.Id || null,
      creatorType: data.Creator?.CreatorType || 'User',
      priceInRobux: price,
      isForSale,
      liquidRobux,
      iconUrl,
      buyUrl: `https://www.roblox.com/game-pass/${data.TargetId}`,
    };
  } catch (err) {
    return { success: false, error: `Falha ao conectar com a API do Roblox: ${err.message}` };
  }
}

/**
 * Consulta a API oficial do Roblox para validar o nick e avatar do cliente
 */
async function fetchRobloxUser(username) {
  const cleanUsername = String(username || '').trim().replace(/^@/, '');
  if (!cleanUsername) {
    return { success: false, error: 'Nick do Roblox não informado.' };
  }

  try {
    const postRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }),
    });

    if (!postRes.ok) {
      return { success: false, error: `Falha na API do Roblox (${postRes.status})` };
    }

    const postData = await postRes.json();
    const user = postData?.data?.[0];
    if (!user || !user.id) {
      return { success: false, error: 'Usuário do Roblox não encontrado.' };
    }

    let avatarUrl = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-placeholder/150/150/AvatarHeadshot/Png/noFilter';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        if (thumbData?.data?.[0]?.imageUrl) {
          avatarUrl = thumbData.data[0].imageUrl;
        }
      }
    } catch (_) {}

    return {
      success: true,
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      avatarUrl,
      profileUrl: `https://www.roblox.com/users/${user.id}/profile`,
      creationsUrl: `https://www.roblox.com/users/${user.id}/inventory#!/places`,
    };
  } catch (err) {
    return { success: false, error: `Erro de conexão com o Roblox: ${err.message}` };
  }
}

/**
 * Calcula CRC16-CCITT (Polinômio 0x1021, Init 0xFFFF) padrão Banco Central do Brasil
 */
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatEmvField(id, value) {
  const str = String(value || '');
  const len = String(str.length).padStart(2, '0');
  return `${id}${len}${str}`;
}

/**
 * Monta o payload PIX Copia-e-Cola (BR Code EMV Estático oficial)
 */
function generatePixPayload({ key, name = 'MARY STORE', city = 'SAO PAULO', amount = 0, txid = '***' } = {}) {
  const cleanKey = String(key || '').trim();
  if (!cleanKey) return null;

  const cleanName = String(name || 'MARY STORE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, 25) || 'MARY STORE';

  const cleanCity = String(city || 'SAO PAULO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, 15) || 'SAO PAULO';

  const cleanTxid = String(txid || '***')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 25) || '***';

  const maiGui = formatEmvField('00', 'br.gov.bcb.pix');
  const maiKey = formatEmvField('01', cleanKey);
  const merchantAccountInfo = formatEmvField('26', maiGui + maiKey);

  let payload = '';
  payload += formatEmvField('00', '01'); // Payload Format Indicator
  payload += formatEmvField('01', '12'); // Ponto de Iniciação (12 = dinâmico/estático multi-uso)
  payload += merchantAccountInfo;
  payload += formatEmvField('52', '0000'); // Merchant Category Code
  payload += formatEmvField('53', '986'); // Moeda BRL

  const numAmount = Number(amount) || 0;
  if (numAmount > 0) {
    payload += formatEmvField('54', numAmount.toFixed(2));
  }

  payload += formatEmvField('58', 'BR'); // País
  payload += formatEmvField('59', cleanName);
  payload += formatEmvField('60', cleanCity);

  const additionalData = formatEmvField('05', cleanTxid);
  payload += formatEmvField('62', additionalData);

  // Campo 63 (CRC16)
  payload += '6304';
  const checksum = crc16(payload);
  return payload + checksum;
}

/**
 * Retorna URL de renderização de QR Code para o payload PIX
 */
function getPixQrCodeUrl(pixPayload) {
  if (!pixPayload) return null;
  const encoded = encodeURIComponent(pixPayload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=10`;
}

module.exports = {
  calcRobuxGamepass,
  calcLiquidFromGamepass,
  calcPriceBRL,
  calcReverseRobux,
  extractGamepassId,
  fetchRobloxGamepass,
  fetchRobloxUser,
  generatePixPayload,
  getPixQrCodeUrl,
  crc16,
};


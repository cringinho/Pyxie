const fs = require('fs');
const path = require('path');
const satori = require('satori').default || require('satori');
const { Resvg } = require('@resvg/resvg-js');
const { getUserAccount, getUserRank, TITLES_CATALOG, THEMES_CATALOG } = require('./economy');
const { getAlbumStats, getUserAlbum } = require('./tarotAlbumService');
const { getCardByNumber } = require('../data/tarotCardsCatalog');
const marriageManager = require('../modules/marriage/marriageManager');
const professions = require('./professions');
const { getLanguage, t, formatCoins } = require('../utils/i18n');
const { readJson } = require('../utils/atomicJson');

// Cache de fontes em memória (leitura única em disco)
let _cinzelFont = null;
let _quicksandFont = null;

function loadFonts() {
  if (!_cinzelFont) {
    const cinzelPath = path.join(process.cwd(), 'assets', 'fonts', 'Cinzel-700.ttf');
    _cinzelFont = fs.readFileSync(cinzelPath);
  }
  if (!_quicksandFont) {
    const quicksandPath = path.join(process.cwd(), 'assets', 'fonts', 'Quicksand-Bold.ttf');
    _quicksandFont = fs.readFileSync(quicksandPath);
  }
  return [
    { name: 'Cinzel', data: _cinzelFont, weight: 700, style: 'normal' },
    { name: 'Quicksand', data: _quicksandFont, weight: 700, style: 'normal' },
  ];
}

// Cache LRU simples para imagens externas (avatar e ícone da guilda)
const imageBase64Cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

async function fetchImageBase64(url) {
  if (!url) return null;

  const cached = imageBase64Cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.dataUri;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/png';
    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

    if (imageBase64Cache.size > 200) {
      const oldestKey = imageBase64Cache.keys().next().value;
      imageBase64Cache.delete(oldestKey);
    }
    imageBase64Cache.set(url, { dataUri, timestamp: Date.now() });

    return dataUri;
  } catch (_) {
    return null;
  }
}

function getUserMuseumArtCount(userId) {
  try {
    const data = readJson(path.join(process.cwd(), 'data', 'museumData.json'), { arts: [] });
    if (data && Array.isArray(data.arts)) {
      return data.arts.filter((a) => a.authorId === userId).length;
    }
  } catch (_) {}
  return 0;
}

/**
 * Constrói a barra visual de porcentagem (ex: [████████░░] 80%)
 */
function buildProgressBar(pct) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const filled = Math.round(clamped / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${clamped}%`;
}

/**
 * Gera o Card de Identidade Arcana em alta resolução (1200x675) via Satori + Resvg Rust.
 */
async function generateProfileCard({ targetUser, guild, source = null, client = null }) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const fonts = loadFonts();

  // Dados de identidade
  const userId = targetUser.id;
  const displayName = targetUser.displayName || targetUser.username;
  const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256 });

  // Dados da guilda de origem
  const guildName = guild?.name || (isEn ? 'Discord Community' : 'Comunidade Discord');
  const guildId = guild?.id || '0';
  const guildIconUrl = guild?.iconURL ? guild.iconURL({ extension: 'png', size: 128 }) : null;

  // Busca paralela de imagens
  const [avatarBase64, guildIconBase64] = await Promise.all([
    fetchImageBase64(avatarUrl),
    fetchImageBase64(guildIconUrl),
  ]);

  // Economia & Carreira
  const account = getUserAccount(userId);
  const rank = getUserRank(userId);
  const coins = Number(account.coins) || 0;
  const magicBeans = Number(account.magicBeans) || 0;
  const workCount = Number(account.workCount) || 0;
  const professionKey = account.profession;
  const professionLabel = professionKey
    ? t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label || professionKey
    : (isEn ? 'None (Use /py-profession)' : 'Nenhuma (Use /py-profissao)');
  const professionLevel = Math.max(1, Math.floor(workCount / 5) + 1);
  const rankStr = rank?.position ? `#${rank.position} Global` : (isEn ? 'Unranked' : 'Sem Rank');

  // Cosméticos e tema
  const equippedTitle = account.equippedTitle ? TITLES_CATALOG[account.equippedTitle] : null;
  const equippedTheme = account.equippedTheme && THEMES_CATALOG[account.equippedTheme]
    ? THEMES_CATALOG[account.equippedTheme]
    : THEMES_CATALOG.default;
  const themeColor = equippedTheme.color || '#e60067';

  let bioText = isEn
    ? 'Exploring the cosmic realms and stars of Pyxie...'
    : 'Viajando pelas estrelas e reinos da Pyxie...';
  if (account.bio && account.bio.trim()) {
    bioText = account.bio.trim();
  } else if (equippedTitle?.desc) {
    bioText = equippedTitle.desc;
  }

  // Módulo de Tarot
  const tarotStats = getAlbumStats(userId, lang);
  const userAlbum = getUserAlbum(userId);
  const discoveredCards = tarotStats.discoveredCount || 0;
  const discoveredPct = tarotStats.percentage || 0;
  const achievementsClaimed = tarotStats.achievementsClaimed || 0;

  let soulArcana = isEn ? 'None (Draw in /py-tarot)' : 'Nenhuma (Tire em /py-tarot)';
  if (userAlbum.discoveredCards && userAlbum.discoveredCards.length > 0) {
    const lastCardNum = userAlbum.discoveredCards[userAlbum.discoveredCards.length - 1];
    const cardData = getCardByNumber(lastCardNum);
    if (cardData) {
      soulArcana = `${cardData.num} • ${isEn ? (cardData.nameEn || cardData.name) : cardData.name}`;
    }
  }

  // Módulo de Casamento
  let marriage = null;
  try {
    marriage = marriageManager.getMarriage(userId);
  } catch (_) {}

  const isMarried = Boolean(marriage);
  let spouseName = isEn ? 'Single' : 'Solteiro(a)';
  let lovePoints = 0;
  let marriageDays = 0;
  let childrenCount = 0;
  let sharedVault = 0;

  if (isMarried) {
    const spouseId = marriageManager.getSpouseId(userId);
    const spouseUser = client?.users?.cache?.get(spouseId);
    spouseName = spouseUser ? (spouseUser.displayName || spouseUser.username) : (isEn ? 'Beloved Spouse' : 'Cônjuge');
    lovePoints = Math.round(marriage.lovePoints || 100);
    marriageDays = Math.max(1, Math.floor((Date.now() - (marriage.marriedAt || Date.now())) / (24 * 60 * 60 * 1000)));
    childrenCount = Array.isArray(marriage.children) ? marriage.children.length : 0;
    sharedVault = Number(marriage.sharedVaultCoins) || 0;
  }

  // Módulo do Museu 3D
  const museumArtsCount = getUserMuseumArtCount(userId);

  // Insígnias do aventureiro
  const badges = [];
  if (userId === '214153735281180673') badges.push({ icon: '👑', label: isEn ? 'Creator' : 'Criador' });
  if (rank?.position && rank.position <= 10) badges.push({ icon: '🏆', label: isEn ? 'Top 10 Wealth' : 'Top 10 Riqueza' });
  if (discoveredCards >= 78) badges.push({ icon: '🔮', label: isEn ? 'Master of 78' : 'Mestre dos 78' });
  else if (discoveredCards >= 22) badges.push({ icon: '🔮', label: isEn ? 'Major Arcana' : 'Arcanos Maiores' });
  if (isMarried && lovePoints >= 90) badges.push({ icon: '💍', label: isEn ? 'Eternal Love' : 'Amor Eterno' });
  if (workCount >= 30) badges.push({ icon: '💼', label: isEn ? 'Veteran Worker' : 'Veterano' });
  if (museumArtsCount > 0) badges.push({ icon: '🎨', label: isEn ? `Artist (${museumArtsCount})` : `Artista (${museumArtsCount})` });
  if (badges.length === 0) badges.push({ icon: '✨', label: isEn ? 'Novice Adventurer' : 'Aventureiro Iniciante' });

  // Construção declarativa da árvore Satori
  const cardNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '675px',
        backgroundColor: '#090812',
        backgroundImage: `linear-gradient(135deg, #090812 0%, #130a21 45%, #07070d 100%)`,
        color: '#ffffff',
        fontFamily: 'Quicksand',
        padding: '28px',
        border: `3px solid ${themeColor}`,
        borderRadius: '28px',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        boxShadow: `0 0 35px ${themeColor}44`,
      },
      children: [
        // 1. Topo: Brasão da Comunidade Hospedeira (Valorização do Servidor)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '10px 18px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '12px' },
                  children: [
                    guildIconBase64
                      ? {
                          type: 'img',
                          props: {
                            src: guildIconBase64,
                            style: {
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: `1px solid ${themeColor}`,
                            },
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: {
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: themeColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                            },
                            children: '🏰',
                          },
                        },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#e2e8f0',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                        },
                        children: `${isEn ? 'REGISTERED IN' : 'REGISTRADO EM'}: ${guildName.toUpperCase()} • ID: ${guildId}`,
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    fontSize: '13px',
                    color: themeColor,
                    backgroundColor: `${themeColor}22`,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${themeColor}66`,
                    fontWeight: 'bold',
                  },
                  children: `ID: ${userId}`,
                },
              },
            ],
          },
        },

        // 2. Cabeçalho de Perfil: Avatar + Nome + Título + Citação
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '24px', margin: '6px 0' },
            children: [
              // Avatar com borda neon e glow
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '108px',
                    height: '108px',
                    borderRadius: '54px',
                    border: `3px solid ${themeColor}`,
                    boxShadow: `0 0 20px ${themeColor}66`,
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#181824',
                  },
                  children: avatarBase64
                    ? [
                        {
                          type: 'img',
                          props: {
                            src: avatarBase64,
                            style: { width: '100%', height: '100%', borderRadius: '54px' },
                          },
                        },
                      ]
                    : [
                        {
                          type: 'span',
                          props: { style: { fontSize: '42px' }, children: '🌸' },
                        },
                      ],
                },
              },
              // Identificação do Usuário
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', flex: 1 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: '10px' },
                        children: [
                          equippedTitle
                            ? {
                                type: 'span',
                                props: {
                                  style: {
                                    fontSize: '13px',
                                    backgroundColor: `${themeColor}33`,
                                    color: '#ffffff',
                                    border: `1px solid ${themeColor}88`,
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                  },
                                  children: `${equippedTitle.emoji} ${equippedTitle.name}`,
                                },
                              }
                            : null,
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'Cinzel',
                                fontSize: '32px',
                                color: '#ffffff',
                                fontWeight: 'bold',
                              },
                              children: `✦ ${displayName}`,
                            },
                          },
                        ].filter(Boolean),
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#cbd5e1',
                          fontStyle: 'italic',
                          marginTop: '4px',
                          marginBottom: '8px',
                        },
                        children: `« ${bioText} »`,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '12px', fontSize: '13px', color: '#94a3b8' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                              },
                              children: `💼 ${professionLabel} (Nv. ${professionLevel})`,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                              },
                              children: `🏆 ${rankStr}`,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                              },
                              children: `🔨 ${workCount} ${isEn ? 'Shifts' : 'Expedientes'}`,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 3. Os 3 Pilares Centrais em Cards Elegantes
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: '18px', width: '100%' },
            children: [
              // Coluna 1: Patrimônio & Economia
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#fbbf24',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                        },
                        children: `🪙 ${isEn ? 'WEALTH & ECONOMY' : 'PATRIMÔNIO & ECONOMIA'}`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${formatCoins(coins, lang)}`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${magicBeans.toLocaleString(isEn ? 'en-US' : 'pt-BR')} ${isEn ? 'Magic Beans' : 'Feijões Mágicos'} 🌱`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#94a3b8' },
                        children: `• ${isEn ? 'Dedication' : 'Dedicação'}: ${workCount >= 50 ? 'Master' : workCount >= 20 ? 'Veteran' : 'Novice'}`,
                      },
                    },
                  ],
                },
              },

              // Coluna 2: Matrimônio & Família
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#f43f5e',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                        },
                        children: `💍 ${isEn ? 'FAMILY & ROMANCE' : 'MATRIMÔNIO & FAMÍLIA'}`,
                      },
                    },
                    isMarried
                      ? {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column' },
                            children: [
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Spouse' : 'Cônjuge'}: ${spouseName}`,
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '13px', color: '#fb7185', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Love' : 'Amor'}: ${buildProgressBar(lovePoints)}`,
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '13px', color: '#94a3b8' },
                                  children: `• ${marriageDays} ${isEn ? 'days' : 'dias'} • 👶 ${childrenCount} ${isEn ? 'Children' : 'Filho(s)'}`,
                                },
                              },
                            ],
                          },
                        }
                      : {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flexDirection: 'column' },
                            children: [
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                                  children: `• ${isEn ? 'Status: Single' : 'Status: Solteiro(a)'}`,
                                },
                              },
                              {
                                type: 'span',
                                props: {
                                  style: { fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' },
                                  children: `• ${isEn ? 'Propose with /py-marriage' : 'Proposta via /py-marriage'}`,
                                },
                              },
                            ],
                          },
                        },
                  ],
                },
              },

              // Coluna 3: Tarot Místico & Grimório
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.035)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '15px',
                          color: '#c084fc',
                          fontWeight: 'bold',
                          marginBottom: '10px',
                        },
                        children: `🔮 ${isEn ? 'MYSTIC TAROT ALBUM' : 'ÁLBUM DE TAROT'}`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${discoveredCards}/78 ${isEn ? 'Cards' : 'Arcanos'} (${discoveredPct}%)`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '15px', color: '#f1f5f9', marginBottom: '6px' },
                        children: `• ${achievementsClaimed}/10 ${isEn ? 'Achievements' : 'Conquistas'}`,
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#c084fc', fontStyle: 'italic' },
                        children: `• ${isEn ? 'Soul Arcana' : 'Alma Arcana'}: ${soulArcana}`,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 4. Faixa de Insígnias e Museu 3D
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '10px 16px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '8px' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: '13px', color: '#a1a1aa', fontWeight: 'bold' },
                        children: `${isEn ? 'BADGES' : 'INSÍGNIAS'}:`,
                      },
                    },
                    ...badges.map((b) => ({
                      type: 'span',
                      props: {
                        style: {
                          fontSize: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        },
                        children: `${b.icon} ${b.label}`,
                      },
                    })),
                  ],
                },
              },
              museumArtsCount > 0
                ? {
                    type: 'span',
                    props: {
                      style: {
                        fontSize: '13px',
                        color: '#67e8f9',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(103, 232, 249, 0.12)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(103, 232, 249, 0.3)',
                      },
                      children: `🎨 ${museumArtsCount} ${isEn ? 'Arts in 3D Museum' : 'Obras no Museu 3D'}`,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },

        // 5. Rodapé Honeypot de Divulgação
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '10px',
              fontSize: '13px',
              color: '#94a3b8',
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { letterSpacing: '0.3px' },
                  children: `✦ Pyxie • pyxie.com.br • ${isEn ? 'The Magical Discord Bot' : 'O Bot Mágico do Discord'}`,
                },
              },
              {
                type: 'span',
                props: {
                  style: { color: themeColor, fontWeight: 'bold' },
                  children: isEn ? 'Generate yours with /py-profile' : 'Gere o seu com /py-profile',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(cardNode, {
    width: 1200,
    height: 675,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

module.exports = {
  generateProfileCard,
};

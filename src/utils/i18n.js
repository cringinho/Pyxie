const { getGuildSettings, setGuildSettings } = require('../services/database');

const CRINGELANDIA_GUILD_ID = '1453890868980482090';

/**
 * Obtém o idioma ativo para um servidor/contexto.
 * Prioridade:
 * 1. Configuração explícita do servidor salva no banco de dados -> lang configurada (pt ou en).
 * 2. Servidor Cringelândia -> 'pt' por padrão se não houver configuração salva.
 * 3. Locale do usuário/interação (se interaction.locale for pt / pt-BR) -> 'pt', (se en) -> 'en'.
 * 4. Padrão para todos os outros servidores/usuários -> 'en' (Inglês).
 */
function getLanguage(source) {
  if (!source) return 'en';

  if (typeof source === 'string') {
    if (source === 'pt' || source === 'pt-BR') return 'pt';
    if (source === 'en' || source === 'en-US' || source === 'en-GB') return 'en';

    // 1. Verificação de configuração explícita salva no banco
    const settings = getGuildSettings(source);
    if (settings && settings.lang) return settings.lang;

    // 2. Servidor Cringelândia é PT por padrão
    if (source === CRINGELANDIA_GUILD_ID) return 'pt';

    // 3. Qualquer outro servidor é EN por padrão
    return 'en';
  }

  if (source && typeof source === 'object' && source.lang) {
    if (source.lang === 'pt' || source.lang === 'pt-BR') return 'pt';
    if (source.lang === 'en' || source.lang === 'en-US' || source.lang === 'en-GB') return 'en';
  }

  const guildId =
    source?.guild?.id ||
    source?.guildId ||
    (source?.id && typeof source.id === 'string' && source.id.length >= 17 ? source.id : null);

  // 1. Verificação de configuração explícita salva no servidor (prioridade máxima)
  if (guildId) {
    const settings = getGuildSettings(guildId);
    if (settings && settings.lang) {
      return settings.lang;
    }

    // 2. Cringelândia é PT por padrão se não houver escolha explícita do admin
    if (guildId === CRINGELANDIA_GUILD_ID) {
      return 'pt';
    }

    // 3. REGRA MANDATÓRIA: Qualquer outro servidor do Discord é ESTRITAMENTE 'en' por padrão!
    return 'en';
  }

  // 4. Detecção automática para mensagens diretas (DMs, fora de servidores)
  const locale = source?.locale;
  if (locale && typeof locale === 'string') {
    if (locale.toLowerCase().startsWith('pt')) return 'pt';
    if (locale.toLowerCase().startsWith('en')) return 'en';
  }

  // 5. Padrão internacional para servidores e DMs externos
  return 'en';
}

/**
 * Define o idioma oficial do servidor.
 */
function setGuildLanguage(guildId, lang) {
  const normalized = lang === 'pt' || lang === 'pt-BR' ? 'pt' : 'en';
  setGuildSettings(guildId, { lang: normalized });
  return normalized;
}

const CANVAS_STRINGS = {
  pt: {
    ship: {
      header: 'SHIP CRINGELÂNDIA',
      headerGeneric: 'AFINIDADE & ROMANCE',
      subtitle: 'Calculadora mágica de afinidade e romance.',
      verdictSpecial: 'Esses usuários se amam mais do que qualquer coisa no mundo.',
      verdictLow: 'Química duvidosa, mas o drama está garantido.',
      verdictMid: 'Há faísca. Talvez. Não me pressionem.',
      verdictHigh: 'Isso está perigosamente romântico.',
      person1: 'Pessoa 1',
      person2: 'Pessoa 2',
      footer: '✦ AFINIDADE & ROMANCE NO SERVIDOR ✦',
    },
    tarot: {
      arcana: 'ARCANOS',
      uprightBadge: '✦ POSIÇÃO DIRETA ✦',
      reversedBadge: '✦ POSIÇÃO INVERTIDA ✦',
      footer: 'TAROT • ORÁCULO DE CRINGELÂNDIA',
    },
  },
  en: {
    ship: {
      header: 'PYXIE LOVE METER',
      headerGeneric: 'LOVE COMPATIBILITY',
      subtitle: 'Magic romance & affinity calculator.',
      verdictSpecial: 'These two love each other more than anything in the world.',
      verdictLow: 'Questionable chemistry, but drama is guaranteed.',
      verdictMid: 'There is a spark. Maybe. Do not push it.',
      verdictHigh: 'This is dangerously romantic.',
      person1: 'Person 1',
      person2: 'Person 2',
      footer: '✦ LOVE & ROMANCE COMPATIBILITY ✦',
    },
    tarot: {
      arcana: 'ARCANA',
      uprightBadge: '✦ UPRIGHT POSITION ✦',
      reversedBadge: '✦ REVERSED POSITION ✦',
      footer: 'TAROT • PYXIE ORACLE',
    },
  },
};

const RARITY_NAMES = {
  pt: {
    COMUM: 'COMUM',
    INCOMUM: 'INCOMUM',
    RARO: 'RARO',
    ÉPICO: 'ÉPICO',
    LENDÁRIO: 'LENDÁRIO',
  },
  en: {
    COMUM: 'COMMON',
    INCOMUM: 'UNCOMMON',
    RARO: 'RARE',
    ÉPICO: 'EPIC',
    LENDÁRIO: 'LEGENDARY',
  },
};

function getCanvasStrings(source) {
  const lang = getLanguage(source);
  return CANVAS_STRINGS[lang] || CANVAS_STRINGS.en;
}

function formatCoins(coins, source = null) {
  const lang = getLanguage(source);
  const val = Number(coins) || 0;
  const numStr = lang === 'en' ? val.toLocaleString('en-US') : val.toLocaleString('pt-BR');
  const label = lang === 'en' ? 'Coins' : 'Moedinhas';
  return `${numStr} ${label}`;
}

function formatRemaining(remainingMs, source = null) {
  const lang = getLanguage(source);
  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}min`;
}

const TRANSLATIONS = {
  "pt": {
    "common": {
      "footer": "Pyxie",
      "error": "❌ Ocorreu um erro ao processar sua solicitação.",
      "onlyOwner": "❌ Este painel pertence a outro aventureiro.",
      "cooldown": "⏳ Aguarde {time} para usar novamente.",
      "noPermission": "❌ Você precisa de permissão de Administrador para usar este comando.",
      "coins": "Moedinhas",
      "magicBeans": "Feijões Mágicos",
      "ranking": "Ranking",
      "unranked": "Ainda sem colocação"
    },
    "status": {
      "title": "🌸  ✦  Status Operacional — Pyxie",
      "uptime": "⏱️ **Tempo Online:** `{uptime}`",
      "ram": "🧠 **Consumo de Memória:** `{ram} MB`",
      "servers": "🌐 **Servidores:** `{servers}`",
      "users": "👥 **Usuários Ativos:** `{users}`"
    },
    "ping": {
      "title": "🏓  ✦  Latência & Performance",
      "wsLatency": "⚡ **Latência do WebSocket:** `{latency}ms`",
      "apiLatency": "🌐 **Tempo de Resposta:** `{latency}ms`"
    },
    "vote": {
      "title": "🗳️  ✦  Vote na Pyxie no Top.gg",
      "desc": "Apoie o crescimento do bot votando no **Top.gg** a cada 12 horas e receba recompensas exclusivas instantaneamente!",
      "rewardsTitle": "🎁 **RECOMPENSAS POR VOTO:**",
      "rewardCoins": "> 🪙 **+100 Moedinhas** no cofre",
      "rewardItem": "> 🟣 **+1x Ametista Reluzente** no inventário",
      "weekendActive": "🔥 **BÔNUS DE FIM DE SEMANA ATIVO (2X):**\n> 🌟 *Todos os votos durante o fim de semana entregam o **DOBRO**! (+200 Moedas, 🟢 1x Esmeralda Nobre e +1 Feijão Mágico 🌱)!*",
      "weekendTip": "✨ **DICA DE FIM DE SEMANA (2X):**\n> *De Sexta a Domingo, todos os votos entregam o **DOBRO** (+200 Moedas, 🟢 1x Esmeralda Nobre e +1 Feijão Mágico 🌱)!*",
      "cta": "👉 *Clique no botão abaixo para abrir a página de votação:*",
      "btnLabel": "Votar no Top.gg (12h)",
      "footerText": "Recompensas entregues automaticamente em segundos!",
      "rewardBean": "> 🌱 **+1 Feijão Mágico** nos fins de semana"
    },
    "daily": {
      "titleClaimed": "<:rarecrate:1548444209328033913>  ✦  Recompensa Diária Coletada!",
      "descClaimed": "Sua recompensa diária foi entregue com sucesso no seu cofre!",
      "summaryTitle": "<a:shineygoldcoinsi:1548444230588956683> **RESUMO DA RECOMPENSA**",
      "collected": "> <a:shineygoldcoinsi:1548444230588956683> **Moedas Coletadas:** **+{amount}**",
      "balance": "> 🏦 **Saldo Atual:** **{balance}**",
      "magicBean": "> ✨ **SORTE ÉPICA (1% de Chance):** **+1x Feijão Mágico <:peakmagicbean:1548444143431323719>** (Total: **{total} <:peakmagicbean:1548444143431323719>**)",
      "titleCooldown": "<:rarecrate:1548444209328033913>  ✦  Baú Diário em Cooldown",
      "descCooldown": "⏳ Você já coletou seu baú diário hoje. Espere **{time}** para abrir novamente!",
      "voteWeekendBonus": "🔥 **BÔNUS DE FIM DE SEMANA ATIVO (2X):**\n> Vote no **Top.gg** e ganhe **+200 Moedas**, **🟢 1x Esmeralda Nobre** e **+1 Feijão Mágico 🌱**!",
      "voteWeekdayBonus": "<a:qbgifts48:1548444204202459136> **BÔNUS EXTRA NO TOP.GG (A CADA 12H):**\n> Vote no **Top.gg** e ganhe **+100 Moedas** e **🟣 1x Ametista Reluzente** *(com dobro nos fins de semana!)*",
      "btnLabel": "Resgatar Bônus no Top.gg",
      "btnLabelCooldown": "Votar no Top.gg (Recompensa Extra)",
      "btnWebBonus": "⚡ Bônus Web (+200🪙 & 📦)",
      "footer": "Recompensa renovada a cada 24 horas",
      "footerCooldown": "Voto no Top.gg disponível a cada 12 horas"
    },
    "invite": {
      "title": "✨  ✦  Convide a Pyxie para o seu Servidor!",
      "desc": "Leve a magia da **Pyxie** para a sua comunidade! Um bot completo de economia mágica, carreiras, minigames sociais, tarot místico e interações para animar seus membros.",
      "dungeonsTitle": "🎮 Minigames & Diversão",
      "dungeonsDesc": "Jokenpô PvP com apostas, enquetes ao vivo de \"Quem é mais provável\", cara ou coroa, dados de RPG e biscoito da sorte.",
      "economyTitle": "🪙 Economia, Carreiras & Mochila",
      "economyDesc": "Expedientes de trabalho com minigames, loja mágica, baús lendários, feijões mágicos e recompensas diárias.",
      "tarotTitle": "🔮 Tarot Místico & Romance",
      "tarotDesc": "Tiragem de 78 cartas de tarot com arte em Canvas, calculadora de afinidade (ship) e sistema de casamentos.",
      "btnRecommended": "✨ Adicionar Pyxie (Recomendado)",
      "btnAdmin": "👑 Convite Administrador",
      "btnSupport": "🏰 Servidor de Suporte",
      "btnVote": "⭐ Votar no Top.gg",
      "footer": "Pyxie • Magia, Lazer & Comunidade para o seu Servidor",
      "careersTitle": "💼 Carreiras & Vocações",
      "careersDesc": "Escolha sua profissão, cumpra expedientes diários, ganhe moedinhas e suba de nível profissional!"
    },
    "languageCmd": {
      "current": "🌐 O idioma deste servidor está configurado como: **Português 🇧🇷**.",
      "updated": "✅ Idioma do servidor atualizado com sucesso para: **{lang}**!"
    },
    "help": {
      "title": "{emoji}  ✦  Central de Ajuda — {label}",
      "welcome": "Bem-vindo à Central de Ajuda{server}!",
      "modulesHeader": "📖 **MÓDULOS E RECURSOS DO BOT**",
      "commandsHeader": "📋 **COMANDOS DESTE MÓDULO ({count})**",
      "selectPlaceholder": "📂 Escolha uma categoria de comandos...",
      "noCommands": "> *Nenhum comando disponível nesta categoria no momento.*",
      "tipDropdown": "💡 *Selecione uma categoria no menu suspenso abaixo para ver todos os comandos:*",
      "tipNav": "💡 *Use o menu abaixo para navegar entre outras categorias:*",
      "categories": {
        "todos": {
          "label": "Visão Geral / Todos",
          "desc": "Visão geral e índice de todas as categorias"
        },
        "bosque": {
          "label": "Bosque da Pyxie",
          "desc": "Exploração de cenários pixel, espíritos, fusão de almas e chefão comunitário"
        },
        "economia": {
          "label": "Economia & Carreiras",
          "desc": "Moedinhas, trabalho, profissões e ranking global"
        },
        "loja": {
          "label": "Loja & Mochila",
          "desc": "Baús misteriosos, relíquias, itens e inventário"
        },
        "tarot": {
          "label": "Tarot Místico",
          "desc": "Tiragens diárias, 78 arcanos e oráculo"
        },
        "social": {
          "label": "Social & Casamentos",
          "desc": "Casamentos, divórcios, perfil de aventureiro e afinidade de casal"
        },
        "utilidades": {
          "label": "Utilidades & Sistema",
          "desc": "Status operacional, ping, convite, agenda e configurações"
        }
      }
    },
    "wallet": {
      "title": "🪙  ✦  Carteira de {user}",
      "desc": "Patrimônio e recursos acumulados em sua jornada:",
      "balancesHeader": "💎 **SALDOS DISPONÍVEIS**",
      "rankingHeader": "🏆 **POSIÇÃO NO RANKING**",
      "placement": "> 🏅 **Colocação:** {rank}",
      "unranked": "Ainda sem colocação"
    },
    "profile": {
      "title": "👤  ✦  {title}{user}",
      "bioDefault": "Aventureiro destemido explorando o reino.",
      "treasureHeader": "💎 **TESOURO & ECONOMIA**",
      "coins": "> 🪙 **Moedinhas:** {coins}",
      "magicBeans": "> 🌱 **Feijões Mágicos:** {beans} 🌱",
      "ranking": "> 🏆 **Ranking:** {rank}",
      "careerHeader": "💼 **CARREIRA & VOCAÇÃO**",
      "profession": "> 🔨 **Profissão:** {profession}",
      "noProfession": "Nenhuma (Use `/profissao`)",
      "workCount": "> 📈 **Expedientes:** {count} trabalhos concluídos",
      "dedication": "> ⭐ **Dedicação:** {level}",
      "socialHeader": "💍 **VÍNCULO SOCIAL**",
      "marriedTo": "> 💍 **Casado(a) com:** {spouse}",
      "single": "> 🕊️ *Solteiro(a) • Coração Livre*",
      "btnTitles": "Títulos",
      "btnThemes": "Temas Visuais",
      "btnEditBio": "Editar Bio",
      "dedicationMaster": "Mestre",
      "dedicationVeteran": "Veterano",
      "dedicationPractitioner": "Praticante",
      "dedicationNovice": "Iniciante"
    },
    "ranking": {
      "mainTitle": "🏆  ✦  Ranking Oficial do Reino",
      "coinsTitle": "🪙  ✦  Ranking de Moedinhas Mágicas",
      "beansTitle": "🌱  ✦  Ranking de Feijões Mágicos",
      "coinsDesc": "Os aventureiros mais prósperos do reino:",
      "beansDesc": "Os maiores mestres cultivadores de Feijões Mágicos:",
      "emptyCoins": "*Nenhum registro de moedas ainda.*",
      "emptyBeans": "*Nenhum feijão cultivado ainda.*",
      "footer": "Atualizado em tempo real • Use os botões para alternar",
      "btnCoins": "🪙 Moedas",
      "btnBeans": "🌱 Feijões",
      "viewerPlacement": "👤 Sua Colocação Atual",
      "viewerLine": "> 🏅 **Posição #{position}** com **{amount}**"
    },
    "marriage": {
      "proposeTitle": "💍  ✦  Pedido de Casamento",
      "proposeDesc": "💍 {target}, você recebeu um pedido oficial de matrimônio!\n\n**{requester}** deseja unir seus laços com você no servidor.\n\n💎 **TAXA DO MATRIMÔNIO**\n> 🪙 **Investimento:** **{cost}**\n\n💌 *Clique em um dos botões abaixo para responder ao pedido:*",
      "btnAccept": "Aceitar o romance",
      "btnReject": "Quebrar meu coração",
      "acceptReply": "💖 Parabéns! **{requester}** e **{target}** agora estão oficialmente casados!",
      "rejectReply": "💔 O pedido de casamento foi recusado... o amor pode ser cruel.",
      "selfMarriage": "❌ Você não pode solicitar casamento a si mesmo.",
      "botMarriage": "❌ Bots não podem participar de casamentos.",
      "alreadyMarried": "❌ Você ou esse usuário já possui um cônjuge.",
      "pendingProposal": "❌ Já existe um pedido de casamento pendente envolvendo um de vocês.",
      "insufficientCoins": "❌ Você precisa de **{cost}** para realizar o pedido de casamento.",
      "noTarget": "❌ Escolha um usuário para solicitar o casamento.",
      "expired": "❌ Esse pedido de casamento não está mais disponível."
    },
    "divorce": {
      "title": "💔  ✦  Divórcio",
      "success": "💔 Divórcio concluído. Foram cobradas **{cost}**.",
      "notMarried": "❌ Você não está casado(a).",
      "insufficientCoins": "❌ O divórcio custa **{cost}**. Seu saldo é **{balance}**."
    },
    "profession": {
      "sameProfession": "❌ Você já é **{profession}**. Escolha uma carreira diferente.",
      "switchCost": "❌ Trocar de profissão custa **{cost}**. Seu saldo é **{balance}**.",
      "freeSuccess": "✅ Sua profissão agora é **{profession}**. Essa primeira escolha foi gratuita!",
      "paidSuccess": "✅ Sua profissão agora é **{profession}**. Foram cobradas **{cost}**.",
      "invalid": "❌ Escolha uma profissão válida: {list}.",
      "labels": {
        "programador": "Programador(a)",
        "cozinheiro": "Cozinheiro(a)",
        "artista": "Artista",
        "minerador": "Minerador(a)",
        "alquimista": "Alquimista",
        "pescador": "Pescador(a)",
        "detetive": "Detetive",
        "fazendeiro": "Fazendeiro(a)",
        "agricultor": "Agricultor(a)",
        "professor": "Professor(a)",
        "medico": "Médico(a)",
        "musico": "Músico(a)",
        "fotografo": "Fotógrafo(a)",
        "mecanico": "Mecânico(a)",
        "vendedor": "Vendedor(a)"
      }
    },
    "shop": {
      "title": "{emoji}  ✦  Lojinha — {label}",
      "catalogHeader": "🛒 **CATÁLOGO DE ITENS**",
      "empty": "> *Nenhum item disponível nesta categoria no momento.*",
      "tip": "💡 *Escolha a categoria ou compre diretamente nos menus abaixo:*",
      "selectCatPlaceholder": "📂 Escolha uma categoria da loja...",
      "buySelectPlaceholder": "🛒 Comprar item com 1 clique...",
      "btnBackpack": "Abrir Mochila",
      "buySuccess": "🎉 **Compra Realizada!** Você comprou 1x {emoji} **{name}** por **{cost}**! (Saldo restante: **{balance}**)",
      "insufficientCoins": "❌ Você precisa de **{needed}**, mas só tem **{current}**!",
      "categories": {
        "bau": {
          "label": "Baús Misteriosos",
          "desc": "Baús com moedas e gemas preciosas"
        },
        "joia": {
          "label": "Joias & Gemas Preciosas",
          "desc": "Gemas raras para comércio, coleção e prestígio"
        }
      }
    },
    "inventory": {
      "backpackTitle": "🎒  ✦  Mochila de {user}",
      "tabBosque": "🌲 Bosque & Relíquias",
      "tabSocial": "📦 Social & Baús",
      "tabTodos": "🎒 Todos",
      "emptyBackpack": "> *Sua mochila está vazia! Visite a `/loja` para adquirir baús e itens mágicos.*",
      "emptyRelics": "> *Você ainda não possui relíquias do Bosque. Explore o mapa com `/py-explorar` e vasculhe para encontrá-las!*",
      "itemsCount": "🎒 **Itens Guardados:** {count}",
      "phantomCoinsLabel": "👻 **Phantom Coins:** **{coins}**",
      "storedItemsHeader": "📦 **ITENS GUARDADOS NA MOCHILA**",
      "relicsHeader": "🏺 **RELÍQUIAS DO BOSQUE (TIERS 1 A 5)**",
      "tipSelect": "💡 *Selecione um item no menu suspenso abaixo para usá-lo ou vendê-lo:*",
      "effect": "Efeito",
      "category": "Categoria",
      "sellPrice": "Venda",
      "btnShop": "Ir para a Loja",
      "btnVisitShop": "Visitar Loja",
      "selectPlaceholder": "📦 Selecione um item da sua mochila...",
      "openChest": "Abrir {name}",
      "sellOne": "Vender 1x ({coins})",
      "hintSelect": "Selecione um item acima",
      "otherUserBackpack": "❌ Esta mochila pertence a outro aventureiro. Use `/inventario` para abrir a sua!",
      "chestOpened": "🔓 **Baú Aberto!** Você encontrou **+{coins}**{items}!",
      "soldSuccess": "🪙 Você vendeu 1x **{item}** por **+{coins}**!",
      "selectRelicPlaceholder": "🏺 Selecione uma relíquia para inspecionar ou vender...",
      "sellRelic": "🪙 Vender ({coins} 👻)",
      "relicSoldSuccess": "✨ Você vendeu 1x **{relic}** e recebeu **+{coins} Phantom Coins 👻**!"
    },
    "buy": {
      "insufficientFunds": "❌ Você precisa de **{cost}**, mas seu saldo atual é de apenas **{balance}**. Sem dinheiro, sem item.",
      "invalidItem": "❌ Item inválido ou indisponível para compra na loja.",
      "success": "✅ Compra realizada com sucesso! Você adquiriu **{amount}x {emoji} {name}** por **{cost}**.\nSaldo restante: **{balance}**.",
      "needIdPrefix": "❌ Informe o ID do item que deseja comprar. Use `py!shop` (ou `py!loja`) para ver os itens disponíveis."
    },
    "sell": {
      "insufficientItems": "❌ Você não possui itens suficientes na sua mochila (Você tem: **{count}x**).",
      "untradable": "❌ Este item não pode ser vendido.",
      "invalidItem": "❌ Item inválido ou não encontrado.",
      "success": "💰 Você vendeu **{amount}x {emoji} {name}** e recebeu **+{earnings}**!\nNovo saldo: **{balance}**.",
      "needIdPrefix": "❌ Informe o item que deseja vender. Use `py!inventory` (ou `py!inventario`) para ver o que você possui."
    },
    "trade": {
      "expired": "⏳ Esta proposta de troca expirou ou já foi encerrada.",
      "notParticipant": "❌ Você não participa desta negociação.",
      "cancelled": "❌ A proposta de troca foi cancelada por <@{user}>.",
      "completedTitle": "🤝  ✦  Troca Concluída com Sucesso!",
      "completedDesc": "🎉 A transferência foi realizada com sucesso entre <@{sender}> e <@{receiver}>!\n\n⏳ *Ambos os usuários entraram em cooldown de 30 minutos para novas trocas.*",
      "inProgressTitle": "🤝  ✦  Proposta de Troca em Andamento",
      "inProgressDesc": "Aguardando a confirmação de ambas as partes para concluir a troca atômica.\n\n> 🔵 <@{sender}>: {sStatus}\n> 🔴 <@{receiver}>: {rStatus}\n\n⏳ *Tempo restante para expirar: menos de 2 minutos.*",
      "btnConfirm": "Confirmar Troca",
      "btnCancel": "Cancelar Troca",
      "confirmed": "✅ **CONFIRMOU**",
      "waiting": "⏳ Aguardando...",
      "proposalTitle": "🤝  ✦  Proposta de Troca",
      "proposalDesc": "<@{sender}> enviou uma proposta de troca oficial para <@{receiver}>!\n\n📦 **OFERTA PROPOSTA:**\n> {offer}\n\n💌 *<@{receiver}>, clique em Confirmar abaixo para aceitar ou em Cancelar para recusar.*",
      "itemOffer": "📦 **{amount}x {emoji} {name}**",
      "coinOffer": "🪙 **{amount} Moedinhas**"
    },
    "ship": {
      "countError": "❌ Escolha exatamente duas pessoas ou deixe o comando sem menções para sortear.",
      "botError": "❌ Bots não podem entrar no sorteio de casal.",
      "sameUserError": "❌ A mesma pessoa duas vezes não forma um casal.",
      "notMemberError": "❌ Só é possível juntar pessoas que estejam neste servidor.",
      "genericError": "❌ Não foi possível preparar esse casal agora. Tente novamente.",
      "twoMembersNeeded": "❌ São necessários pelo menos 2 membros no servidor para realizar o sorteio.",
      "fetchError": "❌ Não foi possível buscar os membros do servidor no momento.",
      "coupleName": "💑 **NOME DO CASAL**",
      "specialCoupleName": "💍 **NOME DO CASAL**",
      "compatibility": "📊 **COMPATIBILIDADE: {percent}% DE AFINIDADE**",
      "specialCompatibility": "✨ **COMPATIBILIDADE: 100% DE AMOR ABSOLUTO**",
      "eternalTitle": "💖  ✦  Ship Eterno — {guild}  ✦  💖",
      "normalTitle": "{emoji}  ✦  Ship — {guild}"
    },
    "tarot": {
      "bribeBtn": "Tentar Nova Tiragem (350 🪙)",
      "cardLabel": "CARTA",
      "orientationReversed": "INVERTIDA",
      "orientationUpright": "DIRETA",
      "keywords": "PALAVRAS-CHAVE",
      "destinyMessage": "MENSAGEM DO DESTINO",
      "alreadyDrawnTitle": "🔮 **Você já tirou sua carta de hoje!**",
      "nextFree": "PRÓXIMA TIRAGEM GRATUITA",
      "nextFreeDesc": "Disponível em **{time}** (às 00:00 BRT).",
      "bribeSection": "SUBORNO DO DESTINO",
      "bribeSectionDesc": "Não quer esperar ou quer tentar uma nova sorte? Você pode forçar uma nova leitura no botão abaixo por **350 Moedinhas**.",
      "insufficientBribe": "❌ Saldo insuficiente. É necessário **{cost}** para tentar uma nova tiragem, mas você possui **{balance}**.",
      "bribeUnavailable": "❌ Não foi possível realizar uma nova leitura no momento. Tente novamente mais tarde.",
      "title": "Tarot",
      "publicTitle": "🔮  ✦  Nova Tiragem no Tarot{guild}",
      "publicDesc": "{humor}O membro <@{user}> tirou a carta **{card}** (**POSIÇÃO {orientation}**)!",
      "publicHumor": "🔮 *Tiragem adicional solicitada pelo membro!*\n\n"
    },
    "admin": {
      "noPermission": "❌ Apenas administradores podem configurar esta funcionalidade.",
      "welcomeSuccess": "✅ Canal de boas-vindas configurado para {channel} com sucesso.",
      "welcomeNeedChannel": "❌ Você precisa indicar um canal de texto válido.",
      "economyConfigSuccess": "✅ Diário configurado: entre **{min}** e **{max}** {coins}.",
      "economyConfigInvalid": "❌ O valor mínimo deve ser menor ou igual ao valor máximo.",
      "setEconomySuccess": "✅ Economia de **{user}** definida para **{coins}**.",
      "resetEconomySuccess": "✅ Economia de **{user}** resetada. Saldo: **{coins}**.",
      "emojisExportTitle": "🎀  ✦  Lista de Emojis — {server}",
      "emojisExportDesc": "Catálogo completo de emojis customizados do servidor **{server}**:\n\n📊 **ESTATÍSTICAS DOS EMOJIS**\n> 🎀 **Total de Emojis:** **{count}**\n> ✨ **Emojis Animados:** **{animated}**\n> 📄 **Arquivo Anexo:** `emojis-do-servidor.json`\n\n📥 *O arquivo JSON com a lista completa foi anexado a esta mensagem.*",
      "agendaTitle": "📅  ✦  Agenda de Automações{server}",
      "agendaDesc": "Próximas tarefas automáticas e verificações agendadas:",
      "onlyServer": "❌ Este comando precisa ser usado dentro de um servidor.",
      "onlyOwner": "❌ **Acesso Restrito:** Apenas o criador da Pyxie ({owner}) pode executar este comando.",
      "title": "🛡️  ✦  Painel de Administração do Dono",
      "desc": "Olá criador! Seu link seguro de acesso ao painel foi gerado.\n\n> 🔐 **Autenticação:** Criptografada via HMAC-SHA256\n> ⏳ **Validade:** 15 minutos (uso único)\n> 🌐 **Rede:** Restrito aos seus IPs autorizados\n\n*Clique no botão abaixo para abrir seu console administrativo:*",
      "btnOpen": "⚡ Acessar Painel do Dono",
      "footer": "Painel Confidencial da Pyxie • Protegido por Snowflake & IP"
    },
    "workMinigame": {
      "noProfession": "❌ Você ainda não possui uma profissão registrada! Use `/profissao` para escolher sua vocação antes de trabalhar.",
      "cooldown": "⏳ Você já trabalhou recentemente! Aguarde **{time}** para iniciar um novo expediente.",
      "wrongTitle": "❌  ✦  Expediente de {profession} Falhou",
      "wrongMistake": "Você cometeu um equívoco na sua tomada de decisão profissional!",
      "correctAnswerLabel": "💡 **DECISÃO TÉCNICA CORRETA**",
      "nextShiftLabel": "⏳ **PRÓXIMO EXPEDIENTE**",
      "noSalaryText": "> Você não recebeu salário desta vez. Descanse e tente novamente em **3 horas**!",
      "successTitle": "✅  ✦  Expediente de {profession} Concluído!",
      "successDedication": "Você resolveu o desafio com maestria técnica e dedicação!",
      "salaryHeader": "💰 **REMUNERAÇÃO DO EXPEDIENTE**",
      "salaryLine": "> 🪙 **Salário Recebido:** **+{amount}**",
      "balanceLine": "> 💳 **Novo Saldo:** **{balance}**",
      "careerHeader": "📈 **CARREIRA**",
      "workCountLine": "> 🔨 **Total Concluído:** **{count}** trabalhos",
      "epicBeanBonus": "✨ **BÔNUS ÉPICO DE DESEMPENHO (2% de Chance)!**",
      "epicBeanDesc": "> 🌱 Você recebeu **+1 Feijão Mágico** pelo serviço impecável! (Saldo: **{beans} 🌱**)",
      "minigameTitle": "💼  ✦  Expediente de {profession} — Minigame",
      "timeLimit": "⏱️ **TEMPO DE RESPOSTA: 45 SEGUNDOS**\nEscolha a melhor alternativa nos botões abaixo:",
      "otherUserSession": "❌ Este expediente pertence a outro trabalhador. Use `/trabalho` para iniciar o seu!",
      "expiredSession": "⌛ Este expediente já foi finalizado ou expirou. Use `/trabalho` novamente quando estiver disponível!"
    },
    "gloom": {
      "footer": "Bosque da Pyxie • Pyxie",
      "explore": {
        "title": "{emoji}  ✦  {name} — {tide}",
        "tideLabel": "🌊 **Maré da Penumbra:** `{tide}`",
        "stamina": "🔋 **Energia:** `{current}/{max}` (Recarrega 1 a cada 6 min)",
        "phantomCoins": "👻 **Phantom Coins:** `{coins}`",
        "tracesHeader": "📜 **Últimos Rastros de Giz Roxo:**",
        "noTraces": "> *Nenhum rastro gravado aqui recentemente.*",
        "traceItem": "> ✍️ **{author}:** *\"{message}\"* {offering}",
        "offeringText": "(🎁 Deixou {coins} 👻!)",
        "btnForage": "🔍 Vasculhar (1⚡)",
        "btnGrimoire": "📖 Grimório ({count})",
        "btnTrace": "✍️ Deixar Rastro (15👻)",
        "btnBoss": "💀 Chefão da Penumbra",
        "btnMove": "Ir para {destination}",
        "directMoveNotFound": "❌ Não encontrei nenhum caminho para **{destination}**. Verifique os cenários vizinhos disponíveis!",
        "forageSuccessCoins": "✨ Você vasculhou as sombras e encontrou **+{coins} Phantom Coins 👻**!",
        "forageSuccessItem": "📦 Você vasculhou os escombros e encontrou **1x {item}**!",
        "forageNoEnergy": "⏳ Você está esgotado pelas trevas! Energia recarrega em **{time}s** (máximo 10/hora).",
        "roomBanned": "🚫 Os espíritos expulsaram você desta sala! Retorne em {time} min após recuperar a compostura.",
        "portalOpened": "🌀 **PORTAL MÍSTICO REVELADO!** Uma fenda dimensional abriu caminho para o **Jardim das Rosas de Vidro**!",
        "encounterAlert": "👻 **UMA APARIÇÃO SURGIU DAS SOMBRAS!**",
        "traceSuccess": "✅ Seu rastro de giz roxo foi gravado na pedra com sucesso!",
        "travelSuccess": "🚶 Você viajou para: **{destination}**!",
        "travelLocked": "🔒 Este caminho está bloqueado! {reason}",
        "insufficientCoins": "❌ Saldo insuficiente! Requer **{cost} Phantom Coins 👻**.",
        "reasons": {
          "locked_tide": "Passagem selada. Requer a Maré da Lua de Sangue Roxo ou uma Lágrima Emo.",
          "requires_key": "Porta trancada. Requer uma Chave Espectral para abrir.",
          "insufficient_exploration": "Caminho perigoso. Explore pelo menos 3 locais comuns antes de cruzar o abismo.",
          "requires_fairy": "Santuário protegido. Requer um familiar com afinidade de Fada equipado ou um portal místico aberto.",
          "requires_boss": "Acesso negado. Requer ter participado do apaziguamento do Chefão Comunitário no ciclo atual.",
          "requires_boss_defeated": "Acesso negado. O Santuário só se abre quando o Chefão Comunitário for derrotado no ciclo atual com sua participação ativa na batalha.",
          "requires_grimoire_spirits": "O trono de obsidiana rejeita sua alma. Requer pelo menos 3 espíritos recrutados no seu Grimório.",
          "requires_t4_relic": "Santuário selado. Requer carregar pelo menos uma Relíquia de Tier 4 ou 5 (nobreza da penumbra) no inventário.",
          "banned": "Você está banido desta sala por insultar as entidades locais. Tempo restante: {time} min."
        },
        "dangerLevel": "⚡ **Perigo:** Tier {tier} • Penalidade por Falha Crítica: Ban de {banMinutes}m"
      },
      "negotiate": {
        "title": "💬  ✦  Negociação com {name}",
        "footer": "Pacto Espectral • Pyxie",
        "fled": "🏃 Você se esgueirou de volta pelas sombras sem fazer barulho.",
        "demandCoins": "💰 Pagar Tributo ({cost} 👻)",
        "demandEnergy": "⚡ Doar Vigor ({amount}⚡)",
        "demandRelic": "🏺 Entregar {relic}",
        "btnBribe": "💰 Subornar ({cost} 👻)",
        "btnBailout": "💸 Resgate Extorsivo ({cost} 👻)",
        "btnFlee": "🏃 Fugir",
        "successWit": "🎉 **Pacto Fechado!** Você impressionou **{spirit}** com sua sagacidade e ganhou **+{coins} Phantom Coins 👻**!",
        "successBribe": "🤝 **Tributo Aceito!** Você pagou **{cost} Phantom Coins 👻** e **{spirit}** agora obedece ao seu chamado!",
        "bailoutSuccess": "🤝 **Resgate Aceito!** Vendo que você estava quase lá, você pagou a extorsão de **{cost} Phantom Coins 👻** e **{spirit}** aceitou o pacto!",
        "bailoutOffer": "> 🎭 *« Quase me convenceu, mortal... Mas se quiser que eu esqueça seu tropeço final, vai ter que pagar o triplo pelo meu silêncio! »*\n\n🪙 **Custo do Resgate:** **{cost} Phantom Coins 👻**",
        "sycophancyPenalty": "💢 **Taxa de Desacato por Bajulação!** O espírito repugnou sua subserviência e surrupiou **-{stolen} Phantom Coins 👻** da sua bolsa antes de te expulsar!",
        "hesitationPenalty": "⏳ **Pena por Hesitação!** Você hesitou demais em um reino hostil. A criatura perdeu a paciência!",
        "ejectionFine": "💸 **Multa de Ejeção:** Você perdeu **-{fine} Phantom Coins 👻** (10% do seu saldo) na fuga apressada!",
        "failed": "💨 **A Aparição Desapareceu!** {spirit} zombou da sua resposta e sumiu na bruma roxa!",
        "criticalFailure": "💀 **FALHA CRÍTICA!** As sombras foram insultadas pela sua resposta patética! Você foi expulso e banido de {location} por {time} minutos!",
        "alreadyOwned": "ℹ️ Você já possui este espírito no seu Grimório!"
      },
      "merchant": {
        "title": "🛒  ✦  O Comerciante de Relíquias",
        "footer": "Comerciante de Relíquias • Pyxie",
        "desc": "Um contrabandista encapuzado emerge das sombras oferecendo relíquias raras por Phantom Coins 👻.",
        "phantomCoins": "👻 **Seu Saldo:** `{coins} Phantom Coins`",
        "stockHeader": "🏺 **RELÍQUIAS DISPONÍVEIS:**",
        "buySuccess": "✨ Você adquiriu **{item}** por **{cost} Phantom Coins 👻**!",
        "insufficientCoins": "❌ Você precisa de **{cost} Phantom Coins 👻** para comprar esta relíquia.",
        "btnBuy": "Comprar {item} ({cost}👻)",
        "btnBack": "⬅️ Voltar à Exploração"
      },
      "engineer": {
        "title": "🛠️  ✦  O Engenheiro de Relíquias",
        "footer": "Engenheiro de Relíquias • Pyxie",
        "desc": "Um artesão excêntrico com runas e solda violeta oferece fusão de relíquias por Phantom Coins 👻.",
        "phantomCoins": "👻 **Seu Saldo:** `{coins} Phantom Coins`",
        "myRelics": "📦 **Suas Relíquias por Tier:** T1: `{t1}` | T2: `{t2}` | T3: `{t3}` | T4: `{t4}` | T5: `{t5}`",
        "recipesHeader": "⚗️ **BANCADA DE FUSÃO RÚNICA:**",
        "recipeLine": "> 🔹 **Tier {tier} ➔ Tier {nextTier}:** 2x Relíquias T{tier} + {cost}👻 (Sucesso: {rate}%)",
        "success": "🔮 **Aprimoramento Perfeito!** As relíquias se fundiram com sucesso em **{item}** (Tier {tier})!",
        "failure": "💥 **DESASTRE NA FORJA!** {quote}\nAs 2 relíquias sacrificadas foram destruídas para sempre!",
        "insufficientMaterials": "❌ Você precisa de pelo menos 2x relíquias de Tier {tier} para aprimorar.",
        "insufficientCoins": "❌ O serviço do engenheiro custa **{cost} Phantom Coins 👻**.",
        "btnUpgrade": "Fundir 2x T{tier} ({cost}👻)",
        "btnBack": "⬅️ Voltar à Exploração"
      },
      "grimoire": {
        "title": "📖  ✦  Grimório de Sombras — {user}",
        "desc": "Espíritos sombrios e familiares vinculados à sua alma.",
        "phantomCoins": "👻 **Saldo:** `{coins} Phantom Coins`",
        "equippedHeader": "⚔️ **Familiares Ativos ({count}/{max}):**",
        "noEquipped": "> *Nenhum familiar equipado. Use os botões abaixo para ativar suas auras passivas!*",
        "collectedHeader": "📜 **Espíritos Coletados ({count}):**",
        "noSpirits": "> *Seu grimório está vazio. Explore as salas do reino para negociar com aparições!*",
        "tagActive": " `[ATIVO]`",
        "btnFuse": "⚗️ Caldeirão de Fusão (30👻)",
        "btnBack": "⬅️ Voltar à Exploração",
        "btnBind": "Vincular {spirit}",
        "btnUnbind": "Desvincular {spirit}",
        "equipSuccess": "✨ Você vinculou **{spirit}**! Aura ativa: **{aura}** ({desc})",
        "unequipSuccess": "💤 Você desvinculou **{spirit}** do seu elo ativo."
      },
      "fusion": {
        "title": "⚗️  ✦  Caldeirão de Fusão de Almas",
        "footer": "Fusão Arcana de Almas • Pyxie",
        "desc": "Selecione dois espíritos do seu grimório para fundi-los em uma nova criatura superior!",
        "selectPlaceholder": "Selecione um espírito para fundir...",
        "ritualCost": "🪙 **Custo do Ritual:** `{cost} Phantom Coins`",
        "success": "🔮 **FUSÃO CONCLUÍDA!** As almas se fundiram no caldeirão e deram origem a **{spirit}** (Tier {tier})!",
        "insufficientCoins": "❌ Você precisa de **{cost} Phantom Coins 👻** para realizar este ritual de fusão!",
        "cannotFuse": "❌ Não foi possível fundir estes espíritos."
      },
      "boss": {
        "title": "💀  ✦  Chefão Comunitário — {name}",
        "footer": "Chefão Comunitário • Pyxie",
        "yourDamage": "🛡️ **Seu Dano Total:** `{damage}`",
        "desc": "Um colosso sombrio que desafia todo o reino. Cada investida enfraquece a entidade coletivamente!",
        "hpBar": "🩸 **Vontade do Colosso:** `{currentHp}/{maxHp}` ({percent}%)",
        "btnAttack": "⚔️ Investida no Chefão (1x Grátis)",
        "btnAttackExtra": "⚔️ Investida Extra Desbloqueada!",
        "btnWebBonus": "📺 Assistir Bônus 10s (Investida Extra)",
        "btnRefresh": "🔄 Já assisti / Atualizar",
        "attackSuccess": "💥 Você desferiu um ataque sombrio causando **{damage} de dano** e ganhou **+{coins} Phantom Coins 👻**!",
        "cooldown": "⏳ Você já realizou sua investida neste ciclo de 6 horas!\n\n✨ **Deseja atacar o Colosso novamente agora?**\nAssista ao bônus patrocinado de 10 segundos no portal web para liberar **+1 Investida Extra** e **50 Phantom Coins 👻**!",
        "defeated": "🏆 **O COLOSSO FOI APACIGUADO!** A Sombra Ancestral foi vencida e o reino celebra sua vitória!",
        "alreadyDefeated": "🏆 O Colosso Ancestral já foi apaziguado neste ciclo de 6 horas! O Santuário de Pyxie permanece aberto para os valorosos guerreiros."
      }
    },
    "wiki": {
      "title": "📖  ✦  Wiki Oficial da Pyxie & Bosque da Penumbra",
      "desc": "Explore a enciclopédia oficial de mecânicas, regras de navegação, matriz de sintonia espectral, relíquias e sistemas da Pyxie.",
      "footer": "Wiki Oficial • Pyxie",
      "btnOpenWeb": "🌐 Abrir Wiki Completa na Web",
      "categoryPlaceholder": "Selecione um tópico da enciclopédia...",
      "optBosque": "🌲 Bosque da Penumbra & Mapas",
      "optBosqueDesc": "Guia dos 10 cenários, Tiers de perigo, regras de navegação e marés.",
      "optSmt": "🧠 Sintonia Espectral & Temperamentos",
      "optSmtDesc": "Matriz de 7 tons de resposta, extorsão e regras de afinidade da penumbra.",
      "optRelics": "🏺 Relíquias & Fusão de Almas",
      "optRelicsDesc": "Tiers de relíquias T1 a T5, Engenheiro e Caldeirão de Fusão.",
      "optBestiary": "📜 Bestiário da Penumbra",
      "optBestiaryDesc": "Catálogo dos 14 espíritos sombrios, auras passivas e temperamentos.",
      "optEco": "🪙 Economia & Moedas Fantasma",
      "optEcoDesc": "Phantom coins, vigor, chefão comunitário e loja.",
      "topicBosqueTitle": "🌲 Bosque da Penumbra — Cenários e Tiers",
      "topicBosqueDesc": "O Bosque é composto por 10 cenários conectados em grafo direcionado, variando do Tier 1 ao Tier 5. Falhas críticas expulsam o explorador de volta ao Portão da Penumbra e aplicam bloqueio temporário (de 30m no T1 até 240m no T5). Certas salas exigem marés específicas (ex: Maré da Lua Roxa) ou itens especiais (Chave Espectral, Familiar com afinidade Fada).",
      "topicSmtTitle": "🧠 Sintonia Espectral — Matriz Psicológica da Penumbra",
      "topicSmtDesc": "Monstros e aparições possuem temperamentos específicos (Caótico, Sádico, Orgulhoso, Melancólico, Intelectual, Ingenuo, Cínico). Respostas subservientes contra demônios orgulhosos geram Taxa de Desacato (-2 e roubo de 100-300 Phantom Coins). No Tier 3+, duas respostas neutras acionam Pena de Hesitação (-2 imediato). Respostas óbvias não funcionam: adapte o tom psicológico ao temperamento.",
      "topicRelicsTitle": "🏺 Relíquias & Caldeirão de Fusão",
      "topicRelicsDesc": "Relíquias são obtidas vasculhando o Bosque ou comprando com o Comerciante Errante (Tiers 1 a 5). No Engenheiro de Relíquias, você pode aprimorar 3 materiais de mesmo tier para tentar forjar um tier superior (há chance de destruição!). No Caldeirão de Fusão, combine dois espíritos para gerar uma nova criatura com habilidades e auras mais poderosas.",
      "topicBestiaryTitle": "📜 Bestiário da Penumbra — 14 Espíritos Catalogados",
      "topicBestiaryDesc": "O reino abriga 14 entidades únicas distribuídas entre os Tiers 1 a 5: Espectro do Baixo Astral, Gárgula Procrastinador, Fada Desencantada, Morcego Shoegaze, Corvo Poeta, Banshee Descarregada, Lobisomem Introvertido, Esqueleto de All-Star, Lorde da Apatia, Quimera da Madrugada, Cavaleiro da Névoa, Súcubo do Tédio, Fênix de Cinzas Frias e a lendária Sombra Ancestral.",
      "topicEcoTitle": "🪙 Economia Arcana & Chefão Comunitário",
      "topicEcoDesc": "Phantom Coins (👻) são moedas do além usadas para subornos, resgates extorsivos e compra de relíquias. A cada 6 horas, o Chefão Comunitário desperta em um cenário aleatório; todos os exploradores recebem uma investida grátis para derrotá-lo e compartilhar a recompensa lendária."
    }
  },
  "en": {
    "common": {
      "footer": "Pyxie",
      "error": "❌ An error occurred while processing your request.",
      "onlyOwner": "❌ This panel belongs to another adventurer.",
      "cooldown": "⏳ Please wait {time} before using this again.",
      "noPermission": "❌ You need Administrator permissions to use this command.",
      "coins": "Coins",
      "magicBeans": "Magic Beans",
      "ranking": "Leaderboard",
      "unranked": "Not ranked yet"
    },
    "status": {
      "title": "🌸  ✦  Operational Status — Pyxie",
      "uptime": "⏱️ **Uptime:** `{uptime}`",
      "ram": "🧠 **Memory Usage:** `{ram} MB`",
      "servers": "🌐 **Servers:** `{servers}`",
      "users": "👥 **Active Users:** `{users}`"
    },
    "ping": {
      "title": "🏓  ✦  Latency & Performance",
      "wsLatency": "⚡ **WebSocket Latency:** `{latency}ms`",
      "apiLatency": "🌐 **API Response Time:** `{latency}ms`"
    },
    "vote": {
      "title": "🗳️  ✦  Vote for Pyxie on Top.gg",
      "desc": "Support the bot on **Top.gg** every 12 hours and claim exclusive instant rewards!",
      "rewardsTitle": "🎁 **VOTE REWARDS:**",
      "rewardCoins": "> 🪙 **+100 Coins** in your vault",
      "rewardItem": "> 🟣 **+1x Shimmering Amethyst** in your backpack",
      "weekendActive": "🔥 **WEEKEND BONUS ACTIVE (2X):**\n> 🌟 *All votes during the weekend deliver **DOUBLE**! (+200 Coins, 🟢 1x Noble Emerald, and +1 Magic Bean 🌱)!*",
      "weekendTip": "✨ **WEEKEND TIP (2X):**\n> *From Friday to Sunday, all votes deliver **DOUBLE** (+200 Coins, 🟢 1x Noble Emerald, and +1 Magic Bean 🌱)!*",
      "cta": "👉 *Click the button below to open the voting page:*",
      "btnLabel": "Vote on Top.gg (12h)",
      "footerText": "Rewards delivered automatically in seconds!",
      "rewardBean": "> 🌱 **+1 Magic Bean** on weekends"
    },
    "daily": {
      "titleClaimed": "<:rarecrate:1548444209328033913>  ✦  Daily Reward Collected!",
      "descClaimed": "Your daily reward has been safely deposited into your vault!",
      "summaryTitle": "<a:shineygoldcoinsi:1548444230588956683> **REWARD SUMMARY**",
      "collected": "> <a:shineygoldcoinsi:1548444230588956683> **Coins Collected:** **+{amount}**",
      "balance": "> 🏦 **Current Balance:** **{balance}**",
      "magicBean": "> ✨ **EPIC LUCK (1% Chance):** **+1x Magic Bean <:peakmagicbean:1548444143431323719>** (Total: **{total} <:peakmagicbean:1548444143431323719>**)",
      "titleCooldown": "<:rarecrate:1548444209328033913>  ✦  Daily Crate on Cooldown",
      "descCooldown": "⏳ You already claimed your daily crate today. Please wait **{time}** before claiming again!",
      "voteWeekendBonus": "🔥 **WEEKEND BONUS ACTIVE (2X):**\n> Vote on **Top.gg** and get **+200 Coins**, **🟢 1x Noble Emerald**, and **+1 Magic Bean 🌱**!",
      "voteWeekdayBonus": "<a:qbgifts48:1548444204202459136> **EXTRA TOP.GG BONUS (EVERY 12H):**\n> Vote on **Top.gg** and get **+100 Coins** and **🟣 1x Shimmering Amethyst** *(doubled on weekends!)*",
      "btnLabel": "Claim Bonus on Top.gg",
      "btnLabelCooldown": "Vote on Top.gg (Extra Reward)",
      "btnWebBonus": "⚡ Web Bonus (+200🪙 & 📦)",
      "footer": "Reward resets every 24 hours",
      "footerCooldown": "Top.gg voting available every 12 hours"
    },
    "invite": {
      "title": "✨  ✦  Invite Pyxie to your Discord Server!",
      "desc": "Bring the magic of **Pyxie** to your community! A feature-packed Discord bot with magical economy, careers, social minigames, mystical tarot, and interactions to liven up your members.",
      "dungeonsTitle": "🎮 Community Minigames & Fun",
      "dungeonsDesc": "PvP Rock-Paper-Scissors with coin bets, live \"Who is most likely to\" polls, coinflip, dice rolls, and fortune cookies.",
      "economyTitle": "🪙 Economy, Careers & Inventory",
      "economyDesc": "Interactive career shifts with minigames, magical shop, mythical chests, magic beans, and daily rewards.",
      "tarotTitle": "🔮 Mystical Tarot & Romance",
      "tarotDesc": "Full 78-card tarot spreads with rendered canvas art, love compatibility ship meter, and marriage system.",
      "btnRecommended": "✨ Add Pyxie (Recommended)",
      "btnAdmin": "👑 Admin Invite",
      "btnSupport": "🏰 Support Server",
      "btnVote": "⭐ Vote on Top.gg",
      "footer": "Pyxie • Magic, Leisure & Community for your Server",
      "careersTitle": "💼 Careers & Vocations",
      "careersDesc": "Choose your profession, complete work shifts, earn coins, and advance your career level!"
    },
    "languageCmd": {
      "current": "🌐 This server language is set to: **English 🇺🇸**.",
      "updated": "✅ Server language successfully updated to: **{lang}**!"
    },
    "help": {
      "title": "{emoji}  ✦  Help Center — {label}",
      "welcome": "Welcome to the Help Center{server}!",
      "modulesHeader": "📖 **BOT MODULES & FEATURES**",
      "commandsHeader": "📋 **MODULE COMMANDS ({count})**",
      "selectPlaceholder": "📂 Choose a command category...",
      "noCommands": "> *No commands currently available in this category.*",
      "tipDropdown": "💡 *Select a category in the dropdown menu below to view all commands:*",
      "tipNav": "💡 *Use the menu below to navigate between categories:*",
      "categories": {
        "todos": {
          "label": "Overview / All",
          "desc": "Overview and index of all command categories"
        },
        "bosque": {
          "label": "Pyxie's Grove",
          "desc": "Pixel scenery exploration, spirit negotiation, soul fusion, and community boss"
        },
        "economia": {
          "label": "Economy & Careers",
          "desc": "Coins, work shifts, professions, and global leaderboards"
        },
        "loja": {
          "label": "Shop & Backpack",
          "desc": "Mystery chests, relics, items, and inventory"
        },
        "tarot": {
          "label": "Mystic Tarot",
          "desc": "Daily readings, 78 arcana, and oracle"
        },
        "social": {
          "label": "Social & Marriage",
          "desc": "Marriages, divorces, profile cards, and love compatibility"
        },
        "utilidades": {
          "label": "Utilities & System",
          "desc": "Operational status, ping, invite, schedule, and settings"
        }
      }
    },
    "wallet": {
      "title": "🪙  ✦  {user}’s Wallet",
      "desc": "Assets and resources accumulated during your journey:",
      "balancesHeader": "💎 **AVAILABLE BALANCES**",
      "rankingHeader": "🏆 **LEADERBOARD POSITION**",
      "placement": "> 🏅 **Rank:** {rank}",
      "unranked": "Not ranked yet"
    },
    "profile": {
      "title": "👤  ✦  {title}{user}",
      "bioDefault": "Fearless adventurer exploring the realm.",
      "treasureHeader": "💎 **TREASURE & ECONOMY**",
      "coins": "> 🪙 **Coins:** {coins}",
      "magicBeans": "> 🌱 **Magic Beans:** {beans} 🌱",
      "ranking": "> 🏆 **Leaderboard:** {rank}",
      "careerHeader": "💼 **CAREER & VOCATION**",
      "profession": "> 🔨 **Profession:** {profession}",
      "noProfession": "None (Use `/profissao`)",
      "workCount": "> 📈 **Shifts:** {count} completed work shifts",
      "dedication": "> ⭐ **Dedication:** {level}",
      "socialHeader": "💍 **SOCIAL BOND**",
      "marriedTo": "> 💍 **Married to:** {spouse}",
      "single": "> 🕊️ *Single • Free Heart*",
      "btnTitles": "Titles",
      "btnThemes": "Visual Themes",
      "btnEditBio": "Edit Bio",
      "dedicationMaster": "Master",
      "dedicationVeteran": "Veteran",
      "dedicationPractitioner": "Practitioner",
      "dedicationNovice": "Novice"
    },
    "ranking": {
      "mainTitle": "🏆  ✦  Official Realm Leaderboard",
      "coinsTitle": "🪙  ✦  Magic Coins Leaderboard",
      "beansTitle": "🌱  ✦  Magic Beans Leaderboard",
      "coinsDesc": "The most prosperous adventurers in the realm:",
      "beansDesc": "The greatest master cultivators of Magic Beans:",
      "emptyCoins": "*No coin records yet.*",
      "emptyBeans": "*No magic beans cultivated yet.*",
      "footer": "Updated in real-time • Use buttons to switch",
      "btnCoins": "🪙 Coins",
      "btnBeans": "🌱 Beans",
      "viewerPlacement": "👤 Your Current Placement",
      "viewerLine": "> 🏅 **Rank #{position}** with **{amount}**"
    },
    "marriage": {
      "proposeTitle": "💍  ✦  Marriage Proposal",
      "proposeDesc": "💍 {target}, you received an official marriage proposal!\n\n**{requester}** wishes to tie the knot with you in this server.\n\n💎 **MARRIAGE FEE**\n> 🪙 **Investment:** **{cost}**\n\n💌 *Click one of the buttons below to answer the proposal:*",
      "btnAccept": "Accept the romance",
      "btnReject": "Break my heart",
      "acceptReply": "💖 Congratulations! **{requester}** and **{target}** are now officially married!",
      "rejectReply": "💔 The marriage proposal was rejected... love can be harsh.",
      "selfMarriage": "❌ You cannot propose to yourself.",
      "botMarriage": "❌ Bots cannot participate in marriages.",
      "alreadyMarried": "❌ You or this user already has a spouse.",
      "pendingProposal": "❌ There is already a pending marriage proposal involving one of you.",
      "insufficientCoins": "❌ You need **{cost}** to make a marriage proposal.",
      "noTarget": "❌ Choose a user to propose to.",
      "expired": "❌ This marriage proposal is no longer available."
    },
    "divorce": {
      "title": "💔  ✦  Divorce",
      "success": "💔 Divorce completed. **{cost}** was charged.",
      "notMarried": "❌ You are not married.",
      "insufficientCoins": "❌ Divorce costs **{cost}**. Your balance is **{balance}**."
    },
    "profession": {
      "sameProfession": "❌ You are already a **{profession}**. Choose a different career.",
      "switchCost": "❌ Changing profession costs **{cost}**. Your balance is **{balance}**.",
      "freeSuccess": "✅ Your profession is now **{profession}**. This first choice was free!",
      "paidSuccess": "✅ Your profession is now **{profession}**. **{cost}** was charged.",
      "invalid": "❌ Choose a valid profession: {list}.",
      "labels": {
        "programador": "Programmer",
        "cozinheiro": "Chef",
        "artista": "Artist",
        "minerador": "Miner",
        "alquimista": "Alchemist",
        "pescador": "Fisher",
        "detetive": "Detective",
        "fazendeiro": "Farmer",
        "agricultor": "Farmer",
        "professor": "Teacher",
        "medico": "Doctor",
        "musico": "Musician",
        "fotografo": "Photographer",
        "mecanico": "Mechanic",
        "vendedor": "Salesperson"
      }
    },
    "shop": {
      "title": "{emoji}  ✦  Shop — {label}",
      "catalogHeader": "🛒 **ITEM CATALOG**",
      "empty": "> *No items available in this category at the moment.*",
      "tip": "💡 *Choose a category or buy directly using the menus below:*",
      "selectCatPlaceholder": "📂 Choose a shop category...",
      "buySelectPlaceholder": "🛒 Buy item with 1-click...",
      "btnBackpack": "Open Backpack",
      "buySuccess": "🎉 **Purchase Successful!** You bought 1x {emoji} **{name}** for **{cost}**! (Remaining balance: **{balance}**)",
      "insufficientCoins": "❌ You need **{needed}**, but only have **{current}**!",
      "categories": {
        "bau": {
          "label": "Mystery Chests",
          "desc": "Chests containing coins and rare precious gems"
        },
        "joia": {
          "label": "Precious Gems & Jewels",
          "desc": "Rare gems for trade, collection, and prestige"
        }
      }
    },
    "inventory": {
      "backpackTitle": "🎒  ✦  {user}’s Backpack",
      "tabBosque": "🌲 Grove & Relics",
      "tabSocial": "📦 Social & Chests",
      "tabTodos": "🎒 All",
      "emptyBackpack": "> *Your backpack is empty! Visit `/shop` to acquire chests and magical items.*",
      "emptyRelics": "> *You do not possess any Grove relics yet. Explore the realm with `/py-explore` and forage to find them!*",
      "itemsCount": "🎒 **Stored Items:** {count}",
      "phantomCoinsLabel": "👻 **Phantom Coins:** **{coins}**",
      "storedItemsHeader": "📦 **ITEMS STORED IN BACKPACK**",
      "relicsHeader": "🏺 **GROVE RELICS (TIERS 1 TO 5)**",
      "tipSelect": "💡 *Select an item in the dropdown below to use or sell it:*",
      "effect": "Effect",
      "category": "Category",
      "sellPrice": "Sell",
      "btnShop": "Go to Shop",
      "btnVisitShop": "Visit Shop",
      "selectPlaceholder": "📦 Select an item from your backpack...",
      "openChest": "Open {name}",
      "sellOne": "Sell 1x ({coins})",
      "hintSelect": "Select an item above",
      "otherUserBackpack": "❌ This backpack belongs to another adventurer. Use `/inventario` to open yours!",
      "chestOpened": "🔓 **Chest Opened!** You found **+{coins}**{items}!",
      "soldSuccess": "🪙 You sold 1x **{item}** for **+{coins}**!",
      "selectRelicPlaceholder": "🏺 Select a relic to inspect or sell...",
      "sellRelic": "🪙 Sell ({coins} 👻)",
      "relicSoldSuccess": "✨ You sold 1x **{relic}** and received **+{coins} Phantom Coins 👻**!"
    },
    "buy": {
      "insufficientFunds": "❌ You need **{cost}**, but your current balance is only **{balance}**.",
      "invalidItem": "❌ Invalid item or not available for purchase in shop.",
      "success": "✅ Purchase successful! You acquired **{amount}x {emoji} {name}** for **{cost}**.\nRemaining balance: **{balance}**.",
      "needIdPrefix": "❌ Please provide the item ID to buy. Use `py!shop` (or `py!loja`) to see available items."
    },
    "sell": {
      "insufficientItems": "❌ You do not have enough items in your backpack (You have: **{count}x**).",
      "untradable": "❌ This item cannot be sold.",
      "invalidItem": "❌ Invalid item or not found.",
      "success": "💰 You sold **{amount}x {emoji} {name}** and received **+{earnings}**!\nNew balance: **{balance}**.",
      "needIdPrefix": "❌ Please specify the item to sell. Use `py!inventory` (or `py!inventario`) to see what you have."
    },
    "trade": {
      "expired": "⏳ This trade proposal expired or was already closed.",
      "notParticipant": "❌ You are not part of this trade.",
      "cancelled": "❌ The trade proposal was cancelled by <@{user}>.",
      "completedTitle": "🤝  ✦  Trade Successfully Completed!",
      "completedDesc": "🎉 The transfer was successfully completed between <@{sender}> and <@{receiver}>!\n\n⏳ *Both users entered a 30-minute cooldown for new trades.*",
      "inProgressTitle": "🤝  ✦  Trade Proposal in Progress",
      "inProgressDesc": "Waiting for both parties to confirm the atomic trade.\n\n> 🔵 <@{sender}>: {sStatus}\n> 🔴 <@{receiver}>: {rStatus}\n\n⏳ *Time remaining to expire: under 2 minutes.*",
      "btnConfirm": "Confirm Trade",
      "btnCancel": "Cancel Trade",
      "confirmed": "✅ **CONFIRMED**",
      "waiting": "⏳ Waiting...",
      "proposalTitle": "🤝  ✦  Trade Proposal",
      "proposalDesc": "<@{sender}> sent an official trade proposal to <@{receiver}>!\n\n📦 **OFFERED ITEM/COINS:**\n> {offer}\n\n💌 *<@{receiver}>, click Confirm below to accept or Cancel to reject.*",
      "itemOffer": "📦 **{amount}x {emoji} {name}**",
      "coinOffer": "🪙 **{amount} Coins**"
    },
    "ship": {
      "countError": "❌ Choose exactly two people or leave empty to pick a random pair.",
      "botError": "❌ Bots cannot participate in love matchmaking.",
      "sameUserError": "❌ The same person twice does not make a couple.",
      "notMemberError": "❌ You can only match people who are in this server.",
      "genericError": "❌ Could not calculate compatibility right now. Try again.",
      "twoMembersNeeded": "❌ At least 2 server members are needed to draw a couple.",
      "fetchError": "❌ Could not fetch server members at the moment.",
      "coupleName": "💑 **COUPLE NAME**",
      "specialCoupleName": "💍 **COUPLE NAME**",
      "compatibility": "📊 **COMPATIBILITY: {percent}% AFFINITY**",
      "specialCompatibility": "✨ **COMPATIBILITY: 100% ABSOLUTE LOVE**",
      "eternalTitle": "💖  ✦  Eternal Ship — {guild}  ✦  💖",
      "normalTitle": "{emoji}  ✦  Ship — {guild}"
    },
    "tarot": {
      "bribeBtn": "Try New Reading (350 🪙)",
      "cardLabel": "CARD",
      "orientationReversed": "REVERSED",
      "orientationUpright": "UPRIGHT",
      "keywords": "KEYWORDS",
      "destinyMessage": "MESSAGE OF DESTINY",
      "alreadyDrawnTitle": "🔮 **You already drew your card today!**",
      "nextFree": "NEXT FREE DRAW",
      "nextFreeDesc": "Available in **{time}** (at 00:00 BRT).",
      "bribeSection": "BRIBE DESTINY",
      "bribeSectionDesc": "Don’t want to wait or want to test your luck again? You can force a new draw below for **350 Coins**.",
      "insufficientBribe": "❌ Insufficient funds. You need **{cost}** to draw again, but you have **{balance}**.",
      "bribeUnavailable": "❌ Could not perform a new reading right now. Please try again later.",
      "title": "Tarot",
      "publicTitle": "🔮  ✦  New Tarot Draw{guild}",
      "publicDesc": "{humor}Member <@{user}> drew the card **{card}** (**{orientation} POSITION**)!",
      "publicHumor": "🔮 *Additional draw requested by member!*\n\n"
    },
    "admin": {
      "noPermission": "❌ Only administrators can configure this feature.",
      "welcomeSuccess": "✅ Welcome channel successfully set to {channel}.",
      "welcomeNeedChannel": "❌ You must specify a valid text channel.",
      "economyConfigSuccess": "✅ Daily configured: between **{min}** and **{max}** {coins}.",
      "economyConfigInvalid": "❌ Minimum value must be less than or equal to maximum.",
      "setEconomySuccess": "✅ Economy of **{user}** set to **{coins}**.",
      "resetEconomySuccess": "✅ Economy of **{user}** reset. Balance: **{coins}**.",
      "emojisExportTitle": "🎀  ✦  Emoji List — {server}",
      "emojisExportDesc": "Complete catalog of custom emojis from **{server}**:\n\n📊 **EMOJI STATS**\n> 🎀 **Total Emojis:** **{count}**\n> ✨ **Animated Emojis:** **{animated}**\n> 📄 **Attached File:** `emojis-do-servidor.json`\n\n📥 *The JSON file with the complete list is attached to this message.*",
      "agendaTitle": "📅  ✦  Automation Schedule{server}",
      "agendaDesc": "Upcoming automated tasks and scheduled checks:",
      "onlyServer": "❌ This command must be used within a server.",
      "onlyOwner": "❌ **Restricted Access:** Only Pyxie's owner ({owner}) can execute this command.",
      "title": "🛡️  ✦  Owner Administration Panel",
      "desc": "Hello creator! Your secure panel access link has been generated.\n\n> 🔐 **Authentication:** Encrypted via HMAC-SHA256\n> ⏳ **Validity:** 15 minutes (single-use)\n> 🌐 **Network:** Restricted to your authorized IPs\n\n*Click the button below to open your administrative console:*",
      "btnOpen": "⚡ Access Owner Dashboard",
      "footer": "Pyxie Confidential Panel • Protected by Snowflake & IP"
    },
    "workMinigame": {
      "noProfession": "❌ You do not have a registered profession yet! Use `/profissao` to choose a career before working.",
      "cooldown": "⏳ You worked recently! Please wait **{time}** before starting another work shift.",
      "wrongTitle": "❌  ✦  {profession} Shift Failed",
      "wrongMistake": "You made a mistake in your professional decision!",
      "correctAnswerLabel": "💡 **CORRECT TECHNICAL DECISION**",
      "nextShiftLabel": "⏳ **NEXT WORK SHIFT**",
      "noSalaryText": "> You did not receive a salary this time. Rest up and try again in **3 hours**!",
      "successTitle": "✅  ✦  {profession} Shift Completed!",
      "successDedication": "You solved the challenge with technical mastery and dedication!",
      "salaryHeader": "💰 **SHIFT COMPENSATION**",
      "salaryLine": "> 🪙 **Salary Received:** **+{amount}**",
      "balanceLine": "> 💳 **New Balance:** **{balance}**",
      "careerHeader": "📈 **CAREER**",
      "workCountLine": "> 🔨 **Total Completed:** **{count}** work shifts",
      "epicBeanBonus": "✨ **EPIC PERFORMANCE BONUS (2% Chance)!**",
      "epicBeanDesc": "> 🌱 You received **+1 Magic Bean** for stellar work! (Balance: **{beans} 🌱**)",
      "minigameTitle": "💼  ✦  {profession} Shift — Minigame",
      "timeLimit": "⏱️ **TIME LIMIT: 45 SECONDS**\nChoose the best answer using the buttons below:",
      "otherUserSession": "❌ This shift belongs to another worker. Use `/trabalho` to start your own!",
      "expiredSession": "⌛ This shift has expired or was already completed. Use `/trabalho` again when available!"
    },
    "gloom": {
      "footer": "Pyxie's Grove • Pyxie",
      "explore": {
        "title": "{emoji}  ✦  {name} — {tide}",
        "tideLabel": "🌊 **Gloom Tide:** `{tide}`",
        "stamina": "🔋 **Energy:** `{current}/{max}` (Recovers 1 every 6 min)",
        "phantomCoins": "👻 **Phantom Coins:** `{coins}`",
        "tracesHeader": "📜 **Recent Purple Chalk Traces:**",
        "noTraces": "> *No traces have been carved here recently.*",
        "traceItem": "> ✍️ **{author}:** *\"{message}\"* {offering}",
        "offeringText": "(🎁 Left {coins} 👻!)",
        "btnForage": "🔍 Scavenge (1⚡)",
        "btnGrimoire": "📖 Grimoire ({count})",
        "btnTrace": "✍️ Leave Trace (15👻)",
        "btnBoss": "💀 Gloom Behemoth",
        "btnMove": "Go to {destination}",
        "directMoveNotFound": "❌ Could not find a path to **{destination}**. Check available neighboring locations!",
        "forageSuccessCoins": "✨ You searched the shadows and found **+{coins} Phantom Coins 👻**!",
        "forageSuccessItem": "📦 You discovered **1x {item}** hidden beneath the stones!",
        "forageNoEnergy": "⏳ You are exhausted by the shadows! Energy recovers in **{time}s** (max 10/hour).",
        "roomBanned": "🚫 The spirits expelled you from this room! Return in {time} min after regaining your composure.",
        "portalOpened": "🌀 **MYSTIC PORTAL REVEALED!** A dimensional rift opened the path to the **Glass Rose Garden**!",
        "encounterAlert": "👻 **AN APPARITION EMERGED FROM THE SHADOWS!**",
        "traceSuccess": "✅ Your purple chalk trace was permanently etched into the stone!",
        "travelSuccess": "🚶 You journeyed to: **{destination}**!",
        "travelLocked": "🔒 This path is sealed! {reason}",
        "insufficientCoins": "❌ Insufficient balance! Requires **{cost} Phantom Coins 👻**.",
        "reasons": {
          "locked_tide": "Passage sealed. Requires the Purple Blood Moon tide or an Emo Tear.",
          "requires_key": "Door locked. Requires a Spectral Key to unlock.",
          "insufficient_exploration": "Dangerous path. Explore at least 3 common areas before daring to cross the void.",
          "requires_fairy": "Protected sanctuary. Requires an equipped Fairy familiar or an active mystic portal.",
          "requires_boss": "Access denied. Requires participation in the Community Boss pacification this cycle.",
          "requires_boss_defeated": "Access denied. The Haven only unseals when the Community Boss is defeated this cycle with your active battle participation.",
          "requires_grimoire_spirits": "The obsidian throne rejects your soul. Requires at least 3 recruited spirits in your Grimoire.",
          "requires_t4_relic": "Sanctuary sealed. Requires carrying at least one Tier 4 or 5 Relic (gloom nobility) in your inventory.",
          "banned": "You are barred from this room for insulting local entities. Remaining time: {time} min."
        },
        "dangerLevel": "⚡ **Danger:** Tier {tier} • Critical Failure Penalty: {banMinutes}m Room Ban"
      },
      "negotiate": {
        "title": "💬  ✦  Negotiation with {name}",
        "footer": "Spectral Pact • Pyxie",
        "fled": "🏃 You slipped back into the shadows without making a sound.",
        "demandCoins": "💰 Pay Tribute ({cost} 👻)",
        "demandEnergy": "⚡ Donate Stamina ({amount}⚡)",
        "demandRelic": "🏺 Hand over {relic}",
        "btnBribe": "💰 Bribe ({cost} 👻)",
        "btnBailout": "💸 Extortive Bailout ({cost} 👻)",
        "btnFlee": "🏃 Flee",
        "successWit": "🎉 **Pact Formed!** You impressed **{spirit}** with your wit and earned **+{coins} Phantom Coins 👻**!",
        "successBribe": "🤝 **Tribute Accepted!** You paid **{cost} Phantom Coins 👻** and **{spirit}** now obeys your call!",
        "bailoutSuccess": "🤝 **Bailout Accepted!** Seeing you were almost worthy, you paid the extortion of **{cost} Phantom Coins 👻** and **{spirit}** accepted the pact!",
        "bailoutOffer": "> 🎭 *« You almost convinced me, mortal... But if you want me to forget your final stumble, you must pay triple for my silence! »*\n\n🪙 **Bailout Cost:** **{cost} Phantom Coins 👻**",
        "sycophancyPenalty": "💢 **Contempt Fee for Sycophancy!** The spirit loathed your subservience and snatched **-{stolen} Phantom Coins 👻** from your pouch before casting you out!",
        "hesitationPenalty": "⏳ **Hesitation Penalty!** You hesitated too much in a hostile realm. The creature lost all patience!",
        "ejectionFine": "💸 **Ejection Fine:** You lost **-{fine} Phantom Coins 👻** (10% of your balance) during the hasty retreat!",
        "failed": "💨 **The Apparition Vanished!** {spirit} mocked your reply and dissolved into purple mist!",
        "criticalFailure": "💀 **CRITICAL FAILURE!** The shadows were insulted by your pathetic response! You were cast out and barred from {location} for {time} minutes!",
        "alreadyOwned": "ℹ️ You already have this spirit bound in your Grimoire!"
      },
      "merchant": {
        "title": "🛒  ✦  The Relic Merchant",
        "footer": "Relic Merchant • Pyxie",
        "desc": "A hooded smuggler emerges from the shadows offering rare relics for Phantom Coins 👻.",
        "phantomCoins": "👻 **Your Balance:** `{coins} Phantom Coins`",
        "stockHeader": "🏺 **AVAILABLE RELICS:**",
        "buySuccess": "✨ You purchased **{item}** for **{cost} Phantom Coins 👻**!",
        "insufficientCoins": "❌ You need **{cost} Phantom Coins 👻** to buy this relic.",
        "btnBuy": "Buy {item} ({cost}👻)",
        "btnBack": "⬅️ Back to Exploration"
      },
      "engineer": {
        "title": "🛠️  ✦  The Relic Engineer",
        "footer": "Relic Engineer • Pyxie",
        "desc": "An eccentric craftsman with runes and violet solder offers relic fusion for Phantom Coins 👻.",
        "phantomCoins": "👻 **Your Balance:** `{coins} Phantom Coins`",
        "myRelics": "📦 **Your Relics by Tier:** T1: `{t1}` | T2: `{t2}` | T3: `{t3}` | T4: `{t4}` | T5: `{t5}`",
        "recipesHeader": "⚗️ **RUNIC FUSION WORKBENCH:**",
        "recipeLine": "> 🔹 **Tier {tier} ➔ Tier {nextTier}:** 2x Relics T{tier} + {cost}👻 (Success: {rate}%)",
        "success": "🔮 **Flawless Upgrade!** The relics successfully fused into **{item}** (Tier {tier})!",
        "failure": "💥 **FORGE DISASTER!** {quote}\nThe 2 sacrificed relics were permanently destroyed!",
        "insufficientMaterials": "❌ You need at least 2x Tier {tier} relics to upgrade.",
        "insufficientCoins": "❌ The engineer's service costs **{cost} Phantom Coins 👻**.",
        "btnUpgrade": "Fuse 2x T{tier} ({cost}👻)",
        "btnBack": "⬅️ Back to Exploration"
      },
      "grimoire": {
        "title": "📖  ✦  Gloom Grimoire — {user}",
        "desc": "Shadow spirits and familiars bound to your soul.",
        "phantomCoins": "👻 **Balance:** `{coins} Phantom Coins`",
        "equippedHeader": "⚔️ **Active Familiars ({count}/{max}):**",
        "noEquipped": "> *No familiars equipped. Use the buttons below to activate passive auras!*",
        "collectedHeader": "📜 **Collected Spirits ({count}):**",
        "noSpirits": "> *Your grimoire is empty. Explore the realm to negotiate with apparitions!*",
        "tagActive": " `[ACTIVE]`",
        "btnFuse": "⚗️ Fusion Cauldron (30👻)",
        "btnBack": "⬅️ Back to Exploration",
        "btnBind": "Bind {spirit}",
        "btnUnbind": "Unbind {spirit}",
        "equipSuccess": "✨ You bound **{spirit}**! Active aura: **{aura}** ({desc})",
        "unequipSuccess": "💤 You unbound **{spirit}** from your active bond."
      },
      "fusion": {
        "title": "⚗️  ✦  Soul Fusion Cauldron",
        "footer": "Arcane Soul Fusion • Pyxie",
        "desc": "Select two spirits from your grimoire to fuse them into an ascended superior entity!",
        "selectPlaceholder": "Choose a spirit to fuse...",
        "ritualCost": "🪙 **Ritual Cost:** `{cost} Phantom Coins`",
        "success": "🔮 **FUSION COMPLETE!** The souls coalesced within the cauldron giving rise to **{spirit}** (Tier {tier})!",
        "insufficientCoins": "❌ You need **{cost} Phantom Coins 👻** to perform this soul fusion ritual!",
        "cannotFuse": "❌ Could not fuse these spirits."
      },
      "boss": {
        "title": "💀  ✦  Community Boss — {name}",
        "footer": "Community World Boss • Pyxie",
        "yourDamage": "🛡️ **Your Damage Dealt:** `{damage}`",
        "desc": "A shadowy behemoth threatening the balance of the Gloom Realm. All adventurers share this challenge!",
        "hpBar": "🩸 **Behemoth Willpower:** `{currentHp}/{maxHp}` ({percent}%)",
        "btnAttack": "⚔️ Boss Strike (1x Free)",
        "btnAttackExtra": "⚔️ Extra Strike Ready!",
        "btnWebBonus": "📺 Watch 10s Bonus (Extra Strike)",
        "btnRefresh": "🔄 I've watched / Refresh",
        "attackSuccess": "💥 You launched a shadow strike dealing **{damage} damage** and earned **+{coins} Phantom Coins 👻**!",
        "cooldown": "⏳ You already struck during this 6-hour cycle!\n\n✨ **Wish to strike the Behemoth again right now?**\nWatch the sponsored 10-second web bonus portal to unlock **+1 Extra Strike** and **50 Phantom Coins 👻**!",
        "defeated": "🏆 **THE BEHEMOTH HAS BEEN PACIFIED!** The Ancient Shadow was conquered and the realm celebrates your triumph!",
        "alreadyDefeated": "🏆 The Ancient Behemoth has already been pacified in this 6-hour cycle! Pyxie's Haven remains unsealed for valiant warriors."
      }
    },
    "wiki": {
      "title": "📖  ✦  Official Pyxie & Gloom Realm Wiki",
      "desc": "Explore the official encyclopedia of mechanics, navigation rules, spectral resonance matrix, relics, and Pyxie systems.",
      "footer": "Official Wiki • Pyxie",
      "btnOpenWeb": "🌐 Open Full Web Wiki",
      "categoryPlaceholder": "Select an encyclopedia topic...",
      "optBosque": "🌲 Gloom Realm & Maps",
      "optBosqueDesc": "Guide to the 10 locations, danger tiers, travel rules, and tides.",
      "optSmt": "🧠 Spectral Resonance & Temperaments",
      "optSmtDesc": "7-tone response matrix, extortion, and affinity rules.",
      "optRelics": "🏺 Relics & Soul Fusion",
      "optRelicsDesc": "Relic tiers T1 to T5, Engineer, and Fusion Cauldron.",
      "optBestiary": "📜 Gloom Bestiary",
      "optBestiaryDesc": "Catalog of the 14 shadow spirits, passive auras, and temperaments.",
      "optEco": "🪙 Economy & Phantom Coins",
      "optEcoDesc": "Phantom coins, stamina, community boss, and shop.",
      "topicBosqueTitle": "🌲 Gloom Realm — Locations and Tiers",
      "topicBosqueDesc": "The Realm consists of 10 interconnected locations in a directed graph ranging from Tier 1 to Tier 5. Critical failures expel explorers back to the Gloom Gate and apply room bans (from 30m at T1 up to 240m at T5). Some rooms require specific tides (e.g., Purple Moon Tide) or special requirements (Spectral Key, Fairy familiar).",
      "topicSmtTitle": "🧠 Spectral Resonance — Psychological Matrix",
      "topicSmtDesc": "Spirits possess distinct temperaments (Chaotic, Sadistic, Proud, Melancholic, Intellectual, Naive, Cynical). Flattery or submissive replies against proud entities trigger a Contempt Fee (-2 and theft of 100-300 Phantom Coins). In Tier 3+, two neutral answers trigger Hesitation Decay (instant -2). Obvious sycophancy fails: adapting tone to temperament is mandatory.",
      "topicRelicsTitle": "🏺 Relics & Fusion Cauldron",
      "topicRelicsDesc": "Relics are obtained by foraging or buying from the Wandering Merchant (Tiers 1 to 5). At the Relic Engineer, you can fuse 3 materials of equal tier to forge a higher tier (with risk of destruction!). In the Fusion Cauldron, combine two spirits to spawn a new entity with stronger passives and auras.",
      "topicBestiaryTitle": "📜 Gloom Bestiary — 14 Cataloged Spirits",
      "topicBestiaryDesc": "The realm harbors 14 unique entities across Tiers 1 through 5: Low Astral Wraith, Sloth Gargoyle, Disenchanted Pixie, Shoegaze Bat, Nihilist Raven, Dead Phone Banshee, Introvert Werewolf, Retro Punk Skeleton, Lord of Apathy, Midnight Chimera, Violet Mist Knight, Boredom Succubus, Cold Ash Phoenix, and the legendary Ancient Midnight Shadow.",
      "topicEcoTitle": "🪙 Arcane Economy & Community Boss",
      "topicEcoDesc": "Phantom Coins (👻) are ethereal currency used for tributes, extortive bailouts, and relic purchasing. Every 6 hours, the Community Boss stirs in a random location; all explorers receive a free strike to overcome it and share the legendary bounty."
    }
  }
};

/**
 * Traduz uma chave para o idioma do contexto/servidor.
 */
function t(pathKey, source = null, replacements = {}) {
  const lang = getLanguage(source);
  const keys = pathKey.split('.');

  let current = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let resolved = true;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      resolved = false;
      break;
    }
  }

  // Fallback bidirecional inteligente: se faltar no idioma ativo, busca no outro (PT <-> EN)
  if (!resolved || typeof current !== 'string') {
    const fallbackLang = lang === 'pt' ? 'en' : 'pt';
    let fallback = TRANSLATIONS[fallbackLang];
    let fallbackResolved = true;
    for (const fk of keys) {
      if (fallback && typeof fallback === 'object' && fk in fallback) {
        fallback = fallback[fk];
      } else {
        fallbackResolved = false;
        break;
      }
    }

    if (fallbackResolved && typeof fallback === 'string') {
      current = fallback;
    } else {
      return pathKey;
    }
  }

  if (typeof current !== 'string') return pathKey;

  let text = current;
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replaceAll(`{${k}}`, String(v));
  }
  return text;
}

module.exports = {
  CRINGELANDIA_GUILD_ID,
  getLanguage,
  setGuildLanguage,
  t,
  formatCoins,
  formatRemaining,
  getCanvasStrings,
  CANVAS_STRINGS,
  TRANSLATIONS,
  RARITY_NAMES,
};

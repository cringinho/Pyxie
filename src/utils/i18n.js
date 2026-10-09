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
      footer: 'TAROT • ORÁCULO DA PYXIE',
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
    "museum": {
      "title": "🏛️ Museu da Comunidade",
      "desc": "Acervo permanente das criações dos membros da Cringelândia, com navegação retrô.",
      "link_hint": "🏛️ Acesse a nossa Galeria de Artes Virtual: {url}",
      "stats": "🖼️ {count} obras no acervo"
    },
    "partnerships": {
      "title": "🤝 Central de Parcerias • Cringelândia",
      "btn_confirm": "Confirmar",
      "btn_cancel": "Cancelar",
      "role_granted": "✅ Tag Triagem atribuída! Dirija-se ao canal {channel} para preencher o formulário.",
      "footer_hint": "💡 Quer firmar uma parceria conosco? Utilize o comando py!parceria ou /py-partner!",
      "intro_desc": "Quer divulgar seu canal, loja, servidor ou projeto por aqui? Ao confirmar, você recebe a tag **Triagem**, que libera o canal de solicitações onde você preenche o formulário.",
      "cancelled": "Solicitação cancelada.",
      "not_configured": "⚠️ O módulo de parcerias ainda não foi configurado por um administrador.",
      "guild_only": "❌ Este comando só funciona dentro de um servidor.",
      "role_hierarchy_error": "⚠️ Não consegui atribuir a tag Triagem porque o cargo da Pyxie está abaixo dela na hierarquia. Avise a staff!",
      "panel_title": "📋 Central de Solicitações • Parcerias & Divulgações",
      "panel_desc": "Seja bem-vindo(a)! Selecione abaixo a opção que melhor se adequa ao seu projeto para abrir o formulário correspondente:",
      "panel_footer": "Pyxie Core • Triagem Automatizada",
      "panel_placeholder": "Escolha a categoria da sua aplicação...",
      "panel_posted": "✅ Painel de solicitações publicado em {channel}.",
      "panel_no_perm": "❌ Apenas quem tem a permissão Gerenciar Servidor pode publicar o painel.",
      "panel_no_channel": "⚠️ O canal de solicitações não está configurado ou não foi encontrado.",
      "step2_title": "🎨 Etapa 2/2: Arte e Apresentação Pública",
      "step2_desc": "Dados da proposta registrados com sucesso!\n\nAgora, configure a imagem e a mensagem que serão exibidas publicamente no mural do servidor e do site.\n\nClique no botão abaixo para concluir:",
      "btn_step2": "Inserir Mídia & Descrição",
      "modal2_title": "Etapa 2/2: Card de Divulgação",
      "modal2_image_label": "Link da Imagem ou GIF (16:9):",
      "modal2_image_ph": "https://... link público direto da imagem",
      "modal2_desc_label": "Descrição Pública para o Mural:",
      "modal2_desc_ph": "Apresente os diferenciais para atrair interessados...",
      "session_expired": "⌛ Sessão expirada. Inicie o processo novamente.",
      "invalid_url": "❌ Link inválido. Use um endereço público que comece com http:// ou https://.",
      "terms_title": "📜 Termos Obrigatórios & Acordo de Divulgação",
      "terms_desc": "Para submeter a solicitação para a Staff, declare ciência dos seguintes termos:\n\n1. **Uso de Imagem:** Autoriza o uso do banner fornecido para divulgação mútua.\n2. **Classificação SFW Obrigatória:** O conteúdo deve acolher desde a idade mínima do Discord (13 anos) até a maioridade (com exceção apenas para comissões financeiras de freelancers/artistas).\n3. **Isenção Financeira:** Não há divisão de lucros decorrentes da divulgação mútua.\n4. **Direitos da Pyxie:** Proibido uso comercial da imagem/marca da Pyxie para fins lucrativos diretos.\n\n⚠️ **Cláusulas de Cancelamento Imediato:**\n• Quebra das diretrizes de conteúdo SFW;\n• Inatividade total do projeto por mais de 7 dias consecutivos;\n• Mudanças estruturais drásticas sem comunicação prévia;\n• Atitudes difamatórias, preconceito ou má-fé contra a comunidade.",
      "terms_footer": "Clique em Concordar para despachar à equipe de moderação.",
      "btn_terms_agree": "Concordo com os Termos",
      "btn_terms_cancel": "Recusar",
      "terms_cancelled": "Processo encerrado.",
      "submitted": "💜 **Solicitação enviada com sucesso!** Nossa moderação avaliará os dados e publicará o post oficial assim que aprovado.",
      "staff_title": "{emoji} Solicitação [{label}] • ID: {id}",
      "staff_desc": "**Autor:** {user} (`{tag}`)\n**Projeto:** {project}",
      "staff_public_field": "📢 Descrição Pública Pretendida",
      "staff_footer": "Submetido em {date}",
      "btn_approve": "Aprovar e Publicar",
      "btn_reject": "Recusar",
      "btn_contact": "Conversar",
      "staff_only": "❌ Apenas a moderação pode usar estes botões.",
      "already_processed": "Esta solicitação já foi processada anteriormente.",
      "approved_title": "✅ Parceria APROVADA • {project}",
      "rejected_title": "❌ Parceria RECUSADA • {project}",
      "field_approved_by": "Responsável",
      "field_rejected_by": "Recusado por",
      "public_title": "{emoji} Parceria: {project}",
      "public_link": "🔗 **Acesse aqui:** {url}",
      "public_web_mural": "🌐 **Mural no Site:** {url}",
      "public_bump_streak": "⚡ **Impulsos no Site:** {count}",
      "dm_approved": "🎉 Sua solicitação para **{project}** foi aprovada e já está publicada em nosso canal oficial!",
      "dm_rejected": "Olá. A sua solicitação de parceria para **{project}** não foi aceita no momento pela equipe da Cringelândia.",
      "contact_hint": "Para conversar com o responsável, abra um tópico ou mencione {user}.",
      "radar_msg": "🚀 O projeto **{project}** acabou de ser promovido no mural do site! Acesse: {url}",
      "radar_streak": "⚡ **Total de Impulsos:** {count}",
      "bump_not_found": "Parceria não encontrada.",
      "bump_wait": "Aguarde mais {hours}h para promover este projeto.",
      "bump_ok": "Projeto promovido com sucesso!",
      "rate_limited": "Muitas tentativas. Tente novamente em alguns minutos.",
      "unauthorized": "Acesso não autorizado."
    },
    "common": {
      "footer": "Pyxie",
      "error": "❌ Ocorreu um erro ao processar sua solicitação.",
      "onlyOwner": "❌ Este painel pertence a outro aventureiro.",
      "cooldown": "⏰ Aguarde {time} para usar novamente.",
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
      "desc": "Apoie o crescimento da nossa comunidade votando na Pyxie no **Top.gg** a cada 12 horas!\n\nSeu voto voluntário ajuda o bot a ser descoberto por novos servidores e comunidades.",
      "supportNote": "💜 *Votar no Top.gg não concede moedas ou bônus no jogo, mas é a melhor forma de apoiar o nosso projeto!*",
      "rewardsTitle": "🎁 **APOIO VOLUNTÁRIO:**",
      "rewardCoins": "> 🌟 Ajude a Pyxie a alcançar mais servidores e comunidades!",
      "rewardDailyBonus": "> 💜 Divulgação comunitária para o crescimento do bot.",
      "weekendActive": "🌟 *Obrigado pelo seu voto e apoio contínuo!*",
      "weekendTip": "🌟 *Obrigado pelo seu voto e apoio contínuo!*",
      "cta": "👉 *Clique no botão abaixo para abrir a página oficial de votação:*",
      "btnLabel": "Votar no Top.gg",
      "footerText": "Obrigado por apoiar a Pyxie e a Cringelândia!",
      "rewardBean": "> 🌱 Apoio voluntário à comunidade."
    },
    "daily": {
      "titleClaimed": "<:gift62:1548443978414817331>  ✦  Recompensa Diária Coletada!",
      "descClaimed": "Sua recompensa diária foi entregue com sucesso no seu cofre!",
      "summaryTitle": "🎁 **RESUMO DA RECOMPENSA**",
      "streakLine": "> 🔥 **Sequência Diária:** **x{streak}** {compliment}",
      "streakCooldown": "> 🔥 **Sequência Atual:** **x{streak}** dias consecutivos",
      "complimentTier1": "*(Começo promissor! Continue firme!)*",
      "complimentTier2": "*(Foco impecável! O fogo está crescendo!)*",
      "complimentTier3": "*(Impressionante! Sua disciplina é admirável!)*",
      "complimentTier4": "*(Mestre da consistência! Quase imparável!)*",
      "complimentTier5": "*(Lendário! Uma verdadeira lenda viva da Pyxie!)*",
      "collected": "> <a:coin:1548443880066777098> **Moedas Coletadas:** **+{amount}**",
      "collectedStreak": "> <a:coin:1548443880066777098> **Moedas Coletadas:** **+{normal}** *(+ {streakBonus} bônus de sequência)*",
      "streakActive": "> 🔥 **Sequência Ativa:** **x{streak}** dias seguidos!",
      "topggVoteBonusActive": "> 🎁 **Bônus Comunitário:** *(obrigado por fazer parte da Pyxie!)*",
      "topggVoteBonusPrompt": "💡 *Dica: Use /py-work para trabalhar na sua carreira e ganhar mais moedas!*",
      "balance": "> 🏦 **Saldo Atual:** **{balance}**",
      "magicBean": "> ✨ **SORTE ÉPICA (1% de Chance):** **+1x Feijão Mágico <:peakmagicbean:1548444140532928642>** (Total: **{total} <:peakmagicbean:1548444140532928642>**)",
      "titleCooldown": "<:gift62:1548443978414817331>  ✦  Recompensa Diária em Cooldown",
      "descCooldown": "⏰ Você já coletou sua recompensa diária hoje. Espere **{time}** para abrir novamente!",
      "voteWeekendBonus": "🌟 *Use seu tempo para explorar minigames e trabalhar com /py-work!*",
      "voteWeekdayBonus": "🌟 *Aproveite os minigames e o Tarot da Pyxie enquanto espera!*",
      "btnLabel": "Apoie a Pyxie",
      "btnLabelCooldown": "Apoie a Pyxie",
      "btnWebBonus": "Bônus Web (+75🪙)",
      "footer": "Recompensa renovada a cada 24 horas",
      "footerCooldown": "Recompensa diária renovada a cada 24 horas"
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
      "btnRecommended": "Adicionar Pyxie (Recomendado)",
      "btnAdmin": "Convite Administrador",
      "btnSupport": "Servidor de Suporte",
      "btnVote": "Votar no Top.gg",
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
      "btnInvite": "Convidar Pyxie",
      "btnWebsite": "Website",
      "btnWiki": "Wiki & Guia",
      "btnSupport": "Suporte",
      "categories": {
        "todos": {
          "label": "Visão Geral / Todos",
          "desc": "Visão geral e índice de todas as categorias"
        },
        "economia": {
          "label": "Economia & Carreiras",
          "desc": "Moedinhas, trabalho, profissões e ranking global"
        },
        "loja": {
          "label": "Loja & Mochila",
          "desc": "Baús misteriosos, itens e inventário"
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
      "title": "<a:coin:1548443880066777098>  ✦  Carteira de {user}",
      "desc": "Patrimônio e recursos acumulados em sua jornada:",
      "balancesHeader": "💎 **SALDOS DISPONÍVEIS**",
      "rankingHeader": "🏆 **POSIÇÃO NO RANKING**",
      "placement": "> 🏅 **Colocação:** {rank}",
      "unranked": "Ainda sem colocação"
    },
    "profile": {
      "title": "<:3861memberpurple:1551355544185344112>  ✦  {title}{user}",
      "bioDefault": "Aventureiro destemido explorando o reino.",
      "treasureHeader": "💎 **TESOURO & ECONOMIA**",
      "coins": "> <a:coin:1548443880066777098> **Moedinhas:** {coins}",
      "magicBeans": "> 🌱 **Feijões Mágicos:** {beans} 🌱",
      "ranking": "> 🏆 **Ranking:** {rank}",
      "careerHeader": "💼 **CARREIRA & VOCAÇÃO**",
      "profession": "> 🔨 **Profissão:** {profession}",
      "noProfession": "Nenhuma (Use `/py-profession`)",
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
      "coinsTitle": "<a:coin:1548443880066777098>  ✦  Ranking de Moedinhas Mágicas",
      "beansTitle": "🌱  ✦  Ranking de Feijões Mágicos",
      "coinsDesc": "Os aventureiros mais prósperos do reino:",
      "beansDesc": "Os maiores mestres cultivadores de Feijões Mágicos:",
      "emptyCoins": "*Nenhum registro de moedas ainda.*",
      "emptyBeans": "*Nenhum feijão cultivado ainda.*",
      "footer": "Atualizado em tempo real • Use os botões para alternar",
      "btnCoins": "Moedas",
      "btnBeans": "Feijões",
      "btnStreaks": "Streaks",
      "streaksTitle": "🔥  ✦  Ranking de Maiores Streaks",
      "streaksDesc": "Os aventureiros com as ofensivas diárias mais longas e lendárias:",
      "emptyStreaks": "*Nenhum aventureiro com streak ativo ainda. Use /py-daily para iniciar!*",
      "streakSingleDay": "dia consecutivo",
      "streakMultiDays": "dias consecutivos",
      "viewerPlacement": "👤 Sua Colocação Atual",
      "viewerLine": "> 🏅 **Posição #{position}** com **{amount}**",
      "btnWebLeaderboard": "Placar & Galeria Web",
      "webLeaderboardLink": "🌐 [Abrir Placar & Galeria de Artes no Site]({url})"
    },
    "marriage": {
      "proposeTitle": "💍  ✦  Pedido de Casamento",
      "proposeDesc": "💍 {target}, você recebeu um pedido oficial de matrimônio!\n\n**{requester}** deseja unir seus laços com você no servidor.\n\n💎 **TAXA DO MATRIMÔNIO**\n> <a:5407rainbowheart:1551355720874725386> **Investimento:** **{cost}**\n\n💌 *Clique em um dos botões abaixo para responder ao pedido:*",
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
        "vendedor": "Vendedor(a)",
        "dublador": "Dublador(a)",
        "desenvolvedor_jogos": "Desenvolvedor(a) de Jogos",
        "psicologo": "Psicólogo(a)",
        "telemarketing": "Operador(a) de Telemarketing",
        "animador_festa": "Animador(a) de Festa",
        "advogada": "Advogada"
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
          "desc": "Baús com moedas e recompensas especiais"
        },
        "joia": {
          "label": "Joias & Gemas Preciosas",
          "desc": "Gemas raras para comércio, coleção e prestígio"
        }
      },
      "renovationTitle": "✨  ✦  Lojinha em Reformas Arcanas!",
      "renovationDesc": "*« A artesã da Cringelândia pendurou uma placa rústica na porta encantada do bazar... »*\n\n🔨 **Estamos remodelando nossas prateleiras mágicas!**\nNo momento, as compras diretas de baús e itens estão pausadas enquanto expandimos o catálogo com novos itens mágicos e colecionáveis.\n\n💡 **Enquanto isso, você pode:**\n• Trabalhar em sua profissão com **/py-work** para acumular moedinhas;\n• Abrir suas cartas diárias de tarot com **/py-tarot**;\n• Explorar sua mochila e itens com **/py-inventory**!"
    },
    "inventory": {
      "backpackTitle": "🎒  ✦  Mochila de {user}",
      "tabSocial": "Social & Baús",
      "tabTodos": "Todos",
      "emptyBackpack": "> *Sua mochila está vazia! Visite a `/py-shop` para adquirir baús e itens mágicos.*",
      "itemsCount": "🎒 **Itens Guardados:** {count}",
      "storedItemsHeader": "📦 **ITENS GUARDADOS NA MOCHILA**",
      "tipSelect": "💡 *Selecione um item no menu suspenso abaixo para usá-lo ou vendê-lo:*",
      "effect": "Efeito",
      "category": "Categoria",
      "sellPrice": "Venda",
      "btnShop": "Ir para a Loja",
      "btnVisitShop": "Visitar Loja",
      "btnOpenChest": "Abrir Baú",
      "btnSellOne": "Vender 1x",
      "selectPlaceholder": "📦 Selecione um item da sua mochila...",
      "selectItemPlaceholder": "📦 Selecione um item da sua mochila...",
      "openChest": "Abrir {name}",
      "sellOne": "Vender 1x ({coins})",
      "hintSelect": "Selecione um item acima",
      "otherUserBackpack": "❌ Esta mochila pertence a outro aventureiro. Use `/py-inventory` para abrir a sua!",
      "chestOpened": "🔓 **Baú Aberto!** Você encontrou **+{coins}**{items}!",
      "soldSuccess": "🪙 Você vendeu 1x **{item}** por **+{coins}**!",
      "itemSoldSuccess": "🪙 Você vendeu 1x **{item}** por **+{coins}**!",
      "bonusItemFound": "Você encontrou {item}!",
      "errorSellItem": "❌ Não foi possível vender este item.",
      "shopHint": "Visite nossa lojinha oficial de itens"
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
      "publicHumor": "🔮 *Tiragem adicional solicitada pelo membro!*\n\n",
      "albumProgress": "✦ Coleção no Álbum: **{discovered}/78** cartas coladas ({percent}%)",
      "newDiscoveryTitle": "🌟 Nova Descoberta Registrada!",
      "newDiscoveryDesc": "<@{user}> conseguiu uma carta inédita para sua coleção! A carta **{card}** foi registrada na posição **#{number}** do **Álbum**!"
    },
    "album": {
      "title": "ÁLBUM DE TAROT DA PYXIE",
      "collector": "Colecionador: <@{user}> • Progresso: **{discovered}/78** descobertas ({percent}%)",
      "position": "Posição",
      "name": "Nome",
      "suit": "Naipe / Categoria",
      "status": "Status",
      "statusDiscovered": "✦ Descoberta em {date}",
      "statusLocked": "🔒 Bloqueada no Álbum",
      "lockedName": "??? [Arcano Desconhecido]",
      "lockedDesc": "*Esta página ainda repousa em branco. Continue realizando tiragens no `/py-tarot` para desbloquear este mistério.*",
      "btnFirst": "1",
      "btnPrev": "Voltar",
      "btnGoto": "Ir para...",
      "btnNext": "Avançar",
      "btnLast": "78",
      "btnAchievements": "🏆 Conquistas do Álbum",
      "btnBackToAlbum": "📖 Folhear Cartas",
      "btnAchievements": "Conquistas do Álbum",
      "btnBackToAlbum": "Folhear Cartas",
      "achievementsTitle": "🏆 Conquistas do Álbum da Pyxie",
      "achievementsSummary": "Conquistas Resgatadas: **{claimed}/7** • Prontas para Resgate: **{ready}**",
      "claimBtn": "Resgatar Recompensa 🎁",
      "claimBtn": "Resgatar Recompensa",
      "claimedBadge": "✅ Resgatada",
      "readyBadge": "🟢 PRONTA PARA RESGATE!",
      "claimSuccess": "🎉 Parabéns! Você concluiu a conquista **{name}** e expandiu seu acervo místico! Recompensa concedida: **+{coins} Moedas** (Saldo: **{balance}**).",
      "claimError": "❌ Não foi possível resgatar esta conquista no momento.",
      "gotoModalTitle": "Ir para Carta do Álbum",
      "gotoModalInputLabel": "Número da Carta (1 a 78)",
      "gotoModalInputPlaceholder": "Ex: 22",
      "gotoModalInvalid": "❌ Número de carta inválido! Informe um número de 1 a 78.",
      "onlyAuthor": "❌ Apenas quem abriu este álbum pode interagir com os botões."
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
      "desc": "Olá criador! Seu link seguro de acesso ao painel foi gerado.\n\n> 🔐 **Autenticação:** Criptografada via HMAC-SHA256\n> ⏰ **Validade:** 15 minutos (uso único)\n> 🌐 **Rede:** Restrito aos seus IPs autorizados\n\n*Clique no botão abaixo para abrir seu console administrativo:*",
      "btnOpen": "Acessar Painel do Dono",
      "footer": "Painel Confidencial da Pyxie • Protegido por Snowflake & IP",
      "emojiSelectLabel": "Selecione um emoji para pré‑visualizar",
      "emojiPreviewFooter": "Use the menu acima para escolher um emoji",
      "paginationPrev": "Anterior",
      "paginationNext": "Próximo",
      "emojiFieldName": "Nome",
      "emojiFieldId": "ID",
      "emojiFieldAnimated": "Animado",
      "emojiFieldURL": "URL",
      "themeUtility": "Utilitários",
      "themeReaction": "Reações",
      "themeOther": "Outros",
      "emojiSearchEmpty": "❌ Nenhum emoji customizado foi encontrado com a busca \"**{query}**\".",
      "btnModules": "Módulos & Plugins",
      "modulesTitle": "🧩  ✦  Gerenciador de Módulos & Plugins",
      "modulesDesc": "Controle modular da Pyxie com garantia de zero resíduos em memória ao desativar:\n\n{list}",
      "moduleActive": "Ativo",
      "moduleInactive": "Inativo",
      "moduleCommands": "Comandos:",
      "moduleToggleSuccess": "✅ Módulo **{name}** agora está **{status}**!",
      "exportMessagesTitle": "📜  ✦  Exportação de Mensagens — {channel}",
      "exportMessagesDesc": "As últimas **{count}** mensagens do canal {channel} foram compiladas em um arquivo de texto para auditoria.",
      "exportMessagesEmpty": "⚠️ Nenhuma mensagem encontrada no canal para exportar.",
      "exportMessagesFooter": "Auditoria Administrativa • Pyxie Core"
    },
    "workMinigame": {
      "noProfession": "❌ Você ainda não possui uma profissão registrada! Use `/py-profession` para escolher sua vocação antes de trabalhar.",
      "cooldown": "⏰ Você já trabalhou recentemente! Aguarde **{time}** para iniciar um novo expediente.",
      "wrongTitle": "❌  ✦  Expediente de {profession} Falhou",
      "wrongMistake": "Você cometeu um equívoco na sua tomada de decisão profissional!",
      "correctAnswerLabel": "💡 **DECISÃO TÉCNICA CORRETA**",
      "nextShiftLabel": "⏰ **PRÓXIMO EXPEDIENTE**",
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
      "timeLimit": "⏱️ **TEMPO DE RESPOSTA: 1 MINUTO E MEIO**\nEscolha a melhor alternativa nos botões abaixo:",
      "otherUserSession": "❌ Este expediente pertence a outro trabalhador. Use `/py-work` para iniciar o seu!",
      "expiredSession": "⏰ Este expediente já foi finalizado ou expirou. Use `/py-work` novamente quando estiver disponível!",
      "roleLabel": "💼 **Cargo Atual:** {role}",
      "promotedTitle": "🎉  ✦  PROMOÇÃO DE CARGO!",
      "promotedDesc": "Parabéns pelo seu empenho e sequência impecável! Você foi promovido(a) para **{role}**!\nSeus salários futuros foram aumentados.",
      "demotedTitle": "⚠️  ✦  REBAIXAMENTO DE CARGO!",
      "demotedDesc": "Atenção: devido aos erros consecutivos no expediente, você foi rebaixado(a) para **{role}**.\nSeus rendimentos foram ajustados ao novo patamar. Pratique e recupere seu cargo!",
      "streakStatus": "> 🔥 **Sequência de Acertos:** {streak} seguidos",
      "mistakeStatus": "> ⚠️ **Erros Consecutivos:** {streak}"
    },
    "quiz": {
      "cooldown": "⏰ Você já disputou o Quiz recentemente! Aguarde **{time}** para tentar um novo desafio.",
      "title": "🧠  ✦  Desafio do Quiz Pyxie",
      "roundHeader": "Pergunta #{round} • Nível: **{difficulty}**",
      "accumulatedLabel": "🪙 Moedas Acumuladas nesta rodada: **{amount}**",
      "cashoutHint": "💡 Responda com calma! Se errar, perderá todo o montante acumulado nesta partida.",
      "timeLimit": "⏱️ **TEMPO DE RESPOSTA: 60 SEGUNDOS**",
      "successTitle": "🎉  ✦  Resposta Correta!",
      "successDesc": "Parabéns! Você acertou a questão e acumulou mais **+{reward} Moedas**!\n\n🪙 **Total Acumulado:** **{total} Moedas**\n📈 **Nível Atual:** **{difficulty}**\n\n*Carregando a próxima pergunta...*",
      "wrongTitle": "💥  ✦  Você Errou o Quiz!",
      "wrongDesc": "Que pena! Você errou a questão e **perdeu as {lost} moedinhas acumuladas** nesta partida!\n\n💡 **Resposta Correta:** **{correct}**\n⏰ Tente novamente em **3 horas**!",
      "cashoutButton": "💰 Parar e Garantir Moedas",
      "nextButton": "➡️ Próxima Pergunta",
      "cashoutTitle": "🏆  ✦  Prêmio Garantido!",
      "cashoutDesc": "Você decidiu parar e garantiu **+{amount} Moedas** com segurança!\n\n💳 **Novo Saldo:** **{balance} Moedas**\n⏰ Próximo Quiz disponível em **3 horas**.",
      "otherUserSession": "❌ Esta partida de Quiz pertence a outro jogador. Use `/py-quiz` para começar a sua!",
      "expiredSession": "⏰ Esta sessão de Quiz expirou ou já foi encerrada. Use `/py-quiz` para iniciar uma nova partida!",
      "diffTier1": "Iniciante",
      "diffTier2": "Intermediário",
      "diffTier3": "Avançado",
      "diffTier4": "Mestre Supremo"
    },
    "wiki": {
      "title": "📖  ✦  Wiki & Enciclopédia Oficial da Pyxie",
      "desc": "Conheça todos os módulos da Pyxie: Economia, Carreiras profissionais com minigames, Tarot de 78 cartas, Sistema Social e Jogos clássicos.",
      "footer": "Wiki Oficial • Pyxie",
      "btnOpenWeb": "Abrir Wiki Completa na Web",
      "categoryPlaceholder": "Selecione um tópico da enciclopédia...",
      "optEco": "🪙 Economia & Moedas",
      "optEcoDesc": "Moedinhas diárias, transações seguras, baús e cofre.",
      "topicEcoTitle": "🪙 Economia, Moedas & Recompensas",
      "topicEcoDesc": "A economia viva da Pyxie é impulsionada por moedinhas e feijões mágicos. Colete recompensas diárias com `/py-daily`, suba de nível com bônus de sequência diária e explore a loja mágica para garantir itens e baús especiais.",
      "optWork": "💼 Carreiras & Minigames",
      "optWorkDesc": "16 profissões com minigames interativos de programação, culinária, advocacia, medicina e mais.",
      "topicWorkTitle": "💼 Carreiras & Minigames de Trabalho",
      "topicWorkDesc": "Escolha entre 16 profissões únicas com `/py-profession` e ganhe moedinhas trabalhando com `/py-work`. Cada carreira possui minigames com desafios práticos em PT-BR e EN que testam suas habilidades para recompensas maiores.",
      "optTarot": "🔮 Tarot dos 78 Arcanos",
      "optTarotDesc": "Tiragens diárias, baralho canônico completo, álbum de colecionador e conquistas.",
      "topicTarotTitle": "🔮 Tarot Místico dos 78 Arcanos",
      "topicTarotDesc": "Consulte o oráculo diário com `/py-tarot`. O baralho conta com 78 arcanos maiores e menores renderizados em artes exclusivas em Canvas. Colecione todas as cartas em seu Álbum de Conquistas com `/py-album`.",
      "optSocial": "💍 Social & Casamentos",
      "optSocialDesc": "Casamentos, divórcios, perfil de aventureiro e cálculo de afinidade.",
      "topicSocialTitle": "💍 Casamentos, Relações & Afinidade",
      "topicSocialDesc": "Case com seu par perfeito usando `/py-marry`, acompanhe o tempo de união e verifique afinidades de amor com `/py-ship`. Personalize seu perfil de aventureiro com títulos, conquistas e badges.",
      "optGames": "🎲 Jogos & Diversão Leve",
      "optGamesDesc": "Biscoito da sorte, cara ou coroa, jokenpô, dados e perguntas descontraídas.",
      "topicGamesTitle": "🎲 Minigames & Diversão Comunitária",
      "topicGamesDesc": "Aproveite momentos leves em comunidade com `/py-cookie`, `/py-coinflip`, `/py-jokenpo`, `/py-dados` e `/py-likely`. Comandos rápidos e integrados para animar qualquer chat de Discord."
    }
  },
  "en": {
    "museum": {
      "title": "🏛️ Community Art Museum",
      "desc": "Permanent archive of our members' creations, with retro browsing.",
      "link_hint": "🏛️ Access our Virtual Community Art Museum: {url}",
      "stats": "🖼️ {count} artworks in the archive"
    },
    "partnerships": {
      "title": "🤝 Partnership Hub • Cringelândia",
      "btn_confirm": "Confirm",
      "btn_cancel": "Cancel",
      "role_granted": "✅ Screening role assigned! Head to {channel} to complete your form.",
      "footer_hint": "💡 Want to partner with us? Use the command py!partner or /py-partner!",
      "intro_desc": "Want to promote your channel, shop, server or project here? Once you confirm, you will receive the **Screening** role, which unlocks the request channel where you fill in the form.",
      "cancelled": "Request cancelled.",
      "not_configured": "⚠️ The partnerships module has not been configured by an administrator yet.",
      "guild_only": "❌ This command only works inside a server.",
      "role_hierarchy_error": "⚠️ I could not assign the Screening role because Pyxie's role sits below it in the hierarchy. Please tell the staff!",
      "panel_title": "📋 Request Center • Partnerships & Promotions",
      "panel_desc": "Welcome! Pick the option below that best fits your project to open the matching form:",
      "panel_footer": "Pyxie Core • Automated Screening",
      "panel_placeholder": "Choose your application category...",
      "panel_posted": "✅ Request panel published in {channel}.",
      "panel_no_perm": "❌ Only members with the Manage Server permission can publish the panel.",
      "panel_no_channel": "⚠️ The request channel is not configured or could not be found.",
      "step2_title": "🎨 Step 2/2: Artwork & Public Presentation",
      "step2_desc": "Your proposal details were saved successfully!\n\nNow set the image and the message that will be displayed publicly on the server board and on the website.\n\nClick the button below to finish:",
      "btn_step2": "Add Media & Description",
      "modal2_title": "Step 2/2: Promotion Card",
      "modal2_image_label": "Image or GIF link (16:9):",
      "modal2_image_ph": "https://... direct public image link",
      "modal2_desc_label": "Public description for the board:",
      "modal2_desc_ph": "Show what makes you special to attract people...",
      "session_expired": "⌛ Session expired. Please start the process again.",
      "invalid_url": "❌ Invalid link. Use a public address starting with http:// or https://.",
      "terms_title": "📜 Mandatory Terms & Promotion Agreement",
      "terms_desc": "To submit your request to the staff, acknowledge the following terms:\n\n1. **Image Use:** You authorize the use of the provided banner for mutual promotion.\n2. **Mandatory SFW Rating:** Content must be suitable from the minimum Discord age (13) up to adulthood (the only exception being paid commissions by freelancers/artists).\n3. **Financial Waiver:** There is no profit sharing from the mutual promotion.\n4. **Pyxie Rights:** Commercial use of the Pyxie image/brand for direct profit is forbidden.\n\n⚠️ **Immediate Cancellation Clauses:**\n• Breaking the SFW content guidelines;\n• Complete project inactivity for more than 7 consecutive days;\n• Drastic structural changes without prior notice;\n• Defamatory behavior, prejudice or bad faith against the community.",
      "terms_footer": "Click Agree to forward your request to the moderation team.",
      "btn_terms_agree": "I Agree to the Terms",
      "btn_terms_cancel": "Decline",
      "terms_cancelled": "Process ended.",
      "submitted": "💜 **Request sent successfully!** Our moderators will review it and publish the official post once approved.",
      "staff_title": "{emoji} Request [{label}] • ID: {id}",
      "staff_desc": "**Author:** {user} (`{tag}`)\n**Project:** {project}",
      "staff_public_field": "📢 Intended Public Description",
      "staff_footer": "Submitted on {date}",
      "btn_approve": "Approve & Publish",
      "btn_reject": "Decline",
      "btn_contact": "Talk",
      "staff_only": "❌ Only the moderation team can use these buttons.",
      "already_processed": "This request has already been processed.",
      "approved_title": "✅ Partnership APPROVED • {project}",
      "rejected_title": "❌ Partnership DECLINED • {project}",
      "field_approved_by": "Approved by",
      "field_rejected_by": "Declined by",
      "public_title": "{emoji} Partnership: {project}",
      "public_link": "🔗 **Visit here:** {url}",
      "public_web_mural": "🌐 **Web Board:** {url}",
      "public_bump_streak": "⚡ **Website Bumps:** {count}",
      "dm_approved": "🎉 Your request for **{project}** was approved and is now live in our official channel!",
      "dm_rejected": "Hello. Your partnership request for **{project}** was not accepted at this time by the Cringelândia team.",
      "contact_hint": "To talk to the applicant, open a thread or mention {user}.",
      "radar_msg": "🚀 The project **{project}** was just promoted on the website board! Check it out: {url}",
      "radar_streak": "⚡ **Total Bumps:** {count}",
      "bump_not_found": "Partnership not found.",
      "bump_wait": "Wait {hours} more hour(s) to promote this project.",
      "bump_ok": "Project promoted successfully!",
      "rate_limited": "Too many attempts. Please try again in a few minutes.",
      "unauthorized": "Unauthorized access."
    },
    "common": {
      "footer": "Pyxie",
      "error": "❌ An error occurred while processing your request.",
      "onlyOwner": "❌ This panel belongs to another adventurer.",
      "cooldown": "⏰ Please wait {time} before using this again.",
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
      "desc": "Support our community by voting for Pyxie on **Top.gg** every 12 hours!\n\nYour voluntary vote helps the bot be discovered by new servers and communities.",
      "supportNote": "💜 *Voting on Top.gg does not grant in-game coins or bonuses, but it is the best way to support our project!*",
      "rewardsTitle": "🎁 **VOLUNTARY SUPPORT:**",
      "rewardCoins": "> 🌟 Help Pyxie reach more servers and communities!",
      "rewardDailyBonus": "> 💜 Community exposure for the bot's growth.",
      "weekendActive": "🌟 *Thank you for your vote and ongoing support!*",
      "weekendTip": "🌟 *Thank you for your vote and ongoing support!*",
      "cta": "👉 *Click the button below to open the official voting page:*",
      "btnLabel": "Vote on Top.gg",
      "footerText": "Thank you for supporting Pyxie and Cringelândia!",
      "rewardBean": "> 🌱 Voluntary community support."
    },
    "daily": {
      "titleClaimed": "<:gift62:1548443978414817331>  ✦  Daily Reward Collected!",
      "descClaimed": "Your daily reward has been safely deposited into your vault!",
      "summaryTitle": "🎁 **REWARD SUMMARY**",
      "streakLine": "> 🔥 **Daily Streak:** **x{streak}** {compliment}",
      "streakCooldown": "> 🔥 **Current Streak:** **x{streak}** consecutive days",
      "complimentTier1": "*(Great start! Keep it up!)*",
      "complimentTier2": "*(Flawless focus! The flame is growing!)*",
      "complimentTier3": "*(Impressive! Your discipline is admirable!)*",
      "complimentTier4": "*(Master of consistency! Almost unstoppable!)*",
      "complimentTier5": "*(Legendary! A true living legend of Pyxie!)*",
      "collected": "> <a:coin:1548443880066777098> **Coins Collected:** **+{amount}**",
      "collectedStreak": "> <a:coin:1548443880066777098> **Coins Collected:** **+{normal}** *(+ {streakBonus} streak bonus)*",
      "streakActive": "> 🔥 **Active Streak:** **x{streak}** days in a row!",
      "topggVoteBonusActive": "> 🎁 **Community Bonus:** *(thank you for being part of Pyxie!)*",
      "topggVoteBonusPrompt": "💡 *Tip: Use /py-work to complete shifts in your career and earn more coins!*",
      "balance": "> 🏦 **Current Balance:** **{balance}**",
      "magicBean": "> ✨ **EPIC LUCK (1% Chance):** **+1x Magic Bean <:peakmagicbean:1548444140532928642>** (Total: **{total} <:peakmagicbean:1548444140532928642>**)",
      "titleCooldown": "<:gift62:1548443978414817331>  ✦  Daily Reward on Cooldown",
      "descCooldown": "⏰ You already claimed your daily reward today. Please wait **{time}** before claiming again!",
      "voteWeekendBonus": "🌟 *Take this time to explore minigames and complete shifts with /py-work!*",
      "voteWeekdayBonus": "🌟 *Enjoy minigames and Pyxie Tarot while you wait!*",
      "btnLabel": "Support Pyxie",
      "btnLabelCooldown": "Support Pyxie",
      "btnWebBonus": "Web Bonus (+75🪙)",
      "footer": "Reward resets every 24 hours",
      "footerCooldown": "Daily reward resets every 24 hours"
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
      "btnRecommended": "Add Pyxie (Recommended)",
      "btnAdmin": "Admin Invite",
      "btnSupport": "Support Server",
      "btnVote": "Vote on Top.gg",
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
      "btnInvite": "Invite Pyxie",
      "btnWebsite": "Website",
      "btnWiki": "Wiki & Guide",
      "btnSupport": "Support",
      "categories": {
        "todos": {
          "label": "Overview / All",
          "desc": "Overview and index of all command categories"
        },
        "economia": {
          "label": "Economy & Careers",
          "desc": "Coins, work shifts, professions, and global leaderboards"
        },
        "loja": {
          "label": "Shop & Backpack",
          "desc": "Mystery chests, items, and inventory"
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
      "title": "<a:coin:1548443880066777098>  ✦  {user}’s Wallet",
      "desc": "Assets and resources accumulated during your journey:",
      "balancesHeader": "💎 **AVAILABLE BALANCES**",
      "rankingHeader": "🏆 **LEADERBOARD POSITION**",
      "placement": "> 🏅 **Rank:** {rank}",
      "unranked": "Not ranked yet"
    },
    "profile": {
      "title": "<:3861memberpurple:1551355544185344112>  ✦  {title}{user}",
      "bioDefault": "Fearless adventurer exploring the realm.",
      "treasureHeader": "💎 **TREASURE & ECONOMY**",
      "coins": "> <a:coin:1548443880066777098> **Coins:** {coins}",
      "magicBeans": "> 🌱 **Magic Beans:** {beans} 🌱",
      "ranking": "> 🏆 **Leaderboard:** {rank}",
      "careerHeader": "💼 **CAREER & VOCATION**",
      "profession": "> 🔨 **Profession:** {profession}",
      "noProfession": "None (Use `/py-profession`)",
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
      "coinsTitle": "<a:coin:1548443880066777098>  ✦  Magic Coins Leaderboard",
      "beansTitle": "🌱  ✦  Magic Beans Leaderboard",
      "coinsDesc": "The most prosperous adventurers in the realm:",
      "beansDesc": "The greatest master cultivators of Magic Beans:",
      "emptyCoins": "*No coin records yet.*",
      "emptyBeans": "*No magic beans cultivated yet.*",
      "footer": "Updated in real-time • Use buttons to switch",
      "btnCoins": "Coins",
      "btnBeans": "Beans",
      "btnStreaks": "Streaks",
      "streaksTitle": "🔥  ✦  Highest Daily Streaks Leaderboard",
      "streaksDesc": "The adventurers with the longest and most legendary daily streaks:",
      "emptyStreaks": "*No adventurers with an active streak yet. Use /py-daily to start!*",
      "streakSingleDay": "consecutive day",
      "streakMultiDays": "consecutive days",
      "viewerPlacement": "👤 Your Current Placement",
      "viewerLine": "> 🏅 **Rank #{position}** with **{amount}**",
      "btnWebLeaderboard": "Live Web Leaderboard",
      "webLeaderboardLink": "🌐 [Open Live Web Leaderboard & Gallery]({url})"
    },
    "marriage": {
      "proposeTitle": "💍  ✦  Marriage Proposal",
      "proposeDesc": "💍 {target}, you received an official marriage proposal!\n\n**{requester}** wishes to tie the knot with you in this server.\n\n💎 **MARRIAGE FEE**\n> <a:5407rainbowheart:1551355720874725386> **Investment:** **{cost}**\n\n💌 *Click one of the buttons below to answer the proposal:*",
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
        "vendedor": "Salesperson",
        "dublador": "Voice Actor",
        "desenvolvedor_jogos": "Game Developer",
        "psicologo": "Psychologist",
        "telemarketing": "Call Center Operator",
        "animador_festa": "Party Entertainer",
        "advogada": "Attorney / Lawyer"
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
          "desc": "Chests containing coins and special rewards"
        },
        "joia": {
          "label": "Precious Gems & Jewels",
          "desc": "Rare gems for trade, collection, and prestige"
        }
      },
      "renovationTitle": "✨  ✦  Arcane Renovations Underway!",
      "renovationDesc": "*« The boutique crafter has hung an ornate rustic sign on the shop's enchanted gate... »*\n\n🔨 **We are remodeling our magical shelves!**\nDirect purchases from the shop are temporarily paused while we prepare fresh items and collectibles.\n\n💡 **In the meantime, you can:**\n• Work at your profession with **/py-work** to accumulate coins;\n• Draw your daily tarot card with **/py-tarot**;\n• Explore your backpack and items with **/py-inventory**!"
    },
    "inventory": {
      "backpackTitle": "🎒  ✦  {user}’s Backpack",
      "tabSocial": "Social & Chests",
      "tabTodos": "All",
      "emptyBackpack": "> *Your backpack is empty! Visit `/py-shop` to acquire chests and magical items.*",
      "itemsCount": "🎒 **Stored Items:** {count}",
      "storedItemsHeader": "📦 **ITEMS STORED IN BACKPACK**",
      "tipSelect": "💡 *Select an item in the dropdown below to use or sell it:*",
      "effect": "Effect",
      "category": "Category",
      "sellPrice": "Sell",
      "btnShop": "Go to Shop",
      "btnVisitShop": "Visit Shop",
      "btnOpenChest": "Open Chest",
      "btnSellOne": "Sell 1x",
      "selectPlaceholder": "📦 Select an item from your backpack...",
      "selectItemPlaceholder": "📦 Select an item from your backpack...",
      "openChest": "Open {name}",
      "sellOne": "Sell 1x ({coins})",
      "hintSelect": "Select an item above",
      "otherUserBackpack": "❌ This backpack belongs to another adventurer. Use `/py-inventory` to open yours!",
      "chestOpened": "🔓 **Chest Opened!** You found **+{coins}**{items}!",
      "soldSuccess": "🪙 You sold 1x **{item}** for **+{coins}**!",
      "itemSoldSuccess": "🪙 You sold 1x **{item}** for **+{coins}**!",
      "bonusItemFound": "You found {item}!",
      "errorSellItem": "❌ Could not sell this item.",
      "shopHint": "Visit our official item shop"
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
      "publicHumor": "🔮 *Additional draw requested by member!*\n\n",
      "albumProgress": "✦ Album Collection: **{discovered}/78** pasted cards ({percent}%)",
      "newDiscoveryTitle": "🌟 New Discovery Registered!",
      "newDiscoveryDesc": "<@{user}> obtained an unprecedented card for their collection! Card **{card}** was registered at position **#{number}** of the **Album**!"
    },
    "album": {
      "title": "PYXIE TAROT ALBUM",
      "collector": "Collector: <@{user}> • Progress: **{discovered}/78** discoveries ({percent}%)",
      "position": "Position",
      "name": "Name",
      "suit": "Suit / Category",
      "status": "Status",
      "statusDiscovered": "✦ Discovered on {date}",
      "statusLocked": "🔒 Locked in Album",
      "lockedName": "??? [Unknown Arcana]",
      "lockedDesc": "*This page still rests in blank. Keep making daily draws in `/py-tarot` to unlock this mystery.*",
      "btnFirst": "1",
      "btnPrev": "Back",
      "btnGoto": "Go to...",
      "btnNext": "Next",
      "btnLast": "78",
      "btnAchievements": "🏆 Album Achievements",
      "btnBackToAlbum": "📖 Browse Cards",
      "btnAchievements": "Album Achievements",
      "btnBackToAlbum": "Browse Cards",
      "achievementsTitle": "🏆 Pyxie Album Achievements",
      "achievementsSummary": "Claimed Achievements: **{claimed}/7** • Ready to Claim: **{ready}**",
      "claimBtn": "Claim Reward 🎁",
      "claimBtn": "Claim Reward",
      "claimedBadge": "✅ Claimed",
      "readyBadge": "🟢 READY TO CLAIM!",
      "claimSuccess": "🎉 Congratulations! You completed achievement **{name}** and expanded your mystic collection! Granted reward: **+{coins} Coins** (Balance: **{balance}**).",
      "claimError": "❌ Could not claim this achievement at the moment.",
      "gotoModalTitle": "Go to Album Card",
      "gotoModalInputLabel": "Card Number (1 to 78)",
      "gotoModalInputPlaceholder": "E.g.: 22",
      "gotoModalInvalid": "❌ Invalid card number! Please enter a number from 1 to 78.",
      "onlyAuthor": "❌ Only the user who opened this album can interact with the buttons."
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
      "desc": "Hello creator! Your secure panel access link has been generated.\n\n> 🔐 **Authentication:** Encrypted via HMAC-SHA256\n> ⏰ **Validity:** 15 minutes (single-use)\n> 🌐 **Network:** Restricted to your authorized IPs\n\n*Click the button below to open your administrative console:*",
      "btnOpen": "Access Owner Dashboard",
      "footer": "Pyxie Confidential Panel • Protected by Snowflake & IP",
      "emojiSelectLabel": "Select an emoji to preview",
      "emojiPreviewFooter": "Use the menu above to choose an emoji",
      "paginationPrev": "Previous",
      "paginationNext": "Next",
      "emojiFieldName": "Name",
      "emojiFieldId": "ID",
      "emojiFieldAnimated": "Animated",
      "emojiFieldURL": "URL",
      "themeUtility": "Utilities",
      "themeReaction": "Reactions",
      "themeOther": "Others",
      "emojiSearchEmpty": "❌ No custom emojis found matching \"**{query}**\".",
      "btnModules": "Modules & Plugins",
      "modulesTitle": "🧩  ✦  Module & Plugin Manager",
      "modulesDesc": "Modular control of Pyxie with zero memory residuals guarantee upon deactivation:\n\n{list}",
      "moduleActive": "Active",
      "moduleInactive": "Inactive",
      "moduleCommands": "Commands:",
      "moduleToggleSuccess": "✅ Module **{name}** is now **{status}**!",
      "exportMessagesTitle": "📜  ✦  Message Export — {channel}",
      "exportMessagesDesc": "The latest **{count}** messages from {channel} have been compiled into a text file for audit.",
      "exportMessagesEmpty": "⚠️ No messages found in the channel to export.",
      "exportMessagesFooter": "Administrative Audit • Pyxie Core"
    },
    "workMinigame": {
      "noProfession": "❌ You do not have a registered profession yet! Use `/py-profession` to choose a career before working.",
      "cooldown": "⏰ You worked recently! Please wait **{time}** before starting another work shift.",
      "wrongTitle": "❌  ✦  {profession} Shift Failed",
      "wrongMistake": "You made a mistake in your professional decision!",
      "correctAnswerLabel": "💡 **CORRECT TECHNICAL DECISION**",
      "nextShiftLabel": "⏰ **NEXT WORK SHIFT**",
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
      "timeLimit": "⏱️ **TIME LIMIT: 1 MINUTE AND 30 SECONDS**\nChoose the best answer using the buttons below:",
      "otherUserSession": "❌ This shift belongs to another worker. Use `/py-work` to start your own!",
      "expiredSession": "⏰ This shift has expired or was already completed. Use `/py-work` again when available!",
      "roleLabel": "💼 **Current Role:** {role}",
      "promotedTitle": "🎉  ✦  CAREER PROMOTION!",
      "promotedDesc": "Congratulations on your outstanding streak! You have been promoted to **{role}**!\nYour future earnings have increased.",
      "demotedTitle": "⚠️  ✦  CAREER DEMOTION!",
      "demotedDesc": "Warning: due to consecutive shift mistakes, you were demoted to **{role}**.\nYour earnings were adjusted. Keep training to reclaim your role!",
      "streakStatus": "> 🔥 **Success Streak:** {streak} in a row",
      "mistakeStatus": "> ⚠️ **Consecutive Mistakes:** {streak}"
    },
    "quiz": {
      "cooldown": "⏰ You already played the Quiz recently! Please wait **{time}** before taking a new challenge.",
      "title": "🧠  ✦  Pyxie Quiz Challenge",
      "roundHeader": "Question #{round} • Tier: **{difficulty}**",
      "accumulatedLabel": "🪙 Coins Accumulated in this round: **{amount}**",
      "cashoutHint": "💡 Think carefully! If you make a mistake, you lose all accumulated coins in this run.",
      "timeLimit": "⏱️ **TIME LIMIT: 60 SECONDS**",
      "successTitle": "🎉  ✦  Correct Answer!",
      "successDesc": "Great job! You answered correctly and accumulated another **+{reward} Coins**!\n\n🪙 **Total Accumulated:** **{total} Coins**\n📈 **Current Tier:** **{difficulty}**\n\n*Loading next question...*",
      "wrongTitle": "💥  ✦  Wrong Answer in the Quiz!",
      "wrongDesc": "Too bad! You got it wrong and **lost all {lost} coins accumulated** in this round!\n\n💡 **Correct Answer:** **{correct}**\n⏰ Try again in **3 hours**!",
      "cashoutButton": "💰 Cash Out & Keep Coins",
      "nextButton": "➡️ Next Question",
      "cashoutTitle": "🏆  ✦  Reward Secured!",
      "cashoutDesc": "You decided to cash out and secured **+{amount} Coins** safely!\n\n💳 **New Balance:** **{balance} Coins**\n⏰ Next Quiz available in **3 hours**.",
      "otherUserSession": "❌ This Quiz session belongs to another player. Use `/py-quiz` to start your own!",
      "expiredSession": "⏰ This Quiz session has expired or ended. Use `/py-quiz` to start a new run!",
      "diffTier1": "Beginner",
      "diffTier2": "Intermediate",
      "diffTier3": "Advanced",
      "diffTier4": "Supreme Master"
    },
    "wiki": {
          "title": "📖  ✦  Official Pyxie Encyclopedia & Wiki",
          "desc": "Discover all Pyxie modules: Economy, Interactive Careers with minigames, 78-Card Tarot, Social Systems, and Classic Games.",
          "footer": "Official Wiki • Pyxie",
          "btnOpenWeb": "Open Full Web Wiki",
          "categoryPlaceholder": "Select an encyclopedia topic...",
          "optEco": "🪙 Economy & Currency",
          "optEcoDesc": "Daily coins, secure transactions, chests, and vault.",
          "topicEcoTitle": "🪙 Economy, Coins & Rewards",
          "topicEcoDesc": "Pyxie's living economy is fueled by shiny coins and magic beans. Collect daily rewards with `/py-daily`, level up with daily streak bonuses, and explore the magic shop for items and special mystery chests.",
          "optWork": "💼 Careers & Minigames",
          "optWorkDesc": "16 distinct careers featuring interactive minigames in coding, cooking, law, medicine, and more.",
          "topicWorkTitle": "💼 Careers & Interactive Work Minigames",
          "topicWorkDesc": "Select from 16 unique professions using `/py-profession` and earn coins by working with `/py-work`. Each career offers interactive challenges in both PT-BR and EN testing your skills for higher payouts.",
          "optTarot": "🔮 Mystic 78-Arcana Tarot",
          "optTarotDesc": "Daily card readings, canonical 78-card deck, collector album, and achievements.",
          "topicTarotTitle": "🔮 Mystic 78-Arcana Tarot",
          "topicTarotDesc": "Consult the daily oracle using `/py-tarot`. The deck features all 78 major and minor arcana rendered with exclusive Canvas artwork. Collect every card in your achievement album via `/py-album`.",
          "optSocial": "💍 Social & Marriages",
          "optSocialDesc": "Marriages, divorces, adventurer profiles, and affinity matchmaking.",
          "topicSocialTitle": "💍 Marriages, Relationships & Affinity",
          "topicSocialDesc": "Marry your special someone with `/py-marry`, track your anniversary, and calculate love affinity using `/py-ship`. Customize your adventurer profile with earned titles, achievements, and badges.",
          "optGames": "🎲 Minigames & Casual Fun",
          "optGamesDesc": "Fortune cookies, coin flips, rock-paper-scissors, dice rolls, and fun party queries.",
          "topicGamesTitle": "🎲 Community Minigames & Casual Fun",
          "topicGamesDesc": "Enjoy lightweight community fun with `/py-cookie`, `/py-coinflip`, `/py-jokenpo`, `/py-dados`, and `/py-likely`. Fast, engaging commands designed to bring energy to every Discord chat."
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

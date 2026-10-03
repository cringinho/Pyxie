require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require('discord.js');
const { loadConfig } = require('../src/modules/seasonal/seasonalManager');

const TARGET_CHANNEL_ID = '1461927268397093032';

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  console.log('🔮 Conectando cliente Discord da Pyxie para envio do briefing...');
  await client.login(process.env.DISCORD_TOKEN);

  try {
    const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Canal ${TARGET_CHANNEL_ID} não encontrado ou inválido.`);
    }

    console.log(`📡 Canal localizado: ${channel.name} (${channel.guild.name})`);
    const config = loadConfig();

    // -------------------------------------------------------------
    // BLOCO 1: O Chamado & Visão Geral da Arquitetura
    // -------------------------------------------------------------
    const embedGeral = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('🎃 CONSELHO DA CRINGELÂNDIA: BRIEFING OFICIAL DO EVENTO SAZONAL')
      .setDescription(
        'Olha só quem resolveu aparecer no chat de planejamentos... Acharam que iam passar o mês de outubro inteirinho em paz sem eu infernizar o servidor? Achou errado, equipe! 💀\n\n' +
        'O novo **Subsistema Sazonal Desacoplado** foi concluído e integrado ao meu núcleo. Antes de virarmos a chave oficial no painel web e abrirmos as portas do hospício, preciso que o conselho administrativo audite as regras, entenda a teoria e dê o veredito final.'
      )
      .addFields(
        {
          name: '🏷️ Tema & Moeda Oficial',
          value: `• **Evento:** \`${config.eventName || 'Halloween da Cringelândia'}\`\n• **Moeda:** <:halloweenabobora:1548443994902757427> **${config.currencyName || 'Abóboras'}** (saldo isolado e atômico)`,
          inline: true,
        },
        {
          name: '⏳ Prazo & Vigência',
          value: `• **Encerramento:** \`02/11/2026 às 23:59 (BRT)\`\n• **Fuso:** \`${config.dates?.timezone || 'America/Sao_Paulo'}\``,
          inline: true,
        },
        {
          name: '🏆 Premiações em Disputa (Top 3)',
          value:
            `🥇 **1º Lugar:** ${config.prizes?.firstPlace || '1 Mês de Discord Nitro + Cargo de Bruxo Supremo'}\n` +
            `🥈 **2º Lugar:** ${config.prizes?.secondPlace || '5.000 Moedinhas + Cargo de Zumbi da Cringelândia'}\n` +
            `🥉 **3º Lugar:** ${config.prizes?.thirdPlace || '2.000 Moedinhas'}`,
          inline: false,
        },
        {
          name: '🛡️ Engenharia & Zero Memory Leak',
          value:
            '• **100% Desacoplado:** Reside estritamente em `src/modules/seasonal/` sem poluir o bot principal.\n' +
            '• **Estado Atual:** ⏸️ **DESLIGADO (`active: false`)**. Nenhum cron job ou listener consome RAM na VM até o play oficial.\n' +
            '• **Painel Web:** Controle em tempo real com preview ao vivo em `/admin/sazonal`.',
          inline: false,
        }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1548444308401684530.gif')
      .setFooter({ text: 'Pyxie Seasonal System • Cringelândia Staff Briefing' })
      .setTimestamp();

    await channel.send({
      content: '@everyone 🦇 **CONVOCAÇÃO DA STAFF: O CIRCO DOS HORRORES VAI COMEÇAR?**',
      embeds: [embedGeral],
    });
    console.log('✅ Bloco 1 enviado.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 2: Mecânica #1 — Baús da Pyxie (Drops Anti-Trapaça)
    // -------------------------------------------------------------
    const embedMecanicaDrops = new EmbedBuilder()
      .setColor('#ff7518')
      .setTitle('📦 MECÂNICA #1: BAÚS DA PYXIE (DROPS ANTI-BOT)')
      .setDescription(
        'Para manter o chat geral fervendo e recompensar reflexos rápidos (e punir quem usa autoclicker sem cérebro), os baús cairão automaticamente nos seguintes horários:'
      )
      .addFields(
        {
          name: '⏰ Cronograma dos Baús',
          value:
            '• **Segunda a Sexta (3x ao dia):** `09:30`, `15:30` e `21:00` (BRT)\n' +
            '• **Sábado e Domingo (6x ao dia):** `10:00`, `13:00`, `16:00`, `18:30`, `21:00` e `23:30` (BRT)',
          inline: false,
        },
        {
          name: '🧩 Sistema de Decoys & Anti-Trapaça',
          value:
            'Quando o baú cai, a Pyxie reage **imediatamente com 6 emojis diferentes** na mensagem, mas o embed indica explicitamente qual é o emoji correto sorteado para a rodada.\n' +
            'Apenas o primeiro membro que reagir no **emoji correto** abre o baú e fatura **+1 a +2 Abóboras**. Quem clicar nos errados só passa vergonha pública.',
          inline: false,
        },
        {
          name: '🏷️ Apelidos Visuais Amigáveis (Configurados no Painel)',
          value:
            '<a:82336witchscauldron:1552115015199227924> `Caldeirão da Bruxa`\n' +
            '<:4124hellokittypumpkin:1551355578066931763> `Hello Kitty Aboborada`\n' +
            '<:ardiscordzombie:1548443801515720719> `Zumbicord`\n' +
            '<:purplecandy:1548444196074033242> `Balinha`\n' +
            '<:31772purpleween:1551356387475595375> `Gatinho Trevinhas`\n' +
            '<a:witchwumpus:1548444308401684530> `Wumpus Bruxinho`',
          inline: false,
        },
        {
          name: '🧹 Auto-Destruição Anti-Spam',
          value: 'O baú é **deletado automaticamente** minutos após ser reivindicado para não deixar mensagens órfãs poluindo o chat.',
          inline: false,
        }
      )
      .setFooter({ text: 'Mecânica auditada e coberta por testes automatizados (100% integridade)' });

    // Exemplo real de drop
    const embedExemploDrop = new EmbedBuilder()
      .setColor('#9333ea')
      .setTitle('🎃 [EXEMPLO REAL DE DROP] Baú Surpresa da Pyxie!')
      .setDescription(
        'Um baú suspeito caiu com tudo no meio da Cringelândia! 💥\n\n' +
        '⚡ **Rápido! Clique na reação <:ardiscordzombie:1548443801515720719> Zumbicord antes dos outros para abrir o baú!**\n\n' +
        '*Apenas o primeiro a acertar leva o saque (+1 ou +2 Abóboras). Reações erradas só dão vergonha alheia.*'
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1548444209328033913.png')
      .setFooter({ text: 'Dica: Use /py-infoevento para entender a pontuação e prazos! • (Exemplo demonstrativo)' });

    const msgDrop = await channel.send({
      embeds: [embedMecanicaDrops, embedExemploDrop],
    });

    // Reage com os 6 decoys no exemplo para a staff ver como fica na prática
    const decoyEmojis = [
      '1552115015199227924',
      '1551355578066931763',
      '1548443801515720719',
      '1548444196074033242',
      '1551356387475595375',
      '1548444308401684530',
    ];
    for (const id of decoyEmojis) {
      await msgDrop.react(id).catch(() => null);
    }
    console.log('✅ Bloco 2 enviado com reações de exemplo.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 3: Mecânica #2 — Arte da Semana & Comandos em Produção
    // -------------------------------------------------------------
    const embedMecanicaArtes = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('🎨 MECÂNICA #2: ARTE DA SEMANA (CONCURSO COMUNITÁRIO)')
      .setDescription(
        'Incentivo orgânico à criatividade dos nossos membros (ou rabiscos cringes que juram que são obras de arte):'
      )
      .addFields(
        {
          name: '📥 Submissão Descomplicada',
          value:
            '• O usuário posta o desenho/arte no canal de artes e marca a **@Pyxie**.\n' +
            '• A Pyxie detecta a imagem e reage automaticamente com a reação oficial de votação: <a:halloween3gif55:1548443988745261086>.\n' +
            '• Os outros membros votam clicando exatamente nessa reação da Pyxie.',
          inline: false,
        },
        {
          name: '🗳️ Apuração Automática (Domingos às 10:00 BRT)',
          value:
            '• O cron faz a contagem dos votos nas artes cadastradas da semana.\n' +
            '• O autor mais votado ganha **+5 <:halloweenabobora:1548443994902757427> Abóboras**.\n' +
            '• A Pyxie publica um Embed comemorativo exibindo a arte vencedora em destaque.',
          inline: false,
        },
        {
          name: '🛡️ Blindagem Contra Fraude & Reciclagem',
          value:
            '• **Histórico Atômico:** Mensagens apuradas são gravadas em `history.lastWinners` e nunca mais podem ser reutilizadas.\n' +
            '• **Descarte de Imagens Antigas:** Postagens com mais de 7 dias são desconsideradas na apuração.',
          inline: false,
        }
      )
      .setFooter({ text: 'Sistema testado contra repetições e retroatividade' });

    const embedComandos = new EmbedBuilder()
      .setColor('#3b82f6')
      .setTitle('💻 COMANDOS SAZONAIS FUNCIONANDO EM PRODUÇÃO')
      .setDescription('Dois comandos novos e dinâmicos já estão compilados e disponíveis no bot:')
      .addFields(
        {
          name: '📖 `/py-infoevento` (ou `py!infoevento`)',
          value:
            'Exibe o guia completo do evento em um embed oficial.\n' +
            '• **100% Editável via Web:** Título, introdução, regras dos drops, regras de artes, imagem de capa e deboches podem ser alterados no painel web com preview em tempo real!',
          inline: false,
        },
        {
          name: '🏅 `/py-rank sazonal:true` (ou `py!rank sazonal`)',
          value:
            'Ranking da temporada em tempo real!\n' +
            '• Exibe o Top 10 membros com mais Abóboras acumuladas, barras visuais de progresso e as posições de liderança.',
          inline: false,
        },
        {
          name: '⚙️ Painel Web Administrativo (`/admin/sazonal`)',
          value:
            'Permite ao criador e à staff configurar canais, alterar datas, prêmios, selecionar emojis numa galeria com mais de 1.400 itens e até testar drops manuais em 1 clique.',
          inline: false,
        }
      );

    await channel.send({
      embeds: [embedMecanicaArtes, embedComandos],
    });
    console.log('✅ Bloco 3 enviado.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 4: Canais Sugeridos & Veredito da Staff
    // -------------------------------------------------------------
    const embedVeredito = new EmbedBuilder()
      .setColor('#10b981')
      .setTitle('⚖️ CONSULTA À STAFF: PODEMOS INICIAR O EVENTO?')
      .setDescription(
        'Tudo está construído, desacoplado e operando com 100% de estabilidade. Agora a decisão é de vocês!\n\n' +
        '### 📌 Sugestão de Canais para Configuração:\n' +
        '• **Canal de Drops:** <#1453890870288973825> (`💬┃chati`) — para movimentar o chat geral.\n' +
        '• **Canal de Artes:** <#1461922359349870815> (`🌸┃artes`) — onde os membros já postam desenhos.\n' +
        '• **Canal de Anúncios:** <#1472269616431628408> (`📢┃avisos`) — para o anúncio oficial.\n\n' +
        '### ❓ Perguntas para o Conselho:\n' +
        '1. **Os horários e a quantidade de baús (3x/dia na semana e 6x/dia no fds) parecem equilibrados?**\n' +
        '2. **A premiação (1º Nitro, 2º 5k moedas + cargo, 3º 2k moedas) está justa?**\n' +
        '3. **Os canais sugeridos acima estão aprovados?**\n\n' +
        'Votem clicando nas reações abaixo e deixem seus comentários aqui no chat!'
      )
      .addFields(
        { name: '✅ Sinal Verde', value: 'Evento aprovado! Pode virar a chave no painel e iniciar.', inline: true },
        { name: '⚠️ Ajustes', value: 'Tenho ressalvas ou sugestões de mudança antes do início.', inline: true },
        { name: '💬 Dúvida/Ideia', value: 'Gostaria de sugerir algo novo ou tirar uma dúvida.', inline: true }
      )
      .setFooter({ text: 'Votem com as reações abaixo • Pyxie aguarda o comando da staff!' })
      .setTimestamp();

    const msgVeredito = await channel.send({
      embeds: [embedVeredito],
    });

    await msgVeredito.react('✅');
    await msgVeredito.react('⚠️');
    await msgVeredito.react('💬');
    await msgVeredito.react('🎃');

    console.log('✅ Bloco 4 (Veredito da Staff) enviado com reações!');
    console.log('🎉 Briefing completo transmitido com sucesso no canal 1461927268397093032!');
  } catch (err) {
    console.error('❌ Erro durante o envio do briefing:', err);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

main();

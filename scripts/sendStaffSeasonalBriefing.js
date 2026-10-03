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

  console.log('🔮 Conectando cliente Discord da Pyxie para envio do briefing simples...');
  await client.login(process.env.DISCORD_TOKEN);

  try {
    const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Canal ${TARGET_CHANNEL_ID} não encontrado ou inválido.`);
    }

    console.log(`📡 Canal localizado: ${channel.name} (${channel.guild.name})`);
    const config = loadConfig();

    // -------------------------------------------------------------
    // BLOCO 1: O Chamado & Visão Geral da Brincadeira
    // -------------------------------------------------------------
    const embedGeral = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('🎃 CONSELHO DA CRINGELÂNDIA: PROPOSTA DO EVENTO DE HALLOWEEN!')
      .setDescription(
        'Olha só quem resolveu aparecer no chat de planejamentos... Acharam que iam passar o mês das bruxas inteirinho sem doces nem travessuras? Achou errado, equipe! 💀\n\n' +
        'Eu preparei uma brincadeira super divertida e cheia de prêmios para todo mundo da Cringelândia! Mas antes de começar a valer de verdade no servidor, a staff precisa olhar as regrinhas, ver se os prêmios são legais e decidir se a gente começa agora!'
      )
      .addFields(
        {
          name: '🏷️ Nome da Brincadeira & Moeda',
          value: `• **Evento:** \`${config.eventName || 'Halloween da Cringelândia'}\`\n• **Moeda Especial:** <:halloweenabobora:1548443994902757427> **${config.currencyName || 'Abóboras'}** (só serve durante o Halloween!)`,
          inline: true,
        },
        {
          name: '⏳ Até quando dura?',
          value: '• **Até 02 de Novembro às 23:59**\n• Dá um mês inteirinho para todo mundo juntar abóboras e se divertir!',
          inline: true,
        },
        {
          name: '🏆 Prêmios para os Melhores (Top 3)',
          value:
            `🥇 **1º Lugar:** ${config.prizes?.firstPlace || '1 Mês de Discord Nitro + Cargo de Bruxo Supremo'}\n` +
            `🥈 **2º Lugar:** ${config.prizes?.secondPlace || '5.000 Moedinhas + Cargo de Zumbi da Cringelândia'}\n` +
            `🥉 **3º Lugar:** ${config.prizes?.thirdPlace || '2.000 Moedinhas'}`,
          inline: false,
        },
        {
          name: '🔒 Como o bot está agora?',
          value:
            '• ⏸️ **Pausado e quietinho:** O evento está prontinho, mas desligado. Ele não mexe em nada no servidor até vocês darem permissão!\n' +
            '• 🎛️ **Fácil de mudar:** Se a gente quiser mudar qualquer data, regra ou prêmio, dá para ajustar tudo pelo nosso site de administrador sem complicação.',
          inline: false,
        }
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1548444308401684530.gif')
      .setFooter({ text: 'Pyxie • Feito com carinho para a staff da Cringelândia' })
      .setTimestamp();

    await channel.send({
      content: '@everyone 🦇 **CONVOCAÇÃO DA STAFF: O CIRCO DOS HORRORES VAI COMEÇAR?**',
      embeds: [embedGeral],
    });
    console.log('✅ Bloco 1 enviado.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 2: Mecânica #1 — Baús da Pyxie & Exemplo Real
    // -------------------------------------------------------------
    const embedMecanicaDrops = new EmbedBuilder()
      .setColor('#ff7518')
      .setTitle('📦 1ª BRINCADEIRA: BAÚS SURPRESA DA PYXIE')
      .setDescription(
        'De surpresa, vai cair uma caixinha de tesouro no chat! Quem tiver os dedos mais rápidos ganha abóboras, mas tem um joguinho para ninguém tentar trapacear:'
      )
      .addFields(
        {
          name: '⏰ Que horas os baús caem no chat?',
          value:
            '• **De segunda a sexta (3 vezes no dia):** De manhãzinha (`09:30`), de tardinha (`15:30`) e de noitinha (`21:00`).\n' +
            '• **No sábado e domingo (6 vezes no dia):** Vários horários para todo mundo conseguir pegar! (`10:00`, `13:00`, `16:00`, `18:30`, `21:00` e `23:30`).',
          inline: false,
        },
        {
          name: '🎯 O Jogo da Carinha Certa (Não vale chutar!)',
          value:
            'Quando o baú cair, a Pyxie vai colocar **6 carinhas (emojis)** nele.\n' +
            'O recado vai dizer com todas as letras qual é a carinha certa daquela vez (por exemplo: *"Clique no Zumbi!"*).\n' +
            'Apenas quem clicar na **carinha certa** primeiro leva o prêmio! Quem clicar nas outras não ganha nada e passa vergonha.',
          inline: false,
        },
        {
          name: '👀 Os 6 Desenhos que podem aparecer no Baú',
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
          name: '🍬 Quanto ganha? E o chat não fica bagunçado?',
          value:
            '• Quem for mais rápido ganha **+1 ou +2 Abóboras** na hora!\n' +
            '• Depois que alguém abre o baú, a mensagem dele some sozinha depois de alguns minutinhos para o chat não ficar cheio de mensagens velhas.',
          inline: false,
        }
      )
      .setFooter({ text: 'Regra simples, rápida e divertida para movimentar o chat' });

    const embedExemploDrop = new EmbedBuilder()
      .setColor('#9333ea')
      .setTitle('🎃 [EXEMPLO REAL] Olha como o Baú vai aparecer no chat!')
      .setDescription(
        'Um baú suspeito caiu com tudo no meio do chat! 💥\n\n' +
        '⚡ **Rápido! Clique na carinha do <:ardiscordzombie:1548443801515720719> Zumbicord antes de todo mundo para abrir o baú!**\n\n' +
        '*Apenas o primeiro leva o saque (+1 ou +2 Abóboras). Se clicar nas carinhas erradas, não ganha nada!*'
      )
      .setThumbnail('https://cdn.discordapp.com/emojis/1548444209328033913.png')
      .setFooter({ text: 'Dica: Use /py-infoevento para ver o livrinho de regras! • (Exemplo demonstrativo)' });

    const msgDrop = await channel.send({
      embeds: [embedMecanicaDrops, embedExemploDrop],
    });

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
    console.log('✅ Bloco 2 enviado.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 3: Mecânica #2 — Arte da Semana & Comandos
    // -------------------------------------------------------------
    const embedMecanicaArtes = new EmbedBuilder()
      .setColor('#ec4899')
      .setTitle('🎨 2ª BRINCADEIRA: DESENHO DA SEMANA')
      .setDescription(
        'Uma forma bem legal de valorizar todo mundo que adora desenhar no nosso servidor:'
      )
      .addFields(
        {
          name: '📥 Como enviar seu desenho?',
          value:
            '• O membro posta a foto do desenho no canal de artes e marca a **@Pyxie**.\n' +
            '• A Pyxie vai colocar uma carinha de votação na foto: <a:halloween3gif55:1548443988745261086>.\n' +
            '• Todo mundo que gostar do desenho vota clicando nessa mesma carinha!',
          inline: false,
        },
        {
          name: '🗳️ Quem ganha e quando?',
          value:
            '• **Todo domingo às 10h da manhã**, a Pyxie conta os votos sozinha.\n' +
            '• O desenho mais votado vence a semana e o artista ganha **+5 <:halloweenabobora:1548443994902757427> Abóboras**!\n' +
            '• A Pyxie manda um quadro com a arte campeã no canal de avisos para todo mundo aplaudir.',
          inline: false,
        },
        {
          name: '🚫 Regras contra espertinhos',
          value:
            '• Não vale reenviar desenho que já ganhou em semanas anteriores.\n' +
            '• Desenhos postados há muito tempo (mais de 7 dias) não contam. Tem que ser arte nova da semana!\n' +
            '• A Pyxie guarda o nome de quem já venceu para ninguém tentar trapacear.',
          inline: false,
        }
      )
      .setFooter({ text: 'Incentivo à criatividade dos nossos artistas da Cringelândia' });

    const embedComandos = new EmbedBuilder()
      .setColor('#3b82f6')
      .setTitle('📱 COMANDOS QUE TODO MUNDO PODE USAR')
      .setDescription('Dois comandos novos e fáceis que já estão prontos no bot:')
      .addFields(
        {
          name: '📖 `/py-infoevento`',
          value:
            'Abre um livrinho no chat com o resumo completo do evento, todas as regras, premiações e quanto tempo ainda falta para acabar.',
          inline: false,
        },
        {
          name: '🏅 `/py-rank sazonal:true`',
          value:
            'Mostra o placar dos 10 membros que têm mais abóboras no servidor, com medalhas de ouro, prata e bronze e quem está na frente!',
          inline: false,
        },
        {
          name: '⚙️ Painel Web da Staff',
          value:
            'Nossa página de administração onde a liderança pode alterar qualquer prêmio, mudar os canais ou até testar um baú com apenas um clique.',
          inline: false,
        }
      );

    await channel.send({
      embeds: [embedMecanicaArtes, embedComandos],
    });
    console.log('✅ Bloco 3 enviado.');

    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // BLOCO 4: Sugestão de Canais & Veredito da Staff
    // -------------------------------------------------------------
    const embedVeredito = new EmbedBuilder()
      .setColor('#10b981')
      .setTitle('⚖️ CONSULTA À STAFF: PODEMOS INICIAR O EVENTO?')
      .setDescription(
        'Tudo está testado, seguro e pronto para rodar. Agora a decisão é de vocês!\n\n' +
        '### 📌 Canais sugeridos para a brincadeira:\n' +
        '• **Onde caem os Baús:** <#1453890870288973825> (`💬┃chati`) — para animar o chat geral.\n' +
        '• **Onde postar os Desenhos:** <#1461922359349870815> (`🌸┃artes`) — onde os artistas já postam.\n' +
        '• **Onde anunciar o vencedor:** <#1472269616431628408> (`📢┃avisos`) — para os anúncios oficiais.\n\n' +
        '### ❓ Perguntas para a Equipe:\n' +
        '1. **Os horários dos baús (3 vezes nos dias normais e 6 vezes no fim de semana) parecem bons?**\n' +
        '2. **Os prêmios (1º Nitro, 2º 5.000 moedas + cargo, 3º 2.000 moedas) estão justos e legais?**\n' +
        '3. **Esses três canais aí em cima estão certinhos?**\n\n' +
        'Votem clicando nas carinhas abaixo e digitem a opinião de vocês aqui no chat!'
      )
      .addFields(
        { name: '✅ Sinal Verde', value: 'Adorei! Por mim pode começar agora mesmo.', inline: true },
        { name: '⚠️ Ajustes', value: 'Tenho alguma sugestão ou quero mudar algo.', inline: true },
        { name: '💬 Dúvida/Ideia', value: 'Quero perguntar algo ou sugerir uma ideia.', inline: true }
      )
      .setFooter({ text: 'Clique nas reações abaixo para votar • A Pyxie aguarda a decisão de vocês!' })
      .setTimestamp();

    const msgVeredito = await channel.send({
      embeds: [embedVeredito],
    });

    await msgVeredito.react('✅');
    await msgVeredito.react('⚠️');
    await msgVeredito.react('💬');
    await msgVeredito.react('🎃');

    console.log('✅ Bloco 4 enviado com reações!');
    console.log('🎉 Briefing simples transmitido com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o envio:', err);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

main();

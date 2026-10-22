const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { getVentChannelId, updateGuildConfig, getGuildConfig } = require('./guildConfigService');

const ventDebounceTimers = new Map(); // guildId -> Timeout
const activeStickyMessageIds = new Map(); // guildId -> messageId

/**
 * Constrói o Embed Sticky oficial de Desabafos
 */
function buildVentStickyEmbed() {
  return new EmbedBuilder()
    .setColor('#4c1d95')
    .setTitle('💜  ✦  Espaço de Acolhimento & Desabafos')
    .setDescription(
      'Um espaço seguro e acolhedor dedicado à escuta, desabafo e apoio mútuo. 🫂\n\n' +
      'Aqui, cada pessoa merece ser ouvida com empatia, delicadeza e compreensão.\n\n' +

      '### 📜 Diretrizes e Convivência\n\n' +

      '💜 **1. Respeito e Empatia**\n' +
      'Proibido qualquer tipo de julgamento, invalidação emocional, deboche ou conselhos hostis. Respeite a vulnerabilidade alheia.\n\n' +

      '🕯️ **2. Gatilhos e Conteúdos Sensíveis (TW / +18)**\n' +
      'Este canal pode conter relatos densos e temas delicados. Utilize avisos de gatilho quando necessário e cuide de sua saúde mental ao ler.\n\n' +

      '🤝 **3. Acolhimento sem Pressão**\n' +
      'Ouça sem minimizar a dor alheia. Não imponha soluções ou opiniões invasivas. Às vezes, quem desabafa só precisa de escuta.\n\n' +

      '🫂 **4. Limites e Privacidade**\n' +
      'Respeite o espaço individual. É terminantemente proibido compartilhar prints, relatos ou expor membros sem autorização prévia.\n\n' +

      '🩹 **5. Apoio Comunitário**\n' +
      'Somos uma comunidade de apoio mútuo entre amigos. Este espaço **não substitui acompanhamento psicológico ou psiquiátrico profissional**.\n\n' +

      '### ✍️ Como Utilizar o Canal\n\n' +

      '💬 **Desabafo Público**\n' +
      'Envie sua mensagem diretamente no chat caso se sinta à vontade para compartilhar seu relato com a comunidade.\n\n' +

      '🎭 **Desabafo Anônimo**\n' +
      'Prefere sigilo absoluto? Utilize o botão **[ 🎭 Desabafo Anônimo ]** abaixo para publicar com identidade 100% oculta.\n\n' +

      '-# 🌷 Lembre-se: você não precisa encontrar as palavras perfeitas. Este cantinho é seguro para acolher o seu momento.'
    )
    .setFooter({ text: 'Pyxie • Cuidado, Acolhimento & Respeito Mútuo' })
    .setTimestamp();
}

/**
 * Constrói os botões da mensagem Sticky
 */
function buildVentStickyComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('vent:help')
        .setLabel('🆘 Receber Autoajuda (DM)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('vent:anonymous')
        .setLabel('🎭 Desabafo Anônimo')
        .setStyle(ButtonStyle.Primary)
    ),
  ];
}

/**
 * Constrói o Embed completo de Autoajuda (Brasil & Internacional)
 */
function buildAutohelpEmbed() {
  return new EmbedBuilder()
    .setColor('#059669')
    .setTitle('🌱  ✦  Rede de Apoio Emocional & Saúde Mental')
    .setDescription(
      'Se você está passando por um momento difícil, lembre-se de que você não precisa enfrentar isso sozinho(a).\n\n' +
      'Existem profissionais prontos para te ouvir com sigilo, respeito e carinho 24 horas por dia.'
    )
    .addFields(
      {
        name: '🇧🇷 Canais de Ajuda no Brasil (Gratuitos & Confidenciais)',
        value: [
          '• **CVV (Centro de Valorização da Vida):** Ligue `188` ou acesse [cvv.org.br](https://www.cvv.org.br)',
          '• **Pode Falar (UNICEF Brasil):** Ajuda online para jovens em [podefalar.org.br](https://www.podefalar.org.br)',
          '• **Mapa da Saúde Mental:** Encontre atendimento público gratuito em [mapasaudemental.com.br](https://mapasaudemental.com.br)',
          '• **Disque 100:** Direitos Humanos e proteção a vulneráveis',
          '• **Ligue 180:** Central de atendimento à mulher',
          '• **SUS / CAPS:** Procure a Unidade Básica de Saúde ou CAPS mais próximo de você.',
        ].join('\n\n'),
        inline: false,
      },
      {
        name: '🌍 Canais Internacionais de Apoio',
        value: [
          '• **Portugal:** Linha SOS Voz Amiga (`21 354 45 45`) / SNS 24 (`808 24 24 24`)',
          '• **EUA & Canadá:** Suicide & Crisis Lifeline: Ligue ou envie SMS para `988`',
          '• **Reino Unido:** Samaritans: Ligue `116 123`',
          '• **Diretório Global de Ajuda:** [findahelpline.com](https://findahelpline.com) e [befrienders.org](https://www.befrienders.org)',
        ].join('\n\n'),
        inline: false,
      }
    )
    .setFooter({ text: 'Você tem valor e sua vida importa para nós 💗' })
    .setTimestamp();
}

/**
 * Agenda o reposicionamento da mensagem Sticky com debounce de 4 segundos
 */
function scheduleStickyReposition(guild, channel) {
  if (!guild || !channel || !channel.isTextBased()) return;
  const guildId = guild.id;

  if (ventDebounceTimers.has(guildId)) {
    clearTimeout(ventDebounceTimers.get(guildId));
  }

  const timer = setTimeout(async () => {
    ventDebounceTimers.delete(guildId);
    try {
      // 1. Apaga sticky anterior
      const lastId = activeStickyMessageIds.get(guildId) || getGuildConfig(guildId).lastVentStickyId;
      if (lastId) {
        await channel.messages.delete(lastId).catch(() => null);
      }

      // 2. Envia nova sticky
      const newSticky = await channel.send({
        embeds: [buildVentStickyEmbed()],
        components: buildVentStickyComponents(),
      });

      activeStickyMessageIds.set(guildId, newSticky.id);
      updateGuildConfig(guildId, { lastVentStickyId: newSticky.id });
    } catch (err) {
      console.warn(`[ventService] Falha ao reposicionar mensagem sticky em ${guildId}:`, err.message);
    }
  }, 4000);

  ventDebounceTimers.set(guildId, timer);
}

/**
 * Intercepta mensagens no canal de desabafos
 */
async function onMessageCreate(message) {
  if (!message || message.author?.bot || !message.guild) return;

  const ventChannelId = getVentChannelId(message.guild.id);
  if (!ventChannelId || message.channel.id !== ventChannelId) return;

  // Se o usuário digitou no canal, envia a pergunta de preferência vinculada
  try {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`vent_pref:allow:${message.author.id}:${message.id}`)
        .setLabel('💬 Não me importo que me respondam')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`vent_pref:silence:${message.author.id}:${message.id}`)
        .setLabel('🤫 Prefiro que mantenham apenas silêncio')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({
      content: `${message.author}, seu desabafo foi publicado com carinho. Como você prefere que a comunidade reaja a ele?`,
      components: [row],
      allowedMentions: { repliedUser: false, users: [message.author.id] },
    }).catch(() => null);
  } catch (_) {}

  // Dispara debounce do sticky
  scheduleStickyReposition(message.guild, message.channel);
}

/**
 * Gerenciador central de interações de desabafo (Botões e Modais)
 */
async function handleVentInteraction(interaction) {
  if (!interaction) return false;

  // 1. Botão: Receber Autoajuda (DM)
  if (interaction.isButton() && interaction.customId === 'vent:help') {
    const helpEmbed = buildAutohelpEmbed();
    try {
      await interaction.user.send({ embeds: [helpEmbed] });
      await interaction.reply({
        content: '🌸 Te enviamos uma mensagem acolhedora com os principais canais de apoio e números de ajuda na sua **DM**!',
        ephemeral: true,
      });
    } catch (err) {
      // Fallback: se a DM estiver trancada, envia como resposta efêmera
      await interaction.reply({
        content: 'ℹ️ Sua DM parece estar fechada para mensagens diretas. Exibindo aqui apenas para você com carinho:',
        embeds: [helpEmbed],
        ephemeral: true,
      });
    }
    return true;
  }

  // 2. Botão: Abrir Modal de Desabafo Anônimo
  if (interaction.isButton() && interaction.customId === 'vent:anonymous') {
    const modal = new ModalBuilder()
      .setCustomId('vent_modal_submit')
      .setTitle('🎭 Desabafo Anônimo');

    const titleInput = new TextInputBuilder()
      .setCustomId('vent_title')
      .setLabel('Título do Desabafo')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: Um peso no coração / Desabafo do dia')
      .setRequired(true)
      .setMaxLength(100);

    const bodyInput = new TextInputBuilder()
      .setCustomId('vent_body')
      .setLabel('Mensagem de Desabafo')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Escreva seu desabafo com calma. Ninguém saberá sua identidade...')
      .setRequired(true)
      .setMaxLength(2000);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(bodyInput)
    );

    await interaction.showModal(modal);
    return true;
  }

  // 3. Submissão do Modal de Desabafo Anônimo
  if (interaction.isModalSubmit() && interaction.customId === 'vent_modal_submit') {
    const title = interaction.fields.getTextInputValue('vent_title');
    const body = interaction.fields.getTextInputValue('vent_body');

    const ventEmbed = new EmbedBuilder()
      .setColor('#581c87')
      .setTitle(`🎭  ✦  Desabafo Anônimo: ${title}`)
      .setDescription(body)
      .setFooter({ text: 'Desabafo Anônimo • Identidade 100% protegida pela Pyxie' })
      .setTimestamp();

    const channel = interaction.channel;
    if (channel && channel.isTextBased()) {
      const ventMsg = await channel.send({ embeds: [ventEmbed] });

      // Envia na confirmação efêmera os 2 botões de preferência vinculados ao desabafo recém-postado
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`vent_pref:allow:anon:${ventMsg.id}`)
          .setLabel('💬 Permitir respostas no meu desabafo')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`vent_pref:silence:anon:${ventMsg.id}`)
          .setLabel('🤫 Pedir apenas silêncio no meu desabafo')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        content: '✅ Seu desabafo anônimo foi publicado com sucesso! Escolha como prefere que o servidor responda a ele:',
        components: [row],
        ephemeral: true,
      });

      scheduleStickyReposition(interaction.guild, channel);
    }
    return true;
  }

  // 4. Botão de Preferência (Silêncio vs. Resposta)
  if (interaction.isButton() && interaction.customId.startsWith('vent_pref:')) {
    const parts = interaction.customId.split(':');
    const action = parts[1]; // 'allow' ou 'silence'
    const targetAuthorOrAnon = parts[2]; // authorId ou 'anon'
    const ventMsgId = parts[3];

    // Se for desabafo direto, apenas o autor pode responder
    if (targetAuthorOrAnon !== 'anon' && interaction.user.id !== targetAuthorOrAnon) {
      await interaction.reply({
        content: '❌ Apenas quem enviou este desabafo pode definir a preferência de respostas.',
        ephemeral: true,
      });
      return true;
    }

    const prefText = action === 'allow'
      ? '💬 **Preferência do Autor:** Respostas de acolhimento e escuta são muito bem-vindas.'
      : '🤫 **Preferência do Autor:** Por favor, mantenham apenas **silêncio e respeito** perante este desabafo (sem respostas diretas).';

    // Se a interação foi na pergunta pública
    if (interaction.message && !interaction.message.flags?.has(64)) {
      await interaction.update({
        content: prefText,
        components: [],
      });
    } else {
      // Se foi na efêmera do anônimo, envia uma mensagem pública discreta abaixo do desabafo
      const channel = interaction.channel;
      if (channel && ventMsgId) {
        await channel.send({
          content: `> ${prefText}`,
          allowedMentions: { parse: [] },
        }).catch(() => null);
      }
      await interaction.update({
        content: `✅ Preferência registrada com sucesso: ${prefText}`,
        components: [],
      });
    }

    scheduleStickyReposition(interaction.guild, interaction.channel);
    return true;
  }

  return false;
}

module.exports = {
  buildVentStickyEmbed,
  buildVentStickyComponents,
  buildAutohelpEmbed,
  scheduleStickyReposition,
  onMessageCreate,
  handleVentInteraction,
};


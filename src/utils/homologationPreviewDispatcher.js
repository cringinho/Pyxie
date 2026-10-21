const { EmbedBuilder } = require('discord.js');
const { STARTUP_CHANNEL_ID } = require('../config');

const HOMOLOGATION_CHANNEL_ID = process.env.HOMOLOGATION_CHANNEL_ID || STARTUP_CHANNEL_ID || '1461937203214024891';

/**
 * Blindagem Anti-Ping:
 * Sanitiza qualquer string para neutralizar menções ativas a usuários, cargos e @everyone/@here.
 * Envolve tags em crases simples ou triplas para exibição segura sem notificar ninguém.
 *
 * @param {string} text
 * @returns {string}
 */
function shieldAntiPing(text) {
  if (!text || typeof text !== 'string') return text;

  return text
    // Neutraliza menções a usuários: <@123456789> ou <@!123456789> -> `<@123456789>`
    .replace(/(?<!`)<@!?(\d+)>(?!`)/g, '`<@$1>`')
    // Neutraliza menções a cargos: <@&123456789> -> `<@&123456789>`
    .replace(/(?<!`)<@&(\d+)>(?!`)/g, '`<@&$1>`')
    // Neutraliza menções a canais: <#123456789> -> `<#123456789>`
    .replace(/(?<!`)<#(\d+)>(?!`)/g, '`<#$1>`')
    // Neutraliza menções massivas: @everyone e @here
    .replace(/(?<!`)@everyone(?!`)/g, '`@everyone`')
    .replace(/(?<!`)@here(?!`)/g, '`@here`');
}

/**
 * Sanitiza recursivamente um objeto de embed (ou EmbedBuilder) aplicando a blindagem anti-ping.
 *
 * @param {EmbedBuilder|Object} embed
 * @returns {EmbedBuilder}
 */
function sanitizeEmbed(embed) {
  if (!embed) return null;

  const rawData = typeof embed.toJSON === 'function' ? embed.toJSON() : JSON.parse(JSON.stringify(embed));
  const sanitized = {};

  if (rawData.title && String(rawData.title).trim()) {
    sanitized.title = shieldAntiPing(String(rawData.title).trim());
  }
  if (rawData.description && String(rawData.description).trim()) {
    sanitized.description = shieldAntiPing(String(rawData.description).trim());
  }
  if (rawData.url) sanitized.url = rawData.url;
  if (rawData.color !== undefined) sanitized.color = rawData.color;
  if (rawData.timestamp) sanitized.timestamp = rawData.timestamp;
  if (rawData.thumbnail?.url) sanitized.thumbnail = rawData.thumbnail;
  if (rawData.image?.url) sanitized.image = rawData.image;

  if (rawData.author?.name && String(rawData.author.name).trim()) {
    sanitized.author = {
      ...rawData.author,
      name: shieldAntiPing(String(rawData.author.name).trim()),
    };
  }

  if (rawData.footer?.text && String(rawData.footer.text).trim()) {
    sanitized.footer = {
      ...rawData.footer,
      text: shieldAntiPing(String(rawData.footer.text).trim()),
    };
  }

  if (Array.isArray(rawData.fields)) {
    const validFields = rawData.fields
      .filter((f) => f && f.name && f.value && String(f.name).trim() && String(f.value).trim())
      .map((field) => ({
        name: shieldAntiPing(String(field.name).trim()),
        value: shieldAntiPing(String(field.value).trim()),
        inline: Boolean(field.inline),
      }));

    if (validFields.length > 0) {
      sanitized.fields = validFields;
    }
  }

  // Discord exige ao menos um dos elementos principais
  const hasContent = sanitized.title || sanitized.description || (sanitized.fields && sanitized.fields.length > 0) || sanitized.image;
  if (!hasContent) {
    sanitized.description = '*(Embed vazio ou sem descrição definida)*';
  }

  return EmbedBuilder.from(sanitized);
}

/**
 * Cria o banner de cabeçalho informativo de homologação
 *
 * @param {Object} options
 * @returns {EmbedBuilder}
 */
function buildHeaderEmbed({ commandName, context, extraInfo }) {
  const timestampBrt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const header = new EmbedBuilder()
    .setColor('#5E2B8C')
    .setTitle('🧪  ✦  Preview de Homologação de Embed')
    .setDescription(
      `**Comando / Módulo:** \`${commandName || 'Geral'}\`\n` +
      `**Contexto:** \`${context || 'Alteração de UI / Embed'}\``
    )
    .addFields(
      { name: '📍 Canal Alvo', value: `\`<#${HOMOLOGATION_CHANNEL_ID}>\``, inline: true },
      { name: '🛡️ Blindagem', value: '`Anti-Ping Ativo (Tags em crases)`', inline: true },
      { name: '🕒 Horário (BRT)', value: `\`${timestampBrt}\``, inline: true }
    );

  if (extraInfo) {
    header.addFields({ name: 'ℹ️ Detalhes Adicionais', value: shieldAntiPing(String(extraInfo)), inline: false });
  }

  header.setFooter({ text: 'Pyxie Homologation Dispatcher • Protocolo Obrigatório de Interface' });

  return header;
}

/**
 * Despacha automaticamente uma preview de Embeds e Mensagens para o canal de testes oficial.
 *
 * @param {Object} params
 * @param {import('discord.js').Client} [params.client] - Instância ativa do Discord Client (opcional)
 * @param {string} [params.commandName] - Nome do comando associado (ex: '/py-tarot')
 * @param {string} [params.context] - Descrição do contexto da mudança (ex: 'Novo layout de resultado')
 * @param {string} [params.content] - Mensagem de texto simples a ser enviada
 * @param {Array<EmbedBuilder|Object>|EmbedBuilder|Object} [params.embeds] - Embeds a serem exibidos
 * @param {Array<any>} [params.components] - Linhas de ação, botões ou seletores
 * @param {Array<any>} [params.files] - Anexos ou imagens locais
 * @param {string} [params.channelId] - Canal alternativo de testes (default: HOMOLOGATION_CHANNEL_ID)
 * @param {boolean} [params.includeHeader=true] - Se deve incluir o banner oficial de homologação
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, simulated?: boolean }>}
 */
async function dispatchHomologationPreview({
  client,
  commandName = 'Geral',
  context = 'Atualização de Embed',
  content = '',
  embeds = [],
  components = [],
  files = [],
  channelId = HOMOLOGATION_CHANNEL_ID,
  includeHeader = true,
  extraInfo,
} = {}) {
  // 1. Normalização e sanitização de Embeds
  const rawEmbedList = Array.isArray(embeds) ? embeds : (embeds ? [embeds] : []);
  const sanitizedTargetEmbeds = rawEmbedList.map(sanitizeEmbed).filter(Boolean);

  const finalEmbeds = [];
  if (includeHeader) {
    finalEmbeds.push(buildHeaderEmbed({ commandName, context, extraInfo }));
  }
  for (const e of sanitizedTargetEmbeds) {
    if (finalEmbeds.length < 10) {
      finalEmbeds.push(e);
    }
  }

  // 2. Sanitização de conteúdo e garantia de allowedMentions vazias (Anti-Ping)
  const sanitizedContent = shieldAntiPing(content);
  const strictAllowedMentions = {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  };

  const payload = {
    content: sanitizedContent || undefined,
    embeds: finalEmbeds,
    components: components || [],
    files: files || [],
    allowedMentions: strictAllowedMentions,
  };

  // 3. Estratégia A: Envio direto via cliente Discord ativo na memória
  if (client && client.channels && typeof client.channels.fetch === 'function') {
    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const sent = await channel.send(payload);
        console.log(`[HomologationPreview] ✅ Preview despachada via Client no canal ${channelId} (Msg ID: ${sent.id})`);
        return { success: true, messageId: sent.id, channelId };
      }
    } catch (err) {
      console.warn(`[HomologationPreview] Falha ao enviar via client: ${err.message}. Tentando REST fallback...`);
    }
  }

  // 4. Estratégia B: Envio autônomo via Discord REST API (Node 18+ fetch)
  const botToken = process.env.DISCORD_TOKEN;
  if (botToken && typeof globalThis.fetch === 'function') {
    try {
      const restPayload = {
        content: payload.content,
        embeds: payload.embeds.map((e) => (typeof e.toJSON === 'function' ? e.toJSON() : e)),
        components: payload.components.map((c) => (typeof c.toJSON === 'function' ? c.toJSON() : c)),
        allowed_mentions: {
          parse: [],
          users: [],
          roles: [],
          replied_user: false,
        },
      };

      const res = await globalThis.fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restPayload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[HomologationPreview] ✅ Preview despachada via Discord REST no canal ${channelId} (Msg ID: ${data.id})`);
        return { success: true, messageId: data.id, channelId };
      } else {
        const errorText = await res.text();
        console.warn(`[HomologationPreview] Resposta HTTP ${res.status} da API do Discord: ${errorText}`);
      }
    } catch (err) {
      console.warn(`[HomologationPreview] Falha ao despachar via REST: ${err.message}`);
    }
  }

  // 5. Estratégia C: Modo Mock / Teste Unitário (ambiente sem rede ou sem token ativo)
  console.log(`[HomologationPreview] ℹ️ Modo simulação/teste: Embed validado com blindagem anti-ping com sucesso.`);
  return {
    success: true,
    simulated: true,
    channelId,
    sanitizedPayload: {
      content: payload.content,
      embedsCount: payload.embeds.length,
      allowedMentions: payload.allowedMentions,
    },
  };
}

module.exports = {
  HOMOLOGATION_CHANNEL_ID,
  shieldAntiPing,
  sanitizeEmbed,
  buildHeaderEmbed,
  dispatchHomologationPreview,
};

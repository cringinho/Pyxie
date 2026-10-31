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
/** Converte AttachmentBuilder / { attachment, name } em bytes para o envio por REST. */
async function restAttachments(files = []) {
  const out = [];
  for (const file of files || []) {
    const raw = file?.attachment ?? file?.data?.attachment ?? file;
    const name = file?.name || file?.data?.name || `preview-${out.length}.png`;
    try {
      if (Buffer.isBuffer(raw)) out.push({ name, data: raw });
      else if (typeof raw === 'string') out.push({ name, data: require('fs').readFileSync(raw) });
    } catch (_) {}
  }
  return out;
}

// Prévia de homologação é opt-in: por padrão NADA é enviado ao canal.
// Ligue com `PYXIE_PREVIEWS=on` (ou passe `force: true`) só quando o dono pedir.
const PREVIEW_ENV = 'PYXIE_PREVIEWS';
const PREVIEW_ON = ['on', '1', 'true', 'yes'];

function previewsEnabled(options = {}) {
  if (options.force === true) return true;
  const flag = String(process.env[PREVIEW_ENV] || '').trim().toLowerCase();
  return PREVIEW_ON.includes(flag);
}

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
  force = false,
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

  // 3. Portão: sem pedido explícito do dono, nada sai daqui (nem via client, nem via REST).
  if (!previewsEnabled({ force })) {
    console.log(`[HomologationPreview] ⏸️ Envio desligado. Use ${PREVIEW_ENV}=on (ou force: true) quando o dono pedir.`);
    return {
      success: true,
      skipped: true,
      simulated: true,
      channelId,
      sanitizedPayload: {
        content: payload.content,
        embedsCount: payload.embeds.length,
        allowedMentions: payload.allowedMentions,
      },
    };
  }

  // 4. Estratégia A: Envio direto via cliente Discord ativo na memória
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

  // 5. Estratégia B: Envio autônomo via Discord REST API (Node 18+ fetch)
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

      // Imagens (cena da dungeon, quarto da Casinha) vão como multipart; sem arquivos, JSON simples
      const attachments = await restAttachments(files);
      const buildRequest = () => {
        if (!attachments.length) {
          return { headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(restPayload) };
        }
        const form = new FormData();
        form.append('payload_json', JSON.stringify({ ...restPayload, attachments: attachments.map((a, id) => ({ id, filename: a.name })) }));
        attachments.forEach((a, id) => form.append(`files[${id}]`, new Blob([a.data]), a.name));
        return { headers: { Authorization: `Bot ${botToken}` }, body: form };
      };

      // Respeita o Retry-After do Discord (429) em até 3 tentativas
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const request = buildRequest();
        const res = await globalThis.fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, { method: 'POST', ...request });
        if (res.ok) {
          const data = await res.json();
          console.log(`[HomologationPreview] ✅ Preview despachada via Discord REST no canal ${channelId} (Msg ID: ${data.id})`);
          return { success: true, messageId: data.id, channelId };
        }
        const errorText = await res.text();
        if (res.status === 429 && attempt < 3) {
          let waitSec = Number(res.headers.get('retry-after')) || 1;
          try {
            waitSec = Number(JSON.parse(errorText).retry_after) || waitSec;
          } catch (_) {}
          await new Promise((resolve) => setTimeout(resolve, Math.ceil(waitSec * 1000) + 100));
          continue;
        }
        console.warn(`[HomologationPreview] Resposta HTTP ${res.status} da API do Discord: ${errorText}`);
        break;
      }
    } catch (err) {
      console.warn(`[HomologationPreview] Falha ao despachar via REST: ${err.message}`);
    }
  }

  // 6. Estratégia C: Modo Mock / Teste Unitário (ambiente sem rede ou sem token ativo)
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
  PREVIEW_ENV,
  previewsEnabled,
  shieldAntiPing,
  sanitizeEmbed,
  buildHeaderEmbed,
  dispatchHomologationPreview,
};

const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
  REST,
  Routes,
} = require('discord.js');

const securityGuard = require('./utils/securityGuard');
const robloxHelper = require('./utils/robloxHelper');
const templatesCatalog = require('./utils/templatesCatalog');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads', 'mary');
const CONFIG_FILE = path.join(DATA_DIR, 'maryStudioConfig.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'marySavedMessages.json');
const STORE_FILE = path.join(DATA_DIR, 'maryStoreData.json');

const MARY_DEFAULT_GUILD_ID = '1557399041443111025';

class MaryStudioManager {
  constructor() {
    this.client = null;
    this._restClient = null;
    this.ctx = null;
    this.buttonActionHandler = null;
    this.ticketHandler = null;
    this.reviewHandler = null;
    this.stickyAndFaqHandler = null;
    this.giveawayHandler = null;
  }

  getRestClient() {
    if (this._restClient) return this._restClient;
    const token = process.env.DISCORD_TOKEN;
    if (token) {
      this._restClient = new REST({ version: '10' }).setToken(token);
      return this._restClient;
    }
    return null;
  }

  init(client, ctx) {
    this.client = client;
    this.ctx = ctx;

    // Garante pastas e arquivos iniciais
    this.ensureStorage();

    // Tenta descobrir o servidor da Mary ao carregar
    if (this.client) {
      if (this.client.isReady && this.client.isReady()) {
        this.discoverGuild();
      } else if (typeof this.ctx?.registerListener === 'function') {
        this.ctx.registerListener('ready', () => this.discoverGuild());
      }
      if (typeof this.ctx?.registerListener === 'function') {
        this.ctx.registerListener('guildCreate', () => this.discoverGuild());
      }
    }

    // Inicializa handlers opcionais se fornecidos
    if (this.buttonActionHandler?.init) this.buttonActionHandler.init(this);
    if (this.ticketHandler?.init) this.ticketHandler.init(this);
    if (this.reviewHandler?.init) this.reviewHandler.init(this);
    if (this.stickyAndFaqHandler?.init) this.stickyAndFaqHandler.init(this);
    if (this.giveawayHandler?.init) this.giveawayHandler.init(this);
  }

  stop() {
    this.client = null;
    this._restClient = null;
  }

  ensureStorage() {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    this.loadConfig();
    this.loadMessages();
    this.loadStoreData();
  }

  // --- PERSISTÊNCIA ATÔMICA ---
  writeAtomic(filePath, data) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (err) {
      console.error(`[MaryStudioManager] Falha ao escrever em ${filePath}:`, err.message);
      return false;
    }
  }

  loadConfig() {
    try {
      if (!fs.existsSync(CONFIG_FILE)) {
        const initial = {
          guildId: MARY_DEFAULT_GUILD_ID,
          statusLoja: 'online', // 'online' | 'fila' | 'offline'
          localNick: '',
          localAvatarUrl: '',
          localBannerUrl: '',
          localBio: '',
          estoqueRobux: 25000,
          preco1k: 37.0,
          pixKey: '',
          pixName: 'MARY STORE',
          pixCity: 'SAO PAULO',
          channelTickets: null,
          channelReviews: null,
          channelStockNotice: null,
          roleClient: null,
          roleStockAlert: null,
          featureFlags: {
            stockModule: true,
            pixModule: true,
            robloxVerifier: true,
            ticketModule: false,
            reviewModule: false,
            couponsModule: false,
            autoRoleModule: false,
            stickyModule: false,
            antiLinkModule: false,
            giveawayModule: false,
          },
          macros: [
            { id: 'm1', label: '👋 Saudação', text: 'Olá! Seja muito bem-vindo(a) à Mary Store! 🎀 Já estou atendendo você. Qual a quantidade de Robux que deseja comprar hoje?' },
            { id: 'm2', label: '⏳ Robux Pendentes', text: 'Prontinho! Seus Robux já foram comprados na sua Gamepass. Você pode acompanhar em: https://www.roblox.com/transactions (ficam pendentes por 5 dias pelo Roblox antes de cair no seu saldo).' },
            { id: 'm3', label: '⚠️ Preços Regionais', text: 'Atenção: no painel da sua Gamepass no Creator Hub do Roblox, certifique-se de DESATIVAR a caixinha de "Preços Regionais", pois ela altera o valor final em Robux!' },
            { id: 'm4', label: '📘 Como Criar Gamepass', text: 'Passo a passo:\n1. Acesse https://create.roblox.com/dashboard/creations\n2. Clique em sua experiência padrão (SeuNome\'s Place)\n3. No menu lateral, vá em "Passes" (Passes)\n4. Clique em "Criar Passe", coloque um nome e salve.\n5. Clique no passe criado, vá na aba "Vendas", ative "Item à Venda" e coloque o valor exato combinado!\n6. Copie e envie o link aqui no chat.' },
            { id: 'm5', label: '💳 Chave PIX', text: 'Aqui está nossa Chave PIX para pagamento:\nChave: {pix_key}\nNome: {pix_name}\nPor favor, envie o comprovante assim que realizar a transferência!' },
            { id: 'm6', label: '⭐ Pedir Avaliação', text: 'Muito obrigada por confiar na Mary Store! 💖 Poderia deixar uma avaliação com ⭐ no nosso canal de avaliações? Isso ajuda muito a lojinha a crescer!' },
          ],
        };
        this.writeAtomic(CONFIG_FILE, initial);
        return initial;
      }
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data && typeof data === 'object' && data.localBannerUrl === undefined) {
        data.localBannerUrl = '';
      }
      return data;
    } catch (_) {
      return {};
    }
  }

  saveConfig(data) {
    return this.writeAtomic(CONFIG_FILE, data);
  }

  loadMessages() {
    try {
      if (!fs.existsSync(MESSAGES_FILE)) {
        const initial = { messages: {} };
        this.writeAtomic(MESSAGES_FILE, initial);
        return initial;
      }
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch (_) {
      return { messages: {} };
    }
  }

  saveMessages(data) {
    return this.writeAtomic(MESSAGES_FILE, data);
  }

  loadStoreData() {
    try {
      if (!fs.existsSync(STORE_FILE)) {
        const initial = {
          tickets: {},
          reviews: [],
          coupons: {},
          giveaways: {},
          stickyMessages: {},
        };
        this.writeAtomic(STORE_FILE, initial);
        return initial;
      }
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    } catch (_) {
      return { tickets: {}, reviews: [], coupons: {}, giveaways: {}, stickyMessages: {} };
    }
  }

  saveStoreData(data) {
    return this.writeAtomic(STORE_FILE, data);
  }

  // --- DESCOBERTA DINÂMICA DO SERVIDOR DA MARY ---
  discoverGuild() {
    if (!this.client?.guilds?.cache) return null;
    const config = this.loadConfig();
    let targetGuild = null;

    // 1. Se já tem guildId válido no cache, mantém
    if (config.guildId && this.client.guilds.cache.has(config.guildId)) {
      targetGuild = this.client.guilds.cache.get(config.guildId);
    } else if (this.client.guilds.cache.has(MARY_DEFAULT_GUILD_ID)) {
      // 2. Se a guild padrão da Mary está no cache
      config.guildId = MARY_DEFAULT_GUILD_ID;
      this.saveConfig(config);
      targetGuild = this.client.guilds.cache.get(MARY_DEFAULT_GUILD_ID);
    } else {
      // 3. Busca guilds onde a Mary é dona ou tem permissão de Admin/ManageGuild
      for (const guild of this.client.guilds.cache.values()) {
        if (guild.ownerId === securityGuard.MARY_DISCORD_ID) {
          targetGuild = guild;
          break;
        }
        const member = guild.members?.cache?.get(securityGuard.MARY_DISCORD_ID);
        if (
          member &&
          (member.permissions?.has(PermissionFlagsBits.Administrator) ||
            member.permissions?.has(PermissionFlagsBits.ManageGuild))
        ) {
          targetGuild = guild;
          break;
        }
      }

      if (targetGuild) {
        config.guildId = targetGuild.id;
        this.saveConfig(config);
      }
    }

    if (targetGuild && config.localNick && targetGuild.members?.me) {
      if (targetGuild.members.me.nickname !== config.localNick) {
        targetGuild.members.me.setNickname(config.localNick).catch(() => {});
      }
    }

    return targetGuild;
  }

  getGuild(guildId = null) {
    if (!this.client?.guilds?.cache) return null;
    const targetId = guildId || this.loadConfig().guildId || MARY_DEFAULT_GUILD_ID;
    if (targetId && this.client.guilds.cache.has(targetId)) {
      return this.client.guilds.cache.get(targetId);
    }
    return this.discoverGuild();
  }

  // --- RESOLUÇÃO DE VARIÁVEIS DINÂMICAS ---
  resolveVariables(text, config = null) {
    if (!text || typeof text !== 'string') return '';
    const cfg = config || this.loadConfig();
    const store = this.loadStoreData();

    const estoqueStr = (Number(cfg.estoqueRobux) || 0).toLocaleString('pt-BR') + ' R$';
    const precoStr = 'R$ ' + (Number(cfg.preco1k) || 37.0).toFixed(2).replace('.', ',');

    let statusStr = '🟢 Online (Entrega Rápida)';
    if (cfg.statusLoja === 'fila') statusStr = '🟡 Atendimento em Fila';
    if (cfg.statusLoja === 'offline') statusStr = '🔴 Lojinha Fechada';

    const totalReviews = (store.reviews || []).length;
    let avgScore = '5.0';
    if (totalReviews > 0) {
      const sum = store.reviews.reduce((acc, r) => acc + (Number(r.stars) || 5), 0);
      avgScore = (sum / totalReviews).toFixed(1);
    }

    return text
      .replace(/\{estoque\}/gi, estoqueStr)
      .replace(/\{preco_1k\}/gi, precoStr)
      .replace(/\{status_loja\}/gi, statusStr)
      .replace(/\{total_avaliacoes\}/gi, String(totalReviews))
      .replace(/\{nota_media\}/gi, `${avgScore} ⭐`)
      .replace(/\{pix_key\}/gi, cfg.pixKey || 'Chave PIX não informada')
      .replace(/\{pix_name\}/gi, cfg.pixName || 'MARY STORE')
      .replace(/\{bio\}/gi, cfg.localBio || 'Mary Store • Robux Oficial')
      .replace(/\{descricao\}/gi, cfg.localBio || 'Mary Store • Robux Oficial');
  }

  // --- CONSTRUÇÃO DE EMBEDS E COMPONENTES DISCORD ---
  buildEmbed(embedData, config = null) {
    if (!embedData) return null;
    const embed = new EmbedBuilder();

    if (embedData.title) {
      embed.setTitle(this.resolveVariables(embedData.title, config));
    }
    if (embedData.description) {
      embed.setDescription(this.resolveVariables(embedData.description, config));
    }
    if (embedData.color) {
      try {
        embed.setColor(embedData.color);
      } catch (_) {
        embed.setColor('#ec4899');
      }
    } else {
      embed.setColor('#ec4899');
    }

    if (embedData.imageUrl) {
      embed.setImage(embedData.imageUrl);
    }
    if (embedData.thumbnailUrl) {
      embed.setThumbnail(embedData.thumbnailUrl);
    }

    if (embedData.footerText) {
      embed.setFooter({
        text: this.resolveVariables(embedData.footerText, config),
        iconURL: embedData.footerIconUrl || undefined,
      });
    }

    if (embedData.showTimestamp) {
      embed.setTimestamp();
    }

    if (Array.isArray(embedData.fields)) {
      for (const field of embedData.fields) {
        if (field.name && field.value) {
          embed.addFields({
            name: this.resolveVariables(field.name, config),
            value: this.resolveVariables(field.value, config),
            inline: Boolean(field.inline),
          });
        }
      }
    }

    return embed;
  }

  buildActionRows(buttons = []) {
    if (!Array.isArray(buttons) || buttons.length === 0) return [];
    const rows = [];
    let currentRow = new ActionRowBuilder();

    buttons.slice(0, 25).forEach((btn, index) => {
      if (index > 0 && index % 5 === 0) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      const button = new ButtonBuilder();
      let label = btn.label ? String(btn.label).trim() : '';
      let emoji = btn.emoji ? String(btn.emoji).trim() : null;

      // Previne duplicação de emoji no botão do Discord:
      // Se o botão possui emoji definido e o label começa com ele, remove o emoji do texto do label
      if (emoji && label) {
        while (label.startsWith(emoji)) {
          label = label.slice(emoji.length).trim();
        }
      }

      if (label) button.setLabel(label.slice(0, 80));
      if (emoji) {
        try {
          button.setEmoji(emoji);
        } catch (_) {}
      }

      // Estilo
      let style = ButtonStyle.Primary;
      if (btn.style === 'Secondary') style = ButtonStyle.Secondary;
      if (btn.style === 'Success') style = ButtonStyle.Success;
      if (btn.style === 'Danger') style = ButtonStyle.Danger;
      if (btn.style === 'Link') style = ButtonStyle.Link;

      button.setStyle(style);

      if (style === ButtonStyle.Link && btn.url) {
        button.setURL(btn.url);
      } else {
        const actionId = btn.id || `btn_${index}_${Date.now().toString(36)}`;
        button.setCustomId(`mary_btn:${btn.actionType || 'custom'}:${actionId}`);
      }

      currentRow.addComponents(button);
    });

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  // --- ENVIO E EDIÇÃO DE MENSAGENS COM HISTÓRICO UNDO ---
  async sendMessage(channelId, messagePayload) {
    const config = this.loadConfig();
    const content = messagePayload.content ? this.resolveVariables(messagePayload.content, config) : '';
    const embeds = messagePayload.embed ? [this.buildEmbed(messagePayload.embed, config)] : [];
    const components = this.buildActionRows(messagePayload.buttons || []);

    let sentMessageId = null;
    let guildId = config.guildId || MARY_DEFAULT_GUILD_ID;
    let channelName = '';

    if (this.client) {
      const channel = await this.client.channels.fetch(channelId).catch(() => null);
      if (!channel || typeof channel.send !== 'function') {
        throw new Error('Canal de texto não encontrado ou sem permissão de envio.');
      }
      const sentMessage = await channel.send({
        content: content || undefined,
        embeds: embeds.length > 0 ? embeds : undefined,
        components: components.length > 0 ? components : undefined,
      });
      sentMessageId = sentMessage.id;
      guildId = channel.guild?.id || config.guildId;
      channelName = channel.name || '';
    } else {
      const rest = this.getRestClient();
      if (!rest) throw new Error('Cliente Discord não conectado e token indisponível.');
      const body = {};
      if (content) body.content = content;
      if (embeds.length > 0) body.embeds = embeds.map((e) => (typeof e.toJSON === 'function' ? e.toJSON() : e));
      if (components.length > 0) body.components = components.map((c) => (typeof c.toJSON === 'function' ? c.toJSON() : c));

      const rawSent = await rest.post(Routes.channelMessages(channelId), { body });
      if (!rawSent || !rawSent.id) throw new Error('Falha ao enviar mensagem no canal.');
      sentMessageId = rawSent.id;
    }

    // Salva metadados da mensagem enviada
    const recordId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const savedMessages = this.loadMessages();

    savedMessages.messages[recordId] = {
      recordId,
      guildId,
      channelId,
      channelName,
      messageId: sentMessageId,
      content: messagePayload.content || '',
      embed: messagePayload.embed || null,
      buttons: messagePayload.buttons || [],
      versions: [], // Histórico para Undo
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.saveMessages(savedMessages);
    return { success: true, recordId, messageId: sentMessageId };
  }

  async editMessage(recordId, newMessagePayload) {
    const savedMessages = this.loadMessages();
    const record = savedMessages.messages[recordId];
    if (!record) throw new Error('Registro de mensagem não encontrado.');

    // Salva versão anterior no histórico de Undo (máx 5 versões)
    const previousVersion = {
      content: record.content,
      embed: record.embed ? JSON.parse(JSON.stringify(record.embed)) : null,
      buttons: record.buttons ? JSON.parse(JSON.stringify(record.buttons)) : [],
      savedAt: record.updatedAt || record.createdAt,
    };

    record.versions = record.versions || [];
    record.versions.unshift(previousVersion);
    if (record.versions.length > 5) record.versions = record.versions.slice(0, 5);

    // Atualiza com os novos dados
    record.content = newMessagePayload.content || '';
    record.embed = newMessagePayload.embed || null;
    record.buttons = newMessagePayload.buttons || [];
    record.updatedAt = Date.now();

    const config = this.loadConfig();
    const content = record.content ? this.resolveVariables(record.content, config) : '';
    const embeds = record.embed ? [this.buildEmbed(record.embed, config)] : [];
    const components = this.buildActionRows(record.buttons || []);

    if (this.client) {
      const channel = await this.client.channels.fetch(record.channelId).catch(() => null);
      if (!channel) throw new Error('Canal da mensagem original não encontrado.');

      const message = await channel.messages.fetch(record.messageId).catch(() => null);
      if (!message) throw new Error('Mensagem no Discord não foi encontrada (pode ter sido apagada manualmente).');

      await message.edit({
        content: content || '',
        embeds,
        components,
      });
    } else {
      const rest = this.getRestClient();
      if (!rest) throw new Error('Cliente Discord não conectado e token indisponível.');
      const body = {
        content: content || '',
        embeds: embeds.map((e) => (typeof e.toJSON === 'function' ? e.toJSON() : e)),
        components: components.map((c) => (typeof c.toJSON === 'function' ? c.toJSON() : c)),
      };
      await rest.patch(Routes.channelMessage(record.channelId, record.messageId), { body });
    }

    this.saveMessages(savedMessages);
    return { success: true, recordId, messageId: record.messageId };
  }

  async undoMessage(recordId) {
    const savedMessages = this.loadMessages();
    const record = savedMessages.messages[recordId];
    if (!record) throw new Error('Registro de mensagem não encontrado.');
    if (!record.versions || record.versions.length === 0) {
      throw new Error('Não há versões anteriores salvas para desfazer.');
    }

    const previousVersion = record.versions.shift();
    record.content = previousVersion.content;
    record.embed = previousVersion.embed;
    record.buttons = previousVersion.buttons;
    record.updatedAt = Date.now();

    const config = this.loadConfig();
    const content = record.content ? this.resolveVariables(record.content, config) : '';
    const embeds = record.embed ? [this.buildEmbed(record.embed, config)] : [];
    const components = this.buildActionRows(record.buttons || []);

    if (this.client) {
      const channel = await this.client.channels.fetch(record.channelId).catch(() => null);
      if (channel) {
        const message = await channel.messages.fetch(record.messageId).catch(() => null);
        if (message) {
          await message.edit({ content: content || '', embeds, components });
        }
      }
    } else {
      const rest = this.getRestClient();
      if (rest) {
        const body = {
          content: content || '',
          embeds: embeds.map((e) => (typeof e.toJSON === 'function' ? e.toJSON() : e)),
          components: components.map((c) => (typeof c.toJSON === 'function' ? c.toJSON() : c)),
        };
        await rest.patch(Routes.channelMessage(record.channelId, record.messageId), { body }).catch(() => null);
      }
    }

    this.saveMessages(savedMessages);
    return { success: true, restoredAt: previousVersion.savedAt };
  }

  // --- CONVERSOR DE IMAGEM PARA DATA URI (DISCORD REST API) ---
  async formatAvatarDataUri(input) {
    if (input === null || input === undefined) return undefined;
    const str = String(input).trim();
    if (str === '' || str === 'null' || str === 'reset') return null;
    if (str.startsWith('data:image/')) return str;
    if (str.startsWith('http://') || str.startsWith('https://')) {
      try {
        const res = await fetch(str);
        if (!res.ok) return null;
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mime = res.headers.get('content-type') || 'image/png';
        return `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (e) {
        console.warn('[MaryStudio] Falha ao converter imagem para Data URI:', e.message);
        return null;
      }
    }
    return null;
  }

  // --- ATUALIZAÇÃO DO PERFIL LOCAL DA PYXIE NO SERVIDOR DA MARY ---
  async updateLocalProfile(guildId, { nick, avatar, banner, bio, statusLoja }) {
    const config = this.loadConfig();
    const targetGuildId = guildId || config.guildId || MARY_DEFAULT_GUILD_ID;

    if (statusLoja) {
      config.statusLoja = statusLoja;
    }
    if (nick !== undefined) {
      config.localNick = String(nick || '').trim().slice(0, 32);
    }
    if (bio !== undefined) {
      config.localBio = String(bio || '').trim();
    }
    if (avatar !== undefined) {
      const cleanAvatar = String(avatar || '').trim();
      config.localAvatarUrl = (cleanAvatar === 'null' || cleanAvatar === 'reset') ? '' : cleanAvatar;
    }
    if (banner !== undefined) {
      const cleanBanner = String(banner || '').trim();
      config.localBannerUrl = (cleanBanner === 'null' || cleanBanner === 'reset') ? '' : cleanBanner;
    }

    if (this.client) {
      const guild = this.getGuild(targetGuildId);
      if (nick !== undefined && guild?.members?.me) {
        let finalNick = String(nick || '').trim().slice(0, 32);
        await guild.members.me.setNickname(finalNick || null).catch((e) => {
          console.warn('[MaryStudio] Não foi possível alterar nick local:', e.message);
        });
      }
    }

    const rest = this.client?.rest || this.getRestClient();
    if ((avatar !== undefined || banner !== undefined || bio !== undefined || nick !== undefined) && rest && targetGuildId) {
      try {
        const body = {};
        if (nick !== undefined) body.nick = String(nick || '').trim().slice(0, 32);
        if (avatar !== undefined) {
          body.avatar = await this.formatAvatarDataUri(avatar);
        }
        if (banner !== undefined) {
          body.banner = await this.formatAvatarDataUri(banner);
        }
        if (bio !== undefined) body.bio = bio;

        await rest.patch(`/guilds/${targetGuildId}/members/@me`, { body }).catch(async (err) => {
          // Se falhar devido a campos não suportados (ex: bio em bots), tenta novamente só com nick e avatar
          if (body.bio !== undefined || body.banner !== undefined) {
            const fallbackBody = {};
            if (body.nick !== undefined) fallbackBody.nick = body.nick;
            if (body.avatar !== undefined) fallbackBody.avatar = body.avatar;
            await rest.patch(`/guilds/${targetGuildId}/members/@me`, { body: fallbackBody }).catch((e2) => {
              console.warn('[MaryStudio] Aviso ao atualizar avatar/nick local via REST:', e2.message);
            });
          } else {
            console.warn('[MaryStudio] Aviso ao atualizar perfil local via REST:', err.message);
          }
        });
      } catch (err) {
        console.warn('[MaryStudio] Aviso ao atualizar perfil local via REST:', err.message);
      }
    }

    this.saveConfig(config);
    return {
      success: true,
      statusLoja: config.statusLoja,
      localNick: config.localNick,
      localBio: config.localBio,
      localAvatarUrl: config.localAvatarUrl,
      localBannerUrl: config.localBannerUrl,
    };
  }

  // --- ROTAS DO SERVIDOR WEB EXPRESS ---
  setupWebRoutes(app, ctx) {
    const publicDir = path.join(__dirname, 'public');

    // 1. Arquivos Estáticos Públicos
    app.use('/mary/assets', express.static(publicDir));
    app.use('/api/mary/media', express.static(UPLOADS_DIR));

    // 2. Tela de entrada ou tela de passagem do Link Mágico
    app.get('/mary/auth/magic', (req, res) => {
      const token = req.query.token;
      if (!token) {
        return res.redirect('/mary');
      }

      const ua = req.headers['user-agent'] || '';
      // Se for bot/crawler do Discord, não executa o consumo
      if (securityGuard.isCrawler(ua)) {
        return res.send(`<!DOCTYPE html><html><head><title>Mary Studio</title></head><body><h1>Mary Studio</h1></body></html>`);
      }

      // Renderiza página de passagem que consome via POST no navegador do usuário real
      return res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Acessando Estúdio da Mary...</title>
  <style>
    body { background: #141418; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; }
    .spinner { font-size: 40px; animation: spin 1s infinite linear; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner">🎀</div>
    <h2 style="margin-top: 16px;">Conectando ao seu Estúdio...</h2>
  </div>
  <script>
    (async () => {
      try {
        const res = await fetch('/api/mary/auth/consume-magic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: ${JSON.stringify(token)} })
        });
        const data = await res.json();
        if (data.success) {
          window.location.replace(data.redirectUrl || '/mary');
        } else {
          alert('Erro de acesso: ' + (data.error || 'Token inválido.'));
          window.location.replace('/mary');
        }
      } catch (e) {
        alert('Erro ao conectar ao servidor.');
        window.location.replace('/mary');
      }
    })();
  </script>
</body>
</html>`);
    });

    // 3. Rota principal /mary (SPA da Mary protegida por autenticação)
    app.get('/mary', securityGuard.rateLimiterMiddleware, (req, res) => {
      const sessionCookie = securityGuard.getCookie(req, 'mary_session');
      if (!sessionCookie || !securityGuard.isValidSession(sessionCookie)) {
        return securityGuard.requireMaryAuth(req, res, () => {});
      }

      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
      res.setHeader('X-Frame-Options', 'DENY');
      return res.sendFile(path.join(publicDir, 'index.html'));
    });

    // 4. API de Consumo do Token Mágico
    app.post('/api/mary/auth/consume-magic', securityGuard.rateLimiterMiddleware, (req, res) => {
      const { token } = req.body || {};
      const result = securityGuard.consumeMagicToken(token, req, this.client);
      if (!result.valid) {
        return res.status(401).json({ success: false, error: result.error });
      }

      // Seta Cookie seguro
      res.cookie('mary_session', result.sessionToken, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
        maxAge: securityGuard.SESSION_TTL_MS,
        path: '/',
      });

      let redirectUrl = '/mary';
      if (result.editMessageId) {
        redirectUrl += `?editMessageId=${encodeURIComponent(result.editMessageId)}&channelId=${encodeURIComponent(result.channelId || '')}`;
      }

      return res.json({ success: true, redirectUrl, sessionToken: result.sessionToken });
    });

    // 5. API Logout geral
    app.post('/api/mary/auth/logout-all', securityGuard.requireMaryAuth, securityGuard.csrfProtection, (req, res) => {
      securityGuard.revokeAllSessions();
      res.clearCookie('mary_session', { path: '/' });
      return res.json({ success: true, message: 'Todas as sessões foram desconectadas.' });
    });

    // 6. API Bootstrap (dados completos para alimentar a SPA)
    app.get('/api/mary/bootstrap', securityGuard.requireMaryAuth, async (req, res) => {
      const config = this.loadConfig();
      const targetGuildId = config.guildId || MARY_DEFAULT_GUILD_ID;
      let guild = this.getGuild(targetGuildId);

      const channels = [];
      const roles = [];
      let botProfile = { nick: '', avatarUrl: '', bannerUrl: '', localAvatarUrl: '', localBannerUrl: '' };
      let guildData = null;

      if (guild) {
        if (guild.channels?.cache?.size === 0 && typeof guild.channels?.fetch === 'function') {
          await guild.channels.fetch().catch(() => null);
        }
        if (guild.roles?.cache?.size <= 1 && typeof guild.roles?.fetch === 'function') {
          await guild.roles.fetch().catch(() => null);
        }

        guild.channels?.cache?.forEach((ch) => {
          if (ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement) {
            channels.push({
              id: ch.id,
              name: ch.name,
              parentId: ch.parentId,
              position: ch.rawPosition,
            });
          }
        });

        guild.roles?.cache?.forEach((r) => {
          if (r.id !== guild.id) {
            roles.push({
              id: r.id,
              name: r.name,
              color: r.hexColor,
              position: r.position,
            });
          }
        });

        guildData = {
          id: guild.id,
          name: guild.name,
          iconUrl: typeof guild.iconURL === 'function' ? guild.iconURL() : null,
        };

        botProfile = {
          nick: guild.members?.me?.nickname || config.localNick || '',
          avatarUrl: (guild.members?.me?.avatar ? guild.members.me.displayAvatarURL() : null) || config.localAvatarUrl || (typeof guild.members?.me?.displayAvatarURL === 'function' ? guild.members.me.displayAvatarURL() : ''),
          bio: config.localBio || '',
          localAvatarUrl: config.localAvatarUrl || '',
          bannerUrl: config.localBannerUrl || (typeof guild.members?.me?.bannerURL === 'function' ? guild.members.me.bannerURL() : '') || '',
          localBannerUrl: config.localBannerUrl || '',
        };
      } else {
        const rest = this.getRestClient();
        if (rest && targetGuildId) {
          try {
            const rawGuild = await rest.get(Routes.guild(targetGuildId)).catch(() => null);
            if (rawGuild) {
              guildData = {
                id: rawGuild.id,
                name: rawGuild.name,
                iconUrl: rawGuild.icon ? `https://cdn.discordapp.com/icons/${rawGuild.id}/${rawGuild.icon}.png` : null,
              };

              const rawChannels = await rest.get(Routes.guildChannels(targetGuildId)).catch(() => []);
              if (Array.isArray(rawChannels)) {
                rawChannels.forEach((ch) => {
                  if (ch.type === 0 || ch.type === 5) {
                    channels.push({
                      id: ch.id,
                      name: ch.name,
                      parentId: ch.parent_id,
                      position: ch.position,
                    });
                  }
                });
              }

              const rawRoles = await rest.get(Routes.guildRoles(targetGuildId)).catch(() => []);
              if (Array.isArray(rawRoles)) {
                rawRoles.forEach((r) => {
                  if (r.id !== targetGuildId) {
                    roles.push({
                      id: r.id,
                      name: r.name,
                      color: r.color ? `#${r.color.toString(16).padStart(6, '0')}` : '#99aab5',
                      position: r.position,
                    });
                  }
                });
              }

              const botMember = await rest.get(Routes.guildMember(targetGuildId, '@me')).catch(() => null);
              if (botMember) {
                botProfile = {
                  nick: botMember.nick || config.localNick || botMember.user?.username || '',
                  avatarUrl: botMember.avatar
                    ? `https://cdn.discordapp.com/guilds/${targetGuildId}/users/${botMember.user?.id}/avatars/${botMember.avatar}.png`
                    : (config.localAvatarUrl || (botMember.user?.avatar ? `https://cdn.discordapp.com/avatars/${botMember.user.id}/${botMember.user.avatar}.png` : '')),
                  bio: config.localBio || '',
                  localAvatarUrl: config.localAvatarUrl || '',
                  bannerUrl: botMember.banner
                    ? `https://cdn.discordapp.com/guilds/${targetGuildId}/users/${botMember.user?.id}/banners/${botMember.banner}.png`
                    : (config.localBannerUrl || ''),
                  localBannerUrl: config.localBannerUrl || '',
                };
              }
            }
          } catch (err) {
            console.warn('[MaryStudio] Aviso ao consultar Discord REST API no bootstrap:', err.message);
          }
        }
      }

      channels.sort((a, b) => a.position - b.position);
      roles.sort((a, b) => b.position - a.position);

      const savedMessages = this.loadMessages();
      const storeData = this.loadStoreData();
      const templates = templatesCatalog.getAllTemplates();
      const security = securityGuard.readSecurityData();

      const clientId = this.client?.user?.id || '1543650200718155897';
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

      return res.json({
        success: true,
        guild: guildData,
        targetGuildId,
        inviteUrl,
        channels,
        roles,
        botProfile,
        config,
        savedMessages: Object.values(savedMessages.messages || {}),
        storeData,
        templates,
        activeSessionsCount: Object.keys(security.sessions || {}).length,
        auditLogs: security.auditLogs || [],
      });
    });

    // 7. API Upload Seguro de Imagem
    app.post('/api/mary/upload', securityGuard.requireMaryAuth, securityGuard.csrfProtection, (req, res) => {
      try {
        const { fileName, fileBase64 } = req.body || {};
        if (!fileBase64) {
          return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        }

        const matches = fileBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let buffer;
        let mime = 'image/png';
        if (matches && matches.length === 3) {
          mime = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(fileBase64, 'base64');
        }

        // Validação de tamanho (máx 10 MB)
        if (buffer.length > 10 * 1024 * 1024) {
          return res.status(400).json({ error: 'Imagem muito grande (máximo 10 MB).' });
        }

        // Validação de Magic Bytes (PNG, JPEG, WebP, GIF)
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
        const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
        const isWebp = buffer.slice(8, 12).toString('ascii') === 'WEBP';

        if (!isPng && !isJpg && !isGif && !isWebp) {
          return res.status(400).json({ error: 'Formato inválido. Apenas imagens PNG, JPG, GIF ou WebP reais são permitidas.' });
        }

        let ext = 'png';
        if (isJpg) ext = 'jpg';
        if (isGif) ext = 'gif';
        if (isWebp) ext = 'webp';

        const safeName = `mary_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const savePath = path.join(UPLOADS_DIR, safeName);
        fs.writeFileSync(savePath, buffer);

        const baseUrl = (process.env.PUBLIC_BASE_URL || process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
        const url = `${baseUrl}/api/mary/media/${safeName}`;

        return res.json({ success: true, url, fileName: safeName });
      } catch (err) {
        return res.status(500).json({ error: 'Falha ao processar upload: ' + err.message });
      }
    });

    // 8. API Enviar Mensagem/Embed
    app.post('/api/mary/messages/send', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        const { channelId, messageData } = req.body || {};
        if (!channelId || !messageData) {
          return res.status(400).json({ error: 'channelId e messageData são obrigatórios.' });
        }
        const result = await this.sendMessage(channelId, messageData);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 9. API Editar Mensagem
    app.put('/api/mary/messages/:recordId', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        const { recordId } = req.params;
        const { messageData } = req.body || {};
        if (!messageData) {
          return res.status(400).json({ error: 'messageData é obrigatório.' });
        }
        const result = await this.editMessage(recordId, messageData);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 10. API Desfazer Edição (Undo)
    app.post('/api/mary/messages/:recordId/undo', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        const { recordId } = req.params;
        const result = await this.undoMessage(recordId);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 11. API Importar Histórico de Canal
    app.get('/api/mary/channels/:channelId/history', securityGuard.requireMaryAuth, async (req, res) => {
      try {
        const channelId = req.params.channelId;
        const botMessages = [];

        if (this.client) {
          const channel = await this.client.channels.fetch(channelId).catch(() => null);
          if (!channel || typeof channel.messages?.fetch !== 'function') {
            return res.status(404).json({ error: 'Canal não encontrado.' });
          }

          const messages = await channel.messages.fetch({ limit: 30 });
          messages.forEach((msg) => {
            if (msg.author.id === this.client.user?.id) {
              botMessages.push({
                messageId: msg.id,
                channelId: channel.id,
                content: msg.content,
                embeds: msg.embeds,
                createdAt: msg.createdTimestamp,
              });
            }
          });
        } else {
          const rest = this.getRestClient();
          if (!rest) return res.status(500).json({ error: 'Cliente Discord offline.' });
          const messages = await rest.get(Routes.channelMessages(channelId), {
            query: new URLSearchParams({ limit: '30' }),
          }).catch(() => []);
          const clientId = '1543650200718155897';
          if (Array.isArray(messages)) {
            messages.forEach((msg) => {
              if (msg.author?.id === clientId) {
                botMessages.push({
                  messageId: msg.id,
                  channelId,
                  content: msg.content,
                  embeds: msg.embeds,
                  createdAt: new Date(msg.timestamp).getTime(),
                });
              }
            });
          }
        }

        return res.json({ success: true, messages: botMessages });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 12. API Atualizar Perfil Local
    app.patch('/api/mary/bot-profile', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        const { guildId, nick, avatar, banner, bio, statusLoja } = req.body || {};
        const result = await this.updateLocalProfile(guildId, { nick, avatar, banner, bio, statusLoja });
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 13. API Atualizar Configurações & Módulos Opcionais
    app.patch('/api/mary/settings', securityGuard.requireMaryAuth, securityGuard.csrfProtection, (req, res) => {
      const current = this.loadConfig();
      const updates = req.body || {};

      const merged = {
        ...current,
        ...updates,
        featureFlags: {
          ...current.featureFlags,
          ...(updates.featureFlags || {}),
        },
      };

      this.saveConfig(merged);
      return res.json({ success: true, config: merged });
    });

    // 14. API Sorteio Opcional
    app.post('/api/mary/giveaways/create', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        if (!this.giveawayHandler) return res.status(501).json({ error: 'Módulo de sorteios desativado.' });
        const result = await this.giveawayHandler.createGiveaway(req.body);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 15. API Inspetor de Gamepass Roblox
    app.get('/api/mary/roblox/gamepass', securityGuard.requireMaryAuth, async (req, res) => {
      try {
        const input = req.query.input || req.query.id;
        if (!input) return res.status(400).json({ error: 'Informe a URL ou o ID da Gamepass.' });
        const result = await robloxHelper.fetchRobloxGamepass(input);
        if (!result.success) return res.status(404).json(result);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 16. API Inspetor de Jogador Roblox
    app.get('/api/mary/roblox/user', securityGuard.requireMaryAuth, async (req, res) => {
      try {
        const username = req.query.username || req.query.nick;
        if (!username) return res.status(400).json({ error: 'Informe o nick do jogador no Roblox.' });
        const result = await robloxHelper.fetchRobloxUser(username);
        if (!result.success) return res.status(404).json(result);
        return res.json(result);
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 17. API Calculadora Robux & Cotação
    app.post('/api/mary/roblox/calc', securityGuard.requireMaryAuth, (req, res) => {
      const { robux, brl, ratePer1k } = req.body || {};
      const cfg = this.loadConfig();
      const currentRate = Number(ratePer1k) || Number(cfg.preco1k) || 37.0;

      let result = {};
      if (robux !== undefined) {
        const numRobux = Number(robux) || 0;
        const grossGamepass = robloxHelper.calcRobuxGamepass(numRobux);
        const priceBrl = robloxHelper.calcPriceBRL(numRobux, currentRate);
        result = {
          mode: 'from_robux',
          robuxReceive: numRobux,
          grossGamepass,
          priceBrl,
          currentRate,
          formattedMessage: `💰 **Cotação Mary Store**\n• Robux desejados: **${numRobux.toLocaleString('pt-BR')} R$**\n• Valor da Gamepass (com taxa de 30%): **${grossGamepass.toLocaleString('pt-BR')} R$**\n• Valor a pagar: **R$ ${priceBrl.toFixed(2).replace('.', ',')}**\n⚠️ *Lembre-se de desativar os Preços Regionais na Gamepass!*`,
        };
      } else if (brl !== undefined) {
        const numBrl = Number(brl) || 0;
        const possibleRobux = robloxHelper.calcReverseRobux(numBrl, currentRate);
        const grossGamepass = robloxHelper.calcRobuxGamepass(possibleRobux);
        result = {
          mode: 'from_brl',
          brlAmount: numBrl,
          robuxReceive: possibleRobux,
          grossGamepass,
          currentRate,
          formattedMessage: `💰 **Cotação Mary Store**\n• Com **R$ ${numBrl.toFixed(2).replace('.', ',')}**, você recebe **${possibleRobux.toLocaleString('pt-BR')} Robux**.\n• Crie sua Gamepass por **${grossGamepass.toLocaleString('pt-BR')} Robux**.\n⚠️ *Lembre-se de desativar os Preços Regionais na Gamepass!*`,
        };
      } else {
        return res.status(400).json({ error: 'Informe robux ou brl.' });
      }

      return res.json({ success: true, ...result });
    });

    // 18. API Enviar Comprovante de Entrega (Vouch)
    app.post('/api/mary/receipt/send', securityGuard.requireMaryAuth, securityGuard.csrfProtection, async (req, res) => {
      try {
        const { channelId, clientNick, clientRobux, clientPrice, proofImageUrl, notes } = req.body || {};
        if (!channelId || !clientNick || !clientRobux) {
          return res.status(400).json({ error: 'Canal, nick do cliente e quantidade de Robux são obrigatórios.' });
        }

        const config = this.loadConfig();
        const numRobux = Number(clientRobux) || 0;
        const numPrice = Number(clientPrice) || robloxHelper.calcPriceBRL(numRobux, config.preco1k);

        const embedData = {
          title: '🎀・Entrega Concluída com Sucesso!',
          description: `Mais uma encomenda de Robux finalizada com total segurança e agilidade na **Mary Store**!\n\n` +
            `👤 **Cliente:** \`${clientNick}\`\n` +
            `💎 **Quantidade:** **${numRobux.toLocaleString('pt-BR')} Robux**\n` +
            `💰 **Valor:** **R$ ${numPrice.toFixed(2).replace('.', ',')}**\n` +
            `⏳ **Status:** **✅ Comprado (Pendentes por 5 dias)**\n` +
            (notes ? `📝 **Obs:** ${notes}\n\n` : '\n') +
            `💖 *Obrigada pela confiança! Deixe sua avaliação abaixo para fortalecer a lojinha.*`,
          color: '#10b981',
          imageUrl: proofImageUrl || '',
          footerText: 'Mary Store • Entregas Oficiais & Comprovantes',
        };

        const buttons = [
          {
            id: 'btn_vouch_review',
            label: 'Avaliar Atendimento',
            emoji: '⭐',
            style: 'Success',
            actionType: 'open_review',
          },
        ];

        const result = await this.sendMessage(channelId, {
          content: `🎉 Parabéns pela compra, **${clientNick}**!`,
          embed: embedData,
          buttons,
        });

        return res.json({ success: true, result });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });

    // 19. API Gerenciar Respostas Rápidas (Macros)
    app.post('/api/mary/macros', securityGuard.requireMaryAuth, securityGuard.csrfProtection, (req, res) => {
      const { macros } = req.body || {};
      if (!Array.isArray(macros)) {
        return res.status(400).json({ error: 'A lista de macros deve ser um array.' });
      }

      const config = this.loadConfig();
      config.macros = macros;
      this.saveConfig(config);
      return res.json({ success: true, macros: config.macros });
    });
  }
}

const instance = new MaryStudioManager();
module.exports = instance;

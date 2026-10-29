const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  REST,
} = require('discord.js');

const securityGuard = require('./utils/securityGuard');

const DATA_DIR = process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads', 'mary');
const CONFIG_FILE = path.join(DATA_DIR, 'maryStudioConfig.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'marySavedMessages.json');
const STORE_FILE = path.join(DATA_DIR, 'maryStoreData.json');
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const { MARY_GUILD_ID: MARY_DEFAULT_GUILD_ID } = require('../../config/scopes');

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
  // Também usadas pelo estúdio do painel (messageStudio.guildVars) nas mensagens do servidor da Mary.
  getVariables(config = null) {
    const cfg = config || this.loadConfig();
    const store = this.loadStoreData();

    let statusStr = '🟢 Online (Entrega Rápida)';
    if (cfg.statusLoja === 'fila') statusStr = '🟡 Atendimento em Fila';
    if (cfg.statusLoja === 'offline') statusStr = '🔴 Lojinha Fechada';

    const reviews = Array.isArray(store.reviews) ? store.reviews : [];
    let avgScore = '5.0';
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.stars) || 5), 0);
      avgScore = (sum / reviews.length).toFixed(1);
    }

    const bio = cfg.localBio || 'Mary Store • Robux Oficial';
    return {
      estoque: (Number(cfg.estoqueRobux) || 0).toLocaleString('pt-BR') + ' R$',
      preco_1k: 'R$ ' + (Number(cfg.preco1k) || 37.0).toFixed(2).replace('.', ','),
      status_loja: statusStr,
      total_avaliacoes: String(reviews.length),
      nota_media: `${avgScore} ⭐`,
      pix_key: cfg.pixKey || 'Chave PIX não informada',
      pix_name: cfg.pixName || 'MARY STORE',
      bio,
      descricao: bio,
    };
  }

  resolveVariables(text, config = null) {
    if (!text || typeof text !== 'string') return '';
    const vars = this.getVariables(config);
    return text.replace(/\{([a-z0-9_]+)\}/gi, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k.toLowerCase()) ? vars[k.toLowerCase()] : m));
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

  // --- CONVERSOR DE IMAGEM PARA DATA URI (DISCORD REST API) ---
  async formatAvatarDataUri(input) {
    if (input === null || input === undefined) return undefined;
    const str = String(input).trim();
    if (str === '' || str === 'null' || str === 'reset') return null;
    if (str.startsWith('data:image/')) return str;
    // Imagem enviada pelo painel: lê do disco em vez de baixar do próprio site.
    const local = str.match(/\/api\/mary\/media\/(mary_[a-z0-9_]+\.(png|jpg|gif|webp))$/i);
    if (local) {
      try {
        const buffer = fs.readFileSync(path.join(UPLOADS_DIR, local[1]));
        const mime = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }[local[2].toLowerCase()];
        return `data:${mime};base64,${buffer.toString('base64')}`;
      } catch (_) {
        return null;
      }
    }
    if (str.startsWith('https://')) {
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

  // --- MÍDIA ---
  // As telas da Mary estão no /dashboard (src/routes/dashboardRoutes.js). Aqui fica só a pasta de imagens,
  // porque mensagens já postadas no Discord apontam para /api/mary/media/<arquivo>.
  setupWebRoutes(app) {
    app.use('/api/mary/media', express.static(UPLOADS_DIR, { fallthrough: false, index: false }));
    // Endereços do estúdio antigo (favoritos, links mágicos velhos) caem na lojinha dentro do painel.
    app.get(['/mary', '/mary/auth/magic'], (req, res) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      return res.redirect(302, `/dashboard#/guild/${MARY_DEFAULT_GUILD_ID}/maryStore`);
    });
  }

  // Guarda uma imagem enviada pelo painel (PNG, JPG, GIF ou WebP de verdade, até 8 MB). Devolve a URL pública.
  saveUpload(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return { ok: false, error: 'empty_file' };
    if (buffer.length > MAX_UPLOAD_BYTES) return { ok: false, error: 'file_too_large' };
    const ext = imageExtension(buffer);
    if (!ext) return { ok: false, error: 'invalid_image' };
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const fileName = `mary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const tmp = path.join(UPLOADS_DIR, `${fileName}.tmp`);
    fs.writeFileSync(tmp, buffer);
    fs.renameSync(tmp, path.join(UPLOADS_DIR, fileName));
    const baseUrl = (process.env.PUBLIC_BASE_URL || process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br').replace(/\/+$/, '');
    return { ok: true, url: `${baseUrl}/api/mary/media/${fileName}`, fileName };
  }
}

function imageExtension(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'gif';
  if (buffer.length > 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}

const instance = new MaryStudioManager();
module.exports = instance;

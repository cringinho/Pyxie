const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const { restGet } = require('../../utils/discordRest');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'museumConfig.json');
const DATA_PATH = path.join(process.cwd(), 'data', 'museumData.json');

const URL_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // tokens ?ex= do CDN duram ~24h; renovamos bem antes
const AUTHOR_CACHE_TTL_MS = 60 * 60 * 1000;
const PAGE_LIMIT_MAX = 48;

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

class MuseumManager {
  constructor() {
    this.client = null;
    this.config = { artChannelId: '', adminRoleIds: [] };
    this.data = { arts: [] };
    this.urlCache = new Map(); // artId -> { url, at }
    this.authorCache = new Map(); // userId -> { name, at }
    this.watermarkCache = new Map(); // artId -> { buffer, contentType, at }
  }

  init(client, ctx) {
    this.client = client || null;
    this.refresh();
    // Listener rastreado pelo ModuleManager: removido automaticamente no onUnload (Zero Memory Leak)
    if (client && ctx && typeof ctx.registerListener === 'function') {
      ctx.registerListener('messageCreate', (msg) => this.handleMessage(msg));
    }
    // Cron diário para raspagem histórica suave às 04:00 BRT
    if (client && ctx && typeof ctx.registerCron === 'function') {
      ctx.registerCron('0 4 * * *', () => {
        this.harvestBatch(50).catch((err) => {
          console.error('[Museum:Harvester] Erro na raspagem diária:', err);
        });
      }, { timezone: 'America/Sao_Paulo' });
      console.log('[Museum:Harvester] Cron diário de raspagem (04:00 BRT) agendado com sucesso.');
    }
  }

  stop() {
    this.urlCache.clear();
    this.authorCache.clear();
    this.watermarkCache.clear();
  }

  /** Bot e web são processos distintos: sempre relê o disco antes de operar. */
  refresh() {
    this.config = { artChannelId: '', adminRoleIds: [], ...readJson(CONFIG_PATH, {}) };
    const data = readJson(DATA_PATH, null);
    if (data && Array.isArray(data.arts)) {
      this.data = data;
      if (!this.data.harvester) {
        this.data.harvester = {
          oldestScrapedMessageId: null,
          completed: false,
          lastRunAt: null,
          totalScraped: 0,
        };
      }
    } else {
      this.data = {
        arts: [],
        harvester: {
          oldestScrapedMessageId: null,
          completed: false,
          lastRunAt: null,
          totalScraped: 0,
        },
      };
      writeJsonAtomic(DATA_PATH, this.data);
    }
  }

  saveData() {
    return writeJsonAtomic(DATA_PATH, this.data);
  }

  /**
   * Raspa um lote suave de mensagens antigas do canal de artes (Backfill Histórico)
   */
  async harvestBatch(limit = 50) {
    this.refresh();
    const artChannelId = this.config.artChannelId;
    if (!artChannelId) {
      return { success: false, error: 'Canal de artes não configurado.' };
    }

    if (!this.client) {
      return { success: false, error: 'Bot do Discord não está conectado para buscar o histórico.' };
    }

    const channel = await this.client.channels.fetch(artChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return { success: false, error: 'Canal de artes não encontrado ou não é canal de texto.' };
    }

    if (!this.data.harvester) {
      this.data.harvester = {
        oldestScrapedMessageId: null,
        completed: false,
        lastRunAt: null,
        totalScraped: 0,
      };
    }

    const harvester = this.data.harvester;
    if (harvester.completed) {
      return {
        success: true,
        message: 'Histórico do canal já foi 100% catalogado.',
        added: 0,
        completed: true,
        totalArts: this.data.arts.length,
      };
    }

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const fetchOptions = { limit: safeLimit };
    if (harvester.oldestScrapedMessageId) {
      fetchOptions.before = harvester.oldestScrapedMessageId;
    }

    let fetchedMessages;
    try {
      fetchedMessages = await channel.messages.fetch(fetchOptions);
    } catch (err) {
      console.error('[Museum:Harvester] Falha ao buscar mensagens:', err);
      return { success: false, error: `Erro na API do Discord: ${err.message}` };
    }

    if (!fetchedMessages || fetchedMessages.size === 0) {
      harvester.completed = true;
      harvester.lastRunAt = Date.now();
      this.saveData();
      return {
        success: true,
        message: 'Início do canal alcançado! Histórico 100% catalogado.',
        added: 0,
        completed: true,
        totalArts: this.data.arts.length,
      };
    }

    // Set para deduplicação O(1) de mensagens já catalogadas
    const existingMessageIds = new Set(this.data.arts.map((a) => a.messageId));
    let addedCount = 0;
    let oldestInBatch = null;

    for (const msg of fetchedMessages.values()) {
      oldestInBatch = msg.id;

      if (msg.author?.bot) continue;
      if (existingMessageIds.has(msg.id)) continue;

      const img = msg.attachments.find((att) => att.contentType?.startsWith('image/'));
      if (!img) continue;

      this.data.arts.push({
        id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        messageId: msg.id,
        channelId: msg.channelId,
        userId: msg.author.id,
        authorUsername: msg.author?.username || null,
        cachedAuthor: msg.member?.displayName || msg.author.username,
        originalAttachmentUrl: img.url,
        description: (msg.content || '').trim().slice(0, 1000),
        createdAt: msg.createdTimestamp || Date.now(),
      });
      existingMessageIds.add(msg.id);
      addedCount++;
    }

    // Mantém a galeria ordenada do mais recente para o mais antigo
    this.data.arts.sort((a, b) => b.createdAt - a.createdAt);

    harvester.oldestScrapedMessageId = oldestInBatch;
    harvester.lastRunAt = Date.now();
    harvester.totalScraped = (harvester.totalScraped || 0) + addedCount;

    if (fetchedMessages.size < safeLimit) {
      harvester.completed = true;
    }

    this.saveData();
    console.log(`[Museum:Harvester] Lote concluído: ${addedCount} arte(s) nova(s). Mais antiga: ${oldestInBatch}`);
    return {
      success: true,
      added: addedCount,
      completed: harvester.completed,
      totalArts: this.data.arts.length,
      message: harvester.completed
        ? `Lote concluído: +${addedCount} arte(s). Início do canal alcançado!`
        : `Lote concluído: +${addedCount} arte(s) adicionada(s) do histórico!`,
    };
  }

  getHarvesterStatus() {
    this.refresh();
    const h = this.data.harvester || {};
    return {
      completed: Boolean(h.completed),
      lastRunAt: h.lastRunAt || null,
      totalScraped: h.totalScraped || 0,
      totalArts: this.data.arts.length,
      oldestScrapedMessageId: h.oldestScrapedMessageId || null,
    };
  }

  getConfig() {
    this.refresh();
    return {
      artChannelId: this.config.artChannelId || '',
      adminRoleIds: Array.isArray(this.config.adminRoleIds) ? [...this.config.adminRoleIds] : [],
    };
  }

  saveConfig(updates = {}) {
    this.refresh();
    const artChannelId = String(updates.artChannelId !== undefined ? updates.artChannelId : this.config.artChannelId || '').trim();
    let adminRoleIds = this.config.adminRoleIds || [];
    if (updates.adminRoleIds !== undefined) {
      adminRoleIds = Array.isArray(updates.adminRoleIds)
        ? updates.adminRoleIds.map((r) => String(r).trim()).filter(Boolean)
        : String(updates.adminRoleIds || '').split(',').map((r) => r.trim()).filter(Boolean);
    }
    this.config = { artChannelId, adminRoleIds };
    writeJsonAtomic(CONFIG_PATH, this.config);
    return this.config;
  }

  async handleMessage(message) {
    try {
      if (message.author?.bot) return;
      this.refresh();
      if (!this.config.artChannelId || message.channel?.id !== this.config.artChannelId) return;

      const img = message.attachments.find((att) => att.contentType?.startsWith('image/'));
      if (!img) return;

      this.data.arts.unshift({
        id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        messageId: message.id,
        channelId: message.channel.id,
        userId: message.author.id,
        authorUsername: message.author?.username || null,
        cachedAuthor: message.member?.displayName || message.author.username,
        originalAttachmentUrl: img.url,
        description: (message.content || '').trim().slice(0, 1000),
        createdAt: Date.now(),
      });
      this.saveData();
    } catch (err) {
      console.error('[Museum] Erro ao registrar arte:', err);
    }
  }

  // ---- Resolução dinâmica (bot: Client; web: REST) ----

  async resolveAuthor(userId, fallback) {
    const cached = this.authorCache.get(userId);
    if (cached && Date.now() - cached.at < AUTHOR_CACHE_TTL_MS) {
      if (cached.data && typeof cached.data === 'object') return cached.data;
      if (typeof cached.name === 'string') return { name: cached.name, username: cached.username || cached.name };
    }

    let displayName = null;
    let username = null;
    try {
      if (this.client) {
        const user = await this.client.users.fetch(userId);
        displayName = user?.displayName || user?.globalName || user?.username || null;
        username = user?.username || null;
      } else {
        const user = await restGet(`/users/${userId}`);
        displayName = user?.global_name || user?.username || null;
        username = user?.username || null;
      }
    } catch {
      displayName = null;
      username = null;
    }
    const cleanFallback = fallback || 'Artista';
    const resolved = {
      name: displayName || cleanFallback,
      username: username || displayName || cleanFallback,
    };
    if (this.authorCache.size >= 2000) {
      const firstKey = this.authorCache.keys().next().value;
      if (firstKey) this.authorCache.delete(firstKey);
    }
    this.authorCache.set(userId, { data: resolved, name: resolved.name, username: resolved.username, at: Date.now() });
    return resolved;
  }

  /** Renova o anexo via API do Discord (token temporário do CDN). Mantém a URL antiga se a mensagem sumiu. */
  async resolveImageUrl(art) {
    const cached = this.urlCache.get(art.id);
    if (cached && Date.now() - cached.at < URL_CACHE_TTL_MS) return cached.url;

    let url = art.originalAttachmentUrl;
    try {
      let attachments = null;
      if (this.client) {
        const channel = await this.client.channels.fetch(art.channelId);
        const msg = channel ? await channel.messages.fetch(art.messageId) : null;
        attachments = msg ? [...msg.attachments.values()].map((a) => ({ url: a.url, type: a.contentType })) : null;
      } else {
        const msg = await restGet(`/channels/${art.channelId}/messages/${art.messageId}`);
        attachments = msg?.attachments?.map((a) => ({ url: a.url, type: a.content_type })) || null;
      }
      const fresh = attachments?.find((a) => a.type?.startsWith('image/'));
      if (fresh) url = fresh.url;
    } catch {
      // mantém URL original
    }
    if (this.urlCache.size >= 2000) {
      const firstKey = this.urlCache.keys().next().value;
      if (firstKey) this.urlCache.delete(firstKey);
    }
    this.urlCache.set(art.id, { url, at: Date.now() });
    return url;
  }

  /**
   * Honeypot de Marca d'Água: Carimba a assinatura indelével do ecossistema
   * "✦ Pyxie • Galeria Oficial da Comunidade • https://pyxie.com.br/"
   * em tempo de execução via Sharp antes de servir a imagem.
   */
  async getWatermarkedImage(art) {
    if (!art) return null;
    const cached = this.watermarkCache.get(art.id);
    if (cached && Date.now() - cached.at < 30 * 60 * 1000) {
      return cached;
    }

    try {
      const url = await this.resolveImageUrl(art);
      if (!url) return null;

      let inputBuffer = null;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PyxieBot/1.0',
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return { redirectUrl: url };
        const arrayBuffer = await response.arrayBuffer();
        inputBuffer = Buffer.from(arrayBuffer);
      } else if (url.startsWith('/')) {
        let localPath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
        if (!fs.existsSync(localPath)) {
          localPath = path.join(__dirname, '../../../public', url.replace(/^\//, ''));
        }
        if (fs.existsSync(localPath)) {
          inputBuffer = fs.readFileSync(localPath);
        } else {
          return null;
        }
      } else {
        return { redirectUrl: url };
      }

      if (!inputBuffer || inputBuffer.length === 0) {
        return { redirectUrl: url };
      }

      const metadata = await sharp(inputBuffer).metadata();

      // GIFs animados: preserva sem achatar frames
      if (metadata.format === 'gif' && metadata.pages && metadata.pages > 1) {
        return { redirectUrl: url };
      }

      const width = metadata.width || 800;
      const height = metadata.height || 800;
      const bannerHeight = Math.max(36, Math.min(84, Math.round(height * 0.08)));
      const fontSize = Math.max(12, Math.min(22, Math.round(bannerHeight * 0.35)));
      const strokeWidth = Math.max(1, Math.round(bannerHeight * 0.04));
      const text = '✦ Pyxie • Galeria Oficial da Comunidade • https://pyxie.com.br/';

      const svgString = `
        <svg width="${width}" height="${bannerHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#0e071a" stop-opacity="0.94" />
              <stop offset="50%" stop-color="#1f0a2d" stop-opacity="0.90" />
              <stop offset="100%" stop-color="#0e071a" stop-opacity="0.94" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${width}" height="${bannerHeight}" fill="url(#bg)" />
          <line x1="0" y1="0" x2="${width}" y2="0" stroke="#e60067" stroke-width="${strokeWidth}" stroke-opacity="0.9" />
          <text x="${width / 2}" y="${Math.floor(bannerHeight / 2) + Math.round(fontSize * 0.35)}" font-family="DejaVu Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
            ${text}
          </text>
        </svg>
      `;

      const watermarked = await sharp(inputBuffer)
        .composite([{ input: Buffer.from(svgString), top: height - bannerHeight, left: 0 }])
        .webp({ quality: 88 })
        .toBuffer();

      if (this.watermarkCache.size >= 300) {
        const firstKey = this.watermarkCache.keys().next().value;
        if (firstKey) this.watermarkCache.delete(firstKey);
      }

      const result = {
        buffer: watermarked,
        contentType: 'image/webp',
        at: Date.now(),
      };
      this.watermarkCache.set(art.id, result);
      return result;
    } catch (err) {
      console.warn(`[Museum] Erro ao carimbar imagem da arte ${art.id}:`, err.message);
      return null;
    }
  }

  async getArtPage({ userId = null, page = 1, limit = 24 } = {}) {
    this.refresh();
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 24, 1), PAGE_LIMIT_MAX);
    const list = userId ? this.data.arts.filter((a) => a.userId === userId) : this.data.arts;
    const totalPages = Math.max(1, Math.ceil(list.length / safeLimit));
    const safePage = Math.min(Math.max(parseInt(page, 10) || 1, 1), totalPages);
    const slice = list.slice((safePage - 1) * safeLimit, safePage * safeLimit);

    const arts = await Promise.all(
      slice.map(async (art) => {
        const resolved = await this.resolveAuthor(art.userId, art.cachedAuthor);
        const authorName = (resolved && typeof resolved === 'object') ? resolved.name : (resolved || art.cachedAuthor || 'Artista');
        const authorUsername = (resolved && typeof resolved === 'object') ? resolved.username : (art.authorUsername || art.cachedAuthor || 'Artista');
        return {
          id: art.id,
          userId: art.userId,
          author: authorName,
          authorName: authorName,
          authorUsername: authorUsername,
          description: art.description,
          createdAt: art.createdAt,
          // Imagem sempre passa pela rota que renova o token do CDN
          imageUrl: `/api/museum/art-image/${encodeURIComponent(art.id)}`,
        };
      })
    );
    return { arts, page: safePage, totalPages, total: list.length };
  }

  getCount() {
    this.refresh();
    return this.data.arts.length;
  }

  editDescription(artId, newDesc) {
    this.refresh();
    const art = this.data.arts.find((a) => a.id === artId);
    if (!art) return false;
    art.description = String(newDesc || '').slice(0, 1000);
    this.saveData();
    return true;
  }

  deleteArt(artId) {
    this.refresh();
    const prev = this.data.arts.length;
    this.data.arts = this.data.arts.filter((a) => a.id !== artId);
    if (this.data.arts.length === prev) return false;
    this.urlCache.delete(artId);
    this.watermarkCache.delete(artId);
    this.saveData();
    return true;
  }

  setupWebRoutes(app, ctx) {
    if (ctx && typeof ctx.sendIpc === 'function') {
      this.sendIpc = ctx.sendIpc;
    }
    const requireToken = (req, res, next) => {
      const secret = process.env.API_SECRET_TOKEN || process.env.PANEL_SECRET;
      const token = req.headers['x-admin-token'];
      if (!secret || !token || !safeEqual(token, secret)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      next();
    };

    app.get(['/museu', '/museum'], (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'museum.html'));
    });

    app.get('/api/museum/arts', async (req, res) => {
      try {
        const { user, page, limit } = req.query;
        const result = await this.getArtPage({
          userId: /^\d{15,25}$/.test(String(user || '')) ? String(user) : null,
          page,
          limit,
        });
        res.json({ success: true, ...result });
      } catch (err) {
        console.error('[Museum] /api/museum/arts:', err);
        res.status(500).json({ success: false });
      }
    });

    app.get('/api/museum/art-image/:id', async (req, res) => {
      this.refresh();
      const art = this.data.arts.find((a) => a.id === req.params.id);
      if (!art) return res.status(404).end();

      const result = await this.getWatermarkedImage(art);
      if (result && result.buffer) {
        res.set({
          'Content-Type': result.contentType,
          'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
          'X-Content-Source': 'Pyxie Community Gallery (https://pyxie.com.br/)',
        });
        return res.send(result.buffer);
      }

      if (result && result.redirectUrl) {
        res.set('Cache-Control', 'public, max-age=900');
        return res.redirect(302, result.redirectUrl);
      }

      const fallbackUrl = await this.resolveImageUrl(art);
      res.set('Cache-Control', 'public, max-age=900');
      res.redirect(302, fallbackUrl);
    });

    app.patch('/api/museum/art/:id', requireToken, (req, res) => {
      res.json({ success: this.editDescription(req.params.id, req.body?.description) });
    });

    app.delete('/api/museum/art/:id', requireToken, (req, res) => {
      res.json({ success: this.deleteArt(req.params.id) });
    });

    const { requireAdminAuth } = require('../../services/adminAuth');

    app.get('/api/admin/modules/museum/config', requireAdminAuth, (req, res) => {
      try {
        res.json({ success: true, config: this.getConfig(), harvester: this.getHarvesterStatus() });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    app.post('/api/admin/modules/museum/config', requireAdminAuth, (req, res) => {
      try {
        const saved = this.saveConfig(req.body || {});
        res.json({ success: true, config: saved, harvester: this.getHarvesterStatus(), message: 'Configurações do museu salvas com sucesso!' });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    app.get('/api/admin/modules/museum/harvester/status', requireAdminAuth, (req, res) => {
      try {
        res.json({ success: true, harvester: this.getHarvesterStatus() });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    app.post('/api/admin/modules/museum/harvester/trigger', requireAdminAuth, async (req, res) => {
      try {
        const count = parseInt(req.body?.limit, 10) || 50;
        if (!this.client) {
          // No processo do supervisor web, encaminha para o bot via IPC
          if (this.sendIpc) {
            this.sendIpc({ type: 'MUSEUM_HARVEST_TRIGGER', limit: count });
            return res.json({ success: true, message: `Disparo de raspagem (+${count} mensagens) enviado para o bot via IPC!` });
          }
        }
        const result = await this.harvestBatch(count);
        res.json(result);
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });
  }
}

module.exports = new MuseumManager();


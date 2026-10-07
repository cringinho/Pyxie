const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const path = require('path');
const { CATEGORY_SCHEMAS, pick } = require('./formSchemas');
const { getLanguage, t } = require('../../utils/i18n');
const { readJson, writeJsonAtomic, isHttpUrl } = require('../../utils/atomicJson');
const { restPost } = require('../../utils/discordRest');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'partnershipsConfig.json');
const DATA_PATH = path.join(process.cwd(), 'data', 'partnershipsData.json');

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h por projeto
const SESSION_TTL_MS = 30 * 60 * 1000;
const BUMP_RATE_WINDOW_MS = 15 * 60 * 1000;
const BUMP_RATE_MAX = 10;
const EPHEMERAL = MessageFlags.Ephemeral;

const DEFAULT_CONFIG = {
  channels: { welcomeChannelId: '', requestChannelId: '', modReviewChannelId: '', publishedChannelId: '', radarChannelId: '' },
  roles: { screeningRoleId: '', adminRoleIds: [] },
};

const trunc = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 3)}...` : String(s));

class PartnershipManager {
  constructor() {
    this.client = null;
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.data = { activeSessions: {}, pendingRequests: [], approvedPartners: [] };
    this.bumpHits = new Map(); // ip -> [timestamps]
  }

  init(client, ctx) {
    this.client = client || null;
    this.refresh();
    // Listener rastreado pelo ModuleManager (descartado no onUnload). Arquitetura stateless: sem collectors.
    if (client && ctx && typeof ctx.registerListener === 'function') {
      ctx.registerListener('interactionCreate', (i) => this.handleInteraction(i));
    }
  }

  /** Bot e web compartilham os arquivos: sempre relê o disco antes de operar. */
  refresh() {
    const cfg = readJson(CONFIG_PATH, {});
    this.config = {
      channels: { ...DEFAULT_CONFIG.channels, ...(cfg.channels || {}) },
      roles: { ...DEFAULT_CONFIG.roles, ...(cfg.roles || {}) },
    };
    const data = readJson(DATA_PATH, null);
    if (data) {
      this.data = {
        activeSessions: data.activeSessions || {},
        pendingRequests: data.pendingRequests || [],
        approvedPartners: data.approvedPartners || [],
      };
    } else {
      this.data = { activeSessions: {}, pendingRequests: [], approvedPartners: [] };
      this.saveData();
    }
    const cutoff = Date.now() - SESSION_TTL_MS;
    for (const [uid, s] of Object.entries(this.data.activeSessions)) {
      if ((s.updatedAt || 0) < cutoff) delete this.data.activeSessions[uid];
    }
  }

  saveData() {
    return writeJsonAtomic(DATA_PATH, this.data);
  }

  isConfigured() {
    return Boolean(this.config.channels.requestChannelId && this.config.channels.modReviewChannelId && this.config.channels.publishedChannelId);
  }

  isStaff(interaction) {
    if (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return true;
    const ids = this.config.roles.adminRoleIds || [];
    return ids.some((id) => interaction.member?.roles?.cache?.has(id));
  }

  // ---------- Roteamento stateless (customId carrega o estado) ----------

  async handleInteraction(interaction) {
    const id = interaction.customId;
    if (typeof id !== 'string' || !(id.startsWith('part:') || id.startsWith('part_staff:'))) return;

    try {
      this.refresh();

      if (interaction.isButton()) {
        if (id === 'part:confirm_start') return await this.grantScreeningRole(interaction);
        if (id === 'part:cancel_start') {
          return await interaction.update({ content: t('partnerships.cancelled', interaction), embeds: [], components: [] });
        }
        if (id === 'part:btn_open_step2') return await this.openStep2Modal(interaction);
        if (id === 'part:terms_agree') return await this.finalizeSubmission(interaction);
        if (id === 'part:terms_cancel') {
          delete this.data.activeSessions[interaction.user.id];
          this.saveData();
          return await interaction.update({ content: t('partnerships.terms_cancelled', interaction), embeds: [], components: [] });
        }
        if (id.startsWith('part_staff:')) return await this.handleStaffAction(interaction);
      }

      if (interaction.isStringSelectMenu() && id === 'part:select_type') return await this.openStep1Modal(interaction);
      if (interaction.isModalSubmit() && id.startsWith('part:modal_step1:')) return await this.handleStep1Submit(interaction);
      if (interaction.isModalSubmit() && id === 'part:modal_step2') return await this.handleStep2Submit(interaction);
    } catch (err) {
      console.error('[Partnerships] Erro de interação:', err);
      const payload = { content: t('common.error', interaction), flags: EPHEMERAL };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
      else await interaction.reply(payload).catch(() => null);
    }
  }

  // ---------- Início: /py-parceria ----------

  buildIntroView(source) {
    const embed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle(t('partnerships.title', source))
      .setDescription(t('partnerships.intro_desc', source));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('part:confirm_start').setLabel(t('partnerships.btn_confirm', source)).setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('part:cancel_start').setLabel(t('partnerships.btn_cancel', source)).setStyle(ButtonStyle.Secondary)
    );
    return { embeds: [embed], components: [row] };
  }

  /** Valida a hierarquia antes de mutar cargos (evita o erro 50013). */
  async roleSafeExecutor(guild, roleId, member, action) {
    const role = guild.roles.cache.get(roleId) || (await guild.roles.fetch(roleId).catch(() => null));
    if (!role) return { ok: false, reason: 'missing_role' };
    const botHighest = guild.members.me?.roles?.highest;
    if (!botHighest || botHighest.position <= role.position) {
      console.warn(`[Partnerships] Cargo da Pyxie abaixo do cargo '${role.name}' na hierarquia!`);
      return { ok: false, reason: 'hierarchy' };
    }
    try {
      if (action === 'add') await member.roles.add(role);
      else await member.roles.remove(role);
      return { ok: true };
    } catch (err) {
      console.warn('[Partnerships] Falha ao alterar cargo:', err.message);
      return { ok: false, reason: 'error' };
    }
  }

  async grantScreeningRole(interaction) {
    if (!interaction.guild) {
      return interaction.update({ content: t('partnerships.guild_only', interaction), embeds: [], components: [] });
    }
    const { screeningRoleId } = this.config.roles;
    const reqChan = this.config.channels.requestChannelId;
    if (!this.isConfigured()) {
      return interaction.update({ content: t('partnerships.not_configured', interaction), embeds: [], components: [] });
    }

    if (screeningRoleId) {
      const res = await this.roleSafeExecutor(interaction.guild, screeningRoleId, interaction.member, 'add');
      if (!res.ok && res.reason === 'hierarchy') {
        return interaction.update({ content: t('partnerships.role_hierarchy_error', interaction), embeds: [], components: [] });
      }
    }
    return interaction.update({
      content: t('partnerships.role_granted', interaction, { channel: `<#${reqChan}>` }),
      embeds: [],
      components: [],
    });
  }

  // ---------- Painel fixo no canal de solicitações ----------

  async renderRequestChannelPanel(channel, source) {
    const lang = getLanguage(source);
    const embed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle(t('partnerships.panel_title', lang))
      .setDescription(t('partnerships.panel_desc', lang))
      .setFooter({ text: t('partnerships.panel_footer', lang) });

    const options = Object.entries(CATEGORY_SCHEMAS).map(([key, item]) => ({
      label: pick(item.label, lang),
      value: key,
      description: trunc(pick(item.title, lang).replace(/^[^•]*•\s*/, ''), 100),
      emoji: item.emoji,
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('part:select_type').setPlaceholder(t('partnerships.panel_placeholder', lang)).addOptions(options)
    );
    return channel.send({ embeds: [embed], components: [row] });
  }

  async postPanel(source) {
    this.refresh();
    const chanId = this.config.channels.requestChannelId;
    const channel = chanId ? await source.client.channels.fetch(chanId).catch(() => null) : null;
    if (!channel) return { ok: false, key: 'partnerships.panel_no_channel' };
    await this.renderRequestChannelPanel(channel, source);
    return { ok: true, channelId: chanId };
  }

  // ---------- Etapa 1 (modal dinâmico por categoria) ----------

  async openStep1Modal(interaction) {
    const categoryKey = interaction.values[0];
    const schema = CATEGORY_SCHEMAS[categoryKey];
    if (!schema) return;
    const lang = getLanguage(interaction);

    const modal = new ModalBuilder().setCustomId(`part:modal_step1:${categoryKey}`).setTitle(trunc(pick(schema.title, lang), 45));
    modal.addComponents(
      schema.fields.map((f) =>
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(f.id)
            .setLabel(trunc(pick(f.label, lang), 45))
            .setStyle(f.style)
            .setPlaceholder(trunc(pick(f.placeholder, lang), 100))
            .setMaxLength(f.style === TextInputStyle.Paragraph ? 1000 : 200)
            .setRequired(true)
        )
      )
    );
    await interaction.showModal(modal);
  }

  async handleStep1Submit(interaction) {
    const categoryKey = interaction.customId.split(':')[2];
    const schema = CATEGORY_SCHEMAS[categoryKey];
    if (!schema) return;
    const lang = getLanguage(interaction);

    const answers = {};
    for (const f of schema.fields) answers[f.id] = interaction.fields.getTextInputValue(f.id).trim();

    if (!isHttpUrl(answers.access_link)) {
      return interaction.reply({ content: t('partnerships.invalid_url', interaction), flags: EPHEMERAL });
    }

    this.data.activeSessions[interaction.user.id] = {
      categoryKey,
      macroCategory: schema.macroCategory,
      projectName: answers.rep_name,
      accessLink: answers.access_link.trim(),
      answers,
      lang,
      updatedAt: Date.now(),
    };
    this.saveData();

    const embed = new EmbedBuilder()
      .setColor('#8B5CF6')
      .setTitle(t('partnerships.step2_title', interaction))
      .setDescription(t('partnerships.step2_desc', interaction));
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('part:btn_open_step2').setLabel(t('partnerships.btn_step2', interaction)).setStyle(ButtonStyle.Primary).setEmoji('📝')
    );
    await interaction.reply({ embeds: [embed], components: [row], flags: EPHEMERAL });
  }

  // ---------- Etapa 2 (stateless: botão abre o modal, sem collectors) ----------

  async openStep2Modal(interaction) {
    if (!this.data.activeSessions[interaction.user.id]) {
      return interaction.reply({ content: t('partnerships.session_expired', interaction), flags: EPHEMERAL });
    }
    const modal = new ModalBuilder().setCustomId('part:modal_step2').setTitle(trunc(t('partnerships.modal2_title', interaction), 45));
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image_url')
          .setLabel(trunc(t('partnerships.modal2_image_label', interaction), 45))
          .setPlaceholder(trunc(t('partnerships.modal2_image_ph', interaction), 100))
          .setStyle(TextInputStyle.Short)
          .setMaxLength(500)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('public_desc')
          .setLabel(trunc(t('partnerships.modal2_desc_label', interaction), 45))
          .setPlaceholder(trunc(t('partnerships.modal2_desc_ph', interaction), 100))
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1000)
          .setRequired(true)
      )
    );
    await interaction.showModal(modal);
  }

  async handleStep2Submit(interaction) {
    const session = this.data.activeSessions[interaction.user.id];
    if (!session) {
      return interaction.reply({ content: t('partnerships.session_expired', interaction), flags: EPHEMERAL });
    }
    const imageUrl = interaction.fields.getTextInputValue('image_url').trim();
    if (!isHttpUrl(imageUrl)) {
      return interaction.reply({ content: t('partnerships.invalid_url', interaction), flags: EPHEMERAL });
    }
    session.imageUrl = imageUrl;
    session.publicDesc = interaction.fields.getTextInputValue('public_desc').trim();
    session.updatedAt = Date.now();
    this.saveData();

    const embed = new EmbedBuilder()
      .setColor('#EC4899')
      .setTitle(t('partnerships.terms_title', interaction))
      .setDescription(t('partnerships.terms_desc', interaction))
      .setFooter({ text: t('partnerships.terms_footer', interaction) });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('part:terms_agree').setLabel(t('partnerships.btn_terms_agree', interaction)).setStyle(ButtonStyle.Success).setEmoji('✅'),
      new ButtonBuilder().setCustomId('part:terms_cancel').setLabel(t('partnerships.btn_terms_cancel', interaction)).setStyle(ButtonStyle.Danger).setEmoji('❌')
    );
    await interaction.reply({ embeds: [embed], components: [row], flags: EPHEMERAL });
  }

  // ---------- Envio para a staff ----------

  async finalizeSubmission(interaction) {
    const userId = interaction.user.id;
    const session = this.data.activeSessions[userId];
    if (!session || !session.imageUrl) {
      return interaction.update({ content: t('partnerships.session_expired', interaction), embeds: [], components: [] });
    }

    const schema = CATEGORY_SCHEMAS[session.categoryKey];
    const lang = getLanguage(interaction);
    const ticketId = `part_${Date.now().toString(36)}`;

    this.data.pendingRequests.push({ id: ticketId, userId, ...session, createdAt: Date.now() });
    delete this.data.activeSessions[userId];
    this.saveData();

    const modChannel = await this.client.channels.fetch(this.config.channels.modReviewChannelId).catch(() => null);
    if (modChannel) {
      const emoji = schema.emoji;
      const staffEmbed = new EmbedBuilder()
        .setColor('#8B5CF6')
        .setTitle(trunc(t('partnerships.staff_title', lang, { emoji, label: pick(schema.label, lang), id: ticketId }), 256))
        .setDescription(trunc(t('partnerships.staff_desc', lang, { user: `<@${userId}>`, tag: interaction.user.tag || interaction.user.username, project: session.projectName }), 4000))
        .setImage(session.imageUrl)
        .setFooter({ text: t('partnerships.staff_footer', lang, { date: new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US') }) });

      for (const field of schema.fields) {
        staffEmbed.addFields({
          name: trunc(pick(field.label, lang).replace(/:$/, ''), 256),
          value: trunc(session.answers[field.id] || 'N/A', 1024),
          inline: field.style === TextInputStyle.Short,
        });
      }
      staffEmbed.addFields({ name: t('partnerships.staff_public_field', lang), value: trunc(session.publicDesc, 1024) });

      const modRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`part_staff:approve:${ticketId}`).setLabel(t('partnerships.btn_approve', lang)).setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId(`part_staff:reject:${ticketId}`).setLabel(t('partnerships.btn_reject', lang)).setStyle(ButtonStyle.Danger).setEmoji('❌'),
        new ButtonBuilder().setCustomId(`part_staff:contact:${ticketId}`).setLabel(t('partnerships.btn_contact', lang)).setStyle(ButtonStyle.Secondary).setEmoji('💬')
      );
      await modChannel.send({ embeds: [staffEmbed], components: [modRow] });
    }

    await interaction.update({ content: t('partnerships.submitted', interaction), embeds: [], components: [] });
  }

  // ---------- Ações da staff ----------

  async handleStaffAction(interaction) {
    const [, action, ticketId] = interaction.customId.split(':');
    const lang = getLanguage(interaction);

    if (!this.isStaff(interaction)) {
      return interaction.reply({ content: t('partnerships.staff_only', interaction), flags: EPHEMERAL });
    }

    const idx = this.data.pendingRequests.findIndex((r) => r.id === ticketId);
    if (idx === -1) {
      return interaction.reply({ content: t('partnerships.already_processed', interaction), flags: EPHEMERAL });
    }
    const req = this.data.pendingRequests[idx];

    if (action === 'contact') {
      return interaction.reply({ content: t('partnerships.contact_hint', interaction, { user: `<@${req.userId}>` }), flags: EPHEMERAL });
    }

    const member = await interaction.guild.members.fetch(req.userId).catch(() => null);
    const applicantLang = req.lang || lang;
    const screeningRoleId = this.config.roles.screeningRoleId;
    const schema = CATEGORY_SCHEMAS[req.categoryKey];

    if (action === 'approve') {
      const pubChannel = await this.client.channels.fetch(this.config.channels.publishedChannelId).catch(() => null);
      if (pubChannel) {
        const publicEmbed = new EmbedBuilder()
          .setColor('#8B5CF6')
          .setTitle(trunc(t('partnerships.public_title', lang, { emoji: schema?.emoji || '🤝', project: req.projectName }), 256))
          .setDescription(trunc(`${req.publicDesc}\n\n${t('partnerships.public_link', lang, { url: req.accessLink })}`, 4000))
          .setImage(req.imageUrl)
          .setFooter({ text: t('partnerships.footer_hint', lang) });
        await pubChannel.send({ embeds: [publicEmbed] });
      }

      if (member) {
        if (screeningRoleId) await this.roleSafeExecutor(interaction.guild, screeningRoleId, member, 'remove');
        await member.send({ content: t('partnerships.dm_approved', applicantLang, { project: req.projectName }) }).catch(() => null);
      }

      // Recarrega: o web pode ter mexido nos arquivos durante os awaits
      this.refresh();
      const cur = this.data.pendingRequests.findIndex((r) => r.id === ticketId);
      if (cur !== -1) this.data.pendingRequests.splice(cur, 1);
      this.data.approvedPartners.push({ ...req, approvedAt: Date.now(), lastBumpedAt: Date.now(), bumpCount: 0 });
      this.saveData();

      const approvedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor('#22C55E')
        .setTitle(trunc(t('partnerships.approved_title', lang, { project: req.projectName }), 256))
        .addFields({ name: t('partnerships.field_approved_by', lang), value: `<@${interaction.user.id}>` });
      return interaction.update({ embeds: [approvedEmbed], components: [] });
    }

    if (action === 'reject') {
      if (member) {
        if (screeningRoleId) await this.roleSafeExecutor(interaction.guild, screeningRoleId, member, 'remove');
        await member.send({ content: t('partnerships.dm_rejected', applicantLang, { project: req.projectName }) }).catch(() => null);
      }
      this.refresh();
      this.data.pendingRequests = this.data.pendingRequests.filter((r) => r.id !== ticketId);
      this.saveData();

      const rejectedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor('#EF4444')
        .setTitle(trunc(t('partnerships.rejected_title', lang, { project: req.projectName }), 256))
        .addFields({ name: t('partnerships.field_rejected_by', lang), value: `<@${interaction.user.id}>` });
      return interaction.update({ embeds: [rejectedEmbed], components: [] });
    }
  }

  // ---------- Web: catálogo público, mosaico e bump 24h ----------

  sanitize(p) {
    const schema = CATEGORY_SCHEMAS[p.categoryKey];
    return {
      id: p.id,
      categoryKey: p.categoryKey,
      macroCategory: p.macroCategory,
      categoryEmoji: schema?.emoji || '🤝',
      categoryLabel: schema ? schema.label : { pt: p.categoryKey, en: p.categoryKey },
      projectName: p.projectName,
      accessLink: p.accessLink,
      imageUrl: p.imageUrl,
      publicDesc: p.publicDesc,
      approvedAt: p.approvedAt,
      lastBumpedAt: p.lastBumpedAt,
      bumpCount: p.bumpCount || 0,
    };
  }

  getPartnershipCatalog(selectedCategory = null) {
    this.refresh();
    const all = this.data.approvedPartners;
    const byBump = (a, b) => (b.lastBumpedAt || 0) - (a.lastBumpedAt || 0);

    const list = (selectedCategory
      ? all.filter((p) => p.categoryKey === selectedCategory || p.macroCategory === selectedCategory)
      : [...all]
    ).sort(byBump);

    // Mosaico: 1 destaque recente por macro-categoria
    const mosaic = {};
    for (const m of ['community', 'creator', 'service', 'ong']) {
      const top = all.filter((p) => p.macroCategory === m).sort(byBump)[0];
      if (top) mosaic[m] = this.sanitize(top);
    }
    return { mosaic, catalog: list.map((p) => this.sanitize(p)) };
  }

  async sendToChannel(channelId, content) {
    if (this.client) {
      const ch = await this.client.channels.fetch(channelId).catch(() => null);
      if (ch) await ch.send({ content }).catch(() => null);
      return;
    }
    await restPost(`/channels/${channelId}/messages`, { content, allowed_mentions: { parse: [] } });
  }

  async applyBump(partnerId, lang = 'en') {
    this.refresh();
    const partner = this.data.approvedPartners.find((p) => p.id === partnerId);
    if (!partner) return { success: false, status: 404, message: t('partnerships.bump_not_found', lang) };

    const now = Date.now();
    const elapsed = now - (partner.lastBumpedAt || 0);
    if (elapsed < COOLDOWN_MS) {
      const hours = Math.ceil((COOLDOWN_MS - elapsed) / 3600000);
      return { success: false, status: 429, message: t('partnerships.bump_wait', lang, { hours }) };
    }

    partner.lastBumpedAt = now;
    partner.bumpCount = (partner.bumpCount || 0) + 1;
    this.saveData(); // load-modify-save síncrono: janela de corrida mínima entre bot e web

    const radar = this.config.channels.radarChannelId;
    if (radar) {
      await this.sendToChannel(radar, t('partnerships.radar_msg', 'pt', { project: partner.projectName, url: partner.accessLink }));
    }
    return { success: true, status: 200, message: t('partnerships.bump_ok', lang), partner: this.sanitize(partner) };
  }

  rateLimited(ip) {
    const now = Date.now();
    const hits = (this.bumpHits.get(ip) || []).filter((ts) => now - ts < BUMP_RATE_WINDOW_MS);
    hits.push(now);
    this.bumpHits.set(ip, hits);
    if (this.bumpHits.size > 5000) {
      for (const [k, v] of this.bumpHits) if (!v.some((ts) => now - ts < BUMP_RATE_WINDOW_MS)) this.bumpHits.delete(k);
    }
    return hits.length > BUMP_RATE_MAX;
  }

  setupWebRoutes(app) {
    const detectLang = (req) => {
      const q = String(req.query?.lang || '').toLowerCase();
      if (q.startsWith('pt')) return 'pt';
      if (q.startsWith('en')) return 'en';
      return String(req.headers['accept-language'] || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
    };

    app.get('/api/partnerships', (req, res) => {
      res.json(this.getPartnershipCatalog(req.query.category ? String(req.query.category) : null));
    });

    app.post('/api/partnerships/bump/:id', async (req, res) => {
      const lang = detectLang(req);
      const ip = String(req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim() || 'unknown';
      if (this.rateLimited(ip)) {
        return res.status(429).json({ success: false, message: t('partnerships.rate_limited', lang) });
      }
      const result = await this.applyBump(req.params.id, lang);
      const { status, ...body } = result;
      res.status(status).json(body);
    });
  }
}

module.exports = new PartnershipManager();


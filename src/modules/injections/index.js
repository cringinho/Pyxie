// Injeções: cria cargos prontos (gênero, sexualidade, neurodivergência, cores) e publica um
// painel de escolha, ou coloca em Canais e cargos (onboarding) do Discord. Tudo escolhido no
// painel (/dashboard → Injeções); o bot é quem cria e grava (pedidos pela ponte).
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const inj = require('../../services/injections');
const { registerBridgeHandler } = require('../../services/botBridgeHandlers');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;
const jobs = new Map(); // jobId -> { state, done, total, result, error }

// ID no formato snowflake para perguntas e opções novas do onboarding.
let seq = 0n;
const snowflake = () => String(((BigInt(Date.now()) - 1420070400000n) << 22n) + (seq++ % 4096n));
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

function panelMessage(injection) {
  const lang = injection.lang;
  const pack = inj.PACKS[injection.pack];
  const embed = new EmbedBuilder()
    .setColor(inj.roleColor(pack.items.find((i) => i.id === injection.items[0].id) || pack.items[0]))
    .setTitle(injection.title || `${pack.emoji} ${t(`injections.pack.${injection.pack}`, lang)}`)
    .setDescription(
      [injection.description || t(injection.mode === 'single' ? 'injections.panelSingle' : 'injections.panelMulti', lang), `-# ${t('injections.panelNote', lang)}`].join('\n\n')
    )
    .setFooter({ text: t('injections.footer', lang) });
  const rows = [];
  const items = injection.items.filter((i) => i.roleId);
  if (injection.format === 'buttons') {
    for (const group of chunk(items, 5)) {
      rows.push(
        new ActionRowBuilder().addComponents(
          group.map((i) => new ButtonBuilder().setCustomId(`inj:btn:${injection.id}:${i.roleId}`).setLabel(i.label.slice(0, 80)).setEmoji(i.emoji).setStyle(ButtonStyle.Secondary))
        )
      );
    }
  } else {
    chunk(items, 25).forEach((group, idx, all) => {
      rows.push(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`inj:sel:${injection.id}:${idx}`)
            .setPlaceholder(all.length > 1 ? t('injections.pickPart', lang, { part: idx + 1, total: all.length }) : t('injections.pick', lang))
            .setMinValues(0)
            .setMaxValues(injection.mode === 'single' ? 1 : group.length)
            .addOptions(group.map((i) => ({ label: i.label.slice(0, 100), value: i.roleId, emoji: i.emoji })))
        )
      );
    });
  }
  rows.push(
    new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`inj:clear:${injection.id}`).setLabel(t('injections.clear', lang)).setEmoji('🧹').setStyle(ButtonStyle.Secondary))
  );
  return { embeds: [embed], components: rows.slice(0, 5), allowedMentions: { parse: [] } };
}

async function info(client, { guildId }) {
  const guild = client.guilds.cache.get(String(guildId));
  if (!guild) throw new Error('guild_not_found');
  const me = guild.members.me;
  return {
    roleIcons: guild.features.includes('ROLE_ICONS'),
    community: guild.features.includes('COMMUNITY'),
    canManageRoles: Boolean(me?.permissions.has(PermissionFlagsBits.ManageRoles)),
    canManageGuild: Boolean(me?.permissions.has(PermissionFlagsBits.ManageGuild)),
    roleCount: guild.roles.cache.size,
    injections: inj.list(guild.id).map((i) => ({ id: i.id, pack: i.pack, count: i.items.length, channelId: i.channelId, messageIds: i.messageIds, onboarding: Boolean(i.onboardingPromptIds?.length), createdAt: i.createdAt })),
  };
}

// Canais e cargos (onboarding): acrescenta perguntas sem mexer nas que já existem. Até 50 opções cada.
async function addOnboarding(client, guild, injection) {
  const current = await client.rest.get(`/guilds/${guild.id}/onboarding`);
  const pack = inj.PACKS[injection.pack];
  const groups = chunk(injection.items.filter((i) => i.roleId), 50);
  const prompts = groups.map((group, idx) => ({
    id: snowflake(),
    type: 0,
    title: `${t(`injections.pack.${injection.pack}`, injection.lang)}${groups.length > 1 ? ` (${idx + 1}/${groups.length})` : ''}`.slice(0, 100),
    single_select: injection.mode === 'single',
    required: false,
    in_onboarding: true,
    options: group.map((i) => ({ id: snowflake(), title: i.label.slice(0, 50), role_ids: [i.roleId], channel_ids: [], emoji_name: i.emoji })),
  }));
  const updated = await client.rest.put(`/guilds/${guild.id}/onboarding`, {
    body: { prompts: [...(current.prompts || []), ...prompts], default_channel_ids: current.default_channel_ids || [], enabled: current.enabled, mode: current.mode },
  });
  const before = new Set((current.prompts || []).map((p) => p.id));
  return (updated.prompts || []).filter((p) => !before.has(p.id)).map((p) => p.id);
}

async function runJob(client, jobId, { guildId, pack, options, lang, by }) {
  const job = jobs.get(jobId);
  const guild = client.guilds.cache.get(String(guildId));
  const opts = inj.normalizeOptions(pack, options);
  try {
    if (!guild || !opts) throw new Error('invalid_request');
    if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) throw new Error('missing_manage_roles');
    const packItems = inj.PACKS[pack].items.filter((i) => opts.items.includes(i.id));
    if (guild.roles.cache.size + packItems.length > 250) throw new Error('too_many_roles');
    job.total = packItems.length;
    const withIcons = guild.features.includes('ROLE_ICONS');
    const byName = new Map([...guild.roles.cache.values()].map((r) => [r.name.toLowerCase(), r]));
    const items = [];
    let created = 0;
    let reused = 0;
    for (const item of packItems) {
      const name = inj.label(item, lang);
      let role = byName.get(name.toLowerCase());
      if (role) reused += 1;
      else {
        role = await guild.roles.create({
          name,
          color: inj.roleColor(item),
          icon: withIcons && item.stripes.length > 1 ? await inj.flagPng(item) : undefined,
          permissions: [],
          mentionable: false,
          reason: `Pyxie: injeção ${pack} pedida no painel`,
        });
        created += 1;
      }
      items.push({ id: item.id, label: name, emoji: item.emoji, roleId: role.id });
      job.done += 1;
    }
    // Logo abaixo da Pyxie (cor aparece por cima dos outros cargos) ou no fim da lista.
    if (opts.position === 'top') {
      const top = guild.members.me.roles.highest.position;
      const positions = items.map((i, idx) => ({ role: i.roleId, position: Math.max(1, top - 1 - idx) })).reverse();
      await guild.roles.setPositions(positions).catch(() => null);
    }
    const injection = { id: inj.newId(), pack, lang, items, mode: opts.mode, format: opts.format, allowedRoleIds: opts.allowedRoleIds, title: opts.title, description: opts.description, channelId: '', messageIds: [], createdAt: Date.now(), by };
    let panelUrl = null;
    if (opts.publish && opts.channelId) {
      const channel = guild.channels.cache.get(opts.channelId);
      const sent = channel?.isTextBased?.() ? await channel.send(panelMessage(injection)).catch(() => null) : null;
      if (!sent) throw new Error('panel_failed');
      Object.assign(injection, { channelId: channel.id, messageIds: [sent.id] });
      panelUrl = sent.url;
    }
    let onboarding = 'skipped';
    if (opts.onboarding) {
      if (!guild.features.includes('COMMUNITY')) onboarding = 'not_community';
      else {
        injection.onboardingPromptIds = await addOnboarding(client, guild, injection).catch(() => null);
        onboarding = injection.onboardingPromptIds ? 'ok' : 'failed';
      }
    }
    inj.store(guild.id, injection);
    Object.assign(job, { state: 'done', result: { injectionId: injection.id, created, reused, panelUrl, onboarding } });
  } catch (err) {
    Object.assign(job, { state: 'error', error: err.message || 'inject_failed' });
  }
}

function start(client, payload) {
  const jobId = inj.newId();
  jobs.set(jobId, { guildId: String(payload.guildId), state: 'running', done: 0, total: 0, result: null, error: null, at: Date.now() });
  runJob(client, jobId, payload);
  for (const [id, j] of jobs) if (Date.now() - j.at > 3600000) jobs.delete(id);
  return { jobId };
}

// O job só aparece para o painel do mesmo servidor (quem é admin de um não vê o de outro).
function status(client, { jobId, guildId }) {
  const job = jobs.get(jobId);
  if (!job || job.guildId !== String(guildId)) throw new Error('job_not_found');
  const { guildId: _guild, ...publicJob } = job;
  return publicJob;
}

// Tira o painel (e, se pedido, apaga os cargos criados).
async function removeInjection(client, { guildId, injectionId, deleteRoles }) {
  const guild = client.guilds.cache.get(String(guildId));
  const injection = guild && inj.get(guild.id, injectionId);
  if (!injection) throw new Error('not_found');
  const channel = guild.channels.cache.get(injection.channelId);
  for (const id of injection.messageIds || []) await channel?.messages?.delete(id).catch(() => null);
  let deleted = 0;
  if (deleteRoles) {
    for (const item of injection.items) {
      if (await guild.roles.cache.get(item.roleId)?.delete('Pyxie: injeção removida no painel').then(() => true).catch(() => false)) deleted += 1;
    }
  }
  inj.remove(guild.id, injectionId);
  return { deletedRoles: deleted };
}

async function handleInteraction(interaction) {
  const id = interaction.customId || '';
  if (!id.startsWith('inj:') || !interaction.guild) return;
  const [, kind, injId, arg] = id.split(':');
  const injection = inj.get(interaction.guild.id, injId);
  const reply = (key, vars) => interaction.reply({ content: t(key, interaction, vars), flags: EPHEMERAL });
  if (!injection) return reply('injections.gone');
  const member = interaction.member;
  if (injection.allowedRoleIds.length && !injection.allowedRoleIds.some((r) => member.roles.cache.has(r))) return reply('injections.notAllowed');
  const all = injection.items.map((i) => i.roleId);
  let change;
  if (kind === 'clear') change = { add: [], remove: all.filter((r) => member.roles.cache.has(r)) };
  else if (kind === 'btn') {
    const has = member.roles.cache.has(arg);
    change = has ? { add: [], remove: [arg] } : inj.applySelection([...member.roles.cache.keys()], injection, { chunkRoleIds: injection.mode === 'single' ? all : [arg], selected: [arg] });
  } else if (kind === 'sel') {
    const idx = Number(arg);
    const chunkIds = chunk(injection.items.filter((i) => i.roleId), 25)[idx]?.map((i) => i.roleId) || [];
    change = inj.applySelection([...member.roles.cache.keys()], injection, { chunkRoleIds: chunkIds, selected: interaction.values || [] });
  } else return null;
  const valid = (ids) => ids.filter((r) => interaction.guild.roles.cache.get(r)?.editable);
  if (change.remove.length) await member.roles.remove(valid(change.remove), 'Pyxie: injeção').catch(() => null);
  if (change.add.length) await member.roles.add(valid(change.add), 'Pyxie: injeção').catch(() => null);
  const names = (ids) => ids.map((r) => injection.items.find((i) => i.roleId === r)?.label).filter(Boolean).join(', ');
  if (!change.add.length && !change.remove.length) return reply('injections.nothing');
  return reply('injections.done', { added: names(change.add) || '—', removed: names(change.remove) || '—' });
}

module.exports = {
  id: 'injections',
  name: { 'pt-BR': 'Injeções', en: 'Injections' },
  description: {
    'pt-BR': 'Cargos prontos de gênero, sexualidade, neurodivergência e cores (24, 48 ou 75), com bandeiras, painel de escolha e opção de ir para Canais e cargos do Discord.',
    en: 'Ready-made gender, sexuality, neurodivergence and color roles (24, 48 or 75), with flags, a picker panel and an option to go into Discord Channels & Roles.',
  },
  icon: '💉',
  defaultEnabled: true,
  panelMessage,
  runJob,
  start,
  status,
  removeInjection,
  handleInteraction,
  _jobs: jobs,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    registerBridgeHandler('INJECT_INFO', info);
    registerBridgeHandler('INJECT_START', start);
    registerBridgeHandler('INJECT_STATUS', status);
    registerBridgeHandler('INJECT_REMOVE', removeInjection);
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction).catch((err) => console.error('[Injections] Erro na escolha:', err));
    });
  },
};

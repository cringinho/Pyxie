#!/usr/bin/env node
/**
 * Configura o servidor Discord "Pyxie Devs" (inglês por padrão, com ES e PT-BR).
 *
 *   node scripts/setup_pyxie_devs.js --guild <ID>                 # SIMULAÇÃO: só lê e mostra o plano
 *   node scripts/setup_pyxie_devs.js --guild <ID> --apply         # cria cargos, categorias e canais que faltam
 *   node scripts/setup_pyxie_devs.js --guild <ID> --apply --prune --confirm <ID>
 *                                                                 # também APAGA canais fora da planta
 *   node scripts/setup_pyxie_devs.js --guild <ID> --apply --only-safety
 *                                                                 # só refaz o Onboarding e o AutoMod
 *
 * Usa o DISCORD_TOKEN do .env (o bot precisa estar no servidor com Administrador).
 * Seguro de repetir: nunca duplica o que já existe e nunca apaga nada sem --prune + --confirm.
 */
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const bp = require('./lib/pyxieDevsBlueprint');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : null;
};

const guildId = opt('--guild') || process.env.PYXIE_DEVS_GUILD_ID;
const APPLY = flag('--apply');
const PRUNE = flag('--prune');
const ONLY_PRUNE = flag('--only-prune'); // só apaga os canais fora da planta, sem criar nada
const ONLY_SAFETY = flag('--only-safety'); // só refaz o Onboarding e o AutoMod
const NO_MENTIONS = { parse: [] }; // as mensagens de boas-vindas não pingam ninguém

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

/** Apaga canais e depois categorias. Falhas (ex.: canal exigido pelo modo Comunidade) são listadas, não escondidas. */
async function prune(rest, extras) {
  const failed = [];
  const order = [...extras.filter((x) => x.type !== bp.CHANNEL_TYPE.category), ...extras.filter((x) => x.type === bp.CHANNEL_TYPE.category)];
  for (const c of order) {
    try {
      await rest.delete(Routes.channel(c.id), { reason: 'Pyxie Devs: limpeza' });
      console.log(`🗑 apagado: ${c.name}`);
    } catch (e) {
      failed.push(`${c.name} (${e.message})`);
    }
  }
  if (failed.length) console.log(`\n⚠ Não consegui apagar ${failed.length}:\n${failed.map((f) => `   - ${f}`).join('\n')}`);
}

/**
 * Onboarding (idioma e avisos) e AutoMod (alertas em #mod-log, equipe isenta).
 * Seguro de repetir: o Onboarding é substituído inteiro; cada regra de AutoMod é atualizada
 * pelo tipo de gatilho (ou criada se não existir).
 */
async function applySafety(rest, guildId) {
  const reason = 'Pyxie Devs: Onboarding e AutoMod';
  const roles = await rest.get(Routes.guildRoles(guildId));
  const chans = await rest.get(Routes.guildChannels(guildId));
  // Hierarquia: o bot só entrega cargos abaixo do cargo mais alto dele (mesmo sendo administrador).
  // Empate de posição: o cargo mais antigo (ID menor) fica acima.
  const me = await rest.get(Routes.user('@me'));
  const member = await rest.get(Routes.guildMember(guildId, me.id));
  const rank = (r) => [r.position, -BigInt(r.id)];
  const above = (a, b) => (a[0] !== b[0] ? a[0] > b[0] : a[1] > b[1]);
  const botTop = roles.filter((r) => member.roles.includes(r.id)).reduce((best, r) => (!best || above(rank(r), rank(best)) ? r : best), null);
  const skipped = new Set();
  const roleId = (key) => {
    const def = bp.ROLES.find((r) => r.key === key);
    const found = def && roles.find((r) => r.name === def.name);
    if (!found) return null;
    if (botTop && !above(rank(botTop), rank(found))) {
      skipped.add(found.name);
      return null;
    }
    return found.id;
  };
  const chanId = (name) => (chans.find((c) => c.type !== bp.CHANNEL_TYPE.category && c.name === name) || {}).id || null;

  // IDs no formato snowflake, exigidos pela API para perguntas e opções novas.
  let next = BigInt(Date.now() - 1420070400000) << 22n;
  const snowflake = () => String(next++);
  const onboarding = {
    enabled: true,
    mode: 0,
    default_channel_ids: bp.ONBOARDING.defaultChannels.map(chanId).filter(Boolean),
    prompts: bp.ONBOARDING.prompts.map((p) => ({
      id: snowflake(),
      type: 0,
      title: p.title,
      single_select: p.singleSelect,
      required: p.required,
      in_onboarding: true,
      options: p.options.map((o) => ({
        id: snowflake(),
        title: o.title,
        description: o.description,
        emoji_name: o.emoji,
        role_ids: o.roles.map(roleId).filter(Boolean),
        channel_ids: o.channels.map(chanId).filter(Boolean),
      })),
    })),
  };
  try {
    await rest.put(Routes.guildOnboarding(guildId), { body: onboarding, reason });
    console.log(`✔ Onboarding: ${onboarding.prompts.length} perguntas, ${onboarding.default_channel_ids.length} canais padrão.`);
    if (skipped.size) {
      console.log(`⚠ Cargos acima do bot ficaram fora do Onboarding: ${[...skipped].join(', ')}.`);
      console.log('  Arraste o cargo do bot para o topo (Configurações > Cargos) e rode de novo com --only-safety.');
    }
  } catch (e) {
    console.log(`⚠ Onboarding não aplicado (${e.message}).`);
  }

  const rules = await rest.get(Routes.guildAutoModerationRules(guildId));
  const alert = chanId(bp.AUTOMOD_ALERT_CHANNEL);
  const exempt = ['devs', 'mods'].map(roleId).filter(Boolean);
  for (const def of bp.AUTOMOD) {
    const found = rules.find((r) => r.trigger_type === def.triggerType);
    const actions = [{ type: 1, metadata: { custom_message: bp.AUTOMOD_MESSAGE } }];
    if (alert) actions.push({ type: 2, metadata: { channel_id: alert } });
    const meta = { ...def.triggerMetadata };
    if (def.triggerType === 1 && found && found.trigger_metadata?.keyword_filter) {
      meta.keyword_filter = [...new Set([...found.trigger_metadata.keyword_filter, ...meta.keyword_filter])];
    }
    const body = { name: def.name, event_type: 1, actions, enabled: true, exempt_roles: exempt, exempt_channels: [], trigger_metadata: meta };
    try {
      if (found) await rest.patch(Routes.guildAutoModerationRule(guildId, found.id), { body, reason });
      else await rest.post(Routes.guildAutoModerationRules(guildId), { body: { ...body, trigger_type: def.triggerType }, reason });
      console.log(`✔ AutoMod: ${def.name} (${found ? 'atualizada' : 'criada'}).`);
    } catch (e) {
      // A regra padrão do Discord ("Block Mention Spam") não aceita edição pela API; ela segue ativa.
      const builtIn = found && /not found/i.test(e.message);
      console.log(builtIn
        ? `ℹ AutoMod: "${found.name}" é a regra padrão do Discord e continua ativa (edite pelo app se quiser).`
        : `⚠ AutoMod: ${def.name} não aplicada (${e.message}).`);
    }
  }
}

async function main() {
  if (!process.env.DISCORD_TOKEN) fail('DISCORD_TOKEN ausente (.env).');
  if (!/^\d{17,20}$/.test(String(guildId || ''))) fail('Informe o servidor: --guild <ID numérico>.');
  if (PRUNE && (!APPLY || opt('--confirm') !== guildId)) fail('--prune exige --apply e --confirm <mesmo ID do servidor>.');

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const guild = await rest.get(Routes.guild(guildId)).catch((e) => fail(`Não consegui ler o servidor (o bot está nele? ${e.message})`));
  const roles = await rest.get(Routes.guildRoles(guildId));
  const channels = await rest.get(Routes.guildChannels(guildId));
  const existing = { roles, channels };

  console.log(`Servidor: ${guild.name} (${guild.id}) · modo: ${APPLY ? 'APLICAR' : 'SIMULAÇÃO'}\n`);
  const actions = bp.planChanges(existing);
  const extras = bp.findExtras(existing);
  if (!actions.length) console.log('✔ Nada a criar: a estrutura já está completa.');
  for (const a of actions) console.log(`+ ${a.op.replace('create-', 'criar ')}: ${a.name}${a.category ? ` (em ${a.category})` : ''}`);
  if (extras.length) console.log(`\n⚠ ${extras.length} canal(is) fora da planta:\n${extras.map((c) => `   - #${c.name}`).join('\n')}`);
  if (!APPLY) {
    console.log('\nSimulação concluída. Nada foi alterado. Rode com --apply para executar.');
    return;
  }

  if (ONLY_SAFETY) {
    await applySafety(rest, guildId);
    return;
  }

  if (ONLY_PRUNE) {
    if (!PRUNE) fail('--only-prune exige --prune.');
    await prune(rest, extras);
    return;
  }

  // 1) Cargos (cria os que faltam; reaproveita os existentes).
  const roleIds = { everyone: guild.id };
  const byName = new Map(roles.map((r) => [r.name.toLowerCase(), r]));
  for (const def of bp.ROLES) {
    let role = byName.get(def.name.toLowerCase());
    if (!role) {
      role = await rest.post(Routes.guildRoles(guildId), {
        body: {
          name: def.name, color: def.color, hoist: def.hoist, mentionable: def.mentionable,
          permissions: String(def.permissions.reduce((acc, f) => acc | f, 0n)),
        },
        reason: 'Pyxie Devs: configuração inicial',
      });
      console.log(`✔ cargo criado: ${def.name}`);
    }
    roleIds[def.key] = role.id;
  }

  // 2) Categorias e canais.
  const hasCommunity = (guild.features || []).includes('COMMUNITY');
  const created = new Map(); // nome do canal -> objeto, para os que foram criados agora
  const byChannel = (name, parentId) => channels.find((c) => c.type !== bp.CHANNEL_TYPE.category && c.name === name && (!parentId || c.parent_id === parentId));
  for (const cat of bp.CATEGORIES) {
    let category = channels.find((c) => c.type === bp.CHANNEL_TYPE.category && c.name.toLowerCase() === cat.name.toLowerCase());
    if (!category) {
      category = await rest.post(Routes.guildChannels(guildId), { body: { name: cat.name, type: bp.CHANNEL_TYPE.category }, reason: 'Pyxie Devs: configuração inicial' });
      console.log(`✔ categoria criada: ${cat.name}`);
    }
    for (const ch of cat.channels) {
      if (byChannel(ch.name, category.id)) continue;
      // Canal de anúncios só existe com o modo Comunidade ligado; sem ele cai para texto comum.
      const wantType = bp.CHANNEL_TYPE[ch.type || 'text'];
      const type = !hasCommunity && wantType === bp.CHANNEL_TYPE.announcement ? bp.CHANNEL_TYPE.text
        : !hasCommunity && wantType === bp.CHANNEL_TYPE.stage ? bp.CHANNEL_TYPE.voice : wantType;
      const made = await rest.post(Routes.guildChannels(guildId), {
        body: { name: ch.name, type, parent_id: category.id, topic: ch.topic, permission_overwrites: bp.overwritesFor(ch.access, roleIds) },
        reason: 'Pyxie Devs: configuração inicial',
      });
      created.set(ch.name, made);
      console.log(`✔ canal criado: #${ch.name}`);
      if (ch.post) {
        const msg = await rest.post(Routes.channelMessages(made.id), { body: { content: ch.post, allowed_mentions: NO_MENTIONS } });
        await rest.put(Routes.channelPin(made.id, msg.id)).catch(() => {});
      }
    }
  }

  // 3) Ajustes do servidor (inglês padrão, segurança, avisos só por menção).
  const all = await rest.get(Routes.guildChannels(guildId));
  const idOf = (name) => (all.find((c) => c.type !== bp.CHANNEL_TYPE.category && c.name === name) || {}).id;
  const s = bp.GUILD_SETTINGS;
  const patch = {
    name: s.name,
    preferred_locale: s.preferredLocale,
    verification_level: s.verificationLevel,
    explicit_content_filter: s.explicitContentFilter,
    default_message_notifications: s.defaultMessageNotifications,
    system_channel_id: idOf(bp.COMMUNITY_CHANNELS.system) || null,
  };
  // Servidor que já é Comunidade: regras e avisos oficiais apontam para os canais novos (libera apagar os antigos).
  if (hasCommunity) {
    patch.rules_channel_id = idOf(bp.COMMUNITY_CHANNELS.rules);
    patch.public_updates_channel_id = idOf(bp.COMMUNITY_CHANNELS.publicUpdates) || idOf('welcome');
  }
  await rest.patch(Routes.guild(guildId), { body: patch, reason: 'Pyxie Devs: configuração inicial' });
  console.log('✔ ajustes do servidor aplicados (idioma padrão: inglês).');

  // 4) Modo Comunidade (necessário para canais de anúncios e idioma do servidor). Se falhar, avisa.
  if (!hasCommunity) {
    try {
      await rest.patch(Routes.guild(guildId), {
        body: {
          features: [...new Set([...(guild.features || []), 'COMMUNITY'])],
          rules_channel_id: idOf(bp.COMMUNITY_CHANNELS.rules),
          public_updates_channel_id: idOf(bp.COMMUNITY_CHANNELS.publicUpdates) || idOf('welcome'),
          preferred_locale: s.preferredLocale,
        },
        reason: 'Pyxie Devs: modo Comunidade',
      });
      console.log('✔ modo Comunidade ligado. Os canais de aviso foram criados como texto: em cada um, Editar canal > Tipo > Anúncios.');
    } catch (e) {
      console.log(`⚠ não consegui ligar o modo Comunidade (${e.message}). Ligue em Configurações > Ativar Comunidade e rode de novo.`);
    }
  }

  // 5) Onboarding e AutoMod.
  await applySafety(rest, guildId);

  // 6) Limpeza opcional: só com --prune + --confirm.
  if (PRUNE) await prune(rest, extras);
  else if (extras.length) console.log('\nCanais extras foram mantidos. Para removê-los: --apply --prune --confirm <ID>.');
  console.log('\nPronto. Falta só atribuir o cargo "Pyxie Devs" à equipe.');
}

main().catch((e) => fail(e.message));

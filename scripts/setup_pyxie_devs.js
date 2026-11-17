#!/usr/bin/env node
/**
 * Configura o servidor Discord "Pyxie Devs" (inglês por padrão, com ES e PT-BR).
 *
 *   node scripts/setup_pyxie_devs.js --guild <ID>                 # SIMULAÇÃO: só lê e mostra o plano
 *   node scripts/setup_pyxie_devs.js --guild <ID> --apply         # cria cargos, categorias e canais que faltam
 *   node scripts/setup_pyxie_devs.js --guild <ID> --apply --prune --confirm <ID>
 *                                                                 # também APAGA canais fora da planta
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

  // 5) Limpeza opcional: só com --prune + --confirm.
  if (PRUNE) await prune(rest, extras);
  else if (extras.length) console.log('\nCanais extras foram mantidos. Para removê-los: --apply --prune --confirm <ID>.');
  console.log('\nPronto. Falta só atribuir o cargo "Pyxie Devs" à equipe e ligar o Onboarding (perguntar o idioma) no Discord.');
}

main().catch((e) => fail(e.message));

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const crypto = require('node:crypto');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { emojify } = require('../../utils/emojify');
const groq = require('../../services/groqClient');
const { GUILD_ID, CATEGORIES } = require('../realm/realmBlueprint');
const store = require('./characterStore');
const safety = require('./safety');
const { buildSystemPrompt } = require('./narratorPrompt');

/**
 * Narradora do roleplay do Pyxie's Realm: cada post do fórum #roleplay-tales é uma cena.
 * Espera um silêncio curto depois das mensagens, chama a IA (Groq, fora da fila dos geradores)
 * e posta a narração, as falas dos NPCs (webhook com nome e avatar), os efeitos na ficha e,
 * quando a história pede, um botão de rolagem de d20 + atributo.
 */

const PREFIX = 'rp';
const TALES_NAME = CATEGORIES.flatMap((c) => c.channels).find((c) => c.key === 'tales').name;
const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const DEBOUNCE_MS = 15000;
const AFTER_ROLL_MS = 3000;
const MIN_GAP_MS = 20000;
const SCENE_DAILY_CAP = 60;
const GUILD_DAILY_CAP = 500;
const MAX_RETRIES = 3;
const NARRATION_MAX = 1500;
const NPC_MAX = 400;
const COLOR = 0x8b5cf6;

const NPCS = {
  astaroth: { name: 'Astaroth', emoji: 'astaroth_main_icon' },
  nyx: { name: 'Nyx', emoji: 'nyx_smirk' },
  gargoyle: { name: 'Chained Gargoyle', emoji: 'nyx_gargoyle' },
  knight: { name: 'Error Knight', emoji: 'nyx_knight' },
  oracle: { name: 'Corrupted Oracle', emoji: 'nyx_oracle' },
  brute: { name: 'No-Signal Brute', emoji: 'nyx_tvbrute' },
};

const timers = new Map();
const running = new Set();
const retries = new Map();
const restingNotice = new Map();
const webhooks = new Map();
const warnedNoSheet = new Set();
let guildDay = { key: '', calls: 0 };

const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
const cut = (text, max) => String(text || '').trim().slice(0, max);

function isRoleplayThread(channel) {
  return Boolean(channel?.isThread?.() && channel.guildId === GUILD_ID && channel.parent?.name === TALES_NAME);
}

/** Fora do personagem: ((assim)) ou começando com // não vai para a narradora. */
function isOutOfCharacter(text) {
  const s = String(text || '').trim();
  return !s || s.startsWith('((') || s.startsWith('//');
}

function emojiAvatar(ref) {
  const match = /^<(a?):\w+:(\d+)>$/.exec(getEmoji(ref) || '');
  return match ? `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] ? 'gif' : 'png'}?size=128` : undefined;
}

function worldState(guildId, now = Date.now()) {
  const lines = [];
  try {
    const status = require('../guildBoss/bossStore').getStatus(guildId, null, now);
    const { bossName } = require('../guildBoss/bossViews');
    if (status && !status.defeatedAt) lines.push(`- This week ${bossName(status.bossId, 'en')} is attacking the Realm's border (${status.hp}/${status.maxHp} HP left).`);
  } catch (_) {}
  try {
    const festival = require('../../services/festival');
    const season = festival.getActiveSeason(now);
    if (season) lines.push(`- The Realm is celebrating: ${festival.seasonName(season, 'en')}.`);
  } catch (_) {}
  return lines.join('\n');
}

function sheetLine(userId) {
  const c = store.getCharacter(userId);
  if (!c) return null;
  const stats = store.STATS.map((s) => `${s.toUpperCase()} ${c.stats[s]}`).join(', ');
  return `- ${c.name} (${store.ANCESTRIES[c.ancestry].name.en}, level ${store.levelOf(c.xp)}; ${stats}; HP ${c.hp}/${store.maxHp(c.stats)}, MP ${c.mp}/${store.maxMp(c.stats)}; items: ${c.items.join(', ') || 'none'}; conditions: ${c.conditions.join(', ') || 'none'})${c.bio ? `. Story: ${c.bio}` : ''}`;
}

function buildMessages(scene, thread) {
  const sheets = scene.participants.map(sheetLine).filter(Boolean).join('\n');
  const turns = scene.turns
    .map((turn) => (turn.role === 'narrator' ? `Narrator: ${turn.text}` : turn.role === 'roll' ? `[Roll] ${turn.text}` : `${turn.name}: ${turn.text}`))
    .join('\n');
  const pending = Object.values(scene.rolls || {})[0];
  const user = [
    `Scene title: ${cut(thread.name, 100)}`,
    scene.summary ? `Story so far: ${scene.summary}` : null,
    `Player characters:\n${sheets || '- (none yet)'}`,
    pending ? `Pending roll: ${pending.name} must roll ${pending.stat.toUpperCase()} (DC ${pending.dc}). Do not ask for another roll.` : null,
    `Recent turns (oldest first):\n${turns}`,
    'Continue the scene.',
  ]
    .filter(Boolean)
    .join('\n\n');
  return [
    { role: 'system', content: buildSystemPrompt(worldState(thread.guildId)) },
    { role: 'user', content: user },
  ];
}

/** Lê e limpa o JSON da IA; devolve null se não der para usar. */
function parseReply(content) {
  let data;
  try {
    data = JSON.parse(String(content || '').replace(/^```(?:json)?|```$/g, '').trim());
  } catch (_) {
    return null;
  }
  if (!data || typeof data.narration !== 'string' || !data.narration.trim()) return null;
  const roll = data.roll && store.STATS.includes(data.roll.stat) ? { player: cut(data.roll.player, 32), stat: data.roll.stat, dc: Math.max(5, Math.min(25, Math.round(Number(data.roll.dc) || 12))), reason: cut(data.roll.reason, 160) } : null;
  return {
    narration: cut(data.narration, NARRATION_MAX),
    npcs: (Array.isArray(data.npcs) ? data.npcs : []).slice(0, 2).map((n) => ({ npc: cut(n?.npc, 32), text: cut(n?.text, NPC_MAX) })).filter((n) => n.npc && n.text),
    roll,
    effects: (Array.isArray(data.effects) ? data.effects : []).slice(0, 6),
    summary: cut(data.summary, 700),
  };
}

function isUnsafe(reply) {
  return [reply.narration, reply.summary, reply.roll?.reason, ...reply.npcs.map((n) => n.text), ...reply.effects.flatMap((e) => [e?.item_add, e?.condition_add])].some((text) => safety.isSexual(text));
}

async function npcWebhook(thread) {
  const parent = thread.parent;
  if (webhooks.has(parent.id)) return webhooks.get(parent.id);
  const hooks = await parent.fetchWebhooks();
  let hook = hooks.find((h) => h.owner?.id === thread.client.user.id && h.name === 'Pyxie NPCs');
  if (!hook) hook = await parent.createWebhook({ name: 'Pyxie NPCs', reason: 'Roleplay NPC voices' });
  webhooks.set(parent.id, hook);
  return hook;
}

async function sendNpcLine(thread, line) {
  const key = line.npc.toLowerCase();
  if (key === 'pyxie') return thread.send({ content: `"${line.text}"`, allowedMentions: { parse: [] } });
  const persona = NPCS[key] || { name: line.npc };
  const hook = await npcWebhook(thread);
  return hook.send({ threadId: thread.id, username: persona.name, avatarURL: persona.emoji ? emojiAvatar(persona.emoji) : undefined, content: line.text, allowedMentions: { parse: [] } });
}

function signed(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Aplica os efeitos (só em quem está na cena) e devolve as linhas pequenas do resumo. */
function applyEffects(scene, effects, lang) {
  const lines = [];
  for (const effect of effects) {
    const userId = scene.participants.find((id) => store.getCharacter(id)?.name.toLowerCase() === String(effect?.player || '').toLowerCase());
    if (!userId) continue;
    const result = store.applyEffects(userId, effect);
    if (!result) continue;
    const { character: c, applied } = result;
    if (applied.hp) lines.push(t('roleplay.effectHp', lang, { name: c.name, delta: signed(applied.hp), hp: c.hp, max: store.maxHp(c.stats) }));
    if (applied.mp) lines.push(t('roleplay.effectMp', lang, { name: c.name, delta: signed(applied.mp), mp: c.mp, max: store.maxMp(c.stats) }));
    if (applied.itemAdded) lines.push(t('roleplay.effectItemAdd', lang, { name: c.name, item: applied.itemAdded }));
    if (applied.itemRemoved) lines.push(t('roleplay.effectItemRemove', lang, { name: c.name, item: applied.itemRemoved }));
    if (applied.conditionAdded) lines.push(t('roleplay.effectConditionAdd', lang, { name: c.name, condition: applied.conditionAdded }));
    if (applied.conditionRemoved) lines.push(t('roleplay.effectConditionRemove', lang, { name: c.name, condition: applied.conditionRemoved }));
  }
  return lines;
}

function schedule(thread, delay = DEBOUNCE_MS) {
  clearTimeout(timers.get(thread.id));
  timers.set(
    thread.id,
    setTimeout(() => {
      timers.delete(thread.id);
      narrate(thread).catch((err) => console.error('[roleplay] Erro na narração:', err.message));
    }, delay)
  );
}

async function narrate(thread, now = Date.now()) {
  if (running.has(thread.id)) return schedule(thread, MIN_GAP_MS);
  const scene = store.getScene(thread.id);
  if (!scene || !scene.turns.some((turn) => !turn.narrated)) return null;
  const lang = getLanguage(thread);
  if (scene.lastNarratedAt && now - scene.lastNarratedAt < MIN_GAP_MS) return schedule(thread, MIN_GAP_MS - (now - scene.lastNarratedAt));
  if (guildDay.key !== today(now)) guildDay = { key: today(now), calls: 0 };
  const sceneCalls = scene.day?.key === today(now) ? scene.day.calls : 0;
  if (sceneCalls >= SCENE_DAILY_CAP || guildDay.calls >= GUILD_DAILY_CAP) {
    // Teto do dia: avisa uma vez e deixa os turnos como lidos para não insistir
    const notify = scene.capNoticeDay !== today(now);
    store.updateScene(thread.id, (s) => {
      for (const turn of s.turns) turn.narrated = true;
      s.capNoticeDay = today(now);
    });
    if (notify) await thread.send(t('roleplay.capReached', lang));
    return null;
  }

  running.add(thread.id);
  try {
    await thread.sendTyping().catch(() => null);
    const model = await groq.resolveModel(MODELS);
    const res = await groq.chatCompletionNow(
      { model, messages: buildMessages(scene, thread), temperature: 0.9, max_completion_tokens: 1200, reasoning_effort: 'low', response_format: { type: 'json_object' } },
      { label: 'Narradora' }
    );
    if (!res.ok) {
      const attempt = (retries.get(thread.id) || 0) + 1;
      retries.set(thread.id, attempt);
      if (attempt <= MAX_RETRIES) {
        if (now - (restingNotice.get(thread.id) || 0) > 10 * 60 * 1000) {
          restingNotice.set(thread.id, now);
          await thread.send(t('roleplay.resting', lang));
        }
        schedule(thread, Math.min(res.retryAfterMs || 30000, 120000) + 2000);
      }
      return null;
    }
    retries.delete(thread.id);
    guildDay.calls += 1;
    let reply = parseReply(res.data?.choices?.[0]?.message?.content);
    if (!reply) return null;
    if (isUnsafe(reply)) reply = { narration: t('roleplay.unsafe', lang), npcs: [], roll: null, effects: [], summary: scene.summary };

    const effectLines = applyEffects(scene, reply.effects, lang);
    const newTurns = scene.turns.filter((turn) => !turn.narrated);
    const players = [...new Set(newTurns.filter((turn) => turn.userId).map((turn) => turn.userId))];
    for (const userId of players) {
      if (store.grantTurnXp(userId, now) > 0) {
        const c = store.getCharacter(userId);
        effectLines.push(t('roleplay.levelUp', lang, { name: c.name, level: store.levelOf(c.xp) }));
      }
    }

    const description = [reply.narration, effectLines.length ? effectLines.map((line) => `-# ${line}`).join('\n') : null].filter(Boolean).join('\n\n');
    await thread.send({ embeds: [{ color: COLOR, author: { name: t('roleplay.narrationLabel', lang) }, description: emojify(description).slice(0, 4096) }], allowedMentions: { parse: [] } });
    for (const line of reply.npcs) await sendNpcLine(thread, line).catch((err) => console.warn('[roleplay] Falha na fala do NPC:', err.message));

    // Uma rolagem por vez: o botão fica com quem a narradora chamou
    const rollUserId = reply.roll && !Object.keys(scene.rolls || {}).length ? scene.participants.find((id) => store.getCharacter(id)?.name.toLowerCase() === reply.roll.player.toLowerCase()) : null;
    if (rollUserId) {
      const rollId = crypto.randomBytes(4).toString('hex');
      const name = store.getCharacter(rollUserId).name;
      const statName = t(`roleplay.stats.${reply.roll.stat}`, lang);
      store.updateScene(thread.id, (s) => {
        s.rolls = { [rollId]: { userId: rollUserId, name, stat: reply.roll.stat, dc: reply.roll.dc } };
      });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`${PREFIX}:roll:${thread.id}:${rollId}`).setLabel(t('roleplay.rollButton', lang, { stat: statName })).setEmoji('🎲').setStyle(ButtonStyle.Primary)
      );
      await thread.send({
        content: `<@${rollUserId}> ${t('roleplay.rollPrompt', lang, { name, stat: statName, dc: reply.roll.dc, reason: reply.roll.reason })}`,
        components: [row],
        allowedMentions: { users: [rollUserId] },
      });
    }

    store.updateScene(thread.id, (s) => {
      for (const turn of s.turns) turn.narrated = true;
      s.turns.push({ role: 'narrator', text: cut(reply.narration, 600), narrated: true, at: now });
      if (reply.summary) s.summary = reply.summary;
      s.lastNarratedAt = now;
      s.narrations = (s.narrations || 0) + 1;
      s.day = { key: today(now), calls: (s.day?.key === today(now) ? s.day.calls : 0) + 1 };
    });
    return reply;
  } finally {
    running.delete(thread.id);
  }
}

async function onThreadCreate(thread, newlyCreated) {
  if (!newlyCreated || !isRoleplayThread(thread)) return;
  store.updateScene(thread.id, (s) => {
    s.guildId = thread.guildId;
    s.title = cut(thread.name, 100);
  });
  const lang = getLanguage(thread);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await thread.send({ embeds: [{ color: COLOR, title: emojify(t('roleplay.sceneTitle', lang)), description: emojify(t('roleplay.sceneBody', lang)) }] });
}

async function onMessage(message) {
  if (message.author?.bot || message.webhookId || !isRoleplayThread(message.channel)) return;
  const thread = message.channel;
  const text = message.content || '';
  if (isOutOfCharacter(text)) return;
  const lang = getLanguage(thread);
  if (safety.isCrisis(text)) {
    await message.reply({ content: t('roleplay.crisis', lang, { user: `<@${message.author.id}>` }), allowedMentions: { users: [message.author.id] } });
    return;
  }
  if (safety.isSexual(text)) {
    await message.reply({ content: t('roleplay.unsafe', lang), allowedMentions: { parse: [] } });
    return;
  }
  const character = store.getCharacter(message.author.id);
  if (!character) {
    const key = `${thread.id}:${message.author.id}`;
    if (!warnedNoSheet.has(key)) {
      warnedNoSheet.add(key);
      const warn = await message.reply({ content: t('roleplay.needSheet', lang, { user: `<@${message.author.id}>` }), allowedMentions: { users: [message.author.id] } });
      setTimeout(() => warn.delete().catch(() => null), 30000);
    }
    return;
  }
  store.updateScene(thread.id, (s) => {
    s.guildId = thread.guildId;
    s.title = s.title || cut(thread.name, 100);
    if (!s.participants.includes(message.author.id)) s.participants.push(message.author.id);
    s.turns.push({ role: 'player', userId: message.author.id, name: character.name, text: cut(text, 600), narrated: false, at: Date.now() });
  });
  schedule(thread);
}

/** Botão de rolagem: só o dono do personagem rola; o resultado entra na cena e a narradora segue. */
async function onRollButton(interaction, random = Math.random) {
  const [, , threadId, rollId] = interaction.customId.split(':');
  const lang = getLanguage(interaction);
  const scene = store.getScene(threadId);
  const roll = scene?.rolls?.[rollId];
  if (!roll) return interaction.reply({ content: t('roleplay.rollGone', lang), flags: 64 });
  if (roll.userId !== interaction.user.id) return interaction.reply({ content: t('roleplay.rollNotYours', lang), flags: 64 });
  const c = store.getCharacter(roll.userId);
  const mod = c ? c.stats[roll.stat] : 0;
  const die = 1 + Math.floor(random() * 20);
  const total = die + mod;
  const success = die === 20 || (die !== 1 && total >= roll.dc);
  const key = die === 20 ? 'roleplay.rollCrit' : die === 1 ? 'roleplay.rollFumble' : success ? 'roleplay.rollSuccess' : 'roleplay.rollFail';
  const text = t(key, lang, { name: roll.name, die, mod, total, dc: roll.dc });
  store.updateScene(threadId, (s) => {
    s.rolls = {};
    s.turns.push({ role: 'roll', text: `${roll.name} rolled ${roll.stat.toUpperCase()}: d20=${die} + ${mod} = ${total} vs DC ${roll.dc} → ${die === 20 ? 'critical success' : die === 1 ? 'critical failure' : success ? 'success' : 'failure'}`, narrated: false, at: Date.now() });
  });
  await interaction.update({ content: `${interaction.message.content}\n${text}`, components: [], allowedMentions: { parse: [] } });
  if (interaction.channel) schedule(interaction.channel, AFTER_ROLL_MS);
  return { die, total, success };
}

module.exports = {
  PREFIX,
  NPCS,
  isRoleplayThread,
  isOutOfCharacter,
  buildMessages,
  parseReply,
  isUnsafe,
  narrate,
  onThreadCreate,
  onMessage,
  onRollButton,
};

// Agendador do estúdio de mensagens (roda no processo do bot, um só por processo):
// - schedule: envia uma vez numa data e hora;
// - repeat: reenvia a cada X horas, só se o canal teve N mensagens novas desde o último envio;
// - sticky: mantém a mensagem fixa no fim do canal, com espera para não virar flood.
// Estado em data/guilds/<guildId>/messageDelivery.json (escrita atômica).
const fs = require('node:fs');
const path = require('node:path');
const store = require('./messageStudioStore');
const { MESSAGE_FLAGS } = require('./messageStudio');

const REPEAT_RECHECK_MS = 10 * 60 * 1000;

function stateFile(guildId) {
  return path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'guilds', String(guildId), 'messageDelivery.json');
}

function loadState(guildId) {
  try {
    return JSON.parse(fs.readFileSync(stateFile(guildId), 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function saveState(guildId, state) {
  const file = stateFile(guildId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

function allDocs() {
  const out = [];
  for (const guildId of store.listGuildsWithMessages()) {
    for (const { id } of store.listMessages(guildId)) {
      const doc = store.getMessage(guildId, id);
      if (doc) out.push({ guildId, doc });
    }
  }
  return out;
}

// Conta mensagens de pessoas (não bots) depois de um ID, até 100.
async function countMessagesAfter(channelId, afterId, fetchImpl) {
  const list = await store.discord('GET', `/channels/${channelId}/messages?after=${afterId}&limit=100`, null, fetchImpl).catch(() => []);
  return (Array.isArray(list) ? list : []).filter((m) => !m.author?.bot && !m.webhook_id).length;
}

async function tick({ now = Date.now(), fetchImpl = fetch, log = console } = {}) {
  const results = [];
  for (const { guildId, doc } of allDocs()) {
    const state = loadState(guildId);
    const st = state[doc.id] || {};
    const { schedule, repeat } = doc.delivery;
    let changed = false;

    if (schedule?.at && schedule.channelId && schedule.at <= now && st.scheduleDoneAt !== schedule.at) {
      try {
        await store.sendMessage(guildId, doc.id, schedule.channelId, { fetchImpl, by: 'schedule' });
        results.push({ guildId, id: doc.id, kind: 'schedule', ok: true });
      } catch (err) {
        log.error?.(`[MessageStudio] Agendamento '${doc.id}' falhou: ${err.code || err.message}`);
        results.push({ guildId, id: doc.id, kind: 'schedule', ok: false, error: err.code });
      }
      st.scheduleDoneAt = schedule.at;
      changed = true;
    }

    if (repeat?.everyHours && repeat.channelId) {
      const due = now - (st.repeatLastAt || 0) >= repeat.everyHours * 3600000;
      const recheckOk = now - (st.repeatCheckedAt || 0) >= REPEAT_RECHECK_MS;
      if (due && recheckOk) {
        let enough = true;
        if (repeat.minMessages > 0 && st.repeatLastMessageId) {
          enough = (await countMessagesAfter(repeat.channelId, st.repeatLastMessageId, fetchImpl)) >= repeat.minMessages;
        }
        st.repeatCheckedAt = now;
        if (enough) {
          try {
            const sent = await store.sendMessage(guildId, doc.id, repeat.channelId, { fetchImpl, by: 'repeat' });
            st.repeatLastAt = now;
            st.repeatLastMessageId = sent.messageId;
            results.push({ guildId, id: doc.id, kind: 'repeat', ok: true });
          } catch (err) {
            log.error?.(`[MessageStudio] Repetição '${doc.id}' falhou: ${err.code || err.message}`);
            results.push({ guildId, id: doc.id, kind: 'repeat', ok: false, error: err.code });
          }
        } else {
          results.push({ guildId, id: doc.id, kind: 'repeat', ok: true, skipped: 'not_enough_activity' });
        }
        changed = true;
      }
    }

    if (changed) {
      state[doc.id] = st;
      saveState(guildId, state);
    }
  }
  return results;
}

// ---------- Mensagem fixa no fim do canal ----------

const stickyTimers = new Map();
let stickyIndex = { builtAt: 0, byChannel: new Map() };

function getStickyIndex(now = Date.now()) {
  if (now - stickyIndex.builtAt < 60000) return stickyIndex.byChannel;
  const byChannel = new Map();
  for (const { guildId, doc } of allDocs()) {
    const sticky = doc.delivery.sticky;
    if (sticky?.channelId) byChannel.set(sticky.channelId, { guildId, id: doc.id, delaySec: sticky.delaySec });
  }
  stickyIndex = { builtAt: now, byChannel };
  return byChannel;
}

async function repostSticky(entry, channelId, fetchImpl = fetch) {
  const state = loadState(entry.guildId);
  const st = state[entry.id] || {};
  if (st.stickyMessageId) await store.deleteChannelMessage(channelId, st.stickyMessageId, fetchImpl);
  // Mensagem fixa sempre silenciosa: reposicionar não pode notificar ninguém.
  const sent = await store.sendMessage(entry.guildId, entry.id, channelId, {
    fetchImpl,
    by: 'sticky',
    record: false,
    payloadOverride: (p) => ({ ...p, flags: (p.flags || 0) | MESSAGE_FLAGS.SUPPRESS_NOTIFICATIONS }),
  });
  st.stickyMessageId = sent.messageId;
  state[entry.id] = st;
  saveState(entry.guildId, state);
  return sent;
}

// Chamado a cada mensagem nova. A espera reinicia a cada mensagem: só reposiciona quando o canal acalma.
function onMessage(message, { fetchImpl = fetch } = {}) {
  if (!message?.channelId || message.author?.id === message.client?.user?.id) return false;
  const entry = getStickyIndex().get(message.channelId);
  if (!entry) return false;
  const st = loadState(entry.guildId)[entry.id] || {};
  if (message.id === st.stickyMessageId) return false;
  clearTimeout(stickyTimers.get(message.channelId));
  const timer = setTimeout(() => {
    stickyTimers.delete(message.channelId);
    repostSticky(entry, message.channelId, fetchImpl).catch((err) => console.error(`[MessageStudio] Sticky '${entry.id}' falhou: ${err.code || err.message}`));
  }, Math.max(5, entry.delaySec || 15) * 1000);
  if (timer.unref) timer.unref();
  stickyTimers.set(message.channelId, timer);
  return true;
}

function clearTimers() {
  for (const timer of stickyTimers.values()) clearTimeout(timer);
  stickyTimers.clear();
  stickyIndex = { builtAt: 0, byChannel: new Map() };
}

module.exports = { tick, onMessage, repostSticky, clearTimers, loadState };

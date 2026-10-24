const { t } = require('../../utils/i18n');
const store = require('./dungeonStore');
const views = require('./dungeonViews');

/**
 * Inatividade nas Catacumbas (rodado a cada minuto pelo módulo):
 * 1. Avisa na thread 5 minutos antes do game over (marcando a pessoa, só ela).
 * 2. Fecha as descidas paradas há mais de idleMinutes (o Astaroth salva 10% do ouro).
 * 3. Entrega cada game over: resumo por DM, aviso na thread e a thread trancada e arquivada.
 *    Sem DM aberta, o resumo vai na própria thread.
 */

async function fetchThread(client, threadId) {
  if (!threadId || !client?.channels?.fetch) return null;
  try {
    const channel = await client.channels.fetch(threadId);
    return channel?.isThread?.() ? channel : null;
  } catch (_) {
    return null;
  }
}

async function sendWarning(client, warning) {
  const thread = await fetchThread(client, warning.threadId);
  if (!thread) return;
  await thread
    .send({
      content: t('dungeon.thread.warn', warning.lang, { user: `<@${warning.userId}>`, minutes: warning.minutesLeft }),
      allowedMentions: { users: [warning.userId], parse: [] },
    })
    .catch(() => null);
}

async function deliverNotice(client, notice) {
  const summary = views.buildIdleSummaryView(notice);
  let dmSent = false;
  try {
    const user = await client.users.fetch(notice.userId);
    await user.send(summary);
    dmSent = true;
  } catch (_) {
    dmSent = false;
  }

  const thread = await fetchThread(client, notice.threadId);
  if (!thread) return { dmSent, thread: false };
  if (thread.archived) await thread.setArchived(false).catch(() => null);
  await thread
    .send({
      content: t(dmSent ? 'dungeon.thread.closed' : 'dungeon.thread.closedNoDm', notice.lang, { user: `<@${notice.userId}>` }),
      embeds: dmSent ? [] : summary.embeds,
      allowedMentions: { parse: [] },
    })
    .catch(() => null);
  await thread.setLocked(true).catch(() => null);
  await thread.setArchived(true).catch(() => null);
  return { dmSent, thread: true };
}

async function sweep(client, now = Date.now()) {
  for (const warning of store.collectIdleWarnings(now)) await sendWarning(client, warning);
  store.closeIdleRuns(now);
  const notices = store.takeNotices();
  const results = [];
  for (const notice of notices) results.push(await deliverNotice(client, notice));
  return results;
}

module.exports = { sweep, deliverNotice };

// Agenda de um servidor: próximos disparos das automações dele, calculados da config salva
// (e não de memória), para o /py-agenda e o painel mostrarem a mesma coisa nos dois processos.
const periodic = require('./periodicMessages');

const HOUR = 3600000;
const BRT = 3 * HOUR;

// Próxima vez (BRT) em um dos dias da semana, numa hora cheia.
function nextWeekly(now, weekdays, hour) {
  const days = weekdays.map(Number).filter((d) => d >= 0 && d <= 6);
  if (!days.length) return null;
  const local = new Date(now - BRT);
  for (let i = 0; i <= 7; i += 1) {
    const at = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + i, hour) + BRT;
    const wd = new Date(at - BRT).getUTCDay();
    // O dia de hoje ainda vale enquanto a hora não passou inteira (o bot confere a cada 5-15 min).
    if (days.includes(wd) && at + HOUR > now) return Math.max(at, now);
  }
  return null;
}

function getGuildAgenda(guildId, now = Date.now()) {
  const items = [];
  const cfg = periodic.getConfig(guildId);
  if (cfg.bumpGuide.enabled && cfg.bumpGuide.channelId) {
    items.push({ id: 'bumpGuide', emoji: '🚀', section: 'periodic', channelId: cfg.bumpGuide.channelId, nextAt: periodic.bumpGuideNextAt(guildId, now), every: { hours: cfg.bumpGuide.intervalHours } });
  }
  const tarotChannel = periodic.tarotChannelId(guildId);
  if (cfg.tarot.enabled && tarotChannel) {
    items.push({ id: 'tarotDaily', emoji: '🌙', section: 'periodic', channelId: tarotChannel, nextAt: periodic.nextBrtMidnight(now), every: { daily: '00:00' } });
  }

  const auto = require('./automations');
  const state = require('./autoState');
  const sched = auto.getConfig(guildId, 'scheduledMessages');
  if (sched.enabled && sched.channelId && sched.text.trim()) {
    const lastDay = state.read(guildId, 'scheduled.json').lastDay;
    let nextAt = nextWeekly(now, sched.weekdays, sched.hour);
    // Já saiu hoje: pula para o próximo dia escolhido.
    if (nextAt && new Date(nextAt - BRT).toISOString().slice(0, 10) === lastDay) nextAt = nextWeekly(nextAt + 2 * HOUR, sched.weekdays, sched.hour);
    if (nextAt) items.push({ id: 'scheduledMessages', emoji: '🗓️', section: 'automations', channelId: sched.channelId, nextAt, every: { weekdays: sched.weekdays, hour: sched.hour } });
  }
  const digest = auto.getConfig(guildId, 'weeklyDigest');
  if (digest.enabled && digest.channelId) {
    const nextAt = nextWeekly(now, [digest.weekday], 10);
    if (nextAt) items.push({ id: 'weeklyDigest', emoji: '📊', section: 'automations', channelId: digest.channelId, nextAt, every: { weekdays: [digest.weekday], hour: 10 } });
  }
  const bump = auto.getConfig(guildId, 'bumpReminder');
  const bumpState = state.read(guildId, 'bump.json');
  if (bump.enabled && bumpState.at && !bumpState.reminded && bumpState.channelId) {
    items.push({ id: 'bumpReminder', emoji: '⏰', section: 'automations', channelId: bumpState.channelId, nextAt: Math.max(now, bumpState.at + 2 * HOUR), every: { afterBump: 2 } });
  }
  return items.map((i) => ({ ...i, remainingMs: Math.max(0, i.nextAt - now) })).sort((a, b) => a.nextAt - b.nextAt);
}

module.exports = { getGuildAgenda, nextWeekly };

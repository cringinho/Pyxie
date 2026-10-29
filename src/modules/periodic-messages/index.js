// Mensagens periódicas: guia de apoio (bump) no intervalo que cada servidor escolhe.
// Config em data/guilds/<id>/periodic.json (painel → Mensagens periódicas); regras em
// src/services/periodicMessages.js. O anúncio diário do tarot continua no index.js (ciclo global).
const periodic = require('../../services/periodicMessages');

const TICK_MS = 10 * 60 * 1000;

// Sem estado salvo (primeira vez ou depois de uma migração): procura o último guia no canal
// para não repetir o que acabou de sair.
async function lastGuideAt(client, channel) {
  const recent = await channel.messages?.fetch?.({ limit: 50 }).catch(() => null);
  const mine = recent?.filter?.((m) => m.author?.id === client.user?.id && m.embeds?.some((e) => /Como apoiar|Como ajudar|How to support/.test(e.title || '')));
  return mine?.size ? Math.max(...mine.map((m) => m.createdTimestamp)) : 0;
}

async function tick(client, now = Date.now()) {
  let sent = 0;
  for (const guild of client.guilds.cache.values()) {
    const cfg = periodic.getConfig(guild.id).bumpGuide;
    if (!cfg.enabled || !cfg.channelId) continue;
    const state = periodic.readState(guild.id);
    const channel = guild.channels.cache.get(cfg.channelId);
    if (!channel?.send) continue;
    if (!state.bumpGuideAt) {
      const found = await lastGuideAt(client, channel);
      if (found) {
        periodic.writeState(guild.id, { ...state, bumpGuideAt: found });
        if (now - found < cfg.intervalHours * 3600000) continue;
      }
    }
    if (!periodic.bumpGuideDue(guild.id, now)) continue;
    const msg = await channel.send(periodic.buildBumpGuide(guild, cfg)).catch(() => null);
    if (!msg) continue;
    periodic.writeState(guild.id, { ...periodic.readState(guild.id), bumpGuideAt: now });
    sent += 1;
  }
  return sent;
}

module.exports = {
  id: 'periodic-messages',
  name: { 'pt-BR': 'Mensagens Periódicas', en: 'Periodic Messages' },
  description: {
    'pt-BR': 'Guia de apoio ao servidor (bump, review, votos) no intervalo escolhido no painel. Desligado por padrão, menos na Cringelândia.',
    en: 'Server support guide (bump, review, votes) at the interval chosen in the dashboard. Off by default, except in Cringelândia.',
  },
  icon: '🔁',
  defaultEnabled: true,
  tick,
  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const run = () => tick(ctx.client).catch((err) => console.error('[PeriodicMessages] guia:', err));
    ctx.registerInterval(run, TICK_MS);
    ctx.registerTimeout(run, 30 * 1000);
  },
};

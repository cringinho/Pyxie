const { ActivityType } = require('discord.js');

/**
 * Atividades dinâmicas da Pyxie para Rich Presence rotativo.
 * Combina chamadas de RPG, Tarot, Empregos, Wiki, Site e convite universal em inglês.
 */
const PRESENCE_ACTIVITIES = [
  {
    name: '/py-help ✦ pyxie.com.br',
    type: ActivityType.Playing,
    state: 'Add me: pyxie.com.br',
  },
  {
    name: '78 Tarot Cards Album | /py-album',
    type: ActivityType.Watching,
    state: 'Collect cards & achievements',
  },
  {
    name: '78 Canvas Tarot Cards | /py-tarot',
    type: ActivityType.Listening,
    state: 'Draw your destiny daily',
  },
  {
    name: '10 Career Minigames | /py-work',
    type: ActivityType.Competing,
    state: 'Technical job challenges',
  },
  {
    name: 'Add to Server ➔ pyxie.com.br',
    type: ActivityType.Playing,
    state: 'Type /py-help to start!',
  },
  {
    name: 'Official Wiki ✦ pyxie.com.br/wiki',
    type: ActivityType.Watching,
    state: 'Guides, economy & jobs',
  },
  {
    name: 'Fun Minigames ✦ /py-coinflip',
    type: ActivityType.Playing,
    state: 'Jokenpô, Cookie & Coinflip',
  },
];

let currentIndex = 0;
let rotatorInterval = null;
let pausedUntil = 0;
let activities = [...PRESENCE_ACTIVITIES];

function getNextActivity() {
  if (!activities.length) return null;
  const activity = activities[currentIndex % activities.length];
  currentIndex = (currentIndex + 1) % activities.length;
  return activity;
}

/**
 * Troca a lista de status em tempo real (novo): útil para campanha, manutenção
 * ou para um servidor parceiro aparecer na rotação sem reiniciar o bot.
 */
function setActivities(list = []) {
  const valid = (Array.isArray(list) ? list : [])
    .map((a) => ({
      name: String(a?.name || '').slice(0, 120),
      type: Number.isFinite(a?.type) ? a.type : ActivityType.Playing,
      state: a?.state ? String(a.state).slice(0, 120) : undefined,
    }))
    .filter((a) => a.name);
  if (!valid.length) return { ok: false, reason: 'empty' };
  activities = valid;
  currentIndex = 0;
  return { ok: true, count: activities.length };
}

/** Pausa a rotação por N ms (ex.: durante deploy ou manutenção). */
function pauseFor(ms = 0) {
  pausedUntil = ms > 0 ? Date.now() + ms : 0;
  return { pausedUntil };
}

function isPaused(now = Date.now()) {
  return pausedUntil > now;
}

function currentActivities() {
  return [...activities];
}

/**
 * Inicializa a rotação de status/Rich Presence do bot.
 * Intervalo padrão: 45 segundos (seguro para o rate limit do gateway do Discord).
 *
 * @param {import('discord.js').Client} client
 * @param {number} [intervalMs=45000]
 */
function startPresenceRotator(client, intervalMs = 45000) {
  if (!client || !client.user) return;

  // Aplica o primeiro status imediatamente
  const applyPresence = () => {
    try {
      if (isPaused()) return;
      const act = getNextActivity();
      if (!act) return;
      client.user.setPresence({
        activities: [
          {
            name: act.name,
            type: act.type,
            state: act.state,
          },
        ],
        status: 'online',
      });
    } catch (err) {
      console.warn('[PresenceRotator] Erro ao atualizar presença:', err.message);
    }
  };

  applyPresence();

  if (rotatorInterval) {
    clearInterval(rotatorInterval);
  }

  rotatorInterval = setInterval(applyPresence, intervalMs);
  // Não segura o processo vivo só por causa do status (testes/bot de teste saíam travados).
  rotatorInterval.unref?.();
  return rotatorInterval;
}

function stopPresenceRotator() {
  if (rotatorInterval) {
    clearInterval(rotatorInterval);
    rotatorInterval = null;
  }
}

module.exports = {
  PRESENCE_ACTIVITIES,
  getNextActivity,
  startPresenceRotator,
  stopPresenceRotator,
  setActivities,
  pauseFor,
  isPaused,
  currentActivities,
};

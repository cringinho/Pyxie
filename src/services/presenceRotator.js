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

function getNextActivity() {
  const activity = PRESENCE_ACTIVITIES[currentIndex];
  currentIndex = (currentIndex + 1) % PRESENCE_ACTIVITIES.length;
  return activity;
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
      const act = getNextActivity();
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
};

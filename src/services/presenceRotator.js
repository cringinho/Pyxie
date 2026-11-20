const { ActivityType } = require('discord.js');

/**
 * Status rotativo da Pyxie. Desde nov/2026 ela é privada: mascote da Pyxie Devs (estúdio indie de
 * jogos no Roblox) e guardiã da Cringelândia.
 *
 * Usa status personalizado (ActivityType.Custom): o Discord mostra o texto de `state` inteiro, sem o
 * prefixo "Jogando/Assistindo" (que traduzia só metade da frase) e sem esconder o `state`, que bots
 * nos outros tipos não exibem. O status é um texto só para todo mundo, então as frases alternam PT e EN.
 */
const custom = (state) => ({ name: 'Custom Status', type: ActivityType.Custom, state });

const PRESENCE_ACTIVITIES = [
  custom('🦇 Mascote da Pyxie Devs · pyxie.com.br/devs'),
  custom('🎮 Pyxie Devs mascot · pyxie.com.br/devs'),
  custom('🕯️ Espiando o Sanctum Obscura. Só por controle de qualidade.'),
  custom('🕯️ Watching Sanctum Obscura grow. For quality reasons, obviously.'),
  custom('🏰 De olho na Cringelândia. Caderninho de vinganças aberto.'),
  custom('🏰 Guarding Cringelândia. Revenge notebook open.'),
  custom('💜 Precisa de ajuda? Usa /py-help. Não que eu me importe.'),
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

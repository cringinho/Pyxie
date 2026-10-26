/**
 * Chefes semanais do servidor: os guardiões das Catacumbas sobem à superfície, um por semana.
 * Cada chefe anuncia o plano do dia (intenção); a postura certa dobra o dano.
 * Pares { pt, en } (AGENTS.md §1.6). Sprites = Application Emojis do bot (mesmos da dungeon).
 */

const BOSSES = [
  { id: 'granny_spider', enemy: 'granny_spider' },
  { id: 'librarian', enemy: 'librarian' },
  { id: 'hydra', enemy: 'hydra' },
  { id: 'dragon_queen', enemy: 'dragon_queen' },
  { id: 'nyx', enemy: 'nyx' },
];

/** Posturas de ataque e a intenção do chefe que cada uma vence. */
const STANCES = {
  strike: { emoji: '⚔️', beats: 'channel' },
  guard: { emoji: '🛡️', beats: 'charge' },
  spell: { emoji: '🔮', beats: 'shield' },
};

/** Intenções do dia: a postura que a vence dá dano dobrado; a "errada" dá metade. */
const INTENTS = {
  charge: {
    emoji: '💢',
    weak: 'spell',
    name: { pt: 'Investida', en: 'Charge' },
    hint: { pt: 'Hoje ele vem pra cima com tudo. Quem se defende bem devolve o golpe em dobro.', en: 'Today it comes at you with everything. A good guard turns the hit back double.' },
  },
  shield: {
    emoji: '🪨',
    weak: 'strike',
    name: { pt: 'Casca de Pedra', en: 'Stone Shell' },
    hint: { pt: 'Hoje ele se fecha numa casca dura. Magia atravessa; espada só arranha.', en: 'Today it hides in a hard shell. Magic goes through; blades only scratch.' },
  },
  channel: {
    emoji: '🌀',
    weak: 'guard',
    name: { pt: 'Feitiço Carregando', en: 'Charging a Spell' },
    hint: { pt: 'Hoje ele fica parado carregando um feitiço. Bate rápido antes que termine!', en: 'Today it stands still charging a spell. Hit fast before it finishes!' },
  },
};

module.exports = { BOSSES, STANCES, INTENTS };

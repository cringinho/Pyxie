// Disjuntor de memória: protege moderação, segurança e economia quando a memória do bot
// chega perto do teto (768 MB). Sem configuração; avisa o dono por DM no máximo a cada 6 h.
const guard = require('../../services/memoryGuard');
const { OWNER_SNOWFLAKE } = require('../../config/scopes');
const { t } = require('../../utils/i18n');

const CHECK_MS = 15 * 1000;
const DM_EVERY_MS = 6 * 60 * 60 * 1000;
let lastDm = 0;

module.exports = {
  id: 'memory-guard',
  name: { 'pt-BR': 'Disjuntor de Memória', en: 'Memory Guard' },
  description: {
    'pt-BR': 'Quando a memória do bot passa de 85% do teto, esvazia caches de imagem e deixa o cartão de perfil só em texto até baixar de 75%. Protege moderação, segurança e economia.',
    en: 'When bot memory goes over 85% of the limit, it empties image caches and keeps the profile card text-only until it drops below 75%. Protects moderation, safety and economy.',
  },
  icon: '🧯',
  defaultEnabled: true,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    guard.startSampling();
    guard.onStateChange((state, s) => {
      console.warn(`[MemoryGuard] ${state}: ${s.heapUsedMb}/${s.heapLimitMb} MB, atraso p99 ${s.loopP99Ms} ms`);
      if (state !== 'pressure' || Date.now() - lastDm < DM_EVERY_MS) return;
      lastDm = Date.now();
      ctx.client.users
        .fetch(OWNER_SNOWFLAKE)
        .then((u) => u.send({ content: t('memoryGuard.dm', 'pt', { used: `\`${s.heapUsedMb}\``, limit: `\`${s.heapLimitMb}\`` }), allowedMentions: { parse: [] } }))
        .catch(() => null);
    });
    ctx.registerInterval(() => guard.check(), CHECK_MS);
  },

  async onUnload() {
    guard.stopSampling();
    guard.reset();
  },
};

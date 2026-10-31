// Assinatura mensal do servidor: reconcilia Pix pendente, manda DM de cobrança (D-7/D-3/D-0),
// avisa o corte e entrega a fila gravada pelo webhook. Só roda no processo do bot.
const { EmbedBuilder } = require('discord.js');
const plans = require('../../services/guildPlans');
const payments = require('../../services/planPayments');
const notices = require('../../services/planNotices');
const { getLanguage, t } = require('../../utils/i18n');

const DAY = 24 * 60 * 60 * 1000;
const CHECK_MS = 30 * 60 * 1000;
const COLORS = { activated: 0x10b981, reminder: 0xf59e0b, expired: 0xef4444 };

const planLabel = (plan, lang) => t(`plans.name.${plan || 'basic'}`, lang);
const panelLink = (guildId) => `${payments.publicUrl()}/dashboard/dashboard.html#/guild/${guildId}/planos`;

function card(lang, guildName, { title, lines, color }) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(lines.filter(Boolean).join('\n\n').slice(0, 4000))
    .setFooter({ text: t('plans.footer', lang, { server: guildName }) })
    .setTimestamp();
}

function payloadFor(notice, lang) {
  const plan = planLabel(notice.plan, lang);
  const link = panelLink(notice.guildId);
  if (notice.kind === 'activated') {
    return { color: COLORS.activated, title: t('plans.dm.activatedTitle', lang, { plan }), lines: [t('plans.dm.activatedBody', lang, { plan })] };
  }
  if (notice.kind === 'expired') {
    return { color: COLORS.expired, title: t('plans.dm.expiredTitle', lang), lines: [t('plans.dm.expiredBody', lang, { plan, link })] };
  }
  return { color: COLORS.reminder, title: t('plans.dm.reminderTitle', lang), lines: [t('plans.dm.reminderBody', lang, { plan, link })] };
}

/** Chamado pelo webhook (processo web): só enfileira, quem envia é o bot. */
async function notifyActivated(guildId, plan) {
  return notices.push({ guildId, kind: 'activated', plan });
}

async function tick(client, now = Date.now()) {
  const rec = await payments.reconcilePending({ now }).catch(() => ({ checked: 0, activated: 0 }));
  if (rec.activated) console.log(`[plans] ${rec.activated} assinatura(s) ativadas por reconciliação.`);

  // Lembretes D-7/D-3/D-0 e corte (marca para não repetir)
  for (const record of plans.listPlans()) {
    if (record.plan === 'free') continue;
    const info = plans.getPlan(record.guildId, now);
    if (info.active && info.paidUntil > 0) {
      const days = Math.ceil((info.paidUntil - now) / DAY);
      const step = days <= 0 ? 'reminder0' : days <= 3 ? 'reminder3' : days <= 7 ? 'reminder7' : null;
      if (step && !notices.hasMark(record.guildId, step)) {
        notices.push({ guildId: record.guildId, kind: 'reminder', plan: record.plan });
        notices.mark(record.guildId, step, now);
      }
    } else if (info.expired && !notices.hasMark(record.guildId, 'expired')) {
      notices.push({ guildId: record.guildId, kind: 'expired', plan: record.plan });
      notices.mark(record.guildId, 'expired', now);
    }
  }

  // Entrega das DMs para o dono do servidor
  let sent = 0;
  for (const notice of notices.takeAll()) {
    const guild = client.guilds.cache.get(notice.guildId);
    if (!guild) continue;
    const owner = await guild.fetchOwner?.().catch(() => null);
    if (!owner?.send) continue;
    const lang = getLanguage(notice.guildId);
    const { color, title, lines } = payloadFor(notice, lang);
    const canvas = card(lang, guild.name, { title, lines, color });
    const ok = await owner.send({ embeds: [canvas], allowedMentions: { parse: [], users: [], roles: [] } }).catch(() => null);
    if (ok) sent += 1;
    else console.warn(`[plans] DM de ${notice.kind} não entregue para o dono de ${notice.guildId}.`);
  }
  return { ...rec, sent };
}

module.exports = {
  id: 'plans',
  name: { 'pt-BR': 'Assinatura dos Servidores', en: 'Server Subscription' },
  description: {
    'pt-BR': 'Plano mensal do servidor (Básico/Premium): avisa por DM antes e depois do vencimento.',
    en: 'Monthly server plan (Basic/Premium): DMs before and after the due date.',
  },
  icon: '💳',
  defaultEnabled: true,
  notifyActivated,
  tick,
  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = () => tick(ctx.client).catch((err) => console.error('[Plans] tick:', err));
    ctx.registerInterval(safe, CHECK_MS);
    ctx.registerTimeout(safe, 90 * 1000);
  },
};

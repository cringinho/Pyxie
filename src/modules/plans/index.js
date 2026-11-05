// Assinatura mensal do servidor: reconcilia Pix pendente, manda DM de cobrança (D-7/D-3/D-0),
// avisa o corte e entrega a fila gravada pelo webhook. Só roda no processo do bot.
const { EmbedBuilder } = require('discord.js');
const plans = require('../../services/guildPlans');
const payments = require('../../services/planPayments');
const notices = require('../../services/planNotices');
const guildAddons = require('../../services/guildAddons');
const planAddons = require('../../config/planAddons');
const pyFundadorCmd = require('./commands/pyFundador');
const { getLanguage, t } = require('../../utils/i18n');

const DAY = 24 * 60 * 60 * 1000;
const CHECK_MS = 30 * 60 * 1000;
const COLORS = { activated: 0x10b981, reminder: 0xf59e0b, expired: 0xef4444 };

const planLabel = (plan, lang) => t(`plans.name.${plan || 'basic'}`, lang);
const panelLink = (guildId) => `${payments.publicUrl()}/dashboard#/guild/${guildId}/planos`;

function card(lang, guildName, { title, lines, color }) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(lines.filter(Boolean).join('\n\n').slice(0, 4000))
    .setFooter({ text: t('plans.footer', lang, { server: guildName }) })
    .setTimestamp();
}

function payloadFor(notice, lang) {
  if (notice.kind === 'addon_reminder' || notice.kind === 'addon_expired') {
    const expired = notice.kind === 'addon_expired';
    const addon = planAddons.labelOf(notice.addonId, lang);
    return {
      color: expired ? COLORS.expired : COLORS.reminder,
      title: t(expired ? 'plans.dm.addonExpiredTitle' : 'plans.dm.addonReminderTitle', lang),
      lines: [
        t(expired ? 'plans.dm.addonExpiredBody' : 'plans.dm.addonReminderBody', lang, {
          addon,
          days: notice.days,
          link: panelLink(notice.guildId),
        }),
      ],
    };
  }
  const plan = planLabel(notice.plan, lang);
  const link = panelLink(notice.guildId);
  if (notice.kind === 'activated') {
    return { color: COLORS.activated, title: t('plans.dm.activatedTitle', lang, { plan }), lines: [t('plans.dm.activatedBody', lang, { plan })] };
  }
  if (notice.kind === 'expired') {
    return { color: COLORS.expired, title: t('plans.dm.expiredTitle', lang), lines: [t('plans.dm.expiredBody', lang, { plan, link })] };
  }
  if (notice.kind === 'card_reminder') {
    // Renovação no cartão: avisa a data da cobrança automática, sem pedir para pagar de novo (Q255).
    const date = new Date(notice.paidUntil || Date.now()).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'America/Sao_Paulo' });
    return { color: COLORS.reminder, title: t('plans.dm.cardReminderTitle', lang), lines: [t('plans.dm.cardReminderBody', lang, { plan, date, link })] };
  }
  return { color: COLORS.reminder, title: t('plans.dm.reminderTitle', lang), lines: [t('plans.dm.reminderBody', lang, { plan, link })] };
}

/** Chamado pelo webhook (processo web): só enfileira, quem envia é o bot. */
async function notifyActivated(guildId, plan) {
  return notices.push({ guildId, kind: 'activated', plan });
}

/** Quais extras precisam de aviso agora (D-7, D-3, D-0 e expirado). Função pura: testável. */
function addonNoticesDue({ now = Date.now(), list = [] } = {}) {
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    if (!item || !item.addonId || item.lifetime || !item.until) continue;
    if (!item.active && !item.expired) continue;
    const days = Math.ceil((item.until - now) / DAY);
    if (days <= 0) out.push({ ...item, kind: 'addon_expired', step: '0', days: 0 });
    else if (days <= 3) out.push({ ...item, kind: 'addon_reminder', step: '3', days });
    else if (days <= 7) out.push({ ...item, kind: 'addon_reminder', step: '7', days });
  }
  return out;
}

/** Quem renova sozinho no cartão recebe outro texto de lembrete (Q255). Função pura: testável. */
function reminderKindFor(guildId, info = {}) {
  if (info.lifetime) return null;
  return payments.activeCardSubscription?.(guildId) ? 'card_reminder' : 'reminder';
}

async function tick(client, now = Date.now()) {
  const rec = await payments.reconcilePending({ now }).catch(() => ({ checked: 0, activated: 0 }));
  if (rec.activated) console.log(`[plans] ${rec.activated} assinatura(s) ativadas por reconciliação.`);
  // Doações do /py-home: o aviso do Mercado Pago pode se perder; confere as pendentes (Q243).
  const don = await require('../../services/donations').reconcilePending({ now }).catch(() => ({ checked: 0, registered: 0 }));
  if (don.registered) console.log(`[plans] ${don.registered} doação(ões) registradas por reconciliação.`);

  // Programa Fundador: inatividade e vencimento das 20 vagas.
  const founder = require('../../services/founderProgram').sweep({ now });
  if (founder.paused.length) console.log(`[plans] Vaga(s) fundador pausada(s): ${founder.paused.join(', ')}`);

  // Extras: D-7, D-3, D-0 e expirado — uma DM por marco, sem repetir.
  try {
    // Grava o vencimento no arquivo (antes só era calculado na leitura: painel, log e DM
    // saíam de estados diferentes). Roda antes dos avisos para o estado estar coerente.
    const swept = guildAddons.sweep(now);
    if (swept.length) console.log(`[plans] ${swept.length} extra(s) marcados como vencidos.`);

    for (const item of addonNoticesDue({ now, list: guildAddons.listAll() })) {
      const key = `addon:${item.addonId}:${item.step}`;
      if (notices.hasCustomMark(item.guildId, key)) continue;
      const queued = notices.push({
        guildId: item.guildId,
        kind: item.kind,
        addonId: item.addonId,
        step: item.step,
        days: item.days,
        at: now,
      });
      if (queued) notices.markCustom(item.guildId, key, now);
    }
  } catch (err) {
    console.warn('[plans] Avisos de extra:', err.message);
  }

  // Lembretes D-7/D-3/D-0 e corte (marca para não repetir)
  for (const record of plans.listPlans()) {
    if (record.plan === 'free') continue;
    const info = plans.getPlan(record.guildId, now);
    if (info.active && info.paidUntil > 0) {
      const days = Math.ceil((info.paidUntil - now) / DAY);
      const step = days <= 0 ? 'reminder0' : days <= 3 ? 'reminder3' : days <= 7 ? 'reminder7' : null;
      if (step && !notices.hasMark(record.guildId, step)) {
        const card = reminderKindFor(record.guildId, info);
        // Cartão renovando: um aviso só (D-3) com a data da cobrança; o pedido de renovação
        // fica para quem paga por Pix ou quando a cobrança do cartão falhar e o plano vencer.
        if (card === 'card_reminder') {
          if (step === 'reminder3') notices.push({ guildId: record.guildId, kind: 'card_reminder', plan: record.plan, paidUntil: info.paidUntil });
        } else {
          notices.push({ guildId: record.guildId, kind: 'reminder', plan: record.plan });
        }
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
  commands: [pyFundadorCmd],
  notifyActivated,
  addonNoticesDue,
  reminderKindFor,
  payloadFor,
  tick,
  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    const safe = () => tick(ctx.client).catch((err) => console.error('[Plans] tick:', err));
    ctx.registerInterval(safe, CHECK_MS);
    ctx.registerTimeout(safe, 90 * 1000);
  },
};

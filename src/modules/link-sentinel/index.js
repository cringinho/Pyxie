// Monitor de links (plano 5.6): roda uma vez por dia às 4h de Brasília e manda DM ao dono com
// os botões Trocar link, Testar de novo e Silenciar 7 dias.
const path = require('node:path');
const sentinel = require('../../services/linkSentinel');
const store = require('../../services/messageStudioStore');
const { OWNER_SNOWFLAKE } = require('../../config/scopes');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const lang = 'pt'; // o dono fala português

function alertPayload(alert) {
  const { link } = alert;
  const lines = [
    t(alert.kind === 'down' ? 'linkSentinel.downIntro' : 'linkSentinel.redirectIntro', lang),
    `• **${t('linkSentinel.where', lang)}:** ${link.label || link.source || '—'}`,
    `• **${t('linkSentinel.link', lang)}:** ${link.url}`,
    `• **${t('linkSentinel.diagnosis', lang)}:** \`${alert.diagnosis || '—'}\``,
  ];
  if (alert.kind === 'down') {
    lines.push(`• **${t('linkSentinel.action', lang)}:** ${alert.replacement ? t('linkSentinel.usingReplacement', lang, { url: alert.replacement }) : t('linkSentinel.noReplacement', lang)}`);
  } else {
    lines.push(`• **${t('linkSentinel.action', lang)}:** ${t('linkSentinel.proposal', lang, { url: alert.proposed })}`);
  }
  return {
    embeds: [{ color: alert.kind === 'down' ? 0xef4444 : 0xf59e0b, title: t('linkSentinel.title', lang), description: lines.join('\n\n'), timestamp: new Date().toISOString() }],
    components: [
      {
        type: 1,
        components: [
          { type: 2, style: 1, label: t('linkSentinel.btnSwap', lang), emoji: { name: '🔁' }, custom_id: `lsnt:swap:${link.id}` },
          { type: 2, style: 2, label: t('linkSentinel.btnRetest', lang), emoji: { name: '🔄' }, custom_id: `lsnt:retest:${link.id}` },
          { type: 2, style: 2, label: t('linkSentinel.btnMute', lang), emoji: { name: '🔕' }, custom_id: `lsnt:mute:${link.id}` },
        ],
      },
    ],
    allowedMentions: { parse: [] },
  };
}

async function runDaily(client, now = Date.now()) {
  if (!sentinel.shouldRunDaily(now)) return null;
  sentinel.markDailyRun(now);
  const studioDocs = store.listGuildsWithMessages().flatMap((g) => store.listMessages(g).map((m) => store.getMessage(g, m.id)).filter(Boolean));
  sentinel.syncKnownLinks({ publicDir: path.join(__dirname, '..', '..', '..', 'public'), studioDocs });
  const alerts = await sentinel.checkAll({ now });
  if (!alerts.length) return alerts;
  const owner = await client.users.fetch(OWNER_SNOWFLAKE).catch(() => null);
  for (const alert of alerts) await owner?.send(alertPayload(alert)).catch(() => null);
  return alerts;
}

async function handleInteraction(interaction) {
  const id = interaction.customId || '';
  if (!id.startsWith('lsnt:') && !id.startsWith('lsntm:')) return;
  if (interaction.user.id !== OWNER_SNOWFLAKE) {
    return interaction.reply({ content: t('linkSentinel.ownerOnly', interaction), flags: EPHEMERAL });
  }
  if (interaction.isModalSubmit() && id.startsWith('lsntm:')) {
    const linkId = id.split(':')[1];
    try {
      const updated = sentinel.updateLink(linkId, { url: interaction.fields.getTextInputValue('url').trim() });
      return interaction.reply({ content: updated ? t('linkSentinel.swapped', lang, { url: updated.url }) : t('linkSentinel.notFound', lang), flags: EPHEMERAL });
    } catch (_) {
      return interaction.reply({ content: t('linkSentinel.invalidUrl', lang), flags: EPHEMERAL });
    }
  }
  const [, action, linkId] = id.split(':');
  const link = sentinel.listLinks().find((l) => l.id === linkId);
  if (!link) return interaction.reply({ content: t('linkSentinel.notFound', lang), flags: EPHEMERAL });
  if (action === 'swap') {
    return interaction.showModal({
      custom_id: `lsntm:${linkId}`,
      title: t('linkSentinel.btnSwap', lang),
      components: [{ type: 1, components: [{ type: 4, custom_id: 'url', label: t('linkSentinel.newUrl', lang), style: 1, required: true, max_length: 500, value: (link.proposedUrl || link.url).slice(0, 500) }] }],
    });
  }
  if (action === 'retest') {
    const r = await sentinel.probe(link.url);
    return interaction.reply({ content: r.ok ? t('linkSentinel.retestOk', lang, { status: r.status }) : t('linkSentinel.retestFail', lang, { diagnosis: r.diagnosis }), flags: EPHEMERAL });
  }
  if (action === 'mute') {
    sentinel.updateLink(linkId, { mutedUntil: Date.now() + WEEK_MS });
    return interaction.reply({ content: t('linkSentinel.muted', lang), flags: EPHEMERAL });
  }
  return undefined;
}

module.exports = {
  id: 'link-sentinel',
  name: { 'pt-BR': 'Monitor de Links', en: 'Link Monitor' },
  description: {
    'pt-BR': 'Confere todo dia às 4h os links dos guias e das mensagens do estúdio; avisa o dono depois de 2 falhas seguidas e nunca troca link de domínio sozinho.',
    en: 'Checks the links in guides and studio messages every day at 4 AM; warns the owner after 2 failures in a row and never swaps a domain on its own.',
  },
  icon: '🔗',
  defaultEnabled: true,
  guildScope: null,
  runDaily,
  alertPayload,
  handleInteraction,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerInterval(() => {
      runDaily(ctx.client).catch((err) => console.error('[LinkSentinel] Erro na verificação:', err));
    }, 5 * 60 * 1000);
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction).catch((err) => console.error('[LinkSentinel] Erro na interação:', err));
    });
  },
};

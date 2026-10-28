// Filtros prontos do AutoMod nativo (palavrões, conteúdo sexual, ofensas) e limite de menções.
// O Discord só aceita UMA regra de cada tipo por servidor: se já houver uma feita à mão, avisa em vez
// de criar outra. Sincroniza no salvamento pelo painel via REST (precisa de Gerenciar Servidor).
const RULE_PRESET = 'Pyxie · Filtros prontos';
const RULE_MENTION = 'Pyxie · Menções em massa';
const PRESET_IDS = { profanity: 1, sexual: 2, slurs: 3 };
const TRIGGER = { preset: 4, mention: 5 };

function desired(cfg) {
  const exempt_channels = cfg.exemptChannelIds || [];
  const block = [{ type: 1, metadata: {} }]; // BLOCK_MESSAGE
  return [
    {
      trigger_type: TRIGGER.preset,
      want: cfg.enabled && cfg.presets.length > 0,
      body: { name: RULE_PRESET, event_type: 1, trigger_type: TRIGGER.preset, trigger_metadata: { presets: cfg.presets.map((p) => PRESET_IDS[p]).filter(Boolean), allow_list: [] }, actions: block, enabled: true, exempt_channels },
    },
    {
      trigger_type: TRIGGER.mention,
      want: cfg.enabled && cfg.mentionLimit > 0,
      body: { name: RULE_MENTION, event_type: 1, trigger_type: TRIGGER.mention, trigger_metadata: { mention_total_limit: cfg.mentionLimit, mention_raid_protection_enabled: true }, actions: block, enabled: true, exempt_channels },
    },
  ];
}

// discord(method, route, body): cliente REST (messageStudioStore.discord), injetável nos testes.
async function sync(guildId, cfg, { discord }) {
  const rules = (await discord('GET', `/guilds/${guildId}/auto-moderation/rules`)) || [];
  const result = {};
  for (const d of desired(cfg)) {
    const same = rules.filter((r) => r.trigger_type === d.trigger_type);
    const ours = same.find((r) => r.name === d.body.name);
    if (d.want) {
      if (!ours && same.length) {
        const err = new Error('automod_exists');
        err.code = 'automod_exists';
        throw err;
      }
      result[d.trigger_type] = ours
        ? await discord('PATCH', `/guilds/${guildId}/auto-moderation/rules/${ours.id}`, d.body)
        : await discord('POST', `/guilds/${guildId}/auto-moderation/rules`, d.body);
    } else if (ours) {
      await discord('DELETE', `/guilds/${guildId}/auto-moderation/rules/${ours.id}`);
    }
  }
  return result;
}

module.exports = { sync, desired, RULE_PRESET, RULE_MENTION };

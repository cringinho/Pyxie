// Canal de cores (plano 5.13): escolher uma das 75 cores troca a cor anterior; o botão tira todas.
const colorRoles = require('../../services/colorRoles');
const { CRINGELANDIA_GUILD_ID } = require('../../config/scopes');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;

async function handleInteraction(interaction) {
  const id = interaction.customId || '';
  if (!id.startsWith('colors:') || !interaction.guild) return;
  const member = interaction.member;
  const all = colorRoles.colorRoleIds(interaction.guildId);
  const current = member.roles.cache.filter((r) => all.includes(r.id));

  if (id === 'colors:clear') {
    if (current.size) await member.roles.remove([...current.keys()], 'Pyxie: tirou a cor').catch(() => null);
    return interaction.reply({ content: t('colors.cleared', interaction), flags: EPHEMERAL });
  }

  if (interaction.isStringSelectMenu() && id.startsWith('colors:pick:')) {
    const n = Number(interaction.values[0]);
    const roleId = colorRoles.loadMap(interaction.guildId)[n];
    const role = roleId && interaction.guild.roles.cache.get(roleId);
    if (!role || !role.editable) return interaction.reply({ content: t('colors.error', interaction), flags: EPHEMERAL });
    // Uma cor por vez: tira as outras e põe a escolhida.
    const others = [...current.keys()].filter((r) => r !== roleId);
    if (others.length) await member.roles.remove(others, 'Pyxie: troca de cor').catch(() => null);
    if (!member.roles.cache.has(roleId)) await member.roles.add(roleId, 'Pyxie: escolheu a cor').catch(() => null);
    const entry = colorRoles.catalogEntry(n);
    return interaction.reply({ content: t('colors.applied', interaction, { color: `**${entry?.name || role.name}**` }), flags: EPHEMERAL });
  }
  return undefined;
}

module.exports = {
  id: 'colors',
  name: { 'pt-BR': 'Cores', en: 'Colors' },
  description: {
    'pt-BR': 'Canal de cores com 75 cargos de cor, menus por faixa e botão para tirar a cor. Substitui o Dyno e o Carl.',
    en: 'Color channel with 75 color roles, one menu per range and a button to remove your color. Replaces Dyno and Carl.',
  },
  icon: '🎨',
  // Exclusivo do servidor oficial (plano 5.13).
  guildScope: [CRINGELANDIA_GUILD_ID],
  defaultEnabled: true,
  handleInteraction,

  async onLoad(ctx) {
    if (!ctx.isBotProcess) return;
    ctx.registerListener('interactionCreate', (interaction) => {
      handleInteraction(interaction).catch((err) => console.error('[Colors] Erro na interação:', err));
    });
  },
};

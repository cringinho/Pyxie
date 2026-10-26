const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const { columns, decorate, field } = require('../../../utils/embedLayout');
const store = require('../characterStore');

/**
 * /py-character: ficha de personagem do roleplay (create · view · bio · train · rest).
 * A ficha é da pessoa e vale em qualquer servidor; as cenas narradas ficam no Pyxie's Realm.
 */

const name = 'py-character';
const COLOR = 0x8b5cf6;

const statChoices = () =>
  store.STATS.map((stat) => ({ name: t(`roleplay.stats.${stat}`, 'en'), name_localizations: { 'pt-BR': t(`roleplay.stats.${stat}`, 'pt') }, value: stat }));

const statOption = (stat, en, pt) => (opt) =>
  opt.setName(stat).setDescription(en).setDescriptionLocalizations({ 'pt-BR': pt }).setRequired(true).setMinValue(1).setMaxValue(5);

function buildSheet(userId, lang) {
  const c = store.getCharacter(userId);
  if (!c) return null;
  const key = lang === 'en' ? 'en' : 'pt';
  const level = store.levelOf(c.xp);
  const stats = store.STATS.map((stat) => t('roleplay.character.statLine', lang, { stat: t(`roleplay.stats.${stat}`, lang), value: c.stats[stat] }));
  const list = (items) => (items.length ? items.map((i) => `• ${i}`).join('\n') : t('roleplay.character.none', lang));
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('roleplay.character.title', lang, { name: c.name }))
    .setDescription(
      [
        t('roleplay.character.subtitle', lang, { ancestry: store.ANCESTRIES[c.ancestry].name[key], level, xp: c.xp, next: level * store.XP_PER_LEVEL }),
        c.bio ? `> ${c.bio}` : null,
        c.unspent > 0 ? t('roleplay.character.unspent', lang, { points: c.unspent }) : null,
      ]
        .filter(Boolean)
        .join('\n\n')
    )
    .addFields(
      ...columns(
        [t('roleplay.character.vitalsName', lang), t('roleplay.character.vitals', lang, { hp: c.hp, max: store.maxHp(c.stats), mp: c.mp, mpMax: store.maxMp(c.stats) })],
        [t('roleplay.character.statsName', lang), stats.join('\n')]
      ),
      field('​', '​'),
      ...columns([t('roleplay.character.bagName', lang), list(c.items)], [t('roleplay.character.conditionsName', lang), list(c.conditions)])
    )
    .setFooter({ text: t('roleplay.character.footer', lang) });
  return decorate(embed);
}

function reasonText(result, lang) {
  return t(`roleplay.character.reasons.${result.reason}`, lang, { points: store.POINTS, total: result.total });
}

async function executeSlash({ interaction }) {
  const lang = getLanguage(interaction);
  const reply = (payload) => interaction.editReply({ allowedMentions: { parse: [] }, ...payload });
  const sub = interaction.options.getSubcommand();
  const userId = interaction.user.id;

  if (sub === 'create') {
    const result = store.createCharacter(userId, {
      name: interaction.options.getString('name'),
      ancestry: interaction.options.getString('origin'),
      bio: interaction.options.getString('bio') || '',
      stats: Object.fromEntries(store.STATS.map((stat) => [stat, interaction.options.getInteger(stat)])),
    });
    if (!result.ok) return reply({ content: reasonText(result, lang) });
    return reply({ content: t('roleplay.character.created', lang, { name: result.character.name }), embeds: [buildSheet(userId, lang)] });
  }

  if (sub === 'view') {
    const target = interaction.options.getUser('user') || interaction.user;
    const sheet = buildSheet(target.id, lang);
    if (!sheet) return reply({ content: t(target.id === userId ? 'roleplay.character.noSheet' : 'roleplay.character.otherNoSheet', lang) });
    return reply({ embeds: [sheet] });
  }

  if (sub === 'bio') {
    const result = store.updateBio(userId, interaction.options.getString('text'));
    if (!result.ok) return reply({ content: reasonText(result, lang) });
    return reply({ content: t('roleplay.character.bioSaved', lang), embeds: [buildSheet(userId, lang)] });
  }

  if (sub === 'train') {
    const stat = interaction.options.getString('stat');
    const result = store.trainStat(userId, stat);
    if (!result.ok) return reply({ content: reasonText(result, lang) });
    return reply({ content: t('roleplay.character.trained', lang, { stat: t(`roleplay.stats.${stat}`, lang), value: result.character.stats[stat] }), embeds: [buildSheet(userId, lang)] });
  }

  if (sub === 'rest') {
    const result = store.rest(userId);
    if (!result.ok && result.reason === 'cooldown') return reply({ content: t('roleplay.character.restCooldown', lang, { time: `<t:${Math.floor(result.readyAt / 1000)}:R>` }) });
    if (!result.ok) return reply({ content: reasonText(result, lang) });
    return reply({ content: t('roleplay.character.rested', lang), embeds: [buildSheet(userId, lang)] });
  }
  return null;
}

module.exports = {
  name,
  aliases: ['character', 'personagem', 'py-personagem', 'ficha', 'py-ficha'],
  buildSheet,
  executeSlash,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Your roleplay character in Pyxie's universe")
    .setDescriptionLocalizations({ 'pt-BR': 'Sua ficha de personagem de roleplay no universo da Pyxie' })
    .addSubcommand((sub) =>
      sub
        .setName('create')
        .setDescription('Create your character (the four attributes must add up to 10)')
        .setDescriptionLocalizations({ 'pt-BR': 'Cria seu personagem (os quatro atributos somam 10)' })
        .addStringOption((opt) => opt.setName('name').setDescription('Character name').setDescriptionLocalizations({ 'pt-BR': 'Nome do personagem' }).setRequired(true).setMaxLength(32))
        .addStringOption((opt) =>
          opt
            .setName('origin')
            .setDescription('Where your character comes from')
            .setDescriptionLocalizations({ 'pt-BR': 'De onde seu personagem vem' })
            .setRequired(true)
            .addChoices(...Object.entries(store.ANCESTRIES).map(([value, a]) => ({ name: a.name.en, name_localizations: { 'pt-BR': a.name.pt }, value })))
        )
        .addIntegerOption(statOption('str', 'Strength (1-5)', 'Força (1-5)'))
        .addIntegerOption(statOption('mag', 'Magic (1-5)', 'Magia (1-5)'))
        .addIntegerOption(statOption('agi', 'Agility (1-5)', 'Agilidade (1-5)'))
        .addIntegerOption(statOption('spi', 'Spirit: willpower, charm, perception (1-5)', 'Espírito: vontade, carisma, percepção (1-5)'))
        .addStringOption((opt) => opt.setName('bio').setDescription('A short story (optional)').setDescriptionLocalizations({ 'pt-BR': 'Uma história curta (opcional)' }).setMaxLength(300))
    )
    .addSubcommand((sub) =>
      sub
        .setName('view')
        .setDescription('See a character sheet')
        .setDescriptionLocalizations({ 'pt-BR': 'Vê uma ficha de personagem' })
        .addUserOption((opt) => opt.setName('user').setDescription('Whose sheet (default: yours)').setDescriptionLocalizations({ 'pt-BR': 'De quem (padrão: a sua)' }))
    )
    .addSubcommand((sub) =>
      sub
        .setName('bio')
        .setDescription("Rewrite your character's story")
        .setDescriptionLocalizations({ 'pt-BR': 'Reescreve a história do seu personagem' })
        .addStringOption((opt) => opt.setName('text').setDescription('The new story').setDescriptionLocalizations({ 'pt-BR': 'A nova história' }).setRequired(true).setMaxLength(300))
    )
    .addSubcommand((sub) =>
      sub
        .setName('train')
        .setDescription('Spend a level point on an attribute')
        .setDescriptionLocalizations({ 'pt-BR': 'Gasta um ponto de nível num atributo' })
        .addStringOption((opt) =>
          opt.setName('stat').setDescription('Attribute').setDescriptionLocalizations({ 'pt-BR': 'Atributo' }).setRequired(true).addChoices(...statChoices())
        )
    )
    .addSubcommand((sub) =>
      sub.setName('rest').setDescription('Rest: full HP and MP, conditions healed (every 6h)').setDescriptionLocalizations({ 'pt-BR': 'Descansa: vida e mana cheias, condições curadas (a cada 6h)' })
    ),
};

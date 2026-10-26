const {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { t, getLanguage } = require('../utils/i18n');
const { getEmoji } = require('../utils/appEmojis');
const { emojify } = require('../utils/emojify');
const { ACHIEVEMENTS: NAME = 'py-achievements' } = require('./commandNames');
const achievements = require('../services/achievements');
const { CATEGORIES, TIERS } = require('../data/achievementsCatalog');

/**
 * /py-achievements: conquistas por categoria com progresso real. As míticas dão títulos com
 * formatação especial (equipáveis em /py-profile → Títulos).
 * customId: ach:cat:<dono>:<categoria>[:<quem está vendo>]
 */

const PREFIX = 'ach';
const CUSTOM_EMOJI = /^<a?:\w+:\d+>$/;

function icon(name, fallback) {
  const formatted = getEmoji(name);
  return CUSTOM_EMOJI.test(formatted || '') ? formatted : fallback;
}

function rewardSummary(entry, lang) {
  const parts = [];
  const reward = entry.reward || {};
  if (reward.coins) parts.push(t('achievements.short.coins', { lang }, { coins: reward.coins }));
  if (reward.beans) parts.push(t('achievements.short.beans', { lang }, { beans: reward.beans }));
  if (reward.items?.length) {
    try {
      const { getItem, itemName } = require('../modules/home/homeCatalog');
      for (const itemId of reward.items) parts.push(itemName(getItem(itemId), lang));
    } catch (_) {
      parts.push(t('achievements.short.item', { lang }));
    }
  }
  if (reward.title) parts.push(achievements.titleDisplay(reward.title, lang));
  return parts.join(' · ');
}

function achievementLine(result, lang) {
  const { entry, current, target, done } = result;
  const key = lang === 'en' ? 'en' : 'pt';
  if (entry.hidden && !done) return t('achievements.view.hidden', { lang });
  return t('achievements.view.line', { lang }, {
    tier: TIERS[entry.tier].emoji,
    name: entry.name[key],
    current,
    target,
    check: done ? ' ✅' : '',
    desc: entry.desc[key],
    rewards: rewardSummary(entry, lang),
  });
}

function buildAchievementsView({ owner, viewerId, source, category = 'rotina' }) {
  const lang = getLanguage(source);
  const key = lang === 'en' ? 'en' : 'pt';
  const summary = achievements.getUserSummary(owner.id);
  const mythic = summary.results.filter((r) => r.entry.tier === 'mythic');
  const selected = CATEGORIES[category] ? category : 'rotina';
  const results = summary.results
    .filter((r) => r.entry.category === selected)
    .sort((a, b) => TIERS[a.entry.tier].order - TIERS[b.entry.tier].order);

  const description = [
    t('achievements.view.summary', { lang }, {
      done: summary.done,
      total: summary.total,
      mythic: mythic.filter((r) => r.done).length,
      mythicTotal: mythic.length,
    }),
    t('achievements.view.categoryHeader', { lang }, { emoji: CATEGORIES[selected].emoji, name: CATEGORIES[selected][key] }),
    ...results.map((r) => achievementLine(r, lang)),
    t('achievements.view.titlesHint', { lang }),
  ].join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(TIERS.mythic.color)
    .setTitle(t('achievements.view.title', { lang }, { icon: icon('win', '🏆'), name: owner.displayName || owner.username }))
    .setDescription(emojify(description))
    .setFooter({ text: `Pyxie • ${source?.guild?.name || t('home.private', { lang })}` });

  const menu = new StringSelectMenuBuilder()
    .setCustomId([PREFIX, 'cat', owner.id, viewerId].join(':'))
    .setPlaceholder(t('achievements.view.placeholder', { lang }))
    .addOptions(Object.entries(CATEGORIES).map(([id, cat]) => {
      const inCat = summary.results.filter((r) => r.entry.category === id);
      return {
        label: `${cat[key]} (${inCat.filter((r) => r.done).length}/${inCat.length})`,
        value: id,
        emoji: cat.emoji,
        default: id === selected,
      };
    }));

  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)], allowedMentions: { parse: [] } };
}

function isAchievementsInteraction(interaction) {
  return interaction.isStringSelectMenu?.() && String(interaction.customId || '').startsWith(`${PREFIX}:`);
}

async function handleAchievementsInteraction(interaction) {
  const [, action, ownerId, viewerId] = interaction.customId.split(':');
  const lang = getLanguage(interaction);
  if (action !== 'cat') return null;
  if (interaction.user.id !== viewerId) {
    return interaction.reply({ content: t('achievements.view.notYours', { lang }), flags: 64 });
  }
  const ownerUser = await interaction.client.users.fetch(ownerId).catch(() => null);
  const owner = ownerUser
    ? { id: ownerUser.id, username: ownerUser.username, displayName: ownerUser.globalName || ownerUser.username }
    : { id: ownerId, username: ownerId };
  return interaction.update(buildAchievementsView({ owner, viewerId, source: interaction, category: interaction.values?.[0] }));
}

function personFrom(user) {
  return { id: user.id, username: user.username, displayName: user.globalName || user.username };
}

module.exports = {
  name: NAME,
  aliases: ['achievements', 'conquistas', 'py-conquistas', 'conquista', 'py-conquista'],
  category: 'economia',
  buildAchievementsView,
  isAchievementsInteraction,
  handleAchievementsInteraction,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('See your achievements, rewards and the special titles you can unlock.')
    .setDescriptionLocalizations({
      'pt-BR': 'Veja suas conquistas, recompensas e os títulos especiais que dá para desbloquear.',
    })
    .addUserOption((option) => option
      .setName('user')
      .setNameLocalizations({ 'pt-BR': 'pessoa' })
      .setDescription('See someone else’s achievements.')
      .setDescriptionLocalizations({ 'pt-BR': 'Veja as conquistas de outra pessoa.' })
      .setRequired(false)),

  async executeSlash({ interaction }) {
    // Verifica antes de mostrar, para a tela já sair com o que acabou de ser alcançado
    const unlocked = achievements.checkAndGrant(interaction.user.id);
    const target = interaction.options.getUser('user');
    const owner = personFrom(target && !target.bot ? target : interaction.user);
    await interaction.editReply(buildAchievementsView({ owner, viewerId: interaction.user.id, source: interaction }));
    if (unlocked.length) {
      await interaction.followUp({ embeds: [achievements.buildUnlockEmbed(unlocked, interaction)], flags: 64 }).catch(() => null);
    }
  },

  async executePrefix({ message }) {
    const unlocked = achievements.checkAndGrant(message.author.id);
    const target = message.mentions?.users?.first();
    const owner = personFrom(target && !target.bot ? target : message.author);
    await message.reply(buildAchievementsView({ owner, viewerId: message.author.id, source: message }));
    if (unlocked.length) {
      await message.reply({ embeds: [achievements.buildUnlockEmbed(unlocked, message)], allowedMentions: { parse: [], repliedUser: false } }).catch(() => null);
    }
  },
};

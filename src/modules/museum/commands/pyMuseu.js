const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getLanguage, t } = require('../../../utils/i18n');
const museumManager = require('../museumManager');

const name = 'py-museum';
const aliases = ['museu', 'py-museu', 'museum'];

function buildView(source) {
  const lang = getLanguage(source);
  const base = (process.env.PUBLIC_BASE_URL || 'http://pyxie.duckdns.org').replace(/\/+$/, '');
  const url = `${base}/museum.html?lang=${lang}`;
  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(t('museum.title', source))
    .setDescription(`${t('museum.desc', source)}\n\n${t('museum.link_hint', source, { url })}`)
    .setFooter({ text: t('museum.stats', source, { count: museumManager.getCount() }) });
  return { embeds: [embed] };
}

module.exports = {
  name,
  aliases,
  category: 'social',
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Open the Community Art Museum gallery on the website.')
    .setDescriptionLocalizations({
      'pt-BR': 'Abra a galeria do Museu da Comunidade no site.',
    }),
  async executeSlash({ interaction }) {
    await interaction.editReply(buildView(interaction));
  },
  async executePrefix({ message }) {
    await message.reply(buildView(message));
  },
};


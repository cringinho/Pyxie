const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');

const robloxHelper = require('../utils/robloxHelper');
const maryStudioManager = require('../maryStudioManager');
const { t } = require('../../../utils/i18n');

const name = 'py-gamepass';
const aliases = ['gamepass', 'py-gamepass', 'checar-gamepass', 'check-gamepass'];

async function executeGamepassInspection(input, wantedRobux, source) {
  if (!input) {
    return {
      content: '❌ Por favor, informe o link ou o ID da Gamepass do Roblox.',
      ephemeral: true,
    };
  }

  const result = await robloxHelper.fetchRobloxGamepass(input);
  if (!result.success) {
    return {
      content: `❌ ${result.error || 'Não foi possível encontrar esta Gamepass no Roblox.'}`,
      ephemeral: true,
    };
  }

  const config = maryStudioManager.loadConfig();
  const rate = Number(config.preco1k) || 37.0;
  const priceBrl = robloxHelper.calcPriceBRL(result.liquidRobux, rate);

  let validationText = null;
  if (wantedRobux && Number(wantedRobux) > 0) {
    const numWanted = Number(wantedRobux);
    const expectedGross = robloxHelper.calcRobuxGamepass(numWanted);
    if (result.priceInRobux === expectedGross) {
      validationText = `✅ **Preço 100% Correto!**\nA Gamepass foi colocada por **${expectedGross.toLocaleString('pt-BR')} Robux**, garantindo exatamente os **${numWanted.toLocaleString('pt-BR')} Robux** líquidos combinados.`;
    } else {
      validationText = `⚠️ **Preço Divergente!**\nA Gamepass está custando **${result.priceInRobux.toLocaleString('pt-BR')} Robux** (o comprador recebe **${result.liquidRobux.toLocaleString('pt-BR')} Robux**).\nPara receber **${numWanted.toLocaleString('pt-BR')} Robux**, o valor correto a colocar é **${expectedGross.toLocaleString('pt-BR')} Robux**!`;
    }
  }

  const statusStr = result.isForSale && result.priceInRobux > 0
    ? '🟢 **Item à Venda**'
    : '🔴 **Item Fora de Venda / Sem Preço**';

  const embed = new EmbedBuilder()
    .setColor(result.isForSale ? '#ec4899' : '#ef4444')
    .setTitle(`🎀・${result.name.slice(0, 200)}`)
    .setDescription(
      `Confira abaixo os dados oficiais da Gamepass consultados diretamente no Roblox:\n\n` +
      `• **Status:** ${statusStr}\n` +
      `• **Criador:** \`${result.creatorName}\` (${result.creatorType})\n` +
      `• **Preço Bruto:** **${result.priceInRobux.toLocaleString('pt-BR')} Robux**\n` +
      `• **Líquido (Recebe 70%):** **${result.liquidRobux.toLocaleString('pt-BR')} Robux**\n` +
      `• **Cotação Estimada:** **R$ ${priceBrl.toFixed(2).replace('.', ',')}** (taxa R$ ${rate.toFixed(2).replace('.', ',')}/1k)\n\n` +
      (validationText ? `${validationText}\n\n` : '') +
      `⚠️ **Aviso Importante:** Certifique-se de que a opção de **Preços Regionais** está desativada no Creator Hub do Roblox!`
    )
    .setFooter({ text: 'Mary Store • Validador Oficial de Gamepasses' })
    .setTimestamp();

  if (result.iconUrl) {
    embed.setThumbnail(result.iconUrl);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Abrir e Comprar no Roblox')
      .setEmoji('🛒')
      .setStyle(ButtonStyle.Link)
      .setURL(result.buyUrl)
  );

  return {
    embeds: [embed],
    components: [row],
  };
}

module.exports = {
  name,
  aliases,
  category: 'utilidades',
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("Inspect a Roblox Gamepass and verify pricing with 30% tax calculation.")
    .setDescriptionLocalizations({
      'pt-BR': 'Inspeciona uma Gamepass do Roblox e valida a taxa de 30% do criador.',
    })
    .addStringOption((opt) =>
      opt
        .setName('gamepass')
        .setDescription('URL or ID of the Roblox Gamepass to inspect.')
        .setDescriptionLocalizations({
          'pt-BR': 'Link ou ID numérico da Gamepass no Roblox.',
        })
        .setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt
        .setName('robux')
        .setDescription('Desired net Robux amount to verify if price is correct.')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade de Robux desejada para checar se o preço está correto.',
        })
        .setRequired(false)
        .setMinValue(1)
    ),

  async executeSlash({ interaction }) {
    const input = interaction.options.getString('gamepass');
    const wanted = interaction.options.getInteger('robux');
    const view = await executeGamepassInspection(input, wanted, interaction);
    await interaction.reply(view);
  },

  async executePrefix({ message, args }) {
    const input = args[0];
    const wanted = args[1] ? parseInt(args[1], 10) : null;
    const view = await executeGamepassInspection(input, wanted, message);
    await message.reply(view);
  },

  executeGamepassInspection,
};

const { EmbedBuilder } = require('discord.js');
const { getLanguage } = require('../../utils/i18n');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pipeline visual assíncrono do sorteio de filiação (Pyxie Marriage Core)
 * Executa 3 edições assíncronas na mesma mensagem com intervalos de 1200ms
 * 
 * @param {object} params
 * @param {object} params.target - Message ou Interaction editável
 * @param {string} params.gender - 'male' ou 'female'
 * @param {string} [params.lang] - 'pt' ou 'en'
 * @returns {Promise<string>} O gênero confirmado
 */
async function playChildBirthAnimation({ target, gender, lang = 'pt' }) {
  const chosenGender = gender || (Math.random() < 0.5 ? 'male' : 'female');
  const isEn = lang === 'en';

  // Helper para atualizar message ou interaction
  const editTarget = async (embed) => {
    try {
      if (typeof target.editReply === 'function') {
        await target.editReply({ embeds: [embed], components: [] });
      } else if (typeof target.edit === 'function') {
        await target.edit({ embeds: [embed], components: [] });
      } else if (typeof target.update === 'function') {
        await target.update({ embeds: [embed], components: [] });
      }
    } catch (err) {
      // Ignora erro se mensagem foi excluída no Discord
    }
  };

  // Frame 1: O Berço Arcano
  const frame1Embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(isEn ? '✨ The Arcane Cradle' : '✨ O Berço Arcano')
    .setDescription(
      isEn
        ? '✨ A mystical cradle emerges amidst lilac mists and starlight sparks... Pyxie\'s arcane stork has been sighted!'
        : '✨ Um berço místico surge em meio a névoas lilases e faíscas estelares... A cegonha arcana da Pyxie foi avistada!'
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  await editTarget(frame1Embed);
  await sleep(1200);

  // Frame 2: A Cesta Cósmica
  const frame2Embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(isEn ? '🌙 The Cosmic Basket' : '🌙 A Cesta Cósmica')
    .setDescription(
      isEn
        ? '🌙 The satin basket descends softly into the room... Destiny decides the spark of the child!'
        : '🌙 A cesta de cetim desce suavemente na sala... O destino decide a centelha da criança!'
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  await editTarget(frame2Embed);
  await sleep(1200);

  // Frame 3: A Revelação
  const genderLabelPt = chosenGender === 'male' ? 'Menino 👦' : 'Menina 👧';
  const genderLabelEn = chosenGender === 'male' ? 'Boy 👦' : 'Girl 👧';

  const frame3Embed = new EmbedBuilder()
    .setColor('#E60067')
    .setTitle(isEn ? '🎉 The Divine Revelation' : '🎉 A Revelação')
    .setDescription(
      isEn
        ? `🎉 A celestial light dissipates the mists! It's a lovely baby **${genderLabelEn}**!`
        : `🎉 Uma luz celestial dissipa as névoas! É um(a) lindo(a) **${genderLabelPt}**!`
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  await editTarget(frame3Embed);

  return chosenGender;
}

module.exports = {
  playChildBirthAnimation,
  sleep,
};

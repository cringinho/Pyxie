const { emojify, buttonEmojiFor } = require('./emojify');

/**
 * Peças de layout dos embeds dos módulos (Passe, Festival, Chefe, Mercado, Oficina, Laço).
 * Tudo passa pelo emojify, então os emojis Unicode das traduções viram os Application Emojis do bot.
 * No Discord, dois campos `inline` seguidos dividem a linha ao meio; o próximo campo comum quebra a linha.
 */

const BLANK = '​';

/** Tira o "### " das traduções para usar o texto como nome de campo. */
function heading(text) {
  return String(text || '').replace(/^#{1,3}\s*/, '').trim();
}

function field(name, value, inline = false) {
  return {
    name: emojify(heading(name)).slice(0, 256) || BLANK,
    value: emojify(String(value || '')).slice(0, 1024) || BLANK,
    inline,
  };
}

/** Separa uma tradução "### Título\n\ncorpo" em [nome, valor] de campo. */
function section(text) {
  const [first, ...rest] = String(text || '').split('\n');
  return [heading(first), rest.join('\n').trim()];
}

/** Duas colunas lado a lado: cada lado é [nome, valor]. */
function columns(left, right) {
  return [field(left[0], left[1], true), field(right[0], right[1], true)];
}

/** Linha vazia entre dois pares de colunas (sem ela, o Discord junta 3 campos na mesma linha). */
function spacer() {
  return { name: BLANK, value: BLANK, inline: false };
}

/** Emojis do bot no título e na descrição de um EmbedBuilder já montado. */
function decorate(embed) {
  if (embed.data.title) embed.setTitle(emojify(embed.data.title).slice(0, 256));
  if (embed.data.description) embed.setDescription(emojify(embed.data.description).slice(0, 4096));
  return embed;
}

module.exports = { BLANK, heading, section, field, columns, spacer, decorate, emojify, buttonEmoji: buttonEmojiFor };

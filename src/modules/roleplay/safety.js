/**
 * Filtro local do roleplay (o servidor tem adolescentes): conteúdo sexual nunca vai para a IA nem
 * sai dela, e sinais de crise interrompem a cena com linhas de apoio. O AutoMod do Discord já
 * bloqueia ofensas e conteúdo sexual nas mensagens; isto cobre o que passa e a saída da IA.
 */

// Palavra inteira (com acentos), sem pegar pedaços como "sexta" ou "Essex"
const word = (list) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${list.join('|')})(?![\\p{L}\\p{N}])`, 'iu');

const SEXUAL = word([
  'sex', 'sexo', 'sexual', 'sexy', 'nsfw', 'porn\\w*', 'pornô', 'hentai', 'nudes?', 'nua', 'nu', 'pelad[ao]s?', 'desnud[ao]s?',
  'orgasm\\w*', 'transar', 'transando', 'gozar', 'gozou', 'p[eê]nis', 'vagina', 'boquete', 'blowjob', 'stripper', 'strip-?tease',
  'erótic[ao]', 'erotic\\w*', 'lewd', 'horny', 'excitad[ao] sexualmente', 'seios', 'tetas?', 'boobs?', 'rape', 'estupr\\w*', 'violaci[oó]n',
]);

const CRISIS = word([
  'me matar', 'quero morrer', 'vou me matar', 'suic[ií]dio', 'suicidar', 'me cortar', 'kill myself', 'want to die', 'suicide', 'self[- ]harm',
  'cut myself', 'end my life', 'acabar com (?:a )?minha vida', 'matarme', 'quiero morir', 'quitarme la vida',
]);

function isSexual(text) {
  return SEXUAL.test(String(text || ''));
}

function isCrisis(text) {
  return CRISIS.test(String(text || ''));
}

module.exports = { isSexual, isCrisis };

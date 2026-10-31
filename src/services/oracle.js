// Oráculo com IA (Premium): pergunta livre respondida pelo Groq, com cota por servidor,
// cooldown por pessoa e fallback para as falas do i18n quando a API falha.
const { t } = require('../utils/i18n');
const { isCrisis } = require('./autoRules3');

const MODEL = 'llama-3.1-8b-instant';
const MAX_ANSWER = 900;
const MAX_QUESTION = 500;

const SYSTEM = {
  pt: 'Você é a Pyxie, fada tsundere de um bot de Discord: doce por dentro, marrenta por fora. Responda em português do Brasil, em no máximo 6 linhas, com carinho e um deboche leve. Nunca use "Claro!", "Aqui está" nem fale como assistente. Não dê diagnóstico médico, jurídico ou financeiro; nesses casos, acolha e sugira procurar ajuda profissional. Não repita menções (@everyone, @here) nem links.',
  en: 'You are Pyxie, a tsundere fairy in a Discord bot: soft inside, prickly outside. Answer in English, max 6 lines, warm with light teasing. Never say "Sure!" or "Here is"; never sound like an assistant. Do not give medical, legal or financial advice; in those cases, be kind and suggest professional help. Never repeat mentions (@everyone, @here) or links.',
};

/** Limpa a resposta: sem pings, sem blocos gigantes, tamanho controlado. */
function sanitizeAnswer(text) {
  return String(text || '')
    .replace(/@everyone|@here/gi, 'todo mundo')
    .replace(/<@!?\d+>|<@&\d+>|<#\d+>/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s{3,}/g, '  ')
    .trim()
    .slice(0, MAX_ANSWER);
}

function fallbackLine(lang, seed = Date.now()) {
  const lines = ['oracle.fallback.1', 'oracle.fallback.2', 'oracle.fallback.3'];
  return t(lines[seed % lines.length], lang);
}

/**
 * Pergunta ao Oráculo. `chat` é injetável nos testes (mesmo padrão do conflictWatch).
 * @returns {Promise<{ok:boolean, answer?:string, crisis?:boolean, fallback?:boolean}>}
 */
async function ask({ question, lang = 'pt', guildName = 'Pyxie', chat = null, now = Date.now() } = {}) {
  const text = String(question || '').trim().slice(0, MAX_QUESTION);
  if (!text) return { ok: false, empty: true };

  // Crise nunca passa pela IA: o comando responde com o texto de acolhimento (AGENTS §12).
  if (isCrisis(text)) return { ok: true, crisis: true };

  const call = chat || ((body, options) => require('./groqClient').chatCompletionNow(body, options));
  const result = await call(
    {
      model: MODEL,
      temperature: 0.7,
      max_tokens: 350,
      messages: [
        { role: 'system', content: SYSTEM[lang === 'en' ? 'en' : 'pt'] },
        { role: 'user', content: `${text}\n\n(Contexto: servidor "${String(guildName).slice(0, 60)}".)` },
      ],
    },
    { label: 'Oráculo' },
  ).catch(() => ({ ok: false, error: 'network' }));

  const answer = result?.ok ? sanitizeAnswer(result.data?.choices?.[0]?.message?.content) : '';
  if (!answer) return { ok: false, fallback: true, line: fallbackLine(lang, now), rateLimited: Boolean(result?.rateLimited) };
  return { ok: true, answer };
}

module.exports = { MODEL, MAX_ANSWER, MAX_QUESTION, SYSTEM, sanitizeAnswer, fallbackLine, ask };

const PORTUGUESE_STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'pela', 'pelo', 'pelos', 'pelas', 'para', 'pra', 'pro', 'pras', 'pros',
  'com', 'sem', 'sob', 'sobre', 'entre', 'ate', 'contra', 'desde',
  'e', 'ou', 'mas', 'porque', 'por que', 'pois', 'que', 'se', 'como',
  'quando', 'onde', 'quem', 'qual', 'quais', 'quanto', 'quanta',
  'eu', 'voce', 'ele', 'ela', 'nos', 'eles', 'elas', 'me', 'mim', 'te', 'ti', 'lhe',
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas',
  'seu', 'sua', 'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas',
  'dele', 'dela', 'deles', 'delas', 'deste', 'desta', 'disso', 'disto',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'isso', 'aquilo',
  'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas',
  'mais', 'menos', 'tao', 'tanto', 'tanta', 'tantos', 'tantas',
  'ja', 'ainda', 'sempre', 'nunca', 'jamais', 'bem', 'mal', 'assim', 'entao',
  'aqui', 'ali', 'la', 'agora', 'hoje', 'ontem', 'amanha',
  'era', 'foi', 'fui', 'foram', 'sou', 'somos', 'sao', 'ser', 'sendo', 'sido',
  'estou', 'esta', 'estamos', 'estao', 'estar', 'estava', 'estavam', 'estive', 'esteve',
  'tem', 'temos', 'tinha', 'tinham', 'ter', 'tendo', 'tido', 'tive', 'teve',
  'ha', 'havia', 'houve', 'haver', 'havendo', 'vai', 'vamos', 'vao', 'ir', 'indo', 'ia', 'iam',
  'fazer', 'fazendo', 'feito', 'fez', 'dizer', 'dizendo', 'dito', 'disse',
  'dar', 'dando', 'dado', 'deu', 'ver', 'vendo', 'visto', 'viu',
  'ficar', 'ficando', 'ficou', 'tambem', 'so', 'tudo', 'nada', 'cada',
  'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas',
  'coisa', 'dia', 'dias', 'ano', 'anos', 'mes', 'meses', 'tempo', 'vez', 'vezes'
]);

export function normalizeWord(word) {
  if (!word) return '';
  return String(word)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Extrai um pequeno trecho (snippet) ao redor da ocorrência da palavra no texto
 */
function extractSnippet(text, word) {
  if (!text) return '';
  const normText = normalizeWord(text);
  const normWord = normalizeWord(word);
  const idx = normText.indexOf(normWord);
  if (idx === -1) return text.slice(0, 80) + '...';

  const start = Math.max(0, idx - 35);
  const end = Math.min(text.length, idx + word.length + 45);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

/**
 * Analisa os relatos e extrai frequência, memória de origem e sugestões
 */
export function analyzeMemoriesWords(memoriesList = [], registeredWordNodes = []) {
  const wordFrequencyMap = new Map();
  const registeredNormSet = new Set(registeredWordNodes.map(w => w.normalizedWord));

  for (const memory of memoriesList) {
    if (!memory.content && !memory.title) continue;

    const combinedText = `${memory.title} ${memory.content}`;
    // Tokenização respeitando caracteres em português
    const tokens = combinedText.match(/[\p{L}\p{N}]+/gu) || [];

    const seenInThisMemory = new Set();

    for (const rawToken of tokens) {
      if (rawToken.length < 3) continue;
      if (/^\d+$/.test(rawToken)) continue;

      const norm = normalizeWord(rawToken);
      if (PORTUGUESE_STOPWORDS.has(norm)) continue;

      if (!wordFrequencyMap.has(norm)) {
        wordFrequencyMap.set(norm, {
          word: rawToken.charAt(0).toUpperCase() + rawToken.slice(1).toLowerCase(),
          normalizedWord: norm,
          count: 0,
          memoryIds: new Set(),
          snippets: []
        });
      }

      const item = wordFrequencyMap.get(norm);
      item.count += 1;

      if (!seenInThisMemory.has(norm)) {
        seenInThisMemory.add(norm);
        item.memoryIds.add(memory.id);

        if (item.snippets.length < 4) {
          item.snippets.push({
            memoryId: memory.id,
            memoryTitle: memory.title,
            memoryDate: memory.memoryDate,
            snippet: extractSnippet(memory.content, rawToken)
          });
        }
      }
    }
  }

  // 1. Processar palavras cadastradas com contagem real
  const enrichedRegisteredWords = registeredWordNodes.map((wNode) => {
    const stats = wordFrequencyMap.get(wNode.normalizedWord) || {
      count: 0,
      memoryIds: new Set(),
      snippets: []
    };

    return {
      id: wNode.id,
      word: wNode.word,
      normalizedWord: wNode.normalizedWord,
      meaningOrNote: wNode.meaningOrNote,
      color: wNode.color || '#EC4899',
      iconName: wNode.iconName || 'Sparkles',
      createdBy: wNode.createdBy,
      count: stats.count,
      memoryIds: Array.from(stats.memoryIds),
      snippets: stats.snippets
    };
  });

  // 2. Extrair as 15 palavras mais frequentes não cadastradas (sugestões com count >= 2)
  const suggestedWords = Array.from(wordFrequencyMap.values())
    .filter(item => !registeredNormSet.has(item.normalizedWord) && item.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map(item => ({
      word: item.word,
      normalizedWord: item.normalizedWord,
      count: item.count,
      memoryIds: Array.from(item.memoryIds)
    }));

  return {
    registeredWords: enrichedRegisteredWords,
    suggestedWords
  };
}

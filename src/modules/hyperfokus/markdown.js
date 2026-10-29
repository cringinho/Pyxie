/**
 * Sanitizador e parser de Markdown do Pyxie Hyperfokus
 * Converte o texto do autor (Discord Markdown) em HTML sem vulnerabilidades XSS.
 * Regras:
 * - Exatamente um <h1> no artigo (o título é o h1 na página); headers do autor viram h2/h3.
 * - Links externos recebem rel="nofollow ugc noopener" e target="_blank".
 * - Proibido javascript: ou data: em links ou tags.
 */

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

function markdownToHtml(markdown = '') {
  if (!markdown || typeof markdown !== 'string') return '';

  let text = markdown;

  // 1. Blocos de código ```linguagem \r?\n codigo ```
  const codeBlocks = [];
  text = text.replace(/```([a-z0-9_-]*)\r?\n([\s\S]*?)```/gi, (_, lang, code) => {
    const idx = codeBlocks.length;
    const safeLang = escapeHtml(lang.trim().toLowerCase());
    const safeCode = escapeHtml(code.trim());
    codeBlocks.push(
      `<pre class="code-block" data-language="${safeLang}"><code>${safeCode}</code></pre>`
    );
    return `@@@CODEBLOCK${idx}@@@`;
  });

  // 2. Código inline `codigo`
  const inlineCodes = [];
  text = text.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `@@@INLINECODE${idx}@@@`;
  });

  // 3. Remove event handlers perigosos e sanitiza o restante do texto contra injeção direta de HTML
  text = text.replace(/\bon\w+\s*=/gi, 'no-handler=');
  text = escapeHtml(text);

  // 4. Cabeçalhos (# vira <h2>, ## vira <h2>, ### vira <h3>)
  // Regra: O <h1> é exclusivo para o título do artigo no template da página.
  text = text.replace(/^### (.*$)/gim, '<h3 class="article-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="article-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h2 class="article-h2">$1</h2>');

  // 5. Citações em bloco (> frase)
  text = text.replace(/^(&gt;|>)\s*(.*$)/gim, '<blockquote class="article-quote">$2</blockquote>');

  // 6. Negrito e Itálico
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');

  // 7. Riscado (~~texto~~)
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 8. Links no formato [texto](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<a href="${safeUrl}" target="_blank" rel="nofollow ugc noopener" class="article-link">${label}</a>`;
  });

  // 9. Listas com marcadores (• ou -)
  text = text.replace(/^[•\-] (.*$)/gim, '<li class="article-li">$1</li>');
  text = text.replace(/(<li class="article-li">.*<\/li>\n?)+/g, (match) => {
    return `<ul class="article-ul">\n${match}</ul>`;
  });

  // 10. Quebras de linha e parágrafos
  const paragraphs = text.split(/\n\s*\n/);
  text = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (/^<(h2|h3|blockquote|ul|pre)/.test(trimmed)) return trimmed;
      if (trimmed.startsWith('@@@CODEBLOCK')) return trimmed;
      return `<p class="article-p">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n\n');

  // 11. Restaura blocos de código e código inline
  inlineCodes.forEach((html, idx) => {
    text = text.replace(`@@@INLINECODE${idx}@@@`, html);
  });
  codeBlocks.forEach((html, idx) => {
    text = text.replace(`@@@CODEBLOCK${idx}@@@`, html);
  });

  return text;
}

module.exports = {
  escapeHtml,
  sanitizeUrl,
  markdownToHtml,
};

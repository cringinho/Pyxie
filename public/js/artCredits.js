/**
 * artCredits.js - Crédito público das artes humanas da Pyxie.
 * Lê /api/public/asset-credits (artes marcadas como humanas no painel, com artista) e,
 * para cada imagem da página que usa uma dessas artes (ou uma versão .webp/redimensionada
 * dela), coloca "Arte: Nome" no title da imagem e uma linha de créditos no rodapé.
 * Sem crédito cadastrado, não faz nada.
 */
(function () {
  'use strict';

  // "/assets/pyxie/sticker/sticker_smile-128.webp" e ".png" contam como a mesma arte.
  function baseKey(src) {
    try {
      const path = new URL(src, window.location.origin).pathname;
      return path.replace(/-\d+(?=\.[a-z0-9]+$)/i, '').replace(/\.[a-z0-9]+$/i, '').toLowerCase();
    } catch (_) {
      return '';
    }
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function apply(credits) {
    if (!Array.isArray(credits) || credits.length === 0) return;
    const isEn = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    const label = isEn ? 'Art' : 'Arte';
    const byKey = new Map(credits.map((c) => [baseKey(c.url), c]));
    const used = new Map();

    document.querySelectorAll('img[src]').forEach((img) => {
      const credit = byKey.get(baseKey(img.getAttribute('src')));
      if (!credit) return;
      if (!img.title) img.title = `${label}: ${credit.artist}`;
      used.set(credit.artist, credit);
    });

    if (used.size === 0) return;
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('[data-art-credits]')) return;
    const line = document.createElement('p');
    line.setAttribute('data-art-credits', '');
    line.style.cssText = 'font-size:0.75rem;opacity:0.7;margin-top:8px;text-align:center;';
    line.innerHTML = `${label}: ` + Array.from(used.values())
      .map((c) => (c.artistUrl && /^https:\/\//.test(c.artistUrl)
        ? `<a href="${escapeHtml(c.artistUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.artist)}</a>`
        : escapeHtml(c.artist)))
      .join(', ');
    footer.appendChild(line);
  }

  function run() {
    fetch('/api/public/asset-credits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => apply(data && data.credits))
      .catch(() => {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

/*
 * Editor de texto da Pyxie (Hyperfokus): Quill 2 com a barra e o tema Dark-Kawaii.
 * Inspirado no Blazored.TextEditor (que também embrulha o Quill), refeito para o nosso site sem Blazor.
 *
 * Uso (site e painel):
 *   const ed = await PyxieEditor.mount(elemento, { lang: 'pt', html: '<p>...</p>', placeholder, onChange, onGithub });
 *   ed.getMarkdown()  // Markdown que o backend do blog entende (src/modules/hyperfokus/markdown.js)
 *   ed.setHtml(html); ed.insertCode(code, language); ed.focus(); ed.destroy();
 *
 * A barra oferece só o que o renderizador do blog sabe mostrar (títulos H2/H3, negrito, itálico, riscado,
 * link, citação, lista com marcador, código), para nada sumir entre o editor e a página publicada.
 */
(function () {
  'use strict';

  var ASSET_VERSION = '3';
  var CODE_BLOCK_ICON =
    '<svg viewBox="0 0 18 18" aria-hidden="true">' +
    '<rect class="ql-stroke" x="1.5" y="2.5" width="15" height="13" rx="2.5" fill="none"/>' +
    '<polyline class="ql-stroke" points="6.5 6.8 4.6 9 6.5 11.2" fill="none"/>' +
    '<polyline class="ql-stroke" points="11.5 6.8 13.4 9 11.5 11.2" fill="none"/>' +
    '<line class="ql-stroke" x1="9.9" y1="6.3" x2="8.1" y2="11.7"/></svg>';
  var TEXTS = {
    pt: {
      heading: 'Estilo do parágrafo', h2: 'Título', h3: 'Subtítulo', normal: 'Texto',
      bold: 'Negrito (Ctrl+B)', italic: 'Itálico (Ctrl+I)', strike: 'Riscado',
      link: 'Link (Ctrl+K)', blockquote: 'Citação', code: 'Código na linha', codeBlock: 'Bloco de código',
      list: 'Lista', clean: 'Limpar formatação', github: 'Importar código do GitHub',
      words: function (n) { return n === 1 ? '1 palavra' : n + ' palavras'; },
      minutes: function (n) { return '~' + n + ' min de leitura'; },
      placeholder: 'Conte seu hiperfoco aqui...',
      linkPrompt: 'Endereço do link (https://...)',
      toolbar: 'Formatação do texto',
      loadError: 'Não consegui carregar o editor. Recarregue a página.',
    },
    en: {
      heading: 'Paragraph style', h2: 'Heading', h3: 'Subheading', normal: 'Text',
      bold: 'Bold (Ctrl+B)', italic: 'Italic (Ctrl+I)', strike: 'Strikethrough',
      link: 'Link (Ctrl+K)', blockquote: 'Quote', code: 'Inline code', codeBlock: 'Code block',
      list: 'List', clean: 'Clear formatting', github: 'Import code from GitHub',
      words: function (n) { return n === 1 ? '1 word' : n + ' words'; },
      minutes: function (n) { return '~' + n + ' min read'; },
      placeholder: 'Tell us about your hyperfocus...',
      linkPrompt: 'Link address (https://...)',
      toolbar: 'Text formatting',
      loadError: "Couldn't load the editor. Please reload the page.",
    },
  };

  var loading = null;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('load_failed: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadCss(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  function ensureDeps() {
    if (loading) return loading;
    loadCss('/vendor/quill.snow.css');
    loadCss('/css/pyxie-editor.css?v=' + ASSET_VERSION);
    loading = Promise.all([
      window.Quill ? null : loadScript('/vendor/quill.js'),
      window.TurndownService ? null : loadScript('/vendor/turndown.js'),
    ]);
    return loading;
  }

  function buildTurndown() {
    var td = new window.TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
    });
    // O <h1> é só do título do artigo: qualquer h1 colado vira "##".
    td.addRule('noH1', { filter: 'h1', replacement: function (c) { return '\n\n## ' + c + '\n\n'; } });
    td.addRule('strike', { filter: ['s', 'del', 'strike'], replacement: function (c) { return '~~' + c + '~~'; } });
    // O renderizador do blog espera "- item" com um espaço só.
    td.addRule('listItem', {
      filter: 'li',
      replacement: function (content) {
        return '- ' + content.replace(/^\n+/, '').replace(/\n+$/, '').replace(/\n/gm, '\n  ') + '\n';
      },
    });
    // getSemanticHTML do Quill 2 gera <pre data-language="..."> sem <code> dentro.
    td.addRule('quillPre', {
      filter: function (node) { return node.nodeName === 'PRE' && !node.querySelector('code'); },
      replacement: function (_c, node) {
        var lang = node.getAttribute('data-language');
        lang = lang && lang !== 'plain' ? lang : '';
        return '\n\n```' + lang + '\n' + node.textContent.replace(/\n$/, '') + '\n```\n\n';
      },
    });
    return td;
  }

  function button(cls, title, value) {
    var b = '<button type="button" class="' + cls + '" title="' + title + '" aria-label="' + title + '"';
    if (value) b += ' value="' + value + '"';
    return b + '></button>';
  }

  function toolbarHtml(t, withGithub) {
    return (
      '<span class="ql-formats">' +
        '<select class="ql-header" title="' + t.heading + '" aria-label="' + t.heading + '">' +
          '<option value="2">' + t.h2 + '</option><option value="3">' + t.h3 + '</option><option selected>' + t.normal + '</option>' +
        '</select>' +
      '</span>' +
      '<span class="ql-formats">' + button('ql-bold', t.bold) + button('ql-italic', t.italic) + button('ql-strike', t.strike) + '</span>' +
      '<span class="ql-formats">' + button('ql-link', t.link) + button('ql-blockquote', t.blockquote) + button('ql-list', t.list, 'bullet') + '</span>' +
      '<span class="ql-formats">' + button('ql-code', t.code) + button('ql-code-block', t.codeBlock) +
        (withGithub ? '<button type="button" class="pyx-github" title="' + t.github + '" aria-label="' + t.github + '">' +
          '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>' +
        '</button>' : '') +
      '</span>' +
      '<span class="ql-formats">' + button('ql-clean', t.clean) + '</span>'
    );
  }

  function countWords(text) {
    var m = String(text || '').trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  async function mount(host, opts) {
    opts = opts || {};
    var lang = opts.lang === 'en' ? 'en' : 'pt';
    var t = TEXTS[lang];
    try {
      await ensureDeps();
    } catch (err) {
      host.textContent = t.loadError;
      throw err;
    }

    host.classList.add('pyx-editor');
    host.innerHTML = '';
    var toolbar = document.createElement('div');
    toolbar.className = 'pyx-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', t.toolbar);
    toolbar.innerHTML = toolbarHtml(t, typeof opts.onGithub === 'function');
    var area = document.createElement('div');
    area.className = 'pyx-area';
    var status = document.createElement('div');
    status.className = 'pyx-status';
    status.setAttribute('aria-live', 'polite');
    host.appendChild(toolbar);
    host.appendChild(area);
    host.appendChild(status);

    var quill = new window.Quill(area, {
      theme: 'snow',
      placeholder: opts.placeholder || t.placeholder,
      formats: ['header', 'bold', 'italic', 'strike', 'link', 'blockquote', 'code', 'code-block', 'list'],
      modules: {
        toolbar: {
          container: toolbar,
          handlers: {
            link: function (value) {
              if (!value) { quill.format('link', false); return; }
              var url = window.prompt(t.linkPrompt, 'https://');
              if (url && /^https?:\/\//i.test(url.trim())) quill.format('link', url.trim());
            },
          },
        },
        keyboard: {
          bindings: {
            link: { key: 'K', shortKey: true, handler: function () { toolbar.querySelector('.ql-link').click(); } },
          },
        },
      },
    });
    // O tema "snow" põe o mesmo </> em código na linha e bloco de código (e sobrescreve o botão ao montar);
    // o bloco ganha aqui um ícone próprio: um quadro com código dentro.
    var codeBlockBtn = toolbar.querySelector('.ql-code-block');
    if (codeBlockBtn) codeBlockBtn.innerHTML = CODE_BLOCK_ICON;
    quill.root.setAttribute('role', 'textbox');
    quill.root.setAttribute('aria-multiline', 'true');
    if (opts.label) quill.root.setAttribute('aria-label', opts.label);

    var td = buildTurndown();
    var api = {
      quill: quill,
      getHtml: function () { return quill.getSemanticHTML(); },
      getMarkdown: function () {
        if (quill.getLength() <= 1) return '';
        // getSemanticHTML do Quill 2 troca espaços por &nbsp;; no Markdown gravado eles viram espaço comum.
        return td.turndown(quill.getSemanticHTML()).replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      },
      setHtml: function (html) {
        quill.setContents(quill.clipboard.convert({ html: html || '' }), 'silent');
        updateStatus();
      },
      insertCode: function (code, language) {
        var range = quill.getSelection(true) || { index: quill.getLength() };
        var at = range.index;
        if (at > 0) { quill.insertText(at, '\n', 'user'); at += 1; }
        quill.insertText(at, String(code || '').replace(/\n$/, '') + '\n', { 'code-block': language || 'plain' }, 'user');
        quill.setSelection(at + String(code || '').length + 1, 0, 'silent');
      },
      focus: function () { quill.focus(); },
      destroy: function () { host.innerHTML = ''; host.classList.remove('pyx-editor'); },
    };

    var changeTimer = null;
    function updateStatus() {
      var words = countWords(quill.getText());
      status.textContent = t.words(words) + ' · ' + t.minutes(Math.max(1, Math.round(words / 200)));
    }
    quill.on('text-change', function () {
      updateStatus();
      if (typeof opts.onChange === 'function') {
        clearTimeout(changeTimer);
        changeTimer = setTimeout(function () { opts.onChange(api); }, 250);
      }
    });

    var gh = toolbar.querySelector('.pyx-github');
    if (gh) gh.addEventListener('click', function () { opts.onGithub(api); });

    if (opts.html) api.setHtml(opts.html);
    else updateStatus();
    return api;
  }

  window.PyxieEditor = { mount: mount, version: ASSET_VERSION };
})();

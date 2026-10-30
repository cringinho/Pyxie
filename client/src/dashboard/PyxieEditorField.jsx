import React, { useEffect, useRef, useState } from 'react';

// Editor da Pyxie (Quill com o tema Dark-Kawaii) dentro do painel. É o mesmo arquivo do site
// (public/js/pyxie-editor.js), carregado sob demanda, para os dois editores nunca divergirem.
const EDITOR_SRC = '/js/pyxie-editor.js?v=3';
let loader = null;

function loadEditor() {
  if (window.PyxieEditor) return Promise.resolve(window.PyxieEditor);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = EDITOR_SRC;
      s.onload = () => resolve(window.PyxieEditor);
      s.onerror = () => {
        loader = null;
        reject(new Error('editor_load_failed'));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

// `initialHtml` só é lido ao montar: troque a `key` do componente para carregar outro artigo.
export default function PyxieEditorField({ initialHtml, initialMarkdown, lang, label, onChange }) {
  const hostRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [failed, setFailed] = useState(false);
  onChangeRef.current = onChange;

  useEffect(() => {
    let editor = null;
    let cancelled = false;
    loadEditor()
      .then((PyxieEditor) => {
        if (cancelled || !hostRef.current) return null;
        return PyxieEditor.mount(hostRef.current, {
          lang,
          label,
          html: initialHtml || '',
          onChange: (ed) => onChangeRef.current?.(ed.getMarkdown()),
        });
      })
      .then((ed) => {
        if (cancelled) ed?.destroy();
        else editor = ed;
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      editor?.destroy();
    };
    // Monta uma vez por artigo (a key do pai cuida da troca).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <textarea
        rows={18}
        defaultValue={initialMarkdown || ''}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={label}
        className="dash-field w-full rounded-2xl p-4 font-mono text-sm leading-relaxed"
      />
    );
  }
  return <div ref={hostRef} aria-label={label} />;
}

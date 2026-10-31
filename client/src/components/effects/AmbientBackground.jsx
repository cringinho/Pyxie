import React from 'react';

// Camada de ambiente: aurora que respira, grade que desliza e glifos flutuando.
// Tudo em CSS (transform/opacity) — sem canvas, sem listener de scroll.
const GLYPHS = ['✦', '✧', '♡', '★', '☾', '✿', '❀', '⟡'];

export default function AmbientBackground() {
  return (
    <div className="pyx-ambient" aria-hidden="true">
      <div className="pyx-aurora pyx-aurora-a" />
      <div className="pyx-aurora pyx-aurora-b" />
      <div className="pyx-aurora pyx-aurora-c" />
      <div className="pyx-grid" />
      <div className="pyx-glyphs">
        {GLYPHS.map((glyph, i) => (
          <span
            key={glyph}
            className="pyx-glyph"
            style={{ left: `${5 + i * 11.5}%`, top: `${12 + ((i * 37) % 68)}%`, animationDelay: `${i * -1.7}s` }}
          >
            {glyph}
          </span>
        ))}
      </div>
      <div className="pyx-vignette" />
    </div>
  );
}

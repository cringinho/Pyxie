import React from 'react';

/**
 * Card com luz que segue o mouse (só em ponteiro fino, via CSS).
 * A posição vai em `--mx/--my`, sem estado do React: zero re-render por movimento.
 */
export default function Spotlight({ children, className = '', ...rest }) {
  const handleMove = (event) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  return (
    <div onPointerMove={handleMove} className={`spot ${className}`} {...rest}>
      {children}
    </div>
  );
}

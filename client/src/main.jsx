import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('pyxie-app') || document.getElementById('root');

if (container) {
  window.__PYXIE_REACT_ACTIVE__ = true;
  // Desfaz o layout antigo do <body> da página hospedeira (ex.: bônus centralizava tudo com padding).
  document.body.classList.add('pyx-react-root');
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.warn('[Pyxie] Mounting container #pyxie-app or #root not found.');
}

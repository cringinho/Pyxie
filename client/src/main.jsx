import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('pyxie-app') || document.getElementById('root');

if (container) {
  window.__PYXIE_REACT_ACTIVE__ = true;
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.warn('[Pyxie] Mounting container #pyxie-app or #root not found.');
}

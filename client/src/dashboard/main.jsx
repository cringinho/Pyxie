import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './Dashboard';
import ErrorBoundary from './ErrorBoundary';
import '../index.css';

ReactDOM.createRoot(document.getElementById('dashboard-root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  </React.StrictMode>
);


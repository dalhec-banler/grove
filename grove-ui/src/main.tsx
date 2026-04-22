import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/apps/grove/grove-sw.js', { scope: '/apps/grove/' })
    .then(reg => {
      console.log('[grove-pwa] SW registered, scope:', reg.scope);
      setInterval(() => reg.update(), 60_000);
    })
    .catch(err => console.error('[grove-pwa] SW failed:', err));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

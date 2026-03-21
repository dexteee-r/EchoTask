import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import './design-system.css';
import './style.css';
import './animations.css';

// Masquer le splash screen une fois React monté
function hideSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';
    setTimeout(() => splash.remove(), 400);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Laisser le splash visible un court instant après le montage
setTimeout(hideSplash, 1200);
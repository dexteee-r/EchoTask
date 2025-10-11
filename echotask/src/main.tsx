import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './ThemeProvider';  // 🆕 AJOUTER
import './design-system.css';  // 🆕 AJOUTER (AVANT styles.css)
import './style.css';
import './animations.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>  {/* 🆕 ENTOURER I18nProvider */}
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>  {/* 🆕 FERMER */}
  </React.StrictMode>
);
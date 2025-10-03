import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from './sw-register';
import './style.css';
import { I18nProvider } from './i18n';

registerSW();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from './sw-register';
import './style.css';

registerSW();
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

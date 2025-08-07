import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './setting.js';
import i18n from './_i18n';
import App from './app';


const root = createRoot(document.getElementById('root'));

root.render(
  <I18nextProvider i18n={ i18n }>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </I18nextProvider>
);

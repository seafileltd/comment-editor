import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

let { lang } = window.seafileConfig;
lang = lang === 'zh-cn' ? 'zh_cn' : lang;

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: lang,
    fallbackLng: 'en',
    ns: ['comment-editor'],
    defaultNS: 'comment-editor',

    debug: false, // console log if debug: true

    whitelist: ['en', 'zh_CN', 'fr', 'de', 'cs', 'es', 'es-AR', 'es-MX', 'ru'],

    backend: {
      loadPath: '/public/locales/{{ lng }}/{{ ns }}.json',
    },

    interpolation: {
      escapeValue: false, // not needed for react!!
    },

    react: {
      wait: true
    }
  });

export default i18n;

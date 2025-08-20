import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const getI18n = (settings) => {
  let lang = 'en';
  let loadPath = '/public/locales/{{ lng }}/{{ ns }}.json';

  if (settings) {
    const { lang: propsLang, mediaUrl } = settings;
    if (mediaUrl) {
      loadPath = `${mediaUrl}/locales/{{ lng }}/{{ ns }}.json`;
    }
    if (propsLang) {
      lang = propsLang;
    }
  }

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
        loadPath,
      },

      interpolation: {
        escapeValue: false, // not needed for react!!
      },

      react: {
        wait: true
      }
    });
  return i18n;
};

export default getI18n;

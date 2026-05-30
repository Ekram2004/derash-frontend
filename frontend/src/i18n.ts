import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)               // loads translations from /public/locales
  .use(LanguageDetector)      // detects user language
  .use(initReactI18next)      // passes i18n instance to react
  .init({
    fallbackLng: 'en',
    debug: true,              // set to false in production
    interpolation: {
      escapeValue: false,     // React already does escaping
    },
    backend: {
      // This must match the actual location of your translation files
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
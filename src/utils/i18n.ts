import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from 'src/utils/languages/en.json';
import id from 'src/utils/languages/id.json';

const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // default bahasa
  fallbackLng: 'id', // kalau key nggak ketemu
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

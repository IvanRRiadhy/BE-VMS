import i18n from 'i18next';
import { chain } from 'lodash';
import { initReactI18next } from 'react-i18next';
import en from 'src/utils/languages/en.json';
import id from 'src/utils/languages/id.json';
import ch from 'src/utils/languages/ch.json';

const resources = {
  id: {
    translation: id,
  },
  en: {
    translation: en,
  },
  // ch: {
  //   translation: ch,
  // },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', 
  fallbackLng: 'id', 
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

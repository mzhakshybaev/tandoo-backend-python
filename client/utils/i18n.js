import i18n from 'i18next';
import {reactI18nextModule} from 'react-i18next';

// locales
const ru_locale = require('./locales/ru/translations');
const kg_locale = require('./locales/kg/translations');
const en_locale = require('./locales/en/translations');

i18n.use(reactI18nextModule).init({
  keySeparator: '>',
  nsSeparator: '|',
  fallbackLng: 'ru',
  resources: {
    ru: ru_locale,
    kg: kg_locale,
    en: en_locale,
  },
  ns: ['common', 'settings'],
  defaultNS: 'common',
  debug: false,
});
export default i18n;

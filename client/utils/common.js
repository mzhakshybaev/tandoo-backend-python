// const DEV_API = 'http://e-market.kg/';
// const DEV_API = 'http://192.168.2.245:7000/';
const DEV_API = 'http://localhost:7000/';
// const DEV_API = 'http://tandoo.zakupki.gov.kg/';

const PROD_API = '/';

export const isDevMode = () => {
  let env = {...process.env};
  return env.NODE_ENV === 'development';
};

export const getApi = () => {
  return isDevMode() ? DEV_API : PROD_API;
};

export const IMAGES_URL = getApi() + 'image/';
export const DEFAULT_AVA = 'img/user-avatar.png';
export const EMPTY_IMG = 'img/empty.png';
export const EMPTY_PDF = 'img/empty_pdf.png';
// export const LOGO_IMG = 'img/logo.png';
export const LOGO_IMG = 'img/logo-white.png';
export const ADD_IMG = 'img/add.png';

export const FORMAT_DATE_DB = 'YYYY-MM-DD HH:mm:ss';
export const FORMAT_DATE = 'DD.MM.YYYY';
export const FORMAT_DATE_TIME = 'D.MM.YYYY HH:mm';
export const FORMAT_MONEY = '0,0.00'; // 10 000,00
export const FORMAT_MONEY_CURRENCY = '0,0.00 $'; // 10 000,00 сом (config: utils/locales/numeral-locale-ru-som.js)

export const NDS_VALUE = 12; // %

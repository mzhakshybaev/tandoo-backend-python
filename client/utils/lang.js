import moment from 'moment/moment';
import numeral from "numeral";
import './locales/ru/numeral-locale-ru-som';
import './locales/en/numeral-locale-en-som';
import './locales/kg/numeral-locale-kg-som';
import 'moment/locale/ru';
import {FORMAT_MONEY} from './common';
import validatorjs from "validatorjs";
import validator_kg from './locales/kg/validatorjs';


let defaultLang = 'ru';

moment.locale(defaultLang);

numeral.locale(defaultLang);
numeral.defaultFormat(FORMAT_MONEY);

validatorjs.useLang(defaultLang);
validatorjs.setMessages('kg', validator_kg);

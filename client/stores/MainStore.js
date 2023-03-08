import {action, observable} from 'mobx';
import {storageSave} from "../utils/LocalStorage";
import i18n from "../utils/i18n";
import authStore from './AuthStore';
import validatorjs from "validatorjs";
import numeral from "numeral";
import moment from "moment";

export default new class MainStore {
  deviceId;
  client;

  languages = [
    {code: 'kg', short_name: 'Кырг', name: 'Кыргыз тили', image: 'img/flags/kg.png'},
    {code: 'ru', short_name: 'Рус', name: 'Русский язык', image: 'img/flags/ru.png'},
    {code: 'en', short_name: 'Eng', name: 'English', image: 'img/flags/us.png'},
  ];

  @observable language;
  @observable message;
  @observable isBusy;
  @observable level = 'info';
  @observable currency;

  constructor() {
    this.isBusy = false;
    this.message = null;
    this.language = this.languages[1];
    this.currency = 'сом'; //Config.CURRENCY;
  }

  @action
  setBusy(busy) {
    this.isBusy = busy;
  }

  setClient(client) {
    this.client = client;
  }

  getClient() {
    return this.client || '1';
  }

  // DEVICE
  setDeviceId(deviceId) {
    this.deviceId = deviceId;
    storageSave('deviceId', deviceId);
  }

  getDeviceId() {
    if (this.deviceId) return this.deviceId;
    this.deviceId = 'web';
    return this.deviceId;
  }

  // MSG
  @action
  clearAlert() {
    if (this.setMessage)
      this.setMessage(null, null);
  }

  @action
  setMessage(level, message) {
    this.level = level;
    this.message = message;
  }

  // LANG

  @action
  setLanguage(language) {
    this.language = language;
    i18n.changeLanguage(this.language.code);
    validatorjs.useLang(this.language.code);
    numeral.locale(this.language.code);
    moment.locale(this.language.code)

    // storageSave('language', this.language);

    authStore.check(true, undefined, this.language.code);
  }

  /*loadLang() {
    storageGet('language').then((lang) => {
      this.language = lang;
      i18n.changeLanguage(lang.code);
    })
      .catch(() => {
        i18n.changeLanguage(this.languages[1].code);
      })
  }*/
}

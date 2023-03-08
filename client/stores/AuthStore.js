import {action, computed, observable, observe} from 'mobx';
import * as request from '../utils/requester';
import {showInfo} from '../utils/messages';
import {storageGet, storageRemove, storageSave} from '../utils/LocalStorage';
import menuStore from './MenuStore';

const STATE_INIT = 0; // initital state
const STATE_PENDING = 1; // auth in progress
const STATE_READY = 2; // auth finished

export default new class AuthStore {
  @observable state = STATE_INIT;
  @observable token;
  @observable valid = false;
  @observable user;
  @observable company;
  @observable companies;
  @observable notification;
  @observable isSupplier;
  @observable isPurchaser;

  checkNotification;

  constructor() {
    // observe(this, 'valid', change => {
    //   if (this.valid) {
    //     if (!this.checkNotification) {
    //       this.checkNotification = setInterval(() => {
    //         this.getNotification();
    //       }, 60000);
    //     }
    //   } else {
    //     clearInterval(this.checkNotification);
    //   }
    // });
  }

  @action
  getNotification() {
    request
      .post('notification.listing', {}, true)
      .then(r => (this.notification = r));
  }

  @computed
  get isReady() {
    return this.state === STATE_READY;
  }

  // TODO: actions cannot be async

  // check auth
  async check(force, set_company_id, lang) {
    if (this.state !== STATE_INIT && !force) {
      return;
    }

    if (!force) {
      this.state = STATE_PENDING;
    }

    let token = await storageGet('token');

    if (token) {
      this.token = token;

      try {
        let r = await request.post('user/check_token', {set_company_id, lang});
        this.setData(r);
      } catch (e) {
        this.reset();
      }
    } else {
      this.reset();
    }

    await menuStore.load();
    await this.loadActiveCompanies();

    this.state = STATE_READY;
  }

  @action
  setData(data) {
    const {user, company} = data;
    this.company = company;
    if (user) {
      this.user = user;
      this.valid = true;

      if (data.token) {
        this.token = data.token;
        storageSave('token', data.token);
      }

      if (user.roleType) {
        if (user.roleType.roleType === 1) {
          this.isSupplier = true
        } else if (user.roleType.roleType === 2) {
          this.isPurchaser = true
        } else {
          this.isSupplier = false;
          this.isPurchaser = false;
        }
      }
    } else {
      this.reset();
    }
  }

  @action
  setUser(user) {
    if (!user) {
      this.reset();
    }

    this.valid = true;
    this.user = user;
  }

  @action
  reset() {
    this.token = undefined;
    this.user = undefined;
    this.company = undefined;
    this.companies = undefined;
    this.valid = false;
    this.isSupplier = false;
    this.isPurchaser = false;
    storageRemove('token');
  }

  async login(username, password) {
    try {
      let r = await request.post('user/auth', {username, password});

      if (r.token) {
        this.setData(r);
        this.getNotification();
        await menuStore.load();
        await this.loadActiveCompanies();
        return true;
      } else {
        console.warn('no token!');
        debugger;
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  logout() {
    this.reset();
    menuStore.load();
  }

  // COMPANY

  async loadActiveCompanies(filter, params) {
    if (!this.valid) {
      return;
    }

    if (this.user.role !== 2) {
      // only for simple user
      return;
    }

    params = {
      with_roles: true,
      // filter: {        company_status: 'confirmed',      },
    };

    let r;
    try {
      r = await request.post('company.listing', params);
    } catch (e) {
    }

    if (r && r.docs && r.docs.length) {
      this.companies = r.docs;
    } else {
      this.companies = undefined;
    }
  }

  async setDefaultCompany(company_id) {
    if (!this.valid || !this.companies) {
      throw new Error('Не авторизован');
    }

    await request.post('user.set_default_company', {company_id});
    this.user.default_company = company_id;
  }

  setCompany(company_id) {
    if (!this.valid || !this.companies) {
      throw new Error('Не авторизован');
    }

    let company = this.companies.findById(company_id);

    if (!company) {
      throw new Error('Компания не найдена');
    }

    return this.check(true, company_id);
  }

  // REG

  async register(passwordData) {
    let params = this.user;
    params.password = passwordData.password;
    params.confirm_password = passwordData.password_confirmation;
    let r = await request.post('user/register', params);
    this.setData(r);
    this.check(true);
    showInfo('Вы успешно прошли регистрацию');
  }

  async sendSmsCode(params) {
    return request.post('user/send_otp', params);
  }

  async validateSmsCode(phone, otp) {
    phone = phone
      .replace('(', '')
      .replace(')', '')
      .replace(' ', '');
    return request.post('user/validate_otp', {phone, otp});
  }

  // SAVE

  async uploadAvatar(file) {
    return request.post('upload/avatars', {file});
  }

  async save(params) {
    return request.post('user/put', params);
  }

  async saveData(data) {
    return request.post('user/putData', {data});
  }

  async changePassword(params) {
    return request.post('user/putPassword', params);
  }

  // RECOVERY

  setRecoveryData(data) {
    this.recoveryData = data;
  }

  async recoveryPassword(passwordData) {
    if (!this.recoveryData) {
      throw new Error('Нет данных для восстановления');
    }

    let {password, confirmPassword} = passwordData;
    let params = {...this.recoveryData, password, confirmPassword};

    let r = await request.post('user/recovery_password', params);
    this.setData(r);
  }

  async checkData(params) {
    return request.post('user/check', params);
  }

  @action
  async jwtLogin(token) {
    try {
      const r = await request.post('user/jwttoken', {token});
      this.setData(r);
      this.getNotification();
      await menuStore.load();
      await this.loadActiveCompanies();
      return r;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  @action
  async userToken(token) {
    try {
      const r = await request.post('user/token', {token});
      this.setData(r);
      this.getNotification();
      await menuStore.load();
      await this.loadActiveCompanies();
      return r;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}();

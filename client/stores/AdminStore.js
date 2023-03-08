import {action, computed, observable} from 'mobx';
import * as request from '../utils/requester';


export default new class AdminStore {

  @observable menu;
  @observable menus = [];

  @observable role;
  @observable roles = [];

  @observable api;
  @observable apis = [];

  constructor() {
    this.resetMenu();
    this.resetRole();
    this.resetApi();
  }

  @action
  getMenus() {
    this.resetMenu();
    request.post('menu/listing', {all: true}).then(r => {
      this.menus = r.docs || [];
    })
  }

  @action
  saveMenu() {
    request.post('menu/save', this.menu).then(r => {
      this.getMenus();
    })
  }

  @action
  removeMenu() {
    request.post('menu/delete', this.menu).then(r => {
      this.getMenus();
    })
  }

  @action
  saveRole() {
    request.post('role/save', this.role).then(r => {
      this.getRoles();
    })
  }

  @computed
  get canSaveMenu() {
    return this.menu.name && this.menu.url;
  }

  @computed
  get canSaveRole() {
    return this.role.name;
  }

  @action
  setMenu(menu) {
    if (menu) {
      this.menu = menu;
    } else {
      this.resetMenu();
    }
  }

  @action
  resetMenu() {
    this.menu = {
      name: '',
      parent_id: null,
      url: '',
      order: null,
      role: null,
      active: true,
      roles_id: []
    }
  }

  @action
  getRoles(params) {
    this.resetRole();
    request.post('role/listing', {all: true}).then(r => {
      this.roles = r.docs || [];
    })
  }

  @action
  setRole(role) {
    if (role) {
      this.role = role;
    } else this.resetRole();
  }

  @action
  resetRole() {
    this.role = {name: '', parent_id: null, menus_id: []}
  }

  @action
  getApis() {
    this.resetApi();
    request.post('api/listing').then(r => {
      this.apis = r.docs;
    });
  }

  @action
  saveApi() {
    request.post('api/save', this.api).then(r => {
      this.getApis();
    });
  }

  @action
  resetApi() {
    this.api = {
      name: '',
      active: true,
      log: true,
      roles_id: []
    }
  }

  @action
  setApi(api) {
    if (api) {
      this.api = api;
    } else this.resetApi();
  }

  @computed
  get canSaveApi() {
    return this.api.name;
  }

  @action
  async statusConfirmed(param) {
    let r = await request.post('company/status_confirmed', param);
  }

  @action
  async statusRejected(param) {
    let r = await request.post('company/status_rejected', param);
  }

  @action
  async statusBlacklist(param) {
    let r = await request.post('company/status_blacklist', param);
  }

  @action
  async statusBlocked(param) {
    let r = await request.post('company/status_blocked', param);
  }


  getUsers = request.postAsync.bind(null, "user/userlist", "users");
  getUser = id => request.postAsync("user/get", "doc", {id});
  updateUser = request.postAsync.bind(null, "user/putActive", null);
  saveUser = request.postAsync.bind(null, "user/put", null);
  getData = request.postAsync.bind(null, "dictionary/get", "doc");
  getCompanies = request.postAsync.bind(null, "company.listing", "docs");
  getCompanyInfo = id => request.postAsync("company.get_info", "doc", {id});
  getCompanyRoles = request.postAsync.bind(null, "role/listing", "docs", {filter: {data: {company_type: true}}});
  changeCompanyStatus = request.postAsync.bind(null, "company/check", null);
  saveComment = request.postAsync.bind(null, "comment/save", null);
  saveNotification = request.postAsync.bind(null, "admin_notification/save", null);
  uploadNotificationImage = request.postAsync.bind(null, "upload/notifications", "file");
  getDirdocs = request.postAsync.bind(null, "dirdocs/listing", "docs");
  getDirdoc = params => request.postAsync("dirdocs/get", "doc", params);
  updateDirdoc = request.postAsync.bind(null, "dirdocs/update", null);
  saveDirdoc = request.postAsync.bind(null, "dirdocs/save", null);
}

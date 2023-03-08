import {action, observable} from "mobx";
import * as request from "../utils/requester"
import moment from "moment";

export default new class SupplierStore {

  // test data
  @observable ownershipTypes = [{id: 1, name: "Гос. (муниципальное) ..."}, {id: 2, name: "Частное ..."}];
  @observable banks = [{id: 10, name: "ОАО РСК"}, {id: 20, name: "Демир Банк"}];

  @observable company = {
    ownershipType: 1,
    inn: "02907199610193",
    organizationName: "ОАО ...",
    phoneNumber: "+996 ...",
    legalAddress: "бул. Молодая Гвардия",
    actualAddress: "бул. Молодая Гвардия",
    website: "https://...",
    bank: 10,
    depositAccount: "1299004870000914",
    bik: "129001",
    _id: "129001",
    _rev: "129001",
    roles_id: [],
    dircoate_id: ""
  };

  getEmployees = request.postAsync.bind(null, "employee/listing", "docs");
  getPositions = request.postAsync.bind(null, "dictionary/listing", "docs", {type: "DirPosition"});
  saveEmployee = request.postAsync.bind(null, "employee/save", "docs");
  saveProductRequest = request.postAsync.bind(null, "message/save", null);
  getProductRequests = request.postAsync.bind(null, "message/listing", "docs");

  // notifications from administration
  async getNotifications() {
    let {docs: notifications} = await request.post("admin_notification/listing");
    // sort backwards
    notifications.sort((a, b) => moment(b._created).diff(moment(a._created)));
    return notifications;
  }

  getNotification = request.postAsync.bind(null, "admin_notification/get", "doc");

  @action
  getOwnershipTypes() {
    request.get("").then(r => {
      this.ownershipTypes = r || {};
    })
  }

  @action
  getBanks() {
    request.get("").then(r => {
      this.banks = r || {};
    })
  }

  @action
  getCompanyInfo() {
    request.post("").then(r => {
      this.company = r || {};
    })
  }

  @action
  getFullnameByInn() {
    // TODO: get from service when it's ready
  }

  async getCategories(search) {
    let r = await request.post("category/search", {search});
    return r.docs || [];
  }

  async uploadImage(file, silent) {
    let r = await request.post('upload/companydocs', {file}, silent);
    console.log(r);
    return r;
  }

  async uploadImages(files, silent) {
    let r = await request.post('upload/companydocs', {files}, silent);
    console.log(r);
    return r;
  }


  async saveCompanyInfo(params) {
    let r = await request.post('company/save', params);
    console.log(r);
  }

  async updateCompany(params) {
    let r = await request.post('company/update', params);
    console.log(r);
  }

  async saveCompanyDraft(params) {
    return request.post('company/save_draft', params);
  }

  async saveCompanyBank(params) {
    let r = await request.post('companybank/save', params);
    console.log(r);
  }

  async saveCompanyQual(params) {
    let r = await request.post('companyqualification/save', params);
    console.log(r);
  }

  async getCompanyBank(params) {
    let r = await request.post("companybank.get", params);
    return r.doc || [];
  }

  async saveDocs(params) {
    let r = await request.post("docs.put", params);
    return r.doc || [];
  }

  async getDocs(params) {
    let r = await request.post("docs.listing", params);
    return r.docs || [];
  }

  async getCompanyQualListing(params) {
    let r = await request.post("companyqualification.listing", params);
    return r.docs || [];
  }

  async getCompanyQual(params) {
    let r = await request.post("companyqualification.get", params);
    return r.doc || {};
  }

  async getCurrency(date) {
    let r = await request.post('currencynbkr/get_nbkr_rate', {date: date});
    return r;
  }

  async getCompanies(params) {
    let r = await request.post("company.listing", params);
    return r.docs || [];
  }

  async getCompanyProducts(params) {
    let r = await request.post("companyproduct/listing", params);
    return r.docs || [];
  }

  async getCompanyProduct(params) {
    let r = await request.post("companyproduct/get", {_id: params});
    return r.doc[0] || [];
  }

  async saveCompanyProducts(params) {
    let r = await request.post("companyproduct/save", params);
    console.log(r);
  }

  async saveMyDebt(params) {
    let r = await request.post('companydocument/save', params);
    console.log(r);
  }

  async sendRequest(params) {
    let r = await request.post('companydocument/send_request', params);
    return r.docs || [];
  }

  async getMyDebt(params) {
    let r = await request.post("companydocument.listing", params);
    return r.docs || [];
  }

  async getLastDocs(params) {
    let r = await request.post("companydocument/get_docs", params);
    return r.docs || [];
  }

  async uploadAvatar(file) {
    let r = await request.post('upload/avatars', {file: file});
    console.log(r);
    return r;
  }

  // application/adlist - принесет список объявление в которые может подать заявки (Запросы)
  async getAdList(params) {
    let r = await request.post('application.adlist', params);
    return r.docs || [];
  }

  // application/getApp  - возвращает данные об объявлении (необходимо передать "_id" - объявления) + инфо о лотах
  async getAnnounceAppInfo(params) {
    let r = await request.post('application.getApp', params);
    return r.doc || {};
  }


  async saveApplication(params) {
    let r = await request.post('application.save', params);
    return r.id
  }

  async removeDocs(params) {
    await request.post("docs.delete", params);
  }

  async updateApplication(params) {
    let r = await request.post('application.appsave', params);
    return r.id
  }

  async getApplications(params) {
    let r = await request.post('application.listing', params);
    let apps = r.docs || [];

    if (params && params.filter) {
      // TODO: filter on server
      apps = apps.filter(params.filter)
    }

    return apps;
  }

   async draftlisting(params) {
    let r = await request.post('application.draftlisting', params);
    let apps = r.docs || [];

    if (params && params.filter) {
      // TODO: filter on server
      apps = apps.filter(params.filter)
    }

    return apps;
  }
  async getAnnApps(params) {
    let r = await request.post('application/announce_list', params);
    return r.docs
  }


  async getRoles(params) {
    let r = await request.post('role.get', params);
    return r.docs || {};
  }

  async getUsers(search) {
    let r = await request.post('employee/userlist', {filter: {search}});
    return r["users"] || [];
  }

  async removeEmployee(params) {
    let r = await request.post('employee/delete', params);
    return r;
  }
}

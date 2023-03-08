import {action, observable} from 'mobx';
import * as request from '../utils/requester';
import {storageGet, storageSave} from "../utils/LocalStorage";


export default new class DictStore {

  @observable dicts = [];
  @observable dictItem = [];

  constructor() {
  }

  @action
  getList() {
    storageGet('dicts').then(r => {
      this.dicts = r;
    }).finally(() => {
      this.loadFromApi(false);
    });
  }

  async getDictData(tableName, page) {
    // TODO: fix limit, search is not working if searching object is not in limit
    let r = await request.post('dictionary.listing', {type: tableName, /*limit: 50,*/ offset: page});
    return r.docs || [];
  }

  @action
  loadFromApi() {
    request.post('/dictionary/tables_list').then(r => {
      this.dicts = r.tables || [];
      storageSave('dicts', r.tables || []);
    });
  }

  async saveDictData(tableName, dict) {
    let params = dict;
    params.type = tableName;
    await request.post('dictionary.save', params);
  }

  async deleteDictData(tableName, dict) {
    let params = dict;
    params.type = tableName;
    await request.post('dictionary.delete', params);
  }

  async getDictData2(params) {
    // TODO: fix limit, search is not working if searching object is not in limit
    let r = await request.post('dictionary.listing', params);
    return r.docs || [];
  }

  async getCoateListing(search){
    let r = await request.post('dircoate/coate', {search});
    return r['docs'] || [];
  }

  async removeCoate(id) {
    await request.post('dircoate/remove', {id});
  }

  async saveDirBranch(params) {
    await request.post('dirbranch/put', params)
  }


  test = request.postAsync.bind(null, "dirbranch/listing", "docs")
  getListing = id => request.postAsync('esp/find', "docs", {id});
  saveCoate = request.postAsync.bind(null, "dircoate/update", null);
  putCoate = request.postAsync.bind(null, 'dircoate/save', null)
}

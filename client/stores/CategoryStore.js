import {action, observable} from 'mobx';
import * as request from '../utils/requester';


export default new class CategoryStore {

  @observable categories = [];

  constructor() {

  }

  @action
  async setCategories(categories) {
    this.categories = categories;
    let r = await request.post("category/save", this.categories);
    return r.doc || [];
  }

  @action
  async getCategories() {
    let r = await request.post("category/listing");
    // this.categories = r.docs || [];
    return r.docs || [];
  }

  @action
  async getCategoryById(id) {
    let r = await request.post("category/childlist", {id: id});
    return r.docs || [];
  }


  @action
  async getCategorySearch(search) {
    let r = await request.post("category/search", {search, limit: 100});
    return r.docs || [];
  }
}

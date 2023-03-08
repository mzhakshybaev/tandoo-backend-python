import {action, observable, runInAction} from "mobx";
import supplierStore from '../SupplierStore';
import {uniq} from "lodash-es";

export default new class SupMyProductsCtrl {
  @observable ready = false;
  @observable products;
  @observable categories;
  @observable category = null;
  @observable currentCategory = null;

  async load() {
    let products = await supplierStore.getCompanyProducts();
    // let categories = uniq(products.map(p => p.dircategory));

    let categories = [];
    for (let i = 0; i < products.length; i++) {
      let cat = products[i];
      let isFind = false;

      for (let j = 0; j < categories.length; j++) {
        if (cat.dircategory_id === categories[j].id) {
          isFind = true;
          break;
        }
      }

      if (!isFind) {
        categories.push({id: cat.dircategory_id, name: cat.dircategory});
      }
    }

    runInAction(() => {
      this.allProducts = products;
      this.products = products;
      this.categories = categories;
      this.ready = true;
    })
  }

  async getCompanyProduct(id) {
    let product = await supplierStore.getCompanyProduct(id);
    return product;
  }

  @action
  reset() {
    this.products = null;
    this.categories = null;
    this.category = null;
    this.currentCategory = null;
    this.ready = false;
  }

  @action.bound
  toggleCategory(e, dircategory) {
    if (e)
      e.preventDefault();
    this.currentCategory = dircategory;
    this.products = this.allProducts;
    if (dircategory)
      this.products = this.products.filter({dircategory})
  }

  @action
  setCategory(category) {
    this.category = this.categories.find({id: category.id});
    this.products = this.allProducts.filter({dircategory_id: this.category.id})
  }
}

import {action, observable, runInAction} from 'mobx';
import productsApi from '../api/ProductsApi';

export default new class ProductCtrl {
  @observable ready = false;
  @observable product;

  async load(id) {
    this.ready = false;

    let product = await productsApi.getProduct(id);

    runInAction(() => {
      Object.assign(this, {
        product,
        ready: true,
      })
    })
  }

  @action
  reset() {
    Object.assign(this, {
      product: null,
      ready: false,
    })
  }
}

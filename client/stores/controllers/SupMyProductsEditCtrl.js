import {action, computed, observable} from "mobx";
import supplierStore from '../SupplierStore'
import catalogStore from '../CatalogStore'


export default new class SupMyProductsEditCtrl {
  @observable product;
  @observable isNew = false;
  @observable unit_price = '';
  @observable status = 'active';
  @observable date_end = null;
  @observable inStock = false;
  @observable preOrder = false;

  @action
  init() {
    let {selectedProduct} = catalogStore;

    if (selectedProduct) {
      this.setProduct(selectedProduct);
    } else {
      this.resetProduct();
    }
  }

  @action
  reset() {
    this.resetProduct();
    catalogStore.selectedProduct = null;
  }

  @action.bound
  setProduct(product, isNew) {
    Object.assign(this, {
      product,
      isNew,
      unit_price: product.unit_price,
      date_end: product.date_end
    });
  };

  @action
  resetProduct() {
    Object.assign(this, {
      product: null,
      unit_price: '',
      date_end: ''
    })
  }

  @action.bound
  setUnitPrice(unit_price) {
    this.unit_price = parseFloat(unit_price)
  }

  @action.bound
  setInStock(value) {
    this.inStock = value;
  }

  @action.bound
  setPreOrder(value) {
    console.log('pre orderr:', value);
    this.preOrder = value;
  }

  @action.bound
  setDate(date_end) {
    this.date_end = date_end
  }

  @computed
  get canSubmit() {
    return !!(this.unit_price && this.date_end && (this.unit_price > 0))
  }


  async save() {
    let {product, isNew, date_end, unit_price, status, inStock, preOrder} = this;

    let productItem = {
      _id: isNew ? undefined : product._id,
      product_id: product.product_id,
      unit_price,
      status,
      date_end,
      in_stock: inStock,
      pre_order: preOrder
    };

    await supplierStore.saveCompanyProducts(productItem)
  };

}

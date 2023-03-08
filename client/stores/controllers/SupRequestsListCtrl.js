import {action, observable, runInAction} from 'mobx';
import supplierStore from '../SupplierStore';

export default new class SupRequestsListCtrl {
  @observable ready = false;
  @observable announces;

  async load() {
    let announces = await supplierStore.getAdList();

    runInAction(() => {
      this.announces = announces;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.ready = false;
    this.announces = null;
  }
}

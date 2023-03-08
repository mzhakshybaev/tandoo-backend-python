import {action, observable, runInAction} from 'mobx';
import supplierStore from '../SupplierStore';

export default new class SupAppsDraftsListCtrl {
  @observable ready = false;
  @observable apps;

  async load() {
    let params = {
      filter: {
        status: 'Draft'
      }
    };

    let apps = await supplierStore.draftlisting(params);

    runInAction(() => {
      this.apps = apps;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.ready = false;
    this.apps = null;
  }
}

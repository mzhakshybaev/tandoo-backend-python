import {action, observable, runInAction} from 'mobx';
import supplierStore from '../SupplierStore';

export default new class SupAppsListCtrl {
  @observable ready = false;
  @observable anns;

  async load() {
    let params = {
      filter: {
        status: 'Published'
      }
    };

    // let apps = await supplierStore.getApplications(params);
    let anns = await supplierStore.getAnnApps(params);

    runInAction(() => {
      // this.apps = apps;
      this.anns = anns;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.ready = false;
    this.anns = null;
  }
}

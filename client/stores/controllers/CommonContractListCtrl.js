import {action, observable, runInAction} from 'mobx';
import contractsApi from '../api/ContractsApi'

export default class CommonContractListCtrl {
  @observable ready;
  @observable contracts;

  async load() {
    // let company_id = authStore.company._id;
    let contracts = await contractsApi.getContracts();

    runInAction(() => {
      this.contracts = contracts;
      this.ready = true;
    })
  }

  @action
  reset() {
    this.contracts = null;
    this.ready = false;
  }
}
